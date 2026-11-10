# 第9章 欧几里得空间 · 习题解答

> 题号按《高等代数辅导与习题解答》北大·第四版；第六版同节题目基本对应、个别增删。
> 记号：✓ = 答案经独立复核；? = 只给方法、答案从略；— = OCR 残缺或无法复核。
> 证明题的 ✓ 指**逻辑已核、结论成立**，不代表 OCR 原文逐字无误。

## 一、习题（第 1–27 题）

| 题号 | 题型 | 起手动作 | 答案 / 结论 |
|---|---|---|---|
| 1 | 用正定矩阵定义内积 | 逐条验内积公理 | (1) 四条公理成立，$\mathbb R^n$ 成欧氏空间；(2) 度量矩阵就是 $A$；(3) $\vert\sum a_{ij}x_iy_j\vert\le\sqrt{\sum a_{ij}x_ix_j}\sqrt{\sum a_{ij}y_iy_j}$ ✓ |
| 2 | 求夹角 | 先算内积，看符号定锐钝 | 1) $\pi/2$；2) $\pi/4$；3) $\arccos\frac{3}{\sqrt{77}}$ ✓ |
| 3 | 距离的三角不等式 | 拆成 $(\alpha-\beta)+(\beta-\gamma)$ | $d(\alpha,\gamma)\le d(\alpha,\beta)+d(\beta,\gamma)$ ✓ |
| 4 | 正交补求单位向量 | 向量当行解 $AX=0$ | $\pm\frac{1}{\sqrt{26}}(4,0,1,-3)'$ ✓ |
| 5 | 内积的非退化性 | 把 $\gamma$ 用基展开 | 1) $\gamma=0$；2) $\gamma_1=\gamma_2$ ✓ |
| 6 | 判标准正交基 | 验过渡矩阵 $A'A=E$ | 三个 $\frac13$ 系数向量两两正交且长度为 $1$，是标准正交基 ✓ |
| 7 | 抽象基下施密特 | 换成 5 维坐标列再算 | 三个向量：$\frac{1}{\sqrt2}(\varepsilon_1+\varepsilon_5)$、$\frac{1}{\sqrt{10}}(\varepsilon_1-2\varepsilon_2+2\varepsilon_4-\varepsilon_5)$、$\frac12(\varepsilon_1+\varepsilon_2+\varepsilon_3-\varepsilon_5)$（详见章内「习题 7」） ✓ |
| 8 | 解空间的标准正交基 | 先求基础解系再正交化 | 单位化后 $\frac{1}{\sqrt2}(0,1,1,0,0)$、$\frac{1}{\sqrt{10}}(-2,1,-1,2,0)$、$\frac{1}{3\sqrt{35}}(7,-6,6,13,5)$ ✓ |
| 9 | 多项式空间正交化 | 从基 $1,x,x^2,x^3$ 出发 | $\frac{\sqrt2}{2}$、$\frac{\sqrt6}{2}x$、$\frac{\sqrt{10}}{4}(3x^2-1)$、$\frac{\sqrt{14}}{4}(5x^3-3x)$ ✓ |
| 10 | 超平面的维数 | 把 $\alpha$ 扩充为标准正交基 | 1) $V_1$ 是子空间；2) $\dim V_1=n-1$ ✓ |
| 11 | 度量矩阵合同 | 同一内积写两种坐标式 | 1) $B=C'AC$（合同）；2) 取 $C'AC=E$ 即得标准正交基存在 ✓ |
| 12 | Gram 行列式 | 把 $(\alpha,\alpha)$ 写成 $X'\Delta X$ | $\vert\Delta\vert\ne0\iff\alpha_1,\dots,\alpha_m$ 线性无关 ✓ |
| 13 | 上三角正交矩阵 | 从 $AA'=E$ 的末行往上推 | 必为对角矩阵，且对角元为 $\pm1$ ✓ |
| 14 | QR 分解 | 对 $A$ 的列作施密特 | 1) $A=QT$，$Q$ 正交、$T$ 上三角且 $t_{ii}>0$，唯一；2) 正定 $A=T'T$ ✓ |
| 15 | 镜面反射 | 取含 $\eta$ 的标准正交基 | 1) 是正交变换；2) $\vert A\vert=-1$，属第二类；3) 特征值 $1$ 的重数为 $n-1$ 时必为镜面反射 ✓ |
| 16 | 反称矩阵的特征值 | 用 $\xi^*$ 左乘并与共轭式比较 | 特征值为 $0$ 或纯虚数 ✓ |
| 17 | 实对称正交对角化 | 特征值→特征子空间→重根内部施密特 | 1) $1,-2,4$；2) $1,1,10$（$T$ 见章内「习题 17(2)」）；3)–5) — OCR 矩阵残缺，特征值未能复原 |
| 18 | 二次型正交替换 | 写矩阵、求特征值 | 1) $-y_1^2+2y_2^2+5y_3^2$；2) $2y_1^2+2y_2^2-7y_3^2$；3) $y_1^2-y_2^2+y_3^2-y_4^2$ ✓；4) — OCR 表达式残缺 |
| 19 | 正定与特征值 | 正交替换化平方和 | $A$ 正定 $\iff$ 特征值全大于 $0$ ✓ |
| 20 | 正交三角化 | 对阶数归纳，取特征向量作首列 | 存在正交 $T$ 使 $T^{-1}AT$ 上三角 $\iff$ 特征多项式根全实 ✓ |
| 21 | 实对称矩阵正交相似 | 各自正交对角化后重排 | $\iff A,B$ 的特征多项式根全部相同 ✓ |
| 22 | 幂等矩阵正交对角化 | 由 $A^2=A$ 定特征值 | $T'AT=\operatorname{diag}(1,\dots,1,0,\dots,0)$，$1$ 的个数等于 $\operatorname{tr}A$ ✓ |
| 23 | 不变子空间的正交补 | 取 $\beta=\mathcal A\gamma$ 用保内积 | $W^\perp$ 也是 $\mathcal A$ 的不变子空间 ✓ |
| 24 | 反称变换 | 比较 $(\mathcal A\varepsilon_i,\varepsilon_j)$ 与 $a_{ij}$ | 1) 标准正交基下矩阵反称；2) 不变子空间的正交补仍不变 ✓ |
| 25 | 内射影的刻画 | 用 $(\alpha-\beta)\perp W$ 展开平方 | $\beta$ 是内射影 $\iff\vert\alpha-\beta\vert\le\vert\alpha-\xi\vert$ 对一切 $\xi\in W$ ✓ |
| 26 | 正交补运算律 | 两个方向各做一次包含 | $(V_1+V_2)^\perp=V_1^\perp\cap V_2^\perp$，$(V_1\cap V_2)^\perp=V_1^\perp+V_2^\perp$ ✓ |
| 27 | 最小二乘 | 列法方程 $A'AX=A'B$ | $x\approx0.197$，$y\approx-0.488$（三位有效数字） ✓ |
| 补充题 1 | 正交矩阵的实特征根 | 用 $(A\alpha,A\alpha)=(\alpha,\alpha)$ | 只能等于 $\pm1$ ✓ |
| 补充题 2 | 奇数维旋转的特征值 | 证 $\vert E-A\vert=0$（$\vert A\vert=1$、$n$ 奇） | 必有特征值 $1$ ✓ |
| 补充题 3 | 第二类正交变换 | 证 $\vert E+A\vert=0$（$\vert A\vert=-1$） | 必有特征值 $-1$ ✓ |
| 补充题 4 | 保内积推出线性 | 展开 $\vert\mathcal A(k\alpha+l\beta)-k\mathcal A\alpha-l\mathcal A\beta\vert^2$ | 该量为 $0$，故 $\mathcal A$ 线性，从而是正交变换 ✓ |
| 补充题 5 | 正交变换的存在性 | 两组基的 Gram 矩阵相同则套构造 | $\iff(\alpha_i,\alpha_j)=(\beta_i,\beta_j)$ 对全部 $i,j$ ✓ |
| 补充题 6 | 对合矩阵正交对角化 | 由 $A^2=E$ 定特征值 $\pm1$ | $T'AT=\operatorname{diag}(E_r,-E_{n-r})$ ✓ |
| 补充题 7 | Rayleigh 商估计 | 正交替换成 $\sum\lambda_iy_i^2$ | $\lambda_1X'X\le X'AX\le\lambda_nX'X$ ✓ |
| 补充题 8 | 取到特征值的向量 | 取 $\lambda$ 对应的特征向量 | 存在 $X\ne0$ 使 $f=\lambda\sum x_i^2$ ✓ |
| 补充题 9 | 镜面反射生成正交变换 | 先造反射把 $\alpha$ 送到 $\beta$，再归纳 | 1) 存在；2) 任一正交变换可写成镜面反射之积 ✓ |
| 补充题 10 | 同时对角化 | 先用 $B$ 把 $E$ 打出来，再正交化 $A_1$ | 存在可逆 $T$ 使 $T'AT$ 与 $T'BT$ 同时为对角形 ✓ |
| 补充题 11 | 酉空间过渡矩阵 | 用 $\sum_k a_{ki}\overline{a_{kj}}=\delta_{ij}$ | 两组标准正交基的过渡矩阵是酉矩阵 ✓ |
| 补充题 12 | 酉矩阵特征根 | 用 $(\alpha,\alpha)=\lambda\bar\lambda(\alpha,\alpha)$ | 特征根的模为 $1$ ✓ |
| 补充题 13 | 复矩阵的 UT 分解 | 对列作施密特（复版） | $A=UT$，$U$ 酉、$T$ 上三角且对角元为正实数，唯一 ✓ |
| 补充题 14 | Hermite 矩阵 | 用 $\xi^*A\xi$ 与共轭式比较 | 特征值全为实数；不同特征值的特征向量相互正交 ✓ |

