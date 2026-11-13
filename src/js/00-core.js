/* =========================================================
   00-core — constants, state, helpers
   ========================================================= */
var SEED = window.__SEED__;
var BANKS = window.__BANKS__ || {};
var PAGES = !!window.__PAGES__;
var IS_GITHUB_PAGES = /\.github\.io$/i.test(location.hostname);
var SUBJECTS = SEED.subjects;
var SUBJ_BY_ID = {};
var LEGACY_SUBJECT_ID = 'xifang';
var CANONICAL_SUBJECT_ID = 'xijing';
var subjectMigrationPending = false;
function subjectRouteId(id) { return id; }
function subjectFromRoute(id) { return id; }

SUBJECTS.forEach(function (s) { SUBJ_BY_ID[s.id] = s; });
var VIEWS = [
  { id: 'overview', label: '总览' },
  { id: 'stats', label: '统计' },
  { id: 'entries', label: '错题' },
  { id: 'templates', label: '模板库' },
  { id: 'bank', label: '题库' },
  { id: 'guide', label: '规范' }
];
var STORAGE_KEY = 'sanke-cuotiben-v1';
var EMPTY_EPOCH = '2026-10-24-empty-v1';
var TOKEN_KEY = 'sanke-sync-token';
var THEME_ORDER = ['auto', 'light', 'dark'];
var THEME_LABEL = { auto: '自动', light: '浅色', dark: '深色' };
var STATUS_LABEL = { mastered: '已掌握', unmastered: '未掌握' };
var ERROR_TYPES = ['概念', '计算', '方法选择', '条件漏用', '表述'];
var REVIEW_DAY_NUMBERS = [1, 2, 3, 4, 5, 7, 8, 10, 12, 14, 15, 18, 21, 23, 25, 30, 32, 35, 45, 50, 60, 70, 90, 95, 120, 125, 160, 180, 210, 270, 365];
var REVIEW_DAYS = REVIEW_DAY_NUMBERS.map(function (n) { return 'd' + n; });
var REVIEW_LABEL = {};
REVIEW_DAY_NUMBERS.forEach(function (n) { REVIEW_LABEL['d' + n] = 'D' + n; });
var REVIEW_OFFSET_DAYS = {};
REVIEW_DAY_NUMBERS.forEach(function (n) { REVIEW_OFFSET_DAYS['d' + n] = n; });

function reviewOffsetForDay(day) {
  var n = Number(String(day || '').replace(/^d/, ''));
  return n > 0 ? n : null;
}

function reviewDayKey(n) { return 'd' + n; }
function reviewDayLabel(day) { var n = reviewOffsetForDay(day); return n ? 'D' + n : String(day || ''); }

var DIFFICULTY_VERSION = 2;
var REVIEW_PLAN_VERSION = 3;
var REVIEW_MAX_DAY = 1800;

function normalizeStars(n) {
  n = Math.round(Number(n));
  if (!isFinite(n) || n < 1) n = 1;
  return Math.min(5, n);
}

function entryContentLength(entry) {
  var len = String((entry && entry.summary) || '').length;
  ((entry && entry.blocks) || []).forEach(function (b) { len += String((b && b.md) || '').length; });
  ((entry && entry.variants) || []).forEach(function (v) { len += String((v && v.q) || '').length + String((v && v.a) || '').length; });
  return len;
}

function assessEntryDifficulty(entry) {
  var old = normalizeStars(entry && entry.stars || 2);
  var score = old === 1 ? 1.0 : old === 2 ? 2.4 : old === 3 ? 3.7 : old === 4 ? 4.2 : 4.6;
  var points = ((entry && entry.points) || []).length;
  var variants = ((entry && entry.variants) || []).length;
  var types = ((entry && entry.errorTypes) || []).length;
  var summary = String((entry && entry.summary) || '').length;
  var content = entryContentLength(entry);
  if (points >= 2) score += 0.16;
  if (points >= 4) score += 0.16;
  if (points >= 6) score += 0.16;
  if (variants >= 1) score += 0.20;
  if (variants >= 2) score += 0.20;
  if (variants >= 4) score += 0.16;
  if (types >= 2) score += 0.14;
  if (types >= 3) score += 0.14;
  if (summary >= 45) score += 0.14;
  if (summary >= 100) score += 0.14;
  if (content >= 900) score += 0.20;
  if (content >= 2200) score += 0.24;
  return normalizeStars(Math.round(score));
}

function assessBankDifficulty(item) {
  var prior = normalizeStars(item && (item.baseDifficulty || item.difficulty) || 2);
  var score = prior === 1 ? 1.0 : prior === 2 ? 2.3 : prior === 3 ? 3.6 : prior === 4 ? 4.2 : 4.6;
  var question = String((item && item.question) || '').length;
  var solution = String((item && item.standardSolution) || '').length + String((item && item.detailedAnalysis) || '').length;
  var steps = ((item && item.solution) || []).length;
  var pitfalls = ((item && item.pitfalls) || []).length;
  if (question >= 220) score += 0.18;
  if (question >= 520) score += 0.18;
  if (solution >= 500) score += 0.18;
  if (solution >= 1400) score += 0.22;
  if (steps >= 3) score += 0.18;
  if (steps >= 6) score += 0.18;
  if (pitfalls >= 2) score += 0.14;
  if (pitfalls >= 4) score += 0.14;
  return normalizeStars(Math.round(score));
}

var REVIEW_BASE_PLANS = {
  1: [1, 2, 4, 7, 11, 16, 23, 32, 44, 60, 80, 105, 140, 185, 245, 320, 420, 550, 720, 900],
  2: [1, 2, 4, 7, 10, 15, 21, 29, 40, 54, 72, 95, 125, 165, 215, 280, 365, 475, 620, 800, 1020],
  3: [1, 2, 3, 5, 8, 13, 20, 29, 42, 59, 81, 110, 148, 198, 264, 350, 462, 608, 798, 1040, 1350, 1750],
  4: [1, 2, 3, 4, 6, 9, 13, 19, 27, 38, 53, 73, 99, 133, 177, 233, 305, 397, 515, 665, 855, 1090, 1380, 1750],
  5: [1, 2, 3, 4, 5, 7, 10, 14, 19, 25, 33, 43, 56, 72, 92, 117, 148, 187, 235, 295, 370, 463, 578, 720, 895, 1110, 1370, 1680]
};

function addReviewPlanExtras(plan, count) {
  var out = plan.slice();
  for (var n = 0; n < count; n++) {
    var best = -1, bestGap = 0;
    for (var i = 3; i < out.length; i++) {
      var gap = out[i] - out[i - 1];
      if (gap > bestGap) { bestGap = gap; best = i; }
    }
    if (best < 0 || bestGap < 8) break;
    out.splice(best, 0, Math.round((out[best - 1] + out[best]) / 2));
  }
  return out;
}

function reviewBasePlan(level) {
  var n = Number(level);
  var star = n >= 11 ? Math.floor(n / 10) : n;
  star = Math.max(1, Math.min(5, star || 1));
  var sub = n >= 11 ? (n % 10 || 1) : 1;
  var plan = (REVIEW_BASE_PLANS[star] || REVIEW_BASE_PLANS[1]).slice();
  if (sub >= 2) plan = addReviewPlanExtras(plan, 2);
  if (sub >= 3) plan = addReviewPlanExtras(plan, 2);
  return plan;
}

