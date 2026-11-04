---
name: western-economics
description: "马工程《西方经济学》(第二版) knowledge base — 导论 + 上册微观 + 下册宏观, built from the textbook, the 笔记和课后习题详解, the 配套题库 (考研真题＋章节题库) and the 习题与解答. Covers theory chapters, per-chapter exercise files (课后习题全解 / 考研真题 / 自测 / 计算题精解) and a 真题与考法总览. Use when solving or reasoning about demand/supply and elasticity, consumer choice, production and cost, market structures (perfect competition, monopoly, monopolistic competition, oligopoly, game theory), factor markets, general equilibrium and Pareto efficiency, market failure and micro policy, GDP and macro indicators, income-expenditure / IS-LM / AD-AS models, unemployment and inflation, the Phillips curve, open-economy models (Mundell-Fleming), fiscal and monetary policy, or economic growth (Solow model) — or when doing the textbook's 课后习题 / 考研真题 / 期末复习."
---

<!-- argument-hint: [topic, model name, chapter (ch00-ch16), or "真题" / "练习"] -->

# 西方经济学 — Western Economics

**马工程《西方经济学》(第二版)** — 《西方经济学》编写组（高等教育出版社／人民出版社，2019.9）

| | 卷 | 章节 | 主题 | 页数 |
|---|---|---|---|---|
| **导** | 导论 | ch00 | 学科界定 · 研究方法 | ~12 |
| **上** | 第二版 上册 | ch01–ch08 | **微观经济学** | 412 |
| **下** | 第二版 下册 | ch09–ch16 | **宏观经济学** | 326 |

**三层结构**：
- **理论层** `chapters/ch00–ch16` — 核心框架、术语、易错、速查表、解题套路、工作示例；
- **练习层** `exercises/ch00–ch16` — 教材课后习题全解 + 考研真题精选（带出处）+ 自测判断/选择 + 计算题完整解法；
- **索引层** [exams.md](exams.md)（真题热度 / 必背名解 Top 40 / 论述母题）、[cheatsheet.md](cheatsheet.md)（★ 考点表 + 练题路线）、[patterns.md](patterns.md)（计算套路 + 例题索引）、[glossary.md](glossary.md)（191 条术语）。

**配套来源**：教材 × 笔记和课后习题详解 × 配套题库（考研真题精选＋章节题库）× 习题与解答。
**Updated**: 2026-11-04（新增导论章、练习层与真题索引；glossary 补录 44 条；修正源文错误 20 余处）

## How to Use This Skill

- **无参数** — 加载下面的核心框架
- **给主题** — 问 `弹性`、`IS-LM`、`乘数`、`帕累托最优`、`索洛模型`；我读对应章节
- **给章节** — `ch05`（不完全竞争）、`ch11`（IS-LM）；我直接加载
- **要做题** — `ch05 的题` → 我读 [exercises/ch05](exercises/ch05-imperfect-competition.md)（10 道课后题 + 7 道真题 + 12 条自测 + 3 道计算题全解）
- **问考试重点** — [exams.md](exams.md) 有**真题热度表**与**必背名词解释 Top 40**；[cheatsheet.md](cheatsheet.md) 有**75 个考点的 ★ 星级表**与 3 天／7 天复习路线
- **要解题套路** — 每章末尾的 `## 解题套路`、[patterns.md](patterns.md) 的 20 个计算套路与"类型 → 例题"索引

**两册的分工**：**上册（微观）**从稀缺性出发，经价格机制 → 消费者 → 生产者 → 市场结构 → 要素市场 → 一般均衡 → 市场失灵，是一条「个体决策如何汇成市场价格」的链条。**下册（宏观）**从度量（GDP/CPI/失业）出发，经三个递进的收入决定模型（收入-支出 → IS-LM → AD-AS）→ 失衡现象（失业/通胀/周期）→ 开放经济 → 政策 → 长期增长，是一条「总量如何决定、如何调节」的链条。

