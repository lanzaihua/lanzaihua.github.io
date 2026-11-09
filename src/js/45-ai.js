
/* =========================================================
   45-ai — 智能录入（文字 / 拍照 / 图片识别）
   ========================================================= */
var AI_SKILLS = { gaodai: 'advanced-algebra', shufen: 'mathematical-analysis', jieji: 'analytic-geometry', xijing: 'western-economics' };

var aiState = {
  subject: 'gaodai',
  text: '',
  hint: '',
  images: [],
  wrongOn: false,
  wrongText: '',
  wrongImages: [],
  result: null,
  abort: null,
  busy: false,
  stageTimer: null,
  stageIndex: 0,
  statusChecked: false,
  transport: 'server',
  savedEntryId: null,
  savedCode: '',
  autoSaved: false,
  statusNote: '正在检查 AI 服务…'
};

var AI_DEFER_KEY = 'sanke-ai-defer-v1';
var AI_THINKING_KEY = 'sanke-ai-thinking-v1';
var AI_THINKING_EFFORTS = [
  { id: 'low', label: '低' },
  { id: 'medium', label: '中' },
  { id: 'high', label: '高' },
  { id: 'max', label: '极高' }
];

function aiThinkingConfig() {
  var cfg = { enabled: true, effort: 'high' };
  try {
    var raw = localStorage.getItem(AI_THINKING_KEY);
    var saved = raw ? JSON.parse(raw) : null;
    if (saved && typeof saved === 'object') {
      if (typeof saved.enabled === 'boolean') cfg.enabled = saved.enabled;
      if (AI_THINKING_EFFORTS.some(function (x) { return x.id === saved.effort; })) cfg.effort = saved.effort;
    }
  } catch (e) { /* noop */ }
  return cfg;
}

function aiSaveThinking(patch) {
  var cfg = aiThinkingConfig();
  if (patch && typeof patch.enabled === 'boolean') cfg.enabled = patch.enabled;
  if (patch && AI_THINKING_EFFORTS.some(function (x) { return x.id === patch.effort; })) cfg.effort = patch.effort;
  try { localStorage.setItem(AI_THINKING_KEY, JSON.stringify(cfg)); } catch (e) { /* noop */ }
  return cfg;
}

function aiSyncThinkingControls() {
  var cfg = aiThinkingConfig();
  ['#aiThinkingToggle', '#settingsThinkingToggle'].forEach(function (sel) {
    var el = qs(sel);
    if (el) el.checked = !!cfg.enabled;
  });
  ['#aiThinkingState', '#settingsThinkingState'].forEach(function (sel) {
    var el = qs(sel);
    if (el) el.textContent = cfg.enabled ? '已开启' : '已关闭';
  });
  ['#aiThinkingEffort', '#settingsThinkingEffort'].forEach(function (sel) {
    var el = qs(sel);
    if (el) { el.value = cfg.effort; el.disabled = !cfg.enabled; }
  });
  var note = qs('#aiThinkingNote');
  if (note) note.textContent = cfg.enabled ? '开启后先推理再作答' : '关闭后直接作答';
  var row = qs('#aiThinkingRow');
  if (row) row.classList.toggle('is-off', !cfg.enabled);
  var srow = qs('#settingsThinkingRow');
  if (srow) srow.classList.toggle('is-off', !cfg.enabled);
}

function aiIsDeepSeek() {
  var cfg = aiConfig();
  return cfg.protocol === 'deepseek' || cfg.protocol === 'dsh' || /deepseek/i.test(cfg.baseUrl || '') || /deepseek/i.test(cfg.model || '');
}

function aiBeijingNow() {
  var now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600000);
}

var AI_CN_HOLIDAYS = {
  2026: [
    '2026-01-01', '2026-01-02', '2026-01-03',
    '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
    '2026-04-04', '2026-04-05', '2026-04-06',
    '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
    '2026-06-19', '2026-06-20', '2026-06-21',
    '2026-09-25', '2026-09-26', '2026-09-27',
    '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'
  ],
  // 依据《国务院办公厅关于2027年部分节假日安排的通知》（国办发明电〔2026〕10号）。
  2027: [
    '2027-01-01', '2027-01-02', '2027-01-03',
    '2027-02-05', '2027-02-06', '2027-02-07', '2027-02-08', '2027-02-09', '2027-02-10', '2027-02-11', '2027-02-12', '2027-02-13',
    '2027-04-03', '2027-04-04', '2027-04-05',
    '2027-05-01', '2027-05-02', '2027-05-03', '2027-05-04', '2027-05-05',
    '2027-06-09',
    '2027-09-15',
    '2027-10-01', '2027-10-02', '2027-10-03', '2027-10-04', '2027-10-05', '2027-10-06', '2027-10-07'
  ]
};

// 调休上班的周末按工作日处理，否则会把 2027-02-14 这类补班日误判成谷时。
var AI_CN_MAKEUP_WORKDAYS = {
  2026: [],
  2027: ['2027-01-31', '2027-02-14', '2027-05-08', '2027-09-26', '2027-10-09']
};

// 只有内置了完整放假与调休表的年份才能当作“已知日历”；其余年份才用固定日期兜底。
var AI_CN_HOLIDAY_KNOWN_YEARS = { 2026: true, 2027: true };
var AI_CN_FIXED_HOLIDAY_RANGES = [
  { month: 1, days: [1, 2, 3] },
  { month: 4, days: [4, 5, 6] },
  { month: 5, days: [1, 2, 3, 4, 5] },
  { month: 10, days: [1, 2, 3, 4, 5, 6, 7] }
];

function aiBeijingDateKey(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2);
}

function aiCnCalendarKnown(year) {
  return !!AI_CN_HOLIDAY_KNOWN_YEARS[year];
}

function aiIsCnMakeupWorkday(d) {
  var list = AI_CN_MAKEUP_WORKDAYS[d.getFullYear()];
  return !!list && list.indexOf(aiBeijingDateKey(d)) >= 0;
}

function aiIsCnHoliday(d) {
  var year = d.getFullYear();
  var list = AI_CN_HOLIDAYS[year];
  if (list) return list.indexOf(aiBeijingDateKey(d)) >= 0;
  var month = d.getMonth() + 1, day = d.getDate();
  return AI_CN_FIXED_HOLIDAY_RANGES.some(function (r) {
    return r.month === month && r.days.indexOf(day) >= 0;
  });
}

function aiPeakStateAt(d) {
  var day = d.getDay();
  var mins = d.getHours() * 60 + d.getMinutes();
  var weekend = day === 0 || day === 6;
  if (aiIsCnHoliday(d)) return false;
  if (weekend && !aiIsCnMakeupWorkday(d)) return false;
  return (mins >= 540 && mins < 720) || (mins >= 840 && mins < 1080);
}

function aiOffDayKind(d) {
  if (aiIsCnHoliday(d)) return 'holiday';
  if (aiIsCnMakeupWorkday(d)) return '';
  var day = d.getDay();
  return (day === 0 || day === 6) ? 'weekend' : '';
}

function aiOffDayLabel(kind) {
  return kind === 'holiday' ? '节假日' : (kind === 'weekend' ? '周末' : '');
}

function aiIsFullOffDay(d) {
  return !!aiOffDayKind(d);
}

function aiPeakInfo() {
  var bj = aiBeijingNow();
  var peak = aiPeakStateAt(bj);
  var next = null;
  var remainMin = 0;
  for (var i = 1; i <= 8 * 24 * 60; i++) {
    var d = new Date(bj.getTime() + i * 60000);
    if (aiPeakStateAt(d) !== peak) { next = d; remainMin = i; break; }
  }
  var h = Math.floor(remainMin / 60);
  var m = remainMin % 60;
  var remain = h ? h + ' 小时' + (m ? ' ' + m + ' 分钟' : '') : m + ' 分钟';
  var weekday = next ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][next.getDay()] : '';
  var nextDay = next && aiBeijingDateKey(next) !== aiBeijingDateKey(bj) ? weekday + ' ' : '';
  return {
    off: !peak,
    fullOff: aiIsFullOffDay(bj),
    offDayKind: aiOffDayKind(bj),
    remain: remain,
    clock: pad(bj.getHours(), 2) + ':' + pad(bj.getMinutes(), 2),
    label: peak ? '距谷时开始' : '距峰时开始',
    nextAt: next ? nextDay + pad(next.getHours(), 2) + ':' + pad(next.getMinutes(), 2) : '',
    calendarKnown: aiCnCalendarKnown(bj.getFullYear()),
    calendarYear: bj.getFullYear()
  };
}

function aiDeferRead() {
  try {
    var raw = localStorage.getItem(AI_DEFER_KEY);
    var list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(function (x) { return x && x.id; }) : [];
  } catch (e) { return []; }
}