function reviewDifficultyScore(entry) {
  var star = normalizeStars(entry && entry.stars);
  var score = star;
  score += Math.min(0.6, ((entry && entry.points || []).length) * 0.08);
  score += Math.min(0.6, ((entry && entry.variants || []).length) * 0.10);
  score += Math.min(0.4, ((entry && entry.errorTypes || []).length) * 0.10);
  score += Math.min(0.2, entryContentLength(entry) / 10000);
  return score;
}

function reviewBaseLevel(entry) {
  var star = normalizeStars(entry && entry.stars);
  var score = reviewDifficultyScore(entry);
  var sub = 1;
  if (score >= star + 0.45) sub = 2;
  if (score >= star + 0.95) sub = 3;
  return star * 10 + sub;
}

function reviewPlanSeed(entry) {
  var text = String((entry && (entry.id || entry.code || entry.date || entry.updatedAt)) || 'x');
  var h = 2166136261;
  for (var i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
  return h >>> 0;
}

function reviewPlanFor(entry) {
  if (!entry) return [1, 2, 4, 7];
  var stars = normalizeStars(entry.stars);
  var existing = (entry.reviewPlan || []).map(Number).filter(function (n) { return n > 0; });
  var level = reviewBaseLevel(entry);
  if (existing.length && entry.reviewPlanStars === stars && entry.reviewPlanVersion === REVIEW_PLAN_VERSION && entry.reviewPlanLevel === level) {
    return existing.slice().sort(function (a, b) { return a - b; });
  }
  var base = reviewBasePlan(level);
  var seed = reviewPlanSeed(entry);
  var plan = [1];
  for (var i = 1; i < base.length; i++) {
    var jitter = i >= 3 ? ((seed >>> ((i % 8) * 3)) % 3) - 1 : 0;
    var next = Math.max(plan[plan.length - 1] + 1, base[i] + jitter);
    if (next > REVIEW_MAX_DAY) break;
    plan.push(next);
  }
  Object.keys(entry.review || {}).forEach(function (k) {
    var n = reviewOffsetForDay(k);
    if (n && entry.review[k]) plan.push(n);
  });
  plan = plan.filter(function (n, i) { return plan.indexOf(n) === i; }).sort(function (a, b) { return a - b; });
  entry.reviewPlan = plan;
  entry.reviewPlanStars = stars;
  entry.reviewPlanVersion = REVIEW_PLAN_VERSION;
  entry.reviewPlanLevel = level;
  return plan;
}

function reviewPlanKeys(entry) {
  return reviewPlanFor(entry).map(function (n) { return reviewDayKey(n); });
}

function reviewGapDays(entry, day) {
  var plan = reviewPlanFor(entry);
  var n = reviewOffsetForDay(day);
  var idx = plan.indexOf(n);
  if (idx <= 0) return n || 0;
  return n - plan[idx - 1];
}

function reviewUnlockTimestamp(entry, day) {
  var days = reviewOffsetForDay(day);
  if (!days) return null;
  var raw = entry && (entry.date || entry.createdAt || entry.updatedAt);
  var base = raw ? parseEntryDate(raw) : null;
  if (!base || isNaN(base.getTime())) return null;
  return base.getTime() + Math.max(0, days - 1) * 86400000;
}

function reviewAbsoluteUnlocked(entry, day, nowMs) {
  var at = reviewUnlockTimestamp(entry, day);
  return at == null || (nowMs == null ? Date.now() : nowMs) >= at;
}

function reviewCheckTimestamp(entry, day) {
  var at = entry && entry.reviewAt;
  if (at && at[day]) {
    var direct = parseEntryDate(at[day]);
    if (direct) return direct.getTime();
  }
  var md = '';
  (entry && entry.blocks || []).forEach(function (b) {
    if (b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || '')))) md += '\n' + String(b.md || '');
  });
  var re = /-\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s*·\s*(D\d+)\s*复习打卡/g;
  var m;
  var latest = 0;
  var label = reviewDayLabel(day);
  while ((m = re.exec(md))) {
    if (m[2] !== label) continue;
    var t = parseEntryDate(m[1]);
    if (t && t.getTime() > latest) latest = t.getTime();
  }
  return latest || null;
}

function reviewLastCheckTimestamp(entry) {
  var latest = 0;
  reviewPlanFor(entry).forEach(function (n) {
    var d = reviewDayKey(n);
    if (!entry.review || !entry.review[d]) return;
    var t = reviewCheckTimestamp(entry, d);
    if (t && t > latest) latest = t;
  });
  return latest || null;
}

function reviewDayAvailableAt(entry, day) {
  var at = reviewUnlockTimestamp(entry, day);
  if (at == null) return null;
  var plan = reviewPlanFor(entry);
  var n = reviewOffsetForDay(day);
  var idx = plan.indexOf(n);
  if (idx <= 0) return at;
  var lastCheckAt = 0;
  for (var i = 0; i < idx; i++) {
    var prevAt = reviewCheckTimestamp(entry, reviewDayKey(plan[i]));
    if (prevAt && prevAt > lastCheckAt) lastCheckAt = prevAt;
  }
  if (lastCheckAt) at = Math.max(at, lastCheckAt + reviewGapDays(entry, day) * 86400000);
  return at;
}

function reviewDayUnlocked(entry, day, nowMs) {
  var at = reviewDayAvailableAt(entry, day);
  return at == null || (nowMs == null ? Date.now() : nowMs) >= at;
}

function reviewCanOpenDay(entry, day, nowMs) {
  if (!entry || !day || entry.review && entry.review[day]) return false;
  var plan = reviewPlanKeys(entry);
  var idx = plan.indexOf(day);
  if (idx < 0) return false;
  for (var i = 0; i < idx; i++) if (!entry.review[plan[i]]) return false;
  return reviewDayUnlocked(entry, day, nowMs);
}

function removeReviewLogDayLine(md, day) {
  var label = reviewDayLabel(day);
  var re = new RegExp('(?:^|\\n)-[^\\n]*\\b' + label + '\\b[^\\n]*复习打卡[^\\n]*', 'g');
  return String(md || '').replace(re, '').replace(/\n{3,}/g, '\n\n').trim();
}

function stripPendingReviewLabel(md) {
  return String(md || '').replace(/\s*[（(]\s*(?:待复习|待復習|pending review|review pending|to review|à revoir|à réviser|zu wiederholen|noch zu wiederholen|復習待ち|복습 대기|a revisar|para revisar|к повторению|pending)\s*[)）]/gi, '');
}

