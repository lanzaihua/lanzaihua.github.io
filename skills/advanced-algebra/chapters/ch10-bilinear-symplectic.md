# 第10章 双线性函数与辛空间 (Bilinear Functions and Symplectic Spaces)

> 来源：《高等代数》第六版第10章 + 配套《高等代数辅导与习题解答》（第四版）+ 课堂课件（若有）。**本章无课件**（课件只到第9章），理论按教材节次、解法按辅导书习题编排。
> 本文件把「理论 · 习题解法 · 课堂重点」并成一份，做题时按第 7、8、9 节走。
> 习题解答（全题号答案 + 难题精解）：[solutions/ch10-solutions.md](../solutions/ch10-solutions.md)

## Core Idea / 核心思想

把内积的两个变量**分别**看待，就得到**双线性函数** $f(\alpha,\beta)$：固定一个变量，它对另一个线性。内积只是其中最特殊的一类（对称且正定）。放开这两个限制，得到**对称**双线性函数（对应二次型）与**反称**双线性函数（对应辛几何）。辛几何与欧氏几何截然不同，却是哈密顿力学、量子力学的数学语言；此外还顺带建立**对偶空间** $V^*$——线性泛函的家。

考试就考四件事：**求对偶基及其换基**（行向量写法下乘 $(C^{-1})^{\mathsf T}$）、**求度量矩阵并用合同 $C^{\mathsf T}AC$ 换基**、**判对称/反称/非退化**（反称靠极化刻画）、**辛空间的基本量**（维数必偶、迷向与拉格朗日、辛基、辛变换 $K^{\mathsf T}JK=J$ 与特征值成倒数对）。

## 本章地图 / Chapter Map

| 节 | 内容 | 一句话要点 | 对应习题 |
|---|---|---|---|
| §10.1 | 线性函数：定义、由基上的取值唯一决定（定理1） | 线性函数 = 广义的"取坐标" | 习题 1、2 |
| §10.2 | 对偶空间 $V^*$、对偶基、对偶基换基（定理2） | 原基乘 $C$，对偶基乘逆再转置 | 习题 3–10 |
| §10.3 | 双线性函数：度量矩阵、对称/反称、非退化、定理5/6、准欧氏 | 换基是**合同**不是相似 | 习题 11–17 |
| §10.4（标*） | 辛空间：辛基、迷向、拉格朗日、辛变换（定理8、11、12） | 维数必偶；$W\cap W^\perp$ 一般非零 | 习题 18 + 定理6 型 |

> 注：习题与节次的对应按题型归纳（辅导书第10章习题共 1–18、无补充题、术语与教材节次略带交叉），个别题跨节。

## Frameworks Introduced / 核心框架

- **线性函数（§10.1，定义1）**：$f:V\to P$ 满足 $f(k\alpha+l\beta)=kf(\alpha)+lf(\beta)$。
  - **定理1**：线性函数由它在一组**基上的取值**唯一决定——给定基 $\varepsilon_1,\dots,\varepsilon_n$ 与任意 $a_1,\dots,a_n\in P$，存在唯一线性函数使 $f(\varepsilon_i)=a_i$。
    - 与第7章"线性变换由基的像决定"结构完全一样：线性函数是值域为 $P$ 的特例。
  - 例：$f(x_1,\dots,x_n)=a_1x_1+\dots+a_nx_n$；矩阵的迹 $\operatorname{tr}(A)$；$P[x]$ 上的"在 $t$ 处取值" $L_t(p)=p(t)$。
- **对偶空间（§10.2，定义2）**：$V^*=L(V,P)$，$V$ 上全体线性函数构成的空间。
  - **定理2（核心）**：$\dim V^*=\dim V$；若 $\varepsilon_1,\dots,\varepsilon_n$ 是 $V$ 的基，则由 $f_i(\varepsilon_j)=\delta_{ij}$ 定义的 $f_1,\dots,f_n$ 是 $V^*$ 的基，称**对偶基**。
  - **对偶基的作用**：若 $\alpha=\sum x_i\varepsilon_i$，则 $f_i(\alpha)=x_i$——**取第 $i$ 个坐标**。
  - $V\cong V^*$ 但同构**依赖基**（不自然）；$V\cong V^{**}$ 才是自然同构（$\alpha^{**}(f)=f(\alpha)$）。
  - ★ **对偶基换基**：若 $(\alpha_1,\dots,\alpha_n)=(\varepsilon_1,\dots,\varepsilon_n)C$，则 $(g_1,\dots,g_n)=(f_1,\dots,f_n)(C^{-1})^{\mathsf T}$。用坐标式说：$g_j=\sum_k b_{kj}f_k$，其中 $(B)=(C^{-1})^{\mathsf T}$。**只写 $C^{-1}$ 是与列向量写法混用。**
- **双线性函数（§10.3，定义3）**：二元函数对两个变量分别线性。
  - 例：欧氏空间的内积；$f(X,Y)=X^{\mathsf T}AY$（$A$ 任意 $n$ 阶矩阵）。
  - **度量矩阵（定义4）**：在基 $\varepsilon_1,\dots,\varepsilon_n$ 下令 $a_{ij}=f(\varepsilon_i,\varepsilon_j)$，则 $f(\alpha,\beta)=x^{\mathsf T}Ay$。
  - ★ **换基公式**：若过渡矩阵为 $C$，则 $A'=C^{\mathsf T}AC$——**合同**，与第5章二次型完全一致。
