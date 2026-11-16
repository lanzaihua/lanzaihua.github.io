'use strict';

/* Minimal JSON-over-HTTP client with a pinned DNS lookup.
 *
 * Node's global fetch resolves a hostname internally, so validating DNS and
 * then calling fetch leaves a DNS-rebinding TOCTOU window.  This helper takes
 * the already-validated address and forces every connection for the request
 * through that address while keeping the original Host header and TLS SNI.
 */

const http = require('http');
const https = require('https');
const dns = require('dns').promises;

const MAX_RESPONSE_BYTES = 32 * 1024 * 1024;

function pinnedLookup(address, family) {
  return function lookup(hostname, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const answer = { address: address, family: family || 4 };
    if (options && options.all) return callback(null, [answer]);
    return callback(null, answer.address, answer.family);
  };
}

async function defaultResolve(hostname) {
  const rows = await dns.lookup(hostname, { all: true });
  if (!rows.length) throw new Error('DNS lookup returned no address');
  return rows[0];
}

function requestJson(url, options) {
  options = options || {};
  const target = new URL(String(url));
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return Promise.reject(new Error('only http/https is supported'));
  }
  const transport = target.protocol === 'https:' ? https : http;
  const timeoutMs = Number(options.timeoutMs || 150000);
  const resolveHost = options.resolveHost || defaultResolve;

  return Promise.resolve(resolveHost(target.hostname))
    .then(function (pinned) {
      if (!pinned || !pinned.address) throw new Error('DNS lookup returned no address');
      return new Promise(function (resolve, reject) {
        const body = options.body == null ? '' : String(options.body);
        const headers = Object.assign({}, options.headers || {});
        headers['content-length'] = Buffer.byteLength(body);
        const req = transport.request({
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port || (target.protocol === 'https:' ? 443 : 80),
          path: target.pathname + target.search,
          method: options.method || (body ? 'POST' : 'GET'),
          headers: headers,
          servername: target.protocol === 'https:' ? target.hostname : undefined,
          lookup: pinnedLookup(pinned.address, pinned.family),
          rejectUnauthorized: options.rejectUnauthorized !== false
        }, function (res) {
          const chunks = [];
          let total = 0;
          res.on('data', function (chunk) {
            total += chunk.length;
            if (total > MAX_RESPONSE_BYTES) {
              req.destroy(new Error('response too large'));
              return;
            }
            chunks.push(chunk);
          });
          res.on('end', function () {
            resolve({
              status: res.statusCode,
              ok: res.statusCode >= 200 && res.statusCode < 300,
              headers: res.headers,
              body: Buffer.concat(chunks).toString('utf8')
            });
          });
        });
        req.setTimeout(timeoutMs, function () {
          const err = new Error('AI request timed out');
          err.code = 'TIMEOUT';
          req.destroy(err);
        });
        req.on('error', reject);
        req.end(body);
      });
    });
}

module.exports = { requestJson: requestJson, pinnedLookup: pinnedLookup, MAX_RESPONSE_BYTES: MAX_RESPONSE_BYTES };