function removeMasteryLogLine(md) {
  return String(md || '').replace(/(?:^|\n)-[^\n]*·\s*已掌握[^\n]*(?=\n|$)/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function ensureMasteryLogLine(md, stamp) {
  var t = stripPendingReviewLabel(md).trim();
  if (/(?:^|\n)-[^\n]*·\s*已掌握[^\n]*(?=\n|$)/.test(t)) return t;
  var line = '- ' + stamp + ' · 已掌握';
  return t ? t + '\n' + line : line;
}

var BOOK_META = {
  gaodai: {
    label: '',
    short: '',
    chapters: [
      '第一章 多项式', '第二章 行列式', '第三章 线性方程组', '第四章 矩阵', '第五章 二次型',
      '第六章 线性空间', '第七章 线性变换', '第八章 λ-矩阵', '第九章 欧几里得空间', '第十章 双线性函数与辛空间'
    ]
  },
  shufen: {
    label: '',
    short: '',
    chapters: [
      '第一章 实数集与函数', '第二章 数列极限', '第三章 函数极限', '第四章 函数的连续性',
      '第五章 导数和微分', '第六章 微分中值定理及其应用', '第七章 实数的完备性',
      '第八章 不定积分', '第九章 定积分', '第十章 定积分的应用', '第十一章 反常积分',
      '第十二章 数项级数', '第十三章 函数列与函数项级数', '第十四章 幂级数',
      '第十五章 傅里叶级数', '第十六章 多元函数的极限与连续', '第十七章 多元函数微分学',
      '第十八章 隐函数定理及其应用', '第十九章 含参量积分', '第二十章 曲线积分',
      '第二十一章 重积分', '第二十二章 曲面积分', '第二十三章 向量函数微分学'
    ]
  },
  jieji: {
    label: '',
    short: '',
    chapters: [
      '第一章 向量与坐标', '第二章 轨迹与方程', '第三章 平面与空间直线',
      '第四章 柱面、锥面、旋转曲面与二次曲面', '第五章 二次曲线的一般理论',
      '第六章 二次曲面的一般理论'
    ]
  },
  xijing: {
    label: '',
    short: '',
    chapters: [
      '第一章 需求、供给和均衡价格', '第二章 消费者选择', '第三章 企业的生产和成本',
      '第四章 完全竞争市场', '第五章 不完全竞争市场', '第六章 生产要素市场和收入分配',
      '第七章 一般均衡与效率', '第八章 市场失灵和微观经济政策',
      '第九章 宏观经济的基本指标及其衡量', '第十章 国民收入的决定：收入-支出模型',
      '第十一章 国民收入的决定：IS-LM 模型', '第十二章 国民收入的决定：AD-AS 模型',
      '第十三章 失业、通货膨胀和经济周期', '第十四章 开放条件下的宏观经济',
      '第十五章 宏观经济政策', '第十六章 经济增长'
    ]
  }
};

function bookMetaFor(subjectId) {
  return BOOK_META[subjectId] || null;
}

function bookLabelFor(subjectId) {
  var meta = bookMetaFor(subjectId);
  return meta ? meta.label : '';
}

function bookShortFor(subjectId) {
  var meta = bookMetaFor(subjectId);
  return meta ? meta.short : '';
}

function chapterSortValue(subjectId, chapter) {
  var meta = bookMetaFor(subjectId);
  var ch = String(chapter || '未分章');
  if (meta) {
    var at = meta.chapters.indexOf(ch);
    if (at >= 0) return at + 1;
  }
  var digits = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  var m = ch.match(/第([一二三四五六七八九十]+)章/);
  if (!m) return 999;
  var t = m[1];
  if (t === '十') return 10;
  if (t.length === 1) return digits[t] || 999;
  if (t[0] === '十') return 10 + (digits[t[1]] || 0);
  if (t[1] === '十') return (digits[t[0]] || 0) * 10 + (t[2] ? digits[t[2]] || 0 : 0);
  return 999;
}

function sortChapters(subjectId, list) {
  return (list || []).slice().sort(function (a, b) {
    var va = chapterSortValue(subjectId, a), vb = chapterSortValue(subjectId, b);
    if (va !== vb) return va - vb;
    return String(a).localeCompare(String(b), 'zh-Hans-CN');
  });
}

var isFreshLocal = false;
var clearedLocalEntries = false;
var codesMigrated = false;
var datesMigrated = false;
var bookOrderMigrated = false;
var BOOK_ORDER_VERSION = 2;
var CHAPTER_VALUE_VERSION = 2;
var chapterValuesMigrated = false;
var storageRecoveryBlocked = false;
var state = loadState();
sortBaseLibraryOrder();
if (clearedLocalEntries || codesMigrated || datesMigrated || bookOrderMigrated || chapterValuesMigrated) persistLocal();
var sync = {
  available: false,
  online: false,
  busy: false,
  lastSync: null,
  token: (function () { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } })()
};
var ui = {
  open: {},
  bankOpen: {},
  filters: {},
  bankFilters: {},
  templateFilters: {},
  noteKb: false,
  kbId: '',
  kbQuery: '',
  kbTag: '',
  kbPreview: true,
  kbGraph: false,
  noteFilter: 'all',
  noteQuery: '',
  finalPaperId: '',
  finalExpandedDay: '',
  finalExamMode: ''
};

function deepClone(v) { return JSON.parse(JSON.stringify(v)); }
function subjectSourceLabel(v) {
  return String(v || '').replace(/\/错题本\.md\s*$/, '').replace(/\/错题本\s*$/, '');
}

// Bank objective items must keep their A-D options when copied into an entry.
function bankQuestionMarkdown(it) {
  var md = String((it && it.question) || '');
  var opts = it && it.options;
  if (it && it.type === 'choice' && Array.isArray(opts) && opts.length) {
    md += '\n\n' + opts.map(function (o) {
      return String((o && o.key) || '') + '．' + String((o && o.text) || '');
    }).join('\n\n');
  }
  return md;
}

function esc(v) {
  if (v == null) return '';
  return String(v).replace(/\uFFFD+/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function attr(v) { return esc(v); }
function nowIso() { return new Date().toISOString(); }
var LANGUAGES = [
  { id: 'zh-CN', en: 'Chinese (Simplified)', native: '简体中文' },
  { id: 'zh-TW', en: 'Chinese (Traditional)', native: '繁體中文' },
  { id: 'en', en: 'English', native: 'English' },
  { id: 'fr', en: 'French', native: 'Français' },
  { id: 'de', en: 'German', native: 'Deutsch' },
  { id: 'ja', en: 'Japanese', native: '日本語' },
  { id: 'ko', en: 'Korean', native: '한국어' },
  { id: 'pt', en: 'Portuguese', native: 'Português' },
  { id: 'ru', en: 'Russian', native: 'Русский' },
  { id: 'es', en: 'Spanish', native: 'Español' }
];

function languageById(id) {
  return LANGUAGES.filter(function (l) { return l.id === id; })[0] || LANGUAGES[0];
}

function languageName(id) {
  var l = languageById(id || (state.prefs && state.prefs.lang) || 'zh-CN');
  if (l.id === 'zh-CN') return '简体中文';
  if (l.id === 'zh-TW') return '繁體中文';
  if (l.id === 'en') return 'English';
  return l.native + ' (' + l.en + ')';
}

function applyLanguage() {
  var l = languageById((state.prefs && state.prefs.lang) || 'zh-CN');
  document.documentElement.setAttribute('lang', l.id);
  document.documentElement.setAttribute('data-lang', l.id);
  document.documentElement.setAttribute('data-lang-group', ['en','fr','de','pt','ru','es'].indexOf(l.id) >= 0 ? 'latin' : 'cjk');
}

function pad(n, w) { var s = String(n); while (s.length < w) s = '0' + s; return s; }
function todayStamp() {
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2);
}
function parseEntryDate(input) {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : new Date(input.getTime());
  var raw = String(input || '').trim().replace(/\s*星期[一二三四五六日天]\s*$/, '');
  if (!raw) return null;
  var d = new Date(raw);
  if (!isNaN(d.getTime())) return d;
  var m = raw.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
}

function formatEntryDate(input) {
  var d = parseEntryDate(input);
  if (!d) return String(input || '—');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2) +
    ' ' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ' ' + ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];
}

