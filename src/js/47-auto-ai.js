/* =========================================================
   47-auto-ai — 错题录入后自动调用对应 skill 补全
   队列保存在每条错题的 ai* 字段里；页面打开时执行。
   ========================================================= */
var AUTO_AI_DELAY_MS = 12000;
var AUTO_AI_DEADLINE_MS = 10 * 60 * 1000;
var AUTO_AI_TICK_MS = 15000;
var AUTO_AI_MAX_ATTEMPTS = 3;
var autoAiBusy = false;
var autoAiAbort = null;
var autoAiTimer = null;
var autoAiInterval = null;

function autoAiEnabled() {
  return !state.prefs || state.prefs.autoAi !== false;
}

function entryBlockMd(e, keys, titleRe) {
  var out = [];
  (e.blocks || []).forEach(function (b) {
    if (!b || !b.md || !String(b.md).trim()) return;
    var keyOk = keys && keys.indexOf(b.key) >= 0;
    var titleOk = titleRe && titleRe.test(String(b.title || ''));
    if (keyOk || titleOk) out.push(String(b.md).trim());
  });
  return out.join('\n\n').trim();
}

function entryQuestionText(e) {
  var text = entryBlockMd(e, ['original', 'question', 'stem'], /原题|题目|题干/);
  if (text) return text;
  if (e.summary) return e.summary;
  if (e.templateTitle) return e.templateTitle;
  return '';
}

function entryCoreSolution(e) {
  var standard = entryBlockMd(e, ['standard', 'solution'], /标准解答|解答过程|标准答案/);
  var analysis = entryBlockMd(e, ['analysis', 'detail'], /详细解析|解析/);
  return !!(standard && analysis);
}

function entryNeedsAutoAi(e) {
  if (!e) return false;
  if (!entryQuestionText(e)) return false;
  return !entryCoreSolution(e);
}

function autoAiLabel(e) {
  var st = e && e.aiStatus;
  if (st === 'queued') return 'AI 待补全';
  if (st === 'generating') return 'AI 补全中';
  if (st === 'waiting-token') return '待配置 AI';
  if (st === 'done') return 'AI 已补全';
  if (st === 'failed') return 'AI 补全失败';
  if (st === 'skipped') return '无需补全';
  return '';
}

function autoAiBadge(e) {
  var st = e && e.aiStatus;
  var label = autoAiLabel(e);
  if (!label || st === 'none' || st === 'skipped') return '';
  return '<span class="ai-state ai-state-' + attr(st) + '"><span class="ai-state-dot"></span>' + esc(label) + '</span>';
}

function autoAiDueText(e) {
  var now = Date.now();
  if (e.aiStatus === 'generating') return '正在调用 /' + esc(e.aiSkill || AI_SKILLS[e.subject] || '') + ' 生成…';
  if (e.aiStatus === 'waiting-token') return '需要配置 AI 模型服务或本机 server.js；填好后会自动继续。';
  if (e.aiStatus === 'failed') return esc(e.aiError || '自动补全失败，可手动重试。');
  if (e.aiStatus === 'done') {
    var when = e.aiDoneAt || e.aiGeneratedAt;
    return (when ? '已于 ' + esc(formatDate(when).slice(5, 16)) + ' ' : '已') + '由 /' + esc(e.aiSkill || AI_SKILLS[e.subject] || '') + ' 补全';
  }
  if (e.aiStatus === 'queued') {
    var left = Math.max(0, Math.round(((e.aiDueAt || now) - now) / 1000));
    if (left <= 0) return '已到期，正在等待执行…';
    if (left < 60) return '约 ' + left + ' 秒内自动补全';
    return '约 ' + Math.ceil(left / 60) + ' 分钟内自动补全';
  }
  return '';
}

