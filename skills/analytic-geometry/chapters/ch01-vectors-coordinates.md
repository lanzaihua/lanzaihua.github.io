# 第一章 向量与坐标 (Vectors and Coordinates)

> 《解析几何》第五版 · 吕林根、许子道 编  —  教材 + 学习辅导书 + 课后答案 综合整理
>
> **辅导书分页对照**：学习辅导书（下文简称「辅导书」）对应 PDF 页 **p0005–p0030** = 书上 p1–p26（PDF 页 = 书页 + 4）。其中 PDF p0027（书 p23）首轮 OCR 缺页，已重跑 OCR 补回，例 7 的收尾与 例 8 的题面均按原文核对后补入。

**记号约定**：扫描 OCR 把向量记号的箭头与黑体全部丢掉了（`\vec a` 变成 `a`，与标量无法区分）。本章一律写 `\vec a`、`\overrightarrow{AB}`；凡原文「设 a, b 为两向量」处均还原为向量。另请注意：`{X,Y,Z}` 是向量的坐标，`(x,y,z)` 是点的坐标，`(\vec a,\vec b,\vec c)` 是混合积——三者不可混。

## Core Idea / 核心思想

本章做一件事：把空间的几何结构**代数化**。先引进向量及其线性运算（加法、数乘），再引进标架与坐标，于是「向量 ↔ 有序三数组」「点 ↔ 有序三数组」建立一一对应；最后补上三种乘法（数量积、向量积、混合积）与双重向量积，度量问题（长度、夹角、面积、体积）也一并化为数的运算。全书的后续内容——平面与直线、曲面与曲线、二次曲线与曲面的化简——都建立在本章的运算规则与坐标公式之上。

## Frameworks Introduced / 核心框架

### §1.1 向量的概念

- **定义1.1.1（向量）**：既有大小又有方向的量，用有向线段表示（线段方向 = 向量方向，线段长度 = 模 `|\vec a|`）；模为 1 者为单位向量，与 `\vec a` 同向者记 `\vec a⁰`，有 `\vec a=|\vec a|\vec a⁰`（(1.3-1)）；模为 0 者为零向量 `\vec 0`，**方向不定**。
- **定义1.1.2–1.1.5**：相等（模等向同）、反向量（`\overrightarrow{BA}=-\overrightarrow{AB}`）、共线向量（平行于同一直线）、共面向量（平行于同一平面）；零向量与任何向量组共线且共面。本教材只讨论**自由向量**，故可把一组向量归结到共同始点。

### §1.2 向量的加法

- **定义1.2.1（三角形法则）**：`\overrightarrow{OA}+\overrightarrow{AB}=\overrightarrow{OB}`（(1.2-1)）。**定理1.2.1（平行四边形法则）**：以 `\overrightarrow{OA},\overrightarrow{OB}` 为邻边作平行四边形，则对角线 `\overrightarrow{OC}=\overrightarrow{OA}+\overrightarrow{OB}`；自由向量下两法则等价。
- **定理1.2.2（运算律）**：交换律、结合律、`\vec a+\vec 0=\vec a`、`\vec a+(-\vec a)=\vec 0`（(1.2-2)–(1.2-5)）；由此得**多边形法则** `\overrightarrow{OA_n}=\overrightarrow{OA_1}+\overrightarrow{A_1A_2}+…+\overrightarrow{A_{n-1}A_n}`（(1.2-6)）。
- **定义1.2.2（减法）**：`\vec c=\vec a-\vec b` 当且仅当 `\vec b+\vec c=\vec a`；核心恒等式 `\vec a-\vec b=\vec a+(-\vec b)`（(1.2-8)），**减法不必另立体系**。平行四边形 `OACB` 的两条对角线分别给出和 `\overrightarrow{OC}` 与差 `\overrightarrow{BA}`。
  - 关键点：辅导书按「不共线 / 同向 / 反向」三种情形作图证明 `||\vec a|-|\vec b|| ≤ |\vec a+\vec b| ≤ |\vec a|+|\vec b|`；凡遇模的不等式，都可回到「平方后用数量积展开」。

### §1.3 数量乘向量

- **定义1.3.1（数乘）**：`λ\vec a` 的模为 `|λ||\vec a|`；`λ>0` 时与 `\vec a` 同向，`λ<0` 时反向；`λ=0` 或 `\vec a=\vec 0` 时得零向量，此时不谈方向。`(-1)\vec a` 简写为 `-\vec a`。
- **定理1.3.1（运算律）**：`1·\vec a=\vec a`、`λ(μ\vec a)=(λμ)\vec a`、`(λ+μ)\vec a=λ\vec a+μ\vec a`、`λ(\vec a+\vec b)=λ\vec a+λ\vec b`（(1.3-2)–(1.3-5)）。
  - 关键点：证明结合律与第一分配律必须**分符号讨论**（`λμ>0` / `λμ<0`，后者再分 `λ+μ` 的正负）；第二分配律分共线、不共线两种情形。有了运算律，向量式可像多项式一样整理与展开。

### §1.4 向量的线性关系与向量的分解（本章基石）

- **定义1.4.1（线性组合）**：`\vec a=λ₁\vec a₁+…+λ_n\vec a_n`；此时说 `\vec a` 可用 `\vec a₁,…, \vec a_n` 线性表示，或可分解成它们的线性组合。
- **定理1.4.1**：若 `\vec e≠\vec 0`，则 `\vec r` 与 `\vec e` 共线 ⟺ `\vec r=x\vec e`（(1.4-1)），系数 `x` **唯一确定**；`\vec e` 称为表示共线向量的**基**。
- **定理1.4.2**：若 `\vec e₁,\vec e₂` 不共线，则 `\vec r` 与它们共面 ⟺ `\vec r=x\vec e₁+y\vec e₂`（(1.4-2)），系数唯一；`\vec e₁,\vec e₂` 是平面上向量的基。
- **定理1.4.3**：若 `\vec e₁,\vec e₂,\vec e₃` 不共面，则空间**任意**向量 `\vec r=x\vec e₁+y\vec e₂+z\vec e₃`（(1.4-3)），系数唯一；它们叫做空间向量的基。
  - 何时用：一切「求分解式」的题目。
  - 关键点：**几何作法**——共线时在直线上截取；共面时过 `\vec r` 的终点作两基向量的平行线凑成平行四边形（图1-17）；空间情形作三组平行平面凑成以 `\vec r` 为对角线的平行六面体（图1-18）。**唯一性**的证法统一：两次分解式相减，若某系数不等即可把对应基向量用其余基向量表示，与「不共线 / 不共面」矛盾。
- **定义1.4.2（线性相关 / 无关）**：存在**不全为零**的 `λ₁,…,λ_n` 使 `λ₁\vec a₁+…+λ_n\vec a_n=\vec 0` 则线性相关；否则线性无关。**定理1.4.4**：`n≥2` 时线性相关 ⟺ 其中有一个向量是其余向量的线性组合。**定理1.4.5**：部分线性相关 ⟹ 整组线性相关（**推论**：含零向量必线性相关）。
- **定理1.4.6**：两向量共线 ⟺ 它们线性相关，即存在不全为零的 `λ,μ` 使 `λ\vec a+μ\vec b=\vec 0`（(1.4-5)）。
- **定理1.4.7**：三向量共面 ⟺ 它们线性相关，即存在不全为零的 `λ,μ,ν` 使 `λ\vec a+μ\vec b+ν\vec c=\vec 0`（(1.4-6)）。
- **定理1.4.8**：空间中任何四个向量总是线性相关的；**推论**：四个以上向量总是线性相关。
  - 何时用：判定共线、共面，以及一切「用向量法证几何命题」的问题。
  - 关键点：定理1.4.6/1.4.7 把共线、共面这两个**几何概念**翻译成**线性关系**，是本章「几何代数化」的关键一步，也是下节坐标判定的理论依据。
- **点、直线、平面的向量条件（辅导书 §1.3.2，O 为任意取定点）**：`M` 在直线 `AB` 上 ⟺ `\overrightarrow{OM}=λ\overrightarrow{OA}+μ\overrightarrow{OB}` 且 `λ+μ=1`（在线段上再加 `λ,μ≥0`）；`M` 在平面 `ABC` 上 ⟺ `\overrightarrow{OM}=λ\overrightarrow{OA}+μ\overrightarrow{OB}+ν\overrightarrow{OC}` 且 `λ+μ+ν=1`（非负则在 `△ABC` 内）；三点共线（四点共面）⟺ 存在不全为零的系数 `λ_i` 使 `Σλ_i\overrightarrow{OA_i}=\vec 0` 且 `Σλ_i=0`。

### §1.5 标架与坐标

- **标架 `{O;\vec e₁,\vec e₂,\vec e₃}`（§1.5）**：定点 `O` 与三个不共面向量；三者均为单位向量时叫**笛卡儿标架**，再两两垂直则叫**直角标架**，一般情形叫**仿射标架**；按右手（左手）法则分别叫右旋（左旋）标架。直角坐标系约定记 `{O;\vec i,\vec j,\vec k}`。
- **定义1.5.2 / 1.5.3（坐标）**：分解式 `\vec r=x\vec e₁+y\vec e₂+z\vec e₃` 中的 `x,y,z` 叫 `\vec r` 的坐标（分量），记 `\vec r{x,y,z}`；`\overrightarrow{OP}` 叫点 `P` 的**向径**，其坐标叫点 `P` 的坐标。注意**标架是参考系、坐标系是对应关系**，二者不同（辅导书强调）。
- **定理1.5.1 / 1.5.2 / 1.5.3**：`\overrightarrow{P₁P₂}={x₂−x₁, y₂−y₁, z₂−z₁}`（(1.5-1)，向量坐标 = 终点 − 始点）；`\vec a+\vec b={X₁+X₂, Y₁+Y₂, Z₁+Z₂}`（(1.5-2)）；`λ\vec a={λX, λY, λZ}`（(1.5-3)）。线性运算彻底变成数的运算。
- **定理1.5.4（共线）**：非零向量 `\vec a{X₁,Y₁,Z₁},\vec b{X₂,Y₂,Z₂}` 共线 ⟺ 对应坐标成比例 `X₁/X₂=Y₁/Y₂=Z₁/Z₂`（(1.5-4)），**约定分母为零时分子也为零**。**推论**：`A,B,C` 共线 ⟺ `(x₂−x₁):(y₂−y₁):(z₂−z₁)=(x₃−x₁):(y₃−y₁):(z₃−z₁)`（(1.5-5)）。
- **定理1.5.5（共面）**：`\vec a,\vec b,\vec c` 共面 ⟺ `|X₁Y₁Z₁; X₂Y₂Z₂; X₃Y₃Z₃| = 0`（(1.5-6)）。**推论**：四点 `A_i(x_i,y_i,z_i)` 共面 ⟺（(1.5-7)）三行差分行列式为零，等价于 `|x₁y₁z₁ 1; x₂y₂z₂ 1; x₃y₃z₃ 1; x₄y₄z₄ 1| = 0`（(1.5-7′)）。
- **定理1.5.6（定比分点）**：`P` 分有向线段 `P₁P₂` 成定比 `λ`（即 `\overrightarrow{P₁P}=λ\overrightarrow{PP₂}`，`λ≠−1`），则
  `x=(x₁+λx₂)/(1+λ)`，`y=(y₁+λy₂)/(1+λ)`，`z=(z₁+λz₂)/(1+λ)`（(1.5-8)）；**推论**（中点，`λ=1`）：各坐标取平均值（(1.5-9)）。
  - 何时用：重心、交点、内分点、外分点问题；证明三线共点。
  - 关键点：`λ>0` 内分、`λ<0` 外分、`λ=0` 退化为 `P=P₁`；由此得**重心** `G((x₁+x₂+x₃)/3,(y₁+y₂+y₃)/3,(z₁+z₂+z₃)/3)`（教材 §1.5 例，取 `λ=2`）。

### §1.6 向量在轴上的射影

