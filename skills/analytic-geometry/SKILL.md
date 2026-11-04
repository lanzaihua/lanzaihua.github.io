---
name: analytic-geometry
description: "Analytic geometry knowledge base from 吕林根、许子道《解析几何》第五版 together with its 学习辅导书 and 课后答案. Use when solving or reasoning about vectors and coordinates (dot/cross/triple products), plane and space-line equations, position relations and distances in space, cylinders, cones and surfaces of revolution, quadrics (ellipsoid, hyperboloids, paraboloids, rectilinear generators), the general theory of conics and quadrics (asymptotic directions, centres, diameters, principal directions, characteristic roots), invariants and reduction/classification of second-degree equations, or when studying for an exam. Also use to look up the standard written solution of a specific textbook exercise (习题 x.y 第 N 题) or a 辅导书 worked example with alternative methods."
---

<!-- argument-hint: [topic, theorem name, or chapter number ch01-ch07] -->

# 解析几何 — Analytic Geometry

| | 来源 | 章节 | 页数 |
|---|---|---|---|
| **教材** | 《解析几何》第五版 — 吕林根、许子道 编（高等教育出版社，2019，国家级规划教材） | ch01–ch06 + 附录 ch07 | 249 |
| **辅导书** | 《解析几何(第五版)学习辅导书》— 吕林根 编（高等教育出版社，2020） | 与教材逐章对齐 | 218 |
| **答案** | 《解析几何(第五版)课后答案》 | 按章按节 | 161 |
| **习题库** | 由「答案」重建的习题标准解答库（本技能新增） | `exercises/` ch01–ch06 | — |

**Generated**: 2026-10-10 ｜ **Rebuilt**: 2026-11-04（补入课后习题解答库，并据辅导书增补例题分析）

## How to Use This Skill

- **无参数** — 加载下面的核心框架
- **给主题** — 问 `异面直线的距离`、`不变量`、`主方向`、`直母线`；我读对应章节
- **给章节** — `ch03`（平面与空间直线）、`ch05`（二次曲线一般理论）；我直接加载
- **要解题** — 问具体题目；章节里的 `解题套路` 一节就是为此准备的。**并按下面的「解题工作流」一次给全：考试标准解答 + 详细解析 + 模板 + 错题本。**
- **要习题答案** — 说「习题3.4 第5题」或「第三章第 12 题」；我先到 `exercises/ch0N-exercises.md` 查标准解答，再补解析、模板、错题本
- **要例题/多解** — 问「辅导书怎么讲这题」；章节里的 `辅导书·例题分析` 一节收录了辅导书的例题、一题多解与易错点

**三份来源的分工**：**教材**给定义、定理与推导；**辅导书**给内容概述、学习指导、**典型例题分析**与常见错误；**答案**给习题的标准解法。技能里的每个章节文件把三者融合在一起——一个主题一个地方，不用来回翻三本书。

**本书的方法论主线**：**把几何问题代数化**。向量给出工具（数量积、向量积、混合积），标架给出坐标，于是"求交点、判位置、算距离、证共面"全部变成方程组与行列式的计算。第五章起进一步：二次曲线的**主方向由特征方程 `λ² − I₁λ + I₂ = 0` 决定**，标准形的系数就是特征根——这与线性代数的实对称矩阵正交对角化是同一件事。

## 解题工作流（强制）

用户每提出一道**具体题目**（作业、习题、考试、例题），必须一次给全四样，不得省略、不得说"下次补"：

