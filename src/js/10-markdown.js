/* ---- 10-markdown.js ---- */
/* =========================================================
   01-markdown — markdown + math rendering
   ========================================================= */
var MATH_TOKEN = '\uE000M';
var MATH_END = '\uE001';

function cleanMathSource(tex) {
  var t = String(tex || '').replace(/\uE000M\d+\uE001/g, '').trim();
  t = t.replace(/\\begin\{([a-zA-Z*]+)\}([\s\S]*?)\\end\{\1\}/g, function (m, env, body) {
    return '\\begin{' + env + '}' + body.replace(/(?<!\\)\$/g, '') + '\\end{' + env + '}';
  });
  t = t.replace(/^\$+|\$+$/g, '');
  // 西经题解里常见 \frac{名义GDP}{实际GDP}：中文放进 \text{}，否则 Temml 无法解析。
  t = t.replace(/\\frac\{([^{}]*[\u4e00-\u9fa5][^{}]*)\}\{([^{}]*[\u4e00-\u9fa5][^{}]*)\}/g, function (m, a, b) {
    return '\\frac{\\text{' + a + '}}{\\text{' + b + '}}';
  });
  // 修复教材/OCR 简写与 Unicode 数学符号。
  var supMap = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
  var subMap = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','ₐ':'a','ₑ':'e','ₒ':'o','ₓ':'x','ₕ':'h','ₖ':'k','ₗ':'l','ₘ':'m','ₙ':'n','ₚ':'p','ₛ':'s','ₜ':'t'};
  function supDigits(s) { return s.split('').map(function (c) { return supMap[c] || ''; }).join(''); }
  function subDigits(s) { return s.split('').map(function (c) { return subMap[c] || ''; }).join(''); }
  t = t.replace(/_([A-Za-z0-9]+)₊_?([0-9A-Za-z]+)/g, '_{$1+$2}');
  t = t.replace(/_([A-Za-z0-9]+)₋_?([0-9A-Za-z]+)/g, '_{$1-$2}');
  t = t.replace(/([⁻⁺])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, function (_, sign, digits) { return '^{' + (sign === '⁻' ? '-' : '+') + supDigits(digits) + '}'; });
  t = t.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, function (digits) { return '^{' + supDigits(digits) + '}'; });
  t = t.replace(/([₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₕₖₗₘₙₚₛₜ]+)/g, function (digits) { return '_{' + subDigits(digits) + '}'; });
  t = t.replace(/₊/g, '+').replace(/₋/g, '-').replace(/⁻/g, '-').replace(/⁺/g, '+');
  t = t.replace(/([A-Za-z0-9)\]])\s*⁻\s*\^?\s*(\d+)/g, '$1^{-$2}');
  t = t.replace(/([A-Za-z])-\^(\d+)/g, '$1^{-$2}');
  // 只合并同一变量后的纯数字下标（MRS_1_2 → MRS_{1,2}）；
  // 不能把 Y_1Z_2Y_3Z_4 误并成 Y_{1Z,2Y}_3Z_4。
  t = t.replace(/([A-Za-z]+)_(\d+)_(\d+)/g, '$1_{$2,$3}');
  t = t.replace(/([A-Za-z])\*(?![A-Za-z0-9])/g, '$1^{*}');
  t = t.replace(/≠/g, '\\ne ').replace(/≤/g, '\\le ').replace(/≥/g, '\\ge ').replace(/⇔|⟺/g, '\\Leftrightarrow ').replace(/⇒/g, '\\Rightarrow ').replace(/→/g, '\\to ').replace(/∈/g, '\\in ').replace(/∉/g, '\\notin ').replace(/±/g, '\\pm ').replace(/×/g, '\\times ').replace(/·/g, '\\cdot ').replace(/∞/g, '\\infty ').replace(/Δ/g, '\\Delta ').replace(/∑/g, '\\sum ').replace(/∫/g, '\\int ');
  t = t.replace(/−/g, '-');
  t = t.replace(/Σ/g, '\\sum ').replace(/Π/g, '\\prod ');
  // 教材里常把 lim/max/min 直接写成英文。用 \\lim 等标准算子，保留上下限位置；
  // lcm 没有对应算子，退回 \\operatorname。
  t = t.replace(/(^|[^\\A-Za-z])(sup|inf|lim|max|min|det|dim|ker|deg|gcd)(?=\s*(?:_|\^|[\(\[]|[A-Za-z]))/g, '$1\\$2 ');
  t = t.replace(/(^|[^\\A-Za-z])lcm(?=\s*(?:_|\^|[\(\[]|[A-Za-z]))/g, '$1\\operatorname{lcm}');
  t = t.replace(/\\not\s*\\iff/g, '\\not\\Leftrightarrow');
  t = t.replace(/₀/g, '_0').replace(/₁/g, '_1').replace(/₂/g, '_2').replace(/₃/g, '_3').replace(/₄/g, '_4').replace(/₅/g, '_5').replace(/₆/g, '_6').replace(/₇/g, '_7').replace(/₈/g, '_8').replace(/₉/g, '_9');
  t = t.replace(/ₐ/g, '_a').replace(/ₑ/g, '_e').replace(/ₒ/g, '_o').replace(/ₓ/g, '_x').replace(/ₕ/g, '_h').replace(/ₖ/g, '_k').replace(/ₗ/g, '_l').replace(/ₘ/g, '_m').replace(/ₙ/g, '_n').replace(/ₚ/g, '_p').replace(/ₛ/g, '_s').replace(/ₜ/g, '_t');
  t = t.replace(/⁰/g, '^0').replace(/¹/g, '^1').replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6').replace(/⁷/g, '^7').replace(/⁸/g, '^8').replace(/⁹/g, '^9').replace(/ⁿ/g, '^n').replace(/ⁱ/g, '^i');
  // Unicode 上下标全部转成 ^/_ 后，再合并相邻双上标：^n^{+1} / ^n^{-1} → ^{n+1} / ^{n-1}。
  t = t.replace(/\^([A-Za-z0-9])\^\{?([+-]?[A-Za-z0-9]+)\}?/g, '^{$1$2}');
  t = t.replace(/\^\{([^{}]+)\}\^\{?([+-]?[A-Za-z0-9]+)\}?/g, '^{$1$2}');
  t = t.replace(/(^|[^_A-Za-z0-9])_{2,}/g, '$1\\underline{\\quad\\quad}');
  t = t.replace(/(^|[^A-Za-z0-9_])_{2,}/g, '$1\\underline{\\quad\\quad}');
  t = t.replace(/_{3,}/g, '\\underline{\\quad\\quad}');
  t = t.replace(/\\underline\{\\quad\\quad\}_{2,}/g, '\\underline{\\quad\\quad}');
  return t.trim();
}

function renderMath(tex, display) {
  var source = cleanMathSource(tex);
  try {
    if (window.temml && typeof temml.renderToString === 'function') {
      var html = temml.renderToString(source, { displayMode: !!display, throwOnError: false, annotate: false });
      if (html && html.indexOf('temml-error') < 0 && html.indexOf('ParseError') < 0 && html.indexOf('math-raw') < 0) return html;
    }
  } catch (e) { /* fall through */ }
  return '<span class="math-raw">' + esc(source) + '</span>';
}

function wrapBareMathFragmentsLine(src) {
  var text = String(src || '');
  if (!text) return text;
  var store = [];
  var protectedRe = /\$\$[\s\S]*?\$\$|\$[^$\n]*\$|\uE000C\d+\uE001|\`\`\`[\s\S]*?\`\`\`|\`[^\`]*\`|<\/?[^>]+>|&lt;[\s\S]*?&gt;/g;
  text = text.replace(protectedRe, function (m) {
    store.push(m);
    return '\uE000F' + (store.length - 1) + '\uE001';
  });
  var markerRe = /[\\^_=<>\/\-∫∑∏√λΛ−×·|←→±≤≥⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/;
  function wrapChunk(chunk) {
    if (!chunk || /https?:\/\//.test(chunk)) return chunk;
    var m = chunk.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m) return chunk;
    var core = m[2];
    var label = '';
    var lm = core.match(/^\(([1-9])\)\s+/);
    if (lm) { label = lm[0].replace(/\s+$/, '') + ' '; core = core.slice(lm[0].length); }
    if (core.length < 2 || !markerRe.test(core)) return chunk;
    // 星标、章节号这类标题元信息不是公式，尤其不能把“ · 2★”渲染成 ⋅ 2 ★。
    if (/[★☆]/.test(core)) return chunk;
    if (core.indexOf('\uE000F') >= 0) return chunk;
    // 已转义的 HTML 片段（&lt;...&gt;）不是公式，避免把标签属性逐字符排成斜体。
    if (/&(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{1,6}|#x[0-9a-fA-F]{1,6});/.test(core)) return chunk;
    if (/^\s*#{1,6}\s/.test(core) || /^\s*[-*+]\s/.test(core) || /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(core)) return chunk;
    // 题库编号（GA-B0001 / MA-0001）不是公式，避免连字符被排成减号。
    if (/^[A-Z]{1,4}-[A-Z]?\d+[A-Za-z0-9-]*$/.test(core)) return chunk;
    if (/[#*\`>]/.test(core)) return chunk;
    // Markdown 表格整行保留：管道符不是公式边界，表格交给 marked 渲染。
    if (/^\s*\|.*\|\s*$/.test(core)) return chunk;
    if (/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(core)) return chunk;
    if (/\[[^\]]*\]\([^)]*\)/.test(core)) return chunk;
    if (/^[\s\-−=+*\/×·|]+$/.test(core)) return chunk;
    if (/[=+\-*\/^_]\s*$/.test(core) || /^\s*[=+\-*\/^_]/.test(core)) return chunk;
    if (!/[A-Za-z0-9λΛ]/.test(core)) return chunk;
    if (/^\d+(\.\d+)?$/.test(core)) return chunk;
    // 纯英文词组用斜杠/连字符连接（如 points / pitfalls、state-of-the-art）不是公式。
    if (/^[A-Za-z]+(?:\s*[/\-]\s*[A-Za-z]+)+$/.test(core) && !/[=^_0-9]/.test(core)) return chunk;
    // 用空格分隔的数字宽度列表（390 / 820 / 1440）按正文排，不排成斜体公式。
    if (/^\d+(?:\s+\/\s+\d+)+$/.test(core)) return chunk;
    return m[1] + label + '$' + core + '$' + m[3];
  }
  text = text.replace(/[^\u4e00-\u9fa5，。；：、！？（）《》“”‘’\n]+/g, function (chunk) {
    return wrapChunk(chunk);
  });
  return text.replace(/\uE000F(\d+)\uE001/g, function (m, i) {
    return store[+i];
  });
}

function wrapBareMathFragments(src) {
  var text = String(src || '');
  if (!text) return text;
  return text.split('\n').map(function (line) {
    return wrapBareMathFragmentsLine(line);
  }).join('\n');
}

function normalizeMathDelims(src) {
  var t = String(src || '');
  t = t.replace(/\\\[([\s\S]*?)\\\]/g, function (m, tex) { return '$$' + tex + '$$'; });
  t = t.replace(/\\\(([\s\S]*?)\\\)/g, function (m, tex) { return '$' + tex + '$'; });
  t = t.replace(/\\begin\{([a-zA-Z*]+)\}([\s\S]*?)\\end\{\1\}/g, function (m, env, body) {
    return '\\begin{' + env + '}' + body.replace(/(?<!\\)\$/g, '') + '\\end{' + env + '}';
  });
  return t;
}

function wrapBareLatex(src) {
  var s = String(src || '');
  // Markdown 列表标记（-、*、+、1.）不能被当成裸公式的一部分：
  // runRe 会匹配 "- " 并 trim 成 "-"，导致所有列表退化成以 - 开头的普通段落。
  var listMarks = [];
  s = s.replace(/(^|\n)([ \t]{0,3})([-*+]|\d{1,3}[.)])(?=[ \t]+)/g, function (m, lead, indent, mark) {
    listMarks.push(mark);
    return lead + indent + '\uE000L\uE001';
  });
  var parts = s.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|```[\s\S]*?```|`[^`]*`|<\/?[^>]+>|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/);
  for (var i = 0; i < parts.length; i++) {
    if (i % 2 === 1) continue;
    var t = parts[i];
    t = t.replace(/\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\1\}/g, function (m) { return '$' + m + '$'; });
    // 把一整段裸 LaTeX（含数字、括号、运算符）包成一个公式，而不是把每个命令分别包起来。
    // \text{中文} 必须整体匹配，否则会在“在/连续”处被拆成 \text{ 残片。
    // 反斜杠不放进普通字符类，保证每个命令都从 \ 开始被完整识别。
    var runRe = /((?:\\frac\{[^{}]*\}\{[^{}]*\}|\\text\{[^{}]*\}|\\mathrm\{[^{}]*\}|\\operatorname\{[^{}]*\}|\\mbox\{[^{}]*\}|\\[A-Za-z]+|[0-9A-Za-z{}\[\]()_^=+\-*/. ,\u0370-\u03ff\u00b2\u00b3\u00b9\u2070-\u209f\u2100-\u214f\u2190-\u22ff\u00b1\u00b7\u00d7\u221e])+)/g;
    t = t.replace(runRe, function (m) {
      var raw = m;
      m = m.trim();
      if (!m) return raw;
      // 行首的小问编号 (1) 属于题干结构，不能包进公式。
      var label = '';
      var lm = m.match(/^\(([1-9])\)\s+/);
      if (lm) { label = lm[0].replace(/\s+$/, '') + ' '; m = m.slice(lm[0].length).trim(); }
      if (!m) return label;
      var hasCommand = /\\[A-Za-z]+/.test(m);
      // 没有命令、但带上下标/等号的连续片段，也按公式处理（修复 AI 把公式中途断开的残留）。
      if (!hasCommand && !(/[\^_]/.test(m) && /[0-9A-Za-z]/.test(m) && m.length >= 4)) return raw;
      var first = hasCommand ? m.search(/\\[A-Za-z]+/) : -1;
      if (first > 0 && /[A-Za-z]{3,}/.test(m.slice(0, first))) return raw;
      var plainChinese = m.replace(/\\frac\{[^{}]*\}\{[^{}]*\}/g, '').replace(/\\text\{[^{}]*\}/g, '');
      if (/[\u4e00-\u9fa5]/.test(plainChinese)) return raw;
      // 公式末尾常紧跟句号/逗号：把标点留在公式外，避免 Temml 把末尾标点排进公式。
      var tail = '';
      var pm = m.match(/[.。，,;；:：!?！？]+$/);
      if (pm && pm[0].length < m.length) { tail = pm[0]; m = m.slice(0, -tail.length).trim(); }
      if (!m) return label + tail;
      return label + '$' + m + '$' + tail;
    });
    // runRe 已覆盖 X^{...}；此处不能再补一层 $，否则长公式会被拆成 H^2=(E-2XX$X^{\mathrm T}$)^2。
    parts[i] = t;
  }
  return parts.join('').replace(/\uE000L\uE001/g, function () {
    return listMarks.length ? listMarks.shift() : '-';
  });
}

function mathifyPlainText(src) {
  var s = String(src || '');
  if (!s) return '';
  // 先保护 HTML/转义标签，避免把 <img src=x ...> 里的 = 当成公式。
  var guards = [];
  s = s.replace(/&lt;[\s\S]*?&gt;|<\/?[^>]+>/g, function (m) {
    guards.push(m);
    return '\uE000G' + (guards.length - 1) + '\uE001';
  });
  // Do not bail out on raw LaTeX: wrapBareLatex() wraps it after this pass.
  var parts = s.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\uE000C\d+\uE001)/);
  for (var x = 0; x < parts.length; x += 2) {
    var eqs = [];
    var seg = parts[x].replace(/(?<!\\)([A-Za-z0-9][A-Za-z0-9+\-*\/^_().{} ]{0,40}?)\s*=\s*([A-Za-z0-9+\-*\/^_().{} ]{1,50})/g, function (_, left, right) {
      if (/https?:|www\./i.test(left + right)) return _;
      eqs.push('$' + left.trim() + ' = ' + right.trim() + '$');
      return '@@EQ' + (eqs.length - 1) + '@@';
    });
    seg = seg
      .replace(/\bsqrt\s*\(([^()]*)\)/gi, function (_, v) { return '$' + '\\sqrt{' + v + '}' + '$'; })
      .replace(/(^|[^A-Za-z0-9\\])([A-Za-z])\s*\^\s*\{?([A-Za-z0-9+\-]+)\}?/g, function (_, pre, base, exp) { return pre + '$' + base + '^{' + exp + '}' + '$'; })
      .replace(/(^|[^A-Za-z0-9\\])([A-Za-z])\s*_\s*\{?([A-Za-z0-9+\-]+)\}?/g, function (_, pre, base, sub) { return pre + '$' + base + '_{' + sub + '}' + '$'; })
      .replace(/([A-Za-z0-9])\s*(<=|>=|!=|->)\s*/g, function (_, left, op) { return left + '$' + (op === '<=' ? '\\le' : op === '>=' ? '\\ge' : op === '!=' ? '\\ne' : '\\to') + '$'; });
    seg = seg.replace(/@@EQ(\d+)@@/g, function (_, n) { return eqs[+n] || ''; });
    parts[x] = seg;
  }
  return parts.join('').replace(/\uE000G(\d+)\uE001/g, function (m, i) {
    return guards[+i] == null ? m : guards[+i];
  });
}
function canvasToWhiteDataUrl(canvas, type, quality) {
  if (!canvas || !canvas.width || !canvas.height) return canvas ? canvas.toDataURL(type || 'image/png') : '';
  var out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  var ctx = out.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0);
  return out.toDataURL(type || 'image/png', quality);
}


