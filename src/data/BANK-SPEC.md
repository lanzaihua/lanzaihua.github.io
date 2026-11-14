# 四科题库 JSON 规范

本文件规定四科题库的最终格式与数量边界。网页构建与 `tools/qa-bank-strict.js` 按本规范校验。

## 输出文件

| 科目 | 文件 | 学科 skill |
|---|---|---|
| 高等代数 | `src/data/bank-algebra.json` | `advanced-algebra` |
| 数学分析 | `src/data/bank-analysis.json` | `mathematical-analysis` |
| 解析几何 | `src/data/bank-geometry.json` | `analytic-geometry` |
| 西方经济学 | `src/data/bank-western.json` | `western-economics` |

## 顶层结构

```json
{
  "subject": "gaodai",
  "generatedAt": "2026-11-05T00:00:00+08:00",
  "items": []
}
```

`subject` 取值：`gaodai` / `shufen` / `jieji` / `xijing`。

## 单题结构

```json
{
  "id": "GA-B0001",
  "subject": "gaodai",
  "chapter": "第三章 线性方程组",
  "type": "subjective",
  "category": "证明题",
  "difficulty": 2,
  "templateId": "T-03-05",
  "pointKeys": ["极大线性无关组与秩"],
  "title": "秩为 r 的向量组中，任意 r 个无关向量是否极大",
  "question": "设向量组 $\\alpha_1,\\dots,\\alpha_s$ 的秩为 $r$。证明：……",
  "standardSolution": "证明：\n1. ……\n2. ……\n\n答案：……",
  "detailedAnalysis": "本题考查……；关键是……；易错点是……。",
  "answer": "$\\alpha_{i_1},\\dots,\\alpha_{i_r}$ 是极大线性无关组。",
  "points": ["取极大无关组", "反证添入向量"],
  "pitfalls": ["循环论证"],
  "options": [],
  "correct": "",
  "source": "考研原创同型题（模板 T-03-05）",
  "examOrigin": "考研原创同型题",
  "tags": ["证明", "秩", "反证"],
  "relatedEntries": []
}
```

### 字段规则

- `id`：四科前缀 `GA-` / `MA-` / `GE-` / `WE-`，后接四位序号；全库唯一。
- `chapter`：必须与 `seed.json` 中该科章节名逐字一致；当前 55 章。
- `type`：`choice` 客观题 / `fill` 填空题 / `subjective` 主观题。
- `category`：计算题、应用题、综合题、概念辨析题、证明题、公式填空题、反例与存在性题、分类讨论题、误差分析题、多解比较题。
- `difficulty`：1–5，对应 ★ 到 ★★★★★。
- `question` / `answer` / `standardSolution` / `detailedAnalysis`：数学用 LaTeX，行内 `$...$`，独立 `$$...$$`；JSON 内反斜杠双写。
- `standardSolution`：主观题必须是一份可判分的完整解答，并以 `解：`、`证明：` 或 `答：` 开头。
- `points` / `pitfalls`：至少各 1 条，不能为空。
- `options`：客观题必须正好 4 个选项，字母 A–D 不重复，选项文本不得重复。
- `correct`：客观题必须为 A–D 之一。
- `source`：考研题、原创同型题或教材课后习题；不编造页码、年份、考试名。
- `examOrigin`：考研原创同型题 / 教材课后习题。
- 教材课后题使用 `source: "教材课后习题（第X章）"` 与 `examOrigin: "教材课后习题"`。

## 当前数量边界

全库 **8831 题**：

| 科目 | 题数 | 考研同型 | 教材课后 |
|---|---:|---:|---:|
| 高等代数 | 1550 | 1500 | 50 |
| 数学分析 | 3522 | 3450 | 72 |
| 解析几何 | 1199 | 900 | 299 |
| 西方经济学 | 2560 | 2400 | 160 |

基础题库按 **55 章 × 5 星 × 3 种作答形式** 组织：

- 每个章节、每个星级、每种作答形式至少 **10 题**；
- 当前 825 个格子全部正好 10 题；
- 教材课后题是额外补充，不占用基础题库的 10 题配额；当前教材课后共 581 题。

## 校验

```powershell
node tools/qa-bank-strict.js --strict-difficulty
node tools/qa-site-consistency.js
node build.js
node build.js --pages
```

构建会拦截：

- 题库总数不是 8831；
- 每章每星每型少于 10 题；
- 客观题不是 4 个选项、选项重复；
- 主观题标准解答开头不是 `解/`证明/答；
- 题干、答案、解答、选项末尾多乘 2；
- 裸 LaTeX、公式定界符不成对；
- 更新记录与 README 计数不一致。
