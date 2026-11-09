/* =========================================================
   50-entry-notes — 错题下方的手写 / 文字注记，并可同步到笔记模块
   ========================================================= */
var entryNoteDraft = null;
var pendingEntryNoteSync = null;
var entryNoteTextTimer = null;

function ensureEntryNote(e) {
  if (!e) return null;
  if (!e.note || typeof e.note !== 'object') e.note = { text: '', strokes: [], paper: 'ruled', updatedAt: '', syncedPageId: '', syncedAt: '' };
  if (!e.note.paper) e.note.paper = 'ruled';
  if (!Array.isArray(e.note.strokes)) e.note.strokes = [];
  if (typeof e.note.text !== 'string') e.note.text = '';
  return e.note;
}

function entryNoteHtml(e) {
  var note = ensureEntryNote(e);
  var paper = note.paper || 'ruled';
  var activeColor = ui.entryNoteColor || NOTE_COLORS[0].color;
  var penSize = Number(ui.entryNotePenCss || 6);
  var synced = '';
  if (note.syncedPageId) {
    var found = noteFindPageById(e.subject, note.syncedPageId);
    if (found) {
      synced = '<button class="entry-note-synced" data-act="note-open-synced" data-id="' + attr(e.id) + '" type="button">已同步到笔记 · ' + esc(found.book.title || '笔记') + ' · 第 ' + (found.pageIndex + 1) + ' 页</button>';
    }
  }
  return '<section class="entry-note" data-entry-note="' + attr(e.id) + '">' +
    '<div class="entry-note-head">' +
      '<div><span class="entry-note-kicker">NOTE / 笔记注记</span><h4>这道题的笔记</h4>' +
        '<p>可以输入文字，也可以直接手写；保存后会询问是否同步到笔记模块。</p></div>' +
      '<div class="entry-note-stamp">' + (note.updatedAt ? '笔记于 ' + esc(formatDate(note.updatedAt)) : '还没有保存的注记') + '</div>' +
    '</div>' +
    '<label class="entry-note-field"><span>文字注记</span>' +
      '<textarea id="entryNoteText-' + attr(e.id) + '" placeholder="写思路、易错点、复习提醒；支持 Markdown 和 $...$ 公式">' + esc(note.text) + '</textarea>' +
    '</label>' +
    '<div class="entry-note-hand">' +
      '<div class="entry-note-hand-head"><span>手写注记<small class="entry-note-grow-hint">写到底部自动加高</small></span>' +
        '<div class="entry-note-tools">' +
          '<button class="entry-note-tool' + ((ui.entryNoteTool || 'pen') === 'pen' ? ' is-on' : '') + '" data-act="entry-note-tool" data-tool="pen" type="button">笔</button>' +
          '<button class="entry-note-tool' + (ui.entryNoteTool === 'eraser' ? ' is-on' : '') + '" data-act="entry-note-tool" data-tool="eraser" type="button" title="像素橡皮，按住拖动擦除">橡皮</button>' +
          '<button class="entry-note-tool" data-act="entry-note-resize" data-id="' + attr(e.id) + '" data-delta="180" type="button" title="纸面加高 180px">加高</button>' +
          '<button class="entry-note-tool" data-act="entry-note-resize" data-id="' + attr(e.id) + '" data-delta="-180" type="button" title="纸面降低 180px">降低</button>' +
          '<button class="entry-note-tool entry-note-tool-icon" data-act="entry-note-undo" data-id="' + attr(e.id) + '" type="button" title="撤销" aria-label="撤销">' + noteIcon('undo') + '</button>' +
          '<button class="entry-note-tool entry-note-tool-icon" data-act="entry-note-clear" data-id="' + attr(e.id) + '" type="button" title="清空手写" aria-label="清空手写">' + noteIcon('trash') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="entry-note-stylebar">' +
        '<div class="entry-note-style-row"><span class="entry-note-style-label">纸张</span>' +
          NOTE_PAPERS.map(function (p) { return '<button class="entry-note-paper paper-' + p.id + (paper === p.id ? ' is-on' : '') + '" data-act="entry-note-paper" data-paper="' + p.id + '" data-id="' + attr(e.id) + '" type="button" title="' + p.label + '" aria-label="' + p.label + '"></button>'; }).join('') +
        '</div>' +
        '<div class="entry-note-style-row"><span class="entry-note-style-label">笔锋</span>' +
          [[3, '细'], [6, '中'], [10, '粗'], [14, '特粗']].map(function (it) { return '<button class="entry-note-pen-size' + (penSize === it[0] ? ' is-on' : '') + '" data-act="entry-note-pen-size" data-size="' + it[0] + '" type="button">' + it[1] + '</button>'; }).join('') +
        '</div>' +
        '<div class="entry-note-style-row"><span class="entry-note-style-label">颜色</span>' +
          NOTE_COLORS.map(function (c) { return '<button class="entry-note-color' + (activeColor === c.color ? ' is-on' : '') + '" data-act="entry-note-color" data-color="' + attr(c.color) + '" type="button" title="' + attr(c.label) + '" aria-label="' + attr(c.label) + '" style="--swatch:' + attr(c.color) + '"></button>'; }).join('') +
        '</div>' +
      '</div>' +
      '<canvas class="entry-note-canvas paper-' + paper + '" data-entry="' + attr(e.id) + '" aria-label="错题手写注记"></canvas>' +
    '</div>' +
    '<div class="entry-note-actions">' +
      '<button class="btn btn-primary" data-act="save-entry-note" data-id="' + attr(e.id) + '" type="button">保存笔记</button>' +
      synced +
      '<span>保存后可以选择是否同步到笔记模块</span>' +
    '</div>' +
  '</section>';
}

