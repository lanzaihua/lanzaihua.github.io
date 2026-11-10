# 第二十一章 重积分 (Multiple Integrals)

> 《数学分析》第六版（下册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

重积分把「分割—近似求和—取极限」搬到高维：把平面区域切成小片、空间区域切成小块，用被积函数在小块上的值乘小块测度求和，再让细度趋于零。让它真正可用的是两条通道：**化累次积分**（把重积分降成低维积分的迭代）与**变量变换**（换坐标系，代价是乘雅可比行列式的绝对值）。§3 的**格林公式（Green's formula）**把区域内部的二重积分与边界上的第二型曲线积分对等起来，正是后面高斯公式、斯托克斯公式的二维原型。

## Frameworks Introduced / 核心框架

### 一、面积的可求性与二重积分的定义

- **定义1（可求面积）**：对有界平面图形 P，用直线网 T 分割，把所有含于 P 内部的小矩形面积之和记为 $s_P(T)$，把所有与 P 相交的小矩形面积之和记为 $S_P(T)$，令
  $$I_P=\sup_T s_P(T),\qquad \overline{I}_P=\inf_T S_P(T)$$
  分别称为 P 的内面积与外面积。若 $I_P=\overline{I}_P$，称 P **可求面积**，公共值称为 P 的面积。恒有 $I_P\le \overline{I}_P$；$D=\{(x,y)\mid x,y\in\mathbb{Q}\cap[0,1]\}$ 是不可求面积的例子。
- **定理21.1（可求面积准则）**：P 可求面积的充要条件是：任给 $\varepsilon>0$，存在直线网 T 使 $S_P(T)-s_P(T)<\varepsilon$。
  - 关键点：必要性靠合并两个直线网（合并网的 $s$ 不减、$S$ 不增）；充分性用 $I_P-\overline{I}_P\le S_P(T)-s_P(T)<\varepsilon$。
- **定理21.2**：P 可求面积的充要条件是它的边界 K 面积为零（因 $S_K(T)=S_P(T)-s_P(T)$）。
- **定理21.3 及推论1、2**：连续函数 $y=f(x)$ 的图像、参数方程给出的光滑曲线面积均为零；分段光滑曲线围成的有界闭区域可求面积。本章此后默认所有有界闭区域都由分段光滑曲线围成。
- **定义2（分割）**：$T=\{\sigma_1,\dots,\sigma_n\}$ 是 D 的分割，指每个 $\sigma_i$ 是可求面积的闭集、内部两两不交、并集为 D；$\|T\|=\max_i d_i$（$d_i$ 为 $\sigma_i$ 的直径）称为**细度**。分割的成员**不必连通**，只要闭即可——这是与「直线网网眼」不同之处。
- **定义3（二重积分）**：设 $f$ 定义在可求面积的有界闭区域 D 上。若任给 $\varepsilon>0$，存在 $\delta>0$，使得对 D 的**任何**分割 T，只要 $\|T\|<\delta$，属于 T 的所有积分和 $\sum_{i=1}^n f(\xi_i,\eta_i)\Delta\sigma_i$ 都与某常数 J 满足
  $$\left|\sum_{i=1}^n f(\xi_i,\eta_i)\Delta\sigma_i-J\right|<\varepsilon,$$
  则称 f 在 D 上**可积**，J 称为 f 在 D 上的二重积分，记作 $J=\iint_D f(x,y)\,d\sigma=\iint_D f(x,y)\,dxdy$。取 $f\equiv 1$ 得 $\iint_D d\sigma=\mu(D)$；取 $f\ge 0$ 得曲顶柱体体积。

### 二、可积性与基本性质

