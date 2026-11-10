# 第8章 λ-矩阵 · 习题解答

> 题号按《高等代数辅导与习题解答》北大·第四版；第六版同节题目基本对应、个别增删。
> 记号：✓ = 答案经独立复核；? = 只给方法、答案从略；— = OCR 残缺或无法复核。
> 若尔当块按章节约定「1 在上对角」；辅导书排版常把 1 印在下对角，两者互为转置，块结构与初等因子一致。

## 一、习题（第 1–7 题）

| 题号 | 题型 | 起手动作 | 答案 / 结论 |
|---|---|---|---|
| 1(1) | 化 λ-矩阵标准形 | 先算 $D_1$，再算行列式 | $\operatorname{diag}\big(\lambda,\ \lambda^3-10\lambda^2-3\lambda\big)$ ✓ |
| 1(2) | 化标准形 | 先求全部元素的首一最大公因式 | $\operatorname{diag}\big(1,\ \lambda,\ \lambda(\lambda+1)\big)$ — 矩阵 OCR 错行 |
| 1(3) | 化标准形 | 同上 | $\operatorname{diag}\big(1,\ \lambda(\lambda+1),\ \lambda(\lambda+1)^2\big)$ — 同上 |
| 1(4) | 化标准形 | 同上 | $\operatorname{diag}\big(\lambda(\lambda-1),\ \lambda(\lambda-1),\ \lambda^2(\lambda-1)^2\big)$ — 同上 |
| 1(5) | 化标准形 | 同上 | $\operatorname{diag}\big(\lambda-1,\ (\lambda-1)^2(\lambda+1)\big)$ — 同上 |
| 1(6) | 化标准形 | 同上 | $\operatorname{diag}\big(1,1,\lambda(\lambda-1),\lambda^2(\lambda-1)\big)$ — 同上 |
| 2(1) | 求不变因子 | 算 $D_1,D_2,D_3$ 再作商 | $1,\ 1,\ (\lambda-2)^3$ — 矩阵 OCR 残缺 |
| 2(2) | 求不变因子 | 先猜 $D_k=1$，找一个常数 3 阶子式 | $1,1,1,\ \lambda^4+2\lambda^3+3\lambda^2+4\lambda+5$ ✓ |
| 2(3) | 含参不变因子 | 先算 $D_4$，再找与它互素的 3 阶子式 | $\beta=0$：$1,1,(\lambda+\alpha)^2,(\lambda+\alpha)^2$；$\beta\ne0$：$1,1,1,[(\lambda+\alpha)^2+\beta^2]^2$ ✓ |
| 2(4) | 求不变因子 | 找常数 3 阶子式压 $D_3=1$ | $1,1,1,\ (\lambda+2)^4$ ✓ |
| 2(5) | 求不变因子 | 对角元两两互素 ⟹ $D_k=1$ | $1,1,1,\ (\lambda^2-1)(\lambda^2-4)$ ✓ |
| 3 | 友矩阵的不变因子 | 取 $n-1$ 阶常数子式压 $D_{n-1}=1$ | 不变因子 $1,\dots,1,f(\lambda)$，$f=\lambda^n+a_1\lambda^{n-1}+\dots+a_n$ ✓ |
| 4 | $A\sim A^{\mathsf T}$ | 比 $\lambda E-A$ 与它的转置 | 各级行列式因子相同 ⟹ 相似 ✓ |
| 5 | 若尔当块的幂 | 拆 $A=\lambda E+N$（$N^3=O$）后二项式 | $A^k=\lambda^kE+k\lambda^{k-1}N+\binom{k}{2}\lambda^{k-2}N^2$ ✓ |
| 6(1) | 求若尔当形 | 三个互异特征值 | $\operatorname{diag}(1,2,-1)$ ✓ |
| 6(2) | 求若尔当形 | 找两互素 2 阶子式压 $D_2=1$ | $\operatorname{diag}\big(-3,\ J(1,2)\big)$ ✓ |
| 6(3) | 求若尔当形 | 算不变因子 $1,\lambda+1,(\lambda+1)^2$ | $J(-1,1)\oplus J(-1,2)$ ✓ |
| 6(4) | 求若尔当形 | 用 $r(A-E)$ 定块数 | $J(1,3)$ ✓ |
| 6(5) | 求若尔当形 | 特征多项式 $(\lambda-1)(\lambda^2+1)$ | $\operatorname{diag}(1,\ i,\ -i)$ ✓ |
| 6(6) | 求若尔当形 | 秩 1 ⟹ 初等因子 $\lambda,\lambda,\lambda-2$ | $\operatorname{diag}(0,0,2)$ ✓ |
| 6(7) | 求若尔当形 | 验 $A^2=O$ 但 $A\ne O$ | $\operatorname{diag}\big(0,\ J(0,2)\big)$ ✓ |
| 6(8) | 求若尔当形 | 不变因子只有一个 $(\lambda-2)^3$ | $J(2,3)$ ✓ |
| 6(9) | 求若尔当形 | 不变因子 $1,1,\lambda(\lambda+1)^2$ | $\operatorname{diag}\big(0,\ J(-1,2)\big)$ ✓ |
| 6(10) | 求若尔当形 | 三次特征多项式三根互异（判别式 $\ne0$） | $\operatorname{diag}(\lambda_1,\lambda_2,\lambda_3)$，$\lambda^3+30\lambda-8=0$ 的三根 ✓ |
| 6(11) | 求若尔当形 | 找两互素 3 阶子式压 $D_3=1$ | $J(1,4)$ ✓ |
| 6(12) | 求若尔当形 | — | — 矩阵 OCR 错行，无法复核 |
| 6(13) | 求若尔当形 | 初等变换化对角后逐元分解 | $\operatorname{diag}(1,1,\ 7+\sqrt{30},\ 7-\sqrt{30})$ ✓ |
| 6(14) | 求若尔当形 | 不变因子 $1,1,1,\lambda^4-1$ | $\operatorname{diag}(1,-1,i,-i)$ ✓ |
| 7 | 写有理标准形（14 小问） | 由 6(x) 的不变因子逐个写友矩阵再拼 | 7(1) $\begin{pmatrix}0&0&-2\\1&0&1\\0&1&2\end{pmatrix}$✓；7(2) $\begin{pmatrix}0&0&-3\\1&0&5\\0&1&-1\end{pmatrix}$✓；7(4) $\begin{pmatrix}0&0&1\\1&0&-3\\0&1&3\end{pmatrix}$✓；7(13) $\operatorname{diag}\big(1,\ \begin{pmatrix}0&0&19\\1&0&-33\\0&1&15\end{pmatrix}\big)$✓；其余同法 ? |
| 补充题 1(1) | 友矩阵的最小多项式 | 用 $E,A,\dots,A^{n-1}$ 线性无关 | $m_A=d(\lambda)$ ✓ |
| 补充题 1(2) | 最高不变因子 = 最小多项式 | 各不变因子的友矩阵准对角拼接 | $m_A=d_n(\lambda)$ ✓ |

