/* =========================================================
   20-entries — 错题列表与单条渲染
   ========================================================= */
function entryCreateButtons(subjectId) {
  return '<button class="btn" data-act="add-entry" type="button">手动新增</button>' +
    '<button class="btn btn-primary" data-act="ai-open" data-subject="' + attr(subjectId) + '" type="button">智能录入</button>';
}

function viewEntries(subjectId) {
  var f = filterFor(subjectId);
  var list = filteredEntries(subjectId);
  var all = entriesOf(subjectId);
  var counts = {
    all: all.length,
    unmastered: all.filter(function (e) { return e.status === 'unmastered'; }).length,
    mastered: all.filter(function (e) { return e.status === 'mastered'; }).length
  };
  var chapters = sortChapters(subjectId, uniq(all.map(function (e) { return e.chapter || '未分章'; }).concat(templatesOf(subjectId).map(function (t) { return t.chapter || '未分章'; }))));
  var tpls = templatesOf(subjectId);

  var indexBase = baseFilteredEntries(subjectId);
  var datePool = indexBase.filter(function (e) { return entryMatchesStarIndex(e, f); });
  var starPool = indexBase.filter(function (e) { return entryMatchesDateIndex(e, f); });
  var dates = uniq(all.map(entryDateKey).filter(Boolean)).sort().reverse();
  var dateOptions = '<option value="all">全部日期</option>' + dates.map(function (d) {
    var n = datePool.filter(function (e) { return entryDateKey(e) === d; }).length;
    return '<option value="' + attr(d) + '"' + (f.date === d ? ' selected' : '') + '>' + esc(d) + ' · ' + n + ' 题</option>';
  }).join('');
  var starOptions = '<option value="all">全部星级</option>' + [5, 4, 3, 2, 1].map(function (n) {
    var count = starPool.filter(function (e) { return normalizeStars(e.stars) === n; }).length;
    return '<option value="' + n + '"' + (String(f.stars) === String(n) ? ' selected' : '') + '>' + stars(n) + ' · ' + count + ' 题</option>';
  }).join('');
  var filtersActive = f.status !== 'all' || f.chapter !== 'all' || f.template !== 'all' || f.date !== 'all' || f.stars !== 'all' || f.sort !== 'date-desc';

  var toolbar = '<div class="toolbar entry-filters">' +
    '<div class="seg" role="group" aria-label="按掌握状态筛选">' +
      segButton('all', '全部', f.status === 'all') +
      segButton('unmastered', '未掌握', f.status === 'unmastered') +
      segButton('mastered', '已掌握', f.status === 'mastered') +
    '</div>' +
    '<select class="select" data-filter="chapter" aria-label="按章节筛选">' + optionList(['all'].concat(chapters), f.chapter, '全部章节') + '</select>' +
    '<select class="select" data-filter="template" aria-label="按模板筛选">' + optionList2(tpls, f.template) + '</select>' +
    '<select class="select" data-filter="date" aria-label="按日期索引题目">' + dateOptions + '</select>' +
    '<select class="select" data-filter="stars" aria-label="按星级索引题目">' + starOptions + '</select>' +
    '<select class="select" data-filter="sort" aria-label="排序">' +
      '<option value="date-desc"' + (f.sort === 'date-desc' ? ' selected' : '') + '>日期 · 新到旧</option>' +
      '<option value="date-asc"' + (f.sort === 'date-asc' ? ' selected' : '') + '>日期 · 旧到新</option>' +
      '<option value="code-asc"' + (f.sort === 'code-asc' ? ' selected' : '') + '>编号升序</option>' +
      '<option value="code-desc"' + (f.sort === 'code-desc' ? ' selected' : '') + '>编号降序</option>' +
      '<option value="stars-desc"' + (f.sort === 'stars-desc' ? ' selected' : '') + '>难度 · 高到低</option>' +
      '<option value="stars-asc"' + (f.sort === 'stars-asc' ? ' selected' : '') + '>难度 · 低到高</option>' +
      '<option value="chapter-asc"' + (f.sort === 'chapter-asc' ? ' selected' : '') + '>章节 · 正序</option>' +
      '<option value="chapter-desc"' + (f.sort === 'chapter-desc' ? ' selected' : '') + '>章节 · 倒序</option>' +
    '</select>' +
  '</div>';
  var filterMeta = '<div class="filter-meta">' +
    '<button class="linkish index-clear" data-act="clear-entry-filters" type="button" title="清空主筛选栏全部选择"' + (filtersActive ? '' : ' disabled') + '>清空</button>' +
    '<span class="filter-count">显示 ' + list.length + ' / ' + all.length + ' 条</span>' +
  '</div>';

  var entryBook = bookLabelFor(subjectId);
  var head = '<div class="page-head"><div><p class="eyebrow">' + esc(currentSubject().name) + (entryBook ? ' · ' + esc(entryBook) : '') + ' / ENTRIES</p>' +
    '<h1 class="page-title">错题</h1>' +
    '<p class="page-sub">每道题上方都能直接标「已掌握 / 未掌握」；展开后可看标准解答、详细解析、模板和同类题，正文与公式按 Markdown 渲染，可复制 Markdown 文本。' + (entryBook ? '章节顺序以' + esc(entryBook) + '为准。' : '') + '</p></div>' +
    (all.length ? '<div class="page-actions">' + entryCreateButtons(subjectId) + '</div>' : '') +
  '</div>';

  var listHtml;
  if (!list.length) {
    listHtml = emptyState(
      all.length ? '没有符合筛选的题' : '还没有错题',
      all.length ? '换个章节或状态看看，或清空搜索词。' : '点「手动新增」记录，或点「智能录入」整理。',
      '<div class="multi-actions">' + entryCreateButtons(subjectId) + '</div>'
    );
  } else {
    listHtml = '<div class="entry-list">' + list.map(renderEntryCard).join('') + '</div>';
  }
  return head + (all.length ? toolbar + filterMeta : '') + '<h2 class="sr-only">错题列表</h2>' + listHtml;
}