function aiDeferWrite(list) {
  try {
    localStorage.setItem(AI_DEFER_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

function aiDeferCount() { return aiDeferRead().length; }

function aiDeferAdd() {
  var ta = qs('#aiText');
  if (ta) aiState.text = ta.value;
  var hint = qs('#aiHint');
  if (hint) aiState.hint = hint.value;
  var wrongToggle = qs('#aiWrongToggle');
  if (wrongToggle) aiState.wrongOn = !!wrongToggle.checked;
  var wrongText = qs('#aiWrongText');
  if (wrongText) aiState.wrongText = wrongText.value;
  if (!aiState.text.trim() && !aiState.images.length) { toast('先写题目文字或加入图片，再暂存'); return; }
  var list = aiDeferRead();
  if (list.length >= 8) { toast('暂存箱最多 8 条，请先生成或删除一条'); return; }
  var item = {
    id: 'defer-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
    createdAt: nowIso(),
    subject: aiState.subject,
    text: aiState.text,
    hint: aiState.hint,
    images: deepClone(aiState.images),
    wrongOn: !!aiState.wrongOn,
    wrongText: aiState.wrongText,
    wrongImages: deepClone(aiState.wrongImages)
  };
  list.unshift(item);
  if (!aiDeferWrite(list)) { toast('暂存失败：本机存储空间不足，请减少图片'); return; }
  var dlg = qs('#aiDialog');
  if (dlg) dlg.close();
  toast('已暂存，到谷时再生成');
  openAiDeferDialog();
}

function aiDeferRemove(id, silent) {
  var list = aiDeferRead().filter(function (x) { return x.id !== id; });
  aiDeferWrite(list);
  if (!silent) {
    renderAiDeferDialog();
    toast('已删除暂存');
  }
}

function aiDeferOpen(id) {
  var item = aiDeferRead().filter(function (x) { return x.id === id; })[0];
  if (!item) { toast('这条暂存已经不存在了'); return; }
  var dialog = qs('#aiDeferDialog');
  if (dialog) dialog.close();
  openAiDialog(item.subject, item);
  toast('已送入智能录入；到谷时再点生成');
}

function aiPeakNoticeHtml() {
  if (!aiIsDeepSeek()) return '';
  var info = aiPeakInfo();
  var count = aiDeferCount();
  return '<div class="ai-peak ' + (info.off ? 'is-off' : 'is-peak') + '">' +
    '<div class="ai-peak-main">' +
      '<div class="ai-peak-head">' +
        '<span class="ai-peak-kicker">DeepSeek 峰谷计价</span>' +
        '<span class="ai-peak-state">' + (info.off ? '谷时' : '峰时') + '</span>' +
        '<span class="ai-peak-clock">北京时间 ' + info.clock + '</span>' +
      '</div>' +
      '<p>' + (info.fullOff
        ? '今天是' + aiOffDayLabel(info.offDayKind) + '，全天按谷时计价。'
        : (info.off ? '当前谷时，' : '当前峰时，') + info.label + '约 ' + info.remain + '。') +
        '价格与折扣以 DeepSeek 官方页面为准。</p>' +
      '<p class="ai-peak-meta">高峰：工作日 09:00–12:00 / 14:00–18:00 · 周末与法定节假日全天谷时 · 调休上班日按工作日计 · 谷时价为峰时一半。</p>' +
      (info.calendarKnown ? '' : '<p class="ai-peak-meta ai-peak-warn">' + info.calendarYear + ' 年节假日日历尚未内置，目前只按元旦、清明、劳动节、国庆的固定日期估算；春节等调休日期可能判断不准。</p>') +
    '</div>' +
    '<div class="ai-peak-actions">' +
      '<button class="btn btn-xs btn-primary" data-act="ai-defer" type="button">暂存题目</button>' +
      '<button class="btn btn-xs btn-ghost" data-act="open-ai-defer" type="button">暂存箱' + (count ? ' ' + count : '') + '</button>' +
    '</div>' +
  '</div>';
}

function aiDeferTimelineHtml(info) {
  var bits = String(info.clock || '00:00').split(':');
  var mins = (parseInt(bits[0], 10) || 0) * 60 + (parseInt(bits[1], 10) || 0);
  var pct = Math.max(0, Math.min(100, (mins / 1440) * 100)).toFixed(2);
  var ticks = [0, 6, 12, 18, 24].map(function (h) {
    return '<span class="ai-defer-tick" style="left:' + (h / 24 * 100) + '%">' + (h < 10 ? '0' + h : h) + '</span>';
  }).join('');
  var fullOff = info.fullOff;
  return '<div class="ai-defer-timeline' + (fullOff ? ' is-off-day' : '') + '" aria-label="' + (fullOff ? aiOffDayLabel(info.offDayKind) + '，北京时间全天谷时' : '北京时间 24 小时峰谷时段') + '">' +
    '<div class="ai-defer-track">' +
      (fullOff ? '' : '<span class="ai-defer-peak" style="left:37.5%;width:12.5%"></span><span class="ai-defer-peak" style="left:58.33%;width:16.67%"></span>') +
      '<span class="ai-defer-now" style="left:' + pct + '%"><i></i></span>' +
    '</div>' +
    '<div class="ai-defer-axis">' + ticks + '</div>' +
    '<div class="ai-defer-legend">' +
      (fullOff
        ? '<span class="is-current"><i class="is-off"></i>今天' + aiOffDayLabel(info.offDayKind) + ' · 全天谷时</span><span class="is-muted"><i class="is-peak is-muted"></i>工作日 09–12 / 14–18 才进入峰时</span>'
        : '<span><i class="is-peak"></i>工作日 09–12 / 14–18 峰时</span><span><i class="is-off"></i>周末与法定节假日全天谷时</span>') +
    '</div>' +
  '</div>';
}

function aiDeferIntroHtml(list) {
  var info = aiPeakInfo();
  var count = list.length;
  return '<div class="ai-defer-intro ' + (info.off ? 'is-off' : 'is-peak') + (info.fullOff ? ' is-off-day' : '') + '">' +
    '<div class="ai-defer-status">' +
      '<div class="ai-defer-status-head">' +
        '<span class="ai-defer-dot" aria-hidden="true"></span>' +
        '<span class="ai-defer-state">' + (info.off ? '当前谷时' : '当前峰时') + '</span>' +
        '<span class="ai-defer-kicker">北京时间 ' + esc(info.clock) + '</span>' +
        '<span class="ai-defer-count"><b>' + count + '</b> 条待生成</span>' +
      '</div>' +
      '<p class="ai-defer-lead">' + (info.fullOff ? '今天是' + aiOffDayLabel(info.offDayKind) + '，全天按谷时计价。' : (info.off ? '谷时生成价约为峰时一半。' : '峰时生成会按峰时价计费。')) +
        '<b>' + esc(info.label) + '约 ' + esc(info.remain) + '</b></p>' +
    '</div>' +
    aiDeferTimelineHtml(info) +
    '<p class="ai-defer-note">暂存只保存在本机浏览器，不会提前调用 API。</p>' +
    (info.calendarKnown ? '' : '<p class="ai-defer-note ai-peak-warn">' + info.calendarYear + ' 年节假日日历尚未内置，峰谷判断按固定日期估算，春节等调休可能不准。</p>') +
  '</div>';
}

function aiDeferDialogHtml() {
  var list = aiDeferRead();
  var intro = aiDeferIntroHtml(list);
  if (!list.length) {
    return intro + '<div class="ai-defer-empty">' +
      '<div class="ai-defer-empty-mark" aria-hidden="true">' +
        '<span class="ai-defer-sheet is-back"></span><span class="ai-defer-sheet is-mid"></span>' +
        '<span class="ai-defer-sheet is-front"><b>0</b><small>条暂存</small></span>' +
      '</div>' +
      '<div class="ai-defer-empty-copy">' +
        '<span class="ai-defer-empty-kicker">QUEUE / EMPTY</span>' +
        '<h3>暂存箱是空的</h3>' +
        '<p>在「智能录入」里写好题目或放好图片，点「暂存题目」就会放到这里。</p>' +
        '<div class="ai-defer-empty-actions"><button class="btn btn-primary" data-act="open-ai-from-defer-empty" type="button">打开智能录入</button>' +
          '<span class="ai-defer-empty-hint">不调用 API · 只存本机</span></div>' +
      '</div>' +
    '</div>';
  }
  var cards = list.map(function (item, i) {
    var s = subjectOf(item.subject);
    var images = Array.isArray(item.images) ? item.images : [];
    var text = String(item.text || '').trim();
    var hint = String(item.hint || '').trim();
    var preview = '';
    var bodyText = text || hint || '';
    function textPreviewHtml() {
      if (!bodyText) return '';
      var canExpand = bodyText.length > 50;
      return '<div class="ai-defer-text-wrap' + (canExpand ? ' is-clamped' : '') + '">' +
        '<p class="ai-defer-text" id="ai-defer-text-' + attr(item.id) + '">' + esc(bodyText) + '</p>' +
        (canExpand ? '<button class="ai-defer-expand" data-act="ai-defer-expand" data-target="ai-defer-text-' + attr(item.id) + '" aria-expanded="false" type="button">展开全文</button>' : '') +
        '</div>';
    }
    if (images.length) {
      var first = images[0] || {};
      var src = first.preview || (first.data ? 'data:' + (first.mediaType || 'image/jpeg') + ';base64,' + first.data : '');
      preview = '<button class="ai-defer-thumb" data-act="ai-defer-image" data-id="' + attr(item.id) + '" data-index="0" type="button" aria-label="查看题目图片">' +
        (src ? '<img src="' + attr(src) + '" alt="' + attr('题目图片 ' + (i + 1)) + '">' : '') +
        '<span class="ai-defer-thumb-hint">查看大图</span>' +
        (images.length > 1 ? '<span class="ai-defer-thumb-count">' + images.length + ' 张</span>' : '') +
        '</button>' + textPreviewHtml();
    } else {
      preview = textPreviewHtml();
    }
    return '<article class="ai-defer-card" style="--subj:var(--' + attr(s.id) + ')">' +
      '<div class="ai-defer-card-head"><span class="ai-defer-index">' + pad(i + 1, 2) + '</span>' +
        '<span class="chip chip-subj">' + esc(s.name) + '</span>' +
        '<span class="ai-defer-card-time">' + esc(formatDate(item.createdAt || '')) + '</span></div>' +
      preview +
      (images.length || item.wrongOn ? '<div class="ai-defer-meta">' +
        (images.length ? '<span>' + images.length + ' 张题目图</span>' : '') +
        (item.wrongOn ? '<span>' + (item.wrongImages ? item.wrongImages.length : 0) + ' 张错解图</span>' : '') + '</div>' : '') +
      '<div class="ai-defer-actions">' +
        '<button class="btn btn-xs btn-primary" data-act="ai-defer-open" data-id="' + attr(item.id) + '" type="button">送入智能录入</button>' +
        '<button class="btn btn-xs btn-ghost" data-act="ai-defer-remove" data-id="' + attr(item.id) + '" type="button">删除</button>' +
      '</div>' +
    '</article>';
  }).join('');
  return intro + '<div class="ai-defer-list">' + cards + '</div>';
}

function renderAiDeferDialog() {
  var body = qs('#aiDeferBody');
  if (!body) return;
  var dialog = qs('#aiDeferDialog');
  if (dialog) dialog.classList.toggle('is-empty', !aiDeferRead().length);
  body.innerHTML = aiDeferDialogHtml();
}

var aiDeferLightbox = { itemId: '', images: null, title: '题目图片', index: 0 };

function aiDeferImageSrc(im) {
  if (!im) return '';
  return im.preview || (im.data ? 'data:' + (im.mediaType || 'image/jpeg') + ';base64,' + im.data : '');
}

function aiDeferEnsureLightbox() {
  var dlg = qs('#aiDeferImageDialog');
  if (dlg) return dlg;
  dlg = document.createElement('dialog');
  dlg.id = 'aiDeferImageDialog';
  dlg.className = 'image-lightbox';
  dlg.setAttribute('aria-label', '查看图片');
  dlg.innerHTML =
    '<div class="image-lightbox-frame">' +
      '<div class="image-lightbox-head"><span class="image-lightbox-title" id="aiDeferLightboxTitle">题目图片</span>' +
        '<button class="image-lightbox-close" data-act="ai-defer-image-close" type="button" aria-label="关闭大图">×</button></div>' +
      '<div class="image-lightbox-stage">' +
        '<button class="image-lightbox-nav is-prev" data-act="ai-defer-image-prev" type="button" aria-label="上一张">‹</button>' +
        '<img id="aiDeferLightboxImg" alt="题目图片">' +
        '<button class="image-lightbox-nav is-next" data-act="ai-defer-image-next" type="button" aria-label="下一张">›</button>' +
      '</div>' +
    '</div>';
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) closeAiDeferLightbox();
  });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepAiDeferLightbox(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stepAiDeferLightbox(1); }
  });
  document.body.appendChild(dlg);
  return dlg;
}

