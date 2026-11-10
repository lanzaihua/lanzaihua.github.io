'use strict';
/* 章节打包器：文本 60 题 + 数值 6 类 × 15 题 */
const E = require('./engine');

function textItems(pack) {
  const T = require('./textbuild');
  return []
    .concat(T.conceptItems(pack.facts.map(f => ({ topic: f[0], text: f[1], why: f[2] })), pack.falses.map(f => ({ topic: f[0], text: f[1], why: f[2] })), pack.name))
    .concat(T.formulaItems(pack.formulas.map(f => ({ q: f[0], a: f[1], why: f[2], topic: f[3] }))))
    .concat(T.proofItems(pack.facts.map(f => ({ topic: f[0], claim: f[1], steps: [f[2]], why: f[2], pts: [f[0]], pit: [f[0], '论证不完整'] }))))
    .concat(T.counterItems(pack.falses.map(f => ({ topic: f[0], text: f[1], ex: f[2], why: f[2] })),
      pack.facts.map(f => ({ text: f[1] }))));
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
      const dist = t.dist ? t.dist.slice(0, 3) : [];
      for (const other of others) { if (dist.length >= 3) break; if (dist.indexOf(other) < 0) dist.push(other); }
      for (const pad of ['$0$', '$1$', '$2$', '$3$', '不存在']) { if (dist.length >= 3) break; if (dist.indexOf(pad) < 0 && pad !== t.a) dist.push(pad); }
      if (dist.length < 3) throw new Error(pack.name + ' ' + cat + ' 干扰项不足');
      const sh = E.shuffleOptions([t.a].concat(dist), 0, 500 + i * 37 + cat.length);
      const sol = t.sol;
      const ana = t.ana || ('本题考查' + (t.topic || cat) + '的基本方法，关键是按' + cat + '的要求规范书写。');
      const pts = t.pts || [t.topic || cat, '基本方法'];
      const pit = t.pit || ['计算粗心', '漏写条件'];
      out.push(E.choice(d, cat, {
        topic: t.topic, title: cat + ' · ' + (t.topic || '典型题'),
        question: base + '，结果为',
        options: sh.options, correct: sh.correct,
        solution: sol, analysis: ana, points: pts, pitfalls: pit
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
module.exports = { build, numericItems };