- **定理21.4**：$f$ 在 D 上可积的充要条件是 $\lim_{\|T\|\to 0}S(T)=\lim_{\|T\|\to 0}s(T)$（$S,s$ 为上和、下和）。
- **定理21.5**：$f$ 在 D 上可积的充要条件是：任给 $\varepsilon>0$，存在 D 的某个分割 T 使 $S(T)-s(T)<\varepsilon$。只需**某一个**分割，是证明可积性的标准工具。
- **定理21.6**：可求面积有界闭区域上的连续函数必可积。
- **定理21.7（零面积集判据）**：设 $f$ 在 D 上有界，其不连续点集 E 是零面积集，则 $f$ 在 D 上可积（用有限个面积和小于 $\varepsilon$ 的矩形覆盖 E，其余部分用连续性配合定理21.5、21.6）。
- **基本性质（§1 三）**：线性性；对区域的有限可加性；保序性；$|\iint_D f|\le \iint_D|f|$；估值 $mS_D\le\iint_D f\le MS_D$；**中值定理**：f 在 D 上连续时存在 $(\xi,\eta)\in D$ 使 $\iint_D f=f(\xi,\eta)S_D$。用于估计积分值与证明积分不等式。

### 三、直角坐标下化累次积分

- **定理21.8（矩形上的累次积分）**：设 $f$ 在 $D=[a,b]\times[c,d]$ 上可积，且对每个 $x\in[a,b]$，积分 $\int_c^d f(x,y)\,dy$ 存在，则 $\int_a^b dx\int_c^d f(x,y)\,dy$ 存在，且
  $$\iint_D f(x,y)\,d\sigma=\int_a^b dx\int_c^d f(x,y)\,dy.$$
  关键点：把 $F(x)=\int_c^d f(x,y)dy$ 的上、下和夹在分割 T 的上、下和之间，再用定理21.4 收口。
- **一般区域的化法**：先判断 D 是 **x 型区域**（$\varphi_1(x)\le y\le\varphi_2(x),\,a\le x\le b$）还是 **y 型区域**（$\psi_1(y)\le x\le\psi_2(y),\,\alpha\le y\le\beta$），必要时用辅助线拆成若干这类区域。x 型区域有
  $$\iint_D f\,d\sigma=\int_a^b dx\int_{\varphi_1(x)}^{\varphi_2(x)}f(x,y)\,dy .$$
- **交换积分次序**：把已给累次积分的积分限还原成区域 D 的图形，换一个方向重新描述 D，再重写积分限。不要背积分限公式，**永远先画图**。

### 四、格林公式与曲线积分与路线的无关性（本章核心定理链）

- **定理21.11（格林公式）**：设闭区域 D 由有限条分段光滑曲线 L 围成，函数 $P(x,y),Q(x,y)$ 在 D 上有连续的一阶偏导数，则
  $$\oint_L P\,dx+Q\,dy=\iint_D\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)d\sigma,$$
  其中 L 取**正方向**（沿 L 行走时区域 D 始终在左手边）。用它把难算的闭路第二型曲线积分换成二重积分，或反过来把二重积分换成边界曲线积分（求面积、求原函数）。
  - 关键点：证明分三种情形——(i) D 既是 x 型又是 y 型区域，分别对 $\partial Q/\partial x$ 与 $-\partial P/\partial y$ 用累次积分，各得一曲线积分，相加即得；(ii) 用光滑辅助线把 D 分解成有限个 (i) 型子区域，辅助线上的积分因方向相反而抵消；(iii) 一般单连通区域的情形超出本课程范围，书中略去。**复连通区域**（有「洞」）通过在 D 内添加辅助线化成单连通情形，例如把环形区域沿一条割线剪开。
- **面积公式（格林公式的推论）**：取 $P=-y,\ Q=x$，得 $S_D=\iint_D d\sigma=\frac12\oint_L x\,dy-y\,dx$。边界由参数方程给出时（旋轮线、星形线等）比直接写累次积分省事。
- **定理21.12（四个等价条件）**：设 D 是**单连通**闭区域，$P,Q$ 在 D 内有一阶连续偏导数，则以下四条等价：
  - (i) 沿 D 内任一分段光滑封闭曲线 L，$\oint_L P\,dx+Q\,dy=0$；
  - (ii) 对 D 内任一分段光滑曲线 L，$\int_L P\,dx+Q\,dy$ 只与 L 的起点、终点有关，与路线无关；
  - (iii) $P\,dx+Q\,dy$ 是 D 内某一函数 $u(x,y)$ 的全微分，即 $du=P\,dx+Q\,dy$；
  - (iv) 在 D 内处处成立 $\dfrac{\partial P}{\partial y}=\dfrac{\partial Q}{\partial x}$。
  - 关键点：证明是一条闭环 $(i)\Rightarrow(ii)\Rightarrow(iii)\Rightarrow(iv)\Rightarrow(i)$。(ii)⇒(iii) 沿平行于 x 轴的直线段积分构造 $u$，再用积分中值定理求 $\partial u/\partial x$；(iii)⇒(iv) 用混合偏导数相等；(iv)⇒(i) 用格林公式。
  - **单连通性的必要性**：对 $P=\dfrac{-y}{x^2+y^2},\ Q=\dfrac{x}{x^2+y^2}$，在不含原点的任何单连通区域上 $P_y=Q_x$ 成立，沿其中任何闭路积分为零；但 L 取绕原点一周的圆时 $\oint_L\frac{x\,dy-y\,dx}{x^2+y^2}=\int_0^{2\pi}d\theta=2\pi\ne 0$。P、Q 只在剔除原点后的区域上有定义，绕原点的闭路必然落在复连通区域内，定理21.12 的前提不成立。