function autoAiPanel(e) {
  var st = e && e.aiStatus;
  if (!st || st === 'none') return '';
  var label = autoAiLabel(e);
  var due = autoAiDueText(e);
  var actions = '';
  if (st === 'queued' || st === 'waiting-token' || st === 'failed') {
    actions = '<div class="ai-auto-actions">' +
      (st === 'waiting-token' ? '<button class="btn btn-xs" data-act="open-settings" type="button">去配置 AI</button>' : '') +
      '<button class="btn btn-xs btn-primary" data-act="auto-ai-now" data-id="' + attr(e.id) + '" type="button">立即补全</button>' +
      '<button class="btn btn-xs" data-act="auto-ai-skip" data-id="' + attr(e.id) + '" type="button">跳过</button>' +
      '</div>';
  } else if (st === 'generating') {
    actions = '<div class="ai-auto-actions"><button class="btn btn-xs" data-act="auto-ai-cancel" data-id="' + attr(e.id) + '" type="button">取消</button></div>';
  }
  return '<div class="ai-auto-panel ai-auto-' + attr(st) + '">' +
    '<div class="ai-auto-copy"><span class="ai-auto-title">' + esc(label) + '</span>' +
    '<span class="ai-auto-due">' + due + '</span></div>' + actions + '</div>';
}

function queueAutoAi(e, opts) {
  opts = opts || {};
  if (!e) return;
  if (!autoAiEnabled()) return;
  if (!entryNeedsAutoAi(e)) {
    if (!e.aiStatus || e.aiStatus === 'none') e.aiStatus = 'skipped';
    return;
  }
  if (!entryQuestionText(e)) {
    e.aiStatus = 'failed';
    e.aiError = '缺少题目文字，无法自动补全';
    return;
  }
  if (!opts.force && (e.aiStatus === 'done' || e.aiStatus === 'generating' || e.aiStatus === 'queued' || e.aiStatus === 'waiting-token')) return;
  var now = Date.now();
  e.aiStatus = 'queued';
  e.aiAttempts = 0;
  e.aiDueAt = now + (opts.delayMs == null ? AUTO_AI_DELAY_MS : opts.delayMs);
  e.aiDeadline = now + AUTO_AI_DEADLINE_MS;
  e.aiError = '';
  e.aiSkill = AI_SKILLS[e.subject] || '';
  touchEntry(e);
  markDirty();
  if (opts.render !== false) render();
  scheduleAutoAiScan();
}

function scheduleAutoAiScan() {
  if (autoAiTimer) return;
  autoAiTimer = setTimeout(function () {
    autoAiTimer = null;
    scanAutoAi();
  }, 800);
}

function startAutoAi() {
  if (autoAiInterval) return;
  var changedStale = false;
  SUBJECTS.forEach(function (s) {
    entriesOf(s.id).forEach(function (e) {
      if (e.aiStatus === 'generating') {
        e.aiStatus = 'queued';
        e.aiDueAt = Date.now();
        e.aiError = '页面重新打开，继续上次补全';
        changedStale = true;
      }
    });
  });
  if (changedStale) markDirty();
  setTimeout(scanAutoAi, 2500);
  autoAiInterval = setInterval(scanAutoAi, AUTO_AI_TICK_MS);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) scanAutoAi();
  });
}

function editorOpenFor(entryId) {
  var d = qs('#editor');
  return !!(d && d.open && d.dataset.entry === entryId);
}

function scanAutoAi() {
  if (!autoAiEnabled() || autoAiBusy) return;
  if (typeof aiState !== 'undefined' && aiState.busy) return;
  if (qs('#editor') && qs('#editor').open) return;
  if (qs('#aiDialog') && qs('#aiDialog').open) return;
  var now = Date.now();
  var pending = [];
  SUBJECTS.forEach(function (s) {
    entriesOf(s.id).forEach(function (e) {
      if (!e.aiStatus) return;
      if (e.aiStatus === 'generating' && now - (e.aiStartedAt || 0) > 5 * 60 * 1000) {
        e.aiStatus = 'queued';
        e.aiDueAt = now;
        e.aiError = '上次补全中断，已重新排队';
        touchEntry(e);
        markDirty();
      }
      if (e.aiStatus === 'queued' || e.aiStatus === 'waiting-token') {
        if (editorOpenFor(e.id)) return;
        pending.push(e);
      }
    });
  });
  if (!pending.length) return;
  pending.sort(function (a, b) { return (a.aiDueAt || 0) - (b.aiDueAt || 0); });
  var target = pending[0];
  if ((target.aiDueAt || 0) > now) return;
  var transport = autoAiTransport();
  if (!transport) {
    if (target.aiStatus !== 'waiting-token') {
      target.aiStatus = 'waiting-token';
      target.aiError = '需要配置 AI 模型服务，或使用本机 server.js';
      target.aiDueAt = now + 60000;
      touchEntry(target);
      markDirty();
      render();
    }
    return;
  }
  runAutoAi(target, transport);
}

