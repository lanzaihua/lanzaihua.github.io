'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const dns = require('dns').promises;
const net = require('net');
const { loadSkillBundle, buildSystemPrompt, SUBJECT_NAMES } = require('./skills');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const DATA_DIR = path.join(ROOT, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const PORT = Number(process.env.PORT || 4173);
const LAN = process.argv.indexOf('--lan') >= 0 || process.env.HOST === '0.0.0.0';
const HOST = LAN ? '0.0.0.0' : (process.env.HOST || '127.0.0.1');
const LOOPBACK_HOST = HOST === '127.0.0.1' || HOST === '::1' || HOST === 'localhost';
let TOKEN = process.env.NOTEBOOK_TOKEN || '';
let AUTO_TOKEN = false;
const ALLOW_DSH_CREDENTIAL_REUSE = process.env.ALLOW_DSH_CREDENTIAL_REUSE === '1';
// 只要不是回环绑定且未设口令，就自动生成一次性口令；自定义 HOST 也不能裸奔。
if (!LOOPBACK_HOST && !TOKEN) { TOKEN = crypto.randomBytes(18).toString('hex'); AUTO_TOKEN = true; }

const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';
const DSH_BASE_URL = (process.env.DSH_AI_BASE_URL || 'https://api.deepseek.com/anthropic').replace(/\/+$/, '');
const DSH_MODEL = process.env.DSH_AI_MODEL || 'deepseek-flash';
const CRED_FILE = process.env.DSH_CREDENTIALS_FILE || path.join(os.homedir(), '.dsh', '.credentials.yaml');
const SOLVE_MAX_PER_HOUR = Number(process.env.SOLVE_MAX_PER_HOUR || 60);
const SOLVE_TIMEOUT_MS = Number(process.env.SOLVE_TIMEOUT_MS || 150000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

function securityHeaders(extra) {
  return Object.assign({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }, extra || {});
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, securityHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  }));
  res.end(body);
}

function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return { rev: 0, updatedAt: null, state: null };
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('state is not an object');
    return { rev: Number(parsed.rev || 0), updatedAt: parsed.updatedAt || null, state: parsed.state || null };
  } catch (e) {
    // 损坏的状态文件绝不能当成空状态返回：下一次 PUT 会以 baseRev=0 通过并覆盖原始文件。
    // 先保留一份只读副本，再让所有读写接口明确失败，等待用户导出副本或手动恢复。
    let backup = STATE_FILE + '.corrupted';
    try {
      if (!fs.existsSync(backup)) fs.copyFileSync(STATE_FILE, backup);
    } catch (copyError) {
      backup = null;
    }
    return {
      rev: 0,
      updatedAt: null,
      state: null,
      error: String(e.message || e),
      corrupted: true,
      backupPath: backup
    };
  }
}

function writeState(rev, state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = STATE_FILE + '.tmp-' + process.pid;
  const body = JSON.stringify({ rev: rev, updatedAt: new Date().toISOString(), state: state }, null, 2);
  fs.writeFileSync(tmp, body, 'utf8');
  fs.renameSync(tmp, STATE_FILE);
}

function authOk(req) {
  if (!TOKEN) return true;
  return req.headers['x-notebook-token'] === TOKEN;
}

function serveStatic(req, res) {
  const headOnly = req.method === 'HEAD';
  let urlPath;
  try { urlPath = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch (e) { res.writeHead(400); return res.end('invalid URL encoding'); }
  if (urlPath.indexOf('\0') >= 0) { res.writeHead(400); return res.end('invalid URL'); }
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  if (urlPath === '/favicon.ico') { res.writeHead(204, securityHeaders()); return res.end(); }
  const file = path.normalize(path.join(DIST, urlPath));
  const relative = path.relative(DIST, file);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, function (err, buf) {
    if (err) {
      // 缺失资源必须 404，不能把首页 HTML 冒充成 JS/CSS/图片。
      fs.readFile(path.join(DIST, '404.html'), function (e2, page) {
        const body = e2 ? Buffer.from('not found') : page;
        res.writeHead(404, securityHeaders({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'Content-Length': body.length }));
        res.end(headOnly ? undefined : body);
      });
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, securityHeaders({
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': buf.length,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300'
    }));
    res.end(headOnly ? undefined : buf);
  });
}