0. **先查库** —— 若题目出自教材习题，先按「第几章 + § 第几节 + 第几题」到 [习题解答库](#习题解答库exercises) 对应的 `exercises/ch0N-exercises.md` 取标准解答（库里没有才自己推，并把新题回填进库）。这一步决定了第 ① 件的口径与判据，别跳过。

1. **考试标准解答过程** —— 按卷面格式写：`解：`（证明题 `证明：`）→ 判据与关键步骤、必要计算（每步可判分）→ `答：`（证明题 `证毕`）。只写推理链与计算，不写口语，不写"为什么想到这个"。
2. **详细解析** —— 紧跟标准解答之后：切入点（题眼在哪、为什么选这个方法）、每步依据（定理 / 公式 / 判据）、计算细节与符号陷阱、检验方法、易错点清单、考场提示。
3. **同类型解答模板** —— 抽象成可复用模板：识别特征、标准步骤、核心公式、易错点、变式；登记进模板库并编号 `T01`、`T02`…
4. **写入错题本** —— 追加条目：题号 `AG-YYYYMMDD-NN`、**日期时间** `YYYY-MM-DD HH:mm`（Asia/Shanghai）、**知识要点**（第X周 · 第X章 §X.X + 标签）、错因、**考试标准解答**、**详细解析要点**、模板号；并更新顶部索引与统计。

错题本位置：`D:\学习\大一\解析几何\错题本\`

- `README.md` — 规范说明 + 完整示范（四件套长什么样：标准解答 + 详细解析）
- `错题本.md` — 主台账（知识要点索引、错因统计、逐条记录）
- `题型模板库.md` — 可复用模板 T01 起

---

## 习题解答库（`exercises/`）

**先查库，再动笔。** 用户问教材习题时，按「章 → § → 题号」在对应文件里取标准解答；库里没有的才自己推，推完回填。

| 文件 | 覆盖范围 | 题量 |
|---|---|---|
| [exercises/ch01-exercises.md](exercises/ch01-exercises.md) | 第一章 §1.1–§1.10 习题 + 章末复习与测试 | 91（64 + 27） |
| [exercises/ch02-exercises.md](exercises/ch02-exercises.md) | 第二章 §2.1–§2.3 习题 + 章末复习与测试 | 32 |
| [exercises/ch03-exercises.md](exercises/ch03-exercises.md) | 第三章 §3.1–§3.8 习题 + 章末复习与测试 | 66 |
| [exercises/ch04-exercises.md](exercises/ch04-exercises.md) | 第四章 §4.1–§4.7 习题 + 章末复习与测试 | 54 |
| [exercises/ch05-exercises.md](exercises/ch05-exercises.md) | 第五章 §5.1–§5.7 习题 + 章末复习与测试 | 49（40 + 9） |
| [exercises/ch06-exercises.md](exercises/ch06-exercises.md) | 第六章 §6.2–§6.7 习题 + 章末复习与测试（§6.1 答案书未收） | 50（42 + 8） |
| [exercises/README.md](exercises/README.md) | 库的结构、覆盖状态、如何回填新题 | — |

每份文件结构统一：`节 → 题号 → 题目 / 标准解答 / 答 / 考点 / 方法`，末尾有「本册易错点汇总」。

**答案来源与可信度**：内容由《解析几何》(第五版) 课后答案（扫描件，零文字层）经 OCR 后**按数学逻辑重建**——不是原书文字照抄。重建时逐题验算；个别式子与纸书可能有出入，**以纸书为准**，文件内用 `<!-- OCR存疑：… -->` 标出不确定处。第 ① 件「标准解答」可直接取用，第 ② 件「详细解析」仍需自己写。

**回填规则**：新题整理好后追加到对应文件的「节」下，沿用同一格式；改完在文件开头「覆盖」与索引表里更新题数。

**辅导书内容的落点**：辅导书的「学习辅导要点」「例题分析」已并入 **ch01–ch06 全部六章**文件（在 `## Worked Example` 之前）；每题格式为 题目 / 分析 / 解 / 一题多解 / 易错。「复习与测试」方面：**六章的章末复习与测试在 `exercises/` 里都有全解**（ch01 27 题、ch02 4 题、ch03 8 题、ch04 8 题、ch05 9 题、ch06 8 题）；章文件里的 `## 辅导书·复习与测试` 则 ch03、ch06 为全量，ch01/ch02/ch04/ch05 为「选」。**ch07（附录 矩阵与行列式）没有辅导书对应内容**——辅导书只写到第六章。

**OCR 状态（2026-11-05 补完）**：辅导书 218 页**已全部识别成功**（含首轮失败的 p0080、p0078–p0079——失败原因是 opencv 5.0-beta 在检测后处理阶段间歇性崩溃，换识别参数并改用 opencv 4.10 后重跑通过）。答案书 161 页同样全部识别。仍带 `<!-- OCR存疑 -->` 的多是公式被压平/上下标丢失处的重建判断，遇到与纸书不符**以纸书为准**。

## Core Frameworks

**三个乘积是整个空间解析几何的工具箱。** **数量积** `a·b = |a||b|cosθ` 给角度与垂直判据（`a·b=0`）；**向量积** `a×b` 的模等于平行四边形面积、方向由右手法则定，给面积与共线判据（`a×b=0`）；**混合积** `(a,b,c) = a·(b×c)` 是平行六面体体积，**给共面判据（`(a,b,c)=0`）**。三者从"数与向量"到"体积"逐级升维，几乎所有几何命题都能翻译成其中一个为零或某个比值。

**标架 = 坐标系。** 任取定点 `O` 与三个不共面向量构成**仿射标架**；取成两两垂直的单位向量就是**直角标架**（`i, j, k`）。**任何向量在基下唯一分解，分解系数就是坐标**——这是"几何问题代数化"的合法性来源。

**平面与直线问题全部归结为两个向量**：平面的**法向量** `n = (A,B,C)`（一般式系数直接读出）与直线的**方向向量** `v`。位置关系判定的通用套路是比较这两个向量：`n₁ ∥ n₂` 平面平行、`n₁ ⊥ n₂` 平面垂直、`v ⊥ n` 直线平行于平面、`v ∥ n` 直线垂直于平面。**`v = n₁ × n₂` 是求两平面交线方向的标准手法。**

**距离公式有一条统一来源**：平面的**法式方程** `x cosα + y cosβ + z cosγ − p = 0`。点到平面的距离 `d = |Ax₀+By₀+Cz₀+D| / √(A²+B²+C²)` 就是它的直接推论。**两异面直线的距离 `d = |(v₁,v₂,M₁M₂)| / |v₁×v₂|` 读作"平行六面体体积 ÷ 底面积"。**

**"母线 + 准线/轴"是生成曲面的统一框架。** 柱面 = 母线平行于定方向；锥面 = 母线过定点；旋转曲面 = 母线绕定直线转。三种曲面的方程求法都是**消去参数**。两个快速判据：**母线平行于 z 轴 ⟹ 柱面方程不含 z**；**顶点在原点 ⟹ 锥面方程是齐次方程**。

**二次曲线（曲面）理论的核心是不变量。** 对 `F(x,y) = a₁₁x² + 2a₁₂xy + a₂₂y² + 2a₁₃x + 2a₂₃y + a₃₃ = 0`，`I₁ = a₁₁+a₂₂`、`I₂ = |a₁₁ a₁₂; a₁₂ a₂₂|`、`I₃ = |A|` **在直角坐标变换下不变**。于是化简有两条路：① **坐标变换**（先移轴消一次项、后转轴消交叉项）；② **直接用不变量查表分类**。后者更快，是考试主力。

**主方向 = 特征向量。** 特征方程 `λ² − I₁λ + I₂ = 0`（曲线）或 `λ³ − I₁λ² + I₂λ − I₃ = 0`（曲面）的根即矩阵 `[a₁₁ a₁₂; a₁₂ a₂₂]`（或 3×3）的特征值；**特征根全是实数，且不同特征根对应的主方向互相垂直**（定理5.5 / 定理6.5）。标准形的系数就是特征根，`I₁ = 迹`、`I₃ = 行列式`。

**单叶双曲面与双曲抛物面有直母线**，各有两族（异族相交、同族异面）；椭球面、双叶双曲面、椭圆抛物面**没有**。这是"曲面可以由直线生成"的最精彩结果，也是快速排除的判据。

---

## Chapter Index

| # | 标题 | 核心框架 |
|---|------|----------|
| [ch01](chapters/ch01-vectors-coordinates.md) | 第一章 向量与坐标 | 向量运算、线性关系与分解、标架与坐标、射影、数量积/向量积/混合积 |
| [ch02](chapters/ch02-loci-equations.md) | 第二章 轨迹与方程 | 平面曲线方程、曲面方程与参数方程、球/柱坐标系、空间曲线与射影柱面 |
| [ch03](chapters/ch03-planes-lines.md) | 第三章 平面与空间直线 | 平面五种方程、法式方程与点面距离、直线方程、位置关系、异面直线距离与公垂线、平面束 |
| [ch04](chapters/ch04-cylinders-cones-surfaces.md) | 第四章 柱面、锥面、旋转曲面与二次曲面 | 三种生成曲面、椭球面、双曲面、抛物面、直母线 |
| [ch05](chapters/ch05-conics-general.md) | 第五章 二次曲线的一般理论 | 渐近方向与中心、切线、直径、主方向与特征根、坐标变换化简、不变量分类 |
| [ch06](chapters/ch06-quadrics-general.md) | 第六章 二次曲面的一般理论 | 渐近方向与中心、切平面、径面与奇向、主径面与特征根、不变量分类 |
| [ch07](chapters/ch07-appendix-linear-algebra.md) | 附录 矩阵与行列式 | 矩阵与行列式定义、行列式性质、秩与线性方程组、克莱姆法则、矩阵乘法 |

## 习题索引（题号 → 文件）

教材每节之后的「习题 x.y」都对应一份解答库文件；题号即教材上的编号。

| 教材习题 | 在哪个文件 | 典型内容 |
|---|---|---|
| 习题 1.1–1.10 | `exercises/ch01-exercises.md` | 相等/反向向量、线性表示、共面判据、坐标运算、数量积/向量积/混合积、双重向量积 |
| 习题 2.1–2.3 | `exercises/ch02-exercises.md` | 求平面曲线/曲面/空间曲线的方程、参数方程互化、球柱坐标、射影柱面 |
| 习题 3.1–3.8 | `exercises/ch03-exercises.md` | 求平面/直线方程、点面距离、两直线位置、距离与公垂线、平面束 |
| 习题 4.1–4.7 | `exercises/ch04-exercises.md` | 柱面/锥面/旋转曲面方程、二次曲面标准方程、直母线（两族参数式） |
| 习题 5.1–5.7 | `exercises/ch05-exercises.md` | 二次曲线与直线位置、渐近方向与中心、切线、直径、主方向、方程化简、不变量分类 |
| 习题 6.2–6.7 | `exercises/ch06-exercises.md` | 二次曲面的中心、切平面与奇点、奇向与径面、主径面与主方向、坐标变换化简、不变量分类 |
| 复习与测试（章末综合） | 六章 `exercises/ch0N-exercises.md` 末尾全解；ch03、ch06 另有章文件内的全量版 | 每章一套（填空 + 解答） |
| 辅导书「复习与测试」 | 各章文件 `## 辅导书·复习与测试` 节 | 每章一套综合复习题 |

查题三步：① 章 → 文件；② `§x.y` → 节；③ `题 N` → 标准解答。

## Topic Index

- **半不变量 / semi-invariant** → ch05
- **标准方程 / standard equation** → ch05, ch06
- **不变量 / invariants** → ch05, ch06
- **参数方程 / parametric equation** → ch02
- **叉积（向量积）/ cross product** → ch01
- **长度与模 / magnitude** → ch01
- **单位向量 / unit vector** → ch01
- **点到平面的距离 / point-plane distance** → ch03
- **点到直线的距离 / point-line distance** → ch03
- **直角标架 / rectangular frame** → ch01
- **直径 / diameter** → ch05
- **直母线 / rectilinear generator** → ch04
- **共轭方向与共轭直径 / conjugate directions** → ch05, ch06
- **共线向量 / collinear vectors** → ch01
- **共面向量 / coplanar vectors** → ch01
- **公垂线 / common perpendicular** → ch03
- **法式方程 / normal equation** → ch03
- **法向量 / normal vector** → ch03
- **方向角与方向余弦 / direction angles & cosines** → ch01
- **方向向量与方向数 / direction vector & numbers** → ch03
- **奇点与奇向 / singular point & direction** → ch05, ch06
- **混合积 / scalar triple product** → ch01
- **基底与分解 / basis & decomposition** → ch01
- **渐近方向 / asymptotic direction** → ch05, ch06
- **渐近线 / asymptote** → ch05
- **截距式 / intercept form** → ch03
- **径面 / diametral plane** → ch06
- **克莱姆法则 / Cramer's rule** → ch07
- **空间曲线与曲面方程 / curves & surfaces** → ch02
- **平面方程 / plane equation** → ch03
- **平面束 / pencil of planes** → ch03
- **平移与旋转 / translation & rotation** → ch05, ch06
- **切线 / tangent** → ch05, ch06
- **切平面 / tangent plane** → ch06
- **球坐标系 / spherical coordinates** → ch02
- **柱坐标系 / cylindrical coordinates** → ch02
- **射影 / projection** → ch01
- **射影柱面 / projecting cylinder** → ch02, ch04
- **数量积 / dot product** → ch01
- **双曲抛物面 / hyperbolic paraboloid** → ch04
- **双叶双曲面 / hyperboloid of two sheets** → ch04
- **双重向量积 / double cross product** → ch01
- **特征方程与特征根 / characteristic equation & roots** → ch05, ch06
- **椭球面 / ellipsoid** → ch04
- **椭圆抛物面 / elliptic paraboloid** → ch04
- **旋转曲面 / surface of revolution** → ch04
- **行列式与矩阵 / determinants & matrices** → ch07
- **向量 / vector** → ch01
- **线性相关与共面 / linear dependence** → ch01
- **向径 / position vector** → ch01
- **柱面 / cylinder** → ch04
- **锥面 / cone** → ch04
- **中心（二次曲线/曲面）/ centre** → ch05, ch06
- **准线与母线 / directrix & generator** → ch04
- **主直径与主方向 / principal diameter & direction** → ch05
- **主径面 / principal diametral plane** → ch06
- **坐标变换化简 / reduction by coordinate change** → ch05, ch06

## Supporting Files

- [glossary.md](glossary.md) — 中英术语表，含章节引用
- [patterns.md](patterns.md) — 方法库：求平面/直线方程、位置关系判定、三种生成曲面、不变量分类、直母线
- [cheatsheet.md](cheatsheet.md) — 决策速查：题型→方法索引、分类表、常见错误

---

## Scope & Limits

教材六章 + 附录的完整内容（向量代数、空间解析几何、二次曲线与二次曲面的一般理论）。超过这个范围——微分几何、射影几何、n 维几何——需要别的资料。

**数学记号约定。** 章节文件混用两种等价记法，都是有意保留的：

- **ch01、ch02、ch05、ch06** 与全部支撑文件用 **Unicode 行内 code**：`` `|Ax₀+By₀+Cz₀+D| / √(A²+B²+C²)` ``
- **ch03、ch04、ch07** 用 **LaTeX**：`$$\frac{|Ax_0+By_0+Cz_0+D|}{\sqrt{A^2+B^2+C^2}}$$`

两者数学上等价、agent 都能正确解析——LaTeX 在分数与行列式密集处更精确，Unicode 在简单公式处更易读。**不要**为此重排文件：把 LaTeX 转成 Unicode 是语义改写（`\frac{}{}`→`/`、`\begin{vmatrix}`→行列式排版），机械替换会引入错误。

**向量的写法也按语义分工**：ch01–ch04 讨论真正的向量，写 `\vec a`、`\overrightarrow{AB}`；ch05–ch06 里的 `X, Y, Z` 是二次方程的**方向数/分量**而不是向量，故不加箭头——加了反而是错的。

**源材料质量。** 三份 PDF 都是**纯图像扫描件**（628 页合计，零文字层），用 RapidOCR（PP-OCRv6，中文，2.2 倍渲染，opencv 4.10）识别后再按数学逻辑重建；辅导书 218 页、答案 161 页现已全部识别成功。2026-11-04/05 的重建补入了**课后习题解答库**（`exercises/`，含章末复习与测试）、辅导书例题分析与复习与测试，并用 OCR 原文逐题核对了下面的公式。需要注意：

- 中文正文、`定义`/`定理`/`例` 的标签与编号识别良好；
- **向量记号降级最严重**：扫描件里向量的箭头与黑体在 OCR 中全部丢失，`\vec a` 变成普通 `a`，与标量无法区分。章节文件已按上下文**逐处还原**，但请留意；
- **公式被压平**：矩阵与行列式被打散成零散符号行，坐标与方程被拆行，`²`、`±`、`√`、`⊥` 等符号有丢失或误认；
- 章节里的公式是**按标准数学记法重建**的，不是照搬 OCR 碎片；
- 重建时做了大量特例核验（点到平面距离公式、混合积的几何意义、单叶双曲面直母线代入验证、不变量与特征值的一致性等），但**用于作业或考试前请对照纸书核对关键公式**。

**与已有技能的关系。** 本技能的 **ch07（附录 矩阵与行列式）** 是教材自带的线性代数预备知识，内容与 `advanced-algebra` 技能（线性代数/高等代数）重叠——但保留它是为了让本技能自足（教材正文多处写"见附录"）。要做更深的线性代数，用 `advanced-algebra`。同理，二次曲线/曲面化简中的特征值问题，在 `advanced-algebra` 里有完整的实对称矩阵理论。

**版权。** 三份来源均为第三方版权出版物（高等教育出版社）。此处内容是**综合整理的学习材料**，不是原书文字，仅供**个人学习**——请勿转发或公开。
