/* =========================================================
   44-ai-config — 可切换的 AI 模型服务配置
   OpenAI 兼容 / DeepSeek / Anthropic / DeepSeek Harness；纯静态页直接连，
   本机 server 模式可由请求携带同一份配置。
   ========================================================= */
var AI_CONFIG_KEY = 'sanke-ai-config-v1';
var AI_PROTOCOL_PRESETS = {
  openai: { label: 'OpenAI 兼容', baseUrl: 'https://api.openai.com/v1', model: 'gpt-6.1-sol-pro' },
  deepseek: { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-flash' },
  anthropic: { label: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', model: 'claude-sonnet-5-5' },
  google: { label: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-4-argon' },
  xai: { label: 'xAI Grok', baseUrl: 'https://api.x.ai/v1', model: 'grok-4.7' },
  qwen: { label: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen3.8-max-prime' },
  moonshot: { label: 'Moonshot Kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'kimi-k3.1-pro' },
  dsh: { label: 'DeepSeek Harness', baseUrl: 'https://api.deepseek.com/anthropic/v1/messages', model: 'deepseek-flash' }
};

var AI_MODEL_PRESETS = {
  "openai": [
    "gpt-6.1-sol-pro",
    "gpt-6.1-sol",
    "gpt-6-luna-pro",
    "gpt-6-luna",
    "gpt-6-sol-pro",
    "gpt-6-sol",
    "gpt-6-astra",
    "gpt-6-astra-pro",
    "gpt-5.6-luna-pro",
    "gpt-5.6-luna",
    "gpt-5.6-terra-pro",
    "gpt-5.6-terra",
    "gpt-5.6-sol-pro",
    "gpt-5.6-sol",
    "gpt-chat-latest",
    "gpt-5.5-pro",
    "gpt-5.5",
    "gpt-5.4-nano",
    "gpt-5.4-mini",
    "gpt-5.4-pro",
    "gpt-5.4",
    "gpt-5.3-codex",
    "gpt-5.2-codex",
    "gpt-5.2-chat",
    "gpt-5.2-pro",
    "gpt-5.2",
    "gpt-5.1-codex-max",
    "gpt-5.1",
    "gpt-5.1-codex",
    "gpt-5.1-codex-mini",
    "gpt-oss-safeguard-20b",
    "gpt-5-pro",
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-oss-120b",
    "gpt-oss-20b",
    "o3-pro",
    "o4-mini-high",
    "o3",
    "o4-mini",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "o1-pro",
    "o3-mini-high",
    "o3-mini",
    "o1",
    "gpt-4o-2024-11-20",
    "gpt-4o-2024-08-06",
    "gpt-4o-mini",
    "gpt-4o-mini-2024-07-18",
    "gpt-4o",
    "gpt-4o-2024-05-13",
    "gpt-4-turbo",
    "gpt-3.5-turbo-0613",
    "gpt-3.5-turbo-instruct",
    "gpt-3.5-turbo-16k",
    "gpt-3.5-turbo",
    "gpt-4"
  ],
  "deepseek": [
      "deepseek-flash",
      "deepseek-v4-pro",
      "deepseek-v4-flash"
  ],
  "anthropic": [
    "claude-haiku-5-5",
    "claude-sonnet-5-5",
    "claude-opus-5-5",
    "claude-fable-5-1",
    "claude-opus-5",
    "claude-sonnet-5",
    "claude-fable-5",
    "claude-opus-4-8",
    "claude-opus-4-7",
    "claude-sonnet-4-6",
    "claude-opus-4-6",
    "claude-opus-4-5",
    "claude-haiku-4-5",
    "claude-sonnet-4-5",
    "claude-opus-4-1"
  ],
  "google": [
    "gemini-4-argon",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemma-4-26b-a4b-it",
    "gemma-4-31b-it",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.1-pro-preview-customtools",
    "gemini-3.1-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-pro-preview",
    "gemma-3-4b-it",
    "gemma-3-12b-it",
    "gemma-3-27b-it",
    "gemma-2-27b-it"
  ],
  "xai": [
    "grok-4.7",
    "grok-4.6",
    "grok-4.5",
    "grok-build-0.1",
    "grok-4.3",
    "grok-4.20-multi-agent",
    "grok-4.20"
  ],
  "qwen": [
      "qwen3.8-max-prime",
      "qwen3.8-omni-flash",
      "qwen3.8-max-0902",
      "qwen3.8-flash",
      "qwen3.7-flash",
      "qwen3.7-plus",
      "qwen3.7-max",
      "qwen3.6-flash",
      "qwen3.6-plus",
      "qwen3.5-plus-20260420",
      "qwen3.5-plus-02-15",
      "qwen-plus"
  ],
  "moonshot": [
    "kimi-k3.1-pro",
    "kimi-k3",
    "kimi-k2.7-code",
    "kimi-k2.6",
    "kimi-k2.5",
    "kimi-k2-thinking",
    "kimi-k2-0905",
    "kimi-k2"
  ],
  "dsh": [
    "deepseek-flash"
  ]
};

var AI_MODEL_RELEASED = {
  "gpt-6.1-sol-pro": "2026-09-29",
  "gpt-6.1-sol": "2026-09-29",
  "gpt-6-luna-pro": "2026-09-22",
  "gpt-6-luna": "2026-09-22",
  "gpt-6-sol-pro": "2026-09-22",
  "gpt-6-sol": "2026-09-22",
  "gpt-6-astra": "2026-09-04",
  "gpt-6-astra-pro": "2026-09-04",
  "gpt-5.6-luna-pro": "2026-07-09",
  "gpt-5.6-luna": "2026-07-09",
  "gpt-5.6-terra-pro": "2026-07-09",
  "gpt-5.6-terra": "2026-07-09",
  "gpt-5.6-sol-pro": "2026-07-09",
  "gpt-5.6-sol": "2026-07-09",
  "gpt-chat-latest": "2026-05-05",
  "gpt-5.5-pro": "2026-04-24",
  "gpt-5.5": "2026-04-24",
  "gpt-5.4-nano": "2026-03-17",
  "gpt-5.4-mini": "2026-03-17",
  "gpt-5.4-pro": "2026-03-05",
  "gpt-5.4": "2026-03-05",
  "gpt-5.3-codex": "2026-02-24",
  "gpt-5.2-codex": "2026-01-14",
  "gpt-5.2-chat": "2025-12-10",
  "gpt-5.2-pro": "2025-12-10",
  "gpt-5.2": "2025-12-10",
  "gpt-5.1-codex-max": "2025-12-04",
  "gpt-5.1": "2025-11-13",
  "gpt-5.1-codex": "2025-11-13",
  "gpt-5.1-codex-mini": "2025-11-13",
  "gpt-oss-safeguard-20b": "2025-10-29",
  "gpt-5-pro": "2025-10-06",
  "gpt-5": "2025-08-07",
  "gpt-5-mini": "2025-08-07",
  "gpt-5-nano": "2025-08-07",
  "gpt-oss-120b": "2025-08-05",
  "gpt-oss-20b": "2025-08-05",
  "o3-pro": "2025-06-10",
  "o4-mini-high": "2025-04-16",
  "o3": "2025-04-16",
  "o4-mini": "2025-04-16",
  "gpt-4.1": "2025-04-14",
  "gpt-4.1-mini": "2025-04-14",
  "gpt-4.1-nano": "2025-04-14",
  "o1-pro": "2025-03-19",
  "o3-mini-high": "2025-02-12",
  "o3-mini": "2025-01-31",
  "o1": "2024-12-17",
  "gpt-4o-2024-11-20": "2024-11-20",
  "gpt-4o-2024-08-06": "2024-08-06",
  "gpt-4o-mini": "2024-07-18",
  "gpt-4o-mini-2024-07-18": "2024-07-18",
  "gpt-4o": "2024-05-13",
  "gpt-4o-2024-05-13": "2024-05-13",
  "gpt-4-turbo": "2024-04-09",
  "gpt-3.5-turbo-0613": "2024-01-25",
  "gpt-3.5-turbo-instruct": "2023-09-28",
  "gpt-3.5-turbo-16k": "2023-08-28",
  "gpt-3.5-turbo": "2023-05-28",
  "gpt-4": "2023-05-28",
  "deepseek-flash": "2026-10-17",
  "deepseek-v4-pro": "2026-04-24",
  "deepseek-v4-flash": "2026-04-24",
  "claude-haiku-5-5": "2026-10-07",
  "claude-sonnet-5-5": "2026-09-28",
  "claude-opus-5-5": "2026-09-22",
  "claude-fable-5-1": "2026-09-01",
  "claude-opus-5": "2026-07-24",
  "claude-sonnet-5": "2026-06-30",
  "claude-fable-5": "2026-06-09",
  "claude-opus-4-8": "2026-05-27",
  "claude-opus-4-7": "2026-04-16",
  "claude-sonnet-4-6": "2026-02-17",
  "claude-opus-4-6": "2026-02-04",
  "claude-opus-4-5": "2025-11-24",
  "claude-haiku-4-5": "2025-10-15",
  "claude-sonnet-4-5": "2025-09-29",
  "claude-opus-4-1": "2025-08-05",
  "gemini-4-argon": "2026-10-13",
  "gemini-3.8-flash": "2026-09-02",
  "gemini-3.7-flash": "2026-08-13",
  "gemini-3.6-flash": "2026-07-21",
  "gemini-3.5-flash-lite": "2026-07-21",
  "gemini-3.5-flash": "2026-05-19",
  "gemini-3.1-flash-lite": "2026-05-07",
  "gemma-4-26b-a4b-it": "2026-04-03",
  "gemma-4-31b-it": "2026-04-02",
  "gemini-3.1-flash-lite-preview": "2026-03-03",
  "gemini-3.1-pro-preview-customtools": "2026-02-25",
  "gemini-3.1-pro-preview": "2026-02-19",
  "gemini-3-flash-preview": "2025-12-17",
  "gemini-2.5-flash-lite": "2025-07-22",
  "gemini-2.5-flash": "2025-06-17",
  "gemini-2.5-pro": "2025-06-17",
  "gemini-2.5-pro-preview": "2025-06-05",
  "gemma-3-4b-it": "2025-03-13",
  "gemma-3-12b-it": "2025-03-13",
  "gemma-3-27b-it": "2025-03-12",
  "gemma-2-27b-it": "2024-07-13",
  "grok-4.7": "2026-09-21",
  "grok-4.6": "2026-08-12",
  "grok-4.5": "2026-07-08",
  "grok-build-0.1": "2026-05-20",
  "grok-4.3": "2026-04-30",
  "grok-4.20-multi-agent": "2026-03-31",
  "grok-4.20": "2026-03-31",
  "qwen3.8-max-prime": "2026-09-23",
  "qwen3.8-omni-flash": "2026-09-21",
  "qwen3.8-max-0902": "2026-09-03",
  "qwen3.8-flash": "2026-08-26",
  "qwen3.7-flash": "2026-07-27",
  "qwen3.7-plus": "2026-06-03",
  "qwen3.7-max": "2026-05-21",
  "qwen3.6-flash": "2026-04-27",
  "qwen3.6-plus": "2026-04-02",
  "qwen3.5-plus-20260420": "2026-04-27",
  "qwen3.5-plus-02-15": "2026-02-16",
  "qwen-plus": "2025-02-01",
  "kimi-k3.1-pro": "2026-10-23",
  "kimi-k3": "2026-07-16",
  "kimi-k2.7-code": "2026-06-12",
  "kimi-k2.6": "2026-04-20",
  "kimi-k2.5": "2026-01-27",
  "kimi-k2-thinking": "2025-11-06",
  "kimi-k2-0905": "2025-09-04",
  "kimi-k2": "2025-07-11"
};

function aiModelCanChat(protocol, model) {
  var name = String(model || '').toLowerCase();
  if (/(image|audio|tts|embedding|transcribe|whisper|lyria|nano-banana|sora|codex|instruct|gpt-oss|gemma-|customtools)/.test(name)) return false;
  if (protocol === 'xai' && /grok-build/.test(name)) return false;
  if (protocol === 'moonshot' && /code/.test(name)) return false;
  if (protocol === 'qwen' && /(coder|vl-|next|qwen3-\d|qwen-2\.5|qwen2\.5|qwen3\.8-27b|qwen3\.8-2\.4t|qwen3\.5-\d|qwen3\.6-\d)/.test(name)) return false;
  return true;
}

function aiModelPresets(protocol) {
  return (AI_MODEL_PRESETS[protocol] || AI_MODEL_PRESETS.openai).filter(function (m) { return aiModelCanChat(protocol, m) && !aiModelIsBlacklisted(protocol, m); }).sort(function (a, b) {
    var da = AI_MODEL_RELEASED[a] || '';
    var db = AI_MODEL_RELEASED[b] || '';
    if (da !== db) return da < db ? 1 : -1;
    return String(a).toLowerCase().localeCompare(String(b).toLowerCase(), 'en', { numeric: true, sensitivity: 'base' });
  });
}

var AI_PROTOCOL_SORT = { qwen: 'Tongyi Qianwen' };
function aiProtocolOrder() {
  return Object.keys(AI_PROTOCOL_PRESETS).sort(function (a, b) {
    var ka = AI_PROTOCOL_SORT[a] || AI_PROTOCOL_PRESETS[a].label;
    var kb = AI_PROTOCOL_SORT[b] || AI_PROTOCOL_PRESETS[b].label;
    return String(ka).localeCompare(String(kb), 'en', { sensitivity: 'base' });
  });
}

var AI_BAD_MODEL_KEY = 'sanke-ai-bad-models-v1';

function aiBadModelMap() {
  var raw = safeStorage.getJSON(AI_BAD_MODEL_KEY, {});
  return raw && typeof raw === 'object' ? raw : {};
}

function aiModelIsBlacklisted(protocol, model) {
  var list = aiBadModelMap()[protocol] || [];
  return list.indexOf(String(model || '')) >= 0;
}

function aiBlacklistModel(protocol, model) {
  if (!protocol || !model) return;
  var map = aiBadModelMap();
  var list = Array.isArray(map[protocol]) ? map[protocol] : [];
  if (list.indexOf(model) < 0) list.push(model);
  map[protocol] = list;
  safeStorage.setJSON(AI_BAD_MODEL_KEY, map);
}

function aiClearModelBlacklist() {
  safeStorage.remove(AI_BAD_MODEL_KEY);
}

function aiBlacklistCount() {
  var map = aiBadModelMap(); var n = 0;
  Object.keys(map).forEach(function (k) { n += (map[k] || []).length; });
  return n;
}

function aiDropUnavailableModel(protocol, model) {
  aiBlacklistModel(protocol, model);
  var list = aiModelPresets(protocol);
  var preferred = aiProtocolPreset(protocol).model;
  var fallback = list.indexOf(preferred) >= 0 ? preferred : (list[0] || '');
  var cfg = aiConfig();
  if (fallback && cfg.protocol === protocol) {
    aiSaveConfig({ protocol: cfg.protocol, baseUrl: cfg.baseUrl, model: fallback, apiKey: cfg.apiKey });
  }
  return fallback;
}

var AI_MODEL_VENDOR_RULES = [
  { id: 'anthropic', re: /^claude-/i },
  { id: 'deepseek', re: /^deepseek-/i },
  { id: 'google', re: /^(gemini-|gemma-)/i },
  { id: 'openai', re: /^(gpt-|o[0-9]|chatgpt)/i },
  { id: 'xai', re: /^grok-/i },
  { id: 'qwen', re: /^qwen/i },
  { id: 'moonshot', re: /^kimi-/i }
];

function aiDetectModelVendor(model) {
  var name = String(model || '').trim();
  if (!name) return '';
  for (var i = 0; i < AI_MODEL_VENDOR_RULES.length; i++) {
    if (AI_MODEL_VENDOR_RULES[i].re.test(name)) return AI_MODEL_VENDOR_RULES[i].id;
  }
  return '';
}

function aiModelProtocolHint(protocol, model) {
  var total = aiModelPresets(protocol).length;
  var detected = aiDetectModelVendor(model);
  if (!detected) return { status: 'neutral', text: '按发布时间从新到旧 · 共 ' + total + ' 个；列表只保留可对话生成文本的模型' };
  var expected = protocol === 'dsh' ? 'deepseek' : protocol;
  if (detected === expected) return { status: 'ok', text: '型号与当前协议匹配 · 按发布时间从新到旧 · 共 ' + total + ' 个' };
  return {
    status: 'warn',
    text: '这个型号更像 ' + aiProtocolLabel(detected) + '，当前协议是 ' + aiProtocolLabel(protocol) + '；请检查 Base URL 或切换协议'
  };
}

function aiUpdateModelHint() {
  var hint = qs('#aiModelHint');
  var input = qs('#aiModel');
  if (!hint || !input) return;
  var protocolEl = qs('#aiProtocol');
  var protocol = protocolEl ? protocolEl.value : aiConfig().protocol;
  var info = aiModelProtocolHint(protocol, input.value);
  hint.textContent = info.text;
  hint.classList.toggle('is-warn', info.status === 'warn');
}

function aiValidateModelCatalog() {
  var problems = [];
  Object.keys(AI_MODEL_PRESETS).forEach(function (protocol) {
    AI_MODEL_PRESETS[protocol].forEach(function (model) {
      var detected = aiDetectModelVendor(model);
      var expected = protocol === 'dsh' ? 'deepseek' : protocol;
      if (!aiModelCanChat(protocol, model)) problems.push(protocol + ': ' + model + ' → 非通用对话模型');
      else if (detected && detected !== expected) problems.push(protocol + ': ' + model + ' → ' + detected);
    });
  });
  if (problems.length && typeof console !== 'undefined') console.warn('[AI] 模型与协议不匹配：', problems);
  return problems;
}

function aiModelMenuHtml(protocol, query) {
  var list = aiModelPresets(protocol);
  var q = String(query || '').trim().toLowerCase();
  var filtered = q ? list.filter(function (m) { return m.toLowerCase().indexOf(q) >= 0; }) : list;
  function opt(m) {
    return '<button type="button" class="model-option" role="option" data-act="model-choose" data-model="' + attr(m) + '">' + esc(m) + '</button>';
  }
  if (!filtered.length) return '<div class="model-empty">没有匹配项，直接输入模型名即可</div>';
  return filtered.map(opt).join('');
}

function aiRefreshModelMenu(query) {
  var menu = qs('#aiModelMenu');
  var input = qs('#aiModel');
  if (!menu || !input) return;
  var protocolEl = qs('#aiProtocol');
  var protocol = protocolEl ? protocolEl.value : aiConfig().protocol;
  menu.innerHTML = aiModelMenuHtml(protocol, query || '');
  menu.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}

function aiOpenModelMenu() {
  var menu = qs('#aiModelMenu');
  var input = qs('#aiModel');
  if (!menu || !input) return;
  aiRefreshModelMenu('');
}

function aiCloseModelMenu() {
  var menu = qs('#aiModelMenu');
  var input = qs('#aiModel');
  if (menu) { menu.hidden = true; menu.innerHTML = ''; }
  if (input) input.setAttribute('aria-expanded', 'false');
}

function setAiModelPicker(protocol, model) {
  var input = qs('#aiModel');
  if (input) input.value = model || '';
  aiCloseModelMenu();
}

function aiIsOpenAiProtocol(protocol) {
  return protocol !== 'anthropic' && protocol !== 'dsh';
}

var AI_DEFAULT_CONFIG = {
  protocol: 'openai',
  baseUrl: AI_PROTOCOL_PRESETS.openai.baseUrl,
  model: AI_PROTOCOL_PRESETS.openai.model,
  apiKey: ''
};

function aiProtocolPreset(protocol) {
  return AI_PROTOCOL_PRESETS[protocol] || AI_PROTOCOL_PRESETS.openai;
}

function aiProtocolLabel(protocol) {
  return aiProtocolPreset(protocol).label;
}

function aiConfig() {
  var cfg = safeStorage.getJSON(AI_CONFIG_KEY, null);
  if (!cfg || typeof cfg !== 'object') {
    var legacy = (typeof dshToken === 'function') ? dshToken() : '';
    if (legacy) {
      cfg = {
        protocol: 'dsh',
        baseUrl: AI_PROTOCOL_PRESETS.dsh.baseUrl,
        model: AI_PROTOCOL_PRESETS.dsh.model,
        apiKey: legacy
      };
    } else {
      cfg = { protocol: 'openai', baseUrl: AI_DEFAULT_CONFIG.baseUrl, model: AI_DEFAULT_CONFIG.model, apiKey: '' };
    }
  }
  var preset = aiProtocolPreset(cfg.protocol);
  return {
    protocol: AI_PROTOCOL_PRESETS[cfg.protocol] ? cfg.protocol : 'openai',
    baseUrl: String(cfg.baseUrl || preset.baseUrl).trim(),
    model: String(cfg.model || preset.model).trim(),
    apiKey: String(cfg.apiKey || '').trim()
  };
}

function aiConfigDiagnosis() {
  var cfg = aiConfig();
  var protocol = cfg.protocol;
  var label = aiProtocolLabel(protocol);
  var expectedHost = {
    openai: 'api.openai.com', deepseek: 'api.deepseek.com', anthropic: 'api.anthropic.com',
    google: 'generativelanguage.googleapis.com', xai: 'api.x.ai', qwen: 'dashscope.aliyuncs.com',
    moonshot: 'api.moonshot.cn', dsh: 'api.deepseek.com'
  }[protocol];
  var warnings = [];
  if (!cfg.apiKey) {
    return { blocking: true, code: 'NO_AI_KEY', message: '还没有填写 API Key', hint: '打开「设置与同步 → 在线 AI 服务」，填写 API Key；或在本机 server 配置 AI_* 环境变量。' };
  }
  if (!cfg.model) {
    return { blocking: true, code: 'NO_AI_MODEL', message: '还没有填写模型名', hint: '在「在线 AI 服务」里选择或输入一个可对话的模型名。' };
  }
  if (!/^https?:\/\//i.test(cfg.baseUrl)) {
    return { blocking: true, code: 'BAD_BASE_URL', message: '接口地址不是有效的 http(s) URL', hint: '检查 Base URL，例如 https://api.deepseek.com/v1。' };
  }
  var host = '';
  try { host = new URL(cfg.baseUrl).hostname.toLowerCase(); } catch (e) { host = ''; }
  if (expectedHost && host && host.indexOf(expectedHost) < 0 && !/localhost|127\.0\.0\.1/.test(host)) {
    warnings.push('Base URL 指向 ' + host + '，但当前协议是 ' + label + '（通常是 ' + expectedHost + '）');
  }
  var key = cfg.apiKey;
  if (/^AIza/.test(key) && protocol !== 'google') warnings.push('这串 Key 像 Google Gemini 的 AIza…，当前协议是 ' + label);
  if (/^sk-ant-/.test(key) && protocol !== 'anthropic') warnings.push('这串 Key 像 Anthropic 的 sk-ant-…，当前协议是 ' + label);
  if (/^xai-/.test(key) && protocol !== 'xai') warnings.push('这串 Key 像 xAI 的 xai-…，当前协议是 ' + label);
  var mh = typeof aiModelProtocolHint === 'function' ? aiModelProtocolHint(protocol, cfg.model) : null;
  if (mh && mh.status === 'warn' && mh.text) warnings.push(mh.text);
  return {
    blocking: false,
    code: '',
    message: 'AI 配置已填写',
    hint: warnings.length ? '配置提醒：' + warnings.join('；') + '。' : ''
  };
}

function aiConfigNoticeText(scope) {
  var d = aiConfigDiagnosis();
  if (d.blocking) return d.message + '。' + d.hint;
  if (d.hint) return d.hint;
  return scope === 'translation' ? '翻译需要先在设置里配置可用的 AI 模型。' : '请先在设置里配置可用的 AI 模型。';
}

function aiConfigReady() {
  var cfg = aiConfig();
  return !!(cfg.apiKey && cfg.model && /^https?:\/\//i.test(cfg.baseUrl));
}

function aiSaveConfig(cfg) {
  var next = {
    protocol: AI_PROTOCOL_PRESETS[cfg.protocol] ? cfg.protocol : 'openai',
    baseUrl: String(cfg.baseUrl || '').trim(),
    model: String(cfg.model || '').trim(),
    apiKey: String(cfg.apiKey || '').trim(),
    savedAt: nowIso()
  };
  safeStorage.setJSON(AI_CONFIG_KEY, next);
  if (next.protocol === 'dsh' && typeof setDshToken === 'function') setDshToken(next.apiKey);
  return next;
}

function aiClearConfig() {
  safeStorage.remove(AI_CONFIG_KEY);
  if (typeof clearDshToken === 'function') clearDshToken();
}

function aiConfigForRequest() {
  var cfg = aiConfig();
  return {
    protocol: cfg.protocol,
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    apiKey: cfg.apiKey
  };
}

function aiEndpoint(cfg) {
  var base = String(cfg.baseUrl || '').replace(/\/+$/, '');
  if (aiIsOpenAiProtocol(cfg.protocol)) {
    return /\/chat\/completions$/i.test(base) ? base : base + '/chat/completions';
  }
  return /\/messages$/i.test(base) ? base : base + '/messages';
}


try { aiValidateModelCatalog(); } catch (e) { /* noop */ }
