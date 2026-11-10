/* =========================================================
   57-knowledge-search — 搜索框中的知识点解答与收藏
   ========================================================= */
function knowledgeTitleChineseFirst(text) {
  return String(text || '').replace(/^(#{2,6}[ \t]*)?([A-Za-z][^\n\/]*?)[ \t]*\/[ \t]*([\u4e00-\u9fa5][^\n]*?)[ \t]*$/gm, function (m, hashes, en, zh) {
    return (hashes || '') + zh + ' / ' + en;
  });
}

function knowledgeSearchActivateSubject(subject) {
  if (!subject || !SUBJ_BY_ID[subject]) return;
  if (ui.finalExamMode === 'exam' || ui.finalExamMode === 'grading') return;
  if (state.activeSubject === subject) return;
  state.activeSubject = subject;
  if (state.activeView === 'final' || state.activeView === 'notes') state.activeView = 'overview';
  if (typeof persistLocal === 'function') persistLocal();
  location.hash = '#/' + subjectRouteId(subject) + '/' + (state.activeView || 'overview');
}

function knowledgeSearchSubject(query) {
  var q = String(query || '');
  var hints = {
    gaodai: ['高代', '高等代数', '线性代数', '矩阵', '行列式', '多项式', '二次型', '特征值', '若尔当'],
    shufen: ['数分', '数学分析', '极限', '无穷小', '无穷大', '连续', '导数', '微分', '积分', '级数', '收敛', '中值', '泰勒', '洛必达', '偏导', '重积分', '曲线积分', '曲面积分', '柯西', 'ε'],
    jieji: ['解几', '解析几何', '向量', '平面', '空间直线', '法式方程', '法向量', '点面距离', '异面直线', '平面束', '柱面', '锥面', '旋转曲面', '椭球面', '双曲面', '抛物面', '二次曲面', '二次曲线', '主方向', '不变量'],
    xijing: ['西经', '西方经济学', '微观', '宏观', '弹性', '边际', '效用', '消费者', '需求', '供给', 'GDP', '通胀', 'IS-LM', '索洛']
  };
  var best = { id: state.activeSubject || 'gaodai', score: 0 };
  Object.keys(hints).forEach(function (id) {
    var score = 0;
    hints[id].forEach(function (k) { if (q.indexOf(k) >= 0) score += k.length; });
    if (score > best.score) best = { id: id, score: score };
  });
  return best.id;
}

