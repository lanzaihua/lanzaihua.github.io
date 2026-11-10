/* =========================================================
   10-shell — render dispatch, rail, topbar, overview
   ========================================================= */
var apiWelcomeTimer = null;

function apiWelcomeNeeded() {
  if (!state || !state.prefs) return false;
  if (state.prefs.apiNoticeDismissed) return false;
  if (typeof aiConfigReady === 'function' && aiConfigReady()) return false;
  return isHomeRoute();
}

function showApiWelcome() {
  if (typeof examAccessLocked === 'function' && examAccessLocked()) return;
  apiWelcomeTimer = null;
  if (!apiWelcomeNeeded()) return;
  var dlg = qs('#apiWelcomeDialog');
  if (!dlg || dlg.open) return;
  if (typeof dlg.showModal === 'function') dlg.showModal();
}

function scheduleApiWelcome() {
  if (typeof examAccessLocked === 'function' && examAccessLocked()) return;
  if (typeof isHomeRoute === 'function' && !isHomeRoute()) return;
  if (!apiWelcomeNeeded()) return;
  if (apiWelcomeTimer) clearTimeout(apiWelcomeTimer);
  apiWelcomeTimer = setTimeout(showApiWelcome, 520);
}

function dismissApiWelcome(goSettings) {
  var dlg = qs('#apiWelcomeDialog');
  if (dlg && dlg.open) dlg.close();
  if (state.prefs && !state.prefs.apiNoticeDismissed) {
    state.prefs.apiNoticeDismissed = true;
    markDirty();
  }
  if (goSettings && typeof openSettings === 'function') openSettings();
}

/* ---------- welcome home ---------- */
function isHomeRoute() {
  var h = String(location.hash || '');
  return !h || h === '#' || h === '#/' || h === '#/home' || h === '#/welcome';
}

function homeWelcome(hour) {
  if (hour < 5) return { greet: '夜深了', line: '这个点还没睡', note: '辛苦了。今天已经很努力了，剩下的明天再说，先去休息吧。' };
  if (hour < 8) return { greet: '早上好', line: '慢慢醒过来就好', note: '不用一睁眼就进入状态 先喝口水 今天按自己的节奏来' };
  if (hour < 11) return { greet: '上午好', line: '先做一点点', note: '不用一下子把所有事做完 挑一件最想做的 开始就好' };
  if (hour < 13) return { greet: '中午好', line: '先好好吃饭', note: '题可以晚一点再看 饭要趁热吃 休息也是复习的一部分' };
  if (hour < 17) return { greet: '下午好', line: '别急着赶路', note: '看累了就停一停 你今天已经走了很远 不必每一步都很快' };
  if (hour < 19) return { greet: '傍晚好', line: '今天辛苦了', note: '想学就学一点 想歇就安心歇一会儿 都没关系' };
  if (hour < 23) return { greet: '晚上好', line: '今天也辛苦了', note: '做过的事都算数 没做完的也不用责怪自己 先照顾好自己 再决定今晚学多少' };
  return { greet: '夜深了', line: '该休息了', note: '今天到这里就很好 没解决的题不会跑 明天再慢慢来' };
}

function renderHomeClock() {
  var info = homeWelcome(new Date().getHours());
  var greet = qs('#homeGreeting');
  if (greet) {
    var userName = state.prefs && String(state.prefs.userName || '').trim();
    greet.textContent = info.greet + (userName ? ' ' + userName : '');
  }
  var welcome = qs('#homeWelcome');
  if (welcome) welcome.textContent = info.line;
  var note = qs('#homeWelcomeNote');
  if (note) note.textContent = info.note;
  var subjectsTitle = qs('#homeSubjectsTitle');
  if (subjectsTitle) {
    var h = new Date().getHours();
    subjectsTitle.textContent = (h < 5 || h >= 23) ? '明天想从哪一科继续？' : '想从哪一科开始？';
  }
  var date = qs('#homeDate');
  if (date) {
    var d = new Date();
    var w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    date.textContent = d.getFullYear() + '.' + pad(d.getMonth() + 1, 2) + '.' + pad(d.getDate(), 2) + ' · 周' + w;
  }
}

var homeClockTimer = null;
function startHomeClock() {
  if (homeClockTimer) return;
  homeClockTimer = setInterval(function () {
    if (isHomeRoute()) renderHomeClock();
  }, 60000);
}

function homeSubjectNote(id) {
  var map = {
    gaodai: '从极大无关组到二次型',
    shufen: '极限、积分与级数',
    jieji: '向量、平面与二次曲面',
    xijing: '微观与宏观，一条线索'
  };
  return map[id] || '';
}