function aiDeferLightboxImages() {
  if (Array.isArray(aiDeferLightbox.images)) return aiDeferLightbox.images;
  var item = aiDeferRead().filter(function (x) { return x.id === aiDeferLightbox.itemId; })[0] || null;
  return item && Array.isArray(item.images) ? item.images : [];
}

function renderAiDeferLightbox() {
  var images = aiDeferLightboxImages();
  if (!images.length) return;
  var total = images.length;
  var index = Math.max(0, Math.min(total - 1, aiDeferLightbox.index));
  aiDeferLightbox.index = index;
  var img = qs('#aiDeferLightboxImg');
  if (img) {
    img.src = aiDeferImageSrc(images[index]);
    img.alt = aiDeferLightbox.title + ' ' + (index + 1);
  }
  var title = qs('#aiDeferLightboxTitle');
  if (title) title.textContent = total > 1 ? aiDeferLightbox.title + ' · ' + (index + 1) + ' / ' + total : aiDeferLightbox.title;
  var prev = qs('[data-act="ai-defer-image-prev"]');
  var next = qs('[data-act="ai-defer-image-next"]');
  if (prev) prev.hidden = total <= 1;
  if (next) next.hidden = total <= 1;
}

function openAiImageLightbox(images, index, title) {
  aiDeferLightbox.itemId = '';
  aiDeferLightbox.images = Array.isArray(images) ? images : [];
  aiDeferLightbox.title = title || '题目图片';
  aiDeferLightbox.index = Math.max(0, parseInt(index, 10) || 0);
  var dlg = aiDeferEnsureLightbox();
  renderAiDeferLightbox();
  if (!dlg.open) dlg.showModal();
}

function openAiDeferImage(id, index) {
  aiDeferLightbox.itemId = String(id || '');
  aiDeferLightbox.images = null;
  aiDeferLightbox.title = '题目图片';
  aiDeferLightbox.index = Math.max(0, parseInt(index, 10) || 0);
  var dlg = aiDeferEnsureLightbox();
  renderAiDeferLightbox();
  if (!dlg.open) dlg.showModal();
}

function openAiFormImage(wrong, index) {
  var images = wrong ? aiState.wrongImages : aiState.images;
  openAiImageLightbox(images, index, wrong ? '错解图片' : '题目图片');
}

function stepAiDeferLightbox(delta) {
  var images = aiDeferLightboxImages();
  if (images.length < 2) return;
  aiDeferLightbox.index = (aiDeferLightbox.index + delta + images.length) % images.length;
  renderAiDeferLightbox();
}

function closeAiDeferLightbox() {
  var dlg = qs('#aiDeferImageDialog');
  if (dlg && dlg.open) dlg.close();
}

