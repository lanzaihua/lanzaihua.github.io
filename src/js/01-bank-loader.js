/* =========================================================
   01-bank-loader — external question bank + IndexedDB shards
   Pages 版把 15MB 题库从 HTML 拆到 data/bank.json；
   本模块按科目写入 IndexedDB 分片，构建号变化时自动换新。
   ========================================================= */
var BANK_DATA_URL = 'data/bank.json';
var BANK_DB_NAME = 'sanke-bank-cache-v1';
var BANK_DB_STORE = 'bankChunks';
var BANK_SUBJECT_IDS = ['gaodai', 'shufen', 'jieji', 'xijing'];
var bankLoadPromise = null;

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

async function bankCacheRead(version, anyVersion) {
  var db = await bankDbOpen();
  if (!db) return null;
  try {
    var meta = await bankChunkGet(db, 'meta');
    if (!anyVersion && (!meta || meta.version !== version)) return null;
    var out = {};
    for (var i = 0; i < BANK_SUBJECT_IDS.length; i++) {
      var id = BANK_SUBJECT_IDS[i];
      var row = await bankChunkGet(db, id);
      if (!row || !row.data) return null;
      out[id] = row.data;
    }
    return bankDataComplete(out) ? out : null;
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
    BANK_SUBJECT_IDS.forEach(function (id) { store.put({ key: id, data: data[id] }); });
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

async function loadBankData() {
  if (bankDataComplete(window.__BANKS__)) return window.__BANKS__;
  if (bankLoadPromise) return bankLoadPromise;
  var version = window.__BUILD_ID__ || 'dev';
  bankLoadPromise = (async function () {
    var cached = await bankCacheRead(version);
    if (cached) {
      applyBankData(cached);
      window.__BANK_SOURCE__ = 'idb';
      return cached;
    }
    try {
      var res = await fetch(BANK_DATA_URL + '?v=' + encodeURIComponent(version), { cache: 'no-cache', credentials: 'same-origin' });
      if (!res.ok) throw new Error('题库请求失败（' + res.status + '）');
      var data = await res.json();
      if (!bankDataComplete(data)) throw new Error('题库结构不完整');
      applyBankData(data);
      window.__BANK_SOURCE__ = 'network';
      bankCacheWrite(version, data);
      return data;
    } catch (err) {
      var fallback = await bankCacheRead(version, true);
      if (fallback) {
        applyBankData(fallback);
        window.__BANK_SOURCE__ = 'idb-stale';
        window.__BANK_STALE__ = true;
        return fallback;
      }
      window.__BANK_LOAD_ERROR__ = String((err && err.message) || err);
      window.__BANK_SOURCE__ = 'failed';
      return {};
    }
  })();
  return bankLoadPromise;
}