- **定义1.6.1**：过 `A,B` 作垂直于轴 `l` 的平面得射影点 `A′,B′`，`\overrightarrow{A′B′}` 叫**射影向量**；在 `l` 上取同向单位向量 `\vec e`，则 `射影向量_l\overrightarrow{AB}=(射影_l\overrightarrow{AB})\vec e`（(1.6-1)），右端的数就是**射影**。
- **定理1.6.1**：`射影_l \overrightarrow{AB}=|\overrightarrow{AB}|\cos θ`，`θ=∠(l,\overrightarrow{AB})`（(1.6-2)）。**推论**：相等向量在同一轴上的射影相等。
- **定理1.6.2 / 1.6.3（可加性与齐次性）**：`射影_l(\vec a+\vec b)=射影_l\vec a+射影_l\vec b`（(1.6-3)）；`射影_l(λ\vec a)=λ·射影_l\vec a`（(1.6-4)）。
  - 何时用：把「和向量的投影」拆成「投影之和」——数量积分配律的证明工具。
  - 关键点：`(1.6-2)` 的证明要分 `θ≤π/2` 与 `θ>π/2` 讨论同向还是反向；直角坐标系下有 `射影_{\vec i}\vec a=X`、`射影_{\vec j}\vec a=Y`、`射影_{\vec k}\vec a=Z`。

### §1.7 两向量的数量积

- **定义1.7.1**：`\vec a·\vec b=|\vec a||\vec b|\cos∠(\vec a,\vec b)`（(1.7-1)）——**结果是数量**。
- **(1.7-2)**：`\vec a·\vec b=|\vec a|·射影_{\vec a}\vec b=|\vec b|·射影_{\vec b}\vec a`；特别地 `\vec a·\vec e=射影_{\vec e}\vec a`（(1.7-2′)）。这是数量积与射影之间的桥。
- **定理1.7.1**：`\vec a⊥\vec b ⟺ \vec a·\vec b=0`（零向量的方向不定，可视作与任何向量垂直）。
- **定理1.7.2（运算律）**：交换律、数因子结合律 `(λ\vec a)·\vec b=λ(\vec a·\vec b)=\vec a·(λ\vec b)`、分配律 `(\vec a+\vec b)·\vec c=\vec a·\vec c+\vec b·\vec c`、`\vec a·\vec a=\vec a²>0`（`\vec a≠\vec 0`）（(1.7-3)–(1.7-7)）。
  - 关键点：分配律的证明只用 `(1.7-2)` 与射影可加性 (1.6-3)。运算律与多项式乘法同形，故向量式可像多项式一样展开：`(\vec a+\vec b)(\vec a−\vec b)=\vec a²−\vec b²`、`(\vec a±\vec b)²=\vec a²±2\vec a·\vec b+\vec b²`。
- **定理1.7.3（坐标式）**：在**直角**坐标系下 `\vec a·\vec b=X₁X₂+Y₁Y₂+Z₁Z₂`（(1.7-8)）；**推论** `\vec a·\vec i=X, \vec a·\vec j=Y, \vec a·\vec k=Z`（(1.7-9)）。
- **定理1.7.4 / 1.7.5**：`|\vec a|=√(X²+Y²+Z²)`（(1.7-10)）；`d=√((x₂−x₁)²+(y₂−y₁)²+(z₂−z₁)²)`（(1.7-11)）。
- **定理1.7.6（方向余弦）**：`cos α=X/|\vec a|`，`cos β=Y/|\vec a|`，`cos γ=Z/|\vec a|`（(1.7-12)），且 `cos²α+cos²β+cos²γ=1`（(1.7-13)）；单位向量 `\vec a⁰={cos α,cos β,cos γ}`（(1.7-14)）。
- **定理1.7.7（交角）**：`cos∠(\vec a,\vec b)=(X₁X₂+Y₁Y₂+Z₁Z₂)/(|\vec a||\vec b|)`（(1.7-15)）；**推论**：`\vec a⊥\vec b ⟺ X₁X₂+Y₁Y₂+Z₁Z₂=0`（(1.7-16)）。
  - 何时用：一切长度、距离、夹角、射影的坐标计算；柯西–施瓦茨不等式 `(Σa_ib_i)²≤(Σa_i²)(Σb_i²)` 即由 `|\vec a·\vec b|≤|\vec a||\vec b|` 而来（教材例5）。
  - 关键点：(1.7-8) 的推导只用 `\vec i·\vec i=\vec j·\vec j=\vec k·\vec k=1`、`\vec i·\vec j=\vec j·\vec k=\vec k·\vec i=0`。**换成仿射标架该公式失效**（结束语给出带交叉项 `\vec e₁·\vec e₂` 的展开式）——这是最易忽略的适用前提。

### §1.8 两向量的向量积

- **定义1.8.1**：`\vec a×\vec b` 是**向量**，模 `|\vec a×\vec b|=|\vec a||\vec b|\sin∠(\vec a,\vec b)`（(1.8-1)），方向与 `\vec a,\vec b` 都垂直，且 `{\vec a,\vec b,\vec a×\vec b}` 构成右手标架。物理原型：力矩 `\vec m=\vec r×\vec f`。
- **定理1.8.1 / 1.8.2**：两不共线向量向量积的模 = 以它们为邻边的**平行四边形面积**；`\vec a×\vec b=\vec 0 ⟺ \vec a` 与 `\vec b` 共线。
- **定理1.8.3（反交换律）**：`\vec a×\vec b=-(\vec b×\vec a)`（(1.8-2)）——**交换因子必须变号**。
- **定理1.8.4**：`λ(\vec a×\vec b)=(λ\vec a)×\vec b=\vec a×(λ\vec b)`（(1.8-3)）；**推论** `(λ\vec a)×(μ\vec b)=λμ(\vec a×\vec b)`（(1.8-4)）。
- **定理1.8.5（分配律）**：`(\vec a+\vec b)×\vec c=\vec a×\vec c+\vec b×\vec c`（(1.8-5)）、`\vec c×(\vec a+\vec b)=\vec c×\vec a+\vec c×\vec b`（(1.8-6)）。
  - 关键点：分配律的证明很特别——先设 `\vec c` 为单位向量：把 `\vec a` 投影到垂直于 `\vec c` 的平面上再绕 `O` **顺时针旋转 90°**，所得向量恰为 `\vec a×\vec c⁰`；射影与旋转都保持「折线首尾相接」，故 `(\vec a+\vec b)×\vec c⁰=\vec a×\vec c⁰+\vec b×\vec c⁰`；两边再乘 `|\vec c|`。
- **(1.8-7)**：`(\vec a×\vec b)²+(\vec a·\vec b)²=\vec a²\vec b²`（由 `sin²+cos²=1` 立得）。
- **定理1.8.6（坐标式）**：`\vec a×\vec b=(Y₁Z₂−Y₂Z₁)\vec i+(Z₁X₂−Z₂X₁)\vec j+(X₁Y₂−X₂Y₁)\vec k`（(1.8-8)），即
  `\vec a×\vec b = |\vec i \vec j \vec k; X₁ Y₁ Z₁; X₂ Y₂ Z₂|`（(1.8-9)），所用基向量关系为 (1.8-10)：`\vec i×\vec j=\vec k,\vec j×\vec k=\vec i,\vec k×\vec i=\vec j`。
  - 何时用：求面积、求两向量的公垂方向、判定共线。
  - 关键点：**向量积不满足交换律与结合律**，展开时因子次序不能颠倒；`\vec a×\vec a=\vec 0`。

### §1.9 三向量的混合积

- **定义1.9.1**：`(\vec a×\vec b)·\vec c` 叫混合积，记 `(\vec a\vec b\vec c)` 或 `(\vec a,\vec b,\vec c)`——**结果是数量**。（先点乘后叉乘的 `(\vec a·\vec b)\vec c` 只与 `\vec c` 共线，无需另论。）
- **定理1.9.1（几何意义）**：不共面的 `\vec a,\vec b,\vec c` 的混合积绝对值 = 以它们为棱的**平行六面体体积** `V`，且 `(\vec a\vec b\vec c)=εV`（(1.9-1)）：右手系 `ε=1`，左手系 `ε=−1`。故四面体体积 `V=⅙|(\overrightarrow{P₁P₂},\overrightarrow{P₁P₃},\overrightarrow{P₁P₄})|`。
- **定理1.9.2（共面判据）**：`\vec a,\vec b,\vec c` 共面 ⟺ `(\vec a\vec b\vec c)=0`。
- **定理1.9.3（轮换与对调）**：`(\vec a\vec b\vec c)=(\vec b\vec c\vec a)=(\vec c\vec a\vec b)=-(\vec b\vec a\vec c)=-(\vec c\vec b\vec a)=-(\vec a\vec c\vec b)`（(1.9-2)）——**轮换不变，对调变号**。**推论**：`(\vec a×\vec b)·\vec c=\vec a·(\vec b×\vec c)`（(1.9-3)），即「点乘与叉乘可以对调」。
- **定理1.9.4（坐标式）**：`(\vec a\vec b\vec c)=|X₁Y₁Z₁; X₂Y₂Z₂; X₃Y₃Z₃|`（(1.9-4)），与定理1.5.5 的共面判据完全一致。
- **分解式的克拉默形式（教材 §1.9 例3）**：若 `\vec a,\vec b,\vec c` 不共面，则 `\vec d=x\vec a+y\vec b+z\vec c` 中 `x=(\vec d\vec b\vec c)/(\vec a\vec b\vec c)`，`y=(\vec a\vec d\vec c)/(\vec a\vec b\vec c)`，`z=(\vec a\vec b\vec d)/(\vec a\vec b\vec c)`——正是解三元线性方程组的克拉默法则。
  - 关键点：手法是「两边分别与 `\vec b×\vec c` 作数量积」，利用 `(\vec b\vec b\vec c)=(\vec c\vec b\vec c)=0` 消去两个未知数。**这个「两边点乘一个叉积」的技巧适用于一切含混合积的恒等式**。

### §1.10 三向量的双重向量积

- **定义1.10.1**：`(\vec a×\vec b)×\vec c` 叫三向量的**双重向量积**，结果是向量；它必与 `\vec a,\vec b` 共面且垂直于 `\vec c`。
- **定理1.10.1（展开公式）**：`(\vec a×\vec b)×\vec c=(\vec a·\vec c)\vec b−(\vec b·\vec c)\vec a`（(1.10-1)）。
- **(1.10-2)**：`\vec a×(\vec b×\vec c)=(\vec a·\vec c)\vec b−(\vec a·\vec b)\vec c`。比较两式可知**向量积不满足结合律** `(\vec a×\vec b)×\vec c≠\vec a×(\vec b×\vec c)`。
  - 记忆法（教材原话）：双重向量积 = **中间的向量**乘其余两向量的数量积，减去括弧中**另一个向量**乘其余两向量的数量积。
- **拉格朗日恒等式**（(1.10-3)）：`(\vec a×\vec b)·(\vec a′×\vec b′)=(\vec a·\vec a′)(\vec b·\vec b′)−(\vec a·\vec b′)(\vec b·\vec a′)`；取 `\vec a′=\vec a,\vec b′=\vec b` 即退化为 (1.8-7)。
- **配套恒等式**：雅可比恒等式 `(\vec a×\vec b)×\vec c+(\vec b×\vec c)×\vec a+(\vec c×\vec a)×\vec b=\vec 0`；`(\vec a×\vec b)×(\vec a×\vec d)=(\vec a\vec b\vec d)\vec a`。
  - 何时用：化简任何含双重向量积的式子，目标是**把叉积降为点积**。
  - 关键点：定理1.10.1 分两步——先证 `\vec c=\vec a` 的特殊情形（设 `(\vec a×\vec b)×\vec a=λ\vec a+μ\vec b`，两边分别与 `\vec a,\vec b` 作数量积解出 `λ,μ`），再利用 `{\vec a,\vec b,\vec a×\vec b}` 不共面把任意 `\vec c` 按它们分解。有了本公式，**三个以上向量的乘积总可归结为三向量的乘积**。

## Key Concepts / 核心概念

