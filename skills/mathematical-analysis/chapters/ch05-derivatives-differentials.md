# 第5章 导数和微分 (Derivatives and Differentials)

> 《数学分析》第六版（上册）· 华东师范大学数学科学学院 编
>
> 📝 **本章作业**：作业集 **5-1 – 5-4**（题 32–46，§5.1–§5.5）→ [problems/p05-ch05.md](../problems/p05-ch05.md)

## Core Idea / 核心思想

导数把「平均变化率」取极限，得到一点处的**瞬时变化率**；几何上是切线斜率，物理上是瞬时速度。围绕这个定义，本章给出四则运算、反函数、复合函数三条求导法则和一张基本导数表，使初等函数的求导变成机械操作；再把导数线性化得到微分 $dy=f'(x)\,dx$，它是「以直代曲」的解析表达。

## Frameworks Introduced / 核心框架

- **定义1（导数）**：设 $y=f(x)$ 在 $x_0$ 的某邻域内有定义。若 $\lim\limits_{x\to x_0}\dfrac{f(x)-f(x_0)}{x-x_0}$ 存在，则称 $f$ 在 $x_0$ **可导**，该极限称为 $f$ 在 $x_0$ 的**导数** $f'(x_0)$。
  - 增量形式：$f'(x_0)=\lim\limits_{\Delta x\to0}\dfrac{\Delta y}{\Delta x}$，其中 $\Delta x=x-x_0$、$\Delta y=f(x_0+\Delta x)-f(x_0)$。
  - 何时用：题目点名「用定义求导」，或函数由分段式、绝对值、含 $D(x)$ 的怪函数给出时，只有定义可用。
  - 关键点：$\frac{\Delta y}{\Delta x}$ 是**差商**（平均变化率），导数是它的极限；差商只在 $x\ne x_0$ 处有定义，所以本质上是求空心邻域上函数的极限。
- **有限增量公式**：$f$ 在 $x_0$ 可导 $\Rightarrow$ $\Delta y=f'(x_0)\Delta x+o(\Delta x)$（对 $\Delta x=0$ 也成立）。它是定理5.1 与微分定义的共同来源。
- **定理5.1（可导必连续）**：$f$ 在 $x_0$ 可导 $\Rightarrow$ $f$ 在 $x_0$ 连续。由有限增量公式直接得 $\lim\limits_{\Delta x\to0}\Delta y=0$。
  - 关键点：反之不真。$f(x)=|x|$ 在 $0$ 连续但 $\frac{|x|}{x}$ 的左右极限为 $1$ 与 $-1$，故不可导。证「不可导」最省力的路线是先证该点不连续再用逆否命题——**例4** $f(x)=x^2D(x)$：$x_0\ne0$ 时不连续故不可导，$x_0=0$ 时由 $D$ 有界得 $f'(0)=\lim\limits_{x\to0}xD(x)=0$，故 $f$ **仅在** $0$ 可导。
- **定义2（单侧导数）**：$f'_+(x_0)=\lim\limits_{\Delta x\to0^+}\dfrac{f(x_0+\Delta x)-f(x_0)}{\Delta x}$（$0<\Delta x<\delta$）；左导数类似。
- **定理5.2**：$f'(x_0)$ 存在的充要条件是 $f'_+(x_0)$ 与 $f'_-(x_0)$ 都存在且相等。
  - 例5：$f(x)=1-\cos x$（$x\ge0$）、$x$（$x<0$）时 $f'_+(0)=0$、$f'_-(0)=1$，不等故不可导。
