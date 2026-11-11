---
name: advanced-algebra
description: "北大版《高等代数》第六版十章知识库：教材理论 + 配套《高等代数辅导与习题解答》(第四版) 的题解与题型 + 课堂课件重点，三层合并成 ch01–ch10。Use when solving or reasoning about polynomials and factorization, determinants, linear systems and rank, matrices and elementary operations, quadratic forms and inertia, linear spaces and dimension, linear transformations and minimal polynomials, λ-matrices and Jordan/rational canonical forms, Euclidean/unitary spaces and orthogonal diagonalization, bilinear forms and symplectic spaces — or when doing 习题、复习考试、判断题型与易错点。"
---

<!-- argument-hint: [topic, theorem name, or chapter number ch01-ch10] -->

# 高等代数（北大版·第六版）— 十章合一

**一章一文件，四层内容已经并在一起**：正文讲「怎么想」，[solutions/](solutions/) 讲「每题答案与起手」。

| 层 | 来源 | 并入位置 |
|---|---|---|
| **理论** | 《高等代数》第六版（北京大学数学系前代数小组编，王萼芳、石生明、王立中修订） | 各章 Core Idea / Frameworks / Key Concepts / Procedures |
| **题解** | 《高等代数辅导与习题解答》北大·第四版（王萼芳、石生明编） | 各章 典型题精解 / 题型清单 / Anti-patterns & 疑难辨析 |
| **课堂** | 北大版配套课件（52 个课件包，约 1,730 张；第八章无课件） | 各章 课堂重点与例题（第八章无课件） |
| **解答** | 《辅导书》全部习题与补充题（题号 → 答案 → 起手） | [solutions/chNN-solutions.md](solutions/)（一章一份） |
| **习题集** | 《高等代数习题精选精解》（张天德、吕洪波，山东科学技术出版社 2012） | [sources/gaodai-xiti-jingxuan.md](sources/gaodai-xiti-jingxuan.md)：章/节地图 + 题型方法索引 |

**Generated**: 2026-10-14 · **Updated**: 2026-11-11（并入《高等代数习题精选精解》章节地图与题型索引；补矩阵题干语言规范）

## How to Use This Skill

- **No argument** — 读下面的「十章主线」框架
- **With a topic** — 问 `SVD 不用管`、`若尔当标准形`、`惯性定理`、`最小多项式`；我读对应章
- **With a chapter** — `ch03`（线性方程组）或 `ch09`（欧几里得空间）；我加载该章文件
- **习题 / 某道题** — 说「习题三第5题」「这题怎么起手」；我先在该章**题型清单**里认出题型，再照**典型题精解**的步骤骨架写解答
- **对答案 / 查题号** — 说「习题三第5题答案」「补充题第2题」；我读 [solutions/](solutions/) 该章的题号表：**✓ = 已复核答案，? = 只给方法，— = OCR 残缺**
- **易错点** — 说「这一章最容易错什么」；我读该章 **Anti-patterns & 疑难辨析**
- **考试权重** — 问「这章考什么」；我读该章 **课堂重点与例题**（按课件张数分布判断时间投入）
- **跨章对照** — 「合同和相似差在哪」「行列式因子和不变因子什么关系」；我查 [cheatsheet.md](cheatsheet.md) 与相关两章
- **习题集题型** — 说「习题精选精解里这一节考什么」；我读 [sources/gaodai-xiti-jingxuan.md](sources/gaodai-xiti-jingxuan.md) 的章/节地图与题型索引，再回到对应章

**一章怎么用（做题顺序）**：先用「题型清单」认出题型 → 照「典型题精解」的步骤骨架写 → 回 Frameworks/Procedures 补定理编号与适用条件 → 用「Anti-patterns & 疑难辨析」自查。

**先看再算 — read the structure before computing.** 展开行列式前先扫：常数项是不是系数列的组合（是则每个 `Dⱼ = D`，答案立刻出来）？两行成比例（则 `D = 0`）？是三对角，还是 `aᵢⱼ = xᵢ + yⱼ` 型？零和结构永远比蛮算快。清单见 [cheatsheet.md](cheatsheet.md)，动作名见 [patterns.md](patterns.md)。