题量统计：习题 7 题（共 42 个小问：1 有 6 小问、2 有 5 小问、6 有 14 小问、7 有 14 小问，其余各 1）、补充题 1 题（2 小问）。OCR 缺：**无整题缺失**；但习题 1 的 (2)–(6)、2(1)、6(12) 的矩阵在 OCR 中错行残缺，对应格子标 —（后面括注的是辅导书原答案，仅供参考、未复算）。

## 二、难题精解（5 题）

### 习题 2(3) — 含参 λ-矩阵：$\beta=0$ 与 $\beta\ne0$ 是两种局面

**题目**：$A(\lambda)=\begin{pmatrix}\lambda+\alpha&\beta&1&0\\-\beta&\lambda+\alpha&0&1\\0&0&\lambda+\alpha&\beta\\0&0&-\beta&\lambda+\alpha\end{pmatrix}$，求不变因子。

**解**：

1. 按两个 $2\times2$ 块算行列式：$D_4=\vert A(\lambda)\vert=\big[(\lambda+\alpha)^2+\beta^2\big]^2$。
2. $\beta=0$ 时矩阵变成两个 $\begin{pmatrix}\lambda+\alpha&1\\0&\lambda+\alpha\end{pmatrix}$ 的直和：取 $2$ 阶子式（第 1、2 行第 3、4 列）得 $1$，故 $D_1=D_2=1$；而 $3$ 阶子式全是 $(\lambda+\alpha)^2$ 或 $(\lambda+\alpha)^3$ 的倍数，故 $D_3=(\lambda+\alpha)^2$。
3. 于是 $\beta=0$ 时不变因子为 $1,\ 1,\ (\lambda+\alpha)^2,\ (\lambda+\alpha)^2$。
4. $\beta\ne0$ 时取 $3$ 阶子式（第 1、2、4 行，第 1、3、4 列），算得 $2\beta(\lambda+\alpha)$；它与 $D_4$ 互素（$\gcd(\lambda+\alpha,\ (\lambda+\alpha)^2+\beta^2)=1$），故 $D_3=D_2=D_1=1$。
5. 故 $\beta\ne0$ 时不变因子为 $1,\ 1,\ 1,\ \big[(\lambda+\alpha)^2+\beta^2\big]^2$。

