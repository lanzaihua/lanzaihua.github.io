/* =========================================================
   43-ai-progress — 真实进度组件
   只呈现真实阶段、真实等待时长与真实已完成数量；
   不知道总量时不伪造百分比，只显示当前阶段与活动条。
   同时提供右下角后台任务进度，供导入、导出、翻译、
   知识点补全等长任务复用。
   ========================================================= */
var aiProgressRegistry = {};
var aiProgressLast = {};
var longTaskCancelHandlers = {};
var longTaskHideTimers = {};

function aiProgressEsc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function aiProgressStepPercent(step, total) {
  var n = Math.max(1, Number(total) || 1);
  var i = Math.max(0, Math.min(n - 1, Number(step) || 0));
  return Math.round(i / n * 100);
}

/* 真实数据进度：只统计已经收到的 JSON 字段 / 对象。
   比例来自流式正文本身，不来自定时器，也不预先编造终点。 */
function aiProgressPct(value) {
  return Math.max(0, Math.min(100, Math.round((Number(value) || 0) * 10) / 10));
}

function aiProgressJsonFields(text, keys, expectedChars) {
  var s = String(text || '');
  keys = Array.isArray(keys) ? keys : [];
  var found = [];
  keys.forEach(function (key) {
    var safe = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var m = new RegExp('"' + safe + '"\\s*:').exec(s);
    if (m) found.push({ key: key, at: m.index, valueAt: m.index + m[0].length });
  });
  found.sort(function (a, b) { return a.at - b.at; });
  if (!found.length) return { completed: 0, total: keys.length, currentKey: '', partial: 0, chars: 0 };
  var last = found[found.length - 1];
  var rest = s.slice(last.valueAt);
  var closed = /^\s*"(?:[^"\\]|\\.)*"\s*(?:,|})/.test(rest) ||
    /^\s*(?:true|false|null|-?\d+(?:\.\d+)?)\s*(?:,|})/.test(rest) ||
    /^\s*(?:\{[\s\S]*\}|\[[\s\S]*\])\s*(?:,|})/.test(rest);
  var expected = Math.max(80, Number(expectedChars && expectedChars[last.key]) || 400);
  var partial = closed ? 0 : Math.min(0.92, rest.length / expected);
  return {
    completed: Math.max(0, found.length - 1 + (closed ? 1 : 0)),
    total: keys.length,
    currentKey: last.key,
    partial: partial,
    chars: rest.length
  };
}

function aiProgressFieldsFraction(info) {
  if (!info || !info.total) return 0;
  return Math.max(0, Math.min(1, ((Number(info.completed) || 0) + (Number(info.partial) || 0)) / info.total));
}

function aiProgressJsonArray(text, arrayKey, itemChars) {
  var s = String(text || '');
  var keyIdx = s.indexOf('"' + arrayKey + '"');
  if (keyIdx < 0) return { completed: 0, currentChars: 0 };
  var start = s.indexOf('[', keyIdx);
  if (start < 0) return { completed: 0, currentChars: 0 };
  var depth = 0, inStr = false, esc = false, completed = 0, currentStart = -1;
  for (var i = start + 1; i < s.length; i++) {
    var ch = s.charAt(i);
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') { if (depth === 0) currentStart = i; depth++; continue; }
    if (ch === '}') {
      if (depth > 0) depth--;
      if (depth === 0 && currentStart >= 0) { completed++; currentStart = -1; }
    }
  }
  var currentChars = currentStart >= 0 ? s.length - currentStart : 0;
  var per = Math.max(120, Number(itemChars) || 1200);
  return { completed: completed, currentChars: currentChars, partial: Math.min(0.9, currentChars / per) };
}