function renderHome() {
  renderHomeClock();
  var footNote = qs('#homeFootNote');
  if (footNote) {
    footNote.textContent = PAGES
      ? '数据只保存在本机浏览器，可在设置里导出/导入备份'
      : '数据保存在本机浏览器，可在设置里导出或连接同步';
  }
  var wrap = qs('#homeSubjects');
  if (!wrap) return;
  wrap.innerHTML = SUBJECTS.map(function (s, i) {
    var st = statsFor(s.id);
    var n = bankOf(s.id).length;
    var count = st.total ? st.total + ' 道错题' : '0 道错题';
    return '<a class="home-subject" href="#/' + attr(subjectRouteId(s.id)) + '/entries" style="--subj:var(--' + attr(s.id) + ')">' +
      '<span class="hs-index">' + pad(i + 1, 2) + '</span>' +
      '<span class="hs-main"><span class="hs-name">' + esc(s.name) + '</span>' +
      '<span class="hs-desc">' + esc(homeSubjectNote(s.id)) + '</span></span>' +
      '<span class="hs-side"><span class="hs-count">' + esc(count) + '</span>' +
      '<span class="hs-meta">' + templatesOf(s.id).length + ' 模板 · ' + n + ' 题库</span></span>' +
      '<span class="hs-arrow" aria-hidden="true">→</span>' +
    '</a>';
  }).join('');
}

function updateHomeVisibility() {
  var home = qs('#homeScreen');
  var app = qs('.app');
  if (!home || !app) return;
  var show = isHomeRoute() && !(typeof examAccessLocked === 'function' && examAccessLocked());
  var wasHome = document.documentElement.classList.contains('is-home');
  home.hidden = !show;
  app.hidden = show;
  document.documentElement.classList.toggle('is-home', show);
  var skip = qs('.skip');
  if (skip) skip.setAttribute('href', show ? '#homeMain' : '#main');
  if (wasHome !== show) window.scrollTo(0, 0);
}

function render() {
  applyLanguage();
  document.documentElement.classList.toggle('is-notes-module', state.activeView === 'notes' && !isHomeRoute());
  document.documentElement.classList.toggle('is-final-module', state.activeView === 'final' && !isHomeRoute());
  var examActive = false;
  try { examActive = typeof finalData === 'function' && !!(finalData().mock && finalData().mock.status === 'active' && ui.finalExamMode === 'exam'); } catch (e) { examActive = false; }
  document.documentElement.classList.toggle('is-exam-active', examActive);
  var examLocked = typeof examAccessLocked === 'function' && examAccessLocked();
  document.documentElement.classList.toggle('is-exam-locked', examLocked);
  if (examLocked) document.querySelectorAll('dialog[open]').forEach(function (d) { try { d.close(); } catch (e) {} });
  var subj = state.activeSubject;
  setVar('--subj', 'var(--' + subj + ')');
  applyTheme();
  renderRail();
  renderTopbar();
  if (typeof renderNotificationBadge === 'function') renderNotificationBadge();
  renderMain();
  renderFoot();
  if (typeof decorateMathScrollers === 'function') setTimeout(decorateMathScrollers, 30);
  renderHome();
  renderSyncStatus();
  if (typeof scheduleApiWelcome === 'function') scheduleApiWelcome();
  if (typeof translatePage === 'function') translatePage();
  if (typeof updateHomeVisibility === 'function') updateHomeVisibility();
}

function renderRail() {
  var nav = qs('#subjectNav');
  if (!nav) return;
  nav.innerHTML = SUBJECTS.map(function (s, i) {
    var st = statsFor(s.id);
    var active = state.activeView !== 'notes' && state.activeView !== 'final' && s.id === state.activeSubject;
    return '<button class="subject-item' + (active ? ' is-active' : '') + '" data-act="nav-subject" data-subject="' + s.id + '" style="--subj:var(--' + s.id + ')" type="button" aria-current="' + (active ? 'page' : 'false') + '">' +
      '<span class="idx">' + pad(i + 1, 2) + '</span>' +
      '<span class="nm">' + esc(s.name) + '</span>' +
      '<span class="cnt-wrap"><span class="cnt">' + st.total + '</span></span>' +
      '</button>';
  }).join('');

  var progress = qs('#railProgress');
  if (progress) {
    progress.innerHTML = SUBJECTS.map(function (s) {
      var st = statsFor(s.id);
      return '<div class="rp" style="--subj:var(--' + s.id + ')">' +
        '<div class="rp-top"><span>' + esc(s.name) + ' 掌握</span><span>' + st.mastered + '/' + st.total + '</span></div>' +
        '<div class="rp-bar"><i style="width:' + st.pct + '%"></i></div>' +
        '</div>';
    }).join('');
  }

  var note = qs('#railNote');
  if (note) {
    note.innerHTML = PAGES
      ? '<span class="sync-pill"><span class="sync-dot" data-sync-dot></span><span data-sync-text>' + (IS_GITHUB_PAGES ? 'GitHub Pages' : '静态版') + ' · 本机保存</span></span>' +
        '<br>数据只保存在本机浏览器；换设备请用设置里的导出/导入备份。'
      : '<span class="sync-pill"><span class="sync-dot" data-sync-dot></span><span data-sync-text>本机优先</span></span>' +
        '<br>数据保存在本机浏览器；启动 server.js 后可自动同步。';
  }
}