- **导函数**：区间上逐点的导数构成的函数，记 $f'$、$y'$ 或 $\dfrac{dy}{dx}$；点值记 $f'(x_0)=y'\big|_{x=x_0}$。
- **导数的几何意义**：$f'(x_0)$ 是曲线 $y=f(x)$ 在 $(x_0,y_0)$ 处切线斜率，切线方程 $y-y_0=f'(x_0)(x-x_0)$，法线方程 $y-y_0=-\dfrac{1}{f'(x_0)}(x-x_0)$（$f'(x_0)=0$ 时法线为 $x=x_0$）。若 $\alpha$ 为切线与 $x$ 轴正向夹角，则 $f'(x_0)=\tan\alpha$，符号对应锐角、钝角、平行于 $x$ 轴。
- **定义3（极值）与定理5.3（费马定理）**：$f$ 在 $x_0$ 的某邻域上满足 $f(x_0)\ge f(x)$（$\le$）则称 $x_0$ 为极大（小）值点。**定理5.3**：$f$ 在 $x_0$ 可导且 $x_0$ 为极值点 $\Rightarrow$ $f'(x_0)=0$。
  - 关键点：由例8 的单侧保号性（$f'_+(x_0)>0\Rightarrow$ 右侧 $f(x_0)<f(x)$）得 $f'_+(x_0)\le0\le f'_-(x_0)$，两者相等故为零。
  - 注意：这只是**必要**条件。满足 $f'(x)=0$ 的点叫**稳定点**（驻点）；$x^3$ 在 $0$ 是稳定点却非极值点。
- **定理5.4–5.6（四则运算）**：$u,v$ 在 $x_0$ 可导，则
  $(u\pm v)'=u'\pm v'$；$(uv)'=u'v+uv'$（推广 $(uvw)'=u'vw+uv'w+uvw'$，推论 $(cv)'=cv'$）；$\left(\dfrac uv\right)'=\dfrac{u'v-uv'}{v^2}$（$v(x_0)\ne0$）。
  - 关键点：乘积法则的证明靠加减一项凑成两个差商；商法则先证 $\left(\frac1v\right)'=-\frac{v'}{v^2}$（用局部保号性保证分母不为零）再对 $u\cdot\frac1v$ 用乘积法则。**没有** $(uv)'=u'v'$ 这种公式。
