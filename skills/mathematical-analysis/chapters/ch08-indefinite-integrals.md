# 第八章 不定积分 (Indefinite Integrals)

> 《数学分析》第六版（上册）· 华东师范大学数学科学学院 编
>
> 📝 **本章作业**：作业集 **8-1 – 8-3**（题 63–69，§8.1–§8.3）→ [problems/p07-integration-basics.md](../problems/p07-integration-basics.md)、[p08](../problems/p08-integration-parts-rational.md)

## Core Idea / 核心思想

微分法有逆运算——积分法。求不定积分就是"已知导函数 $f$，反求 $F$ 使 $F'=f$"。与求导不同，这个逆问题**没有构造性定义**，只能靠"试探 + 变形"：把被积表达式通过代数恒等变形、换元、分部、部分分式分解，**化成基本积分表中的形式**。因此本章的全部技术可以概括为一句话：*把陌生的积分，变成表里的积分*。定理8.1 保证连续函数一定有原函数（证明在第九章§5），所以"求不出来"只意味着求不出初等原函数，而非原函数不存在。

## Frameworks Introduced / 核心框架

- **定义1（原函数）**：设 $f$ 与 $F$ 在区间 $I$ 上都有定义，若 $F'(x)=f(x),\ x\in I$，则称 $F$ 为 $f$ 在 $I$ 上的一个原函数。
- **定理8.1（原函数的存在性）**：若 $f$ 在区间 $I$ 上连续，则 $f$ 在 $I$ 上存在原函数。
  - 何时用：先判断"这个积分有没有指望"。初等函数在其定义区间上连续，故都有原函数（但原函数未必仍是初等函数）。
  - 关键点：证明推迟到第九章§5（定理9.10）；含第一类间断点的函数一定没有原函数。
- **定理8.2（原函数族与唯一性）**：(i) $F+C$ 也是 $f$ 的原函数；(ii) $f$ 在 $I$ 上任意两个原函数只相差一个常数。
  - 关键点：(ii) 的依据是 $(F-G)'\equiv0\Rightarrow F-G\equiv C$（拉格朗日中值定理的推论）——**要求区间 $I$ 是区间**，不是任意点集。
- **定义2（不定积分）**：$f$ 在区间 $I$ 上的全体原函数称为 $f$ 的不定积分，记 $\displaystyle\int f(x)\,dx=F(x)+C$。称 $\int$ 为积分号，$f$ 为被积函数，$f(x)dx$ 为被积表达式，$x$ 为积分变量。
  - 关键点：不定积分是**函数族**，不是函数；由 (3)(4) 两式 $\big(\int f\,dx\big)'=f$，$d\int f\,dx=f\,dx$。
- **定理8.3（线性运算法则）**：若 $f,g$ 在 $I$ 上都有原函数，$k_1,k_2$ 不同时为零，则
  $$\int\big(k_1f(x)+k_2g(x)\big)dx=k_1\int f(x)dx+k_2\int g(x)dx .$$
  - 何时用：被积函数是若干项之和、或可拆成常数倍的已知积分时，第一步就做这个拆分。
- **基本积分表**（必须背熟，是所有化简的终点）：
  1. $\int 0\,dx=C$；&nbsp; 2. $\int 1\,dx=x+C$；&nbsp; 3. $\int x^{\alpha}dx=\dfrac{x^{\alpha+1}}{\alpha+1}+C\ (\alpha\ne-1)$；
  4. $\int\dfrac{dx}{x}=\ln|x|+C\ (x\ne0)$；&nbsp; 5. $\int e^{x}dx=e^{x}+C$；&nbsp; 6. $\int a^{x}dx=\dfrac{a^{x}}{\ln a}+C\ (a>0,a\ne1)$；
  7. $\int\cos ax\,dx=\dfrac1a\sin ax+C$；&nbsp; 8. $\int\sin ax\,dx=-\dfrac1a\cos ax+C$（$a\ne0$）；
  9. $\int\sec^2x\,dx=\tan x+C$；&nbsp; 10. $\int\csc^2x\,dx=-\cot x+C$；
  11. $\int\sec x\tan x\,dx=\sec x+C$；&nbsp; 12. $\int\csc x\cot x\,dx=-\csc x+C$；
  13. $\int\dfrac{dx}{\sqrt{1-x^2}}=\arcsin x+C$；&nbsp; 14. $\int\dfrac{dx}{1+x^2}=\arctan x+C$。
