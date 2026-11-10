# 第十九章 含参量积分 (Integrals with Parameters)

> 《数学分析》第六版（下册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

把定积分里的某个变量"当成常数"看，积分值就成为这个常数（参数）的函数，例如 $\varphi(x)=\int_c^df(x,y)\,dy$——这样的量叫**含参量积分（integral with a parameter）**。本章全部内容可压缩成一句话：**积分运算与求极限、求导、再积分这三个运算，在什么条件下可以交换次序？**

答案分两档。被积函数连续（**正常积分**）时三个交换全都无条件成立；一旦积分区间无穷或被积函数无界（**含参量反常积分**），就必须要求比逐点收敛更强的**一致收敛**，否则交换会失败——$\int_0^{+\infty}\frac{\sin xy}{y}dy$ 在 $(0,+\infty)$ 上逐点收敛却因不一致收敛，使极限函数 $\frac\pi2\operatorname{sgn}x$ 在 $x=0$ 处断裂。这套"交换"技术能算出大量初等方法算不出的积分（$\int_0^{+\infty}\frac{\sin x}{x}dx=\frac\pi2$、$\int_0^{+\infty}e^{-x^2}\cos rx\,dx=\frac{\sqrt\pi}{2}e^{-r^2/4}$），也定义了欧拉积分 $\Gamma$ 与 $B$。

## Frameworks Introduced / 核心框架

- **含参量正常积分的定义（§1）**：设 $f(x,y)$ 在 $[a,b]\times[c,d]$ 上有定义且对每个 $x$ 关于 $y$ 可积，则
  $$\varphi(x)=\int_c^df(x,y)\,dy,\quad x\in[a,b]$$
  称为含参量 $x$ 的正常积分。更一般地，在区域 $G=\{(x,y)\mid c(x)\le y\le d(x),\ a\le x\le b\}$（$c,d$ 连续）上可定义 $F(x)=\int_{c(x)}^{d(x)}f(x,y)\,dy$。
  - 关键点：第二种形式的积分限含参量，这是莱布尼茨公式多出两项的来源。

- **定理19.1（连续性）**：$f(x,y)$ 在矩形 $R=[a,b]\times[c,d]$ 上连续 ⇒ $\varphi(x)=\int_c^df(x,y)dy$ 在 $[a,b]$ 上连续。
  - 等价形式（交换极限与积分）：$\lim\limits_{x\to x_0}\int_c^df(x,y)dy=\int_c^d\lim\limits_{x\to x_0}f(x,y)dy$。
  - 关键点（证明）：$f$ 在有界闭域上**一致连续**，故 $|\varphi(x+\Delta x)-\varphi(x)|\le\int_c^d|f(x+\Delta x,y)-f(x,y)|dy\le\varepsilon(d-c)$。对含参量 $y$ 的积分 $\psi(y)=\int_a^bf(x,y)dx$ 同理。
  - 何时用：求 $\lim\limits_{x\to x_0}\int f(x,y)dy$，被积函数连续时把极限直接搬进积分号。

- **定理19.2（连续性，变限情形）**：$f(x,y)$ 在 $G=\{(x,y)\mid c(x)\le y\le d(x),a\le x\le b\}$ 上连续、$c(x),d(x)$ 在 $[a,b]$ 上连续 ⇒ $F(x)=\int_{c(x)}^{d(x)}f(x,y)dy$ 在 $[a,b]$ 上连续。
  - 关键点（证明）：换元 $y=c(x)+t(d(x)-c(x))$（$t\in[0,1]$）把积分化为矩形 $[a,b]\times[0,1]$ 上的含参量正常积分，归结为定理19.1。
  - 何时用：积分限是 $x$ 的函数（如 $\int_\alpha^{1+\alpha}$）时用这一条或先换元。

- **定理19.3（可微性，积分号下求导）**：$f$ 与 $f_x$ 都在 $R=[a,b]\times[c,d]$ 上连续 ⇒ $\varphi$ 在 $[a,b]$ 上可微，且
  $$\frac{d}{dx}\int_c^df(x,y)\,dy=\int_c^d\frac{\partial f}{\partial x}(x,y)\,dy.$$
  - 关键点（证明）：拉格朗日中值定理给出 $\Delta f=f_x(x+\theta\Delta x,y)\Delta x$，再用 $f_x$ 的一致连续性得 $\big|\frac{\Delta\varphi}{\Delta x}-f_x(x,y)\big|<\varepsilon$。
  - 何时用：被积函数含参数且直接积不出来时，先求导再积分（例4、例7 的出发点）。