- **对称与反称（§10.3，定义5、6）**：
  - **对称**：$f(\alpha,\beta)=f(\beta,\alpha)\iff$ 度量矩阵对称。
  - **反称**：$f(\alpha,\beta)=-f(\beta,\alpha)\iff A^{\mathsf T}=-A$。
    - 反称矩阵**主对角线必为 0**（$a_{ii}=-a_{ii}$）。
    - 特征 2 的域上反称 $=$ 对称；本章默认特征 $\ne2$。
  - ★ **极化刻画（习题13）**：特征 $\ne2$ 时，$f$ 反称 $\iff$ 对**一切** $\alpha$ 有 $f(\alpha,\alpha)=0$。
  - **定理5（对称 f 的规范形）**：存在基使 $f(\alpha,\beta)=d_1x_1y_1+\dots+d_nx_ny_n$。
    - 推论：复域上非退化对称 $f$ 可化为 $\sum x_iy_i$；实域上是准欧氏形 $\operatorname{diag}(1,\dots,1,-1,\dots,-1,0,\dots,0)$（惯性定理）。
  - **定理6（反称 f 的规范形）**：存在基使度量矩阵为
    $$\operatorname{diag}\Big(\begin{pmatrix}0&1\\-1&0\end{pmatrix},\dots,\begin{pmatrix}0&1\\-1&0\end{pmatrix},0,\dots,0\Big),$$
    即若干个二阶反称块加若干零。**推论：非退化反称只在偶数维存在。**
- **非退化双线性函数（§10.3，定义8）**：$f$ 非退化 $\iff$ 度量矩阵可逆（$\vert A\vert\ne0$）$\iff$ 若 $f(\alpha,\beta)=0$ 对一切 $\beta$ 成立则 $\alpha=0$（左核为零，右核同理）。
- **辛空间（§10.4）**：$V$ 上定义了**非退化反称**双线性函数，称 $(V,f)$ 为辛空间。
  - **维数必为偶数 $2n$**（由定理6 的规范形推出）——辛空间最显著的特征。
  - **辛正交基**：使度量矩阵为 $J=\begin{pmatrix}0&E\\-E&0\end{pmatrix}$ 的基。
  - **辛正交**：$f(\alpha,\beta)=0$——与欧氏正交含义不同。
  - **迷向子空间** $W$：$W\subseteq W^\perp$；辛空间中**每个向量都与自身辛正交**。
  - **拉格朗日子空间**：$2n$ 维辛空间中维数恰为 $n$ 的迷向子空间（极大迷向）。**定理8**：拉格朗日子空间的基可扩充为辛基。
- **辛变换（§10.4）**：保持辛结构（$f(\mathscr{A}\alpha,\mathscr{A}\beta)=f(\alpha,\beta)$）的线性变换。
  - 在辛基下矩阵 $K$ 满足 $K^{\mathsf T}JK=J$；$\vert K\vert=1$（保持体积）。
  - **定理11、12**：若 $\lambda$ 是辛变换的特征值，则 $\lambda^{-1}$ 也是（成倒数对，可离开单位圆）。
  - ★ **准欧氏空间与准正交变换**：$f$ 非退化对称、度量矩阵可化为 $D=\operatorname{diag}(E_p,-E_q)$；保持它的变换满足 $T^{\mathsf T}DT=D$，且若 $\alpha$ 是特征向量、$f(\alpha,\alpha)\ne0$，则对应特征值只能是 $\pm1$（习题18(3)；由 $f(T\alpha,T\alpha)=f(\alpha,\alpha)$ 得 $\lambda^2=1$）。

## Key Concepts / 核心概念

- **线性函数（线性泛函）**：$V\to P$ 的线性映射。
- **对偶空间 $V^*$**：全体线性函数构成的空间，$\dim V^*=\dim V$。
- **对偶基 $f_1,\dots,f_n$**：满足 $f_i(\varepsilon_j)=\delta_{ij}$。
- **双线性函数 $f(\alpha,\beta)$**：对每个变量分别线性。
- **度量矩阵 $A=(f(\varepsilon_i,\varepsilon_j))$**：$f(\alpha,\beta)=x^{\mathsf T}Ay$。
- **对称双线性函数**：$f(\alpha,\beta)=f(\beta,\alpha)$。
- **反称双线性函数**：$f(\alpha,\beta)=-f(\beta,\alpha)$，度量矩阵反称，主对角线为零。
- **非退化**：度量矩阵可逆。
- **辛空间 $(V,f)$**：非退化反称双线性函数 + 线性空间；维数必为偶数。
- **辛正交基**：度量矩阵为 $\begin{pmatrix}0&E\\-E&0\end{pmatrix}$。
- **迷向向量 / 迷向子空间**：$f(\alpha,\alpha)=0$；$W\subseteq W^\perp$。
- **拉格朗日子空间**：$2n$ 维辛空间中 $n$ 维的迷向子空间。
- **辛变换**：保持 $f$ 不变的线性变换；**准正交变换**：保持非退化对称 $f$ 的线性变换。

## Mental Models / 思维模型