function segButton(value, label, active) {
  return '<button data-act="filter-status" data-value="' + value + '" aria-pressed="' + active + '" type="button">' + esc(label) + '</button>';
}
function optionList(values, current, allLabel) {
  return values.map(function (v) {
    var label = v === 'all' ? allLabel : v;
    return '<option value="' + attr(v) + '"' + (v === current ? ' selected' : '') + '>' + esc(label) + '</option>';
  }).join('');
}
function optionList2(tpls, current) {
  return '<option value="all"' + (current === 'all' ? ' selected' : '') + '>全部模板</option>' +
    tpls.map(function (t) {
      return '<option value="' + attr(t.id) + '"' + (t.id === current ? ' selected' : '') + '>' + esc(t.id + ' · ' + t.title) + '</option>';
    }).join('');
}

function entrySourceText(e) {
  return String((e && e.source) || '').replace(/\s*·\s*\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?\s*$/, '').trim();
}

function renderEntryCard(e) {
  var open = !!ui.open[e.id];
  var pts = (e.points || []);
  var tagHtml = pts.slice(0, 2).map(function (p) { return '<span class="chip">' + renderInline(p) + '</span>'; }).join('') +
    (e.errorTypes || []).slice(0, 2).map(function (t) { return '<span class="chip chip-warn">' + esc(t) + '</span>'; }).join('') +
    (typeof autoAiBadge === 'function' ? autoAiBadge(e) : '');
  var tpl = e.templateId ? ('<button class="chip" data-act="goto-template" data-template="' + attr(e.templateId) + '" type="button">' + esc(e.templateId) + ' ' + renderInline(e.templateTitle || '') + '</button>') : '';

  var card =
    '<article class="entry' + (open ? ' is-open' : '') + '" id="entry-' + attr(e.id) + '">' +
      '<button class="entry-head" data-act="toggle-entry" data-id="' + attr(e.id) + '" aria-expanded="' + open + '" type="button">' +
        '<span class="entry-code">' + esc(e.code) + '<small>' + esc(currentSubject().short) + '</small></span>' +
        '<span class="entry-titlewrap">' +
          '<span class="entry-title">' + renderInline(entryTitle(e)) + '</span>' +
          '<span class="entry-meta">' +
            '<span>' + esc(entryDateText(e)) + '</span>' +
            (e.chapter ? '<span class="sep">·</span><span>' + esc(e.chapter) + (e.section ? ' · ' + esc(e.section) : '') + '</span>' : '') +
            (e.stars ? '<span class="sep">·</span><span class="stars">' + stars(e.stars) + '</span>' : '') +
            ((function (src) { return src ? '<span class="entry-source">' + esc(src) + '</span>' : ''; })(entrySourceText(e))) +
          '</span>' +
          '<span class="entry-tags">' + tagHtml + '</span>' +
        '</span>' +
        '<span class="entry-side">' + statusPill(e) + '</span>' +
        '<span class="caret" aria-hidden="true"></span>' +
      '</button>' +
      (open ? '<div class="entry-body">' + renderEntryBody(e) + '</div>' : '') +
    '</article>';
  return card;
}