function normalizeInlineMathCode(src) {
  var s = String(src || '');
  var fences = [];
  s = s.replace(/\x60\x60\x60[\s\S]*?\x60\x60\x60/g, function (m) {
    fences.push(m);
    return '\uE000F' + (fences.length - 1) + '\uE001';
  });
  s = s.replace(/\x60([^\x60\n]+)\x60/g, function (m, code) {
    var text = String(code || '').trim();
    if (!text || /^[A-Za-z]:[\\/]/.test(text) || /^https?:/i.test(text)) return m;
    var mathy = /[=<>^_\\*~|]|(?:[∑∫√≤≥→ΔπλμΩ≠⇔⟺⇒∈∉±∞ᵀ]|\\[A-Za-z]+)/.test(text) || /[\u00b2\u00b3\u00b9\u2070-\u209f\u1d2c-\u1d6a\u2212\u00d7\u00f7\u2032\u221a]/.test(text) || /^[A-Za-z](\([^)]*\))?$/.test(text) || /^\d+$/.test(text) || /^(Nul|Col|Row|Rank|det|dim|span|ker|im)\s+[A-Za-z]$/.test(text);
    if (mathy && !/^\s*\$/.test(text)) {
      var tex = text
        .replace(/Δ/g, "\\Delta ")
        .replace(/×/g, "\\times ")
        .replace(/≤/g, "\\le ")
        .replace(/≥/g, "\\ge ")
        .replace(/→/g, "\\to ")
        .replace(/∑/g, "\\sum ")
        .replace(/∫/g, "\\int ")
        .replace(/√/g, "\\sqrt{}")
        .replace(/₀/g, "_0").replace(/₁/g, "_1").replace(/₂/g, "_2").replace(/₃/g, "_3").replace(/₄/g, "_4")
        .replace(/₅/g, "_5").replace(/₆/g, "_6").replace(/₇/g, "_7").replace(/₈/g, "_8").replace(/₉/g, "_9")
        .replace(/⁰/g, "^0").replace(/¹/g, "^1").replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4")
        .replace(/⁵/g, "^5").replace(/⁶/g, "^6").replace(/⁷/g, "^7").replace(/⁸/g, "^8").replace(/⁹/g, "^9")
        .replace(/⁻/g, "-").replace(/⁺/g, "+").replace(/ᵀ/g, "^{T}")
        .replace(/−/g, "-").replace(/′/g, "'")
        .replace(/\s*~\s*/g, " \\sim ")
        .replace(/\|/g, " \\mid ")
        .replace(/^(Nul|Col|Row|Rank|det|dim|span|ker|im)\s+([A-Za-z])$/, "\\operatorname{$1} $2");
      return "$" + tex + "$";
    }
    return m;
  });
  s = s.replace(/\uE000F(\d+)\uE001/g, function (m, i) { return fences[+i] || ''; });
  return s;
}