var ENTRY_NOTE_PAGE_H = 300;
var ENTRY_NOTE_GROW_CSS = 180;
var ENTRY_NOTE_PAGE_MAX = 2000;

function entryNotePageHeight(note) {
  var h = Number(note && note.height);
  if (!h || h < ENTRY_NOTE_PAGE_H) h = ENTRY_NOTE_PAGE_H;
  return Math.min(ENTRY_NOTE_PAGE_MAX, Math.round(h));
}

function entryNoteApplySize(canvas, note) {
  var h = entryNotePageHeight(note);
  if (!canvas) return h;
  canvas.width = 2000;
  canvas.height = h * 2;
  canvas.setAttribute('data-page-h', String(h));
  canvas.style.aspectRatio = '2000 / ' + (h * 2);
  return h;
}

function entryNoteScrollCanvas(canvas) {
  if (!canvas) return;
  var rect = canvas.getBoundingClientRect();
  var overflow = rect.bottom - window.innerHeight + 22;
  if (overflow > 0) window.scrollBy({ top: Math.min(overflow, 220), behavior: 'smooth' });
}

function entryNoteGrow(canvas, entry, note, deltaPage) {
  if (!canvas || !entry || !note) return false;
  var oldH = entryNotePageHeight(note);
  if (oldH >= ENTRY_NOTE_PAGE_MAX) return false;
  var step = Number(deltaPage) || Math.round(ENTRY_NOTE_GROW_CSS * 1000 / Math.max(1, canvas.clientWidth));
  var nextH = Math.min(ENTRY_NOTE_PAGE_MAX, oldH + step);
  note.height = nextH;
  note.updatedAt = nowIso();
  markDirty();
  entryNoteApplySize(canvas, note);
  entryNoteDraw(canvas, entry);
  return true;
}

