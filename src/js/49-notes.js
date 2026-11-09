/* =========================================================
   49-notes — 各科笔记：手写画布 + 图片 / PDF 导入
   ========================================================= */
var NOTE_DEFAULT_W = 1000;
var NOTE_DEFAULT_H = 1414;
var NOTE_COLORS = [
  { id: 'black', color: '#111111', label: '黑色' },
  { id: 'gray', color: '#6b6b6b', label: '灰色' },
  { id: 'white', color: '#ffffff', label: '白色' },
  { id: 'brown', color: '#7a4f2a', label: '棕色' },
  { id: 'red', color: '#c0392b', label: '红色' },
  { id: 'pink', color: '#c2557a', label: '玫红' },
  { id: 'orange', color: '#d97706', label: '橙色' },
  { id: 'gold', color: '#b8860b', label: '金色' },
  { id: 'yellow', color: '#d6a400', label: '黄色' },
  { id: 'lime', color: '#6f8f2a', label: '草绿' },
  { id: 'green', color: '#3f7d4e', label: '绿色' },
  { id: 'teal', color: '#2f7f73', label: '青绿' },
  { id: 'cyan', color: '#2a8f9a', label: '青色' },
  { id: 'blue', color: '#315d86', label: '蓝色' },
  { id: 'purple', color: '#704a8a', label: '紫色' }
];
var NOTE_COVERS = [
  { id: 'paper', label: '米白', bg: 'linear-gradient(135deg,#fbf6ea,#eee2cb)', ink: '#8c2f24' },
  { id: 'red', label: '朱砂', bg: 'linear-gradient(135deg,#a33a26,#74261c)', ink: '#f7e8d8' },
  { id: 'forest', label: '松绿', bg: 'linear-gradient(135deg,#3f6656,#263f36)', ink: '#eef3ea' },
  { id: 'blue', label: '靛蓝', bg: 'linear-gradient(135deg,#385b7c,#22384f)', ink: '#eaf0f5' },
  { id: 'ink', label: '玄黑', bg: 'linear-gradient(135deg,#3a3733,#201e1b)', ink: '#f2e8d9' },
  { id: 'kraft', label: '牛皮', bg: 'linear-gradient(135deg,#c9ad82,#9b7a51)', ink: '#34251a' }
];
var NOTE_PAPERS = [
  { id: 'white', label: '纯白' },
  { id: 'ruled', label: '横线' },
  { id: 'grid', label: '方格' },
  { id: 'dot', label: '点阵' },
  { id: 'cream', label: '米黄' },
  { id: 'kraft', label: '牛皮' },
  { id: 'black', label: '黑色' },
  { id: 'navy', label: '深蓝' },
  { id: 'rose', label: '浅粉' },
  { id: 'slate', label: '灰蓝' }
];
function noteIcon(name) {
  if (name === 'undo') {
    return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 7 4 12l5 5"></path><path d="M4 12h9a5 5 0 0 1 5 5v1"></path></svg>';
  }
  if (name === 'redo') {
    return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 7 5 5-5 5"></path><path d="M20 12h-9a5 5 0 0 0-5 5v1"></path></svg>';
  }
  if (name === 'close') {
    return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"></path></svg>';
  }
  if (name === 'trash') {
    return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16"></path><path d="M9 7V5h6v2"></path><path d="M6.5 7l.8 12h9.4l.8-12"></path><path d="M10 11v5M14 11v5"></path></svg>';
  }
  return '';
}
var NOTE_PDF_BASE = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/';
var notePdfPromise = null;
var noteBgImages = {};
var noteDraft = null;
var noteLasso = null;
var noteHighlighterFrame = 0;
var noteSaveTimer = null;
var noteBusyTimer = null;
var noteBusyStarted = 0;
var noteScanState = null;

function noteNotebookId() {
  return 'nb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function noteNotebooks() {
  if (Array.isArray(state.noteBooks)) return state.noteBooks;
  var books = [];
  var seenPages = {};
  function addBook(b) {
    if (!b) return;
    b.pages = Array.isArray(b.pages) ? b.pages : [];
    if (!b.id) b.id = noteNotebookId();
    b.pages.forEach(function (pg) { if (pg && pg.id) seenPages[pg.id] = 1; });
    books.push(b);
  }
  if (state.notebooks && typeof state.notebooks === 'object') {
    Object.keys(state.notebooks).forEach(function (key) {
      var list = Array.isArray(state.notebooks[key]) ? state.notebooks[key] : [];
      list.forEach(addBook);
    });
  }
  if (state.notes && typeof state.notes === 'object') {
    Object.keys(state.notes).forEach(function (key) {
      var pages = Array.isArray(state.notes[key]) ? state.notes[key] : [];
      pages.forEach(function (page) {
        if (!page || (page.id && seenPages[page.id])) return;
        var rawTitle = page.title || '';
        var bookTitle = (rawTitle && !/^第 \d+ 页$/.test(rawTitle)) ? rawTitle : ('笔记 ' + (books.length + 1));
        page.title = page.kind === 'entry' ? '同步页' : '第 1 页';
        addBook({ id: noteNotebookId(), title: bookTitle, createdAt: page.createdAt || page.updatedAt || nowIso(), updatedAt: page.updatedAt || nowIso(), pages: [page] });
      });
    });
  }
  state.noteBooks = books;
  state.notebooks = {};
  state.notes = {};
  markDirty();
  return books;
}

function noteBookIndex() {
  var books = noteNotebooks();
  var i = (ui.noteBookIndex == null ? 0 : ui.noteBookIndex);
  if (i < 0) i = 0;
  if (i >= books.length) i = books.length - 1;
  if (i < 0) i = 0;
  ui.noteBookIndex = i;
  return i;
}

function noteCurrentBook() {
  var books = noteNotebooks();
  return books[noteBookIndex()] || null;
}

function notePages() {
  var book = noteCurrentBook();
  return book ? (book.pages || []) : [];
}

function noteSetPage(i) {
  ui.notePageIndex = Math.max(0, Number(i) || 0);
}

function noteIndex() {
  var pages = notePages();
  var i = ui.notePageIndex == null ? 0 : ui.notePageIndex;
  if (i < 0) i = 0;
  if (i >= pages.length) i = pages.length - 1;
  if (i < 0) i = 0;
  ui.notePageIndex = i;
  return i;
}

function noteCurrent() {
  var pages = notePages();
  return pages[noteIndex()] || null;
}

function noteTotalPages() {
  return noteNotebooks().reduce(function (n, b) { return n + (b.pages || []).length; }, 0);
}

function noteFindPageById(subjectId, pageId) {
  if (!pageId) return null;
  var books = noteNotebooks();
  for (var bi = 0; bi < books.length; bi++) {
    var pages = books[bi].pages || [];
    for (var pi = 0; pi < pages.length; pi++) {
      if (pages[pi].id === pageId) return { book: books[bi], bookIndex: bi, page: pages[pi], pageIndex: pi };
    }
  }
  return null;
}

function noteCreateNotebook(subjectId, title, pages) {
  var books = noteNotebooks();
  var book = { id: noteNotebookId(), title: title || ('笔记 ' + (books.length + 1)), createdAt: nowIso(), updatedAt: nowIso(), pages: pages || [] };
  books.push(book);
  ui.noteBookIndex = books.length - 1;
  noteSetPage(0);
  return book;
}

function noteCoarsePointer() {
  return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
}

function noteMode() {
  if (!ui.noteMode) ui.noteMode = window.matchMedia && window.matchMedia('(pointer: coarse)').matches ? 'browse' : 'draw';
  return ui.noteMode;
}

function noteSwitchToDraw() {
  if (noteMode() === 'draw') return;
  ui.noteMode = 'draw';
  noteSetSelected('');
  var board = qs('#noteBoard');
  if (board) {
    board.classList.remove('is-browse');
    board.classList.add('is-draw');
  }
  var canvas = qs('#noteCanvas');
  if (canvas) canvas.style.touchAction = 'none';
  qsa('[data-act="note-mode"]').forEach(function (b) {
    b.classList.toggle('is-on', b.getAttribute('data-mode') === 'draw');
  });
}

function noteTool() { return ui.noteTool || 'pen'; }
function noteLastInkTool() {
  var t = ui.noteLastInkTool;
  return (t === 'pen' || t === 'highlighter' || t === 'line') ? t : 'pen';
}

function noteRememberInkTool(tool) {
  if (tool === 'pen' || tool === 'highlighter' || tool === 'line') ui.noteLastInkTool = tool;
}

function notePaper() { var p = noteCurrent(state.activeSubject); return (p && p.paper) || 'ruled'; }
function noteColor() {
  var c = ui.noteColor;
  return NOTE_COLORS.some(function (x) { return x.color === c; }) ? c : NOTE_COLORS[0].color;
}
function noteWidth() { return Number(ui.noteWidth || 12); }
function notePenStyle() { return ui.notePenStyle || 'ballpoint'; }
function noteEraserCss() { return Number(ui.noteEraserCss || 48); }
function noteEraserPageWidth(canvas, page) {
  return noteEraserCss() * page.width / Math.max(1, canvas.clientWidth);
}