题量统计：习题 27 题、补充题 14 题，题号连续（1–27、1–14），OCR 未吞题号。按题计：✓ 40 题；— 2 处（习题 17 的 3)–5)、习题 18 的 4)，矩阵或表达式只剩碎片）；? 0 处。

## 二、难题精解（4–6 题）

### 习题 12 — Gram 行列式判线性无关

**题目**：$\alpha_1,\dots,\alpha_m$ 是 $n$ 维欧氏空间中的向量，$\Delta=((\alpha_i,\alpha_j))_{m\times m}$。证明：$\vert\Delta\vert\ne0\iff\alpha_1,\dots,\alpha_m$ 线性无关。

**解**：

1. 设 $\alpha=x_1\alpha_1+\dots+x_m\alpha_m$，则
   $$(\alpha,\alpha)=\sum_{i,j}x_ix_j(\alpha_i,\alpha_j)=X'\Delta X,$$
   这是 $x_1,\dots,x_m$ 的二次型，$\Delta$ 是它的矩阵。
2. 线性无关 $\iff$ 对任意 $X\ne0$ 都有 $\alpha\ne0$ $\iff$ 对任意 $X\ne0$ 有 $X'\Delta X>0$ $\iff\Delta$ 正定。
3. 正定 $\Rightarrow\vert\Delta\vert>0$，故 $\vert\Delta\vert\ne0$。
4. 反之设 $\vert\Delta\vert\ne0$，若 $\sum x_i\alpha_i=0$，则对每个 $j$ 有 $(\sum x_i\alpha_i,\alpha_j)=0$，即 $\Delta X=0$；$\vert\Delta\vert\ne0$ 给出 $X=0$。