function topbarLabel(key, fallback) {
  try {
    var dict = (typeof i18nFor === 'function') ? i18nFor() : null;
    return (dict && dict[key]) || fallback;
  } catch (e) { return fallback; }
}

function examSearchLocked() {
  try {
    var fe = typeof finalData === 'function' ? finalData() : null;
    return !!(fe && fe.mock && fe.mock.status === 'active');
  } catch (e) { return false; }
}

function examAccessLocked() {
  try {
    var fe = typeof finalData === 'function' ? finalData() : null;
    if (!fe || !fe.mock || fe.mock.status !== 'active') return false;
    return !(state.activeView === 'final' && ui.finalExamMode === 'exam');
  } catch (e) { return false; }
}

function examLockScreenHtml() {
  var mock = null;
  try { mock = typeof finalExamMock === 'function' ? finalExamMock() : null; } catch (e) { mock = null; }
  var remain = mock && typeof finalExamRemain === 'function' ? finalExamRemain(mock) : 0;
  var clock = typeof finalFormatClock === 'function' ? finalFormatClock(remain) : '--:--:--';
  return '<section class="exam-lock" aria-labelledby="examLockTitle">' +
    '<p class="eyebrow">FINAL MOCK EXAM · LOCKED</p>' +
    '<h1 id="examLockTitle">模拟考进行中</h1>' +
    '<p class="exam-lock-note">为防止查看题目和答案，错题、题库、模板库、笔记库、规范、更新记录、总览和总索引已全部锁定。交卷或考试结束后自动恢复。</p>' +
    '<div class="exam-lock-clock"><span>剩余时间</span><b id="finalExamLockClock">' + esc(clock) + '</b></div>' +
    '<div class="exam-lock-actions"><button class="btn btn-primary" data-act="final-exam-resume" type="button">继续考试</button></div>' +
    '<p class="exam-lock-foot">离开或刷新页面不会暂停计时；到时自动收卷。</p>' +
  '</section>';
}

function syncSearchLockState() {
  var search = qs('#searchInput');
  if (!search) return;
  var locked = examSearchLocked();
  var wrap = search.closest('.search');
  if (wrap) wrap.classList.toggle('is-locked', locked);
  search.disabled = locked;
  search.setAttribute('aria-disabled', locked ? 'true' : 'false');
  if (locked) {
    search.value = '';
    search.placeholder = '模拟考进行中 · 搜索已锁定';
    search.title = '限时模拟考进行中，知识点搜索已锁定';
    if (ui.kbTimer) { clearTimeout(ui.kbTimer); ui.kbTimer = null; }
    ui.kbAnswer = null;
    ui.kbAnswerToken = 0;
  } else {
    search.removeAttribute('title');
    if (typeof syncResponsiveLabels === 'function') syncResponsiveLabels();
  }
}

function renderTopbar() {
  var subj = currentSubject();
  var globalNotes = state.activeView === 'notes';
  var globalFinal = state.activeView === 'final';
  var view = VIEWS.filter(function (v) { return v.id === state.activeView; })[0] || VIEWS[0];
  var cs = qs('#crumbSubj'); if (cs) cs.textContent = globalFinal ? '期末复习' : (globalNotes ? '笔记' : subj.name);
  var cv = qs('#crumbView'); if (cv) cv.textContent = (globalNotes || globalFinal) ? '' : view.label;

  var tabs = qs('#tabs');
  if (tabs) { if (!tabs.getAttribute('role')) tabs.setAttribute('role', 'tablist'); if (!tabs.getAttribute('aria-label')) tabs.setAttribute('aria-label', '科目视图'); }
  var finalLabel = topbarLabel('期末复习', '期末复习');
  var notesLabel = topbarLabel('笔记库', '笔记库');
  if (tabs) tabs.classList.toggle('is-cross', !!(globalNotes || globalFinal));
  var crossGroup = '<a class="tab tab-cross' + (globalFinal ? ' is-current' : '') + '" href="#/final" aria-current="' + (globalFinal ? 'page' : 'false') + '" aria-label="' + attr(finalLabel) + '">' + esc(finalLabel) + '</a>' +
    '<a class="tab tab-cross' + (globalNotes ? ' is-current' : '') + '" href="#/notes" data-act="open-notes-library" aria-label="' + attr(notesLabel) + '">' + esc(notesLabel) + '</a>';
  var crossTabs = qs('#crossTabs');
  var phoneNav = (window.innerWidth || 9999) <= 600;
  if (tabs && (globalNotes || globalFinal)) {
    tabs.innerHTML = '';
    tabs.hidden = true;
    if (crossTabs) crossTabs.innerHTML = crossGroup;
  } else if (tabs) {
    tabs.hidden = false;
    var viewTabs = VIEWS.map(function (v) {
      var sel = v.id === state.activeView;
      return '<button class="tab" role="tab" aria-selected="' + sel + '" data-act="nav-view" data-view="' + v.id + '" type="button">' + v.label + '</button>';
    }).join('');
    tabs.innerHTML = viewTabs;
    if (crossTabs) crossTabs.innerHTML = crossGroup;
  }

  var ms = qs('#mobileSubjects');
  if (ms) {
    ms.innerHTML = (globalNotes || globalFinal) ? '' : SUBJECTS.map(function (s) {
      var active = s.id === state.activeSubject;
      return '<button class="msub" data-act="nav-subject" data-subject="' + s.id + '" aria-pressed="' + active + '" style="--subj:var(--' + s.id + ')" type="button">' +
        '<span class="dot"></span>' + esc(s.name) + '</button>';
    }).join('');
  }

  var themeBtn = qs('#themeBtnRail');
  if (themeBtn) themeBtn.textContent = '主题 · ' + THEME_LABEL[(state.prefs && state.prefs.theme) || 'auto'];
  syncSearchLockState();
}

