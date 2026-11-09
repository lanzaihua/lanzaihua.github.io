/* =========================================================
   51-knowledge — Obsidian-style Markdown knowledge base
   ========================================================= */
function kbNotes() {
  if (!Array.isArray(state.knowledgeNotes)) state.knowledgeNotes = [];
  return state.knowledgeNotes;
}

function kbEnsure() {
  var list = kbNotes();
  if (!state.kbSeeded) {
    if (!list.length) {
      var now = nowIso();
      list.push({ id: 'kb-welcome', title: '欢迎使用笔记库', createdAt: now, updatedAt: now,
        body: '# 欢迎使用笔记库\n\n这是你的本地 Markdown 知识笔记。内容只保存在本机浏览器，并随 JSON 备份一起导出。\n\n- 双链：[[错题复习法]]\n- 标签：#笔记库 #开始\n\n点右上角「新建知识笔记」开始；输入 &#91;&#91;标题&#93;&#93; 可以连接到另一条笔记。' });
      list.push({ id: 'kb-review', title: '错题复习法', createdAt: now, updatedAt: now,
        body: '## 一条错题怎么复习\n\n1. 当天只看标准解答与模板。\n2. 按 1–5 星难度生成 20–32 个复习节点，按录入和上一节点时间解锁，遮住答案重做。\n3. 做对同模板变式，再标「已掌握」。\n\n相关：[[欢迎使用笔记库]]、[[公式与推导]]\n\n#复习 #方法' });
      list.push({ id: 'kb-formula', title: '公式与推导', createdAt: now, updatedAt: now,
        body: '## 公式卡片\n\n公式不是用来背的，而是用来判断下一步往哪走。\n\n把容易忘的公式、适用条件和一条反例放在一起。\n\n相关：[[错题复习法]]\n\n#公式 #推导' });
    }
    state.kbSeeded = true;
    markDirty();
  }
  if (!ui.kbId || !kbNotes().some(function (n) { return n.id === ui.kbId; })) ui.kbId = kbNotes()[0] ? kbNotes()[0].id : '';
}

function kbCurrent() {
  var hit = kbNotes().filter(function (n) { return n.id === ui.kbId; })[0];
  return hit || kbNotes()[0] || null;
}

function kbFindTitle(title) {
  var key = String(title || '').trim().toLowerCase();
  if (!key) return null;
  return kbNotes().filter(function (n) { return String(n.title || '').trim().toLowerCase() === key; })[0] || null;
}

function kbLinksOf(body) {
  var out = [], re = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, m;
  while ((m = re.exec(String(body || '')))) {
    var title = String(m[1] || '').trim();
    if (title && out.indexOf(title) < 0) out.push(title);
  }
  return out;
}

function kbTagsOf(body) {
  var out = [], re = /(^|[\s(（])#([^\s#，。；;:：!?！？、()（）\[\]【】]+)/g, m;
  while ((m = re.exec(String(body || '')))) {
    var tag = String(m[2] || '').trim();
    if (tag && out.indexOf(tag) < 0) out.push(tag);
  }
  return out;
}

function kbAllTags() {
  var counts = {};
  kbNotes().forEach(function (n) { kbTagsOf(n.body).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
  return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }).map(function (t) { return { tag: t, count: counts[t] }; });
}

function kbBacklinks(note) {
  if (!note) return [];
  var key = String(note.title || '').trim().toLowerCase();
  return kbNotes().filter(function (n) {
    return n.id !== note.id && kbLinksOf(n.body).some(function (t) { return String(t).trim().toLowerCase() === key; });
  });
}

function kbPreviewHtml(note) {
  var html = renderMarkdown(note && note.body || '');
  return html.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, function (m, title, label) {
    var hit = kbFindTitle(title);
    return '<button type="button" class="kb-wikilink' + (hit ? '' : ' is-missing') + '" data-act="kb-link" data-title="' + attr(String(title || '').trim()) + '">' + esc(String(label || title || '').trim()) + '</button>';
  });
}

