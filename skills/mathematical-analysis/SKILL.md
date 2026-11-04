---
name: mathematical-analysis
description: "Two-volume mathematical analysis knowledge base from 《数学分析》第六版 (华东师范大学数学科学学院 编), covering the full sequence from real numbers and limits through derivatives, integrals, series, and multivariable calculus. Use when solving or reasoning about limits (ε-N, ε-δ), continuity and uniform continuity, differentiation and mean value theorems, Taylor expansion, integration techniques, improper integrals, series convergence tests, uniform convergence, power series and Fourier series, multivariable limits and differentiability, implicit function theorems, line/surface/multiple integrals, Green's, Gauss's and Stokes's theorems, or when studying for an exam or applying its theorems and decision rules. Also carries the course's 69-problem homework bank for 上册 §1.1–§8.3 (from 《数学分析上作业集》), each problem with 考点, exam-style solution, answer and common pitfalls: use when working or checking homework problems, looking up a specific exercise number (作业第 N 题 / 6-3 作业), or revising for quizzes."
---

<!-- argument-hint: [topic, theorem name, chapter ch01-ch23, homework problem number, or §N.k] -->

# 数学分析 — Mathematical Analysis

**《数学分析》第六版** — 华东师范大学数学科学学院 编（高等教育出版社，2025）

| | 卷 | 章节 | 页数 |
|---|---|---|---|
| **上** | 第六版 上册 | ch01–ch11 | 329 |
| **下** | 第六版 下册 | ch12–ch23 | 358 |
| **作业** | 数学分析上作业集 | 上册 ch01–ch08 · 69 题 / 26 次作业 | 30 |

**Generated**: 2026-10-09 ｜ **作业题库并入**：2026-11-04 ｜ **检索协议加固**：2026-11-04

## 检索协议（强制 · 回答前先读完）

**本文件只是目录 + 框架摘要，不是章节正文。** 23 章的实际内容在 `chapters/` 下各自独立的文件里，每章 **3.2k–9.6k tokens**。下面 Chapter Index 表格里那一行字（例如 ch04 的「间断点四分类、最值/介值/一致连续三定理」）**是标签，不是讲解**——它只有十几个字，而那一章正文有 135 行、定义1–3 与定理4.1–4.13 的完整陈述。

**任何知识性问题**（「讲讲 X」「X 是什么」「X 的定理怎么证」「X 和 Y 什么关系」「这一章讲了什么」）按阶梯走，走到能回答为止：

1. 在下面 **Topic Index** 查术语 → 得到章号（例：`连续性 → ch04`）。
2. **打开 `chapters/ch04-continuity.md` 通读，再回答。** 这是默认动作，不是可选项。
3. 只问某一节 → 先用 [sections.md](sections.md) 定位节号，再打开对应章节文件读那一节。
4. 只问一道作业题 → 打开 `problems/pNN-*.md` 取「题目 / 考点 / 解 / 答案 / 易错」。
5. 上面这些文件**都真的打开过**、确认内容确实不在里面，才可以回答「本技能没有收录」，并且必须列出你查过哪些文件路径。

**绝对禁止**

- ❌ 拿 Chapter Index 的一行字、或 Core Frameworks 的两句摘要，当作整章讲解交付。
- ❌ 没打开过 `chapters/` 里的文件就说「技能包中没有检索到该知识点的直接讲解」——这是本技能被投诉过的那次故障。
- ❌ 用相邻概念的索引拼凑答案（拿多元连续性的索引去讲一元连续性）。要么打开文件，要么说明查过什么、确实没有。
- ❌ 只说「技能里有 ch04」却不给定义、定理陈述与证明思路——那不是讲解。

**回答后自检**：末尾写一行 `依据：chapters/ch04-continuity.md（§4.1 定义1、定理4.1；§4.2 定理4.6/4.7/4.9）`。**写不出这一行，就说明你没读文件，答案不合格。**