**关键一步**：先算 $D_4$，再找"与 $D_4$ 互素"的低阶子式把 $D_k$ 压成 1——这是全章通用的动作。本题的关键是 $\beta=0$ 时那个子式 $2\beta(\lambda+\alpha)$ 直接变成 $0$，互素论证失效，必须回到定义分情形。

**易错**：① 漏掉 $\beta=0$ 这一分支（$D_3$ 从 $(\lambda+\alpha)^2$ 掉到 1）；② 以为 $2\beta(\lambda+\alpha)$ 与 $D_4$ 有公因式 $(\lambda+\alpha)$（当 $\beta\ne0$ 时 $\gcd(\lambda+\alpha,\beta^2)=1$，其实互素）；③ 忘记首一化，把常数倍写进答案。

### 习题 5 — 若尔当块的幂：拆成 $\lambda E+N$ 再用二项式

**题目**：$A=\begin{pmatrix}\lambda&0&0\\1&\lambda&0\\0&1&\lambda\end{pmatrix}$，求 $A^k$（$k$ 为正整数）。

**解**：

1. 拆 $A=\lambda E+N$，其中 $N=\begin{pmatrix}0&0&0\\1&0&0\\0&1&0\end{pmatrix}$，且 $\lambda E$ 与 $N$ 可交换。
2. 算幂：$N^2=\begin{pmatrix}0&0&0\\0&0&0\\1&0&0\end{pmatrix}$，$N^3=O$。
3. 二项式定理只留三项：$A^k=\sum_{j=0}^{2}\binom{k}{j}\lambda^{k-j}N^j$。
4. 写开：
$$A^k=\begin{pmatrix}\lambda^k&0&0\\ k\lambda^{k-1}&\lambda^k&0\\ \binom{k}{2}\lambda^{k-2}&k\lambda^{k-1}&\lambda^k\end{pmatrix}.$$

**关键一步**：$N$ 的幂零阶是 $3$，所以展开只有三项；而"$\lambda E$ 与 $N$ 可交换"是二项式定理能用的前提——不可交换时这个公式整条作废。

**易错**：① 不检查可交换就套二项式；② $N^2$ 的位置（比 $N$ 再下移一行）；③ $k<2$ 时 $\lambda^{k-2}$ 是负指数，$k=0,1$ 要单独写（$A^0=E$，$A^1=A$）。

### 习题 6(10) — 三次特征多项式：三根互异就直接对角化

**题目**：$A=\begin{pmatrix}8&30&-14\\-6&-19&9\\-6&-23&11\end{pmatrix}$，求若尔当标准形。

**解**：

1. 算 $\vert\lambda E-A\vert=\lambda^3+30\lambda-8$。自检：$\operatorname{tr}A=8-19+11=0$（无 $\lambda^2$ 项），$\vert A\vert=8$（常数项为 $-\vert A\vert=-8$）。
2. 判别式：对 $\lambda^3+p\lambda+q$ 有 $\Delta=-4p^3-27q^2$，这里 $p=30,\ q=-8$，$\Delta=-4\cdot27000-27\cdot64=-109728\ne0$，故无重根。
3. 三次实系数多项式必有一实根，另两根为其轭；$\Delta\ne0$ 保证三根互异。
4. 三个互异特征值 $\Rightarrow$ 有 $3$ 个线性无关特征向量 $\Rightarrow$ 可对角化，若尔当形为 $\operatorname{diag}(\lambda_1,\lambda_2,\lambda_3)$（$\lambda_k$ 由 Cardano 公式给出，见辅导书原解）。

**关键一步**：判"能否对角化"先看根的重数，不必解出根。三次多项式只要判别式非零，就一定可对角化——这题的全部难点只是验证 $\Delta\ne0$。

**易错**：① 以为必须解出三个根才能写若尔当形；② 把常数项符号弄反（三次式常数项 $=-|A|$）；③ 拿"实根个数"当"特征值个数"（这里只有 1 个实根，但有 3 个复特征值）。

