/* =========================================================
   30-library — 模板库 / 题库 / 规范
   ========================================================= */
function templateMarkdown(t) {
  var out = ['## ' + (t.id ? t.id + ' · ' : '') + t.title, ''];
  if (t.chapter) out.push('> ' + t.chapter, '');
  (t.sections || []).forEach(function (sec) {
    if (!sec || !String(sec.md || '').trim()) return;
    out.push('### ' + sec.label, '', String(sec.md).trim(), '');
  });
  return out.join('\n').trim() + '\n';
}

function bankMarkdown(it) {
  var out = ['## ' + (it.id ? it.id + ' · ' : '') + it.title, ''];
  var meta = [];
  if (it.chapter) meta.push(it.chapter);
  if (it.templateId) meta.push('模板 ' + it.templateId);
  if (it.difficulty) meta.push('难度 ' + it.difficulty);
  if (meta.length) out.push('> ' + meta.join(' · '), '');
  if (it.question) out.push('### 题目', '', String(it.question).trim(), '');
  if (it.standardSolution) out.push('### 考试标准解答', '', String(it.standardSolution).trim(), '');
  if (it.detailedAnalysis) out.push('### 详细解析', '', String(it.detailedAnalysis).trim(), '');
  if (it.answer) out.push('### 答案', '', String(it.answer).trim(), '');
  if (it.solution && it.solution.length) {
    out.push('### 解题要点', '');
    it.solution.forEach(function (s) { out.push('- ' + String(s).trim()); });
    out.push('');
  }
  var pitfalls = bankPitfallList(it);
  if (pitfalls.length) {
    out.push('### 易错点', '');
    pitfalls.forEach(function (s) { out.push('- ' + String(s).trim()); });
    out.push('');
  }
  return out.join('\n').trim() + '\n';
}

function librarySubjectPrefix(subjectId) {
  return subjectId === 'shufen' ? 'M' : subjectId === 'jieji' ? 'G' : subjectId === 'xijing' ? 'E' : 'A';
}

function chapterOrderFor(subjectId, tplList) {
  var seen = {};
  var out = [];
  (tplList || []).forEach(function (t) {
    var ch = t.chapter || '未分章';
    if (!seen[ch]) { seen[ch] = true; out.push(ch); }
  });
  return sortChapters(subjectId, out);
}

function chapterRankFor(subjectId, chapter, tplList) {
  var order = chapterOrderFor(subjectId, tplList);
  var i = order.indexOf(chapter || '未分章');
  return i < 0 ? 999 : i;
}

function nextUserTemplateId(subjectId) {
  var list = (state.userTemplates && state.userTemplates[subjectId]) || [];
  var ids = {};
  list.forEach(function (t) { ids[t.id] = true; });
  var prefix = 'U-' + librarySubjectPrefix(subjectId) + '-';
  var n = 1;
  while (ids[prefix + pad(n, 2)]) n++;
  return prefix + pad(n, 2);
}

function nextUserBankId(subjectId) {
  var list = (state.userBank && state.userBank[subjectId]) || [];
  var ids = {};
  list.forEach(function (t) { ids[t.id] = true; });
  var prefix = 'UB-' + librarySubjectPrefix(subjectId) + '-';
  var n = 1;
  while (ids[prefix + pad(n, 2)]) n++;
  return prefix + pad(n, 2);
}

function libraryNorm(v) {
  return String(v == null ? '' : v).replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

function templateSignature(t) {
  return JSON.stringify([
    libraryNorm(t.chapter),
    libraryNorm(t.title),
    (t.sections || []).map(function (sec) { return [libraryNorm(sec.label), libraryNorm(sec.md)]; })
  ]);
}

function bankSignature(it) {
  return JSON.stringify([
    libraryNorm(it.chapter),
    libraryNorm(it.title),
    libraryNorm(it.question),
    libraryNorm(it.answer)
  ]);
}

function templateExistsBySignature(subjectId, sig, st) {
  var base = (SUBJ_BY_ID[subjectId] && SUBJ_BY_ID[subjectId].templates) || [];
  var user = (st && st.userTemplates && st.userTemplates[subjectId]) || [];
  return base.concat(user).some(function (t) { return templateSignature(t) === sig; });
}

function bankExistsBySignature(subjectId, sig, st) {
  var base = (BANKS[subjectId] && BANKS[subjectId].items) || [];
  var user = (st && st.userBank && st.userBank[subjectId]) || [];
  return base.concat(user).some(function (t) { return bankSignature(t) === sig; });
}

function entryBlock(e, keys, titleRe) {
  var blocks = (e && e.blocks) || [];
  var hit = blocks.filter(function (b) { return b && keys.indexOf(b.key) >= 0; })[0];
  if (!hit && titleRe) hit = blocks.filter(function (b) { return b && titleRe.test(String(b.title || '')); })[0];
  return hit && hit.md ? String(hit.md) : '';
}

function bankTextSteps(text) {
  var raw = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!raw) return [];
  var lines = raw.split(/\n+/).map(function (x) { return x.replace(/^\s*(?:[-*•]|\d+[.)、])\s*/, '').trim(); }).filter(Boolean);
  if (lines.length > 1) return lines.slice(0, 8);
  return raw.split(/(?<=[。；;])\s*/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 8);
}