function entryDateText(e) {
  if (!e) return '—';
  return formatEntryDate(e.date || e.createdAt || e.updatedAt || '');
}

function normalizeEntryDate(e, fallback) {
  if (!e || typeof e !== 'object') return;
  var old = String(e.date || '');
  var d = parseEntryDate(e.date);
  if (!d) d = parseEntryDate(e.createdAt) || parseEntryDate(e.updatedAt) || parseEntryDate(fallback) || new Date();
  var dateOnly = old.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (dateOnly) {
    var c = parseEntryDate(e.createdAt) || parseEntryDate(e.updatedAt);
    if (c && c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth() && c.getDate() === d.getDate()) {
      d.setHours(c.getHours(), c.getMinutes());
    }
  }
  var next = formatEntryDate(d);
  if (old !== next) datesMigrated = true;
  e.date = next;
}

function normalizeEntryDates(st) {
  if (!st || !st.entries) return;
  SUBJECTS.forEach(function (s) {
    (st.entries[s.id] || []).forEach(function (e) { normalizeEntryDate(e, st.updatedAt); });
  });
}

function chapterNameKey(chapter) {
  return String(chapter || '').replace(/^第\s*(?:\d+|[一二三四五六七八九十]+)\s*章\s*/, '').replace(/[\s·\-—_]/g, '').toLowerCase();
}

function chapterNumberFromText(chapter) {
  var s = String(chapter || '');
  var m = s.match(/第\s*(\d+|[一二三四五六七八九十]+)\s*章/);
  if (!m) return 0;
  var t = m[1];
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  var map = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  if (t === '十') return 10;
  if (t.length === 1) return map[t] || 0;
  if (t[0] === '十') return 10 + (map[t[1]] || 0);
  if (t[1] === '十') return (map[t[0]] || 0) * 10 + (t[2] ? map[t[2]] || 0 : 0);
  return 0;
}

function chapterListFor(subjectId) {
  var meta = bookMetaFor(subjectId);
  if (meta && meta.chapters && meta.chapters.length) return meta.chapters.slice();
  var base = (SUBJ_BY_ID[subjectId] && SUBJ_BY_ID[subjectId].templates) || [];
  var user = (typeof state !== 'undefined' && state && state.userTemplates && state.userTemplates[subjectId]) || [];
  var bankItems = (typeof BANKS !== 'undefined' && BANKS[subjectId] && BANKS[subjectId].items) || [];
  var userBank = (typeof state !== 'undefined' && state && state.userBank && state.userBank[subjectId]) || [];
  var chapters = [];
  base.concat(user, bankItems, userBank).forEach(function (t) {
    var ch = t && t.chapter;
    if (ch && ch !== '未分章' && chapters.indexOf(ch) < 0) chapters.push(ch);
  });
  return sortChapters(subjectId, chapters);
}

function canonicalChapterFor(subjectId, raw) {
  var list = chapterListFor(subjectId);
  var value = String(raw || '').trim();
  if (!list.length) return value;
  if (!value) return '未分章';
  if (list.indexOf(value) >= 0) return value;
  var key = chapterNameKey(value);
  var aliases = { '欧氏空间': '欧几里得空间', '欧式空间': '欧几里得空间', 'jordan标准形': '若尔当标准形' };
  if (aliases[key]) key = aliases[key];
  for (var i = 0; i < list.length; i++) {
    var nameKey = chapterNameKey(list[i]);
    if (nameKey === key) return list[i];
  }
  for (var j = 0; j < list.length; j++) {
    var nk = chapterNameKey(list[j]);
    if (key.length >= 2 && (nk.indexOf(key) >= 0 || key.indexOf(nk) >= 0)) return list[j];
  }
  var num = chapterNumberFromText(value);
  if (num >= 1 && num <= list.length) return list[num - 1];
  return '未分章';
}

function normalizeChapterValues(st) {
  if (!st) return;
  function fixItem(subjectId, item) {
    if (!item || typeof item !== 'object') return;
    var before = String(item.chapter || '');
    var next = canonicalChapterFor(subjectId, before);
    if (!next || next === '未分章') next = smartChapterFor(subjectId, item);
    if (next && next !== before) {
      item.chapter = next;
      chapterValuesMigrated = true;
    }
  }
  function fixList(subjectId, list) {
    if (!Array.isArray(list)) return;
    list.forEach(function (item) { fixItem(subjectId, item); });
  }
  SUBJECTS.forEach(function (s) {
    [st.entries, st.userTemplates, st.userBank].forEach(function (bag) {
      if (!bag || !Array.isArray(bag[s.id])) return;
      fixList(s.id, bag[s.id]);
    });
  });
  var fe = st.finalExam;
  if (fe && typeof fe === 'object') {
    (Array.isArray(fe.papers) ? fe.papers : []).forEach(function (paper) {
      if (!paper) return;
      fixList(paper.subject || fe.subject || st.activeSubject, paper.items);
    });
    if (fe.mock) {
      fixList(fe.mock.subject || fe.subject || st.activeSubject, fe.mock.questions);
      if (fe.mock.result) fixList(fe.mock.subject || fe.subject || st.activeSubject, fe.mock.result.questions);
    }
    (Array.isArray(fe.examHistory) ? fe.examHistory : []).forEach(function (h) {
      if (!h) return;
      fixList(h.subject || fe.subject || st.activeSubject, h.questions);
      if (h.result) fixList(h.subject || fe.subject || st.activeSubject, h.result.questions);
    });
  }
  if (st.chapterValueVersion !== CHAPTER_VALUE_VERSION) {
    st.chapterValueVersion = CHAPTER_VALUE_VERSION;
    chapterValuesMigrated = true;
  }
}

function compareBookOrder(subjectId, a, b) {
  var ca = chapterSortValue(subjectId, a && a.chapter);
  var cb = chapterSortValue(subjectId, b && b.chapter);
  if (ca !== cb) return ca - cb;
  return String((a && (a.id || a.code)) || '').localeCompare(String((b && (b.id || b.code)) || ''), undefined, { numeric: true });
}

function sortBaseLibraryOrder() {
  SUBJECTS.forEach(function (s) {
    if (Array.isArray(s.templates)) s.templates.sort(function (a, b) { return compareBookOrder(s.id, a, b); });
  });
  Object.keys(BANKS || {}).forEach(function (id) {
    if (BANKS[id] && Array.isArray(BANKS[id].items)) {
      BANKS[id].items.sort(function (a, b) { return compareBookOrder(id, a, b); });
    }
  });
}

