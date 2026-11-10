# 第十五章 傅里叶级数 (Fourier Series)

> 《数学分析》第六版（下册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

本章回答一个表示问题：一个周期函数能不能写成三角函数的叠加？答案是能——只要它分段光滑。全部技术只有两步：**用三角函数系的正交性把系数"投影"出来**（定理15.2），**用收敛定理说清级数在每一点究竟收敛到谁**（定理15.3：收敛到左右极限的算术平均，一般不是 $f(x)$）。第二步常被初学者忽略，而它恰恰决定了答案在间断点和周期端点上该写成什么数。

## Frameworks Introduced / 核心框架

- **三角级数与三角函数系**：由三角函数列 $1,\cos x,\sin x,\cos 2x,\sin 2x,\dots,\cos nx,\sin nx,\dots$ 产生的级数
  $$\frac{a_0}{2}+\sum_{n=1}^{\infty}(a_n\cos nx+b_n\sin nx)$$
  称为三角级数（trigonometric series）。若它收敛，其和函数必以 $2\pi$ 为周期。
- **定理15.1（三角级数的一致收敛判别）**：若 $\dfrac{|a_0|}{2}+\sum_{n=1}^{\infty}(|a_n|+|b_n|)$ 收敛，则该三角级数在整个数轴上绝对收敛且一致收敛。
  - 何时用：需要在级数上做逐项积分、逐项求导之前，先确认它一致收敛。
  - 关键点：证明只有一行 $|a_n\cos nx+b_n\sin nx|\le|a_n|+|b_n|$，套魏尔斯特拉斯判别法（定理13.5）。
- **三角函数系的正交性**：在 $[-\pi,\pi]$ 上
  $$\int_{-\pi}^{\pi}\cos nx\,dx=\int_{-\pi}^{\pi}\sin nx\,dx=0,\qquad \int_{-\pi}^{\pi}\cos mx\cos nx\,dx=0\ (m\ne n),$$
  $$\int_{-\pi}^{\pi}\sin mx\sin nx\,dx=0\ (m\ne n),\qquad \int_{-\pi}^{\pi}\cos mx\sin nx\,dx=0,$$
  而平方项不为零：$\int_{-\pi}^{\pi}\cos^2 nx\,dx=\int_{-\pi}^{\pi}\sin^2 nx\,dx=\pi$，$\int_{-\pi}^{\pi}1^2dx=2\pi$。
  - 何时用：一切系数公式的唯一来源，也是"分母为什么是 $\pi$"的答案。
  - 关键点：可积函数 $\varphi,\psi$ 在 $[a,b]$ 上正交 $\iff \int_a^b\varphi\psi\,dx=0$；正交系里基函数的"长度平方"就是 $\pi$ 或 $2\pi$。
- **定理15.2（傅里叶系数公式）**：若在整个数轴上 $f(x)=\dfrac{a_0}{2}+\sum_{n=1}^{\infty}(a_n\cos nx+b_n\sin nx)$ 且右端一致收敛，则
  $$a_n=\frac{1}{\pi}\int_{-\pi}^{\pi}f(x)\cos nx\,dx\ (n=0,1,2,\dots),\qquad b_n=\frac{1}{\pi}\int_{-\pi}^{\pi}f(x)\sin nx\,dx\ (n=1,2,\dots).$$
  - 何时用：给定 $f$ 求展开式，第一步永远是套这两个公式。
  - 关键点：做法是"两边乘 $\cos kx$ 再逐项积分"，正交性让右端只剩 $a_k\pi$ 一项；**逐项积分需要一致收敛这张许可证**。
