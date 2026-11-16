'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { webcrypto } = require('node:crypto');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const CONFIG_KEY = 'sanke-ai-config-v1';

function fakeIndexedDB() {
  const stores = new Map();
  const db = {
    objectStoreNames: { contains: n => stores.has(n) },
    createObjectStore(n) { if (!stores.has(n)) stores.set(n, new Map()); return {}; },
    transaction(name) {
      const map = stores.get(name);
      const tx = { oncomplete: null, onerror: null, onabort: null, error: null };
      tx.objectStore = () => ({
        get(k) {
          const req = {};
          queueMicrotask(() => { req.result = map.get(k); if (req.onsuccess) req.onsuccess(); });
          return req;
        },
        put(v, k) {
          map.set(k, v);
          queueMicrotask(() => { if (tx.oncomplete) tx.oncomplete(); });
          return {};
        },
        delete(k) {
          map.delete(k);
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
  if (opts.config) values.set(CONFIG_KEY, JSON.stringify(opts.config));
  const idb = opts.idb || fakeIndexedDB();
  const seed = JSON.parse(read('src/data/seed.json')).subjects;
  const ctx = {
    console, Date, Set, Map, Intl, URL, Blob, Promise, queueMicrotask, JSON, Math, RegExp,
    Uint8Array, ArrayBuffer, TextEncoder, TextDecoder, crypto: webcrypto,
    indexedDB: idb,
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
  vm.createContext(ctx);
  vm.runInContext(read('src/js/00-chapters.js') + '\n' + read('src/js/00-core.js') + '\n' + read('src/js/44-ai-config.js'), ctx);
  ctx.toast = () => {};
  return { ctx, values, idb };
}

const tick = () => new Promise(r => setTimeout(r, 10));

test('AI key is encrypted in IndexedDB and never written to localStorage', async () => {
  const r = runtime();
  await r.ctx.aiHydrateKey();
  r.ctx.aiSaveConfig({ protocol: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-6-sol', apiKey: 'sk-secret-value' });
  await tick(); await tick();
  const meta = JSON.parse(r.values.get(CONFIG_KEY));
  assert.equal(meta.apiKey, undefined, 'metadata must not contain apiKey');
  assert.equal(meta.keyStored, true);
  for (const value of r.values.values()) assert.equal(String(value).includes('sk-secret-value'), false, 'no plaintext key in localStorage');
  assert.equal(r.ctx.aiConfig().apiKey, 'sk-secret-value');
  assert.equal(r.idb._stores.get('secrets').get('current').v, 1);
});

test('AI key survives a reload by decrypting IndexedDB', async () => {
  const first = runtime();
  await first.ctx.aiHydrateKey();
  first.ctx.aiSaveConfig({ protocol: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-6-sol', apiKey: 'sk-reload' });
  await tick(); await tick();
  const meta = JSON.parse(first.values.get(CONFIG_KEY));
  const second = runtime({ idb: first.idb, config: meta });
  await second.ctx.aiHydrateKey();
  assert.equal(second.ctx.aiConfig().apiKey, 'sk-reload');
});

test('legacy plaintext API key is migrated and removed from localStorage', async () => {
  const r = runtime({ config: { protocol: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-6-sol', apiKey: 'sk-legacy' } });
  assert.equal(r.values.get(CONFIG_KEY).includes('sk-legacy'), true);
  await r.ctx.aiHydrateKey();
  await tick();
  const meta = JSON.parse(r.values.get(CONFIG_KEY));
  assert.equal(meta.apiKey, undefined);
  assert.equal(meta.keyStored, true);
  assert.equal(r.ctx.aiConfig().apiKey, 'sk-legacy');
});