function bankPitfallList(it) {
  var list = Array.isArray(it.pitfalls) ? it.pitfalls.filter(Boolean) : [];
  if (!list.length && it.templateNotes && it.templateNotes.pitfalls) {
    list = bankTextSteps(it.templateNotes.pitfalls);
  }
  return list.map(function (x) { return String(x).trim(); }).filter(Boolean);
}

function ensureBankItemComplete(it) {
  if (!it || typeof it !== 'object') return it;
  if (!Array.isArray(it.solution)) it.solution = [];
  if (!it.solution.length) it.solution = bankTextSteps(it.detailedAnalysis || it.standardSolution || it.answer);
  if (!it.solution.length) it.solution = ['先整理题设条件与目标。', '选择对应方法，写出关键步骤。', '代回检验并写出结论。'];
  if (!Array.isArray(it.pitfalls)) it.pitfalls = [];
  if (!it.pitfalls.length) it.pitfalls = bankPitfallList(it);
  if (!String(it.question || '').trim()) it.question = it.title || '';
  if (!String(it.standardSolution || '').trim()) it.standardSolution = it.detailedAnalysis || it.answer || '';
  if (!String(it.detailedAnalysis || '').trim()) it.detailedAnalysis = (it.solution || []).join('\n') || it.answer || '';
  if (!String(it.answer || '').trim()) it.answer = '见考试标准解答过程与详细解析。';
  return it;
}

function entryPitfallList(e) {
  var out = [];
  var block = entryBlock(e, ['pitfalls'], /易错点|易错/);
  if (block) out = out.concat(bankTextSteps(block));
  var notes = e.templateNotes && e.templateNotes.pitfalls;
  if (notes) out = out.concat(bankTextSteps(notes));
  if (!out.length && e.errorNote) out = out.concat(bankTextSteps(e.errorNote));
  if (!out.length && e.errorTypes && e.errorTypes.length) out = e.errorTypes.map(function (x) { return '易错类型：' + x; });
  if (!out.length) out = ['审题时容易遗漏条件。', '计算后没有代回检验。', '结论或取值范围表述不完整。'];
  return out.map(function (x) { return String(x).trim(); }).filter(Boolean).slice(0, 6);
}

function entrySolutionSteps(e) {
  var standard = entryBlock(e, ['standard'], /标准解答|解答过程/);
  var analysis = entryBlock(e, ['analysis'], /详细解析|解析/);
  var steps = bankTextSteps(standard);
  if (steps.length < 2) steps = bankTextSteps(analysis);
  if (!steps.length) steps = ['先整理题设条件与目标。', '选择对应方法，写出关键步骤。', '代回检验并写出结论。'];
  return steps.slice(0, 8);
}

function syncEntryTemplate(e) {
  var subjectId = e.subject || state.activeSubject;
  var existing = e.templateId ? templateById(subjectId, e.templateId) : null;
  if (existing) {
    if (!e.templateTitle) e.templateTitle = existing.title;
    return existing;
  }
  var notes = e.templateNotes || {};
  var hasNotes = ['features', 'method', 'skeleton', 'pitfalls'].some(function (k) { return libraryNorm(notes[k]); });
  var title = libraryNorm(e.templateTitle) || libraryNorm(e.summary) || '';
  if (!hasNotes && !title) return null;
  var sections = [];
  if (libraryNorm(notes.features)) sections.push({ label: '识别特征', md: String(notes.features).trim() });
  if (libraryNorm(notes.method)) sections.push({ label: '首选方法', md: String(notes.method).trim() });
  if (libraryNorm(notes.skeleton)) sections.push({ label: '步骤骨架', md: String(notes.skeleton).trim() });
  if (libraryNorm(notes.pitfalls)) sections.push({ label: '易错点', md: String(notes.pitfalls).trim() });
  if (!sections.length) {
    var derived = (e.blocks || []).filter(function (b) { return b && libraryNorm(b.md); }).slice(0, 4);
    sections = derived.length ? derived.map(function (b, i) {
      return { label: i === 0 ? '识别特征' : i === 1 ? '首选方法' : i === 2 ? '步骤骨架' : '易错点', md: String(b.md).trim() };
    }) : [{ label: '识别特征', md: title || '同类题的结构与切入点。' }];
  }
  var tpl = {
    id: nextUserTemplateId(subjectId),
    subject: subjectId,
    chapter: e.chapter || '未分章',
    title: title || (entryTitle(e) + ' · 答题模板'),
    sections: sections,
    createdAt: nowIso(),
    userCreated: true
  };
  if (!state.userTemplates) state.userTemplates = {};
  if (!Array.isArray(state.userTemplates[subjectId])) state.userTemplates[subjectId] = [];
  state.userTemplates[subjectId].push(tpl);
  e.templateId = tpl.id;
  e.templateTitle = tpl.title;
  return tpl;
}