- **定理19.4（可微性，变限情形；莱布尼茨公式）**：设 $f,f_x$ 在 $[a,b]\times[p,q]$ 上连续，$c(x),d(x)$ 是 $[a,b]$ 上取值含于 $[p,q]$ 的可微函数，则
  $$F'(x)=\int_{c(x)}^{d(x)}f_x(x,y)\,dy+f\big(x,d(x)\big)d'(x)-f\big(x,c(x)\big)c'(x).$$
  - 关键点：把 $F$ 看成 $F(x)=H(x,c(x),d(x))$，用变限积分求导法则加复合函数求导法则；后两项的口诀是"上限加、下限减"。

- **定理19.5、19.6（可积性与积分次序交换）**：$f$ 在矩形 $R$ 上连续 ⇒ $\varphi,\psi$ 分别在 $[a,b],[c,d]$ 上可积，且累次积分与顺序无关：
  $$\int_a^bdx\int_c^df(x,y)\,dy=\int_c^ddy\int_a^bf(x,y)\,dx.$$
  - 关键点（证明）：记 $\varphi_1(u)=\int_a^udx\int_c^df\,dy$、$\varphi_2(u)=\int_c^ddy\int_a^uf\,dx$，由定理19.3 得 $\varphi_1'=\varphi_2'=\varphi$，二者只差常数；由 $u=a$ 时都为 $0$ 知常数为零，取 $u=b$ 即得。
  - 关键点：$f$ 在矩形上连续不能省。$(x^2+y^2)^{-2}$ 这类函数在含原点的矩形上不连续，两个累次积分可以不相等，与定理并不矛盾——前提未满足。

- **"参数化"技巧（§1 例3、例2）**：算不出的定积分，先改写成一个含参量积分，再交换次序或求导。
  - 例3：因 $\frac{x^b-x^a}{\ln x}=\int_a^bx^y\,dy$，对 $I=\int_0^1\frac{x^b-x^a}{\ln x}dx\ (b>a>0)$ 交换次序得 $I=\int_a^b\frac{dy}{1+y}=\ln\frac{1+b}{1+a}$。
  - 例2：$\varphi(x)=\frac1{(n-1)!}\int_0^1(x-t)^{n-1}f(t)dt$ 满足 $\varphi^{(n)}(x)=f(x)$（反复用定理19.4），且 $\varphi(0)=\varphi'(0)=\dots=\varphi^{(n-1)}(0)=0$。
  - 例1（直接用连续性）：$\lim\limits_{\alpha\to0}\int_\alpha^{1+\alpha}\frac{dx}{1+x^2+\alpha^2}=\int_0^1\frac{dx}{1+x^2}=\frac\pi4$。

- **定义1（含参量反常积分的一致收敛）**：设 $f(x,y)$ 定义在 $R=\{(x,y)\mid x\in I,\ c\le y<+\infty\}$ 上，对每个 $x\in I$ 积分 $\int_c^{+\infty}f(x,y)dy$ 收敛，值为 $\Phi(x)$。若对任给 $\varepsilon>0$，总存在 $N>c$，使当 $M>N$ 时对**一切** $x\in I$ 都有
  $$\Big|\int_M^{+\infty}f(x,y)\,dy\Big|<\varepsilon,$$
  则称该积分在 $I$ 上**一致收敛**于 $\Phi(x)$。
  - 关键点：与逐点收敛的唯一差别是 $N$ 的取法与 $x$ **无关**。若在任意 $[a,b]\subset I$ 上都一致收敛，称在 $I$ 上**内闭一致收敛**；$I$ 本身是闭区间时两者一致。

- **定理19.7（柯西准则）**：在 $I$ 上一致收敛 $\iff$ 任给 $\varepsilon>0$，存在 $M>c$，使当 $A_1,A_2>M$ 时对一切 $x\in I$ 有 $\big|\int_{A_1}^{A_2}f(x,y)dy\big|<\varepsilon$。
  - 关键点：否命题同样好用——不一致收敛即存在 $\varepsilon_0>0$，对任意 $M$ 都能找到 $A_2>A_1>M$ 及某 $x\in I$ 使 $\big|\int_{A_1}^{A_2}f\,dy\big|\ge\varepsilon_0$。

- **定理19.8**：在 $I$ 上一致收敛 $\iff\lim\limits_{A\to+\infty}F(A)=0$，其中 $F(A)=\sup\limits_{x\in I}\big|\int_A^{+\infty}f(x,y)dy\big|$。
  - 何时用：证明**不**一致收敛时，直接说明 $F(A)\not\to0$。