- **线性函数是"广义的坐标提取器"。** 对偶基 $f_i$ 的作用就是取出第 $i$ 个坐标；所有线性函数都是坐标的线性组合。
- **对偶空间是"镜像空间"，但镜子放哪儿由你决定。** $V\cong V^*$ 依赖基的选择——这是"不自然同构"的经典例子，与 $V\cong V^{**}$（自然同构）对照。
- **双线性函数 = 内积的"去限制版"。** 内积 = 对称 + 正定；去掉正定得对称双线性函数（对应二次型）；去掉对称得反称双线性函数（对应辛几何）。
- **辛几何与欧氏几何是"镜像世界"。** 欧氏：只有零向量自正交，维数任意；辛：**每个**向量自正交，维数**必须偶数**，$W\cap W^\perp$ 一般非零。
- **反称矩阵的主对角线必须为零。** 这是 $f(\alpha,\alpha)=-f(\alpha,\alpha)$ 的直接后果，也是辛空间"没有长度概念"的代数根源。
- **辛变换的特征值成倒数对出现。** $\lambda$ 与 $\lambda^{-1}$ 同时是特征值——哈密顿力学中"相空间体积守恒"的代数影子。

## Anti-patterns & 疑难辨析 / Where Students Get Stuck

- **误区**：$V^*$ 的元素也是"向量"，可以和 $\varepsilon_i$ 一起做线性组合。
  **为什么错**：$V^*$ 的元素是**函数**，作用在向量上才出数。$(f_1,\dots,f_n)=(\varepsilon_1,\dots,\varepsilon_n)A$ 是类型错误。
  **正确**：基在一处，对偶基在另一处；写 $(g_1,\dots,g_n)=(f_1,\dots,f_n)B$。

- **误区**：$\alpha$ 的过渡矩阵是 $C$，对偶基的过渡矩阵也是 $C$。
  **为什么错**：$g_j(\alpha_i)=\delta_{ji}$ 逼出 $B=(C^{-1})^{\mathsf T}$；对偶基"往反方向走"。
  **正确**：原基乘 $C$，对偶基乘逆并转置（行向量写法）；写完随机取一个 $\alpha_i$ 验 $\delta$。

- **误区**：反称就是"主对角线全是 0"。
  **为什么错**：还要 $a_{ij}=-a_{ji}$。对角为零只是必要条件。
  **正确**：$A^{\mathsf T}=-A$ 是充要；特征 $\ne2$ 时也可用极化：对一切 $\alpha$ 有 $f(\alpha,\alpha)=0$。

- **误区**：$f(\alpha,\alpha)=0$ 说明 $\alpha=0$。
  **为什么错**：那是内积（正定）的特权。一般双线性函数有大量非零迷向向量；辛空间里**每个**向量都迷向。
  **正确**：$f(\alpha,\alpha)$ 不是长度平方；判迷向直接算。

- **误区**：$\dim W+\dim W^\perp=2n$，所以 $V=W\oplus W^\perp$。
  **为什么错**：维数等式不够，还要 $W\cap W^\perp=\{0\}$，即 $f\vert_W$ 非退化。辛空间里常见 $W\subseteq W^\perp$（拉格朗日）。
  **正确**：维数不给直和，非退化才给；判直和看交。

- **误区**：非退化反称也可以在奇数维上定义。
  **为什么错**：规范形是成对 $J_2$ 加零块，非退化时 $n=2r$。
  **正确**：辛空间维数必偶；题目给出奇数维 + 反称，先怀疑退化。

- **误区**：换基后度量矩阵按相似变换走。
  **为什么错**：度量矩阵是"二次型式"的对象，$A'=C^{\mathsf T}AC$（合同）；只有 $C$ 恰好正交时两者才重合。
  **正确**：度量矩阵认合同，不认相似。

- **误区**：辛变换是"保结构的正交类比"，特征值该在单位圆上。
  **为什么错**：正交变换才模为 1；辛变换是 $\lambda$ 与 $\lambda^{-1}$ **成对**，可离开单位圆（双曲型）。$\vert K\vert=1$ 只说行列式。
  **正确**：辛配倒数，不配共轭。

- **误区**：$V\cong V^*$ 是自然同构，随便挑一个。
  **为什么错**：它依赖基或依赖非退化 $f$（习题17 的 $\varphi$ 就依赖 $f$）；自然的只有 $V\cong V^{**}$。
  **正确**：$V\to V^*$ 挑过，$V\to V^{**}$ 不用挑。

- **误区**：把"对称"与"反称"的条件搞混。
  **为什么错**：对称是 $f(\alpha,\beta)=f(\beta,\alpha)$；反称是 $f(\alpha,\beta)=-f(\beta,\alpha)$。反称且对称 $\Rightarrow f\equiv0$（特征 $\ne2$）。
  **正确**：先算度量矩阵，再比 $A^{\mathsf T}$ 与 $A$：相等对称、等负反称。

- **误区**：看到"反称矩阵"主对角线有非零元，还继续往下算。
  **为什么错**：$a_{ii}=-a_{ii}$ 逼出 $a_{ii}=0$，对角非零说明前面某步符号或转置错了。
  **正确**：写完反称矩阵先扫一眼对角线，全零再往下。

## Procedures / 方法步骤

**求线性函数的表达式（习题1、2 型）**
1. 设 $f(\alpha)=a_1x_1+\dots+a_nx_n$（$x_i$ 为 $\alpha$ 在某基下的坐标）。
2. 把题目给的"$f(\alpha_i)=b_i$"逐个代入，得关于 $a_1,\dots,a_n$ 的线性方程组。
3. 解方程组；解的个数与 $\alpha_i$ 的秩有关。验算：代回原条件。

