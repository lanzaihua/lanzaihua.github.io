/* =========================================================
   58-final — 期末复习：计划、选题组卷、编辑、DOCX / PDF
   ========================================================= */
var FINAL_PHASES = [
  { key: 'base', label: '基础回顾', hint: '公式、模板与错因' },
  { key: 'train', label: '强化训练', hint: '高频题型与变式' },
  { key: 'sprint', label: '冲刺模拟', hint: '限时整套卷' }
];

function finalData() {
  if (!state.finalExam || typeof state.finalExam !== 'object') {
    state.finalExam = { date: '', duration: 120, items: [], papers: [], done: {} };
  }
  var fe = state.finalExam;
  if (!Array.isArray(fe.items)) fe.items = [];
  if (!Array.isArray(fe.papers)) fe.papers = [];
  if (!Array.isArray(fe.examHistory)) fe.examHistory = [];
  if (!fe.done || typeof fe.done !== 'object') fe.done = {};
  if (!(Number(fe.duration) > 0)) fe.duration = 120;
  if (!SUBJ_BY_ID[fe.subject]) fe.subject = SUBJ_BY_ID[state.activeSubject] ? state.activeSubject : 'gaodai';
  return fe;
}

function finalStartOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function finalParseDay(s) {
  var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  var d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d.getTime()) ? null : d;
}
function finalDateKey(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2);
}
function finalAddDays(d, n) {
  var x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}
function finalDaysBetween(a, b) {
  return Math.round((finalStartOfDay(b).getTime() - finalStartOfDay(a).getTime()) / 86400000);
}

function finalBlockMd(e, keys) {
  if (!e || !Array.isArray(e.blocks)) return '';
  for (var i = 0; i < keys.length; i++) {
    var b = e.blocks.filter(function (x) { return x && x.key === keys[i] && String(x.md || '').trim(); })[0];
    if (b) return String(b.md).trim();
  }
  return '';
}

function finalResolveItem(it) {
  if (!it || !it.subject) return null;
  var s = SUBJ_BY_ID[it.subject];
  if (!s) return null;
  if (it.type === 'entry') {
    var e = findEntry(it.subject, it.id);
    if (!e) return null;
    var q = finalBlockMd(e, ['original', 'question']) || String(e.summary || '');
    var a = finalBlockMd(e, ['answer', 'standard']) || finalBlockMd(e, ['analysis']) || '';
    return {
      key: it.key, subject: it.subject, type: 'entry', id: e.id,
      code: e.code, title: entryTitle(e), chapter: e.chapter || '未分章',
      status: e.status || 'unmastered', stars: normalizeStars(e.stars),
      question: q.trim(), answer: a.trim(), subjectName: s.name,
      standardSolution: (finalBlockMd(e, ['standard']) || '').trim(),
      detailedAnalysis: (finalBlockMd(e, ['analysis']) || '').trim(),
      points: Array.isArray(e.points) ? e.points.slice() : [],
      pitfalls: Array.isArray(e.pitfalls) ? e.pitfalls.slice() : (e.errorNote ? [String(e.errorNote)] : []),
      questionType: 'subjective'
    };
  }
  if (it.type === 'bank') {
    var list = bankOf(it.subject);
    var b = list.filter(function (x) { return x.id === it.id; })[0];
    if (!b) return null;
    var ans = String(b.answer || b.standardSolution || (b.solution || []).join('\n') || '').trim();
    return {
      key: it.key, subject: it.subject, type: 'bank', id: b.id,
      code: b.id, title: b.title || '题库题', chapter: b.chapter || '未分章',
      status: 'unmastered', stars: normalizeStars(b.difficulty),
      question: String(b.question || b.title || '').trim(), answer: ans, subjectName: s.name,
      standardSolution: String(b.standardSolution || '').trim(),
      detailedAnalysis: String(b.detailedAnalysis || '').trim(),
      points: Array.isArray(b.points) ? b.points.slice() : (Array.isArray(b.pointKeys) ? b.pointKeys.slice() : []),
      pitfalls: Array.isArray(b.pitfalls) ? b.pitfalls.slice() : [],
      options: Array.isArray(b.options) ? b.options.slice() : [],
      correct: String(b.correct || ''),
      questionType: b.type === 'choice' ? 'choice' : b.type === 'fill' ? 'fill' : 'subjective'
    };
  }
  return null;
}

function finalMaterials() {
  return finalData().items.map(finalResolveItem).filter(Boolean);
}
function finalMaterialsForSubject(subject) {
  return finalMaterials().filter(function (m) { return m.subject === subject; });
}
function finalSelectedChapters(subject) {
  var fe = finalData();
  var arr = fe.chapterSel && fe.chapterSel[subject];
  return Array.isArray(arr) ? arr.filter(Boolean) : [];
}
function finalMaterialsForChapters(subject) {
  var all = finalMaterialsForSubject(subject);
  var sel = finalSelectedChapters(subject);
  if (!sel.length) return all;
  return all.filter(function (m) { return sel.indexOf(m.chapter) >= 0; });
}
function finalChapterFilterHtml(subject) {
  var all = finalMaterialsForSubject(subject);
  if (!all.length) return '';
  var chapters = [];
  all.forEach(function (m) { if (m.chapter && chapters.indexOf(m.chapter) < 0) chapters.push(m.chapter); });
  var sel = finalSelectedChapters(subject);
  return '<div class="final-chapter-filter"><span class="fcf-label">章节</span><button class="fcf-chip' + (!sel.length ? ' is-on' : '') + '" data-act="final-chapter" data-chapter="" type="button">全部</button>' +
    chapters.map(function (c) { return '<button class="fcf-chip' + (sel.indexOf(c) >= 0 ? ' is-on' : '') + '" data-act="final-chapter" data-chapter="' + attr(c) + '" type="button">' + esc(c) + '</button>'; }).join('') + '</div>';
}

function finalItemKey(subject, type, id) {
  return subject + ':' + type + ':' + id;
}
function finalHasItem(subject, type, id) {
  return finalData().items.some(function (x) { return x.key === finalItemKey(subject, type, id); });
}
function finalAddItem(subject, type, id) {
  var fe = finalData();
  if (finalHasItem(subject, type, id)) { toast('这道题已经在期末复习里'); return; }
  fe.items.push({ key: finalItemKey(subject, type, id), subject: subject, type: type, id: id, addedAt: nowIso() });
  markDirty();
  toast('已加入期末复习 · ' + (type === 'entry' ? '错题' : '题库'));
}
function finalAddEntry(id) { finalAddItem(state.activeSubject, 'entry', id); }
function finalAddBank(id) { finalAddItem(state.activeSubject, 'bank', id); }
function finalRemoveItem(key) {
  var fe = finalData();
  fe.items = fe.items.filter(function (x) { return x.key !== key; });
  markDirty();
  render();
  toast('已从期末复习移除');
}

function finalPriority(a) {
  return (a.status === 'unmastered' ? 100 : 0) + a.stars * 10 + (a.type === 'entry' ? 3 : 0);
}
function finalSortedMaterials() {
  return finalMaterials().slice().sort(function (a, b) { return finalPriority(b) - finalPriority(a); });
}