function normalizeBookOrder(st) {
  if (!st) return;
  SUBJECTS.forEach(function (s) {
    [['entries', st.entries], ['userTemplates', st.userTemplates], ['userBank', st.userBank]].forEach(function (pair) {
      var bag = pair[1];
      if (!bag || !Array.isArray(bag[s.id])) return;
      var before = bag[s.id].map(function (x) { return x && (x.id || x.code); }).join('|');
      bag[s.id].sort(function (a, b) { return compareBookOrder(s.id, a, b); });
      var after = bag[s.id].map(function (x) { return x && (x.id || x.code); }).join('|');
      if (before !== after) bookOrderMigrated = true;
    });
  });
  if (st.chapterOrderVersion !== BOOK_ORDER_VERSION) {
    st.chapterOrderVersion = BOOK_ORDER_VERSION;
    bookOrderMigrated = true;
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2) +
    ' ' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2);
}
function timeAgo(iso) {
  if (!iso) return '';
  var t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  var diff = Date.now() - t;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
  if (diff < 86400000 * 30) return Math.floor(diff / 86400000) + ' 天前';
  return formatDate(iso).slice(0, 10);
}
function stars(n) { return n > 0 ? '★'.repeat(n) : ''; }
function uniq(arr) { var seen = {}; return arr.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function seedState() {
  var entries = {};
  SUBJECTS.forEach(function (s) { entries[s.id] = deepClone(s.entries); });
  return {
    version: 1,
    rev: 0,
    updatedAt: nowIso(),
    activeSubject: 'gaodai',
    activeView: 'overview',
    entries: entries,
    notes: { gaodai: [], shufen: [], jieji: [], xijing: [] },
    notifications: [],
    notifVersion: '',
    knowledgeNotes: [],
    kbSeeded: false,
    userTemplates: { gaodai: [], shufen: [], jieji: [], xijing: [] },
    userBank: { gaodai: [], shufen: [], jieji: [], xijing: [] },
    finalExam: { date: '', duration: 120, subject: '', chapterSel: {}, items: [], papers: [], done: {} },
    prefs: { theme: 'auto', autoAi: true, userName: '', lang: 'zh-CN', apiNoticeDismissed: false },
    chapterOrderVersion: BOOK_ORDER_VERSION,
    chapterValueVersion: CHAPTER_VALUE_VERSION,
    clearEpoch: EMPTY_EPOCH
  };
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    lastWrittenRaw = raw || null;
    if (!raw) { isFreshLocal = true; return seedState(); }
    var st = JSON.parse(raw);
    if (!stateCollectionsIntact(st)) throw new Error('Invalid saved state');
    // Migration must preserve user entries, including backups predating clearEpoch.
    migrateLegacySubjectKeys(st);
    st.clearEpoch = EMPTY_EPOCH;
    var migrated = migrateState(st);
    if (subjectMigrationPending) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); } catch (err) { /* quota */ }
    }
    return migrated;
  } catch (e) {
    storageRecoveryBlocked = true;
    setTimeout(function () { if (typeof toast === 'function') toast('无法读取原有数据，已保留原始存储；请先导出原始数据或恢复备份，再继续保存'); }, 0);
    return seedState();
  }
}

function entryMigrationTime(e) {
  var raw = e.createdAt || e.date || e.updatedAt || '';
  var t = Date.parse(raw);
  if (!isNaN(t)) return t;
  var m = String(raw).match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : 0;
}

function normalizeEntryCodes(st) {
  var prefixes = { gaodai: 'A', jieji: 'G', xijing: 'E' };
  Object.keys(prefixes).forEach(function (subjectId) {
    var list = st.entries[subjectId] || [];
    var prefix = prefixes[subjectId];
    var re = new RegExp('^' + prefix + '-(\\d{3,})$');
    var allNew = list.every(function (e) { return e && re.test(String(e.code || '')); });
    if (allNew) return;
    var decorated = list.map(function (e, i) { return { e: e, i: i, t: entryMigrationTime(e) }; });
    decorated.sort(function (a, b) { return a.t !== b.t ? a.t - b.t : a.i - b.i; });
    decorated.forEach(function (item, index) {
      item.e.code = prefix + '-' + pad(index + 1, 3);
    });
    codesMigrated = true;
  });
}

function migrateLegacySubjectKeys(st) {
  if (!st || typeof st !== 'object') return st;
  var changed = false;
  function mergeList(target, source) {
    if (!Array.isArray(source)) return target;
    var seen = {};
    target.forEach(function (x) { if (x && x.id) seen[x.id] = 1; });
    source.forEach(function (x) {
      if (!x) return;
      if (x.id && seen[x.id]) return;
      target.push(x);
      if (x.id) seen[x.id] = 1;
    });
    return target;
  }
  if (st.entries && st.entries[LEGACY_SUBJECT_ID]) {
    st.entries[CANONICAL_SUBJECT_ID] = mergeList(Array.isArray(st.entries[CANONICAL_SUBJECT_ID]) ? st.entries[CANONICAL_SUBJECT_ID] : [], st.entries[LEGACY_SUBJECT_ID]);
    delete st.entries[LEGACY_SUBJECT_ID];
    changed = true;
  }
  if (st.notes && st.notes[LEGACY_SUBJECT_ID]) {
    st.notes[CANONICAL_SUBJECT_ID] = mergeList(Array.isArray(st.notes[CANONICAL_SUBJECT_ID]) ? st.notes[CANONICAL_SUBJECT_ID] : [], st.notes[LEGACY_SUBJECT_ID]);
    delete st.notes[LEGACY_SUBJECT_ID];
    changed = true;
  }
  if (st.notebooks && st.notebooks[LEGACY_SUBJECT_ID]) {
    st.notebooks[CANONICAL_SUBJECT_ID] = mergeList(Array.isArray(st.notebooks[CANONICAL_SUBJECT_ID]) ? st.notebooks[CANONICAL_SUBJECT_ID] : [], st.notebooks[LEGACY_SUBJECT_ID]);
    delete st.notebooks[LEGACY_SUBJECT_ID];
    changed = true;
  }
  if (st.activeSubject === LEGACY_SUBJECT_ID) {
    st.activeSubject = CANONICAL_SUBJECT_ID;
    changed = true;
  }
  if (st.entries && typeof st.entries === 'object') {
    Object.keys(st.entries).forEach(function (key) {
      (st.entries[key] || []).forEach(function (e) {
        if (e && e.subject === LEGACY_SUBJECT_ID) { e.subject = CANONICAL_SUBJECT_ID; changed = true; }
      });
    });
  }
  if (st.notes && typeof st.notes === 'object') {
    Object.keys(st.notes).forEach(function (key) {
      (st.notes[key] || []).forEach(function (page) {
        if (page && page.subject === LEGACY_SUBJECT_ID) { page.subject = CANONICAL_SUBJECT_ID; changed = true; }
      });
    });
  }
  if (Array.isArray(st.noteBooks)) {
    st.noteBooks.forEach(function (book) {
      if (!book) return;
      if (book.subject === LEGACY_SUBJECT_ID) { book.subject = CANONICAL_SUBJECT_ID; changed = true; }
    });
  }
  if (changed) subjectMigrationPending = true;
  return st;
}

function migrateEntryEmbeddedImages(e) {
  if (!e || typeof e !== 'object') return false;
  var changed = false;
  if (!Array.isArray(e.attachments)) e.attachments = [];
  var attachmentBlock = 'user';
  (e.blocks || []).forEach(function (b) {
    if (!b) return;
    if (b.key === 'user' || b.key === 'attempt') attachmentBlock = b.key;
    else if (/我的.*(错解|作答|卡点)/.test(String(b.title || ''))) attachmentBlock = b.key;
  });
  var re = /!\[([^\]]*)\]\((data:image\/[a-z0-9.+-]+;base64,[^)\s]+)\)/gi;
  (e.blocks || []).forEach(function (b) {
    if (!b || typeof b.md !== 'string' || b.md.indexOf('data:image/') < 0) return;
    b.md = b.md.replace(re, function (m, label, data) {
      var name = label || '手写作答';
      if (!e.attachments.some(function (a) { return a && a.data === data; })) {
        e.attachments.push({ label: name, data: data, block: attachmentBlock });
      }
      changed = true;
      return '原图见条目附件。';
    });
  });
  return changed;
}