**求对偶基**
1. 给定 $V$ 的基 $\varepsilon_1,\dots,\varepsilon_n$。
2. 对每个 $i$ 定义 $f_i$ 满足 $f_i(\varepsilon_j)=\delta_{ij}$（定理1 保证存在唯一）。
3. 具体写出：若 $\alpha=\sum x_j\varepsilon_j$，则 $f_i(\alpha)=x_i$。
4. 换基时：$(\alpha)=(\varepsilon)C$ $\Rightarrow$ $(g)=(f)(C^{-1})^{\mathsf T}$，即 $g_j=\sum_k (C^{-1})_{kj}f_k$。

**求双线性函数的度量矩阵**
1. 取基 $\varepsilon_1,\dots,\varepsilon_n$。
2. 逐个算 $a_{ij}=f(\varepsilon_i,\varepsilon_j)$，排成 $A$。
3. 验算 $f(\alpha,\beta)=x^{\mathsf T}Ay$（取两个简单向量试）。
4. 换基：$A'=C^{\mathsf T}AC$；也可按定义重算 $\eta$ 基下的 $f(\eta_i,\eta_j)$，两者必须一致。

**判断双线性函数的类型与退化**
1. 求度量矩阵 $A$。
2. $A^{\mathsf T}=A$ → 对称；$A^{\mathsf T}=-A$ → 反称；都不满足 → 一般双线性函数。
3. 算 $\vert A\vert$：非零则非退化；为零则退化（此时找左核与右核）。

**化反称双线性函数为规范形（造辛基）**
1. 先验 $\vert A\vert\ne0$（退化时先把零块分出去）。
2. 取非零向量 $\varepsilon_1$（存在 $\beta$ 使 $f(\varepsilon_1,\beta)\ne0$，由非退化保证）。
3. 缩放令 $f(\varepsilon_1,\varepsilon_2)=1$，其中 $\varepsilon_2=\beta/f(\varepsilon_1,\beta)$。
4. 求 $W_1=L(\varepsilon_1,\varepsilon_2)$ 的辛正交补 $W_1^\perp=\{x:f(x,\varepsilon_1)=f(x,\varepsilon_2)=0\}$（维数减 2）。
5. 在 $W_1^\perp$ 上重复 2–4，直至只剩零块。结果：若干个 $\begin{pmatrix}0&1\\-1&0\end{pmatrix}$ 加若干零。

**判断子空间迷向 / 拉格朗日**
1. 取 $W$ 的一组基 $\alpha_1,\dots,\alpha_m$。
2. 算全部 $f(\alpha_i,\alpha_j)$；若度量矩阵是零矩阵，则 $W\subseteq W^\perp$，迷向。
3. 若 $\dim W=n$（在 $2n$ 维辛空间中），则是拉格朗日子空间，其基可扩为辛基（定理8）。

**判断辛变换 / 准正交变换**
1. 写在辛基下的矩阵 $K$，验证 $K^{\mathsf T}JK=J$（$J=\begin{pmatrix}0&E\\-E&0\end{pmatrix}$）。
2. 结论：$\vert K\vert=1$；特征值成倒数对；若 $\lambda=\pm1$ 之外还出现，注意成对。
3. 准正交：写 $D=\operatorname{diag}(E_p,-E_q)$，验 $T^{\mathsf T}DT=D$；若 $\alpha$ 是特征向量且 $f(\alpha,\alpha)\ne0$，则该特征值只能 $\pm1$（非迷向才成立，迷向方向不受此限）。

## 典型题精解 / Canonical Worked Problems

### 习题 3 — 换基后的对偶基（乘逆再转置）

**题目**：$\varepsilon_1,\varepsilon_2,\varepsilon_3$ 是基，$f_1,f_2,f_3$ 为其对偶基；$\alpha_1=\varepsilon_1-\varepsilon_3$，$\alpha_2=\varepsilon_1+\varepsilon_2+\varepsilon_3$，$\alpha_3=\varepsilon_2+\varepsilon_3$。证 $\alpha_i$ 是基，并求其对偶基（用 $f_i$ 表出）。

**解法**：

1. 过渡矩阵的**列**是 $\alpha_i$ 的坐标：$C=\begin{pmatrix}1&1&0\\0&1&1\\-1&1&1\end{pmatrix}$，$\vert C\vert=-1\ne0$，故 $\alpha_1,\alpha_2,\alpha_3$ 是基。
2. 设 $(g_1,g_2,g_3)=(f_1,f_2,f_3)B$，则 $g_j(\alpha_i)=(BC)_{ji}$。要求 $=\delta_{ji}$，故 $B=C^{-\mathsf T}$（行向量写法；若把对偶基写成列向量，则是 $C^{-1}$——**两种写法差一个转置**）。
3. 求 $C^{-1}=\begin{pmatrix}0&1&-1\\1&-1&1\\-1&2&-1\end{pmatrix}$（逐列解 $Cx=e_j$；可验 $CC^{-1}=E$），再转置得 $B=C^{-\mathsf T}=\begin{pmatrix}0&1&-1\\1&-1&2\\-1&1&-1\end{pmatrix}$。
4. 取 $B$ 的第 $j$ 列当系数：
$$g_1=f_2-f_3,\qquad g_2=f_1-f_2+f_3,\qquad g_3=-f_1+2f_2-f_3.$$
5. 验算（$f_k$ 取第 $k$ 个坐标）：$g_2(\alpha_1)=1-0+(-1)=0$，$g_2(\alpha_2)=1-1+1=1$，$g_2(\alpha_3)=0-1+1=0$。