---

## 每次答疑的固定交付

**只要用户是在问一道题，答案就不算完成，除非下面三件事都交付：**

1. **考试标准解答 + 详细解析** — 先给**可直接抄到答题纸上**的规范解答：以「证明：/解：」开头、步骤编号、引用定理名与编号、结论明确；紧接着附**详细解析**：思路从哪来 → 关键一步为什么非它不可 → 定理怎么用（适用条件）→ 易错点 → 验算/推广。公式用 LaTeX。
2. **同类型题解答模板** — 先查工作目录下的 `解题模版库.md`：命中就引用编号（T-章-序号）并按卡片写；未命中就新建模板、登记索引与卡片。四段式：识别特征 → 首选方法 → 步骤骨架 → 易错点 / 取舍（少一个条件会怎样）。模板要能直接套到变式上。
3. **错题本条目** — 追加到当前工作目录下的 `错题本.md`（本工作区为 `D:\学习\大一\高等代数\错题本.md`）。必须带：
   - **日期时间**：Asia/Shanghai，`YYYY-MM-DD HH:mm（周X）`；
   - **知识要点**：章节 + 定理/定义编号 + 一句话概括；
   - **模板编号**：T-xx-yy（对应 `解题模版库.md`）；
   - 来源/题号、原题（LaTeX）、错因或卡点、**考试标准解答 + 详细解析**、答案、同类型模板、变式自测。

格式规范、条目模板与示例见错题本文件（附录 A / 附录 C）；编号从 `001` 起连续递增，**追加式写入（新条目在正文末尾），索引表、统计与按章索引同步更新**。回复末尾用一行交代：「已记入错题本 第 N 条 · 模板 T-xx-yy · 知识要点：…」。

> 用户没给错解时，「错因」一栏写**易错点**（这题最可能错在哪），不要留空。

---

## Core Frameworks — 十章主线

**数域决定一切（ch01）。** 「不可约 / 规范形 / 相似」这类问题不说清数域就是没说完：ℂ 上不可约只有一次，ℝ 上至多二次，ℚ 上可以任意次。惯性指数、若尔当形也都依赖数域。

**多项式 = 整数的翻版（ch01）。** 带余除法 → 最大公因式 → 不可约 → 唯一分解，与 ℤ 逐条对应。互素最好用成 **Bézout `uf + vg = 1`**；`(f, f′) = 1 ⟺ 无重因式`（重因式看 `(f,f′)`、重根还要看数域）；`n+1` 个点定死 `n` 次多项式（待定系数法的依据）；Eisenstein 只是充分条件。

**行列式由逆序数定义（ch02）。** 性质（换行变号、倍加不变、按行列展开）都是**定理**。展开前选零最多的行/列；`n ≥ 4` 走消元；范德蒙德、三对角递推、加边法、行和相等是四类能看出来的结构。克拉默法则只作理论工具（计算量指数级）。

**秩是唯一的核心不变量（ch03–ch04）。** 最高阶非零子式阶数 = 非零行数 = 行秩 = 列秩。有解 ⟺ `r(A) = r(A,b)`；解集 = 特解 + 基础解系（`n − r` 个）。`A` 可逆 ⟺ `|A| ≠ 0` ⟺ 初等矩阵之积 ⟺ `A ~ E` ⟺ `r(A) = n`。**左乘管行，右乘管列**；求逆 `(A|E) → (E|A⁻¹)` 并验算。

**合同看惯性，相似看特征值（ch05、ch07）。** `f = xᵀAx` 经 `x = Cy` 得 **合同** `CᵀAC`；标准形不唯一，**惯性指数 `p,q` 唯一**（惯性定理）。正定 ⟺ `p = n` ⟺ 合同于 `E` ⟺ 全部顺序主子式 `> 0` ⟺ 特征值全 `> 0`。相似则是 `P⁻¹AP`，保特征值/迹/行列式。