function footSubject() {
  if (state.activeView === 'final') {
    var mode = String(ui.finalExamMode || '');
    var sid = '';
    if (mode === 'exam' || mode === 'result' || mode === 'grading') {
      var mock = (typeof finalExamMock === 'function') ? finalExamMock() : null;
      if (mock && mock.subject) sid = mock.subject;
    } else if (mode === 'ai-ready' && ui.finalAiPendingSubject) {
      sid = ui.finalAiPendingSubject;
    }
    if (!sid && typeof finalSubject === 'function') sid = finalSubject();
    if (sid && SUBJ_BY_ID[sid]) return SUBJ_BY_ID[sid];
  }
  return currentSubject();
}

function renderFoot() {
  var left = qs('#footLeft');
  if (left) left.innerHTML = PAGES
    ? '<span class="sync-pill"><span class="sync-dot" data-sync-dot></span><span data-sync-text>' + (IS_GITHUB_PAGES ? 'GitHub Pages' : '静态版') + ' · 本机保存</span></span> · 可导出/导入备份'
    : '<span class="sync-pill"><span class="sync-dot" data-sync-dot></span><span data-sync-text>本机优先</span></span> · 可导出/导入备份';
  var right = qs('#footRight');
  if (right) {
    var fs = footSubject();
    right.innerHTML = state.activeView === 'notes'
      ? '笔记 ｜ 多页 · 手写 · 智能扫描 · 导出'
      : '来源：' + subjectSourceLabel(fs.sourceFile) + ' ｜ skill：' + fs.skill;
  }
}

var pagesBannerDismissed = false;
try { pagesBannerDismissed = localStorage.getItem('sanke-pages-banner-dismissed') === '1'; } catch (e) { /* noop */ }

function subjectJumpHtml(context) {
  var current = (context === 'final' && typeof finalSubject === 'function') ? finalSubject() : state.activeSubject;
  return '<nav class="subject-jump" aria-label="跳转到科目">' +
    '<span class="subject-jump-label">' + (context === 'final' ? '跳到科目' : '打开科目') + '</span>' +
    SUBJECTS.map(function (s) {
      return '<button class="subject-jump-btn' + (s.id === current ? ' is-current' : '') + '" data-act="nav-subject" data-subject="' + s.id + '" style="--subj:var(--' + s.id + ')" type="button" aria-label="打开' + attr(s.name) + '">' +
        '<span class="subject-jump-dot" aria-hidden="true"></span><span>' + esc(s.name) + '</span></button>';
    }).join('') +
  '</nav>';
}

function renderMain() {
  var main = qs('#main');
  if (!main) return;
  var subj = state.activeSubject;
  var bannerText = '数据只保存在本机浏览器；需要跨设备时，请导出并在另一设备导入 JSON 备份；AI 配置不提供数据同步。';
  var pagesBanner = (PAGES && !pagesBannerDismissed) ? '<div class="restore-banner pages-banner"><span class="pages-banner-badge">' + 'LOCAL FIRST' + '</span><span class="pages-banner-copy">' + bannerText + '</span><button class="btn btn-xs" data-act="export-state" type="button">导出备份</button><button class="banner-close" data-act="dismiss-pages-banner" type="button" aria-label="关闭静态版提示" title="关闭提示">×</button></div>' : '';
  var lockBanner = sync.mode === 'locked'
    ? '<div class="restore-banner" style="border-style:solid;border-color:var(--line-strong)"><span>云端同步需要访问口令。页面本身可以离线使用，填写口令后才会读写云端数据。</span><button class="btn btn-xs" data-act="open-settings" type="button">填写口令</button></div>'
    : '';
  if (typeof examAccessLocked === 'function' && examAccessLocked()) {
    main.innerHTML = examLockScreenHtml();
    if (typeof finalExamScheduleDeadline === 'function') finalExamScheduleDeadline();
    if (typeof finalExamAfterRender === 'function') finalExamAfterRender();
    return;
  }
  var knowledgePanel = (typeof knowledgeSearchPanelHtml === 'function') ? knowledgeSearchPanelHtml() : '';
  main.innerHTML = pagesBanner + lockBanner + knowledgePanel;
  var view = state.activeView;
  if (view === 'overview') main.innerHTML += viewOverview(subj);
  else if (view === 'entries') main.innerHTML += viewEntries(subj);
  else if (view === 'final') main.innerHTML += viewFinal();
  else if (view === 'notes') { main.innerHTML += viewNotes(); if (ui.noteKb) initKnowledgeView(); else { initNotesView(); if (ui.noteLibrary && ui.noteQuery && typeof noteFilterLibrary === 'function') noteFilterLibrary(ui.noteQuery); } }
  else if (view === 'templates') main.innerHTML += viewTemplates(subj);
  else if (view === 'bank') main.innerHTML += viewBank(subj);
  else if (view === 'guide') main.innerHTML += viewGuide(subj);
  else main.innerHTML += viewOverview(subj);
  if (typeof initEntryNoteCanvases === 'function') initEntryNoteCanvases();
  if (typeof finalExamAfterRender === 'function') finalExamAfterRender();
  if (typeof finalPaperAfterRender === 'function') finalPaperAfterRender();
}