**关键一步**：用 $g_j(\alpha_i)=\delta_{ji}$ 反推 $B$，不要逐个"凑"系数；凑法在小题上过关，基一变就崩。**先写对 $C$ 的列，再决定要不要转置。**

**易错**：① 误以为行向量也乘 $C^{-1}$（漏转置）；② 把 $C$ 的列写成行；③ 不验算——符号错了看不出。

### 习题 11 — 度量矩阵：按定义硬算，换基用合同

**题目**：$P^4$ 上 $f(X,Y)=3x_1y_2-5x_2y_1+x_3y_4-4x_4y_3$，基
$$\varepsilon_1=(1,-2,-1,0),\ \varepsilon_2=(1,-1,1,0),\ \varepsilon_3=(-1,2,1,1),\ \varepsilon_4=(-1,-1,0,1).$$
(1) 求 $f$ 在 $\varepsilon$ 下的度量矩阵；(2) 设 $(\eta_1,\dots,\eta_4)=(\varepsilon_1,\dots,\varepsilon_4)T$，求 $\eta$ 下的度量矩阵。

**解法**：

1. 先写标准基下的矩阵 $M$（$f(X,Y)=X^{\mathsf T}MY$）：
$$M=\begin{pmatrix}0&3&0&0\\-5&0&0&0\\0&0&0&1\\0&0&-4&0\end{pmatrix}.$$
2. 按定义逐对算 $a_{ij}=f(\varepsilon_i,\varepsilon_j)$（$f$ 无 $x_iy_i$ 项，对角元来自交叉项，如 $a_{11}=3\cdot1\cdot(-2)-5\cdot(-2)\cdot1=4$）。
3. 全部算完（也可用 $A=E^{\mathsf T}ME$ 统一算，$E$ 以 $\varepsilon_i$ 为列）：
$$A=\begin{pmatrix}4&7&-5&-14\\-1&2&2&-7\\0&-11&1&14\\15&4&-15&-2\end{pmatrix}.$$
4. 校验：$A$ 不对称（$a_{13}=-5\ne a_{31}=0$），也不反称（$a_{11}=4\ne0$），故 $f$ 是一般双线性函数。
5. (2) 用合同：$A_\eta=T^{\mathsf T}AT$；若题目要求"按定义算"，两法结果必须一致。

**关键一步**：16 个值老实算。$f$ 不对称时 $a_{ij}\ne a_{ji}$，**不能只算上三角**；每算 $a_{ij}$ 顺手算 $a_{ji}$ 对照。

**易错**：① 只算上三角；② 换基写成 $T^{-1}AT$（相似）；③ $T$ 的列序搞反。

### 习题 13 — 反称的等价刻画（极化）与"每向量迷向"

**题目**：设数域特征 $\ne2$，证明 $f$ 反称 $\iff$ 对一切 $\alpha\in V$ 有 $f(\alpha,\alpha)=0$。

**解法**：

1. 必要性：反称给 $f(\alpha,\alpha)=-f(\alpha,\alpha)$，即 $2f(\alpha,\alpha)=0$；特征 $\ne2$ 得 $f(\alpha,\alpha)=0$。
2. 充分性（极化）：对任意 $\alpha,\beta$ 把 $f$ 用在 $\alpha+\beta$ 上：
$$0=f(\alpha+\beta,\alpha+\beta)=f(\alpha,\alpha)+f(\alpha,\beta)+f(\beta,\alpha)+f(\beta,\beta)=f(\alpha,\beta)+f(\beta,\alpha).$$
3. 故 $f(\alpha,\beta)=-f(\beta,\alpha)$，$f$ 反称。
4. 推论：反称函数在任何基下度量矩阵对角元全为 0，每个向量都迷向——辛空间"没有长度"的代数根源。

**关键一步**：第 2 步的展开是全部要害：它把"对角信息"$f(\alpha+\beta,\alpha+\beta)$ 换成"交叉信息"$f(\alpha,\beta)+f(\beta,\alpha)$。看到"对一切 $\alpha$ 有某二次条件"，条件反射写这个展开。

**易错**：① 必要性丢掉"特征 $\ne2$"；② 展开漏 $f(\beta,\alpha)$；③ 把"对某个 $\alpha$ 成立"当成"对一切 $\alpha$"。

### 习题 17 — 非退化对称 $f$ 给出 $V\cong V^*$，并给出"对偶基的另一种取法"

**题目**：$f$ 是 $n$ 维 $V$ 上非退化对称双线性函数，$\alpha^*(\beta)=f(\alpha,\beta)$。(1) 证 $\alpha\mapsto\alpha^*$ 是 $V\to V^*$ 的同构；(2) 证对每组基 $\varepsilon_1,\dots,\varepsilon_n$ 存在唯一一组 $\varepsilon'_1,\dots,\varepsilon'_n$ 使 $f(\varepsilon_i,\varepsilon'_j)=\delta_{ij}$。

**解法**：

1. 线性：$\alpha^*(k\beta+l\gamma)=k\alpha^*(\beta)+l\alpha^*(\gamma)$，且 $\alpha^*\in V^*$。
2. 单射：若 $\alpha^*=0$，则 $f(\alpha,\beta)=0$ 对一切 $\beta$ 成立；由 $f$ 非退化得 $\alpha=0$。
3. 单射 + $\dim V=\dim V^*=n$ $\Rightarrow$ 同构（有限维时最省力的一步）。
4. (2) 存在性：令 $f_1,\dots,f_n$ 为 $\varepsilon$ 的对偶基，设 $\varphi(\alpha)=\alpha^*$，取 $\varepsilon'_j=\varphi^{-1}(f_j)$，则 $f(\varepsilon_i,\varepsilon'_j)=f_j(\varepsilon_i)=\delta_{ij}$。唯一性由 $\varphi$ 是单射。
5. 特例（17(3)）：复域上取度量矩阵 $\operatorname{diag}(d_1,\dots,d_n)$ 的基，令 $\eta_i=\varepsilon_i/\sqrt{d_i}$，则 $f(\eta_i,\eta_j)=\delta_{ij}$，即 $\eta_i=\eta'_i$。

