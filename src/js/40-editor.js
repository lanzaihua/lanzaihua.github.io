/* =========================================================
   40-editor — 编辑器、设置、导入导出
   ========================================================= */
function errorTypesFor(subjectId) {
  if (subjectId === 'xijing') return ['概念', '计算', '方法选择', '条件漏用', '表述'];
  if (subjectId === 'jieji') return ['概念', '公式', '计算', '思路', '审题'];
  if (subjectId === 'shufen') return ['概念', '计算', '方法', '条件', '表述'];
  return ['概念', '计算', '方法选择', '条件漏用', '表述'];
}

function defaultBlocks(subjectId) {
  if (subjectId === 'gaodai') {
    return [
      { key: 'original', title: '原题', md: '' },
      { key: 'attempt', title: '我的错解 / 卡点', md: '' },
      { key: 'standard', title: '考试标准解答', md: '' },
      { key: 'analysis', title: '详细解析', md: '' },
      { key: 'answer', title: '答案', md: '' }
    ];
  }
  if (subjectId === 'shufen') {
    return [
      { key: 'original', title: '题目', md: '' },
      { key: 'standard', title: '考试标准解答过程', md: '' },
      { key: 'analysis', title: '详细解析', md: '' },
      { key: 'verification', title: '验证', md: '' },
      { key: 'pitfalls', title: '易错点 / 当时卡在哪', md: '' },
      { key: 'reviewlog', title: '复习记录', md: '' }
    ];
  }
  if (subjectId === 'xijing') {
    return [
      { key: 'original', title: '题目', md: '' },
      { key: 'standard', title: '考试标准解答', md: '' },
      { key: 'analysis', title: '详细解析', md: '' },
      { key: 'figure', title: '图形与条件', md: '' },
      { key: 'pitfalls', title: '易错点 / 卡点', md: '' },
      { key: 'answer', title: '答案', md: '' }
    ];
  }
  return [
    { key: 'original', title: '题目', md: '' },
    { key: 'standard', title: '考试标准解答', md: '' },
    { key: 'analysis', title: '详细解析（要点）', md: '' },
    { key: 'pitfalls', title: '卡点', md: '' }
  ];
}

