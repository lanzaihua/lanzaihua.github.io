# 数学分析题库生成器（shufen）

状态：部分完成（2026-11-04）。正式题库 src/data/bank-analysis.json 未改动，仍为 3450 题旧数据；本目录只把生成结果写到 out/bank-analysis.json（暂存区）。

## 已完成
- 通用框架：engine.js（item 构建、校验）、mathlib.js（多项式/数值工具）、textbuild.js（概念/公式/证明/反例四类文本题）、pack.js（章节打包器：数值类 6 类 × 15 题，同一数学任务的三种题型）。
- 第 1—3 章：chapters/ch01.js、packsA.js（第 2、3 章）。
- 暂存结果：out/bank-analysis.json，450 题（3 章 × 150），结构校验通过：
  - 每章 10 类各 15 题；choice/fill/subjective 各 50；每题型每星级各 10；
  - 题干全科唯一；source/examOrigin/points/pitfalls/options/correct/空位 全部满足构建约束。
- 校验命令：node tools/gen/shufen/build.js（章节拼装 + 逐章校验 + 唯一性检查，只写 out/）。

## 未完成
- 第 4—23 章（20 章 × 150 = 3000 题）仍需逐章编写内容（真实命题/公式/反例 + 数值任务）。每章新增一个 pack（事实 15、错误命题 15、公式 15、六类数值任务各 5），约 12–15 分钟/章；全量预计还需 4–5 小时。

## 如何继续
1. 在 packsA.js 同级新增 pack 文件（参考 packsA.js 的 ch2 结构）。
2. 在 chapters/ 下新增一章模块：
   const P = require('../pack'); const pack = require('../packsB').find(p => p.name.indexOf('第四章') === 0);
   module.exports = { name: pack.name, build() { return P.build(pack); } };
3. 把模块加入 chapters/index.js。
4. 构建：node tools/gen/shufen/build.js（输出到 out/）。
5. 全量 23 章、total=3450、unique=3450 后，才用：
   BANK_OUT=src/data/bank-analysis.json node tools/gen/shufen/build.js
   覆盖正式文件，然后运行 node tools/qa-bank.js。

## 注意
- 生成器在写 JSON 前会检查：分类/题型/星级配额、必填字段、选项数、填空空位、禁用元信息表述、重复题干。
- source 统一为「考研原创同型题」，examOrigin 为「考研原创同型题」。
- 第 1 章曾因写入截断出现过转义丢失，已修复；新增内容请保持 LaTeX 反斜杠双写并跑一次构建校验。

## 2026-11-04 交付状态
- 正式文件 src/data/bank-analysis.json 已用 part1 + part2-fallback + part3-fallback 合并覆盖：3450 题、23 章、10 类各 345、三题型各 1150、每章每型每星 10、题干唯一、单科 qa 0 问题。
- 分片：out/bank-analysis-part1.json（ch1-3，手写高质量）、out/bank-analysis-part2-fallback.json（ch4-13，框架生成）、out/bank-analysis-part3-fallback.json（ch14-23，框架生成）。
- 合并：node tools/gen/shufen/merge.js <part1> <part2> <part3>；单科校验：node tools/gen/shufen/qa-analysis.js；分片自检：node tools/gen/shufen/check-part.js；重复替换：node tools/gen/shufen/repair-dups.js。
- analysis-2/3 后续交付的分片替换后重跑 merge + qa-analysis 即可。

## 最终交付（2026-11-04 收尾）
- 正式库 src/data/bank-analysis.json 为 part1（ch1-3，手写）+ part2（ch4-13，analysis-2 最终版）+ part3（ch14-23，analysis-3 手写）合并：3450 题、23 章、10 类各 345、三题型各 1150、每章每型每星 10、题干唯一 3450、与旧库 0 重复。
- qa-analysis.js 0 问题；全科 qa-bank.js：total 8250、chapters 55、unique 8250、problems 0。
- 分片：out/bank-analysis-part1.json、part2.json、part3.json；fallback 文件仅作历史备份，未进入正式库。