function entryNoteResize(id, deltaCss) {
  var e = findEntry(state.activeSubject, id);
  if (!e) return;
  var note = ensureEntryNote(e);
  var canvas = entryNoteCanvas(e);
  if (!canvas) return;
  var oldH = entryNotePageHeight(note);
  var delta = Math.round(Number(deltaCss || 0) * 1000 / Math.max(1, canvas.clientWidth));
  var nextH = Math.max(ENTRY_NOTE_PAGE_H, Math.min(ENTRY_NOTE_PAGE_MAX, oldH + delta));
  if (nextH === oldH) return;
  note.height = nextH;
  note.updatedAt = nowIso();
  e.updatedAt = nowIso();
  markDirty();
  entryNoteApplySize(canvas, note);
  entryNoteDraw(canvas, e);
  if (nextH > oldH) entryNoteScrollCanvas(canvas);
}

function entryNoteCanvas(e) {
  return document.querySelector('.entry-note-canvas[data-entry="' + e.id + '"]');
}

function entryNotePenCss() { return Number(ui.entryNotePenCss || 6); }
function entryNotePenPageWidth(canvas) { return entryNotePenCss() * canvas.width / 2 / Math.max(1, canvas.clientWidth); }

function entryEraserPageWidth(canvas) {
  return 9 * canvas.width / Math.max(1, canvas.clientWidth);
}

function entryNoteDraw(canvas, e) {
  if (!canvas || !e) return;
  var note = ensureEntryNote(e);
  var ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  note.strokes.forEach(function (s) {
    var pts = s.points || [];
    if (!pts.length) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (s.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = s.tool === 'eraser' ? '#000' : (s.color || '#29241d');
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      var pr = b[2] == null ? 0.5 : b[2];
      ctx.lineWidth = s.tool === 'eraser' ? (s.width || 12) : (s.width || 2.6 * (0.6 + pr * 0.8));
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    if (pts.length === 1) {
      var dotR = s.tool === 'eraser' ? (s.width || 12) / 2 : Math.max(1.8, (s.width || 3.6) / 2);
      ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], dotR, 0, Math.PI * 2); ctx.fillStyle = s.tool === 'eraser' ? '#000' : '#29241d'; ctx.fill();
    }
    ctx.restore();
  });
}

function entryNotePos(e, canvas) {
  var r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * 1000 / r.width, y: (e.clientY - r.top) * 300 / r.height };
}