function toggleAiDeferText(btn) {
  var targetId = btn.getAttribute('data-target');
  var wrap = btn.closest('.ai-defer-text-wrap');
  if (!wrap) return;
  var expanded = wrap.classList.toggle('is-expanded');
  btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  btn.textContent = expanded ? '收起' : '展开全文';
  var text = targetId ? qs('#' + targetId) : wrap.querySelector('.ai-defer-text');
  if (text) text.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function openAiDeferDialog() {
  renderAiDeferDialog();
  var dlg = qs('#aiDeferDialog');
  if (dlg && !dlg.open) dlg.showModal();
}

function openAiDialog(subjectId, prefill) {
  var s = subjectOf(subjectId || state.activeSubject);
  aiState = {
    subject: s.id,
    text: prefill ? String(prefill.text || '') : '',
    hint: prefill ? String(prefill.hint || '') : '',
    images: prefill && Array.isArray(prefill.images) ? deepClone(prefill.images) : [],
    wrongOn: !!(prefill && prefill.wrongOn),
    wrongText: prefill ? String(prefill.wrongText || '') : '',
    wrongImages: prefill && Array.isArray(prefill.wrongImages) ? deepClone(prefill.wrongImages) : [],
    deferId: prefill ? String(prefill.id || '') : '',
    result: null,
    abort: null,
    busy: false,
    stageTimer: null,
    stageIndex: 0,
    statusChecked: false,
    transport: (PAGES || !/^https?:$/.test(location.protocol)) ? 'direct' : 'server',
    savedEntryId: null,
    savedCode: '',
    autoSaved: false,
    statusNote: '正在检查 AI 服务…'
  };
  var dlg = qs('#aiDialog');
  if (!dlg) return;
  qs('#aiTitle').textContent = '智能录入 · ' + s.name;
  renderAiForm();
  dlg.showModal();
  checkAiStatus();
}

function renderAiForm() {
  var s = subjectOf(aiState.subject);
  var body = qs('#aiBody');
  if (!body) return;
  var think = aiThinkingConfig();
  var thumbs = aiState.images.map(function (im, i) {
    return '<div class="ai-thumb"><button class="ai-thumb-open" data-act="ai-image" data-index="' + i + '" type="button" aria-label="查看完整题目图片 ' + (i + 1) + '"><img src="' + attr(im.preview) + '" alt="题目图片 ' + (i + 1) + '"></button>' +
      '<button class="rm" data-act="ai-remove-image" data-index="' + i + '" type="button" aria-label="移除这张图片">×</button></div>';
  }).join('');

  var skillId = AI_SKILLS[aiState.subject] || '';
  var peakNotice = aiPeakNoticeHtml();
  body.innerHTML = '' +
    '<form class="ai-form" id="aiForm" novalidate>' +
      '<div class="ai-skillbar">' +
        '<span class="lbl">生成技能</span>' +
        '<select id="aiSubject" class="select" aria-label="选择生成技能">' +
          SUBJECTS.map(function (x) {
            return '<option value="' + x.id + '"' + (x.id === aiState.subject ? ' selected' : '') + '>' + esc(x.name) + ' · /' + AI_SKILLS[x.id] + '</option>';
          }).join('') +
        '</select>' +
        '<span class="chip mono" id="aiSkillChip">/' + esc(skillId) + '</span>' +
        '<span class="faint" style="font-size:10.5px">按错题科目强制使用对应技能</span>' +
      '</div>' +
      '<div class="ai-thinking-row' + (think.enabled ? '' : ' is-off') + '" id="aiThinkingRow">' +
        '<span class="lbl">思考模式</span>' +
        '<label class="ai-thinking-toggle"><input type="checkbox" id="aiThinkingToggle"' + (think.enabled ? ' checked' : '') + '> <span id="aiThinkingState">' + (think.enabled ? '已开启' : '已关闭') + '</span></label>' +
        '<label class="ai-thinking-effort">强度<select id="aiThinkingEffort" class="select"' + (think.enabled ? '' : ' disabled') + '>' +
          AI_THINKING_EFFORTS.map(function (x) { return '<option value="' + x.id + '"' + (x.id === think.effort ? ' selected' : '') + '>' + x.label + '</option>'; }).join('') +
        '</select></label>' +
        '<span class="ai-thinking-note" id="aiThinkingNote">' + (think.enabled ? '开启后先推理再作答' : '关闭后直接作答') + '</span>' +
      '</div>' +
      '<div class="field">' +
        '<label for="aiText">题目文字</label>' +
        '<textarea class="ai-textarea" id="aiText" placeholder="把题目粘在这里。公式可以用 LaTeX（如 $a_{n+1}=c/2+a_n^2/2$），也可以先用中文描述。">' + esc(aiState.text) + '</textarea>' +
        '<span class="hint">可以只给文字，也可以只给图片，或者两者都给。</span>' +
      '</div>' +
      '<div class="field">' +
        '<label>题目图片</label>' +
        '<div class="ai-dropzone" id="aiDropzone">' +
          '<span class="dz-title">添加题目图片</span>' +
          '<span class="dz-note" id="aiImportNote">拍照，或从系统相册 / 微信保存的图片中选择；最多 3 张。也可以粘贴或拖到这里。</span>' +
          '<span class="ai-pick-actions">' +
            '<label class="btn btn-ghost" for="aiCamera" id="aiCameraPick">拍照</label>' +
            '<label class="btn btn-ghost" for="aiGallery" id="aiGalleryPick">从微信 / 相册选择</label>' +
          '</span>' +
          '<input type="file" id="aiCamera" accept="image/*,.heic,.heif" capture="environment">' +
          '<input type="file" id="aiGallery" accept="image/*,.heic,.heif" multiple>' +
          '<details class="ai-import-help" id="aiImportHelp" hidden><summary>微信里选不到图片？</summary><p>先把微信里的题目图片保存到手机相册，再点「从微信相册选择」；如果还是弹不出相册，点右上角「···」→「在浏览器打开」后再导入。</p></details>' +
        '</div>' +
        (thumbs ? '<div class="ai-thumbs" id="aiThumbs">' + thumbs + '</div>' : '') +
      '</div>' +
      '<div class="ai-wrong">' +
        '<label class="ai-wrong-toggle"><input type="checkbox" id="aiWrongToggle"' + (aiState.wrongOn ? ' checked' : '') + '> <span>添加我的错解，让 AI 找出错因和卡点</span><em>可选</em></label>' +
        '<div class="ai-wrong-body" id="aiWrongBody"' + (aiState.wrongOn ? '' : ' hidden') + '>' +
          '<textarea class="ai-textarea ai-wrong-text" id="aiWrongText" placeholder="写下你的解法、错在哪一步，或卡住的地方。也可以只上传错解图片。">' + esc(aiState.wrongText) + '</textarea>' +
          '<div class="ai-wrong-actions">' +
            '<label class="btn btn-ghost" for="aiWrongCamera">拍错解</label>' +
            '<label class="btn btn-ghost" for="aiWrongGallery">上传错解图片</label>' +
            '<input type="file" id="aiWrongCamera" accept="image/*,.heic,.heif" capture="environment">' +
            '<input type="file" id="aiWrongGallery" accept="image/*,.heic,.heif" multiple>' +
            '<span class="ai-wrong-note">最多 3 张；AI 会先找错因，再给标准解答。</span>' +
          '</div>' +
          (aiState.wrongImages.length ? '<div class="ai-thumbs ai-wrong-thumbs">' + aiState.wrongImages.map(function (im, i) {
            return '<div class="ai-thumb"><button class="ai-thumb-open" data-act="ai-wrong-image" data-index="' + i + '" type="button" aria-label="查看完整错解图片 ' + (i + 1) + '"><img src="' + attr(im.preview) + '" alt="错解图片 ' + (i + 1) + '"></button>' +
              '<button class="rm" data-act="ai-remove-wrong-image" data-index="' + i + '" type="button" aria-label="移除这张错解图片">×</button></div>';
          }).join('') + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="ai-hintrow">' +
        '<div class="field"><label for="aiHint">章节 / 知识点提示（可选）</label>' +
          '<input id="aiHint" value="' + attr(aiState.hint) + '" placeholder="例如：高等代数 第三章 线性相关性">' +
        '</div>' +
      '</div>' +
      '<p class="ai-note">' + (aiState.transport === 'direct' ? '当前是<b>在线直连 AI 服务</b>：API Key 只存在本机浏览器，请求直接发到你配置的接口；不经过本页面的作者服务器。' : '生成会调用本机 server 配置的 AI 服务。') + '按<b>考试标准解答 → 详细解析 → 答案 → 模板要点 → 变式</b>整理，思考模式通常 20–90 秒；完成后自动记入错题本并标好日期与知识要点。<span id="aiStatusNote">' + esc(aiState.statusNote) + '</span>' +
        (aiState.transport === 'direct' && !aiConfigReady() ? '<br><button class="linkish" data-act="open-settings" type="button">去设置配置 AI 模型服务</button>' : '') + '</p>' +
      peakNotice +
      '<div class="ai-submit-row">' +
        '<button class="btn" type="button" data-act="close-dialog" data-dialog="aiDialog">取消</button>' +
        '<button class="btn btn-primary" type="button" data-act="ai-submit">生成并自动入库</button>' +
      '</div>' +
    '</form>' +
    '<div class="ai-note" style="margin-top:12px">科目：' + esc(s.name) + '。也可以先去「设置与同步」确认访问口令；公网访问时必须带口令。</div>';

  bindAiForm();
  updateAiStatusNote();
}

function bindAiForm() {
  var isWechat = /MicroMessenger/i.test(navigator.userAgent || '');
  if (isWechat) {
    var galleryPick = qs('#aiGalleryPick');
    var importNote = qs('#aiImportNote');
    var importHelp = qs('#aiImportHelp');
    if (galleryPick) galleryPick.textContent = '从微信相册选择';
    if (importNote) importNote.textContent = '微信里请先把题目图片保存到手机相册，再点「从微信相册选择」；最多 3 张。';
    if (importHelp) importHelp.hidden = false;
  }
  var drop = qs('#aiDropzone');
  ['aiCamera', 'aiGallery'].forEach(function (id) {
    var input = qs('#' + id);
    if (input) {
      input.addEventListener('change', function () {
        aiAddFiles(input.files);
        input.value = '';
      });
    }
  });
  if (drop) {
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) aiAddFiles(e.dataTransfer.files);
    });
  }
  var wrongToggle = qs('#aiWrongToggle');
  if (wrongToggle) {
    wrongToggle.addEventListener('change', function () {
      aiState.wrongOn = !!wrongToggle.checked;
      var body = qs('#aiWrongBody');
      if (body) body.hidden = !wrongToggle.checked;
    });
  }
  var wrongText = qs('#aiWrongText');
  if (wrongText) {
    wrongText.addEventListener('input', function () { aiState.wrongText = wrongText.value; });
    wrongText.addEventListener('paste', function (e) {
      var items = (e.clipboardData && e.clipboardData.items) || [];
      var files = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && /^image\//.test(items[i].type)) {
          var f = items[i].getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) { e.preventDefault(); aiAddWrongImages(files); }
    });
  }
  ['aiWrongCamera', 'aiWrongGallery'].forEach(function (id) {
    var input = qs('#' + id);
    if (input) input.addEventListener('change', function () {
      aiAddWrongImages(input.files);
      input.value = '';
    });
  });
  var ta = qs('#aiText');
  if (ta) {
    ta.addEventListener('paste', function (e) {
      var items = (e.clipboardData && e.clipboardData.items) || [];
      var files = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && /^image\//.test(items[i].type)) {
          var f = items[i].getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        aiAddFiles(files);
      }
    });
    ta.addEventListener('input', function () { aiState.text = ta.value; });
  }
  var hint = qs('#aiHint');
  if (hint) hint.addEventListener('input', function () { aiState.hint = hint.value; });
  var subjSel = qs('#aiSubject');
  if (subjSel) {
    subjSel.addEventListener('change', function () {
      aiState.subject = subjSel.value;
      updateAiSkillUI();
    });
  }
  var form = qs('#aiForm');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); aiSubmit(); });
}

