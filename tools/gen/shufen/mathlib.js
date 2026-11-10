'use strict';
/* 数学工具：多项式、公式渲染、数值校验 */
const E = require('./engine');

function polyStr(c, v) {
  v = v || 'x';
  const terms = [];
  for (let i = c.length - 1; i >= 0; i--) {
    const a = c[i];
    if (!a) continue;
    const abs = Math.abs(a);
    let t;
    if (i === 0) t = String(abs);
    else if (i === 1) t = (abs === 1 ? '' : String(abs)) + v;
    else t = (abs === 1 ? '' : String(abs)) + v + '^{' + i + '}';
    terms.push((a < 0 ? '-' : (terms.length ? '+' : '')) + t);
  }
  return terms.length ? terms.join('') : '0';
}
function polyDeriv(c) { const out = []; for (let i = 1; i < c.length; i++) out.push(c[i] * i); return out.length ? out : [0]; }
function polyInteg(c) { const out = [0]; for (let i = 0; i < c.length; i++) out.push(c[i] / (i + 1)); return out; }
function polyEval(c, x) { let s = 0; for (let i = c.length - 1; i >= 0; i--) s = s * x + c[i]; return s; }
function polyDefInteg(c, a, b) { const I = polyInteg(c); return polyEval(I, b) - polyEval(I, a); }
function polyDerivExact(c) { return polyDeriv(c); }
function numEq(a, b, tol) { return Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(a), Math.abs(b)); }

/* 有理函数 (n 多项式)/(d 多项式) 的极限 */
function ratLimitAtInf(n, d) {
  let nn = n.length - 1, dd = d.length - 1;
  while (nn > 0 && !n[nn]) nn--;
  while (dd > 0 && !d[dd]) dd--;
  if (nn < dd) return 0;
  if (nn > dd) return Infinity;
  return n[nn] / d[dd];
}
function ratStr(n, d) {
  const ns = polyStr(n), ds = polyStr(d);
  const num = ns.indexOf('+') >= 0 || ns.indexOf('-') > 0 ? '(' + ns + ')' : ns;
  return '\\frac{' + num + '}{' + (ds.indexOf('+') >= 0 || ds.indexOf('-') > 0 ? '(' + ds + ')' : ds) + '}';
}
function evalRat(n, d, x) {
  const q = polyEval(d, x);
  return q === 0 ? NaN : polyEval(n, x) / q;
}
/* 数值积分：Simpson */
function simpson(f, a, b, n) {
  n = n || 2000;
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}
/* 数值导数 */
function numDeriv(f, x, h) {
  h = h || 1e-6;
  return (f(x + h) - f(x - h)) / (2 * h);
}
/* 从多项式系数构造函数 */
function polyFn(c) { return (x) => polyEval(c, x); }

/* 常见初等函数族：返回 { tex, fn, dtex, dfn, itex?, ifn? } */
function fnPoly(c) {
  return { tex: polyStr(c), fn: polyFn(c), dtex: polyStr(polyDeriv(c)), dfn: polyFn(polyDeriv(c)) };
}
/* 生成互异整数序列（用于参数化） */
function seqInts(seed, n, lo, hi) {
  const rnd = E.mulberry32(seed);
  const out = [];
  while (out.length < n) {
    const v = lo + Math.floor(rnd() * (hi - lo + 1));
    if (out.indexOf(v) < 0) out.push(v);
  }
  return out;
}
function shuffleOptions(opts, correctIdx, seed) {
  const rnd = E.mulberry32(seed);
  const idx = opts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
  const arr = idx.map(i => opts[i]);
  return { options: arr, correct: idx.indexOf(correctIdx) };
}
/* 构造数值题的选择项：正确答案 + 三个干扰项（字符文本） */
function numDistractors(ans, seed) {
  const rnd = E.mulberry32(seed);
  const set = new Set([String(ans)]);
  const out = [];
  const candidates = [];
  for (const d of [1, -1, 2, -2, 3]) candidates.push(Number(ans) + d);
  if (Number.isFinite(Number(ans))) candidates.push(Number(ans) * 2, Number(ans) / 2);
  for (const v of candidates) {
    const t = E.texNum(v);
    if (!set.has(t) && Number.isFinite(v)) { set.add(t); out.push(t); }
    if (out.length === 3) break;
  }
  while (out.length < 3) out.push('不存在');
  return out;
}
module.exports = { polyStr, polyDeriv, polyInteg, polyEval, polyDefInteg, polyDerivExact, numEq,
  ratLimitAtInf, ratStr, evalRat, simpson, numDeriv, polyFn, fnPoly, seqInts, shuffleOptions, numDistractors };