function initEntryNoteCanvases() {
  Array.prototype.forEach.call(document.querySelectorAll('.entry-note-canvas'), function (canvas) {
    if (canvas.getAttribute('data-bound')) return;
    canvas.setAttribute('data-bound', '1');
    var id = canvas.getAttribute('data-entry');
    var entry = findEntry(state.activeSubject, id);
    if (!entry) return;
    var note = ensureEntryNote(entry);
    entryNoteApplySize(canvas, note);
    entryNoteDraw(canvas, entry);
    var ta = entryNoteSection(entry, id) && entryNoteSection(entry, id).querySelector('textarea');
    if (ta && !ta.getAttribute('data-bound')) {
      ta.setAttribute('data-bound', '1');
      ta.addEventListener('input', function () {
        note.text = ta.value;
        note.updatedAt = nowIso();
        if (entryNoteTextTimer) clearTimeout(entryNoteTextTimer);
        entryNoteTextTimer = setTimeout(function () { markDirty(); }, 550);
      });
    }
    canvas.style.touchAction = 'none';
    var hand = canvas.closest('.entry-note-hand');
    var eraserHalo = hand ? hand.querySelector('.entry-note-eraser-halo') : null;
    if (hand && !eraserHalo) {
      eraserHalo = document.createElement('div');
      eraserHalo.className = 'entry-note-eraser-halo';
      hand.appendChild(eraserHalo);
    }
    function updateEraserHalo(ev) {
      if (!eraserHalo) return;
      if (ui.entryNoteTool !== 'eraser') { eraserHalo.hidden = true; return; }
      var hr = hand.getBoundingClientRect();
      var radius = 9;
      eraserHalo.hidden = false;
      eraserHalo.style.width = (radius * 2) + 'px';
      eraserHalo.style.height = (radius * 2) + 'px';
      eraserHalo.style.left = (ev.clientX - hr.left) + 'px';
      eraserHalo.style.top = (ev.clientY - hr.top) + 'px';
    }
    canvas.addEventListener('pointerenter', updateEraserHalo);
    canvas.addEventListener('pointerleave', function () { if (eraserHalo) eraserHalo.hidden = true; });
    ['selectstart', 'contextmenu', 'dragstart'].forEach(function (type) {
      canvas.addEventListener(type, function (ev) { ev.preventDefault(); });
    });
    canvas.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      ev.preventDefault();
      canvas.setPointerCapture(ev.pointerId);
      var p = entryNotePos(ev, canvas);
      var stroke = { tool: ui.entryNoteTool === 'eraser' ? 'eraser' : 'pen', color: ui.entryNoteColor || '#211d18', width: ui.entryNoteTool === 'eraser' ? entryEraserPageWidth(canvas) : entryNotePenPageWidth(canvas), points: [[p.x, p.y, ev.pointerType === 'pen' && ev.pressure ? ev.pressure : 0.5]] };
      note.strokes.push(stroke);
      entryNoteDraft = { entryId: id, canvas: canvas, stroke: stroke };
      entryNoteDraw(canvas, entry);
    });
    canvas.addEventListener('pointermove', function (ev) {
      updateEraserHalo(ev);
      if (!entryNoteDraft || entryNoteDraft.entryId !== id) return;
      ev.preventDefault();
      var p = entryNotePos(ev, canvas);
      var pts = entryNoteDraft.stroke.points;
      var last = pts[pts.length - 1];
      if (last) {
        var dx = p.x - last[0], dy = p.y - last[1];
        if (dx * dx + dy * dy < 0.8) return;
      }
      pts.push([p.x, p.y, ev.pointerType === 'pen' && ev.pressure ? ev.pressure : 0.5]);
      entryNoteDraw(canvas, entry);
    });
    function finish(ev) {
      if (!entryNoteDraft || entryNoteDraft.entryId !== id) return;
      var finishedStroke = entryNoteDraft.stroke;
      entryNoteDraft = null;
      note.updatedAt = nowIso();
      entry.updatedAt = nowIso();
      markDirty();
      // 与模拟考手写一致：落笔接近纸面底部时，收笔后自动加高并跟随滚动。
      var pts = finishedStroke && finishedStroke.points ? finishedStroke.points : [];
      var lastPoint = pts[pts.length - 1];
      var pageH = Number(canvas.getAttribute('data-page-h') || ENTRY_NOTE_PAGE_H);
      if (lastPoint && pageH < ENTRY_NOTE_PAGE_MAX && lastPoint[1] > pageH * 0.82) {
        if (entryNoteGrow(canvas, entry, note)) entryNoteScrollCanvas(canvas);
      }
      if (canvas.hasPointerCapture && ev && canvas.hasPointerCapture(ev.pointerId)) canvas.releasePointerCapture(ev.pointerId);
    }
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', finish);
    canvas.addEventListener('pointerleave', function (ev) { if (ev.buttons === 0) finish(ev); });
  });
}

function entryNoteSection(e, id) {
  return document.querySelector('.entry-note[data-entry-note="' + id + '"]');
}

function entryNoteToolChange(tool) {
  ui.entryNoteTool = tool === 'eraser' ? 'eraser' : 'pen';
  Array.prototype.forEach.call(document.querySelectorAll('.entry-note-tool[data-tool]'), function (b) {
    b.classList.toggle('is-on', b.getAttribute('data-tool') === ui.entryNoteTool);
  });
}

function entryNotePaperChange(id, paper) {
  var e = findEntry(state.activeSubject, id);
  if (!e) return;
  var note = ensureEntryNote(e);
  note.paper = paper || 'ruled';
  note.updatedAt = nowIso();
  e.updatedAt = nowIso();
  markDirty();
  var canvas = entryNoteCanvas(e);
  if (canvas) canvas.className = 'entry-note-canvas paper-' + note.paper;
  var section = entryNoteSection(e, id);
  if (section) Array.prototype.forEach.call(section.querySelectorAll('[data-act="entry-note-paper"]'), function (b) {
    b.classList.toggle('is-on', b.getAttribute('data-paper') === note.paper);
  });
}