function knowledgeSearchExcerpt(text, query) {
  var src = String(text || '');
  if (!src) return { title: '', text: '', noMatch: true };
  var q = String(query || '').trim();
  var cleaned = q.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '').replace(/[的与和及中在为把将关于]/g, ' ');
  var tokens = cleaned.match(/[\u4e00-\u9fa5]{2,}|[A-Za-z0-9]{2,}/g) || [];
  if (!tokens.length) tokens = [q];
  // 去掉“的”等助词后仍不命中时，补 2–4 字关键词，覆盖“平面的法式方程”这类自然说法。
  var extra = [];
  tokens.forEach(function (t) {
    if (t.length > 4) for (var n = 2; n <= 4 && n < t.length; n++) extra.push(t.slice(0, n));
  });
  tokens = tokens.concat(extra);
  var lines = src.split(/\n/);
  var section = '';
  var units = [];
  var buf = [];
  function flush() {
    var t = buf.join('\n').trim();
    if (t) units.push({ text: t, section: section });
    buf = [];
  }
  lines.forEach(function (line) {
    if (/^##\s*/.test(line)) {
      flush(); section = line.replace(/^##\s*/, '').trim(); return;
    }
    if (/^#{3,4}\s*/.test(line)) { flush(); buf.push(line); return; }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+[.、]\s+/.test(line)) {
      flush(); buf.push(line); return;
    }
    if (!line.trim()) { flush(); return; }
    buf.push(line);
  });
  flush();
  var best = null, bestScore = 0;
  units.forEach(function (u, index) {
    var text = u.text;
    var exact = 0, pos = -1;
    while ((pos = text.indexOf(q, pos + 1)) >= 0) exact++;
    var score = exact * 120;
    if (exact && text.indexOf('**' + q) >= 0 && text.indexOf('**' + q) < 14) score += 180;
    var head = text.replace(/^\s*[-*]\s*/, '');
    if (head.indexOf('**' + q) === 0) {
      var afterTerm = head.slice(('**' + q).length);
      if (/^([（(：:]|\*\*)/.test(afterTerm)) score += 260;
    }
    if (exact && /Key Concepts|核心概念/i.test(u.section)) score += 60;
    if (exact && /定理/.test(text) && !/定义|概念/.test(text)) score -= 25;
    tokens.forEach(function (t) {
      var p = -1, hits = 0;
      while ((p = text.indexOf(t, p + 1)) >= 0 && hits < 8) hits++;
      score += hits * 16;
    });
    if (u.section && tokens.some(function (t) { return u.section.indexOf(t) >= 0; })) score += 20;
    if (/定义|定理|性质|概念|关键点|公式/.test(text)) score += 12;
    if (/课堂重点|例题|习题|索引|目录|速查表|Topic Index|Chapter Index|Solutions Index|Reference Tables|Mental Models|Anti-patterns|Key Takeaways|Connects To|Worked Example|解题套路|Scope|Limits|边界|使用说明/i.test(u.section)) return;
    if (score > bestScore) { bestScore = score; best = { unit: u, index: index }; }
  });
  if (!best || bestScore < 18) {
    return { title: '', text: '', noMatch: true };
  }
  var parent = best.unit.section || '';
  // 优先返回“匹配点所在的完整小节”，而不是只给两段摘要。
  var sectionLines = [];
  var inSection = false;
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li];
    var heading = line.match(/^##\s*(.+)$/);
    if (heading) {
      if (inSection) break;
      if (heading[1].trim() === parent) { inSection = true; sectionLines.push(line); }
      continue;
    }
    if (inSection) sectionLines.push(line);
  }
  var sectionText = sectionLines.join('\n').trim();
  if (sectionText.length < 80) sectionText = [best.unit.text].concat(units.slice(best.index + 1, best.index + 5).map(function (u) { return u.text; })).join('\n\n');
  // 1) 短小节补入同章后续 3 个知识小节。
  if (sectionText.length < 1600) {
    var sectionStart = -1;
    for (var sx = 0; sx < lines.length; sx++) {
      var sm = lines[sx].match(/^##\s*(.+)$/);
      if (sm && sm[1].trim() === parent) { sectionStart = sx; break; }
    }
    if (sectionStart >= 0) {
      var extraLines = [];
      var extraCount = 0;
      for (var si = sectionStart + 1; si < lines.length; si++) {
        if (/^##\s+/.test(lines[si])) {
          extraCount++;
          if (extraCount > 3) break;
          extraLines.push('');
        }
        extraLines.push(lines[si]);
      }
      var extraText = extraLines.join('\n').trim();
      if (extraText) sectionText += '\n\n' + extraText;
    }
  }
  // 2) 补一段同章例题/解题套路，避免只有概念没有例题。
  var exampleLines = [];
  var inExample = false;
  for (var ei = 0; ei < lines.length; ei++) {
    var ehead = lines[ei].match(/^##\s+(.+)$/);
    if (ehead) {
      if (inExample) break;
      if (!sectionText.includes(ehead[1]) && /例题|典型|Example|Worked|解题|题型|应用/.test(ehead[1])) { inExample = true; exampleLines.push(lines[ei]); }
      continue;
    }
    if (inExample) exampleLines.push(lines[ei]);
  }
  var exampleText = exampleLines.join('\n').trim();
  if (exampleText.length > 120) sectionText += '\n\n' + exampleText.slice(0, 3600);
  if (sectionText.length > 11000) sectionText = sectionText.slice(0, 11000) + '\n\n（本节内容较长，先展示前 11000 字；可继续搜索更具体的小节。）';
  var textOut = sectionText;
  return { title: knowledgeTitleChineseFirst(parent), text: knowledgeTitleChineseFirst(textOut), noMatch: false };
}

function knowledgeSearchQuestionTerms(query) {
  var q = String(query || '').trim().toLowerCase();
  var cleaned = q.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, ' ');
  var tokens = cleaned.match(/[\u4e00-\u9fa5]{2,}|[A-Za-z0-9]{2,}/g) || [];
  return { q: q, tokens: tokens };
}

function knowledgeSearchQuestionText(it) {
  if (!it) return '';
  if (Array.isArray(it.blocks)) {
    return [it.summary, it.title, it.chapter, it.section, (it.points || []).join(' ')].concat(it.blocks.map(function (b) { return b && b.md; })).join(' ').toLowerCase();
  }
  return [it.title, it.question, it.chapter, it.category, (it.tags || []).join(' '), (it.pointKeys || []).join(' '), (it.options || []).map(function (o) { return o && o.text; }).join(' ')].join(' ').toLowerCase();
}

function knowledgeSearchQuestionHits(subject, query) {
  var t = knowledgeSearchQuestionTerms(query);
  if (!t.q) return { entries: [], bank: [], total: 0 };
  function scoreOf(text, title) {
    if (!text) return 0;
    var score = text.indexOf(t.q) >= 0 ? 120 : 0;
    if (String(title || '').toLowerCase().indexOf(t.q) >= 0) score += 100;
    t.tokens.forEach(function (token) {
      if (text.indexOf(token) >= 0) score += token.length * 8;
    });
    return score;
  }
  var entries = [];
  try {
    entriesOf(subject).forEach(function (e) {
      var text = knowledgeSearchQuestionText(e);
      var score = scoreOf(text, e.summary || e.title);
      if (score > 0) entries.push({ kind: 'entry', item: e, score: score });
    });
  } catch (err) { /* ignore */ }
  var bank = [];
  try {
    bankOf(subject).forEach(function (it) {
      var text = knowledgeSearchQuestionText(it);
      var score = scoreOf(text, it.title);
      if (score > 0) bank.push({ kind: 'bank', item: it, score: score });
    });
  } catch (err) { /* ignore */ }
  entries.sort(function (a, b) { return b.score - a.score; });
  bank.sort(function (a, b) { return b.score - a.score; });
  entries = entries.slice(0, 6);
  bank = bank.slice(0, 6);
  return { entries: entries, bank: bank, total: entries.length + bank.length };
}

function knowledgeSearchQuestionExcerpt(text, max) {
  var s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}

function knowledgeSearchQuestionsHtml(a) {
  var hit = a && a.questions;
  if (!hit || !hit.total) return '';
  var subject = subjectOf(a.subject || knowledgeSearchSubject(a.query));
  function card(record) {
    var it = record.item;
    if (record.kind === 'entry') {
      return '<button class="kb-qhit" data-act="kb-question-open" data-kind="entry" data-id="' + attr(it.id) + '" type="button">' +
        '<span class="kb-qhit-kind kb-qhit-entry">错题</span>' +
        '<span class="kb-qhit-main"><b>' + esc(it.code || it.summary || '错题') + '</b>' +
        '<span class="kb-qhit-meta">' + esc([it.chapter, it.stars ? '★'.repeat(it.stars) : ''].filter(Boolean).join(' · ')) + '</span>' +
        '<span class="kb-qhit-text">' + renderInline(knowledgeSearchQuestionExcerpt(it.summary || (it.blocks && it.blocks[0] && it.blocks[0].md) || '', 150)) + '</span></span>' +
        '<span class="kb-qhit-open">打开</span></button>';
    }
    return '<button class="kb-qhit" data-act="kb-question-open" data-kind="bank" data-id="' + attr(it.id) + '" type="button">' +
      '<span class="kb-qhit-kind kb-qhit-bank">题库</span>' +
      '<span class="kb-qhit-main"><b>' + esc(it.title || it.id) + '</b>' +
      '<span class="kb-qhit-meta">' + esc([it.chapter, it.category, it.difficulty ? '★'.repeat(Number(it.difficulty)) : ''].filter(Boolean).join(' · ')) + '</span>' +
      '<span class="kb-qhit-text">' + renderInline(knowledgeSearchQuestionExcerpt(it.question || '', 150)) + '</span></span>' +
      '<span class="kb-qhit-open">查看</span></button>';
  }
  return '<section class="kb-question-section" aria-label="相关题目">' +
    '<div class="kb-question-head"><div><span class="eyebrow">QUESTIONS / 题目</span><h3>相关题目</h3></div><span class="kb-question-count">' + hit.total + ' 条</span></div>' +
    (hit.entries.length ? '<div class="kb-question-group"><div class="kb-question-group-head">错题 · ' + hit.entries.length + '</div>' + hit.entries.map(card).join('') + '</div>' : '') +
    (hit.bank.length ? '<div class="kb-question-group"><div class="kb-question-group-head">题库 · ' + hit.bank.length + '</div>' + hit.bank.map(card).join('') + '</div>' : '') +
    '<p class="kb-question-note">来自 ' + esc(subject.name) + ' 的错题与题库；点击打开原题。</p>' +
  '</section>';
}

function knowledgeSearchOpenQuestion(kind, id) {
  var a = ui.kbAnswer;
  var subject = (a && a.subject) || state.activeSubject;
  if (!subject || !SUBJ_BY_ID[subject]) subject = state.activeSubject;
  ui.kbAnswer = null;
  if (kind === 'entry') {
    state.activeSubject = subject;
    state.activeView = 'entries';
    ui.open[id] = true;
    location.hash = '#/' + subjectRouteId(subject) + '/entries';
    render();
    setTimeout(function () {
      var el = document.getElementById('entry-' + id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('kb-target'); setTimeout(function () { el.classList.remove('kb-target'); }, 1600); }
    }, 80);
    return;
  }
  state.activeSubject = subject;
  state.activeView = 'bank';
  ui.bankFilters[subject] = { chapter: 'all', category: 'all', type: 'all', template: 'all', diff: 'all', origin: 'all' };
  ui.bankOpen[id] = true;
  ui.bankShowLimit = Math.max(120, Number(ui.bankShowLimit) || 120);
  location.hash = '#/' + subjectRouteId(subject) + '/bank';
  render();
  setTimeout(function () {
    var el = document.getElementById('bank-' + id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('kb-target'); setTimeout(function () { el.classList.remove('kb-target'); }, 1600); }
  }, 80);
}

function knowledgeSearchPanelHtml() {
  var a = ui.kbAnswer;
  if (!a || !a.query) return '';
  var subj = subjectOf(a.subject || knowledgeSearchSubject(a.query));
  var body = a.busy ? '<p class="kb-answer-loading">正在调用 ' + esc(subj.name) + ' 的 skill 与教材内容…</p>' : renderMarkdown(a.content || '');
  var source = a.source || {};
  var srcBits = [];
  if (source.book) srcBits.push(esc(source.book));
  if (source.chapter) srcBits.push('章节：' + esc(source.chapter));
  if (source.section) srcBits.push('小节：' + esc(source.section));
  srcBits.push('页码：' + esc(source.page || '以纸书版次为准'));
  var sourceLine = srcBits.join(' · ');
  var questionHtml = knowledgeSearchQuestionsHtml(a);
  return '<section class="kb-answer card" id="kbAnswerPanel" aria-live="polite">' +
    '<div class="kb-answer-head"><span class="eyebrow">知识点 / KNOWLEDGE</span><button class="kb-answer-close" data-act="kb-answer-close" type="button" aria-label="关闭知识点">×</button></div>' +
    '<h2>' + esc(a.title || a.query) + '</h2>' +
    '<p class="kb-answer-meta"><span>' + esc(subj.name) + '</span><span>skill：' + esc(subj.skill) + '</span></p>' +
    '<div class="kb-answer-body md">' + body + '</div>' +
    questionHtml +
    '<div class="kb-answer-source">教材出处：' + sourceLine + '</div>' +
    '<div class="kb-answer-ask"><span>是否将此知识点加入知识笔记？</span><div>' +
      (a.added ? '<b class="kb-answer-added">已加入知识笔记</b>' : '<button class="btn btn-xs btn-primary" data-act="kb-answer-add" type="button">是</button><button class="btn btn-xs" data-act="kb-answer-no" type="button">否</button>') +
    '</div></div>' +
  '</section>';
}

function knowledgeSearchClose() {
  ui.kbAnswer = null;
  render();
}

function knowledgeSearchOnInput(value) {
  if (typeof examSearchLocked === 'function' && examSearchLocked()) return;
  var q = String(value || '').trim();
  if (ui.kbTimer) clearTimeout(ui.kbTimer);
  if (q.length < 2) { if (ui.kbAnswer) { ui.kbAnswer = null; render(); } return; }
  if (ui.kbAnswer && ui.kbAnswer.query === q && !ui.kbAnswer.busy) return;
  ui.kbTimer = setTimeout(function () { knowledgeSearchRun(q); }, 420);
}

function knowledgeSearchNotify(subject, q, source, noMatch, reason) {
  if (typeof notifAdd !== 'function') return;
  var subj = SUBJ_BY_ID[subject] || subjectOf(subject);
  var point = String(q || '').trim();
  if (!point) return;
  var key = subject + '|' + point + '|' + (noMatch ? 'fail' : 'ok');
  if (ui.kbSearchNotifyKey === key) return;
  ui.kbSearchNotifyKey = key;
  var shownPoint = point.length > 42 ? point.slice(0, 42) + '…' : point;
  var title = (noMatch ? '知识点检索失败 · ' : '知识点检索成功 · ') + (subj ? subj.name : '未识别科目');
  var lines = ['知识点：' + shownPoint];
  lines.push('科目：' + (subj ? subj.name + ' / ' + subj.skill : '未识别'));
  if (noMatch) {
    lines.push('结果：没有找到直接条目，未用相邻章节充数');
    lines.push('建议：换用教材原词，或补上章节名后重试');
    if (reason) lines.push('原因：' + reason);
  } else if (source) {
    lines.push('定位：' + [source.chapter, source.section].filter(Boolean).join(' · '));
  }
  notifAdd(title, lines.join('\n'), noMatch ? 'warn' : 'tip');
  if (typeof markDirty === 'function') markDirty();
  if (typeof renderNotificationBadge === 'function') renderNotificationBadge();
  if (typeof renderNotifications === 'function' && qs('#notifList')) renderNotifications();
}

async function knowledgeSearchRun(query) {
  if (typeof examSearchLocked === 'function' && examSearchLocked()) { toast('限时模拟考进行中，知识点搜索已锁定'); return; }
  var q = String(query || '').trim();
  if (q.length < 2) return;
  var subject = knowledgeSearchSubject(q);
  var token = Date.now() + Math.random();
  ui.kbAnswerToken = token;
  ui.kbAnswer = { query: q, subject: subject, title: q, content: '', busy: true, source: {}, added: false, questions: { entries: [], bank: [], total: 0 } };
  knowledgeSearchActivateSubject(subject);
  render();
  try {
    var packs = await ensureSkillPacks();
    if (ui.kbAnswerToken !== token) return;
    var pack = packs.subjects[subject];
    if (!pack) throw new Error('该科目技能包缺失');
    var chapter = detectClientChapter(pack, q, q);
    var segment = knowledgeSearchExcerpt(chapter ? chapter.text : pack.skill, q);
    var source = chapter ? {
      book: pack.name + '（教材）',
      chapter: chapter.label,
      section: segment.noMatch ? '未匹配到直接小节' : (knowledgeTitleChineseFirst(segment.title) || '本章核心内容'),
      page: '教材该节（纸书版次不同，以纸书页码为准）'
    } : { book: pack.name + ' skill', chapter: '核心框架', section: '技能库', page: '以教材纸书为准' };
    var content;
    if (segment.noMatch) {
      content = '## 未找到直接讲解\n\n教材技能包中没有检索到「' + q + '」的直接条目，因此不展示相邻章节充数。\n\n可以试试：\n\n- 使用教材中的原词或更完整的名称\n- 加上所属章节，例如「第三章 无穷小量」\n- 换一个同义术语再搜索';
    } else {
      content = '## 教材定位\n\n' + (chapter ? '本章：' + chapter.label + '。' : '') + '\n\n' + segment.text;
    }
    ui.kbAnswer = { query: q, subject: subject, title: q, content: content, busy: false, source: source, added: false, questions: knowledgeSearchQuestionHits(subject, q) };
    render();
    knowledgeSearchNotify(subject, q, source, !!segment.noMatch);
    if (typeof aiConfigReady === 'function' && aiConfigReady() && typeof buildClientBundle === 'function' && typeof finalAiJsonCall === 'function') {
      knowledgeSearchAi(q, subject, token);
    }
  } catch (e) {
    if (ui.kbAnswerToken !== token) return;
    ui.kbAnswer = { query: q, subject: subject, title: q, content: '暂时无法读取该科目的技能内容。请检查页面版本，或换一个更具体的知识点名称。', busy: false, source: { book: subjectOf(subject).name + ' skill', chapter: '未定位', section: '未定位', page: '以教材纸书为准' }, added: false, questions: knowledgeSearchQuestionHits(subject, q) };
    render();
    knowledgeSearchNotify(subject, q, null, true, '技能内容读取失败');
  }
}

async function knowledgeSearchAi(query, subject, token) {
  var taskOn = typeof longTaskStart === 'function';
  function kbTask(state) {
    if (!taskOn) return;
    if (typeof longTaskUpdate === 'function') longTaskUpdate('kb-ai', state);
  }
  if (taskOn) longTaskStart('kb-ai', {
    steps: ['整理材料', '请求 AI', '写入讲解'],
    label: 'AI 补充讲解',
    step: 0,
    percent: 0,
    valueText: '0%',
    stage: '正在整理教材材料…',
    detail: '教材定位已经显示；AI 正在补全定义、例题与易错点。'
  });
  try {
    if (taskOn) longTaskUpdate('kb-ai', { step: 0, percent: 3, valueText: '3%', stage: '正在解压技能包并匹配章节…', detail: '先定位教材章节，再请求 AI 补充讲解。' });
    var bundle = await buildClientBundle(subject, query, query);
    if (ui.kbAnswerToken !== token) { if (taskOn) longTaskRemove('kb-ai'); return; }
    kbTask({ step: 1, percent: 6, valueText: '6%', stage: '正在请求 AI 补充讲解…', detail: '已整理好技能材料，等待模型返回；进度按实际收到的 JSON 字段推进。' });
    var sys = '你是「四科错题本」的课程助教。只能使用提供的 /' + bundle.id + ' skill 材料与教材知识回答。只输出 JSON，不要代码围栏。';
    var ask = '请只详细回答知识点：' + query + '。如果材料没有直接讲解该知识点，content 必须写“教材技能包中没有检索到该知识点的直接讲解”，不得改用相邻概念或无关章节。\n' +
      '输出 JSON：{"title":"知识点标题","content":"详细正文，Markdown，尽量完整：定义、定理/公式、推导或方法、至少 2 个例题、易错点、考研用法","book":"教材名","chapter":"第X章 章名","section":"第X节 小节名","page":"第X页","tags":["标签"]}。' +
      '必须给出教材章节、小节与页码；页码应以教材纸书为准，不能确定时写“以纸书该节页码为准”，不要编造不存在的页码。\n\n' +
      '【技能材料】\n' + bundle.materials.map(function (m) { return '### ' + m.label + '\n' + m.text; }).join('\n\n');
    var kbPushAt = 0;
    var kbFields = ['title', 'content', 'book', 'chapter', 'section', 'page', 'tags'];
    var kbExpect = { title: 30, content: 1400, book: 40, chapter: 20, section: 24, page: 20, tags: 40 };
    var kbStream = {
      onFirstByte: function () { if (taskOn) longTaskUpdate('kb-ai', { step: 1, percent: 8, valueText: '8%', stage: '模型已开始返回，正在生成讲解…', detail: '进度按实际收到的 JSON 字段推进。' }); },
      onDelta: function (delta, fullText) {
        if (!taskOn || typeof aiProgressJsonFields !== 'function') return;
        var now = Date.now();
        if (now - kbPushAt < 140) return;
        kbPushAt = now;
        var info = aiProgressJsonFields(fullText, kbFields, kbExpect);
        var frac = aiProgressFieldsFraction(info);
        longTaskUpdate('kb-ai', { step: 1, percent: 8 + frac * 77, valueText: '已收到 ' + info.completed + ' / 7 字段', stage: info.currentKey === 'content' ? '正在生成知识点正文…' : '正在生成「' + info.currentKey + '」…', detail: '进度来自模型流式正文中的真实字段。' });
      }
    };
    var out = await finalAiJsonCall(sys, ask, [], 70000, null, kbStream);
    if (ui.kbAnswerToken !== token) { if (taskOn) longTaskRemove('kb-ai'); return; }
    kbTask({ step: 2, percent: 90, valueText: '90%', stage: '正在写入补充讲解…', detail: '模型已返回，正在整理标题、章节与例题。' });
    var p = out.parsed || (out.objects && out.objects[0]) || null;
    if (p && p.content) {
      // 本地已经命中直接讲解时，AI 不得用“没有收录”覆盖它；AI 只做补充讲解。
      if (/没有检索到|没有直接讲解|未收录/.test(String(p.content)) && ui.kbAnswer && !/未找到直接讲解/.test(String(ui.kbAnswer.content || ''))) {
        if (taskOn) longTaskFinish('kb-ai', { stage: '已保留本地讲解', detail: 'AI 没有给出更具体的补充，本地教材定位保持不变。' });
        return;
      }
      var priorQuestions = ui.kbAnswer && ui.kbAnswer.questions;
      ui.kbAnswer = {
        query: query, subject: subject, title: String(p.title || query),
        content: knowledgeTitleChineseFirst(String(p.content || '')),
        busy: false,
        source: {
          book: String(p.book || bundle.name + '（教材）'),
          chapter: String(p.chapter || (bundle.chapter && bundle.chapter.label) || ''),
          section: knowledgeTitleChineseFirst(String(p.section || '')),
          page: String(p.page || '以纸书该节页码为准')
        },
        added: false,
        questions: priorQuestions || knowledgeSearchQuestionHits(subject, query)
      };
      render();
    }
    if (taskOn) longTaskFinish('kb-ai', { stage: '补充讲解完成', detail: 'AI 补充内容已写入知识点面板。' });
  } catch (e) {
    /* 本地技能内容已经显示，不覆盖；只提示 AI 补充没有完成。 */
    if (taskOn) longTaskFail('kb-ai', 'AI 补充没有完成，已保留教材定位与本地讲解；可稍后重试。');
  }
}

function knowledgeSearchAdd() {
  var a = ui.kbAnswer;
  if (!a || a.added) return;
  var src = a.source || {};
  var sourceLine = [src.book, src.chapter, src.section, src.page ? '页码：' + src.page : ''].filter(Boolean).join(' · ');
  var note = {
    id: 'kb-ai-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
    title: a.title || a.query,
    body: '## ' + (a.title || a.query) + '\n\n' + (a.content || '') + '\n\n## 教材出处\n\n' + sourceLine + '\n\n#知识点 #' + subjectOf(a.subject).name.replace(/\s+/g, ''),
    createdAt: nowIso(), updatedAt: nowIso(),
    tags: ['知识点', subjectOf(a.subject).name]
  };
  kbNotes().push(note);
  state.kbSeeded = true;
  ui.kbAnswer.added = true;
  markDirty();
  render();
  toast('已加入知识笔记：' + note.title);
}

document.addEventListener('click', function (e) {
  var el = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
  if (!el) return;
  var act = el.getAttribute('data-act');
  if (act === 'kb-answer-close' || act === 'kb-answer-no') { e.preventDefault(); knowledgeSearchClose(); }
  else if (act === 'kb-answer-add') { e.preventDefault(); knowledgeSearchAdd(); }
  else if (act === 'kb-question-open') { e.preventDefault(); knowledgeSearchOpenQuestion(el.getAttribute('data-kind'), el.getAttribute('data-id')); }
});