- **定理5.7（反函数的导数）**：设 $y=f(x)$ 为 $x=\varphi(y)$ 的反函数。若 $\varphi$ 在 $y_0$ 的某邻域上连续、严格单调且 $\varphi'(y_0)\ne0$，则 $f$ 在 $x_0=\varphi(y_0)$ 可导，且 $f'(x_0)=\dfrac{1}{\varphi'(y_0)}$。
  - 关键点：$\varphi$ 连续且严格单调保证 $\Delta x=0\iff\Delta y=0$ 且 $\Delta y\to0\iff\Delta x\to0$，倒数关系才合法。
  - 用它得到：$(a^x)'=a^x\ln a$（特别 $(e^x)'=e^x$）；$(\arcsin x)'=\frac{1}{\sqrt{1-x^2}}$、$(\arccos x)'=-\frac{1}{\sqrt{1-x^2}}$；$(\arctan x)'=\frac{1}{1+x^2}$、$(\operatorname{arccot}x)'=-\frac{1}{1+x^2}$。
- **引理（可导的等价刻画）**：$f$ 在 $x_0$ 可导 $\iff$ 存在 $U(x_0)$ 上在 $x_0$ 连续的函数 $H$ 使 $f(x)-f(x_0)=H(x)(x-x_0)$，且 $f'(x_0)=H(x_0)$。构造方式是 $H(x)=\frac{f(x)-f(x_0)}{x-x_0}$（$x\ne x_0$）、$H(x_0)=f'(x_0)$。它把极限问题化为代数恒等式问题，是链式法则证明的支点。
- **定理5.8（复合函数的导数 / 链式法则）**：$u=\varphi(x)$ 在 $x_0$ 可导，$y=f(u)$ 在 $u_0=\varphi(x_0)$ 可导，则 $(f\circ\varphi)'(x_0)=f'(\varphi(x_0))\varphi'(x_0)$，即 $\dfrac{dy}{dx}=\dfrac{dy}{du}\cdot\dfrac{du}{dx}$。
  - 关键点：用引理把两个增量关系写成 $f(u)-f(u_0)=F(u)(u-u_0)$、$\varphi(x)-\varphi(x_0)=\Phi(x)(x-x_0)$，相乘得 $H=F(\varphi(x))\Phi(x)$ 在 $x_0$ 连续。
  - **易混点**：$f'(\varphi(x))=f'(u)\big|_{u=\varphi(x)}$ 与 $(f(\varphi(x)))'=f'(\varphi(x))\varphi'(x)$ 是两回事；源书专门注明「必须指出 $(\sin x^2)'\ne\cos x^2$」。
  - 特例：$(x^\alpha)'=(e^{\alpha\ln x})'=\alpha x^{\alpha-1}$（$x>0$，$\alpha$ 为任意实数）。
- **对数求导法**：对连乘连除式或幂指函数，先取对数把乘除化为加减、幂化为倍数，再两边求导。步骤：(1) 两边取 $\ln$（要求 $y>0$，否则取 $|y|$）；(2) 用对数性质拆开；(3) 两边求导，左端得 $\frac{y'}{y}$；(4) 解出 $y'$ 并把原表达式代回。对幂指函数 $y=u(x)^{v(x)}$（$u>0$）：$y'=u^v\left(v'\ln u+v\dfrac{u'}{u}\right)=u^vv'\ln u+vu^{v-1}u'$。
- **参变量函数的导数（§3）**：曲线由 $x=\varphi(t)$、$y=\psi(t)$ 给出，$\varphi,\psi$ 在 $t_0$ 可导且 $\varphi'(t_0)\ne0$，则 $\dfrac{dy}{dx}=\dfrac{\psi'(t_0)}{\varphi'(t_0)}=\dfrac{dy/dt}{dx/dt}$。若 $\varphi'(t_0)=0$ 而 $\psi'(t_0)\ne0$，则切线竖直，用 $\cot\alpha=\frac{\varphi'(t_0)}{\psi'(t_0)}$ 描述。$\varphi,\psi$ 在 $[\beta,\gamma]$ 上有连续导函数且 $\varphi'^2+\psi'^2\ne0$ 时称曲线**光滑**。
  - 极坐标 $r=r(\theta)$ 可化为参数方程 $x=r(\theta)\cos\theta$、$y=r(\theta)\sin\theta$；**向径与切线的夹角** $\varphi=\alpha-\theta$ 满足 $\tan\varphi=\dfrac{r(\theta)}{r'(\theta)}$。源书例2 的结论是：对数螺线上该夹角为常量。
- **高阶导数（§4）**：$f'$ 在 $x_0$ 可导则称其导数为**二阶导数** $f''(x_0)$；归纳定义 $n$ 阶导数 $f^{(n)}$、$y^{(n)}$、$\dfrac{d^ny}{dx^n}$。线性运算 $(u\pm v)^{(n)}=u^{(n)}\pm v^{(n)}$。
  - **莱布尼茨公式**：$(uv)^{(n)}=\sum\limits_{k=0}^{n}\binom nk u^{(n-k)}v^{(k)}$（$u^{(0)}=u$，$v^{(0)}=v$），与二项式展开形式平行。
  - 常用：$(x^n)^{(n)}=n!$，$k>n$ 时 $y^{(k)}=0$；$(\sin x)^{(n)}=\sin\left(x+\frac{n\pi}{2}\right)$，$(\cos x)^{(n)}=\cos\left(x+\frac{n\pi}{2}\right)$；$(e^x)^{(n)}=e^x$；$y=x^2e^x$ 时 $y^{(n)}=e^x(x^2+2nx+n(n-1))$；$y=e^x\sin x$ 时 $y^{(n)}=(\sqrt2)^ne^x\sin\left(x+\frac{n\pi}{4}\right)$。
  - 参变量函数的二阶导数：$\dfrac{d^2y}{dx^2}=\dfrac{\psi''(t)\varphi'(t)-\psi'(t)\varphi''(t)}{[\varphi'(t)]^3}$。例7 摆线（$x=a(t-\sin t)$，$y=a(1-\cos t)$）得 $\frac{dy}{dx}=\cot\frac t2$、$\frac{d^2y}{dx^2}=-\frac{1}{4a}\csc^4\frac t2$。
- **微分的定义（§5）**：若存在**常数** $A$ 使 $\Delta y=A\Delta x+o(\Delta x)$，则称 $f$ 在 $x_0$ **可微**，第一项 $A\Delta x$ 称为 $f$ 在 $x_0$ 的**微分** $dy\big|_{x=x_0}=A\Delta x$。当 $A\ne0$ 时称它是增量 $\Delta y$ 的**线性主部**。
- **定理5.9（可微 $\iff$ 可导）**：$f$ 在 $x_0$ 可微的充要条件是 $f$ 在 $x_0$ 可导，且此时 $A=f'(x_0)$，即 $dy\big|_{x=x_0}=f'(x_0)\Delta x$。
  - 关键点：几何上 $\Delta y$ 是曲线上的纵坐标增量，$dy$ 是**切线上**对应的增量；$f'(x_0)\ne0$ 时两者之差比 $dy$ 小得多。
  - 特例 $y=x$ 得 $dy=dx=\Delta x$，即自变量的微分就是自变量的增量，于是 $dy=f'(x)dx$、$f'(x)=\dfrac{dy}{dx}$——导数因此又叫**微商**。
- **微分运算法则**：$d(u\pm v)=du\pm dv$；$d(uv)=v\,du+u\,dv$；$d\left(\frac uv\right)=\frac{v\,du-u\,dv}{v^2}$（$v\ne0$）；$d(f\circ g)=f'(u)g'(x)dx$（$u=g(x)$）。
  - **一阶微分形式的不变性**：由 $du=g'(x)dx$，法则4 可写成 $dy=f'(u)du$，与 $dy=f'(x)dx$ 形式完全相同——$u$ 无论是自变量还是中间变量都成立。
- **高阶微分**：$d^2y=f''(x)\,dx^2$（$dx^2$ 指 $(dx)^2$），一般 $d^ny=f^{(n)}(x)dx^n$。记号警示：$dx^2=(dx)^2$、$d^2x=0$、$d(x^2)=2x\,dx$ 三者不同。
  - 关键点：**高阶微分不再具有形式不变性**。若 $x=\varphi(t)$ 是中间变量，则 $d^2y=f''(x)dx^2+f'(x)d^2x$，多出一项。源书例3 下方专门标出错误解法。
- **微分在近似计算中的应用**：$\Delta x$ 很小时 $\Delta y\approx dy$，即 $f(x_0+\Delta x)\approx f(x_0)+f'(x_0)\Delta x$，几何意义是**以切线代替曲线**。原点附近 $\sin x\approx x$、$\tan x\approx x$、$\ln(1+x)\approx x$、$e^x\approx1+x$。
  - 误差估计：$|\Delta y|\le|f'(x_0)|\delta_x$，相对误差限 $\left|\dfrac{f'(x_0)}{f(x_0)}\right|\delta_x$，其中 $\delta_x$ 是测量误差限。

## Key Concepts / 核心概念

- **差商 / 平均变化率（difference quotient）**：$\dfrac{\Delta y}{\Delta x}$，导数定义中被取极限的对象。
- **导数（derivative）**：差商的极限 $f'(x_0)$，也是微商 $\dfrac{dy}{dx}$。
- **单侧导数（one-sided derivative）**：$f'_+(x_0)$、$f'_-(x_0)$，讨论端点与分段点必须用。
- **可导与可微（differentiable）**：一元函数中二者等价（定理5.9）；「可微」强调增量可分解为线性主部加高阶无穷小。
- **稳定点 / 驻点（stationary point）**：满足 $f'(x)=0$ 的点，是极值点的必要而非充分条件。
- **链式法则（chain rule）**：$(f\circ\varphi)'=f'(\varphi(x))\varphi'(x)$。
- **对数求导法（logarithmic differentiation）**：先取对数再求导，处理连乘连除式与幂指函数。
- **高阶导数（higher-order derivative）**：$f''$、$f^{(n)}$，逐次求导所得。
- **莱布尼茨公式（Leibniz formula）**：$(uv)^{(n)}=\sum_{k=0}^n\binom nk u^{(n-k)}v^{(k)}$。
- **微分（differential）**：$dy=f'(x)\Delta x=f'(x)dx$，即增量 $\Delta y$ 的线性主部。
- **一阶微分形式不变性（invariance of first-order differential form）**：$x$ 为自变量或中间变量时恒有 $dy=f'(x)dx$；高阶微分无此性质。
- **光滑曲线（smooth curve）**：参数方程中 $\varphi'^2+\psi'^2\ne0$ 且导函数连续，切线与 $x$ 轴夹角连续变化。

## Mental Models / 思维模型

- **把「可导」看成「局部可线性化」，把链式法则看成「变化率的传递」**：$f$ 在 $x_0$ 可导 $\iff$ 存在常数 $A$ 使 $\Delta y=A\Delta x+o(\Delta x)$。可导必连续是它的直接后果，微分是它的主部，泰勒公式是它的高阶推广；而 $x$ 变一点使 $u$ 变 $u'$ 倍、$u$ 变一点使 $y$ 变 $f'(u)$ 倍，乘起来就是总倍率。
- **遇到分段点先算两个单侧导数**：不要一上来就分段求导再代入，那只在导数极限定理（第6章定理6.2 推论3）条件满足时才等价。标准动作是 $f'_+(x_0)$、$f'_-(x_0)$ 各算一遍。
- **看到连乘连除或底数与指数都含 $x$，先取对数**：$y=u(x)^{v(x)}$ 直接求导最容易丢项，写成 $e^{v\ln u}$ 或两边取 $\ln$ 后链式法则自动处理干净。
- **求近似值时先在附近找一个「好算」的点**：$x_0$ 要满足 $f(x_0)$ 与 $f'(x_0)$ 都好算（如 $30^\circ$、$1$、$0$），误差量级由 $f''$ 控制。

## Anti-patterns / 常见错误

- **把连续当作可导的充分条件**：$f(x)=|x|$ 在 $0$ 连续但不可导；$f(x)=x\sin\frac1x$（$x\ne0$）、$f(0)=0$ 在 $0$ 连续也不可导（差商 $\sin\frac1x$ 无极限）。定理5.1 只有单向成立。
- **以为 $(uv)'=u'v'$ 或 $\left(\frac uv\right)'=\frac{u'}{v'}$**：正确公式是 $u'v+uv'$ 与 $\frac{u'v-uv'}{v^2}$。用 $u=v=x$ 检验即知前者给出 $1$ 而非 $2x$。
- **对复合函数漏掉内层导数**：$(\sin x^2)'=2x\cos x^2$，不是 $\cos x^2$；$(\sin^2x)'=2\sin x\cos x$，不是 $2\sin x$。
- **混淆 $f'(\varphi(x))$ 与 $(f(\varphi(x)))'$**：如 $f(u)=u^2$、$\varphi(x)=\sin x$ 时前者为 $2\sin x$，后者为 $2\sin x\cos x$。
- **用「$f'(x_0)=0$」断定 $x_0$ 是极值点**：$x^3$ 在 $0$ 处 $f'=0$ 但严格递增，$0$ 不是极值点；稳定点必须再验证一阶导数是否变号。
- **对高阶微分套用形式不变性，或把 $dx^2$、$d^2x$、$d(x^2)$ 混为一谈**：$x$ 为中间变量时 $d^2y$ 多出 $f'(x)d^2x$；三个记号分别是 $(dx)^2$、$0$、$2x\,dx$。
- **参数方程求二阶导数时记错**：$\frac{d^2y}{dx^2}$ 不是 $\frac{\psi''(t)}{\varphi''(t)}$，而是 $\frac{(\psi'/\varphi')'_t}{\varphi'(t)}=\frac{\psi''\varphi'-\psi'\varphi''}{\varphi'^3}$。
- **把反函数求导公式记成 $f'(x_0)=\varphi'(y_0)$**：正确关系是互为倒数 $f'(x_0)=\frac{1}{\varphi'(y_0)}$，且要求 $\varphi'(y_0)\ne0$。

## Reference Tables / 速查表

**基本初等函数的导数公式**

| 函数 | 导数 | 备注 |
|---|---|---|
| $c$ | $0$ | $c$ 为常数 |
| $x^\alpha$ | $\alpha x^{\alpha-1}$ | $\alpha$ 为任意实数 |
| $\sin x$ / $\cos x$ | $\cos x$ / $-\sin x$ | |
| $\tan x$ / $\cot x$ | $\sec^2x$ / $-\csc^2x$ | |
| $\sec x$ / $\csc x$ | $\sec x\tan x$ / $-\csc x\cot x$ | |
| $\arcsin x$ / $\arccos x$ | $\frac{1}{\sqrt{1-x^2}}$ / $-\frac{1}{\sqrt{1-x^2}}$ | $\lvert x\rvert<1$ |
| $\arctan x$ / $\operatorname{arccot}x$ | $\frac{1}{1+x^2}$ / $-\frac{1}{1+x^2}$ | |
| $a^x$ | $a^x\ln a$ | $a>0,a\ne1$；$(e^x)'=e^x$ |
| $\log_ax$ | $\frac{1}{x\ln a}$ | $(\ln x)'=\frac1x$ |

**五条基本求导法则**

| 法则 | 公式 |
|---|---|
| 和差 | $(u\pm v)'=u'\pm v'$ |
| 乘积 | $(uv)'=u'v+uv'$；$(cu)'=cu'$ |
| 商 | $\left(\frac uv\right)'=\frac{u'v-uv'}{v^2}$（$v\ne0$） |
| 反函数 | $f'(x_0)=\frac{1}{\varphi'(y_0)}$，$x_0=\varphi(y_0)$ |
| 复合 | $\frac{dy}{dx}=\frac{dy}{du}\cdot\frac{du}{dx}$ |

**导数与微分对照**

| 项目 | 导数 | 微分 |
|---|---|---|
| 定义对象 | 差商的极限 $f'(x_0)$ | 增量的线性主部 $A\Delta x$ |
| 关系 | 可导 $\iff$ 可微，且 $A=f'(x_0)$ | |
| 记法 | $f'(x)=\frac{dy}{dx}$ | $dy=f'(x)dx$ |
| 形式不变性 | — | 一阶有，高阶**无** |

## Worked Example / 工作示例

**题（§2 例11，对数求导法）**：设
$$y=\frac{(x+5)^2\,(x-4)^{1/3}}{(x+2)^5\,(x+4)^{1/2}},\qquad x>4,$$
求 $y'$。

**第一步：确认适用条件。** $x>4$ 时 $x+5,x-4,x+2,x+4$ 全为正，故 $y>0$，可直接取对数而不必加绝对值。该式由四个幂函数经乘除复合而成，直接用商法则要算四项、极易出错；取对数可把乘除化为加减、把分数指数化为倍数。

**第二步：两边取对数并拆开。** 由 $\ln\frac{ab}{cd}=\ln a+\ln b-\ln c-\ln d$ 与 $\ln a^k=k\ln a$，
$$\ln y=2\ln(x+5)+\frac13\ln(x-4)-5\ln(x+2)-\frac12\ln(x+4).$$

**第三步：两边对 $x$ 求导。** 左端用链式法则得 $\dfrac{d}{dx}\ln y=\dfrac{y'}{y}$；右端逐项用 $(\ln u)'=\dfrac{u'}{u}$：
$$\frac{y'}{y}=\frac{2}{x+5}+\frac{1}{3(x-4)}-\frac{5}{x+2}-\frac{1}{2(x+4)}.$$

**第四步：解出 $y'$ 并回代。**
$$y'=\frac{(x+5)^2(x-4)^{1/3}}{(x+2)^5(x+4)^{1/2}}\left[\frac{2}{x+5}+\frac{1}{3(x-4)}-\frac{5}{x+2}-\frac{1}{2(x+4)}\right].$$

**第五步：验证。** 取退化情形 $y=(x+5)^2$ 单独检验机制：$\ln y=2\ln(x+5)$，$\frac{y'}{y}=\frac{2}{x+5}$，故 $y'=y\cdot\frac{2}{x+5}=2(x+5)$，与直接求导一致。再核对符号规律：分子上的因子 $x-4$ 指数为正（$\frac13>0$），对应项取 $+$；分母上的因子 $x+2$、$x+4$ 取 $-$；四个系数 $2,\frac13,-5,-\frac12$ 与原式指数一一对应，核对无误。

**方法要点**：关键动作是第二步的「取对数 + 展开」，把乘法结构的求导问题转成加法结构。同一手法用于幂指函数 $y=u(x)^{v(x)}$ 时给出 $y'=u^v\left(v'\ln u+v\frac{u'}{u}\right)$，这是底数与指数同时含 $x$ 时唯一不易出错的路径。

## Key Takeaways / 关键结论

1. 导数就是差商的极限；一切「用定义求导」的题都从 $f'(x_0)=\lim\limits_{\Delta x\to0}\frac{f(x_0+\Delta x)-f(x_0)}{\Delta x}$ 开始。
2. 可导 $\Rightarrow$ 连续，反之不真；证明不可导的两条路是「差商左右极限不等」与「该点不连续」。
3. 分段点可导的充要条件是左右导数都存在且相等（定理5.2），不要用「分段求导再代入」代替它。
4. 求导三件套：四则运算（5.4–5.6）、反函数（5.7）、链式法则（5.8）；复合函数永远要乘内层导数。
5. 对数求导法专治连乘连除式与幂指函数 $u(x)^{v(x)}$：先取对数把乘除降级为加减。
6. 费马定理（5.3）：可导的极值点必是稳定点；稳定点未必是极值点，$x^3$ 在 $0$ 处即是反例。
7. 一元函数中可导与可微等价（定理5.9）且 $A=f'(x_0)$，于是 $dy=f'(x)dx$、$f'(x)=\frac{dy}{dx}$；一阶微分形式不变，高阶微分**不**再形式不变。

## Connects To / 与其他章节的联系

- **依赖第3、4章**：导数定义是一个函数极限，函数极限的四则运算、保号性与归结原则在定理5.4–5.6 中反复使用；定理5.1 把可导性归到连续性上，而商法则证明中「分母不为零」靠的正是第4章的局部保号性；例4 的 $x^2D(x)$ 与本章反例都取自第4章的怪函数库。
- **通向第6章**：费马定理（5.3）是罗尔中值定理证明的最后一步，也是全部微分中值定理的起点；导数极限定理（第6章定理6.2 推论3）为求分段函数的导数提供了比定理5.2 更快的工具；泰勒公式本质上是有限增量公式的高阶版本，洛必达法则、单调性、凸性与极值判别全部建立在导数之上。
- **通向第8章（不定积分）**：微分公式表反向读就是基本积分表；$dy=f'(x)dx$ 为换元积分法中「凑微分」提供形式依据。