**输出格式**：给学生讲的正文里，数学用 **Unicode 记号**（ε δ ∞ ℝ ℕ ∂ ∫ Σ √ ≤ ≥ ≠ ⇒ ∎、上标 ⁿ ² ⁻¹、下标 ₙ ₁），
**不要把章节文件里的 `$...$` LaTeX 源码原样倒出来**——ch04–ch23 的章节文件是 LaTeX 写的，回答前自己转成 Unicode。

**如果你的运行环境无法读取文件**：直接说明「需要读取 `chapters/ch04-continuity.md`（约 5.4k tokens）」并把路径给出，**不要**用索引行凑答案。

## How to Use This Skill

- **无参数** — 加载下面的核心框架（仍只是摘要；要讲清楚某章请指名）
- **给主题** — 问 `一致收敛`、`格林公式`、`洛必达法则`；我**必读**对应章节文件再答（见上面的检索协议）
- **给章节** — `ch09`（定积分）、`ch21`（重积分）；我直接加载该文件
- **给题目** — 解一道具体的题（求极限、证明、计算、判敛散…）；按下面的「错题本工作流」输出
- **给作业题** — 说「作业第 34 题」「6-3 作业」「§5.4 那几题」；我从 [problems/](problems/) 取原题 + 考场解答
- **给教材节** — 问「§6.3 讲了什么、这次作业是哪几题」；查 [sections.md](sections.md)（节 → 章节文件 → 作业题）
- **跨卷关联** — 一元与多元的平行结论（如闭区间连续函数的性质 ↔ 有界闭域上连续函数的性质）分列上下册，对照读收获最大

**两卷的分工**：上册建立**一元微积分**的完整逻辑链（实数完备性 → 极限 → 连续 → 导数 → 积分 → 级数雏形）；下册把它**平行推广到多元**（多元极限与连续、多元微分学、隐函数定理、重积分与三大公式），并补上**函数项级数**（一致收敛、幂级数、傅里叶级数）。

## 错题本工作流（强制 · 每次答疑都执行）

**触发**：用户给出任何具体题目——求极限、证明题、计算题、判断敛散性，课本或作业题的文字/截图。

**输出必须包含五块，顺序固定，缺一不可**：

1. **考试标准解答过程** —— 按考场答卷的标准写：只保留必要步骤与结论，定理/定义编号写清（`ε-N` 定义、`罗尔定理（定理6.1）`、`单调有界定理（定理2.9）`…），不等式链完整、逻辑闭环。**不写思路旁白，不写「为什么想到这一步」**，要能直接抄到答题纸上。
2. **详细解析** —— 紧接在考试标准解答**之后**：关键一步的动机（辅助函数怎么猜到的、为什么选这条定理、放缩凭什么这么放）、每步依据、容易卡住的地方、有无别的解法。这一块给自己看，允许口语化。
3. **同类型解答模板** —— 「以后遇到这类题的通用打法」：识别特征 → 标准步骤 → 关键定理 → 易错点；落到模板库编号 `T-xx`，只有新题型才新建编号。
4. **错题本条目** —— 追加到工作目录的 `错题本.md`：编号 `M-xxx` 递增、**日期时间** `YYYY-MM-DD HH:MM (UTC+8)`（取当前系统时间，不许编造）、**知识要点**（`ch01`–`ch23` 编号 + 知识点名）、题目、**考试标准解答过程**、**详细解析**、易错点、复习记录。
5. **知识要点标注** —— 明确说这题考的是哪一章、哪条定理，并指出它在全书逻辑链里的位置（例：拉格朗日中值定理由罗尔定理推广而来，又是泰勒公式的来源）。

**顺序不能颠倒**：先给「能抄进答卷的」，再给「讲道理的」。若考试标准解答里冒出「注意到」「联想到」「这一步的想法是」这类引导语，说明详细解析混进去了，要挪到第二块。

**文件约定**

| 文件 | 位置 | 作用 |
|---|---|---|
| `错题本.md` | 用户当前工作目录 | 主册：总索引 + 逐条条目 |
| `解题模板库.md` | 用户当前工作目录 | 模板正文：`T-01`…`T-19` 及后续 |

已存在则**只追加不覆盖**；不存在就按上述字段新建（索引表 + 单条条目模板 + 每个 `T-xx` 一节模板）。

