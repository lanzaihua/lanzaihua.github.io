# 第九章 定积分 (Definite Integrals)

> 《数学分析》第六版（上册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

定积分是**一种特殊和式的极限**：把 $[a,b]$ 分割、在每段上取点、求和，再让分割的模趋于 0。它的定义本身是构造性的（"分割—近似求和—取极限"），但**按定义算积分几乎总是不可行**。本章的两条主线因此是：(1) **可积性**——什么样的函数这个极限存在？答案是达布判别法 $S(T)-s(T)<\varepsilon$；(2) **可计算性**——牛顿–莱布尼茨公式把定积分化归为求原函数，而微积分学基本定理（定理9.10）又反过来用定积分证明了连续函数必有原函数。至此微分与积分这两个看似无关的概念被彻底打通。

## Frameworks Introduced / 核心框架

- **定义1（分割与模）**：$[a,b]$ 上的分点 $a=x_0<x_1<\cdots<x_n=b$ 构成一个**分割** $T=\{\Delta_1,\dots,\Delta_n\}$；$\|T\|=\max_i\Delta x_i$ 称为 $T$ 的**模**。
  - 关键点：$\|T\|$ 只反映"最粗的那一段"，$\Delta x_i\le\|T\|$；模相同的分割有无穷多个。
- **定义2（积分和/黎曼和）**：对 $T$ 与任取的 $\xi_i\in\Delta_i$，$\displaystyle\sum_{i=1}^n f(\xi_i)\Delta x_i$ 称为 $f$ 在 $[a,b]$ 上的一个积分和。
  - 关键点：积分和既依赖 $T$ 又依赖 $\{\xi_i\}$，这就是它比函数极限复杂的原因。
- **定义3（可积与定积分）**：若存在实数 $J$，使任给 $\varepsilon>0$ 总有 $\delta>0$，只要 $\|T\|<\delta$ 且 $\{\xi_i\}$ 任取，就有 $\big|\sum f(\xi_i)\Delta x_i-J\big|<\varepsilon$，则称 $f$ 在 $[a,b]$ 上**可积**，记 $J=\int_a^b f(x)dx$。
  - 关键点：$J$ 只依赖 $f$ 与 $[a,b]$，与积分变量记号无关；规定 $\int_a^a f=0$，$\int_a^b f=-\int_b^a f$（$a>b$）。
- **定理9.2（可积的必要条件）**：$f$ 在 $[a,b]$ 上可积 $\Rightarrow$ $f$ 在 $[a,b]$ 上有界。
  - 关键点：逆命题不真。狄利克雷函数有界但不可积（例1）。以后讨论可积性**默认 $f$ 有界**。
- **达布和**：$M_i=\sup_{\Delta_i}f$，$m_i=\inf_{\Delta_i}f$，$\omega_i=M_i-m_i$（振幅），
  $$S(T)=\sum M_i\Delta x_i\ (\text{上和}),\qquad s(T)=\sum m_i\Delta x_i\ (\text{下和}),\qquad S(T)-s(T)=\sum\omega_i\Delta x_i .$$
  对任何 $\{\xi_i\}$ 有 $s(T)\le\sum f(\xi_i)\Delta x_i\le S(T)$。达布和**只依赖 $T$**。
- **定理9.3 / 9.3′（可积准则，第二充要条件）**：$f$ 在 $[a,b]$ 上可积 $\iff$ 任给 $\varepsilon>0$ 存在分割 $T$ 使
  $$S(T)-s(T)<\varepsilon,\qquad\text{等价地}\qquad\sum_i\omega_i\Delta x_i<\varepsilon .$$
  - 何时用：这是**最常用**的可积性判据——只需证明"细分后振幅之和可任意小"，不必预知积分值。
  - 关键点：证明见 §6（定理9.15）。
- **定理9.4（连续 $\Rightarrow$ 可积）**：$f$ 在 $[a,b]$ 上连续，则 $f$ 可积。
  - 关键点：证依赖**一致连续性**（第七章有限覆盖定理的推论）：取 $\delta$ 使 $|x'-x''|<\delta\Rightarrow|f(x')-f(x'')|<\frac{\varepsilon}{b-a}$，则 $\|T\|<\delta$ 时 $\omega_i\le\frac{\varepsilon}{b-a}$，$\sum\omega_i\Delta x_i\le\varepsilon$。