**关键一步**：把"非退化"用在 $f(\alpha,\cdot)\equiv0$ 上换来单射，再靠维数相等升级为同构。**非退化一丢，核非零，结论全垮。**

**易错**：① 从"单射"直接跳"同构"却不写 $\dim V=\dim V^*$；② $\delta_{ij}$ 指标顺序（对称时才无所谓）；③ 把 $\varphi$ 叫"自然同构"——它依赖 $f$。

### 教材 §10.4 定理6（标*，辅导书未单列习题）— 造辛基与拉格朗日子空间

**题目**：$P^4$ 上 $f(X,Y)=x_1y_2-x_2y_1+x_1y_3-x_3y_1+x_3y_4-x_4y_3$。验证它是辛空间，求一组辛基，并举出一个拉格朗日子空间。

**解法**：

1. 标准基下
$$A=\begin{pmatrix}0&1&1&0\\-1&0&0&0\\-1&0&0&1\\0&0&-1&0\end{pmatrix},\qquad \vert A\vert=1\ne0.$$
$A^{\mathsf T}=-A$ 且 $\vert A\vert\ne0$，故 $f$ 非退化反称，$(P^4,f)$ 是 4 维辛空间。
2. 取 $\varepsilon_1=e_1$。$f(\varepsilon_1,e_2)=1$，令 $\varepsilon_2=e_2$，则 $f(\varepsilon_1,\varepsilon_2)=1$。
3. 求 $W_1=L(\varepsilon_1,\varepsilon_2)$ 的辛正交补：$W_1^\perp=\{x:f(x,e_1)=f(x,e_2)=0\}$，即 $x_1=0$ 且 $x_2+x_3=0$。
4. 在 $W_1^\perp$ 中取 $\varepsilon_3=(0,1,-1,0)$（可验 $f(\varepsilon_3,\varepsilon_1)=f(\varepsilon_3,\varepsilon_2)=0$）；再取 $\varepsilon_4=(0,0,0,-1)$，则 $f(\varepsilon_3,\varepsilon_4)=1$ 且 $\varepsilon_4\in W_1^\perp$。
5. 于是只有 $f(\varepsilon_1,\varepsilon_2)=f(\varepsilon_3,\varepsilon_4)=1$，其余全 0，度量矩阵为 $\operatorname{diag}\big(\begin{pmatrix}0&1\\-1&0\end{pmatrix},\begin{pmatrix}0&1\\-1&0\end{pmatrix}\big)$——按 $\varepsilon_1,\varepsilon_2,\varepsilon_3,\varepsilon_4$ 的次序它是两个二阶反称块（重排成 $(\varepsilon_1,\varepsilon_3,\varepsilon_2,\varepsilon_4)$ 即 $\begin{pmatrix}0&E\\-E&0\end{pmatrix}$ 形式），故是一组辛基。
6. 拉格朗日：由反称性 $f(\varepsilon_1,\varepsilon_1)=f(\varepsilon_3,\varepsilon_3)=0$ 且 $f(\varepsilon_1,\varepsilon_3)=0$，故 $L(\varepsilon_1,\varepsilon_3)$ 是 2 维迷向子空间，即拉格朗日；$L(\varepsilon_2,\varepsilon_4)$ 是另一个。

**关键一步**：第 3 步降维。取完一对辛基，$W_1^\perp$ 仍是辛空间（维数减 2），在它上面重复——定理6 的归纳法就这么多。不先算 $W_1^\perp$ 而想"凑"四个向量，会卡在四个未知数上。

**易错**：① 不先验 $\vert A\vert\ne0$（退化时根本造不出辛基）；② 把 $f(x,e_1)$ 与 $f(e_1,x)$ 混（差负号）；③ 以为 $L(\varepsilon_1,\varepsilon_2)$ 是拉格朗日——其上 $f=1\ne0$，**不迷向**。

### 教材 §10.3 例 — 混合型 $f$：判类型、拆成辛块与欧氏块

**题目**：$V=P^3$，标准基下 $f(X,Y)=x_1y_2-x_2y_1+x_3y_3$。求度量矩阵，判类型与非退化；若含辛结构，指出其辛部分与拉格朗日子空间。

**解法**：