**关键一步**：第 1 步把 $\alpha$ 的自内积写成 $X'\Delta X$。一旦看出这是二次型，"线性无关"就翻成"二次型正定"，再用正定 $\iff$ 行列式大于零收尾。注意 $m$ 不必等于 $n$（不是基）。

**易错**：① 只证一个方向；② 忘记 $\Delta$ 是**正定**而不只是非异；③ 逆方向里写 $(\sum x_i\alpha_i,\alpha_j)=0$ 后停在"向量为零"，其实要的是 $X=0$。

### 习题 14 — QR 分解与正定矩阵的 $T'T$ 分解

**题目**：(1) $A$ 为 $n$ 级实矩阵且 $\vert A\vert\ne0$，证明 $A=QT$，$Q$ 正交、$T$ 上三角且 $t_{ii}>0$，并证唯一；(2) $A$ 正定时存在上三角 $T$ 使 $A=T'T$。

**解**：

1. 设 $A$ 的列为 $\alpha_1,\dots,\alpha_n$，对它们作施密特正交化并单位化，得 $\gamma_1,\dots,\gamma_n$。
2. 把施密特公式**倒着写**：$\gamma_1=t_{11}\alpha_1$，$\gamma_2=t_{12}\alpha_1+t_{22}\alpha_2$，$\dots$，$\gamma_n=t_{1n}\alpha_1+\dots+t_{nn}\alpha_n$，其中 $t_{ii}=1/\vert\beta_i\vert>0$。写成矩阵就是
   $$(\gamma_1,\dots,\gamma_n)=(\alpha_1,\dots,\alpha_n)T=AT .$$
