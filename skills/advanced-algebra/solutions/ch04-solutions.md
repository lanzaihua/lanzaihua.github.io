# 第4章 矩阵 · 习题解答

> 题号按《高等代数辅导与习题解答》北大·第四版；第六版同节题目基本对应、个别增删。
> 记号：✓ = 答案经独立复核（证明题指结论成立且证明已复核）；? = 只给方法、答案从略；— = OCR 残缺或无法复核。

## 一、习题（第 1–30 题 + 补充题 1–12）

| 题号 | 题型 | 起手动作 | 答案 / 结论 |
|---|---|---|---|
| 1(1) | 矩阵乘法 | 按"行乘列"逐项算 | $AB=\begin{pmatrix}6&2&-2\\6&1&0\\8&-1&2\end{pmatrix}$，$AB-BA=\begin{pmatrix}2&2&-2\\2&0&0\\4&-4&-2\end{pmatrix}$ ✓ |
| 1(2) | 含参乘法 | 先乘再整理成 $a,b,c$ 的多项式 | ? OCR 公式残缺 |
| 2(1) | 方阵乘法 | 按定义逐项乘 | ? OCR 答案残缺 |
| 2(2) | 幂与转置 | 先算低次找规律 | ? OCR 题干残缺 |
| 2(3) | 幂 | 归纳或用二项式 | $\begin{pmatrix}1&1\\0&1\end{pmatrix}^{n}=\begin{pmatrix}1&n\\0&1\end{pmatrix}$ ✓ |
| 2(4) | 旋转矩阵的幂 | 归纳或用和角公式 | $\begin{pmatrix}\cos n\varphi&-\sin n\varphi\\ \sin n\varphi&\cos n\varphi\end{pmatrix}$ ✓ |
| 2(5) | 秩 1 矩阵 | 写成列向量乘行向量 | ? OCR 题干残缺 |
| 2(6) | 二次型的矩阵写法 | 展开 $x^{\mathrm T}Ax$ | $a_{11}x^2+2a_{12}xy+a_{22}y^2+2b_1x+2b_2y+c$ ✓ |
| 2(7) | 特殊方阵的幂 | 注意 $M=2E-J$，$M^2=4E$ | $M^{2k}=4^kE$，$M^{2k+1}=4^kM$ ✓ |
| 2(8) | 若尔当块的幂 | 归纳或用二项式定理 | $\begin{pmatrix}\lambda^n&n\lambda^{n-1}&\binom n2\lambda^{n-2}\\0&\lambda^n&n\lambda^{n-1}\\0&0&\lambda^n\end{pmatrix}$ ✓ |
| 3(1) | 矩阵多项式 | 代入 $f(\lambda)=\lambda^2-\lambda-1$ | $\begin{pmatrix}5&1&3\\8&0&3\\-2&1&-2\end{pmatrix}$ ✓ |
| 3(2) | 矩阵多项式 | 直接代入 | $O$（$f(A)=0$）✓ |
| 4(1) | 交换子 | 设 $X=(x_{ij})$ 解 $AX=XA$ | $\begin{pmatrix}x&y\\0&x\end{pmatrix}$ ✓ |
| 4(2) | 交换子 | 同上，解多元一次方程组 | ? OCR 答案残缺 |
| 4(3) | 交换子 | 用 $A^3=O$，$X$ 必为 $A$ 的多项式 | $\begin{pmatrix}x_{11}&x_{12}&x_{13}\\0&x_{11}&x_{12}\\0&0&x_{11}\end{pmatrix}$ ✓ |
| 5 | 交换子为对角 | 比较 $AB$ 与 $BA$ 的 $(i,j)$ 元 | $a_i\ne a_j\Rightarrow b_{ij}=0\ (i\ne j)$ ✓ |
| 6 | 准对角交换子 | 分块乘法，仿 5 题 | 只能准对角 ✓ |
| 7(1)(2)(3) | $E_{ij}$ 探针 | 算 $AE_{ij}$ 与 $E_{ij}A$ 并比较 | 结论：与 $E_{ij}$ 可交换 ⇒ 第 $i$ 列外/第 $j$ 行外为零且 $a_{ii}=a_{jj}$；与一切可交换 ⇒ $A=aE$ ✓ |
| 8 | 可交换的运算 | 用分配律与结合律直接验 | 结论成立 ✓ |
| 9 | $A^2=A$ 与 $B^2=E$ | 代 $A=\frac12(B+E)$ 展开 | $A^2=A\iff B^2=E$ ✓ |
| 10 | 实对称幂零 | 看 $A^2=A'A$ 的对角元 | 实对称且 $A^2=O\Rightarrow A=O$ ✓ |
| 11 | 对称性判据 | 两边取转置 | $AB$ 对称 $\iff AB=BA$ ✓ |
| 12 | 对称+反称分解 | 拆成 $\frac12(A+A')+\frac12(A-A')$ | 结论成立 ✓ |
| 13 | 范德蒙德的平方 | 把矩阵写成 $V^{\mathrm T}V$ | $\vert(a_{ij})\vert=\prod_{i<j}(x_i-x_j)^2$ ✓ |
| 14 | $AB=O$ 的判据 | 用 $B$ 的列是 $AX=0$ 的解 | 存在非零 $B$ 使 $AB=O\iff\vert A\vert=0$ ✓ |
| 15 | $AX=0$ 恒成立 | 取单位向量代入 | $A=O$ ✓ |
| 16 | 消去律 | 用 $C'B'=O$ 与 $\mathrm{rank}(C)=r$ | $BC=O\Rightarrow B=O$；$BC=C\Rightarrow B=E$ ✓ |
| 17 | 秩的次可加 | 列向量组并起来表出 | $\mathrm{rank}(A+B)\le\mathrm{rank}(A)+\mathrm{rank}(B)$ ✓ |
| 18 | 秩的下界 | $B$ 的列是 $AX=0$ 的解 | $AB=O\Rightarrow\mathrm{rank}(A)+\mathrm{rank}(B)\le n$ ✓ |
| 19 | 幂零的逆 | 直接验 $(E+A+\cdots+A^{k-1})(E-A)=E$ | $(E-A)^{-1}=E+A+\cdots+A^{k-1}$ ✓ |
| 20(1) | 二阶求逆 | 伴随公式或行列式 1 | $\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$ ✓ |
| 20(2) | 三阶求逆 | $(A\vert E)\to(E\vert A^{-1})$ | $\begin{pmatrix}0&\frac13&\frac13\\0&\frac13&-\frac23\\1&0&-1\end{pmatrix}$ ✓ |
| 20(5) | 特殊矩阵求逆 | 注意 $A^2=4E$ | $A^{-1}=\frac14A$ ✓ |
| 20(3)(4)(6)–(10) | 求逆 | 三角阵回代 / 分块求逆 | ? OCR 矩阵残缺 |
| 21 | 分块求逆 | 设 $X^{-1}$ 分块，乘出 $E$ | $X^{-1}=\begin{pmatrix}0&C^{-1}\\A^{-1}&0\end{pmatrix}$ ✓ |
| 22 | 循环矩阵求逆 | 看映射：$Xe_j=a_{j-1}e_{j-1}$ | $(X^{-1})_{i+1,i}=1/a_i\ (i<n)$，$(X^{-1})_{1,n}=1/a_n$ ✓ |
| 23(1) | 矩阵方程 | 左乘 $A^{-1}$ | $X=A^{-1}B=\begin{pmatrix}2&-23\\0&8\end{pmatrix}$ ✓ |
| 23(2)(3)(4) | 矩阵方程 | 对 $(A\vert B)$ 作行变换 | ? OCR 答案残缺 |
| 24(1)(2) | 逆的对称性 | 转置两边后取逆 | 可逆对称/反称矩阵的逆仍对称/反称 ✓ |
| 25(1)(2) | 三角矩阵 | 按定义算 $c_{ij}$ 或用分块归纳 | 三角阵之积、三角阵之逆仍是三角阵 ✓ |
| 26 | 伴随的行列式 | 用 $AA^*=\vert A\vert E$ | $\vert A^*\vert=\vert A\vert^{n-1}$ ✓ |
| 27 | 伴随的秩 | 分 $r=n,\ n-1,\ <n-1$ 三档 | $n;\ 1;\ 0$ ✓ |
| 28 | 分块求逆 | 用行变换或分块 $\begin{pmatrix}J&0\\0&J\end{pmatrix}$ | $A^{-1}=\frac14A$ ✓ |
| 29 | 分块行列式 | 造 $\begin{pmatrix}E_m&B\\A&E_n\end{pmatrix}$ 两种消元 | $\vert E_m-AB\vert=\vert E_n-BA\vert$ ✓ |
| 30 | 分块特征行列式 | 同 29 题，把 $E$ 换成 $\lambda E$ | $\vert\lambda E_n-AB\vert=\lambda^{n-m}\vert\lambda E_m-BA\vert$ ✓ |
| 补充题1 | 秩 1 分解 | 取非零行，其余行按比例写 | $A=uv^{\mathrm T}$，$A^2=kA$（$k=v^{\mathrm T}u$）✓ |
| 补充题2 | 二阶幂零 | 用秩 1 情形的 $A^2=kA$ | $A^2=O$ ✓ |
| 补充题3 | 秩等式 | 把 $A^2=E$ 写成 $(A+E)(A-E)=O$ | $\mathrm{rank}(A+E)+\mathrm{rank}(A-E)=n$ ✓ |
| 补充题4 | 秩等式 | $A(A-E)=O$，仿补充题 3 | $\mathrm{rank}(A)+\mathrm{rank}(A-E)=n$ ✓ |
| 补充题5 | 伴随的伴随 | 用 $(A^*)^{-1}$ 与 $\vert A^*\vert$ | $(A^*)^*=\vert A\vert^{n-2}A$ ✓ |
| 补充题6 | 分块行列式 | 用分块初等变换消去 $C$ | $\begin{vmatrix}A&B\\C&D\end{vmatrix}=\vert AD-CB\vert$（需 $AC=CA$、$\vert A\vert\ne0$）✓ |
| 补充题7 | 行变换化简 | 用极大无关组作倍加行变换 | 存在可逆 $P$ 使 $PAP^{-1}$ 的后 $n-r$ 行为零 ✓ |
| 补充题8 | 初等矩阵分解 | 用 $\begin{pmatrix}1&x\\0&1\end{pmatrix}$ 型矩阵连乘 | ? OCR 公式残缺 |
| 补充题9 | $P(i,j(k))$ 生成 | 归纳，用 $\vert A\vert=1$ 造出主元 1 | $\vert A\vert=1$ 时 $A$ 可写成此类初等矩阵之积 ✓ |
| 补充题10 | Sylvester 秩不等式 | 章内已讲 | ? 见章内典型题 |
| 补充题11 | 列满秩的刻画 | 用等价标准形 $\begin{pmatrix}E_r\\0\end{pmatrix}$ | $A$ 列满秩 $\iff A=P\begin{pmatrix}E_r\\0\end{pmatrix}$ ✓ |
| 补充题12 | 满秩分解 | 把标准形拆成两个因子 | $A=PQ$，$P$ 列满秩、$Q$ 行满秩 ✓ |