function syncEntryToBank(e) {
  var subjectId = e.subject || state.activeSubject;
  var mainQuestion = entryBlock(e, ['original'], /题目|原题/) || entryTitle(e);
  var standard = entryBlock(e, ['standard'], /标准解答|解答过程/);
  var analysis = entryBlock(e, ['analysis', 'explanation'], /详细解析|解析/);
  var answer = entryBlock(e, ['answer'], /答案/);
  var main = {
    id: nextUserBankId(subjectId),
    subject: subjectId,
    chapter: e.chapter || '未分章',
    templateId: e.templateId || '',
    pointKeys: (e.points || []).slice(),
    title: libraryNorm(e.summary) || entryTitle(e),
    question: mainQuestion,
    answer: answer,
    standardSolution: standard,
    detailedAnalysis: analysis,
    solution: entrySolutionSteps(e),
    pitfalls: entryPitfallList(e),
    templateNotes: e.templateNotes || null,
    difficulty: normalizeStars(e.stars || 2),
    tags: (e.points || []).slice(),
    source: '错题本 ' + (e.code || ''),
    relatedEntries: e.code ? [e.code] : [],
    userEntryId: e.id || '',
    createdAt: nowIso(),
    userCreated: true
  };
  var added = 0;
  if (!bankExistsBySignature(subjectId, bankSignature(main), state)) {
    if (!state.userBank) state.userBank = {};
    if (!Array.isArray(state.userBank[subjectId])) state.userBank[subjectId] = [];
    state.userBank[subjectId].push(main);
    added++;
  }
  (e.variants || []).forEach(function (v) {
    if (!v || !libraryNorm(v.q)) return;
    var item = {
      id: nextUserBankId(subjectId),
      subject: subjectId,
      chapter: e.chapter || '未分章',
      templateId: e.templateId || '',
      pointKeys: (e.points || []).slice(),
      title: '变式 · ' + (libraryNorm(e.summary) || e.code || '错题'),
      question: String(v.q).trim(),
      answer: String(v.a || '').trim(),
      standardSolution: String(v.a || '').trim(),
      detailedAnalysis: '',
      solution: bankTextSteps(v.a),
      pitfalls: entryPitfallList(e),
      templateNotes: e.templateNotes || null,
      difficulty: normalizeStars(e.stars || 2),
      tags: (e.points || []).slice(),
      source: '错题变式 ' + (e.code || ''),
      relatedEntries: e.code ? [e.code] : [],
      userEntryId: e.id || '',
      createdAt: nowIso(),
      userCreated: true
    };
    if (!bankExistsBySignature(subjectId, bankSignature(item), state)) {
      state.userBank[subjectId].push(item);
      added++;
    }
  });
  return added;
}

function syncEntryToLibraries(e) {
  var tpl = syncEntryTemplate(e);
  var bankAdded = syncEntryToBank(e);
  return { template: tpl, bankAdded: bankAdded };
}

function exportLibraryPayload() {
  // 备份只导出用户自己新增的模板/题库题；内置 8825 题由页面代码随身携带，
  // 写进备份会从数 MB 膨胀到十几 MB，导入时还会把旧内置题库回滚覆盖新版本。
  var templates = {};
  var bank = {};
  SUBJECTS.forEach(function (s) {
    templates[s.id] = (state.userTemplates && state.userTemplates[s.id]) || [];
    bank[s.id] = (state.userBank && state.userBank[s.id]) || [];
  });
  return { templates: templates, bank: bank };
}