1. 按 $a_{ij}=f(e_i,e_j)$ 算得
$$A=\begin{pmatrix}0&1&0\\-1&0&0\\0&0&1\end{pmatrix}.$$
2. 判类型：前 $2\times2$ 块反称，$a_{33}=1$，故 $A^{\mathsf T}\ne-A$、$A^{\mathsf T}\ne A$——既不对称也不反称，是**一般双线性函数**。
3. 判退化：$\vert A\vert=1\ne0$，非退化。
4. 它不是辛空间：辛空间要求 $f$ **既非退化又反称**，这里不反称（$f(e_3,e_3)=1$）。
5. 拆直和：$W_1=L(e_1,e_2)$ 上 $f$ 由 $\begin{pmatrix}0&1\\-1&0\end{pmatrix}$ 给出，非退化反称（二维辛空间）；$W_2=L(e_3)$ 上 $f$ 对称非退化（一维欧氏）；且 $f(W_1,W_2)=0$，故 $V=W_1\perp W_2$。
6. 拉格朗日：二维辛空间中每个一维子空间都迷向，$L(e_1)$、$L(e_2)$ 都是拉格朗日子空间（$e_3$ 不参与，因为它在正交的另一块里）。
7. 对照：若抹掉 $x_3y_3$ 项，$A=\begin{pmatrix}0&1\\-1&0\end{pmatrix}$，$(P^2,f)$ 才真正是辛空间。**多一个对称项就破坏辛结构。**

**关键一步**：先算 $(i,i)$ 元——只要某个 $f(e_i,e_i)\ne0$，立即断定"不反称、不是辛空间"，不用再算别的。然后按 $f$ 为零的块做直和分解，把问题降维。

**易错**：① 看到 $2\times2$ 反称块就宣布是辛空间（$a_{33}=1$ 打脸）；② 把 $L(e_1,e_2)$ 当拉格朗日（其上 $f\ne0$）；③ 非退化就以为"辛"——非退化只排除退化，不保证反称。

## 题型清单 / Problem-Type Index

| 题型 | 识别特征 | 首选方法 | 陷阱 |
|---|---|---|---|
| 求线性函数的表达式 | 给 $f$ 在若干向量上的值 | 化成 $f(\varepsilon_i)$ 的方程组解出 | 条件数与未知量不匹配 |
| 对偶基换基 | 给新基求对偶基 | $B=C^{-\mathsf T}$；$g_j=\sum_k(C^{-1})_{kj}f_k$ | 漏转置、用 $C$ |
| 线性函数存在性 | "存在 $f$ 使 $f(\alpha_i)\ne0$" | 零化子空间不是全空间（有限个真子空间覆盖不了） | 硬构造构造不出 |
| 验证双线性 | 给 $f(X,Y)$ | 分别对两个变量验线性 | 只验一个变量 |
| 求度量矩阵 | 给 $f$ 和基 | $a_{ij}=f(\varepsilon_i,\varepsilon_j)$ 全算 | 只算上三角（不对称时错） |
| 换基后度量矩阵 | 给过渡矩阵 $T$ | $A'=T^{\mathsf T}AT$（合同） | 用 $T^{-1}AT$（相似） |
| 判类型/退化 | 判对称、反称、非退化 | 比 $A^{\mathsf T}$ 与 $A$；算 $\vert A\vert$ | 只看对角元判反称 |
| 对称 $f$ 化标准形 | "找基使 $f$ 为规范形" | 配方法 / 合同变换 | 不分实域复域（惯性） |
| 反称 $f$ 化规范形 | "求辛基" | 取一对 $f=1$，降 2 维重复 | 不先验非退化；维数奇偶 |
| 迷向 / 拉格朗日 | "$W=W^\perp$" | 验 $f(\alpha_i,\alpha_j)$ 全零 | 用欧氏直觉认为 $W\cap W^\perp=0$ |
| 正交补维数 | 求 $\dim W^\perp$ | $\dim W+\dim W^\perp=2n$ | 忘直和还需 $f\vert_W$ 非退化 |
| 辛变换 | $K^{\mathsf T}JK=J$ | 验保 $f$；$\vert K\vert=1$；特征值成倒数对 | 与正交矩阵条件混淆 |
| 准欧氏 / 准正交 | $\operatorname{diag}(E_p,-E_q)$ | $T^{\mathsf T}DT=D$；**非迷向特征向量**的特征值 $\pm1$ | 忘"$f(\alpha,\alpha)\ne0$"这个前提 |
| 矩阵空间上的双线性函数 | $f(X,Y)=\operatorname{Tr}(X^{\mathsf T}AY)$ | 取 $E_{ij}$ 算，度量矩阵是分块 $a_{ij}E_n$ | 分块下标顺序 |

## Reference Tables / 速查表

**双线性函数的分类**

| 类型 | 条件 | 度量矩阵 | 规范形 |
|---|---|---|---|
| 对称 | $f(\alpha,\beta)=f(\beta,\alpha)$ | $A^{\mathsf T}=A$ | $\operatorname{diag}(d_1,\dots,d_n)$ |
| 反称 | $f(\alpha,\beta)=-f(\beta,\alpha)$ | $A^{\mathsf T}=-A$（对角为零） | $n$ 个 $\begin{pmatrix}0&1\\-1&0\end{pmatrix}$ + 零 |
| 一般 | 无对称性 | 任意 | 无简洁规范形 |

**欧氏空间 vs 辛空间**

| 项 | 欧几里得空间 | 辛空间 |
|---|---|---|
| 双线性函数 | 对称 + **正定** | **反称** + 非退化 |
| 维数 | 任意 | **必为偶数** |
| $f(\alpha,\alpha)$ | $\ge0$，仅 $\alpha=0$ 时为 0 | **恒为 0** |
| $W\cap W^\perp$ | $=\{0\}$ | 一般**非零** |
| 正交补维数 | $n$ 维空间中 $\dim W+\dim W^\perp=n$ | $2n$ 维空间中 $\dim W+\dim W^\perp=2n$ |
| 典型变换 | 正交变换 | 辛变换 |
| 变换矩阵条件 | $A^{\mathsf T}A=E$ | $K^{\mathsf T}JK=J$ |
| 特征值 | 模长为 1 | $\lambda$ 与 $\lambda^{-1}$ **成对** |
| 行列式 | $\pm1$ | **恒为 1** |