function noteId() {
  return 'nt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function noteNewPage(title) {
  return {
    id: noteId(),
    title: title || '白纸',
    width: NOTE_DEFAULT_W,
    height: NOTE_DEFAULT_H,
    paper: 'ruled',
    background: '',
    thumb: '',
    strokes: [],
    items: [],
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

function noteCount(subjectId) { return notePages(subjectId).length; }

function noteSetDirty(dirty) {
  ui.noteDirty = !!dirty;
  var btn = qs('#noteSaveBtn');
  if (!btn) return;
  btn.classList.toggle('is-dirty', !!dirty);
  var label = btn.querySelector('.note-save-label');
  if (label) label.textContent = dirty ? '保存' : '已保存';
  btn.setAttribute('aria-label', dirty ? '保存笔记' : '笔记已保存');
}

function noteQueueSave() {
  if (noteSaveTimer) clearTimeout(noteSaveTimer);
  noteSetDirty(true);
  noteSaveTimer = setTimeout(function () {
    var page = noteCurrent(state.activeSubject);
    if (page) page.updatedAt = nowIso();
    var ok = markDirty();
    noteSaveTimer = null;
    noteSetDirty(!ok);
  }, 450);
}

function noteSaveNow() {
  if (noteSaveTimer) { clearTimeout(noteSaveTimer); noteSaveTimer = null; }
  var page = noteCurrent(state.activeSubject);
  if (page) page.updatedAt = nowIso();
  var ok = markDirty();
  noteSetDirty(!ok);
  return ok;
}

function noteBusyElapsedText(ms) {
  var sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return '已等待 ' + sec + ' 秒';
  return '已等待 ' + Math.floor(sec / 60) + ' 分 ' + (sec % 60) + ' 秒';
}

function noteBusyTick() {
  var el = qs('#noteBusyElapsed');
  if (el && noteBusyStarted) el.textContent = noteBusyElapsedText(Date.now() - noteBusyStarted);
}

function noteBusy(show, text) {
  var el = qs('#noteBusy');
  if (!el) return;
  el.hidden = !show;
  if (noteBusyTimer) { clearInterval(noteBusyTimer); noteBusyTimer = null; }
  if (show) {
    if (!noteBusyStarted) noteBusyStarted = Date.now();
    noteBusyTick();
    noteBusyTimer = setInterval(noteBusyTick, 1000);
  } else {
    noteBusyStarted = 0;
    var track = qs('#noteBusyTrack');
    if (track) { track.hidden = true; track.removeAttribute('aria-valuenow'); }
    var count = qs('#noteBusyCount');
    if (count) count.textContent = '';
  }
  var t = qs('#noteBusyText');
  if (t && text) t.textContent = text;
}

/* 有真实总数时显示确定进度；不知道总数时只显示活动条，不伪造百分比。 */
function noteBusyProgress(done, total, text) {
  var el = qs('#noteBusy');
  if (!el || el.hidden) noteBusy(true, text || '正在处理…');
  if (text) noteBusyText(text);
  var track = qs('#noteBusyTrack');
  var fill = qs('#noteBusyFill');
  var count = qs('#noteBusyCount');
  if (!track || !fill) return;
  var totalNum = Number(total) || 0;
  var doneNum = Math.max(0, Number(done) || 0);
  track.hidden = false;
  if (totalNum > 0) {
    var pct = Math.max(0, Math.min(100, Math.round(doneNum / totalNum * 100)));
    track.classList.remove('is-indeterminate');
    track.setAttribute('aria-valuenow', String(pct));
    track.setAttribute('aria-valuetext', text || ('已完成 ' + doneNum + ' / ' + totalNum));
    fill.style.width = pct + '%';
    if (count) count.textContent = doneNum + ' / ' + totalNum;
  } else {
    track.classList.add('is-indeterminate');
    track.removeAttribute('aria-valuenow');
    track.setAttribute('aria-valuetext', text || '处理中');
    fill.style.width = '';
    if (count) count.textContent = '';
  }
}

function noteToolbarHtml(subjectId) {
  var mode = noteMode();
  var tool = noteTool();
  var color = noteColor();
  var width = noteWidth();
  var isEraser = tool === 'eraser';
  var sliderMax = isEraser ? 140 : 56;
  var sliderVal = isEraser ? noteEraserCss() : width;
  var page = noteCurrent(subjectId);
  var paper = (page && page.paper) || 'ruled';
  return '<div class="note-toolbar" role="toolbar" aria-label="笔记工具">' +
    '<div class="note-toolbar-row note-toolbar-draw">' +
    '<div class="note-seg note-modes" role="group" aria-label="模式">' +
      '<button class="note-seg-btn' + (mode === 'draw' ? ' is-on' : '') + '" data-act="note-mode" data-mode="draw" type="button" title="直接在本页书写">手写</button>' +
      '<button class="note-seg-btn' + (mode === 'browse' ? ' is-on' : '') + '" data-act="note-mode" data-mode="browse" type="button" title="滑动浏览，不触发书写">浏览</button>' +
    '</div>' +
    '<div class="note-seg note-tools" role="group" aria-label="工具">' +
      '<button class="note-seg-btn' + (tool === 'pen' ? ' is-on' : '') + '" data-act="note-tool" data-tool="pen" type="button">笔</button>' +
      '<button class="note-seg-btn' + (tool === 'highlighter' ? ' is-on' : '') + '" data-act="note-tool" data-tool="highlighter" type="button">荧光笔</button>' +
      '<button class="note-seg-btn' + (tool === 'eraser' ? ' is-on' : '') + '" data-act="note-tool" data-tool="eraser" type="button" title="像素橡皮，按住拖动擦除">橡皮</button>' +
      '<button class="note-seg-btn' + (tool === 'lasso' ? ' is-on' : '') + '" data-act="note-tool" data-tool="lasso" type="button" title="套索：圈选笔迹后拖动或删除">套索</button>' +
      '<button class="note-seg-btn' + (tool === 'line' ? ' is-on' : '') + '" data-act="note-tool" data-tool="line" type="button" title="直线：按住拖动，画出直线">直线</button>' +
    '</div>' +
    (tool === 'lasso' ? '<button class="note-act" data-act="note-lasso-delete" type="button">删除选中</button><button class="note-act" data-act="note-lasso-duplicate" type="button">复制选中</button>' : '') +
    (tool === 'pen' ? '<div class="note-seg note-pens" role="group" aria-label="笔锋">' +
      '<button class="note-seg-btn' + (notePenStyle() === 'ballpoint' ? ' is-on' : '') + '" data-act="note-pen-style" data-style="ballpoint" type="button" title="圆珠笔：线条均匀">圆珠</button>' +
      '<button class="note-seg-btn' + (notePenStyle() === 'fountain' ? ' is-on' : '') + '" data-act="note-pen-style" data-style="fountain" type="button" title="钢笔：有粗细变化">钢笔</button>' +
      '<button class="note-seg-btn' + (notePenStyle() === 'brush' ? ' is-on' : '') + '" data-act="note-pen-style" data-style="brush" type="button" title="毛笔：更松软、更宽">毛笔</button>' +
    '</div>' : '') +
    '<div class="note-color-control"><span class="note-control-label">颜色</span><div class="note-colors" role="group" aria-label="颜色">' +
      NOTE_COLORS.map(function (c) {
        return '<button class="note-swatch' + (color === c.color ? ' is-on' : '') + '" data-act="note-color" data-color="' + attr(c.color) + '" type="button" title="' + attr(c.label) + '" aria-label="' + attr(c.label) + '" style="--swatch:' + attr(c.color) + '"></button>';
      }).join('') +
    '</div></div>' +
    (page && !page.background ? '<div class="note-paper-control"><span class="note-control-label">纸张</span><div class="note-papers" role="group" aria-label="纸张">' + NOTE_PAPERS.map(function (p) {
      return '<button class="note-paper-swatch paper-' + p.id + (paper === p.id ? ' is-on' : '') + '" data-act="note-paper" data-paper="' + p.id + '" type="button" title="' + p.label + '" aria-label="' + p.label + '"></button>';
    }).join('') + '</div></div>' : '') +
    '<label class="note-width"><span>' + (isEraser ? '橡皮' : '粗细') + '</span><input id="noteWidth" type="range" min="1" max="' + sliderMax + '" step="1" value="' + sliderVal + '" aria-label="' + (isEraser ? '橡皮大小' : '笔画粗细') + '"></label>' +
    '</div>' +
    '<div class="note-toolbar-row note-toolbar-meta">' +
    '<div class="note-inserts" role="group" aria-label="插入内容">' +
      '<button class="note-act" data-act="note-insert-text" type="button">插入文字</button>' +
      '<button class="note-act" data-act="note-insert-image" type="button">插入图片</button>' +
    '</div>' +
    '<div class="note-actions">' +
      '<button class="note-act note-act-icon" data-act="note-undo" type="button" title="撤销" aria-label="撤销">' + noteIcon('undo') + '</button>' +
      '<button class="note-act note-act-icon" data-act="note-redo" type="button" title="重做" aria-label="重做">' + noteIcon('redo') + '</button>' +
      '<button class="note-act note-act-icon" data-act="note-clear" type="button" title="清空笔画" aria-label="清空笔画">' + noteIcon('trash') + '</button>' +
      '<button class="note-act note-act-icon" data-act="note-delete-item" type="button" title="删除选中的文字 / 图片" aria-label="删除选中的文字或图片">' + noteIcon('close') + '</button>' +
      '<button class="note-save' + (ui.noteDirty ? ' is-dirty' : '') + '" id="noteSaveBtn" data-act="note-save" type="button" aria-label="' + (ui.noteDirty ? '保存笔记' : '笔记已保存') + '" title="保存笔记（Ctrl/⌘ + S）">' +
        '<span class="note-save-dot" aria-hidden="true"></span><span class="note-save-label">' + (ui.noteDirty ? '保存' : '已保存') + '</span>' +
      '</button>' +
    '</div>' +
    '</div>' +
  '</div>';
}

function noteEmptyHtml(subjectId) {
  return '<div class="note-empty">' +
    '<div class="note-empty-mark">笔记</div>' +
    '<h2>还没有笔记</h2>' +
    '<p>可以新建一本笔记直接写，也可以把图片或 PDF 导入成页面，再在上面标注。</p>' +
    '<div class="note-empty-actions">' +
      '<button class="btn btn-primary" data-act="note-new-page" type="button">新建笔记</button>' +
      '<button class="btn" data-act="note-scan-a4" type="button">智能扫描</button>' +
      '<button class="btn" data-act="note-import" type="button">导入</button>' +
    '</div>' +
    '<p class="note-hint">PDF 首次导入需要联网加载解析器；导入的页面只保存在本机。</p>' +
  '</div>';
}

function notePageLabel(index, page) {
  return '第 ' + (index + 1) + ' 页';
}

function notePagesPanelHtml() {
  var pages = notePages();
  var active = noteIndex();
  return '<aside class="note-pages-panel" aria-label="页面列表">' +
    '<div class="note-pages-head"><span>页面</span><span>' + pages.length + '</span></div>' +
    '<div class="note-pages-list">' +
      pages.map(function (p, i) {
        var style = noteLibraryCoverStyle(p);
        var cls = 'note-side-thumb' + (!p.thumb && !p.background ? ' paper-' + (p.paper || 'ruled') : '');
        var title = notePageLabel(i, p);
        return '<div class="note-side-page' + (i === active ? ' is-on' : '') + (ui.noteSwapMode && ui.noteSwapFrom === i ? ' is-swap-source' : '') + (ui.notePageBatch && ui.notePageBatchSelected && ui.notePageBatchSelected[i] ? ' is-batch-selected' : '') + '">' +
          '<button class="note-side-open" data-act="note-page" data-index="' + i + '" type="button" aria-label="打开' + attr(title) + '">' +
            '<span class="' + cls + '"' + style + '>' + (p.thumb ? '' : '<i>' + (i + 1) + '</i>') + '</span>' +
            '<span class="note-side-title" title="' + attr(title) + '">' + esc(title) + '</span>' +
          '</button>' +
          '<div class="note-side-tools">' +
            '<button data-act="note-move-page" data-from="' + i + '" data-to="' + (i - 1) + '" type="button" title="上移" aria-label="上移这一页"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button data-act="note-move-page" data-from="' + i + '" data-to="' + (i + 1) + '" type="button" title="下移" aria-label="下移这一页"' + (i === pages.length - 1 ? ' disabled' : '') + '>↓</button>' +
            '<button data-act="note-duplicate-page" data-index="' + i + '" type="button" title="复制这一页" aria-label="复制这一页">⧉</button>' +
            '<button data-act="note-delete-page-side" data-index="' + i + '" type="button" title="删除这一页" aria-label="删除这一页">×</button>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<button class="note-pages-add" data-act="note-new-page" type="button">＋ 新建页</button>' +
  '</aside>';
}

function noteStripHtml(subjectId) {
  var pages = notePages(subjectId);
  if (!pages.length) return '';
  var active = noteIndex(subjectId);
  return '<div class="note-strip" aria-label="笔记页">' + pages.map(function (p, i) {
    var style = p.thumb ? ' style="background-image:url(' + attr(p.thumb) + ')"' : '';
    var thumbCls = 'note-thumb' + (!p.thumb && !p.background ? ' paper-' + (p.paper || 'ruled') : '');
    return '<button class="note-page' + (i === active ? ' is-on' : '') + (ui.noteSwapMode && ui.noteSwapFrom === i ? ' is-swap-source' : '') + (ui.notePageBatch && ui.notePageBatchSelected && ui.notePageBatchSelected[i] ? ' is-batch-selected' : '') + '" data-act="note-page" data-index="' + i + '" type="button" aria-label="' + attr(notePageLabel(i, p)) + '">' +
      '<span class="' + thumbCls + '"' + style + '>' + (p.thumb ? '' : '<i>' + (i + 1) + '</i>') + '</span>' +
      '<span class="note-page-label">' + esc(notePageLabel(i, p)) + '</span>' +
    '</button>';
  }).join('') +
  '<button class="note-page note-page-add" data-act="note-new-page" type="button" aria-label="新建一页"><span class="note-thumb"><i>+</i></span><span class="note-page-label">新页</span></button>' +
  '</div>';
}

function noteCoverStyle(book, page) {
  if (book && book.coverImage) return ' style="background-image:url(' + attr(book.coverImage) + ');background-size:cover;background-position:center"';
  if (book && book.cover) return '';
  return noteLibraryCoverStyle(page);
}

function noteBookCoverClass(book) {
  if (book && book.coverImage) return ' cover-custom';
  return book && book.cover ? ' cover-' + book.cover : '';
}

function noteLibraryCoverStyle(page) {
  if (page.thumb) return ' style="background-image:url(' + attr(page.thumb) + ')"';
  var colors = { white: '#fffefb', ruled: '#fffefb', grid: '#fffefb', dot: '#fffdf8', cream: '#fbf5e6', kraft: '#e5d3b3', black: '#151515', navy: '#17243a', rose: '#f5e4e8', slate: '#4a5560' };
  return ' style="background:' + (colors[page.paper] || '#fffefb') + '"';
}

function noteCrossNavHtml() {
  return '<nav class="cross-nav note-subj-cross" aria-label="跳到各科目">' +
    '<span class="cross-nav-label">去科目</span>' +
    SUBJECTS.map(function (s) {
      return '<a class="cross-pill" href="#/' + subjectRouteId(s.id) + '" data-act="note-goto-subject" data-subject="' + s.id + '" style="--subj:var(--' + s.id + ')">' +
        '<span class="dot" aria-hidden="true"></span>' + esc(s.name) + '</a>';
    }).join('') +
  '</nav>';
}

function noteLibraryEmptyHtml() {
  return '<div class="note-library-empty">' +
    '<div class="note-library-empty-cover" aria-hidden="true"><span class="note-book-spine"></span><span class="note-library-empty-plus">+</span></div>' +
    '<div class="note-library-empty-copy">' +
      '<div class="page-kicker">从第一本开始</div>' +
      '<h2>先建一本笔记</h2>' +
      '<p>空白页可以从头写，图片和 PDF 可以导入成页面；整本保存在本机，也能随 JSON 备份导出。</p>' +
      '<div class="note-library-empty-actions">' +
        '<button class="btn btn-primary" data-act="note-new-page" type="button">新建空白笔记</button>' +
        '<button class="btn" data-act="note-scan-a4" type="button">智能扫描</button>' +
        '<button class="btn" data-act="note-import" type="button">导入</button>' +
      '</div>' +
      '<p class="note-hint">建议先建一本，再按科目或章节慢慢加页。</p>' +
    '</div>' +
  '</div>';
}

function noteKbCardsHtml(notes) {
  return notes.map(function (n) {
    var body = String(n.body || '').replace(/[#>*_\x60\[\]()!-]+/g, ' ').replace(/\s+/g, ' ').trim();
    var tags = kbTagsOf(n.body).slice(0, 3);
    return '<button class="note-kb-card" data-act="kb-note" data-id="' + attr(n.id) + '" data-title="' + attr(n.title || '未命名笔记') + '" data-search="' + attr(((n.title || '') + ' ' + String(n.body || '')).toLowerCase()) + '" type="button">' +
      '<span class="note-kb-top"><span class="note-kb-mark">MD</span><span class="note-kb-type">知识笔记</span></span>' +
      '<span class="note-kb-title">' + esc(n.title || '未命名笔记') + '</span>' +
      '<span class="note-kb-snippet">' + esc(body ? body.slice(0, 96) : '空白 Markdown 笔记') + '</span>' +
      '<span class="note-kb-foot"><span class="note-kb-tags">' + (tags.length ? tags.map(function (t) { return '#' + esc(t); }).join(' ') : '无标签') + '</span>' +
        '<span>' + kbLinksOf(n.body).length + ' 链接 · ' + esc(timeAgo(n.updatedAt)) + '</span></span>' +
    '</button>';
  }).join('');
}

function noteKbEmptyHtml() {
  return '<div class="note-kb-empty">' +
    '<span class="note-kb-mark">MD</span>' +
    '<div><b>还没有知识笔记</b><p>用 Markdown 写概念、公式和错题方法；[[双链]]、标签和关系图谱都在笔记库内。</p></div>' +
    '<button class="btn btn-primary" data-act="kb-new" type="button">新建知识笔记</button>' +
  '</div>';
}

function noteTabsHtml(books, knowledge) {
  var current = ui.noteFilter === 'books' || ui.noteFilter === 'kb' ? ui.noteFilter : 'all';
  return '<div class="note-type-tabs" role="tablist" aria-label="笔记类型">' +
    '<button class="note-type-tab' + (current === 'all' ? ' is-on' : '') + '" data-act="note-filter" data-filter="all" role="tab" aria-selected="' + (current === 'all') + '" type="button">全部 <span>' + (books.length + knowledge.length) + '</span></button>' +
    '<button class="note-type-tab' + (current === 'books' ? ' is-on' : '') + '" data-act="note-filter" data-filter="books" role="tab" aria-selected="' + (current === 'books') + '" type="button">笔记本 <span>' + books.length + '</span></button>' +
    '<button class="note-type-tab' + (current === 'kb' ? ' is-on' : '') + '" data-act="note-filter" data-filter="kb" role="tab" aria-selected="' + (current === 'kb') + '" type="button">知识笔记 <span>' + knowledge.length + '</span></button>' +
  '</div>';
}

function noteLibraryHtml() {
  if (typeof kbEnsure === 'function') kbEnsure();
  var books = noteNotebooks();
  var knowledge = typeof kbNotes === 'function' ? kbNotes() : [];
  var batch = !!ui.noteBatch;
  var selected = ui.noteBatchSelected || {};
  var selectedCount = Object.keys(selected).length;
  var allSelected = books.length > 0 && books.every(function (b) { return selected[b.id]; });
  var filter = ui.noteFilter === 'books' || ui.noteFilter === 'kb' ? ui.noteFilter : 'all';
  if (batch) filter = 'books';
  var showBooks = filter !== 'kb';
  var showKnowledge = filter !== 'books';
  var bookCards = books.map(function (b, i) {
    var pages = b.pages || [];
    var coverPage = pages[0] || {};
    var cover = noteCoverStyle(b, coverPage);
    var coverClass = noteBookCoverClass(b);
    var isEntry = pages.some(function (p) { return p.kind === 'entry'; });
    var title = b.title || ('笔记 ' + (i + 1));
    var coverHtml = '<span class="note-book-cover' + (isEntry ? ' is-entry' : '') + coverClass + '"' + cover + '>' +
        '<span class="note-book-spine" aria-hidden="true"></span>' +
        (isEntry ? '<span class="note-book-badge">同步</span>' : '<span class="note-book-badge">' + pages.length + ' 页</span>') +
        ((!coverPage.thumb || b.cover) && !b.coverImage ? '<span class="note-book-initial">' + esc(title.slice(0, 2)) + '</span>' : '') +
      '</span>';
    var textHtml = '<span class="note-book-name">' + esc(title) + '</span>' +
      '<span class="note-book-meta">' + pages.length + ' 页 · ' + esc(timeAgo(b.updatedAt)) + '</span>';
    if (batch) {
      var on = !!selected[b.id];
      return '<button class="note-book note-book-batch' + (on ? ' is-batch-selected' : '') + '" data-act="note-batch-toggle" data-book="' + i + '" data-title="' + attr(title) + '" type="button" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + (on ? '取消选择' : '选择') + '：' + attr(title) + '">' +
        coverHtml + '<span class="note-book-check" aria-hidden="true">' + (on ? '✓' : '') + '</span>' + textHtml +
      '</button>';
    }
    return '<div class="note-book' + (coverPage.thumb ? ' has-thumb' : '') + '" data-title="' + attr(title) + '">' +
      '<button class="note-book-open" data-act="note-open" data-book="' + i + '" type="button" aria-label="打开笔记：' + attr(title) + '">' + coverHtml + textHtml + '</button>' +
      '<div class="note-book-actions">' +
        '<button class="note-book-action" data-act="note-rename-book" data-book="' + i + '" type="button" aria-label="重命名笔记：' + attr(title) + '">重命名</button>' +
        '<button class="note-book-action" data-act="note-cover-book" data-book="' + i + '" type="button" aria-label="修改封面：' + attr(title) + '">封面</button>' +
        '<button class="note-book-action is-danger" data-act="note-delete-book" data-book="' + i + '" type="button" title="删除「' + attr(title) + '」" aria-label="删除「' + attr(title) + '」">删除</button>' +
      '</div>' +
    '</div>';
  }).join('');
  var headActions;
  if (batch) {
    headActions = '<button class="btn" data-act="note-batch-all" type="button">' + (allSelected ? '取消全选' : '全选') + '</button>' +
      '<button class="btn" data-act="note-batch-cancel" type="button">取消</button>' +
      '<button class="btn btn-primary" data-act="note-batch-delete" type="button"' + (selectedCount ? '' : ' disabled') + '>删除选中' + (selectedCount ? '（' + selectedCount + '）' : '') + '</button>';
  } else if (filter === 'kb') {
    headActions = '<button class="btn btn-primary" data-act="kb-new" type="button">新建知识笔记</button>';
  } else if (filter === 'books') {
    headActions = (noteCurrentBook() ? '<button class="btn" data-act="note-library-close" type="button">返回当前页</button>' : '') +
      '<button class="btn btn-primary" data-act="note-new-page" type="button">新建笔记本</button>';
  } else {
    headActions = (noteCurrentBook() ? '<button class="btn" data-act="note-library-close" type="button">返回当前页</button>' : '') +
      '<button class="btn btn-primary" data-act="note-new-page" type="button">新建笔记本</button>' +
      '<button class="btn" data-act="kb-new" type="button">新建知识笔记</button>';
  }
  var top = (!batch && !books.length && !knowledge.length)
    ? ''
    : '<div class="note-library-top">' +
        '<label class="note-library-search"><span class="sr-only">搜索笔记</span><input id="noteLibrarySearch" type="search" value="' + attr(ui.noteQuery || '') + '" placeholder="搜索笔记本 / 知识笔记"></label>' +
        '<span class="note-library-count">' + (batch ? '已选 ' + selectedCount + ' 本' : (books.length + knowledge.length) + ' 项') + '</span>' +
        (!batch && books.length ? '<button class="btn btn-xs note-batch-entry" data-act="note-batch" type="button">批量删除</button>' : '') +
      '</div>';
  var bookSection = '';
  if (showBooks) {
    bookSection = '<section class="note-section note-section-books" data-section="books" aria-labelledby="noteBooksTitle">' +
      '<div class="note-section-head"><div><span class="note-section-kicker">NOTEBOOKS</span><h2 id="noteBooksTitle">笔记本</h2></div>' +
        '<div class="note-section-tools"><span class="note-section-meta">' + books.length + ' 本 · ' + noteTotalPages() + ' 页</span>' +
          (books.length ? '<button class="note-section-link" data-act="note-scan-a4" type="button">扫描</button><button class="note-section-link" data-act="note-import" type="button">导入</button><button class="note-section-link" data-act="note-open-export" type="button">导出</button>' : '') + '</div></div>' +
      (books.length
        ? '<div class="note-shelf">' + bookCards +
            (!batch ? '<button class="note-book note-book-new" data-act="note-new-page" type="button">' +
              '<span class="note-book-cover"><span class="note-book-spine" aria-hidden="true"></span><span class="note-book-plus">+</span></span>' +
              '<span class="note-book-name">新建笔记本</span><span class="note-book-meta">空白页 / 智能扫描 / 导入</span></button>' : '') +
          '</div>'
        : '<div class="note-books-empty"><div class="note-books-empty-mark" aria-hidden="true"><span>+</span><small>NOTEBOOK</small></div>' +
            '<div class="note-books-copy"><b>还没有笔记本</b><p>空白页可以从头写；图片和 PDF 可以整页导入，扫描后会保留纸张质感。</p>' +
              '<div class="note-books-actions"><button class="btn btn-primary" data-act="note-new-page" type="button">新建笔记本</button>' +
                '<button class="btn" data-act="note-scan-a4" type="button">智能扫描</button>' +
                '<button class="btn" data-act="note-import" type="button">导入图片 / PDF</button></div></div>' +
            '<div class="note-books-preview" aria-hidden="true"><b>空白页</b><span></span><span></span><span></span><span></span><em>NOTEBOOK</em></div></div>') +
    '</section>';
  }
  var kbSection = '';
  if (showKnowledge) {
    kbSection = '<section class="note-section note-section-kb" data-section="kb" aria-labelledby="noteKbTitle">' +
      '<div class="note-section-head"><div><span class="note-section-kicker">MARKDOWN</span><h2 id="noteKbTitle">知识笔记</h2></div>' +
        '<div class="note-section-tools"><span class="note-section-meta">' + knowledge.length + ' 条 · 双链 / 标签 / 图谱</span>' +
          '<button class="btn btn-xs note-section-add" data-act="kb-new" type="button">新建</button></div></div>' +
      (knowledge.length ? '<div class="note-kb-grid">' + noteKbCardsHtml(knowledge) + '</div>' : noteKbEmptyHtml()) +
    '</section>';
  }
  return '<section class="page-head note-library-head"><div>' +
      '<div class="page-kicker">笔记 / LIBRARY</div>' +
      '<h1 class="page-title">笔记库</h1>' +
      '<p class="page-sub">' + (batch ? '勾选要删除的笔记本；删除后无法恢复，请确认。' : '手写笔记本与 Markdown 知识笔记放在同一处；可搜索、导入、扫描，并随 JSON 备份导出。') + '</p>' +
    '</div><div class="page-actions">' + headActions + '</div></section>' +
    subjectJumpHtml('notes') +
    (batch ? '' : noteTabsHtml(books, knowledge)) +
    top + bookSection + kbSection +
    '<input type="file" id="noteFile" accept="image/*,application/pdf" multiple hidden>' +
    '<input type="file" id="noteScanA4File" accept="image/*" multiple hidden>';
}

function noteDeleteBook(index) {
  var books = noteNotebooks();
  var book = books[index];
  if (!book) return;
  var pages = book.pages || [];
  var title = book.title || ('笔记 ' + (index + 1));
  confirmDialog('要删除「' + title + '」吗？', '这本笔记共 ' + pages.length + ' 页，内容会一起删除，删除后无法恢复。', function () {
    books.splice(index, 1);
    if (ui.noteBookIndex >= books.length) ui.noteBookIndex = Math.max(0, books.length - 1);
    if (!books.length) ui.noteBookIndex = 0;
    ui.noteLibrary = true;
    ui.noteBatch = false;
    ui.noteBatchSelected = {};
    markDirty();
    render();
    toast('已删除这本笔记');
  }, true);
}

function noteStartBatch() {
  ui.noteBatch = true;
  ui.noteBatchSelected = {};
  render();
}

function noteCancelBatch() {
  ui.noteBatch = false;
  ui.noteBatchSelected = {};
  render();
}

function noteBatchToggle(index) {
  var books = noteNotebooks();
  var book = books[index];
  if (!book) return;
  if (!ui.noteBatchSelected) ui.noteBatchSelected = {};
  if (ui.noteBatchSelected[book.id]) delete ui.noteBatchSelected[book.id];
  else ui.noteBatchSelected[book.id] = true;
  render();
}

function noteBatchAll() {
  var books = noteNotebooks();
  if (!ui.noteBatchSelected) ui.noteBatchSelected = {};
  var allOn = books.every(function (b) { return ui.noteBatchSelected[b.id]; });
  ui.noteBatchSelected = {};
  if (!allOn) books.forEach(function (b) { ui.noteBatchSelected[b.id] = true; });
  render();
}

function noteBatchDelete() {
  var books = noteNotebooks();
  var selected = ui.noteBatchSelected || {};
  var ids = Object.keys(selected).filter(function (id) { return books.some(function (b) { return b.id === id; }); });
  if (!ids.length) { toast('请先勾选要删除的笔记'); return; }
  var pageCount = 0;
  books.forEach(function (b) { if (selected[b.id]) pageCount += (b.pages || []).length; });
  confirmDialog('要删除选中的 ' + ids.length + ' 本笔记吗？', '共 ' + pageCount + ' 页，删除后无法恢复，请确认。', function () {
    var set = {};
    ids.forEach(function (id) { set[id] = true; });
    var kept = books.filter(function (b) { return !set[b.id]; });
    state.noteBooks = kept;
    ui.noteBookIndex = Math.max(0, Math.min(ui.noteBookIndex || 0, kept.length - 1));
    ui.noteLibrary = true;
    ui.noteBatch = false;
    ui.noteBatchSelected = {};
    markDirty();
    render();
    toast('已删除 ' + ids.length + ' 本笔记');
  }, true);
}

function noteFilterLibrary(q) {
  var needle = String(q || '').trim().toLowerCase();
  ui.noteQuery = String(q || '');
  var cards = document.querySelectorAll('.note-book[data-title], .note-kb-card[data-title]');
  var shown = 0;
  cards.forEach(function (card) {
    var hit = !needle || String(card.getAttribute('data-search') || card.getAttribute('data-title') || '').toLowerCase().indexOf(needle) >= 0;
    card.hidden = !hit;
    if (hit) shown++;
  });
  var count = document.querySelector('.note-library-count');
  if (count) count.textContent = shown + ' 项';
  document.querySelectorAll('.note-section').forEach(function (sec) {
    var visible = Array.prototype.some.call(sec.querySelectorAll('[data-title]'), function (el) { return !el.hidden; });
    sec.classList.toggle('is-search-empty', !!needle && !visible);
  });
}

function noteOpenLibrary() {
  noteSwapReset();
  ui.notePageBatch = false;
  ui.notePageBatchSelected = {};
  noteSaveNow();
  ui.noteKb = false;
  ui.noteLibrary = true;
  render();
}

function noteOpenBook(index) {
  noteSwapReset();
  ui.notePageBatch = false;
  ui.notePageBatchSelected = {};
  noteSaveNow();
  var books = noteNotebooks(state.activeSubject);
  if (!books[index]) return;
  ui.noteBookIndex = index;
  noteSetPage(0);
  ui.noteLibrary = false;
  render();
}

function viewNotes() {
  if (ui.noteKb) return viewKnowledge();
  var books = noteNotebooks();
  var book = noteCurrentBook();
  var pages = book ? (book.pages || []) : [];
  var active = noteCurrent();
  if (ui.noteLibrary == null && books.length) ui.noteLibrary = true;
  if (ui.noteLibrary) return noteLibraryHtml();
  var head = '<section class="page-head">' +
    '<div>' +
      '<div class="page-kicker">笔记 / NOTEBOOK</div>' +
      (book
      ? '<h1 class="page-title note-title"><button class="note-title-btn" data-act="note-rename" type="button" title="重命名当前笔记" aria-label="重命名笔记：' + attr(book.title || '笔记') + '">' +
          '<span class="note-title-text">' + esc(book.title || '笔记') + '</span><span class="note-title-edit" aria-hidden="true">重命名</span>' +
        '</button></h1>'
      : '<h1 class="page-title">笔记</h1>') +
      '<p class="page-sub">' + (book ? (pages.length + ' 页 · 每页可独立书写；整本保存在本机，会随 JSON 备份一起导出。') : '手写、贴图、导入 PDF 都放在同一本里；笔记只保存在本机，会随 JSON 备份一起导出。') + '</p>' +
    '</div>' +
    (pages.length ? '<div class="page-actions">' +
      '<button class="btn" data-act="note-library" type="button">笔记库</button>' +
      '<button class="btn btn-primary" data-act="note-scan-a4" type="button">智能扫描</button>' +
      '<button class="btn" data-act="note-import" type="button">导入</button>' +
      '<button class="btn" data-act="note-open-export" type="button">导出</button>' +
    '</div>' : '') +
  '</section>';
  var body;
  if (!pages.length) body = noteEmptyHtml();
  else if (active && active.kind === 'entry' && typeof entryNotePageHtml === 'function') {
    body = entryNotePageHtml(null, active);
  } else {
    body = noteToolbarHtml() +
      '<div class="note-workspace' + (ui.notePageBatch ? ' is-page-batch' : '') + '">' +
      notePagesPanelHtml() +
      '<div class="note-canvas-col">' +
      '<div class="note-pagebar' + (ui.noteSwapMode ? ' is-swap-mode' : '') + (ui.notePageBatch ? ' is-page-batch' : '') + '">' +
        '<button class="note-nav" data-act="note-prev" type="button" aria-label="上一页">‹</button>' +
        '<span class="note-page-meta"><b>' + (ui.noteSwapMode ? (ui.noteSwapFrom == null ? '选页交换' : '已选第 ' + (ui.noteSwapFrom + 1) + ' 页') : '第 ' + (noteIndex() + 1) + ' / ' + pages.length + ' 页') + '</b><span>' + (ui.noteSwapMode ? (ui.noteSwapFrom == null ? '先点第一页，再点另一页' : '再点另一页完成互换') : esc(book ? (book.title || '') : '')) + '</span></span>' +
        '<button class="note-nav" data-act="note-next" type="button" aria-label="下一页">›</button>' +
        '<button class="note-rename" data-act="note-rename" type="button" title="重命名当前笔记" aria-label="重命名当前笔记">重命名</button>' +
        '<button class="note-rename note-cover-btn" data-act="note-cover" type="button" title="选择笔记封面" aria-label="选择笔记封面">封面</button>' +
        '<button class="note-rename note-swap-btn' + (ui.noteSwapMode ? ' is-on' : '') + '" data-act="note-swap-start" type="button" title="交换任意两页" aria-label="交换任意两页">' + (ui.noteSwapMode ? '取消' : '交换') + '</button>' +
      '</div>' +
      '<div class="note-board is-' + noteMode() + '" id="noteBoard">' +
        '<div class="note-paper' + (active && active.background ? '' : ' paper-' + ((active && active.paper) || 'ruled')) + '" aria-hidden="true"' + (active && active.background ? ' style="background-image:url(' + attr(active.background) + ')"' : '') + '></div>' +
        '<canvas id="noteCanvas" class="note-canvas" aria-label="笔记画布"></canvas>' +
        '<div class="note-items" id="noteItems">' + noteItemsHtml(active) + '</div>' +
        '<div class="note-eraser-halo" id="noteEraserHalo" hidden></div>' +
        '<div class="note-busy" id="noteBusy" hidden role="status" aria-live="polite"><span class="note-spinner" aria-hidden="true"></span><div class="note-busy-main"><div class="note-busy-line"><span id="noteBusyText">正在载入…</span><span class="note-busy-count" id="noteBusyCount"></span></div><div class="note-busy-track" id="noteBusyTrack" role="progressbar" aria-label="处理进度" aria-valuemin="0" aria-valuemax="100" hidden><i class="note-busy-fill" id="noteBusyFill"></i></div><div class="note-busy-meta"><span id="noteBusyElapsed">已等待 0 秒</span><span>请保持页面打开</span></div></div></div>' +
      '</div>' +
      '<div class="note-foot"><span>插入后自动切到浏览模式，可拖动或缩放；点手写即可在图片或文字上书写，双击可修改或删除。</span><span class="note-batch-actions"><button class="linkish" data-act="note-page-batch-start" type="button">批量删页</button><button class="linkish" data-act="note-delete-page" type="button">删除本页</button></span></div>' +
      '<div class="note-batch-bar' + (ui.notePageBatch ? ' is-on' : '') + '"><span>已选 ' + Object.keys(ui.notePageBatchSelected || {}).filter(function (k) { return ui.notePageBatchSelected[k]; }).length + ' 页</span><span class="note-batch-actions"><button class="linkish" data-act="note-page-batch-all" type="button">全选</button><button class="linkish note-danger-link" data-act="note-page-batch-delete" type="button">删除选中</button><button class="linkish" data-act="note-page-batch-cancel" type="button">取消</button></span></div>' +
      noteStripHtml() +
      '</div></div>';
  }
  return head + noteCrossNavHtml() + body +
    '<input type="file" id="noteFile" accept="image/*,application/pdf" multiple hidden>' +
    '<input type="file" id="noteInsertImageFile" accept="image/*" hidden>' +
    '<input type="file" id="noteReplaceImageFile" accept="image/*" hidden>' +
    '<input type="file" id="noteScanA4File" accept="image/*" multiple hidden>' +
    '<div class="note-busy-fallback" hidden></div>';
}

function noteResizeCanvas(canvas, page) {
  var dpr = Math.min(2, 1800 / Math.max(page.width, page.height));
  dpr = Math.max(0.8, dpr);
  canvas.width = Math.max(1, Math.round(page.width * dpr));
  canvas.height = Math.max(1, Math.round(page.height * dpr));
  canvas.style.aspectRatio = page.width + ' / ' + page.height;
  return dpr;
}

function noteBackgroundImage(page) {
  if (!page.background) return null;
  var img = noteBgImages[page.id];
  if (!img) {
    img = new Image();
    img.onload = function () { noteDrawAll(); };
    img.src = page.background;
    noteBgImages[page.id] = img;
  }
  return img.complete ? img : null;
}

function noteDrawHighlighter(ctx, stroke) {
  var pts = stroke.points || [];
  if (!pts.length) return;
  var base = stroke.width || 7;
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = stroke.color || '#211d18';
  ctx.fillStyle = stroke.color || '#211d18';
  ctx.lineWidth = base;
  ctx.beginPath();
  if (pts.length === 1) {
    ctx.arc(pts[0][0], pts[0][1], base / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  ctx.restore();
}

function noteDrawStroke(ctx, stroke) {
  if (stroke.tool === 'highlighter') { noteDrawHighlighter(ctx, stroke); return; }
  var pts = stroke.points || [];
  if (!pts.length) return;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (stroke.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
  else if (stroke.tool === 'highlighter') ctx.globalAlpha = 0.3;
  ctx.strokeStyle = stroke.color || '#211d18';
  ctx.fillStyle = stroke.color || '#211d18';
  var penStyle = stroke.penStyle || 'ballpoint';
  if (stroke.tool === 'pen' && penStyle === 'brush') ctx.globalAlpha = 0.9;
  else if (stroke.tool === 'pen' && penStyle === 'fountain') ctx.globalAlpha = 0.97;
  var base = stroke.tool === 'eraser' ? (stroke.eraserPage ? (stroke.width || 24) : (stroke.width || 3) * 10) : (stroke.width || 3);
  if (stroke.tool === 'pen' && penStyle === 'brush') base *= 1.28;
  if (pts.length === 1) {
    var p0 = pts[0];
    var r = base * (stroke.tool === 'eraser' ? 0.5 : (penStyle === 'fountain' ? 0.42 : (penStyle === 'brush' ? 0.66 : 0.55)));
    ctx.beginPath();
    ctx.arc(p0[0], p0[1], r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  for (var i = 1; i < pts.length; i++) {
    var a = pts[i - 1];
    var b = pts[i];
    var pr = b[2] == null ? 0.5 : b[2];
    var press = penStyle === 'fountain' ? (0.32 + pr * 1.2) : (penStyle === 'brush' ? (0.72 + pr * 0.95) : (0.55 + pr * 0.9));
    ctx.lineWidth = Math.max(0.8, base * press);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }
  ctx.restore();
}

function notePointInPolygon(pt, poly) {
  var x = pt[0], y = pt[1], inside = false;
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

function noteLassoBounds(page) {
  if (!noteLasso || !noteLasso.selected.length) return null;
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  noteLasso.selected.forEach(function (idx) {
    ((page.strokes[idx] || {}).points || []).forEach(function (pt) {
      if (pt[0] < minX) minX = pt[0]; if (pt[1] < minY) minY = pt[1];
      if (pt[0] > maxX) maxX = pt[0]; if (pt[1] > maxY) maxY = pt[1];
    });
  });
  if (!isFinite(minX)) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function noteDrawLassoOverlay(ctx, page) {
  if (!noteLasso) return;
  ctx.save();
  if (noteLasso.points && noteLasso.points.length > 1) {
    ctx.strokeStyle = 'rgba(163,58,34,.82)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(noteLasso.points[0][0], noteLasso.points[0][1]);
    for (var i = 1; i < noteLasso.points.length; i++) ctx.lineTo(noteLasso.points[i][0], noteLasso.points[i][1]);
    if (!noteLasso.drawing) ctx.closePath();
    ctx.stroke();
  }
  var b = noteLassoBounds(page);
  if (b) {
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(163,58,34,.9)';
    ctx.fillStyle = 'rgba(163,58,34,.07)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  }
  ctx.restore();
}

function noteLassoSelect(page) {
  if (!noteLasso || noteLasso.points.length < 3) { noteLasso = null; return; }
  var selected = [];
  (page.strokes || []).forEach(function (st, i) {
    if (st.tool === 'eraser') return;
    var hit = (st.points || []).some(function (pt) { return notePointInPolygon(pt, noteLasso.points); });
    if (hit) selected.push(i);
  });
  noteLasso.selected = selected;
  if (!selected.length) { noteLasso = null; toast('没有圈到笔迹'); }
  else toast('已圈选 ' + selected.length + ' 笔，拖动可移动');
}

function noteLassoDuplicate() {
  var page = noteCurrent(state.activeSubject);
  if (!page || !noteLasso || !noteLasso.selected.length) { toast('先用套索圈选笔迹'); return; }
  var copies = noteLasso.selected.map(function (i) {
    var copy = deepClone(page.strokes[i]);
    copy.points = (copy.points || []).map(function (pt) { return [pt[0] + 14, pt[1] + 14, pt[2]]; });
    return copy;
  });
  page.strokes = (page.strokes || []).concat(copies);
  noteLasso = null;
  page.updatedAt = nowIso();
  noteSaveNow();
  render();
  toast('已复制圈选的 ' + copies.length + ' 笔');
}

function noteLassoDelete() {
  var page = noteCurrent(state.activeSubject);
  if (!page || !noteLasso || !noteLasso.selected.length) { toast('先用套索圈选笔迹'); return; }
  var set = {};
  noteLasso.selected.forEach(function (i) { set[i] = 1; });
  page.strokes = (page.strokes || []).filter(function (st, i) { return !set[i]; });
  noteLasso = null;
  page.updatedAt = nowIso();
  noteSaveNow();
  render();
  toast('已删除圈选的笔迹');
}

function noteDrawAll() {
  var canvas = qs('#noteCanvas');
  var page = noteCurrent(state.activeSubject);
  if (!canvas || !page) return;
  var ctx = canvas.getContext('2d');
  var dpr = canvas.width / page.width;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  (page.strokes || []).forEach(function (s) { noteDrawStroke(ctx, s); });
  noteDrawLassoOverlay(ctx, page);
}

function notePointerPos(e, canvas, page) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * page.width / rect.width,
    y: (e.clientY - rect.top) * page.height / rect.height
  };
}

function noteAppendPoint(stroke, e, canvas, page) {
  var p = notePointerPos(e, canvas, page);
  var pressure = e.pointerType === 'pen' && e.pressure ? e.pressure : 0.5;
  var pts = stroke.points;
  var last = pts[pts.length - 1];
  if (last) {
    var dx = p.x - last[0], dy = p.y - last[1];
    if (dx * dx + dy * dy < 0.7) return false;
  }
  pts.push([p.x, p.y, pressure]);
  return true;
}

function noteItems(page) {
  if (!page) return [];
  if (!Array.isArray(page.items)) page.items = [];
  return page.items;
}

function noteItemById(page, id) {
  return noteItems(page).filter(function (it) { return it.id === id; })[0] || null;
}

function noteItemId() {
  return 'ni-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

function noteItemsHtml(page) {
  var selected = ui.noteSelectedItem || '';
  var resizeGrip = '<span class="note-item-resize" role="button" aria-label="拖动缩放" title="拖动缩放，可放大或缩小"><span class="note-item-resize-grip" aria-hidden="true">↘</span></span>';
  return noteItems(page).map(function (it) {
    var on = it.id === selected ? ' is-selected' : '';
    var style = 'left:' + (it.x * 100).toFixed(3) + '%;top:' + (it.y * 100).toFixed(3) + '%;';
    if (it.type === 'image') {
      style += 'width:' + (it.w * 100).toFixed(3) + '%;';
      return '<div class="note-item note-item-image' + on + '" data-item-id="' + attr(it.id) + '" style="' + style + '">' +
        '<img src="' + attr(it.src) + '" alt="' + attr(it.alt || '笔记图片') + '" draggable="false">' +
        resizeGrip +
      '</div>';
    }
    var size = Number(it.fontSize) || 30;
    var align = it.align === 'center' ? 'center' : (it.align === 'right' ? 'right' : 'left');
    style += 'max-width:' + (it.w * 100).toFixed(3) + '%;color:' + attr(it.color || '#211d18') + ';font-size:calc(var(--note-scale, 1) * ' + size + 'px);text-align:' + align + ';';
    return '<div class="note-item note-item-text' + on + '" data-item-id="' + attr(it.id) + '" style="' + style + '" title="双击修改或删除">' + esc(it.text) + resizeGrip + '</div>';
  }).join('');
}

function noteUpdateScale(page) {
  var canvas = qs('#noteCanvas');
  var board = qs('#noteBoard');
  if (!canvas || !board || !page) return;
  var w = canvas.getBoundingClientRect().width;
  if (w > 0) board.style.setProperty('--note-scale', (w / page.width).toFixed(4));
}

function noteSetSelected(id) {
  ui.noteSelectedItem = id || '';
  qsa('.note-item').forEach(function (el) {
    el.classList.toggle('is-selected', el.getAttribute('data-item-id') === ui.noteSelectedItem);
  });
}

function noteClampItemGeometry(item, page, el, rect) {
  if (!item || !el) return false;
  var changed = false;
  var maxW = 1;
  var oldW = Number(item.w) || (item.type === 'image' ? 0.45 : 0.7);
  var w = Math.max(0.08, Math.min(maxW, oldW));
  if (w !== item.w) { item.w = w; changed = true; }
  var maxH = Math.max(0.06, 1 - Math.max(0, Math.min(0.94, Number(item.y) || 0)));
  if (item.type === 'image') {
    var img = el.querySelector('img');
    var h = Number(item.h) || 0.3;
    if (img && img.naturalWidth && item.w) {
      h = item.w * page.width * (img.naturalHeight / img.naturalWidth) / page.height;
      if (h > 1) { h = 1; item.w = h * page.height * (img.naturalWidth / img.naturalHeight) / page.width; changed = true; }
    }
    h = Math.max(0.06, Math.min(1, h));
    if (Math.abs(h - item.h) > 0.001) { item.h = h; changed = true; }
  } else {
    var guard = 0;
    while (el.offsetHeight > maxH * rect.height && Number(item.fontSize) > 12 && guard < 24) {
      item.fontSize = Math.max(12, Number(item.fontSize) - 2);
      el.style.fontSize = 'calc(var(--note-scale, 1) * ' + item.fontSize + 'px)';
      changed = true;
      guard++;
    }
  }
  var visualW = item.type === 'image' ? item.w : Math.min(1, el.offsetWidth / Math.max(1, rect.width));
  var maxX = Math.max(0, 1 - visualW);
  var x = Math.max(0, Math.min(maxX, Number(item.x) || 0));
  if (x !== item.x) { item.x = x; changed = true; }
  var itemH = item.type === 'image' ? item.h : Math.min(1, el.offsetHeight / Math.max(1, rect.height));
  var maxY = Math.max(0, 1 - itemH);
  var y = Math.max(0, Math.min(maxY, Number(item.y) || 0));
  if (y !== item.y) { item.y = y; changed = true; }
  if (changed) {
    el.style.left = (item.x * 100).toFixed(3) + '%';
    el.style.top = (item.y * 100).toFixed(3) + '%';
    if (item.type === 'image') {
      el.style.width = (item.w * 100).toFixed(3) + '%';
    } else {
      el.style.maxWidth = (item.w * 100).toFixed(3) + '%';
    }
    page.updatedAt = nowIso();
    noteSaveNow();
  }
  return changed;
}

function noteBindItems(page) {
  var layer = qs('#noteItems');
  if (!layer || !page) return;
  noteUpdateScale(page);
  qsa('.note-item', layer).forEach(function (el) {
    var item = noteItemById(page, el.getAttribute('data-item-id'));
    if (!item) return;
    noteClampItemGeometry(item, page, el, layer.getBoundingClientRect());
    var didMove = false;
    el.addEventListener('pointerdown', function (e) {
      if (noteMode() !== 'browse') return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      noteSetSelected(item.id);
      var rect = layer.getBoundingClientRect();
      var sx = e.clientX, sy = e.clientY, ox = item.x, oy = item.y, moved = false;
      didMove = false;
      el.setPointerCapture(e.pointerId);
      function onMove(ev) {
        var dx = (ev.clientX - sx) / rect.width;
        var dy = (ev.clientY - sy) / rect.height;
        var itemW = Math.min(1, el.offsetWidth / Math.max(1, rect.width));
        var itemH = Math.min(1, el.offsetHeight / Math.max(1, rect.height));
        item.x = Math.max(0, Math.min(1 - itemW, ox + dx));
        item.y = Math.max(0, Math.min(1 - itemH, oy + dy));
        el.style.left = (item.x * 100).toFixed(3) + '%';
        el.style.top = (item.y * 100).toFixed(3) + '%';
        moved = true;
        didMove = true;
      }
      function onUp(ev) {
        el.removeEventListener('pointermove', onMove);
        if (el.hasPointerCapture && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        if (moved) { page.updatedAt = nowIso(); noteSaveNow(); }
      }
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp, { once: true });
      el.addEventListener('pointercancel', onUp, { once: true });
    });
    var resizeHandle = el.querySelector('.note-item-resize');
    if (resizeHandle) resizeHandle.addEventListener('pointerdown', function (e) { noteStartItemResize(el, item, page, layer, e); });
    if (resizeHandle) resizeHandle.addEventListener('dblclick', function (e) { e.stopPropagation(); });
    el.addEventListener('dblclick', function (e) {
      if (noteMode() !== 'browse') return;
      e.preventDefault();
      noteOpenItemDialog(item.id);
    });
    var lastTap = 0, lastTapX = 0, lastTapY = 0;
    el.addEventListener('pointerup', function (e) {
      if (noteMode() !== 'browse' || e.pointerType !== 'touch') return;
      var now = Date.now();
      if (!didMove && now - lastTap < 380 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 26) {
        lastTap = 0;
        e.preventDefault();
        noteOpenItemDialog(item.id);
      } else {
        lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY;
      }
    });
  });
  layer.addEventListener('pointerdown', function (e) {
    if (e.target === layer) noteSetSelected('');
  });
}

function noteOpenItemDialog(itemId) {
  var page = noteCurrent(state.activeSubject);
  if (!page) return;
  var item = itemId ? noteItemById(page, itemId) : null;
  if (!item) return;
  ui.noteEditingItem = item.id;
  ui.noteSelectedItem = item.id;
  var isImage = item.type === 'image';
  qs('#noteItemTitle').textContent = isImage ? '编辑图片' : '编辑文字';
  var preview = qs('#noteItemPreview');
  if (isImage) {
    preview.innerHTML = '<img src="' + attr(item.src || '') + '" alt="' + attr(item.alt || '笔记图片') + '">';
  } else {
    preview.innerHTML = '';
    var textBox = document.createElement('div');
    textBox.className = 'note-item-dialog-text';
    textBox.textContent = item.text || '';
    preview.appendChild(textBox);
  }
  qs('#noteItemMeta').textContent = isImage ? '图片 · 可更换图片或删除' : '文字 · 可修改内容、字号或删除';
  qs('#noteItemEditBtn').textContent = isImage ? '更换图片' : '修改文字';
  var dlg = qs('#noteItemDialog');
  if (dlg) dlg.showModal();
}

function noteEditItem() {
  var page = noteCurrent(state.activeSubject);
  if (!page) return;
  var item = noteItemById(page, ui.noteEditingItem);
  if (!item) return;
  var dlg = qs('#noteItemDialog');
  if (dlg) dlg.close();
  if (item.type === 'text') { noteOpenTextDialog(item.id); return; }
  ui.noteReplacingItem = item.id;
  var input = qs('#noteReplaceImageFile');
  if (input) input.click();
  else toast('图片选择器未就绪');
}

function noteConfirmDeleteItem() {
  var page = noteCurrent(state.activeSubject);
  if (!page) return;
  var item = noteItemById(page, ui.noteEditingItem);
  if (!item) return;
  var isImage = item.type === 'image';
  var dlg = qs('#noteItemDialog');
  if (dlg) dlg.close();
  confirmDialog(isImage ? '要删除这张图片吗？' : '要删除这段文字吗？', '删除后不会进入撤销记录。', function () {
    page.items = noteItems(page).filter(function (it) { return it.id !== item.id; });
    ui.noteSelectedItem = '';
    ui.noteEditingItem = '';
    page.updatedAt = nowIso();
    noteSaveNow();
    render();
    toast('已删除' + (isImage ? '图片' : '文字'));
  }, true);
}

async function noteReplaceImageFile(file, subjectId) {
  var page = noteCurrent(subjectId);
  var item = page ? noteItemById(page, ui.noteReplacingItem) : null;
  if (!page || !item || item.type !== 'image') return;
  noteBusy(true, '正在更换图片…');
  try {
    var img = await noteReadImage(file);
    var scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    var w = item.w;
    var h = w * page.width * (img.height / img.width) / page.height;
    if (h > 0.55) { h = 0.55; w = h * page.height * (img.width / img.height) / page.width; }
    item.src = c.toDataURL('image/jpeg', 0.86);
    item.alt = file.name || '插入的图片';
    item.w = w;
    item.h = h;
    item.x = Math.max(0, Math.min(1 - w, item.x));
    item.y = Math.max(0, Math.min(1 - h, item.y));
    ui.noteReplacingItem = '';
    page.updatedAt = nowIso();
    noteSaveNow();
    render();
    toast('图片已更换');
  } catch (e) {
    toast(e && e.message ? e.message : '图片更换失败');
  } finally {
    noteBusy(false);
  }
}

function noteStartItemResize(el, item, page, layer, e) {
  if (noteMode() !== 'browse') return;
  e.preventDefault();
  e.stopPropagation();
  noteSetSelected(item.id);
  var rect = layer.getBoundingClientRect();
  var sx = e.clientX, sy = e.clientY;
  var ow = item.w, oh = item.h, ofs = Number(item.fontSize) || 30, ox = item.x, oy = item.y;
  var ratio = ow > 0 ? oh / ow : 1;
  var maxW = item.type === 'image' ? 1 : Math.max(0.08, 1 - ox);
  var maxH = 1;
  var startTextWidth = item.type === 'text' ? Math.max(1, el.offsetWidth) : 0;
  var handle = e.currentTarget;
  var resized = false;
  if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);
  function onMove(ev) {
    var dx = (ev.clientX - sx) / Math.max(1, rect.width);
    var dy = (ev.clientY - sy) / Math.max(1, rect.height);
    var delta = dx;
    if (item.type === 'image') {
      var w = Math.max(0.08, Math.min(maxW, ow + delta));
      var h = Math.max(0.06, Math.min(maxH, w * ratio));
      if (h > maxH) { h = maxH; w = h / ratio; }
      w = Math.min(maxW, w);
      item.w = w;
      item.h = h;
      item.x = Math.max(0, Math.min(1 - w, ox));
      item.y = Math.max(0, Math.min(1 - h, oy));
      el.style.left = (item.x * 100).toFixed(3) + '%';
      el.style.top = (item.y * 100).toFixed(3) + '%';
      el.style.width = (item.w * 100).toFixed(3) + '%';
    } else {
      var scale = Math.max(0.45, Math.min(5, 1 + (ev.clientX - sx) / Math.max(1, startTextWidth)));
      var nw = Math.max(0.08, Math.min(maxW, ow * scale));
      var nfs = Math.max(12, Math.min(160, ofs * scale));
      item.w = nw;
      item.fontSize = Math.round(nfs);
      item.x = ox;
      el.style.left = (item.x * 100).toFixed(3) + '%';
      el.style.maxWidth = (item.w * 100).toFixed(3) + '%';
      el.style.fontSize = 'calc(var(--note-scale, 1) * ' + item.fontSize + 'px)';
      var guard = 0;
      while (el.offsetHeight > maxH * rect.height && item.fontSize > 12 && guard < 24) {
        item.fontSize = Math.max(12, item.fontSize - 2);
        el.style.fontSize = 'calc(var(--note-scale, 1) * ' + item.fontSize + 'px)';
        guard++;
      }
    }
    resized = true;
  }
  function onUp(ev) {
    ev.stopPropagation();
    handle.removeEventListener('pointermove', onMove);
    if (handle.hasPointerCapture && handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    if (resized) {
      page.updatedAt = nowIso();
      noteSaveNow();
    }
  }
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp, { once: true });
  handle.addEventListener('pointercancel', onUp, { once: true });
}

function noteDeleteSelected() {
  var page = noteCurrent(state.activeSubject);
  if (!page) return;
  var id = ui.noteSelectedItem;
  var item = id ? noteItemById(page, id) : null;
  if (!item) { toast('先点选文字或图片'); return; }
  page.items = noteItems(page).filter(function (it) { return it.id !== id; });
  ui.noteSelectedItem = '';
  page.updatedAt = nowIso();
  noteSaveNow();
  render();
  toast('已删除选中内容');
}

function noteOpenTextDialog(itemId) {
  var page = noteCurrent(state.activeSubject);
  if (!page) return;
  var item = itemId ? noteItemById(page, itemId) : null;
  ui.noteEditingItem = item ? item.id : '';
  var dlg = qs('#noteTextDialog');
  if (!dlg) return;
  qs('#noteTextTitle').textContent = item ? '修改文字' : '插入文字';
  var btn = qs('#noteTextConfirmBtn');
  if (btn) btn.textContent = item ? '保存文字' : '插入文字';
  qs('#noteTextInput').value = item ? item.text : '';
  qs('#noteTextSize').value = item ? String(Number(item.fontSize) || 30) : '30';
  qs('#noteTextAlign').value = item && item.align === 'center' ? 'center' : 'left';
  dlg.showModal();
  setTimeout(function () { var input = qs('#noteTextInput'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } }, 30);
}

function noteConfirmText() {
  var page = noteCurrent(state.activeSubject);
  if (!page) return;
  var input = qs('#noteTextInput');
  var text = input ? input.value.replace(/\s+$/, '') : '';
  if (!text.trim()) { toast('文字内容为空'); return; }
  var size = Number(qs('#noteTextSize').value) || 30;
  var align = qs('#noteTextAlign').value === 'center' ? 'center' : 'left';
  var item = ui.noteEditingItem ? noteItemById(page, ui.noteEditingItem) : null;
  var isEdit = !!item;
  if (item) {
    item.text = text;
    item.fontSize = size;
    item.align = align;
  } else {
    item = { id: noteItemId(), type: 'text', x: 0.15, y: 0.32, w: 0.7, fontSize: size, align: align, color: noteColor(), text: text };
    noteItems(page).push(item);
    ui.noteSelectedItem = item.id;
  }
  if (!isEdit) ui.noteMode = 'browse';
  page.updatedAt = nowIso();
  noteSaveNow();
  var dlg = qs('#noteTextDialog');
  if (dlg) dlg.close();
  ui.noteEditingItem = '';
  render();
  toast(isEdit ? '文字已保存' : '文字已插入 · 已切到浏览模式，可拖动或缩放');
}

async function noteInsertImageFile(file, subjectId) {
  var page = noteCurrent(subjectId);
  if (!page) return;
  noteBusy(true, '正在插入图片…');
  try {
    var img = await noteReadImage(file);
    var scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    var src = c.toDataURL('image/jpeg', 0.86);
    var w = 0.45;
    var h = w * page.width * (img.height / img.width) / page.height;
    if (h > 0.42) { h = 0.42; w = h * page.height * (img.width / img.height) / page.width; }
    var item = { id: noteItemId(), type: 'image', x: (1 - w) / 2, y: 0.52, w: w, h: h, src: src, alt: file.name || '插入的图片' };
    noteItems(page).push(item);
    ui.noteSelectedItem = item.id;
    ui.noteMode = 'browse';
    page.updatedAt = nowIso();
    noteSaveNow();
    render();
    toast('图片已插入 · 已切到浏览模式，可拖动或缩放');
  } catch (e) {
    toast(e && e.message ? e.message : '图片插入失败');
  } finally {
    noteBusy(false);
  }
}

var NOTE_SCAN_W = 1240;
var NOTE_SCAN_H = 1754;
var NOTE_SCAN_FILTERS = [
  { id: 'original', label: '原图' },
  { id: 'auto', label: '自动' },
  { id: 'enhance', label: '增强' },
  { id: 'gray', label: '灰度' },
  { id: 'bw', label: '黑白' }
];

function noteScanIsImage(file) {
  return !!(file && (/^image\//.test(file.type || '') || /\.(jpe?g|png|webp|bmp|heic|heif)$/i.test(file.name || '')));
}

function noteScanDetectBounds(img) {
  var w = img.naturalWidth || img.width;
  var h = img.naturalHeight || img.height;
  var full = { x: 0, y: 0, w: w, h: h };
  var max = 420;
  var scale = Math.min(1, max / Math.max(w, h));
  var cw = Math.max(1, Math.round(w * scale));
  var ch = Math.max(1, Math.round(h * scale));
  var c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  var ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, cw, ch);
  var data;
  try { data = ctx.getImageData(0, 0, cw, ch).data; } catch (e) { return full; }
  function lumAt(x, y) {
    var i = (y * cw + x) * 4;
    return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  var sw = Math.max(4, Math.round(cw * 0.04)), sh = Math.max(4, Math.round(ch * 0.04));
  var samples = [];
  [[0, 0], [cw - sw, 0], [0, ch - sh], [cw - sw, ch - sh]].forEach(function (p) {
    for (var y = p[1]; y < p[1] + sh; y += 2) for (var x = p[0]; x < p[0] + sw; x += 2) samples.push(lumAt(x, y));
  });
  samples.sort(function (a, b) { return a - b; });
  var bg = samples[Math.floor(samples.length * 0.5)] || 255;
  var rowCount = new Array(ch).fill(0);
  var colCount = new Array(cw).fill(0);
  for (var y = 0; y < ch; y++) {
    for (var x = 0; x < cw; x++) {
      if (Math.abs(lumAt(x, y) - bg) > 34) { rowCount[y]++; colCount[x]++; }
    }
  }
  var minRow = ch * 0.012, minCol = cw * 0.012;
  var x0 = -1, x1 = -1, y0 = -1, y1 = -1;
  for (var i = 0; i < cw; i++) if (colCount[i] > minCol) { if (x0 < 0) x0 = i; x1 = i; }
  for (var j = 0; j < ch; j++) if (rowCount[j] > minRow) { if (y0 < 0) y0 = j; y1 = j; }
  if (x0 < 0 || y0 < 0) return full;
  var bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  if (bw < cw * 0.22 || bh < ch * 0.22) return full;
  if (bw > cw * 0.97 && bh > ch * 0.97) return full;
  var padX = Math.round(bw * 0.004), padY = Math.round(bh * 0.004);
  x0 = Math.max(0, x0 - padX); y0 = Math.max(0, y0 - padY);
  x1 = Math.min(cw - 1, x1 + padX); y1 = Math.min(ch - 1, y1 + padY);
  return {
    x: Math.round(x0 / cw * w),
    y: Math.round(y0 / ch * h),
    w: Math.max(1, Math.round((x1 - x0 + 1) / cw * w)),
    h: Math.max(1, Math.round((y1 - y0 + 1) / ch * h))
  };
}

function noteScanDetectPage(img) {
  var w = img.naturalWidth || img.width;
  var h = img.naturalHeight || img.height;
  var full = { x: 0, y: 0, w: w, h: h };
  var max = 460;
  var scale = Math.min(1, max / Math.max(w, h));
  var cw = Math.max(1, Math.round(w * scale));
  var ch = Math.max(1, Math.round(h * scale));
  var c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  var ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, cw, ch);
  var data;
  try { data = ctx.getImageData(0, 0, cw, ch).data; } catch (e) { return { bounds: full, quad: null, cropped: false }; }
  var border = Math.max(2, Math.round(Math.min(cw, ch) * 0.03));
  var sr = [], sg = [], sb = [];
  function sample(x, y) {
    var i = (y * cw + x) * 4;
    sr.push(data[i]); sg.push(data[i + 1]); sb.push(data[i + 2]);
  }
  for (var x = 0; x < cw; x += 2) {
    for (var k = 0; k < border; k += 2) { sample(x, k); sample(x, ch - 1 - k); }
  }
  for (var y = 0; y < ch; y += 2) {
    for (var k2 = 0; k2 < border; k2 += 2) { sample(k2, y); sample(cw - 1 - k2, y); }
  }
  function med(arr) { arr.sort(function (a, b) { return a - b; }); return arr[Math.floor(arr.length / 2)] || 0; }
  var bgR = med(sr), bgG = med(sg), bgB = med(sb);
  var bgLum = bgR * 0.299 + bgG * 0.587 + bgB * 0.114;
  var mask = new Uint8Array(cw * ch);
  var count = 0;
  for (var yy = 0; yy < ch; yy++) {
    for (var xx = 0; xx < cw; xx++) {
      var idx = (yy * cw + xx) * 4;
      var r = data[idx], g = data[idx + 1], b = data[idx + 2];
      var d = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
      var lum = r * 0.299 + g * 0.587 + b * 0.114;
      if (d > 22 || Math.abs(lum - bgLum) > 30) { mask[yy * cw + xx] = 1; count++; }
    }
  }
  if (count < cw * ch * 0.015 || count > cw * ch * 0.995) return { bounds: full, quad: null, cropped: false };
  var minX = cw, minY = ch, maxX = -1, maxY = -1;
  var tl = { x: 0, y: 0, d: Infinity }, tr = { x: 0, y: 0, d: -Infinity }, br = { x: 0, y: 0, d: -Infinity }, bl = { x: 0, y: 0, d: Infinity };
  for (var y2 = 0; y2 < ch; y2++) {
    for (var x2 = 0; x2 < cw; x2++) {
      if (!mask[y2 * cw + x2]) continue;
      if (x2 < minX) minX = x2; if (x2 > maxX) maxX = x2;
      if (y2 < minY) minY = y2; if (y2 > maxY) maxY = y2;
      var sum = x2 + y2, diff = x2 - y2;
      if (sum < tl.d) { tl.d = sum; tl.x = x2; tl.y = y2; }
      if (sum > br.d) { br.d = sum; br.x = x2; br.y = y2; }
      if (diff > tr.d) { tr.d = diff; tr.x = x2; tr.y = y2; }
      if (diff < bl.d) { bl.d = diff; bl.x = x2; bl.y = y2; }
    }
  }
  var quad = [tl, tr, br, bl];
  function side(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  var minSide = Math.min(side(tl, tr), side(tr, br), side(br, bl), side(bl, tl));
  var area = Math.abs((tl.x * tr.y - tr.x * tl.y) + (tr.x * br.y - br.x * tr.y) + (br.x * bl.y - bl.x * br.y) + (bl.x * tl.y - tl.x * bl.y)) / 2;
  if (minSide < Math.min(cw, ch) * 0.16 || area < cw * ch * 0.08 || area > cw * ch * 0.985) quad = null;
  var bx0 = minX, by0 = minY, bx1 = maxX, by1 = maxY;
  if (quad) {
    bx0 = Math.min(tl.x, tr.x, br.x, bl.x); by0 = Math.min(tl.y, tr.y, br.y, bl.y);
    bx1 = Math.max(tl.x, tr.x, br.x, bl.x); by1 = Math.max(tl.y, tr.y, br.y, bl.y);
  }
  var bw = bx1 - bx0 + 1, bh = by1 - by0 + 1;
  if (bw < cw * 0.18 || bh < ch * 0.18) return { bounds: full, quad: null, cropped: false };
  if (bw > cw * 0.985 && bh > ch * 0.985) return { bounds: full, quad: null, cropped: false };
  var bounds = {
    x: Math.round(bx0 / cw * w),
    y: Math.round(by0 / ch * h),
    w: Math.max(1, Math.round(bw / cw * w)),
    h: Math.max(1, Math.round(bh / ch * h))
  };
  var sourceQuad = quad ? quad.map(function (p) { return { x: Math.round(p.x / cw * w), y: Math.round(p.y / ch * h) }; }) : null;
  return { bounds: bounds, quad: sourceQuad, cropped: true };
}

function noteScanFilterCss(filter) {
  if (filter === 'auto') return 'brightness(1.09) contrast(1.16) saturate(1.03)';
  if (filter === 'enhance') return 'brightness(1.15) contrast(1.08) saturate(1.08)';
  if (filter === 'gray') return 'grayscale(1) contrast(1.24) brightness(1.06)';
  if (filter === 'bw') return 'grayscale(1) contrast(1.35) brightness(1.08)';
  return 'none';
}

function noteScanThreshold(canvas) {
  var ctx = canvas.getContext('2d');
  var data;
  try { data = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (e) { return; }
  var px = data.data;
  var hist = new Array(256).fill(0);
  for (var i = 0; i < px.length; i += 4) {
    var g = Math.round(px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114);
    hist[g]++;
  }
  var total = px.length / 4, sum = 0;
  for (var t = 0; t < 256; t++) sum += t * hist[t];
  var sumB = 0, wB = 0, best = 0, threshold = 168;
  for (var k = 0; k < 256; k++) {
    wB += hist[k];
    if (!wB) continue;
    var wF = total - wB;
    if (!wF) break;
    sumB += k * hist[k];
    var mB = sumB / wB, mF = (sum - sumB) / wF;
    var between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) { best = between; threshold = k; }
  }
  for (var j = 0; j < px.length; j += 4) {
    var v = px[j] * 0.299 + px[j + 1] * 0.587 + px[j + 2] * 0.114;
    var out = v > threshold ? 255 : 0;
    px[j] = px[j + 1] = px[j + 2] = out;
    px[j + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
}

function noteScanRender(item) {
  var W = NOTE_SCAN_W, H = NOTE_SCAN_H;
  var canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  var bounds = item.autoCrop && item.bounds ? item.bounds : { x: 0, y: 0, w: item.img.naturalWidth, h: item.img.naturalHeight };
  var inset = Math.max(0, Math.min(0.4, (item.inset || 0) / 100));
  var crop = document.createElement('canvas');
  if (item.autoCrop && item.quad && item.quad.length === 4) {
    var quad = item.quad.map(function (q) { return { x: q.x, y: q.y }; });
    if (inset > 0) {
      var cx = quad.reduce(function (a, q) { return a + q.x; }, 0) / 4;
      var cy = quad.reduce(function (a, q) { return a + q.y; }, 0) / 4;
      var f = Math.max(0.2, 1 - inset * 2);
      quad.forEach(function (q) { q.x = cx + (q.x - cx) * f; q.y = cy + (q.y - cy) * f; });
    }
    var qx0 = Math.min(quad[0].x, quad[1].x, quad[2].x, quad[3].x);
    var qy0 = Math.min(quad[0].y, quad[1].y, quad[2].y, quad[3].y);
    var qx1 = Math.max(quad[0].x, quad[1].x, quad[2].x, quad[3].x);
    var qy1 = Math.max(quad[0].y, quad[1].y, quad[2].y, quad[3].y);
    var qw = Math.max(1, qx1 - qx0), qh = Math.max(1, qy1 - qy0);
    crop.width = Math.max(1, Math.round(qw)); crop.height = Math.max(1, Math.round(qh));
    var qctx = crop.getContext('2d');
    qctx.beginPath();
    qctx.moveTo(quad[0].x - qx0, quad[0].y - qy0);
    qctx.lineTo(quad[1].x - qx0, quad[1].y - qy0);
    qctx.lineTo(quad[2].x - qx0, quad[2].y - qy0);
    qctx.lineTo(quad[3].x - qx0, quad[3].y - qy0);
    qctx.closePath();
    qctx.clip();
    qctx.drawImage(item.img, -qx0, -qy0);
  } else {
    var sx = bounds.x + bounds.w * inset;
    var sy = bounds.y + bounds.h * inset;
    var sw = Math.max(1, bounds.w * (1 - inset * 2));
    var sh = Math.max(1, bounds.h * (1 - inset * 2));
    crop.width = Math.max(1, Math.round(sw)); crop.height = Math.max(1, Math.round(sh));
    crop.getContext('2d').drawImage(item.img, sx, sy, sw, sh, 0, 0, crop.width, crop.height);
  }
  var rot = ((item.rotation || 0) % 360 + 360) % 360;
  var src = crop;
  if (rot) {
    var rc = document.createElement('canvas');
    if (rot === 90 || rot === 270) { rc.width = crop.height; rc.height = crop.width; }
    else { rc.width = crop.width; rc.height = crop.height; }
    var rctx = rc.getContext('2d');
    rctx.translate(rc.width / 2, rc.height / 2);
    rctx.rotate(rot * Math.PI / 180);
    rctx.drawImage(crop, -crop.width / 2, -crop.height / 2);
    src = rc;
  }
  var scale = Math.min(W / src.width, H / src.height);
  var dw = src.width * scale, dh = src.height * scale;
  ctx.save();
  ctx.filter = noteScanFilterCss(item.filter);
  ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.restore();
  if (item.filter === 'bw') noteScanThreshold(canvas);
  return canvas;
}

function noteScanFilterButtons() {
  var item = noteScanState && noteScanState.items[noteScanState.active];
  var filter = item ? item.filter : 'auto';
  return NOTE_SCAN_FILTERS.map(function (f) {
    return '<button class="scan-filter' + (f.id === filter ? ' is-on' : '') + '" data-act="note-scan-filter" data-filter="' + f.id + '" type="button">' + f.label + '</button>';
  }).join('');
}

function noteScanQueueHtml() {
  if (!noteScanState) return '';
  return noteScanState.items.map(function (item, i) {
    return '<div class="scan-queue-item' + (i === noteScanState.active ? ' is-on' : '') + '">' +
      '<button class="scan-queue-pick" data-act="note-scan-pick" data-index="' + i + '" type="button" aria-label="查看第 ' + (i + 1) + ' 页"><img src="' + attr(item.preview) + '" alt="智能扫描第 ' + (i + 1) + ' 页"><b>' + (i + 1) + '</b></button>' +
      '<button class="scan-queue-del" data-act="note-scan-remove" data-index="' + i + '" type="button" aria-label="移除第 ' + (i + 1) + ' 页">×</button>' +
    '</div>';
  }).join('');
}

function noteScanDrawPreview() {
  if (!noteScanState) return;
  var item = noteScanState.items[noteScanState.active];
  var canvas = qs('#noteScanCanvas');
  if (!item || !canvas) return;
  var out = noteScanRender(item);
  canvas.width = out.width; canvas.height = out.height;
  canvas.getContext('2d').drawImage(out, 0, 0);
}

function noteScanUpdate() {
  if (!noteScanState) return;
  var filterWrap = qs('#noteScanFilters');
  if (filterWrap) filterWrap.innerHTML = noteScanFilterButtons();
  var queue = qs('#noteScanQueue');
  if (queue) queue.innerHTML = noteScanQueueHtml();
  var count = qs('#noteScanCount');
  if (count) count.textContent = noteScanState.items.length + ' 页';
  var inset = qs('#noteScanInset');
  var active = noteScanState.items[noteScanState.active];
  if (inset && active) inset.value = active.inset || 0;
  var insetVal = qs('#noteScanInsetVal');
  if (insetVal) insetVal.textContent = (active && active.inset || 0) + '%';
  noteScanDrawPreview();
  noteScanOcrRender();
}

async function noteScanAddFiles(files, subjectId) {
  var list = Array.prototype.slice.call(files || []).filter(noteScanIsImage);
  if (!list.length) { toast('请选择 JPG / PNG / HEIC 图片'); return; }
  if (!noteScanState) noteScanState = { items: [], active: 0, subject: subjectId || state.activeSubject };
  var dlg = qs('#noteScanDialog');
  if (dlg && !dlg.open) dlg.showModal();
  if (!(typeof aiConfigReady === 'function' && aiConfigReady()) && typeof checkAiStatus === 'function') {
    checkAiStatus().then(function () { noteScanOcrRender(); }, function () { });
  }
  var startCount = noteScanState.items.length;
  var items = [];
  var countEl = qs('#noteScanCount');
  for (var idx = 0; idx < list.length; idx++) {
    if (countEl) countEl.textContent = '读取 ' + (idx + 1) + ' / ' + list.length;
    try {
      var img = await noteReadImage(list[idx]);
      var page = noteScanDetectPage(img);
      var previewCanvas = document.createElement('canvas');
      var scale = Math.min(1, 180 / Math.max(img.width, img.height));
      previewCanvas.width = Math.max(1, Math.round(img.width * scale));
      previewCanvas.height = Math.max(1, Math.round(img.height * scale));
      previewCanvas.getContext('2d').drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
      items.push({
        img: img,
        preview: previewCanvas.toDataURL('image/jpeg', 0.74),
        bounds: page.bounds,
        quad: page.quad,
        autoCrop: page.cropped,
        filter: 'auto',
        rotation: 0,
        inset: 0,
        autoCrop: true,
        ocr: null,
        ocrBusy: false,
        ocrError: ''
      });
    } catch (e) { /* skip unreadable file */ }
    if ((idx + 1) % 3 === 0) await new Promise(function (r) { setTimeout(r, 0); });
  }
  if (!items.length) { toast('图片读取失败，请换一张 JPG / PNG'); return; }
  noteScanState.items = noteScanState.items.concat(items);
  noteScanState.active = items.length ? startCount : 0;
  noteScanUpdate();
  toast('已加入 ' + items.length + ' 页，可继续智能扫描');
}
function noteScanPick(index) {
  if (!noteScanState || !noteScanState.items[index]) return;
  noteScanState.active = index;
  noteScanUpdate();
}

function noteScanRemove(index) {
  if (!noteScanState) return;
  noteScanState.items.splice(index, 1);
  if (!noteScanState.items.length) { noteScanClose(); return; }
  noteScanState.active = Math.max(0, Math.min(index, noteScanState.items.length - 1));
  noteScanUpdate();
}

function noteScanSetFilter(filter) {
  if (!noteScanState) return;
  var item = noteScanState.items[noteScanState.active];
  if (!item) return;
  item.filter = filter;
  noteScanUpdate();
}

function noteScanRotate(dir) {
  if (!noteScanState) return;
  var item = noteScanState.items[noteScanState.active];
  if (!item) return;
  item.rotation = ((item.rotation || 0) + dir * 90 + 360) % 360;
  noteScanUpdate();
}

function noteScanAutoCrop() {
  if (!noteScanState) return;
  var item = noteScanState.items[noteScanState.active];
  if (!item) return;
  var page = noteScanDetectPage(item.img);
  item.bounds = page.bounds;
  item.quad = page.quad;
  item.autoCrop = page.cropped;
  item.inset = 0;
  noteScanUpdate();
  if (page.cropped) {
    toast(page.quad ? '已自动裁边' : '已自动裁掉空白边缘');
  } else {
    toast('未识别到清晰的纸张边缘，保留原图');
  }
}

function noteScanOcrRender() {
  var item = noteScanState && noteScanState.items[noteScanState.active];
  var stateEl = qs('#noteScanOcrState');
  var hintEl = qs('#noteScanOcrHint');
  var btn = qs('[data-act="note-scan-ocr"]');
  var resultEl = qs('#noteScanOcrResult');
  var textEl = qs('#noteScanOcrText');
  var errorEl = qs('#noteScanOcrError');
  if (!stateEl || !hintEl || !btn || !resultEl || !textEl || !errorEl) return;
  var directReady = typeof aiConfigReady === 'function' && aiConfigReady();
  var serverReady = typeof aiState !== 'undefined' && aiState.statusChecked && aiState.transport === 'server';
  var ready = directReady || serverReady;
  var cfg = directReady ? aiConfig() : null;
  var ocr = item && item.ocr;
  var busy = !!(item && item.ocrBusy);
  var otherBusy = !!(noteScanState && noteScanState.items && noteScanState.items.some(function (x) { return !!(x && x.ocrBusy && x !== item); }));
  btn.disabled = !ready || !item || busy || otherBusy;
  btn.textContent = busy ? '正在识别…' : '识别当前页文字';
  btn.setAttribute('aria-busy', busy ? 'true' : 'false');
  if (busy) stateEl.textContent = '识别中';
  else if (otherBusy) stateEl.textContent = '另一页识别中';
  else if (ocr && ocr.text) stateEl.textContent = ocr.text.length + ' 字';
  else if (item && item.ocrError) stateEl.textContent = '识别失败';
  else if (ready) stateEl.textContent = '可用';
  else stateEl.textContent = '未配置 API';
  hintEl.innerHTML = ready
    ? '当前页会先应用裁边、旋转和滤镜，再发送给模型；结果可编辑、复制或下载。'
    : '先在「设置与同步」配置带视觉能力的 AI 模型。<button class="linkish scan-ocr-config" data-act="open-settings" type="button">去配置</button>';
  resultEl.hidden = !ocr && !(item && item.ocrError);
  if (ocr) {
    if (document.activeElement !== textEl) textEl.value = ocr.text || '';
    errorEl.hidden = true;
  } else if (item && item.ocrError) {
    textEl.value = '';
    errorEl.hidden = false;
    errorEl.textContent = item.ocrError;
  }
  if (item) {
    textEl.oninput = function () {
      if (!item.ocr) item.ocr = { text: '', at: nowIso() };
      item.ocr.text = textEl.value;
      if (stateEl) stateEl.textContent = textEl.value.length + ' 字';
    };
  }
}

async function noteScanOcrCurrent() {
  if (!noteScanState) return;
  var item = noteScanState.items[noteScanState.active];
  if (!item) return;
  var directReady = typeof aiConfigReady === 'function' && aiConfigReady();
  var serverReady = typeof aiState !== 'undefined' && aiState.transport === 'server';
  if (!directReady && !serverReady) { toast('请先在「设置与同步」配置 AI 模型'); return; }
  if (item.ocrBusy) return;
  if (noteScanState.items.some(function (x) { return !!(x && x.ocrBusy); })) {
    toast('有一页正在识别文字，请等它完成');
    return;
  }
  item.ocrBusy = true;
  item.ocrError = '';
  var ocrKey = 'notes-ocr';
  var ocrController = typeof AbortController !== 'undefined' ? new AbortController() : null;
  noteScanOcrRender();
  longTaskStart(ocrKey, {
    label: '文字识别',
    steps: ['准备图片', '识别文字', '写入结果'],
    step: 0,
    stage: '正在准备图片…',
    detail: '先应用裁边、旋转和滤镜，再把当前页发送给视觉模型。',
    onCancel: function () { if (ocrController) ocrController.abort(); }
  });
  try {
    var canvas = noteScanRender(item);
    var data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    var systemPrompt = [
      '你是「四科错题本」扫描页的 OCR 引擎。图中可能同时有印刷体和手写体。',
      '逐字转写，不翻译、不改写、不总结、不解题、不补写图中没有的内容。',
      '按从上到下、从左到右的阅读顺序输出；保留题号、选项、批注和箭头含义。',
      '数学公式尽量写成 LaTeX：行内 $...$，独立 $...$；看不清的字符写 [看不清]。',
      '表格用制表符分列。只输出识别出的文字，不要代码围栏或解释；没有文字时输出 [无文字]。'
    ].join('\n');
    var image = [{ mediaType: 'image/jpeg', data: data }];
    longTaskUpdate(ocrKey, { step: 1, stage: '正在识别文字…', detail: '已发送给视觉模型，等待返回；这是真实网络等待时间。' });
    var out;
    if (directReady) {
      out = await callConfiguredDirect(aiConfig(), systemPrompt, '请识别这张智能扫描页中的全部手写和印刷文字。', image, 150000, ocrController ? ocrController.signal : null);
    } else {
      var res = await fetch('/api/ocr', {
        method: 'POST',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ images: image, aiConfig: typeof aiConfigForRequest === 'function' ? aiConfigForRequest() : null }),
        signal: ocrController ? ocrController.signal : undefined
      });
      var payload = null;
      try { payload = await res.json(); } catch (e) { payload = null; }
      if (!res.ok || !payload || payload.error) {
        var oe = new Error(payload && payload.error ? payload.error : ('OCR 请求失败（' + res.status + '）'));
        oe.code = payload && payload.code ? payload.code : 'OCR_ERROR';
        throw oe;
      }
      out = { text: payload.text || '', model: payload.model || '' };
    }
    var fence = String.fromCharCode(96, 96, 96);
    var text = String(out.text || '').trim();
    if (text.indexOf(fence) === 0) text = text.slice(fence.length).replace(/^[a-zA-Z]+\s*/, '').replace(/\s*$/, '');
    if (text.slice(-fence.length) === fence) text = text.slice(0, -fence.length);
    text = text.trim();
    if (!text) throw new Error('模型没有识别出文字');
    longTaskUpdate(ocrKey, { step: 2, stage: '正在写入结果…', detail: '识别已返回，正在整理并写入当前页。' });
    item.ocr = { text: text, at: nowIso(), model: out.model || (directReady && aiConfig().model) || '' };
    item.ocrError = '';
    longTaskFinish(ocrKey, { stage: '识别完成', detail: '已识别 ' + text.length + ' 字，可编辑后复制或下载。' });
    toast('已识别文字，可编辑后复制或下载');
  } catch (err) {
    if (err && err.name === 'AbortError') {
      longTaskFail(ocrKey, '已取消识别，当前页内容未改动。', { stage: '已取消', valueText: '已停止' });
      toast('已取消识别');
    } else {
      var msg = err && err.message ? err.message : 'OCR 识别失败';
      if (err && err.code === 'NO_AI_KEY') msg = '还没有配置 AI 模型服务';
      item.ocrError = msg;
      longTaskFail(ocrKey, msg, { stage: '识别失败', valueText: '未完成' });
      toast(msg);
    }
  } finally {
    item.ocrBusy = false;
    noteScanOcrRender();
  }
}

function noteScanOcrCopy() {
  var item = noteScanState && noteScanState.items[noteScanState.active];
  var text = item && item.ocr ? item.ocr.text : '';
  if (!text) { toast('还没有可复制的识别结果'); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { toast('文字已复制'); }, function () { toast('复制失败，请手动选择文字'); });
  } else {
    var ta = qs('#noteScanOcrText');
    if (ta) { ta.focus(); ta.select(); }
    toast('已选中文字，请按 Ctrl / ⌘ + C 复制');
  }
}

function noteScanOcrDownload() {
  var item = noteScanState && noteScanState.items[noteScanState.active];
  var text = item && item.ocr ? item.ocr.text : '';
  if (!text) { toast('还没有可下载的识别结果'); return; }
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '智能扫描-文字.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

function noteScanSetInset(value) {
  if (!noteScanState) return;
  var item = noteScanState.items[noteScanState.active];
  if (!item) return;
  item.inset = Math.max(0, Math.min(18, Number(value) || 0));
  var val = qs('#noteScanInsetVal');
  if (val) val.textContent = item.inset + '%';
  noteScanDrawPreview();
}

function noteScanClose() {
  var dlg = qs('#noteScanDialog');
  if (dlg) dlg.close();
  noteScanState = null;
}

async function noteScanSave() {
  ui.notePageBatch = false;
  ui.notePageBatchSelected = {};
  if (!noteScanState || !noteScanState.items.length) { toast('还没有智能扫描页'); return; }
  noteBusy(true, '正在保存智能扫描…');
  try {
    var subjectId = noteScanState.subject || state.activeSubject;
    var books = noteNotebooks(subjectId);
    var targetBook = (!ui.noteLibrary && noteCurrentBook(subjectId)) ? noteCurrentBook(subjectId) : null;
    var targetPages = targetBook ? (targetBook.pages || (targetBook.pages = [])) : [];
    var insertAt = targetBook && !ui.noteLibrary ? Math.min(targetPages.length, noteIndex(subjectId) + 1) : targetPages.length;
    var firstIndex = insertAt;
    var created = [];
    var scanItems = noteScanState.items.slice();
    for (var si = 0; si < scanItems.length; si++) {
      noteBusyProgress(si, scanItems.length, '正在保存第 ' + (si + 1) + ' / ' + scanItems.length + ' 页…');
      await new Promise(function (r) { setTimeout(r, 0); });
      var item = scanItems[si];
      var canvas = noteScanRender(item);
      var page = noteNewPage('智能扫描 ' + (si + 1));
      page.width = NOTE_SCAN_W;
      page.height = NOTE_SCAN_H;
      page.paper = 'white';
      page.background = canvas.toDataURL('image/jpeg', 0.9);
      page.thumb = noteMakeThumb(canvas);
      page.updatedAt = nowIso();
      created.push(page);
      noteBusyProgress(si + 1, scanItems.length, '已保存 ' + (si + 1) + ' / ' + scanItems.length + ' 页');
    }
    if (!targetBook) {
      targetBook = noteCreateNotebook(subjectId, '智能扫描笔记 ' + formatDate(nowIso()).slice(0, 16), created);
      firstIndex = 0;
    } else {
      Array.prototype.splice.apply(targetPages, [insertAt, 0].concat(created));
      firstIndex = insertAt;
      targetBook.updatedAt = nowIso();
    }
    var pdfWanted = !!(qs('#noteScanPdf') && qs('#noteScanPdf').checked);
    ui.noteLibrary = false;
    ui.noteMode = 'browse';
    noteSetPage(firstIndex);
    markDirty();
    noteScanClose();
    render();
    toast('已保存 ' + created.length + ' 页智能扫描笔记');
    if (pdfWanted) {
      var units = created.map(function (page, i) {
        return { book: targetBook, page: page, pageIndex: firstIndex + i };
      });
      setTimeout(function () { noteExportBatch(units, false, true, 'merge'); }, 350);
    }
  } catch (e) {
    toast(e && e.message ? e.message : '智能扫描保存失败');
  } finally {
    noteBusy(false);
  }
}

async function noteScanA4File(file, subjectId) {
  noteBusy(true, '正在智能扫描…');
  try {
    var img = await noteReadImage(file);
    var W = 1240, H = 1754;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    var target = W / H;
    var sw = img.width, sh = img.height;
    if (sw / sh > target) sw = sh * target; else sh = sw / target;
    var sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
    try { ctx.filter = 'grayscale(1) contrast(1.18) brightness(1.05)'; } catch (e) { /* noop */ }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    ctx.filter = 'none';
    var books = noteNotebooks(subjectId);
    var targetBook = (!ui.noteLibrary && noteCurrentBook(subjectId)) ? noteCurrentBook(subjectId) : null;
    var page;
    if (targetBook) {
      var pages = targetBook.pages || (targetBook.pages = []);
      page = noteNewPage('第 ' + (pages.length + 1) + ' 页');
      pages.push(page);
      noteSetPage(pages.length - 1);
      targetBook.updatedAt = nowIso();
    } else {
      page = noteNewPage('第 1 页');
      targetBook = noteCreateNotebook(subjectId, '智能扫描笔记 ' + (books.length + 1), [page]);
    }
    page.width = W;
    page.height = H;
    page.paper = 'white';
    page.background = c.toDataURL('image/jpeg', 0.86);
    page.thumb = noteMakeThumb(c);
    page.updatedAt = nowIso();
    ui.noteLibrary = false;
    ui.noteMode = 'browse';
    ui.noteSelectedItem = '';
    markDirty();
    render();
    toast('已保存为智能扫描页');
  } catch (e) {
    toast(e && e.message ? e.message : '智能扫描失败');
  } finally {
    noteBusy(false);
  }
}

function noteCoverGridHtml() {
  var current = ui.noteCoverPick || 'paper';
  return NOTE_COVERS.map(function (c) {
    return '<button class="cover-option' + (c.id === current ? ' is-on' : '') + '" data-act="note-cover-pick" data-cover="' + c.id + '" type="button" aria-pressed="' + (c.id === current) + '">' +
      '<span class="cover-swatch cover-' + c.id + '" style="--cover-bg:' + c.bg + ';--cover-ink:' + c.ink + '"><i>记</i></span>' +
      '<span>' + c.label + '</span>' +
    '</button>';
  }).join('');
}

function noteUpdateCoverCustom() {
  var preview = qs('#noteCoverPreview');
  var remove = qs('#noteCoverRemove');
  var image = ui.noteCoverImage || '';
  if (preview) {
    preview.hidden = !image;
    preview.classList.toggle('is-on', !!image && ui.noteCoverPick === 'custom');
    preview.style.backgroundImage = image ? 'url(' + image + ')' : '';
  }
  if (remove) remove.hidden = !image;
}

function noteCoverTargetBook() {
  var index = ui.noteCoverBook;
  return typeof index === 'number' ? noteNotebooks()[index] : noteCurrentBook();
}

function noteOpenCoverDialog(index) {
  ui.noteCoverBook = typeof index === 'number' ? index : null;
  var book = noteCoverTargetBook();
  if (!book) return;
  ui.noteCoverImage = book.coverImage || '';
  ui.noteCoverPick = book.coverImage ? 'custom' : (book.cover || 'paper');
  var grid = qs('#noteCoverGrid');
  if (grid) grid.innerHTML = noteCoverGridHtml();
  noteUpdateCoverCustom();
  var dlg = qs('#noteCoverDialog');
  if (dlg) dlg.showModal();
}

function notePickCover(id) {
  if (id === 'custom') {
    if (!ui.noteCoverImage) return;
  } else if (!NOTE_COVERS.some(function (c) { return c.id === id; })) return;
  ui.noteCoverPick = id;
  var grid = qs('#noteCoverGrid');
  if (grid) grid.innerHTML = noteCoverGridHtml();
  noteUpdateCoverCustom();
}

function noteCoverCropDrawTo(canvas) {
  var s = ui.noteCoverCrop;
  if (!s || !s.img || !canvas) return;
  var W = 600, H = 800;
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(0, 0, W, H);
  var iw = s.img.naturalWidth || s.img.width;
  var ih = s.img.naturalHeight || s.img.height;
  var base = s.fit === 'contain' ? Math.min(W / iw, H / ih) : Math.max(W / iw, H / ih);
  var scale = base * (s.zoom || 1);
  var bw = iw * scale, bh = ih * scale;
  var dx = bw > W ? (W - bw) * s.x : (W - bw) / 2;
  var dy = bh > H ? (H - bh) * s.y : (H - bh) / 2;
  ctx.drawImage(s.img, dx, dy, bw, bh);
  s.geom = { bw: bw, bh: bh };
}

function noteCoverCropDraw() {
  var canvas = qs('#noteCoverCropCanvas');
  if (canvas) noteCoverCropDrawTo(canvas);
}

function noteCoverCropSync() {
  var s = ui.noteCoverCrop;
  if (!s) return;
  var zoom = qs('#noteCoverCropZoom');
  var x = qs('#noteCoverCropX');
  var y = qs('#noteCoverCropY');
  if (zoom) zoom.value = Math.round(s.zoom * 100);
  if (x) x.value = Math.round(s.x * 100);
  if (y) y.value = Math.round(s.y * 100);
  var zv = qs('#noteCoverCropZoomVal');
  if (zv) zv.textContent = Math.round(s.zoom * 100) + '%';
  document.querySelectorAll('[data-act="note-cover-crop-fit"]').forEach(function (b) {
    var on = b.getAttribute('data-fit') === s.fit;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function noteCoverCropSetFit(fit) {
  var s = ui.noteCoverCrop;
  if (!s || (fit !== 'cover' && fit !== 'contain')) return;
  s.fit = fit;
  s.zoom = 1;
  s.x = 0.5;
  s.y = 0.5;
  noteCoverCropSync();
  noteCoverCropDraw();
}

async function noteImportCoverFile(file) {
  if (!file) return;
  try {
    var img = await noteReadImage(file);
    if (!img.naturalWidth && !img.width) throw new Error('图片读取失败');
    ui.noteCoverCrop = { img: img, fit: 'cover', zoom: 1, x: 0.5, y: 0.5 };
    noteCoverCropSync();
    var dlg = qs('#noteCoverCropDialog');
    if (dlg && !dlg.open) dlg.showModal();
    setTimeout(noteCoverCropDraw, 30);
  } catch (e) {
    toast('封面图片读取失败，请换 JPG / PNG');
  }
}

function noteCoverCropApply() {
  var s = ui.noteCoverCrop;
  if (!s) return;
  var canvas = document.createElement('canvas');
  noteCoverCropDrawTo(canvas);
  ui.noteCoverImage = canvas.toDataURL('image/jpeg', 0.82);
  ui.noteCoverPick = 'custom';
  ui.noteCoverCrop = null;
  var dlg = qs('#noteCoverCropDialog');
  if (dlg && dlg.open) dlg.close();
  var grid = qs('#noteCoverGrid');
  if (grid) grid.innerHTML = noteCoverGridHtml();
  noteUpdateCoverCustom();
  toast('封面已裁好，点「使用这个封面」保存');
}

function noteRemoveCoverImage() {
  ui.noteCoverImage = '';
  ui.noteCoverPick = 'paper';
  var grid = qs('#noteCoverGrid');
  if (grid) grid.innerHTML = noteCoverGridHtml();
  noteUpdateCoverCustom();
}

function noteConfirmCover() {
  var book = noteCoverTargetBook();
  if (!book) return;
  if (ui.noteCoverPick === 'custom' && ui.noteCoverImage) {
    book.coverImage = ui.noteCoverImage;
    if (!book.cover || book.cover === 'custom') book.cover = 'paper';
  } else {
    book.coverImage = '';
    book.cover = (ui.noteCoverPick && ui.noteCoverPick !== 'custom') ? ui.noteCoverPick : (book.cover || 'paper');
  }
  book.updatedAt = nowIso();
  ui.noteCoverBook = null;
  ui.noteCoverImage = '';
  var dlg = qs('#noteCoverDialog');
  if (dlg) dlg.close();
  markDirty();
  render();
  toast('笔记封面已更新');
}

function noteOpenRenameDialog(index) {
  ui.noteRenameBook = typeof index === 'number' ? index : null;
  var book = typeof index === 'number' ? noteNotebooks()[index] : noteCurrentBook(state.activeSubject);
  if (!book) return;
  var dlg = qs('#noteRenameDialog');
  if (!dlg) return;
  var input = qs('#noteRenameInput');
  if (input) {
    input.value = book.title || '';
    setTimeout(function () { input.focus(); input.select(); }, 30);
  }
  dlg.showModal();
}

function noteConfirmRename() {
  var index = ui.noteRenameBook;
  var book = typeof index === 'number' ? noteNotebooks()[index] : noteCurrentBook(state.activeSubject);
  var input = qs('#noteRenameInput');
  var name = input ? input.value.trim() : '';
  if (!book) return;
  if (!name) { toast('笔记名称不能为空'); return; }
  book.title = name.slice(0, 40);
  book.updatedAt = nowIso();
  ui.noteRenameBook = null;
  markDirty();
  var dlg = qs('#noteRenameDialog');
  if (dlg) dlg.close();
  render();
  toast('笔记名称已保存');
}

function noteExportBaseName(page) {
  var name = String((page && page.title) || '笔记').replace(/[\\/:*?"<>|]/g, '_').trim();
  return name || '笔记';
}

function noteDownloadBlob(blob, fileName) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
}

function noteLoadImageSrc(src) {
  return new Promise(function (resolve) {
    if (!src) { resolve(null); return; }
    var img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = src;
  });
}

function noteExportPaper(ctx, page) {
  var w = page.width, h = page.height, paper = page.paper || 'ruled';
  var base = paper === 'white' ? '#ffffff' : paper === 'cream' ? '#fbf5e6' : paper === 'kraft' ? '#e5d3b3' : paper === 'black' ? '#151515' : paper === 'navy' ? '#17243a' : paper === 'rose' ? '#f5e4e8' : paper === 'slate' ? '#4a5560' : '#fffefb';
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  if (paper === 'ruled') {
    ctx.strokeStyle = (paper === 'black' || paper === 'navy' || paper === 'slate') ? 'rgba(235,240,245,.16)' : 'rgba(49,93,134,.18)'; ctx.lineWidth = 1;
    for (var y = 34; y < h; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  } else if (paper === 'grid') {
    ctx.strokeStyle = (paper === 'black' || paper === 'navy' || paper === 'slate') ? 'rgba(235,240,245,.18)' : 'rgba(49,93,134,.2)'; ctx.lineWidth = 1;
    for (var x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (var gy = 0; gy < h; gy += 24) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
  } else if (paper === 'dot') {
    ctx.fillStyle = (paper === 'black' || paper === 'navy' || paper === 'slate') ? 'rgba(235,240,245,.38)' : 'rgba(49,93,134,.34)';
    for (var dx = 0; dx < w; dx += 18) for (var dy = 0; dy < h; dy += 18) { ctx.beginPath(); ctx.arc(dx, dy, 1.1, 0, Math.PI * 2); ctx.fill(); }
  } else if (paper === 'kraft') {
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(90,62,35,.1)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
}

function noteExportText(ctx, item, page) {
  var size = Number(item.fontSize) || 30;
  var family = getComputedStyle(document.body).fontFamily || 'serif';
  ctx.font = size + 'px ' + family;
  ctx.fillStyle = item.color || '#211d18';
  ctx.textBaseline = 'top';
  var pad = 3;
  var maxW = Math.max(20, item.w * page.width - pad * 2);
  var x0 = item.x * page.width + pad;
  var y0 = item.y * page.height + 1;
  var lineH = size * 1.5;
  var lines = [];
  String(item.text || '').split('\n').forEach(function (para) {
    if (!para) { lines.push(''); return; }
    var line = '';
    Array.from(para).forEach(function (ch) {
      var test = line + ch;
      if (line && ctx.measureText(test).width > maxW) { lines.push(line); line = ch; }
      else line = test;
    });
    lines.push(line);
  });
  var align = item.align === 'center' ? 'center' : (item.align === 'right' ? 'right' : 'left');
  ctx.textAlign = align;
  var x = align === 'center' ? item.x * page.width + item.w * page.width / 2 : (align === 'right' ? item.x * page.width + item.w * page.width - pad : x0);
  lines.forEach(function (line, i) { ctx.fillText(line, x, y0 + i * lineH); });
}

async function noteBuildExportCanvas(page) {
  var scale = 2;
  var W = Math.round(page.width * scale), H = Math.round(page.height * scale);
  var canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  noteExportPaper(ctx, page);
  if (page.background) {
    var bg = await noteLoadImageSrc(page.background);
    if (bg) ctx.drawImage(bg, 0, 0, page.width, page.height);
  }
  var items = noteItems(page);
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (it.type === 'image') {
      var img = await noteLoadImageSrc(it.src);
      if (img) ctx.drawImage(img, it.x * page.width, it.y * page.height, it.w * page.width, it.h * page.height);
    } else {
      noteExportText(ctx, it, page);
    }
  }
  var ink = document.createElement('canvas');
  ink.width = W; ink.height = H;
  var ictx = ink.getContext('2d');
  ictx.scale(scale, scale);
  (page.strokes || []).forEach(function (s) { noteDrawStroke(ictx, s); });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(ink, 0, 0);
  return canvas;
}

async function noteExportPageImage() {
  var page = noteCurrent(state.activeSubject);
  if (!page || page.kind === 'entry') return;
  noteBusy(true, '正在导出图片…');
  try {
    var canvas = await noteBuildExportCanvas(page);
    canvas.toBlob(function (blob) {
      if (blob) noteDownloadBlob(blob, noteExportBaseName(page) + '.png');
      noteBusy(false);
      toast('笔记图片已导出');
    }, 'image/png');
  } catch (e) {
    noteBusy(false);
    toast('图片导出失败');
  }
}

function noteMakePdfMulti(pages) {
  var enc = new TextEncoder();
  var chunks = [], len = 0;
  function add(x) {
    var b = typeof x === 'string' ? enc.encode(x) : x;
    chunks.push(b); len += b.length; return len;
  }
  var n = pages.length;
  var total = 2 + n * 3 + 1;
  var kids = pages.map(function (_, i) { return (3 + i * 3) + ' 0 R'; }).join(' ');
  add('%PDF-1.4\n');
  var offsets = [];
  offsets[1] = len; add('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  offsets[2] = len; add('2 0 obj\n<< /Type /Pages /Kids [' + kids + '] /Count ' + n + ' >>\nendobj\n');
  pages.forEach(function (pg, i) {
    var pageId = 3 + i * 3, imgId = 4 + i * 3, contentId = 5 + i * 3;
    offsets[pageId] = len; add(pageId + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pg.pw + ' ' + pg.ph + '] /Resources << /XObject << /Im0 ' + imgId + ' 0 R >> >> /Contents ' + contentId + ' 0 R >>\nendobj\n');
    offsets[imgId] = len; add(imgId + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + pg.imgW + ' /Height ' + pg.imgH + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + pg.bytes.length + ' >>\nstream\n'); add(pg.bytes); add('\nendstream\nendobj\n');
    var content = 'q\n' + pg.pw + ' 0 0 ' + pg.ph + ' 0 0 cm\n/Im0 Do\nQ\n';
    offsets[contentId] = len; add(contentId + ' 0 obj\n<< /Length ' + content.length + ' >>\nstream\n' + content + 'endstream\nendobj\n');
  });
  var xref = len;
  add('xref\n0 ' + total + '\n0000000000 65535 f \n');
  for (var id = 1; id < total; id++) add(String(offsets[id]).padStart(10, '0') + ' 00000 n \n');
  add('trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
  return new Blob(chunks, { type: 'application/pdf' });
}

function noteMakePdf(jpegBytes, imgW, imgH, pw, ph) {
  return noteMakePdfMulti([{ bytes: jpegBytes, imgW: imgW, imgH: imgH, pw: pw, ph: ph }]);
}

function noteCanvasBlob(canvas) {
  return new Promise(function (resolve) {
    canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
  });
}

function noteJpegBytes(canvas) {
  var data = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
  var bin = atob(data);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function noteBookBaseName(book) {
  var name = String((book && book.title) || '笔记').replace(/[\\/:*?"<>|]/g, '_').trim();
  return name || '笔记';
}

function noteExportFileTitle(unit) {
  var base = noteBookBaseName(unit.book);
  var count = (unit.book.pages || []).length;
  if (count > 1) base += ' - ' + String(unit.pageIndex + 1).padStart(2, '0');
  return base;
}

function noteExportUnits(subjectId, scope) {
  var books = noteNotebooks(subjectId);
  var selected = scope === 'all' ? books : [noteCurrentBook(subjectId)];
  var units = [];
  selected.forEach(function (book) {
    if (!book) return;
    (book.pages || []).forEach(function (page, idx) {
      if (page.kind !== 'entry') units.push({ book: book, page: page, pageIndex: idx });
    });
  });
  return units;
}

async function noteExportBatch(units, wantPng, wantPdf, pdfMode) {
  noteBusy(true, '正在准备导出…');
  try {
    var pdfItems = [];
    for (var i = 0; i < units.length; i++) {
      noteBusyProgress(i, units.length, '正在导出第 ' + (i + 1) + ' / ' + units.length + ' 页…');
      var canvas = await noteBuildExportCanvas(units[i].page);
      if (wantPng) {
        var blob = await noteCanvasBlob(canvas);
        if (blob) noteDownloadBlob(blob, noteExportFileTitle(units[i]) + '.png');
      }
      if (wantPdf) {
        pdfItems.push({
          bytes: noteJpegBytes(canvas),
          imgW: canvas.width,
          imgH: canvas.height,
          pw: 595,
          ph: Math.round(595 * units[i].page.height / units[i].page.width),
          book: units[i].book,
          unit: units[i]
        });
      }
      canvas.width = 0;
      canvas.height = 0;
      canvas = null;
      noteBusyProgress(i + 1, units.length, '已导出 ' + (i + 1) + ' / ' + units.length + ' 页');
      await new Promise(function (r) { setTimeout(r, 0); });
    }
    if (wantPdf) {
      if (pdfMode === 'page') {
        pdfItems.forEach(function (it) {
          noteDownloadBlob(noteMakePdfMulti([it]), noteExportFileTitle(it.unit) + '.pdf');
        });
        await new Promise(function (r) { setTimeout(r, 260); });
      } else if (pdfMode === 'split') {
        var groups = [];
        var byBook = {};
        pdfItems.forEach(function (it) {
          if (!byBook[it.book.id]) { byBook[it.book.id] = []; groups.push(it.book); }
          byBook[it.book.id].push(it);
        });
        groups.forEach(function (book) {
          noteDownloadBlob(noteMakePdfMulti(byBook[book.id]), noteBookBaseName(book) + '.pdf');
        });
        await new Promise(function (r) { setTimeout(r, 260); });
      } else {
        var multiBooks = {};
        pdfItems.forEach(function (it) { multiBooks[it.book.id] = 1; });
        var pdfName = Object.keys(multiBooks).length > 1
          ? noteBookBaseName(pdfItems[0].book) + '-合订.pdf'
          : noteBookBaseName(pdfItems[0].book) + '.pdf';
        noteDownloadBlob(noteMakePdfMulti(pdfItems), pdfName);
      }
    }
    noteBusy(false);
    var parts = [];
    if (wantPng) parts.push(units.length + ' 张 PNG');
    if (wantPdf) {
      var bookCount = {};
      units.forEach(function (u) { bookCount[u.book.id] = 1; });
      parts.push(pdfMode === 'page' ? units.length + ' 个 PDF' : (pdfMode === 'split' ? Object.keys(bookCount).length + ' 个 PDF' : '1 个 PDF'));
    }
    toast('已导出 ' + parts.join(' + '));
  } catch (e) {
    noteBusy(false);
    toast('导出失败，请重试');
  }
}
function noteExportPagesHtml(book) {
  if (!book) return '';
  var pages = book.pages || [];
  return pages.map(function (page, i) {
    if (page.kind === 'entry') return '';
    return '<label class="check note-export-page"><input type="checkbox" data-note-export-page data-page-index="' + i + '" checked> <span>' + esc(notePageLabel(i, page)) + '</span></label>';
  }).join('');
}

function noteExportUpdatePageSummary() {
  var boxes = document.querySelectorAll('#noteExportPages input[data-note-export-page]');
  var checked = document.querySelectorAll('#noteExportPages input[data-note-export-page]:checked').length;
  var summary = qs('#noteExportPageSummary');
  if (summary) summary.textContent = boxes.length ? '已选 ' + checked + ' / ' + boxes.length + ' 页' : '';
}

function noteExportSyncScope() {
  var scopeEl = document.querySelector('input[name="noteExportScope"]:checked');
  var scope = scopeEl ? scopeEl.value : 'current';
  var field = qs('#noteExportPagesField');
  if (field) field.hidden = scope === 'all';
  noteExportUpdatePageSummary();
}

function noteExportSelectPages(all) {
  document.querySelectorAll('#noteExportPages input[data-note-export-page]').forEach(function (el) { el.checked = !!all; });
  noteExportUpdatePageSummary();
}

function noteOpenExportDialog() {
  var subjectId = state.activeSubject;
  var books = noteNotebooks(subjectId);
  var allUnits = noteExportUnits(subjectId, 'all');
  var currentUnits = noteExportUnits(subjectId, 'current');
  if (!allUnits.length) { toast('没有可导出的笔记'); return; }
  var dlg = qs('#noteExportDialog');
  if (!dlg) return;
  var label = qs('#noteExportAllLabel');
  if (label) label.textContent = '全部笔记（' + books.length + ' 本 / ' + allUnits.length + ' 页）';
  var currentRadio = qs('#noteExportScopeCurrent');
  var allRadio = qs('#noteExportScopeAll');
  var canCurrent = currentUnits.length > 0;
  var prefAll = !!ui.noteLibrary;
  var list = qs('#noteExportPages');
  var currentBook = noteCurrentBook(subjectId);
  if (list) list.innerHTML = noteExportPagesHtml(currentBook);
  noteExportUpdatePageSummary();
  if (currentRadio) { currentRadio.disabled = !canCurrent; currentRadio.checked = canCurrent && !prefAll; }
  if (allRadio) allRadio.checked = !canCurrent || prefAll;
  var hint = qs('#noteExportHint');
  if (hint) hint.textContent = '当前笔记本可勾选一张或多张页面；全部笔记本会导出所有页面。PDF 可合订、每本一个或每页一个。';
  noteExportSyncScope();
  dlg.showModal();
}

function noteExportStart() {
  var subjectId = state.activeSubject;
  var scopeEl = document.querySelector('input[name="noteExportScope"]:checked');
  var scope = scopeEl ? scopeEl.value : 'current';
  var wantPng = !!(qs('#noteExportPng') && qs('#noteExportPng').checked);
  var wantPdf = !!(qs('#noteExportPdf') && qs('#noteExportPdf').checked);
  if (!wantPng && !wantPdf) { toast('至少选择一种格式'); return; }
  var units;
  if (scope === 'all') units = noteExportUnits(subjectId, 'all');
  else {
    var book = noteCurrentBook(subjectId);
    var selectedPages = [];
    document.querySelectorAll('#noteExportPages input[data-note-export-page]:checked').forEach(function (el) { selectedPages.push(Number(el.getAttribute('data-page-index'))); });
    units = selectedPages.map(function (idx) {
      var page = book && book.pages ? book.pages[idx] : null;
      return page && page.kind !== 'entry' ? { book: book, page: page, pageIndex: idx } : null;
    }).filter(Boolean);
  }
  if (!units.length) { toast('请至少选择一页'); return; }
  var modeEl = qs('#noteExportPdfMode');
  var pdfMode = modeEl ? modeEl.value : 'merge';
  var dlg = qs('#noteExportDialog');
  if (dlg) dlg.close();
  noteExportBatch(units, wantPng, wantPdf, pdfMode);
}

async function noteExportPagePdf() {
  var page = noteCurrent(state.activeSubject);
  if (!page || page.kind === 'entry') return;
  noteBusy(true, '正在导出 PDF…');
  noteBusyProgress(0, 0, '正在生成单页 PDF…');
  try {
    var canvas = await noteBuildExportCanvas(page);
    var data = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
    var bin = atob(data);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var pw = 595, ph = Math.round(pw * page.height / page.width);
    var blob = noteMakePdf(bytes, canvas.width, canvas.height, pw, ph);
    noteDownloadBlob(blob, noteExportBaseName(page) + '.pdf');
    noteBusy(false);
    toast('笔记 PDF 已导出');
  } catch (e) {
    noteBusy(false);
    toast('PDF 导出失败');
  }
}

function noteBindInsertImage(subjectId) {
  var input = qs('#noteInsertImageFile');
  if (input) input.addEventListener('change', function () {
    var f = (input.files || [])[0];
    input.value = '';
    if (f) noteInsertImageFile(f, subjectId);
  });
  var replace = qs('#noteReplaceImageFile');
  if (replace) replace.addEventListener('change', function () {
    var f = (replace.files || [])[0];
    replace.value = '';
    if (f) noteReplaceImageFile(f, subjectId);
  });
  var scan = qs('#noteScanA4File');
  if (scan) scan.addEventListener('change', function () {
    var files = Array.prototype.slice.call(scan.files || []);
    scan.value = '';
    if (files.length) noteScanAddFiles(files, subjectId);
  });
  var inset = qs('#noteScanInset');
  if (inset) inset.addEventListener('input', function () { noteScanSetInset(inset.value); });
  var cropZoom = qs('#noteCoverCropZoom');
  if (cropZoom) cropZoom.addEventListener('input', function () {
    if (!ui.noteCoverCrop) return;
    ui.noteCoverCrop.zoom = Math.max(1, Math.min(3, Number(cropZoom.value) / 100));
    var zv = qs('#noteCoverCropZoomVal');
    if (zv) zv.textContent = Math.round(ui.noteCoverCrop.zoom * 100) + '%';
    noteCoverCropDraw();
  });
  var cropX = qs('#noteCoverCropX');
  if (cropX) cropX.addEventListener('input', function () {
    if (!ui.noteCoverCrop) return;
    ui.noteCoverCrop.x = Math.max(0, Math.min(1, Number(cropX.value) / 100));
    noteCoverCropDraw();
  });
  var cropY = qs('#noteCoverCropY');
  if (cropY) cropY.addEventListener('input', function () {
    if (!ui.noteCoverCrop) return;
    ui.noteCoverCrop.y = Math.max(0, Math.min(1, Number(cropY.value) / 100));
    noteCoverCropDraw();
  });
  var cropDlg = qs('#noteCoverCropDialog');
  if (cropDlg && !cropDlg.dataset.boundClose) {
    cropDlg.dataset.boundClose = '1';
    cropDlg.addEventListener('close', function () { ui.noteCoverCrop = null; });
  }
  var cropCanvas = qs('#noteCoverCropCanvas');
  if (cropCanvas && !cropCanvas.dataset.boundDrag) {
    cropCanvas.dataset.boundDrag = '1';
    var cropDrag = null;
    cropCanvas.addEventListener('pointerdown', function (e) {
      var s = ui.noteCoverCrop;
      if (!s) return;
      cropDrag = { px: e.clientX, py: e.clientY, x: s.x, y: s.y };
      try { cropCanvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    cropCanvas.addEventListener('pointermove', function (e) {
      var s = ui.noteCoverCrop;
      if (!s || !cropDrag) return;
      var rect = cropCanvas.getBoundingClientRect();
      var geom = s.geom || { bw: 600, bh: 800 };
      var ox = Math.max(1, geom.bw - 600);
      var oy = Math.max(1, geom.bh - 800);
      var dx = (e.clientX - cropDrag.px) * 600 / (rect.width || 600);
      var dy = (e.clientY - cropDrag.py) * 800 / (rect.height || 800);
      s.x = Math.max(0, Math.min(1, cropDrag.x - dx / ox));
      s.y = Math.max(0, Math.min(1, cropDrag.y - dy / oy));
      var xr = qs('#noteCoverCropX'), yr = qs('#noteCoverCropY');
      if (xr) xr.value = Math.round(s.x * 100);
      if (yr) yr.value = Math.round(s.y * 100);
      noteCoverCropDraw();
    });
    cropCanvas.addEventListener('pointerup', function () { cropDrag = null; });
    cropCanvas.addEventListener('pointercancel', function () { cropDrag = null; });
  }
  var coverFile = qs('#noteCoverFile');
  if (coverFile) coverFile.addEventListener('change', function () {
    var f = (coverFile.files || [])[0];
    coverFile.value = '';
    if (f) noteImportCoverFile(f);
  });
  var scanDialog = qs('#noteScanDialog');
  if (scanDialog && !scanDialog.dataset.boundClose) {
    scanDialog.dataset.boundClose = '1';
    scanDialog.addEventListener('close', function () { noteScanState = null; });
  }
  var more = qs('#noteScanMoreFile');
  if (more) more.addEventListener('change', function () {
    var files = Array.prototype.slice.call(more.files || []);
    more.value = '';
    if (files.length) noteScanAddFiles(files, noteScanState && noteScanState.subject || subjectId);
  });
}

function noteBindCanvas(subjectId) {
  var canvas = qs('#noteCanvas');
  var page = noteCurrent(subjectId);
  if (!canvas || !page) return;
  var dpr = noteResizeCanvas(canvas, page);
  noteLasso = null;
  noteDrawAll();
  canvas.style.touchAction = noteMode() === 'draw' ? 'none' : 'auto';
  var board = qs('#noteBoard');
  if (board) board.classList.toggle('is-browse', noteMode() === 'browse');
  ['selectstart', 'contextmenu', 'dragstart'].forEach(function (type) {
    canvas.addEventListener(type, function (ev) { ev.preventDefault(); });
  });
  noteBindItems(page);
  noteUpdateScale(page);
  var eraserHalo = qs('#noteEraserHalo');
  function updateEraserHalo(ev) {
    if (!eraserHalo) return;
    if (noteMode() !== 'draw' || noteTool() !== 'eraser') { eraserHalo.hidden = true; return; }
    var br = board.getBoundingClientRect();
    var radius = Math.max(7, noteEraserCss() / 2);
    eraserHalo.hidden = false;
    eraserHalo.style.width = (radius * 2) + 'px';
    eraserHalo.style.height = (radius * 2) + 'px';
    eraserHalo.style.left = (ev.clientX - br.left) + 'px';
    eraserHalo.style.top = (ev.clientY - br.top) + 'px';
  }
  canvas.addEventListener('pointerenter', updateEraserHalo);
  canvas.addEventListener('pointerleave', function () { if (eraserHalo) eraserHalo.hidden = true; });

  canvas.addEventListener('pointerdown', function (e) {
    if (noteMode() !== 'draw') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    updateEraserHalo(e);
    canvas.setPointerCapture(e.pointerId);
    var now = noteTool();
    if (now === 'lasso') {
      var lp = notePointerPos(e, canvas, page);
      var lb = noteLassoBounds(page);
      if (noteLasso && noteLasso.selected.length && lb && lp.x >= lb.x && lp.x <= lb.x + lb.w && lp.y >= lb.y && lp.y <= lb.y + lb.h) {
        noteLasso.drag = { start: lp, origins: noteLasso.selected.map(function (idx) { return ((page.strokes[idx] || {}).points || []).map(function (pt) { return pt.slice(); }); }) };
        noteLasso.drawing = false;
      } else {
        noteLasso = { points: [[lp.x, lp.y]], selected: [], drawing: true, drag: null };
      }
      noteDrawAll();
      return;
    }
    if (now === 'line') {
      var lineStart = notePointerPos(e, canvas, page);
      noteDraft = {
        tool: 'line',
        color: noteColor(),
        width: noteWidth(),
        points: [[lineStart.x, lineStart.y, 0.5]]
      };
      page.strokes.push(noteDraft);
      page.updatedAt = nowIso();
      noteRedoReset(page.id);
      noteDrawAll();
      return;
    }
    noteDraft = {
      tool: now,
      color: now === 'eraser' ? '#211d18' : noteColor(),
      width: now === 'eraser' ? noteEraserPageWidth(canvas, page) : noteWidth(),
      eraserPage: now === 'eraser' ? true : undefined,
      penStyle: now === 'pen' ? notePenStyle() : undefined,
      points: []
    };
    noteAppendPoint(noteDraft, e, canvas, page);
    page.strokes.push(noteDraft);
    page.updatedAt = nowIso();
    noteRedoReset(page.id);
    noteDrawAll();
  });

  canvas.addEventListener('pointermove', function (e) {
    updateEraserHalo(e);
    if (noteMode() === 'draw' && noteTool() === 'lasso' && noteLasso) {
      e.preventDefault();
      var lp = notePointerPos(e, canvas, page);
      if (noteLasso.drag) {
        var dx = lp.x - noteLasso.drag.start.x, dy = lp.y - noteLasso.drag.start.y;
        noteLasso.selected.forEach(function (idx, k) {
          var st = page.strokes[idx]; if (!st) return;
          st.points = noteLasso.drag.origins[k].map(function (pt) { return [pt[0] + dx, pt[1] + dy, pt[2]]; });
        });
        noteDrawAll();
      } else if (noteLasso.drawing) {
        var last = noteLasso.points[noteLasso.points.length - 1];
        if (!last || Math.abs(lp.x - last[0]) + Math.abs(lp.y - last[1]) > 1.2) {
          noteLasso.points.push([lp.x, lp.y]);
          noteDrawAll();
        }
      }
      return;
    }
    if (!noteDraft || noteMode() !== 'draw') return;
    e.preventDefault();
    if (noteDraft.tool === 'line') {
      var lineNow = notePointerPos(e, canvas, page);
      noteDraft.points = [noteDraft.points[0], [lineNow.x, lineNow.y, 0.5]];
      noteDrawAll();
      return;
    }
    if (!noteAppendPoint(noteDraft, e, canvas, page)) return;
    var pts = noteDraft.points;
    if (noteDraft.tool === 'highlighter') {
      if (!noteHighlighterFrame) {
        noteHighlighterFrame = requestAnimationFrame(function () {
          noteHighlighterFrame = 0;
          noteDrawAll();
        });
      }
      return;
    }
    if (pts.length >= 2) {
      var ctx = canvas.getContext('2d');
      noteDrawStroke(ctx, { tool: noteDraft.tool, color: noteDraft.color, width: noteDraft.width, eraserPage: noteDraft.eraserPage, points: [pts[pts.length - 2], pts[pts.length - 1]] });
    }
  });

  function finish(e) {
    if (noteMode() === 'draw' && noteTool() === 'lasso' && noteLasso) {
      if (noteLasso.drag) {
        noteLasso.drag = null;
        page.updatedAt = nowIso();
        noteQueueSave();
      } else if (noteLasso.drawing) {
        noteLasso.drawing = false;
        noteLassoSelect(page);
      }
      noteDrawAll();
      if (canvas.hasPointerCapture && e && canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      return;
    }
    if (!noteDraft) return;
    if (noteHighlighterFrame) { cancelAnimationFrame(noteHighlighterFrame); noteHighlighterFrame = 0; }
    noteDraft = null;
    page.updatedAt = nowIso();
    noteQueueSave();
    noteDrawAll();
    if (canvas.hasPointerCapture && e && canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  }
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('pointerleave', function (e) { if (e.buttons === 0) finish(e); });

  var widthInput = qs('#noteWidth');
  if (widthInput) widthInput.addEventListener('input', function () {
    noteSwitchToDraw();
    if (noteTool() === 'eraser') ui.noteEraserCss = Number(widthInput.value);
    else ui.noteWidth = Number(widthInput.value);
  });
}

function noteRedoReset(pageId) {
  if (!ui.noteRedo) ui.noteRedo = {};
  ui.noteRedo[pageId] = [];
}

function noteRenderKeepToolbar() {
  var before = qs('.note-toolbar');
  var left = before ? before.scrollLeft : 0;
  var rowLefts = qsa('.note-toolbar-row').map(function (row) { return row.scrollLeft; });
  render();
  var after = qs('.note-toolbar');
  if (after) after.scrollLeft = left;
  qsa('.note-toolbar-row').forEach(function (row, i) {
    if (typeof rowLefts[i] === 'number') row.scrollLeft = rowLefts[i];
  });
}

function noteUndoPage() {
  var page = noteCurrent(state.activeSubject);
  if (!page || !page.strokes.length) { toast('没有可撤销的笔画'); return; }
  if (!ui.noteRedo) ui.noteRedo = {};
  var s = page.strokes.pop();
  (ui.noteRedo[page.id] = ui.noteRedo[page.id] || []).push(s);
  page.updatedAt = nowIso();
  noteSaveNow();
  noteRenderKeepToolbar();
}

function noteRedoPage() {
  var page = noteCurrent(state.activeSubject);
  if (!page) return;
  var stack = ui.noteRedo && ui.noteRedo[page.id];
  if (!stack || !stack.length) { toast('没有可重做的笔画'); return; }
  page.strokes.push(stack.pop());
  page.updatedAt = nowIso();
  noteSaveNow();
  noteRenderKeepToolbar();
}

function noteSwapReset() {
  ui.noteSwapMode = false;
  ui.noteSwapFrom = null;
}

function noteSwapStart() {
  if (!notePages().length) return;
  if (ui.noteSwapMode) {
    noteSwapReset();
    render();
    toast('已取消交换');
    return;
  }
  ui.noteSwapMode = true;
  ui.noteSwapFrom = null;
  render();
  toast('选择要交换的第一页');
}

function noteSwapSelect(index) {
  var pages = notePages();
  if (!ui.noteSwapMode || index < 0 || index >= pages.length) return;
  if (ui.noteSwapFrom == null) {
    ui.noteSwapFrom = index;
    render();
    toast('已选第 ' + (index + 1) + ' 页，再选另一页');
    return;
  }
  if (ui.noteSwapFrom === index) {
    ui.noteSwapFrom = null;
    render();
    toast('已取消选择');
    return;
  }
  var book = noteCurrentBook();
  if (!book) return;
  noteSaveNow();
  var from = ui.noteSwapFrom;
  var activePage = pages[noteIndex()];
  var tmp = pages[from];
  pages[from] = pages[index];
  pages[index] = tmp;
  book.updatedAt = nowIso();
  var nextActive = pages.indexOf(activePage);
  if (nextActive < 0) nextActive = index;
  noteSwapReset();
  noteSetPage(nextActive);
  markDirty();
  render();
  toast('已交换第 ' + (from + 1) + ' 页 ↔ 第 ' + (index + 1) + ' 页');
}

function noteChangePage(subjectId, index) {
  if (ui.noteSwapMode) noteSwapReset();
  var pages = notePages(subjectId);
  if (!pages.length) return;
  noteSaveNow();
  noteSetPage(Math.max(0, Math.min(pages.length - 1, index)));
  render();
}

function noteAddBlank(subjectId) {
  ui.notePageBatch = false;
  ui.notePageBatchSelected = {};
  var books = noteNotebooks(subjectId);
  var book = (!ui.noteLibrary && noteCurrentBook(subjectId)) ? noteCurrentBook(subjectId) : null;
  ui.noteLibrary = false;
  if (book) {
    var pages = book.pages || (book.pages = []);
    var previousPage = noteCurrent(state.activeSubject);
    var page = noteNewPage('第 ' + (pages.length + 1) + ' 页');
    page.paper = (previousPage && previousPage.paper) || 'ruled';
    var insertAt = pages.length ? Math.min(pages.length, noteIndex() + 1) : 0;
    pages.splice(insertAt, 0, page);
    book.updatedAt = nowIso();
    noteSetPage(insertAt);
    markDirty();
    render();
    toast('已新增一页');
  } else {
    var nb = noteCreateNotebook(subjectId, '笔记 ' + (books.length + 1), [noteNewPage('第 1 页')]);
    nb.updatedAt = nowIso();
    markDirty();
    render();
    toast('已新建笔记');
  }
}

function noteDuplicatePage(index) {
  var book = noteCurrentBook();
  if (!book) return;
  var pages = book.pages || [];
  var src = pages[index];
  if (!src) return;
  noteSaveNow();
  var copy = deepClone(src);
  copy.id = noteId();
  copy.title = (src.title || ('第 ' + (index + 1) + ' 页')) + ' 副本';
  copy.createdAt = nowIso();
  copy.updatedAt = nowIso();
  pages.splice(index + 1, 0, copy);
  book.updatedAt = nowIso();
  noteSetPage(index + 1);
  markDirty();
  render();
  toast('已复制这一页');
}

function noteMovePage(from, to) {
  var book = noteCurrentBook();
  if (!book) return;
  var pages = book.pages || [];
  if (from < 0 || from >= pages.length || to < 0 || to >= pages.length || from === to) return;
  noteSaveNow();
  var page = pages.splice(from, 1)[0];
  pages.splice(to, 0, page);
  book.updatedAt = nowIso();
  noteSetPage(to);
  markDirty();
  render();
}

function noteDeletePage(subjectId, pageIndex) {
  var books = noteNotebooks(subjectId);
  var book = noteCurrentBook(subjectId);
  if (!book) return;
  var pages = book.pages || [];
  var i = typeof pageIndex === 'number' ? pageIndex : noteIndex(subjectId);
  if (i < 0 || i >= pages.length) return;
  if (!pages[i]) return;
  var onlyPage = pages.length === 1;
  confirmDialog(onlyPage ? '要删除整本笔记吗？' : '要删除这一页吗？', onlyPage ? '这是最后一页，删除后整本笔记会从笔记库移除，且无法恢复。' : '这一页上的手写和背景图会一起删除，且无法恢复。', function () {
    pages.splice(i, 1);
    book.updatedAt = nowIso();
    if (!pages.length) {
      var bi = noteBookIndex(subjectId);
      books.splice(bi, 1);
      ui.noteBookIndex = Math.max(0, Math.min(bi, books.length - 1));
      ui.noteLibrary = true;
      toast('已删除整本笔记');
    } else {
      noteSetPage(Math.max(0, Math.min(i, pages.length - 1)));
      toast('已删除本页');
    }
    markDirty();
    render();
  });
}

function notePageBatchStart() {
  var book = noteCurrentBook();
  if (!book) return;
  noteSwapReset();
  noteSaveNow();
  ui.notePageBatch = true;
  ui.notePageBatchSelected = {};
  render();
}

function notePageBatchCancel() {
  ui.notePageBatch = false;
  ui.notePageBatchSelected = {};
  render();
}

function notePageBatchToggle(index) {
  if (!ui.notePageBatch) return;
  var pages = notePages();
  if (index < 0 || index >= pages.length) return;
  if (!ui.notePageBatchSelected) ui.notePageBatchSelected = {};
  if (ui.notePageBatchSelected[index]) delete ui.notePageBatchSelected[index];
  else ui.notePageBatchSelected[index] = true;
  render();
}

function notePageBatchAll() {
  if (!ui.notePageBatch) return;
  var pages = notePages();
  var selected = ui.notePageBatchSelected || {};
  var allOn = pages.length > 0 && pages.every(function (_, i) { return !!selected[i]; });
  ui.notePageBatchSelected = {};
  if (!allOn) pages.forEach(function (_, i) { ui.notePageBatchSelected[i] = true; });
  render();
}

function notePageBatchDelete() {
  if (!ui.notePageBatch) return;
  var book = noteCurrentBook();
  if (!book) return;
  var pages = book.pages || [];
  var selected = ui.notePageBatchSelected || {};
  var indices = Object.keys(selected).filter(function (k) { return selected[k] && pages[Number(k)]; }).map(Number);
  if (!indices.length) { toast('请先选择要删除的页面'); return; }
  var onlyAll = indices.length === pages.length;
  confirmDialog(onlyAll ? '要删除这本笔记的全部 ' + pages.length + ' 页吗？' : '要删除选中的 ' + indices.length + ' 页吗？', onlyAll ? '删除后整本笔记会从笔记库移除，且无法恢复。' : '这些页面上的手写、背景图和标注会一起删除，且无法恢复。', function () {
    var currentId = (pages[noteIndex()] || {}).id;
    var remaining = pages.filter(function (_, i) { return indices.indexOf(i) < 0; });
    if (!remaining.length) {
      var books = noteNotebooks();
      var bi = noteBookIndex();
      books.splice(bi, 1);
      ui.noteBookIndex = Math.max(0, Math.min(bi, books.length - 1));
      ui.noteLibrary = true;
      toast('已删除整本笔记');
    } else {
      book.pages = remaining;
      var keepIndex = remaining.findIndex(function (p) { return p.id === currentId; });
      if (keepIndex < 0) keepIndex = Math.max(0, Math.min(indices[0], remaining.length - 1));
      noteSetPage(keepIndex);
      toast('已删除 ' + indices.length + ' 页');
    }
    ui.notePageBatch = false;
    ui.notePageBatchSelected = {};
    markDirty();
    render();
  }, true);
}

function noteClearPage() {
  var page = noteCurrent(state.activeSubject);
  if (!page || !page.strokes.length) { toast('本页还没有笔画'); return; }
  confirmDialog('清空本页笔画？', '背景图会保留，只清除手写和标注。', function () {
    page.strokes = [];
    page.updatedAt = nowIso();
    noteSaveNow();
    render();
    toast('已清空本页笔画');
  });
}

function noteBusyText(text) {
  var t = qs('#noteBusyText');
  if (t && text) t.textContent = text;
}

function noteMakeThumb(canvas) {
  var t = document.createElement('canvas');
  var w = 124;
  t.width = w;
  t.height = Math.max(1, Math.round(w * canvas.height / canvas.width));
  t.getContext('2d').drawImage(canvas, 0, 0, t.width, t.height);
  return t.toDataURL('image/jpeg', 0.68);
}

function noteReadImage(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('图片解码失败，请换成 JPG / PNG')); };
    img.src = url;
  });
}

async function noteImportImage(file, subjectId) {
  var img = await noteReadImage(file);
  var maxW = 1700, maxH = 2400;
  var scale = Math.min(1, maxW / img.width, maxH / img.height);
  var w = Math.max(1, Math.round(img.width * scale));
  var h = Math.max(1, Math.round(img.height * scale));
  var c = document.createElement('canvas');
  c.width = w; c.height = h;
  var ctx = c.getContext('2d');
  ctx.fillStyle = '#fffefb'; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  var page = noteNewPage(file.name.replace(/\.[^.]+$/, '') || '图片笔记');
  page.width = w;
  page.height = h;
  page.background = c.toDataURL('image/jpeg', 0.82);
  page.thumb = noteMakeThumb(c);
  return page;
}

function noteLoadPdfLib() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (notePdfPromise) return notePdfPromise;
  var p = new Promise(function (resolve, reject) {
    var src = NOTE_PDF_BASE + 'pdf.min.js';
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = function () {
      if (!window.pdfjsLib) { reject(new Error('PDF 解析器加载失败')); return; }
      fetch(NOTE_PDF_BASE + 'pdf.worker.min.js').then(function (r) {
        if (!r.ok) throw new Error('PDF 解析器加载失败');
        return r.text();
      }).then(function (code) {
        var blob = new Blob([code], { type: 'application/javascript' });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
        resolve(window.pdfjsLib);
      }).catch(reject);
    };
    s.onerror = function () { reject(new Error('PDF 解析器需要联网加载，请检查网络后重试')); };
    document.head.appendChild(s);
  });
  // 失败的 promise 不能永久缓存：CDN 恢复或网络重连后应允许再次尝试。
  notePdfPromise = p.catch(function (err) {
    notePdfPromise = null;
    throw err;
  });
  return notePdfPromise;
}

async function noteImportPdf(file, subjectId) {
  noteBusyProgress(0, 0, '正在加载 PDF 解析器…');
  var lib = await noteLoadPdfLib();
  var buf = await file.arrayBuffer();
  var pdf = await lib.getDocument({ data: new Uint8Array(buf) }).promise;
  var total = pdf.numPages;
  var count = Math.min(total, 12);
  var added = [];
  for (var i = 1; i <= count; i++) {
    noteBusyProgress(i - 1, count, '正在转换 PDF 第 ' + i + ' / ' + count + ' 页…');
    var p = await pdf.getPage(i);
    var base = p.getViewport({ scale: 1 });
    var scale = Math.min(1.7, 1200 / base.width);
    var vp = p.getViewport({ scale: scale });
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(vp.width));
    c.height = Math.max(1, Math.round(vp.height));
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fffefb'; ctx.fillRect(0, 0, c.width, c.height);
    await p.render({ canvasContext: ctx, viewport: vp }).promise;
    var page = noteNewPage('PDF 第 ' + i + ' 页');
    page.width = c.width;
    page.height = c.height;
    page.background = c.toDataURL('image/jpeg', 0.84);
    page.thumb = noteMakeThumb(c);
    added.push(page);
    noteBusyProgress(i, count, '已转换 PDF 第 ' + i + ' / ' + count + ' 页');
  }
  if (total > count) toast('PDF 共 ' + total + ' 页，已导入前 ' + count + ' 页');
  return added;
}

async function noteImportFiles(files, subjectId) {
  if (!files || !files.length) return;
  var books = noteNotebooks(subjectId);
  var targetBook = (!ui.noteLibrary && noteCurrentBook(subjectId)) ? noteCurrentBook(subjectId) : null;
  var addedPages = 0;
  var addedBooks = 0;
  var firstBookIndex = null;
  var firstPageIndex = 0;
  var errors = [];
  noteBusy(true, '正在导入…');
  try {
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      noteBusyProgress(i, files.length, '正在导入第 ' + (i + 1) + ' / ' + files.length + ' 个文件…');
      try {
        if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
          noteBusyText('正在读取 ' + file.name + '…');
          var pdfPages = await noteImportPdf(file, subjectId);
          if (targetBook) {
            var tpages = targetBook.pages || (targetBook.pages = []);
            pdfPages.forEach(function (pg) {
              pg.title = '第 ' + (tpages.length + 1) + ' 页';
              tpages.push(pg); addedPages++;
            });
            targetBook.updatedAt = nowIso();
            if (firstBookIndex == null) { firstBookIndex = noteBookIndex(subjectId); firstPageIndex = tpages.length - pdfPages.length; }
          } else {
            var pdfBookTitle = file.name.replace(/\.[^.]+$/, '') || 'PDF 笔记';
            var pdfBook = noteCreateNotebook(subjectId, pdfBookTitle, pdfPages);
            pdfBook.pages.forEach(function (pg, k) { pg.title = '第 ' + (k + 1) + ' 页'; });
            addedPages += pdfPages.length;
            addedBooks++;
            if (firstBookIndex == null) { firstBookIndex = books.length - 1; firstPageIndex = 0; }
          }
        } else if (/^image\//.test(file.type) || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name)) {
          noteBusyText('正在处理 ' + file.name + '…');
          var imgPage = await noteImportImage(file, subjectId);
          if (targetBook) {
            var ipages = targetBook.pages || (targetBook.pages = []);
            imgPage.title = '第 ' + (ipages.length + 1) + ' 页';
            ipages.push(imgPage);
            targetBook.updatedAt = nowIso();
            addedPages++;
            if (firstBookIndex == null) { firstBookIndex = noteBookIndex(subjectId); firstPageIndex = ipages.length - 1; }
          } else {
            var imgTitle = file.name.replace(/\.[^.]+$/, '') || '图片笔记';
            imgPage.title = '第 1 页';
            noteCreateNotebook(subjectId, imgTitle, [imgPage]);
            addedPages++;
            addedBooks++;
            if (firstBookIndex == null) { firstBookIndex = books.length - 1; firstPageIndex = 0; }
          }
        } else {
          errors.push(file.name + '：不是图片或 PDF');
        }
      } catch (e) {
        errors.push(file.name + '：' + (e.message || '导入失败'));
      }
      noteBusyProgress(i + 1, files.length, '已处理 ' + (i + 1) + ' / ' + files.length + ' 个文件');
    }
  } finally {
    noteBusy(false);
  }
  if (addedPages) {
    ui.noteLibrary = false;
    if (firstBookIndex != null) ui.noteBookIndex = firstBookIndex;
    noteSetPage(firstPageIndex);
    markDirty();
    render();
    var msg = '已导入 ' + addedPages + ' 页' + (addedBooks ? ' · ' + addedBooks + ' 本笔记' : '') + (errors.length ? '，' + errors.length + ' 个文件失败' : '');
    try { if (JSON.stringify(state).length > 4.2 * 1024 * 1024) msg += '；笔记已接近浏览器存储上限，建议导出备份'; } catch (e) {}
    toast(msg);
  } else {
    toast(errors[0] || '没有可导入的内容');
  }
  if (errors.length > 1) console.warn('[notes] import errors', errors);
}

function noteBindFiles(subjectId) {
  var input = qs('#noteFile');
  if (!input) return;
  input.addEventListener('change', function () {
    var files = Array.prototype.slice.call(input.files || []);
    input.value = '';
    noteImportFiles(files, subjectId);
  });
}

function initNotesView(subjectId) {
  noteBindCanvas(subjectId);
  noteBindFiles(subjectId);
  noteBindInsertImage(subjectId);
}

/* keep canvas crisp after resize / orientation change */
var noteResizeTimer = null;
window.addEventListener('resize', function () {
  if (state.activeView !== 'notes') return;
  if (noteResizeTimer) clearTimeout(noteResizeTimer);
  noteResizeTimer = setTimeout(function () {
    var canvas = qs('#noteCanvas');
    var page = noteCurrent(state.activeSubject);
    if (!canvas || !page) return;
    noteResizeCanvas(canvas, page);
    noteDrawAll();
    noteUpdateScale(page);
  }, 180);
});
