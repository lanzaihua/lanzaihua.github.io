/* =========================================================
   43-ai-progress — 真实进度组件
   只呈现真实阶段、真实等待时长与真实已完成数量；
   不知道总量时不伪造百分比，只显示当前阶段与活动条。
   同时提供右下角后台任务进度，供导入、导出、翻译、
   知识点补全等长任务复用。
   ========================================================= */
var aiProgressRegistry = {};
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
  return '<section class="ai-progress' + (indeterminate ? ' is-indeterminate' : '') + '" data-ai-progress="' + aiProgressEsc(key) + '" data-progress-mode="' + aiProgressEsc(mode) + '" aria-label="' + aiProgressEsc(label) + '">' +
    '<div class="ai-progress-head"><span class="ai-progress-kicker">' + aiProgressEsc(label) + '</span>' +
      '<span class="ai-progress-value" data-progress-value>' + aiProgressEsc(valueText) + '</span></div>' +
    '<div class="ai-progress-track" data-progress-track role="progressbar" aria-label="' + aiProgressEsc(label) + '" aria-valuemin="0" aria-valuemax="100"' +
      (percent == null ? '' : ' aria-valuenow="' + Math.round(percent) + '"') + ' aria-valuetext="' + aiProgressEsc(stage) + '">' +
      '<i class="ai-progress-fill" data-progress-fill' + (percent == null ? '' : ' style="width:' + Math.round(percent) + '%"') + '></i>' +
    '</div>' +
    '<div class="ai-progress-meta"><span data-progress-stage aria-live="polite">' + aiProgressEsc(stage) + '</span><span data-progress-elapsed aria-hidden="true">已等待 0 秒</span></div>' +
    (detail ? '<p class="ai-progress-detail" data-progress-detail>' + aiProgressEsc(detail) + '</p>' : '<p class="ai-progress-detail" data-progress-detail hidden></p>') +
    (steps.length ? '<ol class="ai-progress-steps">' + stepHtml + '</ol>' : '') +
  '</section>';
}

function aiProgressElapsedText(ms) {
  var sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return '已等待 ' + sec + ' 秒';
  var min = Math.floor(sec / 60);
  return '已等待 ' + min + ' 分 ' + (sec % 60) + ' 秒';
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
  var percent = state.percent == null ? null : Math.max(0, Math.min(100, Number(state.percent) || 0));
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
    if (fill) fill.style.width = percent + '%';
    if (track) track.setAttribute('aria-valuenow', String(Math.round(percent)));
  }
  if (value) {
    if (state.valueText) value.textContent = state.valueText;
    else if (percent != null) value.textContent = Math.round(percent) + '%';
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
  if (state.elapsed != null && root.querySelector('[data-progress-elapsed]')) {
    root.querySelector('[data-progress-elapsed]').textContent = state.elapsed;
  }
  return true;
}

function aiProgressStart(key, opts) {
  opts = opts || {};
  if (aiProgressRegistry[key] && aiProgressRegistry[key].timer) clearInterval(aiProgressRegistry[key].timer);
  var started = opts.startedAt || Date.now();
  aiProgressRegistry[key] = { startedAt: started, timer: null };
  aiProgressSet(key, opts);
  aiProgressRegistry[key].timer = setInterval(function () {
    var root = document.querySelector('[data-ai-progress="' + key + '"]');
    if (!root) { aiProgressStop(key); return; }
    var el = root.querySelector('[data-progress-elapsed]');
    if (el) el.textContent = aiProgressElapsedText(Date.now() - started);
  }, 1000);
  return aiProgressRegistry[key];
}

function aiProgressStop(key) {
  var item = aiProgressRegistry[key];
  if (item && item.timer) clearInterval(item.timer);
  delete aiProgressRegistry[key];
}

function aiProgressFinish(key, opts) {
  aiProgressStop(key);
  var next = Object.assign({}, opts || {}, { percent: 100, step: 999, valueText: (opts && opts.valueText) || '100%' });
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
    ariaText: text
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
  var card = document.getElementById('longTask-' + key);
  if (card) {
    var btn = card.querySelector('[data-long-task-cancel]');
    if (btn) btn.disabled = true;
    longTaskUpdate(key, { stage: '正在取消…', ariaText: '正在取消' });
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