- **例1（$\int_0^{+\infty}\frac{\sin xy}{y}dy$，一致收敛的标尺）**：它在 $[\delta,+\infty)\ (\delta>0)$ 上一致收敛，但在 $(0,+\infty)$ 上不一致收敛，从而只在 $(0,+\infty)$ 上内闭一致收敛。
  - 收敛：换元 $u=xy$ 化为 $\int_{\delta A}^{+\infty}\frac{\sin u}{u}du$，取 $M=M'/\delta$，则 $A>M$ 时对一切 $x\ge\delta$ 有 $Ax>M'$。
  - 不一致：取 $\varepsilon_0=\frac12\ln2$、$A_1=\frac{2M}{3}$、$A_2=2A_1$、$x=\frac{\pi}{2A_1}$，则 $y\in[A_1,A_2]$ 时 $xy\in[\frac\pi2,\pi]$，$\big|\int_{A_1}^{A_2}\frac{\sin xy}{y}dy\big|=\frac12\ln2=\varepsilon_0$，柯西准则失效。
  - 关键点：这正是 $\Phi(x)=\frac\pi2\operatorname{sgn}x$ 在 $x=0$ 断裂的原因——定理19.10 的一致收敛条件被破坏。

- **定理19.9（与函数项级数的桥梁）**：在 $I$ 上一致收敛 $\iff$ 对任一趋于 $+\infty$ 的递增数列 $\{A_n\}$（$A_1=c$），函数项级数 $\sum_{n=1}^{\infty}\int_{A_n}^{A_{n+1}}f(x,y)dy=\sum u_n(x)$ 在 $I$ 上一致收敛。
  - 关键点：这条定理把含参量反常积分的一切性质**整体移交**给第十三章函数项级数的相应定理，后面几个定理都是它的推论。

- **三条一致收敛判别法**：
  - **魏尔斯特拉斯 M 判别法**：若 $|f(x,y)|\le g(y)$ 对一切 $(x,y)\in I\times[c,+\infty)$ 成立且 $\int_c^{+\infty}g(y)dy$ 收敛，则 $\int_c^{+\infty}f(x,y)dy$ 在 $I$ 上一致收敛。$g$ **不能含 $x$**。
  - **狄利克雷判别法**：若 (i) 对一切 $N>c$，$\int_c^Nf(x,y)dy$ 对 $N$ 与 $x$ 一致有界（存在 $M$ 使 $\big|\int_c^Nf\,dy\big|\le M$）；(ii) 对每个 $x$，$g(x,y)$ 关于 $y$ 单调，且 $y\to+\infty$ 时对 $x$ **一致地**趋于 $0$，则 $\int_c^{+\infty}f(x,y)g(x,y)dy$ 在 $I$ 上一致收敛。
  - **阿贝尔判别法**：若 (i) $\int_c^{+\infty}f(x,y)dy$ 在 $I$ 上一致收敛；(ii) $g(x,y)$ 对 $y$ 单调且对 $x$ 在 $I$ 上一致有界，则 $\int_c^{+\infty}f(x,y)g(x,y)dy$ 在 $I$ 上一致收敛。
  - 例（§2 例2—例4）：$\int_0^{+\infty}\frac{\cos xy}{1+x^2}dx$ 在 $(-\infty,+\infty)$ 上一致收敛（M：$\frac1{1+x^2}$）；$\int_0^{+\infty}e^{-xy}\frac{\sin x}{x}dx$ 在 $[0,+\infty)$ 上一致收敛（阿贝尔）；$\int_1^{+\infty}\frac{y\sin xy}{1+y^2}dy$ 在 $(0,+\infty)$ 上内闭一致收敛（狄利克雷：$\frac{y}{1+y^2}$ 单调递减且一致趋于 $0$）。

- **定理19.10（连续性）**：$f$ 在 $I\times[c,+\infty)$ 上连续，$\Phi(x)=\int_c^{+\infty}f(x,y)dy$ 在 $I$ 上一致收敛 ⇒ $\Phi$ 在 $I$ 上连续。**推论**：把"一致收敛"减弱为"内闭一致收敛"，结论不变。
  - 等价形式（交换极限与无穷积分）：$\lim\limits_{x\to x_0}\int_c^{+\infty}f(x,y)dy=\int_c^{+\infty}\lim\limits_{x\to x_0}f(x,y)dy$。

- **定理19.11（可微性）**：$f$ 与 $f_x$ 在 $I\times[c,+\infty)$ 上连续。若 $\Phi(x)=\int_c^{+\infty}f\,dy$ 在 $I$ 上**收敛**，而 $\int_c^{+\infty}f_x\,dy$ 在 $I$ 上**一致收敛**，则 $\Phi$ 在 $I$ 上可微且 $\Phi'(x)=\int_c^{+\infty}f_x(x,y)dy$。**推论**：把后一条件减弱为内闭一致收敛，结论不变。
  - 关键点：条件配对极易记反——**原积分只需收敛，导函数的积分才需要一致收敛**。

