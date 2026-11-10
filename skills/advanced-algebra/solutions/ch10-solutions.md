# 第10章 双线性函数与辛空间 · 习题解答

> 题号按《高等代数辅导与习题解答》北大·第四版；第六版同节题目基本对应、个别增删。
> 记号：✓ = 答案经独立复核；? = 只给方法、答案从略；— = OCR 残缺或无法复核。

## 一、习题（第 1–18 题）

| 题号 | 题型 | 起手动作 | 答案 / 结论 |
|---|---|---|---|
| 1 | 求线性函数的表达式 | 设 $f(\varepsilon_i)=a_i$，列三个方程 | $f=4x_1-7x_2-3x_3$ ✓ |
| 2 | 构造线性函数 | 同上，反向解 $a_i$ | $f=x_2$ ✓ |
| 3 | 对偶基换基 | 写过渡矩阵 $C$，乘 $C^{-\mathsf T}$ | $g_1=f_2-f_3,\ g_2=f_1-f_2+f_3,\ g_3=-f_1+2f_2-f_3$ ✓ |
| 4 | 有限个真子空间不覆盖 | 对每个 $f_i$ 取零化子空间，用覆盖引理 | 存在 $\alpha$ 使所有 $f_i(\alpha)\ne0$ ✓ |
| 5 | 转到 $(V^*)^*$ | 用 $\alpha^{**}(f)=f(\alpha)$ 化回第 4 题 | 存在 $f$ 使所有 $f(\alpha_i)\ne0$ ✓ |
| 6 | 由积分泛函求对偶基 | 把三条积分值写成 $3\times3$ 方程组，逐列解 $e_j$ | $P_1=1+x-\frac32x^2$，$P_2=-\frac16+\frac12x^2$，$P_3=-\frac13+x-\frac12x^2$ ✓ |
| 7 | 欧氏空间 $V\cong V^*$ | 证线性、单射（内积非退化）、再用维数 | $\alpha\mapsto(\alpha,\cdot)$ 是 $V$ 到 $V^*$ 的同构 ✓ |
| 8 | 转置映射 | 定义 $A^*f=f\circ\mathscr{A}$，逐条验线性 | $A^*$ 是 $V^*$ 上线性变换；对偶基下矩阵为 $A^{\mathsf T}$ ✓ |
| 9 | 零化子空间 | 取 $V_1$ 的基扩充，造 $g_i$ 使 $g_i(\varepsilon_j)=\delta_{ij}$ | $W$ 是子空间；任一子空间都是某些线性函数的零化子空间 ✓ |
| 10 | 矩阵空间上的双线性函数 | 取 $E_{ij}$ 探针算 $f(E_{ij},E_{ks})$ | 双线性；度量矩阵为 $A\otimes E_n$；非退化 $\iff\vert A\vert\ne0$ ✓ |
| 11(1) | 求度量矩阵 | 逐对算 $f(\varepsilon_i,\varepsilon_j)$，$i,j=1..4$ | $\begin{pmatrix}4&7&-5&-14\\-1&2&2&-7\\0&-11&1&14\\15&4&-15&-2\end{pmatrix}$ ✓ |
| 11(2) | 合同换基 | 算 $T^{\mathsf T}AT$，与逐对重算对照 | $\begin{pmatrix}-6&46&8&24\\-18&26&16&-72\\-2&-38&0&0\\-6&86&0&0\end{pmatrix}$ ✓ |
| 12 | 复域对称 $f$ 的迷向向量 | 用定理5 规范形，令 $x_1^2+\dots+x_r^2=0$ | 1) 存在 $\xi\ne0$ 使 $f(\xi,\xi)=0$；2) 非退化时存在双曲对 $f(\xi,\eta)=1,\ f(\xi,\xi)=f(\eta,\eta)=0$ ✓ |
| 13 | 反称的极化刻画 | 展开 $f(\alpha+\beta,\alpha+\beta)$ | $f$ 反称 $\iff$ 对一切 $\alpha$ 有 $f(\alpha,\alpha)=0$ ✓ |
| 14 | 与 $K$ 全正交的 $\eta$ | 按 $f\vert_K$ 退化 / 非退化分两情形 | 存在 $0\ne\eta\in K+L(\xi)$ 使 $f(\eta,\alpha)=0$（$\forall\alpha\in K$）✓ |
| 15 | 正交补 | 先证 $K^\perp$ 是子空间，再用第 14 题 | $K^\perp$ 是子空间；$K\cap K^\perp=\{0\}\Rightarrow V=K+K^\perp$ ✓ |
| 16 | 非退化子空间的直和与传递 | 取 $K$、$K^\perp$ 的基，算分块对角矩阵 | $f\vert_K$ 非退化 $\Rightarrow V=K\oplus K^\perp$；$\vert C\vert=\vert A\vert\cdot\vert B\vert$，故 $f$ 在 $V$ 非退化 $\iff$ 在 $K$ 与 $K^\perp$ 上都非退化 ✓ |
| 17 | 非退化对称 $f$ 给出 $V\cong V^*$ | 证线性、单射，再用 $\dim V=\dim V^*$ | 1) 同构；2) 每组基有唯一对偶基 $\varepsilon'_j$；3) 复域上可取 $\eta_i=\eta'_i$ ✓ |
| 18 | 准欧氏空间与准正交变换 | 正交基下写度量矩阵 $D$，用 $T^{\mathsf T}DT=D$ | 1) 可逆且逆仍准正交；2) 乘积仍准正交；3) $f(\alpha,\alpha)\ne0$ 时特征值 $\pm1$；4) $T^{\mathsf T}DT=D$ ✓ |