/* ---------- small view helpers ---------- */
function statusPill(e) {
  if (e.status === 'mastered') return '<span class="status-pill is-mastered">已掌握</span>';
  return '<span class="status-pill is-unmastered">未掌握</span>';
}
function subjectTag(id) {
  var s = subjectOf(id);
  return '<span class="chip chip-subj" style="--subj:var(--' + id + ')">' + esc(s.name) + '</span>';
}
function emptyState(title, text, actions) {
  return '<div class="empty-state">' +
    '<p class="es-title">' + esc(title) + '</p>' +
    '<p class="es-text">' + esc(text) + '</p>' +
    (actions || '') +
    '</div>';
}
function dataTable(headers, rows, opts) {
  opts = opts || {};
  var head = headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('');
  var body = rows.map(function (r) {
    var attrs = r.attrs || '';
    var cls = r.className ? ' class="' + r.className + '"' : '';
    var cells = r.cells.map(function (c) { return '<td>' + c + '</td>'; }).join('');
    return '<tr' + cls + ' ' + attrs + '>' + cells + '</tr>';
  }).join('');
  return '<div class="table-wrap"><table class="data">' + (head ? '<thead><tr>' + head + '</tr></thead>' : '') + '<tbody>' + body + '</tbody></table></div>';
}

function errorBars(stats) {
  var keys = ERROR_TYPES;
  var max = 1;
  keys.forEach(function (k) { max = Math.max(max, stats.errors[k] || 0); });
  return '<div class="err-bars">' + keys.map(function (k) {
    var v = stats.errors[k] || 0;
    return '<div class="err-row"><span>' + k + '</span><span class="bar"><i style="width:' + Math.round((v / max) * 100) + '%"></i></span><span class="mono">' + v + '</span></div>';
  }).join('') + '</div>';
}

/* =========================================================
   overview
   ========================================================= */