---

## Core Frameworks — 上册（微观, ch00–ch08）

**导论先摆清三件事。** 研究**起点**是**稀缺**（相对于无穷欲望而言资源总是不足）；研究**对象**是稀缺条件下的**资源配置与财富分配**，落到三大基本问题（生产什么、如何生产、为谁生产）；**方法论**是"个人主义 + 理性 + 自利（经济人）+ 均衡"。工具层记两对区分：**实证（是什么）vs 规范（应该是什么）**——唯一判据是**有无价值判断**；**静态 vs 比较静态 vs 动态**——差别在**问不问调整过程**。五阶段更替的动力是"现实打脸理论"：重商（流通）→ 古典（生产）→ 新古典（边际）→ 凯恩斯（需求/政府）→ 后凯恩斯（预期/反干预）。

**稀缺性是全书的起点。** 资源有限而欲望无穷，于是必须**选择**，选择就有**机会成本**，而**边际分析**是做出选择的方法：任何决策都问"多一单位的收益是否大于多一单位的成本"。

**价格机制是第一个模型。** 需求（向右下）与供给（向右上）相交于**均衡价格**；价格偏离时短缺或过剩会把它推回均衡（**供求定理**）。**弹性**衡量反应程度，并决定一切"谁承担"的问题——**弹性小的一方承担得多**（税负归宿的核心）。

**消费者与生产者是完全对偶的两套语言。**
- 消费者：无差异曲线 + 预算线 ⟹ **`MRS = P₁/P₂`**（或 `MU₁/P₁ = MU₂/P₂`），得**消费者均衡**。
- 生产者：等产量线 + 等成本线 ⟹ **`MRTS = w/r`**（或 `MP_L/w = MP_K/r`），得**生产者均衡**。
两套公式同构，**不要写串**。价格变动的**替代效应 + 收入效应**分解出正常品、低档品、**吉芬商品**三类。

**生产成本是生产函数的镜像。** 短期有固定成本、长期没有；`MC` 穿过 `AC` 与 `AVC` 的最低点；`LAC` 是众多 `SAC` 的**包络线**。**生产三阶段的边界是 `AP = MP` 与 `MP = 0`**（不是 `MP` 最大处）。

**`MR = MC` 是一切市场结构的统一判据。** 差别只在需求曲线的形状：
| 市场 | 需求曲线 | 均衡 |
|---|---|---|
| 完全竞争 | 水平（`P = MR`） | `P = MC`，长期 `P = AC_min`（零经济利润） |
| 垄断 | 向右下（**`MR` 斜率 2 倍**） | `MR = MC` 且 **`P > MC`**（无谓损失来源） |
| 垄断竞争 | 向右下但**较平坦** | 长期切点在 `LAC` **最低点左侧**（生产能力过剩） |
| 寡头 | 相互依存 | 古诺 / 斯塔克尔伯格（领导者先动优势） / 斯威齐 / 卡特尔 |

**要素市场的原则是 `MRP = MFC`**，完全竞争下退化为 **`VMP = W`**。**`VMP` 与 `MRP` 只在产品市场不完全竞争时不同**；**准租金**是对短期供给固定要素的支付。

**一般均衡要求所有市场同时出清**（瓦尔拉斯定律：n 个市场只有 n−1 个独立）。**帕累托最优的三层条件**——交换 `MRS_A = MRS_B`、生产 `MRTS_x = MRTS_y`、生产与交换 `MRS = MRT`。**帕累托最优 ≠ 公平**。

**市场失灵有四个来源**：垄断（`P > MC`）、外部性（私人成本 ≠ 社会成本）、公共物品（非排他 + 非竞用 ⟹ 搭便车，最优供给是 **`ΣMRS = MRT`**）、信息不对称（**逆向选择**在事前、**道德风险**在事后）。对应工具：管制/反托拉斯、庇古税/科斯定理、政府供给、**信号传递/甄别**与激励。

