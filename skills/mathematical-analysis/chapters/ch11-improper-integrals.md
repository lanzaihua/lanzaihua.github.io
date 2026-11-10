# 第十一章 反常积分 (Improper Integrals)

> 《数学分析》第六版（上册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

定积分有两个基本限制：积分区间有穷、被积函数有界。本章各去掉一个，得到两类**反常积分（improper integral）**——无穷区间上的**无穷积分**与无界函数的**瑕积分**。定义方式统一为「先在有穷/有界部分上算正常积分，再取极限」：

$$\int_a^{+\infty}f=\lim_{u\to+\infty}\int_a^uf,\qquad \int_a^bf=\lim_{u\to a^+}\int_u^bf\ (\text{$a$ 为瑕点}).$$

函数极限的柯西准则、比较、单调等工具由此全部搬入，形成与数项级数完全平行的判别法体系；牛顿–莱布尼茨公式、换元、分部积分照旧可用，只是代上下限时要取极限。

## Frameworks Introduced / 核心框架

- **定义1（无穷积分）**：$f$ 在 $[a,+\infty)$ 上有定义且在任何 $[a,u]$ 上可积，若 $\lim_{u\to+\infty}\int_a^uf(x)dx=J$ 存在，则称 $\int_a^{+\infty}f$ **收敛**，值为 $J$；否则发散。同理 $\int_{-\infty}^bf=\lim_{u\to-\infty}\int_u^bf$；$\int_{-\infty}^{+\infty}f=\int_{-\infty}^af+\int_a^{+\infty}f$（$a$ 任意），**当且仅当右边两个都收敛**时左边收敛。
  - 何时用：上下限含 $\infty$ 的一切情形。
  - 关键点：收敛性与 $a$ 的选取无关（注1）；$f$ 必须在**任何有限区间**上可积（注2），这是定义的前提。

- **定义2（瑕积分）**：$f$ 在 $(a,b]$ 上有定义、在 $a$ 的任一右邻域内无界、但在任何 $[u,b]\subset(a,b]$ 上可积，若 $\lim_{u\to a^+}\int_u^bf(x)dx=J$ 存在，则称瑕积分 $\int_a^bf$ 收敛，$a$ 称为**瑕点**。瑕点在右端点 $b$ 时取 $\lim_{u\to b^-}\int_a^uf$；瑕点 $c\in(a,b)$ 时定义 $\int_a^bf=\int_a^cf+\int_c^bf$，两端**都收敛**才收敛；$a,b$ 都是瑕点时同样拆成两段判定。
  - 何时用：被积函数在端点或内点趋于 $\infty$（$\frac1{\sqrt{1-x^2}}$ 在 $x=1$，$\ln x$ 在 $x=0$）。
  - 关键点：**先找瑕点再动手**。内点瑕点必须拆开；只有一端收敛整体就发散。$\int_0^{+\infty}\frac{dx}{x^p}$ 对一切 $p$ 都发散，正是因为同一个 $p$ 不可能既满足 $p>1$ 又满足 $p<1$。

- **两个标尺（§1 例3、例6）**：$\int_1^{+\infty}\frac{dx}{x^p}$ 当 $p>1$ 收敛（值 $\frac1{p-1}$）、$p\le1$ 发散于 $+\infty$；$\int_0^1\frac{dx}{x^q}$ 当 $0<q<1$ 收敛（值 $\frac1{1-q}$）、$q\ge1$ 发散于 $+\infty$。
  - 关键点：两阈值方向相反（无穷端要大 $p$，瑕点端要小 $p$），是本章最易记混处；新积分先与 $1/x^p$、$1/(x-a)^q$ 的主部对齐。

- **定理11.1（无穷积分的柯西准则）**：$\int_a^{+\infty}f$ 收敛 $\iff$ 任给 $\varepsilon>0$，存在 $G\ge a$，只要 $u_1,u_2>G$ 就有 $\big|\int_{u_1}^{u_2}f(x)dx\big|<\varepsilon$。
  - 何时用：只证收敛而不求值时；也是定理 11.3 的证明工具。