function finalPlanData() {
  var fe = finalData();
  if (!fe.date) return { empty: true, duration: fe.duration };
  var today = finalStartOfDay(new Date());
  var exam = finalParseDay(fe.date);
  if (!exam) return { empty: true, duration: fe.duration };
  if (exam.getTime() < today.getTime()) return { past: true, exam: exam, duration: fe.duration, today: today };
  var total = Math.max(0, finalDaysBetween(today, exam));
  var materials = finalSortedMaterials();
  var codes = materials.map(function (m) { return m.code; });
  var p1 = Math.ceil(total * 0.45);
  var p2 = Math.ceil(total * 0.35);
  var days = [];
  for (var i = 0; i < total; i++) {
    var d = finalAddDays(today, i);
    var phase = i < p1 ? 0 : (i < p1 + p2 ? 1 : 2);
    var focus = '';
    var c1 = codes.length ? codes[i % codes.length] : '';
    var c2 = codes.length ? codes[(i + 1) % codes.length] : '';
    if (phase === 0) focus = codes.length ? '回看 ' + c1 + (c2 && c2 !== c1 ? ' · ' + c2 : '') + '，整理公式与错因' : '整理错题本，补全公式与模板';
    if (phase === 1) focus = codes.length ? '限时重做 ' + c1 + (c2 && c2 !== c1 ? ' · ' + c2 : '') + '，再做变式' : '按章节做变式题，记录卡点';
    if (phase === 2) focus = (i === total - 1) ? '考前最后一轮：只看错题标题、公式和易错点' : (i % 2 === 0 ? '限时模拟卷 · ' + fe.duration + ' 分钟' : (codes.length ? '错题清单回看 ' + c1 + ' · ' + c2 : '回看错题清单与模板'));
    days.push({ date: d, key: finalDateKey(d), phase: phase, focus: focus, done: !!fe.done[finalDateKey(d)] });
  }
  return { empty: false, past: false, today: today, exam: exam, total: total, days: days, phases: [p1, p2, Math.max(0, total - p1 - p2)], materials: materials, duration: fe.duration };
}

function finalPlanHtml() {
  var fe = finalData();
  var data = finalPlanData();
  if (data.empty) {
    return '<div class="final-empty"><b>先设定考试日期</b><p>日期确定后，系统会从今天开始拆分三个阶段，并把选入的题目排进每天的任务。</p></div>';
  }
  if (data.past) {
    return '<div class="final-empty is-warn"><b>考试日期已经过去</b><p>把日期改到今天或之后，复习计划会重新生成。</p></div>';
  }
  var phaseCards = FINAL_PHASES.map(function (p, i) {
    return '<div class="final-phase"><span class="fp-k">0' + (i + 1) + '</span><b>' + p.label + '</b><small>' + p.hint + '</small><em>' + (data.phases[i] || 0) + ' 天</em></div>';
  }).join('');
  var rows = data.days.map(function (d) {
    return '<div class="final-day' + (d.done ? ' is-done' : '') + '">' +
      '<span class="fd-date">' + pad(d.date.getMonth() + 1, 2) + '.' + pad(d.date.getDate(), 2) + '<small>周' + '日一二三四五六'.charAt(d.date.getDay()) + '</small></span>' +
      '<span class="fd-phase">' + FINAL_PHASES[d.phase].label + '</span>' +
      '<span class="fd-focus">' + esc(d.focus) + '</span>' +
      '<label class="fd-check"><input type="checkbox" data-final-task="' + d.key + '"' + (d.done ? ' checked' : '') + '><span>完成</span></label>' +
    '</div>';
  }).join('');
  return '<div class="final-count-banner"><b>' + data.total + '</b><span>天复习窗口</span><small>' + finalDateKey(data.today) + ' → ' + finalDateKey(data.exam) + '</small></div>' +
    '<div class="final-phase-grid">' + phaseCards + '</div>' +
    '<div class="final-day-list">' + rows + '<div class="final-day is-exam"><span class="fd-date">' + pad(data.exam.getMonth() + 1, 2) + '.' + pad(data.exam.getDate(), 2) + '<small>考试</small></span><span class="fd-phase">考试日</span><span class="fd-focus">带齐证件与文具，按模拟卷节奏答题</span><span class="fd-check">—</span></div></div>';
}

function finalSubject() { return finalData().subject || state.activeSubject || 'gaodai'; }
function finalSubjectTabsHtml(showNote) {
  return '<div class="final-subject-tabs" role="tablist" aria-label="模拟卷科目">' + SUBJECTS.map(function (s) {
    return '<button class="final-subject-tab' + (s.id === finalSubject() ? ' is-on' : '') + '" data-act="final-subject" data-subject="' + attr(s.id) + '" role="tab" aria-selected="' + (s.id === finalSubject()) + '" type="button">' + esc(s.name) + '</button>';
  }).join('') + '</div>' + (showNote === false ? '' : '<p class="final-subject-note">一张模拟卷只使用一个科目的题目，不混合科目。</p>');
}

function finalMaterialsHtml() {
  var list = finalMaterials();
  if (!list.length) {
    return '<div class="final-empty"><b>还没有加入题目</b><p>用页面右上方的「挑错题 / 挑题库题」入口，把题目加入期末材料。</p></div>';
  }
  return '<div class="final-material-list">' + list.map(function (m) {
    return '<div class="final-material">' +
      '<span class="fm-code">' + esc(m.code) + '</span>' +
      '<span class="fm-main"><b>' + renderInline(m.title) + '</b><small>' + esc(m.subjectName) + ' · ' + esc(m.chapter) + '</small></span>' +
      '<span class="fm-type">' + (m.type === 'entry' ? '错题' : '题库') + '</span>' +
      '<button class="icon-mini" data-act="final-remove-item" data-key="' + attr(m.key) + '" type="button" aria-label="从本卷移除（不删除原题）" title="从本卷移除，不删除错题或题库原题">×</button>' +
    '</div>';
  }).join('') + '</div>';
}

function finalPaperScoreText(p) {
  var total = (p.items || []).reduce(function (s, it) { return s + (Number(it.score) || 0); }, 0);
  return (p.items || []).length + ' 题 · ' + Math.round(total * 10) / 10 + ' 分';
}

function finalPaperById(id) {
  var fe = finalData();
  return fe.papers.filter(function (p) { return p.id === id; })[0] || fe.papers[0] || null;
}
function finalActivePaper() {
  var fe = finalData();
  var subject = finalSubject();
  var list = fe.papers.filter(function (p) { return (p.subject || (p.items && p.items[0] && p.items[0].subject) || subject) === subject; });
  if (ui.finalPaperId) { var picked = list.filter(function (p) { return p.id === ui.finalPaperId; })[0]; if (picked) return picked; }
  return list[0] || null;
}

function finalChooseMaterials(materials, n, salt) {
  var groups = {};
  materials.filter(Boolean).forEach(function (m) {
    (groups[m.subject] = groups[m.subject] || []).push(m);
  });
  Object.keys(groups).forEach(function (k) {
    groups[k].sort(function (a, b) { return finalPriority(b) - finalPriority(a); });
    var shift = (salt + k.length) % groups[k].length;
    groups[k] = groups[k].slice(shift).concat(groups[k].slice(0, shift));
  });
  var keys = Object.keys(groups);
  var out = [];
  var round = 0;
  while (out.length < n) {
    var added = false;
    for (var i = 0; i < keys.length && out.length < n; i++) {
      var arr = groups[keys[i]];
      if (arr[round]) { out.push(arr[round]); added = true; }
    }
    if (!added) break;
    round++;
  }
  return out;
}