function aiProgressHtml(key, opts) {
  opts = opts || {};
  var steps = Array.isArray(opts.steps) ? opts.steps : [];
  var mode = opts.mode || (opts.percent == null ? 'steps' : 'determinate');
  var label = opts.label || '真实进度';
  var stage = opts.stage || '正在准备';
  var detail = opts.detail || '';
  var step = Math.max(0, Number(opts.step) || 0);
  var percent = opts.percent == null ? null : Math.max(0, Math.min(100, Number(opts.percent) || 0));
  var indeterminate = opts.indeterminate !== false && percent == null;
  var valueText = opts.valueText || (percent == null ? (steps.length ? '第 ' + (step + 1) + ' / ' + steps.length + ' 步' : '处理中') : Math.round(percent) + '%');
  var stepHtml = steps.map(function (s, i) {
    return '<li class="ai-progress-step' + (i < step ? ' is-done' : i === step ? ' is-active' : '') + '" data-progress-step="' + i + '">' +
      '<span class="ai-progress-step-dot" aria-hidden="true"></span>' +
      '<span class="ai-progress-step-text">' + aiProgressEsc(s) + '</span>' +
    '</li>';
  }).join('');
  return '<section class="ai-progress' + (indeterminate ? ' is-indeterminate' : '') + '" data-ai-progress="' + aiProgressEsc(key) + '" data-progress-mode="' + aiProgressEsc(mode) + '" data-progress-state="running" aria-busy="true" aria-label="' + aiProgressEsc(label) + '">' +
    '<div class="ai-progress-head"><span class="ai-progress-kicker">' + aiProgressEsc(label) + '</span>' +
      '<span class="ai-progress-value" data-progress-value>' + aiProgressEsc(valueText) + '</span></div>' +
    '<div class="ai-progress-track" data-progress-track role="progressbar" aria-label="' + aiProgressEsc(label) + '" aria-valuemin="0" aria-valuemax="100"' +
      (percent == null ? '' : ' aria-valuenow="' + Math.round(percent) + '"') + ' aria-valuetext="' + aiProgressEsc(stage) + '">' +
      '<i class="ai-progress-fill" data-progress-fill' + (percent == null ? '' : ' style="width:' + Math.round(percent) + '%"') + '></i>' +
    '</div>' +
    '<div class="ai-progress-meta"><span data-progress-stage aria-live="polite">' + aiProgressEsc(stage) + '</span><span data-progress-elapsed aria-hidden="true"><i class="ai-progress-live-dot" aria-hidden="true"></i><span data-progress-elapsed-text>已等待 0.0 秒</span></span></div>' +
    (detail ? '<p class="ai-progress-detail" data-progress-detail>' + aiProgressEsc(detail) + '</p>' : '<p class="ai-progress-detail" data-progress-detail hidden></p>') +
    (steps.length ? '<ol class="ai-progress-steps">' + stepHtml + '</ol>' : '') +
  '</section>';
}

function aiProgressElapsedText(ms) {
  var safe = Math.max(0, Number(ms) || 0);
  if (safe < 10000) return '已等待 ' + (Math.floor(safe / 100) / 10).toFixed(1) + ' 秒';
  var sec = Math.floor(safe / 1000);
  if (sec < 60) return '已等待 ' + sec + ' 秒';
  var min = Math.floor(sec / 60);
  return '已等待 ' + min + ' 分 ' + (sec % 60) + ' 秒';
}

function aiProgressSetElapsed(root, startedAt) {
  if (!root) return;
  var text = root.querySelector('[data-progress-elapsed-text]') || root.querySelector('[data-progress-elapsed]');
  if (text) text.textContent = aiProgressElapsedText(Date.now() - startedAt);
}