function updateAiStatusNote() {
  var el = qs('#aiStatusNote');
  if (el) el.textContent = aiState.statusNote;
}

function updateAiSkillUI() {
  var s = subjectOf(aiState.subject);
  var skillId = AI_SKILLS[s.id] || '';
  qs('#aiTitle').textContent = '智能录入 · ' + s.name;
  var chip = qs('#aiSkillChip');
  if (chip) chip.textContent = '/' + skillId;
  var note = qs('#aiStatusNote');
  if (note) note.textContent = aiState.statusNote;
}

async function checkAiStatus() {
  if (PAGES) {
    fallbackDirectStatus('GitHub Pages 静态版没有后端。');
    aiState.statusChecked = true;
    updateAiStatusNote();
    return;
  }
  if (!/^https?:$/.test(location.protocol)) {
    fallbackDirectStatus('当前是文件方式打开，没有本机后端。');
    aiState.statusChecked = true;
    updateAiStatusNote();
    return;
  }
  try {
    var res = await fetch('/api/ai/status', { headers: apiHeaders(), cache: 'no-store' });
    if (res.ok) {
      var data = await res.json();
      if (data.configured) {
        aiState.transport = 'server';
        aiState.statusNote = '已连接本机 AI 服务 · ' + (data.protocol ? aiProtocolLabel(data.protocol) + ' · ' : '') + (data.model || '模型') + '，支持图片。';
      } else {
        fallbackDirectStatus('服务端还没有配置 AI 服务。');
      }
    } else if (res.status === 401) {
      fallbackDirectStatus('本机服务端需要访问口令。');
    } else {
      fallbackDirectStatus('服务端智能录入接口未响应。');
    }
  } catch (e) {
    fallbackDirectStatus('没有连上本机服务端。');
  }
  aiState.statusChecked = true;
  updateAiStatusNote();
}

function fallbackDirectStatus(reason) {
  aiState.transport = 'direct';
  var cfg = aiConfig();
  aiState.statusNote = aiConfigReady()
    ? '在线直连 · ' + aiProtocolLabel(cfg.protocol) + ' · ' + cfg.model + '；API Key 只存在本机浏览器。'
    : reason + ' 可在「设置与同步」配置 AI 模型服务，之后在线直连。';
}

function aiIsImageFile(file) {
  if (!file) return false;
  if (/^image\//.test(file.type || '')) return true;
  if (!file.type && !file.name) return true;
  return /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name || '');
}

function aiAddFiles(fileList) {
  var files = Array.prototype.slice.call(fileList || []).filter(aiIsImageFile);
  if (!files.length) { toast('请选择 JPG / PNG / HEIC 等图片文件'); return; }
  var room = 3 - aiState.images.length;
  if (room <= 0) { toast('最多 3 张图片'); return; }
  files = files.slice(0, room);
  Promise.all(files.map(function (file) {
    return compressAiImage(file).then(function (item) {
      return { ok: true, item: item };
    }).catch(function (err) {
      return { ok: false, err: err };
    });
  })).then(function (results) {
    var items = results.filter(function (r) { return r.ok; }).map(function (r) { return r.item; });
    var failed = results.filter(function (r) { return !r.ok; });
    if (items.length) {
      aiState.images = aiState.images.concat(items);
      renderAiForm();
      toast('已加入 ' + items.length + ' 张图片');
    }
    if (failed.length) {
      toast('有 ' + failed.length + ' 张图片读取失败：' + (failed[0].err && failed[0].err.message || '请换一张 JPG / PNG'));
    }
  });
}

function aiAddWrongImages(fileList) {
  var files = Array.prototype.slice.call(fileList || []).filter(aiIsImageFile);
  if (!files.length) { toast('请选择 JPG / PNG / HEIC 等图片文件'); return; }
  var room = 3 - aiState.wrongImages.length;
  if (room <= 0) { toast('错解图片最多 3 张'); return; }
  files = files.slice(0, room);
  Promise.all(files.map(function (file) {
    return compressAiImage(file).then(function (item) { return { ok: true, item: item }; }).catch(function (err) { return { ok: false, err: err }; });
  })).then(function (results) {
    var items = results.filter(function (r) { return r.ok; }).map(function (r) { return r.item; });
    var failed = results.filter(function (r) { return !r.ok; });
    if (items.length) {
      aiState.wrongImages = aiState.wrongImages.concat(items);
      aiState.wrongOn = true;
      renderAiForm();
      toast('已加入 ' + items.length + ' 张错解图片');
    }
    if (failed.length) toast('有 ' + failed.length + ' 张错解图片读取失败：' + (failed[0].err && failed[0].err.message || '请换一张 JPG / PNG'));
  });
}

function aiRemoveWrongImage(index) {
  aiState.wrongImages.splice(index, 1);
  renderAiForm();
}

function compressAiImage(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      try {
        var maxEdge = 1600;
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        var scale = Math.min(1, maxEdge / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('当前浏览器无法处理图片');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          mediaType: 'image/jpeg',
          data: dataUrl.split(',')[1],
          preview: dataUrl,
          name: file.name || '题目图片'
        });
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      var heic = /heic|heif/i.test(file.type || '') || /\.(heic|heif)$/i.test(file.name || '');
      reject(new Error(heic ? '这张 HEIC 图片当前浏览器无法解码，请在相册中导出为 JPG 后重试' : '无法解码这张图片，请换一张 JPG/PNG'));
    };
    img.src = url;
  });
}

var AI_ENTRY_STEPS = ['准备题目', '请求模型', '解析结果', '写入错题本'];

function aiEntryPercent(step) {
  if (typeof aiProgressStepPercent === 'function') return aiProgressStepPercent(step, AI_ENTRY_STEPS.length);
  return Math.round(Math.max(0, Math.min(AI_ENTRY_STEPS.length - 1, Number(step) || 0)) / AI_ENTRY_STEPS.length * 100);
}

function setAiEntryProgress(step, stage, detail) {
  if (typeof aiProgressSet !== 'function') return;
  aiProgressSet('ai-entry', {
    step: step,
    percent: aiEntryPercent(step),
    valueText: '阶段 ' + (Math.min(AI_ENTRY_STEPS.length, (Number(step) || 0) + 1)) + ' / ' + AI_ENTRY_STEPS.length,
    stage: stage,
    detail: detail
  });
}

function renderAiLoading() {
  var body = qs('#aiBody');
  if (!body) return;
  body.innerHTML = '' +
    '<div class="ai-loading">' +
      aiProgressHtml('ai-entry', {
        steps: AI_ENTRY_STEPS,
        label: '智能录入进度',
        step: 0,
        percent: 0,
        valueText: '阶段 1 / 4',
        stage: '正在准备题目与图片…',
        detail: '先在本机压缩图片、整理题干，再发送给模型。'
      }) +
      '<p class="ai-loading-note">生成通常需要 20–90 秒；开启思考时可能更久。可以切到后台，但不要关掉页面；结果只在这次页面里，保存后才进错题本。</p>' +
      '<div class="ai-loading-actions"><button class="btn btn-xs" data-act="ai-abort" type="button">取消生成</button></div>' +
    '</div>';
  aiState.stageIndex = 0;
  if (typeof aiProgressStart === 'function') {
    aiProgressStart('ai-entry', {
      steps: AI_ENTRY_STEPS,
      label: '智能录入进度',
      step: 0,
      percent: 0,
      valueText: '阶段 1 / 4',
      stage: '正在准备题目与图片…',
      detail: '先在本机压缩图片、整理题干，再发送给模型。'
    });
  }
}