- **无穷积分的性质（§2 一）**：性质1 线性；性质2 区间可加 $\int_a^{+\infty}f=\int_a^bf+\int_b^{+\infty}f$（$a<b$，首项为定积分），故 $\int_a^{+\infty}f$ 与 $\int_b^{+\infty}f$ 同敛态；性质3 若 $\int_a^{+\infty}|f|$ 收敛，则 $\int_a^{+\infty}f$ 收敛，且 $\big|\int_a^{+\infty}f\big|\le\int_a^{+\infty}|f|$。
  - 关键点：性质 3 的**逆不成立**，收敛而不绝对收敛称**条件收敛**；注意它与第九章 §4 定积分性质 6（$\big|\int f\big|\le\int|f|$）的区别——性质 3 传递的是收敛性，不只是不等式。

- **定理11.2（比较原则）**：$f,g$ 为 $[a,+\infty)$ 上的非负函数、在任何 $[a,u]$ 上可积，且 $f\le g$；则 $\int g$ 收敛 $\Rightarrow\int f$ 收敛，$\int f$ 发散 $\Rightarrow\int g$ 发散。
  - 关键点：非负是硬条件，变号函数要先对 $|f|$ 放缩。**推论1（极限形式）**：$\lim_{x\to+\infty}\frac{f}{g}=c$，则 $0<c<+\infty$ 同敛态，$c=0$ 时由 $\int g$ 收敛推 $\int f$ 收敛，$c=+\infty$ 时由 $\int g$ 发散推 $\int f$ 发散。**柯西判别法（推论2、3）**：取 $g=\frac1{x^p}$，则 $f(x)\ge\frac1{x^p}\ (p\le1)$ 时发散、$0\le f(x)\le\frac1{x^p}\ (p>1)$ 时收敛；极限形式 $\lim_{x\to+\infty}x^pf(x)=\lambda$：$p>1,0\le\lambda<+\infty$ 收敛，$p\le1,0<\lambda\le+\infty$ 发散。
  - 关键点：$\lambda=0$ 只在收敛方向可用、$\lambda=+\infty$ 只在发散方向可用；这两格得不出结论，必须换标尺重做（如 $p=1$ 时 $f=\frac1{x\ln x}$ 满足 $\lambda=0$，但 $\int_2^{+\infty}\frac{dx}{x\ln x}$ 发散）。

- **定理11.3（狄利克雷 Dirichlet 判别法）**：若 $F(u)=\int_a^uf$ 在 $[a,+\infty)$ 上有界，$g$ 当 $x\to+\infty$ 时单调趋于 0，则 $\int_a^{+\infty}f(x)g(x)dx$ 收敛。
  - 何时用：被积函数是「振荡因子 $\times$ 衰减因子」，如 $\frac{\sin x}{x^p}$、换元后的 $\sin x^2$。
  - 关键点：证明用积分第二中值定理（定理9.11 推论）：$\int_{u_1}^{u_2}fg=g(u_1)\int_{u_1}^\xi f+g(u_2)\int_\xi^{u_2}f$，$F$ 有界使两个积分被 $2M$ 控制，取 $|g|\le\frac\varepsilon{4M}$ 即得柯西准则的估计。**不要求 $f$ 非负**。

- **定理11.4（阿贝尔 Abel 判别法）**：若 $\int_a^{+\infty}f$ 收敛，$g$ 在 $[a,+\infty)$ 上单调有界，则 $\int_a^{+\infty}f(x)g(x)dx$ 收敛。
  - 关键点：可由狄利克雷判别法证明（习题 10）——把单调有界的 $g$ 写成常数加一个单调趋于 0 的因子，分别用性质 1 与狄利克雷。

- **例3（$\frac{\sin x}{x^p}$ 的完整分类）**：$\int_1^{+\infty}\frac{\sin x}{x^p}dx$ 当 $p>1$ 时**绝对收敛**（$\big|\frac{\sin x}{x^p}\big|\le\frac1{x^p}$ 加比较原则）；当 $0<p\le1$ 时**条件收敛**。收敛性由狄利克雷给出（$\big|\int_1^u\sin x\,dx\big|=|\cos1-\cos u|\le2$，$\frac1{x^p}$ 单调趋于 0）；非绝对性由 $\frac{\sin^2x}{x^p}=\frac1{2x^p}-\frac{\cos2x}{2x^p}$ 看出：右端第一项当 $p\le1$ 发散、第二项由狄利克雷收敛，而 $|\sin x|\ge\sin^2x$。$\int_1^{+\infty}\frac{\cos x}{x^p}dx$ 结论相同，$\int_1^{+\infty}\sin x^2dx$ 经 $t=x^2$ 换元后亦然。
  - 关键点：**被积函数不趋于 0（甚至无界）时，无穷积分仍可能收敛**。