function stateCollectionsIntact(st) {
  if (!st || typeof st !== 'object' || Array.isArray(st)) return false;
  if (!st.entries || typeof st.entries !== 'object' || Array.isArray(st.entries)) return false;
  for (var i = 0; i < SUBJECTS.length; i++) {
    var list = st.entries[SUBJECTS[i].id];
    if (list == null) continue;
    if (!Array.isArray(list)) return false;
    for (var j = 0; j < list.length; j++) {
      if (!list[j] || typeof list[j] !== 'object' || Array.isArray(list[j])) return false;
    }
  }
  if (st.noteBooks != null) {
    if (!Array.isArray(st.noteBooks)) return false;
    for (var b = 0; b < st.noteBooks.length; b++) {
      var book = st.noteBooks[b];
      if (!book || typeof book !== 'object' || Array.isArray(book)) return false;
      if (book.pages != null && !Array.isArray(book.pages)) return false;
    }
  }
  if (st.notifications != null && !Array.isArray(st.notifications)) return false;
  if (st.knowledgeNotes != null && !Array.isArray(st.knowledgeNotes)) return false;
  return true;
}

function sanitizeStateCollections(st) {
  if (!st || typeof st !== 'object' || Array.isArray(st)) return null;
  function bag(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function list(v, cap) {
    return (Array.isArray(v) ? v : []).filter(function (x) {
      return x && typeof x === 'object' && !Array.isArray(x);
    }).slice(0, cap || 100000);
  }
  st.entries = bag(st.entries);
  st.notes = bag(st.notes);
  st.userTemplates = bag(st.userTemplates);
  st.userBank = bag(st.userBank);
  SUBJECTS.forEach(function (s) {
    st.entries[s.id] = list(st.entries[s.id], 20000);
    st.notes[s.id] = list(st.notes[s.id], 5000);
    st.userTemplates[s.id] = list(st.userTemplates[s.id], 5000);
    st.userBank[s.id] = list(st.userBank[s.id], 20000);
    st.entries[s.id].forEach(function (e) {
      e.blocks = list(e.blocks, 200);
      e.variants = list(e.variants, 100);
      if (!e.review || typeof e.review !== 'object' || Array.isArray(e.review)) e.review = {};
      if (Array.isArray(e.attachments)) e.attachments = list(e.attachments, 100);
    });
    st.notes[s.id].forEach(function (page) {
      page.items = list(page.items, 5000);
    });
  });
  st.notifications = list(st.notifications, 5000).filter(function (n) { return n.id && n.title; });
  st.knowledgeNotes = list(st.knowledgeNotes, 5000);
  st.noteBooks = list(st.noteBooks, 2000);
  st.noteBooks.forEach(function (book) {
    book.pages = list(book.pages, 2000);
    book.pages.forEach(function (page) { page.items = list(page.items, 5000); });
  });
  if (st.notebooks && typeof st.notebooks === 'object' && !Array.isArray(st.notebooks)) {
    Object.keys(st.notebooks).forEach(function (k) { st.notebooks[k] = list(st.notebooks[k], 2000); });
  }
  st.finalExam = bag(st.finalExam);
  st.finalExam.items = list(st.finalExam.items, 5000);
  st.finalExam.papers = list(st.finalExam.papers, 2000);
  st.finalExam.examHistory = list(st.finalExam.examHistory, 5000);
  st.finalExam.done = bag(st.finalExam.done);
  if (st.finalExam.mock && (typeof st.finalExam.mock !== 'object' || Array.isArray(st.finalExam.mock))) st.finalExam.mock = null;
  st.prefs = bag(st.prefs);
  return st;
}

function migrateState(st) {
  if (!sanitizeStateCollections(st)) throw new Error('Invalid state');
  migrateLegacySubjectKeys(st);
  if (!st.version) st.version = 1;
  if (!st.rev) st.rev = 0;
  if (!st.updatedAt) st.updatedAt = nowIso();
  if (!st.finalExam || typeof st.finalExam !== 'object') st.finalExam = { date: '', duration: 120, items: [], papers: [], done: {} };
  if (typeof st.finalExam.date !== 'string') st.finalExam.date = '';
  if (!(Number(st.finalExam.duration) > 0)) st.finalExam.duration = 120;
  if (!SUBJ_BY_ID[st.finalExam.subject]) st.finalExam.subject = st.activeSubject || 'gaodai';
  if (!Array.isArray(st.finalExam.items)) st.finalExam.items = [];
  if (!Array.isArray(st.finalExam.papers)) st.finalExam.papers = [];
  if (!st.finalExam.done || typeof st.finalExam.done !== 'object') st.finalExam.done = {};
  if (!st.finalExam.mock || typeof st.finalExam.mock !== 'object') st.finalExam.mock = null;
  if (!st.finalExam.chapterSel || typeof st.finalExam.chapterSel !== 'object') st.finalExam.chapterSel = {};
  if (!st.prefs || !st.prefs.theme) st.prefs = { theme: 'auto', userName: '' };
  if (typeof st.prefs.userName !== 'string') st.prefs.userName = '';
  if (typeof st.prefs.apiNoticeDismissed !== 'boolean') st.prefs.apiNoticeDismissed = false;
  if (!st.prefs.lang) st.prefs.lang = 'zh-CN';
  if (typeof st.prefs.autoAi !== 'boolean') st.prefs.autoAi = true;
  if (!st.notes || typeof st.notes !== 'object') st.notes = {};
  if (!Array.isArray(st.notifications)) st.notifications = [];
  st.notifications = st.notifications.filter(function (n) { return n && typeof n === 'object' && n.id && n.title; });
  if (typeof st.notifVersion !== 'string') st.notifVersion = '';
  if (!Array.isArray(st.knowledgeNotes)) st.knowledgeNotes = [];
  if (typeof st.kbSeeded !== 'boolean') st.kbSeeded = st.knowledgeNotes.length > 0;
  st.knowledgeNotes.forEach(function (n) {
    if (!n || typeof n !== 'object') return;
    if (!n.id) n.id = 'kb-' + Math.random().toString(36).slice(2, 9);
    if (!Array.isArray(n.tags)) n.tags = [];
    if (typeof n.body !== 'string') n.body = '';
    if (typeof n.title !== 'string' || !n.title.trim()) n.title = '未命名笔记';
  });
  if (!st.userTemplates || typeof st.userTemplates !== 'object') st.userTemplates = {};
  if (!st.userBank || typeof st.userBank !== 'object') st.userBank = {};
  var skillRenamed = false;
  if (st.difficultyVersion !== DIFFICULTY_VERSION) subjectMigrationPending = true;
  SUBJECTS.forEach(function (s) {
    if (!Array.isArray(st.userTemplates[s.id])) st.userTemplates[s.id] = [];
    if (!Array.isArray(st.userBank[s.id])) st.userBank[s.id] = [];
    if (!st.prefs.entrySorts || typeof st.prefs.entrySorts !== 'object') st.prefs.entrySorts = {};
    if (!Array.isArray(st.notes[s.id])) st.notes[s.id] = [];
    st.notes[s.id].forEach(function (page) { if (!Array.isArray(page.items)) page.items = []; });
    if (!Array.isArray(st.entries[s.id])) st.entries[s.id] = deepClone(s.entries);
    st.entries[s.id].forEach(function (e) {
      if (migrateEntryEmbeddedImages(e)) subjectMigrationPending = true;
      if (st.difficultyVersion !== DIFFICULTY_VERSION) e.stars = assessEntryDifficulty(e);
      if (e.status !== 'mastered' && e.status !== 'unmastered') e.status = 'unmastered';
      if (!e.review) e.review = { d1: false, d3: false, d7: false, d15: false, d30: false };
      REVIEW_DAYS.forEach(function (d) { if (typeof e.review[d] !== 'boolean') e.review[d] = false; });
      reviewPlanFor(e);
      if (REVIEW_DAYS.some(function (d) { return e.review[d]; })) {
        (e.blocks || []).forEach(function (b) {
          if (b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || '')))) b.md = stripPendingReviewLabel(b.md);
        });
      }
      REVIEW_DAYS.forEach(function (d) {
        if (e.review[d] && !reviewAbsoluteUnlocked(e, d)) {
          e.review[d] = false;
          (e.blocks || []).forEach(function (b) {
            if (b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || '')))) b.md = removeReviewLogDayLine(b.md, d);
          });
        }
      });
      var intervalBroken = false;
      var previousCheckAt = null;
      var previousCheckDay = null;
      var checkedSeen = 0;
      var planDays = reviewPlanKeys(e);
      var firstPlanDay = planDays[0] || 'd1';
      planDays.forEach(function (d) {
        if (!e.review[d]) return;
        if (intervalBroken) {
          e.review[d] = false;
          if (e.reviewAt) delete e.reviewAt[d];
          (e.blocks || []).forEach(function (b) {
            if (b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || '')))) b.md = removeReviewLogDayLine(b.md, d);
          });
          return;
        }
        var checkedAt = reviewCheckTimestamp(e, d);
        var invalid = checkedSeen === 0 && d !== firstPlanDay;
        if (!invalid && previousCheckAt && checkedAt && previousCheckDay) {
          var required = (reviewOffsetForDay(d) - reviewOffsetForDay(previousCheckDay)) * 86400000;
          if (checkedAt - previousCheckAt < required) invalid = true;
        }
        if (invalid) {
          e.review[d] = false;
          if (e.reviewAt) delete e.reviewAt[d];
          intervalBroken = true;
          (e.blocks || []).forEach(function (b) {
            if (b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || '')))) b.md = removeReviewLogDayLine(b.md, d);
          });
          return;
        }
        if (checkedAt) { previousCheckAt = checkedAt; previousCheckDay = d; }
        checkedSeen++;
      });
      if (!Array.isArray(e.blocks)) e.blocks = [];
      if (e.status === 'mastered') {
        e.review.mastered = true;
        var logBlock = e.blocks.filter(function (b) {
          return b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || '')));
        })[0];
        if (!logBlock) {
          logBlock = { key: 'reviewlog', title: '复习记录', md: '' };
          e.blocks.push(logBlock);
        }
        logBlock.md = ensureMasteryLogLine(logBlock.md, formatDate(e.updatedAt || e.date || st.updatedAt));
      } else {
        e.review.mastered = false;
        e.blocks.forEach(function (b) {
          if (b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || '')))) b.md = removeMasteryLogLine(b.md);
        });
        e.blocks = e.blocks.filter(function (b) {
          return !(b && (b.key === 'reviewlog' || /复习记录/.test(String(b.title || ''))) && !String(b.md || '').trim());
        });
      }
      if (!Array.isArray(e.variants)) e.variants = [];
      if (!Array.isArray(e.points)) e.points = [];
      if (!Array.isArray(e.errorTypes)) e.errorTypes = [];
      if (!e.updatedAt) e.updatedAt = st.updatedAt;
      if (!e.aiStatus) e.aiStatus = (e.source && e.source.indexOf('智能录入') >= 0) ? 'done' : 'none';
      if (typeof e.aiAttempts !== 'number') e.aiAttempts = 0;
      if (!e.blocks) e.blocks = [];
      if (e.aiSkill === 'linear-algebra') { e.aiSkill = 'advanced-algebra'; skillRenamed = true; }
      if (e.skill === 'linear-algebra') { e.skill = 'advanced-algebra'; skillRenamed = true; }
      if (typeof e.source === 'string' && e.source.indexOf('/linear-algebra') >= 0) {
        e.source = e.source.replace(/\/linear-algebra\b/g, '/advanced-algebra');
        skillRenamed = true;
      }
      if (typeof e.source === 'string') {
        e.source = e.source.replace(/\s*·\s*\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?\s*$/, '').trim();
      }
    });
  });
  if (st.difficultyVersion !== DIFFICULTY_VERSION) {
    Object.keys(st.userBank || {}).forEach(function (sid) {
      (st.userBank[sid] || []).forEach(function (item) {
        if (!item || typeof item !== 'object') return;
        item.baseDifficulty = normalizeStars(item.baseDifficulty || item.difficulty || 2);
        item.difficulty = assessBankDifficulty(item);
      });
    });
    st.difficultyVersion = DIFFICULTY_VERSION;
  }
  normalizeEntryCodes(st);
  normalizeEntryDates(st);
  normalizeChapterValues(st);
  normalizeBookOrder(st);
  if (skillRenamed) subjectMigrationPending = true;
  if (!SUBJ_BY_ID[st.activeSubject]) st.activeSubject = 'gaodai';
  if (!VIEWS.some(function (v) { return v.id === st.activeView; })) st.activeView = 'overview';
  return st;
}