**对偶空间要点**

| 命题 | 内容 |
|---|---|
| 维数 | $\dim V^*=\dim V$ |
| 对偶基 | $f_i(\varepsilon_j)=\delta_{ij}$ |
| 对偶基的作用 | $f_i(\alpha)$ 是 $\alpha$ 的第 $i$ 个坐标 |
| 对偶基换基 | $(\alpha)=(\varepsilon)C$ $\Rightarrow$ $(g)=(f)(C^{-1})^{\mathsf T}$ |
| $V\cong V^*$ | 成立，但**依赖基**（不自然） |
| $V\cong V^{**}$ | 成立且**自然** |

**三套矩阵关系别混（本章与前后章的分工）**

| 关系 | 公式 | 出现处 |
|---|---|---|
| 相似 | $B=P^{-1}AP$ | 第7章线性变换、第8章 λ-矩阵 |
| 合同 | $B=C^{\mathsf T}AC$ | 第5章二次型、本章度量矩阵 |
| 等价（λ-矩阵） | $B=P(\lambda)A(\lambda)Q(\lambda)$ | 第8章 |

## 课堂重点与例题 / Lecture Focus & Examples

**本章无课件**（课件只到第9章）。替代信息：

- **题量分布**（辅导书第10章共 18 题、无补充题）：习题1、2 线性函数；习题3 对偶基换基；习题11 度量矩阵；习题13 反称的极化刻画；习题16 正交补与直和；习题17 非退化对称 $f$ 给出 $V\cong V^*$；习题18 准欧氏空间与准正交变换。教材 §10.4 辛空间**标***，辅导书未单列习题，但定理6（辛基存在）与定理8（拉格朗日扩充）仍是必会结论。
- **复习权重判断**：度量矩阵与合同换基是计算主项（习题11 型）；反称的极化刻画是证明主项（习题13 型）；对偶基换基是易错点（逆再转置）；辛空间只要会"验证 + 造一组辛基 + 找一个拉格朗日"。
- **常考合并题型**：给 $f$ 的坐标表达式 $\to$ 写度量矩阵 $\to$ 判类型与退化 $\to$ 换基化规范形；给辛空间 + 秩条件 $\to$ 判断子空间是否迷向/拉格朗日。
- **课堂提示（无课件时的自测）**：能否在 2 分钟内写出 $f(X,Y)=X^{\mathsf T}AY$ 的 $A$ 并判出反称；能否不查书复述"对偶基乘逆再转置"的理由。

## Key Takeaways / 关键结论

1. **线性函数由基上的取值唯一决定**（定理1），与第7章"线性变换由基的像决定"同构。
2. **$\dim V^*=\dim V$**；对偶基满足 $f_i(\varepsilon_j)=\delta_{ij}$，作用就是"取第 $i$ 个坐标"；换基乘 $(C^{-1})^{\mathsf T}$。
3. $V\cong V^*$ 依赖基（不自然）；$V\cong V^{**}$ 是自然同构。
4. 双线性函数的**度量矩阵**满足换基公式 $A'=C^{\mathsf T}AC$——**合同**，与二次型一致。
5. **对称**双线性函数可对角化（对应二次型）；**反称**双线性函数的规范形是若干 $\begin{pmatrix}0&1\\-1&0\end{pmatrix}$ 块（定理6）。
6. **辛空间 = 非退化反称双线性函数**；维数**必为偶数**；**每个向量都与自己辛正交**。
7. 辛空间的"正交补"与欧氏空间行为完全不同：$W\cap W^\perp$ 一般**非零**；$W=W^\perp$ 的情形即**拉格朗日子空间**。
8. 辛变换满足 $K^{\mathsf T}JK=J$，**行列式恒为 1**，特征值 $\lambda$ 与 $\lambda^{-1}$ **成对出现**（不要求模为 1）。
9. 反称的极化刻画 $f(\alpha,\alpha)\equiv0$ 是全部反称结论的起点——特征 $\ne2$ 时必须写上这个前提。

## Connects To / 与其他章节的联系

- **第5章 二次型**：对称双线性函数与二次型一一对应（$f(\alpha,\alpha)$ 就是二次型）；度量矩阵换基公式与二次型的合同变换完全相同，惯性定理由此共享。
- **第6章 线性空间**：对偶空间 $V^*$ 是一个新的线性空间；$V\cong V^*$ 用的正是第6章的同构理论。
- **第7章 线性变换**：线性函数是值域为 $P$ 的线性变换；辛变换、准正交变换都是特殊的线性变换（"由基的像决定"直接复用）。
- **第8章 λ-矩阵**：那一章用相似/等价分类矩阵，本章用合同——三套关系（相似、合同、等价）不能混，见 Reference Tables 末表。
- **第9章 欧几里得空间**：内积是"对称 + 正定"的双线性函数；欧氏空间与辛空间是双线性函数理论的两个极端分支，正交变换与辛变换的条件恰好一个用 $A^{\mathsf T}A=E$、一个用 $K^{\mathsf T}JK=J$。
- **相关 pattern**：patterns.md 的 **求对偶基**、**写度量矩阵 / 判双线性函数类型**、**辛基构造**、**判断先于计算**。