- **定理8.4（第一换元积分法 / 凑微分法）**：设 $f$ 在 $I$ 上有定义，$\varphi$ 在 $J$ 上可导且 $\varphi(J)\subset I$。若 $\int f(x)dx=F(x)+C$ 在 $I$ 上存在，则 $\int f(\varphi(t))\varphi'(t)dt$ 在 $J$ 上存在且等于 $F(\varphi(t))+C$。
  - 何时用：被积函数能写成 $f(\varphi(x))\varphi'(x)$ 的形状，即"某个函数的导数恰好作为因子出现"。
  - 关键点：简便写法 $\int f(\varphi(t))\varphi'(t)dt=\int f(\varphi(t))d\varphi(t)$；熟练后可省去 $u$，但**最后必须把 $u$ 还原为 $x$**。
- **定理8.5（第二换元积分法 / 代入换元法）**：设 $f$ 在 $I$ 上有定义，$\varphi$ 在 $J$ 上可导，$\varphi(J)=I$，且 $x=\varphi(t)$ 在 $J$ 上有反函数 $t=\varphi^{-1}(x)$。若 $\int f(x)dx$ 在 $I$ 上存在，则当 $\int f(\varphi(t))\varphi'(t)dt=G(t)+C$ 在 $J$ 上存在时，$\int f(x)dx=G(\varphi^{-1}(x))+C$。
  - 何时用：被积函数含根式（$\sqrt{a^2-x^2}$、$\sqrt{x^2\pm a^2}$、$\sqrt[n]{\frac{ax+b}{cx+d}}$），用代换把根式消掉。
  - 关键点：**必须存在反函数**，所以要选单调区间（如 $x=a\sin t$ 时取 $|t|\le\frac\pi2$）。另有注2：把"存在反函数"换成更强的 $\varphi'(t)\ne0$ 也可。
- **定理8.6（分部积分法）**：若 $u,v$ 可导且 $\int u'(x)v(x)dx$ 存在，则 $\int u(x)v'(x)dx$ 存在，且
  $$\int u(x)v'(x)dx=u(x)v(x)-\int u'(x)v(x)dx,\qquad\text{简写}\quad\int u\,dv=uv-\int v\,du .$$
  - 何时用：被积函数是**两类不同函数之积**——反三角、对数、幂、三角、指数。按"反对幂三指"的顺序取靠前者为 $u$。
  - 关键点：有时需连续分部数次（$x^2e^{-x}$），有时分部后出现与原积分同类的项，需**移项解方程**（$\int e^{ax}\cos bx\,dx$）。