var persistQuotaWarned = false;
var lastWrittenRaw = null;

function mergeConflictStamp(e) {
  var t = Date.parse((e && (e.updatedAt || e.createdAt)) || '');
  return isNaN(t) ? 0 : t;
}

function mergeConflictId(e) {
  return String(e.id || '') + '-conflict-' + String(e.updatedAt || e.createdAt || '').replace(/[^0-9]/g, '').slice(0, 14);
}

function mergeConcurrentState(local, remote) {
  if (!local || !remote || !remote.entries) return local;
  var out = deepClone(local);
  out.entries = out.entries || {};
  function unionById(a, b, cap) {
    var list = (Array.isArray(a) ? a : []).slice();
    var seen = {};
    list.forEach(function (x) { if (x && x.id) seen[x.id] = true; });
    (Array.isArray(b) ? b : []).forEach(function (x) {
      if (!x || !x.id || seen[x.id]) return;
      list.push(deepClone(x));
      seen[x.id] = true;
    });
    return list.slice(0, cap || 100000);
  }
  SUBJECTS.forEach(function (subj) {
    var sid = subj.id;
    var list = Array.isArray(out.entries[sid]) ? out.entries[sid] : [];
    var byId = {};
    list.forEach(function (e) { if (e && e.id) byId[e.id] = e; });
    var incoming = Array.isArray(remote.entries[sid]) ? remote.entries[sid] : [];
    incoming.forEach(function (re) {
      if (!re || !re.id) return;
      var le = byId[re.id];
      if (!le) { list.push(re); byId[re.id] = re; return; }
      if (JSON.stringify(le) === JSON.stringify(re)) return;
      var lt = mergeConflictStamp(le), rt = mergeConflictStamp(re);
      var remoteWins = rt > lt;
      var winner = remoteWins ? re : le;
      var loser = remoteWins ? le : re;
      var cid = mergeConflictId(loser);
      if (!byId[cid]) {
        var copy = deepClone(loser);
        copy.id = cid;
        copy.code = String(loser.code || '') + '-副本';
        copy.syncConflictOf = loser.id;
        copy.syncConflictAt = nowIso();
        list.push(copy);
        byId[cid] = copy;
      }
      if (remoteWins) {
        var at = -1;
        for (var i = 0; i < list.length; i++) { if (list[i] && list[i].id === re.id) { at = i; break; } }
        if (at >= 0) list[at] = re;
        byId[re.id] = re;
      }
    });
    out.entries[sid] = list;
    out.userTemplates = out.userTemplates || {};
    out.userTemplates[sid] = unionById(out.userTemplates[sid], remote.userTemplates && remote.userTemplates[sid], 5000);
    out.userBank = out.userBank || {};
    out.userBank[sid] = unionById(out.userBank[sid], remote.userBank && remote.userBank[sid], 20000);
  });
  out.knowledgeNotes = unionById(out.knowledgeNotes, remote.knowledgeNotes, 5000);
  out.notifications = unionById(out.notifications, remote.notifications, 5000);
  out.noteBooks = unionById(out.noteBooks, remote.noteBooks, 2000);
  out.noteBooks.forEach(function (b) {
    if (!b) return;
    b.pages = unionById(b.pages, [], 2000);
  });
  if (remote.noteBooks) {
    var localBooks = {};
    out.noteBooks.forEach(function (b) { if (b && b.id) localBooks[b.id] = b; });
    remote.noteBooks.forEach(function (rb) {
      if (!rb || !rb.id) return;
      var lb = localBooks[rb.id];
      if (!lb) { out.noteBooks.push(deepClone(rb)); return; }
      lb.pages = unionById(lb.pages, rb.pages, 2000);
    });
  }
  var fe = out.finalExam = out.finalExam || {};
  var rfe = remote.finalExam || {};
  fe.items = unionById(fe.items, rfe.items, 5000);
  fe.papers = unionById(fe.papers, rfe.papers, 2000);
  fe.examHistory = unionById(fe.examHistory, rfe.examHistory, 5000);
  out.rev = Math.max(Number(out.rev) || 0, Number(remote.rev) || 0) + 1;
  out.updatedAt = nowIso();
  return out;
}