- **自由向量（free vector）**：始点可任意平移的向量；只由模与方向决定，相等向量视为同一向量。
- **单位向量与零向量（unit / zero vector）**：`\vec a⁰=\vec a/|\vec a|`（`\vec a≠\vec 0`）；`\vec 0` 模为 0 且方向不定，与任何向量共线且共面。
- **线性组合（linear combination）**：`λ₁\vec a₁+…+λ_n\vec a_n`；「`\vec r` 可用基向量线性表示」等价于「`\vec r` 沿基方向分解」。
- **线性相关 / 线性无关（linear dependence / independence）**：存在（不存在）不全为零的系数使线性组合为零向量。
- **基（basis）**：能唯一表示所论向量集合的线性无关向量组；空间需要三个不共面的向量。
- **坐标（分量）（coordinates / components）**：分解系数 `x,y,z`；直角标架下即沿三个基方向的有向长度（`\overrightarrow{OP}` 的坐标即点 `P` 的坐标，`\overrightarrow{OP}` 称为**向径**）。
- **射影与射影向量（projection）**：`射影_l\vec a=|\vec a|\cos φ` 是**数**，`射影向量_l\vec a` 是**向量**，二者差一个轴向单位向量。
- **数量积（scalar / dot product）**：`|\vec a||\vec b|\cos θ`，结果是数；度量长度的工具。
- **向量积（vector / cross product）**：模为 `|\vec a||\vec b|\sin θ` 的向量，方向由右手法则定；度量面积的工具。
- **混合积（scalar triple product）**：`(\vec a\vec b\vec c)=(\vec a×\vec b)·\vec c`，带符号体积；度量体积与判定共面的工具。

## Mental Models / 思维模型

- **把「坐标」看成「分解系数」**：写 `\vec r={x,y,z}` 的唯一理由是定理1.4.3（基不共面、分解唯一）。于是「求坐标」=「求沿三个基方向的分解」；「共线/共面」=「分解系数构成的方程组有非零解」。整章的计算都是这一句话的展开。
- **把「乘法」按结果类型分成两族**：数量积与混合积**输出数**（管长度、夹角、体积、共面），向量积与双重向量积**输出向量**（管面积、垂直方向、分解）。遇到题先问「要求的是数还是向量」，再选乘法。
- **把「射影」看成「有向投影长度」**：`\vec a·\vec b=|\vec b|·射影_{\vec b}\vec a`；一切「某个方向上的分量」问题都可以先投影、再乘回单位向量。
- **把「向量恒等式」看成「按代数律整理 + 用展开公式降阶」**：先按多项式展开（分配律），再用混合积轮换与双重向量积展开把叉积换成点积，最后按基向量的线性无关性比较系数。

## Anti-patterns / 常见错误

- **把向量当标量写**：OCR 与手写中箭头、黑体全部丢失，写成 `a·b = |a||b|cos θ` 时读者极易把 `a` 当数。凡「设 a, b 为向量」处必须写 `\vec a,\vec b`；`a>b` 这类比较对向量**无意义**（只有模能比大小）。
- **误用消去律**：`\vec a·\vec b=\vec a·\vec c` 且 `\vec a≠\vec 0` **推不出** `\vec b=\vec c`，只能得 `\vec a⊥(\vec b−\vec c)`；同理 `\vec a×\vec b=\vec a×\vec c` 只能得 `\vec a∥(\vec b−\vec c)`（辅导书 §1.3.4 特别强调）。
- **由零积推出零因子**：`\vec a·\vec b=0` 意味着 `\vec a⊥\vec b`（或其中之一为零向量），**不是** `\vec a=\vec 0` 或 `\vec b=\vec 0`；`\vec a×\vec b=\vec 0` 意味着 `\vec a∥\vec b`，同样**不是**「有零因子」。
- **交换向量积因子不变号**：`\vec a×\vec b=-(\vec b×\vec a)`。展开 `(\vec a+\vec b)×(\vec a−\vec b)` 时若漏掉符号，会得到 `\vec 0` 而不是 `−2\vec a×\vec b`。同时**向量积没有结合律**，`(\vec a×\vec b)×\vec c≠\vec a×(\vec b×\vec c)`（(1.10-1) 与 (1.10-2) 结果不同）。
- **在仿射坐标系里套直角坐标公式**：`\vec a·\vec b=X₁X₂+Y₁Y₂+Z₁Z₂`、`|\vec a|=√(X²+Y²+Z²)`、`\vec a×\vec b` 的行列式公式**都只在直角标架下成立**。仿射标架下必须带上 `\vec e_i·\vec e_j`，度量问题应先把坐标系换成直角坐标系。
- **忽略零向量与方向不定**：涉及共线、共面、夹角、射影的命题若含零向量需单独讨论（如 `\vec a×\vec b=\vec 0` 允许 `\vec a` 或 `\vec b` 为零向量）。
- **共线判定的分母问题**：定理1.5.4 的比例式 `X₁/X₂=Y₁/Y₂=Z₁/Z₂` 只是「分母为零时分子也为零」约定下的简写；严格做法是写成两两交叉乘积相等，或直接用 `\vec a×\vec b=\vec 0`。
- **混淆混合积与坐标三元组**：`(\vec a,\vec b,\vec c)` 是数，**与因子次序有关**（对调变号）；`{X,Y,Z}` 是坐标。用行列式写混合积时，三行的次序就是因子的次序。

## Reference Tables / 速查表

**四种乘法（直角坐标系 `{O;\vec i,\vec j,\vec k}`）**

| 运算 | 记号 | 结果 | 几何意义 | 坐标式 |
|---|---|---|---|---|
| 数量积 | `\vec a·\vec b` | 数 | `|\vec a||\vec b|\cos θ`；射影 | `X₁X₂+Y₁Y₂+Z₁Z₂` |
| 向量积 | `\vec a×\vec b` | 向量 | 平行四边形面积，右手系 | `\|i j k; X₁Y₁Z₁; X₂Y₂Z₂\|` |
| 混合积 | `(\vec a,\vec b,\vec c)` | 数 | 平行六面体**带符号**体积 | `\|X₁Y₁Z₁; X₂Y₂Z₂; X₃Y₃Z₃\|` |
| 双重向量积 | `(\vec a×\vec b)×\vec c` | 向量 | 与 `\vec a,\vec b` 共面且 ⊥`\vec c` | `(\vec a·\vec c)\vec b−(\vec b·\vec c)\vec a` |

**判定表**

| 要判定的性质 | 向量条件 | 坐标条件 |
|---|---|---|
| 两向量共线 | `\vec a×\vec b=\vec 0`（等价：线性相关） | `X₁:X₂=Y₁:Y₂=Z₁:Z₂` |
| 两向量垂直 | `\vec a·\vec b=0` | `X₁X₂+Y₁Y₂+Z₁Z₂=0` |
| 三向量共面 | `(\vec a,\vec b,\vec c)=0`（等价：线性相关） | 3 阶行列式 = 0 |
| 三点共线 | `\overrightarrow{AB}×\overrightarrow{AC}=\vec 0` | 两行成比例 |
| 四点共面 | `(\overrightarrow{AB},\overrightarrow{AC},\overrightarrow{AD})=0` | 4 阶（末列全 1）行列式 = 0 |
| 面积 | 平行四边形面积 `=\|\vec a×\vec b\|`；三角形 `S_△=½\|\vec a×\vec b\|` | 同一行列式开方 |
| 体积与高 | 体积 `V=(\vec a\vec b\vec c)`（带号），四面体 `⅙|(\vec a\vec b\vec c)|`；高 `h=S/|\vec a|` 或 `h=3V/S_底` | 3 阶行列式 |

## 辅导书·学习辅导要点

> 据辅导书 §1.3「学习辅导」（PDF p0006–p0015，书 p2–p11）提炼：只收教材没讲透的**概念辨析**、**容易误用的推理**与**适当延伸**，教材正文已有的定义与定理不再重复。每条末括注小节。

1. **向量的定义可以改写成有向线段**（1.3.1）：「既有大小又有方向」直观，但「大小」「方向」本身模糊，数学上不便使用；教材于是用有向线段来表示向量，并说明线段的方向与长度分别就是向量的方向与大小。这实际上是等价的另一种定义——也可以直接把向量定义为有向线段，或定义为「有序点偶（起点, 终点）」，后者在某些问题里更好用。
2. **只有模能比大小，相等却与始点无关**（1.3.1）：方向没有大小之分，所以「`\vec a` 大于 `\vec b`」是**无意义**的，能比的只有模；而 `\vec a=\vec b` 只要求「模相等且方向相同」，与所取始点无关——这就是**自由向量**，也正是能把一组向量平移到同一始点作图的前提。解答里出现向量比大小，基本可断定是把向量当成了数。
3. **零向量的方向是「不定」而不是「没有」**（1.3.1）：零向量的方向「根据需要可以随意确定」。这句话是后面许多命题的兜底条款：它使 `\vec 0` 与任何向量共线、共面，也使 `\vec 0` 可视为与任何向量垂直（§1.7 定理1.7.1）。凡命题含零向量，都要问一句是否需要单独讨论。
4. **加法靠作图，三角不等式也靠作图**（1.3.2）：加法本身由几何作图定义，所以证交换律、结合律都回到作图。三角不等式 `||\vec a|−|\vec b|| ≤ |\vec a+\vec b| ≤ |\vec a|+|\vec b|` 的证明就是按「不共线 / 同向 / 反向」三种位置关系分别作图 1-1(1)(2)(3)：不共线时两端都严格，同向时右端取等，反向时左端取等，三式合并即得。凡遇「两向量之和」，先画图常常就看出路。
5. **减法不必另立体系**（1.3.2）：`\vec a−\vec b=\vec a+(−\vec b)`、`\vec a−(−\vec b)=\vec a+\vec b`，减法只是加法的逆运算。几何上，平行四边形 `OACB` 的两条对角线 `OC` 与 `BA` 恰好分别是 `\vec a+\vec b` 与 `\vec a−\vec b`——「和与差同框」（图1-2）是本章用得最多的一张图。
6. **平行四边形的两个特例要记牢**（1.3.2）：① `OA⊥OB` 时 `OACB` 变成矩形，两条对角线等长，即 `|OA+OB|=|OA−OB|`（和与差的模相等，常用来把模的不等式化为数量积等式）；② `|OA|=|OB|` 时 `OACB` 变成菱形，`OC` 与 `∠AOB` 的平分线同向，`BA` 与 `∠AOB` 的邻补角的平分线共线。第二条正是例 2 证法二的出发点：角平分线方向 = 两个单位向量之和。<!-- OCR存疑：图1-2 附近 OCR 记作「1° 当O⊥O时…|O|=|BI|」「2° 当|O|=|OB|时…」，符号全失；此处按「矩形对角线相等、菱形对角线平分角」重建，结论与教材一致 -->
7. **线性运算只负责仿射性质**（1.3.2）：三点共线、四点共面、三线共点、线段定比，这些只含「平行 / 比例 / 共点」的命题用线性运算处理就够；一旦涉及长度、角度、面积，就要等 §1.6–§1.9 的乘法运算。先分清是**仿射性质**还是**度量性质**，再决定用线性运算还是乘法运算。
8. **六个充要条件其实是一个形式**（1.3.2 的 1°–6°）：`M` 在直线 `AB` 上 ⟺ `\overrightarrow{OM}=λ\overrightarrow{OA}+μ\overrightarrow{OB}` 且 `λ+μ=1`；`M` 在平面 `ABC` 上 ⟺ 同类表达式且系数和为 1。三点共线、四点共面则把「系数和为 1」换成「系数和为 0 且不全为零」。再补上「系数非负」，就是线段上（5°）与三角形内（6°）的判据。证明套路统一：把 `\overrightarrow{AM}` 写成 `k\overrightarrow{AB}`（或 `k\overrightarrow{AP}`，`0≤k≤1`），再把 `k` 分配到各系数并逐一验证非负。
9. **标架是参考系，坐标系是映射**（1.3.3）：标架 `{O;\vec e₁,\vec e₂,\vec e₃}` 是「一个定点 + 三个不共面向量」；坐标系则是「空间的向量或点 ↔ 有序三数组」的**一一对应关系**，由标架决定、又反过来决定标架，二者紧密联系但概念不同。下一章的**球坐标系**与**柱坐标系**是另外两种这样的对应关系——同一个点，不同的三数组。与之并列的一层区别是：有向线段是向量的**几何表示**，坐标是**代数表示**，取坐标的全部收益就是「向量的运算变成数的运算」。
10. **用坐标法证仿射命题的范式**（1.3.3，教材 §1.4 例2）：取仿射标架 `{A;\overrightarrow{AB},\overrightarrow{AC},\overrightarrow{AD}}`，四面体的四顶点立即变成 `A(0,0,0), B(1,0,0), C(0,1,0), D(0,0,1)`，再用定比分点公式算出三组对边中点，发现全是 `(¼,¼,¼)`——「三条对边中点的连线交于一点且互相平分」就这样一行证完。凡是平行六面体、四面体上的仿射命题，都可照这个「把顶点取成基坐标」的模板做；此时取仿射标架即可，不必用直角坐标。
11. **两处「数能、向量不能」**（1.3.4）：① **不蕴含零因子**——`\vec a·\vec b=0` 只能得 `\vec a⊥\vec b`，`\vec a×\vec b=\vec 0` 只能得 `\vec a∥\vec b`，根子在定义里的 `cos`、`sin` 可以为零；② **消去律不成立**——`\vec a·\vec b=\vec a·\vec c` 只能得 `\vec a⊥(\vec b−\vec c)`，`\vec a×\vec b=\vec a×\vec c` 只能得 `\vec a∥(\vec b−\vec c)`。教材图 1-7 的直观解释是「同一射影对应一串向量」「同一高对应一串平行四边形」，值得记住。
12. **数量积管度量，向量积管面积**（1.3.4）：`|\vec a|=√(\vec a·\vec a)`、`cos∠(\vec a,\vec b)=(\vec a·\vec b)/(|\vec a||\vec b|)`、`\vec a·\vec b=0 ⟺ \vec a⊥\vec b` 三条把长度、角度、垂直全化成数，于是几何的**度量问题**归数量积；`S_{△ABC}=½|\overrightarrow{AB}×\overrightarrow{AC}|`、`\vec a×\vec b=\vec 0 ⟺ \vec a∥\vec b` 把**面积与平行**归向量积，遇上面积题优先用向量积，往往比数量积省事。
13. **坐标式只在直角标架下成立**（1.3.4）：`\vec a·\vec b=X₁X₂+Y₁Y₂+Z₁Z₂` 与叉积的行列式，都只用到了 `\vec i·\vec i=1`、`\vec i·\vec j=0`、`\vec i×\vec j=\vec k` 这组直角标架关系。换到仿射标架，展开式会留下 `(X₁Y₂+Y₁X₂)\vec e₁·\vec e₂` 这类交叉项（辅导书 p10 已完整写出），所以辅导书明确说：「计算数量积与向量积时总是采用直角坐标系」。顺带记住：单位向量的坐标就是它的方向余弦，`\vec a⁰={cos α,cos β,cos γ}`。
14. **三个向量相乘只有两种，且向量积没有结合律**（1.3.4）：混合积 `(\vec a\vec b\vec c)` 是**数**（平行六面体带符号体积、共面判据、右手/左手定号），双重向量积 `(\vec a×\vec b)×\vec c` 是**向量**，且一般 `(\vec a×\vec b)×\vec c≠\vec a×(\vec b×\vec c)`。好在双重向量积有展开公式，于是三个以上的向量相乘总可归结为三个向量相乘，不必再另立新运算。