function finalPaperPickByType(materials, type, count, salt) {
  var pool = (materials || []).filter(function (m) { return (m.questionType || 'subjective') === type; });
  if (!pool.length || count <= 0) return [];
  pool.sort(function (a, b) { return finalPriority(b) - finalPriority(a); });
  var shift = (salt + type.length) % pool.length;
  pool = pool.slice(shift).concat(pool.slice(0, shift));
  return pool.slice(0, count);
}
function finalChoosePaperMaterials(materials, n, salt) {
  var all = (materials || []).filter(Boolean);
  var out = [], used = {};
  function add(list) {
    list.forEach(function (m) { if (m && !used[m.key] && out.length < n) { used[m.key] = true; out.push(m); } });
  }
  var choiceCount = Math.min(4, Math.max(2, Math.round(n * 0.3)));
  var fillCount = Math.min(4, Math.max(2, Math.round(n * 0.3)));
  add(finalPaperPickByType(all, 'choice', choiceCount, salt));
  add(finalPaperPickByType(all, 'fill', fillCount, salt));
  add(finalPaperPickByType(all, 'subjective', n - out.length, salt + 7));
  if (out.length < n) {
    var rest = finalChooseMaterials(all, n, salt + 11);
    add(rest);
  }
  return out.slice(0, n);
}
function finalSmartScoreItems(items, total) {
  var list = Array.isArray(items) ? items : [];
  if (!list.length) return list;
  total = Number(total) || 100;
  var objective = [], subjective = [];
  list.forEach(function (it) {
    var t = it && (it.questionType || it.type);
    (t === 'choice' || t === 'fill' ? objective : subjective).push(it);
  });
  var objectivePool = 0;
  if (objective.length) {
    if (subjective.length) {
      // 客观题与填空题统一 3 分，避免客观题单题分值过高；其余分值按难度分给主观题。
      objectivePool = Math.min(total - subjective.length * 0.5, objective.length * 3);
      objectivePool = Math.max(objective.length * 2, objectivePool);
      var subjectiveFloor = subjective.length * 0.5;
      if (subjectiveFloor < total) objectivePool = Math.min(objectivePool, total - subjectiveFloor);
    } else {
      objectivePool = total;
    }
  }
  function difficultyOf(item) {
    var value = Number(item.difficulty || item.stars);
    if (!value) {
      value = 2;
      if (item.type !== 'choice' && item.type !== 'fill') {
        var points = Array.isArray(item.points) ? item.points.length : 0;
        if (points >= 3) value += 0.8;
        if (String(item.standardSolution || '').length > 260) value += 0.7;
        if (String(item.question || '').length > 220) value += 0.5;
      }
    }
    return Math.max(1, Math.min(5, value));
  }
  function distribute(group, pool, weighted) {
    if (!group.length) return;
    var weights = group.map(function (item) { return weighted ? (0.7 + difficultyOf(item) * 0.28) : 1; });
    var weightSum = weights.reduce(function (sum, w) { return sum + w; }, 0);
    var allocated = 0;
    group.forEach(function (item, index) {
      var raw = pool * weights[index] / weightSum;
      var score = Math.max(0.5, Math.round(raw * 2) / 2);
      item.score = score;
      allocated += score;
    });
    var diff = Math.round((pool - allocated) * 2) / 2;
    var last = group[group.length - 1];
    last.score = Math.max(0.5, Math.round((last.score + diff) * 2) / 2);
  }
  distribute(objective, objectivePool, false);
  distribute(subjective, total - objectivePool, true);
  // 最终总分必须精确等于 100（且仍以 0.5 分为单位），避免四舍五入出现 100.5。
  var sum = list.reduce(function (acc, it) { return acc + (Number(it.score) || 0); }, 0);
  var remain = Math.round((total - sum) * 2) / 2;
  if (remain && list.length) {
    var target = remain > 0 ? list[list.length - 1] : list.slice().sort(function (a, b) { return (Number(b.score) || 0) - (Number(a.score) || 0); })[0];
    target.score = Math.max(0.5, Math.round(((Number(target.score) || 0.5) + remain) * 2) / 2);
  }
  list.forEach(function (item) { item.score = Math.max(0.5, Math.round((Number(item.score) || 0.5) * 2) / 2); });
  var finalSum = list.reduce(function (acc, it) { return acc + (Number(it.score) || 0); }, 0);
  var finalRemain = Math.round((total - finalSum) * 2) / 2;
  if (finalRemain) {
    var fix = finalRemain > 0 ? list[list.length - 1] : list.slice().sort(function (a, b) { return (Number(b.score) || 0) - (Number(a.score) || 0); })[0];
    if (fix) fix.score = Math.max(0.5, Math.round(((Number(fix.score) || 0.5) + finalRemain) * 2) / 2);
  }
  return list;
}

function finalGeneratePaper() {
  var fe = finalData();
  var subject = finalSubject();
  var materials = finalMaterialsForChapters(subject);
  if (!materials.length) {
    var sel = finalSelectedChapters(subject);
    materials = bankOf(subject).filter(function (b) { return !sel.length || sel.indexOf(b.chapter) >= 0; }).map(function (b) {
      return finalResolveItem({ type: 'bank', subject: subject, id: b.id, key: finalItemKey(subject, 'bank', b.id) });
    }).filter(Boolean);
    if (materials.length) toast('当前未加入期末材料，已直接从本科题库抽题组卷');
  }
  if (!materials.length) {
    toast('当前科目没有可用题目，请检查章节筛选');
    return;
  }
  var duration = Number(fe.duration) || 120;
  var wanted = Math.max(3, Math.min(20, Math.round(duration / 10)));
  var n = Math.min(wanted, materials.length);
  var chosen = finalChoosePaperMaterials(materials, n, fe.papers.length * 3);
  var items = chosen.map(function (m) {
    return {
      key: m.key, subject: m.subject, type: m.type, refId: m.id, code: m.code,
      title: m.title, chapter: m.chapter, question: m.question, answer: m.answer,
      standardSolution: m.standardSolution || '', detailedAnalysis: m.detailedAnalysis || '',
      points: Array.isArray(m.points) ? m.points.slice() : [], pitfalls: Array.isArray(m.pitfalls) ? m.pitfalls.slice() : [],
      options: Array.isArray(m.options) ? m.options.slice() : [], correct: m.correct || '',
      questionType: m.questionType || 'subjective', difficulty: Number(m.stars) || 2,
      score: 0, subjectName: m.subjectName
    };
  });
  finalSmartScoreItems(items, 100);
  var p = {
    id: 'paper-' + Date.now().toString(36),
    subject: subject,
    title: subjectOf(subject).name + ' · 期末模拟卷 · ' + (fe.date || finalDateKey(new Date())) + (finalSelectedChapters(subject).length ? ' · ' + finalSelectedChapters(subject).join(' / ') : ''),
    duration: duration,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    items: items
  };
  fe.papers.unshift(p);
  ui.finalPaperId = p.id;
  markDirty();
  render();
  toast('已生成 ' + items.length + ' 题 · ' + duration + ' 分钟模拟卷');
}

function finalToggleTask(dateKey, done) {
  var fe = finalData();
  if (done) fe.done[dateKey] = true; else delete fe.done[dateKey];
  markDirty();
}