**编号体系（保持稳定，不要重排）**：`T-01` ε-N ｜ `T-02` ε-δ ｜ `T-03` 极限不存在 ｜ `T-04` 递推数列 ｜ `T-05` 求极限选路 ｜ `T-06` 一致连续 ｜ `T-07` 中值定理辅助函数 ｜ `T-08` 泰勒 ｜ `T-09` 可积性 ｜ `T-10` 定积分计算 ｜ `T-11` 反常积分 ｜ `T-12` 级数判敛 ｜ `T-13` 多元极限与可微性 ｜ `T-14` 求导选路（幂指/参数/隐函数） ｜ `T-15` 高阶导数 n 阶 ｜ `T-16` 有理函数与三角有理式积分 ｜ `T-17` 函数作图与渐近线 ｜ `T-18` 用导数证不等式 ｜ `T-19` 分段函数的连续·可导·原函数。新题型顺延 `T-20`。

---

## 作业题库（《数学分析上作业集》· 上册 ch01–ch08）

**是什么**：30 页扫描件，**69 道题 / 26 次作业**，覆盖 §1.1–§8.3。它是**教材每节「习题」的选编**——把书里的习题挑出来重新连续编号成 1–69，所以每道题在教材里都有对应的 `习题X.Y 第M题`；`problems/` 里能对上的题都标了这一行，可以拿教材书末「部分习题答案与提示」（上册书页 289–310）查官方答案。

**怎么用**
- 用户报题号 → 打开 `problems/pNN-*.md` 定位；报「X-Y 作业」→ 用 [sections.md](sections.md) 底部的「作业编号 ↔ 教材节次」表换算成题号。
- 每题五段：**题目 / 考点 / 解（考场写法）/ 答案 / 易错**；小题极多的计算题（题 66 有 36 个小题）用「逐题表 + 代表题详解」。
- **先遮住答案让他自己做**：用户是学生，整段倒解答等于替他做题。默认只给「考点 + 第一步提示」，他要完整解答或明说「给答案」时再展开。

| 文件 | 章 | 题号 | 作业编号 |
|---|---|---|---|
| [p01-ch01.md](problems/p01-ch01.md) | 1 实数集与函数 | 1–8 | 1-1,1-2,1-3,1-4 |
| [p02-ch02.md](problems/p02-ch02.md) | 2 数列极限 | 9–16 | 2-1,2-2,2-3 |
| [p03-ch03.md](problems/p03-ch03.md) | 3 函数极限 | 17–25 | 3-1,3-2,3-3,3-5 |
| [p04-ch04.md](problems/p04-ch04.md) | 4 函数的连续性 | 26–31 | 4-1,4-2,4-3 |
| [p05-ch05.md](problems/p05-ch05.md) | 5 导数和微分 | 32–46 | 5-1–5-4 |
| [p06-ch06.md](problems/p06-ch06.md) | 6 微分中值定理及其应用 | 47–62 | 6-1–6-5 |
| [p07-integration-basics.md](problems/p07-integration-basics.md) | 8 不定积分（§8.1–8.2 换元） | 63–66 | 8-1, 8-2 |
| [p08-integration-parts-rational.md](problems/p08-integration-parts-rational.md) | 8 不定积分（分部、有理函数） | 67–69 | 8-2, 8-3 |

**覆盖空洞**：作业集里**没有**第 7 章（实数完备性）和 9–11 章（定积分、定积分应用、反常积分）的题——这几章的练习只能回教材习题。

---

## Core Frameworks — 上册（一元微积分）

**实数完备性是全书的地基。** 六条基本定理——**确界原理（定理1.1）、单调有界定理（定理2.9）、区间套定理（定理7.1）、聚点定理（定理7.2）、有限覆盖定理（定理7.3）、柯西收敛准则（定理2.11）——互相等价**。证明任何一条都要用另一条。选哪条取决于问题：构造性证明用确界原理，递推数列用单调有界，存在唯一性用区间套，抽子列用聚点，局部性质推整体性质用有限覆盖，不知道极限值时用柯西准则。