function kbFiltered() {
  var q = String(ui.kbQuery || '').trim().toLowerCase(), tag = String(ui.kbTag || '').trim();
  return kbNotes().filter(function (n) {
    var hay = (n.title + '\n' + n.body).toLowerCase();
    if (q && hay.indexOf(q) < 0) return false;
    if (tag && kbTagsOf(n.body).indexOf(tag) < 0) return false;
    return true;
  });
}

function kbOpen(id) {
  ui.noteKb = true; ui.noteLibrary = false; ui.kbGraph = false; ui.kbId = id;
  if (typeof setHash === 'function') setHash('#/notes/kb');
  render();
}

function kbNew() {
  var n = { id: 'kb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6), title: '未命名笔记 ' + (kbNotes().length + 1), body: '', createdAt: nowIso(), updatedAt: nowIso() };
  kbNotes().push(n); state.kbSeeded = true; ui.noteKb = true; ui.noteLibrary = false; ui.kbId = n.id; ui.kbPreview = false; ui.kbGraph = false;
  markDirty();
  if (typeof setHash === 'function') setHash('#/notes/kb');
  render();
  setTimeout(function () { var el = qs('#kbTitle'); if (el) { el.focus(); el.select(); } }, 60);
}

function kbBack() {
  ui.noteKb = false; ui.noteLibrary = true;
  markDirty();
  if (typeof setHash === 'function') setHash('#/notes');
  render();
}

function kbDelete(id) {
  var n = kbNotes().filter(function (x) { return x.id === id; })[0];
  if (!n) return;
  confirmDialog('要删除这条知识笔记吗？', '「' + (n.title || '未命名笔记') + '」会从笔记库中移除，且无法恢复。', function () {
    state.knowledgeNotes = kbNotes().filter(function (x) { return x.id !== id; });
    if (ui.kbId === id) ui.kbId = kbNotes()[0] ? kbNotes()[0].id : '';
    markDirty(); render(); toast('已删除知识笔记');
  }, true);
}

function kbOpenLink(title) {
  var hit = kbFindTitle(title);
  if (hit) { kbOpen(hit.id); return; }
  var n = { id: 'kb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6), title: String(title || '未命名笔记').trim(), body: '', createdAt: nowIso(), updatedAt: nowIso() };
  kbNotes().push(n); state.kbSeeded = true; markDirty(); kbOpen(n.id); toast('已创建「' + n.title + '」');
}

var kbSaveTimer = null;
function kbQueueSave() {
  var n = kbCurrent(); if (!n) return;
  n.updatedAt = nowIso();
  var status = qs('#kbSaved'); if (status) status.textContent = '正在保存…';
  if (kbSaveTimer) clearTimeout(kbSaveTimer);
  kbSaveTimer = setTimeout(function () {
    markDirty(); kbSaveTimer = null;
    var st = qs('#kbSaved'); if (st) st.textContent = '已保存';
  }, 500);
}

function kbSidebarHtml() {
  var list = kbFiltered();
  var all = kbNotes();
  var tags = kbAllTags().slice(0, 14);
  var items = list.map(function (n) {
    return '<button class="kb-list-item' + (n.id === ui.kbId ? ' is-on' : '') + '" data-act="kb-note" data-id="' + attr(n.id) + '" data-search="' + attr((n.title + ' ' + n.body + ' ' + kbTagsOf(n.body).join(' ')).toLowerCase()) + '" type="button">' +
      '<span class="kb-list-title">' + esc(n.title || '未命名笔记') + '</span>' +
      '<span class="kb-list-meta">' + kbLinksOf(n.body).length + ' 链接 · ' + kbTagsOf(n.body).length + ' 标签</span></button>';
  }).join('');
  return '<aside class="kb-sidebar">' +
    '<label class="kb-search"><span class="sr-only">搜索知识笔记</span><input id="kbSearch" type="search" value="' + attr(ui.kbQuery) + '" placeholder="搜索标题 / 正文 / 标签"></label>' +
    '<div class="kb-side-head"><span>笔记</span><span>' + list.length + ' / ' + all.length + '</span></div>' +
    '<div class="kb-list" id="kbList">' + (items || '<p class="kb-empty-line">没有匹配的笔记</p>') + '</div>' +
    '<div class="kb-tags"><div class="kb-side-head"><span>标签</span><span>' + tags.length + '</span></div>' +
      (tags.length ? tags.map(function (t) { return '<button class="kb-tag' + (ui.kbTag === t.tag ? ' is-on' : '') + '" data-act="kb-tag" data-tag="' + attr(t.tag) + '" type="button">#' + esc(t.tag) + ' <b>' + t.count + '</b></button>'; }).join('') : '<p class="kb-empty-line">正文里输入 #标签</p>') +
    '</div></aside>';
}

function kbEditorHtml(note) {
  if (!note) return '<section class="kb-main kb-empty"><h2>还没有知识笔记</h2><p>新建一条 Markdown 知识笔记，开始用 [[双链]] 组织复习。</p><button class="btn btn-primary" data-act="kb-new" type="button">新建知识笔记</button></section>';
  var preview = ui.kbPreview;
  var backs = kbBacklinks(note);
  var tags = kbTagsOf(note.body);
  var body = preview
    ? '<article class="kb-preview md">' + kbPreviewHtml(note) + '</article>'
    : '<textarea id="kbBody" class="kb-editor" spellcheck="false" placeholder="Markdown；用 [[标题]] 创建双链，#标签 归类。">' + esc(note.body || '') + '</textarea>';
  var linkChips = kbLinksOf(note.body).map(function (t) {
    var hit = kbFindTitle(t);
    return '<button class="kb-chip kb-link-chip' + (hit ? '' : ' is-missing') + '" data-act="kb-link" data-title="' + attr(t) + '" type="button">[[' + esc(t) + ']]</button>';
  }).join('');
  var backHtml = backs.length ? backs.map(function (n) { return '<button class="kb-backlink" data-act="kb-note" data-id="' + attr(n.id) + '" type="button">' + esc(n.title) + '</button>'; }).join('') : '<span class="kb-empty-line">还没有反向链接</span>';
  var tagHtml = tags.map(function (t) { return '<button class="kb-chip" data-act="kb-tag" data-tag="' + attr(t) + '" type="button">#' + esc(t) + '</button>'; }).join('');
  return '<section class="kb-main">' +
    '<div class="kb-editor-head"><input id="kbTitle" class="kb-title-input" value="' + attr(note.title || '未命名笔记') + '" aria-label="笔记标题" placeholder="笔记标题">' +
      '<div class="kb-head-actions"><button class="btn btn-xs" data-act="kb-mode" type="button">' + (preview ? '编辑' : '预览') + '</button><button class="btn btn-xs btn-danger" data-act="kb-delete" data-id="' + attr(note.id) + '" type="button">删除</button></div></div>' +
    '<div class="kb-editor-meta"><span id="kbSaved">已保存</span><span>' + String(note.body || '').length + ' 字符</span><span>' + esc(timeAgo(note.updatedAt)) + '</span></div>' +
    '<div class="kb-editor-body">' + body + '</div>' +
    '<div class="kb-detail-row"><div><span class="kb-detail-label">双链</span><div class="kb-chips">' + (linkChips || '<span class="kb-empty-line">输入 [[标题]] 连接另一条笔记</span>') + '</div></div>' +
      '<div><span class="kb-detail-label">标签</span><div class="kb-chips">' + (tagHtml || '<span class="kb-empty-line">输入 #标签 归类</span>') + '</div></div></div>' +
    '<div class="kb-backlinks"><span class="kb-detail-label">反向链接</span><div class="kb-chips">' + (backHtml || '<span class="kb-empty-line">还没有反向链接</span>') + '</div></div>' +
  '</section>';
}

function kbGraphHtml() {
  return '<section class="kb-main kb-graph-main"><div class="kb-graph-head"><div><h2>关系图谱</h2><p>知识笔记之间的 [[双链]]；点节点打开笔记。</p></div><button class="btn btn-xs" data-act="kb-mode" type="button">返回编辑</button></div><canvas id="kbGraphCanvas" aria-label="笔记库关系图谱"></canvas></section>';
}

function viewKnowledge() {
  kbEnsure();
  var note = kbCurrent();
  return '<section class="page-head kb-page-head"><div><div class="page-kicker">笔记库 / KNOWLEDGE NOTE</div><h1 class="page-title">知识笔记</h1>' +
      '<p class="page-sub">Markdown · 双向链接 · 反向链接 · 标签 · 关系图谱；和手写笔记本放在同一个笔记库里。</p></div>' +
      '<div class="page-actions"><button class="btn" data-act="kb-back" type="button">返回笔记库</button>' +
      '<button class="btn' + (ui.kbGraph ? ' btn-primary' : '') + '" data-act="kb-graph" type="button">' + (ui.kbGraph ? '返回编辑' : '关系图谱') + '</button>' +
      '<button class="btn btn-primary" data-act="kb-new" type="button">新建知识笔记</button></div></section>' +
    '<div class="kb-layout">' + kbSidebarHtml() + (ui.kbGraph ? kbGraphHtml() : kbEditorHtml(note)) + '</div>';
}

function kbDrawGraph() {
  var canvas = qs('#kbGraphCanvas');
  if (!canvas) return;
  var host = canvas.parentNode;
  var W = Math.max(300, host.clientWidth - 2);
  var H = Math.max(340, Math.min(640, window.innerHeight * 0.6));
  var dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  var ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  var notes = kbNotes();
  if (!notes.length) return;
  var accent = (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#b23a26').trim();
  var ink = (getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#2a241c').trim();
  var line = (getComputedStyle(document.documentElement).getPropertyValue('--line-strong') || '#d7d0c2').trim();
  var nodes = notes.map(function (n, i) {
    var a = (i / Math.max(1, notes.length)) * Math.PI * 2 - Math.PI / 2;
    var r = Math.min(W, H) * 0.33;
    return { n: n, x: W / 2 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r };
  });
  var byTitle = {};
  nodes.forEach(function (o) { byTitle[String(o.n.title).trim().toLowerCase()] = o; });
  var edges = [];
  nodes.forEach(function (o) {
    kbLinksOf(o.n.body).forEach(function (t) {
      var target = byTitle[String(t).trim().toLowerCase()];
      if (target && target !== o) edges.push([o, target]);
    });
  });
  ctx.lineWidth = 1;
  edges.forEach(function (e) {
    ctx.strokeStyle = line; ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.moveTo(e[0].x, e[0].y); ctx.lineTo(e[1].x, e[1].y); ctx.stroke();
  });
  ctx.globalAlpha = 1;
  nodes.forEach(function (o) {
    var active = o.n.id === ui.kbId;
    ctx.beginPath(); ctx.arc(o.x, o.y, active ? 9 : 6, 0, Math.PI * 2);
    ctx.fillStyle = active ? accent : ink; ctx.fill();
    if (active) { ctx.strokeStyle = accent; ctx.globalAlpha = .25; ctx.lineWidth = 6; ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.fillStyle = ink; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    var label = o.n.title || '未命名';
    if (label.length > 12) label = label.slice(0, 11) + '…';
    ctx.fillText(label, o.x, o.y + 20);
  });
  canvas.onclick = function (ev) {
    var r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = null, bd = 24;
    nodes.forEach(function (o) { var d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; best = o; } });
    if (best) kbOpen(best.n.id);
  };
}

function initKnowledgeView() {
  if (ui.kbGraph) { kbDrawGraph(); return; }
  var title = qs('#kbTitle');
  var body = qs('#kbBody');
  var search = qs('#kbSearch');
  if (title) title.oninput = function () {
    var n = kbCurrent(); if (!n) return;
    n.title = title.value; kbQueueSave();
    var item = qs('.kb-list-item[data-id="' + n.id + '"] .kb-list-title');
    if (item) item.textContent = n.title || '未命名笔记';
  };
  if (body) body.oninput = function () {
    var n = kbCurrent(); if (!n) return;
    n.body = body.value; kbQueueSave();
  };
  if (search) search.oninput = function () {
    ui.kbQuery = search.value;
    var q = search.value.trim().toLowerCase(), items = qsa('.kb-list-item'), shown = 0;
    items.forEach(function (el) {
      var hay = (el.getAttribute('data-search') || '').toLowerCase();
      var hit = !q || hay.indexOf(q) >= 0;
      el.hidden = !hit; if (hit) shown++;
    });
    var count = qs('.kb-side-head span:last-child');
    if (count) count.textContent = shown + ' / ' + kbNotes().length;
  };
}

