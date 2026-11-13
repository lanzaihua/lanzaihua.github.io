/* =========================================================
   16-stats — 统计中心（真实数据，不编造）
   ========================================================= */
function statsAllEntries() {
  var rows = [];
  SUBJECTS.forEach(function (s) {
    entriesOf(s.id).forEach(function (e) { rows.push({ subject: s, entry: e }); });
  });
  return rows;
}

function statsActivitySeries(days) {
  days = Math.max(7, Number(days) || 14);
  var buckets = {};
  var now = new Date();
  var start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  for (var i = 0; i < days; i++) {
    var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    var key = localDayKey(d);
    buckets[key] = { key: key, date: d, reviews: 0, updates: 0 };
  }
  statsAllEntries().forEach(function (row) {
    var e = row.entry || {};
    var at = e.reviewAt && typeof e.reviewAt === 'object' ? e.reviewAt : null;
    if (at) {
      Object.keys(at).forEach(function (k) {
        var d = new Date(at[k]);
        if (isNaN(d.getTime())) return;
        var key = localDayKey(d);
        if (buckets[key]) buckets[key].reviews++;
      });
    }
    var u = new Date(e.updatedAt || e.date || '');
    if (!isNaN(u.getTime())) {
      var uk = localDayKey(u);
      if (buckets[uk]) buckets[uk].updates++;
    }
  });
  var list = Object.keys(buckets).map(function (k) { return buckets[k]; }).sort(function (a, b) { return a.key.localeCompare(b.key); });
  var peak = 0;
  var totalReviews = 0;
  var totalUpdates = 0;
  list.forEach(function (x) {
    x.total = x.reviews + x.updates;
    x.label = (x.date.getMonth() + 1) + ' 月 ' + x.date.getDate() + ' 日';
    x.short = (x.date.getMonth() + 1) + '/' + x.date.getDate();
    x.weekday = ['日', '一', '二', '三', '四', '五', '六'][x.date.getDay()];
    peak = Math.max(peak, x.total);
    totalReviews += x.reviews;
    totalUpdates += x.updates;
  });
  return { days: list, peak: Math.max(1, peak), totalReviews: totalReviews, totalUpdates: totalUpdates };
}

function statsSubjectRows() {
  return SUBJECTS.map(function (s) {
    var st = statsFor(s.id);
    return { subject: s, st: st };
  });
}

function statsTotals(rows) {
  var out = { total: 0, mastered: 0, unmastered: 0, bank: 0, templates: 0, notes: 0, reviews30: 0 };
  rows.forEach(function (r) {
    out.total += r.st.total;
    out.mastered += r.st.mastered;
    out.unmastered += r.st.unmastered;
    out.bank += r.st.bank;
    out.templates += r.st.templates;
    out.notes += r.st.notes || 0;
  });
  out.pct = out.total ? Math.round((out.mastered / out.total) * 100) : 0;
  var since = Date.now() - 30 * 86400000;
  statsAllEntries().forEach(function (row) {
    var at = row.entry && row.entry.reviewAt;
    if (!at || typeof at !== 'object') return;
    Object.keys(at).forEach(function (k) {
      var d = new Date(at[k]);
      if (!isNaN(d.getTime()) && d.getTime() >= since) out.reviews30++;
    });
  });
  return out;
}

function statsErrorTotals() {
  var counts = {};
  ERROR_TYPES.forEach(function (t) { counts[t] = 0; });
  statsAllEntries().forEach(function (row) {
    (row.entry.errorTypes || []).forEach(function (t) { if (counts[t] != null) counts[t]++; });
  });
  return counts;
}

function statsChapterRows() {
  var map = {};
  statsAllEntries().forEach(function (row) {
    var e = row.entry || {};
    var key = (e.chapter || '未分章');
    if (!map[key]) map[key] = { chapter: key, subject: row.subject, total: 0, mastered: 0 };
    map[key].total++;
    if (e.status === 'mastered') map[key].mastered++;
  });
  return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) {
    return b.total - a.total || a.chapter.localeCompare(b.chapter);
  }).slice(0, 8);
}