- **定理19.12（可积性，交换积分次序）**：$f$ 在 $[a,b]\times[c,+\infty)$ 上连续，$\Phi(x)=\int_c^{+\infty}f\,dy$ 在 $[a,b]$ 上一致收敛 ⇒
  $$\int_a^bdx\int_c^{+\infty}f(x,y)\,dy=\int_c^{+\infty}dy\int_a^bf(x,y)\,dx.$$
  - 关键点：证明走"函数项级数逐项求积 + 定理19.6"。当 $x$ 的范围也是无穷区间时用**定理19.13**：若 $\int_a^{+\infty}f\,dx$ 关于 $y$ 在 $[c,+\infty)$ 上内闭一致收敛、$\int_c^{+\infty}f\,dy$ 关于 $x$ 在 $[a,+\infty)$ 上内闭一致收敛，且 $\int_a^{+\infty}dx\int_c^{+\infty}|f|dy$ 与 $\int_c^{+\infty}dy\int_a^{+\infty}|f|dx$ 中有一个收敛，则两个累次积分相等。

- **三个必记的含参量反常积分（§2 例5—例7）**：
  - 例5：$J=\int_0^{+\infty}e^{-px}\frac{\sin bx-\sin ax}{x}dx=\arctan\frac bp-\arctan\frac ap\ (p>0,\ b>a)$。证法：先把 $\frac{\sin bx-\sin ax}{x}$ 写成 $\int_a^b\cos xy\,dy$，用 M 判别法验证一致收敛后交换次序，再用 $\int_0^{+\infty}e^{-px}\cos xy\,dx=\frac{p}{p^2+y^2}$。
  - 例6（狄利克雷积分）：在例5 中令 $b=0$ 得 $F(p)=\int_0^{+\infty}e^{-px}\frac{\sin ax}{x}dx=\arctan\frac ap\ (p>0)$；由阿贝尔判别法它在 $p\ge0$ 上一致收敛，故 $F$ 在 $p=0$ 连续，于是
    $$\int_0^{+\infty}\frac{\sin ax}{x}dx=F(0)=\lim_{p\to0^+}\arctan\frac ap=\frac\pi2\operatorname{sgn}a.$$
  - 例7：$\varphi(r)=\int_0^{+\infty}e^{-x^2}\cos rx\,dx$ 在 $(-\infty,+\infty)$ 上收敛，且 $\varphi'(r)=-\int_0^{+\infty}xe^{-x^2}\sin rx\,dx$（M 判别法保证一致收敛）；分部积分得 $\varphi'(r)=-\frac r2\varphi(r)$，解出 $\varphi(r)=\varphi(0)e^{-r^2/4}=\frac{\sqrt\pi}{2}e^{-r^2/4}$。
  - 关键点：三例示范三条路线——**换序**（例5、例6）、**积分号下求导得微分方程**（例7）、**先证一致收敛再用连续性取极限**（例6 末步）。

- **定义2（含参量无界函数反常积分的一致收敛）**：$f(x,y)$ 在 $[a,b]\times[c,d)$ 上有定义、$y=d$ 为瑕点。若对任给 $\varepsilon>0$，总存在 $\delta<d-c$，使当 $0<\eta<\delta$ 时对一切 $x\in[a,b]$ 有 $\big|\int_{d-\eta}^df(x,y)dy\big|<\varepsilon$，则称 $\int_c^df(x,y)dy$ 在 $[a,b]$ 上一致收敛。
  - 关键点：判别法与性质与无穷限情形逐条平行，只需把"尾部 $\int_M^{+\infty}$"换成"瑕点邻域 $\int_{d-\eta}^d$"。