**极限的两个定义是整个上册的语法。** `lim aₙ = a` 用 **ε-N**；`lim_{x→x₀} f(x) = A` 用 **ε-δ**。所有证明都是「从 `|·| < ε` 反解，必要时适当放大」。`δ` 依赖 `ε` 但**不许依赖 `x`**——这条界线正是逐点极限与一致连续的分野。

**函数极限靠归结原则（定理3.9）联结数列极限**：`lim_{x→x₀} f = A` ⟺ 任何趋于 `x₀` 的数列的函数值都趋于 `A`。**这是证明极限不存在的标准武器**——找两个子列极限不同即可。

**连续性 + 闭区间 = 三个整体性质。** **最大最小值定理（定理4.6）、介值性定理（定理4.7）、一致连续性定理（定理4.9）**——三个都必须**闭区间**（有界闭域），开区间上全部失效。

**微分学的枢纽是拉格朗日中值定理。** 链条是：**费马定理（定理5.3）→ 罗尔定理（定理6.1）→ 拉格朗日中值定理（定理6.2）→ 柯西中值定理（定理6.6）→ 泰勒公式（定理6.10）**。每个都是前一个的推广；洛必达法则（定理6.7/6.8）是柯西中值定理的推论。泰勒公式的**佩亚诺型余项**用于求极限，**拉格朗日型余项**用于估计误差——两个余项不是装饰，用途不同。

**积分有两条独立的路。** 一条是**原函数**（不定积分，定理8.1）：换元（定理8.4/8.5）与分部（定理8.6）。另一条是**可积性**（定积分，定理9.3 可积准则）：达布和、振幅和、三个充要条件（定理9.14/9.15/9.16）。**两条路的汇合点是微积分学基本定理（定理9.9/9.10）——它把定积分的计算归结为求原函数**，从而给出牛顿-莱布尼茨公式（定理9.1）。

**反常积分按「无穷」与「无界」分两类**（Ch 11）。判敛靠比较原则（定理11.2/11.6）与狄利克雷/阿贝尔判别法（定理11.3/11.4/11.7/11.8）。**`∫₁^∞dx/xᵖ` 在 `p>1` 收敛，而 `∫₀¹dx/xᵖ` 在 `p<1` 收敛——条件相反，最易记混。**

---

## Core Frameworks — 下册（多元与级数）

**级数判敛法是工具库，选择顺序比技巧重要。** 正项级数：比较原则（定理12.6）→ 比值法（定理12.7）→ 根式法（定理12.8）→ 积分判别法（定理12.9）→ 拉贝判别法（定理12.10）。**比值法与根式法在 `ρ = 1` 时完全失效**。一般项级数：先查绝对收敛（定理12.12：绝对收敛必收敛，反之不然），否则用莱布尼茨（定理12.11）、阿贝尔（定理12.15）或狄利克雷（定理12.16）。

**一致收敛是「极限与运算能否交换」的许可证。** 点态收敛不够——**和函数连续（定理13.12）、逐项求积（定理13.13）要求级数一致收敛，而逐项求导（定理13.14）要求更强的条件：求导后的级数也一致收敛**。判别顺序：`sup|fₙ−f| → 0` → 魏尔斯特拉斯 M 判别法（定理13.5）→ 阿贝尔/狄利克雷。

**幂级数的核心是收敛半径**（阿贝尔定理14.1、柯西-阿达马定理14.3）。**端点必须单独判别**；比值公式在缺项级数上失效。幂级数在收敛区间内可逐项积分与求导，这使「求幂级数的和函数」成为解微分方程的工具。

**傅里叶级数把周期函数展开为正弦余弦**（Ch 15）。收敛定理（定理15.3）给出狄利克雷条件；偶函数只出余弦项、奇函数只出正弦项。

**多元微分的核心是三者关系的区分**：**偏导存在 ⇏ 可微 ⇏ 偏导连续**。正确方向是：**偏导连续 ⟹ 可微 ⟹ 偏导存在 ⟹ 连续**（定理17.1 必要条件、定理17.2 充分条件）。**多元没有「可导即连续」这种一元福利**。