function normalizeInlineDisplayMath(src) {
  var inFence = false;
  return String(src || '').split('\n').map(function (line) {
    if (/^\s*```/.test(line)) { inFence = !inFence; return line; }
    if (inFence || line.indexOf('$$') < 0) return line;
    var outside = line.replace(/\$\$[\s\S]*?\$\$/g, '').replace(/\s+/g, '');
    if (!outside) return line;
    return line.replace(/\$\$([\s\S]*?)\$\$/g, function (m, tex) {
      return '$' + String(tex || '').trim() + '$';
    });
  }).join('\n');
}

// 短公式写成 $$...$$ 时仍应留在句子里；只有矩阵、分段、对齐等结构化公式保留块级。
// 否则“将等式变形为 $$AB=E$$ 的形式”会被拆成三段独立段落，右侧留白却逐行断开。
function inlineShortDisplayMath(src) {
  return String(src || '').replace(/\$\$([^$\n]{1,120})\$\$/g, function (m, tex) {
    if (/\\begin\s*\{|\\end\s*\{|\\\\|&/.test(tex)) return m;
    var body = String(tex || '').trim();
    if (!body) return m;
    return '$' + body + '$';
  });
}

function normalizeMarkdownTypography(src) {
  var s = String(src || '').replace(/\uFEFF/g, '');
  s = s.replace(/\*\*([^*\n]*?)[ \t]*\*\*/g, function (m, inner) {
    var t = String(inner || '').trim();
    return t ? '**' + t + '**' : '';
  });
  s = s.replace(/__([^_\n]*?)[ \t]*__/g, function (m, inner) {
    var t = String(inner || '').trim();
    return t ? '__' + t + '__' : m;
  });
  return normalizeInlineMathCode(s);
}

function normalizeEscapedLineBreaks(src) {
  var s = String(src == null ? '' : src);
  // AI 返回的文本偶尔保留字面量 \n / \r；只还原不在 LaTeX 命令中的转义，避免把 \nabla 变成换行。
  s = s.replace(/\\+n(?![A-Za-z])/g, '\n').replace(/\\+r(?![A-Za-z])/g, '\n').replace(/\r\n?/g, '\n');
  return s;
}
function normalizeMathMarkup(src) {
  return String(src || '').replace(/[\uE000\uE001]/g, '').replace(/(?<![A-Za-z0-9])1x(?![A-Za-z0-9])/g, 'x').replace(/(?<![A-Za-z0-9])1y(?![A-Za-z0-9])/g, 'y');
}

function stripTypePrefix(value) {
  return String(value || '').replace(/【[^】]{1,20}】/g, '').trim();
}

// Sanitize the untrusted Markdown HTML before inserting trusted Temml output.
function sanitizeMarkdownHtml(html) {
  var root = document.createElement('template');
  root.innerHTML = html;
  var tags = new Set('P BR HR STRONG B I U EM MARK DEL S SUB SUP SMALL KBD ABBR CITE Q BLOCKQUOTE UL OL LI H1 H2 H3 H4 H5 H6 PRE CODE A IMG TABLE THEAD TBODY TFOOT TR TH TD DETAILS SUMMARY DIV SPAN INPUT'.split(' '));
  // 这些元素连同内容一起删除；其他未知标签只解包，保留文字，避免“<b>粗体</b>”整词消失。
  var dropTags = new Set('SCRIPT STYLE IFRAME OBJECT EMBED SVG FORM LINK META BASE TEMPLATE NOSCRIPT'.split(' '));
  function safeUrl(value, image) {
    var compact = String(value || '').replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
    if (image && /^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(compact)) return true;
    if (/^(?:https?:|mailto:)/i.test(compact)) return !image || !/^mailto:/i.test(compact);
    return !/^[^/?#]*:/.test(compact);
  }
  function walk(parent) {
    Array.from(parent.childNodes).forEach(function (node) {
      if (node.nodeType === 8) { node.remove(); return; }
      if (node.nodeType !== 1) return;
      if (dropTags.has(node.tagName)) { node.remove(); return; }
      if (!tags.has(node.tagName)) {
        walk(node); // 先清掉未知容器里的危险子节点，再解包保留文字
        var parentNode = node.parentNode;
        if (!parentNode) return;
        while (node.firstChild) parentNode.insertBefore(node.firstChild, node);
        node.remove();
        return;
      }
      Array.from(node.attributes).forEach(function (a) {
        var name = a.name.toLowerCase();
        var allowed = name === 'title' || name === 'alt' ||
          (node.tagName === 'A' && name === 'href' && safeUrl(a.value, false)) ||
          (node.tagName === 'IMG' && name === 'src' && safeUrl(a.value, true)) ||
          ((node.tagName === 'TH' || node.tagName === 'TD') && /^(colspan|rowspan|align)$/.test(name)) ||
          (node.tagName === 'OL' && name === 'start') ||
          (node.tagName === 'INPUT' && /^(type|checked|disabled)$/.test(name));
        if (!allowed) node.removeAttribute(a.name);
      });
      if (node.tagName === 'INPUT') { node.setAttribute('type', 'checkbox'); node.setAttribute('disabled', ''); }
      walk(node);
    });
  }
  walk(root.content);
  var output = document.createElement('div');
  output.appendChild(root.content.cloneNode(true));
  return output.innerHTML;
}

var CODE_TOKEN = '\uE000C';
function extractCodeSegments(src) {
  var bt = String.fromCharCode(96);
  var store = [];
  var text = String(src == null ? '' : src);
  text = text.replace(/```[^\n]*\n?([\s\S]*?)```/g, function (m, body) {
    store.push({ fence: true, text: body == null ? '' : body });
    return CODE_TOKEN + (store.length - 1) + MATH_END;
  });
  text = text.replace(/`([^`\n]+)`/g, function (m, body) {
    store.push({ fence: false, text: body == null ? '' : body });
    return CODE_TOKEN + (store.length - 1) + MATH_END;
  });
  return { text: text, store: store };
}
function restoreCodeSegments(html, store) {
  if (!store || !store.length) return html;
  var blockRe = new RegExp('<p>\\s*' + CODE_TOKEN + '(\\d+)' + MATH_END + '\\s*</p>', 'g');
  html = html.replace(blockRe, function (m, i) {
    var item = store[+i];
    if (!item) return m;
    if (item.fence) return '<pre><code>' + esc(item.text) + '</code></pre>';
    return '<p><code>' + esc(item.text) + '</code></p>';
  });
  var inlineRe = new RegExp(CODE_TOKEN + '(\\d+)' + MATH_END, 'g');
  html = html.replace(inlineRe, function (m, i) {
    var item = store[+i];
    if (!item) return m;
    return '<code>' + esc(item.text) + '</code>';
  });
  return html;
}

function wrapBareOperatorMath(src) {
  var s = String(src || '');
  var parts = s.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\uE000C\d+\uE001)/);
  var re = /(?<![$\\A-Za-z0-9_])((?:liminf|limsup|lim|sup|inf|max|min|det|dim|sum|prod)\s*(?:_\{[^{}]*\}|_[A-Za-z0-9]+)?(?:[A-Za-z0-9_^=+\-*/().,\[\]{}|<>→∈∞ ]|\\[A-Za-z]+)+)(?=[。，；：、\n]|$)/g;
  for (var i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(re, function (m) {
      if (/\s{2,}/.test(m) || m.length > 160) return m;
      return String.fromCharCode(36) + m.trim() + String.fromCharCode(36);
    });
  }
  return parts.join('');
}


function isLikelyInlineMath(inner) {
  var text = String(inner || '');
  if (!text || text.length > 400 || text.indexOf('\n') >= 0) return false;
  if (/\\[A-Za-z]+/.test(text)) return true;
  var probe = text.replace(/\\(?:text|mathrm|operatorname|textbf|textit)\{[^{}]*\}/g, ' ');
  if (/[\u4e00-\u9fa5]/.test(probe)) return false;
  return /[A-Za-z0-9^_=+\-*\/<>()]/.test(probe);
}

/*
 * AI/OCR 偶尔把公式包成半截 $...$：一个落单的 $ 会让后面的整段 LaTeX
 * 被当成正文，并让内部占位符泄漏到页面（截图里的 $ 与 ^{\mathrm T}）。
 * 这里按行只保留能配对的合理行内公式，落单或明显包住中文的 $ 直接去掉，
 * 再交给后面的裸公式扫描器统一补 $...$。
 */
function repairStrayDollarSigns(src) {
  var text = String(src == null ? '' : src);
  var out = '';
  var i = 0;
  while (i < text.length) {
    var ch = text[i];
    if (ch !== '$') { out += ch; i++; continue; }
    // 统计 $ 前连续反斜杠：奇数才是转义字面量；\\$（换行后裸 $）不能按转义处理。
    var backslashes = 0;
    for (var k = i - 1; k >= 0 && text[k] === '\\'; k--) backslashes++;
    if (backslashes % 2 === 1) { out += '$'; i++; continue; }
    if (text[i + 1] === '$') {
      var displayEnd = text.indexOf('$$', i + 2);
      if (displayEnd < 0) { i += 2; continue; }
      out += text.slice(i, displayEnd + 2);
      i = displayEnd + 2;
      continue;
    }
    var j = i + 1;
    var close = -1;
    while (j < text.length && text[j] !== '\n') {
      if (text[j] === '\\') { j += 2; continue; }
      if (text[j] === '$') { close = j; break; }
      j++;
    }
    var inner = close >= 0 ? text.slice(i + 1, close) : '';
    // 真正的坏 $ 会包进中文、或只有 \end 没有 \begin；pmatrix/cases 内部的 & 和 \\ 是合法公式。
    var innerNoText = inner.replace(/\\text\{[^{}]*\}/g, '').replace(/\\mathrm\{[^{}]*\}/g, '').replace(/\\operatorname\{[^{}]*\}/g, '').replace(/_\{[^{}]*\}/g, '').replace(/\^\{[^{}]*\}/g, '');
    var unsafeInner = /[\u4e00-\u9fff]/.test(innerNoText) || (inner.indexOf('\\end{') >= 0 && inner.indexOf('\\begin{') < 0);
    if (inner.length > 500) unsafeInner = true;
    if (close >= 0 && !unsafeInner && isLikelyInlineMath(innerNoText)) {
      out += text.slice(i, close + 1);
      i = close + 1;
      continue;
    }
    i++;
  }
  return out;
}

/**
 * 把正文里成对的 \begin{...}...\end{...} 整体升级为 display 公式。
 * 必须先处理环境，再让裸 LaTeX 扫描器碰它，否则 & 与 \\ 会被当成正文拆开。
 */
function wrapBareMathEnvironments(src) {
  var text = String(src == null ? '' : src);
  var parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/);
  for (var i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(/\\begin\{([a-zA-Z*]+)\}([\s\S]*?)\\end\{\1\}/g, function (m) {
      return '$$' + m.replace(/\\\\\$/g, '\\\\') + '$$';
    });
  }
  return parts.join('');
}

/**
 * 大题里的 (1)(2)(3) 小问：只有在前一句已经收尾时才另起一段，
 * 避免把区间 (1,2)、选项 (1) 或公式里的括号拆开。
 */
function formatSubquestionBreaks(src) {
  var text = String(src == null ? '' : src);
  text = text.replace(/([。；！？：:])\s*（([1-9])）/g, '$1\n\n（$2） ');
  text = text.replace(/([。；！？：:])\s*\(([1-9])\)(?=[^\d,，.。])/g, '$1\n\n($2) ');
  return text;
}

function renderMarkdown(src) {
  if (!src) return '';
  var codeSeg = extractCodeSegments(src);
  src = codeSeg.text;
  src = normalizeEscapedLineBreaks(src).replace(/\uFFFD+/g, '');
  src = repairStrayDollarSigns(src);
  src = normalizeInlineDisplayMath(src);
  src = inlineShortDisplayMath(src);
  // 教材/技能里常见跨行的行内公式：$...\n...$。先合并为单行公式，避免 $ 定界符被换行截断后原样输出。
  src = String(src).replace(/\$([^$]*?)\$/g, function (m, tex) {
    if (tex.indexOf('\n') < 0) return m;
    return '$' + tex.replace(/\n/g, ' ').trim() + '$';
  });
  src = normalizeMarkdownTypography(src);
  // 把被空行包住的单个行内公式并回句子，避免 f、A、n 等符号单独成行。
  src = String(src)
    .replace(/\n{2,}(\$[^$\n]{1,160}\$)\n{2,}/g, ' $1 ')
    .replace(/([。，；：、])\n{2,}(\$[^$\n]{1,160}\$)/g, '$1 $2')
    .replace(/(\$[^$\n]{1,160}\$)\n{2,}([。，；：、])/g, '$1$2');
  src = formatSubquestionBreaks(src);
  src = String(src).replace(/\\\$(?=[A-Za-z])/g, '\\');
  src = String(src).replace(/!\[([^\]]*)\]\((data:image\/[^\s)]+)\)/g, function (m, alt, url) {
    return '<img src="' + attr(url) + '" alt="' + attr(alt || '手写作答') + '">';
  });
  src = wrapBareMathEnvironments(src);
  // 先把成段裸 LaTeX 整体收成一个公式，再让片段扫描器和等式扫描器处理纯文本。
  src = wrapBareLatex(src);
  src = wrapBareOperatorMath(src);
  src = wrapBareMathFragments(src);
  // mathifyPlainText 会把已经包好的 $...$ 里的 = 再次切开，保留定义供旧调用，但主渲染不再使用。
  src = normalizeMathDelims(src);
  src = wrapBareLatex(src);
  if (!window.marked) return '<p>' + esc(src) + '</p>';
  var store = [];
  var text = String(src)
    .replace(/\$\$([\s\S]*?)\$\$/g, function (m, tex) {
      store.push({ tex: tex, display: true });
      return MATH_TOKEN + (store.length - 1) + MATH_END;
    })
    .replace(/\$([^$\n]+?)\$/g, function (m, tex) {
      store.push({ tex: tex, display: false });
      return MATH_TOKEN + (store.length - 1) + MATH_END;
    });
  text = formatSubquestionBreaks(text);
  var html;
  try {
    html = marked.parse(text, { gfm: true, breaks: false, mangle: false, headerIds: false });
  } catch (e) {
    html = '<p>' + esc(src) + '</p>';
  }
  html = sanitizeMarkdownHtml(html);
  html = restoreCodeSegments(html, codeSeg.store);
  html = html.replace(/<p>\s*\uE000M(\d+)\uE001\s*<\/p>/g, function (m, i) {
    var q = store[+i];
    if (!q) return m;
    if (q.display) return '<div class="math-display">' + renderMath(q.tex, true) + '</div>';
    return '<p><span class="math-inline-scroll">' + renderMath(q.tex, false) + '</span></p>';
  });
  html = html.replace(/\uE000M(\d+)\uE001/g, function (m, i) {
    var q = store[+i];
    if (!q) return m;
    if (!q.display) return '<span class="math-inline-scroll">' + renderMath(q.tex, false) + '</span>';
    return renderMath(q.tex, q.display);
  });
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  // 属性清洗已由 sanitizeMarkdownHtml 按 DOM 完成；这里不能再跑 on* 正则，
  // 否则会把正文里的 &lt;img ... onerror=...&gt; 文字当成属性删掉。
  return html;
}