题量统计：习题 18 题、补充题 0 题（本章无补充题）。OCR 缺：**无**（1–18 题全部出现，第 5、17 题的题号排版被 OCR 压掉，但正文完整）。第 18 题之后是全书「总习题解答」（题号 1–41+，跨章综合题），不属于本章，未列入本表。

## 二、难题精解（6 题）

### 习题 6 — 由积分泛函求对偶基：一次解三个方程组

**题目**：$V=P[x]_3$，对 $p(x)=c_0+c_1x+c_2x^2$ 定义
$$f_1(p)=\int_0^1 p\,dx,\qquad f_2(p)=\int_0^2 p\,dx,\qquad f_3(p)=\int_{0}^{-1} p\,dx.$$
求 $V$ 的一组基 $P_1,P_2,P_3$ 使 $f_i(P_j)=\delta_{ij}$。

**解**：

1. 先算三条泛函的坐标式：$f_1=c_0+\frac12c_1+\frac13c_2$，$f_2=2c_0+2c_1+\frac83c_2$，$f_3=-c_0+\frac12c_1-\frac13c_2$。
2. 写成矩阵（列是 $c_0,c_1,c_2$）：
$$M=\begin{pmatrix}1&\frac12&\frac13\\2&2&\frac83\\-1&\frac12&-\frac13\end{pmatrix},\qquad \vert M\vert=-2\ne0 .$$
3. 要求 $f_i(P_j)=\delta_{ij}$ 即 $M c^{(j)}=e_j$，故 $c^{(j)}$ 是 $M^{-1}$ 的第 $j$ 列：
$$M^{-1}=\begin{pmatrix}1&-\frac16&-\frac13\\1&0&1\\-\frac32&\frac12&-\frac12\end{pmatrix}.$$
4. 读出三个多项式：
$$P_1=1+x-\tfrac32x^2,\qquad P_2=-\tfrac16+\tfrac12x^2,\qquad P_3=-\tfrac13+x-\tfrac12x^2 .$$
5. 验算：$f_2(P_1)=2+2+(\frac83)(-\frac32)=0$，$f_2(P_2)=-\frac13+0+\frac43=1$，$f_3(P_3)=\frac13+\frac12+\frac16=1$，其余同理为 $0$。

**关键一步**：把"三条积分值"翻译成同一个 $3\times3$ 系数矩阵，再一次性解三个右端 $e_1,e_2,e_3$（即求 $M^{-1}$）——不要第一次解出 $P_1$ 就重算一遍方程组求 $P_2$。

**易错**：① $\int_0^{-1}$ 的符号（得 $-c_0+\frac12c_1-\frac13c_2$，与 $\int_0^1$ 差两个负号）；② 把 $M$ 的行列写反（$M$ 的第 $j$ 列才对应 $P_j$ 的系数）；③ 解完不验 $Mc^{(j)}=e_j$，符号错一个整组全错。

### 习题 10 — $\operatorname{Tr}(X^{\mathsf T}AY)$ 的度量矩阵：探针认出 Kronecker 结构