**隐函数定理是多元微分学的顶峰**（定理18.1 存在唯一性、18.2 可微性、18.4 隐函数组、18.5 反函数组）。条件 `F_y ≠ 0`（高维是雅可比行列式 `≠ 0`）不可省。几何应用（切线、法平面、切平面）与**条件极值的拉格朗日乘数法**都由它导出。

**重积分的计算是「化累次 + 换变量」**（Ch 21）。换变量时必须乘**雅可比行列式**——极坐标 `J = r`，球坐标 `J = r²sin φ`。

**三大积分公式是同一个定理的不同维数**：**格林公式（定理21.11，平面）→ 高斯公式（定理22.5，三维闭曲面）→ 斯托克斯公式（定理22.6，空间曲面）**。格林公式还给出**曲线积分与路线无关的充要条件**：单连通区域上 `∂P/∂y = ∂Q/∂x`（定理21.12）。**方向约定必须一致——取反则整体变号。**

---

## Chapter Index

有作业题的第 1–6、8 章，章节文件开头有一行「📝 **本章作业**」指向 `problems/`；每个节对应的题号见 [sections.md](sections.md)。

**上册 — 第六版 上册**

| # | 标题 | 核心框架（**只是标签**） | 正文体量（打开才看得到） |
|---|------|----------|------|
| [ch01](chapters/ch01-real-numbers-functions.md) | 第一章 实数集与函数 | 绝对值不等式、确界原理、函数与初等函数 | 3.2k tok · §1.1–§1.4 · 3 定理 |
| [ch02](chapters/ch02-sequence-limits.md) | 第二章 数列极限 | ε-N 定义、收敛六性质、单调有界定理、柯西准则 | 4.0k tok · §2.1–§2.3 · 27 定理 |
| [ch03](chapters/ch03-function-limits.md) | 第三章 函数极限 | ε-δ/ε-M 定义、归结原则、两个重要极限、无穷小量阶 | 5.1k tok · §3.1–§3.5 · 16 定理 |
| [ch04](chapters/ch04-continuity.md) | 第四章 函数的连续性 | 间断点四分类、最值/介值/一致连续三定理 | **5.4k tok · §4.1–§4.3 · 定义1–3、定理4.1–4.13** |
| [ch05](chapters/ch05-derivatives-differentials.md) | 第五章 导数和微分 | 导数定义、求导法则、高阶导数、微分形式不变性 | 5.9k tok · §5.1–§5.5 · 18 定理 |
| [ch06](chapters/ch06-mean-value-theorems.md) | 第六章 微分中值定理及其应用 | 罗尔→拉格朗日→柯西→泰勒、洛必达、极值与凸性 | 9.6k tok · §6.1–§6.7 · 45 定理 |
| [ch07](chapters/ch07-completeness-of-reals.md) | 第七章 实数的完备性 | 六大基本定理及其等价性、上下极限 | 4.5k tok · §7.1–§7.2 · 28 定理 |
| [ch08](chapters/ch08-indefinite-integrals.md) | 第八章 不定积分 | 基本积分表、换元与分部、有理函数部分分式 | 5.2k tok · §8.1–§8.3 · 16 定理 |
| [ch09](chapters/ch09-definite-integrals.md) | 第九章 定积分 | 黎曼和与达布和、可积三充要条件、牛顿-莱布尼茨 | 6.1k tok · §9.1–§9.6 · 33 定理 |
| [ch10](chapters/ch10-applications-of-integrals.md) | 第十章 定积分的应用 | 微元法、面积体积弧长曲率、近似计算 | 5.6k tok · §10.1–§10.6 · 公式为主 |
| [ch11](chapters/ch11-improper-integrals.md) | 第十一章 反常积分 | 无穷积分与瑕积分、比较原则、狄利克雷/阿贝尔 | 5.8k tok · §11.1–§11.3 · 15 定理 |

**下册 — 第六版 下册**

