'use strict';
const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { requestJson } = require('../lib/ai-http');

test('requestJson pins the validated address and keeps the original host', async function () {
  const seen = [];
  const server = http.createServer(function (req, res) {
    let body = '';
    req.on('data', function (c) { body += c; });
    req.on('end', function () {
      seen.push({ host: req.headers.host, body: body });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  });
  await new Promise(function (resolve) { server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  let lookups = 0;
  try {
    const out = await requestJson('http://rebind.example:' + port + '/v1/chat', {
      body: '{"x":1}',
      headers: { 'content-type': 'application/json' },
      resolveHost: async function () { lookups += 1; return { address: '127.0.0.1', family: 4 }; }
    });
    assert.equal(out.status, 200);
    assert.equal(out.ok, true);
    assert.equal(lookups, 1, 'must resolve exactly once');
    assert.equal(seen[0].host, 'rebind.example:' + port, 'Host header keeps the logical host');
    assert.equal(seen[0].body, '{"x":1}');
  } finally {
    await new Promise(function (resolve) { server.close(resolve); });
  }
});

test('requestJson rejects a hostname resolved to an invalid address', async function () {
  await assert.rejects(
    requestJson('http://none.example/v1', { resolveHost: async function () { return null; } }),
    /no address/
  );
});