function mergeLibraryPayload(st, payload) {
  var stats = { templatesAdded: 0, templatesSkipped: 0, templatesRenumbered: 0, bankAdded: 0, bankSkipped: 0, bankRenumbered: 0 };
  if (!payload) return stats;
  if (!st.userTemplates) st.userTemplates = {};
  if (!st.userBank) st.userBank = {};
  SUBJECTS.forEach(function (subj) {
    var sid = subj.id;
    var baseTpls = (SUBJ_BY_ID[sid] && SUBJ_BY_ID[sid].templates) || [];
    if (!Array.isArray(st.userTemplates[sid])) st.userTemplates[sid] = [];
    var allTpls = baseTpls.concat(st.userTemplates[sid]);
    var tplSig = {};
    var tplIds = {};
    allTpls.forEach(function (t) { tplSig[templateSignature(t)] = true; tplIds[t.id] = true; });
    var incomingTpls = ((payload.templates && payload.templates[sid]) || []).slice();
    var pendingTpls = [];
    incomingTpls.forEach(function (raw) {
      if (!raw || !libraryNorm(raw.title)) return;
      var sig = templateSignature(raw);
      if (tplSig[sig]) { stats.templatesSkipped++; return; }
      pendingTpls.push(deepClone(raw));
    });
    pendingTpls.sort(function (a, b) {
      return chapterRankFor(sid, a.chapter, allTpls) - chapterRankFor(sid, b.chapter, allTpls) || String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true });
    });
    pendingTpls.forEach(function (t) {
      t.subject = sid;
      if (!t.id || tplIds[t.id]) {
        t.id = nextUserTemplateIdForList(sid, st.userTemplates[sid]);
        stats.templatesRenumbered++;
      }
      tplIds[t.id] = true;
      tplSig[templateSignature(t)] = true;
      st.userTemplates[sid].push(t);
      stats.templatesAdded++;
    });
    var baseBank = (BANKS[sid] && BANKS[sid].items) || [];
    if (!Array.isArray(st.userBank[sid])) st.userBank[sid] = [];
    var allBank = baseBank.concat(st.userBank[sid]);
    var bankSig = {};
    var bankIds = {};
    allBank.forEach(function (t) { bankSig[bankSignature(t)] = true; bankIds[t.id] = true; });
    var incomingBank = ((payload.bank && payload.bank[sid]) || []).slice();
    var pendingBank = [];
    incomingBank.forEach(function (raw) {
      if (!raw || !libraryNorm(raw.question)) return;
      var sig = bankSignature(raw);
      if (bankSig[sig]) { stats.bankSkipped++; return; }
      pendingBank.push(deepClone(raw));
    });
    pendingBank.sort(function (a, b) {
      return chapterRankFor(sid, a.chapter, allTpls) - chapterRankFor(sid, b.chapter, allTpls) || String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true });
    });
    pendingBank.forEach(function (it) {
      it.subject = sid;
      if (!it.id || bankIds[it.id]) {
        it.id = nextUserBankIdForList(sid, st.userBank[sid]);
        stats.bankRenumbered++;
      }
      bankIds[it.id] = true;
      bankSig[bankSignature(it)] = true;
      st.userBank[sid].push(it);
      stats.bankAdded++;
    });
  });
  return stats;
}

function nextUserTemplateIdForList(subjectId, list) {
  var ids = {};
  (list || []).forEach(function (t) { ids[t.id] = true; });
  var prefix = 'U-' + librarySubjectPrefix(subjectId) + '-';
  var n = 1;
  while (ids[prefix + pad(n, 2)]) n++;
  return prefix + pad(n, 2);
}

function nextUserBankIdForList(subjectId, list) {
  var ids = {};
  (list || []).forEach(function (t) { ids[t.id] = true; });
  var prefix = 'UB-' + librarySubjectPrefix(subjectId) + '-';
  var n = 1;
  while (ids[prefix + pad(n, 2)]) n++;
  return prefix + pad(n, 2);
}