function entryMarkdown(e) {
  var out = ['# ' + (e.code ? e.code + ' · ' : '') + entryTitle(e), ''];
  var meta = [];
  if (e.date) meta.push(e.date);
  if (e.chapter) meta.push(e.chapter);
  if (e.templateId) meta.push('模板 ' + e.templateId + (e.templateTitle ? ' · ' + e.templateTitle : ''));
  if (meta.length) out.push('> ' + meta.join(' · '), '');
  (e.blocks || []).forEach(function (b) {
    if (!b || !String(b.md || '').trim()) return;
    out.push('## ' + (b.title || '内容'), '', stripTypePrefix(String(b.md).trim()), '');
  });
  if (e.templateNotes) {
    var n = e.templateNotes;
    if (n.features || n.method || n.skeleton || n.pitfalls) {
      out.push('## 同类型题模板', '');
      if (n.features) out.push('### 识别特征', '', String(n.features).trim(), '');
      if (n.method) out.push('### 首选方法', '', String(n.method).trim(), '');
      if (n.skeleton) out.push('### 步骤骨架', '', String(n.skeleton).trim(), '');
      if (n.pitfalls) out.push('### 易错点', '', String(n.pitfalls).trim(), '');
    }
  }
  (e.variants || []).forEach(function (v, i) {
    if (!v || !String(v.q || '').trim()) return;
    out.push('## 变式 ' + (i + 1), '', String(v.q).trim(), '');
    if (v.a) out.push('### 答案', '', String(v.a).trim(), '');
  });
  (e.attachments || []).forEach(function (a, i) {
    if (!a || !a.data) return;
    out.push('## ' + (a.label || ('附件 ' + (i + 1))), '', '![' + (a.label || '附件') + '](' + a.data + ')', '');
  });
  return out.join('\n').trim() + '\n';
}

function openAttachmentLightbox(src, label) {
  if (!src) return;
  var dlg = qs('#entryImageLightbox');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'entryImageLightbox';
    dlg.className = 'image-lightbox';
    dlg.setAttribute('aria-label', '查看手写作答大图');
    dlg.innerHTML = '<div class="image-lightbox-frame">' +
      '<div class="image-lightbox-head"><span class="image-lightbox-title" id="entryImageLightboxTitle">手写作答</span>' +
      '<button class="image-lightbox-close" data-act="close-attachment" type="button" aria-label="关闭大图">×</button></div>' +
      '<div class="image-lightbox-stage"><img id="entryImageLightboxImg" alt="手写作答"></div></div>';
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || (e.target.closest && e.target.closest('[data-act="close-attachment"]'))) dlg.close();
    });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') dlg.close(); });
    document.body.appendChild(dlg);
  }
  var image = qs('#entryImageLightboxImg');
  if (image) image.src = src;
  var title = qs('#entryImageLightboxTitle');
  if (title) title.textContent = label || '手写作答';
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}

function entryAttachmentBlock(e, a) {
  if (a && a.block) return a.block;
  var key = 'user';
  (e.blocks || []).forEach(function (b) {
    if (!b) return;
    if (b.key === 'user' || b.key === 'attempt') key = b.key;
    else if (/我的.*(错解|作答|卡点)/.test(String(b.title || ''))) key = b.key;
  });
  return key;
}

function entryAttachmentsHtml(e, blockKey) {
  var list = e && Array.isArray(e.attachments) ? e.attachments : [];
  list = list.filter(function (a) { return entryAttachmentBlock(e, a) === blockKey; });
  if (!list.length) return '';
  return '<div class="entry-attachments">' + list.map(function (a, i) {
    var label = a && (a.label || ('附件 ' + (i + 1))) || ('附件 ' + (i + 1));
    return '<figure class="entry-attachment">' +
      '<button class="entry-attachment-thumb" data-act="open-attachment" type="button" aria-label="放大查看' + attr(label) + '">' +
      '<img src="' + attr(a && a.data) + '" alt="' + attr(label) + '" loading="lazy">' +
      '</button><figcaption>' + esc(label) + '</figcaption></figure>';
  }).join('') + '</div>';
}