## 辅导书·例题分析

> 据辅导书 §1.4（PDF p0016–p0027，书 p12–p23）精选 10 题：原书 例 1–例 8 全部收录，另补原书写在例 2 之后、只给提示的「题 2」「题 3」。编号沿用书上编号，按书页顺序排列。例 7 的收尾与例 8 的题面原先落在缺页 PDF p0027（书 p23）上，已重跑 OCR 补回并核对原文。

### 例 1（书 p12–13）· 三向量 `AM, BN, CP` 首尾相接成三角形的充要条件

**题目**：设 `M,N,P` 依次是 `△ABC` 的三边 `BC,CA,AB` 上的点。试求三向量 `\overrightarrow{AM},\overrightarrow{BN},\overrightarrow{CP}` 首尾连接正好构成一个三角形的条件。（书中 `λ,μ,γ` 可取任意实数，故实为三边所在直线上的点。）

**分析**：题眼是教材 §1.2 例 1——三向量首尾相接构成三角形 ⟺ 它们的和为零向量。于是问题变成：怎样把 `M,N,P` 的位置参数化，使和式化成基向量的线性组合再比较系数。位置用分比参数化最省事，这一步选对了，后面全是整理。

**解**：设 `\overrightarrow{AP}=λ\overrightarrow{AB}`，`\overrightarrow{BM}=μ\overrightarrow{BC}`，`\overrightarrow{CN}=γ\overrightarrow{CA}`。则
`\overrightarrow{AM}=\overrightarrow{AB}+μ\overrightarrow{BC}`，`\overrightarrow{BN}=\overrightarrow{BC}+γ\overrightarrow{CA}`，`\overrightarrow{CP}=\overrightarrow{CA}+λ\overrightarrow{AB}`。
三式相加，并注意 `\overrightarrow{AB}+\overrightarrow{BC}+\overrightarrow{CA}=\vec 0`，得
`\overrightarrow{AM}+\overrightarrow{BN}+\overrightarrow{CP}=λ\overrightarrow{AB}+μ\overrightarrow{BC}+γ\overrightarrow{CA}`。
故三向量构成三角形 ⟺ `λ\overrightarrow{AB}+μ\overrightarrow{BC}+γ\overrightarrow{CA}=\vec 0`。代入 `\overrightarrow{CA}=−(\overrightarrow{AB}+\overrightarrow{BC})` 得
`(λ−γ)\overrightarrow{AB}+(μ−γ)\overrightarrow{BC}=\vec 0`。
`A,B,C` 不共线 ⟹ `\overrightarrow{AB},\overrightarrow{BC}` 线性无关 ⟹ `λ−γ=0` 且 `μ−γ=0`，即 `λ=μ=γ`。

**答**：充要条件是 `λ=μ=γ`，即 `AP/AB=BM/BC=CN/CA`（三边按**同一个有向比**分割）。取 `λ=μ=γ=½` 即教材 §1.3 习题第 6 题「三中线向量构成三角形」。

**易错**：
- 漏用 `\overrightarrow{AB}+\overrightarrow{BC}+\overrightarrow{CA}=\vec 0`，把三项和当成一般线性组合硬解。
- 没有声明 `\overrightarrow{AB},\overrightarrow{BC}` 线性无关（即 `A,B,C` 不共线）就令系数为零——比较系数的合法性全靠这一句。
- `λ,μ,γ` 是**有向比**：`\overrightarrow{CN}=γ\overrightarrow{CA}` 的方向是 `C→A`，与习惯的 `A→C` 相反；`\overrightarrow{CA}=−(\overrightarrow{AB}+\overrightarrow{BC})` 的负号最容易漏。
- 题设只写「三边上的点」，但推导对 `λ,μ,γ` 为任意实数都成立（点可落在延长线上）；`0<λ=μ=γ<1` 才是三个内点。

### 例 2（书 p14–17）· 内心的向量表示（`O` 为空间任意一点）

**题目**：设 `I` 是 `△ABC` 的内心，`O` 是空间任意一点，`a,b,c` 分别为 `A,B,C` 所对的边长。求证
`\overrightarrow{OI}=(a\overrightarrow{OA}+b\overrightarrow{OB}+c\overrightarrow{OC})/(a+b+c)`。

**分析**：内心是两条角平分线的交点，题眼是**角平分线分对边的比** `BD/DC=c/b`。于是可以套「定比分点 + 分解唯一性」的通用框架：取 `AD`、`BE` 为两条角平分线，把 `I` 分别在 `AD`、`BE` 上写成定比分点，两条路径给出同一个向径，比较 `\overrightarrow{AB},\overrightarrow{BC}` 的系数解出分比。这是重心/内心/旁心/垂心/Ceva 点这一类题的**统一证法**（题 2、题 3 都是它的变体）。另有一条更短的单位向量路线，见「一题多解」。

**解（证法一：角平分线 + 两条路径 + 比较系数）**
设 `AD`、`BE` 分别是 `∠A`、`∠B` 的角平分线，`I=AD∩BE` 为内心。由角平分线性质
`BD/DC=c/b`，`CE/EA=a/c`，
故 `BD/BC=c/(b+c)`、`CE/CA=a/(a+c)`，于是
`\overrightarrow{AD}=\overrightarrow{AB}+[c/(b+c)]\overrightarrow{BC}`，`\overrightarrow{BE}=\overrightarrow{BC}+[a/(a+c)]\overrightarrow{CA}`。
设 `\overrightarrow{AI}=λ\overrightarrow{AD}`、`\overrightarrow{BI}=μ\overrightarrow{BE}`。由 `\overrightarrow{AI}−\overrightarrow{BI}=\overrightarrow{AB}` 及 `\overrightarrow{CA}=−(\overrightarrow{AB}+\overrightarrow{BC})` 得
`[λ+μa/(a+c)−1]\overrightarrow{AB}+[λc/(b+c)−μ+μa/(a+c)]\overrightarrow{BC}=\vec 0`。
`\overrightarrow{AB},\overrightarrow{BC}` 线性无关，两系数为零，解得
`λ=(b+c)/(a+b+c)`，`μ=(a+c)/(a+b+c)`。
代回 `\overrightarrow{AI}=λ\overrightarrow{AD}` 得 `\overrightarrow{AI}=[(b+c)\overrightarrow{AB}+c\overrightarrow{BC}]/(a+b+c)`，换成以 `O` 为起点：
`\overrightarrow{OI}−\overrightarrow{OA}=[(b+c)(\overrightarrow{OB}−\overrightarrow{OA})+c(\overrightarrow{OC}−\overrightarrow{OB})]/(a+b+c)`
`=[−(b+c)\overrightarrow{OA}+b\overrightarrow{OB}+c\overrightarrow{OC}]/(a+b+c)`，
移项（用 `1−(b+c)/(a+b+c)=a/(a+b+c)`）即得 `\overrightarrow{OI}=(a\overrightarrow{OA}+b\overrightarrow{OB}+c\overrightarrow{OC})/(a+b+c)`。证毕。

**一题多解（证法二：单位向量法）** 记 `\vec a⁰=\overrightarrow{BC}/a`、`\vec b⁰=\overrightarrow{CA}/b`、`\vec c⁰=\overrightarrow{AB}/c`，它们都是单位向量且 `a\vec a⁰+b\vec b⁰+c\vec c⁰=\vec 0`。角平分线 `AI` 的方向是 `\vec c⁰−\vec b⁰`（`AB` 与 `AC` 方向的两单位向量之和），故 `\overrightarrow{AI}=λ(\vec c⁰−\vec b⁰)`，同理 `\overrightarrow{BI}=μ(\vec a⁰−\vec c⁰)`。由 `\overrightarrow{AB}=\overrightarrow{AI}−\overrightarrow{BI}` 得
`μ\vec a⁰+λ\vec b⁰−(λ+μ−c)\vec c⁰=\vec 0`，
再用 `\vec c⁰=−(a\vec a⁰+b\vec b⁰)/c` 消去 `\vec c⁰`、比较 `\vec a⁰,\vec b⁰` 的系数，得
`aλ+(a+c)μ=ac`，`(b+c)λ+bμ=bc`，
解得 `λ=bc/(a+b+c)`、`μ=ac/(a+b+c)`，代回 `\overrightarrow{AI}=λ(\vec c⁰−\vec b⁰)` 即得同一结论。

**易错**：
- 角平分线定理的方向：`BD/DC=c/b`（对角边之比），写成 `b/c` 会让三处权重整体错位。
- 这里的 `a,b,c` 是**边长（数）**，不是向量；同一题里 `a` 与 `\vec a⁰` 并现，抄写时极易混淆。
- 比较系数前必须确认 `\overrightarrow{AB},\overrightarrow{BC}` 线性无关（`A,B,C` 不共线）；证法二中对应的是 `\vec a⁰,\vec b⁰` 线性无关。
- 最后移项要补上 `\overrightarrow{OA}` 的系数 `1−(b+c)/(a+b+c)` 才能收到 `a` 的权重，漏掉就得不出 `a\overrightarrow{OA}` 这一项。
- 把结论与「重心」对照：`a=b=c` 时内心公式退化为 `(\overrightarrow{OA}+\overrightarrow{OB}+\overrightarrow{OC})/3`，正是重心公式——可用来记形式。

### 题 2（书 p17；提示见书 p22）· 垂心的向量表示

**题目**：设 `H` 是 `△ABC` 的垂心，`O` 是空间任意一点，求证
`\overrightarrow{OH}=(\overrightarrow{OA}\tan A+\overrightarrow{OB}\tan B+\overrightarrow{OC}\tan C)/(\tan A+\tan B+\tan C)`。