function finalSelectPaper(id) {
  ui.finalPaperId = id;
  render();
}
function finalPaperMaterialItem(m) {
  return {
    key: m.key, subject: m.subject, type: m.type, refId: m.id, code: m.code,
    title: m.title, chapter: m.chapter, question: m.question, answer: m.answer,
    standardSolution: m.standardSolution || '', detailedAnalysis: m.detailedAnalysis || '',
    points: Array.isArray(m.points) ? m.points.slice() : [], pitfalls: Array.isArray(m.pitfalls) ? m.pitfalls.slice() : [],
    options: Array.isArray(m.options) ? m.options.slice() : [], correct: m.correct || '',
    questionType: m.questionType || 'subjective', difficulty: Number(m.stars) || 2,
    score: 10, subjectName: m.subjectName
  };
}
function finalPaperImportMaterials(kind) {
  var subject = finalSubject();
  var sel = finalSelectedChapters(subject);
  var list = [];
  if (kind === 'entry') {
    list = entriesOf(subject).map(function (e) { return finalResolveItem({ type: 'entry', subject: subject, id: e.id, key: finalItemKey(subject, 'entry', e.id) }); });
  } else {
    list = bankOf(subject).map(function (b) { return finalResolveItem({ type: 'bank', subject: subject, id: b.id, key: finalItemKey(subject, 'bank', b.id) }); });
  }
  return list.filter(function (m) { return m && (!sel.length || sel.indexOf(m.chapter) >= 0); }).slice(0, 80);
}
function finalPaperImportHtml() {
  if (!ui.finalImportKind) return '';
  var kind = ui.finalImportKind;
  var list = finalPaperImportMaterials(kind);
  var p = finalActivePaper();
  var used = {};
  if (p) p.items.forEach(function (it) { used[it.key] = true; });
  return '<div class="final-import-mask" data-act="final-import-close"><section class="final-import-card"><header><b>' + (kind === 'entry' ? '从错题插入' : '从题库插入') + '</b><button class="icon-mini" data-act="final-import-close" type="button" aria-label="关闭">×</button></header><p class="faint">当前科目 · 当前章节筛选 · 共 ' + list.length + ' 题</p><div class="final-import-list">' + (list.length ? list.map(function (m) { return '<button class="final-import-row" data-act="final-import-add" data-kind="' + kind + '" data-id="' + attr(m.id) + '" type="button"' + (used[m.key] ? ' disabled' : '') + '><span class="fir-type">' + esc(m.questionType === 'choice' ? '客观' : m.questionType === 'fill' ? '填空' : '主观') + '</span><span class="fir-title">' + renderInline(m.title || '') + '</span><span class="fir-chapter">' + esc(m.chapter || '') + '</span><span class="fir-state">' + (used[m.key] ? '已在卷中' : '插入') + '</span></button>'; }).join('') : '<div class="final-empty"><b>没有可插入的题</b><p>换章节筛选，或先把题加入期末复习。</p></div>') + '</div></section></div>';
}
function finalPaperImportOpen(kind) { ui.finalImportKind = kind; render(); }
function finalPaperImportClose() { ui.finalImportKind = ''; render(); }
function finalPaperImportAdd(kind, id) {
  var p = finalActivePaper();
  if (!p) { toast('先创建一张模拟卷'); return; }
  var m = finalPaperImportMaterials(kind).filter(function (x) { return x.id === id; })[0];
  if (!m) { toast('题目不存在'); return; }
  if (p.items.some(function (x) { return x.key === m.key; })) { toast('这道题已经在卷子里'); return; }
  p.items.push(finalPaperMaterialItem(m));
  p.updatedAt = nowIso();
  markDirty();
  render();
  toast('已插入模拟卷');
}
function finalDeletePaper() {
  var fe = finalData();
  var p = finalActivePaper();
  if (!p) return;
  if (!window.confirm('只删除这份模拟卷本身？错题、题库和期末材料里的原题都会保留，不会被删除。')) return;
  fe.papers = fe.papers.filter(function (x) { return x.id !== p.id; });
  ui.finalPaperId = fe.papers[0] ? fe.papers[0].id : '';
  markDirty();
  render();
  toast('模拟卷已删除；错题和题库原题保留');
}
function finalRemovePaperItem(index) {
  var p = finalActivePaper();
  if (!p || !p.items[index]) return;
  p.items.splice(index, 1);
  p.updatedAt = nowIso();
  markDirty();
  render();
}
function finalMovePaperItem(index, dir) {
  var p = finalActivePaper();
  if (!p) return;
  var j = index + dir;
  if (j < 0 || j >= p.items.length) return;
  var tmp = p.items[index];
  p.items[index] = p.items[j];
  p.items[j] = tmp;
  p.updatedAt = nowIso();
  markDirty();
  render();
}
function finalAddPaperItem() {
  var p = finalActivePaper();
  if (!p) return;
  var used = {};
  p.items.forEach(function (it) { used[it.key] = true; });
  var next = finalMaterialsForChapters(finalSubject()).filter(function (m) { return !used[m.key]; })[0];
  if (!next) { toast('材料里的题都已经在卷子里了'); return; }
  p.items.push({
    key: next.key, subject: next.subject, type: next.type, refId: next.id, code: next.code,
    title: next.title, chapter: next.chapter, question: next.question, answer: next.answer,
    score: 10, subjectName: next.subjectName
  });
  p.updatedAt = nowIso();
  markDirty();
  render();
}
function finalSavePaper() {
  var p = finalActivePaper();
  if (!p) return;
  p.updatedAt = nowIso();
  markDirty();
  render();
  toast('模拟卷已保存');
}

function finalPaperChipsHtml() {
  var fe = finalData();
  var subject = finalSubject();
  var papers = fe.papers.filter(function (p) { return (p.subject || (p.items && p.items[0] && p.items[0].subject) || subject) === subject; });
  if (!papers.length) return '';
  var active = finalActivePaper();
  var sel = finalPaperSelectionMap();
  var selectedHere = papers.filter(function (p) { return !!sel[p.id]; }).length;
  return '<div class="final-paper-bulk"><label class="final-check"><input type="checkbox" id="finalPaperSelectAll"' + (papers.length && selectedHere === papers.length ? ' checked' : '') + '><span>全选本页</span></label><span class="final-bulk-count">已选 ' + selectedHere + ' / ' + papers.length + '</span><button class="btn btn-xs btn-danger" data-act="final-delete-selected-papers" type="button"' + (selectedHere ? '' : ' disabled') + '>删除选中</button></div>' +
    '<div class="final-paper-chips">' + papers.map(function (p) {
    return '<div class="final-paper-chip-row"><label class="final-check final-check-icon" title="选择这张卷"><input type="checkbox" data-paper-select="' + attr(p.id) + '"' + (sel[p.id] ? ' checked' : '') + '><span class="sr-only">选择 ' + esc(p.title) + '</span></label><button class="final-paper-chip' + (active && p.id === active.id ? ' is-on' : '') + '" data-act="final-select-paper" data-id="' + attr(p.id) + '" type="button">' + esc(p.title) + '<small>' + finalPaperScoreText(p) + '</small></button></div>';
  }).join('') + '</div>';
}
function finalPaperSelectionMap() {
  if (!ui.finalPaperSelected || typeof ui.finalPaperSelected !== 'object') ui.finalPaperSelected = {};
  return ui.finalPaperSelected;
}
function finalPaperToggleSelect(id, on) {
  var sel = finalPaperSelectionMap();
  if (on) sel[id] = true; else delete sel[id];
  render();
}
function finalPaperToggleAll(on) {
  var subject = finalSubject();
  finalData().papers.filter(function (p) { return (p.subject || (p.items && p.items[0] && p.items[0].subject) || subject) === subject; }).forEach(function (p) {
    var sel = finalPaperSelectionMap();
    if (on) sel[p.id] = true; else delete sel[p.id];
  });
  render();
}
function finalDeleteSelectedPapers() {
  var sel = finalPaperSelectionMap();
  var ids = Object.keys(sel);
  if (!ids.length) { toast('先选择要删除的模拟卷'); return; }
  if (!window.confirm('删除选中的 ' + ids.length + ' 张模拟卷？只会删除模拟卷本身，错题和题库中的原题会保留。此操作不能撤销。')) return;
  var fe = finalData();
  fe.papers = fe.papers.filter(function (p) { return !sel[p.id]; });
  ui.finalPaperSelected = {};
  if (!fe.papers.some(function (p) { return p.id === ui.finalPaperId; })) ui.finalPaperId = fe.papers[0] ? fe.papers[0].id : '';
  markDirty();
  render();
  toast('已删除 ' + ids.length + ' 张模拟卷；错题和题库原题保留');
}