3. 令 $Q=(\gamma_1,\dots,\gamma_n)$（正交），则由 $Q=AT$ 得 $A=QT^{-1}$；把 $T^{-1}$ 仍记作 $T$，它仍是上三角、对角元为正。
4. 唯一性：若 $A=QT=Q_1T_1$，则 $Q_1^{-1}Q=T_1T^{-1}$，左边正交、右边上三角且对角元为正。由本章习题 13（上三角正交矩阵必为对角、对角元 $\pm1$）知右边是对角矩阵、对角元全为 $1$，故两边都是 $E$，即 $Q=Q_1$、$T=T_1$。
5. (2) $A$ 正定 $\Rightarrow$ 存在可逆 $P$ 使 $A=P'P$。把 $P$ 按 (1) 写成 $P=QT$，则 $A=P'P=T'Q'QT=T'T$。

**关键一步**：第 2 步把施密特公式反解成 $(\gamma)=(\alpha)T$——注意系数矩阵乘在右边、且是 $T$ 不是 $T^{-1}$。这一步把"正交化过程"直接翻译成矩阵等式，唯一性则完全交给习题 13。

**易错**：① 方向写成 $A=TQ$；② $t_{ii}$ 是 $1/\vert\beta_i\vert$，别写成 $\vert\beta_i\vert$；③ 唯一性不能用"正交矩阵唯一"，必须借"对角元为正"钉死符号；④ (2) 里要说明 $P$ 可逆（正定保证）。

### 习题 16 — 反称实矩阵的特征值是零或纯虚数

**题目**：$A$ 为反称实矩阵（$A'=-A$），证明 $A$ 的特征值是 $0$ 或纯虚数。

**解**：

1. 设 $A\xi=\lambda_0\xi$，$\xi\ne0$ 为复向量。对 $\xi$ 取共轭：$A\bar\xi=\bar\lambda_0\bar\xi$；转置得 $\xi^*A'=\bar\lambda_0\xi^*$。
2. 代入 $A'=-A$：$-\xi^*A=\bar\lambda_0\xi^*$，右乘 $\xi$ 得
   $$-\xi^*A\xi=\bar\lambda_0\,\xi^*\xi .$$