- **定理9.5（有限个间断点的有界函数 $\Rightarrow$ 可积）**：证法是把含间断点的小区间 $[b-\delta',b]$ 单独切出来，使 $\omega'\delta'<\frac\varepsilon2$，其余部分（连续）用定理9.4 与 9.3′ 控制。
- **定理9.6（单调 $\Rightarrow$ 可积）**：$f$ 在 $[a,b]$ 上单调，则 $f$ 可积。
  - 关键点：$\sum\omega_i\Delta x_i\le\big(f(b)-f(a)\big)\|T\|$，故取 $\|T\|<\frac{\varepsilon}{f(b)-f(a)}$ 即可。**单调函数的间断点可以有无限多个**仍可积（例2）。
- **定理9.1（牛顿–莱布尼茨公式）**：若 $f$ 在 $[a,b]$ 上连续且存在原函数 $F$（$F'=f$），则 $f$ 可积且
  $$\int_a^b f(x)dx=F(b)-F(a)\ \big(=F(x)\big|_a^b\big).$$
  - 何时用：只要被积函数连续、能求出初等原函数，就用它——这是计算定积分的**主方法**。
  - 关键点：证明对各小区间用拉格朗日中值定理得 $F(b)-F(a)=\sum f(\eta_i)\Delta x_i$，再用 $f$ 的一致连续性比较 $\sum f(\xi_i)\Delta x_i$ 与 $\sum f(\eta_i)\Delta x_i$。条件可减弱为：$F$ 连续、在 $(a,b)$ 可导且 $F'=f$；或 $f$ 可积（不必连续）。
- **定理9.7（积分第一中值定理）**：$f$ 在 $[a,b]$ 上连续 $\Rightarrow$ 存在 $\xi\in[a,b]$ 使 $\displaystyle\int_a^b f(x)dx=f(\xi)(b-a)$。
  - 关键点：$\frac{1}{b-a}\int_a^b f$ 是 $f$ 的**平均值**；证明靠 $m\le f\le M$ 加介值性。中值点可在**开区间** $(a,b)$ 取得。
- **定理9.8（推广的积分第一中值定理）**：$f,g$ 在 $[a,b]$ 上连续且 $g$ 不变号，则存在 $\xi\in[a,b]$ 使 $\displaystyle\int_a^b fg=f(\xi)\int_a^b g$。（$g\equiv1$ 即定理9.7。）
- **定理9.9**：$f$ 在 $[a,b]$ 上可积 $\Rightarrow$ 变上限积分 $\Phi(x)=\int_a^x f(t)dt$ 在 $[a,b]$ 上**连续**。
- **定理9.10（原函数存在定理 / 微积分学基本定理）**：$f$ 在 $[a,b]$ 上连续 $\Rightarrow$ $\Phi(x)=\int_a^x f(t)dt$ 在 $[a,b]$ 上可导且
  $$\Phi'(x)=\frac{d}{dx}\int_a^x f(t)dt=f(x).$$
  - 何时用：处理"积分号内是变限"的极限题（配洛必达法则）、证明积分恒等式、构造原函数。
  - 关键点：证明只用积分第一中值定理：$\frac{\Delta\Phi}{\Delta x}=f(x+\theta\Delta x)$，令 $\Delta x\to0$。由 $F(x)=\int_a^x f+C$ 令 $x=a$ 得 $C=F(a)$，回头即得牛顿–莱布尼茨公式的第二个证明——**此时无须再假设原函数存在**。
- **定理9.11（积分第二中值定理）**：设 $f$ 在 $[a,b]$ 上可积。
  (i) 若 $g$ 在 $[a,b]$ 上**减**且 $g\ge0$，则存在 $\xi\in[a,b]$ 使 $\displaystyle\int_a^b fg=g(a)\int_a^\xi f$；
  (ii) 若 $g$ 在 $[a,b]$ 上**增**且 $g\ge0$，则存在 $\eta\in[a,b]$ 使 $\displaystyle\int_a^b fg=g(b)\int_\eta^b f$。
  - **推论**：$g$ 单调（不必非负）时，存在 $\xi\in[a,b]$ 使 $\displaystyle\int_a^b fg=g(a)\int_a^\xi f+g(b)\int_\xi^b f$。
  - 何时用：估计积分、建立反常积分收敛判别法（第十一章）。
- **定理9.12（定积分换元积分法）**：若 $f$ 在 $[a,b]$ 上连续，$\varphi'$ 在 $[\alpha,\beta]$ 上可积，$\varphi(\alpha)=a$，$\varphi(\beta)=b$，$\varphi([\alpha,\beta])\subset[a,b]$，则
  $$\int_a^b f(x)dx=\int_\alpha^\beta f(\varphi(t))\varphi'(t)dt .$$
  - 关键点：**不必变量还原**——直接把新积分限代入求差即可，这正是与不定积分换元的关键区别。条件可放宽为 $f$ 可积 + $\varphi$ 严格单调。
- **定理9.13（定积分分部积分法）**：若 $u,v$ 在 $[a,b]$ 上可微且 $u',v'$ 可积，则
  $$\int_a^b u(x)v'(x)dx=u(x)v(x)\Big|_a^b-\int_a^b u'(x)v(x)dx .$$
- **例6（$\sin^n$ 的递推公式，必记）**：$J_n=\displaystyle\int_0^{\pi/2}\sin^nx\,dx=\int_0^{\pi/2}\cos^nx\,dx$ 满足
  $$J_n=\frac{n-1}{n}J_{n-2}\ (n\ge2),\qquad
  J_{2m}=\frac{(2m-1)!!}{(2m)!!}\cdot\frac\pi2,\qquad
  J_{2m+1}=\frac{(2m)!!}{(2m+1)!!}.$$
  - **沃利斯（Wallis）公式**：$\displaystyle\lim_{m\to\infty}\frac{1}{2m+1}\left[\frac{(2m)!!}{(2m-1)!!}\right]^2=\frac\pi2$，它揭示了 $\pi$ 与整数间的深刻关系。
- **泰勒公式的积分型余项**：由推广的分部积分公式得 $R_n(x)=\dfrac{1}{n!}\displaystyle\int_{x_0}^x f^{(n+1)}(t)(x-t)^n dt$；对之使用积分第一中值定理即得拉格朗日型余项与柯西型余项
  $$R_n(x)=\frac{1}{n!}f^{(n+1)}\big(x_0+\theta(x-x_0)\big)(1-\theta)^n(x-x_0)^{n+1}\quad(0\le\theta\le1).$$
- **§6 可积性理论补叙（上和与下和的性质）**：
  1. $S(T)=\sup_{\{\xi\}}\sum f(\xi_i)\Delta x_i$，$s(T)=\inf_{\{\xi\}}\sum f(\xi_i)\Delta x_i$。
  2. 添加 $p$ 个新分点得 $T'$：$S(T)\ge S(T')\ge S(T)-(M-m)p\|T\|$；$s(T)\le s(T')\le s(T)+(M-m)p\|T\|$（**加细分点，上和不增、下和不减**）。
  3. 合并两个分割 $T=T'+T''$：$S(T)\le S(T'),S(T'');\ s(T)\ge s(T'),s(T'')$。
  4. 任意 $T',T''$ 有 $s(T')\le S(T'')$ $\Rightarrow$ 上积分 $\overline S=\inf_T S(T)$ 与下积分 $\underline s=\sup_T s(T)$ 存在。
  5. $m(b-a)\le\underline s\le\overline S\le M(b-a)$。
  6. **达布定理**：$\lim_{\|T\|\to0}S(T)=\overline S$，$\lim_{\|T\|\to0}s(T)=\underline s$。