- **求原函数的定限法**：当 $P_y=Q_x$ 在矩形 $D=I\times J$ 上处处成立时，取定点 $(x_0,y_0)$，沿折线积分得 $u(x,y)=\int_{x_0}^{x}P(s,y_0)\,ds+\int_{y_0}^{y}Q(x,t)\,dt$（也可沿另一条折线，只差常数）。这是「求 $P\,dx+Q\,dy$ 的一个原函数」的标准套路。

### 五、二重积分的变量变换

- **引理（面积变换公式）**：设 $T:x=x(u,v),\ y=y(u,v)$ 把闭区域 $\Delta$ 一对一地映成 D，$x,y$ 在 $\Delta$ 上有一阶连续偏导数且 $J(u,v)=\dfrac{\partial(x,y)}{\partial(u,v)}\ne 0$，则 $\mu(D)=\iint_\Delta |J(u,v)|\,dudv$。
  - 关键点：取 $P=0,Q=x$ 把面积写成 $\oint_{L_D}x\,dy$，换元后用格林公式，最后用 $|J|$ 抵消符号。
- **定理21.13（二重积分变量变换公式）**：在引理条件下，若 $f$ 在 D 上可积，则
  $$\iint_D f(x,y)\,dxdy=\iint_\Delta f\big(x(u,v),y(u,v)\big)\,|J(u,v)|\,dudv .$$
  被积函数或积分区域在某个变换下变简单时用它。**必须要 $|J|$，绝对值不能丢**；变换必须一对一（或至多在零面积集上不一对一）。
- **极坐标变换**：$x=r\cos\theta,\ y=r\sin\theta$，$J(r,\theta)=r$，故
  $$\iint_D f(x,y)\,dxdy=\iint_\Delta f(r\cos\theta,r\sin\theta)\,r\,drd\theta .$$
  化累次积分分三种情形：(1) 原点 $O\notin D$：$r_1(\theta)\le r\le r_2(\theta),\ \alpha\le\theta\le\beta$，先对 r 后对 θ；(2) 原点为 D 的内点：$0\le r\le r(\theta),\ 0\le\theta\le 2\pi$；(3) 原点在 D 的边界上：$0\le r\le r(\theta),\ \alpha\le\theta\le\beta$。区域是圆域、圆环、扇形、$x^2+y^2\le Rx$ 型区域，或被积函数为 $f(x^2+y^2)$ 时用它。
- **广义极坐标**：$x=ar\cos\theta,\ y=br\sin\theta$，$J=abr$，用于椭圆区域。

### 六、三重积分

- **定义**：与二重积分类似，$\|T\|<\delta$ 时所有积分和满足 $\left|\sum f(\xi_i,\eta_i,\zeta_i)\Delta V_i-J\right|<\varepsilon$，则 $J=\iiint_V f\,dV=\iiint_V f\,dxdydz$；$f\equiv 1$ 时得 V 的体积。有界闭区域上连续必可积；间断点集中在有限多个**零体积曲面**上时仍可积。
- **定理21.15 及推论（先一后二，投影法）**：
  $$\iiint_V f\,dxdydz=\iint_D dxdy\int_{z_1(x,y)}^{z_2(x,y)}f(x,y,z)\,dz,$$
  其中 D 是 V 在 xOy 平面上的投影，V 看成「柱体的一部分」。