- **例5（单调性与收敛）**：若 $f$ 在 $[a,+\infty)$ 上单调且 $\int_a^{+\infty}f$ 收敛，则 $\lim_{x\to+\infty}f(x)=0$。
  - 关键点：单调是本质条件（$\sin x^2$ 说明一般情形不成立），$f$ 一致连续是另一条充分条件（习题 9）。证法为反证：单调递增且极限为 $+\infty$ 或 $A>0$ 时 $\int_M^uf$ 有正下界增长，与收敛矛盾。

- **定理11.5（瑕积分的柯西准则）与性质 1–3**：瑕点为 $a$ 时 $\int_a^bf$ 收敛 $\iff$ 任给 $\varepsilon>0$，存在 $\delta>0$，只要 $u_1,u_2\in(a,a+\delta)$ 就有 $\big|\int_{u_1}^{u_2}f\big|<\varepsilon$。线性、区间可加（拆点须两段都收敛）、绝对收敛蕴含收敛（$\big|\int_a^bf\big|\le\int_a^b|f|$）与无穷积分完全平行。

- **定理11.6（瑕积分的比较原则与柯西判别法）**：$f,g$ 定义在 $(a,b]$、瑕点同为 $a$、在任何 $[u,b]$ 上可积，$0\le f\le g$，则 $\int g$ 收敛 $\Rightarrow\int f$ 收敛，$\int f$ 发散 $\Rightarrow\int g$ 发散。**推论1** 与定理 11.2 的推论 1 逐字平行（把 $x\to+\infty$ 换成 $x\to a^+$）。**柯西判别法（推论2、3）**：以 $\frac1{(x-a)^p}$ 为标尺，$f\ge\frac1{(x-a)^p}$ 且 $p\ge1$ 时发散、$0\le f\le\frac1{(x-a)^p}$ 且 $0<p<1$ 时收敛；极限形式 $\lim_{x\to a^+}(x-a)^pf(x)=\lambda$：$0<p<1,0\le\lambda<+\infty$ 收敛，$p\ge1,0<\lambda\le+\infty$ 发散。
  - 关键点：瑕点端的收敛区间（$0<p<1$）与无穷端（$p>1$）**相反**。

- **定理11.7、11.8（瑕积分的狄利克雷与阿贝尔判别法）**：$a$ 为 $f$ 的瑕点。若 $F(u)=\int_u^bf$ 在 $(a,b]$ 上有界、$g$ 在 $(a,b]$ 上单调且 $\lim_{x\to a^+}g=0$，则 $\int_a^bfg$ 收敛（狄利克雷）；若 $\int_a^bf$ 收敛、$g$ 在 $(a,b]$ 上单调有界，则 $\int_a^bfg$ 收敛（阿贝尔）。
  - 何时用：瑕点端出现 $\frac{\sin(1/x)}{x^\alpha}$ 这类「振荡 $\times$ 单调」结构。

- **混合判定套路（§3 例2）**：$\Phi(\alpha)=\int_0^{+\infty}\frac{x^{\alpha-1}}{1+x}dx$ 在非奇点 $x=1$ 处拆成瑕积分 $I(\alpha)$ 与无穷积分 $J(\alpha)$，各用柯西判别法定出区间再取交（见下面的工作示例）。
  - 关键点：拆点必须选**没有奇性**的点，否则重复计算奇性。

## Key Concepts / 核心概念