function viewOverview(subjectId) {
  var s = subjectOf(subjectId);
  var st = statsFor(subjectId);
  var entries = entriesOf(subjectId);
  var recent = entries.slice().sort(function (a, b) {
    return String(b.updatedAt || b.date || '').localeCompare(String(a.updatedAt || a.date || ''));
  }).slice(0, 4);

  var hero =
    '<section class="hero">' +
      '<div>' +
        '<div class="hero-kicker"><span class="dot" style="background:var(--' + s.id + ')"></span> 第 ' + pad(SUBJECTS.indexOf(s) + 1, 2) + ' 科 / ' + esc(s.skill) + (bookShortFor(s.id) ? ' · ' + esc(bookShortFor(s.id)) : '') + '</div>' +
        '<h1 class="hero-title">' + esc(s.name) + '</h1>' +
        '<p class="hero-desc">' + esc(s.tagline) + '。错题条目、模板库与考研同型/教材课后题库都在这里，手机和电脑同一套交互。</p>' +
        '<div class="hero-meta" style="margin-top:16px">' +
          (st.total ? '<span>最近更新 ' + esc(timeAgo(st.last)) + '</span>' : '<span>尚无错题</span>') +
          '<span>模板 ' + st.templates + '</span>' +
          '<span>题库 ' + st.bank + '</span>' +
          '<span>来源 ' + esc(subjectSourceLabel(s.sourceFile)) + '</span>' +
          (bookLabelFor(s.id) ? '<span>教材 ' + esc(bookLabelFor(s.id)) + ' · 10 章</span>' : '') +
        '</div>' +
        '<div class="page-actions" style="margin-top:18px">' +
          '<button class="btn" data-act="nav-view" data-view="entries" type="button">全部错题</button>' +
          '<button class="btn" data-act="open-notes-library" type="button">笔记库</button>' +
          '<button class="btn" data-act="add-entry" type="button">手动新增</button>' +
          '<button class="btn btn-primary" data-act="ai-open" data-subject="' + s.id + '" type="button">智能录入</button>' +
        '</div>' +
      '</div>' +
      '<div class="hero-side">' +
        '<div class="progress-label">掌握进度</div>' +
        '<div class="progress-num">' + st.pct + '<small>%</small></div>' +
        '<div class="progress-track"><i style="width:' + st.pct + '%"></i></div>' +
        '<div class="hero-meta"><span>已掌握 ' + st.mastered + ' 题</span><span>未掌握 ' + st.unmastered + ' 题</span></div>' +
      '</div>' +
    '</section>';

  var stats =
    '<section class="stats">' +
      statCard(st.total, '总条目 / TOTAL', '') +
      statCard(st.mastered, '已掌握 / MASTERED', 'mastered') +
      statCard(st.unmastered, '未掌握 / UNMASTERED', 'unmastered') +
      statCard(st.templates + ' / ' + st.bank, '模板 / 题库', '') +
    '</section>';

  var body = overviewShared(entries, st);

  var recentPanel = '<section class="panel">' +
    '<div class="panel-head"><h2 class="panel-title">最近动过</h2><span class="panel-sub">按条目更新时间</span></div>' +
    '<div class="panel-body">' +
      (recent.length ? '<ul class="timeline">' + recent.map(function (e) {
        return '<li><time>' + esc(formatDate(e.updatedAt || e.date).slice(5)) + '</time>' +
          '<div><button class="linkish" data-act="jump-entry" data-id="' + esc(e.id) + '">' + esc(entryCodeLabel(e)) + ' · ' + renderInline(entryTitle(e)) + '</button>' +
          '<div class="faint" style="font-size:11px;margin-top:2px">' + esc(e.chapter || '') + (e.templateId ? ' · ' + esc(e.templateId) : '') + ' · ' + STATUS_LABEL[e.status] + '</div></div></li>';
      }).join('') + '</ul>' : '<p class="empty-inline">还没有条目。点「错题」页的新增按钮开始记录。</p>') +
    '</div></section>';

  return hero + stats + body + '<div class="grid-2" style="margin-top:22px">' + recentPanel + sideInfoPanel(s, st) + '</div>';
}

function statCard(num, label, cls) {
  return '<div class="stat"><span class="num ' + (cls || '') + '">' + num + '</span>' +
    '<span class="lbl">' + label + '</span></div>';
}

function sideInfoPanel(s, st) {
  return '<section class="panel"><div class="panel-head"><h2 class="panel-title">复习法</h2><span class="panel-sub">四科通用节奏</span></div>' +
    '<div class="panel-body"><ul class="timeline" style="list-style:none;padding:0;margin:0">' +
    '<li><time>当天</time><div>只看「考试标准解答」与「同类型模板」，确认现在会做。</div></li>' +
    '<li><time>D1/3/7/15/30</time><div>按复习行打卡；合上答案能独立写步骤，再做对变式，才算已掌握。</div></li>' +
    '<li><time>考前</time><div>走「按章索引」，按知识要点刷，不按时间刷。</div></li>' +
    '</ul><p style="margin:14px 0 0"><button class="linkish" data-act="nav-view" data-view="guide">查看本科规范与示范</button></p></div></section>';
}

function chapterTable(s, st) {
  var rows = [];
  var groups = {};
  (s.templates || []).forEach(function (t) {
    var ch = t.chapter || '未分章';
    if (!groups[ch]) groups[ch] = [];
    groups[ch].push(t);
  });
  sortChapters(s.id, Object.keys(groups)).forEach(function (ch) {
    var tpls = groups[ch];
    var count = entriesOf(s.id).filter(function (e) { return e.chapter === ch; }).length;
    rows.push({ cells: [
      '<span class="mono faint">' + esc(ch) + '</span>',
      '<span>' + esc((tpls[0] || {}).title || '') + '</span>',
      count ? '<span class="linkish" data-act="filter-chapter" data-chapter="' + attr(ch) + '">' + count + ' 题</span>' : '<span class="faint">—</span>'
    ] });
  });
  return dataTable(['章', '最近模板', '条目'], rows);
}