- **定理9.14（可积的第一充要条件）**：$f$ 在 $[a,b]$ 上可积 $\iff \overline S=\underline s$（上积分等于下积分，且此时等于 $\int_a^b f$）。
  - 关键点：狄利克雷函数不可积正是因其 $\overline S=1\ne0=\underline s$。
- **定理9.15（可积的第二充要条件）**：即定理9.3′，在 §6 给出完整证明。
- **定理9.16（可积的第三充要条件）**：$f$ 在 $[a,b]$ 上可积 $\iff$ 任给 $\varepsilon>0,\eta>0$，存在分割 $T$，使 $T$ 中振幅 $\omega_k\ge\varepsilon$ 的那些小区间 $\Delta_k$ 的**总长** $\sum\Delta x_k<\eta$。
  - 何时用：证明有"坏点集"的函数（黎曼函数、复合函数）可积时最省力——只要证明坏区间总长可任意小。
  - 关键点：由它可证黎曼函数 $R$ 在 $[0,1]$ 上可积且 $\int_0^1R=0$（例1）；可证连续函数与可积函数的复合仍可积（例2）。

## Key Concepts / 核心概念

- **分割（partition）与模（mesh）**：把 $[a,b]$ 分成 $n$ 个小区间的分点组；模是最长小区间的长度。
- **积分和 / 黎曼和（Riemann sum）**：$\sum f(\xi_i)\Delta x_i$，既依赖分割又依赖取点。
- **可积 / 黎曼可积（Riemann integrable）**：积分和当 $\|T\|\to0$ 时趋于与分割、取点无关的定数。
- **达布上和 / 下和（upper / lower Darboux sum）**：用 $M_i,m_i$ 代替 $f(\xi_i)$ 得到的和，只依赖分割。
- **振幅（oscillation）**：$\omega_i=M_i-m_i=\sup_{x',x''\in\Delta_i}|f(x')-f(x'')|$。
- **上积分 / 下积分（upper / lower integral）**：$\overline S=\inf_T S(T)$，$\underline s=\sup_T s(T)$。
- **定积分的几何意义**：曲线与 $x$ 轴间正面积与负面积的**代数和**；$f\ge0$ 时即曲边梯形面积。
- **变限积分（integral with variable limit）**：$\Phi(x)=\int_a^x f(t)dt$，是 $x$ 的函数。
- **微积分学基本定理（Fundamental Theorem of Calculus）**：连续函数的变上限积分是其原函数。
- **积分中值定理（mean value theorem for integrals）**：$\int_a^b f=f(\xi)(b-a)$，$\xi$ 为"平均高度"。
- **双阶乘（double factorial）**：$(2m)!!=2\cdot4\cdots2m$，$(2m-1)!!=1\cdot3\cdots(2m-1)$。
- **沃利斯公式（Wallis formula）**：用 $J_n$ 的夹逼导出 $\frac\pi2$ 的无穷乘积型极限。