function blankEntry(subjectId) {
  var code = nextCode(subjectId);
  var tpls = templatesOf(subjectId);
  var now = new Date();
  return {
    id: subjectId + '-' + code,
    code: code,
    subject: subjectId,
    date: formatEntryDate(nowIso()),
    weekday: '',
    stars: 2,
    chapter: tpls.length ? tpls[0].chapter : '',
    chapterCode: '',
    section: '',
    points: [],
    templateId: '',
    templateTitle: '',
    source: '',
    errorTypes: [],
    errorNote: '',
    summary: '',
    status: 'unmastered',
    aiStatus: 'none',
    aiAttempts: 0,
    aiDueAt: 0,
    aiDeadline: 0,
    aiError: '',
    aiSkill: '',
    aiGeneratedAt: '',
    aiModel: '',
    review: { d1: false, d3: false, d7: false, d15: false, d30: false, mastered: false },
    blocks: defaultBlocks(subjectId),
    templateNotes: subjectId === 'gaodai' ? { features: '', method: '', skeleton: '', pitfalls: '' } : null,
    variants: [],
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

function openEditor(subjectId, entryId, prefill) {
  var dlg = qs('#editor');
  if (!dlg) return;
  var entry;
  if (entryId) {
    entry = deepClone(findEntry(subjectId, entryId));
    if (!entry) return;
    dlg.dataset.mode = 'edit';
  } else {
    entry = prefill || blankEntry(subjectId);
    dlg.dataset.mode = 'new';
  }
  dlg.dataset.subject = subjectId;
  dlg.dataset.entry = entryId || '';
  dlg._draft = entry;
  var tpls = templatesOf(subjectId);
  var chapters = uniq(entriesOf(subjectId).map(function (e) { return e.chapter; }).concat(tpls.map(function (t) { return t.chapter; }))).filter(Boolean);
  var types = errorTypesFor(subjectId);
  var isGaodai = subjectId === 'gaodai';
  var s = subjectOf(subjectId);

  var statusOptions = ['unmastered', 'mastered'].map(function (v) {
    return '<option value="' + v + '"' + (entry.status === v ? ' selected' : '') + '>' + STATUS_LABEL[v] + '</option>';
  }).join('');

  var tplOptions = '<option value="">（不挂模板）</option>' + tpls.map(function (t) {
    return '<option value="' + attr(t.id) + '"' + (entry.templateId === t.id ? ' selected' : '') + '>' + esc(t.id + ' · ' + t.title) + '</option>';
  }).join('');

  var blocksHtml = (entry.blocks || []).map(blockEditorHtml).join('');
  var variantsHtml = (entry.variants || []).map(variantEditorHtml).join('');
  var entryAttachments = Array.isArray(entry.attachments) ? entry.attachments : [];
  var attachmentsHtml = entryAttachments.length
    ? '<div class="form-section"><h4>附件 <span class="faint" style="font-size:11px;font-weight:400">图片单独保存，不混入正文</span></h4><div class="editor-attachments">' +
      entryAttachments.map(function (a, i) {
        return '<figure class="editor-attachment"><button class="entry-attachment-thumb" data-act="open-attachment" type="button" aria-label="放大查看' + attr(a.label || ('附件 ' + (i + 1))) + '"><img src="' + attr(a.data) + '" alt="' + attr(a.label || ('附件 ' + (i + 1))) + '"></button><figcaption>' + esc(a.label || ('附件 ' + (i + 1))) + '</figcaption></figure>';
      }).join('') + '</div></div>'
    : '';
  var attachmentsField = '<input type="hidden" id="f-attachments" value="' + attr(JSON.stringify(entryAttachments)) + '">';

  var form = '' +
    '<div class="field-grid">' +
      field('编号 / CODE', '<input id="f-code" value="' + attr(entry.code) + '">', '条目编号，保持册内唯一') +
      field('日期 / DATE', '<input id="f-date" value="' + attr(entry.date) + '" placeholder="2026-10-21 22:20 星期三">', '保存时自动补全为「日期 时间 星期」') +
      field('章节 / CHAPTER', '<input id="f-chapter" list="chapterList" value="' + attr(entry.chapter) + '">' +
        '<datalist id="chapterList">' + chapters.map(function (c) { return '<option value="' + attr(c) + '"></option>'; }).join('') + '</datalist>') +
      field('模板 / TEMPLATE', '<select id="f-template">' + tplOptions + '</select>') +
      field('知识要点 / POINTS', '<input id="f-points" value="' + attr((entry.points || []).join('；')) + '" placeholder="用；或、分隔">', '用于检索与同类题匹配') +
      field('来源 / SOURCE', '<input id="f-source" value="' + attr(entry.source || '') + '" placeholder="教材 第 X 页 习题；或课堂例题">') +
      field('难度 / STARS', '<select id="f-stars">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (normalizeStars(entry.stars) === n ? ' selected' : '') + '>' + stars(n) + '</option>'; }).join('') + '</select>') +
      field('掌握状态 / STATUS', '<select id="f-status">' + statusOptions + '</select>') +
      field('一句话概括 / SUMMARY', '<input id="f-summary" value="' + attr(entry.summary || '') + '" placeholder="数分条目必填；其他可留空">', '', 'full') +
    '</div>' +
    '<div class="form-section"><h4>错因标签</h4><div class="check-row" id="f-errtypes">' +
      types.map(function (t) {
        return '<label><input type="checkbox" value="' + attr(t) + '"' + ((entry.errorTypes || []).indexOf(t) >= 0 ? ' checked' : '') + '> ' + esc(t) + '</label>';
      }).join('') + '</div>' +
      '<div class="field" style="margin-top:12px"><label>错因说明 / 易错点</label><textarea id="f-errornote" placeholder="具体一句：当时卡在哪">' + esc(entry.errorNote || '') + '</textarea></div>' +
    '</div>' +
    attachmentsField +
    attachmentsHtml +
    '<div class="form-section"><h4>内容块 <span class="faint" style="font-size:11px;font-weight:400">支持 Markdown + LaTeX</span></h4>' +
      '<div id="blockEditors">' + blocksHtml + '</div>' +
      '<div class="mini-actions" style="margin-top:10px;align-items:center;gap:8px">' +
        '<select class="select" id="newBlockKey">' +
          '<option value="extra">自定义段落</option>' +
          '<option value="original">题目 / 原题</option>' +
          '<option value="standard">考试标准解答</option>' +
          '<option value="analysis">详细解析</option>' +
          '<option value="answer">答案</option>' +
          '<option value="pitfalls">易错点 / 卡点</option>' +
          '<option value="verification">验证</option>' +
          '<option value="reviewlog">复习记录</option>' +
        '</select>' +
        '<button class="btn btn-xs" data-act="add-block" type="button">添加内容块</button>' +
      '</div>' +
    '</div>' +
    (isGaodai ? '<div class="form-section"><h4>模板要点（挂在条目里的四段） <span class="faint" style="font-size:11px;font-weight:400">支持 Markdown + LaTeX</span></h4><div class="field-grid">' +
      field('识别特征', '<textarea id="tn-features" placeholder="支持 Markdown 和 $...$ 公式">' + esc(entry.templateNotes && entry.templateNotes.features || '') + '</textarea>', '', 'full') +
      field('首选方法', '<textarea id="tn-method" placeholder="支持 Markdown 和 $...$ 公式">' + esc(entry.templateNotes && entry.templateNotes.method || '') + '</textarea>', '', 'full') +
      field('步骤骨架', '<textarea id="tn-skeleton" placeholder="支持 Markdown 和 $...$ 公式">' + esc(entry.templateNotes && entry.templateNotes.skeleton || '') + '</textarea>', '', 'full') +
      field('易错点', '<textarea id="tn-pitfalls" placeholder="支持 Markdown 和 $...$ 公式">' + esc(entry.templateNotes && entry.templateNotes.pitfalls || '') + '</textarea>', '', 'full') +
    '</div></div>' : '') +
    '<div class="form-section"><h4>变式（自测）</h4><div id="variantEditors">' + variantsHtml + '</div>' +
      '<button class="btn btn-xs" data-act="add-variant" type="button" style="margin-top:8px">添加变式</button>' +
    '</div>' +
    '<p class="form-note">保存后立即写入本机浏览器；若已启动 server.js，会自动同步到 data/state.json。原文文件不会被修改。</p>';

  qs('#editorTitle').textContent = (entryId ? '编辑' : '新增') + ' · ' + s.name;
  qs('#editorBody').innerHTML = form;
  dlg.showModal();
  setTimeout(function () { var first = qs('#f-code'); if (first) first.focus(); }, 60);
}

function field(label, control, hint, spanClass) {
  return '<div class="field' + (spanClass === 'full' ? ' full' : '') + '"><label>' + esc(label) + '</label>' + control +
    (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</div>';
}

function blockEditorHtml(b, i) {
  return '<div class="block-editor" data-block data-key="' + attr(b.key || 'extra') + '">' +
    '<div class="block-editor-head">' +
      '<input class="b-title" value="' + attr(b.title || '内容') + '" aria-label="内容块标题">' +
      '<div class="mini-actions">' +
        '<button class="icon-mini" data-act="block-up" type="button" title="上移">↑</button>' +
        '<button class="icon-mini" data-act="block-down" type="button" title="下移">↓</button>' +
        '<button class="icon-mini" data-act="block-preview" type="button" title="预览">◉</button>' +
        '<button class="icon-mini" data-act="block-remove" type="button" title="删除">×</button>' +
      '</div>' +
    '</div>' +
    '<textarea class="b-md" placeholder="支持 Markdown；公式用 $...$ 或 $$...$$">' + esc(b.md || '') + '</textarea>' +
    '<div class="preview"></div>' +
  '</div>';
}

function variantEditorHtml(v) {
  return '<div class="block-editor" data-variant>' +
    '<div class="block-editor-head"><input class="v-title" value="变式" aria-label="变式标题">' +
      '<div class="mini-actions"><button class="icon-mini" data-act="variant-remove" type="button" title="删除">×</button></div></div>' +
    '<textarea class="v-q" placeholder="变式题面">' + esc(v.q || '') + '</textarea>' +
    '<textarea class="v-a" style="margin-top:6px" placeholder="变式答案">' + esc(v.a || '') + '</textarea>' +
  '</div>';
}

function addBlockEditor(key) {
  var titles = {
    original: '原题', standard: '考试标准解答', analysis: '详细解析', answer: '答案',
    pitfalls: '易错点 / 卡点', verification: '验证', reviewlog: '复习记录', extra: '补充说明'
  };
  var wrap = document.createElement('div');
  wrap.innerHTML = blockEditorHtml({ key: key, title: titles[key] || '补充说明', md: '' });
  var host = qs('#blockEditors');
  if (host) host.appendChild(wrap.firstChild);
}

function collectEditor() {
  var dlg = qs('#editor');
  var subjectId = dlg.dataset.subject;
  var draft = dlg._draft;
  var e = draft ? deepClone(draft) : blankEntry(subjectId);
  e.code = qs('#f-code').value.trim();
  e.date = formatEntryDate(qs('#f-date').value.trim() || nowIso());
  e.chapter = canonicalChapterFor(subjectId, qs('#f-chapter').value.trim());
  e.points = qs('#f-points').value.split(/[；;、,，|]/).map(function (x) { return x.trim(); }).filter(Boolean);
  e.source = qs('#f-source').value.trim();
  e.stars = normalizeStars(+qs('#f-stars').value || 2);
  e.status = qs('#f-status').value === 'mastered' ? 'mastered' : 'unmastered';
  e.summary = qs('#f-summary').value.trim();
  var tid = qs('#f-template').value;
  e.templateId = tid;
  var tpl = tid ? templateById(subjectId, tid) : null;
  e.templateTitle = tpl ? tpl.title : '';
  e.errorTypes = qsa('#f-errtypes input:checked').map(function (x) { return x.value; });
  e.errorNote = qs('#f-errornote').value.trim();

  var blocks = [];
  qsa('#blockEditors [data-block]').forEach(function (node) {
    var md = qs('.b-md', node).value;
    var title = qs('.b-title', node).value.trim() || '内容';
    if (!md.trim() && !title) return;
    blocks.push({ key: node.getAttribute('data-key') || 'extra', title: title, md: md });
  });
  if (!blocks.length) blocks = defaultBlocks(subjectId);
  e.blocks = blocks;
  try {
    var attEl = qs('#f-attachments');
    e.attachments = attEl ? JSON.parse(attEl.value || '[]') : [];
    if (!Array.isArray(e.attachments)) e.attachments = [];
  } catch (attErr) { e.attachments = []; }

  if (subjectId === 'gaodai') {
    e.templateNotes = {
      features: qs('#tn-features') ? qs('#tn-features').value.trim() : '',
      method: qs('#tn-method') ? qs('#tn-method').value.trim() : '',
      skeleton: qs('#tn-skeleton') ? qs('#tn-skeleton').value.trim() : '',
      pitfalls: qs('#tn-pitfalls') ? qs('#tn-pitfalls').value.trim() : ''
    };
  }
  var variants = [];
  qsa('#variantEditors [data-variant]').forEach(function (node) {
    var q = qs('.v-q', node).value.trim();
    var a = qs('.v-a', node).value.trim();
    if (q) variants.push({ q: q, a: a });
  });
  e.variants = variants;
  e.review = e.review || { d1: false, d3: false, d7: false, d15: false, d30: false };
  e.review.mastered = e.status === 'mastered';
  e.subject = subjectId;
  e.id = draft && dlg.dataset.mode === 'edit' ? draft.id : subjectId + '-' + e.code;
  e.updatedAt = nowIso();
  if (!e.chapter || e.chapter === '未分章') e.chapter = smartChapterFor(subjectId, e) || e.chapter;
  return e;
}

function saveEditor() {
  var dlg = qs('#editor');
  var subjectId = dlg.dataset.subject;
  var mode = dlg.dataset.mode;
  var e;
  try { e = collectEditor(); } catch (err) { toast('保存失败：' + err.message); return; }
  if (!e.code) { toast('编号不能为空'); return; }
  var list = entriesOf(subjectId);
  var dup = list.filter(function (x) { return x.code === e.code && x.id !== e.id; });
  if (dup.length) { toast('编号 ' + e.code + ' 已存在'); return; }

  var previous = null;
  var inserted = false;
  var libTplBefore = 0, libBankBefore = 0;
  if (mode === 'edit') {
    var idx = list.findIndex(function (x) { return x.id === e.id; });
    if (idx >= 0) { previous = list[idx]; list[idx] = e; }
  } else {
    if (list.some(function (x) { return x.id === e.id; })) e.id = subjectId + '-' + e.code + '-' + Date.now();
    list.push(e);
    inserted = true;
    libTplBefore = ((state.userTemplates && state.userTemplates[subjectId]) || []).length;
    libBankBefore = ((state.userBank && state.userBank[subjectId]) || []).length;
    syncEntryToLibraries(e);
  }
  state.activeSubject = subjectId;
  var saved = markDirty(null, true);
  if (!saved) {
    // 保存失败：回滚内存中的半成品，保留编辑器里的草稿，绝不提示“已保存”。
    if (inserted) {
      state.entries[subjectId] = entriesOf(subjectId).filter(function (x) { return x.id !== e.id; });
      if (state.userTemplates && state.userTemplates[subjectId]) state.userTemplates[subjectId].length = Math.min(state.userTemplates[subjectId].length, libTplBefore);
      if (state.userBank && state.userBank[subjectId]) state.userBank[subjectId].length = Math.min(state.userBank[subjectId].length, libBankBefore);
    } else if (previous) {
      var rollback = entriesOf(subjectId).findIndex(function (x) { return x.id === e.id; });
      if (rollback >= 0) state.entries[subjectId][rollback] = previous;
    }
    toast('保存失败：本机存储不可用，内容还在编辑器里，请先修复存储或导出备份', { title: '未保存' });
    return;
  }
  toast(mode === 'edit' ? '已保存 · ' + e.code : '已新增 · ' + e.code);
  if (typeof queueAutoAi === 'function') queueAutoAi(e);
  dlg.close();
  state.activeView = 'entries';
  ui.open[e.id] = true;
  location.hash = '#/' + subjectRouteId(subjectId) + '/entries';
  render();
  var el = qs('#entry-' + e.id);
  if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function deleteEntry(subjectId, entryId) {
  var e = findEntry(subjectId, entryId);
  if (!e) return;
  confirmDialog('要删除这道错题吗？', '将删除 ' + e.code + ' · ' + entryTitle(e) + '。只会删除网页里的这一条，原始 Markdown 文件不受影响；删除后无法撤销，请确认。', function () {
    state.entries[subjectId] = entriesOf(subjectId).filter(function (x) { return x.id !== entryId; });
    delete ui.open[entryId];
    markDirty();
    render();
    toast('已删除 ' + e.code);
  }, true);
}

function addFromBank(bankId) {
  var items = bankOf(state.activeSubject);
  var it = items.filter(function (x) { return x.id === bankId; })[0];
  if (!it) return;
  var e = blankEntry(state.activeSubject);
  e.summary = it.title || '';
  e.chapter = it.chapter || e.chapter;
  e.points = (it.pointKeys || []).slice();
  e.templateId = it.templateId || '';
  var tpl = it.templateId ? templateById(state.activeSubject, it.templateId) : null;
  e.templateTitle = tpl ? tpl.title : '';
  e.source = it.source || ('题库 ' + it.id);
  e.stars = normalizeStars(it.difficulty || 2);
  e.blocks = [
    { key: 'original', title: '题目', md: bankQuestionMarkdown(it) },
    { key: 'standard', title: '考试标准解答过程', md: it.standardSolution || it.answer || '' },
    { key: 'analysis', title: '详细解析', md: it.detailedAnalysis || (it.solution || []).map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n') },
    { key: 'answer', title: '答案', md: it.answer || '' },
    { key: 'attempt', title: '我的卡点', md: '' }
  ];
  openEditor(state.activeSubject, null, e);
}

function addFromEntry(entryId) {
  var src = findEntry(state.activeSubject, entryId);
  if (!src) return;
  var e = blankEntry(state.activeSubject);
  e.chapter = src.chapter;
  e.chapterCode = src.chapterCode;
  e.templateId = src.templateId;
  e.templateTitle = src.templateTitle;
  e.points = (src.points || []).slice();
  e.stars = normalizeStars(src.stars || 2);
  e.blocks = defaultBlocks(state.activeSubject);
  openEditor(state.activeSubject, null, e);
}

/* ---------- confirm dialog ---------- */
function confirmDialog(title, text, onOk, danger, okText) {
  var dlg = qs('#confirm');
  dlg.classList.toggle('is-danger', !!danger);
  qs('#confirmTitle').textContent = title;
  qs('#confirmBody').innerHTML = (danger ? '<p class="confirm-warning">此操作不可撤销。</p>' : '') +
    '<p style="margin:0;color:var(--muted);font-size:13px;line-height:1.8">' + esc(text) + '</p>';
  var btn = qs('#confirmOk');
  var fresh = btn.cloneNode(true);
  fresh.className = danger ? 'btn btn-primary btn-confirm-danger' : 'btn btn-primary';
  fresh.textContent = okText || (danger ? '确认删除' : '确认');
  btn.parentNode.replaceChild(fresh, btn);
  fresh.addEventListener('click', function () { dlg.close(); onOk(); });
  dlg.showModal();
}

/* ---------- settings ---------- */
function openSettings() {
  var dlg = qs('#settings');
  var theme = (state.prefs && state.prefs.theme) || 'auto';
  var st = statsFor(state.activeSubject);
  var compactNote = window.innerWidth < 560;
  var staticNote = PAGES
    ? '<div class="restore-banner" style="margin-bottom:6px"><span><b>' + (IS_GITHUB_PAGES ? 'GitHub Pages 静态版' : '静态版') + '</b>：' + (compactNote ? '数据只在本机浏览器；AI与同步在设置里配置；用「导出」保存备份。' : '数据只在本机浏览器；AI 可在下面配置 OpenAI / DeepSeek / Gemini / Claude / Grok / Qwen / Kimi 等模型，跨设备同步需本机运行 server.js。用「导出」保存备份。') + '</span></div>'
    : '';
  var currentLang = (state.prefs && state.prefs.lang) || 'zh-CN';
  var languageRow =
    '<div class="settings-section"><div class="settings-section-head"><span class="settings-section-title">语言与翻译</span><span class="settings-section-note">LANGUAGE</span></div>' +
    '<div class="setting-row"><div><div class="st">界面语言</div><div class="sd">当前：' + esc(languageName(currentLang)) + '。界面与内容翻译会按所选语言缓存；未配置 AI 时仅简体中文可用。</div></div>' +
      '<div class="multi-actions"><span class="chip">' + esc(languageName(currentLang)) + '</span><button class="btn btn-xs" data-act="open-language" type="button">更改语言</button></div></div>' +
    '</div>';
  var aiCfg = aiConfig();
  var aiReadyNow = aiConfigReady();
  var deferCount = typeof aiDeferCount === 'function' ? aiDeferCount() : 0;
  var showDefer = (typeof aiIsDeepSeek === 'function' && aiIsDeepSeek()) || deferCount > 0;
  var deferRow = showDefer
    ? '<div class="setting-row"><div><div class="st">暂存箱</div><div class="sd">DeepSeek / DeepSeek Harness 峰时先暂存题目和图片，谷时再送入智能录入；只保存在本机。</div></div>' +
      '<div class="multi-actions ai-defer-setting"><span class="chip" id="aiDeferSettingCount">' + deferCount + ' 条</span><button class="btn btn-xs" data-act="open-ai-defer" type="button">打开</button></div></div>'
    : '';
  var thinkCfg = aiThinkingConfig();
  var thinkOptions = AI_THINKING_EFFORTS.map(function (x) {
    return '<option value="' + x.id + '"' + (thinkCfg.effort === x.id ? ' selected' : '') + '>' + x.label + '</option>';
  }).join('');
  var thinkingRow =
    '<div class="setting-row settings-thinking-row" id="settingsThinkingRow"><div><div class="st">思考模式</div><div class="sd">生成前先推理再作答。关闭后直接作答，通常更快；强度越高越稳，耗时也越长。设置会与智能录入里的控制同步。</div></div>' +
      '<div class="multi-actions settings-thinking-actions">' +
        '<label class="ai-thinking-toggle"><input type="checkbox" id="settingsThinkingToggle" aria-label="开启思考模式"' + (thinkCfg.enabled ? ' checked' : '') + '> <span id="settingsThinkingState">' + (thinkCfg.enabled ? '已开启' : '已关闭') + '</span></label>' +
        '<label class="ai-thinking-effort"><span>强度</span><select id="settingsThinkingEffort" class="select" aria-label="思考强度"' + (thinkCfg.enabled ? '' : ' disabled') + '>' + thinkOptions + '</select></label>' +
      '</div></div>';
  var body = staticNote +
'<div class="settings-section"><div class="settings-section-head"><span class="settings-section-title">外观与称呼</span><span class="settings-section-note">PROFILE</span></div>' +
    '<div class="setting-row"><div><div class="st">主题</div><div class="sd">浅色 / 深色 / 跟随系统</div></div>' +
      '<div class="seg">' + THEME_ORDER.map(function (t) {
        return '<button data-act="set-theme" data-theme="' + t + '" aria-pressed="' + (theme === t) + '" type="button">' + THEME_LABEL[t] + '</button>';
      }).join('') + '</div></div>' +
    '<div class="setting-row"><div><div class="st">你的称呼</div><div class="sd">只用于首页问候；留空就不显示名字</div></div>' +
      '<div class="multi-actions user-name-actions"><input id="userNameInput" class="user-name-input" type="text" maxlength="16" autocomplete="off" value="' + attr((state.prefs && state.prefs.userName) || '') + '" placeholder="例如：小林"><button class="btn btn-xs" data-act="save-user-name" type="button">保存</button></div></div>' +
    '</div>' +
languageRow +
'<div class="settings-section"><div class="settings-section-head"><span class="settings-section-title">AI与智能录入</span><span class="settings-section-note">AI</span></div>' +
    '<div class="setting-row ai-config-row"><div class="ai-config-head"><div><div class="st">在线 AI 服务</div><div class="sd">支持 OpenAI、DeepSeek、Google Gemini、Anthropic、xAI Grok、通义千问、Moonshot Kimi、DeepSeek Harness 等厂商接口。API Key 只保存在本机浏览器，不写入错题数据；纯静态页需要接口允许浏览器跨域。</div></div><span class="chip ' + (aiReadyNow ? 'chip-ok' : '') + '">' + (aiReadyNow ? '已配置' : '未配置') + '</span></div>' +
      '<div class="ai-config-grid">' +
        '<label class="field full"><span>协议</span>' +
          '<div class="model-combo protocol-combo">' +
            '<select id="aiProtocol" aria-label="AI 协议">' +
              aiProtocolOrder().map(function (k) {
                return '<option value="' + k + '"' + (aiCfg.protocol === k ? ' selected' : '') + '>' + esc(AI_PROTOCOL_PRESETS[k].label) + '</option>';
              }).join('') +
            '</select>' +
            '<span class="model-combo-btn" aria-hidden="true"></span>' +
          '</div>' +
        '</label>' +
        '<label class="field full"><span>模型</span>' +
          '<div class="model-combo">' +
            '<input id="aiModel" type="text" autocomplete="off" spellcheck="false" value="' + attr(aiCfg.model) + '" placeholder="选择或输入模型名" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="aiModelMenu" title="直接输入，或点右侧箭头选择">' +
            '<button type="button" class="model-combo-btn" data-act="model-pick" aria-label="展开模型列表" title="展开模型列表"></button>' +
            '<div id="aiModelMenu" class="model-menu" role="listbox" hidden></div>' +
          '</div>' +
          '<span class="hint ai-model-hint" id="aiModelHint"></span>' +
        '</label>' +
        '<label class="field full"><span>API 地址（Base URL）</span><input id="aiBaseUrl" type="text" autocomplete="off" spellcheck="false" value="' + attr(aiCfg.baseUrl) + '" placeholder="https://api.openai.com/v1"></label>' +
        '<label class="field full"><span>API Key</span><input id="aiApiKey" type="password" autocomplete="off" spellcheck="false" value="" placeholder="' + (aiCfg.apiKey ? '已保存，留空表示不修改' : '粘贴 API Key') + '"></label>' +
        '<p class="form-note" role="note">密钥只存本机 localStorage，导出备份会剔除；换设备需重新填写。</p>' +
      '</div>' +
      '<div class="ai-config-actions"><button class="btn btn-xs btn-primary" data-act="save-ai-config" type="button">保存 AI 设置</button>' +
        '<button class="btn btn-xs" data-act="clear-ai-config" type="button">清除</button>' +
        (aiBlacklistCount() ? '<button class="btn btn-xs" data-act="clear-ai-model-blacklist" type="button">恢复已移除的模型</button>' : '') +
        '<span class="faint">各厂商有独立预设；也可选「OpenAI 兼容」手动填任意兼容接口。列表只保留可对话生成文本的模型；厂商返回模型不可用时会自动移除，可用「恢复已移除的模型」找回。本机 server 也可用 AI_* 环境变量，无需在页面保存 Key。</span></div></div>' +
    thinkingRow +
    deferRow +
    '<div class="setting-row"><div><div class="st">录入后 AI 自动补全</div><div class="sd">新错题保存后在 10 分钟内自动调用对应 skill，补全考试标准解答、详细解析、答案、模板要点与变式；页面关闭会顺延到下次打开。当前待补全 ' + (typeof autoAiPendingCount === 'function' ? autoAiPendingCount() : 0) + ' 条。</div></div>' +
      '<button class="btn btn-xs' + (autoAiEnabled() ? ' btn-primary' : '') + '" data-act="toggle-auto-ai" type="button">' + (autoAiEnabled() ? '已开启' : '已关闭') + '</button></div>' +
    '</div>' +
'<div class="settings-section"><div class="settings-section-head"><span class="settings-section-title">同步与数据</span><span class="settings-section-note">SYNC</span></div>' +
    '<div class="setting-row"><div><div class="st">同步状态</div><div class="sd"><span class="sync-pill"><span class="sync-dot" data-sync-dot></span><span data-sync-text>本机保存</span></span></div></div>' +
      '<div class="multi-actions"><button class="btn btn-xs" data-act="pull-sync" type="button">从云端拉取</button>' +
      '<button class="btn btn-xs" data-act="push-sync" type="button">立即推送</button></div></div>' +
    '<div class="setting-row"><div><div class="st">访问口令</div><div class="sd">服务器设置 NOTEBOOK_TOKEN 时填写；区分大小写</div></div>' +
      '<input id="syncToken" value="' + attr(sync.token) + '" placeholder="留空表示不使用" class="sync-token-input"></div>' +
    '<div class="setting-row"><div><div class="st">服务器</div><div class="sd">' + (sync.available ? '已连接 /api/state；数据写入 data/state.json' : '未连接 server.js：数据只在本机；启动后刷新页面即可同步') + '</div></div>' +
      '<span class="chip">' + (sync.available ? 'ONLINE' : 'LOCAL') + '</span></div>' +
    '<div class="setting-row"><div><div class="st">数据备份</div><div class="sd">导出为 JSON，可导入到另一台设备；不依赖服务器</div></div>' +
      '<div class="multi-actions"><button class="btn btn-xs" data-act="export-state" type="button">导出</button>' +
      '<button class="btn btn-xs" data-act="import-state" type="button">导入</button></div></div>' +
    '<div class="setting-row"><div><div class="st">恢复初始数据</div><div class="sd">清空本机改动，回到空白错题本；模板与题库保留</div></div>' +
      '<button class="btn btn-xs btn-danger" data-act="reset-state" type="button">恢复</button></div>' +
    '</div>' +
'<div class="settings-section"><div class="settings-section-head"><span class="settings-section-title">关于与更新</span><span class="settings-section-note">ABOUT</span></div>' +
    '<div class="setting-row"><div><div class="st">更新记录</div><div class="sd">最近更新置顶并默认展开，历史更新折叠；不会自动弹出</div></div>' +
      '<button class="btn btn-xs" data-act="open-changelog" type="button">查看更新</button></div>' +
    '<div class="setting-row"><div><div class="st">当前科目规模</div><div class="sd">' + st.total + ' 道错题 · ' + st.templates + ' 张模板 · ' + st.bank + ' 道题库题</div></div></div>' +
    '</div>' +
    '<p class="form-note">数据默认只保存在这个浏览器。手机上访问同一台电脑的地址（node server.js --lan 启动后看终端里的 LAN 地址）即可共享同一份 data/state.json；公网访问时请设置 NOTEBOOK_TOKEN 并走 HTTPS 隧道。</p>';
  qs('#settingsBody').innerHTML = body;
  dlg.showModal();
  if (typeof aiUpdateModelHint === 'function') aiUpdateModelHint();
}

function languageBodyHtml() {
  var current = (state.prefs && state.prefs.lang) || 'zh-CN';
  return '<div class="lang-grid">' + LANGUAGES.map(function (l) {
    return '<button class="lang-option' + (l.id === current ? ' is-on' : '') + '" data-no-i18n data-act="set-language" data-id="' + attr(l.id) + '" type="button">' +
      '<span class="lang-native">' + esc(l.native) + '</span>' +
      '<span class="lang-en">' + esc(l.en) + '</span>' +
      '<span class="lang-check" aria-hidden="true">' + (l.id === current ? '✓' : '') + '</span>' +
    '</button>';
  }).join('') + '</div>' +
  '<p class="form-note lang-status' + (typeof aiConfigReady === 'function' && aiConfigReady() ? '' : ' is-warn') + '">' +
    (typeof aiConfigReady === 'function' && aiConfigReady()
      ? '语言按英文名称 A–Z 排列；选择保存在本机，刷新或切换页面后保持。界面与内容翻译由已配置的 AI 生成并缓存；术语按目标语言教材与期刊标准处理；译文还会自动检查公式、漏译与未翻译中文。'
      : '还没有配置 AI。当前只能使用简体中文；配置 AI 后才能生成其他语言的界面和内容翻译。') +
  '</p>';
}

function openLanguageDialog() {
  var dlg = qs('#languageDialog');
  var body = qs('#languageBody');
  if (!dlg || !body) return;
  body.innerHTML = languageBodyHtml();
  dlg.showModal();
}

function setLanguage(id) {
  if (!LANGUAGES.some(function (l) { return l.id === id; })) return;
  var current = (state.prefs && state.prefs.lang) || 'zh-CN';
  if (id === current) return;
  if (id !== 'zh-CN' && (typeof aiConfigReady !== 'function' || !aiConfigReady())) {
    toast('先在设置里配置 AI，才能生成语言界面与内容翻译');
    return;
  }
  if (typeof i18nResetForSwitch === 'function') i18nResetForSwitch();
  if (typeof i18nRestoreAll === 'function') i18nRestoreAll();
  state.prefs = state.prefs || {};
  state.prefs.lang = id;
  markDirty();
  applyLanguage();
  if (typeof i18nRefreshOpenDialogs === 'function') i18nRefreshOpenDialogs();
  else {
    var body = qs('#languageBody');
    if (body) body.innerHTML = languageBodyHtml();
  }
  render();
  toast(id === 'zh-CN' ? '已切回简体中文' : '正在生成 ' + languageName(id) + ' 翻译…');
}

function saveUserName() {
  var input = qs('#userNameInput');
  if (!input) return;
  var name = String(input.value || '').replace(/\s+/g, ' ').trim().slice(0, 16);
  state.prefs = state.prefs || {};
  state.prefs.userName = name;
  markDirty();
  persistLocal();
  input.value = name;
  if (typeof renderHomeClock === 'function') renderHomeClock();
  toast(name ? '称呼已保存：' + name : '已清除称呼');
}

function backupSafeState() {
  var copy = deepClone(state);
  var blocked = /^(api.*|ai.*|autoAi|aiAuto|model|protocol|baseUrl|dshToken|accessToken|token|key)$/i;
  function scrub(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(scrub); return; }
    Object.keys(value).forEach(function (k) {
      if (blocked.test(k)) { delete value[k]; return; }
      scrub(value[k]);
    });
  }
  scrub(copy);
  SUBJECTS.forEach(function (s) {
    ((copy.entries && copy.entries[s.id]) || []).forEach(function (e) {
      if (!e || typeof e !== 'object') return;
      delete e.aiStatus; delete e.aiAttempts; delete e.aiError;
      delete e.aiModel; delete e.aiSkill;
    });
    ((copy.userBank && copy.userBank[s.id]) || []).forEach(function (it) {
      if (!it || typeof it !== 'object') return;
      delete it.aiModel; delete it.aiStatus; delete it.aiSkill;
    });
  });
  return copy;
}

function backupSafeLibraries(libs) {
  var copy = deepClone(libs);
  var blocked = /^(api.*|ai.*|autoAi|aiAuto|model|protocol|baseUrl|dshToken|accessToken|token|key)$/i;
  function scrub(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(scrub); return; }
    Object.keys(value).forEach(function (k) {
      if (blocked.test(k)) { delete value[k]; return; }
      scrub(value[k]);
    });
  }
  scrub(copy);
  return copy;
}

async function exportState() {
  if (storageRecoveryBlocked) {
    var raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { toast('浏览器禁止读取存储，无法导出原始数据'); return; }
    if (raw == null) { toast('没有可导出的原始存储'); return; }
    var recoveryLink = document.createElement('a');
    recoveryLink.href = URL.createObjectURL(new Blob([raw], { type: 'application/octet-stream' }));
    recoveryLink.download = '错题本原始数据-待恢复-' + todayStamp() + '.txt';
    document.body.appendChild(recoveryLink);
    recoveryLink.click();
    setTimeout(function () { URL.revokeObjectURL(recoveryLink.href); recoveryLink.remove(); }, 800);
    toast('已导出未修改的原始存储，请保留此文件用于恢复');
    return;
  }
  var libraries = exportLibraryPayload();
  if (typeof i18nNeeds === 'function' && i18nNeeds() && typeof i18nTranslateMany === 'function') {
    var strings = i18nBackupStrings(state, libraries);
    if (strings.length) {
      toast('正在生成备份翻译 · ' + strings.length + ' 条');
      await i18nTranslateMany(strings);
    }
  }
  var payload = {
    app: 'sanke-cuotiben',
    version: 4,
    exportedAt: nowIso(),
    meta: {
      language: (state.prefs && state.prefs.lang) || 'zh-CN',
      languageName: languageName((state.prefs && state.prefs.lang) || 'zh-CN'),
      translation: 'AI 生成内容已按导出语言保存；题库与规范内容随语言包更新。',
      builtinBankExcluded: true,
      final: backupFinalCount(state)
    },
    state: backupSafeState(),
    libraries: backupSafeLibraries(libraries)
  };
  var trans = typeof i18nCacheForBackup === 'function' ? i18nCacheForBackup() : null;
  if (trans) payload.translations = trans;
  var data = JSON.stringify(payload);
  var blob = new Blob([data], { type: 'application/json' });
  var fileName = '错题本备份-' + todayStamp() + '.json';
  try {
    if (typeof CompressionStream !== 'undefined') {
      var stream = new Blob([data], { type: 'application/json' }).stream().pipeThrough(new CompressionStream('gzip'));
      var buf = await new Response(stream).arrayBuffer();
      blob = new Blob([buf], { type: 'application/gzip' });
      fileName += '.gz';
    }
  } catch (e) { /* fall back to compact JSON */ }
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  toast('已导出 ' + (fileName.slice(-3) === '.gz' ? 'gzip 压缩' : '紧凑') + '备份 · ' + Math.round(blob.size / 1024) + ' KB · 内置题库不写入备份，打开页面会自动恢复');
}

var pendingImport = null;

function importCount(st) {
  var n = 0;
  SUBJECTS.forEach(function (s) { n += ((st.entries && st.entries[s.id]) || []).length; });
  return n;
}

function importLibraryCount(st, lib) {
  var t = 0, b = 0;
  var src = lib || { templates: (st && st.userTemplates) || {}, bank: (st && st.userBank) || {} };
  SUBJECTS.forEach(function (s) {
    t += ((src.templates && src.templates[s.id]) || []).length;
    b += ((src.bank && src.bank[s.id]) || []).length;
  });
  return { templates: t, bank: b };
}

function importNoteCount(st) {
  var n = 0;
  if (Array.isArray(st.noteBooks)) {
    st.noteBooks.forEach(function (b) { n += ((b && b.pages) || []).length; });
  } else if (st.notebooks && typeof st.notebooks === 'object') {
    Object.keys(st.notebooks).forEach(function (k) {
      (st.notebooks[k] || []).forEach(function (b) { n += ((b && b.pages) || []).length; });
    });
  } else if (st.notes && typeof st.notes === 'object') {
    SUBJECTS.forEach(function (s) { n += ((st.notes[s.id]) || []).length; });
  }
  return n;
}

function backupFinalCount(st) {
  var fe = (st && st.finalExam) || {};
  return {
    papers: Array.isArray(fe.papers) ? fe.papers.length : 0,
    exams: Array.isArray(fe.examHistory) ? fe.examHistory.length : 0,
    active: fe.mock && fe.mock.status === 'active' ? 1 : 0
  };
}

function importSubjectRows(st) {
  return SUBJECTS.map(function (s) {
    var entries = ((st.entries && st.entries[s.id]) || []).length;
    return '<span><b>' + esc(s.name) + '</b><small>' + entries + ' 条</small></span>';
  }).join('');
}

function importStateFile(file) {
  if (!file) return;
  var gz = /\.gz$/i.test(file.name || '') || file.type === 'application/gzip';
  if (gz) {
    if (typeof DecompressionStream === 'undefined') { toast('当前浏览器不支持解压 gzip，请用未压缩的 JSON 备份'); return; }
    file.arrayBuffer().then(function (buf) {
      var stream = new Blob([buf], { type: 'application/gzip' }).stream().pipeThrough(new DecompressionStream('gzip'));
      return new Response(stream).text();
    }).then(function (text) { openImportPayload(text, file.name || '备份文件'); }).catch(function () {
      toast('导入失败：备份文件无法解压或已损坏，请重新导出未压缩的 JSON');
    });
    return;
  }
  var reader = new FileReader();
  reader.onload = function () { openImportPayload(String(reader.result), file.name || '备份文件'); };
  reader.readAsText(file, 'utf-8');
}

function openImportPayload(text, fileName) {
  try {
    var raw = String(text);
    if (raw.length > 30 * 1024 * 1024) throw new Error('备份文件超过 30MB，请先拆分或重新导出');
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('备份内容不是对象');
    var st = parsed.state ? parsed.state : parsed;
    if (!st || typeof st !== 'object' || Array.isArray(st) || !st.entries || typeof st.entries !== 'object' || Array.isArray(st.entries)) {
      throw new Error('不像错题本数据');
    }
    if (st.version != null && (!isFinite(Number(st.version)) || Number(st.version) > 1)) {
      throw new Error('备份版本 ' + st.version + ' 高于当前页面支持的版本 1');
    }
    migrateLegacySubjectKeys(st);
    if (!sanitizeStateCollections(st)) throw new Error('备份结构损坏，已拒绝导入');
    migrateState(st);
    st.clearEpoch = EMPTY_EPOCH;
    st.prefs = st.prefs || { theme: 'auto' };
    var libs = parsed.libraries || parsed.library || null;
    if (!libs && (st.userTemplates || st.userBank)) libs = { templates: st.userTemplates || {}, bank: st.userBank || {} };
    if (libs) {
      if (typeof libs !== 'object' || Array.isArray(libs)) throw new Error('备份中的模板/题库结构损坏');
      libs = { templates: (libs.templates && typeof libs.templates === 'object') ? libs.templates : {}, bank: (libs.bank && typeof libs.bank === 'object') ? libs.bank : {} };
    }
    pendingImport = { state: st, fileName: fileName, libraries: libs };
    openImportDialog();
  } catch (e) {
    toast('导入失败：' + (e && e.message ? e.message : '无法读取备份'));
  }
}

function openImportDialog() {
  var dlg = qs('#importDialog');
  var body = qs('#importBody');
  if (!dlg || !body || !pendingImport) return;
  var incoming = pendingImport.state;
  var currentN = importCount(state);
  var incomingN = importCount(incoming);
  var currentNotes = importNoteCount(state);
  var incomingNotes = importNoteCount(incoming);
  var currentLib = importLibraryCount(state, null);
  var incomingLib = importLibraryCount(incoming, pendingImport.libraries);
  var currentFinal = backupFinalCount(state), incomingFinal = backupFinalCount(incoming);
  body.innerHTML = '' +
    '<p class="form-note" style="margin-top:0">文件：<b>' + esc(pendingImport.fileName) + '</b> · 当前本机 ' + currentN + ' 条 · ' + currentNotes + ' 页笔记 · ' + currentLib.templates + ' 模板 · ' + currentLib.bank + ' 题 · 模拟卷 ' + currentFinal.papers + ' 张 · 模拟考 ' + currentFinal.exams + ' 份<br>导入文件 ' + incomingN + ' 条 · ' + incomingNotes + ' 页笔记 · ' + incomingLib.templates + ' 模板 · ' + incomingLib.bank + ' 题 · 模拟卷 ' + incomingFinal.papers + ' 张 · 模拟考 ' + incomingFinal.exams + ' 份</p>' +
    '<div class="import-counts">' +
      '<div><span class="lbl">当前数据</span><div class="import-subjects">' + importSubjectRows(state) + '</div></div>' +
      '<div><span class="lbl">导入文件</span><div class="import-subjects">' + importSubjectRows(incoming) + '</div></div>' +
    '</div>' +
    '<div class="import-choices">' +
      '<label class="import-choice"><input type="radio" name="importMode" value="merge" checked>' +
        '<span><b>合并到现有数据</b><small>保留当前条目，只追加新的错题、模板和题库题；内容完全相同自动跳过，编号冲突时按章节顺序重新编号。</small></span></label>' +
      '<label class="import-choice"><input type="radio" name="importMode" value="replace">' +
        '<span><b>覆盖当前数据</b><small>用导入文件替换当前所有条目和偏好设置；当前数据不会自动备份。</small></span></label>' +
    '</div>' +
    '<p class="form-note">建议先「导出」当前数据做备份，再执行覆盖。</p>';
  dlg.showModal();
  setTimeout(function () {
    var mergeRadio = qs('input[name="importMode"][value="merge"]');
    if (mergeRadio) mergeRadio.focus();
  }, 50);
}

var pendingMerge = null;

function noteComparable(v) {
  return String(v == null ? '' : v).replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

function stableComparable(v) {
  if (v == null) return v;
  if (Array.isArray(v)) return v.map(stableComparable);
  if (typeof v === 'object') {
    var out = {};
    Object.keys(v).sort().forEach(function (k) { out[k] = stableComparable(v[k]); });
    return out;
  }
  return typeof v === 'string' ? noteComparable(v) : v;
}

function entryContentSignature(e) {
  return JSON.stringify(stableComparable({
    summary: e.summary || '',
    chapter: e.chapter || '',
    templateId: e.templateId || '',
    points: e.points || [],
    source: e.source || '',
    blocks: (e.blocks || []).map(function (b) { return { title: b.title || '', md: b.md || '' }; }),
    templateNotes: e.templateNotes || null,
    variants: e.variants || [],
    errorTypes: e.errorTypes || [],
    errorNote: e.errorNote || ''
  }));
}

function entryAddedTime(e) {
  var raw = e.createdAt || e.date || e.updatedAt || e.aiGeneratedAt || '';
  var t = Date.parse(raw);
  if (!isNaN(t)) return t;
  var m = String(raw).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
  return 0;
}

function nextCodeForList(subjectId, list, entry) {
  return nextCodeFromEntries(subjectId, list);
}

function uniqueEntryId(subjectId, code, list) {
  var ids = {};
  list.forEach(function (e) { if (e && e.id) ids[e.id] = true; });
  var base = subjectId + '-' + String(code).replace(/[^\w-]+/g, '-');
  var id = base;
  var n = 2;
  while (ids[id]) { id = base + '-' + n; n++; }
  return id;
}

function mergeFinalBackup(next, incoming) {
  var stats = { papersAdded: 0, examsAdded: 0 };
  var src = incoming && incoming.finalExam;
  if (!src || typeof src !== 'object') return stats;
  var dst = next.finalExam || {};
  next.finalExam = dst;
  if (!Array.isArray(dst.papers)) dst.papers = [];
  if (!Array.isArray(dst.examHistory)) dst.examHistory = [];
  if (!dst.done || typeof dst.done !== 'object') dst.done = {};
  if (!dst.date && src.date) dst.date = src.date;
  if (!(Number(dst.duration) > 0) && Number(src.duration) > 0) dst.duration = Number(src.duration);
  if (!dst.subject && src.subject) dst.subject = src.subject;
  if (!Array.isArray(dst.items)) dst.items = [];
  var itemKeys = {};
  dst.items.forEach(function (it) { if (it && (it.key || it.id)) itemKeys[String(it.key || it.id)] = true; });
  (Array.isArray(src.items) ? src.items : []).forEach(function (it) {
    if (!it) return;
    var key = String(it.key || it.id || '');
    if (key && itemKeys[key]) return;
    dst.items.push(deepClone(it));
    if (key) itemKeys[key] = true;
  });
  var paperIds = {};
  dst.papers.forEach(function (p) { if (p && p.id) paperIds[String(p.id)] = true; });
  (Array.isArray(src.papers) ? src.papers : []).forEach(function (paper) {
    if (!paper) return;
    var id = String(paper.id || '');
    if (id && paperIds[id]) return;
    var copy = deepClone(paper);
    if (!copy.id) copy.id = 'paper-import-' + Date.now().toString(36) + '-' + stats.papersAdded;
    dst.papers.push(copy);
    paperIds[String(copy.id)] = true;
    stats.papersAdded++;
  });
  var examIds = {};
  dst.examHistory.forEach(function (x) { if (x) examIds[String(x.historyId || x.id || '')] = true; });
  (Array.isArray(src.examHistory) ? src.examHistory : []).forEach(function (exam) {
    if (!exam) return;
    var id = String(exam.historyId || exam.id || '');
    if (id && examIds[id]) return;
    var copy = deepClone(exam);
    if (!copy.historyId && copy.id) copy.historyId = copy.id;
    dst.examHistory.push(copy);
    examIds[String(copy.historyId || copy.id || '')] = true;
    stats.examsAdded++;
  });
  if (!dst.mock && src.mock) dst.mock = deepClone(src.mock);
  if (src.done && typeof src.done === 'object') {
    Object.keys(src.done).forEach(function (k) { if (dst.done[k] == null) dst.done[k] = src.done[k]; });
  }
  return stats;
}

function buildMergePlan(current, incoming, incomingLib) {
  var next = deepClone(current);
  var added = 0;
  var skipped = 0;
  var sameSkipped = 0;
  var conflicts = [];
  var notesAdded = 0;
  var notesSkipped = 0;
  SUBJECTS.forEach(function (subj) {
    var list = next.entries[subj.id] || [];
    var ids = {};
    var byCode = {};
    list.forEach(function (e) { if (e.id) ids[e.id] = true; if (e.code) byCode[String(e.code)] = e; });
    var inc = (incoming.entries && incoming.entries[subj.id]) || [];
    inc.forEach(function (raw, order) {
      if (!raw || !raw.code) { skipped++; return; }
      var code = String(raw.code);
      var existing = byCode[code];
      if (existing) {
        if (entryContentSignature(existing) === entryContentSignature(raw)) {
          sameSkipped++;
          skipped++;
        } else {
          conflicts.push({ subject: subj.id, existing: existing, imported: raw, order: order });
        }
        return;
      }
      var e = deepClone(raw);
      if (!e.id || ids[e.id]) e.id = uniqueEntryId(subj.id, code, list);
      ids[e.id] = true;
      byCode[code] = e;
      list.push(e);
      added++;
    });
    next.entries[subj.id] = list;
  });
  function collectBooks(st) {
    if (!st) return [];
    if (Array.isArray(st.noteBooks)) return deepClone(st.noteBooks);
    var out = [];
    if (st.notebooks && typeof st.notebooks === 'object') {
      Object.keys(st.notebooks).forEach(function (k) {
        (st.notebooks[k] || []).forEach(function (b) { out.push(deepClone(b)); });
      });
    } else if (st.notes && typeof st.notes === 'object') {
      Object.keys(st.notes).forEach(function (k) {
        (st.notes[k] || []).forEach(function (page) {
          var rawTitle = page && page.title ? page.title : '';
          out.push({ id: 'nb-' + (page && page.id ? page.id : noteNotebookId()), title: rawTitle || ('笔记 ' + (out.length + 1)), pages: [deepClone(page)] });
        });
      });
    }
    return out;
  }
  var nextBooks = collectBooks(next);
  var incomingBooks = collectBooks(incoming);
  var bookById = {};
  nextBooks.forEach(function (b) { if (b && b.id) bookById[b.id] = b; });
  incomingBooks.forEach(function (b) {
    if (!b) return;
    b.pages = Array.isArray(b.pages) ? b.pages : [];
    var existing = b.id ? bookById[b.id] : null;
    if (!existing) {
      var copy = deepClone(b);
      if (!copy.id) copy.id = noteNotebookId();
      nextBooks.push(copy);
      bookById[copy.id] = copy;
      notesAdded += copy.pages.length;
      return;
    }
    existing.pages = Array.isArray(existing.pages) ? existing.pages : [];
    var pageIds = {};
    existing.pages.forEach(function (pg) { if (pg && pg.id) pageIds[pg.id] = true; });
    b.pages.forEach(function (pg) {
      if (!pg || !pg.id) { notesSkipped++; return; }
      if (pageIds[pg.id]) { notesSkipped++; return; }
      existing.pages.push(deepClone(pg));
      pageIds[pg.id] = true;
      notesAdded++;
    });
    existing.updatedAt = existing.updatedAt || b.updatedAt;
  });
  next.noteBooks = nextBooks;
  next.notebooks = {};
  next.notes = {};
  var finalStats = mergeFinalBackup(next, incoming);
  var libraryStats = mergeLibraryPayload(next, incomingLib);
  return { state: next, added: added, skipped: skipped, sameSkipped: sameSkipped, conflicts: conflicts, notesAdded: notesAdded, notesSkipped: notesSkipped, finalStats: finalStats, libraryStats: libraryStats };
}

function conflictEntryLabel(e) {
  var title = entryTitle(e);
  var qb = (e.blocks || []).filter(function (b) { return b && (b.key === 'original' || /题目|原题/.test(String(b.title || ''))); })[0];
  var snippet = qb && qb.md ? plainText(qb.md) : '';
  if (snippet && snippet !== title) snippet = '：' + snippet.slice(0, 70) + (snippet.length > 70 ? '…' : '');
  else snippet = '';
  var added = e.createdAt || e.date || e.updatedAt || '';
  var stamp = added ? formatDate(added) : '';
  return (e.code ? e.code + ' · ' : '') + title + snippet + (stamp ? '（添加于 ' + stamp + '）' : '');
}

function openMergeConflictDialog() {
  var dlg = qs('#mergeConflictDialog');
  var body = qs('#mergeConflictBody');
  if (!dlg || !body || !pendingMerge) return;
  var conflicts = pendingMerge.plan.conflicts;
  body.innerHTML = '' +
    '<p class="form-note" style="margin-top:0">导入文件中有 <b>' + conflicts.length + '</b> 条的编号与现有条目相同，但题目内容不同。相同的条目已经自动跳过。</p>' +
    '<ul class="merge-conflict-list">' + conflicts.map(function (c) {
      return '<li class="merge-conflict-item">' +
        '<div class="merge-conflict-pair"><span class="merge-conflict-kind">现有</span><span>' + esc(conflictEntryLabel(c.existing)) + '</span></div>' +
        '<div class="merge-conflict-pair"><span class="merge-conflict-kind is-import">导入</span><span>' + esc(conflictEntryLabel(c.imported)) + '</span></div>' +
      '</li>';
    }).join('') + '</ul>' +
    '<p class="merge-conflict-note">选择「重新编号并导入」后，这些导入条目会按各自的添加时间从早到晚依次分配新编号，现有条目编号不变。选择「跳过冲突」则只保留现有条目。</p>';
  dlg.showModal();
  setTimeout(function () {
    var b = qs('[data-act="merge-conflict-renumber"]');
    if (b) b.focus();
  }, 50);
}

function finishMerge(plan, resolution) {
  var added = plan.added;
  var renumbered = 0;
  var skippedConflict = 0;
  if (resolution === 'renumber') {
    var ordered = plan.conflicts.slice().sort(function (a, b) {
      var da = entryAddedTime(a.imported);
      var db = entryAddedTime(b.imported);
      if (da !== db) return da - db;
      return a.order - b.order;
    });
    ordered.forEach(function (c) {
      var list = plan.state.entries[c.subject];
      var e = deepClone(c.imported);
      e.code = nextCodeForList(c.subject, list, e);
      e.id = uniqueEntryId(c.subject, e.code, list);
      list.push(e);
      added++;
      renumbered++;
    });
  } else {
    skippedConflict = plan.conflicts.length;
  }
  state = plan.state;
  state.prefs = state.prefs || { theme: 'auto' };
  state.clearEpoch = EMPTY_EPOCH;
  state.rev = (state.rev || 0) + 1;
  state.updatedAt = nowIso();
  pendingMerge = null;
  pendingImport = null;
  var cdlg = qs('#mergeConflictDialog');
  if (cdlg && cdlg.open) cdlg.close();
  var idlg = qs('#importDialog');
  if (idlg && idlg.open) idlg.close();
  persistLocal();
  markDirty();
  applyTheme();
  render();
  var msg = '已合并：新增 ' + added + ' 条错题';
  if (plan.sameSkipped) msg += '，跳过相同 ' + plan.sameSkipped + ' 条';
  if (renumbered) msg += '，重新编号 ' + renumbered + ' 条';
  if (skippedConflict) msg += '，跳过冲突 ' + skippedConflict + ' 条';
  if (plan.notesAdded) msg += ' · ' + plan.notesAdded + ' 页笔记';
  if (plan.finalStats && (plan.finalStats.papersAdded || plan.finalStats.examsAdded)) msg += ' · 模拟卷 +' + (plan.finalStats.papersAdded || 0) + ' 张 · 模拟考 +' + (plan.finalStats.examsAdded || 0) + ' 份';
  if (plan.libraryStats) {
    var ls = plan.libraryStats;
    if (ls.templatesAdded) msg += ' · 模板 +' + ls.templatesAdded;
    if (ls.bankAdded) msg += ' · 题库 +' + ls.bankAdded;
    if (ls.templatesSkipped || ls.bankSkipped) msg += ' · 跳过重复 ' + (ls.templatesSkipped + ls.bankSkipped);
  }
  toast(msg);
}

function resolveMergeConflict(resolution) {
  if (!pendingMerge) { toast('没有待处理的合并'); return; }
  finishMerge(pendingMerge.plan, resolution);
}

function applyImportMode(mode) {
  if (!pendingImport) { toast('没有待导入的文件'); return; }
  var incoming = deepClone(pendingImport.state);
  if (!sanitizeStateCollections(incoming)) { toast('导入失败：备份结构损坏，已保留当前数据'); return; }
  if (mode === 'replace') {
    storageRecoveryBlocked = false;
    state = incoming;
    var replaceLibStats = mergeLibraryPayload(state, pendingImport.libraries);
    state.prefs = state.prefs || { theme: 'auto' };
    state.clearEpoch = EMPTY_EPOCH;
    state.rev = (state.rev || 0) + 1;
    state.updatedAt = nowIso();
    pendingImport = null;
    var idlg = qs('#importDialog');
    if (idlg && idlg.open) idlg.close();
    persistLocal();
    markDirty();
    applyTheme();
    render();
    toast('已覆盖：' + importCount(state) + ' 条错题 · ' + importNoteCount(state) + ' 页笔记 · 模板 ' + replaceLibStats.templatesAdded + ' / 题库 ' + replaceLibStats.bankAdded);
    return;
  }
  var plan = buildMergePlan(state, incoming, pendingImport.libraries);
  if (plan.conflicts.length) {
    pendingMerge = { plan: plan };
    pendingImport = null;
    var dlg = qs('#importDialog');
    if (dlg && dlg.open) dlg.close();
    openMergeConflictDialog();
    return;
  }
  finishMerge(plan, 'none');
}