- **定理15.3（收敛定理，傅里叶级数收敛定理）**：若以 $2\pi$ 为周期的函数 $f$ 在 $[-\pi,\pi]$ 上**分段光滑（piecewise smooth）**，则在每一点 $x\in[-\pi,\pi]$，
  $$\frac{a_0}{2}+\sum_{n=1}^{\infty}(a_n\cos nx+b_n\sin nx)=\frac{f(x+0)+f(x-0)}{2}.$$
  - 何时用：算出系数之后，用它写下"等号"，并交代间断点与端点处等号右边是什么。
  - 关键点：**分段光滑**指 (i) 至多有限个第一类间断点；(ii) 除至多有限个不可导点外 $f'$ 连续，且 $f'$ 在这些点处的左、右极限都存在。几何上是有限个光滑弧段拼接，至多有限个角点。定理的结论是左右极限的算术平均；$f$ 在该点连续时才退化为 $f(x)$。
- **推论（连续情形的收敛定理）**：若 $f$ 是以 $2\pi$ 为周期的连续函数且在 $[-\pi,\pi]$ 上分段光滑，则 $f$ 的傅里叶级数在 $(-\infty,+\infty)$ 上收敛于 $f$。
  - 关键点：连续性把 $\frac{f(x+0)+f(x-0)}{2}$ 压回 $f(x)$，此时"展开式"才是真正的恒等式。
- **系数公式的平移不变性**：对任意实数 $c$，
  $$a_n=\frac{1}{\pi}\int_c^{c+2\pi}f(x)\cos nx\,dx,\qquad b_n=\frac{1}{\pi}\int_c^{c+2\pi}f(x)\sin nx\,dx .$$
  - 何时用：$f$ 的解析式在 $[0,2\pi]$ 上给出、在 $[-\pi,\pi]$ 上不好写时。
  - 关键点：由 $2\pi$ 周期性，长度为 $2\pi$ 的积分区间可以任意平移。又：题目常只给 $f$ 在 $(-\pi,\pi]$ 上的表达式，应理解为它已作周期延拓 $f(x)=f(x-2k\pi)$。
- **以 $2l$ 为周期的函数的傅里叶级数**：作代换 $t=\dfrac{\pi x}{l}$（即 $x=\dfrac{lt}{\pi}$），得
  $$f(x)\sim\frac{a_0}{2}+\sum_{n=1}^{\infty}\left(a_n\cos\frac{n\pi x}{l}+b_n\sin\frac{n\pi x}{l}\right),$$
  $$a_n=\frac{1}{l}\int_{-l}^{l}f(x)\cos\frac{n\pi x}{l}dx\ (n=0,1,2,\dots),\qquad b_n=\frac{1}{l}\int_{-l}^{l}f(x)\sin\frac{n\pi x}{l}dx\ (n=1,2,\dots).$$
  若 $f$ 在 $[-l,l]$ 上分段光滑，则级数在每点收敛于 $\frac{f(x+0)+f(x-0)}{2}$。
  - 关键点：$x=\frac{lt}{\pi}$ 把 $[-\pi,\pi]$ 拉成 $[-l,l]$，于是分母的 $\pi$ 变成 $l$、频率 $n$ 变成 $\frac{n\pi}{l}$——不必另记一套公式。
- **偶函数与奇函数：余弦级数与正弦级数**：
  - $f$ 偶 $\Rightarrow b_n=0$，只剩**余弦级数（cosine series）** $\dfrac{a_0}{2}+\sum a_n\cos\dfrac{n\pi x}{l}$，其中 $a_n=\dfrac{2}{l}\int_0^{l}f(x)\cos\dfrac{n\pi x}{l}dx$。
  - $f$ 奇 $\Rightarrow a_n=0$，只剩**正弦级数（sine series）** $\sum b_n\sin\dfrac{n\pi x}{l}$，其中 $b_n=\dfrac{2}{l}\int_0^{l}f(x)\sin\dfrac{n\pi x}{l}dx$。
  - 取 $l=\pi$：偶函数 $a_n=\dfrac{2}{\pi}\int_0^{\pi}f(x)\cos nx\,dx$；奇函数 $b_n=\dfrac{2}{\pi}\int_0^{\pi}f(x)\sin nx\,dx$。
  - 何时用：只要 $f$ 有奇偶性，先把积分区间砍掉一半——这是本章最省力的一个观察。
  - 关键点：要展成 $[0,l]$ 上函数的余弦（正弦）级数，须先作**偶延拓（奇延拓）**到 $[-l,l]$；但系数可直接用上面的 $\frac{2}{l}\int_0^{l}$ 公式算，不必真写出延拓后的表达式。