## Mental Models / 思维模型

- **拿到定积分先分三类**：(1) 能求出初等原函数 $\to$ 牛顿–莱布尼茨公式；(2) 求不出但结构特殊 $\to$ 换元/分部/对称性消项（源书例4 的做法）；(3) 只有和式极限 $\to$ 把它认成某个函数的黎曼和（例2）。
- **要证可积，先看是"连续/单调/有限间断点"哪一类**：三类都有现成定理（9.4/9.6/9.5）。都不属于，就退回定理9.3′，去估计 $\sum\omega_i\Delta x_i$。
- **分裂坏区间**：证明"有限个坏点"不影响可积性的通用套路——把一个小区间切出来单独处理（$\omega\delta<\frac\varepsilon2$），其余部分用已知的连续性结果压住。定理9.5、§6例1、例2 都是这个模板。
- **把"变限积分"看成"带积分号的函数"**：见到 $\lim_{x\to0}\frac{\int_0^x f}{\,x\,}$ 就想到定理9.10 + 洛必达，这是考研与习题里出现频率最高的组合。
- **换元时同步换限，不回代**：定积分的换元只需把上下限跟着换成 $t$ 的值，最后直接代限求差；忘记换限是最常见的失分点。

## Anti-patterns / 常见错误

- **用定义计算定积分却选了"特殊"分割而不先论证可积**：允许取等分分割、取特殊 $\xi_i$ 的**前提**是已知该积分存在（如连续，定理9.4）；否则算出的极限只是某个子列的极限。
- **认为有界必可积**：狄利克雷函数 $D(x)$（有理点取 1、无理点取 0）在 $[0,1]$ 上有界，$\overline S=1,\underline s=0$，不可积。
- **认为 $|f|$ 可积 $\Rightarrow$ $f$ 可积**：性质6 的逆不成立。$f=1$（有理点）$-1$（无理点）时 $|f|\equiv1$ 可积而 $f$ 不可积。
- **认为 $\int fg=\int f\cdot\int g$**：一般不等。性质3 只保证 $f\cdot g$ 可积。
- **换元后没换积分限**（或只换一端）：得到完全荒谬的数值。
- **在 $[a,b]$ 上直接对分段函数用牛顿–莱布尼茨公式**：若原函数在分界点不可导/不连续，须**拆区间**分别用（例1）；否则要用习题9.2第3题的推广形式。
- **误用积分中值定理于不连续函数**：定理9.7 要求 $f$ **连续**；仅可积时只能得到 $\int fg=\mu\int g$（习题9.4第9题），$\mu$ 只是一般实数，未必是某个函数值。
- **把 $\int_a^b f=0$ 当成 $f\equiv0$**：只有 $f\ge0$ **且连续**时才成立（例2）；非负可积函数只要有一个连续点取正值就有 $\int f>0$。

## Reference Tables / 速查表

