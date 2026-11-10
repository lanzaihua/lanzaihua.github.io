'use strict';
/* part2 章节打包器：与 pack.js 相同结构，额外支持 pack.proofs（15 条可证命题）
   题库顺序：概念辨析15 + 公式填空15 + 证明15 + 反例15 + 数值6类×15 = 150 */
const E = require('./engine');
const T = require('./textbuild');

function textItems(pack) {
  const facts = pack.facts.map(f => ({ topic: f[0], text: f[1], why: f[2] }));
  const falses = pack.falses.map(f => ({ topic: f[0], text: f[1], why: f[2], ex: f[2] }));
  const proofs = (Array.isArray(pack.proofs) && pack.proofs.length >= 15)
    ? T.proofItems(pack.proofs.map(p => ({ topic: p.topic, claim: p.claim, steps: p.steps, why: p.why, pts: p.pts, pit: p.pit })))
    : T.proofItems(facts.map(f => ({ topic: f.topic, claim: f.text, steps: [f.why], why: f.why, pts: [f.topic], pit: [f.topic, '论证不完整'] })));
  return []
    .concat(T.conceptItems(facts, falses, pack.name))
    .concat(T.formulaItems(pack.formulas.map(f => ({ q: f[0], a: f[1], why: f[2], topic: f[3] }))))
    .concat(proofs)
    .concat(T.counterItems(falses, facts));
}

function numericItems(pack) {
  const out = [];
  const cats = ['计算题', '应用题', '综合题', '分类讨论题', '误差分析题', '多解比较题'];
  for (const cat of cats) {
    const tasks = pack.num[cat];
    if (!Array.isArray(tasks) || tasks.length !== 5) throw new Error(pack.name + ' ' + cat + ' 任务数≠5');
    tasks.forEach((t, i) => {
      const d = i + 1;
      const base = t.q.replace(/[。.]$/, '');
      const others = tasks.filter((_, j) => j !== i).map(x => x.a).filter(x => x !== t.a);
      const dist = t.dist || Array.from(new Set(others)).slice(0, 3);
      if (new Set([t.a].concat(dist)).size < 4) throw new Error(pack.name + ' ' + cat + ' 干扰项重复: ' + (t.topic || i));
      const sh = E.shuffleOptions([t.a].concat(dist), 0, 500 + i * 37 + cat.length);
      const sol = t.sol;
      const ana = t.ana || ('本题考查' + (t.topic || cat) + '的基本方法，关键是按' + cat + '的要求规范书写。');
      const pts = t.pts || [t.topic || cat, '基本方法'];
      const pit = t.pit || ['计算粗心', '漏写条件'];
      out.push(E.choice(d, cat, {
        topic: t.topic, title: cat + ' · ' + (t.topic || '典型题'),
        question: base + '，结果为',
        options: sh.options,
        correct: sh.correct, solution: sol, analysis: ana, points: pts, pitfalls: pit
      }));
      out.push(E.fill(d, cat, {
        topic: t.topic, title: cat + ' · ' + (t.topic || '典型题'),
        question: base + '，答案：____。',
        answer: t.a, solution: sol, analysis: ana, points: pts, pitfalls: pit
      }));
      out.push(E.subj(d, cat, {
        topic: t.topic, title: cat + ' · ' + (t.topic || '典型题'),
        question: base + '，写出解答过程。',
        answer: t.a, steps: [sol], solution: sol, analysis: ana, points: pts, pitfalls: pit
      }));
    });
  }
  return out;
}

function build(pack) { return textItems(pack).concat(numericItems(pack)); }
module.exports = { build, textItems, numericItems };