**题目**：$A$ 是 $P$ 上 $m$ 阶矩阵，在 $P^{m\times n}$ 上定义 $f(X,Y)=\operatorname{Tr}(X^{\mathsf T}AY)$。1) 证 $f$ 是双线性函数；2) 求它在基 $E_{11},\dots,E_{1n},E_{21},\dots,E_{mn}$ 下的度量矩阵。

**解**：

1. 双线性：由 $\operatorname{Tr}$ 的线性 $f(kX_1+lX_2,Y)=k f(X_1,Y)+l f(X_2,Y)$，另一变量同理。
2. 探针：取 $X=E_{ij}$，$Y=E_{ks}$。因 $\operatorname{Tr}(E_{ji}M)=M_{ij}$，故
$$f(E_{ij},E_{ks})=\operatorname{Tr}(E_{ji}AE_{ks})=(AE_{ks})_{ij}=a_{ik}\,\delta_{js}.$$
3. 按字典序把基排成 $(i,j)$（$i$ 块、$j$ 块内），则 $((i,j),(k,s))$ 位置的元素是 $a_{ik}\delta_{js}$——每个 $i,k$ 位置的 $n\times n$ 子块都是 $a_{ik}E_n$。
4. 故度量矩阵 $=A\otimes E_n$（Kronecker 积），阶数 $mn$。
5. 退化判据：$\vert A\otimes E_n\vert=\vert A\vert^{n}\vert E_n\vert^{m}=\vert A\vert^{n}$，故 $f$ 非退化 $\iff\vert A\vert\ne0$。

**关键一步**：用 $E_{ij}$ 当探针，把 $mn$ 个值一次性算成 $a_{ik}\delta_{js}$，再"认"出 Kronecker 结构。逐个矩阵对去算是下策。

**易错**：① 漏掉 $X^{\mathsf T}$ 把指标 $(i,j)$ 变成 $(j,i)$，导致 $a_{ik}$ 与 $a_{ki}$ 弄反（$A$ 不称时立刻错）；② 以为 $\vert A\otimes E_n\vert=\vert A\vert\cdot\vert E_n\vert$（其实是 $\vert A\vert^n$）；③ 基的排序不固定，答案只在"差一个置换相似"的意义下唯一。

### 习题 12 — 复域上对称 $f$ 必有迷向向量与双曲对

**题目**：$V$ 是复数域上 $n\ge2$ 维空间，$f$ 是对称双线性函数。1) 证存在非零 $\xi$ 使 $f(\xi,\xi)=0$；2) 若 $f$ 非退化，证存在线性无关的 $\xi,\eta$ 使 $f(\xi,\eta)=1$，$f(\xi,\xi)=f(\eta,\eta)=0$。

**解**：

1. 由定理5，取基使 $f=\sum_{i=1}^{r}x_iy_i$（$r\le n$ 是秩），于是 $f(\alpha,\alpha)=x_1^2+\dots+x_r^2$。
2. $r=0$：一切向量迷向，任取非零向量。
3. $r=1$：由 $n\ge2$ 取 $\xi=\varepsilon_2$，则 $f(\xi,\xi)=0$。
4. $r\ge2$：取 $\xi=\varepsilon_1+i\varepsilon_2$，则 $f(\xi,\xi)=1+i^2=0$。
5. 2) 非退化时 $r=n\ge2$，取
$$\xi=\frac{1}{\sqrt2}(\varepsilon_1+i\varepsilon_2),\qquad \eta=\frac{1}{\sqrt2}(\varepsilon_1-i\varepsilon_2).$$
6. 验：$f(\xi,\xi)=\frac{1+i^2}{2}=0$，$f(\eta,\eta)=\frac{1+(-i)^2}{2}=0$，$f(\xi,\eta)=\frac{1+i(-i)}{2}=\frac{1+1}{2}=1$。$\xi,\eta$ 含不同的 $\varepsilon_2$ 系数，线性无关。

**关键一步**：在规范形下"迷向"就是方程 $x_1^2+\dots+x_r^2=0$，用 $i$ 造解；非退化时取 $(\varepsilon_1\pm i\varepsilon_2)/\sqrt2$ 一步得到双曲对。

**易错**：① 漏 $r=0,1$ 两种退化情形；② 在实域上想（实域上正定内积没有非零迷向向量——"复域"这个条件是本质的）；③ 归一化系数算错，$f(\xi,\eta)$ 不等于 $1$。