function readBody(req, res, cb, maxBytes) {
  const limit = maxBytes || 6 * 1024 * 1024;
  let size = 0;
  let settled = false;
  const chunks = [];
  function fail(status, body) {
    if (settled) return;
    settled = true;
    res.writeHead(status, securityHeaders({ 'Content-Type': 'application/json; charset=utf-8' }));
    res.end(JSON.stringify(body));
  }
  req.on('data', function (c) {
    if (settled) return;
    size += c.length;
    if (size > limit) {
      fail(413, { error: '请求太大（图片请压缩后再试）', code: 'TOO_LARGE' });
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on('end', function () {
    if (settled) return;
    settled = true;
    cb(Buffer.concat(chunks).toString('utf8'));
  });
  req.on('error', function () {
    if (!settled) fail(400, { error: 'bad request' });
  });
}


let cachedToken = { value: '', at: 0 };

function readDshToken() {
  if (process.env.DSH_ACCOUNT_TOKEN) return process.env.DSH_ACCOUNT_TOKEN.trim();
  if (cachedToken.value && Date.now() - cachedToken.at < 60000) return cachedToken.value;
  try {
    const yaml = fs.readFileSync(CRED_FILE, 'utf8');
    const block = yaml.split('deepseek-account-platform/default:')[1] || yaml;
    const m = block.match(/\btoken:\s*(\S+)/);
    if (m) {
      cachedToken = { value: m[1].trim(), at: Date.now() };
      return cachedToken.value;
    }
  } catch (e) { /* missing credentials */ }
  return '';
}

function vendorDefaults(protocol) {
  if (protocol === 'anthropic') return { base: 'https://api.anthropic.com/v1', model: 'claude-sonnet-5-5' };
  if (protocol === 'deepseek') return { base: 'https://api.deepseek.com/v1', model: 'deepseek-flash' };
  if (protocol === 'google') return { base: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-4-argon' };
  if (protocol === 'xai') return { base: 'https://api.x.ai/v1', model: 'grok-4.7' };
  if (protocol === 'qwen') return { base: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen3.8-max-prime' };
  if (protocol === 'moonshot') return { base: 'https://api.moonshot.cn/v1', model: 'kimi-k3.1-pro' };
  if (protocol === 'dsh') return { base: DSH_BASE_URL, model: DSH_MODEL };
  return { base: 'https://api.openai.com/v1', model: 'gpt-6.1-sol-pro' };
}

function isOpenAiServerProtocol(protocol) {
  return protocol !== 'anthropic' && protocol !== 'dsh';
}

function normalizeAiConfig(raw) {
  const allowed = ['openai', 'deepseek', 'anthropic', 'google', 'xai', 'qwen', 'moonshot', 'dsh'];
  const protocol = allowed.indexOf(raw && raw.protocol) >= 0 ? raw.protocol : 'openai';
  const defaults = vendorDefaults(protocol);
  return {
    protocol: protocol,
    baseUrl: String((raw && raw.baseUrl) || defaults.base).trim().replace(/\/+$/, ''),
    model: String((raw && raw.model) || defaults.model).trim(),
    apiKey: String((raw && raw.apiKey) || '').trim()
  };
}


function envAiConfig() {
  const allowed = ['openai', 'deepseek', 'anthropic', 'google', 'xai', 'qwen', 'moonshot', 'dsh'];
  const protocol = allowed.indexOf(process.env.AI_PROTOCOL || '') >= 0
    ? process.env.AI_PROTOCOL
    : (AI_API_KEY ? 'openai' : ((ALLOW_DSH_CREDENTIAL_REUSE && readDshToken()) ? 'dsh' : 'openai'));
  const defaults = vendorDefaults(protocol);
  return normalizeAiConfig({
    protocol: protocol,
    baseUrl: process.env.AI_BASE_URL || defaults.base,
    model: process.env.AI_MODEL || defaults.model,
    apiKey: AI_API_KEY || (ALLOW_DSH_CREDENTIAL_REUSE && protocol === 'dsh' ? readDshToken() : '')
  });
}

function requestAiConfig(payload) {
  const raw = payload && payload.aiConfig;
  if (raw && typeof raw === 'object' && raw.apiKey) return normalizeAiConfig(raw);
  return envAiConfig();
}

function aiEndpointServer(cfg) {
  const base = String(cfg.baseUrl || '').replace(/\/+$/, '');
  if (isOpenAiServerProtocol(cfg.protocol)) return /\/chat\/completions$/i.test(base) ? base : base + '/chat/completions';
  return /\/messages$/i.test(base) ? base : base + '/messages';
}

const solveTimes = [];
function allowSolve() {
  const now = Date.now();
  while (solveTimes.length && now - solveTimes[0] > 3600000) solveTimes.shift();
  if (solveTimes.length >= SOLVE_MAX_PER_HOUR) return false;
  solveTimes.push(now);
  return true;
}


function buildUserText(subject, text, hint, imageCount, wrongText, wrongImages) {
  const parts = [];
  parts.push('【科目】' + (SUBJECT_NAMES[subject] || subject));
  if (hint) parts.push('【用户提示】' + hint);
  if (imageCount) parts.push('【说明】共 ' + imageCount + ' 张题目图片，请以图片中的题目为准；若同时有文字，文字用于补充或校对。');
  if (text) parts.push('【题目文字】\n' + text);
  if (wrongText || wrongImages) {
    if (wrongText) parts.push('【用户错解文字】\n' + wrongText);
    if (wrongImages) parts.push('【用户错解图片】共 ' + wrongImages + ' 张，按顺序附在题目图片之后。请先看懂用户的错误思路，再输出 errorAnalysis。');
    parts.push('【任务】用户提供了自己的错解。请先定位具体错误步骤和卡点，再写标准解答；errorAnalysis 四段必须具体、可执行。');
  } else {
    parts.push('【用户错解】未提供。hasUserSolution 设为 false，errorAnalysis 四段留空。');
  }
  parts.push('请按系统要求输出 JSON。');
  return parts.join('\n\n');
}

function repairJsonText(src) {
  let out = '';
  let inString = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src.charAt(i);
    if (!inString) {
      out += ch;
      if (ch === '"') inString = true;
      continue;
    }
    if (ch === '\\') {
      const next = src.charAt(i + 1);
      if (next === 'u') {
        const hex = src.slice(i + 2, i + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) { out += '\\u' + hex; i += 5; }
        else out += '\\\\';
        continue;
      }
      if (next && '"\\/bfnrt'.indexOf(next) >= 0) { out += '\\' + next; i++; continue; }
      out += '\\\\';
      continue;
    }
    if (ch === '"') { out += ch; inString = false; continue; }
    const code = ch.charCodeAt(0);
    if (code < 0x20) {
      if (ch === '\n') out += '\\n';
      else if (ch === '\r') out += '\\r';
      else if (ch === '\t') out += '\\t';
      else out += '\\u' + ('000' + code.toString(16)).slice(-4);
      continue;
    }
    out += ch;
  }
  return out;
}

function extractJson(text) {
  let s = String(text || '').trim();
  s = s.replace(/^```(?:json)?s*/i, '').replace(/```s*$/i, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  try {
    return JSON.parse(s);
  } catch (e) {
    const repaired = repairJsonText(s);
    if (repaired !== s) {
      try { return JSON.parse(repaired); } catch (e2) { /* fall through */ }
    }
    throw e;
  }
}

function normalizeResult(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const asStr = function (v) { return typeof v === 'string' ? v.trim() : ''; };
  const asArr = function (v) { return Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string' && x.trim(); }).map(function (x) { return x.trim(); }) : []; };
  const notes = r.templateNotes && typeof r.templateNotes === 'object' ? r.templateNotes : {};
  const ea = r.errorAnalysis && typeof r.errorAnalysis === 'object' ? r.errorAnalysis : {};
  const variants = Array.isArray(r.variants) ? r.variants.filter(function (v) { return v && (asStr(v.q) || asStr(v.a)); }).map(function (v) { return { q: asStr(v.q), a: asStr(v.a) }; }) : [];
  const difficulty = Number(r.difficulty);
  const confidence = Number(r.confidence);
  return {
    needsClarification: !!r.needsClarification,
    clarification: asStr(r.clarification),
    confidence: isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0.7,
    summary: asStr(r.summary),
    chapter: asStr(r.chapter),
    chapterCode: asStr(r.chapterCode),
    points: asArr(r.points).slice(0, 6),
    templateTitle: asStr(r.templateTitle),
    templateNotes: {
      features: asStr(notes.features),
      method: asStr(notes.method),
      skeleton: asStr(notes.skeleton),
      pitfalls: asStr(notes.pitfalls)
    },
    question: asStr(r.question),
    standardSolution: asStr(r.standardSolution),
    detailedAnalysis: asStr(r.detailedAnalysis),
    verification: asStr(r.verification),
    answer: asStr(r.answer),
    pitfalls: asArr(r.pitfalls),
    variants: variants,
    difficulty: difficulty === 1 || difficulty === 3 ? difficulty : 2,
    errorTypes: asArr(r.errorTypes),
    hasUserSolution: !!r.hasUserSolution,
    errorAnalysis: { mistake: asStr(ea.mistake), blockingPoint: asStr(ea.blockingPoint), correction: asStr(ea.correction), prevention: asStr(ea.prevention) },
    source: asStr(r.source)
  };
}

function aiUpstreamError(res, raw) {
  let msg = '模型服务返回 ' + res.status;
  try {
    const j = JSON.parse(raw);
    if (j.error && j.error.message) msg += '：' + j.error.message;
    else if (j.message) msg += '：' + j.message;
  } catch (e) { /* ignore */ }
  const err = new Error(msg);
  err.code = (res.status === 401 || res.status === 403) ? 'UPSTREAM_AUTH' : (res.status === 429 ? 'RATE_LIMIT' : 'UPSTREAM_ERROR');
  if (err.code === 'UPSTREAM_ERROR' && /model[\s_-]*(not[\s_-]*found|does not exist|not available|not supported|unsupported|invalid)|invalid[\s_-]*model|unknown model/i.test(String(raw || '') + ' ' + err.message)) err.code = 'MODEL_UNAVAILABLE';
  err.status = res.status;
  return err;
}

function normalizeUsage(u) {
  if (!u) return null;
  return {
    input_tokens: (typeof u.prompt_tokens === 'number' ? u.prompt_tokens : u.input_tokens) || 0,
    output_tokens: (typeof u.completion_tokens === 'number' ? u.completion_tokens : u.output_tokens) || 0
  };
}

function isPrivateAddress(address) {
  const ip = String(address || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!ip) return true;
  if (net.isIPv4(ip)) {
    const p = ip.split('.').map(Number);
    return p[0] === 0 || p[0] === 10 || p[0] === 127 ||
      (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) ||
      (p[0] === 198 && (p[1] === 18 || p[1] === 19)) ||
      p[0] >= 224;
  }
  if (net.isIPv6(ip)) {
    if (ip === '::' || ip === '::1') return true;
    if (/^::ffff:/.test(ip) && net.isIPv4(ip.slice(7))) return isPrivateAddress(ip.slice(7));
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(ip);
  }
  return true;
}

async function assertSafeAiBaseUrl(baseUrl) {
  let u;
  try { u = new URL(String(baseUrl || '')); }
  catch (e) { const err = new Error('AI 接口地址格式不正确'); err.code = 'UNSAFE_AI_URL'; throw err; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    const err = new Error('AI 接口只支持 http/https'); err.code = 'UNSAFE_AI_URL'; throw err;
  }
  if (u.username || u.password) {
    const err = new Error('AI 接口地址不能包含账号密码'); err.code = 'UNSAFE_AI_URL'; throw err;
  }
  if (process.env.ALLOW_PRIVATE_AI_BASE_URL === '1') return;
  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || /\.localhost$/.test(host) || host === 'metadata.google.internal') {
    const err = new Error('AI 接口地址不能指向本机或元数据服务'); err.code = 'UNSAFE_AI_URL'; throw err;
  }
  let addresses;
  if (net.isIP(host)) addresses = [host];
  else {
    try { addresses = (await dns.lookup(host, { all: true })).map(function (x) { return x.address; }); }
    catch (e) { const err = new Error('AI 接口域名无法解析'); err.code = 'UNSAFE_AI_URL'; throw err; }
  }
  if (!addresses.length || addresses.some(isPrivateAddress)) {
    const err = new Error('AI 接口地址不能指向内网、回环或元数据地址'); err.code = 'UNSAFE_AI_URL'; throw err;
  }
}

async function postAiJson(cfg, payload) {
  await assertSafeAiBaseUrl(cfg.baseUrl);
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, SOLVE_TIMEOUT_MS);
  const headers = { 'content-type': 'application/json' };
  if (isOpenAiServerProtocol(cfg.protocol)) headers['authorization'] = 'Bearer ' + cfg.apiKey;
  else if (cfg.protocol === 'anthropic') {
    headers['x-api-key'] = cfg.apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers['x-dsh-auth-token'] = cfg.apiKey;
    headers['anthropic-version'] = '2023-06-01';
  }
  try {
    const res = await fetch(aiEndpointServer(cfg), {
      method: 'POST', headers: headers, body: JSON.stringify(payload), signal: controller.signal, redirect: 'error'
    });
    const raw = await res.text();
    if (!res.ok) throw aiUpstreamError(res, raw);
    try { return JSON.parse(raw); } catch (e) {
      const pe = new Error('模型返回了无法解析的内容');
      pe.code = 'PARSE_ERROR';
      throw pe;
    }
  } finally {
    clearTimeout(timer);
  }
}

async function callSolveApi(subject, text, hint, images, wrongText, wrongImages, cfg, language) {
  cfg = cfg || envAiConfig();
  if (!cfg.apiKey || !cfg.model || !/^https?:\/\//i.test(cfg.baseUrl)) {
    const err = new Error('服务端还没有配置 AI 模型服务');
    err.code = 'NO_AI_KEY';
    throw err;
  }
  await assertSafeAiBaseUrl(cfg.baseUrl);
  const skillBundle = loadSkillBundle(subject, text, hint);
  const languageNames = { 'zh-CN': '简体中文', 'zh-TW': '繁體中文', 'en': 'English', 'fr': 'French', 'de': 'German', 'ja': 'Japanese', 'ko': 'Korean', 'pt': 'Portuguese', 'ru': 'Russian', 'es': 'Spanish' };
  const targetLanguage = languageNames[language] || '简体中文';
  const systemPrompt = buildSystemPrompt(subject, skillBundle) + '\n\n【输出语言】本次所有生成字段必须使用' + targetLanguage + '。如果题目原文是中文或其他语言，先转写/翻译为' + targetLanguage + '；数学公式保留 LaTeX，专有名词可在括号内保留原文。';
  const allImages = images.concat(wrongImages || []);
  const userText = buildUserText(subject, text, hint, images.length, wrongText, (wrongImages || []).length);
  const started = Date.now();
  let data, textOut, model;
  if (isOpenAiServerProtocol(cfg.protocol)) {
    const userContent = allImages.length
      ? [{ type: 'text', text: userText }].concat(allImages.map(function (img) {
          return { type: 'image_url', image_url: { url: 'data:' + img.mediaType + ';base64,' + img.data } };
        }))
      : userText;
    data = await postAiJson(cfg, {
      model: cfg.model,
      max_tokens: 8000,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    });
    const choice = data && data.choices && data.choices[0];
    let content = choice && choice.message && choice.message.content;
    if (Array.isArray(content)) content = content.map(function (c) { return c && c.text ? c.text : ''; }).join('\n');
    textOut = content ? String(content) : '';
    model = data.model || cfg.model;
  } else {
    const content = [{ type: 'text', text: userText }];
    allImages.forEach(function (img) {
      content.push({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } });
    });
    const payload = {
      model: cfg.model,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: content }]
    };
    if (cfg.protocol === 'dsh') payload.output_config = { effort: 'low' };
    data = await postAiJson(cfg, payload);
    textOut = (data.content || []).filter(function (c) { return c && c.type === 'text'; }).map(function (c) { return c.text; }).join('\n');
    model = data.model || cfg.model;
  }
  if (!textOut) {
    const err = new Error('模型没有返回文本内容');
    err.code = 'EMPTY_RESPONSE';
    throw err;
  }
  const parsed = extractJson(textOut);
  return {
    result: normalizeResult(parsed),
    usage: normalizeUsage(data.usage),
    model: model,
    protocol: cfg.protocol,
    elapsedMs: Date.now() - started,
    skill: { id: skillBundle.id, name: skillBundle.name, chapter: skillBundle.chapter },
    promptChars: systemPrompt.length
  };
}

function solveError(res, e) {
  if (e && e.name === 'AbortError') return json(res, 504, { error: '生成超时，请重试或把题目拆小一点', code: 'TIMEOUT' });
  const code = (e && e.code) || 'SOLVE_FAILED';
  if (code === 'SKILL_MISSING') return json(res, 503, { error: (e && e.message) || '找不到对应科目技能', code: code });
  if (code === 'NO_CREDENTIAL' || code === 'NO_AI_KEY') return json(res, 503, { error: '服务端没有配置 AI 模型服务；可设置 AI_API_KEY / AI_BASE_URL / AI_MODEL，或在页面设置里填写后由请求携带', code: 'NO_AI_KEY' });
  if (code === 'UNSAFE_AI_URL') return json(res, 400, { error: (e && e.message) || 'AI 接口地址不安全', code: code });
  if (code === 'UPSTREAM_AUTH') return json(res, 502, { error: 'AI 服务鉴权失败，请检查 API Key 或接口权限', code: code });
  if (code === 'MODEL_UNAVAILABLE') return json(res, 502, { error: '当前模型不可用或不支持对话生成，已从列表移除', code: code });
  if (code === 'EMPTY_RESPONSE') return json(res, 502, { error: '模型没有返回内容，请重试', code: code });
  if (code === 'PARSE_ERROR') return json(res, 502, { error: '模型返回格式异常，请重试', code: code });
  return json(res, 502, { error: (e && e.message) || '生成失败', code: code });
}

async function handleSolve(req, res) {
  if (!allowSolve()) return json(res, 429, { error: '智能录入使用太频繁，请稍后再试', code: 'RATE_LIMIT' });
  readBody(req, res, async function (body) {
    let payload;
    try { payload = JSON.parse(body); } catch (e) { return json(res, 400, { error: '请求格式错误', code: 'BAD_JSON' }); }
    const subject = String(payload.subject || '');
    if (!SUBJECT_NAMES[subject]) return json(res, 400, { error: '科目不正确', code: 'BAD_SUBJECT' });
    const text = String(payload.text || '').trim().slice(0, 20000);
    const hint = String(payload.hint || '').trim().slice(0, 1000);
    const wrongText = String(payload.wrongText || '').trim().slice(0, 12000);
    const rawImages = Array.isArray(payload.images) ? payload.images.slice(0, 3) : [];
    const rawWrongImages = Array.isArray(payload.wrongImages) ? payload.wrongImages.slice(0, 3) : [];
    const images = [];
    const wrongImages = [];
    for (let i = 0; i < rawImages.length; i++) {
      const im = rawImages[i] || {};
      const mt = String(im.mediaType || '');
      const data = String(im.data || '');
      if (!/^image\/(jpeg|png|webp)$/.test(mt)) return json(res, 400, { error: '图片格式只支持 JPEG / PNG / WebP', code: 'BAD_IMAGE' });
      if (!data || data.length > 8 * 1024 * 1024) return json(res, 400, { error: '单张图片太大，请重新压缩', code: 'IMAGE_TOO_LARGE' });
      if (!/^[A-Za-z0-9+/=\r\n]+$/.test(data.slice(0, 200))) return json(res, 400, { error: '图片数据格式错误', code: 'BAD_IMAGE_DATA' });
      images.push({ mediaType: mt, data: data });
    }
    for (let i = 0; i < rawWrongImages.length; i++) {
      const im = rawWrongImages[i] || {};
      const mt = String(im.mediaType || '');
      const data = String(im.data || '');
      if (!/^image\/(jpeg|png|webp)$/.test(mt)) return json(res, 400, { error: '错解图片格式只支持 JPEG / PNG / WebP', code: 'BAD_IMAGE' });
      if (!data || data.length > 8 * 1024 * 1024) return json(res, 400, { error: '错解图片太大，请重新压缩', code: 'IMAGE_TOO_LARGE' });
      if (!/^[A-Za-z0-9+/=\r\n]+$/.test(data.slice(0, 200))) return json(res, 400, { error: '错解图片数据格式错误', code: 'BAD_IMAGE_DATA' });
      wrongImages.push({ mediaType: mt, data: data });
    }
    if (!text && !images.length) return json(res, 400, { error: '请先输入题目文字或上传图片', code: 'EMPTY_INPUT' });
    const started = Date.now();
    const aiCfg = requestAiConfig(payload);
    const language = String(payload.language || 'zh-CN');
    try {
      const out = await callSolveApi(subject, text, hint, images, wrongText, wrongImages, aiCfg, language);
      console.log('[solve] subject=' + subject + ' skill=' + out.skill.id + ' chapter=' + (out.skill.chapter ? out.skill.chapter.label : '-') + ' promptChars=' + out.promptChars + ' textLen=' + text.length + ' images=' + (images.length + wrongImages.length) + ' ms=' + out.elapsedMs + ' tokens=' + JSON.stringify(out.usage || {}));
      return json(res, 200, { ok: true, result: out.result, skill: out.skill, usage: out.usage, model: out.model, protocol: out.protocol, elapsedMs: out.elapsedMs });
    } catch (e) {
      console.log('[solve] error ' + (e && e.code) + ' ' + (e && e.message));
      return solveError(res, e);
    }
  }, 26 * 1024 * 1024);
}


async function handleOcr(req, res) {
  if (!allowSolve()) return json(res, 429, { error: 'OCR 使用太频繁，请稍后再试', code: 'RATE_LIMIT' });
  readBody(req, res, async function (body) {
    let payload;
    try { payload = JSON.parse(body); } catch (e) { return json(res, 400, { error: '请求格式错误', code: 'BAD_JSON' }); }
    const rawImages = Array.isArray(payload.images) ? payload.images.slice(0, 1) : [];
    if (!rawImages.length) return json(res, 400, { error: '请先扫描一页图片', code: 'EMPTY_INPUT' });
    const images = [];
    for (let i = 0; i < rawImages.length; i++) {
      const im = rawImages[i] || {};
      const mt = String(im.mediaType || '');
      const data = String(im.data || '');
      if (!/^image\/(jpeg|png|webp)$/.test(mt)) return json(res, 400, { error: '图片格式只支持 JPEG / PNG / WebP', code: 'BAD_IMAGE' });
      if (!data || data.length > 8 * 1024 * 1024) return json(res, 400, { error: '单张图片太大，请重新压缩', code: 'IMAGE_TOO_LARGE' });
      images.push({ mediaType: mt, data: data });
    }
    const cfg = requestAiConfig(payload);
    if (!cfg.apiKey || !cfg.model || !/^https?:\/\//i.test(cfg.baseUrl)) {
      return json(res, 400, { error: '服务端还没有配置 AI 模型服务', code: 'NO_AI_KEY' });
    }
    const system = [
      '你是「四科错题本」扫描页的 OCR 引擎。图中可能同时有印刷体和手写体。',
      '逐字转写，不翻译、不改写、不总结、不解题、不补写图中没有的内容。',
      '按从上到下、从左到右的阅读顺序输出；保留题号、选项、批注和箭头含义。',
      '数学公式尽量写成 LaTeX：行内 $...$，独立 $...$；看不清的字符写 [看不清]。',
      '表格用制表符分列。只输出识别出的文字，不要代码围栏或解释；没有文字时输出 [无文字]。'
    ].join('\n');
    const userText = '请识别这张智能扫描页中的全部手写和印刷文字。';
    const started = Date.now();
    try {
      let data, textOut, model;
      if (isOpenAiServerProtocol(cfg.protocol)) {
        data = await postAiJson(cfg, {
          model: cfg.model,
          max_tokens: 8000,
          temperature: 0.1,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: [{ type: 'text', text: userText }, { type: 'image_url', image_url: { url: 'data:' + images[0].mediaType + ';base64,' + images[0].data } }] }
          ]
        });
        const choice = data && data.choices && data.choices[0];
        let content = choice && choice.message && choice.message.content;
        if (Array.isArray(content)) content = content.map(function (c) { return c && c.text ? c.text : ''; }).join('\n');
        textOut = content ? String(content) : '';
        model = data.model || cfg.model;
      } else {
        data = await postAiJson(cfg, {
          model: cfg.model,
          max_tokens: 8000,
          system: system,
          messages: [{ role: 'user', content: [{ type: 'text', text: userText }, { type: 'image', source: { type: 'base64', media_type: images[0].mediaType, data: images[0].data } }] }]
        });
        textOut = (data.content || []).filter(function (c) { return c && c.type === 'text'; }).map(function (c) { return c.text; }).join('\n');
        model = data.model || cfg.model;
      }
      if (!textOut) return json(res, 502, { error: '模型没有返回识别文字', code: 'EMPTY_RESPONSE' });
      console.log('[ocr] model=' + model + ' ms=' + (Date.now() - started) + ' textLen=' + textOut.length);
      return json(res, 200, { ok: true, text: textOut, model: model, protocol: cfg.protocol, elapsedMs: Date.now() - started });
    } catch (e) {
      console.log('[ocr] error ' + (e && e.code) + ' ' + (e && e.message));
      const status = e && e.code === 'UNSAFE_AI_URL' ? 400 : 502;
      return json(res, status, { error: e && e.message ? e.message : 'OCR 失败', code: e && e.code ? e.code : 'OCR_ERROR' });
    }
  }, 26 * 1024 * 1024);
}