- **欧拉积分之一：$\Gamma$ 函数（§3 一）**：
  $$\Gamma(s)=\int_0^{+\infty}x^{s-1}e^{-x}dx,\quad s>0.$$
  - 定义域：拆成 $\Phi(s)=\int_0^1x^{s-1}e^{-x}dx$ 与 $\Psi(s)=\int_1^{+\infty}x^{s-1}e^{-x}dx$，由柯西判别法知 $\Phi$ 在 $0<s<1$ 时收敛（$s\ge1$ 时是正常积分）、$\Psi$ 对一切 $s>0$ 收敛，故定义域为 $s>0$。
  - 连续可导：在任意 $[a,b]\ (a>0)$ 上用 M 判别法（$x\le1$ 时 $x^{s-1}e^{-x}\le x^{a-1}e^{-x}$，$x\ge1$ 时 $\le x^{b-1}e^{-x}$）得 $\Gamma$ 连续；对 $\int_0^{+\infty}x^{s-1}e^{-x}\ln x\,dx$ 同样一致收敛，由定理19.11 得
    $$\Gamma'(s)=\int_0^{+\infty}x^{s-1}e^{-x}\ln x\,dx,\qquad \Gamma^{(n)}(s)=\int_0^{+\infty}x^{s-1}e^{-x}(\ln x)^n dx.$$
  - **递推公式**：对 $\int_0^Ax^se^{-x}dx$ 分部积分并令 $A\to+\infty$，得
    $$\Gamma(s+1)=s\Gamma(s)\ (s>0),\qquad \Gamma(n+1)=n!\ (n\in\mathbb N),\quad \Gamma(1)=\Gamma(2)=1.$$
    反复使用得 $\Gamma(s+1)=s(s-1)\cdots(s-n)\Gamma(s-n)$，故只要知道 $\Gamma$ 在 $0<s\le1$ 上的值就能算出其余全部值。
  - 图像与延拓：$s>0$ 时 $\Gamma>0,\Gamma''>0$，图像严格凸；由 $\Gamma(1)=\Gamma(2)=1$ 知唯一极小点在 $(1,2)$ 内，且 $\lim\limits_{s\to0^+}\Gamma(s)=\lim\limits_{s\to+\infty}\Gamma(s)=+\infty$。把递推公式改写成 $\Gamma(s)=\Gamma(s+1)/s$，可依次定义 $(-1,0)$、$(-2,-1)$、… 上的值，延拓到除 $s=0,-1,-2,\dots$ 外的整个数轴。
  - 其他形式：$x=y^2$ 给 $\Gamma(s)=2\int_0^{+\infty}y^{2s-1}e^{-y^2}dy$；$x=py\ (p>0)$ 给 $\Gamma(s)=p^s\int_0^{+\infty}y^{s-1}e^{-py}dy$。

- **欧拉积分之二：$B$ 函数（§3 二）**：
  $$B(p,q)=\int_0^1x^{p-1}(1-x)^{q-1}dx,\quad p>0,\ q>0.$$
  - 定义域：$p<1$、$q<1$ 时分别是瑕点 $x=0$、$x=1$ 的无界函数反常积分，柯西判别法给出 $p>0,q>0$ 时收敛。
  - 连续性：固定 $p_0,q_0>0$，当 $p\ge p_0,q\ge q_0$ 时 $x^{p-1}(1-x)^{q-1}\le x^{p_0-1}(1-x)^{q_0-1}$，右端积分收敛，由 M 判别法得 $B$ 在 $p_0\le p<+\infty,q_0\le q<+\infty$ 上一致收敛，从而 $B$ 在 $p>0,q>0$ 上连续。
  - **对称性**：$B(p,q)=B(q,p)$（令 $x=1-y$）。
  - **递推公式**：
    $$B(p,q)=\frac{q-1}{p+q-1}B(p,q-1)\ (p>0,q>1);\qquad B(p,q)=\frac{p-1}{p+q-1}B(p-1,q)\ (p>1,q>0);$$
    $$B(p,q)=\frac{(p-1)(q-1)}{(p+q-1)(p+q-2)}B(p-1,q-1).$$
    证法：$p>0,q>1$ 时分部积分得 $B(p,q)=\frac{q-1}{p}\big[B(p,q-1)-B(p,q)\big]$，移项即得第一式；第二式由对称性推得，第三式由前两式推得。
  - 其他形式：$x=\cos^2\varphi$ 给 $B(p,q)=2\int_0^{\pi/2}\sin^{2q-1}\varphi\cos^{2p-1}\varphi\,d\varphi$；$x=\frac{y}{1+y}$ 给 $B(p,q)=\int_0^{+\infty}\frac{y^{p-1}}{(1+y)^{p+q}}dy$。

- **$\Gamma$ 与 $B$ 的关系（§3 三）**：$m,n$ 为正整数时反复用 $B$ 的递推公式得 $B(m,n)=\frac{(m-1)!(n-1)!}{(m+n-1)!}$；对一般正实数 $p,q$ 有
  $$B(p,q)=\frac{\Gamma(p)\Gamma(q)}{\Gamma(p+q)}\quad(p>0,\ q>0).$$
  - 关键点：这条把两个欧拉积分绑在一起，是计算 $\int_0^{\pi/2}\sin^mx\cos^nx\,dx$、$\int_0^{+\infty}\frac{x^{a-1}}{1+x}dx=\Gamma(a)\Gamma(1-a)$ 一类积分的总开关（课本在第二十一章 §8 补证）。

## Key Concepts / 核心概念