题量统计：习题 30 题（1、2、3、4、7、16、20、23、24、25 含多个小题）、补充题 12 题；OCR 题号完整（习题 1–30、补充题 1–12 均出现），但 1(2)、2(1)(2)(5)、4(2)、20(3)(4)(6)–(10)、23(2)(3)(4)、补充题 8 的题干或答案有残缺。

## 二、难题精解

### 习题4(3) — 与幂零若尔当块可交换的矩阵

**题目**：设 $A=\begin{pmatrix}0&1&0\\0&0&1\\0&0&0\end{pmatrix}$，求所有与 $A$ 可交换的矩阵。

**解**：
1. 设 $X=(x_{ij})$。先算 $AX$ 与 $XA$ 的 $(i,j)$ 元：
$$(AX)_{ij}=x_{i+1,j}\ (i<3),\quad (AX)_{3j}=0;\qquad (XA)_{ij}=x_{i,j-1}\ (j>1),\quad (XA)_{i1}=0.$$
2. 令 $AX=XA$。看第 3 行：$0=x_{3,j-1}\ (j\ge2)$，得 $x_{31}=x_{32}=0$；看第 1 列：$x_{i+1,1}=0$，得 $x_{21}=x_{31}=0$。
3. 其余位置：$x_{i+1,j}=x_{i,j-1}\ (1\le i\le2,\ j\ge2)$，即**沿对角线元素相等**：$x_{22}=x_{11}$，$x_{33}=x_{22}=x_{11}$，$x_{23}=x_{12}$。
4. 故全体解为
$$X=\begin{pmatrix}x_{11}&x_{12}&x_{13}\\0&x_{11}&x_{12}\\0&0&x_{11}\end{pmatrix},\qquad x_{11},x_{12},x_{13}\ \text{任意}.$$