function entryNoteColorChange(color) {
  ui.entryNoteColor = color || NOTE_COLORS[0].color;
  Array.prototype.forEach.call(document.querySelectorAll('.entry-note-color'), function (b) {
    b.classList.toggle('is-on', b.getAttribute('data-color') === ui.entryNoteColor);
  });
}

function entryNotePenSize(size) {
  ui.entryNotePenCss = Number(size) || 6;
  Array.prototype.forEach.call(document.querySelectorAll('[data-act="entry-note-pen-size"]'), function (b) {
    b.classList.toggle('is-on', Number(b.getAttribute('data-size')) === ui.entryNotePenCss);
  });
}

function entryNoteUndo(id) {
  var e = findEntry(state.activeSubject, id);
  if (!e) return;
  var note = ensureEntryNote(e);
  if (!note.strokes.length) { toast('没有可撤销的手写'); return; }
  note.strokes.pop();
  note.updatedAt = nowIso();
  e.updatedAt = nowIso();
  markDirty();
  entryNoteDraw(entryNoteCanvas(e), e);
}

function entryNoteClear(id) {
  var e = findEntry(state.activeSubject, id);
  if (!e) return;
  var note = ensureEntryNote(e);
  if (!note.strokes.length) { toast('还没有手写内容'); return; }
  note.strokes = [];
  note.updatedAt = nowIso();
  e.updatedAt = nowIso();
  markDirty();
  entryNoteDraw(entryNoteCanvas(e), e);
}

function entryNoteImage(e) {
  var note = ensureEntryNote(e);
  if (!note.strokes.length) return '';
  var c = document.createElement('canvas');
  c.width = 2000; c.height = 600;
  var ctx = c.getContext('2d');
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  note.strokes.forEach(function (s) {
    var pts = s.points || [];
    if (!pts.length) return;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (s.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = s.color || '#29241d';
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      var pr = b[2] == null ? 0.5 : b[2];
      ctx.lineWidth = s.tool === 'eraser' ? (s.width || 12) : (s.width || 2.6 * (0.6 + pr * 0.8));
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    if (pts.length === 1) {
      var rr = s.tool === 'eraser' ? (s.width || 12) / 2 : Math.max(1.8, (s.width || 3.6) / 2);
      ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], rr, 0, Math.PI * 2);
      ctx.fillStyle = s.tool === 'eraser' ? '#000' : (s.color || '#29241d'); ctx.fill();
    }
    ctx.restore();
  });
  return c.toDataURL('image/png');
}

function entryNoteSections(e) {
  var order = ['original', 'standard', 'analysis', 'answer', 'verification', 'pitfalls'];
  var labels = { original: '原题', standard: '考试标准解答过程', analysis: '详细解析', answer: '标准答案', verification: '验证', pitfalls: '易错点' };
  var out = [];
  order.forEach(function (key) {
    var b = (e.blocks || []).filter(function (x) { return x && x.key === key && String(x.md || '').trim(); })[0];
    if (b) out.push({ label: labels[key] || b.title || key, md: b.md });
  });
  if (!out.length) (e.blocks || []).forEach(function (b) { if (b && String(b.md || '').trim()) out.push({ label: b.title || '内容', md: b.md }); });
  return out;
}

function entryNoteThumb(e, code) {
  var c = document.createElement('canvas');
  c.width = 124; c.height = 168;
  var ctx = c.getContext('2d');
  ctx.fillStyle = '#fffefb'; ctx.fillRect(0, 0, 124, 168);
  ctx.strokeStyle = '#e3ddcf'; ctx.lineWidth = 1;
  for (var y = 28; y < 160; y += 16) { ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(114, y); ctx.stroke(); }
  ctx.fillStyle = '#b23a26'; ctx.fillRect(0, 0, 3, 168);
  ctx.fillStyle = '#6b7167'; ctx.font = '10px sans-serif'; ctx.fillText('错题笔记', 13, 20);
  ctx.fillStyle = '#1d211c'; ctx.font = 'bold 13px serif'; ctx.fillText(String(code || '').slice(0, 12), 13, 54);
  return c.toDataURL('image/png');
}