**线性空间看维数（ch06）。** 子空间只验封闭；**`dim(V₁+V₂) = dim V₁ + dim V₂ − dim(V₁∩V₂)`**；直和 ⟺ `V₁ ∩ V₂ = {0}`；补子空间不唯一（正交补才唯一，见 ch09）；有限维空间只按维数分类。

**线性变换由基上的像决定（ch07）。** 换基给相似 `B = X⁻¹AX`；**维数定理 `dim 值域 + dim 核 = n`**；可对角化 ⟺ 几何重数 = 代数重数 ⟺ 最小多项式无重根；不变子空间是分块对角化的框架。

**相似 ⟺ 不变因子相同（ch08）。** `A ~ B ⟺ λE−A` 与 `λE−B` 等价 ⟺ 不变因子相同。行列式因子 `Dₖ` → `dₖ = Dₖ/D_{k−1}` → 初等因子；每个 `(λ−λ₀)ᵏ` 配一个 `k` 阶若尔当块。**特征多项式相同不保证相似。** 有理标准形在任何数域都可用。

**欧氏空间把「垂直」变成计算（ch09）。** 内积 → 长度、夹角、正交；施密特正交化把任意基变标准正交基，标准正交基下坐标就是投影 `(α, eᵢ)`。**正交补唯一**；实对称矩阵必可正交对角化（此处的合同与相似重合）；正交变换 ⟺ `AᵀA = E`；最小二乘 = 到 `Col A` 的最近距离。酉空间是复数版（转置换共轭转置）。

**双线性函数与辛空间（ch10）。** 线性函数 → 对偶空间，`dim V* = dim V`；双线性函数的度量矩阵 `A = (f(εᵢ,εⱼ))` 按**合同** `CᵀAC` 变。对称型对应二次型；**反对称型**给出辛几何：非退化反对称型只在**偶数维**存在，每个向量迷向，`W ∩ W^⊥` 一般不平凡，辛变换满足 `KᵀJK = J`、`det K = 1`。

---

## Chapter Index

| # | 章 | 一句话骨架 | 高频题型 |
|---|---|---|---|
| [ch01](chapters/ch01-polynomials.md) | 第一章 多项式 | 带余除法→gcd→不可约→唯一分解；重因式看 `(f,f′)` | 辗转相除求贝祖、重因式、有理根、艾森斯坦、对称多项式 |
| [ch02](chapters/ch02-determinants.md) | 第二章 行列式 | 逆序数定义、性质定理化、展开与特殊结构 | 逆序数、按行列展开、范德蒙德、三对角/箭形/加边、克拉默 |
| [ch03](chapters/ch03-linear-systems.md) | 第三章 线性方程组 | 消元 → 秩判据 → 基础解系；结式判公共根 | 秩判据、含参讨论、基础解系、结式 |
| [ch04](chapters/ch04-matrices.md) | 第四章 矩阵 | 分块、初等矩阵、可逆判据、秩不等式 | 初等变换求逆、分块运算、秩不等式、矩阵方程 |
| [ch05](chapters/ch05-quadratic-forms.md) | 第五章 二次型 | 合同、配方法、惯性定理、正定判据 | 配方法/合同变换、惯性定理、含参正定 |
| [ch06](chapters/ch06-linear-spaces.md) | 第六章 线性空间 | 八条公理、基与维数、维数公式、直和、同构 | 判子空间、求基与维数、直和证明、过渡矩阵 |
| [ch07](chapters/ch07-linear-transformations.md) | 第七章 线性变换 | 矩阵表示、相似、特征值、对角化、最小多项式 | 求矩阵表示、判可对角化、值域核、最小多项式 |
| [ch08](chapters/ch08-lambda-matrices.md) | 第八章 λ-矩阵 | 行列式因子→不变因子→初等因子→若尔当/有理标准形 | 化 Smith 标准形、求若尔当形、判相似 |
| [ch09](chapters/ch09-euclidean-spaces.md) | 第九章 欧几里得空间 | 内积、施密特、正交补、实对称正交对角化、酉空间 | 正交化、求正交补、正交变换、最小二乘 |
| [ch10](chapters/ch10-bilinear-symplectic.md) | 第十章 双线性函数与辛空间 | 对偶空间、度量矩阵、合同、辛基、拉格朗日子空间 | 求对偶基、写度量矩阵、辛基构造、判线性函数存在性 |