function statsExamRows() {
  var list = (typeof finalData === 'function' ? (finalData().examHistory || []) : []).filter(function (m) {
    return m && m.status === 'submitted' && m.result;
  });
  return list.slice().sort(function (a, b) {
    return String(b.archivedAt || b.createdAt || b.startedAt || '').localeCompare(String(a.archivedAt || a.createdAt || a.startedAt || ''));
  }).slice(0, 6).map(function (m) {
    var sid = m.subject || (m.questions && m.questions[0] ? m.questions[0].subject : '');
    var subj = SUBJ_BY_ID[sid] || null;
    return {
      title: m.title || '标准题库模拟考',
      subject: subj ? subj.name : '四科',
      date: m.createdAt || m.startedAt || m.archivedAt || '',
      score: Math.round((Number(m.result && m.result.total) || 0) * 10) / 10,
      count: (m.questions || []).length
    };
  });
}

function statsTrendHtml(series) {
  var max = series.peak;
  var bars = series.days.map(function (d) {
    var h = d.total ? Math.max(6, Math.round((d.total / max) * 100)) : 2;
    var reviewH = d.total ? Math.round((d.reviews / d.total) * h) : 0;
    var updateH = Math.max(0, h - reviewH);
    var title = d.label + '：复习 ' + d.reviews + ' 次，更新 ' + d.updates + ' 条';
    return '<div class="stats-chart-col" title="' + attr(title) + '">' +
      '<div class="stats-chart-bar" style="height:' + h + '%">' +
        (reviewH ? '<i class="is-review" style="height:' + Math.round((reviewH / h) * 100) + '%"></i>' : '') +
        (updateH ? '<i class="is-update" style="height:' + Math.round((updateH / h) * 100) + '%"></i>' : '') +
      '</div>' +
      '<span class="stats-chart-label">' + esc(d.short) + '</span>' +
    '</div>';
  }).join('');
  var empty = series.totalReviews === 0 && series.totalUpdates === 0;
  if (empty) {
    return '<div class="stats-chart-empty"><div class="stats-chart-empty-line" aria-hidden="true"></div>' +
      '<div><b>近 14 天还没有学习记录</b><span>复习打卡或更新错题后，这里会显示每天的变化；先从题库挑一道，或打开一条错题复习。</span></div>' +
      '<div class="stats-chart-empty-actions"><button class="btn btn-xs" data-act="nav-view" data-view="bank" type="button">去题库</button><button class="btn btn-xs" data-act="nav-view" data-view="entries" type="button">看错题</button></div>' +
    '</div>';
  }
  return '<div class="stats-chart" role="img" aria-label="近 14 天学习记录，复习 ' + series.totalReviews + ' 次，条目更新 ' + series.totalUpdates + ' 条">' + bars + '</div>' +
    '<div class="stats-chart-foot"><span><i class="legend-dot is-review"></i>复习打卡 ' + series.totalReviews + ' 次</span><span><i class="legend-dot is-update"></i>条目更新 ' + series.totalUpdates + ' 条</span></div>';
}

function statsSubjectHtml(rows) {
  var max = 1;
  rows.forEach(function (r) { max = Math.max(max, r.st.total); });
  return '<div class="stats-subject-list">' + rows.map(function (r) {
    var st = r.st;
    var w = st.total ? Math.max(4, Math.round((st.total / max) * 100)) : 0;
    return '<a class="stats-subject-row" href="#/' + attr(subjectRouteId(r.subject.id)) + '/overview" style="--subj:var(--' + attr(r.subject.id) + ')">' +
      '<span class="stats-subject-name"><i class="subject-dot" aria-hidden="true"></i>' + esc(r.subject.name) + '</span>' +
      '<span class="stats-subject-track"><i style="width:' + w + '%"></i></span>' +
      '<span class="stats-subject-num">' + st.total + ' <small>错题</small></span>' +
      '<span class="stats-subject-meta">' + st.pct + '% 掌握 · ' + st.bank + ' 题库</span>' +
    '</a>';
  }).join('') + '</div>';
}

function statsErrorHtml(counts) {
  return errorBars({ errors: counts });
}

function statsChapterHtml(rows) {
  if (!rows.length) return emptyState('还没有章节数据', '录入第一道错题后，这里会按章节显示分布与掌握情况。', '<button class="btn" data-act="nav-view" data-view="bank" type="button">去题库挑一道</button>');
  var max = 1;
  rows.forEach(function (r) { max = Math.max(max, r.total); });
  return '<div class="stats-chapter-list">' + rows.map(function (r) {
    var pct = Math.round((r.mastered / r.total) * 100);
    return '<div class="stats-chapter-row">' +
      '<div class="stats-chapter-head"><b>' + esc(r.chapter) + '</b><span>' + r.total + ' 题 · 已掌握 ' + pct + '%</span></div>' +
      '<div class="stats-chapter-track"><i style="width:' + Math.max(4, Math.round((r.total / max) * 100)) + '%"></i><em style="width:' + pct + '%"></em></div>' +
    '</div>';
  }).join('') + '</div>';
}