**关键一步**：$A$ 的作用是"把每个基向量往左上挪一格、且 $Ae_1=0$"——所以 $AX=XA$ 等价于"$X$ 的元素沿对角线不变、对角线下全为零"。设元比较法最稳，别试图一眼看出答案。

**易错**：只算出 $x_{31}=x_{32}=x_{21}=0$ 就停（那只用了两个方程）；或忘记 $A^2\ne O$ 而以为 $X$ 必须对角。正确答案是**三个自由参数**，不是两个。

### 习题20(2) — 初等行变换求三阶逆矩阵

**题目**：求 $A=\begin{pmatrix}1&-1&1\\2&1&0\\1&-1&0\end{pmatrix}$ 的逆矩阵。

**解**：
1. 作分块矩阵 $(A\vert E)$，只做初等行变换，目标左半变 $E$：
$$\left(\begin{array}{ccc|ccc}1&-1&1&1&0&0\\2&1&0&0&1&0\\1&-1&0&0&0&1\end{array}\right).$$
2. 第 2 行减第 1 行的 2 倍，第 3 行减第 1 行：
$$\to\left(\begin{array}{ccc|ccc}1&-1&1&1&0&0\\0&3&-2&-2&1&0\\0&0&-1&-1&0&1\end{array}\right).$$
3. 第 3 行乘 $-1$；第 2 行加第 3 行的 2 倍后乘 $\frac13$；第 1 行减第 3 行，再加第 2 行：
$$\to\left(\begin{array}{ccc|ccc}1&0&0&0&\frac13&\frac13\\0&1&0&0&\frac13&-\frac23\\0&0&1&1&0&-1\end{array}\right).$$
4. 故 $A^{-1}=\begin{pmatrix}0&\frac13&\frac13\\0&\frac13&-\frac23\\1&0&-1\end{pmatrix}$。代回验证：$AA^{-1}=E$。