- **预备定理1（贝塞尔不等式）与黎曼–勒贝格定理**：$f$ 在 $[-\pi,\pi]$ 上可积 $\Rightarrow$
  $$\frac{a_0^2}{2}+\sum_{n=1}^{\infty}(a_n^2+b_n^2)\le\frac{1}{\pi}\int_{-\pi}^{\pi}f^2(x)dx .$$
  由此得**推论1（黎曼–勒贝格定理）**：$\lim_{n\to\infty}\int_{-\pi}^{\pi}f(x)\cos nx\,dx=\lim_{n\to\infty}\int_{-\pi}^{\pi}f(x)\sin nx\,dx=0$，即 $a_n\to0,\ b_n\to0$。
  - 关键点：贝塞尔不等式由 $\int_{-\pi}^{\pi}(f-S_m)^2dx\ge0$ 展开、用正交性算成 $\int f^2-\pi\bigl(\frac{a_0^2}{2}+\sum_{n\le m}(a_n^2+b_n^2)\bigr)$ 得到，故部分和有界。**推论2**：同样有 $\lim_{n\to\infty}\int_0^{\pi}f(x)\sin\bigl(n+\frac12\bigr)x\,dx=0$——把 $\sin(n+\frac12)x=\cos\frac x2\sin nx+\sin\frac x2\cos nx$ 拆开，各套推论1。这两个推论是证明收敛定理时把余项压到零的工具。
- **预备定理2（狄利克雷积分）**：设 $f$ 以 $2\pi$ 为周期且在 $[-\pi,\pi]$ 上可积，则部分和
  $$S_n(x)=\frac{1}{\pi}\int_{-\pi}^{\pi}f(x+t)\frac{\sin\bigl(n+\frac12\bigr)t}{2\sin\frac{t}{2}}dt,$$
  其中 $t=0$ 处被积函数按极限 $\lim_{t\to0}\frac{\sin(n+\frac12)t}{2\sin(t/2)}=n+\frac12$ 取值。
- **定理15.3 的证明骨架**：把 $S_n(x)-\frac{f(x+0)+f(x-0)}{2}$ 在 $[0,\pi]$ 上写成两个含狄利克雷核的积分（分别配 $f(x+t)-f(x+0)$ 与 $f(x-t)-f(x-0)$）。因子 $\frac{f(x\pm t)-f(x\pm0)}{2\sin(t/2)}$ 在 $t\to0^+$ 时有有限极限——这正是"分段光滑"要保证的（单侧导数存在且 $2\sin\frac t2\sim t$）——因而它可积；再由黎曼–勒贝格型的推论2，两个积分随 $n\to\infty$ 都趋于 $0$。
  - 何时用：想理解"为什么条件偏偏是分段光滑"时读这一段——条件的作用就是把被积函数补成可积函数。
- **展开一个函数的推荐流程（四步）**：① 确认周期与区间（是 $2\pi$ 还是 $2l$，表达式在哪个区间给出）；② 查奇偶性并决定延拓方式（要正弦级数作奇延拓，要余弦级数作偶延拓，有奇偶性就用区间减半公式）；③ 套 $a_n,b_n$ 的积分公式算系数，注意 $\frac{a_0}{2}$ 要单独算；④ 用定理15.3 写出区间内部的等式，再逐点交代间断点与端点的收敛值。
  - 关键点：第 ④ 步不写，答案就是残的——这是本章与"单纯算积分"的分界线。

## Key Concepts / 核心概念