- **无穷限反常积分（improper integral over an infinite interval）**：由 $\lim_{u\to+\infty}\int_a^uf$ 定义的积分，简称无穷积分。
- **瑕积分（improper integral of a function with a singularity）**：被积函数在瑕点邻域无界时，以 $\lim_{u\to a^+}\int_u^bf$ 定义的积分。
- **瑕点（singular point）**：使被积函数在任意邻域内无界的点，可在端点、内点或两端。
- **收敛与发散（convergence / divergence）**：定义中的极限存在且有限称收敛，否则发散（含 $\pm\infty$ 与不存在）。
- **绝对收敛（absolute convergence）**：$\int|f|$ 收敛，此时 $\int f$ 必收敛。
- **条件收敛（conditional convergence）**：$\int f$ 收敛而 $\int|f|$ 发散，如 $\int_1^{+\infty}\frac{\sin x}{x^p}\ (0<p\le1)$。
- **柯西准则（Cauchy criterion）**：用 $\big|\int_{u_1}^{u_2}f\big|<\varepsilon$ 刻画收敛，无需知道极限值。
- **比较原则（comparison test）**：非负函数间用不等式传递敛散性。
- **柯西判别法（Cauchy test）**：以 $\frac1{x^p}$（无穷端）、$\frac1{(x-a)^p}$（瑕点端）为标尺的极限形式判别法。
- **狄利克雷判别法（Dirichlet test）**：有界部分积分 $\times$ 单调趋于 0 的因子。
- **阿贝尔判别法（Abel test）**：收敛积分 $\times$ 单调有界因子。
- **牛顿–莱布尼茨公式的推广**：$F'=f$ 时 $\int_a^{+\infty}f=\lim_{x\to+\infty}F(x)-F(a)$，瑕点端同理取单侧极限；换元与分部积分对反常积分同样适用。

## Mental Models / 思维模型

- **把反常积分看成「正常积分取极限」而非新积分**：一切操作先在有穷/有界部分做完，最后才取极限；代上下限时把 $\infty$ 与瑕点都写成极限号，绝不直接代入。
- **先定奇性，再选标尺**：先列出所有让 $f$ 出问题的点（$\pm\infty$、端点、内点），在每点附近把 $f$ 换主部，与 $\frac1{x^p}$、$\frac1{(x-a)^q}$ 对齐。有几个奇点就拆几段，逐段单独判。
- **把判别法看成级数判别法的连续版**：比较原则 ↔ 比较判别法，柯西判别法 ↔ $p$-级数，狄利克雷/阿贝尔 ↔ 级数同名判别法；阈值方向拿不准时回到 $p$-积分标尺自己算一遍。
- **遇到振荡乘衰减，默认走狄利克雷**：$\frac{\sin x}{x^p}$、$\frac{\cos x}{x}$、$\sin x^2$ 一律先查 $\int f$ 是否有界、$g$ 是否单调趋于 0；算出 $\int|f|$ 发散是常态，别据此判发散。

## Anti-patterns / 常见错误

- **对含瑕点的积分直接套牛顿–莱布尼茨公式**：$\int_{-1}^1\frac{dx}{x^2}=\big[-\frac1x\big]_{-1}^1=-2$ 是错的——$x=0$ 是内点瑕点，须拆两段，两段都发散，故积分发散。
- **把「收敛」等同于「被积函数趋于 0」**：$\int_1^{+\infty}\sin x^2dx$ 条件收敛而 $\sin x^2$ 不趋于 0（$x\sin x^4$ 甚至无界）；$f\to0$ 需要额外条件（$f$ 单调，或一致连续）。
- **混淆绝对收敛与条件收敛**：$\int_1^{+\infty}\frac{\sin x}{\sqrt x}dx$ 收敛（狄利克雷）而 $\int_1^{+\infty}\big|\frac{\sin x}{\sqrt x}\big|dx$ 发散；性质 3 只说「绝对收敛 $\Rightarrow$ 收敛」，不能反用。
- **对变号函数直接用比较原则**：$0\le f\le g$ 的前提不能被 $\frac{\sin x}{x}\le\frac1x$ 替代；正确路径是先对 $|f|$ 放缩证绝对收敛，不行再走狄利克雷/阿贝尔。
- **记反柯西判别法的阈值**：无穷端 $p>1$ 收敛，瑕点端 $0<p<1$ 收敛。自查口诀：奇性越强越难收敛——$x^{-p}$ 要衰减快（$p$ 大），$(x-a)^{-p}$ 要发散得慢（$p$ 小）。
- **内点瑕点只判一段**：$\int_a^bf$ 在瑕点 $c\in(a,b)$ 处必须拆成 $\int_a^c+\int_c^b$ 且两段各自收敛；只算一段就下结论是典型漏洞。换元时也要同步重查奇性位置（$x\to+\infty$ 可能映成新的瑕点）。

## Reference Tables / 速查表