**分析**：垂心是三条高线的交点，结构上与例 2（内心）**完全同型**：只要把「分对边的比」由角平分线定理换成高线给出的比。题眼是 `BD·\tan B=DC·\tan C`——在 `Rt△ABD` 与 `Rt△ACD` 中高 `AD` 是公共边，于是两个底角的正切就把对边分成了 `\tan C:\tan B`。例 2 的整套流程（两条线各写一次向径 → 比较基向量系数 → 解出分比）原样搬过来即可。（原书只给结论与两条提示，以下是把提示走完的完整过程。）

**解**：设 `AD⊥BC`、`BE⊥CA`，`H=AD∩BE`。由 `\tan B=AD/BD`、`\tan C=AD/DC` 得
`BD/DC=\tan C/\tan B`，故 `BD/BC=\tan C/(\tan B+\tan C)`；同理 `CE/CA=\tan A/(\tan A+\tan C)`。
以下记 `p=\tan B`、`q=\tan C`、`r=\tan A`，则
`\overrightarrow{AD}=\overrightarrow{AB}+[q/(p+q)]\overrightarrow{BC}`，`\overrightarrow{BE}=−[r/(r+q)]\overrightarrow{AB}+[q/(r+q)]\overrightarrow{BC}`（用了 `\overrightarrow{CA}=−(\overrightarrow{AB}+\overrightarrow{BC})`）。
设 `\overrightarrow{AH}=λ\overrightarrow{AD}`、`\overrightarrow{BH}=μ\overrightarrow{BE}`，由 `\overrightarrow{AH}−\overrightarrow{BH}=\overrightarrow{AB}` 比较 `\overrightarrow{AB},\overrightarrow{BC}` 的系数，得
`λ+μr/(r+q)=1`，`λq/(p+q)−μq/(r+q)=0`；
由第二式 `λ=μ(p+q)/(r+q)`，代回第一式得 `μ=(r+q)/(p+q+r)`、`λ=(p+q)/(p+q+r)`。
故 `\overrightarrow{AH}=[(p+q)\overrightarrow{AB}+q\overrightarrow{BC}]/(p+q+r)`，换成以 `O` 为起点：
`\overrightarrow{OH}−\overrightarrow{OA}=[−(p+q)\overrightarrow{OA}+p\overrightarrow{OB}+q\overrightarrow{OC}]/(p+q+r)`，
移项（用 `1−(p+q)/(p+q+r)=r/(p+q+r)`）得 `\overrightarrow{OH}=(r\overrightarrow{OA}+p\overrightarrow{OB}+q\overrightarrow{OC})/(p+q+r)`，即所要证的式子。证毕。

**一题多解**：把三条高线分对边的比一并写出：`BD:DC=\tan C:\tan B`、`CE:EA=\tan A:\tan C`、`AF:FB=\tan B:\tan A`，三者乘积为 1，正合 Ceva 条件。于是垂心就是下面「题 3」权重公式在 `λ:μ:ν=\tan B:\tan A:\tan C` 时的特例，一行即得。

**易错**：
- `\tan A+\tan B+\tan C=\tan A·\tan B·\tan C`（因 `A+B+C=π`），对非直角三角形不为零；**直角三角形**（某角正切无定义、垂心落在顶点）必须单独讨论，不能代公式。
- 钝角三角形的垂足落在边的**延长线**上，上述比要按**有向比**理解，否则 `BD/BC` 的符号无法处理。
- `BD/DC=\tan C/\tan B` 里两个正切的位置容易对调：角 `B` 对应的是 `BD`，故 `\tan B` 与 `BD` 配对。
- 换起点那一步要补 `\overrightarrow{OA}` 的系数 `1−(p+q)/(p+q+r)=r/(p+q+r)`，漏掉就得不到 `\tan A` 的权重。

### 题 3（书 p17；提示见书 p21–22）· Ceva 定理的向量形式（三线共点的权重公式）

**题目**：设 `△ABC` 的三边 `AB,BC,CA` 依次被分成 `AF:FB=λ:μ`、`BD:DC=ν:λ`、`CE:EA=μ:ν`。求证 `AD,BE,CF` 三线交于一点 `M`，且对任意点 `O` 有
`\overrightarrow{OM}=(μ\overrightarrow{OA}+λ\overrightarrow{OB}+ν\overrightarrow{OC})/(λ+μ+ν)`。
（这正是 Ceva 定理：`(BD/DC)(CE/EA)(AF/FB)=1` 是三线共点的充要条件；重心、内心、旁心、垂心都是它的特例。）<!-- OCR存疑：p21 原式 OCR 作「1/(λ+µ+ν)·(µ OA+λ OB+γ OC)」，「γ」系「ν」之误；分母与系数结构已用 Ceva 条件与例 2 的模板复核 -->

**分析**：证三线共点的标准套路（书 p22 提示）是「先求两线交点的向径对一组基的分解式，再验证第三条线也过这点」。本题用**先猜后验**：由 `D` 的定比分点写出 `\overrightarrow{OD}`，再把 `M` 写成 `AD` 上的定比分点，比较 `OA,OB,OC` 的系数定出分比 `t`；对 `BE`、`CF` 重复一次，得到同一个点。题眼是「三条线上的参数可以由同一组 `λ,μ,ν` 统一表达」。（原书只给结论与证明思路提示，以下为完整过程。）

**解**：由 `BD:DC=ν:λ` 得 `\overrightarrow{OD}=(λ\overrightarrow{OB}+ν\overrightarrow{OC})/(λ+ν)`。
设 `M` 在 `AD` 上，`\overrightarrow{AM}=t\overrightarrow{AD}`，则
`\overrightarrow{OM}=(1−t)\overrightarrow{OA}+t\overrightarrow{OD}=(1−t)\overrightarrow{OA}+[tλ/(λ+ν)]\overrightarrow{OB}+[tν/(λ+ν)]\overrightarrow{OC}`。
取 `1−t=μ/(λ+μ+ν)`，即 `t=(λ+ν)/(λ+μ+ν)`，于是 `tλ/(λ+ν)=λ/(λ+μ+ν)`、`tν/(λ+ν)=ν/(λ+μ+ν)`，故
`\overrightarrow{OM}=(μ\overrightarrow{OA}+λ\overrightarrow{OB}+ν\overrightarrow{OC})/(λ+μ+ν)`。
再把 `M` 写成 `BE` 上的点：由 `CE:EA=μ:ν` 得 `\overrightarrow{OE}=(ν\overrightarrow{OC}+μ\overrightarrow{OA})/(μ+ν)`，设 `\overrightarrow{OM}=(1−s)\overrightarrow{OB}+s\overrightarrow{OE}`，取 `s=(μ+ν)/(λ+μ+ν)`，整理后仍得上式（`\overrightarrow{OB}` 的系数为 `λ/(λ+μ+ν)`）。同法可验证 `M` 也在 `CF` 上。故三线共点，且向径分解式如上。证毕。
（Ceva 条件：`(BD/DC)(CE/EA)(AF/FB)=(ν/λ)(μ/ν)(λ/μ)=1`，与题设自动相容。）

**易错**：
- 定比分点的权重是**交叉**的：`BD:DC=ν:λ` 对应 `\overrightarrow{OD}=(λ\overrightarrow{OB}+ν\overrightarrow{OC})/(λ+ν)`（`B` 配 `λ`、`C` 配 `ν`）；写成「同边同配」就整体错位。
- `λ+μ+ν=0` 时公式无意义（退化情形）；题目默认 `λ,μ,ν` 使各分点存在且图形非退化。
- Ceva 条件「乘积为 1」是**充要**的：只证「共点 ⟹ 乘积为 1」或只证反方向，都只算做了一半。
- 三比值要按**有向比**处理，否则分点落在延长线时符号会错。

### 例 3（书 p18–19）· 四面体中的四点共面：基分解 vs 仿射坐标

**题目**：在四面体 `ABCD` 中，`E` 是棱 `AD` 的中点，`G` 是 `△BCD` 的重心，`F` 是 `AG` 上一点且 `AF=¾AG`。证明 `B,C,E,F` 四点共面。

**分析**：四点共面 ⟺ 三条向量共面。三条路都通：① 其中一条是另两条的线性组合（最省事）；② 混合积为零（书的证法一）；③ 3 阶行列式为零（书的证法二，本质是 ② 的坐标版）。题眼是 `AF=¾AG` 与重心式 `\overrightarrow{AG}=⅓(\overrightarrow{AB}+\overrightarrow{AC}+\overrightarrow{AD})`——把 `BC,BE,BF` 全部写成基 `{AB,AC,AD}` 的组合，问题就只剩一行计算。

**解（证法一：基分解）** 取 `{\overrightarrow{AB},\overrightarrow{AC},\overrightarrow{AD}}` 为空间的一组基（四面体保证它们不共面）。
`\overrightarrow{BC}=\overrightarrow{AC}−\overrightarrow{AB}`；
`\overrightarrow{BE}=\overrightarrow{AE}−\overrightarrow{AB}=½\overrightarrow{AD}−\overrightarrow{AB}`；
`\overrightarrow{AG}=⅓(\overrightarrow{AB}+\overrightarrow{AC}+\overrightarrow{AD})`，故
`\overrightarrow{BF}=¾\overrightarrow{AG}−\overrightarrow{AB}=−¾\overrightarrow{AB}+¼\overrightarrow{AC}+¼\overrightarrow{AD}`。
直接凑：`¼\overrightarrow{BC}+½\overrightarrow{BE}=¼(\overrightarrow{AC}−\overrightarrow{AB})+½(½\overrightarrow{AD}−\overrightarrow{AB})=−¾\overrightarrow{AB}+¼\overrightarrow{AC}+¼\overrightarrow{AD}=\overrightarrow{BF}`。
即 `\overrightarrow{BF}=¼\overrightarrow{BC}+½\overrightarrow{BE}`，三向量共面，故 `B,C,E,F` 四点共面。证毕。
（书的证法一不写这个组合式，而是算混合积 `(\overrightarrow{BC}×\overrightarrow{BE})·\overrightarrow{BF}`：把三向量在基 `{AB,AC,AD}` 下的坐标 `(−1,1,0)`、`(−1,0,½)`、`(−¾,¼,¼)` 排成三阶行列式得 0。行列式为 0 与「`\overrightarrow{BF}` 是 `\overrightarrow{BC},\overrightarrow{BE}` 的线性组合」是同一件事。）

**一题多解（证法二：仿射坐标法）** 取仿射坐标系 `{A;\overrightarrow{AB},\overrightarrow{AC},\overrightarrow{AD}}`，则
`A(0,0,0)`，`B(1,0,0)`，`C(0,1,0)`，`D(0,0,1)`，`E(0,0,½)`，`G(⅓,⅓,⅓)`，`F(¼,¼,¼)`。
于是 `\overrightarrow{BC}={−1,1,0}`、`\overrightarrow{BE}={−1,0,½}`、`\overrightarrow{BF}={−¾,¼,¼}`，而
`|−1 1 0; −1 0 ½; −¾ ¼ ¼| = −1·(0·¼−½·¼) − 1·((−1)·¼−½·(−¾)) = ⅛ − ⅛ = 0`，故三向量共面。
（F 的坐标：`\overrightarrow{AF}=¾\overrightarrow{AG}` 而 `A` 为原点，故坐标直接乘 `¾`。）

**易错**：
- 重心的向量式是 `\overrightarrow{AG}=⅓(\overrightarrow{AB}+\overrightarrow{AC}+\overrightarrow{AD})`（`G` 是 `△BCD` 的重心，以 `A` 为起点写），不是 `⅓(\overrightarrow{AC}+\overrightarrow{AD})`——漏掉 `AB` 等于把 `G` 当成平面上的点。
- 仿射标架下「重心坐标 = 顶点坐标的平均」仍然成立（仿射性质），但仿射坐标不能用来算长度、夹角，别顺手去算 `|BF|`。
- 证共面前必须声明 `\overrightarrow{BC},\overrightarrow{BE}` 不共线（或直接用行列式/混合积），否则只得到「线性相关」。
- `AF=¾AG` 是**长度比**，写成向量式要用 `\overrightarrow{AF}=¾\overrightarrow{AG}`，方向不能反。

### 例 4（书 p19–20）· 三道「由叉积/混合积判位置关系」的证明