function finalPaperItemHtml(it, i, p) {
  return '<article class="final-paper-item" data-index="' + i + '">' +
    '<div class="fpi-head"><span class="fpi-num">' + pad(i + 1, 2) + '</span><span class="fpi-code">' + esc(it.code || '') + '</span><span class="fpi-meta">' + esc(it.subjectName || '') + ' · ' + esc(it.chapter || '') + '</span>' +
    '<label class="fpi-score">分值 <input type="number" min="0" max="100" step="0.5" value="' + attr(it.score) + '" data-paper-item="' + i + ':score"></label>' +
    '<span class="fpi-tools"><button class="icon-mini" data-act="final-move-paper-item" data-index="' + i + '" data-dir="-1" type="button" aria-label="上移">↑</button><button class="icon-mini" data-act="final-move-paper-item" data-index="' + i + '" data-dir="1" type="button" aria-label="下移">↓</button><button class="icon-mini" data-act="final-remove-paper-item" data-index="' + i + '" type="button" aria-label="从本卷移除（不删除原题）" title="从本卷移除，不删除错题或题库原题">×</button></span></div>' +
    '<label class="fpi-label">题目</label><textarea class="fpi-text" data-paper-item="' + i + ':question" rows="3">' + esc(it.question || '') + '</textarea><div class="fpi-preview md" data-paper-preview="' + i + ':question">' + renderMarkdown(stripTypePrefix(it.question || '')) + '</div>' +
    '<label class="fpi-label">答案 / 解析</label><textarea class="fpi-text fpi-answer" data-paper-item="' + i + ':answer" rows="2">' + esc(it.answer || '') + '</textarea><div class="fpi-preview md" data-paper-preview="' + i + ':answer">' + renderMarkdown(it.answer || '') + '</div>' +
  '</article>';
}

function finalPaperSmartScores() {
  var p = finalActivePaper();
  if (!p) return;
  finalSmartScoreItems(p.items, 100);
  p.updatedAt = nowIso();
  markDirty(); render();
  toast('已按题型重新分配分值');
}

function finalPaperEditorHtml(p) {
  if (!p) return '';
  return '<div class="final-editor">' +
    '<div class="final-editor-head"><label class="fpi-label">卷名 <input class="input" data-paper-field="title" value="' + attr(p.title) + '"></label>' +
      '<label class="fpi-label">时长 <input class="input input-num" type="number" min="15" max="300" step="5" data-paper-field="duration" value="' + attr(p.duration) + '"> 分钟</label>' +
      '<span class="final-editor-meta">' + finalPaperScoreText(p) + '</span>' +
      '<span class="final-editor-actions"><button class="btn btn-xs" data-act="final-save-paper" type="button">保存</button><button class="btn btn-xs" data-act="final-add-paper-item" type="button">补一题</button><button class="btn btn-xs" data-act="final-import-bank" type="button">从题库插入</button><button class="btn btn-xs" data-act="final-import-entry" type="button">从错题插入</button><button class="btn btn-xs" data-act="final-generate-paper" type="button">再生成</button><button class="btn btn-xs btn-danger" data-act="final-delete-paper" type="button">删除卷</button></span></div>' +
    '<div class="final-scorebar"><span>卷面总分 <b data-paper-score-total>' + Math.round((p.items || []).reduce(function (s, it) { return s + (Number(it.score) || 0); }, 0) * 10) / 10 + '</b> / 100 · 客观题单题建议不超过 7 分</span><button class="btn btn-xs" data-act="final-smart-scores" type="button">智能分配</button></div>' +
    '<div class="final-editor-tools"><button class="btn btn-xs" data-act="final-export-docx" type="button">导出 DOCX</button><button class="btn btn-xs" data-act="final-export-pdf" type="button">导出 PDF</button><span class="faint">可在下面直接修改题目、答案和分值；导出使用当前编辑内容。PDF 通过打印窗口另存。</span></div>' +
    '<div class="final-paper-items">' + p.items.map(function (it, i) { return finalPaperItemHtml(it, i, p); }).join('') + '</div>' +
  '</div>';
}

function finalPapersHtml() {
  var fe = finalData();
  var p = finalActivePaper();
  return '<div class="final-paper-head"><div><h2>我的模拟卷</h2><p>' + esc(subjectOf(finalSubject()).name) + ' · 按考试时长自动选题；一张卷只含一个科目，可自由编辑与导出。</p></div><div class="final-paper-head-actions"><button class="btn btn-primary" data-act="final-generate-paper" type="button">生成模拟卷</button></div></div>' +
    finalSubjectTabsHtml() + finalChapterFilterHtml(finalSubject()) +
    '<p class="final-paper-hint">模拟卷用于编辑、保存和导出；需要限时考试请切到「模拟考」。</p>' +
    finalPaperChipsHtml() + (p ? finalPaperEditorHtml(p) : '<div class="final-empty"><b>当前科目还没有模拟卷</b><p>先点「生成模拟卷」；也可以从错题或题库插入题目。</p></div>') + finalPaperImportHtml();
}

function finalSectionTabsHtml() {
  var section = ui.finalSection === 'exam' ? 'exam' : 'paper';
  return '<div class="final-section-tabs" role="tablist" aria-label="期末复习模块">' +
    '<button class="final-section-tab' + (section === 'paper' ? ' is-on' : '') + '" data-act="final-section" data-section="paper" role="tab" aria-selected="' + (section === 'paper') + '" type="button"><b>出模拟卷</b><span>选题、编辑、导出</span></button>' +
    '<button class="final-section-tab' + (section === 'exam' ? ' is-on' : '') + '" data-act="final-section" data-section="exam" role="tab" aria-selected="' + (section === 'exam') + '" type="button"><b>进行模拟考</b><span>限时、标准/AI 批改、历史</span></button>' +
  '</div>';
}

function finalExamStartPanelHtml() {
  return '<section class="final-panel card final-exam-entry"><div class="final-panel-head"><h2>期末模拟考</h2><span>限时 · 标准答案或 AI 批改</span></div>' +
    finalSubjectTabsHtml(false) +
    '<p class="final-paper-hint">先选章节，标准题库随机抽题或 AI 生成；确认考生守则后开始计时。一科一张卷，不混合科目。</p>' +
    '<div class="final-exam-start-actions"><button class="btn btn-primary" data-act="final-ai-exam" type="button">AI 出题开考</button><button class="btn" data-act="final-start-exam" type="button">标准题库开考</button></div>' +
    finalExamSummaryHtml() + finalExamHistoryHtml() + '</section>';
}