function renderEntryBody(e) {
  var tpl = e.templateId ? ('<button class="chip" data-act="goto-template" data-template="' + attr(e.templateId) + '" type="button">' + esc(e.templateId) + ' ' + renderInline(e.templateTitle || '') + '</button>') : '';
  var blocks = (e.blocks || []).filter(function (b) {
    return b && b.md && String(b.md).trim();
  }).map(function (b, i) {
    return renderBlock(b, i, e);
  }).join('');

  var tplNotes = '';
  if (e.templateNotes && (e.templateNotes.features || e.templateNotes.method || e.templateNotes.skeleton || e.templateNotes.pitfalls)) {
    tplNotes = '<div class="tpl-notes"><h4>同类型题模板' + (e.templateTitle ? ' <span class="tpl-title">' + renderInline(e.templateTitle) + '</span>' : '') + '</h4><dl class="tpl-grid">' +
      (e.templateNotes.features ? '<div><dt>识别特征</dt><dd>' + renderMarkdown(e.templateNotes.features) + '</dd></div>' : '') +
      (e.templateNotes.method ? '<div><dt>首选方法</dt><dd>' + renderMarkdown(e.templateNotes.method) + '</dd></div>' : '') +
      (e.templateNotes.skeleton ? '<div><dt>步骤骨架</dt><dd>' + renderMarkdown(e.templateNotes.skeleton) + '</dd></div>' : '') +
      (e.templateNotes.pitfalls ? '<div><dt>易错点</dt><dd>' + renderMarkdown(e.templateNotes.pitfalls) + '</dd></div>' : '') +
      '</dl></div>';
  }

  var variants = (e.variants || []).map(function (v) {
    return '<div class="variant"><div class="variant-label">变式（自测）</div>' +
      '<div class="md">' + renderMarkdown(stripTypePrefix(v.q)) + '</div>' +
      (v.a ? '<details><summary>看答案</summary><div class="md" style="margin-top:8px">' + renderMarkdown(v.a) + '</div></details>' : '') +
      '</div>';
  }).join('');

  var related = relatedBank(e, 3);
  var relatedHtml = '';
  if (related.length) {
    relatedHtml = '<div class="related"><div class="related-head"><h4>考研同型 · 同类题</h4>' +
      '<button class="linkish" style="font-size:11px" data-act="goto-bank" data-template="' + attr(e.templateId || '') + '">到题库看全部</button></div>' +
      '<div class="related-list">' + related.map(function (it) {
        return '<div class="related-item"><span class="rid">' + esc(it.id) + '</span>' +
          '<span class="rtitle">' + renderInline(it.title) + '</span>' +
          '<button data-act="open-bank-item" data-bank-id="' + attr(it.id) + '" type="button">看题</button></div>';
      }).join('') + '</div></div>';
  }

  var planDays = reviewPlanKeys(e);
  var nextDay = planDays.filter(function (d) { return !e.review[d]; })[0] || null;
  var nextAt = nextDay ? reviewDayAvailableAt(e, nextDay) : null;
  var nextLocked = nextDay && nextAt != null && Date.now() < nextAt;
  var lockNote = nextLocked
    ? '<span class="review-lock-note">下次解锁 ' + reviewDayLabel(nextDay) + ' · ' + esc(formatDate(new Date(nextAt).toISOString()).slice(5, 16)) + '</span>'
    : nextDay
      ? '<span class="review-lock-note">下一步 ' + reviewDayLabel(nextDay) + '</span>'
      : '';
  var review = '<div class="review-row">' +
    '<span class="lbl">复习打卡</span>' +
    '<span class="review-plan-tag" title="按五级难度与艾宾浩斯遗忘曲线生成">' + stars(e.stars) + ' · ' + planDays.length + ' 次</span>' +
    planDays.map(function (d) {
      var absolute = reviewAbsoluteUnlocked(e, d);
      var isOn = !!e.review[d];
      var open = !isOn && reviewCanOpenDay(e, d);
      var title = isOn || open ? '' : (!absolute
        ? '将于 ' + formatDate(new Date(reviewUnlockTimestamp(e, d)).toISOString()).slice(0, 16) + ' 解锁'
        : d === nextDay && nextAt != null
          ? '下次解锁 ' + formatDate(new Date(nextAt).toISOString()).slice(0, 16)
          : '按顺序，先完成 ' + reviewDayLabel(nextDay));
      return '<button class="rev-chip' + (isOn ? ' is-on' : '') + (open || isOn ? '' : ' is-locked') + '" data-act="toggle-review" data-id="' + attr(e.id) + '" data-day="' + d + '" type="button" aria-pressed="' + isOn + '"' + (open || isOn ? '' : ' disabled') + (title ? ' title="' + attr(title) + '" aria-label="' + attr(reviewDayLabel(d) + '，' + title) + '"' : '') + '>' + reviewDayLabel(d) + ' ' + (isOn ? '✓' : '□') + '</button>';
    }).join('') +
    lockNote +
    '<span class="faint" style="font-size:10.5px;margin-left:auto">更新于 ' + esc(timeAgo(e.updatedAt || e.date)) + '</span>' +
  '</div>';

  var foot = '<div class="entry-foot">' +
    '<button class="btn btn-xs" data-act="edit-entry" data-id="' + attr(e.id) + '" type="button">编辑</button>' +
    '<button class="btn btn-xs" data-act="copy-link" data-id="' + attr(e.id) + '" type="button">复制链接</button>' +
    '<button class="btn btn-xs" data-act="copy-entry-md" data-id="' + attr(e.id) + '" type="button">复制 Markdown</button>' +
    '<button class="btn btn-xs" data-act="add-from-entry" data-id="' + attr(e.id) + '" type="button">记一条同类题</button>' +
    '<button class="btn btn-xs' + (typeof finalHasItem === 'function' && finalHasItem(state.activeSubject, 'entry', e.id) ? ' is-added' : '') + '" data-act="final-add-entry" data-id="' + attr(e.id) + '" type="button">' + (typeof finalHasItem === 'function' && finalHasItem(state.activeSubject, 'entry', e.id) ? '已在期末' : '加入期末') + '</button>' +
    (tpl ? '<span class="spacer"></span>' + tpl : '') +
    '<button class="btn btn-xs btn-danger" data-act="delete-entry" data-id="' + attr(e.id) + '" type="button">删除</button>' +
  '</div>';

  return '<div class="mastery-bar">' +
      '<span class="mastery-copy"><span class="mastery-q">这道题现在会了吗？</span> <span class="mastery-hint"><b>已掌握</b>：少复习一次；<b>未掌握</b>：继续排进复习。</span></span>' +
      '<span class="mastery-btns">' +
        '<button class="m-btn' + (e.status === 'mastered' ? ' is-on' : '') + '" data-act="set-mastery" data-id="' + attr(e.id) + '" data-value="mastered" data-mastery="mastered" aria-pressed="' + (e.status === 'mastered') + '" type="button"><span class="tick">✓</span>已掌握</button>' +
        '<button class="m-btn' + (e.status === 'unmastered' ? ' is-on' : '') + '" data-act="set-mastery" data-id="' + attr(e.id) + '" data-value="unmastered" data-mastery="unmastered" aria-pressed="' + (e.status === 'unmastered') + '" type="button"><span class="tick">✕</span>未掌握</button>' +
      '</span>' +
    '</div>' +
    (typeof autoAiPanel === 'function' ? autoAiPanel(e) : '') +
    '<div class="entry-blocks">' + blocks + '</div>' +
    tplNotes + variants + relatedHtml + review + (typeof entryNoteHtml === 'function' ? entryNoteHtml(e) : '') + foot;
}