function aiProgressSet(key, state) {
  state = state || {};
  var root = document.querySelector('[data-ai-progress="' + key + '"]');
  if (!root) return false;
  var track = root.querySelector('[data-progress-track]');
  var fill = root.querySelector('[data-progress-fill]');
  var value = root.querySelector('[data-progress-value]');
  var stage = root.querySelector('[data-progress-stage]');
  var detail = root.querySelector('[data-progress-detail]');
  var percent = state.percent == null ? null : aiProgressPct(state.percent);
  var reg = aiProgressRegistry[key];
  if (percent != null) {
    // 同一个任务只前进不后退：重试或分批返回时不会出现进度倒退。
    var last = reg && reg.lastPercent != null ? reg.lastPercent : aiProgressLast[key];
    if (last != null && percent < last) percent = last;
    if (reg) reg.lastPercent = percent;
    aiProgressLast[key] = percent;
  }
  if (state.stage && stage) stage.textContent = state.stage;
  if (detail && state.detail != null) {
    detail.textContent = state.detail;
    detail.hidden = !state.detail;
  }
  if (track && state.ariaText) track.setAttribute('aria-valuetext', state.ariaText);
  else if (track && state.stage) track.setAttribute('aria-valuetext', state.stage);
  if (percent == null) {
    root.classList.add('is-indeterminate');
    if (fill) fill.style.width = '';
    if (track) track.removeAttribute('aria-valuenow');
  } else {
    root.classList.remove('is-indeterminate');
    // 进度条宽度、ARIA 数值和文案里的百分比用同一个整数，避免条到 11.8% 而数字写 12%。
    var shownPct = Math.round(percent);
    if (fill) fill.style.width = shownPct + '%';
    if (track) track.setAttribute('aria-valuenow', String(shownPct));
  }
  var complete = !!state.complete;
  var running = state.running !== false && !complete;
  root.classList.toggle('is-complete', complete);
  root.setAttribute('aria-busy', running ? 'true' : 'false');
  root.setAttribute('data-progress-state', complete ? 'complete' : (running ? 'running' : 'stopped'));
  if (value) {
    if (state.valueText) {
      var vt = String(state.valueText);
      // 数字和进度条同源：文案没带百分比时补上同一个百分数。
      if (percent != null && vt.indexOf('%') < 0) vt += ' · ' + Math.round(percent) + '%';
      value.textContent = vt;
    } else if (percent != null) value.textContent = Math.round(percent) + '%';
    else if (state.step == null) value.textContent = '处理中';
  }
  if (state.step != null) {
    var steps = root.querySelectorAll('[data-progress-step]');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.toggle('is-done', i < state.step);
      steps[i].classList.toggle('is-active', i === state.step);
    }
    if (value && percent == null && !state.valueText && steps.length) value.textContent = '第 ' + Math.min(steps.length, state.step + 1) + ' / ' + steps.length + ' 步';
  }
  if (state.elapsed != null) {
    var elapsedText = root.querySelector('[data-progress-elapsed-text]') || root.querySelector('[data-progress-elapsed]');
    if (elapsedText) elapsedText.textContent = state.elapsed;
  }
  return true;
}

function aiProgressStart(key, opts) {
  opts = opts || {};
  if (aiProgressRegistry[key] && aiProgressRegistry[key].timer) clearInterval(aiProgressRegistry[key].timer);
  var started = opts.startedAt || Date.now();
  aiProgressRegistry[key] = { startedAt: started, timer: null, lastPercent: null };
  aiProgressLast[key] = null;
  aiProgressSet(key, opts);
  var root = document.querySelector('[data-ai-progress="' + key + '"]');
  if (root) aiProgressSetElapsed(root, started);
  aiProgressRegistry[key].timer = setInterval(function () {
    var node = document.querySelector('[data-ai-progress="' + key + '"]');
    if (!node) { aiProgressStop(key); return; }
    aiProgressSetElapsed(node, started);
  }, 250);
  return aiProgressRegistry[key];
}

function aiProgressStop(key) {
  var item = aiProgressRegistry[key];
  if (item && item.timer) clearInterval(item.timer);
  delete aiProgressRegistry[key];
}

function aiProgressFinish(key, opts) {
  aiProgressStop(key);
  var next = Object.assign({}, opts || {}, { percent: 100, step: 999, valueText: (opts && opts.valueText) || '100%', complete: true, running: false });
  aiProgressSet(key, next);
}

function aiProgressStopAll() {
  Object.keys(aiProgressRegistry).forEach(function (key) { aiProgressStop(key); });
}

/* ---------- 右下角长任务进度（导入 / 导出 / 翻译 / 知识点补全等） ---------- */
function longTaskDock() {
  var host = document.querySelector('dialog[open]') || document.body || document.documentElement;
  var dockId = host.tagName === 'DIALOG' ? 'longTaskDockDialog' : 'longTaskDock';
  var dock = document.getElementById(dockId);
  if (!dock) {
    dock = document.createElement('aside');
    dock.id = dockId;
    dock.className = 'long-task-dock';
    dock.setAttribute('data-no-i18n', '');
    dock.setAttribute('aria-label', '后台任务进度');
  }
  // 进度卡从弹窗里发起时必须留在弹窗的 top layer，否则会被 dialog 遮住。
  if (dock.parentNode !== host) host.appendChild(dock);
  return dock;
}