function viewFinal() {
  if (typeof finalExamView === 'function') { var ev = finalExamView(); if (ev) return ev; }
  var fe = finalData();
  var plan = finalPlanData();
  var count = plan.empty || plan.past ? '—' : String(plan.total);
  var countLabel = plan.empty ? '设定考试日期后开始' : (plan.past ? '日期已过，请修改' : '距离期末考试还有');
  var section = ui.finalSection === 'exam' ? 'exam' : 'paper';
  var setup = '<section class="final-setup card">' +
      '<div class="final-setup-fields"><label class="field"><span>期末考试日期</span><input class="input" type="date" data-final-field="date" value="' + attr(fe.date) + '"></label>' +
      '<label class="field"><span>考试时长（分钟）</span><input class="input" type="number" min="30" max="300" step="5" data-final-field="duration" value="' + attr(fe.duration) + '"></label>' +
      '<span class="final-setup-hint">改日期或时长后，计划和组卷题数会同步更新。</span></div>' +
      (plan.empty || plan.past
        ? '<div class="final-countdown is-empty"><span>' + esc(countLabel) + '</span></div>'
        : '<div class="final-countdown"><span>' + esc(countLabel) + '</span><b>' + esc(count) + '</b><em>天</em></div>') +
    '</section>';
  var body = section === 'exam' ? finalExamStartPanelHtml() :
    '<div class="final-grid">' +
      '<section class="final-panel card"><div class="final-panel-head"><h2>复习计划</h2><span>' + (plan.empty ? '等待日期' : (plan.past ? '日期无效' : plan.total + ' 天 · 3 阶段')) + '</span></div>' + finalPlanHtml() + '</section>' +
      '<section class="final-panel card"><div class="final-panel-head"><h2>复习材料</h2><span>' + finalMaterials().length + ' 题</span></div>' + finalMaterialsHtml() + '</section>' +
    '</div>' +
    '<section class="final-panel final-papers card">' + finalPapersHtml() + '</section>';
  return '<div class="final-page">' +
    '<div class="page-head final-page-head"><div class="final-head-main"><p class="eyebrow">FINAL REVIEW / 复习与模拟卷</p><h1 class="page-title">期末复习</h1><p class="page-sub">先定考试日期和时长，再安排复习节奏；把错题和题库题加入材料，生成可编辑、可导出的模拟卷，或进入限时模拟考。</p></div><div class="final-head-side"><div class="page-actions"><a class="btn" href="#/' + attr(state.activeSubject) + '/entries">挑错题</a><a class="btn" href="#/' + attr(state.activeSubject) + '/bank">挑题库题</a></div></div></div>' +
    subjectJumpHtml('final') + finalSectionTabsHtml() + setup + body +
    (ui.finalAiChaptersOpen && typeof finalExamChapterHtml === 'function' ? finalExamChapterHtml() : '') +
    (ui.examRulesOpen && typeof finalExamRulesHtml === 'function' ? finalExamRulesHtml() : '') +
  '</div>';
}

/* ---------- DOCX ---------- */
function finalXmlEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function finalDocxRuns(text) {
  return String(text == null ? '' : text).split('\n').map(function (line, i) {
    return (i ? '<w:br/>' : '') + '<w:t xml:space="preserve">' + finalXmlEsc(line) + '</w:t>';
  }).join('');
}
function finalDocxSup(ch){var m={"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","+":"⁺","-":"⁻","=":"⁼","(":"⁽",")":"⁾","n":"ⁿ","i":"ⁱ"};return m[ch]||"";}
function finalDocxSub(ch){var m={"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","+":"₊","-":"₋","=":"₌","(":"₍",")":"₎","a":"ₐ","e":"ₑ","i":"ᵢ","j":"ⱼ","n":"ₙ","o":"ₒ","p":"ₚ","r":"ᵣ","s":"ₛ","t":"ₜ","u":"ᵤ","v":"ᵥ","x":"ₓ"};return m[ch]||"";}
function finalDocxLatexToText(x){
 var s=String(x||"");
 s=s.replace(/\\boldsymbol\s*\{([^{}]*)\}/g,function(_,v){return v+"\u20D7";}).replace(/\\boldsymbol\s*([A-Za-z])/g,function(_,v){return v+"\u20D7";});
 s=s.replace(/\\vec\s*\{([^{}]*)\}/g,function(_,v){return v+"\u20D7";}).replace(/\\vec\s*([A-Za-z])/g,function(_,v){return v+"\u20D7";}).replace(/\\overrightarrow\s*\{([^{}]*)\}/g,function(_,v){return v+"\u20D7";}).replace(/\\overrightarrow\s*([A-Za-z])/g,function(_,v){return v+"\u20D7";}).replace(/\\bar\s*\{([^{}]*)\}/g,function(_,v){return v+"\u0304";});
 s=s.replace(/\\begin\{(p|b|v)matrix\}([\s\S]*?)\\end\{\1matrix\}/g,function(_,t,b){var rows=String(b).split(/\\\\/).map(function(r){return r.split("&").map(function(c){return c.trim();}).join("  ");});var inner=rows.join(" ; ");return t==="v"?"|"+inner+"|":t==="b"?"["+inner+"]":"("+inner+")";});
 s=s.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g,function(_,b){return "{ "+String(b).split(/\\\\/).map(function(r){return r.trim();}).join(" ; ")+" }";});
 s=s.replace(/\\dots|\\ldots/g,"…").replace(/\\cdots/g,"⋯").replace(/\\vdots/g,"⋮").replace(/\\ddots/g,"⋱");
 s=s.replace(/\\(?:quad|qquad|,|;|!|:)/g," ").replace(/\\(?:bigl|bigr|Bigl|Bigr|biggl|biggr|left|right)\.?/g,"");
 s=s.replace(/\\parallel/g,"∥").replace(/\\perp/g,"⊥").replace(/\\cong/g,"≅").replace(/\\sim/g,"∼").replace(/\\oplus/g,"⊕").replace(/\\otimes/g,"⊗").replace(/\\subseteq/g,"⊆").replace(/\\supseteq/g,"⊇").replace(/\\supset/g,"⊃");
 s=s.replace(/\\(?:mathbb|mathbf|mathrm|mathcal|text|operatorname)\s+([A-Za-z])/g,"$1"); s=s.replace(/\\begin\{[^}]+\}(?:\{[^{}]*\})?/g,"").replace(/\\end\{[^}]+\}/g,"");
 s=s.replace(/\\(?:dfrac|frac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,function(_,a,b){var clean=function(v){return String(v).replace(/^\s*\(([^{}]*)\)\s*$/,'$1').trim();};var na=clean(a),db=clean(b);if(/^[-+]?\d+$/.test(na) && /^[-+]?\d+$/.test(db)) return na + '/' + db; if(/^[-+]?[A-Za-z0-9]+$/.test(na) && /^[-+]?[A-Za-z0-9]+$/.test(db)) return na + '/' + db; return '(' + na + ')/(' + db + ')';});
 s=s.replace(/\\sqrt\s*\{([^{}]*)\}/g,"√($1)").replace(/\\sqrt\s*([A-Za-z0-9])/g,"√$1");
 s=s.replace(/\\(?:mathbb|mathbf|mathrm|text|operatorname)\s*\{([^{}]*)\}/g,"$1");
 s=s.replace(/\\left|\\right|\\displaystyle|\\limits/g,"");
 s=s.replace(/\\(lambda|alpha|beta|gamma|delta|theta|pi|sigma|omega|mu|nu|phi|psi|rho|tau|epsilon|varepsilon|infty|partial|nabla|sum|prod|int|pm|mp|times|cdot|div|le|leq|ge|geq|neq|ne|to|rightarrow|Rightarrow|in|notin|subset|cup|cap|forall|exists)/g,function(_,n){var m={lambda:"λ",alpha:"α",beta:"β",gamma:"γ",delta:"δ",theta:"θ",pi:"π",sigma:"σ",omega:"ω",mu:"μ",nu:"ν",phi:"φ",psi:"ψ",rho:"ρ",tau:"τ",epsilon:"ε",varepsilon:"ε",nmid:"∤",mid:"∣",ne:"≠",infty:"∞",partial:"∂",nabla:"∇",sum:"Σ",prod:"Π",int:"∫",pm:"±",mp:"∓",times:"×",cdot:"·",div:"÷",le:"≤",leq:"≤",ge:"≥",geq:"≥",neq:"≠",to:"→",rightarrow:"→",Rightarrow:"⇒",in:"∈",notin:"∉",subset:"⊂",cup:"∪",cap:"∩",forall:"∀",exists:"∃"};return m[n]||n;});
 s=s.replace(/\\[,;:!]/g," ").replace(/\\/g," ");
 s=s.replace(/\^\{\*\}/g,"*").replace(/\^\*/g,"*");
 s=s.replace(/\^\{([^{}]+)\}/g,function(_,v){var o="";for(var i=0;i<v.length;i++)o+=finalDocxSup(v.charAt(i));return o||("^("+v+")");});
 s=s.replace(/\^([A-Za-z0-9+\-=()])/g,function(_,v){return finalDocxSup(v)||("^"+v);});
 s=s.replace(/_\{([^{}]+)\}/g,function(_,v){var o="";for(var i=0;i<v.length;i++)o+=finalDocxSub(v.charAt(i));return o||("_("+v+")");});
 s=s.replace(/_([A-Za-z0-9+\-=()])/g,function(_,v){return finalDocxSub(v)||("_"+v);});
 s=s.replace(/[{}]/g,"").replace(/\$/g,"").replace(/&/g," ");
 return s;
}
function finalDocxNormalizeText(x) {
  var s = String(x || '');
  // AI/JSON 有时把换行保存成字面量 \n；导出前统一还原，且避开 \nabla、\notin 等 LaTeX 命令。
  s = s.replace(/\\+n(?![A-Za-z])/g, '\n').replace(/\\+r(?![A-Za-z])/g, '\n').replace(/\r\n?/g, '\n');
  return s;
}
function finalDocxMathText(x){
  var raw=finalDocxNormalizeText(x);
  // Matrix/cases must survive to finalDocxPara, where they become native OMML.
  if (/\\begin\{((?:p|b|v|V)?matrix|cases)\}/.test(raw)) return raw.replace(/\*\*([^*]+)\*\*/g,'$1').replace(/__([^_]+)__/g,'$1');
  var s=raw.replace(/\\\$(?=[A-Za-z])/g,"\\");
  s=mathifyPlainText(s);s=s.replace(/\$\$([\s\S]+?)\$\$/g,function(_,v){return finalDocxLatexToText(v);});s=s.replace(/\$([^$]+)\$/g,function(_,v){return finalDocxLatexToText(v);});s=s.replace(/\*\*([^*]+)\*\*/g,"$1").replace(/__([^_]+)__/g,"$1");if(/\\|\$/.test(s)){s=finalDocxLatexToText(s).replace(/\$/g,"").replace(/\\/g,"");}s=s.replace(/\s+nmid\s+/g,' ∤ ').replace(/\s+mid\s+/g,' ∣ ');
  return s;}