| # | 标题 | 核心框架（**只是标签**） | 正文体量（打开才看得到） |
|---|------|----------|------|
| [ch12](chapters/ch12-series-of-numbers.md) | 第十二章 数项级数 | 柯西准则、正项级数五判别法、绝对收敛 | 6.0k tok · §12.1–§12.3 · 34 定理 |
| [ch13](chapters/ch13-function-sequences-series.md) | 第十三章 函数列与函数项级数 | 一致收敛、M 判别法、连续性/可积性/可微性 | 6.4k tok · §13.1–§13.2 · 47 定理 |
| [ch14](chapters/ch14-power-series.md) | 第十四章 幂级数 | 收敛半径、柯西-阿达马、泰勒级数、欧拉公式 | 5.9k tok · §14.1–§14.3 · 33 定理 |
| [ch15](chapters/ch15-fourier-series.md) | 第十五章 傅里叶级数 | 正交函数系、傅里叶系数、收敛定理 | 6.0k tok · §15.1–§15.3 · 19 定理 |
| [ch16](chapters/ch16-multivariable-limits-continuity.md) | 第十六章 多元函数的极限与连续 | R² 完备性、重极限与累次极限、有界闭域性质 | 6.8k tok · §16.1–§16.3 · 42 定理 |
| [ch17](chapters/ch17-multivariable-differentiation.md) | 第十七章 多元函数微分学 | 可微性、偏导数、方向导数与梯度、极值 | 7.7k tok · §17.1–§17.4 · 44 定理 |
| [ch18](chapters/ch18-implicit-function-theorems.md) | 第十八章 隐函数定理及其应用 | 隐函数定理、雅可比、几何应用、条件极值 | 8.0k tok · §18.1–§18.4 · 14 定理 |
| [ch19](chapters/ch19-integrals-with-parameters.md) | 第十九章 含参量积分 | 积分号下求导、一致收敛、Γ 与 B 函数 | 8.2k tok · §19.1–§19.3 · 39 定理 |
| [ch20](chapters/ch20-line-integrals.md) | 第二十章 曲线积分 | 第一型与第二型曲线积分 | 7.3k tok · §20.1–§20.2 · 公式为主 |
| [ch21](chapters/ch21-multiple-integrals.md) | 第二十一章 重积分 | 累次积分、变量变换、格林公式、三重积分 | 7.1k tok · §21.1–§21.9 · 24 定理 |
| [ch22](chapters/ch22-surface-integrals.md) | 第二十二章 曲面积分 | 第一型与第二型曲面积分、高斯与斯托克斯公式 | 6.8k tok · §22.1–§22.4 · 18 定理 |
| [ch23](chapters/ch23-vector-function-calculus.md) | 第二十三章 向量函数微分学 | n 维欧氏空间、反函数定理、隐函数定理 | 7.6k tok · §23.1–§23.3 · 46 定理 |

## Topic Index

章节引用：ch01–ch11 = 上册，ch12–ch23 = 下册。**`→ chNN` 的意思是「打开 `chapters/` 下那一章的 .md 文件」**，不是「答案就在这行」。

