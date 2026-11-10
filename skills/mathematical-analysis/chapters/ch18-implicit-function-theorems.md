# 第十八章 隐函数定理及其应用 (Implicit Function Theorems and Their Applications)

> 《数学分析》第六版（下册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

前面遇到的函数多由算式显式给出（$y=x^2+1$），但大量问题里 $x$ 与 $y$ 的对应关系是被一个方程"卡"住的：$F(x,y)=0$。本章只回答一个问题：**方程（组）在什么条件下真的确定了一个函数？它连续吗？可微吗？导数怎么算？**

答案是把一切归结为一个非退化条件：一元情形要 $F_y(x_0,y_0)\ne 0$，方程组情形要雅可比行列式 $\frac{\partial(F,G)}{\partial(u,v)}\ne 0$。这一条同时买到三样东西——存在唯一、连续、可微，并顺手给出导数公式 $f'=-F_x/F_y$。有了它，"几何问题"（切线、切平面）与"最优化问题"（条件极值）都变成同一个动作：对隐式方程求导，前者读出切向量与法向量，后者读出拉格朗日方程组。

## Frameworks Introduced / 核心框架

- **隐函数的定义（§1 一）**：设 $E\subset\mathbb R^2$、$F:E\to\mathbb R$。若存在区间 $I,J$，使对每个 $x\in I$ 有唯一的 $y\in J$ 满足 $(x,y)\in E$ 且 $F(x,y)=0$，则称方程 $F(x,y)=0$ 确定了一个定义在 $I$ 上、值域含于 $J$ 的**隐函数（implicit function）**，记 $y=f(x)$，且成立恒等式 $F(x,f(x))\equiv 0$。
  - 何时用：题目给的是"方程"而非"表达式"时，先把 $F$ 与点 $P_0$ 明确写出来。
  - 关键点：隐函数必须连同 $x,y$ 的取值范围才说得完整——同一方程 $x^2+y^2=1$ 在 $[-1,1]$ 上同时确定 $y=\sqrt{1-x^2}$ 与 $y=-\sqrt{1-x^2}$。它未必能解成初等显式（$y-x-\tfrac12\sin y=0$ 就是），而 $x^2+y^2+c=0$ 在 $c>0$ 时什么也不确定，所以条件必须研究。