---

## Core Frameworks — 下册（宏观, ch09–ch16）

**先会度量，才能谈决定。** GDP 的四个限定词（一国、一定时期、最终产品、市场价值）各排除一些项目；**名义 vs 实际 GDP** 的差别是**当期价格 vs 基期价格**；**CPI（固定篮子）与 GDP 折算指数（当期产量）** 不是一回事。**失业率的分母是劳动力，不是总人口**。

**三个收入决定模型是逐级推广的：**
1. **收入-支出模型**（`Y = C + I + G + NX`）：假定价格与利率不变，只看产品市场。核心工具是**乘数**——投资/政府购买 `1/(1−β)`、**税收 `−β/(1−β)`（负）**、**平衡预算 `= 1`**。
2. **IS-LM 模型**：加入货币市场。**IS 向右下**（产品市场）、**LM 向右上**（货币市场），交点定 `(Y*, r*)`。**斜率决定政策效果**：LM 越陡财政政策越无效（**挤出效应**越大）。
3. **AD-AS 模型**：放开价格。**AD 向右下**（三个效应：利率、实际余额、汇率）、**短期 AS 向右上、长期 AS 垂直**。**供给冲击会同时推高价格、压低产出（滞胀）**。

**三大失衡现象互相咬合。** 失业的四种理论（古典/凯恩斯/新凯恩斯/**自然率**）；通胀三型（需求拉上/成本推动/结构性）；**菲利普斯曲线短期向右下、长期垂直**——因为长期预期会调整（**适应性预期 → 理性预期 → 卢卡斯批判**），不存在持久的替代关系。**菜单成本、工资刚性、效率工资**是短期 AS 向右上与失业存在的微观基础。

**开放经济把政策效果翻转。** **蒙代尔-弗莱明模型**（资本完全流动 ⟹ `r = r*`）给出本章唯一必背的表：

| | 财政政策 | 货币政策 |
|---|---|---|
| **固定汇率制** | **有效** | **无效** |
| **浮动汇率制** | **无效** | **有效** |

**长期增长靠模型。** **索洛模型**稳态条件 **`sf(k*) = (n+δ)k*`**（漏了 `(n+δ)` 是最常见的错）；**储蓄率提高只有水平效应、没有增长效应**；**黄金律**使**人均消费**最大（`f′(k) = n+δ`）；**内生增长理论**用规模报酬不变/递增解释持续增长。

---

## Chapter Index

**导论 + 上册 — 微观经济学**

| # | 标题 | 核心框架 | 练题 |
|---|------|----------|------|
| [ch00](chapters/ch00-introduction.md) | 第0章 导论 | 界定、五阶段、稀缺与三大问题、方法论、实证/规范、静动分析 | [练习](exercises/ch00-introduction.md) |
| [ch01](chapters/ch01-demand-supply-equilibrium.md) | 第1章 需求、供给和均衡价格 | 需求与供给、均衡、**弹性**、**供求分析的应用** | [练习](exercises/ch01-demand-supply-equilibrium.md) |
| [ch02](chapters/ch02-consumer-choice.md) | 第2章 消费者选择 | 效用论、无差异曲线、预算线、**消费者均衡**、**替代与收入效应** | [练习](exercises/ch02-consumer-choice.md) |
| [ch03](chapters/ch03-production-cost.md) | 第3章 企业的生产和成本 | 生产函数、短期/长期生产、短期/长期成本、对偶 | [练习](exercises/ch03-production-cost.md) |
| [ch04](chapters/ch04-perfect-competition.md) | 第4章 完全竞争市场 | `MR=MC`、短期五状态、**长期均衡零利润** | [练习](exercises/ch04-perfect-competition.md) |
| [ch05](chapters/ch05-imperfect-competition.md) | 第5章 不完全竞争市场 | **垄断、垄断竞争、寡头、博弈论、市场比较** | [练习](exercises/ch05-imperfect-competition.md) |
| [ch06](chapters/ch06-factor-markets.md) | 第6章 生产要素市场和收入分配 | `VMP=W`/`MRP=MFC`、后弯劳动供给、地租利息 | [练习](exercises/ch06-factor-markets.md) |
| [ch07](chapters/ch07-general-equilibrium-efficiency.md) | 第7章 一般均衡与效率 | 瓦尔拉斯均衡、帕累托最优三条件、福利定理 | [练习](exercises/ch07-general-equilibrium-efficiency.md) |
| [ch08](chapters/ch08-market-failure.md) | 第8章 市场失灵和微观经济政策 | 垄断、外部性、公共物品、信息不对称、不平等 | [练习](exercises/ch08-market-failure.md) |

**下册 — 宏观经济学**

| # | 标题 | 核心框架 | 练题 |
|---|------|----------|------|
| [ch09](chapters/ch09-macro-indicators.md) | 第9章 宏观经济的基本指标及其衡量 | GDP、CPI/平减指数、失业率与类型 | [练习](exercises/ch09-macro-indicators.md) |
| [ch10](chapters/ch10-income-expenditure-model.md) | 第10章 国民收入的决定：收入-支出模型 | 消费函数、两/三/四部门均衡、**乘数** | [练习](exercises/ch10-income-expenditure-model.md) |
| [ch11](chapters/ch11-is-lm-model.md) | 第11章 国民收入的决定：IS-LM 模型 | IS、LM、流动性陷阱、**挤出效应** | [练习](exercises/ch11-is-lm-model.md) |
| [ch12](chapters/ch12-ad-as-model.md) | 第12章 国民收入的决定：AD-AS 模型 | AD 与三效应、三种 AS、需求/供给冲击 | [练习](exercises/ch12-ad-as-model.md) |
| [ch13](chapters/ch13-unemployment-inflation-cycles.md) | 第13章 失业、通货膨胀和经济周期 | 四派失业理论、通胀三型、**菲利普斯曲线** | [练习](exercises/ch13-unemployment-inflation-cycles.md) |
| [ch14](chapters/ch14-open-economy.md) | 第14章 开放条件下的宏观经济 | 汇率与收支、**蒙代尔-弗莱明**、两制度政策效果 | [练习](exercises/ch14-open-economy.md) |
| [ch15](chapters/ch15-macro-policy.md) | 第15章 宏观经济政策 | 目标与冲突、**财政政策**、**货币政策**、协调 | [练习](exercises/ch15-macro-policy.md) |
| [ch16](chapters/ch16-economic-growth.md) | 第16章 经济增长 | 增长事实、**索洛模型**、内生增长、增长核算 | [练习](exercises/ch16-economic-growth.md) |

## Topic Index

- **AD-AS 模型 / AD-AS model** → ch12
- **BP 曲线 / BP curve** → ch14
- **IS-LM 模型 / IS-LM model** → ch11
- **索洛模型（新古典增长）/ Solow model** → ch16
- **乘数 / multiplier** → ch10
- **弹性 / elasticity** → ch01
- **道德风险 / moral hazard** → ch08
- **菲利普斯曲线 / Phillips curve** → ch13
- **公共物品 / public good** → ch08
- **古诺模型 / Cournot model** → ch05
- **规模报酬与规模经济 / returns to scale, economies of scale** → ch03
- **国际收支与汇率 / balance of payments, exchange rate** → ch14
- **后弯劳动供给 / backward-bending labor supply** → ch06
- **挤出效应 / crowding out** → ch11, ch15
- **价格歧视 / price discrimination** → ch05
- **逆向选择 / adverse selection** → ch08
- **帕累托最优 / Pareto optimality** → ch07
- **垄断 / monopoly** → ch05, ch08
- **垄断竞争 / monopolistic competition** → ch05
- **蒙代尔-弗莱明模型 / Mundell-Fleming** → ch14
- **纳什均衡 / Nash equilibrium** → ch05
- **囚徒困境 / prisoner's dilemma** → ch05
- **外部性 / externality** → ch08
- **无差异曲线 / indifference curve** → ch02
- **无谓损失 / deadweight loss** → ch05, ch08
- **瓦尔拉斯定律 / Walras's law** → ch07
- **完全竞争 / perfect competition** → ch04
- **GDP / GNP / 名义与实际 GDP** → ch09
- **基尼系数与洛伦兹曲线 / Gini, Lorenz** → ch08
- **吉芬商品 / Giffen good** → ch02
- **流动性陷阱 / liquidity trap** → ch11
- **稀缺性 / scarcity** → ch00, ch01
- **消费者均衡 / consumer equilibrium** → ch02
- **消费者剩余与生产者剩余 / surpluses** → ch04, ch08
- **要素使用原则 / factor employment rule** → ch06
- **生产函数 / production function** → ch03
- **市场失灵 / market failure** → ch08
- **失业与失业率 / unemployment** → ch09, ch13
- **通货膨胀 / inflation** → ch13
- **税收归宿 / tax incidence** → ch01
- **斯威齐模型 / Sweezy model** → ch05
- **替代效应与收入效应 / substitution & income effects** → ch02
- **投资乘数与财政乘数 / investment & fiscal multipliers** → ch10
- **外部性与庇古税 / externality, Pigouvian tax** → ch08
- **外部性矫正：科斯定理 / Coase theorem** → ch08
- **希克斯分解 / Hicks decomposition** → ch02
- **新古典增长模型 / neoclassical growth** → ch16
- **内生增长理论 / endogenous growth** → ch16
- **一般均衡 / general equilibrium** → ch07
- **自动稳定器 / automatic stabilizer** → ch15
- **货币政策三大工具 / monetary policy tools** → ch15
- **财政政策与货币政策协调 / policy mix** → ch15
- **经济周期 / business cycle** → ch13
- **自然失业率 / natural rate** → ch09, ch13
- **奥肯定律 / Okun's law** → ch09, ch13
- **增长核算与 TFP / growth accounting** → ch16
- **资本与利息 / capital and interest** → ch06
- **地租 / land rent** → ch06
- **J 曲线效应 / J-curve** → ch14
- **均衡价格与供求定理 / equilibrium & law of supply and demand** → ch01
- **成本函数 / cost functions** → ch03
- **契约曲线与埃奇沃思盒 / contract curve, Edgeworth box** → ch07
- **通货膨胀的再分配效应 / redistribution effects** → ch13
- **增长政策 / growth policy** → ch16
- **实证分析与规范分析 / positive & normative analysis** → ch00
- **经济人与方法论个人主义 / economic man, methodological individualism** → ch00
- **静态·比较静态·动态分析 / static, comparative statics, dynamics** → ch00, ch01
- **生产可能性边界 / production possibility frontier** → ch00, ch07
- **边际效用与递减规律 / marginal utility** → ch02
- **蛛网模型 / cobweb model** → ch01
- **准租金 / quasi-rent** → ch06
- **斯塔克尔伯格模型 / Stackelberg model** → ch05
- **信号传递与甄别 / signaling, screening** → ch08
- **萨伊定律 / Say's law** → ch12
- **实际余额效应（庇古效应）/ real balance effect** → ch12
- **菜单成本与工资刚性 / menu costs, wage rigidity** → ch12, ch13
- **适应性预期与理性预期 / adaptive & rational expectations** → ch13
- **卢卡斯批判 / Lucas critique** → ch13
- **通货膨胀税与铸币税 / inflation tax, seigniorage** → ch13
- **基础货币与货币乘数 / high-powered money, money multiplier** → ch15
- **公开市场操作与再贴现 / open market operations** → ch15
- **泰勒规则 / Taylor rule** → ch15
- **托宾 q 比率 / Tobin's q** → ch15

## Supporting Files

- [exams.md](exams.md) — **真题与考法总览**：各章真题热度表、必背名词解释 Top 40、论述题母题 15 条、计算题类型速查、三种用法（考前突击／平时作业／名解）
- [cheatsheet.md](cheatsheet.md) — 决策速查：**75 个考点的 ★ 星级表**、**217 条真题热度表**、练题路线（3 天／7 天）、题型→方法索引、符号约定、跨章铁律、Tells & smells
- [patterns.md](patterns.md) — 20 个计算与推导套路 + **"类型 → 例题"索引**（每个套路指向具体练习文件）
- [glossary.md](glossary.md) — 191 条术语，中英对照 + 章节引用（含考频标记）
- [chapters/](chapters/) — 17 份理论文件（ch00–ch16）
- [exercises/](exercises/) — 17 份练习文件（课后习题全解 + 真题 + 自测 + 计算题）

---

## Scope & Limits

马工程《西方经济学》第二版**导论 + 上下册**的完整内容（导论 + 微观 8 章 + 宏观 8 章）。超过这个范围——中级微观/宏观（范里安、曼昆）、计量经济学、金融学——需要别的资料。

**⚠️ 图表是这个技能最大的局限。** 教材上下册合计约 **1,000 张图**（供需曲线、无差异曲线、等产量线、IS-LM、AD-AS、菲利普斯曲线、索洛稳态…），**OCR 完全无法捕捉图形**。处理方式是：
- **不引用图号**（不写"如图 3-2 所示"——读者没有图）；练习文件里的"如图"也已全部改写为文字；
- 用**文字描述**图的坐标轴、曲线走向、交点含义；**绝不臆造图形形状**。

所以读这个技能时：**公式与结论可靠，图形只能靠文字重建**——做图解题请对照纸书。

**源材料质量与处理口径。**
- **笔记详解 + 配套题库（共 759 页）是原生文本**，质量高；所有数值、公式、真题出处优先以它们为准。本轮的练习层（17 份 exercises 文件、约 500 道题）全部来自这两套书。
- **两本教材与《习题与解答》（共 998 页）是纯图像扫描件**，没有文本层。本轮**未重新 OCR**：公式在 OCR 后会被压平（下标丢失、分式变两行、负号可能丢），且识别速度不足以覆盖近千页。它们的题目内容已被《笔记详解》的"课后习题详解"覆盖，故练习层不缺；但**教材原文页码、本章小结、复习题编号仍不可用**。
- **真题统计口径**：217 条指"带〔院校年份研〕标记的题目条数"，同题多校计 1 条；各章热度见 [cheatsheet.md](cheatsheet.md) 与 [exams.md](exams.md)。
- **已修正的源文错误（20 余处）**：练习文件在写作中逐题核对，凡源文数字/符号/标签不自洽处，一律**按可推导的一侧重算**并在题内注明。典型例子：ch01 题库把蛛网收敛判据写反；ch02 题库效用函数上标被吞（x^14 → 需读作 1/4、3/4 才自洽）；ch03 固定比例技术最小成本 320 应为 180；ch04 笔记课后第 10 题 AC>P 却判"盈利"（实为亏损 20）；ch05 合谋题合并成本与题设不自洽；ch06 最低工资题漏了供给约束的角点解；ch07 生产契约线表达式截断；ch08 把"城市蚊虫控制"误归公共资源；ch09 CPI 表达式丢失；ch11 把 C 与 I 的标签互换、题库称"货币交易需求增加使 LM 右移"（应为左移）；ch12 把 1970 年代滞胀误归因需求不足（应为负向供给冲击）；ch00 人名"罗宾逊·琼"应为"琼·罗宾逊"。**遇到与源文不符处，以可验证的推导为准。**

**版权。** 来源均为第三方出版物（高等教育出版社／人民出版社；以及考研辅导书系）。此处内容是**综合整理的学习材料**，不是原书文字，仅供**个人学习**——请勿转发或公开。
