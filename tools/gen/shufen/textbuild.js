'use strict';
/* 文本类题型构造：概念辨析（选择）、公式填空（填空）、证明题（主观）、反例与存在性（5/5/5） */
const E = require('./engine');
const { mulberry32 } = E;

function conceptItems(facts, falses, chapter) {
  // facts: [{topic, text, why}] 真命题 15 条，按 3 条/难度
  if (facts.length < 15) throw new Error('concept facts 不足15');
  const out = [];
  for (let i = 0; i < 15; i++) {
    const d = Math.floor(i / 3) + 1;
    const self = facts[i];
    const rnd = mulberry32(1000 + i * 37);
    const picked = [];
    while (picked.length < 3) {
      const j = Math.floor(rnd() * falses.length);
      if (picked.indexOf(falses[j]) < 0) picked.push(falses[j]);
    }
    const opts = [self.text, picked[0].text, picked[1].text, picked[2].text];
    const sh = E.shuffleOptions(opts, 0, 9000 + i * 13);
    out.push(E.choice(d, '概念辨析题', {
      topic: self.topic,
      title: '概念辨析题 · ' + self.topic,
      question: '关于' + self.topic + '，下列说法正确的是',
      options: sh.options,
      correct: sh.correct,
      solution: self.why,
      analysis: '本题考查' + self.topic + '相关概念的准确表述。正确选项为：' + self.text + '；其余选项混淆了条件或结论。',
      points: [self.topic, '概念辨析'],
      pitfalls: ['忽略定义中的条件', '把充分条件与必要条件颠倒']
    }));
  }
  return out;
}

function formulaItems(formulas) {
  // formulas: [{q: 含 ____ 的题干, a, why, topic}]
  if (formulas.length < 15) throw new Error('formulas 不足15');
  const out = [];
  for (let i = 0; i < 15; i++) {
    const d = Math.floor(i / 3) + 1;
    const f = formulas[i];
    out.push(E.fill(d, '公式填空题', {
      topic: f.topic || '基本公式',
      title: '公式填空题 · ' + (f.topic || '基本公式'),
      question: f.q,
      answer: '$' + f.a + '$',
      solution: f.why || ('由定义或公式直接得到：' + f.a + '。'),
      analysis: '本题考查' + (f.topic || '基本公式') + '的准确记忆与适用条件。' + (f.why || ''),
      points: [f.topic || '基本公式', '公式记忆'],
      pitfalls: ['漏写条件', '公式中的符号或系数写错']
    }));
  }
  return out;
}

function proofItems(proofs) {
  // proofs: [{claim, steps:[...], pts, pit}] 15 条，3 条/难度
  if (proofs.length < 15) throw new Error('proofs 不足15');
  const out = [];
  for (let i = 0; i < 15; i++) {
    const d = Math.floor(i / 3) + 1;
    const p = proofs[i];
    out.push(E.subj(d, '证明题', {
      topic: p.topic || '基本结论',
      title: '证明题 · ' + (p.topic || '基本结论'),
      question: ('证明：' + p.claim).replace(/\s/g, '').length < 12 ? '证明：' + p.claim + '，请写出证明过程。' : '证明：' + p.claim,
      answer: p.answer || '命题得证。',
      steps: p.steps,
      solution: p.steps.map((s, k) => '(' + (k + 1) + ') ' + s).join('\n'),
      analysis: '本题考查' + (p.topic || '基本结论') + '的证明。' + (p.why || '关键是回到定义并逐条验证条件。'),
      points: p.pts || [p.topic || '基本结论', '定义法'],
      pitfalls: p.pit || ['只验证结论不验证条件', '循环论证']
    }));
  }
  return out;
}

function counterItems(falses, truths) {
  // falses: [{topic, text, ex, why}] 15 条（命题不成立），truths 用于选择项干扰
  if (falses.length < 15 || truths.length < 3) throw new Error('counter 素材不足');
  const out = [];
  for (let i = 0; i < 5; i++) { // choice d=1..5
    const f = falses[i];
    const rnd = mulberry32(3000 + i * 17);
    const opts = [f.text];
    let k = 0;
    while (opts.length < 4) { const t = truths[(i + k) % truths.length].text; if (opts.indexOf(t) < 0) opts.push(t); k++; }
    // 题目问“错误的是”，正确答案是错误命题 f
    const sh = E.shuffleOptions(opts, 0, 5000 + i);
    const correctWord = '“' + f.text + '”的反例：' + f.ex;
    out.push(E.choice(i + 1, '反例与存在性题', {
      topic: f.topic,
      title: '反例与存在性题 · ' + f.topic,
      question: '关于' + f.topic + '，下列命题错误的是',
      options: sh.options,
      correct: sh.correct,
      answer: sh.correct === 0 ? '' : undefined,
      solution: '错误的命题是“' + f.text + '”。' + f.ex + ' ' + f.why,
      analysis: '本题要求识别不成立的命题。' + f.text + ' 的反例为：' + f.ex + '，故该命题错误；其余选项均为正确结论。',
      points: [f.topic, '举反例'],
      pitfalls: ['把真命题误判为假', '反例不满足题设条件']
    }));
  }
  for (let i = 5; i < 10; i++) { // fill d=1..5
    const f = falses[i];
    out.push(E.fill(i - 4, '反例与存在性题', {
      topic: f.topic,
      title: '反例与存在性题 · ' + f.topic,
      question: '命题“' + f.text + '”不成立，请举出一个反例：____。',
      answer: '$' + f.ex + '$',
      solution: f.why + ' 反例：' + f.ex + '。',
      analysis: '本题考查反例构造。判断命题为假只需给出一个满足条件但结论不成立的例子。' + f.why,
      points: [f.topic, '反例构造'],
      pitfalls: ['反例不满足全部题设', '把特例当反例但不说明结论为何不成立']
    }));
  }
  for (let i = 10; i < 15; i++) { // subjective d=1..5
    const f = falses[i];
    out.push(E.subj(i - 9, '反例与存在性题', {
      topic: f.topic,
      title: '反例与存在性题 · ' + f.topic,
      question: '判断命题“' + f.text + '”是否成立。若成立，说明理由；若不成立，举出反例并说明。',
      answer: '命题不成立。反例：' + f.ex,
      steps: [f.why, '构造反例：' + f.ex, '验证该反例满足题设条件，但结论不成立，故命题为假。'],
      solution: '命题不成立。\n反例：' + f.ex + '。\n' + f.why,
      analysis: '本题考查对' + f.topic + '成立条件的理解。否定一个全称命题只需一个反例，关键是反例要满足题设的全部条件。',
      points: [f.topic, '反例与存在性'],
      pitfalls: ['举出的例子不满足题设', '只说明结论奇怪而没验证条件']
    }));
  }
  return out;
}

module.exports = { conceptItems, formulaItems, proofItems, counterItems };