- **三角级数（trigonometric series）**：形如 $\frac{a_0}{2}+\sum(a_n\cos nx+b_n\sin nx)$ 的函数项级数。
- **三角函数系（trigonometric system）**：$1,\cos x,\sin x,\cos 2x,\sin 2x,\dots$，共同周期 $2\pi$。
- **正交函数系（orthogonal system）**：在 $[a,b]$ 上任意两个不同函数的乘积积分为零的函数族。
- **傅里叶系数（Fourier coefficients）**：由 $a_n,b_n$ 的积分公式算出的数。
- **傅里叶级数（Fourier series）**：以傅里叶系数为系数写出的三角级数，记作 $f(x)\sim\cdots$。
- **分段光滑（piecewise smooth）**：至多有限个第一类间断点，其余处 $f'$ 连续且单侧极限存在。
- **周期延拓（periodic extension）**：把 $(-\pi,\pi]$ 上的表达式按 $f(x-2k\pi)$ 复制到全轴。
- **余弦级数 / 正弦级数（cosine / sine series）**：只含余弦项 / 只含正弦项的级数，分别来自偶延拓 / 奇延拓。
- **狄利克雷积分（Dirichlet integral）**：上面 $S_n(x)$ 的积分表示，核为 $\frac{\sin(n+\frac12)t}{2\sin(t/2)}$。
- **黎曼–勒贝格定理（Riemann–Lebesgue theorem）**：可积函数的高频三角积分趋于零。

## Mental Models / 思维模型

- **把系数公式看成投影**：$f$ 在正交系里的坐标 $=\frac{(f,\text{基函数})}{(\text{基函数},\text{基函数})}$。分母的 $\pi$、$2\pi$、$l$ 就是基函数长度平方，不是随手写的。
- **把收敛定理看成等号的使用说明书**：系数公式只负责算出 $a_n,b_n$；级数在每一点等于几，一律由定理15.3 判定。写答案时先给区间内部的等式，再单独交代间断点与端点。
- **动手积分前先把问题化简**：见到"以 $2l$ 为周期"就按 $x=\frac{lt}{\pi}$ 拉回 $\pi$ 的情形（$l$ 与 $\frac{n\pi}{l}$ 是代换的自动产物）；见到奇偶性就用区间减半的公式（偶 $\Rightarrow$ 只算 $a_n$，奇 $\Rightarrow$ 只算 $b_n$）。不做这两步就开始分部积分，是最常见的浪费。
- **算完系数用特殊点验算**：把 $x$ 取成 $0,\frac{\pi}{2},\pm\pi$，看级数收敛到什么数；这既检查系数符号，又顺带得到 $\sum\frac{1}{n^2}$、$\sum\frac{(-1)^{n+1}}{n}$ 这类数项级数的和。

## Anti-patterns / 常见错误