**题目**：证明下列各题：
(1) 若 `\vec a` 与 `\vec b` 不共线，则 `\vec a×(\vec a×\vec b)` 与 `\vec b×(\vec a×\vec b)` 也不共线；
(2) 若 `\vec a,\vec b,\vec c` 不共面，则 `\vec a×\vec b, \vec b×\vec c, \vec c×\vec a` 也不共面；
(3) 若 `\overrightarrow{OA}×\overrightarrow{OB}+\overrightarrow{OB}×\overrightarrow{OC}+\overrightarrow{OC}×\overrightarrow{OA}=\vec 0`，则 1° `\overrightarrow{OA},\overrightarrow{OB},\overrightarrow{OC}` 共面；2° `A,B,C` 三点共线。

**分析**：三小题做的是同一件事——把**几何位置关系**翻译成**叉积/混合积是否为零**：(1) 不共线 ⟺ 其叉积 `≠\vec 0`；(2) 不共面 ⟺ 其混合积 `≠0`；(3) 的条件是一个向量等式，而「向量和为零」**不能逐项判零**，标准手法是**两边点乘第三个向量**，把它挤成混合积。(3) 的 1° 与 2° 分工很漂亮：1° 用 `OA,OB,OC` 自身的混合积，2° 则把 `\overrightarrow{AB}×\overrightarrow{AC}` 展开成那三个叉积之和。

**解**
(1) 由双重向量积展开式：
`\vec a×(\vec a×\vec b)=(\vec a·\vec b)\vec a−\vec a²\vec b`，`\vec b×(\vec a×\vec b)=\vec b²\vec a−(\vec a·\vec b)\vec b`。
故
`[\vec a×(\vec a×\vec b)]×[\vec b×(\vec a×\vec b)]=[(\vec a·\vec b)\vec a−\vec a²\vec b]×[\vec b²\vec a−(\vec a·\vec b)\vec b]`
`=\vec a²\vec b²(\vec a×\vec b)−(\vec a·\vec b)²(\vec a×\vec b)=[\vec a²\vec b²−(\vec a·\vec b)²](\vec a×\vec b)`。
由 `\vec a,\vec b` 不共线得 `\vec a×\vec b≠\vec 0`，且 `\vec a²\vec b²−(\vec a·\vec b)²=(\vec a×\vec b)²>0`，故上式 `≠\vec 0`，两向量不共线。
(2) 先算一个恒等式。由 (1.10-1) 取 `u=\vec b, v=\vec c, w=\vec a×\vec b`，得
`(\vec b×\vec c)×(\vec a×\vec b)=[\vec b·(\vec a×\vec b)]\vec c−[\vec c·(\vec a×\vec b)]\vec b=−(\vec a\vec b\vec c)\vec b`（首项因 `\vec b·(\vec a×\vec b)=0` 消失），两边变号即 `(\vec a×\vec b)×(\vec b×\vec c)=(\vec a\vec b\vec c)\vec b`。于是
`(\vec a×\vec b, \vec b×\vec c, \vec c×\vec a)=[(\vec a×\vec b)×(\vec b×\vec c)]·(\vec c×\vec a)=(\vec a\vec b\vec c)·\vec b·(\vec c×\vec a)=(\vec a\vec b\vec c)²`。
`\vec a,\vec b,\vec c` 不共面 ⟹ `(\vec a\vec b\vec c)≠0` ⟹ 混合积 `≠0` ⟹ 三向量不共面。
(3) 1° 条件两边与 `\overrightarrow{OC}` 作数量积：
`(\overrightarrow{OA}×\overrightarrow{OB})·\overrightarrow{OC}+(\overrightarrow{OB}×\overrightarrow{OC})·\overrightarrow{OC}+(\overrightarrow{OC}×\overrightarrow{OA})·\overrightarrow{OC}=0`，
后两项各含两个 `\overrightarrow{OC}`，混合积为零，故 `(\overrightarrow{OA}\overrightarrow{OB}\overrightarrow{OC})=0`，三向量共面。
2° 展开 `\overrightarrow{AB}×\overrightarrow{AC}`：
`\overrightarrow{AB}×\overrightarrow{AC}=(\overrightarrow{OB}−\overrightarrow{OA})×(\overrightarrow{OC}−\overrightarrow{OA})=\overrightarrow{OB}×\overrightarrow{OC}−\overrightarrow{OB}×\overrightarrow{OA}−\overrightarrow{OA}×\overrightarrow{OC}`
`=\overrightarrow{OA}×\overrightarrow{OB}+\overrightarrow{OB}×\overrightarrow{OC}+\overrightarrow{OC}×\overrightarrow{OA}=\vec 0`
（其中 `−\overrightarrow{OB}×\overrightarrow{OA}=\overrightarrow{OA}×\overrightarrow{OB}`、`−\overrightarrow{OA}×\overrightarrow{OC}=\overrightarrow{OC}×\overrightarrow{OA}`，`\overrightarrow{OA}×\overrightarrow{OA}=\vec 0` 项不写）。于是 `\overrightarrow{AB}∥\overrightarrow{AC}`，`A,B,C` 三点共线。证毕。

**易错**：
- (1) 里 `\vec b×(\vec a×\vec b)=\vec b²\vec a−(\vec a·\vec b)\vec b`，与 `\vec a×(\vec a×\vec b)` 的形式**不同**（哪个因子在「中间位置」变了一个），照抄会差符号。
- (3)1° 不能由「三项之和为零」断言每项为零：**向量和为零不蕴含各项为零**，必须点乘 `\overrightarrow{OC}` 制造混合积。
- (3)2° 展开时 `−\overrightarrow{OB}×\overrightarrow{OA}` 与 `−\overrightarrow{OA}×\overrightarrow{OC}` 两处都是「反交换变号」，是本题唯一的手工风险。
- 1°「三向量共面」与 2°「三点共线」不等价：2° ⟹ 1°（`A,B,C` 共线时 `OA,OB,OC` 显然共面），反之不成立。
- (2) 的结论是 `(\vec a×\vec b, \vec b×\vec c, \vec c×\vec a)=(\vec a\vec b\vec c)²`，平方**恒非负**，这个式子本身值得记住。

### 例 5（书 p20–21）· 把代数条件翻译成向量语言（柯西–施瓦茨的等号条件）

**题目**：试用向量证明：
(1) 若 `(x²+y²+z²)(a²+b²+c²)=(ax+by+cz)²`，则 `x/a=y/b=z/c`；
(2) 若 `x²+y²+z²=1`、`a²+b²+c²=1`，则 `ax+by+cz≤1`。

**分析**：题眼是设 `\vec m={x,y,z}`、`\vec n={a,b,c}`，于是两题分别变成「`\vec m²\vec n²=(\vec m·\vec n)² ⟹ \vec m∥\vec n`」与「`|\vec m|=|\vec n|=1 ⟹ \vec m·\vec n≤1`」。前者是柯西–施瓦茨不等式的**等号条件**，靠 (1.8-7) `(\vec m×\vec n)²=\vec m²\vec n²−(\vec m·\vec n)²` 一步到位；后者就是柯西–施瓦茨本身。这类题的第一步永远是「认出哪两个向量」——左右两边分别是它们模的乘积与内积。

**解**
(1) 设 `\vec m={x,y,z}`、`\vec n={a,b,c}`。条件即 `\vec m²\vec n²−(\vec m·\vec n)²=0`。由 (1.8-7) 得
`(\vec m×\vec n)²=\vec m²\vec n²−(\vec m·\vec n)²=0`，
故 `\vec m×\vec n=\vec 0`，即 `\vec m∥\vec n`，其坐标成比例 `x/a=y/b=z/c`（按比例式的约定：分母为零时分子也为零）。
(2) 同样设 `\vec m,\vec n`，则 `|\vec m|=|\vec n|=1`，于是
`ax+by+cz=\vec m·\vec n=|\vec m||\vec n|cos∠(\vec m,\vec n)=cos∠(\vec m,\vec n)≤1`。证毕。

**易错**：
- (1) 用比例式书写时必须约定「分母为 0 时分子也为 0」，否则 `a=b=c=0` 时无意义；严格写法是交叉乘积 `xb=ya`、`yc=zb`。
- (2) 只得到 `ax+by+cz≤1`；若要 `|ax+by+cz|≤1`，还得用 `|cos θ|≤1`，两者不是一回事。
- 等号条件别只写「共线」：`ax+by+cz=1` 当且仅当 `\vec m=\vec n`（同向且模都为 1）。
- `\vec m²` 是 `\vec m·\vec m` 的简写，等于 `|\vec m|²`，不要与坐标分量平方和混淆（两者数值相等，但书写层级不同）。

### 例 6（书 p21–22）· 用面积公式求高与三角形面积的最值

**题目**：在 `△OAB` 中，`\overrightarrow{OA}=\vec β`，`\overrightarrow{OB}=\vec α`，`AD` 是 `OB` 边上的高（`D` 在直线 `OB` 上）。
(1) 求证 `S_{△ODA}=|\vec α·\vec β|·|\vec α×\vec β|/(2|\vec α|²)`；
(2) 当 `\vec α,\vec β` 的夹角 `θ∈(0, π/2)` 为何值时 `S_{△ODA}` 最大？

**分析**：`△ODA` 是直角三角形，`OD` 是 `\vec β` 在 `\vec α` 上的射影长、`AD` 是高，两者都能由数量积与向量积直接写出：同一个 `△OAB` 的面积两种算法 `S_{△OAB}=½|\vec α×\vec β|=½|\vec α||AD|` 给出高，`|\vec α·\vec β|=|\vec α||OD|` 给出底。题眼就是这条「同一个面积，两种算法」。

**解**
(1) 由 `S_{△OAB}=½|\vec α×\vec β|` 与 `S_{△OAB}=½|\vec α||AD|` 得 `|AD|=|\vec α×\vec β|/|\vec α|`。
又 `|\vec α·\vec β|=|\vec α||\vec β||cos θ|=|\vec α||OD|`，故 `|OD|=|\vec α·\vec β|/|\vec α|`。
于是 `S_{△ODA}=½|OD||AD|=|\vec α·\vec β|·|\vec α×\vec β|/(2|\vec α|²)`。
(2) 当 `0<θ<π/2` 时 `|\vec α·\vec β|=|\vec α||\vec β|cos θ`、`|\vec α×\vec β|=|\vec α||\vec β|sin θ`，代入 (1)：
`S_{△ODA}=[|\vec α|²|\vec β|²sin θcos θ]/(2|\vec α|²)=½|\vec β|²sin θcos θ=¼|\vec β|²sin 2θ`。
故当 `2θ=π/2`，即 `θ=π/4` 时面积最大，最大值为 `¼|\vec β|²`。

**易错**：
- `|\vec α·\vec β|` 的绝对值不能丢：`θ` 为钝角时 `\vec α·\vec β<0`，而长度必须非负。
- `|OD|=|\vec α·\vec β|/|\vec α|` 是**射影长**；`D` 落在 `OB` 的反向延长线上时 `OD` 与 `\vec α` 方向相反，比值要带符号理解。
- `sin θcos θ=½sin 2θ` 的系数是 `½`，与前面的 `½|\vec β|²` 合成 `¼`；最值点是 `2θ=π/2`，不要误写成 `θ=π/2`。
- 分母是 `|\vec α|²`（底边所在向量的模平方），不是 `|\vec β|²`；记法是「谁作底，谁的模作分母」。

### 例 7（书 p22–23）· 混合积版「克拉默法则」与对偶基上的展开

**题目**：设 `\vec a,\vec b,\vec c` 是三个不共面的向量，证明：
(1) 空间任意向量 `\vec r` 可表示为
`\vec r=[(\vec r\vec b\vec c)/(\vec a\vec b\vec c)]\vec a+[(\vec r\vec c\vec a)/(\vec a\vec b\vec c)]\vec b+[(\vec r\vec a\vec b)/(\vec a\vec b\vec c)]\vec c`；
(2) 向量方程组 `\vec a·\vec x=α, \vec b·\vec x=β, \vec c·\vec x=γ` 的解为
`\vec x=[γ(\vec a×\vec b)+α(\vec b×\vec c)+β(\vec c×\vec a)]/(\vec a\vec b\vec c)`。