function adoptConcurrentState(remoteRaw) {
  if (!remoteRaw) return false;
  try {
    var remote = JSON.parse(remoteRaw);
    if (!remote || !remote.entries || typeof remote.entries !== 'object') return false;
    if (!sanitizeStateCollections(remote)) return false;
    var merged = mergeConcurrentState(state, remote);
    if (!merged) return false;
    state = merged;
    lastWrittenRaw = remoteRaw;
    if (typeof render === 'function' && (typeof topOpenDialog !== 'function' || !topOpenDialog())) render();
    return true;
  } catch (e) { return false; }
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', function (e) {
    if (!e || e.key !== STORAGE_KEY || !e.newValue) return;
    if (e.newValue === lastWrittenRaw) return;
    adoptConcurrentState(e.newValue);
  });
}

function persistLocal(quiet) {
  if (storageRecoveryBlocked) {
    if (typeof toast === 'function') toast('原始数据需要恢复，当前改动未保存；请先恢复有效备份');
    return false;
  }
  try {
    var diskRaw = null;
    try { diskRaw = localStorage.getItem(STORAGE_KEY); } catch (readErr) { diskRaw = null; }
    if (diskRaw && lastWrittenRaw != null && diskRaw !== lastWrittenRaw) {
      try {
        var remoteState = JSON.parse(diskRaw);
        if (remoteState && remoteState.entries && sanitizeStateCollections(remoteState)) {
          state = mergeConcurrentState(state, remoteState);
        }
      } catch (mergeErr) { /* keep local; still write */ }
    }
    var rawOut = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, rawOut);
    lastWrittenRaw = rawOut;
    persistQuotaWarned = false;
    subjectMigrationPending = false;
    return true;
  } catch (e) {
    if (!persistQuotaWarned) {
      persistQuotaWarned = true;
      if (!quiet) {
        try { if (typeof toast === 'function') toast('本机存储已满：请先导出备份，再删除不需要的笔记'); } catch (err) { /* boot */ }
      }
    }
    return false;
  }
}

function markDirty(extra, quiet) {
  state.syncDirty = true;
  state.updatedAt = nowIso();
  state.rev = (state.rev || 0) + 1;
  if (extra) Object.assign(state, extra);
  var ok = persistLocal(quiet);
  schedulePush();
  return ok;
}

function touchEntry(entry) { entry.updatedAt = nowIso(); }

function applyTheme() {
  var t = (state.prefs && state.prefs.theme) || 'auto';
  if (THEME_ORDER.indexOf(t) < 0) t = 'auto';
  document.documentElement.setAttribute('data-theme', t);
  var meta = qs('meta[name="theme-color"]');
  if (meta) {
    var dark = t === 'dark' || (t === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    meta.setAttribute('content', dark ? '#161813' : '#f4f1e9');
  }
}

function cycleTheme() {
  var cur = (state.prefs && state.prefs.theme) || 'auto';
  var next = THEME_ORDER[(THEME_ORDER.indexOf(cur) + 1) % THEME_ORDER.length];
  state.prefs.theme = next;
  applyTheme();
  persistLocal();
  toast('主题：' + THEME_LABEL[next], { title: '主题已切换', detail: '当前主题：' + THEME_LABEL[next] });
}

function topOpenDialog() {
  var open = qsa('dialog[open]');
  var top = null, latest = -1;
  open.forEach(function (d) {
    var t = d.__toastOrder || 0;
    if (t >= latest) { latest = t; top = d; }
  });
  return top;
}

function mountToast() {
  var wrap = qs('#toastWrap');
  if (!wrap) return;
  var target = topOpenDialog() || document.body;
  if (wrap.parentNode !== target) target.appendChild(wrap);
}

var __activeToasts = {};
function toast(msg, notifMeta) {
  var wrap = qs('#toastWrap');
  if (!wrap) return;
  // 同一条提示仍在屏幕上时不再叠加，避免存储恢复提示在启动阶段刷屏。
  if (__activeToasts[msg] && __activeToasts[msg].isConnected) return;
  var el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  mountToast();
  wrap.appendChild(el);
  __activeToasts[msg] = el;
  if (typeof mirrorToastNotification === 'function') mirrorToastNotification(msg, notifMeta);
  setTimeout(function () {
    el.style.transition = 'opacity .2s ease, transform .2s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(function () {
      el.remove();
      if (__activeToasts[msg] === el) delete __activeToasts[msg];
    }, 220);
  }, 2400);
}