function longTaskStart(key, opts) {
  opts = opts || {};
  if (longTaskHideTimers[key]) { clearTimeout(longTaskHideTimers[key]); delete longTaskHideTimers[key]; }
  var dock = longTaskDock();
  var card = document.getElementById('longTask-' + key);
  if (!card) {
    card = document.createElement('div');
    card.id = 'longTask-' + key;
    card.className = 'long-task-card';
    dock.appendChild(card);
  }
  card.classList.remove('is-error', 'is-done');
  card.innerHTML = aiProgressHtml(key, opts) +
    '<div class="long-task-actions"><button class="btn btn-xs" data-long-task-cancel="' + aiProgressEsc(key) + '" type="button">' + aiProgressEsc(opts.cancelLabel || '取消') + '</button></div>';
  longTaskCancelHandlers[key] = typeof opts.onCancel === 'function' ? opts.onCancel : null;
  aiProgressStart(key, opts);
  return card;
}

function longTaskUpdate(key, state) {
  return aiProgressSet(key, state || {});
}

function longTaskFinish(key, opts) {
  opts = opts || {};
  aiProgressFinish(key, {
    stage: opts.stage || '已完成',
    detail: opts.detail || '',
    ariaText: opts.stage || '已完成'
  });
  var card = document.getElementById('longTask-' + key);
  if (card) {
    card.classList.add('is-done');
    var btn = card.querySelector('[data-long-task-cancel]');
    if (btn) btn.disabled = true;
  }
  delete longTaskCancelHandlers[key];
  if (longTaskHideTimers[key]) clearTimeout(longTaskHideTimers[key]);
  longTaskHideTimers[key] = setTimeout(function () { longTaskRemove(key); }, 1400);
}

function longTaskFail(key, message, opts) {
  opts = opts || {};
  aiProgressStop(key);
  var text = String(message || '任务失败，请重试');
  aiProgressSet(key, {
    stage: opts.stage || '任务失败',
    detail: text,
    valueText: opts.valueText || '已停止',
    ariaText: text,
    running: false
  });
  var card = document.getElementById('longTask-' + key);
  if (card) {
    card.classList.add('is-error');
    var track = card.querySelector('[data-progress-track]');
    if (track) track.removeAttribute('aria-valuenow');
    var btn = card.querySelector('[data-long-task-cancel]');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '关闭';
      btn.setAttribute('data-long-task-dismiss', key);
      btn.removeAttribute('data-long-task-cancel');
    }
  }
  delete longTaskCancelHandlers[key];
}

function longTaskCancel(key) {
  var fn = longTaskCancelHandlers[key];
  if (typeof fn === 'function') fn();
  aiProgressStop(key);
  var card = document.getElementById('longTask-' + key);
  if (card) {
    var btn = card.querySelector('[data-long-task-cancel]');
    if (btn) btn.disabled = true;
    longTaskUpdate(key, { stage: '正在取消…', ariaText: '正在取消', running: false });
  }
}

function longTaskRemove(key) {
  if (longTaskHideTimers[key]) { clearTimeout(longTaskHideTimers[key]); delete longTaskHideTimers[key]; }
  aiProgressStop(key);
  var card = document.getElementById('longTask-' + key);
  var dock = card ? card.parentNode : document.getElementById('longTaskDock');
  if (card) card.remove();
  delete longTaskCancelHandlers[key];
  if (dock && dock.classList && dock.classList.contains('long-task-dock') && !dock.children.length) dock.remove();
}

if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-long-task-cancel], [data-long-task-dismiss]') : null;
    if (!el) return;
    e.preventDefault();
    var key = el.getAttribute('data-long-task-cancel') || el.getAttribute('data-long-task-dismiss');
    if (!key) return;
    if (el.hasAttribute('data-long-task-dismiss')) longTaskRemove(key);
    else longTaskCancel(key);
  });
}