**关键一步**：从左到右逐列消成单位阵，每一步只用**行变换**；求逆允许行、列变换都做，但只用行变换最不容易把右半块弄脏。

**易错**：算到一半用列变换"救场"——列变换会把右半块的对应关系打乱；或忘记最后一步把主元除成 1。算完必须代回乘一次，30 秒的事。

### 习题22 — 循环矩阵的逆：用映射看

**题目**：设 $X=\begin{pmatrix}0&a_1&0&\cdots&0\\0&0&a_2&\cdots&0\\\vdots&&&\ddots&\vdots\\0&0&\cdots&0&a_{n-1}\\a_n&0&\cdots&0&0\end{pmatrix}$，$a_i\ne0$，求 $X^{-1}$。

**解**：
1. 把 $X$ 看成对基 $e_1,\dots,e_n$ 的作用：$Xe_j=a_{j-1}e_{j-1}\ (j\ge2)$，$Xe_1=a_ne_n$。
2. 逆作用就是把箭头全部反向、系数取倒数：$X^{-1}e_n=a_n^{-1}e_1$，$X^{-1}e_j=a_j^{-1}e_{j+1}\ (1\le j\le n-1)$。
3. 于是
$$X^{-1}=\begin{pmatrix}0&0&\cdots&0&1/a_n\\1/a_1&0&\cdots&0&0\\0&1/a_2&\cdots&0&0\\\vdots&&\ddots&&\vdots\\0&0&\cdots&1/a_{n-1}&0\end{pmatrix}.$$
4. 验证：$XX^{-1}e_j=e_j$ 与 $X^{-1}Xe_j=e_j$ 对所有 $j$ 成立，故互逆。