function buildEntryNotePage(e) {
  var note = ensureEntryNote(e);
  var noteAt = note.updatedAt || nowIso();
  return {
    id: (note.syncedPageId || noteId()),
    kind: 'entry',
    title: (e.code ? e.code + ' · ' : '') + entryTitle(e),
    entryId: e.id,
    entryCode: e.code || '',
    entryDate: e.date || (e.createdAt ? formatDate(e.createdAt) : '—'),
    noteAt: noteAt,
    sections: entryNoteSections(e),
    noteText: note.text || '',
    annotationImage: entryNoteImage(e),
    thumb: entryNoteThumb(e, e.code),
    createdAt: note.syncedAt || noteAt,
    updatedAt: noteAt
  };
}

function entryNotePageHtml(subjectId, page) {
  var pages = notePages(subjectId);
  var idx = noteIndex(subjectId);
  var sections = (page.sections || []).map(function (s) {
    return '<section class="note-sheet-section"><h3>' + esc(s.label) + '</h3><div class="md">' + renderMarkdown(s.md) + '</div></section>';
  }).join('');
  var noteText = String(page.noteText || '').trim();
  var annotation = page.annotationImage ? '<img class="note-sheet-annotation" src="' + attr(page.annotationImage) + '" alt="用户手写笔记">' : '';
  var entryLink = page.entryId ? '<button class="linkish" data-act="note-open-entry" data-id="' + attr(page.entryId) + '" type="button">回到错题</button>' : '';
  return '<div class="note-pagebar">' +
      '<button class="note-nav" data-act="note-prev" type="button" aria-label="上一页">‹</button>' +
      '<span class="note-page-meta"><b>第 ' + (idx + 1) + ' / ' + pages.length + ' 页</b><span>' + esc(page.title || '') + '</span></span>' +
      '<button class="note-nav" data-act="note-next" type="button" aria-label="下一页">›</button>' +
    '</div>' +
    '<article class="note-entry-sheet">' +
      '<header class="note-sheet-head">' +
        '<div class="note-sheet-kicker">MISTAKE NOTE / 错题笔记</div>' +
        '<h2>' + esc(page.entryCode ? page.entryCode + ' · ' : '') + renderInline(entryTitleFromPage(page)) + '</h2>' +
        '<div class="note-sheet-meta">' +
          '<span><b>错题时间</b>' + esc(page.entryDate || '—') + '</span>' +
          '<span><b>笔记时间</b>' + esc(formatDate(page.noteAt || page.updatedAt)) + '</span>' +
        '</div>' +
      '</header>' +
      '<div class="note-sheet-sections">' + sections + '</div>' +
      '<section class="note-sheet-section note-sheet-user"><h3>用户笔记注记</h3>' +
        (noteText ? '<div class="md">' + renderMarkdown(noteText) + '</div>' : (annotation ? '<p class="empty-inline">没有文字注记，只有手写内容。</p>' : '<p class="empty-inline">没有文字或手写注记。</p>')) +
        annotation +
      '</section>' +
      '<footer class="note-sheet-foot">' + entryLink + '<span>同步于 ' + esc(formatDate(page.updatedAt)) + '</span></footer>' +
    '</article>' +
    '<div class="note-foot"><span>这页来自错题同步，只读；可以删除，但不会影响原错题。</span><button class="linkish" data-act="note-delete-page" type="button">删除本页</button></div>' +
    noteStripHtml(subjectId);
}

function entryTitleFromPage(page) {
  var t = String(page.title || '');
  var code = String(page.entryCode || '');
  if (code && t.indexOf(code + ' · ') === 0) return t.slice((code + ' · ').length);
  return t;
}