## 习题解答索引 / Solutions Index

每章一份，内容是**全题号表**（题号 → 题型 → 起手动作 → 答案）+ **4–6 道难题精解**。答案列标记：**✓ = 独立复核过**；**? = 只给方法、答案从略**；**— = OCR 残缺或无法复核**。

| 章 | 解答文件 | 覆盖 |
|---|---|---|
| 第一章 多项式 | [ch01-solutions.md](solutions/ch01-solutions.md) | 习题 1–32、补充题 1–20，52 行 |
| 第二章 行列式 | [ch02-solutions.md](solutions/ch02-solutions.md) | 习题 1–21、补充题 1–6，27 行 |
| 第三章 线性方程组 | [ch03-solutions.md](solutions/ch03-solutions.md) | 习题 1–28、补充题 1–14，57 行 |
| 第四章 矩阵 | [ch04-solutions.md](solutions/ch04-solutions.md) | 习题 1–30、补充题 1–12，57 行 |
| 第五章 二次型 | [ch05-solutions.md](solutions/ch05-solutions.md) | 习题 1–17、补充题 1–9，40 行 |
| 第六章 线性空间 | [ch06-solutions.md](solutions/ch06-solutions.md) | 习题 1–23、补充题 1–5，28 行 |
| 第七章 线性变换 | [ch07-solutions.md](solutions/ch07-solutions.md) | 习题 1–27、补充题 1–11，38 行 |
| 第八章 λ-矩阵 | [ch08-solutions.md](solutions/ch08-solutions.md) | 习题 1–7、补充题 1–1，31 行 |
| 第九章 欧几里得空间 | [ch09-solutions.md](solutions/ch09-solutions.md) | 习题 1–27、补充题 1–14，41 行 |
| 第十章 双线性函数与辛空间 | [ch10-solutions.md](solutions/ch10-solutions.md) | 习题 1–18（无补充题），19 行 |

**分工**：正文（chapters/）讲「这类题怎么想、为什么」；solutions/ 讲「这道题答案是多少、第一步做什么」。查答案走 solutions，学方法走章节。

## Topic Index

- **Bézout / 互素** → ch01
- **Canonical forms / 标准形** → ch05, ch08
- **Cauchy–Schwarz** → ch09
- **Change of basis / 过渡矩阵与坐标变换** → ch06, ch07
- **Characteristic polynomial / 特征多项式** → ch07, ch08
- **Companion matrix / 伴侣矩阵** → ch08
- **Congruence / 合同** → ch05, ch10
- **Cramer's rule / 克拉默法则** → ch02
- **Determinant / 行列式** → ch02
- **Determinantal divisors / 行列式因子** → ch08
- **Diagonalization / 对角化** → ch07
- **Dimension formula / 维数公式** → ch06
- **Direct sum / 直和** → ch06
- **Dual space / 对偶空间** → ch10
- **Eigenvalue / 特征值** → ch07, ch08
- **Eisenstein / 艾森斯坦判别法** → ch01
- **Elementary divisors / 初等因子** → ch08
- **Euclidean space / 欧几里得空间** → ch09
- **Field of scalars / 数域** → ch01
- **Gram–Schmidt / 施密特正交化** → ch09
- **Inertia / 惯性定理** → ch05
- **Inner product / 内积** → ch09
- **Invariant factors / 不变因子** → ch08
- **Invariant subspace / 不变子空间** → ch07
- **Jordan form / 若尔当标准形** → ch08
- **Kernel & range / 核与值域** → ch07
- **λ-matrices / λ-矩阵** → ch08
- **Least squares / 最小二乘** → ch09
- **Linear functionals / 线性函数** → ch10
- **Minimal polynomial / 最小多项式** → ch07
- **Normal form / 规范形** → ch05, ch08
- **Orthogonal complement / 正交补** → ch09
- **Orthogonal transformation / 正交变换** → ch09
- **Orthogonality / 正交** → ch09
- **Polynomials / 多项式** → ch01
- **Positive definite / 正定** → ch05
- **Rank / 秩** → ch03, ch04
- **Rational canonical form / 有理标准形** → ch08
- **Resultant / 结式** → ch03
- **Similarity / 相似** → ch07, ch08
- **Smith normal form** → ch08
- **Subspace / 子空间** → ch06
- **Symmetric matrix / 实对称矩阵** → ch09
- **Symplectic space / 辛空间** → ch10
- **Unitary space / 酉空间** → ch09
- **Vector space axioms / 线性空间公理** → ch06