- **含参量正常积分（proper integral with a parameter）**：积分限有穷、被积函数有界时的 $\int_c^df(x,y)dy$，其值是 $x$ 的函数。
- **含参量反常积分（improper integral with a parameter）**：积分区间无界或被积函数无界时的含参量积分。
- **一致收敛（uniform convergence）**：定义中 $N$（或 $\delta$）的选取与参数 $x$ 无关的那种收敛，是极限函数保持连续、可微、可积的保证。
- **内闭一致收敛（locally uniform convergence）**：在每个闭子区间 $[a,b]\subset I$ 上一致收敛；开区间上多数性质只需它。
- **柯西准则（Cauchy criterion）**：用 $\big|\int_{A_1}^{A_2}f\,dy\big|<\varepsilon$ 刻画一致收敛，是最基本的判据。
- **魏尔斯特拉斯 M 判别法（Weierstrass M-test）**：用不含 $x$ 的收敛优函数 $g(y)$ 控制 $|f(x,y)|$。
- **狄利克雷 / 阿贝尔判别法（Dirichlet / Abel test）**：处理"振荡因子 × 单调因子"型被积函数的两个一致收敛判别法。
- **积分号下求导（differentiation under the integral sign）**：$\frac{d}{dx}\int f\,dy=\int f_x\,dy$；正常情形只需 $f_x$ 连续，反常情形需 $\int f_x\,dy$ 一致收敛。
- **累次积分（iterated integral）**：$\int_a^bdx\int_c^df\,dy$ 这类先内后外的二次积分，定理19.6 与 19.12 给出换序条件。
- **欧拉积分（Euler integrals）**：$\Gamma$ 函数与 $B$ 函数的统称，$\Gamma(s)=\int_0^{+\infty}x^{s-1}e^{-x}dx\ (s>0)$ 满足 $\Gamma(s+1)=s\Gamma(s)$、$\Gamma(n+1)=n!$，$B(p,q)=\int_0^1x^{p-1}(1-x)^{q-1}dx\ (p,q>0)$ 对称且满足两条递推公式。

## Mental Models / 思维模型

- **把含参量积分看成一族积分、一条曲线**：$\varphi(x)$ 不是数而是函数，本章所有定理都在问这条曲线的连续性、可导性、可积性。逐点收敛只保证每个固定 $x$ 的值存在，不保证拼成的曲线连续——这就是必须引入一致收敛的原因。
- **一致收敛 = 收敛速度对 $x$ 一致**：先固定 $x$ 估计尾积分 $\int_M^{+\infty}f\,dy$，再看这个估计能否取成与 $x$ 无关。能靠一个不含 $x$ 的优函数控制住，就一致收敛。
- **交换运算前自查三问**：积分区间是否有限？被积函数及其导函数是否连续？反常情形下相应积分是否一致收敛？三问过关才落笔交换。
- **算不出积分时的标准流程**：① 把被积函数写成 $\int_a^bg(x,y)dy$（引入参数）后换序；② 或引入参数使求导后能积出，解关于参数的微分方程，再用初值/连续性定常数。

## Anti-patterns / 常见错误

- **把逐点收敛当一致收敛用**：$\int_0^{+\infty}\frac{\sin xy}{y}dy$ 在 $(0,+\infty)$ 上处处收敛却不一致收敛，其极限函数在 $x=0$ 处断裂；定理19.10 的条件不能省。
- **定理19.11 的条件配对记反**：需要一致收敛的是**导函数**的积分 $\int f_x\,dy$，原积分 $\int f\,dy$ 只需收敛。
- **M 判别法里取含 $x$ 的优函数**：$|f(x,y)|\le g(x,y)$ 且 $\int g\,dy$ 收敛推不出一致收敛；$g$ 必须只依赖 $y$。
- **交换二次积分次序时无视不连续点**：$(x^2+y^2)^{-2}$ 这类函数在含原点的矩形上不连续，两个累次积分可以不相等，与定理19.6 不矛盾；先检查前提。
- **对变限积分求导漏掉限额项**：只写 $\int_{c(x)}^{d(x)}f_x\,dy$ 而丢掉 $f(x,d(x))d'(x)-f(x,c(x))c'(x)$。
- **在 $\Gamma$ 的定义式里取 $s\le0$**：定义域只有 $s>0$；$s<0$ 的值必须用 $\Gamma(s)=\Gamma(s+1)/s$ 延拓，而 $s=0,-1,-2,\dots$ 无定义。
- **$B$ 的递推公式参数写错**：$B(p,q)=\frac{q-1}{p+q-1}B(p,q-1)$ 中减 $1$ 的是 $q$、分子是 $q-1$，与对称形式 $B(p,q)=\frac{p-1}{p+q-1}B(p-1,q)$ 混用会算出错值。

## Reference Tables / 速查表

**表 1　三类"交换运算"的条件对照**

| 交换内容 | 正常积分（$f$ 连续） | 含参量反常积分 |
|---|---|---|
| 求极限 ↔ 积分 | 定理19.1（连续性） | 定理19.10：$\int f\,dy$ 在 $I$ 上一致收敛（内闭亦可） |
| 求导 ↔ 积分 | 定理19.3：$f_x$ 连续 | 定理19.11：$\int f\,dy$ 收敛 **且** $\int f_x\,dy$ 一致收敛 |
| 变限求导 | 定理19.4（莱布尼茨公式） | 同左，另加一致收敛条件 |
| 积分 ↔ 积分 | 定理19.6：任意换序 | 定理19.12：$\int f\,dy$ 在 $[a,b]$ 上一致收敛；双无穷用定理19.13 |