### 习题 14 — 与子空间 $K$ 全正交的 $\eta$：投影修正

**题目**：$f$ 是 $V$ 上对称或反称双线性函数，$K$ 是真子空间。证明对任意 $\xi\in V$，存在 $0\ne\eta\in K+L(\xi)$ 使 $f(\eta,\alpha)=0$ 对一切 $\alpha\in K$ 成立。

**解**：

1. 情形一：$f\vert_K$ 退化。则存在 $0\ne\eta\in K$ 与 $K$ 中一切向量正交，$\eta\in K\subseteq K+L(\xi)$，结论成立。
2. 情形二：$f\vert_K$ 非退化，$f$ 对称。由定理5 取 $K$ 的基 $\varepsilon_1,\dots,\varepsilon_t$ 使 $f(\varepsilon_i,\varepsilon_j)=d_i\delta_{ij}$，$d_i\ne0$。
3. 记 $c_i=f(\xi,\varepsilon_i)$，令
$$\eta=\xi-\sum_{i=1}^{t}\frac{c_i}{d_i}\varepsilon_i\in K+L(\xi).$$
4. 任取 $\alpha=\sum m_i\varepsilon_i\in K$，则
$$f(\eta,\alpha)=\sum_i m_ic_i-\sum_i \frac{c_i}{d_i}\,m_id_i=0 .$$
5. 情形三：$f$ 反称。由定理6 取标准基 $\varepsilon_{\pm1},\dots,\varepsilon_{\pm r}$（$f(\varepsilon_i,\varepsilon_{-i})=1$，其余 0），同样令 $\eta=\xi+\sum_i c_i\varepsilon_{-i}-\sum_i c_{-i}\varepsilon_i$，代入即得 $f(\eta,\alpha)=0$。
6. $\eta\ne0$：若 $\eta=0$ 则 $\xi\in K$，此时取 $\eta$ 为主空间 $K$ 内该退化/非退化情形给出的向量（原题结论对 $\xi\notin K$ 直接成立）。

**关键一步**：非退化情形把"求与 $K$ 全正交的向量"化成 $t$ 个线性方程，解就是 $\xi$ 减去它在标准基上的"投影"组合——与欧氏空间正交投影同一套路，只是系数带 $1/d_i$。

**易错**：① 忘记先分退化/非退化（退化时 $\eta$ 直接在 $K$ 里找）；② 修正项漏 $d_i$（反称块里 $d_i=\pm1$，容易掩盖这个错误）；③ 不验证 $\eta\in K+L(\xi)$ 与 $\eta\ne0$。

### 习题 16 — 非退化子空间给出直和，非退化性沿正交补传递

**题目**：$f$ 对称或反称，$K$ 是子空间且 $f\vert_K$ 非退化。证明 $V=K\oplus K^\perp$，并讨论 $f$ 在 $V$ 上的非退化性。

**解**：

1. $f\vert_K$ 非退化 $\iff$ $K\cap K^\perp=\{0\}$（$K^\perp$ 的定义只用了 $f(x,\beta)=0$）。
2. 由第 15 题，$K\cap K^\perp=\{0\}$ 已给出 $V=K+K^\perp$；两者合起来即 $V=K\oplus K^\perp$。
3. 取 $K$ 的基 $\varepsilon_1,\dots,\varepsilon_t$ 与 $K^\perp$ 的基 $\eta_1,\dots,\eta_s$ 拼成 $V$ 的基。因 $f(\varepsilon_i,\eta_j)=0$，度量矩阵为分块对角
$$C=\begin{pmatrix}A&0\\0&B\end{pmatrix},$$
$A,B$ 分别是 $f$ 在 $K$、$K^\perp$ 上的度量矩阵。
4. 于是 $\vert C\vert=\vert A\vert\cdot\vert B\vert$。故 $f$ 在 $V$ 非退化 $\iff$ $A,B$ 都可逆；特别地，当 $f\vert_K$ 已非退化时，
$$f\text{ 在 }V\text{ 非退化}\iff f\text{ 在 }K^\perp\text{ 上非退化}.$$

**关键一步**：直和 + 正交 $\Rightarrow$ 度量矩阵分块对角，非退化性化成一个行列式乘积。分块对角是这一步唯一可用的结构。