| | 无穷积分 $\int_a^{+\infty}f$ | 瑕积分 $\int_a^bf$（瑕点 $a$） |
|---|---|---|
| 定义 | $\lim_{u\to+\infty}\int_a^uf$ | $\lim_{u\to a^+}\int_u^bf$ |
| 柯西准则 | $\forall\varepsilon>0,\exists G\ge a,\ u_1,u_2>G\Rightarrow\big\lvert\int_{u_1}^{u_2}f\big\rvert<\varepsilon$ | $\forall\varepsilon>0,\exists\delta>0,\ u_1,u_2\in(a,a+\delta)\Rightarrow\big\lvert\int_{u_1}^{u_2}f\big\rvert<\varepsilon$ |
| 标尺 | $\int_1^{+\infty}\frac{dx}{x^p}$：$p>1$ 收敛 | $\int_0^1\frac{dx}{x^q}$：$0<q<1$ 收敛 |
| 柯西判别法（极限形式） | $\lim x^pf=\lambda$：$p>1,0\le\lambda<+\infty$ 收敛；$p\le1,0<\lambda\le+\infty$ 发散 | $\lim(x-a)^pf=\lambda$：$0<p<1,0\le\lambda<+\infty$ 收敛；$p\ge1,0<\lambda\le+\infty$ 发散 |
| 一般判别法 | 狄利克雷（有界 $\times$ 单调 $\to0$）、阿贝尔（收敛 $\times$ 单调有界） | 结构相同，下端改为瑕点 $a$ |

| 典型积分 | 敛散性 | 依据 |
|---|---|---|
| $\int_1^{+\infty}\frac{\sin x}{x^p}dx,\int_1^{+\infty}\frac{\cos x}{x^p}dx$ | $p>1$ 绝对收敛；$0<p\le1$ 条件收敛 | §2 例3 |
| $\int_0^{+\infty}\frac{x^{\alpha-1}}{1+x}dx$ | $0<\alpha<1$ 收敛，其余发散 | §3 例2 |
| $\int_0^{a}\frac{\ln x}{\sqrt x}dx\ (a>0)$ | 收敛（瑕点 $x=0$，取 $p=\frac34<1$） | §3 例1 |
| $\int_1^2\frac{\sqrt x}{\ln x}dx$ | 发散（瑕点 $x=1$，$p=1$） | §3 例1 |

## Worked Example / 工作示例

**问题**（§3 例 2）：讨论 $\Phi(\alpha)=\displaystyle\int_0^{+\infty}\frac{x^{\alpha-1}}{1+x}\,dx$ 关于参数 $\alpha$ 的收敛性。

**第一步：找奇性、拆积分。** $f(x)=\frac{x^{\alpha-1}}{1+x}$ 在三处可能出问题：$x\to0^+$（$\alpha<1$ 时 $f\sim x^{\alpha-1}\to+\infty$，是瑕点）、$x\to+\infty$（需判无穷积分）、$x=-1$（不在区间内，不管）。取非奇点 $x=1$ 拆开：

$$\Phi(\alpha)=\underbrace{\int_0^1\frac{x^{\alpha-1}}{1+x}dx}_{I(\alpha)}+\underbrace{\int_1^{+\infty}\frac{x^{\alpha-1}}{1+x}dx}_{J(\alpha)},\qquad \Phi\ \text{收敛}\iff I,J\ \text{都收敛}.$$

**第二步：判 $I(\alpha)$（瑕点 $x=0$）。** 取标尺 $\frac1{x^p}$，算 $\lim_{x\to0^+}x^pf(x)$，令 $p=1-\alpha$：

$$\lim_{x\to0^+}x^{1-\alpha}\cdot\frac{x^{\alpha-1}}{1+x}=\lim_{x\to0^+}\frac1{1+x}=1\ (\lambda=1).$$

由定理 11.6 推论 3：$0<p<1$ 即 $0<1-\alpha<1$，亦即 $\boxed{0<\alpha<1}$ 时 $I(\alpha)$ 收敛；$p\ge1$ 即 $\alpha\le0$ 时发散。$\alpha\ge1$ 时 $f$ 在 $[0,1]$ 有界，$I(\alpha)$ 是正常定积分。

**第三步：判 $J(\alpha)$（无穷端）。** $x\to+\infty$ 时 $f(x)\sim x^{\alpha-2}$，令 $p=2-\alpha$：

