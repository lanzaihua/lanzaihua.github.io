const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = function (p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); };
const norm = function (s) { return String(s || '').replace(/\s+/g, ''); };

test('every final-review knowledge point has its own memory hook and exam method', function () {
  const data = JSON.parse(read('src/data/final-plan-knowledge.json'));
  const exams = new Set();
  const hooks = new Set();
  let count = 0;
  Object.keys(data.subjects).forEach(function (subject) {
    data.subjects[subject].chapters.forEach(function (chapter) {
      chapter.points.forEach(function (point) {
        count++;
        assert.ok(point.memoryHook, point.name + ' missing memoryHook');
        assert.ok(point.exam, point.name + ' missing exam');
        assert.ok(point.memory.indexOf('记「' + point.name + '」') === 0, point.name + ' memory lacks name');
        assert.ok(point.memory.indexOf('考场：') > 0, point.name + ' memory lacks exam label');
        assert.ok(point.detail && point.detail.length >= 4, point.name + ' missing detail');
        assert.ok(!/[=，、；]\s*。$/.test(point.detail), point.name + ' detail ends in a cut formula');
        assert.ok(!/\\[A-Za-z]+$/.test(point.detail), point.name + ' detail ends in a cut command');
        assert.ok(!/[\uFFFD]/.test(point.detail), point.name + ' detail contains bad char');
        assert.strictEqual((point.detail.match(/\$/g) || []).length % 2, 0, point.name + ' unbalanced detail $');
        assert.ok(!/<\/?[A-Za-z][A-Za-z0-9:-]*(?:\s[^<>]*)?\/?>/.test(point.memoryHook + point.exam), point.name + ' contains html');
        assert.ok(!/[\uFFFD]/.test(point.memoryHook + point.exam), point.name + ' contains bad char');
        assert.strictEqual((point.memoryHook.match(/\$/g) || []).length % 2, 0, point.name + ' unbalanced memory $');
        assert.strictEqual((point.exam.match(/\$/g) || []).length % 2, 0, point.name + ' unbalanced exam $');
        const e = norm(point.exam);
        const h = norm(point.memoryHook);
        assert.ok(!exams.has(e), point.name + ' duplicate exam');
        assert.ok(!hooks.has(h), point.name + ' duplicate hook');
        exams.add(e); hooks.add(h);
      });
    });
  });
  assert.strictEqual(count, 574);
  assert.strictEqual(exams.size, 574);
  assert.strictEqual(hooks.size, 574);
});

test('memory data is preserved by the builder and rendered as two rows', function () {
  const builder = read('tools/build-final-plan-data.js');
  assert.ok(builder.includes('final-plan-memory.json'));
  assert.ok(builder.includes('MEM_OVERRIDES'));
  assert.ok(builder.includes('clipText'));
  assert.ok(builder.includes('memoryHook'));
  const ui = read('src/js/58-final.js');
  assert.ok(ui.includes('function finalPlanMemoryHtml'));
  assert.ok(ui.includes('finalPlanMemoryHtml(point.memory, point.memoryHook, point.exam'));
  assert.ok(ui.includes('finalPlanMemoryHtml(d.point.memory, d.point.memoryHook, d.point.exam'));
  const css = read('src/styles.css');
  assert.ok(css.includes('.fpm-memory-tip .fpm-memory-row'));
  assert.ok(css.includes('.fd-memory .fpm-memory-row'));
  const pkg = JSON.parse(read('package.json'));
  assert.strictEqual(pkg.scripts['qa:memory'], 'node tools/audit-final-plan-knowledge.js');
  assert.ok(pkg.scripts.check.includes('npm run qa:memory'));
  assert.ok(fs.existsSync(path.join(ROOT, 'tools/audit-final-plan-knowledge.js')));
});