- **例16（递推公式）**：$I_n=\displaystyle\int\frac{dx}{(1+x^2)^n}$ 满足 $I_n=\dfrac{1}{2(n-1)}\Big[\dfrac{x}{(1+x^2)^{n-1}}+(2n-3)I_{n-1}\Big]$（$n\ge2$），递推到已知的 $I_1=\arctan x+C$。
- **有理函数的不定积分——部分分式分解的完整流程**：
  1. **降次**：若为假分式（分子次数 $\ge$ 分母次数），先做多项式除法，拆成"多项式 + 真分式"。
  2. **分解分母**：在实系数内把 $Q(x)$ 作标准分解 $Q(x)=(x-a_1)^{\lambda_1}\cdots(x-a_s)^{\lambda_s}(x^2+p_1x+q_1)^{\mu_1}\cdots(x^2+p_tx+q_t)^{\mu_t}$，其中 $p_j^2-4q_j<0$（不可再分解的二次因式）。
  3. **写出待定形式**：因式 $(x-a)^k$ 对应 $\dfrac{A_1}{x-a}+\dfrac{A_2}{(x-a)^2}+\cdots+\dfrac{A_k}{(x-a)^k}$；因式 $(x^2+px+q)^k$ 对应 $\dfrac{B_1x+C_1}{x^2+px+q}+\cdots+\dfrac{B_kx+C_k}{(x^2+px+q)^k}$。
  4. **定系数**：两边乘 $Q(x)$ 得恒等式，比较同幂项系数解线性方程组；或代入 $Q(x)=0$ 的根与若干个简单值（$x=0,\pm1$）快速求系数。
  5. **逐项积分**：最终只归结为两类——**(I)** $\int\dfrac{dx}{(x-a)^k}$（$k=1$ 给 $\ln|x-a|$；$k>1$ 给 $\dfrac{1}{(1-k)(x-a)^{k-1}}$）；**(II)** $\int\dfrac{Mx+N}{(x^2+px+q)^k}dx$，先配方令 $t=x+\frac p2$ 化为 $\int\frac{Lt+N'}{(t^2+r^2)^k}dt$，拆成 $\frac{L}{2}\!\int\frac{d(t^2+r^2)}{(t^2+r^2)^k}$ 与 $N'\!\!\int\frac{dt}{(t^2+r^2)^k}$，后者用递推公式降到 $I_1=\frac1r\arctan\frac tr$。
- **三角函数有理式 $R(\sin x,\cos x)$ 的万能代换**：令 $t=\tan\dfrac x2$，则
  $$\sin x=\frac{2t}{1+t^2},\qquad \cos x=\frac{1-t^2}{1+t^2},\qquad dx=\frac{2}{1+t^2}\,dt .$$
  - 何时用：被积函数是 $\sin x,\cos x$ 的有理式，且看不到更省的凑法时。
  - 关键点：**总是有效，但不总是最省**。若只含 $\sin^2x,\cos^2x,\sin x\cos x$，直接用 $t=\tan x$ 更快。
- **某些无理根式的不定积分**：
  - $\int R\big(x,\sqrt[n]{\frac{ax+b}{cx+d}}\big)dx$（$ad-bc\ne0$）：令 $t=\sqrt[n]{\frac{ax+b}{cx+d}}$ 即化为有理函数。
  - $\int R(x,\sqrt{ax^2+bx+c})dx$：配方后归结为 $\int R(u,\sqrt{u^2\pm k^2})du$ 或 $\int R(u,\sqrt{k^2-u^2})du$，分别令 $u=k\tan t$、$u=k\sec t$、$u=k\sin t$。
  - **欧拉变换**（更快）：若 $a>0$ 令 $\sqrt{ax^2+bx+c}=\sqrt a\,x\pm t$；若 $c>0$ 令 $\sqrt{ax^2+bx+c}=xt\pm\sqrt c$。平方后能消去 $x^2$ 项，直接解出 $x$ 为 $t$ 的有理函数。

## Key Concepts / 核心概念

- **原函数（antiderivative）**：$F'=f$，$F$ 是 $f$ 的原函数。
- **不定积分（indefinite integral）**：$f$ 的全体原函数，是一族函数 $F+C$。
- **积分常数（constant of integration）**：$C$，任取实数值；漏写即错。
- **积分曲线族（family of integral curves）**：$y=F(x)+C$ 的图像，横坐标相同的点处切线互相平行。
- **积分表（table of integrals）**：14 条基本公式，是全部化简的归宿。
- **凑微分（subsuming under the differential）**：第一换元法的实际操作形式。
- **部分分式分解（partial fraction decomposition）**：把有理真分式拆成简单分式之和。
- **真分式 / 假分式（proper / improper rational fraction）**：分子次数 $<$ / $\ge$ 分母次数。
- **万能代换（Weierstrass substitution）**：$t=\tan\frac x2$，把三角函数有理式化为有理函数。
- **欧拉变换（Euler substitution）**：处理 $\sqrt{ax^2+bx+c}$ 的代数代换。
- **递推公式（reduction formula）**：把 $I_n$ 降到 $I_{n-1}$ 或 $I_{n-2}$。
- **非初等原函数**：如 $\int e^{-x^2}dx$、$\int\frac{\sin x}{x}dx$、$\int\frac{dx}{\ln x}$、$\int\sqrt{1-k^2\sin^2x}\,dx$，原函数存在但不能用初等函数表示（Liouville, 1835）。

## Mental Models / 思维模型

- **把求不定积分看成一个"改写到表里"的翻译问题**：每做一步都问自己"离 14 条基本公式更近了吗"。若一步变形后没变近，说明方向错了。
- **遇到根式先想"怎么把根号去掉"**：$\sqrt{a^2-x^2}\to x=a\sin t$；$\sqrt{x^2+a^2}\to x=a\tan t$；$\sqrt{x^2-a^2}\to x=a\sec t$；两个根号不同次数 $\to$ 取次数的最小公倍数。
- **遇到有理式先想"分母能不能分解"**：能分解就必然能积出来，这是有理函数积分的**封闭性**——流程固定、必然成功，不要试图找捷径。
- **遇到两类函数之积就想分部**：$u$ 选"求导后变简单的那个"（对数、反三角优先），$dv$ 选"容易积出来的那个"。
- **万能代换是最后手段而非第一手段**：先看能否凑微分或用二倍角化简；$t=\tan x$ 只在内层是 $\sin^2,\cos^2,\sin\cos$ 的有理式时更优。

## Anti-patterns / 常见错误

- **漏写 $+C$**：不定积分是函数族；少一个 $C$ 在后续定积分计算中会导致结果错误。此外同一积分的不同原函数表达式相差一个常数，形式不同不等于算错（如 $\int\sec x\,dx=\ln|\sec x+\tan x|+C$ 与 $\frac12\ln\frac{1+\sin x}{1-\sin x}+C$）。
- **换元后忘记还原变量**：$\int f(\varphi(t))\varphi'(t)dt=F(\varphi(t))+C$，答案里不能留 $t$。
- **第二换元选错区间导致反函数不存在**：$x=a\sin t$ 必须限制 $|t|\le\frac\pi2$；否则 $t=\arcsin\frac xa$ 不成立。
- **有理函数直接上部分分式而不先降次**：假分式必须先做除法，否则待定系数法无解。
- **把 $\int\frac{dx}{x}$ 写成 $\ln x+C$**：应为 $\ln|x|+C$，公式 4 适用于不含原点的任何区间。
- **以为"原函数存在"与"不定积分存在"是两件事，或以为它们与可积性是一回事**：前者二者按定义等同；但与定积分可积性无关。例：$f(x)=1\ (x\in(0,8])$、$f(0)=0$ 在 $[0,8]$ 上有第一类间断点，取 $\varphi(t)=t^3\ (t\in[0,2])$ 时 $\int f(\varphi(t))\varphi'(t)dt$ 在 $[0,2]$ 上存在，但 $f$ 在 $[0,8]$ 上因第一类间断点而**没有原函数**，故 $\int f(x)dx$ 不存在。含第二类间断点的函数则可能**有**也可能**没有**原函数。
- **滥用万能代换**：对 $\int\frac{dx}{a^2\cos^2x+b^2\sin^2x}$ 用 $t=\tan\frac x2$ 会得到极其复杂的有理式；令 $t=\tan x$ 一步即得 $\frac{1}{ab}\arctan\big(\frac ab\tan x\big)+C$。
- **误认为初等函数的原函数一定是初等函数**：$\int e^{-x^2}dx$ 存在但非初等。

## Reference Tables / 速查表

| 换元法 | 触发特征 | 代换 | 回代要求 |
|---|---|---|---|
| 第一换元（凑微分） | 出现 $f(\varphi)\varphi'$，如 $\frac{(\ln x)'}{\ln x}$ | $u=\varphi(x)$，可心算 | $u\to x$ |
| 第二换元（代入） | 含 $\sqrt{a^2\pm x^2},\sqrt{x^2-a^2},\sqrt[n]{\cdot}$ | $x=a\sin t/a\tan t/a\sec t$，或直接令根式为 $t$ | 用反函数 $t=\varphi^{-1}(x)$ |
| 分部积分 | 两类函数之积 | $u$ 按"反对幂三指"取前 | 无 |
| 万能代换 | $R(\sin x,\cos x)$ 且无更省办法 | $t=\tan\frac x2$ | $t\to\tan\frac x2$ |