| 定理 | 条件 | 结论 |
|---|---|---|
| 9.2 | 可积 | $\Rightarrow$ 有界（反之不真） |
| 9.3 / 9.3′ | 任给 $\varepsilon>0$ 存在 $T$：$S(T)-s(T)<\varepsilon$ | $\iff$ 可积（最常用判据） |
| 9.4 | $f$ 连续 | $\Rightarrow$ 可积 |
| 9.5 | $f$ 有界、有限个间断点 | $\Rightarrow$ 可积 |
| 9.6 | $f$ 单调（可有无穷多间断点） | $\Rightarrow$ 可积 |
| 9.14 | 上积分 $=$ 下积分 | $\iff$ 可积 |
| 9.16 | 坏区间总长可任意小 | $\iff$ 可积 |

| 定积分性质 | 内容 | 备注 |
|---|---|---|
| 线性 性质1–2 | $\int(\alpha f+\beta g)=\alpha\int f+\beta\int g$ | 可积函数类对线性封闭 |
| 乘积 性质3 | $f,g$ 可积 $\Rightarrow fg$ 可积 | 但 $\int fg\ne\int f\int g$ |
| 区间可加 性质4 | $\int_a^b=\int_a^c+\int_c^b$ | 配合规定 $\int_a^a=0$、$\int_a^b=-\int_b^a$ 对任意顺序成立 |
| 保号 性质5 | $f\ge0\Rightarrow\int_a^b f\ge0$；$f\le g\Rightarrow\int f\le\int g$ | 推论即积分不等式性 |
| 绝对值 性质6 | $\big|\int_a^b f\big|\le\int_a^b|f|$ | 逆命题不成立 |
| 中值 9.7 / 9.8 | $\int f=f(\xi)(b-a)$；$\int fg=f(\xi)\int g$（$g$ 不变号） | $\xi$ 可在开区间取到 |

| 常用不定积分（配合牛顿–莱布尼茨） | 结果 |
|---|---|
| $\int_0^{\pi}\sin x\,dx$ | $2$ |
| $\int_0^1 x^n dx$ | $\frac{1}{n+1}$ |
| $\int_0^1\frac{dx}{1+x}$ | $\ln2$ |
| $\int_0^{\pi/2}\sin^2x\,dx$ | $\frac\pi4$ |
| $\int_0^1\sqrt{1-x^2}\,dx$ | $\frac\pi4$ |

## Worked Example / 工作示例

**例6（$\sin^nx$ 在 $[0,\frac\pi2]$ 上的递推公式与沃利斯公式）**：求 $J_n=\displaystyle\int_0^{\pi/2}\sin^nx\,dx$（$n$ 为非负整数）。

**第一步：分部积分导出递推。** $n\ge2$ 时，取 $u=\sin^{n-1}x$，$dv=\sin x\,dx$，则 $du=(n-1)\sin^{n-2}x\cos x\,dx$，$v=-\cos x$：
$$J_n=\Big[-\sin^{n-1}x\cos x\Big]_0^{\pi/2}+(n-1)\int_0^{\pi/2}\sin^{n-2}x\cos^2x\,dx .$$
边界项在 $x=0$（$\sin0=0$）与 $x=\frac\pi2$（$\cos\frac\pi2=0$）处均为 0。再用 $\cos^2x=1-\sin^2x$：
$$J_n=(n-1)\int_0^{\pi/2}\sin^{n-2}x\,dx-(n-1)\int_0^{\pi/2}\sin^nx\,dx=(n-1)J_{n-2}-(n-1)J_n .$$
移项得 $nJ_n=(n-1)J_{n-2}$，即
$$\boxed{\,J_n=\frac{n-1}{n}J_{n-2}\quad(n\ge2)\,}$$

**第二步：初值。** $J_0=\displaystyle\int_0^{\pi/2}1\,dx=\frac\pi2$；$J_1=\displaystyle\int_0^{\pi/2}\sin x\,dx=\big[-\cos x\big]_0^{\pi/2}=1$。

**第三步：反复使用递推。**
$$J_{2m}=\frac{2m-1}{2m}\cdot\frac{2m-3}{2m-2}\cdots\frac12\cdot\frac\pi2=\frac{(2m-1)!!}{(2m)!!}\cdot\frac\pi2,$$
$$J_{2m+1}=\frac{2m}{2m+1}\cdot\frac{2m-2}{2m-1}\cdots\frac23\cdot1=\frac{(2m)!!}{(2m+1)!!}.$$
对称性：令 $x=\frac\pi2-t$ 即得 $\displaystyle\int_0^{\pi/2}\cos^nx\,dx=J_n$，故两个积分等值。

