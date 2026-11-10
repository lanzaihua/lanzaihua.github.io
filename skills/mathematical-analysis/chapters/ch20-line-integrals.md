# 第二十章 曲线积分 (Line Integrals)

> 《数学分析》第六版（下册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

前十九章的积分都定义在直线段（或矩形）上；本章把积分区域换成一条**曲线**，于是出现两类曲线积分，它们的差别不是记号、而是**原型**：

- **第一型曲线积分（对弧长）**：$\int_Lf(x,y)\,ds$，原型是线密度为 $f$ 的曲线状物体的**质量**。它只认曲线的几何形状，与曲线怎么定向毫无关系。
- **第二型曲线积分（对坐标）**：$\int_LP\,dx+Q\,dy$，原型是变力 $\mathbf F=(P,Q)$ 沿有向曲线把质点从 $A$ 推到 $B$ 所做的**功**。它与方向死死绑定：把 $A$ 到 $B$ 改成 $B$ 到 $A$，积分值整体变号。

计算两类积分只有一条路——把曲线参数化，化为定积分。区别只在"微元"：第一型用弧长元 $ds=\sqrt{\varphi'^2+\psi'^2}\,dt$（恒为正，方向不起作用），第二型用坐标微分 $dx=\varphi'(t)dt,\ dy=\psi'(t)dt$（有符号，方向由积分上下限承担）。一旦规定了方向，$dx=\cos(t,x)ds,\ dy=\cos(t,y)ds$，两类积分便互相转化。

## Frameworks Introduced / 核心框架

- **第一型曲线积分的定义（§1 一）**：设 $L$ 为平面上可求长度的曲线段，$f(x,y)$ 定义在 $L$ 上。对 $L$ 作分割 $T$，分成 $n$ 个可求长度的小弧段 $L_i$，弧长记为 $\Delta s_i$，分割细度 $\|T\|=\max\limits_{1\le i\le n}\Delta s_i$，在每个 $L_i$ 上任取 $(\xi_i,\eta_i)$。若极限
  $$\lim_{\|T\|\to0}\sum_{i=1}^nf(\xi_i,\eta_i)\Delta s_i=J$$
  存在且与分割方式及点 $(\xi_i,\eta_i)$ 的取法无关，则称 $J$ 为 $f(x,y)$ 在 $L$ 上的**第一型曲线积分**，记 $\int_Lf(x,y)\,ds$。空间曲线情形类似，记 $\int_Lf(x,y,z)\,ds$。
  - 物理意义：$f$ 为线密度时，积分值就是曲线状物体的质量。
  - 关键点：定义里只有弧长 $\Delta s_i$ 和"任取点"，**没有方向**；这是它与第二型的分水岭。

- **第一型曲线积分的性质（§1 一）**：设下列积分都存在。
  1. **线性**：$\int_L\sum_{i=1}^kc_if_i\,ds=\sum_{i=1}^kc_i\int_Lf_i\,ds$。
  2. **区间可加**：$L$ 由 $L_1,\dots,L_k$ 首尾相接而成时 $\int_Lf\,ds=\sum_{i=1}^k\int_{L_i}f\,ds$。
  3. **单调性**：$L$ 上 $f\le g$ ⇒ $\int_Lf\,ds\le\int_Lg\,ds$。
  4. **绝对值不等式**：$\big|\int_Lf\,ds\big|\le\int_L|f|\,ds$。
  5. **中值性**：设 $L$ 的弧长为 $s$，则存在常数 $c$（$\inf_Lf\le c\le\sup_Lf$）使 $\int_Lf\,ds=cs$；$f$ 连续时 $c=f(x_0,y_0)$，即 $\int_Lf\,ds=f(x_0,y_0)\cdot s$。
  - 关键点：性质 2、3 与定积分完全平行，因为 $ds>0$；这也是第一型积分有"中值定理"的原因（第二型没有）。

