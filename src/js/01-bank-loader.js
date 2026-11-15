/* =========================================================
   01-bank-loader — external question bank + IndexedDB shards
   Pages 版把题库拆成 data/bank-<科目>.json 四片，按科目请求；
   任一片失败自动退回单文件 data/bank.json。IndexedDB 按科目缓存。
   ========================================================= */
var BANK_DATA_URL = 'data/bank.json';
var BANK_INDEX_URL = 'data/bank-index.json';
var BANK_SPLIT_PREFIX = 'data/bank-';
var BANK_DB_NAME = 'sanke-bank-cache-v1';
var BANK_DB_STORE = 'bankChunks';
var BANK_SUBJECT_IDS = ['gaodai', 'shufen', 'jieji', 'xijing'];
var bankLoadPromise = null;

function bankSubjectUrl(id) { return BANK_SPLIT_PREFIX + id + '.json'; }

function bankDataComplete(data) {
  if (!data || typeof data !== 'object') return false;
  for (var i = 0; i < BANK_SUBJECT_IDS.length; i++) {
    var id = BANK_SUBJECT_IDS[i];
    if (!data[id] || !Array.isArray(data[id].items)) return false;
  }
  return true;
}

function bankDbOpen() {
  return new Promise(function (resolve) {
    try {
      if (!window.indexedDB) { resolve(null); return; }
      var req = indexedDB.open(BANK_DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(BANK_DB_STORE)) db.createObjectStore(BANK_DB_STORE, { keyPath: 'key' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
      req.onblocked = function () { resolve(null); };
    } catch (e) { resolve(null); }
  });
}

function bankChunkGet(db, key) {
  return new Promise(function (resolve) {
    try {
      var tx = db.transaction(BANK_DB_STORE, 'readonly');
      var req = tx.objectStore(BANK_DB_STORE).get(key);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { resolve(null); };
    } catch (e) { resolve(null); }
  });
}

// 逐科目读取；返回 { data, count, complete }。anyVersion=true 用于离线兜底。
async function bankCacheRead(version, anyVersion) {
  var db = await bankDbOpen();
  if (!db) return { data: {}, count: 0, complete: false };
  try {
    var out = {};
    for (var i = 0; i < BANK_SUBJECT_IDS.length; i++) {
      var id = BANK_SUBJECT_IDS[i];
      var row = await bankChunkGet(db, id);
      if (!row || !row.data) continue;
      if (!anyVersion && row.version !== version) continue;
      out[id] = row.data;
    }
    var count = Object.keys(out).length;
    return { data: out, count: count, complete: count === BANK_SUBJECT_IDS.length };
  } finally {
    try { db.close(); } catch (e) { /* ignore */ }
  }
}

async function bankCacheWrite(version, data) {
  var db = await bankDbOpen();
  if (!db) return false;
  try {
    var tx = db.transaction(BANK_DB_STORE, 'readwrite');
    var store = tx.objectStore(BANK_DB_STORE);
    store.put({ key: 'meta', version: version, updatedAt: Date.now() });
    BANK_SUBJECT_IDS.forEach(function (id) {
      if (data[id]) store.put({ key: id, data: data[id], version: version, updatedAt: Date.now() });
    });
    await new Promise(function (resolve, reject) {
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error || new Error('indexedDB write failed')); };
      tx.onabort = function () { reject(tx.error || new Error('indexedDB write aborted')); };
    });
    return true;
  } catch (e) {
    return false;
  } finally {
    try { db.close(); } catch (e) { /* ignore */ }
  }
}

function applyBankData(data) {
  window.__BANKS__ = data;
  BANKS = data;
  try { sortBaseLibraryOrder(); } catch (e) { /* 题库加载后排序失败不应阻止渲染 */ }
}

async function bankFetchJson(url) {
  var res = await fetch(url, { cache: 'no-cache', credentials: 'same-origin' });
  if (!res.ok) throw new Error('题库请求失败（' + res.status + '）');
  return res.json();
}

// Pages 分片：只补缺失科目；全部拿到才返回，任一失败返回 null 由单文件兜底。
async function bankLoadSplit(version, have) {
  if (typeof PAGES === 'undefined' || !PAGES) return null;
  try {
    var idxRes = await fetch(BANK_INDEX_URL + '?v=' + encodeURIComponent(version), { cache: 'no-cache', credentials: 'same-origin' });
    if (!idxRes.ok) return null;
    var idx = await idxRes.json();
    if (!idx || !idx.subjects) return null;
    var out = {};
    BANK_SUBJECT_IDS.forEach(function (id) { if (have[id]) out[id] = have[id]; });
    var missing = BANK_SUBJECT_IDS.filter(function (id) { return !out[id]; });
    var loaded = await Promise.all(missing.map(function (id) {
      return bankFetchJson(bankSubjectUrl(id) + '?v=' + encodeURIComponent(version)).then(function (data) {
        if (!data || !Array.isArray(data.items)) throw new Error('题库分片结构不完整：' + id);
        return { id: id, data: data };
      });
    }));
    loaded.forEach(function (row) { out[row.id] = row.data; });
    return bankDataComplete(out) ? out : null;
  } catch (e) {
    return null;
  }
}

async function loadBankData() {
  if (bankDataComplete(window.__BANKS__)) return window.__BANKS__;
  if (bankLoadPromise) return bankLoadPromise;
  var version = window.__BUILD_ID__ || 'dev';
  bankLoadPromise = (async function () {
    var cached = await bankCacheRead(version, false);
    if (cached.complete) {
      applyBankData(cached.data);
      window.__BANK_SOURCE__ = 'idb';
      return cached.data;
    }
    var split = await bankLoadSplit(version, cached.data);
    if (split) {
      applyBankData(split);
      window.__BANK_SOURCE__ = cached.count ? 'mixed' : 'network';
      bankCacheWrite(version, split);
      return split;
    }
    try {
      var data = await bankFetchJson(BANK_DATA_URL + '?v=' + encodeURIComponent(version));
      if (!bankDataComplete(data)) throw new Error('题库结构不完整');
      applyBankData(data);
      window.__BANK_SOURCE__ = 'network';
      bankCacheWrite(version, data);
      return data;
    } catch (err) {
      var fallback = await bankCacheRead(version, true);
      if (fallback.complete) {
        applyBankData(fallback.data);
        window.__BANK_SOURCE__ = 'idb-stale';
        window.__BANK_STALE__ = true;
        return fallback.data;
      }
      window.__BANK_LOAD_ERROR__ = String((err && err.message) || err);
      window.__BANK_SOURCE__ = 'failed';
      return {};
    }
  })();
  return bankLoadPromise;
}