3. 另一方面，$A\xi=\lambda_0\xi$ 左乘 $\xi^*$ 得 $\xi^*A\xi=\lambda_0\xi^*\xi$。
4. 两式相减：$(\lambda_0+\bar\lambda_0)\xi^*\xi=0$。而 $\xi\ne0$ 给出 $\xi^*\xi>0$，故 $\lambda_0+\bar\lambda_0=0$，即 $\operatorname{Re}\lambda_0=0$——$\lambda_0$ 是 $0$ 或纯虚数。

**关键一步**：把 $A\xi=\lambda_0\xi$ 与它的**共轭转置**并排使用，让同一个量 $\xi^*A\xi$ 出现两次；反称条件 $A'=-A$ 只在第 2 步用一次，就把 $\lambda_0$ 与 $\bar\lambda_0$ 的关系拧出来了。

**易错**：① 只想实特征向量——反称矩阵一般没有实特征值，必须进复数域；② 忘记 $\xi^*\xi=\sum\vert x_i\vert^2>0$；③ 结论要写"0 或纯虚"，$0$ 不能漏（奇数阶反称矩阵必有 $0$ 特征值）；④ 分不清 $A'$（转置）与 $A^*$（共轭转置）。

### 补充题 5 — 存在正交变换把 $\alpha_i$ 送到 $\beta_i$ 的充要条件

**题目**：$\alpha_1,\dots,\alpha_m$ 与 $\beta_1,\dots,\beta_m$ 是 $n$ 维欧氏空间中的两个向量组。证明存在正交变换 $\mathcal A$ 使 $\mathcal A\alpha_i=\beta_i$（$i=1,\dots,m$）$\iff(\alpha_i,\alpha_j)=(\beta_i,\beta_j)$ 对全部 $i,j$。

**解**：

1. 必要性：正交变换保内积，取 $\alpha_i,\alpha_j$ 即得。
2. 充分性：两组向量的 Gram 矩阵相同，故秩相同，$\dim L(\alpha_1,\dots,\alpha_m)=\dim L(\beta_1,\dots,\beta_m)=r$；且线性关系一致（$\sum x_i\alpha_i=0\iff X'GX=0\iff\sum x_i\beta_i=0$）。
3. 由第 2 步可取对应的极大无关组 $\alpha_1,\dots,\alpha_r$ 与 $\beta_1,\dots,\beta_r$；再把它们分别扩充为标准正交基 $\alpha_1,\dots,\alpha_r,\alpha_{r+1},\dots,\alpha_n$ 与 $\beta_1,\dots,\beta_r,\beta_{r+1},\dots,\beta_n$。
4. 定义线性变换 $\mathcal A$：$\mathcal A\alpha_i=\beta_i$（$i=1,\dots,n$）。因两组都是基，$\mathcal A$ 存在且唯一（第7章：线性变换由基的像决定）。
5. 验保内积：任取 $\alpha=\sum x_i\alpha_i$、$\beta=\sum y_i\alpha_i$，则
   $$(\mathcal A\alpha,\mathcal A\beta)=\sum_{i,j}x_iy_j(\beta_i,\beta_j)=\sum_{i,j}x_iy_j(\alpha_i,\alpha_j)=(\alpha,\beta),$$
   故 $\mathcal A$ 是正交变换，且 $\mathcal A\alpha_i=\beta_i$。

**关键一步**：第 3 步把两族向量**都补成标准正交基**——补上去的部分 Gram 矩阵都是单位阵，于是两组基的 Gram 矩阵自动整体相等，第 5 步的求和才成立。只补成一般基会卡在补空间的内积上。

**易错**：① 只在 $L(\alpha_i)$ 上定义 $\mathcal A$，没管补空间；② 补充的向量之间、与原有向量之间都要正交（必须补成标准正交基）；③ 没写"由基的像唯一确定 $\mathcal A$"，$\mathcal A$ 的存在性就悬空；④ 漏掉 $m<n$ 时"取极大无关组"这一步。