function statsExamHtml(rows) {
  if (!rows.length) return emptyState('还没有交卷记录', '完成一次标准题库模拟考后，成绩会出现在这里；草稿和进行中的考试不计数。', '<button class="btn" data-act="nav-final" type="button">去期末复习</button>');
  return '<div class="stats-exam-list">' + rows.map(function (r) {
    return '<div class="stats-exam-row">' +
      '<div><b>' + esc(r.title) + '</b><span>' + esc(r.subject) + ' · ' + esc(formatDate(r.date)) + ' · ' + r.count + ' 题</span></div>' +
      '<em>' + r.score + '<small> / 100</small></em>' +
    '</div>';
  }).join('') + '</div>';
}

function viewStats() {
  var rows = statsSubjectRows();
  var totals = statsTotals(rows);
  var series = statsActivitySeries(14);
  var errors = statsErrorTotals();
  var chapters = statsChapterRows();
  var exams = statsExamRows();
  var examCount = (typeof finalData === 'function' ? (finalData().examHistory || []).filter(function (m) { return m && m.status === 'submitted'; }).length : 0);

  var hero = '<section class="folio-hero stats-hero">' +
    '<div class="folio-kicker"><span class="folio-rule" aria-hidden="true"></span>STUDY FOLIO · 统计中心</div>' +
    '<div class="stats-hero-grid">' +
      '<div class="stats-hero-copy">' +
        '<h1 class="folio-title">学习统计</h1>' +
        '<p class="folio-lede">把错题、复习、模拟考摊开看：哪些章节在反复出错，哪一科正在变稳，最近两周到底学了多少。数字只来自本机记录，不做估算。</p>' +
      '</div>' +
      '<div class="stats-hero-figure"><span class="stats-figure-num">' + totals.total + '</span><span class="stats-figure-label">累计错题</span><span class="stats-figure-sub">' + totals.mastered + ' 已掌握 · ' + totals.unmastered + ' 待复习</span></div>' +
    '</div>' +
  '</section>';

  var metrics = '<section class="stats-metrics" aria-label="学习总量">' +
    statCard(totals.bank, '题库总量', '') +
    statCard(totals.templates, '题型模板', '') +
    statCard(totals.reviews30, '近 30 天复习', 'mastered') +
    statCard(examCount, '已交模拟考', '') +
  '</section>';

  return hero + metrics +
    '<div class="stats-layout">' +
      '<section class="panel stats-panel stats-panel-wide"><div class="panel-head"><h2 class="panel-title">近 14 天学习记录</h2><span class="panel-sub">复习打卡 + 条目更新</span></div><div class="panel-body">' + statsTrendHtml(series) + '</div></section>' +
      '<section class="panel stats-panel"><div class="panel-head"><h2 class="panel-title">四科对比</h2><span class="panel-sub">错题量 / 掌握率</span></div><div class="panel-body">' + statsSubjectHtml(rows) + '</div></section>' +
      '<section class="panel stats-panel"><div class="panel-head"><h2 class="panel-title">错因分布</h2><span class="panel-sub">按条目标记统计</span></div><div class="panel-body">' + statsErrorHtml(errors) + '</div></section>' +
      '<section class="panel stats-panel"><div class="panel-head"><h2 class="panel-title">章节分布</h2><span class="panel-sub">错题最多的 8 章</span></div><div class="panel-body">' + statsChapterHtml(chapters) + '</div></section>' +
      '<section class="panel stats-panel stats-panel-wide"><div class="panel-head"><h2 class="panel-title">模拟考成绩</h2><span class="panel-sub">最近 6 次已交卷</span></div><div class="panel-body">' + statsExamHtml(exams) + '</div></section>' +
    '</div>' +
    '<p class="stats-footnote">统计范围：本机 localStorage 中的错题、复习打卡、题库与模拟考记录。导出备份再导入不会重复计数。</p>';
}