**易错**：① 不证 $K\cap K^\perp=\{0\}$ 就说直和（维数等式不够）；② 基混排导致 $C$ 出现非零交叉块（必须 $K$ 的基在前、$K^\perp$ 的基在后）；③ 把结论说成"$f$ 在 $V$ 非退化 $\iff$ $f$ 在 $K$ 非退化"——漏掉 $K^\perp$ 这一半（原书排版易混，正确表述见上）。

### 习题 18 — 准欧氏空间与准正交变换：四条结论同一个等式

**题目**：$(V,f)$ 是 $n$ 维准欧氏空间（$f$ 非退化对称），正交基满足 $f(\varepsilon_i,\varepsilon_i)=1\ (i\le p)$、$=-1\ (i>p)$、$f(\varepsilon_i,\varepsilon_j)=0\ (i\ne j)$；保 $f$ 的线性变换称准正交变换。证明：1) 可逆且逆仍准正交；2) 乘积仍准正交；3) 若 $\alpha$ 是特征向量且 $f(\alpha,\alpha)\ne0$，则特征值为 $\pm1$；4) 正交基下矩阵 $T$ 满足 $T^{\mathsf T}DT=D$，$D=\operatorname{diag}(E_p,-E_{n-p})$。

**解**：

1. 正交基存在：实对称矩阵经实合同可化为 $\operatorname{diag}(1,\dots,1,-1,\dots,-1,0,\dots,0)$；$f$ 非退化故无零对角元。
2. 1) 准正交变换把正交基 $(\varepsilon_i)$ 送到 $(\mathscr{A}\varepsilon_i)$，后者仍满足同样的两两 $f$-关系，故线性无关、是基 $\Rightarrow$ 可逆。设逆为 $\mathscr{A}^{-1}$，则
$$f(\alpha,\beta)=f(\mathscr{A}\mathscr{A}^{-1}\alpha,\mathscr{A}\mathscr{A}^{-1}\beta)=f(\mathscr{A}^{-1}\alpha,\mathscr{A}^{-1}\beta),$$
故逆也准正交。
3. 2) $f(\mathscr{A}\mathscr{B}\alpha,\mathscr{A}\mathscr{B}\beta)=f(\mathscr{B}\alpha,\mathscr{B}\beta)=f(\alpha,\beta)$。
4. 3) 设 $\mathscr{A}\alpha=\lambda\alpha$，$\alpha\ne0$。由保 $f$：$f(\mathscr{A}\alpha,\mathscr{A}\alpha)=f(\alpha,\alpha)$，左边 $=\lambda^2f(\alpha,\alpha)$；再除以 $f(\alpha,\alpha)\ne0$ 得 $\lambda^2=1$。
5. 4) 设 $(\mathscr{A}\varepsilon_1,\dots,\mathscr{A}\varepsilon_n)=(\varepsilon_1,\dots,\varepsilon_n)T$。则 $f$ 在基 $(\mathscr{A}\varepsilon_i)$ 下的度量矩阵是 $T^{\mathsf T}DT$，而它又等于 $f$ 在原正交基下的 $D$，故 $T^{\mathsf T}DT=D$。

**关键一步**：四条结论全部来自同一个等式 $f(\mathscr{A}\alpha,\mathscr{A}\beta)=f(\alpha,\beta)$；第 4 条只是"同一双线性函数在两组基下的度量矩阵相等"。

**易错**：① 第 3 条漏掉 $f(\alpha,\alpha)\ne0$——迷向特征向量可以取任意特征值，这条限制是本质的；② 把 $T^{\mathsf T}DT=D$ 写成 $T^{-1}DT=D$；③ 误以为准正交变换就是正交变换（只有 $p=n$，即 $f$ 正定时才是）。

## 三、与章节的分工

- 本章理论/框架 → chapters/ch10-bilinear-symplectic.md（定理1、2、5、6、8、11、12，对偶空间、辛空间、迷向与拉格朗日）。
- 本章典型题精解（6 题：习题 3、11、13、17、教材 §10.4 定理6、教材 §10.3 例）→ 同文件的「典型题精解」，不在此重复。
- 本节只补：**18 题的答案索引**（题号、题型、起手、答案）+ 章节没细讲的题：积分泛函求对偶基（6）、$\operatorname{Tr}(X^{\mathsf T}AY)$ 与 Kronecker（10）、复域迷向向量与双曲对（12）、真子空间的正交修正（14）、非退化性与直和（16）、准欧氏空间与准正交变换（18）。