function clearAiStage() {
  if (typeof aiProgressStop === 'function') aiProgressStop('ai-entry');
  clearInterval(aiState.stageTimer);
  aiState.stageTimer = null;
}

function aiSubmit() {
  if (aiState.busy) return;
  var ta = qs('#aiText');
  if (ta) aiState.text = ta.value;
  var hint = qs('#aiHint');
  if (hint) aiState.hint = hint.value;
  var wrongToggle = qs('#aiWrongToggle');
  if (wrongToggle) aiState.wrongOn = !!wrongToggle.checked;
  var wrongText = qs('#aiWrongText');
  if (wrongText) aiState.wrongText = wrongText.value;
  if (aiState.wrongOn && !aiState.wrongText.trim() && !aiState.wrongImages.length) {
    toast('请写下错解或上传错解图片，或取消勾选');
    return;
  }
  if (!aiState.text.trim() && !aiState.images.length) {
    toast('请先输入题目或上传图片');
    var box = qs('#aiText');
    if (box) box.focus();
    return;
  }
  if (aiState.transport === 'direct') {
    var diag = typeof aiConfigDiagnosis === 'function' ? aiConfigDiagnosis() : null;
    if (diag && diag.blocking) { renderAiError({ code: diag.code, message: diag.message, hint: diag.hint }); return; }
    aiSubmitDirect();
    return;
  }
  aiSubmitServer();
}

function callDshDirectRetry(subject, text, hint, images, wrongText, wrongImages, signal) {
  return callDshDirect(subject, text, hint, images, wrongText, wrongImages, signal).catch(function (err) {
    if (err && (err.code === 'PARSE_ERROR' || err.code === 'EMPTY_RESPONSE')) {
      return callDshDirect(subject, text, hint, images, wrongText, wrongImages, signal);
    }
    throw err;
  });
}

function aiSubmitDirect() {
  aiState.busy = true;
  aiState.result = null;
  renderAiLoading();
  setAiEntryProgress(1, '正在请求模型…', '题目与技能包已整理，等待模型返回；这是真实网络等待时间。');
  var started = Date.now();
  var controller = new AbortController();
  aiState.abort = controller;
  callDshDirectRetry(aiState.subject, aiState.text, aiState.hint, aiState.images, aiState.wrongText, aiState.wrongImages, controller.signal).then(function (data) {
    setAiEntryProgress(3, '正在解析并写入错题本', '已收到模型响应，正在解析标准解答并保存条目。');
    aiState.busy = false;
    aiState.abort = null;
    aiHandleResult(data, Date.now() - started);
    clearAiStage();
  }).catch(function (err) {
    clearAiStage();
    aiState.busy = false;
    aiState.abort = null;
    if (err && err.name === 'AbortError') {
      renderAiForm();
      toast('已取消生成');
      return;
    }
    aiHandleUnavailableModelError(err);
    renderAiError(err);
  });
}

function aiSubmitServer() {
  if (aiState.busy) return;
  var ta = qs('#aiText');
  if (ta) aiState.text = ta.value;
  var hint = qs('#aiHint');
  if (hint) aiState.hint = hint.value;
  if (!aiState.text.trim() && !aiState.images.length) {
    toast('请先输入题目或上传图片');
    var box = qs('#aiText');
    if (box) box.focus();
    return;
  }
  aiState.busy = true;
  aiState.result = null;
  renderAiLoading();
  var started = Date.now();
  var controller = new AbortController();
  aiState.abort = controller;
  setAiEntryProgress(1, '正在请求模型…', '题目与图片已发送到本机服务，等待模型返回；这是真实网络等待时间。');
  var timer = setTimeout(function () { controller.abort(); }, 150000);
  fetch('/api/solve', {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      subject: aiState.subject,
      language: (state.prefs && state.prefs.lang) || 'zh-CN',
      text: aiState.text,
      hint: aiState.hint,
      images: aiState.images.map(function (im) { return { mediaType: im.mediaType, data: im.data }; }),
      wrongText: aiState.wrongOn ? aiState.wrongText : '',
      wrongImages: aiState.wrongOn ? aiState.wrongImages.map(function (im) { return { mediaType: im.mediaType, data: im.data }; }) : [],
      aiConfig: aiConfigForRequest()
    }),
    signal: controller.signal
  }).then(async function (res) {
    setAiEntryProgress(2, '已收到服务端响应', '正在解析标准解答、详细解析、答案与模板。');
    var data = null;
    try { data = await res.json(); } catch (e) { data = { error: '服务端返回了无法解析的内容' }; }
    if (!res.ok || data.error) {
      var err = new Error(data.error || ('生成失败（' + res.status + '）'));
      err.code = data.code || '';
      err.status = res.status;
      throw err;
    }
    return data;
  }).then(function (data) {
    clearTimeout(timer);
    setAiEntryProgress(3, '正在写入错题本', '解析完成，正在保存并整理条目。');
    aiState.busy = false;
    aiState.abort = null;
    aiHandleResult(data, Date.now() - started);
    clearAiStage();
  }).catch(function (err) {
    clearTimeout(timer);
    clearAiStage();
    aiState.busy = false;
    aiState.abort = null;
    if (err && err.name === 'AbortError') {
      renderAiForm();
      toast('已取消生成');
      return;
    }
    aiHandleUnavailableModelError(err);
    renderAiError(err);
  });
}

function aiHandleUnavailableModelError(err) {
  if (!err || err.code !== 'MODEL_UNAVAILABLE') return;
  var cfg = aiConfig();
  var fallback = aiDropUnavailableModel(cfg.protocol, cfg.model);
  err.message = (err.message || '当前模型不可用') + '；已从列表移除' + (fallback ? '，改用 ' + fallback : '');
}

function renderAiError(err) {
  clearAiStage();
  var body = qs('#aiBody');
  if (!body) return;
  var msg = (err && err.message) || '生成失败';
  var extra = '';
  var diag = typeof aiConfigDiagnosis === 'function' ? aiConfigDiagnosis() : null;
  if (diag && diag.blocking) extra = diag.hint;
  else if (err && err.code === 'RATE_LIMIT') extra = '稍等一会儿再试；接口有限流。';
  else if (err && (err.code === 'NO_CREDENTIAL' || err.code === 'NO_AI_KEY')) extra = '请到「设置与同步 → 在线 AI 服务」填写 API Key、模型与接口地址，或在本机 server 配置 AI_* 环境变量。';
  else if (err && err.code === 'MODEL_UNAVAILABLE') extra = '该模型无法完成智能录入，已从列表中移除；点「重试」会使用备用模型。';
  else if (err && err.code === 'UPSTREAM_AUTH') extra = 'API Key 可能无效或没有权限，请检查服务设置。';
  else if (err && err.code === 'SKILL_MISSING') extra = '请确认 ~/.agents/skills 下存在 /' + (AI_SKILLS[aiState.subject] || '') + ' 技能目录。';
  else if (err && err.code === 'NO_DECOMPRESSION') extra = '请升级浏览器，或在本机运行 node server.js 使用完整版。';
  else if (err && err.code === 'SKILL_PACK_MISSING') extra = '这个静态页没有内置该科目的技能包，请更新页面。';
  else if (err && err.code === 'TIMEOUT') extra = '题目可能太大或模型排队；可以只保留题干，去掉多余截图再试。';
  else if (err && err.status === 401) extra = '请在「设置与同步」里填写访问口令后再试。';
  else if (diag && diag.hint) extra = diag.hint;
  body.innerHTML = '' +
    '<div class="ai-error"><b>没有生成成功。</b><br>' + esc(msg) + (extra ? '<br><span class="faint">' + esc(extra) + '</span>' : '') + '</div>' +
    '<div class="ai-actions" style="margin-top:16px">' +
      '<button class="btn" data-act="ai-retry" type="button">回到输入</button>' +
      '<button class="btn btn-primary" data-act="ai-submit" type="button">重试</button>' +
    '</div>';
}