function autoAiTransport() {
  if (PAGES || !/^https?:$/.test(location.protocol)) return aiConfigReady() ? 'direct' : null;
  if (sync.available) return 'server';
  return aiConfigReady() ? 'direct' : 'server';
}

function autoAiHint(e) {
  var parts = [];
  if (e.chapter) parts.push(e.chapter);
  if (e.points && e.points.length) parts.push((e.points || []).join('；'));
  return parts.join(' · ');
}

function autoAiServerCall(subject, text, hint, signal) {
  return fetch('/api/solve', {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ subject: subject, text: text, hint: hint, images: [], aiConfig: aiConfigForRequest() }),
    signal: signal
  }).then(function (res) {
    return res.json().catch(function () { return { error: '服务端返回了无法解析的内容' }; }).then(function (data) {
      if (!res.ok || data.error) {
        var err = new Error(data.error || ('生成失败（' + res.status + '）'));
        err.code = data.code || '';
        err.status = res.status;
        throw err;
      }
      return data;
    });
  });
}

function autoAiCall(e, text, hint, signal, opts) {
  var transport = autoAiTransport();
  if (transport === 'direct') return callDshDirect(e.subject, text, hint, [], '', [], signal, opts);
  if (transport === 'server') {
    return autoAiServerCall(e.subject, text, hint, signal).catch(function (err) {
      if (aiConfigReady() && (err.status === 404 || err.code === 'NETWORK' || err.code === 'SOLVE_FAILED')) {
        return callDshDirect(e.subject, text, hint, [], '', [], signal, opts);
      }
      throw err;
    });
  }
  var e0 = new Error('需要配置 AI 模型服务或本机 server.js');
  e0.code = 'NO_AI_KEY';
  return Promise.reject(e0);
}

function fillAutoBlock(e, key, title, md) {
  if (!md || !String(md).trim()) return;
  var text = String(md).trim();
  var found = null;
  (e.blocks || []).forEach(function (b) {
    if (found) return;
    if (b.key === key) found = b;
  });
  if (found) {
    if (!found.md || !String(found.md).trim()) found.md = text;
    if (!found.title) found.title = title;
    return;
  }
  e.blocks = e.blocks || [];
  e.blocks.push({ key: key, title: title, md: text });
}

function applyAutoAiToEntry(e, data) {
  var r = (data && data.result) || {};
  var skill = (data && data.skill && data.skill.id) || AI_SKILLS[e.subject] || '';
  var pitfalls = (r.pitfalls || []).map(function (p) { return '- ' + p; }).join('\n');
  fillAutoBlock(e, 'original', '题目', r.question || '');
  fillAutoBlock(e, 'standard', '考试标准解答', r.standardSolution || '');
  fillAutoBlock(e, 'analysis', '详细解析', r.detailedAnalysis || '');
  fillAutoBlock(e, 'answer', '答案', r.answer || '');
  fillAutoBlock(e, 'verification', '验证 / 验算', r.verification || '');
  fillAutoBlock(e, 'pitfalls', '易错点 / 卡点', pitfalls);
  if (e.subject === 'xijing') fillAutoBlock(e, 'figure', '图形与条件', r.verification || '');
  if (!e.points || !e.points.length) e.points = (r.points || []).slice(0, 4);
  if (!e.summary) e.summary = r.summary || '';
  if (!e.chapter) e.chapter = r.chapter || '';
  if (!e.chapterCode) e.chapterCode = r.chapterCode || '';
  if (!e.templateTitle) e.templateTitle = r.templateTitle || '';
  if (!e.stars) e.stars = normalizeStars(r.difficulty || 2);
  if (!e.variants || !e.variants.length) e.variants = (r.variants || []).slice();
  if (!e.errorTypes || !e.errorTypes.length) {
    e.errorTypes = (r.errorTypes || []).filter(function (t) { return errorTypesFor(e.subject).indexOf(t) >= 0; });
  }
  var notes = r.templateNotes || {};
  if (!e.templateNotes) e.templateNotes = { features: '', method: '', skeleton: '', pitfalls: '' };
  if (!e.templateNotes.features) e.templateNotes.features = notes.features || '';
  if (!e.templateNotes.method) e.templateNotes.method = notes.method || '';
  if (!e.templateNotes.skeleton) e.templateNotes.skeleton = notes.skeleton || '';
  if (!e.templateNotes.pitfalls) e.templateNotes.pitfalls = notes.pitfalls || '';
  var tag = 'AI 补全 · /' + skill;
  if (!e.source || e.source.indexOf(tag) < 0) e.source = (e.source ? e.source + ' · ' : '') + tag;
  e.aiStatus = 'done';
  e.aiAttempts = e.aiAttempts || 1;
  e.aiDoneAt = nowIso();
  e.aiGeneratedAt = nowIso();
  e.aiSkill = skill;
  e.aiModel = (data && data.model) || aiConfig().model || '';
  e.aiError = '';
  e.aiDueAt = 0;
  touchEntry(e);
}