| 被积函数形态 | 首选方法 |
|---|---|
| $\dfrac{P_n(x)}{Q_m(x)}$，$Q$ 可分解 | 部分分式分解（流程化，必定成功） |
| $R(\sin x,\cos x)$ | 先试凑微分/倍角；不行再 $t=\tan\frac x2$ |
| 只含 $\sin^2x,\cos^2x,\sin x\cos x$ 的有理式 | $t=\tan x$ |
| $x^n e^{ax},\ x^n\ln x,\ x^n\arctan x$ | 分部积分，$u$ 取对数/反三角 |
| $\sqrt{a^2-x^2}$ 等二次根式 | 三角代换，或欧拉变换（$a>0$ 或 $c>0$ 时） |
| $\sqrt[n]{\frac{ax+b}{cx+d}}$ | 令整个根式为 $t$ |

## Worked Example / 工作示例

**例2（源书例2，含重复二次因式，须用递推公式）**：求
$$I=\int\frac{x^2+1}{(x^2-2x+2)^2}\,dx .$$

**第一步：化简分子，避免待定系数。** 分母只有单一因式 $(x^2-2x+2)^2$，把分子按分母配凑：
$$x^2+1=\big(x^2-2x+2\big)+(2x-1),$$
故
$$I=\underbrace{\int\frac{dx}{x^2-2x+2}}_{I_1}+\underbrace{\int\frac{2x-1}{(x^2-2x+2)^2}\,dx}_{I_2}.$$