- **定理21.16 及推论（先二后一，截面法）**：
  $$\iiint_V f\,dxdydz=\int_e^h dz\iint_{D_z}f(x,y,z)\,dxdy,$$
  其中 $D_z$ 是平面 $z=$ 常数截 V 所得的截面。截面面积好算（椭球、旋转体）时用先二后一；投影区域好描述时用先一后二。**选哪种看区域和被积函数哪一头简单。**
- **三重积分换元公式**：$\iiint_V f\,dxdydz=\iiint_{V'}f\,|J(u,v,w)|\,dudvdw$，$J=\dfrac{\partial(x,y,z)}{\partial(u,v,w)}$。
- **柱面坐标变换**：$x=r\cos\theta,\ y=r\sin\theta,\ z=z$，$J=r$，
  $$\iiint_V f\,dxdydz=\iiint_{V'}f(r\cos\theta,r\sin\theta,z)\,r\,drd\theta dz .$$
  用法：先写出 V 在 xOy 平面上的投影 D，外层对 z 积分，内层二重积分用极坐标。
- **球面坐标变换**：$x=r\sin\varphi\cos\theta,\ y=r\sin\varphi\sin\theta,\ z=r\cos\varphi$，其中 $0\le r<+\infty,\ 0\le\varphi\le\pi,\ 0\le\theta\le 2\pi$，
  $$J(r,\varphi,\theta)=r^2\sin\varphi ,\qquad \iiint_V f\,dxdydz=\iiint_{V'}f\,r^2\sin\varphi\,drd\varphi d\theta .$$
  - **核对要点**：雅可比是 $r^2\sin\varphi$，不是 $r^2\cos\varphi$ 或 $r\sin\varphi$；因 $\sin\varphi\ge 0$ 在 $[0,\pi]$ 上成立，故 $|J|=J$。变换在一对一性上失效（$r=0$ 或 $\varphi=0,\pi$ 处 $J=0$），但换元公式仍成立。$r=$ 常数是球面，$\varphi=$ 常数是顶点在原点、以 z 轴为中心轴的半圆锥面，$\theta=$ 常数是过 z 轴的半平面。
- **广义球面坐标**：$x=ar\sin\varphi\cos\theta,\ y=br\sin\varphi\sin\theta,\ z=cr\cos\varphi$，$J=abcr^2\sin\varphi$，用于椭球体。

### 七、重积分的应用

- **曲面面积（显式曲面）**：设 $S:z=f(x,y),\ (x,y)\in D$，f 有连续一阶偏导数，则
  $$\Delta S=\iint_D\sqrt{1+f_x^2(x,y)+f_y^2(x,y)}\,dxdy=\iint_D\frac{dxdy}{|\cos(\mathbf{n},z)|}.$$
  关键点：用切平面小块代替曲面小片，$\Delta A_i=\Delta\sigma_i/|\cos\gamma_i|$，其中 $|\cos\gamma|=1/\sqrt{1+f_x^2+f_y^2}$。用「内接多面形面积的极限」定义曲面面积是**不可行**的（施瓦茨反例），必须用切平面。
- **曲面面积（参数曲面）**：$S:x=x(u,v),y=y(u,v),z=z(u,v),\ (u,v)\in D'$，记 $E=x_u^2+y_u^2+z_u^2$、$F=x_ux_v+y_uy_v+z_uz_v$、$G=x_v^2+y_v^2+z_v^2$，则 $\Delta S=\iint_{D'}\sqrt{EG-F^2}\,dudv$，用于球面、螺旋面、旋转面。
- **质心**：密度为 $\rho(x,y,z)$ 的物体 V 的质心为
  $$\bar x=\frac{\iiint_V x\rho\,dV}{\iiint_V \rho\,dV},\quad \bar y=\frac{\iiint_V y\rho\,dV}{\iiint_V \rho\,dV},\quad \bar z=\frac{\iiint_V z\rho\,dV}{\iiint_V \rho\,dV};$$
  密度均匀时 $\rho$ 约去，分子化为 $\iiint_V x\,dV$ 等。平面薄板把三重积分换成 $\iint_D$、$dV$ 换成 $d\sigma$；转动惯量同理由 $\iiint_V r^2\rho\,dV$ 给出（r 为到轴或到点的距离）。

## Key Concepts / 核心概念

**内面积与外面积（inner / outer area）**：$I_P=\sup_T s_P(T)$ 与 $\overline I_P=\inf_T S_P(T)$，两者相等时才说 P 可求面积。
**零面积集（set of zero area）**：外面积为 0 的点集；等价于任给 $\varepsilon>0$ 能被有限个面积总和小于 $\varepsilon$ 的矩形覆盖。
**分割与细度（partition and its mesh）**：$\sigma_i$ 内部互不相交、并集为 D、各自可求面积；$\|T\|$ 为各块直径的最大值。
**积分和（Riemann sum）**：$\sum_i f(\xi_i,\eta_i)\Delta\sigma_i$，$(\xi_i,\eta_i)$ 称为介点。
**上和与下和（upper / lower sum）**：$S(T)=\sum M_i\Delta\sigma_i$，$s(T)=\sum m_i\Delta\sigma_i$，$M_i,m_i$ 为 $\sigma_i$ 上的上、下确界。
**单连通区域（simply connected domain）**：区域内任一封闭曲线都可不经过区域外的点连续收缩为区域内一点；直观上「没有洞」。
**边界正方向（positive orientation）**：沿边界行走时区域始终在左手边；相反方向记为 $-L$。
**雅可比行列式（Jacobian determinant）**：$J=\partial(x,y)/\partial(u,v)$，面积（体积）微元的伸缩因子，换元时取绝对值。
**质心（centroid）**：质量分布的一阶矩除以总质量。

## Mental Models / 思维模型

- **把重积分看成「带测度的求和」**：一元定积分按长度加权，二重积分按面积、三重积分按体积。所有关于存在性、可加性、估值的不等式都能在一元情形里找到原型，不会证的时候先回去看定积分里对应那一条。
- **遇到重积分先问三件事**：区域长什么样（画图）？被积函数含什么（$x^2+y^2$ 想极坐标/柱坐标，$x^2+y^2+z^2$ 想球坐标）？区域是「柱体式」还是「截面式」（决定先一后二还是先二后一）？
- **把格林公式看成「降维守恒律」**：边界上的环路积分等于内部某种「源」密度的积分。记号上记住 $\oint_L P\,dx+Q\,dy=\iint_D(Q_x-P_y)d\sigma$——$Q$ 配 $\partial_x$ 取正，$P$ 配 $\partial_y$ 取负。写反一个符号整题就错。
- **遇到 $P_y=Q_x$ 先问区域有没有洞**：等式只保证**局部**积分与路线无关；要断言**整体**与路线无关，区域必须单连通。$\frac{-y\,dx+x\,dy}{x^2+y^2}$ 绕原点得 $2\pi$ 就是分水岭。

## Anti-patterns / 常见错误

- **不检查单连通性就宣称积分与路线无关**：区域有洞（或去掉奇点）时，偏导数相等只给出局部结论，反例见上面的 $\frac{x\,dy-y\,dx}{x^2+y^2}$。
- **换元时漏掉雅可比或因子的绝对值**：$\iint_D f\,dxdy=\iint_\Delta f|J|\,dudv$，不取绝对值在 $J$ 变号时会得到负面积。极坐标里漏掉那个 $r$ 更是最常见的失分点：$dxdy=r\,drd\theta$。
- **对 $f(x^2+y^2)$ 型被积函数硬用直角坐标**：会撞上 $\int e^{-y^2}dy$ 这类不可初等表示的原函数，例如 $\iint_{x^2+y^2\le R^2}e^{-(x^2+y^2)}d\sigma$ 必须化极坐标。
- **交换积分次序时直接对调上下限**：必须先把积分限还原成区域的几何描述，再按另一方向重新写限。
- **用直角坐标处理椭球或球体**：$\iiint_{x^2+y^2+z^2\le R^2}dV$ 用直角坐标要算根式，用球坐标立刻化为 $\int_0^{2\pi}\!\!\int_0^\pi\!\!\int_0^R r^2\sin\varphi\,drd\varphi d\theta$。
- **把球面坐标的雅可比写成 $r^2$ 或 $r^2\cos\varphi$**：正确值是 $r^2\sin\varphi$；可用量纲（体积微元须为长度三次方）与「$\varphi$ 在赤道处 $\sin\varphi=1$、在两极处趋于 0」复核。

## Reference Tables / 速查表

| 坐标系 | 变换 | 体积/面积微元 |
|---|---|---|
| 直角坐标 | — | $dxdy$ / $dxdydz$ |
| 极坐标 | $x=r\cos\theta,\ y=r\sin\theta$ | $r\,drd\theta$ |
| 广义极坐标 | $x=ar\cos\theta,\ y=br\sin\theta$ | $abr\,drd\theta$ |
| 柱面坐标 | $x=r\cos\theta,\ y=r\sin\theta,\ z=z$ | $r\,drd\theta dz$ |
| 球面坐标 | $x=r\sin\varphi\cos\theta,\ y=r\sin\varphi\sin\theta,\ z=r\cos\varphi$ | $r^2\sin\varphi\,drd\varphi d\theta$ |
| 广义球面坐标 | $x=ar\sin\varphi\cos\theta,\ y=br\sin\varphi\sin\theta,\ z=cr\cos\varphi$ | $abcr^2\sin\varphi\,drd\varphi d\theta$ |

| 三重积分的两种化法 | 公式 | 何时选它 |
|---|---|---|
| 先一后二（投影法） | $\iint_D dxdy\int_{z_1}^{z_2}f\,dz$ | 上下曲面 $z=z_{1,2}(x,y)$ 好写，投影区域 D 简单 |
| 先二后一（截面法） | $\int_e^h dz\iint_{D_z}f\,dxdy$ | 截面 $D_z$ 面积好算（椭球、旋转体、截面为圆/椭圆） |

| 判定目标 | 用哪条 |
|---|---|
| 平面图形是否可求面积 | 定理21.1（$S_P-s_P<\varepsilon$）或定理21.2（边界零面积） |
| 二元函数是否可积 | 定理21.5（某个分割 $S-s<\varepsilon$）、定理21.6（连续）、定理21.7（间断点零面积） |
| 闭路积分是否为零 / 是否与路线无关 | 定理21.12，先验单连通 + $P_y=Q_x$ |
| 求平面区域面积 | $S_D=\frac12\oint_L x\,dy-y\,dx$ |

## Worked Example / 工作示例

**用格林公式计算抛物线与 x 轴围成的面积（源文本 §3 例3 的完整复算）**

**问题**：求抛物线 $(x+y)^2=ax\ (a>0)$ 与 x 轴所围有界区域 D 的面积 $S_D$。

**第一步：把边界解成显式方程并定出交点。** 由 $(x+y)^2=ax$ 得 $x+y=\pm\sqrt{ax}$，取 $y\ge 0$ 的那一支（区域在 x 轴上方）：
$$y=\sqrt{ax}-x,\qquad x\in[0,a].$$
令 $y=0$：$\sqrt{ax}=x\Rightarrow ax=x^2\Rightarrow x=0$ 或 $x=a$。故区域由曲线段 AMO（$y=\sqrt{ax}-x$）与直线段 OA（$y=0$）围成，其中 $A=(a,0)$、$O=(0,0)$。

**第二步：写出面积公式并确定正向。** 取 $P=-y,\ Q=x$，由格林公式 $S_D=\iint_D d\sigma=\frac12\oint_L x\,dy-y\,dx$，L 取正方向。D 的边界按正向是：沿 x 轴从 $O$ 到 $A$，再沿曲线从 $A$ 回到 $O$，即 $L=\overline{OA}\cup\widehat{AMO}$。

**第三步：分段计算曲线积分。**
- 在 $\overline{OA}$ 上：$y\equiv 0$，$dy=0$，故 $\int_{\overline{OA}}x\,dy-y\,dx=0$。
- 在 $\widehat{AMO}$ 上：从 $A(a,0)$ 到 $O(0,0)$，以 x 为参数，$y=\sqrt{ax}-x$，$x$ 从 $a$ 减到 $0$，
  $$y'=\frac{\sqrt a}{2\sqrt x}-1,\qquad dy=\left(\frac{\sqrt a}{2\sqrt x}-1\right)dx .$$
  于是
  $$\int_{\widehat{AMO}}x\,dy-y\,dx=\int_a^0\left[x\left(\frac{\sqrt a}{2\sqrt x}-1\right)-\big(\sqrt{ax}-x\big)\right]dx .$$
  括号内逐项化简：$x\cdot\frac{\sqrt a}{2\sqrt x}=\frac12\sqrt{ax}$，而 $-x-(\sqrt{ax}-x)=-\sqrt{ax}$，所以被积函数是 $-\frac12\sqrt{ax}$。把上、下限 $a\to0$ 反成 $0\to a$ 会再出一个负号，
  $$\int_{\widehat{AMO}}x\,dy-y\,dx=\int_a^0\left(-\frac12\sqrt{ax}\right)dx=+\frac12\sqrt a\int_0^a x^{1/2}dx=\frac12\sqrt a\cdot\frac{2}{3}a^{3/2}=\frac{a^2}{3}.$$

**第四步：合并得面积。** $S_D=\frac12\left(0+\frac{a^2}{3}\right)=\frac{a^2}{6}.$

**第五步：独立验证。** 直接用二重积分（对 y 型区域）：D 可写成 $0\le y\le \sqrt{ax}-x,\ 0\le x\le a$，故
$$S_D=\int_0^a\big(\sqrt{ax}-x\big)dx=\sqrt a\cdot\frac{2}{3}a^{3/2}-\frac{a^2}{2}=\frac{2a^2}{3}-\frac{a^2}{2}=\frac{a^2}{6}.$$
两条路线一致，与 §3 例3 的结论相符。本题直接算也不难，但同样的手法适用于边界由**参数方程**给出的区域（旋轮线、星形线），那时直接写累次积分的积分限远比套用 $\frac12\oint x\,dy-y\,dx$ 麻烦。

## Key Takeaways / 关键结论

1. **可积性有两把尺子**：连续函数必可积；有界且间断点集为零面积集也可积。判定题优先用定理21.5（找一个使 $S(T)-s(T)<\varepsilon$ 的分割）。
2. **格林公式的符号必须背准**：$\oint_L P\,dx+Q\,dy=\iint_D(Q_x-P_y)\,d\sigma$，L 取正方向（区域在左手边）。$Q$ 配 $\partial_x$ 取正，$P$ 配 $\partial_y$ 取负。
3. **积分与路线无关的三件事**：区域单连通、$P_y=Q_x$ 处处成立、$P\,dx+Q\,dy$ 是某 $u$ 的全微分——三者与「沿任意闭路积分为零」完全等价。缺了单连通性，结论可能整体失效。
4. **换元必然付出雅可比的代价**：$\iint_D f\,dxdy=\iint_\Delta f|J|\,dudv$。极坐标 $r$、柱坐标 $r$、球坐标 $r^2\sin\varphi$，全部取绝对值。
5. **三重积分两条路**：投影法（先一后二）与截面法（先二后一），依区域描述方式与被积函数形态选择，选对了计算量能差一个数量级。
6. **重积分的应用都由「微元法 + 积分」构成**：曲面面积 $\iint\sqrt{1+f_x^2+f_y^2}\,d\sigma$；质心是一阶矩除以质量；转动惯量是距离平方加权。
7. **化累次积分前一定要画图**：交换积分次序、判断 x 型/y 型、决定极坐标下 r 与 θ 的范围，都依赖图形而非公式记忆。

## Connects To / 与其他章节的联系

- **向后（依赖）**：第九章定积分提供了本章全部证明模板（上和、下和、可积性、微元法、旋转面面积）；第十六、十七章多元函数极限与微分学提供被积函数的分析工具；**第二十章曲线积分**的第二型曲线积分与格林公式直接衔接——本章 §3 正是为它补上「与路线无关」的完整判据。
- **向前（被用）**：**第二十二章曲面积分**把格林公式推广为高斯公式与斯托克斯公式，两者的证明技巧（分片、辅助线抵消、投影法）都沿用本章；§6 的 $\sqrt{EG-F^2}$ 是第二十二章第一型曲面积分 $dS$ 的来源。
- **跨册**：变量变换公式（定理21.13）是第二十三章反函数定理与雅可比矩阵的实际动机。