- **漏掉常数项的 $\frac12$**：常数项是 $\frac{a_0}{2}$ 而非 $a_0$。对 $f\equiv1$ 有 $a_0=\frac{1}{\pi}\int_{-\pi}^{\pi}1\,dx=2$，只有写成 $\frac{a_0}{2}=1$ 才对。
- **在间断点或周期端点上直接写 $f(x)$，或拿定理15.2 处理逐点收敛问题**：$f(x)=x$ 在 $[-\pi,\pi]$ 上的展开在 $x=\pi$ 处收敛于 $\frac{f(\pi-0)+f(-\pi+0)}{2}=0$，不是 $\pi$；而定理15.2 的前提是级数一致收敛，傅里叶级数一般并不一致收敛（矩形波在间断点附近有 Gibbs 现象），逐点结论只能靠定理15.3。
- **在 $[0,\pi]$ 上求正弦级数却仍用 $\frac1\pi\int_{-\pi}^{\pi}$**：应用 $b_n=\frac{2}{\pi}\int_0^{\pi}f(x)\sin nx\,dx$，即等价于先作奇延拓；用错公式会漏掉因子 2。
- **以为 $b_n\to0$ 就保证级数收敛**：黎曼–勒贝格定理只给出必要条件；$\sum\frac1n$ 发散正说明这一条远不充分。
- **忽略 $f$ 的周期性**：只把它当 $[-\pi,\pi]$ 上的函数，就无法理解系数公式里积分区间为何可以平移、$[0,2\pi]$ 上的公式为何照样成立。
- **把延拓方式与积分区间张冠李戴**：$f(x)=x$ 在 $(0,2)$ 上的正弦级数是 $\frac4\pi\sum\frac{(-1)^{n+1}}{n}\sin\frac{n\pi x}{2}$，余弦级数是 $1-\frac{8}{\pi^2}\sum\frac{\cos\frac{(2k-1)\pi x}{2}}{(2k-1)^2}$，二者只在 $(0,2)$ 内相等（端点收敛值不同），不可混用；求 $[0,l]$ 上的余弦 / 正弦级数时公式是 $\frac2l\int_0^{l}$，若误写成 $\frac1l\int_{-l}^{l}$ 却只代入 $[0,l]$ 的表达式，结果会整体差一个因子 2。
- **对不连续点用"连续情形的推论"**：推论要求 $f$ 连续；矩形波、$f(x)=x$ 在 $[-\pi,\pi]$ 上都只满足定理15.3，端点必须按算术平均处理。

## Reference Tables / 速查表

**周期与定义域 → 级数形式与系数**

| $f$ 的周期 / 前提 | 级数形式 | 系数公式 |
|---|---|---|
| $2\pi$ | $\frac{a_0}{2}+\sum(a_n\cos nx+b_n\sin nx)$ | $a_n=\frac1\pi\int_{-\pi}^{\pi}f\cos nx\,dx$，$b_n=\frac1\pi\int_{-\pi}^{\pi}f\sin nx\,dx$ |
| $2l$ | $\frac{a_0}{2}+\sum\bigl(a_n\cos\frac{n\pi x}{l}+b_n\sin\frac{n\pi x}{l}\bigr)$ | $a_n=\frac1l\int_{-l}^{l}f\cos\frac{n\pi x}{l}dx$，$b_n=\frac1l\int_{-l}^{l}f\sin\frac{n\pi x}{l}dx$ |
| $2l$，$f$ 偶 | $\frac{a_0}{2}+\sum a_n\cos\frac{n\pi x}{l}$ | $a_n=\frac2l\int_0^{l}f\cos\frac{n\pi x}{l}dx$，$b_n=0$ |
| $2l$，$f$ 奇 | $\sum b_n\sin\frac{n\pi x}{l}$ | $b_n=\frac2l\int_0^{l}f\sin\frac{n\pi x}{l}dx$，$a_n=0$ |
| $[0,\pi]$ 上求余弦级数 | $\frac{a_0}{2}+\sum a_n\cos nx$ | $a_n=\frac2\pi\int_0^{\pi}f\cos nx\,dx$ |
| $[0,\pi]$ 上求正弦级数 | $\sum b_n\sin nx$ | $b_n=\frac2\pi\int_0^{\pi}f\sin nx\,dx$ |

**级数在各类点的收敛值（定理15.3）**

| 点的类型 | 收敛于 |
|---|---|
| $f$ 的连续点 | $f(x)$ |
| 第一类间断点 | $\dfrac{f(x+0)+f(x-0)}{2}$ |
| 周期端点 $\pm\pi$ | $\dfrac{f(\pi-0)+f(-\pi+0)}{2}$ |

**本章标准展开式（可直接引用）**