**第二步：算 $I_1$（配方）。** $x^2-2x+2=(x-1)^2+1$，故
$$I_1=\int\frac{d(x-1)}{(x-1)^2+1}=\arctan(x-1)+C_1 .$$

**第三步：算 $I_2$（拆成"导数型 + 标准型"）。** 注意 $\dfrac{d}{dx}(x^2-2x+2)=2x-2$，把 $2x-1$ 拆成 $(2x-2)+1$：
$$I_2=\int\frac{d(x^2-2x+2)}{(x^2-2x+2)^2}+\int\frac{d(x-1)}{\big((x-1)^2+1\big)^2}
=-\frac{1}{x^2-2x+2}+\int\frac{dt}{(t^2+1)^2}\quad(t=x-1).$$

**第四步：递推公式。** 对 $n\ge2$，
$$I_n=\int\frac{dt}{(t^2+1)^n}=\frac{1}{2(n-1)}\left[\frac{t}{(t^2+1)^{n-1}}+(2n-3)I_{n-1}\right].$$
取 $n=2$，并用 $I_1=\arctan t+C$：
$$\int\frac{dt}{(t^2+1)^2}=\frac{1}{2}\cdot\frac{t}{t^2+1}+\frac12\arctan t+C
=\frac{x-1}{2(x^2-2x+2)}+\frac12\arctan(x-1)+C_2 .$$

