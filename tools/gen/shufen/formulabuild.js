'use strict';
/* 由章节公式表生成四类文本题：公式填空、概念辨析、证明、反例与存在性 */
const E = require('./engine');

function mutate(right) {
  const r = right;
  const outs = [];
  if (/^-/.test(r)) outs.push(r.replace(/^-/, ''));
  else outs.push('-' + r);
  if (/\^2/.test(r)) outs.push(r.replace(/\^2/, '^3'));
  else if (/\^3/.test(r)) outs.push(r.replace(/\^3/, '^4'));
  else outs.push(r + '\\cdot 2');
  const m = r.match(/[0-9]/);
  if (m) outs.push(r.replace(/[0-9]/, (d) => String((Number(d) + 1) % 10)));
  else outs.push(r + '+1');
  return Array.from(new Set(outs.filter(x => x && x !== r)));
}

function textItems(chapter) {
  const formulas = chapter.formulas;
  if (formulas.length < 15) throw new Error(chapter.name + ' 公式不足15');
  const items = [];
  const P = '在《' + chapter.name + '》中，';
  formulas.forEach((f, i) => {
    const d = Math.floor(i / 3) + 1;
    const [topic, left, right, why] = f;
    items.push(E.fill(d, '公式填空题', {
      topic, title: '公式填空题 · ' + topic,
      question: P + '填空（' + topic + '）：$' + left + '=$____。',
      answer: '$' + right + '$',
      solution: why || ('由基本公式直接得到 $' + left + '=' + right + '$。'),
      analysis: '本题考查' + topic + '的公式表达。' + (why || ''),
      points: [topic, '公式记忆'], pitfalls: ['符号或系数写错', '遗漏成立条件']
    }));
  });
  formulas.forEach((f, i) => {
    const d = Math.floor(i / 3) + 1;
    const [topic, left, right, why] = f;
    const muts = mutate(right);
    const opts = ['$' + left + '=' + right + '$', '$' + left + '=' + muts[0] + '$', '$' + left + '=' + muts[1] + '$', '$' + left + '=' + (muts[2] || '0') + '$'];
    const sh = E.shuffleOptions(opts, 0, 1200 + i * 17 + chapter.name.length);
    items.push(E.choice(d, '概念辨析题', {
      topic, title: '概念辨析题 · ' + topic,
      question: P + '关于' + topic + '，下列等式正确的是',
      options: sh.options, correct: sh.correct,
      solution: '正确等式为 $' + left + '=' + right + '$。' + (why || ''),
      analysis: '本题考查' + topic + '的准确表达；其余选项对公式作了错误改动。',
      points: [topic, '概念辨析'], pitfalls: ['把近似公式当精确等式', '忽略公式成立条件']
    }));
  });
  formulas.forEach((f, i) => {
    const d = Math.floor(i / 3) + 1;
    const [topic, left, right, why] = f;
    items.push(E.subj(d, '证明题', {
      topic, title: '证明题 · ' + topic,
      question: P + '证明（' + topic + '）：$' + left + '=' + right + '$。',
      answer: '等式成立。',
      steps: [why || ('由定义与基本运算法则逐项验证。'), '故 $' + left + '=' + right + '$ 成立。'],
      solution: (why || '由定义与基本运算法则逐项验证。') + '\n故等式成立。',
      analysis: '本题考查' + topic + '的推导与验证，关键是说明每一步的依据。',
      points: [topic, '公式推导'], pitfalls: ['只用特例代替证明', '循环使用待证结论']
    }));
  });
  for (let i = 0; i < 5; i++) {
    const [topic, left, right] = formulas[i];
    const bad = mutate(right)[0];
    const opts = ['$' + left + '=' + right + '$', '$' + left + '=' + bad + '$', '$' + left + '=' + (mutate(right)[1] || '0') + '$', '$' + left + '=' + (mutate(right)[2] || '1') + '$'];
    const sh = E.shuffleOptions(opts, 0, 3300 + i * 23 + chapter.name.length);
    items.push(E.choice(i + 1, '反例与存在性题', {
      topic, title: '反例与存在性题 · ' + topic,
      question: P + '关于' + topic + '，从下列四个等式中选出正确的一个，正确选项是',
      options: sh.options, correct: sh.correct,
      solution: '正确等式为 $' + left + '=' + right + '$，其余写法不成立。',
      analysis: '本题考查对' + topic + '公式成立与否的判断。',
      points: [topic, '真伪判断'], pitfalls: ['把错误变形当成恒等式']
    }));
  }
  for (let i = 5; i < 10; i++) {
    const [topic, left, right] = formulas[i];
    const bad = mutate(right)[0];
    items.push(E.fill(i - 4, '反例与存在性题', {
      topic, title: '反例与存在性题 · ' + topic,
      question: P + '命题（' + topic + '）：“$' + left + '=' + bad + '$”不成立，请写出一个反例（说明两边不相等的取值）：____。',
      answer: '$取 x=1$ 代入验证两边不相等',
      solution: '错误写法为 $' + left + '=' + bad + '$，正确等式应为 $' + left + '=' + right + '$；取 $x=1$ 代入可看出两边不相等。',
      analysis: '本题考查对公式变形的辨识：只要给出一个使等式不成立的取值即可。',
      points: [topic, '举反例'], pitfalls: ['反例不满足公式成立条件']
    }));
  }
  for (let i = 10; i < 15; i++) {
    const [topic, left, right] = formulas[i];
    const bad = mutate(right)[1] || mutate(right)[0];
    items.push(E.subj(i - 9, '反例与存在性题', {
      topic, title: '反例与存在性题 · ' + topic,
      question: P + '对于' + topic + '，判断命题“$' + left + '=' + bad + '$”是否成立。若成立，说明理由；若不成立，举出反例。',
      answer: '不成立。',
      steps: ['正确等式为 $' + left + '=' + right + '$。', '错误变形不能恒成立，取适当 $x$ 代入即可发现两边不等。'],
      solution: '命题不成立。正确等式为 $' + left + '=' + right + '$；例如取 $x=1$ 代入，错误写法两边一般不相等。',
      analysis: '本题考查对' + topic + '公式变形的真假判断，找反例时注意取值范围。',
      points: [topic, '反例与真伪'], pitfalls: ['忽略公式成立条件']
    }));
  }
  return items;
}
module.exports = { textItems, mutate };