| $f(x)$ | 展开式 | 成立范围 |
|---|---|---|
| $f(x)=x$（奇函数，周期 $2\pi$） | $2\sum_{n\ge1}\dfrac{(-1)^{n+1}}{n}\sin nx$ | $(-\pi,\pi)$ |
| $f=\frac{\pi}{4}\ (0<x<\pi)$，$f=-\frac{\pi}{4}\ (-\pi<x<0)$（矩形波） | $\sin x+\frac13\sin3x+\frac15\sin5x+\cdots$ | $x\ne k\pi$ |
| $f(x)=x\ (0\le x\le\pi)$，$f=0\ (-\pi<x<0)$ | $\frac{\pi}{4}-\frac{2}{\pi}\sum_{k\ge1}\frac{\cos(2k-1)x}{(2k-1)^2}+\sum_{n\ge1}\frac{(-1)^{n+1}}{n}\sin nx$ | $(-\pi,\pi)$ |
| $f(x)=\lvert\sin x\rvert$（偶函数） | $\frac{2}{\pi}-\frac{4}{\pi}\sum_{m\ge1}\frac{\cos2mx}{4m^2-1}$ | 全轴 |

## Worked Example / 工作示例

**问题（§2 例4）** 设 $f(x)=x$ 定义在 $(0,2)$ 上，分别求它的 1) 正弦级数；2) 余弦级数。

此处 $l=2$，频率为 $\frac{n\pi x}{l}=\frac{n\pi x}{2}$。

**1) 正弦级数：作奇延拓**

奇延拓给出 $a_n=0\ (n=0,1,2,\dots)$，只需算
$$b_n=\frac{2}{2}\int_0^{2}x\sin\frac{n\pi x}{2}dx=\int_0^{2}x\sin\frac{n\pi x}{2}dx .$$
记 $k=\frac{n\pi}{2}$，由 $\int x\sin kx\,dx=-\frac{x\cos kx}{k}+\frac{\sin kx}{k^2}$，
$$b_n=\left[-\frac{x\cos kx}{k}+\frac{\sin kx}{k^2}\right]_0^{2}=-\frac{2\cos 2k}{k}+\frac{\sin 2k}{k^2}.$$
代入 $2k=n\pi$，$\cos n\pi=(-1)^n$，$\sin n\pi=0$：
$$b_n=-\frac{2(-1)^n}{n\pi/2}=\frac{4(-1)^{n+1}}{n\pi}.$$
于是由正弦级数公式与收敛定理，当 $x\in(0,2)$ 时
$$x=\frac{4}{\pi}\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}\sin\frac{n\pi x}{2}=\frac{4}{\pi}\left(\sin\frac{\pi x}{2}-\frac12\sin\pi x+\frac13\sin\frac{3\pi x}{2}-\cdots\right).$$
**端点检验**：$x=0$ 处 $\frac{f(0+0)+f(0-0)}{2}=\frac{0+0}{2}=0$；$x=2$ 处奇延拓在两侧的值为 $2$ 与 $-2$，故收敛于 $\frac{2+(-2)}{2}=0$。与"当 $x=0,2$ 时右边级数收敛于 0"一致（每项均为 $0$）。

**2) 余弦级数：作偶延拓**

偶延拓给出 $b_n=0$，且
$$a_0=\frac{2}{2}\int_0^{2}x\,dx=\left[\frac{x^2}{2}\right]_0^{2}=2\ \Longrightarrow\ \frac{a_0}{2}=1,$$
$$a_n=\int_0^{2}x\cos\frac{n\pi x}{2}dx=\left[\frac{x\sin kx}{k}+\frac{\cos kx}{k^2}\right]_0^{2}=\frac{2\sin n\pi}{k}+\frac{\cos n\pi-1}{k^2}=\frac{4\bigl((-1)^n-1\bigr)}{n^2\pi^2}.$$
所以 $a_n=0$（$n$ 偶），$a_n=-\dfrac{8}{n^2\pi^2}$（$n$ 奇）。于是
$$x=1-\frac{8}{\pi^2}\sum_{k=1}^{\infty}\frac{1}{(2k-1)^2}\cos\frac{(2k-1)\pi x}{2},\qquad 0\le x\le2 .$$
**端点检验**：偶延拓后的函数是周期为 4 的偶函数，在 $x=0$ 连续且值为 $0$；令 $x=0$ 得
$$0=1-\frac{8}{\pi^2}\sum_{k=1}^{\infty}\frac{1}{(2k-1)^2}\ \Longrightarrow\ \sum_{k=1}^{\infty}\frac{1}{(2k-1)^2}=\frac{\pi^2}{8},$$
再由 $\sum\frac{1}{n^2}=\sum_{\text{奇}}\frac{1}{n^2}+\sum_{\text{偶}}\frac{1}{n^2}=\frac{\pi^2}{8}+\frac14\sum\frac{1}{n^2}$ 反解出 $\sum_{n\ge1}\frac{1}{n^2}=\frac{\pi^2}{6}$。在 $x=2$ 处 $\cos(2k-1)\pi=-1$，级数给出 $1+\frac{8}{\pi^2}\cdot\frac{\pi^2}{8}=2$，与偶延拓在 $x=2$ 的值 $2$ 相符。

