'use strict';
/* part2 专用文本题构造：由公式表生成四类文本题，问法与旧题库不同。 */
const E = require('./engine');

function mutate2(right) {
  const r = String(right);
  const outs = [];
  if (/^-/.test(r)) outs.push(r.replace(/^-/, ''));
  else outs.push('-' + r);
  if (/\^2/.test(r)) outs.push(r.replace(/\^2/, '^3'));
  else if (/\^3/.test(r)) outs.push(r.replace(/\^3/, '^4'));
  else outs.push(r + '\\cdot 2');
  const m = r.match(/[0-9]/);
  if (m) outs.push(r.replace(/[0-9]/, (d) => String((Number(d) + 1) % 10)));
  else outs.push(r + '+1');
  const extra = [r + '\\cdot 3', r + '+2', r.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/, (s, a, b) => '\\frac{' + b + '}{' + a + '}')];
  const all = outs.concat(extra).filter(x => x && x !== r);
  const uniq = Array.from(new Set(all));
  while (uniq.length < 3) uniq.push(r + '\\cdot ' + (uniq.length + 2));
  return uniq;
}

function textItems(chapter) {
  const formulas = chapter.formulas;
  if (!Array.isArray(formulas) || formulas.length < 15) throw new Error(chapter.name + ' 公式不足15');
  const items = [];
  // 公式填空：15 题，每题 3 个难度（3 条/难度）
  formulas.forEach((f, i) => {
    const d = Math.floor(i / 3) + 1;
    const [topic, left, right, why] = f;
    items.push(E.fill(d, '公式填空题', {
      topic, title: '公式填空题 · ' + topic,
      question: '公式默写（' + topic + '）：$' + left + '=$____。',
      answer: '$' + right + '$',
      solution: why || ('由基本公式直接得到 $' + left + '=' + right + '$。'),
      analysis: '本题考查' + topic + '的公式表达。' + (why || ''),
      points: [topic, '公式记忆'], pitfalls: ['符号或系数写错', '遗漏成立条件']
    }));
  });
  // 概念辨析：15 题，四个等式中选正确的
  formulas.forEach((f, i) => {
    const d = Math.floor(i / 3) + 1;
    const [topic, left, right, why] = f;
    const muts = mutate2(right);
    const opts = ['$' + left + '=' + right + '$', '$' + left + '=' + muts[0] + '$', '$' + left + '=' + muts[1] + '$', '$' + left + '=' + muts[2] + '$'];
    const sh = E.shuffleOptions(opts, 0, 2200 + i * 19 + chapter.name.length);
    items.push(E.choice(d, '概念辨析题', {
      topic, title: '概念辨析题 · ' + topic,
      question: '在下列关于“' + topic + '”的等式中，成立的是',
      options: sh.options, correct: sh.correct,
      solution: '成立的等式为 $' + left + '=' + right + '$。' + (why || ''),
      analysis: '本题考查' + topic + '的准确表达；其余选项对公式作了错误改动。',
      points: [topic, '概念辨析'], pitfalls: ['把近似公式当精确等式', '忽略公式成立条件']
    }));
  });
  // 证明题：15 题，说明等式成立的依据
  formulas.forEach((f, i) => {
    const d = Math.floor(i / 3) + 1;
    const [topic, left, right, why] = f;
    items.push(E.subj(d, '证明题', {
      topic, title: '证明题 · ' + topic,
      question: '说明等式 $' + left + '=' + right + '$ 的成立依据。',
      answer: '等式成立。',
      steps: [why || ('由定义与基本运算法则逐项验证。'), '故 $' + left + '=' + right + '$ 成立。'],
      solution: (why || '由定义与基本运算法则逐项验证。') + '\n故等式成立。',
      analysis: '本题考查' + topic + '的推导与验证，关键是说明每一步的依据。',
      points: [topic, '公式推导'], pitfalls: ['只用特例代替证明', '循环使用待证结论']
    }));
  });
  // 反例与存在性：15 题（5 选择 + 5 填空 + 5 主观）
  for (let i = 0; i < 5; i++) {
    const [topic, left, right] = formulas[i];
    const muts = mutate2(right);
    const opts = ['$' + left + '=' + right + '$', '$' + left + '=' + muts[0] + '$', '$' + left + '=' + muts[1] + '$', '$' + left + '=' + muts[2] + '$'];
    const sh = E.shuffleOptions(opts, 0, 4400 + i * 29 + chapter.name.length);
    items.push(E.choice(i + 1, '反例与存在性题', {
      topic, title: '反例与存在性题 · ' + topic,
      question: '在下列关于“' + topic + '”的等式中，唯一正确的是',
      options: sh.options, correct: sh.correct,
      solution: '正确的等式为 $' + left + '=' + right + '$，其余写法均不成立。',
      analysis: '本题考查对' + topic + '公式成立与否的判断，逐项核对系数与符号即可。',
      points: [topic, '真伪判断'], pitfalls: ['把错误变形当成恒等式']
    }));
  }
  for (let i = 5; i < 10; i++) {
    const [topic, left, right] = formulas[i];
    const bad = mutate2(right)[0];
    items.push(E.fill(i - 4, '反例与存在性题', {
      topic, title: '反例与存在性题 · ' + topic,
      question: '等式“$' + left + '=' + bad + '$”是错误变形，正确的等式应为：____。',
      answer: '$' + left + '=' + right + '$',
      solution: '错误写法为 $' + left + '=' + bad + '$，正确等式应为 $' + left + '=' + right + '$。',
      analysis: '本题考查对公式变形的辨识，找出被改动的位置即可。',
      points: [topic, '举反例'], pitfalls: ['忽略公式成立条件']
    }));
  }
  for (let i = 10; i < 15; i++) {
    const [topic, left, right] = formulas[i];
    const bad = mutate2(right)[1] || mutate2(right)[0];
    items.push(E.subj(i - 9, '反例与存在性题', {
      topic, title: '反例与存在性题 · ' + topic,
      question: '判断等式“$' + left + '=' + bad + '$”是否正确：若正确，说明理由；若错误，写出正确形式并说明依据。',
      answer: '等式错误，正确形式为 $' + left + '=' + right + '$。',
      steps: ['正确等式为 $' + left + '=' + right + '$。', '所给写法改动了系数或符号，不能恒成立。', '故命题错误。'],
      solution: '等式错误。正确等式为 $' + left + '=' + right + '$。\n' + (formulas[i][3] || ''),
      analysis: '本题考查对' + topic + '公式变形的真假判断，写出正确形式即可。',
      points: [topic, '反例与真伪'], pitfalls: ['忽略公式成立条件']
    }));
  }
  return items;
}
module.exports = { textItems, mutate2 };