function overviewXifang(entries, st) {
  var rows = entries.map(function (e) {
    return { className: 'is-link', attrs: 'data-act="jump-entry" data-id="' + attr(e.id) + '"', cells: [
      '<span class="num-cell">' + esc(e.code) + '</span>',
      esc(e.chapter || ''),
      renderInline(e.summary || (e.points || []).join('；') || e.templateTitle || ''),
      statusPill(e)
    ] };
  });
  var highWeight = [
    ['第五章 不完全竞争市场', '23★ · 垄断 / 垄断竞争 / 寡头 / 市场比较'],
    ['第二章 消费者选择', '24★ · 消费者均衡 / 替代与收入效应'],
    ['第六章 生产要素市场和收入分配', '23★ · 劳动和工资 / 要素使用原则'],
    ['第十章 国民收入的决定：收入-支出模型', '23★ · 乘数 / 三部门均衡']
  ];
  return '<div class="grid-2">' +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">总索引</h2><span class="panel-sub">按编号 · 点一行跳到题目</span></div>' +
    '<div class="panel-body">' + (entries.length ? dataTable(['编号', '章节', '概括', '状态'], rows) + '<p class="scroll-hint">左右滑动查看完整表格</p>' : emptyState('还没有西经错题', '西经错题本从 0 开始：录入第一道题，或先从题库挑一道做。', '<div class="multi-actions">' + entryCreateButtons('xijing') + '<button class="btn" data-act="nav-view" data-view="bank" type="button">去题库</button></div>')) + '</div></section>' +
    '<div style="display:grid;gap:22px">' +
      '<section class="panel"><div class="panel-head"><h2 class="panel-title">高权重章节</h2><span class="panel-sub">按配套题库考点星级</span></div><div class="panel-body"><ul class="timeline" style="list-style:none;padding:0;margin:0">' +
        highWeight.map(function (h) { return '<li><time>' + esc(h[0].split(' ')[0]) + '</time><div><b>' + esc(h[0]) + '</b><div class="faint" style="font-size:11px">' + esc(h[1]) + '</div></div></li>'; }).join('') +
      '</ul><p style="margin:14px 0 0"><button class="linkish" data-act="nav-view" data-view="templates">看 ' + templatesOf('xijing').length + ' 张模板</button></p></div></section>' +
      '<section class="panel"><div class="panel-head"><h2 class="panel-title">错因分布</h2><span class="panel-sub">统计自条目</span></div><div class="panel-body">' + errorBars(st) + '</div></section>' +
    '</div>' +
  '</div>' +
  '<section class="panel" style="margin-top:22px"><div class="panel-head"><h2 class="panel-title">按章索引</h2><span class="panel-sub">微观 8 章 + 宏观 8 章</span></div><div class="panel-body">' + chapterTable(currentSubject(), st) + '</div></section>';
}

function overviewShared(entries, st) {
  var s = currentSubject();
  var shortName = s.short || s.name;
  var rows = entries.map(function (e) {
    return { className: 'is-link', attrs: 'data-act="jump-entry" data-id="' + attr(e.id) + '"', cells: [
      '<span class="num-cell">' + esc(e.code) + '</span>',
      esc(e.chapter || ''),
      renderInline(e.summary || entryTitle(e)),
      statusPill(e)
    ] };
  });
  return '<div class="grid-2">' +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">总索引</h2><span class="panel-sub">按编号 · 点一行跳到题目</span></div>' +
    '<div class="panel-body">' + (entries.length ? dataTable(['编号', '章节', '题目', '状态'], rows) + '<p class="scroll-hint">左右滑动查看完整表格</p>' : emptyState('还没有' + shortName + '错题', '点「手动新增」把今天问过的那道题落成条目，或交给「智能录入」自动整理。', '<div class="multi-actions">' + entryCreateButtons(s.id) + '<button class="btn" data-act="nav-view" data-view="guide" type="button">看规范</button></div>')) + '</div></section>' +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">错因分布</h2><span class="panel-sub">统计自条目</span></div><div class="panel-body">' + errorBars(st) + '</div></section>' +
  '</div>' +
  '<section class="panel" style="margin-top:22px"><div class="panel-head"><h2 class="panel-title">按章索引</h2><span class="panel-sub">考前按知识要点刷</span></div><div class="panel-body">' + chapterTable(s, st) + '</div></section>';
}

function overviewGaodai(entries, st) {
  var indexRows = entries.map(function (e) {
    return { className: 'is-link', attrs: 'data-act="jump-entry" data-id="' + attr(e.id) + '"', cells: [
      '<span class="num-cell">' + esc(e.code) + '</span>',
      '<span class="mono faint">' + esc(entryDateText(e)) + '</span>',
      esc(e.chapter || ''),
      renderInline((e.points || []).join('；') || e.templateTitle || ''),
      esc(e.templateId || '—'),
      statusPill(e)
    ] };
  });
  return '<div class="grid-2">' +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">总索引</h2><span class="panel-sub">按编号 · 点一行跳到题目</span></div>' +
    '<div class="panel-body">' + (entries.length ? dataTable(['编号', '日期', '章节', '知识要点', '模板', '状态'], indexRows) + '<p class="scroll-hint">左右滑动查看完整表格</p>' : emptyState('还没有高代错题', '点「手动新增」把今天问过的那道题落成条目，或交给「智能录入」自动整理。', '<div class="multi-actions">' + entryCreateButtons('gaodai') + '</div>')) + '</div></section>' +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">错因分布</h2><span class="panel-sub">统计自条目</span></div><div class="panel-body">' + errorBars(st) + '</div></section>' +
  '</div>' +
  '<section class="panel" style="margin-top:22px"><div class="panel-head"><h2 class="panel-title">按章索引</h2><span class="panel-sub">考前按知识要点刷</span></div><div class="panel-body">' + chapterTable(currentSubject(), st) + '</div></section>';
}