**分析**：两小题是同一个技巧的正反两面。(1) 是「两边点乘一个叉积」，把另外两个未知系数打掉——这正是解线性方程组的**克拉默法则**；(2) 是把 `\vec x` 在**对偶基** `{\vec a×\vec b, \vec b×\vec c, \vec c×\vec a}` 上展开（由例 4(2) 它不共面），再用 `\vec c,\vec a,\vec b` 分别点乘提取系数。一句话记住：**要求某个系数，就点乘一个与其余基向量都垂直的向量**。

**解**
(1) 因 `\vec a,\vec b,\vec c` 不共面，`(\vec a\vec b\vec c)≠0`，且分解唯一，可设
`\vec r=λ\vec a+μ\vec b+ν\vec c`。
两边与 `\vec b×\vec c` 作数量积，注意 `(\vec b\vec b\vec c)=(\vec c\vec b\vec c)=0`，得
`(\vec r\vec b\vec c)=λ(\vec a\vec b\vec c)`，即 `λ=(\vec r\vec b\vec c)/(\vec a\vec b\vec c)`。
同理两边分别与 `\vec c×\vec a`、`\vec a×\vec b` 作数量积，得
`μ=(\vec r\vec c\vec a)/(\vec a\vec b\vec c)`，`ν=(\vec r\vec a\vec b)/(\vec a\vec b\vec c)`。代回即得 (1)。
(2) 由例 4(2)，`\vec a×\vec b, \vec b×\vec c, \vec c×\vec a` 不共面，故可设
`\vec x=λ(\vec a×\vec b)+μ(\vec b×\vec c)+ν(\vec c×\vec a)`。
分别与 `\vec c,\vec a,\vec b` 作数量积，利用 `(\vec a×\vec b)·\vec c=(\vec b×\vec c)·\vec a=(\vec c×\vec a)·\vec b=(\vec a\vec b\vec c)`、其余两项为零，得
`γ=\vec c·\vec x=λ(\vec a\vec b\vec c)`，`α=\vec a·\vec x=μ(\vec a\vec b\vec c)`，`β=\vec b·\vec x=ν(\vec a\vec b\vec c)`，
即 `λ=(\vec c·\vec x)/(\vec a\vec b\vec c)=γ/(\vec a\vec b\vec c)`、`μ=(\vec a·\vec x)/(\vec a\vec b\vec c)=α/(\vec a\vec b\vec c)`、`ν=(\vec b·\vec x)/(\vec a\vec b\vec c)=β/(\vec a\vec b\vec c)`，故方程组的解为
`\vec x=[γ(\vec a×\vec b)+α(\vec b×\vec c)+β(\vec c×\vec a)]/(\vec a\vec b\vec c)`。证毕。
<!-- 校核：本页首轮 OCR 漏页，已按重跑的 p0027 OCR 核对；(2) 收尾原文正作「λ=(c·x)/(abc)=γ/(abc)，μ=(a·x)/(abc)=α/(abc)，ν=(b·x)/(abc)=β/(abc)」，与上文一致 -->

**易错**：
- 第二个系数是 `(\vec r\vec c\vec a)` 而不是 `(\vec r\vec a\vec c)`——混合积对调因子要变号。
- (2) 中 `\vec x` 的展开基是三个**叉积**，不是 `\vec a,\vec b,\vec c`；点乘顺序 `(\vec c,\vec a,\vec b)` 与系数 `(γ,α,β)` 一一对应，顺序错则系数错位。
- 必须先说明 `(\vec a\vec b\vec c)≠0` 才能作除法；`\vec a×\vec b, \vec b×\vec c, \vec c×\vec a` 的不共面性要引用例 4(2)（或直接用 `(\vec a×\vec b, \vec b×\vec c, \vec c×\vec a)=(\vec a\vec b\vec c)²≠0`）。
- 自查方法：把解代回 `\vec a·\vec x`，三项中只有 `α(\vec b×\vec c)·\vec a` 存活，应得 `α`；`\vec b·\vec x`、`\vec c·\vec x` 同理。

### 例 8（书 p23–24）· 用向量导出球面三角形的余弦公式与正弦公式

**题目**：利用向量导出球面三角中的两个公式：
(1) 球面三角形**边的余弦公式**
`cos α=cos βcos γ+sin βsin γcos A`，`cos β=cos γcos α+sin γsin αcos B`，`cos γ=cos αcos β+sin αsin βcos C`；
(2) 球面三角形的**正弦公式**
`sin α/sin A=sin β/sin B=sin γ/sin C`，
其中 `α,β,γ` 是单位球面上的三角形的三条边（用弧度度量），`A,B,C` 依次为三边 `α,β,γ` 所对的角。

**分析**：球面三角形是球面上三段大圆弧构成的图形，边以弧度度量。球面三角形 `ABC` 对应三面角 `OABC`：**球面三角形边的弧度等于三面角相应的平面角的弧度**（图 1-16 中 `α=∠BOC`），而两边 `β,γ` 的夹角 `A` 就是二面角 `B-OA-C`。由于球面是**单位球面**，`\vec a=\overrightarrow{OA}`、`\vec b=\overrightarrow{OB}`、`\vec c=\overrightarrow{OC}` 都是单位向量，于是 `\vec a×\vec b` 与 `\vec a×\vec c` 的夹角恰与二面角 `B-OA-C` 的平面角相等，从而
`A=∠(\vec a×\vec b, \vec a×\vec c)`，同理 `B=∠(\vec b×\vec a, \vec b×\vec c)`、`C=∠(\vec c×\vec a, \vec c×\vec b)`。
这一句是全题的枢纽：**把球面角翻译成两个叉积的夹角**，于是余弦公式化为一次数量积，正弦公式化为一次叉积的模。

**解**
(1) 由 `|\vec a×\vec b|=sin∠(\vec a,\vec b)=sin γ`、`|\vec a×\vec c|=sin∠(\vec a,\vec c)=sin β`，得
`(\vec a×\vec b)·(\vec a×\vec c)=|\vec a×\vec b||\vec a×\vec c|cos∠(\vec a×\vec b,\vec a×\vec c)=sin γsin βcos A`。
另一方面，由拉格朗日恒等式（教材 (1.10-3)）：
`(\vec a×\vec b)·(\vec a×\vec c)=|\vec a·\vec a  \vec a·\vec c; \vec b·\vec a  \vec b·\vec c|=\vec a²(\vec b·\vec c)−(\vec a·\vec c)(\vec b·\vec a)`
`=cos∠(\vec b,\vec c)−cos∠(\vec a,\vec c)cos∠(\vec b,\vec a)=cos α−cos βcos γ`
（这里用 `|\vec a|=|\vec b|=|\vec c|=1`，故 `\vec a·\vec a=1`、`\vec b·\vec c=cos α`、`\vec a·\vec c=cos β`、`\vec b·\vec a=cos γ`）。两式相等：`sin γsin βcos A=cos α−cos βcos γ`，即
`cos α=cos βcos γ+sin γsin βcos A`。
同理（把 `\vec a,\vec b,\vec c` 轮换）得另两式 `cos β=cos γcos α+sin γsin αcos B`、`cos γ=cos αcos β+sin αsin βcos C`。
(2) 因 `A,B,C` 是两叉积的夹角，取模得
`|(\vec a×\vec b)×(\vec a×\vec c)|=|\vec a×\vec b||\vec a×\vec c|sin∠(\vec a×\vec b,\vec a×\vec c)=sin γsin βsin A`；
同理 `|(\vec b×\vec a)×(\vec b×\vec c)|=sin γsin αsin B`、`|(\vec c×\vec a)×(\vec c×\vec b)|=sin βsin αsin C`。
另一方面，用双重向量积公式把这三个叉积算出来：
`(\vec a×\vec b)×(\vec a×\vec c)=(\vec a\vec b\vec c)\vec a`，`(\vec b×\vec a)×(\vec b×\vec c)=−(\vec a\vec b\vec c)\vec b`，`(\vec c×\vec a)×(\vec c×\vec b)=(\vec a\vec b\vec c)\vec c`，
三者的模都等于 `|(\vec a\vec b\vec c)|`（因 `\vec a,\vec b,\vec c` 都是单位向量），故
`sin γsin βsin A=sin γsin αsin B=sin βsin αsin C`。
同除 `sin αsin βsin γ`（三边非退化，正弦不为零）即得
`sin α/sin A=sin β/sin B=sin γ/sin C`。证毕。
<!-- OCR/原文存疑（符号）：p24 原文把三个叉积写作 (a×b)×(a×c)=(abc)a、(b×a)×(b×c)=(abc)b、(c×a)×(c×b)=(abc)c。按四因子恒等式 (x×y)×(z×w)=[xyw]z−[xyz]w 复核，中间那个应为 −(abc)b（取 x=b,y=a,z=b,w=c 得 [bac]b=−(abc)b）。因下一步只取模，证明不受影响，此处按数学逻辑写作 −(abc)b。 -->

**易错**：
- 记号串位：球面公式里 `α,β,γ` 是**边（弧度）**、`A,B,C` 是**角**；平面三角里小写字母也是边，但球面公式中边直接等于中心角，写之前先把「边 = 平面角」这条对应关系对上。
- `A=∠(a×b, a×c)` 中两个法向量的**次序**决定取角还是取补角：把某个叉积的因子对调，夹角变成 `π−A`，余弦变号。本题 `B=∠(b×a,b×c)`、`C=∠(c×a,c×b)` 的写法正是为了与 `A,B,C` 一一对应，不要「顺手统一」成同一个次序。
- (2) 中 `(b×a)×(b×c)=−(abc)b`：原文写作 `(abc)b`，是符号丢失。取模之后结论不变，但**照抄时要知道这里差一个负号**，否则会怀疑自己的推导。
- 拉格朗日恒等式展开成本题只用一次，但下标容易错：`(a×b)·(c×d)=(a·c)(b·d)−(a·d)(b·c)`，取 `c=a, d=c` 才是 `(a·a)(b·c)−(a·c)(b·a)`。
- 最后一步除以 `sin αsin βsin γ` 需要三边不退化（球面三角形的边都非零）。做完可作**极限检验**：令三边都趋于 0，`cos α≈1−α²/2`，余弦公式退化为平面余弦定理 `α²=β²+γ²−2βγcos A`，说明没有漏掉高阶项和系数。
## Worked Example / 工作示例

**题目**（据教材 §1.9 例2 改写并补问高度）：已知四面体 `ABCD` 的顶点 `A(0,0,0)`、`B(6,0,6)`、`C(4,3,0)`、`D(2,−1,3)`。判断四点是否共面；若不共面，求体积 `V` 及顶点 `D` 到平面 `ABC` 的高 `h`。

**第 1 步：几何量化为向量（定理1.5.1）**
`\overrightarrow{AB}={6,0,6}`，`\overrightarrow{AC}={4,3,0}`，`\overrightarrow{AD}={2,−1,3}`。

**第 2 步：共面判定（定理1.9.2 + (1.9-4)）**
`(\overrightarrow{AB},\overrightarrow{AC},\overrightarrow{AD}) = |6 0 6; 4 3 0; 2 −1 3|`，按第一行展开：
`= 6·(3·3−0·(−1)) − 0·(4·3−0·2) + 6·(4·(−1)−3·2) = 6·9 + 6·(−10) = 54 − 60 = −6 ≠ 0`。
故三向量不共面，`A,B,C,D` 不共面。

**第 3 步：体积（定理1.9.1）** 平行六面体体积 `=|−6|=6`，四面体为其六分之一，故 `V=⅙·6=1`。

**第 4 步：高（定理1.8.6 + 定理1.8.1）**

`\overrightarrow{AB}×\overrightarrow{AC}=(0·0−6·3,\; 6·4−6·0,\; 6·3−0·4)=(−18,24,18)`，
`|\overrightarrow{AB}×\overrightarrow{AC}|=√(18²+24²+18²)=6√34`，底面积 `S=½·6√34=3√34`。由 `V=⅓Sh` 得

`h=3V/S=3/(3√34)=1/√34=√34/34≈0.171`。

**核验（两条独立路径）**
1. 平面 `ABC` 过 `A`，法向量取 `(−3,4,3)`（`\overrightarrow{AB}×\overrightarrow{AC}` 约去公因子 6），方程为 `−3x+4y+3z=0`：`B(6,0,6)` 代入得 `−18+18=0` ✓，`C(4,3,0)` 代入得 `−12+12=0` ✓。`D` 到它的距离 `|−6−4+9|/√34=1/√34`，与 `h` **一致** ✓。
2. 特例核验 (1.9-1)：取 `A(0,0,0),B(1,0,0),C(0,1,0),D(0,0,1)`，混合积 `=1`，`V=⅙` ✓；`h=3·⅙/(½)=1` ✓。