**表 2　一致收敛判别法选择**

| 被积函数形态 | 用哪个 | 检查什么 |
|---|---|---|
| $\lvert f(x,y)\rvert\le g(y)$，$\int g$ 收敛 | 魏尔斯特拉斯 M | 优函数不含 $x$ |
| 振荡因子 × 单调衰减因子 | 狄利克雷 | $\int_c^Nf\,dy$ 对 $N,x$ 一致有界；$g$ 对 $y$ 单调且一致趋于 $0$ |
| 已知 $\int f$ 一致收敛 × 单调有界因子 | 阿贝尔 | $g$ 对 $y$ 单调、对 $x$ 一致有界 |
| 想证明**不**一致收敛 | 柯西准则的否命题 / 定理19.8 | 构造 $\varepsilon_0$ 与两端点，或说明 $\sup_x\big\lvert\int_A^{+\infty}f\,dy\big\rvert\not\to0$ |

**表 3　欧拉积分速查**

| 项目 | $\Gamma(s)$ | $B(p,q)$ |
|---|---|---|
| 定义 | $\int_0^{+\infty}x^{s-1}e^{-x}dx$ | $\int_0^1x^{p-1}(1-x)^{q-1}dx$ |
| 定义域 | $s>0$（递推延拓到 $s\ne0,-1,-2,\dots$） | $p>0,\ q>0$ |
| 递推 | $\Gamma(s+1)=s\Gamma(s)$ | $B(p,q)=\frac{q-1}{p+q-1}B(p,q-1)$；$B(p,q)=\frac{p-1}{p+q-1}B(p-1,q)$ |
| 对称性 | 无 | $B(p,q)=B(q,p)$ |
| 特殊值 | $\Gamma(1)=\Gamma(2)=1$，$\Gamma(n+1)=n!$，$\Gamma(\tfrac12)=\sqrt\pi$ | $B(m,n)=\frac{(m-1)!(n-1)!}{(m+n-1)!}$ |
| 其他形式 | $\Gamma(s)=2\int_0^{+\infty}y^{2s-1}e^{-y^2}dy$；$\Gamma(s)=p^s\int_0^{+\infty}y^{s-1}e^{-py}dy$ | $B(p,q)=2\int_0^{\pi/2}\sin^{2q-1}\varphi\cos^{2p-1}\varphi\,d\varphi$；$B(p,q)=\int_0^{+\infty}\frac{y^{p-1}}{(1+y)^{p+q}}dy$ |
| 相互关系 | — | $B(p,q)=\dfrac{\Gamma(p)\Gamma(q)}{\Gamma(p+q)}$ |

## Worked Example / 工作示例

**问题**：计算 $I=\int_0^1\dfrac{\ln(1+x)}{1+x^2}dx$。

被积函数在 $[0,1]$ 上连续，但分子与分母"不匹配"，直接积分积不出来。引入参数 $\alpha$，把 $\ln(1+x)$ 换成 $\ln(1+\alpha x)$：

$$\varphi(\alpha)=\int_0^1\frac{\ln(1+\alpha x)}{1+x^2}dx,\quad \alpha\in[0,1],\qquad \varphi(0)=0,\ \ \varphi(1)=I.$$

**第 1 步：确认满足积分号下求导的条件。** $f(x,\alpha)=\dfrac{\ln(1+\alpha x)}{1+x^2}$ 与 $f_\alpha(x,\alpha)=\dfrac{x}{(1+x^2)(1+\alpha x)}$ 在矩形 $[0,1]\times[0,1]$ 上都连续（$1+\alpha x\ge1$），满足定理19.3。

**第 2 步：在积分号下求导。**
$$\varphi'(\alpha)=\int_0^1\frac{x}{(1+x^2)(1+\alpha x)}dx.$$

**第 3 步：部分分式分解。**
$$\frac{x}{(1+x^2)(1+\alpha x)}=\frac{1}{1+\alpha^2}\left[\frac{\alpha+x}{1+x^2}-\frac{\alpha}{1+\alpha x}\right],$$
验证：右端通分后分子为 $(\alpha+x)(1+\alpha x)-\alpha(1+x^2)=\alpha+\alpha^2x+x+\alpha x^2-\alpha-\alpha x^2=(1+\alpha^2)x$。

**第 4 步：逐项积分。**
$$\varphi'(\alpha)=\frac{1}{1+\alpha^2}\Big[\alpha\int_0^1\frac{dx}{1+x^2}+\int_0^1\frac{x\,dx}{1+x^2}-\alpha\int_0^1\frac{dx}{1+\alpha x}\Big]
=\frac{1}{1+\alpha^2}\Big[\frac{\alpha\pi}{4}+\frac12\ln2-\ln(1+\alpha)\Big].$$