function renderBlock(b, i, e) {
  var cls = 'block block-' + (b.key || 'extra');
  var num = pad(i + 1, 2);
  return '<section class="' + cls + '">' +
    '<div class="block-head"><span class="block-num">' + num + '</span><h3 class="block-title">' + renderInline(b.title || '内容') + '</h3></div>' +
    '<div class="md">' + renderMarkdown(stripTypePrefix(b.md)) + '</div>' + entryAttachmentsHtml(e, b.key) +
  '</section>';
}

/* ---------- mastery / review handlers ---------- */
function setMastery(entryId, value) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) return;
  e.status = value === 'mastered' ? 'mastered' : 'unmastered';
  e.review.mastered = e.status === 'mastered';
  var block = reviewLogBlockFor(e);
  block.md = removeMasteryLogLine(stripPendingReviewLabel(block.md));
  if (e.status === 'mastered') {
    var line = '- ' + formatDate(nowIso()) + ' · 已掌握';
    block.md = String(block.md || '').trim();
    block.md = block.md ? block.md + '\n' + line : line;
  }
  if (!String(block.md || '').trim()) {
    e.blocks = e.blocks.filter(function (b) { return b !== block; });
  }
  touchEntry(e);
  markDirty();
  if (state.activeView === 'entries') {
    var open = ui.open[e.id];
    ui.open[e.id] = open;
    render();
    var card = qs('#entry-' + e.id);
    if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } else {
    render();
  }
  toast(e.status === 'mastered' ? '已掌握，复习记录已更新' : '未掌握，复习记录已删除', { title: e.status === 'mastered' ? '已标记掌握' : '已取消掌握', detail: '题目：' + e.code + ' · ' + (e.summary || '') });
}