### 习题 6(13) + 7(13) — 同一矩阵：若尔当形 vs 有理标准形

**题目**：$A=\begin{pmatrix}1&-3&0&3\\-2&6&0&13\\0&-3&1&3\\-1&2&0&8\end{pmatrix}$。(1) 求若尔当形；(2) 视 $A$ 为 $\mathbb{Q}$ 上矩阵，求有理标准形。

**解**：

1. 对 $\lambda E-A$ 作初等变换（先把第 1 列化出 $\lambda-1$，再消），得不变因子 $1,\ 1,\ \lambda-1,\ (\lambda-1)(\lambda^2-14\lambda+19)$。
2. 初等因子：$\lambda-1$；$\lambda-1$；$\lambda-(7+\sqrt{30})$；$\lambda-(7-\sqrt{30})$。
3. 一因子一块：若尔当形 $\operatorname{diag}\big(1,\ 1,\ 7+\sqrt{30},\ 7-\sqrt{30}\big)$。
4. 有理标准形：$\lambda-1$ 的友矩阵是 $[\,1\,]$；$d_4=(\lambda-1)(\lambda^2-14\lambda+19)=\lambda^3-15\lambda^2+33\lambda-19$ 的友矩阵为 $\begin{pmatrix}0&0&19\\1&0&-33\\0&1&15\end{pmatrix}$。故有理标准形
$$\operatorname{diag}\left(1,\ \begin{pmatrix}0&0&19\\1&0&-33\\0&1&15\end{pmatrix}\right).$$
5. 自检：两形特征多项式都是 $(\lambda-1)^2(\lambda^2-14\lambda+19)$，块阶和 $1+1+1+1=4$。

**关键一步**：有理标准形只用不变因子，**不需要**在数域上分解——所以 $7\pm\sqrt{30}$ 这种无理根照样写得出；若尔当形则必须在 $\mathbb{C}$ 上取一次因子。两者是同一个相似类的两种规范形。

**易错**：① 把两个 $\lambda-1$ 合并成一个 2 阶块（两个一次初等因子 = 两个 1 阶块）；② 友矩阵末列符号（是 $-a_i$，不是 $a_i$）；③ 有理标准形里不要漏掉 $[\,1\,]$ 这一块（它来自不变因子 $\lambda-1$；那些等于 1 的不变因子不出块）。

### 补充题 1(2) — 最高次不变因子就是最小多项式

**题目**：设 $A$ 的最高次不变因子是 $d(\lambda)$，证明 $A$ 的最小多项式是 $d(\lambda)$。

**解**：

1. 设有非平凡不变因子 $d_1\mid d_2\mid\dots\mid d_s$，$d_s=d(\lambda)$。
2. 由有理标准形定理，$A$ 相似于准对角矩阵 $\operatorname{diag}(B_1,\dots,B_s)$，$B_i$ 是 $d_i$ 的友矩阵。
3. 由补充题 1(1)，$m_{B_i}=d_i$；而准对角矩阵的最小多项式是各块最小多项式的**最小公倍式**，即 $\operatorname{lcm}(d_1,\dots,d_s)$。
4. 由于 $d_i\mid d_{i+1}$，$\operatorname{lcm}=d_s=d(\lambda)$。相似不改变最小多项式，故 $m_A=d(\lambda)$。

**关键一步**：把"最小多项式"翻译成"各块最小多项式的最小公倍式"，再用整除链把 lcm 塌成最大的那个。没有整除链，lcm 一般不等于最大者。

**易错**：① 误用最大公因式（是 lcm 不是 gcd）；② 只用"$A$ 相似于准对角"而没说最小多项式在相似下不变；③ 把 $d(\lambda)$ 说成特征多项式（特征多项式是 $\prod d_i$，两者只在 $s=1$ 时相等）。

## 三、与章节的分工

- 本章理论/框架 → chapters/ch08-lambda-matrices.md（定理1–15、Smith 形算法、三种规范形对照表）。
- 本章典型题精解（6 题：教材 §8.3 例、习题 1(1)、6(2)、6(4)+7(4)、4、补充题 1(1)）→ 同文件的「典型题精解」，不在此重复。
- 本节只补：**42 个小问的答案索引**（题号、题型、起手、答案）+ 章节没细讲的题：含参 $\beta$ 讨论（2(3)）、若尔当块幂（5）、三根互异（6(10)）、若尔当形与有理标准形对照（6(13)+7(13)）、$m_A=d_n$ 的证明（补充题 1(2)）。