function finalDocxCellText(v) {
  return finalDocxLatexToText(String(v == null ? '' : v)).replace(/[&{}]/g, ' ').replace(/\s+/g, ' ').trim();
}
function finalDocxMathRun(v) {
  return '<m:r><m:t xml:space="preserve">' + finalXmlEsc(v) + '</m:t></m:r>';
}
function finalDocxMatrixOmml(kind, body) {
  var rows = String(body || '').split(/\\\\/).map(function (row) {
    return row.replace(/^\s*\[[^\]]*\]/, '').replace(/\\hline/g, '').trim();
  }).filter(function (row, i, arr) { return row || i < arr.length - 1; });
  var grid = rows.map(function (row) {
    return row.split('&').map(finalDocxCellText);
  });
  var cols = Math.max.apply(null, [1].concat(grid.map(function (r) { return r.length; })));
  var mcs = '';
  for (var c = 0; c < cols; c++) mcs += '<m:mc><m:mcPr><m:count m:val="1"/><m:mcJc m:val="center"/></m:mcPr></m:mc>';
  var matrix = '<m:m><m:mPr><m:mcs>' + mcs + '</m:mcs></m:mPr>' + grid.map(function (row) {
    var cells = '';
    for (var j = 0; j < cols; j++) cells += '<m:e>' + (row[j] ? finalDocxMathRun(row[j]) : '<m:r><m:t></m:t></m:r>') + '</m:e>';
    return '<m:mr>' + cells + '</m:mr>';
  }).join('') + '</m:m>';
  if (kind === 'matrix') return matrix;
  var beg = kind === 'pmatrix' ? '(' : kind === 'bmatrix' ? '[' : kind === 'vmatrix' ? '|' : kind === 'Vmatrix' ? '‖' : '{';
  var end = kind === 'pmatrix' ? ')' : kind === 'bmatrix' ? ']' : kind === 'vmatrix' ? '|' : kind === 'Vmatrix' ? '‖' : '';
  return '<m:d><m:dPr><m:begChr m:val="' + finalXmlEsc(beg) + '"/><m:endChr m:val="' + finalXmlEsc(end) + '"/></m:dPr><m:e>' + matrix + '</m:e></m:d>';
}
function finalDocxLatexMathOmml(latex) {
  var s = String(latex || '');
  var re = /\\begin\{((?:p|b|v|V)?matrix|cases)\}([\s\S]*?)\\end\{\1\}/g;
  var out = '', pos = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > pos) out += finalDocxMathRun(finalDocxLatexToText(s.slice(pos, m.index)));
    out += finalDocxMatrixOmml(m[1], m[2]);
    pos = re.lastIndex;
  }
  if (pos < s.length) out += finalDocxMathRun(finalDocxLatexToText(s.slice(pos)));
  return '<m:oMath>' + out + '</m:oMath>';
}
function finalDocxRichRuns(text, rPr) {
  var s = finalDocxNormalizeText(text);
  var re = /\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$|(\\begin\{((?:p|b|v|V)?matrix|cases)\}[\s\S]*?\\end\{\4\})/g;
  var out = '', pos = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > pos) out += '<w:r><w:rPr>' + rPr + '</w:rPr>' + finalDocxRuns(finalDocxLatexToText(s.slice(pos, m.index))) + '</w:r>';
    var math = m[1] != null ? m[1] : m[2] != null ? m[2] : m[3];
    if (math && /\\begin\{/.test(math)) out += finalDocxLatexMathOmml(math);
    else out += '<w:r><w:rPr>' + rPr + '</w:rPr>' + finalDocxRuns(finalDocxLatexToText(math || '')) + '</w:r>';
    pos = re.lastIndex;
  }
  if (pos < s.length) out += '<w:r><w:rPr>' + rPr + '</w:rPr>' + finalDocxRuns(finalDocxLatexToText(s.slice(pos))) + '</w:r>';
  return out;
}
function finalDocxPara(text, opts) {
  opts = opts || {};
  var rPr = (opts.bold ? '<w:b/>' : '') + (opts.size ? '<w:sz w:val="' + opts.size + '"/><w:szCs w:val="' + opts.size + '"/>' : '');
  var pPr = '<w:spacing' + (opts.before != null ? ' w:before="' + opts.before + '"' : '') + ' w:after="' + (opts.after == null ? 100 : opts.after) + '" w:line="' + (opts.line || 320) + '" w:lineRule="auto"/>' + (opts.indent ? '<w:ind w:left="' + opts.indent + '"' + (opts.hanging ? ' w:hanging="' + opts.hanging + '"' : '') + '/>' : '') + (opts.align ? '<w:jc w:val="' + opts.align + '"/>' : '');
  return '<w:p><w:pPr>' + pPr + '</w:pPr>' + finalDocxRichRuns(text, rPr) + '</w:p>';
}
function finalPaperDocxBlob(p) {
  var body = finalDocxPara(p.title, { bold: true, size: 32, align: 'center', after: 120 }) +
    finalDocxPara('考试时长：' + p.duration + ' 分钟　总分：100 分　题量：' + p.items.length + ' 题', { align: 'center', size: 20, after: 240 });
  p.items.forEach(function (it, i) {
    body += finalDocxPara((i + 1) + '．（' + it.score + ' 分）' + (it.title || ''), { bold: true, size: 23, after: 60 });
    body += finalDocxPara(it.question || '', { size: 21, after: 100 });
    body += finalDocxPara('答题区', { size: 18, after: 40 });
    body += finalDocxPara(' ', { size: 21, after: 200 });
  });
  body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  body += finalDocxPara('参考答案', { bold: true, size: 28, align: 'center', after: 180 });
  p.items.forEach(function (it, i) {
    body += finalDocxPara((i + 1) + '．' + (it.answer || '暂无答案'), { size: 21, after: 120 });
  });
  var documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><w:body>' + body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>';
  var stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="SimSun" w:eastAsia="SimSun" w:hAnsi="SimSun"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>';
  var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
  var rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  var docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
  var blob = finalZip([
    { name: '[Content_Types].xml', data: contentTypes },
    { name: '_rels/.rels', data: rootRels },
    { name: 'word/document.xml', data: documentXml },
    { name: 'word/styles.xml', data: stylesXml },
    { name: 'word/_rels/document.xml.rels', data: docRels }
  ]);
  return new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

function finalCrc32(bytes) {
  var table = finalCrc32.table;
  if (!table) {
    table = finalCrc32.table = [];
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
  }
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < bytes.length; i++) crc = table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function finalZip(files) {
  var enc = new TextEncoder();
  var local = [];
  var central = [];
  var offset = 0;
  files.forEach(function (f) {
    var name = enc.encode(f.name);
    var data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    var crc = finalCrc32(data);
    var lh = new Uint8Array(30 + name.length);
    var dv = new DataView(lh.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0x0800, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true);
    dv.setUint32(22, data.length, true);
    dv.setUint16(26, name.length, true);
    lh.set(name, 30);
    local.push(lh, data);
    var ch = new Uint8Array(46 + name.length);
    var cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    ch.set(name, 46);
    central.push(ch);
    offset += lh.length + data.length;
  });
  var centralSize = central.reduce(function (s, x) { return s + x.length; }, 0);
  var eocd = new Uint8Array(22);
  var ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  var parts = local.concat(central, [eocd]);
  var total = parts.reduce(function (s, x) { return s + x.length; }, 0);
  var out = new Uint8Array(total);
  var pos = 0;
  parts.forEach(function (x) { out.set(x, pos); pos += x.length; });
  return out;
}

function finalDownload(blob, name) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function finalSafeName(s) { return String(s || '期末模拟卷').replace(/[\\/:*?"<>|]/g, '').slice(0, 60); }
function finalExportDocx(paper) {
  var p = paper || finalActivePaper();
  if (!p) { toast('先生成一份模拟卷'); return; }
  finalDownload(finalPaperDocxBlob(p), finalSafeName(p.title) + '.docx');
  toast('DOCX 已导出');
}
/* ---------- inputs ---------- */
var finalSaveTimer = null;
function finalSaveSoon() {
  if (finalSaveTimer) clearTimeout(finalSaveTimer);
  finalSaveTimer = setTimeout(function () { finalSaveTimer = null; markDirty(); }, 300);
}
function finalUpdatePaperField(el) {
  var p = finalActivePaper();
  if (!p) return;
  var f = el.getAttribute('data-paper-field');
  if (f === 'title') p.title = el.value;
  if (f === 'duration') p.duration = Math.max(15, Math.min(300, Number(el.value) || 120));
  if (f === 'brief') p.brief = String(el.value || '');
  p.updatedAt = nowIso();
  finalSaveSoon();
}
function finalUpdatePaperItem(el) {
  var p = finalActivePaper();
  if (!p) return;
  var parts = String(el.getAttribute('data-paper-item') || '').split(':');
  var i = Number(parts[0]);
  var field = parts[1];
  var it = p.items[i];
  if (!it) return;
  if (field === 'score') it.score = Math.max(0, Math.round((Number(el.value) || 0) * 2) / 2);
  else if (field === 'question') { it.question = el.value; it.__exportOptions = null; it.__exportQuestion = null; }
  else if (field === 'answer') it.answer = el.value;
  else if (field === 'standardSolution') it.standardSolution = el.value;
  else if (field === 'detailedAnalysis') it.detailedAnalysis = el.value;
  else if (field === 'points') it.points = String(el.value || '').split(/[\n；;]/).map(function (x) { return x.trim(); }).filter(Boolean);
  else if (field === 'pitfalls') it.pitfalls = String(el.value || '').split(/[\n；;]/).map(function (x) { return x.trim(); }).filter(Boolean);
  if (it.__exportOptions) { it.__exportOptions = null; it.__exportQuestion = null; }
  p.updatedAt = nowIso();
  var meta = document.querySelector('.final-editor-meta');
  if (meta) meta.textContent = finalPaperScoreText(p);
  var scoreTotal = document.querySelector('[data-paper-score-total]');
  if (scoreTotal) scoreTotal.textContent = Math.round((p.items || []).reduce(function (sum, item) { return sum + (Number(item.score) || 0); }, 0) * 10) / 10;
  var preview = qs('[data-paper-preview="' + i + ':' + field + '"]');
  if (preview && (field === 'question' || field === 'answer')) preview.innerHTML = renderMarkdown(el.value || '');
  if (field === 'points' || field === 'pitfalls') {
    var pv = qs('[data-paper-preview="' + i + ':' + field + '"]');
    if (pv) pv.innerHTML = renderMarkdown(String(el.value || '').split(/[\n；;]/).map(function (x) { return '- ' + x.trim(); }).filter(function (x) { return x !== '- '; }).join('\n'));
  }
  finalSaveSoon();
}

document.addEventListener('input', function (e) {
  var t = e.target;
  if (!t || !t.getAttribute) return;
  if (t.getAttribute('data-paper-field')) finalUpdatePaperField(t);
  else if (t.getAttribute('data-paper-item')) finalUpdatePaperItem(t);
});
document.addEventListener('change', function (e) {
  var t = e.target;
  if (!t || !t.getAttribute) return;
  if (t.id === 'finalPaperSelectAll') { finalPaperToggleAll(!!t.checked); return; }
  if (t.getAttribute('data-paper-select')) { finalPaperToggleSelect(t.getAttribute('data-paper-select'), !!t.checked); return; }
  if (t.getAttribute('data-final-task')) {
    finalToggleTask(t.getAttribute('data-final-task'), !!t.checked);
    var day = t.closest ? t.closest('.final-day') : null;
    if (day) day.classList.toggle('is-done', !!t.checked);
  } else if (t.getAttribute('data-final-field') === 'date') {
    var fe = finalData();
    fe.date = t.value;
    markDirty();
    render();
  } else if (t.getAttribute('data-final-field') === 'duration') {
    var fd = finalData();
    fd.duration = Number(t.value) || 120;
    markDirty();
    render();
  }
});