**第 5 步：对 $\alpha$ 从 $0$ 到 $1$ 积分，用对称性解出 $I$。** 由微积分基本定理 $I=\varphi(1)-\varphi(0)=\int_0^1\varphi'(\alpha)d\alpha$，把三部分分别积出：
$$\int_0^1\frac{\alpha}{1+\alpha^2}\cdot\frac\pi4\,d\alpha=\frac\pi8\Big[\ln(1+\alpha^2)\Big]_0^1=\frac\pi8\ln2,$$
$$\int_0^1\frac{1}{1+\alpha^2}\cdot\frac12\ln2\,d\alpha=\frac{\ln2}{2}\cdot\frac\pi4=\frac\pi8\ln2,\qquad
\int_0^1\frac{\ln(1+\alpha)}{1+\alpha^2}d\alpha=\varphi(1)=I.$$
于是
$$I=\frac\pi8\ln2+\frac\pi8\ln2-I\ \Longrightarrow\ 2I=\frac\pi4\ln2\ \Longrightarrow\ I=\frac\pi8\ln2.$$

**验证**：第 3 步的分解式已用通分核对；第 5 步没有漏项——积分后出现的 $\int_0^1\frac{\ln(1+\alpha)}{1+\alpha^2}d\alpha$ 恰好就是 $\varphi(1)=I$ 本身，这正是本题能解出 $I$ 的关键。数值校验：$\frac\pi8\ln2\approx0.2722$，与数值积分结果一致。

## Key Takeaways / 关键结论

1. **正常含参量积分的连续性、可微性、可积性只需 $f$ 连续**；变限求导要用莱布尼茨公式，多出 $f(x,d)d'-f(x,c)c'$ 两项。
2. **反常含参量积分的一切性质都建立在一致收敛之上**：连续性（19.10）、可微性（19.11）、可积性（19.12）；开区间上常常只需内闭一致收敛。
3. **一致收敛的判别法是三条路**：M 判别法（优函数不含 $x$）、狄利克雷（振荡 × 单调趋于 $0$）、阿贝尔（一致收敛 × 单调有界），三者都由定理19.9 导出。
4. **定理19.11 的条件要成对记**：原积分收敛 + 导函数积分一致收敛 ⇒ 可在积分号下求导。
5. **算不出定积分时的通用套路是"参数化"**：写成含参量积分后换序，或求导后解微分方程——这是 $\int_0^{+\infty}\frac{\sin x}{x}dx=\frac\pi2$、$\int_0^{+\infty}e^{-x^2}\cos rx\,dx=\frac{\sqrt\pi}{2}e^{-r^2/4}$ 的唯一来源。
6. **$\Gamma$ 与 $B$ 的定义域与递推公式要条件反射地写出**：$\Gamma(s+1)=s\Gamma(s)$、$\Gamma(n+1)=n!$；$B(p,q)=B(q,p)$、$B(p,q)=\frac{q-1}{p+q-1}B(p,q-1)$、$B(p,q)=\frac{\Gamma(p)\Gamma(q)}{\Gamma(p+q)}$。
7. **含参量瑕积分与无穷限情形逐条平行**：把"尾部"换成"瑕点邻域"即可，判别法与性质照搬。

## Connects To / 与其他章节的联系

- **向前依赖**：第九章定积分（可积性、变限积分求导）提供定理19.1—19.6 的舞台；第十一章反常积分（收敛定义、比较原则、柯西判别法、狄利克雷与阿贝尔判别法）是 §2 全部判别法的原型；第十三章函数项级数的一致收敛理论经定理19.9 整体搬入本章。
- **向后应用**：第二十一章重积分的累次积分与换序、$\int_0^{+\infty}e^{-x^2}dx=\frac{\sqrt\pi}{2}$ 的证明、以及第二十一章 §8 补证 $B(p,q)=\frac{\Gamma(p)\Gamma(q)}{\Gamma(p+q)}$，都要用本章的定理19.12 与 19.13。
- **与一元积分的呼应**：定理19.6 是"矩形上二重积分化为累次积分后与顺序无关"的雏形，第二十一章把它推广到一般区域；定理19.4 就是变限积分求导公式的含参量化版本。
- **其他领域**：$\Gamma$ 函数在概率论（$\Gamma$ 分布）与复变函数（$\Gamma$ 的解析延拓、余元公式 $\Gamma(a)\Gamma(1-a)=\frac{\pi}{\sin\pi a}$）中反复出现；例2 构造的 $\varphi(x)$ 与弦振动方程、格林函数方法有直接联系。