function runAutoAi(e, transport) {
  autoAiBusy = true;
  var text = entryQuestionText(e);
  var hint = autoAiHint(e);
  if (!text) {
    e.aiStatus = 'failed';
    e.aiError = '缺少题目文字';
    autoAiBusy = false;
    markDirty();
    render();
    return;
  }
  e.aiStatus = 'generating';
  e.aiAttempts = (e.aiAttempts || 0) + 1;
  e.aiStartedAt = Date.now();
  e.aiError = '';
  touchEntry(e);
  markDirty();
  render();
  var controller = new AbortController();
  autoAiAbort = controller;
  var taskOn = typeof longTaskStart === 'function';
  if (taskOn) longTaskStart('auto-ai', {
    steps: ['整理题目', '请求 AI', '写入条目'],
    label: 'AI 自动补全',
    step: 0,
    percent: 0,
    valueText: '0%',
    stage: '正在整理 ' + e.code + ' 的题目与要点…',
    detail: '整理完成后会请求模型补全标准解答、详细解析与易错点。',
    onCancel: function () { autoAiCancel(e.id); }
  });
  var timer = setTimeout(function () { controller.abort(); }, 150000);
  var autoFields = typeof AI_ENTRY_FIELDS !== 'undefined' ? AI_ENTRY_FIELDS : ['summary', 'question', 'standardSolution', 'detailedAnalysis', 'answer', 'points', 'pitfalls'];
  var autoExpect = typeof AI_ENTRY_EXPECTED_CHARS !== 'undefined' ? AI_ENTRY_EXPECTED_CHARS : {};
  var autoPushAt = 0;
  var autoStream = {
    onPrepare: function (info) {
      if (taskOn) longTaskUpdate('auto-ai', { step: 0, percent: info.ready ? 6 : 3, valueText: info.ready ? '6%' : '3%', stage: info.stage || '正在准备模型请求…', detail: '正在解压技能包并匹配章节。' });
    },
    onFirstByte: function () {
      if (taskOn) longTaskUpdate('auto-ai', { step: 1, percent: 8, valueText: '8%', stage: '模型已开始返回，正在补全条目…', detail: '进度按实际收到的 JSON 字段推进。' });
    },
    onDelta: function (delta, fullText) {
      if (!taskOn || typeof aiProgressJsonFields !== 'function') return;
      var now = Date.now();
      if (now - autoPushAt < 140) return;
      autoPushAt = now;
      var info = aiProgressJsonFields(fullText, autoFields, autoExpect);
      var frac = aiProgressFieldsFraction(info);
      longTaskUpdate('auto-ai', {
        step: 1,
        percent: 8 + frac * 77,
        valueText: '已收到 ' + info.completed + ' / ' + autoFields.length + ' 字段',
        stage: info.currentKey ? '正在补全「' + ((typeof AI_ENTRY_FIELD_LABELS !== 'undefined' && AI_ENTRY_FIELD_LABELS[info.currentKey]) || info.currentKey) + '」…' : '模型已开始返回正文…',
        detail: '进度来自模型流式正文中的真实字段。'
      });
    }
  };
  autoAiCall(e, text, hint, controller.signal, autoStream).then(function (data) {
    clearTimeout(timer);
    autoAiAbort = null;
    if (taskOn) longTaskUpdate('auto-ai', { step: 2, percent: 90, valueText: '90%', stage: '正在写入条目…', detail: '模型已返回，正在保存标准解答与模板。' });
    applyAutoAiToEntry(e, data);
    autoAiBusy = false;
    markDirty();
    render();
    if (taskOn) longTaskFinish('auto-ai', { stage: '补全完成', detail: '已写入 ' + e.code + ' 的标准解答、解析与易错点。' });
    toast('AI 已补全 · ' + e.code + ' · /' + (data.skill && data.skill.id || ''));
    scheduleAutoAiScan();
  }).catch(function (err) {
    clearTimeout(timer);
    autoAiAbort = null;
    autoAiBusy = false;
    var now = Date.now();
    var code = (err && err.code) || '';
    if (err && err.name === 'AbortError') {
      e.aiStatus = 'queued';
      e.aiDueAt = now + 5000;
      e.aiError = '已取消，稍后可重试';
    } else if (code === 'NO_AI_KEY' || code === 'NO_DSH_TOKEN' || code === 'UPSTREAM_AUTH' || (!aiConfigReady() && transport === 'server' && (code === 'SOLVE_FAILED' || code === 'NETWORK'))) {
      e.aiStatus = 'waiting-token';
      e.aiDueAt = now + 60000;
      e.aiError = '需要有效的 AI 模型服务配置';
    } else if ((e.aiAttempts || 0) >= AUTO_AI_MAX_ATTEMPTS || (e.aiDeadline && now > e.aiDeadline)) {
      e.aiStatus = 'failed';
      e.aiError = (err && err.message) || '自动补全失败';
    } else {
      e.aiStatus = 'queued';
      e.aiDueAt = Math.min(now + Math.min(60000 * (e.aiAttempts || 1), 300000), e.aiDeadline || now + 300000);
      e.aiError = (err && err.message) || '自动补全失败，稍后重试';
    }
    touchEntry(e);
    markDirty();
    render();
    if (taskOn) {
      if (err && err.name === 'AbortError') longTaskRemove('auto-ai');
      else longTaskFail('auto-ai', (err && err.message) || '自动补全没有完成，条目已保留并在队列中等待重试。');
    }
    scheduleAutoAiScan();
  });
}