- **绝对收敛 / absolute convergence** → ch11, ch12
- **阿贝尔判别法 / Abel test** → ch11, ch12, ch13
- **阿贝尔定理 / Abel theorem** → ch14
- **弧长与曲率 / arc length & curvature** → ch10
- **渐近线 / asymptote** → ch03
- **伯努利不等式 / Bernoulli inequality** → ch02
- **B 函数 / beta function** → ch19
- **有界集与确界 / bounded sets, sup & inf** → ch01
- **康托尔一致连续性定理 / Cantor theorem** → ch04
- **柯西收敛准则 / Cauchy criterion** → ch02, ch03, ch07, ch12, ch13, ch16
- **柯西-阿达马定理 / Cauchy–Hadamard** → ch14
- **柯西积分判别法 / Cauchy integral test** → ch12
- **柯西中值定理 / Cauchy mean value** → ch06
- **链式法则 / chain rule** → ch05, ch17
- **比较原则 / comparison principle** → ch11, ch12
- **实数完备性 / completeness of ℝ** → ch07
- **条件收敛 / conditional convergence** → ch11, ch12
- **连续性 / continuity** → ch04, ch16（**ch04 有定义1–3、定理4.1–4.13 的完整陈述**）
- **凸性与拐点 / convexity** → ch06
- **坐标变换与雅可比 / coordinate change, Jacobian** → ch18, ch21
- **达布和与可积准则 / Darboux sums** → ch09
- **达朗贝尔判别法 / d'Alembert ratio test** → ch12
- **定积分 / definite integral** → ch09
- **导数 / derivative** → ch05
- **可微性 / differentiability** → ch05, ch17, ch23
- **微分 / differential** → ch05, ch17
- **狄利克雷判别法 / Dirichlet test** → ch11, ch12, ch13
- **方向导数与梯度 / directional derivative & gradient** → ch17
- **间断点 / discontinuity** → ch04（第一类可去/跳跃、第二类无穷/振荡，含判定表与 7 个反例）
- **二重积分 / double integral** → ch21
- **ε-N 与 ε-δ 定义 / ε-N and ε-δ** → ch02, ch03
- **欧拉积分 / Euler integrals** → ch19
- **费马定理 / Fermat theorem** → ch05
- **有限覆盖定理 / Heine–Borel** → ch07, ch16
- **傅里叶级数 / Fourier series** → ch15
- **Γ 函数 / gamma function** → ch19
- **高斯公式 / Gauss formula** → ch22
- **梯度 / gradient** → ch17
- **格林公式 / Green formula** → ch21
- **归结原则（海涅定理）/ Heine theorem** → ch03, ch16
- **海赛矩阵 / Hessian** → ch17
- **隐函数定理 / implicit function theorem** → ch18, ch23
- **反常积分 / improper integral** → ch11
- **不定积分 / indefinite integral** → ch08
- **含参量积分 / integrals with parameters** → ch19
- **介值定理 / intermediate value theorem** → ch04, ch16
- **区间套定理 / nested interval theorem** → ch07, ch16
- **拉格朗日中值定理 / Lagrange mean value** → ch06
- **拉格朗日乘数法 / Lagrange multipliers** → ch18
- **拉贝判别法 / Raabe test** → ch12
- **莱布尼茨判别法 / Leibniz test** → ch12
- **洛必达法则 / L'Hospital rule** → ch06
- **数列极限 / limit of a sequence** → ch02
- **函数极限 / limit of a function** → ch03
- **曲线积分 / line integral** → ch20
- **利普希茨条件 / Lipschitz condition** → ch04, ch23
- **最大最小值定理 / extreme value theorem** → ch04, ch16
- **零点存在定理（根的存在性定理）/ Bolzano** → ch04
- **反函数连续性 / continuity of inverse** → ch04
- **初等函数的连续性 / continuity of elementary functions** → ch04
- **黎曼函数与狄利克雷函数 / Riemann & Dirichlet functions** → ch04
- **左右连续 / one-sided continuity** → ch04
- **中值定理 / mean value theorem** → ch06, ch09
- **单调有界定理 / monotone bounded theorem** → ch02, ch07
- **牛顿-莱布尼茨公式 / Newton–Leibniz** → ch09
- **牛顿切线法 / Newton's method** → ch06
- **偏导数与全微分 / partial derivative & total differential** → ch17
- **佩亚诺与拉格朗日余项 / Peano & Lagrange remainders** → ch06
- **幂级数 / power series** → ch14
- **聚点定理 / accumulation point theorem** → ch07, ch16
- **收敛半径 / radius of convergence** → ch14
- **黎曼和 / Riemann sum** → ch09, ch21
- **罗尔定理 / Rolle theorem** → ch06
- **级数 / series** → ch12
- **单连通与路线无关 / simply connected, path independence** → ch21
- **斯托克斯公式 / Stokes formula** → ch22
- **上下极限 / limit superior & inferior** → ch07
- **曲面积分 / surface integral** → ch22
- **泰勒公式与泰勒级数 / Taylor formula & series** → ch06, ch14, ch17
- **三大积分公式 / the three integral theorems** → ch21, ch22
- **三角级数 / trigonometric series** → ch15
- **三重积分 / triple integral** → ch21
- **一致连续性 / uniform continuity** → ch04, ch16
- **一致收敛 / uniform convergence** → ch13, ch19
- **向量函数微分 / vector function calculus** → ch23
- **魏尔斯特拉斯判别法 / Weierstrass M-test** → ch13, ch19
- **微元法 / element method** → ch10
- **无穷小量的阶 / order of infinitesimals** → ch03