function aiResultIssues(r) {
  r = r || {};
  var issues = [];
  if (!String(r.standardSolution || '').trim()) issues.push('考试标准解答');
  if (!String(r.detailedAnalysis || '').trim()) issues.push('详细解析');
  if (!String(r.answer || '').trim()) issues.push('答案');
  if (!Array.isArray(r.variants) || !r.variants.length) issues.push('变式题');
  if (!String(r.templateTitle || '').trim()) issues.push('同类型模板名称');
  var n = r.templateNotes || {};
  if (!String(n.features || '').trim() || !String(n.method || '').trim() || !String(n.skeleton || '').trim() || !String(n.pitfalls || '').trim()) {
    issues.push('模板四段（识别特征 / 首选方法 / 步骤骨架 / 易错点）');
  }
  if (aiState.wrongOn) {
    var ea = r.errorAnalysis || {};
    if (!r.hasUserSolution) issues.push('错解识别标记');
    if (!String(ea.mistake || '').trim() || !String(ea.blockingPoint || '').trim() || !String(ea.correction || '').trim() || !String(ea.prevention || '').trim()) {
      issues.push('错解诊断四段（错在哪 / 卡点 / 怎么改 / 下次怎么防）');
    }
  }
  return issues;
}

function aiAutoSaveResult() {
  if (!aiState.result || !aiState.result.result) return null;
  if (aiState.autoSaved && aiState.savedEntryId) return findEntry(aiState.subject, aiState.savedEntryId);
  var e = aiBuildDraft();
  var list = entriesOf(e.subject);
  if (list.some(function (x) { return x.code === e.code; })) e.code = nextCode(e.subject);
  e.id = e.subject + '-' + e.code;
  list.push(e);
  syncEntryToLibraries(e);
  state.activeSubject = e.subject;
  state.activeView = 'entries';
  ui.open[e.id] = true;
  aiState.savedEntryId = e.id;
  aiState.savedCode = e.code;
  aiState.autoSaved = true;
  if (aiState.deferId) { aiDeferRemove(aiState.deferId, true); aiState.deferId = ''; }
  markDirty();
  render();
  try { location.hash = '#/' + subjectRouteId(e.subject) + '/entries'; } catch (err) { /* ignore */ }
  render();
  toast('本题已自动记入错题本 · ' + e.code);
  return e;
}

function aiHandleResult(data, elapsedMs) {
  aiState.result = data;
  var issues = aiResultIssues(data && data.result);
  if (!issues.length) aiAutoSaveResult();
  renderAiResult(data, elapsedMs, issues);
}

function renderAiResult(data, elapsedMs, issues) {
  var r = data.result || {};
  var body = qs('#aiBody');
  if (!body) return;
  var s = subjectOf(aiState.subject);
  var skill = data.skill || { id: AI_SKILLS[aiState.subject] || '', name: s.name, chapter: null };
  var skillLabel = '/' + (skill.id || '');
  var points = (r.points || []).slice(0, 4).map(function (p) { return '<span class="chip">' + renderMarkdownInline(p) + '</span>'; }).join('');
  var conf = typeof r.confidence === 'number' ? Math.round(r.confidence * 100) + '%' : '—';
  var usage = data.usage && data.usage.output_tokens ? ('输出 ' + data.usage.output_tokens + ' tokens') : '';
  issues = issues || [];
  var warn = '';
  if (r.needsClarification) {
    warn += '<div class="ai-warning"><b>题目信息可能不全：</b>' + esc(r.clarification || '模型认为题干或图片不够清楚。') + '。建议对照原题补全后再编辑。</div>';
  }
  if (issues.length) {
    warn += '<div class="ai-warning"><b>缺少必需内容：</b>' + esc(issues.join('、')) + '。本题暂未自动入库；请重新生成，或点「仍然入库」后手动补全。</div>';
  }
  var saved = (aiState.autoSaved && aiState.savedEntryId) ? findEntry(aiState.subject, aiState.savedEntryId) : null;
  var savedHtml = '';
  if (saved) {
    savedHtml = '<div class="ai-saved"><span class="ai-saved-mark">已自动入库</span>' +
      '<span>编号 <b>' + esc(saved.code) + '</b></span>' +
      '<span>' + esc(formatDate(saved.date)) + '</span>' +
      '<span>知识要点 ' + renderInline((saved.points || []).slice(0, 3).join('；') || r.chapter || '综合') + '</span>' +
      '</div>';
  }
  var pitfalls = (r.pitfalls || []).length
    ? '<div class="ai-sec"><h4>易错点</h4><div class="md"><ul>' + r.pitfalls.map(function (p) { return '<li>' + renderMarkdownInline(p) + '</li>'; }).join('') + '</ul></div></div>'
    : '';
  var variants = (r.variants || []).length
    ? '<div class="ai-sec"><h4>变式（自测）</h4>' + r.variants.map(function (v, i) {
        return '<div style="margin-top:8px"><div class="faint" style="font-size:10.5px;letter-spacing:.1em">变式 ' + (i + 1) + '</div>' +
          '<div class="md">' + renderMarkdown(v.q) + '</div>' +
          (v.a ? '<details><summary>看答案</summary><div class="md" style="margin-top:6px">' + renderMarkdown(v.a) + '</div></details>' : '') + '</div>';
      }).join('') + '</div>'
    : '';
  var notes = r.templateNotes || {};
  var notesHtml = '<div class="ai-sec ai-template"><h4>同类型解答模板</h4>' +
    (r.templateTitle ? '<p class="ai-template-title">' + renderMarkdownInline(r.templateTitle) + '</p>' : '') +
    ((notes.features || notes.method || notes.skeleton || notes.pitfalls)
      ? '<dl class="ai-grid">' +
          (notes.features ? '<div><dt>识别特征</dt><dd>' + renderMarkdownInline(notes.features) + '</dd></div>' : '') +
          (notes.method ? '<div><dt>首选方法</dt><dd>' + renderMarkdownInline(notes.method) + '</dd></div>' : '') +
          (notes.skeleton ? '<div><dt>步骤骨架</dt><dd>' + renderMarkdownInline(notes.skeleton) + '</dd></div>' : '') +
          (notes.pitfalls ? '<div><dt>易错点</dt><dd>' + renderMarkdownInline(notes.pitfalls) + '</dd></div>' : '') +
        '</dl>'
      : '<p class="ai-template-missing">模型没有返回模板四段，请重新生成。</p>') +
    '</div>';
  var verification = r.verification
    ? '<div class="ai-sec"><h4>验算 / 特例</h4><div class="md">' + renderMarkdown(r.verification) + '</div></div>'
    : '';

  body.innerHTML = '' +
    '<div class="ai-result">' +
      '<div class="ai-result-head">' +
        '<span class="ai-badge">生成完成</span>' +
        '<span class="chip chip-subj" style="--subj:var(--' + s.id + ')">' + esc(s.name) + '</span>' +
        '<span class="chip mono">' + esc(skillLabel) + '</span>' +
        '<span class="chip">置信度 ' + conf + '</span>' +
        (r.chapter ? '<span class="chip">' + esc(r.chapter) + '</span>' : '') +
        '<span class="ai-usage">' + esc((data.model || '') + ' · ' + (elapsedMs / 1000).toFixed(0) + 's · ' + usage) + '</span>' +
      '</div>' +
      warn +
      savedHtml +
      '<div class="ai-summary">' + renderMarkdownInline(r.summary || '生成了一道错题') + '</div>' +
      (points ? '<div class="ai-chips">' + points + '</div>' : '') +
      '<div class="ai-sec"><h4>原题</h4><div class="md">' + renderMarkdown(stripTypePrefix(r.question || aiState.text)) + '</div></div>' +
      (function () {
        var ea = r.errorAnalysis || {};
        if (!ea.mistake && !ea.blockingPoint && !ea.correction && !ea.prevention) return '';
        return '<div class="ai-sec ai-error-analysis"><h4>错解诊断</h4><dl class="ai-grid">' +
          (ea.mistake ? '<div><dt>错在哪一步</dt><dd>' + renderMarkdownInline(ea.mistake) + '</dd></div>' : '') +
          (ea.blockingPoint ? '<div><dt>真正卡点</dt><dd>' + renderMarkdownInline(ea.blockingPoint) + '</dd></div>' : '') +
          (ea.correction ? '<div><dt>应该怎么改</dt><dd>' + renderMarkdownInline(ea.correction) + '</dd></div>' : '') +
          (ea.prevention ? '<div><dt>下次怎么防</dt><dd>' + renderMarkdownInline(ea.prevention) + '</dd></div>' : '') +
          '</dl></div>';
      })() +
      '<div class="ai-sec"><h4>考试标准解答</h4><div class="md">' + renderMarkdown(r.standardSolution || '（模型没有返回标准解答）') + '</div></div>' +
      '<div class="ai-sec"><h4>详细解析</h4><div class="md">' + renderMarkdown(r.detailedAnalysis || '（模型没有返回详细解析）') + '</div></div>' +
      notesHtml +
      (r.answer ? '<div class="ai-sec"><h4>答案</h4><div class="md" style="background:var(--accent-soft);border-radius:8px;padding:10px 13px">' + renderMarkdown(r.answer) + '</div></div>' : '') +
      verification + pitfalls + variants +
      '<p class="ai-note" style="margin-top:16px">以上由模型生成，可能出错。请核对题干、答案与定理依据；自动入库后仍可编辑。</p>' +
      '<div class="ai-actions">' +
        '<button class="btn" data-act="ai-retry" type="button">重新生成</button>' +
        '<span class="spacer"></span>' +
        (saved
          ? '<button class="btn" data-act="ai-open-saved" type="button">查看条目</button><button class="btn btn-primary" data-act="ai-save-edit" type="button">编辑这条</button>'
          : '<button class="btn" data-act="ai-save" type="button">仍然入库</button><button class="btn btn-primary" data-act="ai-save-edit" type="button">手动入库 / 校对</button>') +
      '</div>' +
    '</div>';
}