- **几何意义（§1 一，性质 6）**：$L$ 为 $xOy$ 面上分段光滑曲线、$f\ge0$ 连续时，以 $L$ 为准线、母线平行于 $z$ 轴的柱面被 $0\le z\le f(x,y)$ 截下的那块**柱面面积**就是 $\int_Lf(x,y)\,ds$。
  - 关键点：这条把第一型积分读成"面积"，与定积分读成"曲边梯形面积"同构。

- **定理20.1（第一型曲线积分的计算公式）**：设 $L$ 是光滑曲线，参数方程为 $x=\varphi(t),y=\psi(t),\ t\in[\alpha,\beta]$，$f(x,y)$ 在 $L$ 上连续，则
  $$\int_Lf(x,y)\,ds=\int_\alpha^\beta f\big(\varphi(t),\psi(t)\big)\sqrt{\varphi'^2(t)+\psi'^2(t)}\,dt.$$
  - 证明骨架：由弧长公式 $\Delta s_i=\int_{t_{i-1}}^{t_i}\sqrt{\varphi'^2+\psi'^2}\,dt$，用积分中值定理写成 $\sqrt{\varphi'^2(\tau_i)+\psi'^2(\tau_i)}\Delta t_i$；把 $\sum f(\xi_i,\eta_i)\Delta s_i$ 与 $\sum f(\varphi(\tau_i),\psi(\tau_i))\sqrt{\varphi'^2(\tau_i)+\psi'^2(\tau_i)}\Delta t_i$ 作差，用 $f$ 的有界性与 $\sqrt{\varphi'^2+\psi'^2}$ 的一致连续性证明误差 $\sigma\to0$，右边即 Riemann 和。
  - 关键点：$\alpha$ 与 $\beta$ 谁大谁小都行——$ds>0$，把区间换向只是把 $\Delta t_i$ 变号并同时翻转积分限，结果不变。这是"与方向无关"在计算层面的体现。
  - 两种特例：$L:y=\psi(x),\ x\in[a,b]$ 时
    $$\int_Lf\,ds=\int_a^bf(x,\psi(x))\sqrt{1+\psi'^2(x)}\,dx;$$
    $L:x=\varphi(y),\ y\in[c,d]$ 时
    $$\int_Lf\,ds=\int_c^df(\varphi(y),y)\sqrt{1+\varphi'^2(y)}\,dy.$$
  - 空间曲线 $x=\varphi(t),y=\psi(t),z=\chi(t)$：$\int_Lf\,ds=\int_\alpha^\beta f(\varphi,\psi,\chi)\sqrt{\varphi'^2+\psi'^2+\chi'^2}\,dt$。
  - 极坐标曲线 $\rho=\rho(\theta)$ 时用 $ds=\sqrt{\rho^2+\rho'^2}\,d\theta$。
  - 何时用：一切第一型曲线积分，先选"参数"（$t$、$x$、$y$、$\theta$），再算 $ds$。

- **物理应用（§1 例4 前后）**：$xOy$ 面上线密度为 $\rho(x,y)$ 的曲线状物体对 $x$ 轴、$y$ 轴的转动惯量为
  $$J_x=\int_Ly^2\rho(x,y)\,ds,\qquad J_y=\int_Lx^2\rho(x,y)\,ds.$$
  - 关键点：转动惯量里出现的是**坐标的平方**（到轴的距离平方），与第一型积分"只认弧长"的特性配合，$ds$ 一换即可。

- **第一型计算的三类典型手法（§1 例1—例3）**：
  - 例1（直接用公式）：$L$ 为半圆周 $x=a\cos t,y=a\sin t$，则 $\int_L(x^2+y^2)ds=\int_0^\pi a^2\cdot a\,dt=a^3\pi$。
  - 例2（化成 $x=\varphi(y)$）：$L$ 是 $y^2=4x$ 从 $O(0,0)$ 到 $A(1,2)$ 的一段，取 $x=y^2/4,\ y:0\to2$，$ds=\sqrt{1+y^2/4}\,dy$，
    $$\int_Ly\,ds=\int_0^2y\sqrt{1+\frac{y^2}4}\,dy=\frac43(2\sqrt2-1).$$
  - 例3（对称性）：$L$ 是球面 $x^2+y^2+z^2=a^2$ 被平面 $x+y+z=0$ 截得的圆周。由对称性 $\int_Lx^2ds=\int_Ly^2ds=\int_Lz^2ds$，三者之和为 $\int_L(x^2+y^2+z^2)ds=a^2\cdot2\pi a$，故
    $$\int_Lx^2ds=\frac13\cdot a^2\cdot2\pi a=\frac{2}{3}\pi a^3.$$
  - 关键点：轮换对称（把 $x,y,z$ 循环置换而曲线不变）只对第一型积分有效，因为它与方向无关；第二型积分在同一曲线上反向就会变号，不能这样用。

- **第二型曲线积分的定义（§2 一）**：设 $P(x,y),Q(x,y)$ 定义在平面**有向**可求长度曲线 $L:\widehat{AB}$ 上。对 $L$ 的任一分割 $T$（分点 $M_0=A,M_1,\dots,M_n=B$，坐标 $(x_i,y_i)$），记 $\Delta x_i=x_i-x_{i-1}$、$\Delta y_i=y_i-y_{i-1}$，在小弧段 $\widehat{M_{i-1}M_i}$ 上任取 $(\xi_i,\eta_i)$。若极限
  $$\lim_{\|T\|\to0}\sum_{i=1}^nP(\xi_i,\eta_i)\Delta x_i+\lim_{\|T\|\to0}\sum_{i=1}^nQ(\xi_i,\eta_i)\Delta y_i$$
  存在且与分割及取点无关，则称此极限为沿有向曲线 $L$ 的**第二型曲线积分**，记
  $$\int_LP(x,y)\,dx+Q(x,y)\,dy\quad\text{或}\quad\int_{\widehat{AB}}P\,dx+Q\,dy.$$
  封闭有向曲线记 $\oint_LP\,dx+Q\,dy$；令 $\mathbf F=(P,Q)$、$d\mathbf s=(dx,dy)$，可写成向量形式 $\int_L\mathbf F\cdot d\mathbf s$。
  - 物理意义：$\mathbf F=(P,Q)$ 沿 $L:\widehat{AB}$ 对质点所做的功 $W=\int_LP\,dx+Q\,dy$。
  - 空间情形：$\int_LP\,dx+Q\,dy+R\,dz$。
  - 关键点：$\Delta x_i,\Delta y_i$ 是**有符号的投影**，这是方向进入积分的通道。

- **方向性（§2 一，公式(5)）**：
  $$\int_{\widehat{AB}}P\,dx+Q\,dy=-\int_{\widehat{BA}}P\,dx+Q\,dy.$$
  对同一曲线只需把 $A\to B$ 改成 $B\to A$，每个小弧段的方向都反了，$\Delta x_i,\Delta y_i$ 随之变号。**第一型曲线积分的被积表达式是函数与弧长之积，与方向无关**——这是两类积分最重要的区别。
  - 关键点：做第二型积分时，第一件事是标出起点与终点；第一型则可以完全不管方向。

- **第二型曲线积分的性质（§2 一）**：
  1. **线性**：$\int_L\big(\sum c_iP_i\big)dx+\big(\sum c_iQ_i\big)dy=\sum c_i\int_LP_i\,dx+Q_i\,dy$。
  2. **区间可加**：有向曲线 $L$ 由有向曲线 $L_1,\dots,L_k$ **首尾相接**而成时 $\int_LP\,dx+Q\,dy=\sum_{i=1}^k\int_{L_i}P\,dx+Q\,dy$。
  - 关键点：可加性要求各段方向与 $L$ 的整体方向一致（首尾相接），拼接时方向弄反会整体错号。

- **第二型曲线积分的计算公式（§2 二）**：设 $L:\ x=\varphi(t),y=\psi(t),\ t\in[\alpha,\beta]$，$\varphi,\psi$ 有连续导函数，起点为 $(\varphi(\alpha),\psi(\alpha))$、终点为 $(\varphi(\beta),\psi(\beta))$，则
  $$\int_LP\,dx+Q\,dy=\int_\alpha^\beta\Big[P\big(\varphi(t),\psi(t)\big)\varphi'(t)+Q\big(\varphi(t),\psi(t)\big)\psi'(t)\Big]dt.$$
  空间有向光滑曲线 $x=x(t),y=y(t),z=z(t),\ t\in[\alpha,\beta]$（起点 $t=\alpha$，终点 $t=\beta$）时
  $$\int_LP\,dx+Q\,dy+R\,dz=\int_\alpha^\beta\Big[P\,x'(t)+Q\,y'(t)+R\,z'(t)\Big]dt.$$
  - 关键点：**下限对应起点、上限对应终点**，方向与上下限必须一致；$t$ 增大方向就是积分方向。这是第二型积分最容易出错的地方。
  - 何时用：曲线有显式参数方程时首选；$L$ 是折线/分段光滑曲线时，逐段参数化后相加。

- **第二型积分"路径相关"的典型算例（§2 例1、例2）**：
  - 例1：$A(1,1)$ 到 $B(2,3)$ 的 $\int_Lxy\,dx+(y-x)dy$。沿直线 $AB:x=1+t,y=1+2t\ (0\le t\le1)$ 得 $\frac{25}6$；沿抛物线 $ACB:y=2(x-1)^2+1\ (1\le x\le2)$ 得 $\frac{10}3$；沿三角形周界 $ADBA$ 得 $\frac32+0-\frac{25}6=-\frac83$。三条路径端点相同、积分值不同，说明这个积分与路径有关。
  - 例2：$\int_Lx\,dy+y\,dx$，沿 $y=2x^2$（$O\to B(1,2)$）得 $2$，沿直线 $OB:y=2x$ 也得 $2$，沿闭曲线 $OABO$ 得 $0+2-2=0$。这里积分值与路径无关、闭路上为零，原因是 $x\,dy+y\,dx=d(xy)$ 是**全微分**。
  - 关键点：把 $\int P\,dx+Q\,dy$ 与路径无关（或闭路为零）判定为"$P\,dx+Q\,dy$ 是全微分"，是第二十二章格林公式的主题；本章只需掌握"逐个路径算出来比较"。

- **两类曲线积分的联系（§2 三）**：设 $L$ 为从 $A$ 到 $B$ 的有向光滑曲线，以弧长 $s$ 为参数，$0\le s\le l$，曲线上每点切线方向指向弧长增加的一方，$(t,x),(t,y)$ 为切向与坐标轴正向的夹角，则
  $$\frac{dx}{ds}=\cos(t,x),\qquad \frac{dy}{ds}=\cos(t,y),$$
  从而
  $$\int_LP\,dx+Q\,dy=\int_L\big(P(x,y)\cos(t,x)+Q(x,y)\cos(t,y)\big)ds.$$
  空间情形同理用三个方向余弦：$\int_LP\,dx+Q\,dy+R\,dz=\int_L(P\cos(t,x)+Q\cos(t,y)+R\cos(t,z))ds$。
  - 关键点：把第二型的 $dx,dy$ 换成 $\cos(t,x)ds,\cos(t,y)ds$ 即可。方向一旦改变，第二型变号，同时第一型中各点切向反向、方向余弦差一个 $\pi$ 也变号，两边同步，公式依旧成立。
  - 例5（用方向余弦算第二型）：$L$ 是 $x^2+y^2+z^2=1$ 与 $x+y+z=1$ 的交线，从 $x$ 轴正向看去取逆时针方向，其切向方向余弦为 $\frac1{\sqrt2}(z-y,\ x-z,\ y-x)$。计算 $\oint_Ly\,dx+z\,dy+x\,dz$：
    $$\oint_Ly\,dx+z\,dy+x\,dz=\frac1{\sqrt2}\oint_L\Big[y(z-y)+z(x-z)+x(y-x)\Big]ds=\frac1{\sqrt2}\oint_L\big[(xy+yz+zx)-(x^2+y^2+z^2)\big]ds.$$
    在交线上 $x^2+y^2+z^2=1$，且由 $(x+y+z)^2=1=x^2+y^2+z^2+2(xy+yz+zx)$ 得 $xy+yz+zx=0$，故被积函数恒为 $-\frac1{\sqrt2}$。交线是半径为 $\sqrt{2/3}$ 的圆，周长 $2\pi\sqrt{2/3}$，于是
    $$\oint_Ly\,dx+z\,dy+x\,dz=-\frac1{\sqrt2}\cdot2\pi\sqrt{\frac23}=-\frac{2\sqrt3}{3}\pi.$$
  - 关键点：这道题示范了"第二型做不动就转第一型，再用曲线上的约束把被积函数化成常数"的思路。

## Key Concepts / 核心概念

- **第一型曲线积分（line integral with respect to arc length）**：$\int_Lf\,ds$，由 $\sum f(\xi_i,\eta_i)\Delta s_i$ 的极限定义，与方向无关，物理意义是曲线质量。
- **第二型曲线积分（line integral with respect to coordinates）**：$\int_LP\,dx+Q\,dy$，由 $\sum P\Delta x_i+\sum Q\Delta y_i$ 的极限定义，与方向有关，物理意义是功。
- **有向曲线（oriented curve）**：写 $\widehat{AB}$ 时必须指明起点 $A$ 与终点 $B$；第二型积分的值依赖于这个定向。
- **弧长元（arc element）**：$ds=\sqrt{\varphi'^2+\psi'^2}\,dt$（平面）、$ds=\sqrt{\varphi'^2+\psi'^2+\chi'^2}\,dt$（空间）、$ds=\sqrt{\rho^2+\rho'^2}\,d\theta$（极坐标），恒取正值。
- **分割细度（mesh of a partition）**：$\|T\|=\max\Delta s_i$，分割越细密极限才可能存在。
- **曲线质量（mass of a curve）**：线密度 $f$ 时质量 $m=\int_Lf\,ds$。
- **功（work）**：$\mathbf F=(P,Q)$ 沿 $\widehat{AB}$ 做功 $W=\int_{\widehat{AB}}P\,dx+Q\,dy$（空间为 $\int P\,dx+Q\,dy+R\,dz$）。
- **转动惯量（moment of inertia）**：$J_x=\int_Ly^2\rho\,ds$，$J_y=\int_Lx^2\rho\,ds$。
- **方向余弦（direction cosines）**：$\cos(t,x)=dx/ds$、$\cos(t,y)=dy/ds$，是两类积分互化的桥梁。
- **柱面面积（area of a cylindrical surface）**：以 $L$ 为准线、$0\le z\le f(x,y)$ 的柱面面积等于 $\int_Lf\,ds$，即第一型积分的几何意义。
- **全微分判定（exact differential）**：若 $P\,dx+Q\,dy=du$，则积分与路径无关、闭路积分为零（例2 的 $x\,dy+y\,dx=d(xy)$）；第二十一章格林公式（定理21.11/21.12）将给出系统判据。

## Mental Models / 思维模型

- **把被积表达式读成"密度 × 长度元"还是"向量 × 位移元"**：$f\,ds$ 是标量乘标量（质量），$\mathbf F\cdot d\mathbf s$ 是向量点乘向量（功）。前者永远正贡献（$ds>0$），后者可正可负（位移投影有符号）。
- **遇到曲线积分先做三件事**：① 写出曲线的参数方程；② **标出方向**（第二型必需）；③ 算 $ds$ 或 $dx,dy,dz$ 并代入化简。三件事做完，剩下就是普通的定积分。
- **化归口诀**：第二型 → 参数化后 $dx=x'(t)dt$；第一型 → 参数化后 $ds=\sqrt{x'^2+y'^2}\,dt$。若曲线方程适合 $x=\varphi(y)$，就用 $y$ 当参数，不要硬解 $y=f(x)$。
- **方向问题的两条铁律**：第二型积分反向变号；第一型积分反向不变。所以凡是用轮换对称、奇偶对称偷懒的，先确认是第一型。
- **算不动的第二型就转第一型**：若某条交线（球面与平面的交线等）上能由约束把 $P\cos(t,x)+Q\cos(t,y)$ 化成常数，转成第一型再乘弧长往往几行就完（§2 例5）。

## Anti-patterns / 常见错误

- **做第二型积分不标方向、随手取参数区间**：$\int_Lx\,dy$ 沿同一线段的两个方向差一个符号。参数化的上下限必须与起点、终点对应，写反了答案整体错号。
- **把第二型积分的可加性当成第一型那样"任意分段"**：分段必须首尾相接、方向与整体一致；把 $\widehat{BA}$ 当成 $\widehat{AB}$ 加进去是常见错误（§2 例1 的第三段就靠 $\int_{\widehat{BA}}=-\int_{\widehat{AB}}$ 处理）。
- **第一型积分里把 $\sqrt{\varphi'^2+\psi'^2}$ 漏掉**：把 $\int_Lf\,ds$ 写成 $\int_\alpha^\beta f\,dt$ 是最常见的失误；$ds$ 的因子正是"弧长"的体现。
- **对第二型积分用轮换对称或"偶倍奇零"**：那些对称性依赖被积函数在对称点上取相同值，而第二型的 $\Delta x_i$ 在对称位置符号相反，一般不成立。只有第一型积分可以放心用对称性。
- **路径不同却假定积分值相同**：本章尚未建立路径无关的判据，除明显是全微分外，必须逐条路径计算（§2 例1 三条路径给出 $\frac{25}6,\frac{10}3,-\frac83$）。
- **闭曲线积分不分段**：封闭曲线要按所给方向拆成几段（如 $OABO$ 拆成 $OA,AB,BO$），逐段参数化；漏掉某段或方向写反都会错。
- **参数化时忘记检查曲线是否分段光滑**：有尖点的曲线（$y=|x|$ 之类）必须分段处理，否则 $\sqrt{\varphi'^2+\psi'^2}$ 在该点不存在。
- **把两类积分的记号混用**：$\int_Lf\,ds$ 的 $ds$ 不能改写成 $dx$；$\int_LP\,dx$ 也不能"补上"一个 $\sqrt{1+y'^2}$。

## Reference Tables / 速查表

**表 1　两类曲线积分对照**

| 项目 | 第一型（对弧长） | 第二型（对坐标） |
|---|---|---|
| 记号 | $\int_Lf(x,y)\,ds$ | $\int_LP\,dx+Q\,dy$ |
| 和式原型 | $\sum f(\xi_i,\eta_i)\Delta s_i$ | $\sum P\Delta x_i+\sum Q\Delta y_i$ |
| 物理意义 | 曲线状物体的质量（$\rho=f$） | 变力沿有向曲线做的功 |
| 几何/向量意义 | 柱面面积；$\int_L\mathbf F\cdot\mathbf n\,ds$ 型流量 | $\int_L\mathbf F\cdot d\mathbf s$ |
| 与方向的关系 | **无关**（$\int_{-L}=\int_L$） | **有关**（$\int_{\widehat{BA}}=-\int_{\widehat{AB}}$） |
| 参数化公式 | $\int_\alpha^\beta f(\varphi,\psi)\sqrt{\varphi'^2+\psi'^2}\,dt$ | $\int_\alpha^\beta\big[P\varphi'+Q\psi'\big]dt$ |
| 空间参数化 | $\int_\alpha^\beta f\sqrt{\varphi'^2+\psi'^2+\chi'^2}\,dt$ | $\int_\alpha^\beta\big[Px'+Qy'+Rz'\big]dt$ |
| 对称性 | 可用轮换/奇偶对称 | 一般不可用 |
| 中值性 | 有（$\int_Lf\,ds=cs$） | 无 |
| 二者联系 | $\int_LP\,dx+Q\,dy=\int_L(P\cos(t,x)+Q\cos(t,y))ds$ | 同左（$dx=\cos(t,x)ds$，$dy=\cos(t,y)ds$） |

**表 2　拿到曲线积分后的决策顺序**

| 步骤 | 判断 | 动作 |
|---|---|---|
| 1 | 是第一型还是第二型？ | 看 $ds$ 还是 $dx,dy$；决定要不要管方向 |
| 2 | 曲线以什么形式给出？ | 参数式直接用；$y=\psi(x)$ 用 $x$ 当参数；$x=\varphi(y)$ 用 $y$ 当参数；极坐标用 $\theta$ |
| 3 | 第二型：方向定了吗？ | 定起点/终点，令下限=起点、上限=终点 |
| 4 | 曲线分段光滑吗？ | 逐段算完相加（注意每段方向） |
| 5 | 能用对称性吗？ | 第一型且曲线轮换不变时可用；第二型慎用 |
| 6 | 第二型算不动？ | 试转第一型（算方向余弦），或利用曲线上的约束把被积函数化为常数 |

**表 3　常用弧长元**

| 曲线给法 | $ds$ |
|---|---|
| $x=\varphi(t),y=\psi(t)$ | $\sqrt{\varphi'^2+\psi'^2}\,dt$ |
| $x=\varphi(t),y=\psi(t),z=\chi(t)$ | $\sqrt{\varphi'^2+\psi'^2+\chi'^2}\,dt$ |
| $y=\psi(x),\ a\le x\le b$ | $\sqrt{1+\psi'^2(x)}\,dx$ |
| $x=\varphi(y),\ c\le y\le d$ | $\sqrt{1+\varphi'^2(y)}\,dy$ |
| $\rho=\rho(\theta)$ | $\sqrt{\rho^2+\rho'^2}\,d\theta$ |

## Worked Example / 工作示例

**问题**：求在力 $\mathbf F=(y,\,-x,\,x+y+z)$ 作用下，质点由 $A(a,0,0)$ 沿两条不同路径到 $B(a,0,2\pi b)$ 所做的功：（1）沿螺旋线 $L_1:x=a\cos t,\ y=a\sin t,\ z=bt\ (0\le t\le2\pi)$；（2）沿直线 $L_2:x=a,\ y=0,\ z=t\ (0\le t\le2\pi b)$。其中 $a>0,b>0$。

**第 1 步：写出功的积分表达式。** 按定义，力沿有向曲线做的功是
$$W=\int_L\mathbf F\cdot d\mathbf s=\int_Ly\,dx-x\,dy+(x+y+z)\,dz,$$
这里 $P=y,\ Q=-x,\ R=x+y+z$。两条路径的定向都是从 $A$ 到 $B$。

**第 2 步：算 $L_1$ 上的功。** 参数化 $x=a\cos t,\ y=a\sin t,\ z=bt$，方向 $t=0\to2\pi$ 正是 $A\to B$，于是
$$dx=-a\sin t\,dt,\quad dy=a\cos t\,dt,\quad dz=b\,dt.$$
逐项代入：
$$y\,dx=a\sin t\cdot(-a\sin t)dt=-a^2\sin^2t\,dt,$$
$$-x\,dy=-a\cos t\cdot a\cos t\,dt=-a^2\cos^2t\,dt,$$
$$(x+y+z)dz=(a\cos t+a\sin t+bt)\cdot b\,dt=ab\cos t\,dt+ab\sin t\,dt+b^2t\,dt.$$
合并后积分：
$$W_1=\int_0^{2\pi}\Big[-a^2(\sin^2t+\cos^2t)+ab\cos t+ab\sin t+b^2t\Big]dt
=-a^2\cdot2\pi+0+0+b^2\cdot\frac{(2\pi)^2}{2},$$
即
$$W_1=2\pi(\pi b^2-a^2).$$

**第 3 步：算 $L_2$ 上的功。** 直线段 $L_2$ 上 $x\equiv a,\ y\equiv0$，所以 $dx=dy=0$，$dz=dt$，方向 $t=0\to2\pi b$：
$$W_2=\int_0^{2\pi b}(a+0+t)\,dt=\Big[at+\frac{t^2}{2}\Big]_0^{2\pi b}=2\pi ab+2\pi^2b^2=2\pi b(a+\pi b).$$

**第 4 步：比较两条路径。** 两条路径起点、终点完全相同，但
$$W_1=2\pi(\pi b^2-a^2),\qquad W_2=2\pi(\pi b^2+ab),$$
二者相等当且仅当 $-a^2=ab$，即 $a=-b$，与 $a,b>0$ 矛盾。因此 $W_1\ne W_2$：**这个力做的功与路径有关**（力场不是保守场）。这正是第二型曲线积分依赖路径的物理表现——如果换一条反向路径 $\widehat{BA}$，由方向性公式还会有 $\int_{\widehat{BA}}=-\int_{\widehat{AB}}$。

**验证**：把两条结果代回被积表达式的量纲检查——$L_1$ 的结果量纲是 $[\text{长度}^2]$，$L_2$ 的结果也是 $[\text{长度}^2]$，与 $\int F\,ds$ 一致；再取 $a=1,b=1$ 作数值核对：$W_1=2\pi(\pi-1)\approx13.42$，$W_2=2\pi(1+\pi)\approx26.14$，与直接数值积分吻合。此外 $L_1$ 上 $dz=b\,dt$ 已经承担了从 $z=0$ 到 $z=2\pi b$ 的抬升，而 $L_2$ 上 $x,y$ 恒定、只有 $z$ 变化，两条路径的差异正体现在 $z$ 分量的项 $b^2t$ 与 $(a+t)$ 上。

## Key Takeaways / 关键结论

1. **两类曲线积分的本质差别是"方向"与"微元"**：第一型用 $ds>0$、与方向无关；第二型用 $dx,dy$（有符号）、反向变号。做题第一步永远是先问清楚是哪一型。
2. **计算只有一条路：参数化后化为定积分**。第一型代入 $\sqrt{\varphi'^2+\psi'^2}$（或 $x$、$y$、$\theta$ 版本的弧长元），第二型代入 $dx=\varphi'dt,dy=\psi'dt$ 并按起点/终点定上下限。
3. **第一型积分的物理原型是质量、几何原型是柱面面积**，所以它保留定积分的全部性质（线性、可加、单调、绝对值不等式、中值性）。
4. **第二型积分的物理原型是功**，方向是它的一部分；$\int_{\widehat{AB}}=-\int_{\widehat{BA}}$，闭路积分要按方向逐段计算。
5. **对称性只属于第一型**：$\int_Lx^2ds=\int_Ly^2ds=\int_Lz^2ds$ 这类操作在第二型上没有对应结论。
6. **两类积分通过方向余弦互化**：$dx=\cos(t,x)ds$、$dy=\cos(t,y)ds$，这既给出 $\int_LP\,dx+Q\,dy=\int_L(P\cos(t,x)+Q\cos(t,y))ds$，也是第二十二章格林公式的出发点。
7. **积分值与路径有关是常态，与路径无关是特例**：只有当 $P\,dx+Q\,dy$ 是全微分（如 $x\,dy+y\,dx=d(xy)$）时，闭路积分才为零、积分才与路径无关。

## Connects To / 与其他章节的联系

- **向前依赖**：第九章定积分（分割—求和—取极限的定义模式、可积性、绝对值的估计）是第一型定义的原型；第十七章多元函数微分学提供方向余弦、梯度与向量运算；曲线参数方程与弧长公式（含 $ds$ 的三种写法）来自上册的定积分应用部分。
- **向后应用**：第二十二章将给出**格林公式**，把平面闭曲线上的第二型曲线积分化为二重积分，并由此得到路径无关的完整判据（$\partial P/\partial y=\partial Q/\partial x$ 在单连通区域上成立）；曲面积分中第一型、第二型的区分与本章完全平行（$dS$ 对方向无关、$dy\,dz$ 等对方向有关），两类曲面积分的联系也由方向余弦给出。
- **与第二十一章的衔接**：第一型曲线积分与重积分一样都建立在"分割—近似求和—取极限"上；把曲线积分化为定积分后，一切定积分技巧（换元、分部、对称性）都可以使用。
- **物理与后续课程**：功、环量、通量等概念构成场论的基础；$\oint_LP\,dx+Q\,dy$ 与第二十二章的旋度、第二十三章的斯托克斯型公式一脉相承，是电磁学与流体力学中环量计算的数学源头。