const server = http.createServer(function (req, res) {
  const url = (req.url || '/').split('?')[0];
  if (url.indexOf('/api/') === 0 && !authOk(req)) {
    return json(res, 401, { error: 'unauthorized' });
  }

  if (url === '/api/health') {
    const cur = readState();
    return json(res, 200, {
      ok: true, rev: cur.rev, updatedAt: cur.updatedAt, token: !!TOKEN, lan: LAN,
      stateCorrupted: !!cur.corrupted,
      stateBackup: cur.backupPath || null,
      ai: (function () { var c = envAiConfig(); return { configured: !!c.apiKey, model: c.model, protocol: c.protocol }; })()
    });
  }

  if (url === '/api/ai/status') {
    var cfg = envAiConfig();
    return json(res, 200, { ok: true, configured: !!cfg.apiKey, model: cfg.model, protocol: cfg.protocol, vision: true });
  }

  if (url === '/api/solve' && req.method === 'POST') {
    return handleSolve(req, res);
  }

  if (url === '/api/ocr' && req.method === 'POST') {
    return handleOcr(req, res);
  }

  if (url === '/api/state' && req.method === 'GET') {
    const cur = readState();
    if (cur.corrupted) {
      return json(res, 500, {
        error: '本地数据文件损坏，已保留原始副本；请先导出副本或恢复备份，再继续保存',
        code: 'STATE_CORRUPTED',
        backup: cur.backupPath || null,
        detail: cur.error
      });
    }
    return json(res, 200, cur);
  }

  if (url === '/api/state' && req.method === 'PUT') {
    return readBody(req, res, function (body) {
      let payload;
      try { payload = JSON.parse(body); } catch (e) { return json(res, 400, { error: 'invalid json' }); }
      if (!payload || !payload.state || !payload.state.entries) {
        return json(res, 400, { error: 'state.entries required' });
      }
      const cur = readState();
      if (cur.corrupted) {
        return json(res, 409, {
          error: '本地数据文件损坏，已保留原始副本；请先导出副本或恢复备份，再继续保存',
          code: 'STATE_CORRUPTED',
          backup: cur.backupPath || null
        });
      }
      const baseRev = Number(payload.baseRev || 0);
      if (baseRev !== cur.rev) {
        return json(res, 409, { rev: cur.rev, updatedAt: cur.updatedAt, state: cur.state });
      }
      try {
        writeState(cur.rev + 1, payload.state);
      } catch (e) {
        console.error('state write failed:', e && e.message ? e.message : e);
        return json(res, 500, { error: 'write failed' });
      }
      return json(res, 200, { rev: cur.rev + 1, updatedAt: readState().updatedAt });
    });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return json(res, 405, { error: 'method not allowed' });
  }
  return serveStatic(req, res);
});

server.listen(PORT, HOST, function () {
  const lines = [];
  lines.push('四科错题本服务已启动');
  lines.push('  本机:   http://127.0.0.1:' + PORT);
  if (LAN) {
    const nets = os.networkInterfaces();
    Object.keys(nets).forEach(function (name) {
      (nets[name] || []).forEach(function (info) {
        if (info.family === 'IPv4' && !info.internal) {
          lines.push('  局域网: http://' + info.address + ':' + PORT + '  (' + name + ')');
        }
      });
    });
  } else {
    lines.push('  手机访问：重新用 node server.js --lan 启动，然后打开终端里的局域网地址');
  }
  lines.push('  数据文件: ' + STATE_FILE);
  const startupAi = envAiConfig();
  lines.push('  智能录入: ' + startupAi.protocol + ' · ' + startupAi.model + (startupAi.apiKey ? ' · 已配置' : ' · 未配置'));
  if (AUTO_TOKEN) {
    lines.push('  本次访问口令: ' + TOKEN);
    lines.push('  局域网设备首次打开后，请到「设置 → 同步」把上面的口令填入访问口令。');
  } else if (TOKEN) {
    lines.push('  访问口令: 已开启（页面设置里填入）');
  }
  console.log(lines.join('\n'));
});