- **定理18.1（隐函数存在唯一性定理）**：若 (i) $F$ 在以 $P_0(x_0,y_0)$ 为内点的区域 $D\subset\mathbb R^2$ 上连续；(ii) $F(x_0,y_0)=0$（**初始条件**）；(iii) $F_y(x,y)$ 在 $D$ 上存在且连续；(iv) $F_y(x_0,y_0)\ne 0$，则 1° 存在 $P_0$ 的邻域 $U(P_0)\subset D$，在 $U(P_0)$ 上方程 $F(x,y)=0$ 唯一确定一个定义在 $(x_0-\alpha,x_0+\alpha)$ 上的隐函数 $y=f(x)$，满足 $(x,f(x))\in U(P_0)$、$F(x,f(x))\equiv0$、$f(x_0)=y_0$；2° $f$ 在 $(x_0-\alpha,x_0+\alpha)$ 上连续。
  - 何时用：一切"由方程确定的函数"问题的第一道关卡；四条条件逐条核对即可。
  - 关键点（证明骨架）：不妨设 $F_y(P_0)>0$（否则讨论 $-F=0$）。由 $F_y$ 连续与局部保号性，存在闭方邻域 $[x_0-\beta,x_0+\beta]\times[y_0-\beta,y_0+\beta]$ 使其上 $F_y>0$；于是对每个固定 $x$，$F(x,\cdot)$ 在 $[y_0-\beta,y_0+\beta]$ 上严格增。再由初始条件与连续性，$F(x,y_0-\beta)<0<F(x,y_0+\beta)$ 可在 $|x-x_0|<\alpha$ 上保持；由介值性加严格单调，每个这样的 $x$ 恰有一个 $y$。连续性用同一"夹逼"：任给 $\varepsilon$，对 $F(x,y-\varepsilon)<0<F(x,y+\varepsilon)$ 用保号性得 $\delta$，即得 $|f(x')-f(x)|<\varepsilon$。
  - 关键点：四条都只是**充分**条件，不可当必要条件用。

- **定理18.1 的三条注**：
  - 注1（条件不必要）：$y^3-x^3=0$ 在 $(0,0)$ 处 $F_y(0,0)=0$，却仍确定唯一的连续函数 $y=x$；反过来，双纽线 $F(x,y)=(x^2+y^2)^2-x^2+y^2=0$ 在原点 $F=F_y=0$，且原点任何邻域内都无唯一隐函数，可见条件失效时结论确实可能崩。
  - 注2（条件可减弱）：(iii)(iv) 实际上只用来保证"$F$ 在 $P_0$ 某邻域上关于 $y$ 严格单调"。用较强的可偏导条件只是为了便于检验。
  - 注3（换因变量）：把 (iii)(iv) 换成 $F_x$ 连续且 $F_x(x_0,y_0)\ne0$，结论是存在唯一的连续函数 $x=g(y)$。

- **定理18.2（隐函数可微性定理）**：设 $F$ 满足定理18.1 的 (i)—(iv)，且 $F_x$ 在 $D$ 上连续，则由方程确定的 $y=f(x)$ 在其定义域上有连续导函数
  $$f'(x)=-\frac{F_x(x,y)}{F_y(x,y)}\quad(y=f(x)).$$
  - 关键点：证明用二元中值定理——$0=F(x+\Delta x,y+\Delta y)-F(x,y)=F_x(\xi)\Delta x+F_y(\eta)\Delta y$，除以 $\Delta x$ 后令 $\Delta x\to0$，右端是连续函数与 $f$ 的复合。
  - 实操写法：把恒等式 $F(x,f(x))\equiv0$ 直接对 $x$ 用复合函数求导法则，得 $F_x+F_y\,y'=0$，再解出 $y'$。这比背公式可靠。
  - 高阶导数：对 $F_x+F_y y'=0$ 继续求导（$F_x,F_y$ 也含 $y=y(x)$），整理得
  $$y''=-\frac{F_{xx}F_y^2-2F_{xy}F_xF_y+F_{yy}F_x^2}{F_y^3}=-\frac{F_{xx}+2F_{xy}y'+F_{yy}y'^2}{F_y}.$$

- **隐函数极值（§1 四）**：求 $F(x,y)=0$ 所确定的 $y=f(x)$ 的极值，步骤如下。① 解方程组 $\begin{cases}F(x,y)=0\\ F_x(x,y)=0\end{cases}$ 得驻点 $A(x_0,y_0)$；② 在 $A$ 处 $F_x=0$，上面的 $y''$ 公式退化为 $y''\big|_A=-\dfrac{F_{xx}(A)}{F_y(A)}$；③ 由极值第二充分条件，$y''|_A<0$ 取极大值，$>0$ 取极小值。
  - 关键点：曲线方程与 $F_x=0$ **必须联立**，只用 $F_x=0$ 求出的点往往不在曲线上；$F_y(A)=0$ 的点先要剔除。

- **定理18.3（$n$ 元隐函数）**：若 $F(x_1,\dots,x_n,y)$ 在以 $P_0(x_1^{(0)},\dots,x_n^{(0)},y^{(0)})$ 为内点的区域 $D\subset\mathbb R^{n+1}$ 上连续、$F(P_0)=0$、$F$ 的各一阶偏导数在 $D$ 上连续且 $F_y(P_0)\ne0$，则存在 $Q_0(x_1^{(0)},\dots,x_n^{(0)})$ 的邻域，在其上唯一确定连续可微的 $n$ 元隐函数 $y=f(x_1,\dots,x_n)$，且
  $$\frac{\partial f}{\partial x_i}=-\frac{F_{x_i}}{F_y}\quad(i=1,\dots,n).$$
  - 何时用：三元及以上方程 $F(x,y,z)=0$ 求 $\partial z/\partial x,\partial z/\partial y$，$F_z\ne0$ 就用这一条。

- **雅可比行列式与定理18.4（隐函数组定理）**：$F,G$ 关于 $u,v$ 的函数行列式（**雅可比 Jacobi 行列式**）为
  $$\frac{\partial(F,G)}{\partial(u,v)}=\begin{vmatrix}F_u & F_v\\ G_u & G_v\end{vmatrix}=F_uG_v-F_vG_u.$$
  设 (i) $F,G$ 在以 $P_0(x_0,y_0,u_0,v_0)$ 为内点的区域 $V\subset\mathbb R^4$ 上连续；(ii) $F(P_0)=G(P_0)=0$；(iii) $F,G$ 在 $V$ 上有一阶连续偏导数；(iv) $J=\frac{\partial(F,G)}{\partial(u,v)}\Big|_{P_0}\ne0$。则 1° 在 $Q_0(x_0,y_0)$ 的某邻域 $U(Q_0)$ 上，方程组唯一确定两个二元隐函数 $u=f(x,y),v=g(x,y)$，满足 $u_0=f(x_0,y_0)$、$v_0=g(x_0,y_0)$、$F(x,y,f,g)\equiv0$、$G(x,y,f,g)\equiv0$；2° $f,g$ 在 $U(Q_0)$ 上连续；3° $f,g$ 有连续一阶偏导数，且
  $$\frac{\partial u}{\partial x}=-\frac1J\frac{\partial(F,G)}{\partial(x,v)},\quad
    \frac{\partial v}{\partial x}=-\frac1J\frac{\partial(F,G)}{\partial(u,x)},\quad
    \frac{\partial u}{\partial y}=-\frac1J\frac{\partial(F,G)}{\partial(y,v)},\quad
    \frac{\partial v}{\partial y}=-\frac1J\frac{\partial(F,G)}{\partial(u,y)}.$$
  - 何时用：两个方程联立定义两个函数（如 $u,v$ 由 $x,y$ 决定，或反解 $x,y$）时。
  - 关键点：定理本身没规定谁是自变量。注：若 (iv) 改为 $\frac{\partial(F,G)}{\partial(y,v)}\big|_{P_0}\ne0$，则相应地解出 $y=y(u,x),v=v(u,x)$。**动手前先声明自变量与因变量**，再挑对应的行列式。
  - 记忆法：$\partial u/\partial x$ 的分子，是把分母中 $u$ 的位置换成 $x$，即 $\frac{\partial(F,G)}{\partial(x,v)}$，外层统一带负号。
  - 实操替代：不必每次套公式。把两个方程分别对 $x$（或 $y$）求偏导，得到关于 $u_x,v_x$ 的**线性方程组**，系数矩阵的行列式正是 $J$，用克拉默法则求解即可。

- **定理18.5（反函数组定理）**：设 $u=u(x,y),v=v(x,y)$ 及其一阶偏导数在区域 $D$ 上连续，$P_0(x_0,y_0)$ 是 $D$ 的内点，$J=\frac{\partial(u,v)}{\partial(x,y)}\big|_{P_0}\ne0$，则在 $P_0'(u_0,v_0)$ 的某邻域上存在唯一的反函数组 $x=x(u,v),y=y(u,v)$，有连续一阶偏导数，且
  $$\frac{\partial x}{\partial u}=\frac{v_y}{J},\quad \frac{\partial x}{\partial v}=-\frac{u_y}{J},\quad \frac{\partial y}{\partial u}=-\frac{v_x}{J},\quad \frac{\partial y}{\partial v}=\frac{u_x}{J},$$
  并且互为反函数组的两个雅可比行列式互为倒数：
  $$\frac{\partial(u,v)}{\partial(x,y)}\cdot\frac{\partial(x,y)}{\partial(u,v)}=1.$$
  - 关键点：只要把 $u=u(x,y),v=v(x,y)$ 改写成 $\begin{cases}u-u(x,y)=0\\ v-v(x,y)=0\end{cases}$，就是对 $x,y$ 用一次定理18.4，条件 $\frac{\partial(F,G)}{\partial(x,y)}=\frac{\partial(u,v)}{\partial(x,y)}$ 自然浮现。最后那个"互为倒数"与一元反函数求导 $(f^{-1})'=1/f'$ 完全平行。

- **坐标变换（§2 三）**：
  - 极坐标 $x=r\cos\theta,\ y=r\sin\theta$：$\frac{\partial(x,y)}{\partial(r,\theta)}=r$，故除原点外处处可局部反解；$\theta=\arctan(y/x)$ 一类表达式必须按象限分段。
  - 球坐标 $x=r\sin\varphi\cos\theta,\ y=r\sin\varphi\sin\theta,\ z=r\cos\varphi$：$\frac{\partial(x,y,z)}{\partial(r,\varphi,\theta)}=r^2\sin\varphi$，故在 $r^2\sin\varphi\ne0$（即除去 $z$ 轴）的点上可反解 $r,\varphi,\theta$。
  - 应用（§2 例5）：取 $u=x+at,\ v=x-at$，则 $\frac{\partial(u,v)}{\partial(x,t)}=-2a\ne0$，变换可逆；由微分形式不变性算得 $\varphi_x=\varphi_u+\varphi_v$、$\varphi_t=a(\varphi_u-\varphi_v)$，继续求导得 $\varphi_{xx}=\varphi_{uu}+2\varphi_{uv}+\varphi_{vv}$、$\varphi_{tt}=a^2(\varphi_{uu}-2\varphi_{uv}+\varphi_{vv})$，于是弦振动方程 $\varphi_{tt}=a^2\varphi_{xx}$ 化为 $\frac{\partial^2\varphi}{\partial u\partial v}=0$，通解 $\varphi=f(x+at)+g(x-at)$。
  - 关键点：雅可比为零的点正是坐标变换的奇点，一切局部可逆结论在那里失效。

- **平面曲线的切线与法线（§3 一）**：设 $F(x,y)=0$ 在 $P_0(x_0,y_0)$ 邻域上满足隐函数定理条件，把 $y'=-F_x/F_y$（或 $x'=-F_y/F_x$）代入切线、法线方程整理得
  $$\text{切线：}F_x(P_0)(x-x_0)+F_y(P_0)(y-y_0)=0;\qquad
    \text{法线：}F_y(P_0)(x-x_0)-F_x(P_0)(y-y_0)=0.$$
  - 关键点：曲线的法向量就是梯度 $\operatorname{grad}F(P_0)=(F_x,F_y)$，切向量是 $(F_y,-F_x)$。这两个式子把第十七章的梯度直接翻译成切线方程。

- **空间曲线的切线与法平面（§3 二）**：
  - 参数式 $L:x=x(t),y=y(t),z=z(t)$，$P_0$ 对应 $t_0$，且 $(x'(t_0))^2+(y'(t_0))^2+(z'(t_0))^2\ne0$：
  $$\frac{x-x_0}{x'(t_0)}=\frac{y-y_0}{y'(t_0)}=\frac{z-z_0}{z'(t_0)},\qquad
    x'(t_0)(x-x_0)+y'(t_0)(y-y_0)+z'(t_0)(z-z_0)=0.$$
    （后者是**法平面**方程；$x'(t_0),y'(t_0),z'(t_0)$ 是切线的方向数。）
  - 交线式 $L:\begin{cases}F(x,y,z)=0\\ G(x,y,z)=0\end{cases}$，若 $\frac{\partial(F,G)}{\partial(x,y)}\big|_{P_0}\ne0$（其他两个雅可比非零同理），可局部解出 $x=\varphi(z),y=\psi(z)$，从而方向数取
  $$\left(\frac{\partial(F,G)}{\partial(y,z)},\ \frac{\partial(F,G)}{\partial(z,x)},\ \frac{\partial(F,G)}{\partial(x,y)}\right)\Big|_{P_0},$$
    切线、法平面仍写成上面的形式。三个雅可比不全为零时它们就是方向数。
  - 关键点（§3 注2）：这三个雅可比正是两曲面法向量之积 $n_1\times n_2$（$n_1=(F_x,F_y,F_z)$、$n_2=(G_x,G_y,G_z)$），用外积记忆比背公式稳妥。

- **曲面的切平面与法线（§3 三）**：设曲面由 $F(x,y,z)=0$ 给出，$P_0$ 处 $F_z\ne0$（换成 $F_x\ne0$ 或 $F_y\ne0$ 结论不变），则
  $$F_x(P_0)(x-x_0)+F_y(P_0)(y-y_0)+F_z(P_0)(z-z_0)=0,\qquad
    \frac{x-x_0}{F_x(P_0)}=\frac{y-y_0}{F_y(P_0)}=\frac{z-z_0}{F_z(P_0)}.$$
  - 注1：$\operatorname{grad}F(P)$ 就是等值面 $F=0$ 在 $P$ 处的法向量。这是本章与第十七章梯度的接口。
  - 关键点：上述推导默认存在某个非零偏导数（**非奇异点**）；若 $\operatorname{grad}F(P_0)=(0,0,0)$，方程 (12) 退化为 $0=0$，曲面在该点可能根本没有切平面。

- **条件极值与定理18.6（拉格朗日乘数法）**：在约束组
  $$\varphi_k(x_1,\dots,x_n)=0,\quad k=1,\dots,m\ (m<n)$$
  下求目标 $y=f(x_1,\dots,x_n)$ 的极值的问题称**条件极值**问题。作**拉格朗日函数**
  $$L(x_1,\dots,x_n,\lambda_1,\dots,\lambda_m)=f(x_1,\dots,x_n)+\sum_{k=1}^m\lambda_k\varphi_k(x_1,\dots,x_n),$$
  其中 $\lambda_k$ 称**拉格朗日乘数**。定理18.6：若 $f$ 与所有 $\varphi_k$ 在区域 $D$ 上有连续一阶偏导数，$P_0$ 是 $D$ 的内点且为条件极值点，且雅可比矩阵 $\big(\partial\varphi_k/\partial x_j\big)\big|_{P_0}$ 的秩为 $m$，则存在常数 $\lambda_1^{(0)},\dots,\lambda_m^{(0)}$，使 $(x^{(0)},\lambda^{(0)})$ 成为 $L$ 的稳定点，即它是 $n+m$ 个方程 $L_{x_i}=0\ (i=1,\dots,n)$ 与 $L_{\lambda_k}=\varphi_k=0\ (k=1,\dots,m)$ 的解。
  - 何时用：约束多于一个、或约束解不出显式因变量时；约束只有一个且能轻松消元时，消元法往往更快。
  - 操作步骤：① 写出目标 $f$ 与全部约束 $\varphi_k$，并把约束整理成 $\varphi_k=0$ 的形式；② 组装 $L=f+\sum\lambda_k\varphi_k$；③ 解方程组 $L_{x_i}=0$、$L_{\lambda_k}=0$；④ 用问题本身的实际意义（有界闭集上连续函数必有最值）或把约束局部解出后套无条件极值充分条件，判定哪个稳定点是所求极值点。
  - 关键点："秩为 $m$"即 $\nabla\varphi_1,\dots,\nabla\varphi_m$ 线性无关，这是把条件极值转化为 $L$ 的无条件极值问题的价格；**$L$ 的稳定点只是候选点**，本身不保证是极值点。

## Key Concepts / 核心概念

- **隐函数（implicit function）**：由方程 $F(x,y)=0$ 而非显式算式确定的函数 $y=f(x)$，满足 $F(x,f(x))\equiv0$。
- **初始条件（initial condition）**：$F(x_0,y_0)=0$，即曲线确实过 $P_0$。
- **非退化条件（non-degeneracy）**：一元情形的 $F_y(P_0)\ne0$、方程组情形的 $J\ne0$，隐函数定理的全部"内容"都压在这一条上。
- **雅可比行列式（Jacobian determinant）**：$\frac{\partial(F,G)}{\partial(u,v)}=F_uG_v-F_vG_u$，衡量方程组 $(F,G)$ 关于自变量 $(u,v)$ 的局部可解性。
- **隐函数组（system of implicit functions）**：由两个（一般 $m$ 个）方程联立确定的 $u=f(x,y),v=g(x,y)$。
- **反函数组（inverse function system）**：$u=u(x,y),v=v(x,y)$ 的逆，$x=x(u,v),y=y(u,v)$；其雅可比行列式与原组互为倒数。
- **坐标变换（coordinate transformation）**：极坐标、球面坐标等，本质是雅可比非零处的局部可逆函数组。
- **法平面（normal plane）**：过空间曲线上一点且以该点切线为法线的平面。
- **切平面（tangent plane）**：过曲面上一点、以 $\operatorname{grad}F$ 为法向量的平面。
- **拉格朗日函数（Lagrangian）**：$L=f+\sum\lambda_k\varphi_k$，把约束"吸收"进目标函数的辅助函数。
- **拉格朗日乘数（Lagrange multiplier）**：$L$ 中约束前面的待定常数 $\lambda_k$，无直接几何意义但参与方程组求解。
- **稳定点（stationary point）**：使 $L$ 的全部一阶偏导数为零的点，条件极值点必在其中。

## Mental Models / 思维模型

- **把 $F(x,y)=0$ 看成曲面 $z=F(x,y)$ 与平面 $z=0$ 的交线**：隐函数就是这条交线在 $y$ 方向上的"读数"。$F_y\ne0$ 意味着交线在该点不沿竖直方向走，所以"给定 $x$ 读 $y$"是合法的；$F_y=0$ 而 $F_x\ne0$ 处切线竖直，只能反过来读 $x=g(y)$。
- **遇到方程组，先问"我把谁当因变量"**：把雅可比矩阵写出来，看对应的 $m$ 阶子式是否非零；非零才动手，写错了变量顺序等于解错了题。
- **拉格朗日乘数法 = 加价买"无条件"**：给每个约束配一个价格 $\lambda_k$，把约束乘上价格加进目标，于是又回到熟悉的无条件极值；价格就是约束梯度的线性无关性，秩不足时这笔交易做不成。
- **几何问题一律化为"求梯度"**：切线、法线、切平面、法平面，全部只是 $\operatorname{grad}F$ 摆在不同维数里的写法；曲线看作两曲面交线时，切向量就是两个梯度的外积。

## Anti-patterns / 常见错误

- **只验证 $F(P_0)=0$ 就断言隐函数存在**：四条条件缺一不可。$x^2+y^2+c=0\ (c>0)$ 连初始条件都找不到；双纽线 $(x^2+y^2)^2-x^2+y^2=0$ 在原点满足前三条，但 $F_y=0$，任何邻域内都无唯一隐函数。
- **在 $F_y=0$ 的点上套 $f'=-F_x/F_y$**：除数可能为零，公式失效。叶形线 $x^3+y^3-3axy=0$ 的原点与 $B(\sqrt[3]{4}a,\sqrt[3]{2}a)$ 就是 $F_y=0$ 的点，必须先从讨论范围里剔除。
- **把 $F_y\ne0$ 当成必要条件**：它只是充分条件。$y^3-x^3=0$ 在原点虽然 $F_y=0$，$y=x$ 依然唯一确定。
- **隐函数组求导不先声明自变量**：$\partial u/\partial x$ 在"$u,v$ 是因变量"与"$x,y$ 是因变量"下完全是两个数；不写明就套公式必错。
- **雅可比行列式的变量顺序写错**：$\frac{\partial(F,G)}{\partial(u,v)}\ne0$ 保证的是"$u,v$ 可解"，$\frac{\partial(F,G)}{\partial(x,v)}\ne0$ 保证的是"$x,v$ 可解"，两者不可混用。
- **条件极值只解 $L_{x_i}=0$ 而漏掉 $L_{\lambda_k}=\varphi_k=0$**：漏掉约束方程，解出的点根本不在约束曲面上。
- **把 $L$ 的稳定点直接当极值点**：稳定点只是候选，必须用实际意义或二阶条件判定；例如把约束局部解出、把目标写成复合函数 $F(x,y)=f(x,y,z(x,y))$ 后再用极值充分条件。
- **在奇异点上谈切平面**：$\operatorname{grad}F(P_0)=(0,0,0)$ 时切平面方程退化为恒等式，$x^2+y^2=z^2$ 在原点即如此；只有**非奇异点**才有切平面。
- **空间曲线用参数式求切线时忘记检查方向数不全为零**：$x'(t_0)=y'(t_0)=z'(t_0)=0$ 处切线可能不存在，公式无意义。

## Reference Tables / 速查表

**表 1　方程类型 → 非退化条件 → 结论**

| 对象 | 方程 | 条件 | 结论 |
|---|---|---|---|
| 一元隐函数 | $F(x,y)=0$ | $F_y(P_0)\ne0$ | $y=f(x)$，$f'=-\dfrac{F_x}{F_y}$ |
| 一元隐函数（换元） | $F(x,y)=0$ | $F_x(P_0)\ne0$ | $x=g(y)$，$g'=-\dfrac{F_y}{F_x}$ |
| $n$ 元隐函数 | $F(x_1,\dots,x_n,y)=0$ | $F_y(P_0)\ne0$ | $y=f(\mathbf x)$，$\dfrac{\partial f}{\partial x_i}=-\dfrac{F_{x_i}}{F_y}$ |
| 隐函数组 | $F=G=0$ | $\dfrac{\partial(F,G)}{\partial(u,v)}\big\vert_{P_0}\ne0$ | $u=f(x,y),v=g(x,y)$ |
| 反函数组 | $u=u(x,y),v=v(x,y)$ | $\dfrac{\partial(u,v)}{\partial(x,y)}\big\vert_{P_0}\ne0$ | $x=x(u,v),y=y(u,v)$，雅可比互逆 |

**表 2　几何应用**

| 对象 | 给定方式 | 切线 / 切平面 | 法线 / 法平面 |
|---|---|---|---|
| 平面曲线 | $F(x,y)=0$ | $F_x(x-x_0)+F_y(y-y_0)=0$ | $F_y(x-x_0)-F_x(y-y_0)=0$ |
| 空间曲线 | $x=x(t),y=y(t),z=z(t)$ | $\dfrac{x-x_0}{x'(t_0)}=\dfrac{y-y_0}{y'(t_0)}=\dfrac{z-z_0}{z'(t_0)}$ | $x'(t_0)(x-x_0)+y'(t_0)(y-y_0)+z'(t_0)(z-z_0)=0$ |
| 空间曲线 | $\begin{cases}F=0\\G=0\end{cases}$ | 方向数 $\Big(\frac{\partial(F,G)}{\partial(y,z)},\frac{\partial(F,G)}{\partial(z,x)},\frac{\partial(F,G)}{\partial(x,y)}\Big)_{P_0}$ | 同上式，方向数代入 |
| 曲面 | $F(x,y,z)=0$ | $F_x(x-x_0)+F_y(y-y_0)+F_z(z-z_0)=0$ | $\dfrac{x-x_0}{F_x}=\dfrac{y-y_0}{F_y}=\dfrac{z-z_0}{F_z}$ |

**表 3　拉格朗日乘数法流程**

| 步骤 | 动作 | 易错点 |
|---|---|---|
| 1 | 写目标 $f$ 与约束 $\varphi_k=0$（共 $m$ 个，$m<n$） | 约束没整理成"$=0$" |
| 2 | 组装 $L=f+\sum_{k=1}^m\lambda_k\varphi_k$ | 漏乘 $\lambda_k$ 或漏掉某个约束 |
| 3 | 解 $L_{x_i}=0\ (i=1,\dots,n)$ 与 $L_{\lambda_k}=0\ (k=1,\dots,m)$ | 只解前者，丢掉约束方程 |
| 4 | 判定：实际意义或二阶充分条件 | 把稳定点直接当极值点 |
| 5 | （常用）写出极值并化为不等式 | 忘记代回约束关系 |

## Worked Example / 工作示例

**问题**：讨论笛卡儿叶形线 $x^3+y^3-3axy=0\ (a>0)$ 所确定的隐函数 $y=f(x)$ 的一阶、二阶导数，并求其极值。

**第 1 步：写出 $F$ 并确定可讨论的范围。** 令 $F(x,y)=x^3+y^3-3axy$。$F$ 及其偏导数在全平面连续，$F_x=3x^2-3ay$，$F_y=3(y^2-ax)$。曲线上使 $F_y=0$ 的点由 $y^2=ax$ 与曲线联立求得：把 $y^2=ax$ 代入 $x^3+y\cdot y^2=3axy$ 得 $x^3+axy=3axy$，即 $x^2=2ay$。与 $y^2=ax$ 联立解得 $B\big(\sqrt[3]{4}\,a,\sqrt[3]{2}\,a\big)$，另有原点 $O(0,0)$。除这两点外，曲线上其余各点都满足 $F_y\ne0$，因而在其邻域上唯一确定连续可微的 $y=f(x)$。

**第 2 步：一阶导数。** 由 $y'=-F_x/F_y$，
$$y'=-\frac{3(x^2-ay)}{3(y^2-ax)}=\frac{ay-x^2}{y^2-ax}.$$

**第 3 步：二阶导数。** 用公式
$$y''=-\frac{F_{xx}F_y^2-2F_{xy}F_xF_y+F_{yy}F_x^2}{F_y^3},$$
代入 $F_{xx}=6x$、$F_{xy}=-3a$、$F_{yy}=6y$、$F_x=3(x^2-ay)$、$F_y=3(y^2-ax)$：
$$y''=-\frac{54\big[x(y^2-ax)^2+a(x^2-ay)(y^2-ax)+y(x^2-ay)^2\big]}{27(y^2-ax)^3}
=-\frac{2\big[x(y^2-ax)^2+a(x^2-ay)(y^2-ax)+y(x^2-ay)^2\big]}{(y^2-ax)^3}.$$
（也可由 $y'$ 直接对 $x$ 求导得到同一结果。）把方括号展开并利用曲线方程化简：
$$x(y^2-ax)^2+a(x^2-ay)(y^2-ax)+y(x^2-ay)^2
=xy(x^3+y^3)+a^3xy-3ax^2y^2=a^3xy,$$
其中用了 $x^3+y^3=3axy$。于是
$$y''=-\frac{2a^3xy}{(y^2-ax)^3}.$$

**第 4 步：求驻点。** 令 $y'=0$，即 $ay-x^2=0$，与曲线联立：由 $y=x^2/a$ 得 $3axy=3x^3$，代入 $x^3+y^3=3axy$ 得 $y^3=2x^3$，故 $y=\sqrt[3]{2}\,x$；再与 $y=x^2/a$ 联立得 $x=\sqrt[3]{2}\,a$，$y=\sqrt[3]{4}\,a$。

**第 5 步：判定。** 在该驻点处
$$y^2-ax=\sqrt[3]{16}\,a^2-\sqrt[3]{2}\,a^2=\sqrt[3]{2}\,(2-1)a^2=\sqrt[3]{2}\,a^2>0,\qquad xy=\sqrt[3]{8}\,a^2=2a^2>0,$$
所以 $y''=-2a^3\cdot2a^2/(\sqrt[3]{2}a^2)^3=-2/a<0$。由极值第二充分条件，隐函数 $y=f(x)$ 在 $x=\sqrt[3]{2}\,a$ 处取得极大值 $y=\sqrt[3]{4}\,a$。

**验证**：把 $(x,y)=\big(\sqrt[3]{2}a,\sqrt[3]{4}a\big)$ 代回曲线，$x^3+y^3=2a^3+4a^3=6a^3$，而 $3axy=3a\cdot\sqrt[3]{2}a\cdot\sqrt[3]{4}a=3a^3\sqrt[3]{8}=6a^3$，两点相等，说明驻点确实在曲线上；又 $y'\big|_{\text{驻点}}=(a\sqrt[3]{4}a-\sqrt[3]{4}a^2)/(y^2-ax)=0$，与驻点定义一致。此外 $B$ 点与原点处 $F_y=0$，$y'$ 公式失效——这正说明求导公式必须与定理条件配套使用。

## Key Takeaways / 关键结论

1. **隐函数定理的全部重量在一条非退化条件上**：一元情形 $F_y(P_0)\ne0$，方程组情形 $J=\frac{\partial(F,G)}{\partial(u,v)}\big|_{P_0}\ne0$。没有它，存在性、唯一性、连续性、可微性都无从谈起。
2. **求导不必记公式，直接把恒等式求导**：由 $F(x,f(x))\equiv0$ 得 $F_x+F_y y'=0$，这是最稳的做法；高阶导数继续对 $y'$ 的表达式求导即可。
3. **$F_y=0$ 的点要先剔除再做隐函数讨论**：叶形线的原点与 $B$ 点、双纽线的原点都是这类"坏点"；在这些点上曲线可能自交或出现竖直切线，$y$ 不再是 $x$ 的函数。
4. **方程组求导的本质是解线性方程组**：对每个自变量求偏导后得到的系数矩阵就是雅可比矩阵，克拉默法则给出全部偏导数；先声明谁是自变量，再挑对应的雅可比。
5. **雅可比行列式互为倒数**：$\frac{\partial(u,v)}{\partial(x,y)}\cdot\frac{\partial(x,y)}{\partial(u,v)}=1$，它在第二十一章重积分的变量代换中作为面积元的伸缩因子出现。
6. **几何应用统一为"梯度即法向量"**：平面曲线的法向量 $(F_x,F_y)$、曲面的法向量 $(F_x,F_y,F_z)$、曲线作为两曲面交线的切向量 $n_1\times n_2$，都是同一个梯度。
7. **拉格朗日乘数法只是"候选点发生器"**：解出 $L_{x_i}=0$ 与 $L_{\lambda_k}=0$ 后，必须用实际意义或二阶条件判定；约束梯度的秩为 $m$ 是前提。

## Connects To / 与其他章节的联系

- **向前依赖**：第五章（复合函数求导法则、中值定理）是定理18.2 证明的全部工具；第十七章多元函数微分学提供偏导数、全微分与梯度，本章的切平面公式就是第十七章切平面公式的隐式改写；空间曲线、曲面的方程与向量运算来自解析几何部分。
- **向后应用**：第二十一章重积分中的二重、三重积分换元公式要用雅可比行列式 $\frac{\partial(x,y)}{\partial(u,v)}$（极坐标、球坐标的雅可比就是本章算出的 $r$ 与 $r^2\sin\varphi$）；第二十一章反常二重积分会补证 $B(p,q)=\Gamma(p)\Gamma(q)/\Gamma(p+q)$；第二十三章用向量形式给出一般隐函数组定理（定理23.19）并证明本章从略的定理18.4。
- **与一元情形的呼应**：定理18.5 的"雅可比互为倒数"就是第五章反函数求导公式 $(f^{-1})'(y_0)=1/f'(x_0)$ 的 $n$ 元版本；§1 例4 直接把 $F(x,y)=y-f(x)=0$ 当作隐函数定理的应用重新推出了它。
- **与后续极值理论**：条件极值是第二十三章讨论约束优化与不等式证明的起点；本章 §4 例3 用条件极值证明 $3/(1/a+1/b+1/c)\le\sqrt[3]{abc}$，示范了"求极值 ⇒ 得不等式"这条常用路线。