function plainText(md) {
  return String(md || '')
    .replace(/\$\$([\s\S]*?)\$\$/g, ' ')
    .replace(/\$([^$\n]+?)\$/g, ' ')
    .replace(/[#>*_|\x60\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================================================
   02-subject — accessors, stats, filters
   ========================================================= */
function subjectOf(id) { return SUBJ_BY_ID[id] || SUBJECTS[0]; }
function entriesOf(id) { return (state.entries && state.entries[id]) || []; }
function templatesOf(id) {
  var base = subjectOf(id).templates || [];
  var user = (state.userTemplates && state.userTemplates[id]) || [];
  return user.length ? base.concat(user) : base;
}
function bankOf(id) {
  var base = (BANKS[id] && BANKS[id].items) || [];
  var user = (state.userBank && state.userBank[id]) || [];
  var list = user.length ? base.concat(user) : base;
  list.forEach(function (it) {
    if (typeof ensureBankItemComplete === 'function') ensureBankItemComplete(it);
    if (!it.baseDifficulty) it.baseDifficulty = normalizeStars(it.difficulty || 2);
    it.difficulty = assessBankDifficulty(it);
  });
  return list;
}
function currentSubject() { return subjectOf(state.activeSubject); }
function templateById(subjectId, tid) {
  var list = templatesOf(subjectId);
  for (var i = 0; i < list.length; i++) if (list[i].id === tid) return list[i];
  return null;
}
function findEntry(subjectId, entryId) {
  var list = entriesOf(subjectId);
  for (var i = 0; i < list.length; i++) if (list[i].id === entryId) return list[i];
  return null;
}
function entryTitle(e) {
  if (e.summary) return stripTypePrefix(e.summary);
  if (e.points && e.points.length) return stripTypePrefix(e.points[0]);
  if (e.templateTitle) return e.templateTitle;
  return '未命名条目';
}
function entrySubtitle(e) {
  if (e.summary) return (e.points || []).join(' · ');
  if (e.templateTitle) return e.templateTitle;
  return (e.points || []).slice(1).join(' · ');
}

function statsFor(subjectId) {
  var es = entriesOf(subjectId);
  var mastered = es.filter(function (e) { return e.status === 'mastered'; }).length;
  var total = es.length;
  var errors = {};
  ERROR_TYPES.forEach(function (t) { errors[t] = 0; });
  es.forEach(function (e) { (e.errorTypes || []).forEach(function (t) { if (errors[t] != null) errors[t]++; }); });
  var chapters = {};
  es.forEach(function (e) { var c = e.chapter || '未分章'; chapters[c] = (chapters[c] || 0) + 1; });
  var last = state.updatedAt;
  es.forEach(function (e) { if (e.updatedAt && new Date(e.updatedAt) > new Date(last)) last = e.updatedAt; });
  return {
    total: total,
    mastered: mastered,
    unmastered: total - mastered,
    pct: total ? Math.round((mastered / total) * 100) : 0,
    templates: templatesOf(subjectId).length,
    bank: bankOf(subjectId).length,
    notes: typeof noteTotalPages === 'function' ? noteTotalPages(subjectId) : (typeof notePages === 'function' ? notePages(subjectId).length : 0),
    errors: errors,
    chapters: chapters,
    last: last
  };
}

function filterFor(subjectId) {
  var saved = state.prefs && state.prefs.entrySorts && state.prefs.entrySorts[subjectId];
  if (!ui.filters[subjectId]) ui.filters[subjectId] = { status: 'all', chapter: 'all', template: 'all', date: 'all', stars: 'all', sort: saved || 'date-desc' };
  var f = ui.filters[subjectId];
  if (!f.date) f.date = 'all';
  if (!f.stars) f.stars = 'all';
  return f;
}
function bankFilterFor(subjectId) {
  if (!ui.bankFilters[subjectId]) ui.bankFilters[subjectId] = { chapter: 'all', category: 'all', type: 'all', template: 'all', diff: 'all', origin: 'all' };
  var f = ui.bankFilters[subjectId];
  if (!f.origin) f.origin = 'all';
  return f;
}
function bankOriginKey(item) {
  return item && item.examOrigin === '教材课后习题' ? 'textbook' : 'exam';
}
function bankFiltersActive(f) {
  return !!f && (f.chapter !== 'all' || f.category !== 'all' || f.type !== 'all' || f.template !== 'all' || f.diff !== 'all' || f.origin !== 'all');
}
function templateFilterFor(subjectId) {
  if (!ui.templateFilters) ui.templateFilters = {};
  if (!ui.templateFilters[subjectId]) ui.templateFilters[subjectId] = { chapter: 'all' };
  return ui.templateFilters[subjectId];
}
function templateFiltersActive(f) {
  return !!f && f.chapter !== 'all';
}

function sortEntries(list, subjectId) {
  var mode = filterFor(subjectId).sort || 'date-desc';
  var arr = list.slice();
  arr.sort(function (a, b) {
    if (mode === 'date-desc') return String(b.date || '').localeCompare(String(a.date || ''));
    if (mode === 'date-asc') return String(a.date || '').localeCompare(String(b.date || ''));
    if (mode === 'code-asc') return String(a.code || '').localeCompare(String(b.code || ''), undefined, { numeric: true });
    if (mode === 'code-desc') return String(b.code || '').localeCompare(String(a.code || ''), undefined, { numeric: true });
    if (mode === 'stars-asc') return (a.stars || 0) - (b.stars || 0);
    if (mode === 'stars-desc') return (b.stars || 0) - (a.stars || 0);
    if (mode === 'chapter-asc' || mode === 'chapter-desc') {
      var tpls = templatesOf(subjectId);
      var ra = chapterRankFor(subjectId, a.chapter, tpls);
      var rb = chapterRankFor(subjectId, b.chapter, tpls);
      var dir = mode === 'chapter-desc' ? -1 : 1;
      if (ra !== rb) return (ra - rb) * dir;
      return String(a.code || '').localeCompare(String(b.code || ''), undefined, { numeric: true }) * dir;
    }
    return 0;
  });
  return arr;
}

function entryMatches(e, q) {
  if (!q) return true;
  var hay = [entryTitle(e), e.summary, e.chapter, e.templateTitle, e.templateId, e.source]
    .concat(e.points || []).join(' ');
  (e.blocks || []).forEach(function (b) { hay += ' ' + plainText(b.md); });
  return hay.toLowerCase().indexOf(q.toLowerCase()) >= 0;
}

function searchQuery() {
  var el = qs('#searchInput');
  return el ? el.value.trim() : '';
}

function entryDateKey(entry) {
  var m = String((entry && entry.date) || '').match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

function baseFilteredEntries(subjectId) {
  var f = filterFor(subjectId);
  var q = searchQuery();
  return entriesOf(subjectId).filter(function (e) {
    if (f.status !== 'all' && e.status !== f.status) return false;
    if (f.chapter !== 'all' && e.chapter !== f.chapter) return false;
    if (f.template !== 'all' && e.templateId !== f.template) return false;
    return entryMatches(e, q);
  });
}

function entryMatchesDateIndex(e, f) {
  return f.date === 'all' || entryDateKey(e) === f.date;
}

function entryMatchesStarIndex(e, f) {
  return f.stars === 'all' || String(normalizeStars(e.stars)) === String(f.stars);
}

function filteredEntries(subjectId) {
  var f = filterFor(subjectId);
  var list = baseFilteredEntries(subjectId).filter(function (e) {
    return entryMatchesDateIndex(e, f) && entryMatchesStarIndex(e, f);
  });
  return sortEntries(list, subjectId);
}

/* ---------- 举一反三 matching ---------- */
function relatedBank(entry, limit) {
  var items = bankOf(entry.subject);
  var scored = items.map(function (it) {
    var score = 0;
    if (it.templateId && it.templateId === entry.templateId) score += 6;
    if (entry.points && it.pointKeys) {
      entry.points.forEach(function (p) {
        it.pointKeys.forEach(function (k) {
          if (p && k && (p.indexOf(k) >= 0 || k.indexOf(p) >= 0)) score += 2;
        });
      });
    }
    if (it.relatedEntries && it.relatedEntries.indexOf(entry.code) >= 0) score += 4;
    if (it.chapter && entry.chapter && it.chapter === entry.chapter) score += 1;
    return { it: it, score: score };
  }).filter(function (x) { return x.score > 0; });
  scored.sort(function (a, b) { return b.score - a.score; });
  return scored.slice(0, limit || 3).map(function (x) { return x.it; });
}

/* ---------- code generation ---------- */
var ENTRY_CODE_PREFIX = { gaodai: 'A', shufen: 'M', jieji: 'G', xijing: 'E' };

function entryCodePattern(subjectId) {
  var prefix = ENTRY_CODE_PREFIX[subjectId] || 'X';
  return new RegExp('^' + prefix + '-(\\d{3,})$');
}

function nextCodeFromEntries(subjectId, list) {
  var prefix = ENTRY_CODE_PREFIX[subjectId] || 'X';
  var re = entryCodePattern(subjectId);
  var max = 0;
  (list || []).forEach(function (e) {
    var m = String(e && e.code || '').match(re);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return prefix + '-' + pad(max + 1, 3);
}

function nextCode(subjectId) {
  return nextCodeFromEntries(subjectId, entriesOf(subjectId));
}

function setVar(name, value) { document.documentElement.style.setProperty(name, value); }

function entryCodeLabel(e) { return e.code; }

function renderInline(src) {
  if (!src) return '';
  var inlineSrc = String(src).replace(/\$\$([\s\S]*?)\$\$/g, function (m, tex) {
    return '$' + String(tex || '').trim() + '$';
  });
  var html = renderMarkdown(inlineSrc);
  html = html.replace(/<\/?p>/g, ' ').replace(/\n/g, ' ').trim();
  return html;
}


/* 行内公式默认保持 inline；只有真正宽于段落的公式才变成横向滚动块。 */
function refreshInlineMathWidths(root) {
  var scope = root || document;
  scope.querySelectorAll('.math-inline-scroll').forEach(function (wrap) {
    wrap.classList.remove('is-wide');
    var host = wrap.closest('p, li, td, th, .exam-qbody, .exam-opt, .exam-result-q, .entry-body, .md') || wrap.parentElement;
    if (!host || !host.clientWidth) return;
    if (wrap.getBoundingClientRect().width > host.clientWidth + 2) {
      wrap.classList.add('is-wide');
      wrap.setAttribute('title', '左右滑动查看完整公式');
      wrap.setAttribute('aria-label', '公式较长，可左右滑动查看');
    } else {
      wrap.removeAttribute('title');
      wrap.removeAttribute('aria-label');
      var oldHint = wrap.nextElementSibling;
      if (oldHint && oldHint.classList && oldHint.classList.contains('math-inline-hint')) oldHint.remove();
    }
  });
}

/* 手机端长公式：只让公式本身横向滑动，并给出可发现的滚动提示 */
function decorateMathScrollers(root) {
  root = root || document;
  root.querySelectorAll('.md math[display="block"], .md .tml-display').forEach(function (math) {
    if (!math || math.closest('.math-scroll')) return;
    if (math.scrollWidth <= math.clientWidth + 2) return;
    var wrap = document.createElement('span');
    wrap.className = 'math-scroll';
    math.parentNode.insertBefore(wrap, math);
    wrap.appendChild(math);
    var hint = document.createElement('span');
    hint.className = 'math-scroll-hint';
    hint.textContent = '左右滑动查看完整公式';
    wrap.appendChild(hint);
    math.addEventListener('scroll', function () { hint.classList.add('is-hidden'); }, { passive: true, once: true });
  });
  // 手机端行内公式可能比正文宽：单独包一层横向滚动容器，避免撑出页面后被裁掉。
  refreshInlineMathWidths(root);
  root.querySelectorAll('.md math:not([display="block"])').forEach(function (math) {
    if (!math || math.closest('.math-inline-scroll')) return;
    var host = math.closest('p, li, td, th, .md') || math.parentElement;
    if (!host || math.getBoundingClientRect().width <= host.clientWidth + 2) return;
    var wrap = document.createElement('span');
    wrap.className = 'math-inline-scroll';
    math.parentNode.insertBefore(wrap, math);
    wrap.appendChild(math);
  });
  refreshInlineMathWidths(root);
  if (typeof window !== 'undefined' && !window.__mathInlineResizeBound) {
    window.__mathInlineResizeBound = true;
    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { refreshInlineMathWidths(document); }, 160);
    }, { passive: true });
    // 错题、题库、模拟考、笔记和编辑器都会在运行时替换 .md 内容；
    // 统一观察新增节点，避免只有题库页装饰长公式、其他页面仍被裁切。
    if (typeof MutationObserver === 'function' && document.body && !document.body.__mathDecorateObserver) {
      var pending = false;
      var observer = new MutationObserver(function (mutations) {
        var relevant = false;
        for (var i = 0; i < mutations.length && !relevant; i++) {
          var added = mutations[i].addedNodes || [];
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n && n.nodeType === 1 && (n.matches('math, .math-inline-scroll, .md') || n.querySelector('math, .math-inline-scroll, .md'))) {
              relevant = true;
              break;
            }
          }
        }
        if (!relevant || pending) return;
        pending = true;
        setTimeout(function () {
          pending = false;
          decorateMathScrollers(document);
        }, 32);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      document.body.__mathDecorateObserver = observer;
    }
  }
}