$$\lim_{x\to+\infty}x^{2-\alpha}\cdot\frac{x^{\alpha-1}}{1+x}=\lim_{x\to+\infty}\frac{x}{1+x}=1\ (\lambda=1).$$

由推论 3：$p>1$ 即 $2-\alpha>1$，亦即 $\boxed{\alpha<1}$ 时 $J(\alpha)$ 收敛；$p\le1$ 即 $\alpha\ge1$ 时发散。

**第四步：取交，列汇总表。**

| $\alpha$ | $\alpha\le0$ | $0<\alpha<1$ | $\alpha\ge1$ |
|---|---|---|---|
| $I(\alpha)$ | 发散 | 收敛 | 正常定积分 |
| $J(\alpha)$ | 收敛 | 收敛 | 发散 |
| $\Phi(\alpha)$ | 发散 | **收敛** | 发散 |

故 $\Phi(\alpha)$ 当且仅当 $0<\alpha<1$ 时收敛。

**第五步：验证。** 作换元 $x=\frac1t$（$dx=-\frac{dt}{t^2}$，$x:0\to+\infty$ 对应 $t:+\infty\to0^+$）：

$$\Phi(\alpha)=\int_{+\infty}^{0}\frac{t^{1-\alpha}}{1+1/t}\left(-\frac{dt}{t^2}\right)=\int_0^{+\infty}\frac{t^{1-\alpha}}{1+t}\,dt=\Phi(1-\alpha).$$

该变换把 $\alpha$ 映成 $1-\alpha$，而 $(0,1)$ 正是它的不变量，与上面结论**自洽** ✓。再查两个边界值：$\alpha=0$ 时 $\Phi=\int_0^{+\infty}\frac{dx}{x(1+x)}$，在 $0$ 附近 $\sim\frac1x$ 发散；$\alpha=1$ 时 $\Phi=\int_0^{+\infty}\frac{dx}{1+x}$，在 $+\infty$ 附近 $\sim\frac1x$ 发散——两端各失守一次，与表格一致。

**要点回放**：① 拆点必须选非奇点；② 每端各算 $\lim x^pf(x)$，再与阈值 $1$ 比较，方向相反；③ 参数题用换元对称性做独立验证最省力。

## Key Takeaways / 关键结论

1. 两类反常积分的定义都是「先算正常积分、再取极限」；判敛前先把所有奇点列全，逐个处理。
2. $\int_1^{+\infty}\frac{dx}{x^p}$（$p>1$ 收敛）与 $\int_0^1\frac{dx}{x^q}$（$q<1$ 收敛）是全部比较判别法的标尺，阈值方向相反必须记牢。
3. 柯西准则（定理 11.1、11.5）是收敛性的等价刻画，也是狄利克雷、阿贝尔判别法证明的发动机。
4. 绝对收敛蕴含收敛（性质 3），反之不真；条件收敛的典型是 $\frac{\sin x}{x^p}\ (0<p\le1)$。
5. 非负函数走比较原则与柯西判别法（定理 11.2、11.6）；变号函数走狄利克雷/阿贝尔（定理 11.3、11.4、11.7、11.8）——先看被积函数是否保持同号，再选工具。
6. 内点瑕点必须拆成两段且两段都收敛；收敛不意味着被积函数趋于 0，「单调（或一致连续）$+$ 收敛 $\Rightarrow f\to0$」是二者之间的桥梁。
7. 牛顿–莱布尼茨公式、换元、分部积分对反常积分仍然成立，只是代端点时要取极限。

## Connects To / 与其他章节的联系

- **前置**：第九章定积分（定义、可积性、换元与分部积分、绝对值不等式）、**定理9.11 积分第二中值定理**（狄利克雷判别法证明的关键）、第三章函数极限的柯西准则与单调有界准则。
- **后续**：下册含参量积分（$\int_a^{+\infty}f(x,\alpha)dx$ 的一致收敛性）建立在本题对每个固定 $\alpha$ 的收敛判据之上；数项级数章的判别法与本章一一对应。
- **附录**：附录Ⅰ实数理论的确界原理、致密性定理与柯西准则是本章极限存在性论证的底层依据；附录Ⅱ积分表为「判敛之后求值」提供现成原函数。