**第五步：合并。** 把 $I_1,I_2$ 的第 1 项写在一起通分：
$$-\frac{1}{x^2-2x+2}+\frac{x-1}{2(x^2-2x+2)}=\frac{-2+(x-1)}{2(x^2-2x+2)}=\frac{x-3}{2(x^2-2x+2)},$$
再由 $I_1=\arctan(x-1)$ 与 $I_2$ 中的 $\frac12\arctan(x-1)$ 得
$$I=\frac{x-3}{2(x^2-2x+2)}+\frac32\arctan(x-1)+C .$$

**验证（求导回代）**：记 $F(x)=\dfrac{x-3}{2(x^2-2x+2)}+\dfrac32\arctan(x-1)$，逐项求导。
$$F'(x)=\frac{1\cdot(x^2-2x+2)-(x-3)(2x-2)}{2(x^2-2x+2)^2}+\frac{3}{2}\cdot\frac{1}{1+(x-1)^2}.$$
第一项分子：
$$x^2-2x+2-(2x^2-8x+6)=-x^2+6x-4 .$$
第二项中 $1+(x-1)^2=x^2-2x+2$。把两项都化到分母 $2(x^2-2x+2)^2$ 上：第二项分子为 $3(x^2-2x+2)$，于是
$$F'(x)=\frac{(-x^2+6x-4)+3(x^2-2x+2)}{2(x^2-2x+2)^2}
=\frac{2x^2+2}{2(x^2-2x+2)^2}=\frac{x^2+1}{(x^2-2x+2)^2}.$$
**与被积函数完全一致，积分结果正确。** $\square$

> 教学提示：本题的价值在于**流程**——配凑（分子写成 $Q$ 的倍数加常数）→ 拆成"导数型 + 标准型" → 用 $I_n$ 递推公式降到 $I_1$。任何有理函数积分都走这条路；每一步都可以（也应该）用求导回验。注意合并那一步最容易出错：系数必须**同时**核对 $\frac{1}{2}$ 与 $\arctan$ 前的系数。

## Key Takeaways / 关键结论

1. 连续函数必有原函数（定理8.1）；含第一类间断点的函数必无原函数。
2. 不定积分是**函数族** $F(x)+C$；任意两个原函数相差常数，故务必写 $+C$。
3. 一切不定积分的归宿是那 14 条基本公式；所有技巧都是"往表里化"的手段。
4. 三种基本技术：凑微分（定理8.4）、代入换元（定理8.5）、分部积分（定理8.6）。
5. 有理函数的不定积分是**封闭**的：降次 $\to$ 分解分母 $\to$ 待定系数 $\to$ 逐项积分，必定可解；核心工具是 $I_n$ 递推公式。
6. 万能代换 $t=\tan\frac x2$ 对 $R(\sin x,\cos x)$ 永远有效，但未必简便；只含 $\sin^2,\cos^2,\sin\cos$ 时优先 $t=\tan x$。
7. 初等函数的原函数不一定初等；$\int e^{-x^2}dx$ 这类要留到第九章用定积分表示。

## Connects To / 与其他章节的联系

- **向后依赖**：第五章导数与微分（原函数定义、$dF=F'dx$）；第六章微分中值定理——定理8.2(ii) 依赖 $(F-G)'\equiv0\Rightarrow F-G\equiv C$；此外依赖中学的三角恒等变形、代数分式运算与多项式因式分解。
- **向前使用**：第九章定理9.1（牛顿–莱布尼茨公式）$\int_a^b f=F(b)-F(a)$ 把定积分计算**完全**归结为本章的求原函数问题；定理9.10 将在 §5 补上定理8.1 的证明。
- **后续章节**：第十章定积分的应用、第十一章反常积分，以及下册的积分表与特殊函数，都建立在有理函数、三角有理式、无理根式这三类可积类型的判别与计算之上。