**第四步：导出沃利斯公式。** 在 $[0,\frac\pi2]$ 上 $0\le\sin^{2m+1}x\le\sin^{2m}x\le\sin^{2m-1}x$，由保号性 $J_{2m+1}\le J_{2m}\le J_{2m-1}$。代入第三步：
$$\frac{(2m)!!}{(2m+1)!!}\le\frac{(2m-1)!!}{(2m)!!}\cdot\frac\pi2\le\frac{(2m-2)!!}{(2m-1)!!}.$$
记 $R_m=\dfrac{(2m)!!}{(2m-1)!!}$，$A_m=\dfrac{R_m^2}{2m+1}$，$B_m=\dfrac{R_m^2}{2m}$，上面的夹逼即 $A_m\le\dfrac\pi2\le B_m$。于是
$$0<B_m-A_m=\frac{R_m^2}{2m(2m+1)}=\frac{2m+1}{2m}\cdot\frac{R_m^2}{(2m+1)^2}\le\frac{2m+1}{2m}\cdot\frac{B_m}{2m+1}<\frac{1}{m}\left(1+\frac{1}{2m}\right)\frac\pi2\longrightarrow0 .$$
（用了 $R_m^2/(2m+1)=A_m\le\frac\pi2$。）由夹逼定理 $\lim_{m\to\infty}A_m=\lim_{m\to\infty}B_m=\frac\pi2$，即
$$\boxed{\ \lim_{m\to\infty}\frac{1}{2m+1}\left[\frac{(2m)!!}{(2m-1)!!}\right]^2=\frac\pi2\ }$$

**验证**：取 $m=5$。$(2m)!!=10!!=3840$，$(2m-1)!!=9!!=945$。$A_5=\frac{1}{11}\big(\frac{3840}{945}\big)^2=\frac{16{,}384{,}000}{11\times893{,}025}\approx1.6680$；$\frac\pi2\approx1.5708$。$B_5=\frac{1}{10}\big(\frac{3840}{945}\big)^2\approx1.8348$。确有 $A_5<\frac\pi2<B_5$，且区间宽度 $B_5-A_5\approx0.167$ 已不大。再取 $J_4=\frac34\cdot\frac12\cdot\frac\pi2=\frac{3\pi}{16}\approx0.5890$；而 $J_4=\frac{3!!}{4!!}\cdot\frac\pi2=\frac{3}{8}\cdot\frac\pi2=\frac{3\pi}{16}$，一致。 $\square$

## Key Takeaways / 关键结论

1. 定积分的定义是"分割—取点—求和—取极限"，但**计算几乎从不靠定义**，靠牛顿–莱布尼茨公式。
2. 可积的第一个门槛是**有界**（定理9.2），而判据的核心是达布判别法 $S(T)-s(T)<\varepsilon$（定理9.3′）。
3. 三批可积函数：连续函数、只有有限个间断点的有界函数、单调函数（后者的间断点可以无限多）。
4. 微积分学基本定理 $\frac{d}{dx}\int_a^x f=f(x)$ 同时给出了"连续函数必有原函数"这一基本结论，并使牛顿–莱布尼茨公式不再需要额外假设原函数存在。
5. 定积分换元**必须同步换限**，不必变量还原；分部积分是 $uv\Big|_a^b$ 加上一个带负号的积分。
6. $J_n=\int_0^{\pi/2}\sin^nx\,dx$ 的递推公式与沃利斯公式是估计三角积分、推导 $\pi$ 的极限表示的通用工具。
7. §6 的六条达布和性质（特别是加细分点单调性与达布定理）是可积性理论的全部技术基础。

## Connects To / 与其他章节的联系

- **向后依赖**：第一章实数理论（确界、振幅的上确界）；第五章导数与微分；第六章拉格朗日中值定理（定理9.1 证明的核心）与泰勒公式；**第七章**完备性——一致连续性由有限覆盖定理推出，是定理9.4 证明的关键；**第八章**不定积分提供牛顿–莱布尼茨公式所需的原函数与全部积分技巧。
- **向前使用**：第十章定积分的应用（面积、体积、弧长、物理量）；第十一章反常积分——积分第二中值定理（定理9.11）及其推论是建立收敛判别法的工具；第十二章至第十五章级数与含参量积分中反复使用积分中值定理与泰勒公式的积分型余项。
- **回馈**：本章定理9.10 补上了第八章定理8.1（连续函数存在原函数）的证明，使第八章的理论闭环。