function autoAiNow(entryId) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) return;
  queueAutoAi(e, { force: true, delayMs: 0 });
  scanAutoAi();
}

function autoAiRetry(entryId) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) return;
  e.aiStatus = 'queued';
  e.aiAttempts = 0;
  e.aiDueAt = Date.now();
  e.aiDeadline = Date.now() + AUTO_AI_DEADLINE_MS;
  e.aiError = '';
  touchEntry(e);
  markDirty();
  render();
  scanAutoAi();
}

function autoAiSkip(entryId) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) return;
  e.aiStatus = 'skipped';
  e.aiError = '';
  touchEntry(e);
  markDirty();
  render();
  toast('已跳过自动补全');
}

function autoAiCancel(entryId) {
  if (autoAiAbort) autoAiAbort.abort();
  toast('已取消，本轮仍保留队列');
}

function autoAiKick() {
  var changed = false;
  SUBJECTS.forEach(function (s) {
    entriesOf(s.id).forEach(function (e) {
      if (e.aiStatus === 'waiting-token') {
        e.aiStatus = 'queued';
        e.aiDueAt = Date.now();
        e.aiError = '';
        changed = true;
      }
    });
  });
  if (changed) markDirty();
  render();
  scanAutoAi();
}

function autoAiPendingCount() {
  var n = 0;
  SUBJECTS.forEach(function (s) {
    entriesOf(s.id).forEach(function (e) {
      if (e.aiStatus === 'queued' || e.aiStatus === 'waiting-token' || e.aiStatus === 'generating') n++;
    });
  });
  return n;
}