**方法提炼**：坐标 → 向量（定理1.5.1）→ 行列式（(1.9-4)）→ 体积/面积 → 高。四个顶点坐标已知时，「共面、体积、高、到平面的距离」都是同一个行列式的不同读法。

## 解题套路 / Solution Patterns

- **题型一：证明三点共线、三向量共面、四点共面。**
  识别特征：「共线」「共面」「线性表示」「线性相关」。
  步骤：① 把点化为向量（`\overrightarrow{AB}=\vec b−\vec a`）；② **向量法**——凑出 `λ\vec a+μ\vec b=\vec 0` 或 `λ\vec a+μ\vec b+ν\vec c=\vec 0`（系数不全为零），或用**坐标法**（定理1.5.4 比例式、定理1.5.5 三阶行列式、(1.5-7′) 四阶行列式）；③ 若还问「能否线性表示」，先判 `\vec a,\vec b` 是否线性无关，再用待定系数解方程。
  易错点：`\vec a,\vec b` 共线时表示不唯一（此时可能「不能表示」，如 §1.5 习题第 8(1) 题中 `\vec a={0,−1,2}` 与 `\vec b={0,2,−4}` 共线）。

- **题型二：用向量法证明平面/立体几何命题（中线共点、重心、内心、平行六面体）。**
  识别特征：命题只含「中点、重心、比例、共点、平行、等长」等**仿射性质**。
  步骤：① 取一组不共面向量作基（四面体取 `\overrightarrow{AB},\overrightarrow{AC},\overrightarrow{AD}`）；② 把题中每个向量写成基的线性组合；③ 由**分解唯一性**比较系数化为代数方程组；④ 解出系数回到几何结论。
  易错点：忘记声明基向量线性无关，导致无法比较系数。

- **题型三：求交点的分解式（待定系数法）。**
  识别特征：「把 `\overrightarrow{OP}` 分解成 `\vec a,\vec b` 的线性组合」，`P` 为两线交点。
  步骤：① 沿两条路径各写一次 `\vec p`（如 `\vec p=\overrightarrow{OM}+m\overrightarrow{MB}` 与 `\vec p=\overrightarrow{ON}+n\overrightarrow{NA}`）；② 整理成 `\vec a,\vec b` 的组合；③ 令对应系数相等解方程组；④ 回代。
  易错点：两条路径的参数必须用**不同字母**。范式（教材 §1.4 例1，`\overrightarrow{OM}=λ\vec a,\overrightarrow{ON}=μ\vec b`）：`\vec p=[λ(1−μ)/(1−λμ)]\vec a+[μ(1−λ)/(1−λμ)]\vec b`。

- **题型四：模、夹角、射影、方向余弦的坐标计算。**
  识别特征：给出坐标，求距离、夹角、射影、单位向量、方向余弦。
  步骤：① 两点相减得向量坐标；② 算 `|\vec a|,|\vec b|,\vec a·\vec b`；③ 代入 (1.7-10)(1.7-11)(1.7-12)(1.7-15)；④ 射影用 `射影_{\vec b}\vec a=(\vec a·\vec b)/|\vec b|`；⑤ 与两向量都垂直的单位向量用 `±(\vec a×\vec b)/|\vec a×\vec b|`。
  易错点：比较 `|\vec a+\vec b|` 与 `|\vec a−\vec b|` 应先**两边平方**；已知 `|\vec a|,|\vec b|,|\vec a+\vec b|` 求 `|\vec a−\vec b|` 用 `|\vec a+\vec b|²+|\vec a−\vec b|²=2(|\vec a|²+|\vec b|²)`（答案 §1.7 复习题：13,19,24 → 22）。

- **题型五：面积、体积、高。**
  识别特征：三角形/平行四边形面积、四面体体积、点到平面的距离、平行六面体体积。
  步骤：① `S_△=½|\overrightarrow{AB}×\overrightarrow{AC}|`；② 平行四边形面积 `=|\vec a×\vec b|`；③ 四面体 `V=⅙|(\overrightarrow{AB},\overrightarrow{AC},\overrightarrow{AD})|`；④ 高 `h=S/|\vec a|` 或 `h=3V/S_底`。
  易错点：体积漏除以 6；混合积为负时取绝对值，负号只表示左手系。

- **题型六：化简含双重向量积的向量恒等式。**
  识别特征：式中出现 `(\vec a×\vec b)×\vec c`、`(\vec a×\vec b)·(\vec c×\vec d)` 等。
  步骤：① 双重向量积用 (1.10-1)(1.10-2) 展开（认准「中间的向量」）；② 混合积用 (1.9-2)(1.9-3) 轮换或对调，**每次对调都变号**；③ 先把括号内的叉积降为 `(\vec a\vec b\vec d)\vec c−(\vec a\vec b\vec c)\vec d`，再点乘第三个因子；④ 按基向量线性无关比较系数。
  易错点：符号（本类题唯一的失分点）；记住 `(\vec a×\vec b,\vec b×\vec c,\vec c×\vec a)=(\vec a\vec b\vec c)²`。


## Key Takeaways / 关键结论

1. 向量由**模与方向**决定，与始点无关（自由向量）；向量之间只能比模，不能比大小；零向量方向不定，涉及它的命题要单独讨论。
2. **线性运算把几何代数化**：`\vec r=x\vec e₁+y\vec e₂+z\vec e₃` 就是坐标的定义；共线与共面分别等价于「线性相关」（定理1.4.6、1.4.7），这是全部判定的源头。
3. **判定的坐标化**：两向量共线看比例式或 `\vec a×\vec b=\vec 0`；三向量共面看 3 阶行列式为 0；四点共面看 (1.5-7′) 的四阶行列式。
4. **乘法的选择由所求量决定**：长度与夹角用数量积，面积与垂直方向用向量积，体积与共面用混合积；`(\vec a×\vec b)²+(\vec a·\vec b)²=\vec a²\vec b²` 是两族之间的换算器。
5. **一切坐标公式都以直角标架为前提**：`a·b=X₁X₂+Y₁Y₂+Z₁Z₂`、`|\vec a|=√(X²+Y²+Z²)`、向量积的行列式只在直角坐标系成立；仿射坐标系中仿射性质（共线、共面、定比）的结论不变，但度量公式必须重算。
6. 几何问题的通用流程是**取基 → 把一切向量写成线性组合 → 用分解唯一性比较系数**；计算问题的通用流程是**建直角坐标系 → 化为坐标 → 用行列式与数量积**。
7. 双重向量积展开式把三个以上向量的乘积归结为三向量的乘积，故向量代数中只需研究到三向量相乘为止。

## Connects To / 与其他章节的联系

- **向后（本章内部）**：§1.1–§1.3 线性运算 → §1.4 线性关系 → §1.5 坐标（线性运算变成数的运算）→ §1.6 射影（为 §1.7 的运算律作准备）→ §1.7–§1.10 四种乘法。辅导书把本章分成「线性运算 / 标架与坐标 / 乘法运算」三个单元。
- **向前（第 2 章 轨迹与方程）**：本章建立「点 ↔ 有序三数组」，第 2 章在此基础上建立「曲线、曲面 ↔ 方程」；本章的向径 `\overrightarrow{OP}` 就是那里向量函数 `\vec r(t)`、`\vec r(u,v)` 的原型。
- **向前（第 3 章 平面与空间直线）**：平面法向量、直线方向向量、点到平面的距离、异面直线的距离都由向量积与混合积直接给出；两直线共面判据就是 `(\overrightarrow{P₁P₂},\vec v₁,\vec v₂)=0`。
- **向前（第 4–6 章）**：柱面「缺元」的判别、二次曲线与二次曲面的化简都靠本章的坐标运算；化简所用的**不变量与特征根**正是把这些坐标式重新组合。
- **与线性代数**：线性相关/无关、基、坐标、线性组合就是向量空间与基在 `R³` 中的具体模型；混合积的行列式表示、分解式的克拉默法则，是行列式理论最直观的来源；第 5、6 章的二次型化简 ↔ 对称矩阵的特征值与主方向。教材结束语指出：把加法 1)–4)、数乘 5)–8)、数量积 9)–11) 公理化，得到的就是**欧几里得向量空间**。

## 辅导书·复习与测试（选）

> 题源：辅导书 §1.5（PDF p0028–p0030，书 p24–p26）。只给题目与答案要点，完整解答可对照本文件「Reference Tables / 速查表」与「解题套路」两节自查。

**1. 填空题（书 p25）**：已知 `\vec a={−1,2,1}`，`\vec b={0,1,1}`，求 `∠(\vec a,\vec b)`、以 `\vec a,\vec b` 为邻边的平行四边形的面积、与 `\vec a,\vec b` 均垂直的单位向量 `\vec c`。
> **答案要点**：`\vec a·\vec b=3`，`|\vec a|=√6`，`|\vec b|=√2` ⟹ `cos∠=3/(2√3)=√3/2`，`∠=π/6`；`\vec a×\vec b={1,1,−1}`，面积 `=|\vec a×\vec b|=√3`；`\vec c=±{1,1,−1}/√3`（**两个方向**，只写一个扣一半）。

**2. 填空题（书 p25）**：设 `|\vec a|=13`，`|\vec b|=19`，`|\vec a+\vec b|=24`，求 `|\vec a−\vec b|`。
> **答案要点**：平行四边形恒等式 `|\vec a+\vec b|²+|\vec a−\vec b|²=2(|\vec a|²+|\vec b|²)` ⟹ `576+x²=2(169+361)=1060` ⟹ `x²=484`，`|\vec a−\vec b|=22`。也可先由 `|\vec a+\vec b|²` 解出 `\vec a·\vec b=23`，再 `|\vec a−\vec b|²=530−46=484`——殊途同归，但前者更快。

**3. 填空题（书 p25）**：设三向量 `\vec a,\vec b,\vec c` 两两垂直，且 `|\vec a|=1, |\vec b|=2, |\vec c|=3`，求 `|\vec a+\vec b+\vec c|` 与 `|\vec a×\vec b+\vec b×\vec c+\vec c×\vec a|`。
> **答案要点**：两两垂直 ⟹ `|\vec a+\vec b+\vec c|²=1+4+9=14`，故 `|\vec a+\vec b+\vec c|=√14`。又 `\vec a×\vec b, \vec b×\vec c, \vec c×\vec a` 分别沿 `\vec c,\vec a,\vec b` 方向、模为 `2,6,3`，三者两两垂直，故和的模 `=√(4+36+9)=7`。（这道题与 §1.3 辅导书的例 2 是同一个模型：两两垂直时「模方相加」。）

**4. 计算题（书 p25–26）**：设平行四边形的对角线为 `\vec a=\vec m+2\vec n` 与 `\vec b=3\vec m−4\vec n`，而 `|\vec m|=1`，`|\vec n|=2`，`∠(\vec m,\vec n)=30°`，求该平行四边形的面积。
> **答案要点**：面积 `=½|\vec a×\vec b|`。展开 `\vec a×\vec b=(\vec m+2\vec n)×(3\vec m−4\vec n)=−4(\vec m×\vec n)+6(\vec n×\vec m)=−10(\vec m×\vec n)`；`|\vec m×\vec n|=1·2·sin30°=1`，故 `|\vec a×\vec b|=10`，面积 `=5`。**易错**：以对角线表示面积要乘 `½`（`S=½|d₁×d₂|`），直接写 `|a×b|` 会大一倍。

**5. 证明/计算题（书 p26）**：设 `(α×β)·γ=2`，求 `[(α+β)×(β+γ)]·(γ+α)` 的值。
> **答案要点**：先展开 `(α+β)×(β+γ)=α×β+α×γ+β×γ`（`β×β=0`），再与 `γ+α` 作数量积：六项中 `(α×β)·α`、`(α×γ)·γ`、`(α×γ)·α`、`(β×γ)·γ` 都因含重复因子而为零，只剩 `(α×β)·γ` 与 `(β×γ)·α`，而 `(β×γ)·α=(αβγ)=(α×β)·γ=2`，故结果为 `4`。**易错**：`(β×γ)·α` 是轮换 `(β,γ,α)`，**不变号**；若误作对调就会写成 `−2`。
