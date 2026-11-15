'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const KEY = 'sanke-cuotiben-v1';
const META = 'sanke-cuotiben-meta-v2';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

function fakeIndexedDB() {
  const stores = new Map();
  const db = {
    objectStoreNames: { contains: n => stores.has(n) },
    createObjectStore(n) { if (!stores.has(n)) stores.set(n, new Map()); return {}; },
    transaction(name, mode) {
      const map = stores.get(name);
      const tx = { oncomplete: null, onerror: null, onabort: null, error: null };
      tx.objectStore = () => ({
        get(k) {
          const req = {};
          queueMicrotask(() => { req.result = map.has(k) ? map.get(k) : undefined; if (req.onsuccess) req.onsuccess(); });
          return req;
        },
        put(v, k) {
          map.set(k, v);
          queueMicrotask(() => { if (tx.oncomplete) tx.oncomplete(); });
          return {};
        }
      });
      return tx;
    }
  };
  return {
    open() {
      const req = {};
      queueMicrotask(() => {
        req.result = db;
        if (req.onupgradeneeded) req.onupgradeneeded();
        if (req.onsuccess) req.onsuccess();
      });
      return req;
    },
    _stores: stores
  };
}

function runtime(opts) {
  opts = opts || {};
  const values = new Map();
  if (opts.raw) values.set(KEY, opts.raw);
  const idb = opts.idb || null;
  const seed = JSON.parse(read('src/data/seed.json')).subjects;
  const ctx = {
    console, Date, Set, Map, Intl, URL, Blob, Promise, queueMicrotask,
    setTimeout: (fn) => { queueMicrotask(fn); return 0; }, clearTimeout() {},
    location: { hostname: 'localhost', protocol: 'https:', hash: '', pathname: '/', search: '' },
    localStorage: {
      getItem(k) { return values.has(k) ? values.get(k) : null; },
      setItem(k, v) { values.set(k, String(v)); },
      removeItem(k) { values.delete(k); }
    },
    window: { addEventListener() {}, __SEED__: { subjects: seed }, __BANKS__: {}, __PAGES__: true },
    document: { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } }
  };
  if (idb) ctx.indexedDB = idb;
  vm.createContext(ctx);
  vm.runInContext(read('src/js/00-chapters.js') + '\n' + read('src/js/00-core.js'), ctx);
  ctx.toast = () => {};
  return { ctx, values, idb };
}

const tick = () => new Promise(r => setTimeout(r, 0));

test('large state goes to IndexedDB, not localStorage', async () => {
  const idb = fakeIndexedDB();
  const r = runtime({ idb });
  r.ctx.state.__storageProbe = 'x'.repeat(4 * 1024 * 1024);
  assert.equal(r.ctx.persistLocal(true), true);
  await tick(); await tick(); await tick();
  const rec = idb._stores.get('state').get('current');
  assert.ok(rec && rec.bytes > 4 * 1024 * 1024, 'IDB record must hold the full state');
  assert.equal(r.ctx.storageBackend, 'idb');
  const meta = JSON.parse(r.values.get(META));
  assert.equal(meta.backend, 'idb');
  assert.equal(r.values.has(KEY), false, 'localStorage mirror is released once IDB holds the state');
});

test('small state is still mirrored to localStorage for compatibility', async () => {
  const idb = fakeIndexedDB();
  const r = runtime({ idb });
  assert.equal(r.ctx.persistLocal(true), true);
  assert.ok(r.values.get(KEY) && JSON.parse(r.values.get(KEY)).entries, 'small state still mirrored');
});

test('hydrate restores a newer IndexedDB state when localStorage is empty', async () => {
  const idb = fakeIndexedDB();
  const store = new Map();
  const saved = { version: 1, rev: 7, updatedAt: '2026-11-15T00:00:00+08:00', entries: { gaodai: [{ id: 'from-idb', code: 'A-001', summary: '从 IDB 恢复', stars: 2, blocks: [], variants: [], points: [], errorTypes: [], status: 'unmastered', date: '2026-11-01' }], shufen: [], jieji: [], xijing: [] }, prefs: { theme: 'auto' }, clearEpoch: '2026-10-24-empty-v1' };
  store.set('current', { raw: JSON.stringify(saved), rev: 7, bytes: 10, updatedAt: saved.updatedAt, savedAt: Date.now() });
  idb._stores.set('state', store);
  const r = runtime({ idb });
  await r.ctx.storageHydrate();
  assert.equal(r.ctx.state.entries.gaodai.length, 1);
  assert.equal(r.ctx.state.entries.gaodai[0].id, 'from-idb');
  assert.equal(r.ctx.storageBackend, 'idb');
});

test('hydrate prefers a newer localStorage mirror on a rev tie', async () => {
  const idb = fakeIndexedDB();
  const store = new Map();
  const older = { version: 1, rev: 3, updatedAt: '2026-11-01T00:00:00+08:00', entries: { gaodai: [], shufen: [], jieji: [], xijing: [] }, prefs: {} };
  store.set('current', { raw: JSON.stringify(older), rev: 3, bytes: 10, updatedAt: older.updatedAt, savedAt: 1 });
  idb._stores.set('state', store);
  const newer = { version: 1, rev: 3, updatedAt: '2026-11-02T00:00:00+08:00', entries: { gaodai: [{ id: 'from-ls', code: 'A-001', summary: 'ls', stars: 2, blocks: [], variants: [], points: [], errorTypes: [], status: 'unmastered', date: '2026-11-02' }], shufen: [], jieji: [], xijing: [] }, prefs: {} };
  const r = runtime({ idb, raw: JSON.stringify(newer) });
  await r.ctx.storageHydrate();
  assert.equal(r.ctx.state.entries.gaodai[0].id, 'from-ls');
});

test('without IndexedDB the old localStorage guard still applies', async () => {
  const r = runtime({});
  r.ctx.state.__storageProbe = 'x'.repeat(5 * 1024 * 1024);
  assert.equal(r.ctx.persistLocal(true), false);
});

test('capacity helper lifts the old 4MB ceiling when IndexedDB is available', () => {
  const withIdb = runtime({ idb: fakeIndexedDB() });
  assert.ok(withIdb.ctx.storageCapacityChars() > 4 * 1024 * 1024);
  withIdb.ctx.storageQuota.quota = 1024 * 1024 * 1024;
  assert.ok(withIdb.ctx.storageCapacityChars() > 100 * 1024 * 1024);
  withIdb.ctx.storageQuota.quota = 8 * 1024 * 1024 * 1024;
  assert.ok(withIdb.ctx.storageCapacityChars() > 1024 * 1024 * 1024, '浏览器配额大于 1GB 时不应被自设上限截断');
  const legacy = runtime({});
  assert.equal(legacy.ctx.storageCapacityChars(), 4 * 1024 * 1024);
});
