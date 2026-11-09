'use strict';
/* QA 共享服务器：随机端口启动项目自带的 Node 静态服务，避免写死端口和依赖 Python。 */
const { spawn } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');

function freePort() {
  return new Promise(function (resolve, reject) {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', function () {
      const port = srv.address().port;
      srv.close(function () { resolve(port); });
    });
  });
}

function probe(base) {
  return new Promise(function (resolve) {
    const req = http.get(base + '/api/health', function (res) {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', function () { resolve(false); });
    req.setTimeout(1500, function () { req.destroy(); resolve(false); });
  });
}

async function startServer(opts) {
  opts = opts || {};
  const root = opts.root || path.join(__dirname, '..');
  const port = opts.port || await freePort();
  const base = 'http://127.0.0.1:' + port;
  const child = spawn(process.execPath, [path.join(root, 'server.js')], {
    cwd: root,
    env: Object.assign({}, process.env, { PORT: String(port), HOST: '127.0.0.1', NOTEBOOK_TOKEN: '' }),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  let stderr = '';
  child.stderr.on('data', function (d) { stderr += String(d); });
  let exited = null;
  child.on('exit', function (code, signal) { exited = { code: code, signal: signal }; });

  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (exited) throw new Error('server exited before health check: ' + JSON.stringify(exited) + ' ' + stderr);
    if (await probe(base)) {
      return {
        base: base,
        port: port,
        stop: function () {
          if (!exited) child.kill();
          return new Promise(function (resolve) {
            if (exited) return resolve();
            const timer = setTimeout(function () { try { child.kill('SIGKILL'); } catch (e) {} resolve(); }, 3000);
            child.once('exit', function () { clearTimeout(timer); resolve(); });
          });
        }
      };
    }
    await new Promise(function (r) { setTimeout(r, 200); });
  }
  try { child.kill(); } catch (e) {}
  throw new Error('server health check timed out: ' + stderr);
}

module.exports = { startServer: startServer };