function overviewShufen(entries, st) {
  var rows = entries.map(function (e) {
    return { className: 'is-link', attrs: 'data-act="jump-entry" data-id="' + attr(e.id) + '"', cells: [
      '<span class="num-cell">' + esc(e.code) + '</span>',
      renderInline(e.summary || entryTitle(e)),
      renderInline((e.points || []).slice(0, 2).join('；')),
      '<span class="mono faint">' + esc(e.chapterCode || '') + '</span>',
      '<span class="mono">' + esc(e.templateId || '—') + '</span>',
      '<span class="chip ' + (e.status === 'mastered' ? 'chip-ok' : 'chip-warn') + '">' + (e.status === 'mastered' ? '🟢 已掌握' : '🔴 未掌握') + '</span>'
    ] };
  });
  return '<section class="panel"><div class="panel-head"><h2 class="panel-title">总索引</h2><span class="panel-sub">编号 · 题目 · 知识要点 · 模板 · 掌握</span></div>' +
    '<div class="panel-body">' + (entries.length ? dataTable(['编号', '题目', '知识要点', '章节', '模板', '掌握'], rows) : emptyState('还没有数分错题', '数分错题本还是空的，新增第一条吧。', '<div class="multi-actions">' + entryCreateButtons('shufen') + '</div>')) +
    '<p class="form-note">原错题本的掌握状态为 🔴 未复习 → 🟡 复习中 → 🟢 已掌握；本页按你的要求合并成「已掌握 / 未掌握」两个按钮，复习记录保留在条目内。</p></div></section>' +
    '<div class="grid-2" style="margin-top:22px">' +
      '<section class="panel"><div class="panel-head"><h2 class="panel-title">章节分布</h2><span class="panel-sub">按 ch 编号</span></div><div class="panel-body">' + dataTable(['章节', '条目'], Object.keys(st.chapters).map(function (ch) { return { cells: [esc(ch), String(st.chapters[ch])] }; })) + '</div></section>' +
      '<section class="panel"><div class="panel-head"><h2 class="panel-title">模板速览</h2><span class="panel-sub">13 张</span></div><div class="panel-body"><div class="multi-actions">' +
      (currentSubject().templates || []).slice(0, 8).map(function (t) { return '<button class="chip" data-act="goto-template" data-template="' + attr(t.id) + '" type="button">' + esc(t.id) + ' ' + renderInline(t.title) + '</button>'; }).join('') +
      '</div></div></section>' +
    '</div>';
}

function overviewJieji(entries, st) {
  var pointRows = [];
  var pt = {};
  entries.forEach(function (e) { (e.points || []).forEach(function (p) { pt[p] = (pt[p] || 0) + 1; }); });
  Object.keys(pt).forEach(function (p) { pointRows.push({ cells: [renderInline(p), String(pt[p])] }); });
  var errRows = ['概念', '公式', '计算', '思路', '审题'].map(function (k) {
    return { cells: [esc(k), String(st.errors[k] || 0)] };
  });
  return '<div class="grid-2">' +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">记录</h2><span class="panel-sub">最新的放最上面</span></div><div class="panel-body">' +
      (entries.length ? dataTable(['题号', '日期', '知识要点', '模板', '状态'], entries.slice().reverse().map(function (e) {
        return { className: 'is-link', attrs: 'data-act="jump-entry" data-id="' + attr(e.id) + '"', cells: [
          '<span class="num-cell">' + esc(e.code) + '</span>', esc(e.date), renderInline((e.points || []).join('；')), '<span class="mono">' + esc(e.templateId || '—') + '</span>', statusPill(e)
        ] };
      })) : emptyState('解析几何还没有记录', '这个本子 2026-10-22 建立，目前总题数 0。手动新增第一条时按 README 的四件套填，也可以交给智能录入。', '<div class="multi-actions">' + entryCreateButtons('jieji') + '<button class="btn" data-act="nav-view" data-view="guide" type="button">看格式示范</button></div>')) +
    '</div></section>' +
    '<div style="display:grid;gap:22px">' +
      '<section class="panel"><div class="panel-head"><h2 class="panel-title">知识要点索引</h2><span class="panel-sub">按要点聚合</span></div><div class="panel-body">' +
        (pointRows.length ? dataTable(['知识要点', '题号'], pointRows) : '<p class="empty-inline">（暂无记录）</p>') + '</div></section>' +
      '<section class="panel"><div class="panel-head"><h2 class="panel-title">错因统计</h2><span class="panel-sub">概念 / 公式 / 计算 / 思路 / 审题</span></div><div class="panel-body">' + dataTable(['错因', '数量'], errRows) + '</div></section>' +
    '</div>' +
  '</div>';
}