**结论**：同一个 $f(x)=x$ 在 $(0,2)$ 上，奇延拓与偶延拓给出两个完全不同的级数，但都在 $(0,2)$ 内收敛到 $x$——延拓方式决定级数的形状，收敛定理决定等号成立的范围。

## Key Takeaways / 关键结论

1. 傅里叶系数的唯一来源是正交性：$a_n=\frac1\pi\int_{-\pi}^{\pi}f\cos nx\,dx$，$b_n=\frac1\pi\int_{-\pi}^{\pi}f\sin nx\,dx$；$2l$ 情形把 $\pi$ 换成 $l$、$nx$ 换成 $\frac{n\pi x}{l}$。
2. 先查奇偶性：偶函数只剩余弦级数（$b_n=0$），奇函数只剩正弦级数（$a_n=0$），系数用 $\frac{2}{l}\int_0^{l}$。
3. 等号右边由收敛定理（定理15.3）决定：连续点取 $f(x)$，间断点取 $\frac{f(x+0)+f(x-0)}{2}$，周期端点同理。
4. 求 $[0,l]$ 上的余弦 / 正弦级数就是作偶 / 奇延拓，但系数可直接由区间减半的公式算。
5. $a_n\to0,\ b_n\to0$（黎曼–勒贝格定理）是收敛的必要条件，不是充分条件。
6. 把特殊点代回展开式，可以得到 $\sum\frac{1}{n^2}=\frac{\pi^2}{6}$、$\sum\frac{1}{(2k-1)^2}=\frac{\pi^2}{8}$、$\sum\frac{(-1)^{n+1}}{n}=\frac{\pi}{4}$ 类型的数项级数和——本章最常见的副产品。
7. 定理15.2 要求一致收敛才可逐项积分；一般傅里叶级数只有逐点收敛，此时一切结论以定理15.3 为准。

## Connects To / 与其他章节的联系

- **依赖**：第十三章（函数列与函数项级数）的一致收敛概念与魏尔斯特拉斯判别法（定理13.5），是定理15.1、15.2 的前提；第十二章三角恒等式提供了狄利克雷积分里的核 $\frac12+\sum_{k=1}^{n}\cos kt=\frac{\sin(n+\frac12)t}{2\sin(t/2)}$；积分工具来自第九、十章。
- **对照**：第十四章用幂级数表示函数，要求无穷次可微且只在收敛区间内有效；傅里叶级数只要求分段光滑，却在整个周期上有效。两条"展开"路线互为补充。
- **向前**：第十八章的含参量积分、第二十二章§4 的 $\nabla$ 记号都会再次用到正交函数系与谐波分解；工程技术中的谐波分析（矩形波的分解即 §1 例3）直接建立在本章结论上。
- **与第十六、十七章的关系**：那两章把极限、连续、微分搬到多元，讨论函数的局部性质；本章处理的是函数的整体表示，二者方法不同但都以极限与一致收敛为语言。