function renderMarkdownInline(text) {
  if (!text) return '';
  var html = renderMarkdown(text);
  return html.replace(/<\/?p>/g, ' ').replace(/\n/g, ' ').trim();
}

function aiBuildDraft() {
  var r = (aiState.result && aiState.result.result) || {};
  var s = subjectOf(aiState.subject);
  var e = blankEntry(s.id);
  e.summary = r.summary || '';
  e.chapter = canonicalChapterFor(s.id, r.chapter || e.chapter);
  e.chapterCode = r.chapterCode || '';
  e.points = (r.points || []).slice(0, 4);
  if (!e.points.length) e.points = [r.chapter || r.templateTitle || '综合'];
  e.templateTitle = r.templateTitle || r.chapter || '同类型题模板';
  if (!e.chapter || e.chapter === '未分章') {
    e.chapter = smartChapterFor(s.id, {
      chapter: e.chapter, summary: e.summary, points: e.points, templateTitle: e.templateTitle,
      question: r.question, standardSolution: r.standardSolution, detailedAnalysis: r.detailedAnalysis, answer: r.answer
    }) || e.chapter;
  }
  var skillId = (aiState.result && aiState.result.skill && aiState.result.skill.id) || AI_SKILLS[s.id] || '';
  e.aiSkill = skillId;
  e.source = '智能录入 · /' + skillId;
  e.aiStatus = 'done';
  e.aiDoneAt = nowIso();
  e.aiGeneratedAt = nowIso();
  e.aiSkill = skillId;
  e.aiModel = (aiState.result && aiState.result.model) || aiConfig().model || '';
  e.stars = normalizeStars(r.difficulty || 2);
  e.errorTypes = (r.errorTypes || []).filter(function (t) { return errorTypesFor(s.id).indexOf(t) >= 0; });
  e.templateNotes = {
    features: (r.templateNotes && r.templateNotes.features) || '',
    method: (r.templateNotes && r.templateNotes.method) || '',
    skeleton: (r.templateNotes && r.templateNotes.skeleton) || '',
    pitfalls: (r.templateNotes && r.templateNotes.pitfalls) || ''
  };
  e.variants = (r.variants || []).slice();
  var original = r.question || aiState.text;
  var standard = r.standardSolution || '';
  var analysis = r.detailedAnalysis || '';
  var answer = r.answer || '';
  var verification = r.verification || '';
  var pitfalls = (r.pitfalls || []).map(function (p) { return '- ' + p; }).join('\n');
  var ea = r.errorAnalysis || {};
  e.errorAnalysis = { mistake: ea.mistake || '', blockingPoint: ea.blockingPoint || '', correction: ea.correction || '', prevention: ea.prevention || '' };
  e.wrongSolutionText = aiState.wrongOn ? aiState.wrongText : '';
  var wrongIntro = aiState.wrongOn ? ('**我的错解：**\n' + (aiState.wrongText || '（已上传错解图片，AI 已据此诊断）') + (aiState.wrongImages.length ? '\n\n（另附 ' + aiState.wrongImages.length + ' 张错解图片，已用于本次分析）' : '')) : '';
  var diagLines = [];
  if (ea.mistake) diagLines.push('- 错在哪一步：' + ea.mistake);
  if (ea.blockingPoint) diagLines.push('- 真正卡住的点：' + ea.blockingPoint);
  if (ea.correction) diagLines.push('- 应该怎么改：' + ea.correction);
  if (ea.prevention) diagLines.push('- 下次怎么防：' + ea.prevention);
  var diagnosis = diagLines.length ? ('**AI 错解诊断：**\n' + diagLines.join('\n')) : '';
  var attemptMd = [wrongIntro, diagnosis].filter(Boolean).join('\n\n');
  var blocks = [];
  if (s.id === 'gaodai') {
    blocks = [
      { key: 'original', title: '原题', md: original },
      { key: 'attempt', title: '我的错解 / 卡点', md: attemptMd || '（智能录入，待补自己的卡点）' },
      { key: 'standard', title: '考试标准解答', md: standard },
      { key: 'analysis', title: '详细解析', md: analysis },
      { key: 'answer', title: '答案', md: answer }
    ];
  } else if (s.id === 'shufen') {
    blocks = [
      { key: 'original', title: '题目', md: original },
      { key: 'standard', title: '考试标准解答过程', md: standard },
      { key: 'analysis', title: '详细解析', md: analysis },
      { key: 'answer', title: '答案', md: answer },
      { key: 'verification', title: '验证', md: verification },
      { key: 'pitfalls', title: '易错点 / 当时卡在哪', md: [pitfalls, diagnosis].filter(Boolean).join('\n\n') },
      { key: 'reviewlog', title: '复习记录', md: '- ' + formatDate(nowIso()) + ' 智能录入（待复习）' }
    ];
  } else if (s.id === 'xijing') {
    blocks = [
      { key: 'original', title: '题目', md: original },
      { key: 'standard', title: '考试标准解答', md: standard },
      { key: 'analysis', title: '详细解析', md: analysis },
      { key: 'figure', title: '图形与条件', md: verification },
      { key: 'pitfalls', title: '易错点 / 卡点', md: [pitfalls, diagnosis].filter(Boolean).join('\n\n') },
      { key: 'answer', title: '答案', md: answer }
    ];
  } else {
    blocks = [
      { key: 'original', title: '题目', md: original },
      { key: 'standard', title: '考试标准解答', md: standard },
      { key: 'analysis', title: '详细解析（要点）', md: analysis },
      { key: 'answer', title: '答案', md: answer },
      { key: 'pitfalls', title: '卡点', md: [pitfalls, diagnosis].filter(Boolean).join('\n\n') }
    ];
  }
  e.blocks = blocks.filter(function (b) { return b.md && String(b.md).trim(); });
  if (!e.blocks.length) e.blocks = defaultBlocks(s.id);
  return e;
}

function aiOpenSaved() {
  if (!aiState.savedEntryId) return;
  var e = findEntry(aiState.subject, aiState.savedEntryId);
  var dlg = qs('#aiDialog');
  if (dlg) dlg.close();
  if (!e) { toast('已保存的条目找不到了，可能已被删除'); return; }
  state.activeSubject = e.subject;
  state.activeView = 'entries';
  ui.open[e.id] = true;
  location.hash = '#/' + subjectRouteId(e.subject) + '/entries';
  render();
  var card = qs('#entry-' + e.id);
  if (card) card.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function aiSaveDirect() {
  if (aiState.autoSaved && aiState.savedEntryId) { aiOpenSaved(); return; }
  if (!aiState.result) return;
  var e = aiBuildDraft();
  var list = entriesOf(e.subject);
  if (list.some(function (x) { return x.code === e.code; })) e.code = nextCode(e.subject);
  e.id = e.subject + '-' + e.code;
  list.push(e);
  syncEntryToLibraries(e);
  state.activeSubject = e.subject;
  state.activeView = 'entries';
  ui.open[e.id] = true;
  markDirty();
  var dlg = qs('#aiDialog');
  if (dlg) dlg.close();
  location.hash = '#/' + subjectRouteId(e.subject) + '/entries';
  render();
  toast('已保存 · ' + e.code);
  var card = qs('#entry-' + e.id);
  if (card) card.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function aiSaveEdit() {
  var dlg = qs('#aiDialog');
  if (dlg) dlg.close();
  if (aiState.autoSaved && aiState.savedEntryId) {
    openEditor(aiState.subject, aiState.savedEntryId);
    return;
  }
  if (!aiState.result) return;
  var e = aiBuildDraft();
  openEditor(e.subject, null, e);
}

function aiRetry() {
  aiState.result = null;
  aiState.busy = false;
  renderAiForm();
}