function viewTemplates(subjectId) {
  var allTpls = templatesOf(subjectId);
  var tf = templateFilterFor(subjectId);
  var q = searchQuery();
  var tplChapters = sortChapters(subjectId, uniq((typeof chapterListFor === 'function' ? chapterListFor(subjectId) : []).concat(allTpls.map(function (t) { return t.chapter || '未分章'; }))));
  var tpls = allTpls.filter(function (t) {
    if (tf.chapter !== 'all' && (t.chapter || '未分章') !== tf.chapter) return false;
    if (q) {
      var hay = (t.id + ' ' + t.title + ' ' + (t.sections || []).map(function (s) { return s.md; }).join(' ')).toLowerCase();
      if (hay.indexOf(q.toLowerCase()) < 0) return false;
    }
    return true;
  });
  var groups = {};
  var order = [];
  tpls.forEach(function (t) {
    var ch = t.chapter || '未分章';
    if (!groups[ch]) { groups[ch] = []; order.push(ch); }
    groups[ch].push(t);
  });
  order = sortChapters(subjectId, order);
  var bookHint = bookLabelFor(subjectId);
  var head = '<div class="page-head"><div><p class="eyebrow">' + esc(currentSubject().name) + (bookHint ? ' · ' + esc(bookHint) : '') + ' / PATTERNS</p>' +
    '<h1 class="page-title">模板库</h1>' +
    '<p class="page-sub">每张卡是一类题的解法骨架：识别特征 → 方法 → 步骤 → 易错点。正文按 Markdown + LaTeX 渲染，展开后可复制 Markdown 文本。' + (bookHint ? '章节按' + esc(bookHint) + '第一章至第十章排序。' : '') + '</p></div>' +
    '<div class="page-actions"><button class="btn" data-act="nav-view" data-view="bank" type="button">去题库</button>' +
    entryCreateButtons(subjectId) + '</div></div>';

  var body = order.map(function (ch, chapterIndex) {
    return '<section class="tpl-chapter" id="tpl-chapter-' + chapterIndex + '"><h3>' + esc(ch) + ' <span class="tpl-count">' + groups[ch].length + ' 张</span></h3>' +
      '<div class="tpl-grid">' +
      groups[ch].map(function (t) {
        var rel = entriesOf(subjectId).filter(function (e) { return e.templateId === t.id; });
        return '<details class="tpl-card"' + (ui.tplOpen === t.id ? ' open' : '') + ' id="tpl-' + attr(t.id) + '">' +
          '<summary><span class="tpl-id">' + esc(t.id) + '</span><span class="tpl-name">' + renderInline(t.title) + '</span><span class="caret" aria-hidden="true"></span></summary>' +
          '<div class="tpl-body">' +
            '<div class="md-copy-row"><button class="linkish" data-act="copy-template-md" data-template="' + attr(t.id) + '" type="button">复制 Markdown</button></div>' +
            (t.sections || []).map(function (s) {
              return '<div class="tpl-sec"><h4>' + renderInline(s.label) + '</h4><div class="md">' + renderMarkdown(s.md) + '</div></div>';
            }).join('') +
            (rel.length ? '<div class="tpl-entry-links">' + rel.map(function (e) {
              return '<button class="chip" data-act="jump-entry" data-id="' + attr(e.id) + '" type="button">关联 ' + esc(e.code) + '</button>';
            }).join('') + '</div>' : '') +
          '</div></details>';
      }).join('') + '</div></section>';
  }).join('');

  var chapterNav = order.length > 1 ? '<nav class="tpl-index" aria-label="模板章节索引">' + order.map(function (ch, i) {
    return '<button class="tpl-index-item" data-act="jump-tpl-chapter" data-index="' + i + '" type="button">' +
      '<span class="tpl-index-no">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="tpl-index-name">' + esc(ch) + '</span>' +
      '<span class="tpl-index-count">' + groups[ch].length + '</span>' +
    '</button>';
  }).join('') + '</nav>' : '';

  var tplFiltersActive = templateFiltersActive(tf);
  var tplToolbar = '<div class="toolbar template-filters">' +
    '<select class="select" data-template-filter="chapter" aria-label="按章节筛选模板">' + optionList(['all'].concat(tplChapters), tf.chapter, '全部章节') + '</select>' +
    '<button class="btn btn-xs filter-clear" data-act="clear-template-filters" type="button" title="' + (tplFiltersActive ? '清空模板筛选' : '当前没有可清空的筛选') + '"' + (tplFiltersActive ? '' : ' disabled') + '>清空筛选</button>' +
    '<span class="spacer"></span><span class="count-note" role="status" aria-live="polite">' + tpls.length + ' / ' + allTpls.length + ' 张</span>' +
  '</div>';

  return head + tplToolbar + chapterNav + '<h2 class="sr-only">模板章节</h2>' + (q ? '<p class="form-note">搜索「' + esc(q) + '」的结果</p>' : '') +
    (tpls.length ? body : emptyState('没有匹配的模板', '换个章节，或清空筛选。', ''));
}