function openEntryNoteSyncDialog(entryId) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) return;
  var note = ensureEntryNote(e);
  var dlg = qs('#entryNoteSyncDialog');
  var body = qs('#entryNoteSyncBody');
  if (!dlg || !body) return;
  pendingEntryNoteSync = entryId;
  body.innerHTML = '<p class="form-note" style="margin-top:0">要不要把这道题同步成一页笔记？</p>' +
    '<div class="entry-note-sync-card"><b>' + esc(e.code ? e.code + ' · ' : '') + renderInline(entryTitle(e)) + '</b></div>' +
    '<ul class="entry-note-sync-list">' +
      '<li>原题</li><li>考试标准解答过程</li><li>详细解析</li><li>标准答案</li><li>用户笔记注记（文字 + 手写）</li>' +
    '</ul>' +
    '<p class="form-note">会标注 <b>错题时间</b> 与 <b>笔记时间</b>。' + (note.syncedPageId ? '再次同步会更新已有笔记页面。' : '') + '</p>';
  dlg.showModal();
}

function saveEntryNote(entryId) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) return;
  var note = ensureEntryNote(e);
  var section = entryNoteSection(e, entryId);
  var ta = section && section.querySelector('textarea');
  note.text = ta ? ta.value : (note.text || '');
  note.updatedAt = nowIso();
  e.updatedAt = nowIso();
  markDirty();
  toast('笔记已保存');
  openEntryNoteSyncDialog(entryId);
}

function syncEntryNote() {
  if (!pendingEntryNoteSync) return;
  var e = findEntry(state.activeSubject, pendingEntryNoteSync);
  if (!e) return;
  var note = ensureEntryNote(e);
  var page = buildEntryNotePage(e);
  var syncAt = nowIso();
  page.updatedAt = syncAt;
  var found = noteFindPageById(e.subject, note.syncedPageId);
  var book, idx;
  if (found) {
    page.id = found.page.id;
    page.createdAt = found.page.createdAt || page.createdAt;
    found.book.pages[found.pageIndex] = page;
    found.book.updatedAt = syncAt;
    book = found.book; idx = found.pageIndex;
  } else {
    page.title = '同步页';
    book = noteCreateNotebook(e.subject, (e.code || '错题') + ' 笔记', [page]);
    idx = 0;
  }
  note.syncedPageId = page.id;
  note.syncedBookId = book.id;
  note.syncedAt = syncAt;
  e.updatedAt = nowIso();
  pendingEntryNoteSync = null;
  ui.noteLibrary = false;
  ui.noteBookIndex = found ? found.bookIndex : (noteNotebooks(e.subject).length - 1);
  noteSetPage(idx);
  var dlg = qs('#entryNoteSyncDialog');
  if (dlg && dlg.open) dlg.close();
  markDirty();
  render();
  toast('已同步到笔记模块 · ' + (book.title || '笔记') + ' · 第 ' + (idx + 1) + ' 页');
}

function openEntrySyncedPage(entryId) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) { toast('原错题不在了'); return; }
  var note = ensureEntryNote(e);
  var found = noteFindPageById(e.subject, note.syncedPageId);
  if (!found) { toast('还没有同步的笔记页面'); return; }
  ui.noteBookIndex = found.bookIndex;
  noteSetPage(found.pageIndex);
  ui.noteLibrary = false;
  state.activeView = 'notes';
  updateHash();
  render();
}

function entryNoteNoSync() {
  pendingEntryNoteSync = null;
  var dlg = qs('#entryNoteSyncDialog');
  if (dlg && dlg.open) dlg.close();
  render();
}

function openSyncedEntry(entryId) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) { toast('原错题不在了'); return; }
  state.activeView = 'entries';
  ui.open[e.id] = true;
  updateHash();
  render();
  setTimeout(function () {
    var el = qs('#entry-' + e.id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}