### 补充题 9 — 镜面反射生成全部正交变换

**题目**：(1) $\alpha,\beta$ 是 $n$ 维欧氏空间中两个不同的单位向量，证明存在镜面反射 $\mathcal A$ 使 $\mathcal A\alpha=\beta$；(2) 证明任一正交变换都可表成一系列镜面反射的乘积。

**解**：

1. 若 $\beta=-\alpha$：取以 $\alpha$ 为单位法向的镜面反射，$\mathcal A\alpha=\alpha-2(\alpha,\alpha)\alpha=-\alpha=\beta$。
2. 若 $\beta\ne-\alpha$：令 $\gamma_1=\frac{1}{\vert\alpha-\beta\vert}(\alpha-\beta)$，$\gamma_2=\frac{1}{\vert\alpha+\beta\vert}(\alpha+\beta)$，则 $\gamma_1,\gamma_2$ 是正交的单位向量（$(\alpha+\beta,\alpha-\beta)=(\alpha,\alpha)-(\beta,\beta)=0$）。取以 $\gamma_1$ 为法向的镜面反射 $\mathcal A$：它把 $\alpha$ 与 $\beta$ 互换，故 $\mathcal A\alpha=\beta$。
3. (2) 对 $n$ 归纳。$n=1$：正交变换只有 $\pm E$，$E$ 是空乘积，$-E$ 是镜面反射。
4. 设 $\mathcal A\ne E$，取单位 $\alpha$ 使 $\mathcal A\alpha=\beta\ne\alpha$。由 (1) 有镜面反射 $\mathcal B$ 使 $\mathcal B^{-1}\mathcal A\alpha=\alpha$（取 $\mathcal B$ 把 $\alpha$ 送到 $\beta$）。
5. 于是 $\mathcal B^{-1}\mathcal A$ 固定 $\alpha$，从而保持 $W=L(\alpha)$；正交变换还保持 $W^\perp$（习题 23），故 $\mathcal B^{-1}\mathcal A|_{W^\perp}$ 是 $n-1$ 维欧氏空间上的正交变换。
6. 由归纳假设，$\mathcal B^{-1}\mathcal A|_{W^\perp}=\mathcal B_2\cdots\mathcal B_k$（$W^\perp$ 上的镜面反射）。把每个 $\mathcal B_i$ 在 $W$ 上取恒等即扩充为 $V$ 的镜面反射，则 $\mathcal B^{-1}\mathcal A=\mathcal B_2\cdots\mathcal B_k$，即 $\mathcal A=\mathcal B\,\mathcal B_2\cdots\mathcal B_k$。

**关键一步**：第 4–5 步"先用一个镜面反射把 $\mathcal A\alpha$ 拉回 $\alpha$，再把问题压到 $\alpha^\perp$ 上"。降维是归纳能走的唯一理由；而 $\alpha^\perp$ 能被继承，靠的正是习题 23（正交变换的不变子空间的正交补仍不变）。

**易错**：① 漏掉 $\beta=-\alpha$ 的单独情形；② 没说扩充的镜面反射在 $W$ 上是恒等，复合顺序就乱；③ 归纳起点 $n=1$ 不交代；④ 忘了 $\mathcal B^{-1}\mathcal A$ 仍是正交变换（正交变换的逆与乘积仍正交）。

## 三、与章节的分工

- 本章理论、框架、方法步骤 → chapters/ch09-euclidean-spaces.md 的「Frameworks」「Procedures」。
- 本章上手示范（5 题）→ chapters/ch09-euclidean-spaces.md 的「典型题精解」：习题 17(2)、习题 7、习题 4、补充题 3、习题 27。
- 本文件只补两样：**全题号答案索引**（41 行，含起手动作）与**章节没细讲的 5 道难题**（12、14、16、补充题 5、补充题 9）。
- 其余短证明（13、20、21、22 等）按答案列的"起手动作"动手，卡住再回章内对应小节。