**关键一步**：不要硬算 $2\times2$ 分块（$2\times2$ 的四个块中有一个是标量、一个是 $(n-1)$ 阶方阵，容易写错），直接看"$X$ 把哪个基向量送到哪"——矩阵的每一列就是 $Xe_j$ 的坐标，逆矩阵就是把这些箭头反过来的矩阵。

**易错**：把 $a_n$ 的倒数放到 $(n,1)$（那只是 $X$ 的位置，逆里它跑到 $(1,n)$）；或忘记 $a_i\ne0$ 是逆存在的前提。

### 补充题6 — 分块行列式：$\vert AD-CB\vert$

**题目**：设 $A,B,C,D$ 都是 $n$ 阶矩阵，$\vert A\vert\ne0$，且 $AC=CA$。证明
$$\begin{vmatrix}A&B\\C&D\end{vmatrix}=\vert AD-CB\vert.$$

**解**：
1. 用分块初等变换消去左下角的 $C$：左乘 $\begin{pmatrix}E&0\\-CA^{-1}&E\end{pmatrix}$（其行列式为 1）：
$$\begin{pmatrix}E&0\\-CA^{-1}&E\end{pmatrix}\begin{pmatrix}A&B\\C&D\end{pmatrix}=\begin{pmatrix}A&B\\0&D-CA^{-1}B\end{pmatrix},$$
其中左下角用了 $CA^{-1}A=C$。
2. 取行列式：左边行列式 $=1\cdot$ 原行列式，右边 $=\vert A\vert\cdot\vert D-CA^{-1}B\vert$，故
$$\begin{vmatrix}A&B\\C&D\end{vmatrix}=\vert A\vert\,\vert D-CA^{-1}B\vert.$$
3. 用 $AC=CA$ 得 $CA^{-1}=A^{-1}C$，于是 $CA^{-1}B=A^{-1}CB$，从而
$$\vert A\vert\,\vert D-A^{-1}CB\vert=\vert A(D-A^{-1}CB)\vert=\vert AD-CB\vert.$$

**关键一步**：把 $C$ 消掉的矩阵必须是**行列式为 1** 的（对角块为 $E$），否则会引入额外因子；最后一步"把 $A$ 乘进括号"用的是 $\vert A\vert\vert X\vert=\vert AX\vert$，不是把 $A$ 硬乘到每一项。

**易错**：缺了 $AC=CA$ 就把 $CA^{-1}$ 换成 $A^{-1}C$（一般不可交换）；或把 $\vert A\vert\vert D-A^{-1}CB\vert$ 错算成 $\vert AD\vert-\vert CB\vert$（行列式对加法没有分配律）。

### 补充题3 — $A^2=E$ 的秩等式：上下夹逼

**题目**：设 $A$ 为 $n$ 阶矩阵，$A^2=E$。证明 $\mathrm{rank}(A+E)+\mathrm{rank}(A-E)=n$。

**解**：
1. 由 $A^2=E$ 得 $(A+E)(A-E)=O$。
2. 用习题 18（$PQ=O\Rightarrow\mathrm{rank}(P)+\mathrm{rank}(Q)\le n$）：$\mathrm{rank}(A+E)+\mathrm{rank}(A-E)\le n$。
3. 用习题 17（秩次可加）：$\mathrm{rank}(A+E)+\mathrm{rank}(A-E)\ge\mathrm{rank}\big((A+E)-(A-E)\big)=\mathrm{rank}(2E)=n$。
4. 两边夹，得等号。

**关键一步**：两个方向来自两个不同的工具——上界用"乘积为零"，下界用"和的秩不超过秩的和"。缺任何一边都只得到不等式；夹逼完才是等式。

**易错**：把 $\mathrm{rank}((A+E)-(A-E))$ 写成 $\mathrm{rank}(A+E)-\mathrm{rank}(A-E)$（秩没有减法！）；或把 $\mathrm{rank}(2E)$ 当成 1（$E$ 是 $n$ 阶，秩为 $n$）。

## 三、与章节的分工
- 本章理论/框架 / 方法步骤 / 题型清单 → `chapters/ch04-matrices.md`
- 本章典型题精解（6 题：7(3)、23(1)、28、17+18、27、补充题10）→ 同上文件的「典型题精解」
- 本节只补：**全题号答案索引 + 章节没细讲的题**（4(3)、20(2)、22、补充题 3/6）