## Supporting Files

- [glossary.md](glossary.md) — 术语表（中英对照，章节号已改为 ch01–ch10）
- [patterns.md](patterns.md) — 动作库：每个算法的「识别 → 步骤 → 易错」，含辅导书题型套路
- [cheatsheet.md](cheatsheet.md) — 决策规则、判据选择表、按章易错清单
- [solutions/](solutions/) — 习题解答：每章全题号答案表（✓/?/—）+ 难题精解
- [sources/gaodai-xiti-jingxuan.md](sources/gaodai-xiti-jingxuan.md) — 《高等代数习题精选精解》章节地图与题型方法索引

---

## Scope & Limits

北大版《高等代数》第六版十章的范围。之后的内容（抽象代数、泛函分析、数值线性代数、微分几何）需要别的资料。

**Source quality — 教材（第六版）。** 来源是 **342 页纯图片扫描**（无文本层）。RapidOCR 识别后由模型用标准记号重建：中文叙述、定义/定理名称与编号可靠；**公式、矩阵在 OCR 里是散的**（`a11 a12 a21` 这样的符号行），章节文件里的数学都是**重写**的，不是誊抄。要拿去交作业的公式，请对印刷本核一遍。

**Source quality — 辅导书（第四版）。** 433 页纯图片扫描，同样 OCR 后重写。中文段落、节次、题号可用；公式与数值答案不可靠。**数值答案只在能独立复核时给出**——若某题答案与你的计算不符，先怀疑它，再回教材核对。题号沿用第四版；第六版同节题目基本对应、个别增删。

因此 [solutions/](solutions/) 的答案列用标记区分：**✓** 独立复核过，**?** 只给方法、答案从略，**—** OCR 残缺。引用答案先看标记；标 ? 的题请自己算。

**Source quality — 课件。** 52 个 deck / 1,729 张，覆盖第一章–第九章（**第八章 λ-矩阵没有课件**）。公式在 PPT 里是矢量图（153 个 `.wmf` + 24 个 `.emf`，零个 OMML 对象），所以做法是 PowerPoint 导出 PDF 后 OCR 渲染页。**矩阵与系数是 OCR 最不可靠的部分**，因此「课堂重点与例题」故意不给具体矩阵数值，只记覆盖范围、强调程度与解题套路。权重分析基于**每个 deck 的张数**（教学时间的代理指标，不等于考试分值）。

**Source quality — 习题精选精解。** 414 页纯图片扫描，无文本层。OCR 只用于确认章/节标题与题型分布；**原题公式、矩阵、数值答案不直接誊抄**。`sources/gaodai-xiti-jingxuan.md` 只保留结构索引；错题本网页里标注「教材课后 · 高等代数习题精选精解」的题是按题型重写并独立复核的题，不是扫描原文。

**Copyright.** 教材、辅导书、课件均为第三方材料（高等教育出版社；课程课件）。这里是对内容的结构化提炼与重写，不是原文，仅供**个人学习**——不要分发或发布。