function viewBank(subjectId) {
  var items = bankOf(subjectId);
  var q = searchQuery();
  var f = bankFilterFor(subjectId);
  var chapters = sortChapters(subjectId, uniq((typeof chapterListFor === 'function' ? chapterListFor(subjectId) : []).concat(items.map(function (i) { return i.chapter || '未分章'; }))));
  var tplIds = uniq(items.map(function (i) { return i.templateId; }).filter(Boolean));
  var filtered = items.filter(function (it) {
    if (f.chapter !== 'all' && it.chapter !== f.chapter) return false;
    if (f.template !== 'all' && it.templateId !== f.template) return false;
    if (f.category !== 'all' && it.category !== f.category) return false;
    if (f.type !== 'all' && (it.type || 'subjective') !== f.type) return false;
    if (f.diff !== 'all' && String(it.difficulty) !== f.diff) return false;
    if (f.origin !== 'all' && bankOriginKey(it) !== f.origin) return false;
    if (q) {
      var hay = [it.title, it.question, it.chapter, it.templateId, (it.tags || []).join(' '), (it.pointKeys || []).join(' ')].join(' ').toLowerCase();
      if (hay.indexOf(q.toLowerCase()) < 0) return false;
    }
    return true;
  });
  filtered.sort(function (a, b) {
    var ca = chapterSortValue(subjectId, a.chapter), cb = chapterSortValue(subjectId, b.chapter);
    if (ca !== cb) return ca - cb;
    return String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true });
  });

  var bankBook = bookLabelFor(subjectId);
  var head = '<div class="page-head"><div><p class="eyebrow">' + esc(currentSubject().name) + (bankBook ? ' · ' + esc(bankBook) : '') + ' / QUESTION BANK</p>' +
    '<h1 class="page-title">题库</h1>' +
    '<p class="page-sub">考研同型 + 教材课后：按考研大纲与教材章节整理的考研原创同型题及教材课后习题，涵盖计算、应用、综合、概念辨析、证明、公式填空等题型。题目、解答与公式按 Markdown 渲染，可复制 Markdown 文本。先自己写，再展开答案对照。' + (bankBook ? '章节按' + esc(bankBook) + '第一章至第十章排序。' : '') + '</p></div>' +
    '<div class="page-actions"><button class="btn" data-act="nav-view" data-view="templates" type="button">看模板</button>' +
    entryCreateButtons(subjectId) + '</div></div>';

  function bankOriginBtn(value, label) {
    return '<button data-act="bank-origin" data-value="' + value + '" aria-pressed="' + (f.origin === value) + '" type="button">' + esc(label) + '</button>';
  }
  var bankFiltersOn = bankFiltersActive(f);
  var toolbar = '<div class="toolbar bank-filters">' +
    '<div class="seg bank-origin" role="group" aria-label="按题目来源筛选题库">' +
      bankOriginBtn('all', '全部来源') + bankOriginBtn('exam', '考研同型') + bankOriginBtn('textbook', '教材课后') +
    '</div>' +
    '<select class="select" data-bank-filter="chapter" aria-label="按章节筛选题库">' + optionList(['all'].concat(chapters), f.chapter, '全部章节') + '</select>' +
        '<select class="select" data-bank-filter="category" aria-label="按题型分类筛选题库"><option value="all"' + (f.category === 'all' ? ' selected' : '') + '>全部题型</option>' + ["计算题","应用题","综合题","概念辨析题","证明题","公式填空题","反例与存在性题","分类讨论题","误差分析题","多解比较题"].map(function (c) { return '<option value="' + attr(c) + '"' + (f.category === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
    '<select class="select" data-bank-filter="type" aria-label="按作答形式筛选题库"><option value="all"' + (f.type === 'all' ? ' selected' : '') + '>全部形式</option><option value="choice"' + (f.type === 'choice' ? ' selected' : '') + '>客观题</option><option value="fill"' + (f.type === 'fill' ? ' selected' : '') + '>填空题</option><option value="subjective"' + (f.type === 'subjective' ? ' selected' : '') + '>主观题</option></select>' +
    '<select class="select" data-bank-filter="template" aria-label="按模板筛选题库">' +
      '<option value="all"' + (f.template === 'all' ? ' selected' : '') + '>全部模板</option>' +
      tplIds.map(function (id) { return '<option value="' + attr(id) + '"' + (f.template === id ? ' selected' : '') + '>' + esc(id) + '</option>'; }).join('') +
    '</select>' +
    '<select class="select" data-bank-filter="diff" aria-label="按难度筛选">' +
      '<option value="all"' + (f.diff === 'all' ? ' selected' : '') + '>全部难度</option>' +
      [1, 2, 3, 4, 5].map(function (n) {
        var label = n === 1 ? '基础' : n === 2 ? '常规' : n === 3 ? '综合' : n === 4 ? '压轴' : '竞赛';
        return '<option value="' + n + '"' + (f.diff === String(n) ? ' selected' : '') + '>' + stars(n) + ' ' + label + '</option>';
      }).join('') +
    '</select>' +
    '<button class="btn btn-xs filter-clear" data-act="clear-bank-filters" type="button" title="' + (bankFiltersOn ? '清空题库筛选' : '当前没有可清空的筛选') + '"' + (bankFiltersOn ? '' : ' disabled') + '>清空筛选</button>' +
    '<span class="spacer"></span><span class="count-note" role="status" aria-live="polite">' + filtered.length + ' / ' + items.length + ' 题</span>' +
  '</div>';

  var list;
  if (!items.length) {
    list = emptyState('题库还没生成', '题库作者正在整理四科 skill 的题型与变式，稍后刷新即可；你仍然可以手动新增或智能录入。', '<div class="multi-actions">' + entryCreateButtons(subjectId) + '</div>');
  } else if (!filtered.length) {
    list = emptyState('没有匹配的题', '换个来源、章节、题型分类、作答形式、模板或难度，或清空筛选。', '');
  } else {
    var shownLimit = Math.max(120, Number(ui.bankShowLimit) || 120);
    var shown = filtered.slice(0, shownLimit);
    list = '<div class="bank-list">' + shown.map(renderBankItem).join('') + '</div>' +
      (filtered.length > shown.length ? '<div class="bank-more"><button class="btn" data-act="bank-show-more" type="button">加载更多 · 已显示 ' + shown.length + ' / ' + filtered.length + '</button></div>' : '');
  }
  var listHead = '<h2 class="sr-only">题目列表</h2>';
  return head + toolbar + listHead + list;
}

function renderBankItem(it) {
  var open = !!ui.bankOpen[it.id];
  var typeLabel = it.type === 'choice' ? '客观题' : it.type === 'fill' ? '填空题' : '主观题';
  var rel = (it.relatedEntries || []).map(function (code) {
    var e = entriesOf(state.activeSubject).filter(function (x) { return x.code === code; })[0];
    return e ? '<button class="chip" data-act="jump-entry" data-id="' + attr(e.id) + '" type="button">关联 ' + esc(e.code) + '</button>' : '';
  }).join('');
  return '<article class="bank-item' + (open ? ' is-open' : '') + '" id="bank-' + attr(it.id) + '">' +
    '<div class="bank-top">' +
      '<span class="bank-id">' + esc(it.id) + '</span>' +
      '<h3 class="bank-title">' + esc(it.title) + '</h3>' +
      '<span class="bank-meta">' +
        (it.templateId ? '<span class="chip">' + esc(it.templateId) + '</span>' : '') +
        '<span class="chip chip-star">' + stars(it.difficulty) + '</span>' + (String(it.title || '').indexOf(typeLabel) >= 0 ? '' : '<span class="chip">' + esc(typeLabel) + '</span>') + '<span class="chip chip-exam">' + (it.examOrigin === '教材课后习题' ? '教材课后' : '考研同型') + '</span>' +
        (it.chapter ? '<span class="chip">' + esc(it.chapter) + '</span>' : '') +
      '</span>' +
    '</div>' +
    '<div class="bank-q md">' + renderMarkdown(String(it.question || '').replace(/^【[^】]{1,20}】\s*/, '')) + '</div>' +
    (it.type === 'choice' && Array.isArray(it.options) && it.options.length ? '<div class="bank-options">' + it.options.map(function (o) { return '<div class="bank-option"><b>' + esc(o.key) + '．</b>' + renderInline(o.text) + '</div>'; }).join('') + '</div>' : '') +
    '<div class="bank-actions">' +
      '<button class="btn btn-xs" data-act="toggle-bank-answer" data-bank-id="' + attr(it.id) + '" type="button" aria-expanded="' + open + '" aria-controls="answer-' + attr(it.id) + '">' + (open ? '收起解答' : '显示解答') + '</button>' +
      '<button class="btn btn-xs" data-act="add-from-bank" data-bank-id="' + attr(it.id) + '" type="button">加入错题本</button>' +
      '<button class="btn btn-xs' + (typeof finalHasItem === 'function' && finalHasItem(state.activeSubject, 'bank', it.id) ? ' is-added' : '') + '" data-act="final-add-bank" data-bank-id="' + attr(it.id) + '" type="button">' + (typeof finalHasItem === 'function' && finalHasItem(state.activeSubject, 'bank', it.id) ? '已在期末' : '加入期末') + '</button>' +
      '<button class="btn btn-xs" data-act="copy-bank-md" data-bank-id="' + attr(it.id) + '" type="button">复制 Markdown</button>' +
      (it.solution && it.solution.length ? '<span class="faint" style="font-size:10.5px">先自己写一遍，再对答案</span>' : '') +
    '</div>' +
    '<div class="bank-answer" id="answer-' + attr(it.id) + '"' + (open ? '' : ' hidden') + '>' +
      (it.standardSolution
        ? '<section class="bank-sec bank-sec-standard"><h4>考试标准解答过程</h4><div class="md">' + renderMarkdown(it.standardSolution) + '</div></section>'
        : '') +
      (it.detailedAnalysis
        ? '<section class="bank-sec bank-sec-analysis"><h4>详细解析</h4><div class="md">' + renderMarkdown(it.detailedAnalysis) + '</div></section>'
        : '') +
      (it.standardSolution || it.detailedAnalysis
        ? ''
        : '<div class="bank-sec"><h4>解题要点</h4><p class="faint">这道题还没有完整解答数据；可先参考下面的答案与要点。</p></div>') +
      (it.answer ? '<section class="bank-sec bank-sec-answer"><h4>答案</h4><div class="md bank-answer-text">' + renderMarkdown(it.answer) + '</div></section>' : '') +
      (it.solution && it.solution.length ? '<section class="bank-sec"><h4>解题要点</h4><ol class="bank-solution">' + it.solution.map(function (s) { return '<li>' + renderMarkdown(s) + '</li>'; }).join('') + '</ol></section>' : '') +
      (bankPitfallList(it).length ? '<section class="bank-sec bank-sec-pitfalls"><h4>易错点</h4><ul class="bank-pitfalls">' + bankPitfallList(it).map(function (s) { return '<li>' + renderMarkdown(s) + '</li>'; }).join('') + '</ul></section>' : '') +
      (it.pointKeys && it.pointKeys.length ? '<div class="bank-points multi-actions">' + it.pointKeys.map(function (p) { return '<span class="chip">' + renderInline(p) + '</span>'; }).join('') + rel + '</div>' : rel) +
    '</div>' +
  '</article>';
}

function viewGuide(subjectId) {
  var s = subjectOf(subjectId);
  var conventions = renderMarkdown(s.conventionsMd || '');
  var example = s.exampleMd ? renderMarkdown(s.exampleMd) : '';
  var main = '<section class="panel guide-panel"><div class="panel-head"><h2 class="panel-title">条目规范与复习法</h2><span class="panel-sub">统一适用四科</span></div>' +
    '<div class="panel-body"><div class="md">' + conventions + '</div>' +
    '<p class="form-note">本页为四科统一规范；新增或修改只写入网页数据，不改写原始 Markdown 文件。</p></div></section>' +
    (example ? '<section class="panel guide-panel guide-example"><div class="panel-head"><h2 class="panel-title">格式示范</h2><span class="panel-sub">照这个写</span></div><div class="panel-body"><div class="md">' + example + '</div></div></section>' : '') +
    '<section class="panel guide-panel guide-data"><div class="panel-head"><h2 class="panel-title">数据与维护</h2></div><div class="panel-body"><div class="md">' +
      '<ul>' +
      '<li>网页数据默认保存在浏览器 localStorage；用同一台设备打开即可继续编辑。</li>' +
      '<li>换设备时：在「设置与同步」里导出 JSON，再到另一台设备导入。</li>' +
      '<li>启动 <code>node server.js</code> 后，页面会自动把改动 PUT 到 <code>data/state.json</code>，手机和电脑同一 URL 就能共享。</li>' +
      '<li>条目里的 LaTeX 用 <code>$...$</code>（行内）或 <code>$$...$$</code>（独立公式）；网页统一用 Temml 渲染。</li>' +
      '</ul>' +
    '</div></div></section>';
  var aside = '<aside class="guide-aside" aria-label="规范速览">' +
    '<div class="guide-card"><span class="guide-card-kicker">五件套</span><h3>缺一不可</h3>' +
      '<ul class="guide-check"><li>考试标准解答过程</li><li>详细解析</li><li>答案</li><li>解题要点</li><li>易错点</li></ul></div>' +
    '<div class="guide-card"><span class="guide-card-kicker">复习节奏</span><h3>重做优先</h3>' +
      '<div class="guide-days"><span>D1</span><span>D3</span><span>D7</span><span>D15</span><span>D30</span><span>D60</span><span>D365</span></div>' +
      '<p>按 1–5 星与内容难度生成 20–32 个节点，同星级会按错误类型、要点和变式数量再细分，最远 D1800；按录入与上一节点时间解锁，当天看一遍，之后遮住解答重写，变式也做对再标「已掌握」。</p></div>' +
    '<div class="guide-card"><span class="guide-card-kicker">编号前缀</span><h3>一科一号</h3>' +
      '<div class="guide-prefix"><span><b>GA</b>高代</span><span><b>MA</b>数分</span><span><b>GE</b>解几</span><span><b>WE</b>西经</span></div></div>' +
  '</aside>';
  var guideBook = bookLabelFor(subjectId);
  return '<div class="page-head"><div><p class="eyebrow">' + esc(s.name) + (guideBook ? ' · ' + esc(guideBook) : '') + ' / CONVENTIONS</p>' +
    '<h1 class="page-title">规范</h1>' +
    '<p class="page-sub">四科统一使用同一套条目字段、编号规则、书写格式、复习节奏和维护约定。' + (guideBook ? '章节入口按' + esc(guideBook) + '第一章至第十章排列。' : '') + '</p></div></div>' +
    '<div class="guide-layout"><div class="guide-main">' + main + '</div>' + aside + '</div>';
}

/* ---------- navigation helpers ---------- */
function navSubject(subjectId) {
  state.activeSubject = subjectId;
  state.activeView = (state.activeView === 'notes' || state.activeView === 'final') ? 'overview' : (state.activeView || 'overview');
  persistLocal();
  location.hash = '#/' + subjectRouteId(subjectId) + '/' + state.activeView;
  render();
}
function navView(view) {
  state.activeView = view;
  persistLocal();
  location.hash = '#/' + subjectRouteId(state.activeSubject) + '/' + view;
  render();
}
function jumpToEntry(entryId) {
  state.activeView = 'entries';
  ui.open[entryId] = true;
  persistLocal();
  location.hash = '#/' + subjectRouteId(state.activeSubject) + '/entries';
  render();
  var el = qs('#entry-' + entryId);
  if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
function gotoBank(templateId) {
  state.activeView = 'bank';
  var gf = bankFilterFor(state.activeSubject);
  gf.chapter = 'all';
  gf.category = 'all';
  gf.type = 'all';
  gf.template = templateId || 'all';
  gf.diff = 'all';
  gf.origin = 'all';
  ui.bankShowLimit = 120;
  persistLocal();
  location.hash = '#/' + subjectRouteId(state.activeSubject) + '/bank';
  render();
}
function openBankItem(bankId) {
  state.activeView = 'bank';
  ui.bankOpen[bankId] = true;
  persistLocal();
  location.hash = '#/' + subjectRouteId(state.activeSubject) + '/bank';
  render();
  var el = qs('#bank-' + bankId);
  if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
function gotoTemplate(templateId) {
  state.activeView = 'templates';
  templateFilterFor(state.activeSubject).chapter = 'all';
  ui.tplOpen = templateId;
  persistLocal();
  location.hash = '#/' + subjectRouteId(state.activeSubject) + '/templates';
  render();
  var el = qs('#tpl-' + templateId);
  if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