function reviewLogBlockFor(e) {
  e.blocks = e.blocks || [];
  var block = e.blocks.filter(function (b) {
    return b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || '')));
  })[0];
  if (!block) {
    block = { key: 'reviewlog', title: '复习记录', md: '' };
    e.blocks.push(block);
  }
  return block;
}

function removeReviewLogDay(block, day) {
  var label = reviewDayLabel(day);
  var re = new RegExp('(?:^|\\n)-[^\\n]*\\b' + label + '\\b[^\\n]*复习打卡[^\\n]*', 'g');
  block.md = String(block.md || '').replace(re, '').replace(/\n{3,}/g, '\n\n').trim();
}

function toggleReview(entryId, day) {
  var e = findEntry(state.activeSubject, entryId);
  if (!e) return;
  var wasOn = !!e.review[day];
  if (!wasOn && !reviewAbsoluteUnlocked(e, day)) {
    var at = reviewUnlockTimestamp(e, day);
    toast(reviewDayLabel(day) + ' 将在 ' + formatDate(new Date(at).toISOString()).slice(0, 16) + ' 解锁', { title: '复习未到时间', detail: '题目：' + e.code + ' · ' + (e.summary || ''), kind: 'review' });
    return;
  }
  if (!wasOn) {
    var nextDay = reviewPlanKeys(e).filter(function (d) { return !e.review[d]; })[0];
    if (nextDay && day !== nextDay) {
      toast('请先完成 ' + reviewDayLabel(nextDay), { title: '复习顺序提示', detail: '题目：' + e.code + ' · ' + (e.summary || ''), kind: 'review' });
      return;
    }
    if (!reviewDayUnlocked(e, day)) {
      var available = reviewDayAvailableAt(e, day);
      toast(reviewDayLabel(day) + ' 还需等到 ' + formatDate(new Date(available).toISOString()).slice(0, 16), { title: '复习未到时间', detail: '题目：' + e.code + ' · ' + (e.summary || ''), kind: 'review' });
      return;
    }
    if (!reviewCanOpenDay(e, day)) {
      toast('请按顺序完成前面的复习节点', { title: '复习顺序提示', detail: '题目：' + e.code + ' · ' + (e.summary || ''), kind: 'review' });
      return;
    }
  }
  e.review[day] = !wasOn;
  e.reviewAt = e.reviewAt || {};
  if (!wasOn) e.reviewAt[day] = nowIso();
  else delete e.reviewAt[day];
  var block = reviewLogBlockFor(e);
  var label = reviewDayLabel(day);
  removeReviewLogDay(block, day);
  if (wasOn) {
    var planKeys = reviewPlanKeys(e);
    var dayIndex = planKeys.indexOf(day);
    planKeys.slice(dayIndex + 1).forEach(function (later) {
      if (!e.review[later]) return;
      e.review[later] = false;
      if (e.reviewAt) delete e.reviewAt[later];
      removeReviewLogDay(block, later);
    });
  }
  if (!wasOn) {
    block.md = stripPendingReviewLabel(block.md);
    var line = '- ' + formatDate(nowIso()) + ' · ' + label + ' 复习打卡';
    block.md = String(block.md || '').trim();
    block.md = block.md ? block.md + '\n' + line : line;
    toast('已记录 ' + label + ' 复习', { title: '复习打卡 · ' + label, detail: '题目：' + e.code + ' · ' + (e.summary || ''), kind: 'review' });
  } else {
    toast('已取消 ' + label + ' 打卡，复习记录已同步删除', { title: '已取消复习 · ' + label, detail: '题目：' + e.code + ' · ' + (e.summary || ''), kind: 'review' });
  }
  if (!String(block.md || '').trim()) {
    e.blocks = e.blocks.filter(function (b) { return b !== block; });
  }
  touchEntry(e);
  markDirty();
  render();
  var card = qs('#entry-' + e.id);
  if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function toggleEntry(entryId) {
  ui.open[entryId] = !ui.open[entryId];
  render();
  var card = qs('#entry-' + entryId);
  if (card && ui.open[entryId]) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