## Supporting Files

**技能目录清单（共 37 个文件；正文在文件里，本文件只是目录）**

| 文件 / 目录 | 内容 | 体量 |
|---|---|---|
| [chapters/](chapters/) | **23 个章节正文**，每章含 Core Idea、定义与定理的完整陈述 + 证明思路、核心概念、思维模型、常见错误、速查表、工作示例、关键结论、章节联系 | 3.2k–9.6k tok/章，合计约 145k |
| [sections.md](sections.md) | **节次总表**：上下册每个 § 的标题、书页、对应章节文件、对应作业题；末尾有「作业编号 ↔ 教材节次」换算 | 2.7k tok |
| [problems/](problems/) | **作业题库**：上册 ch01–ch08 的 69 道作业题（题目 / 考点 / 考场解 / 答案 / 易错 / 教材对应） | 8 个文件，约 25k tok |
| [glossary.md](glossary.md) | 术语表，中英对照 + 章节引用 | 5.6k tok |
| [patterns.md](patterns.md) | 方法库：ε-N/ε-δ 证明、判敛流程、积分策略、三大公式用法、求导与作图套路 | 4.7k tok |
| [cheatsheet.md](cheatsheet.md) | 决策速查：方法选择树、对照表、常见错误、Tells & smells | 3.1k tok |

**再强调一次**：上面 37 个文件加起来约 19 万 tokens，全部按需加载。回答一个知识性问题，至少要打开 `chapters/` 里对应的那一个（3k–10k tokens）——**只读本文件就作答，一定会答成「只有提纲」的空话**。

---

## Scope & Limits

一元与多元数学分析（华东师大体系的标准内容）。超过这个范围——实变函数、泛函分析、复变函数、微分几何、数值分析——需要别的资料。

**源材料质量。** 两个 PDF 都是**纯图像扫描件**（687 页合计，零文字层，`/Creator: FreePic2Pdf`），先用 RapidOCR（中英文，3 倍渲染）识别后再转换。需要注意：

- 中文正文、`定义`/`定理`/`推论`/`例` 的**标签与编号识别良好**（全书提取出 736 处标记）；
- **公式被压平**：分式变成上下两行，矩阵与方程组变成零散符号行，积分号 `∫` 常被认成 `f`，`ε`/`δ`/`∞`/`∂` 等符号有误认；
- 章节文件里的公式是**按标准数学记法重建**的，不是照搬 OCR 碎片；
- 重建过程做了大量交叉核验（如曲率公式对圆得 `1/R`、对直线得 0；格林公式的符号与偏导对应关系；泰勒两种余项的系指数），但**用于作业或考试前请对照纸书核对关键公式**。

**体量说明。** 章节文件约 3,200–9,600 tokens（ch06 因覆盖 7 节、17 条定理而为最大）；作业题库每个文件 1,700–4,000 tokens；sections.md 约 2,700。全部按需加载，不读的不消耗预算。

**作业题库的可信度。** `problems/` 里的题面是从作业集扫描件的文字层还原的（原文有清晰文字层，但分式、根式、指数被压平），每道歧义题都对照了 170 dpi 页面图像判读；计算题（导数、积分、极限、泰勒展开、极值拐点）逐题用 sympy 复核；结果再与教材书末「部分习题答案与提示」（上册书页 289–310）逐条比对过。仍然建议：**交作业前对一下教材上的习题编号与答案**——每题都标了 `教材对应 习题X.Y 第M题`，能查的都查得到。

**版权。** 源书为第三方版权教材（高等教育出版社）。此处内容是**综合整理的学习材料**，不是教材原文，仅供**个人学习**——请勿转发或公开。
