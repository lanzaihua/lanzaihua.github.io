# 第二十二章 曲面积分 (Surface Integrals)

> 《数学分析》第六版（下册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

曲面积分把积分从平面区域搬到空间曲面：第一型曲面积分（对面积 $\int_S f\,dS$）不看曲面的侧，是「曲面上的加权求和」，$f\equiv1$ 时给出曲面面积；第二型曲面积分（对坐标 $\iint_S Pdydz+Qdzdx+Rdxdy$）必须先在双侧曲面上选定一侧，它度量的是向量场穿过曲面的通量。本章真正的重头戏是**高斯公式（Gauss's formula）**与**斯托克斯公式（Stokes' formula）**：前者把闭曲面上的积分换成内部的三重积分，后者把沿空间闭曲线的积分换成以它为边界的曲面上的积分。它们与第二十一章的格林公式是同一条链上的三个环——牛顿-莱布尼茨、格林、高斯、斯托克斯，统一的含义都是「边界上的积分 = 内部的导数积分」。

## Frameworks Introduced / 核心框架

### 一、第一型曲面积分

- **定义（第一型曲面积分）**：对可求面积曲面 S 作分割 $T=\{S_1,\dots,S_n\}$，$\|T\|=\max\{S_i\text{ 的直径}\}$，在 $S_i$ 上任取 $(\xi_i,\eta_i,\zeta_i)$。若极限
  $$\lim_{\|T\|\to 0}\sum_{i=1}^n f(\xi_i,\eta_i,\zeta_i)\Delta S_i=J$$
  存在且与分割、介点取法无关，则称 J 为 $f$ 在 S 上的第一型曲面积分，记作 $\int_S f(x,y,z)\,dS$。
  - 关键点：与曲面的**侧**无关（$S$ 与 $-S$ 上积分相同）；$f\equiv 1$ 时得 S 的面积；物理原型是曲面块的质量 $M=\int_S\rho\,dS$。
- **定理22.1（化为二重积分）**：设光滑曲面 $S:z=z(x,y),\ (x,y)\in D$，$f$ 在 S 上连续，则
  $$\int_S f(x,y,z)\,dS=\iint_D f\big(x,y,z(x,y)\big)\sqrt{1+z_x^2+z_y^2}\,dxdy .$$
  - 何时用：曲面能写成显式 $z=z(x,y)$ 时。投影到 yOz 或 zOx 平面时公式对称地换成 $\sqrt{1+x_y^2+x_z^2}$ 或 $\sqrt{1+y_z^2+y_x^2}$。
  - 关键点：$dS=\sqrt{1+z_x^2+z_y^2}\,dxdy$ 就是第二十一章的曲面面积微元。
- **参数曲面的公式**：若 $S:x=x(u,v),y=y(u,v),z=z(u,v),\ (u,v)\in D$，则
  $$\int_S f\,dS=\iint_D f\big(x(u,v),y(u,v),z(u,v)\big)\sqrt{EG-F^2}\,dudv,$$
  其中 $E=x_u^2+y_u^2+z_u^2$、$F=x_ux_v+y_uy_v+z_uz_v$、$G=x_v^2+y_v^2+z_v^2$。要求三个雅可比 $\frac{\partial(x,y)}{\partial(u,v)},\frac{\partial(y,z)}{\partial(u,v)},\frac{\partial(z,x)}{\partial(u,v)}$ 至少一个不为零。
  - 何时用：球面、螺旋面、锥面等参数给出的曲面。

### 二、曲面的侧与第二型曲面积分

- **双侧曲面与单侧曲面**：若动点 M 从 $M_0$ 出发沿曲面上任一不越出边界的闭曲线 L 连续移动一周回到 $M_0$ 时，法线方向仍与出发时一致，则 S 为**双侧曲面**，否则为**单侧曲面**。典型单侧曲面是默比乌斯（Möbius）带。
  - 约定：$z=z(x,y)$ 型曲面以法线与 z 轴正向成锐角的一侧为**上侧**（正侧）；闭曲面以外侧为正侧、内侧为负侧。$-S$ 表示另一侧。
- **定义（第二型曲面积分）**：设 P,Q,R 定义在双侧曲面 S 上，在指定一侧作分割，$\Delta S_{yz},\Delta S_{zx},\Delta S_{xy}$ 分别表示 $S_i$ 在三个坐标面上的投影面积（**符号由 $S_i$ 的方向确定**：法线正向与 z 轴正向成锐角时 $\Delta S_{xy}>0$，成钝角时为负）。若
  $$\lim_{\|T\|\to 0}\sum_{i=1}^n P(\xi_i,\eta_i,\zeta_i)\Delta S_{yz}+\lim_{\|T\|\to 0}\sum_{i=1}^n Q(\xi_i,\eta_i,\zeta_i)\Delta S_{zx}+\lim_{\|T\|\to 0}\sum_{i=1}^n R(\xi_i,\eta_i,\zeta_i)\Delta S_{xy}$$
  存在且与分割、介点取法无关，则记作 $\iint_S P\,dydz+Q\,dzdx+R\,dxdy$。
  - 关键点：**换侧变号**，$\iint_{-S}=-\iint_S$——这是与第一型曲面积分最本质的区别。物理意义：$E=\iint_S P\,dydz+Q\,dzdx+R\,dxdy$ 是流速场 $\mathbf{v}=(P,Q,R)$ 单位时间从负侧流向正侧的总流量（或磁通量）。
  - 性质：线性性；对曲面块的可加性（$S$ 由无公共内点的 $S_1,\dots,S_k$ 组成时积分可拆开相加）。
- **定理22.2（化为二重积分）**：设 R 在光滑曲面 $S:z=z(x,y),\ (x,y)\in D_{xy}$ 上连续，以 S 的**上侧**为正侧，则
  $$\iint_S R(x,y,z)\,dxdy=\iint_{D_{xy}}R\big(x,y,z(x,y)\big)\,dxdy .$$
  类似地，以法线与 x 轴正向成锐角的那一侧为正侧时 $\iint_S P\,dydz=\iint_{D_{yz}}P(x(y,z),y,z)\,dydz$；对 Q 有相应的 dzdx 公式。
  - 关键点：证明直接把第二型定义里的 $\Delta S_{xy}$ 用 $\Delta\sigma_i$ 替换，再用复合函数连续性与二重积分定义收口。**取哪一侧决定二重积分的符号**。
- **参数曲面上的第二型公式**：$\iint_S P\,dydz=\pm\iint_D P\cdot\frac{\partial(y,z)}{\partial(u,v)}\,dudv$（对 Q、R 同理），正负号由所选正侧的法线方向决定。
- **定理22.3（两类曲面积分的联系）**：设 S 为光滑曲面，正侧法向量为 $(\cos\alpha,\cos\beta,\cos\gamma)$，则
  $$\iint_S P\,dydz+Q\,dzdx+R\,dxdy=\int_S\big(P\cos\alpha+Q\cos\beta+R\cos\gamma\big)dS .$$
  - 关键点：$dydz=\cos\alpha\,dS$、$dzdx=\cos\beta\,dS$、$dxdy=\cos\gamma\,dS$。这是两种积分之间的换算桥。
- **定理22.4**：设 $S:z=z(x,y)$ 取上侧，则
  $$\iint_S P\,dydz+Q\,dzdx+R\,dxdy=\iint_D\Big(P(-z_x)+Q(-z_y)+R\Big)dxdy .$$
  - 何时用：不必分别投影到三个坐标面，直接用关于 $z_x,z_y$ 的公式一次算完。

### 三、高斯公式

- **定理22.5（高斯公式）**：设空间区域 V 由分片光滑的双侧封闭曲面 S 围成。若 $P,Q,R$ 在 V 上有一阶连续偏导数，则
  $$\iiint_V\left(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}\right)dxdydz=\oint_S P\,dydz+Q\,dzdx+R\,dxdy,$$
  其中 S 取**外侧**。
  - 何时用：闭曲面（或可补成闭曲面）上的第二型曲面积分换成三重积分；反之亦然。
  - 关键点：只需证 $\iiint_V\frac{\partial R}{\partial z}dxdydz=\oint_S R\,dxdy$ 等三式再相加。以 V 为 xy 型区域情形为例：V 的边界由 $S_2:z=z_2(x,y)$、$S_1:z=z_1(x,y)$ 以及垂直于 $D_{xy}$ 边界的柱面 $S_3$ 组成，则
    $$\iiint_V\frac{\partial R}{\partial z}dxdydz=\iint_{D_{xy}}\big[R(x,y,z_2)-R(x,y,z_1)\big]dxdy=\iint_{S_2}R\,dxdy+\iint_{-S_1}R\,dxdy,$$
    而 $S_3$ 在 xOy 平面上的投影面积为零，故 $\iint_{S_3}R\,dxdy=0$。非 xy 型区域的处理与格林公式类似。
- **体积公式（高斯公式的推论）**：取 $P=x,\ Q=y,\ R=z$，得
  $$\Delta V=\frac13\oint_S x\,dydz+y\,dzdx+z\,dxdy .$$
  - 何时用：求空间区域体积，或把体积写成闭曲面上的积分。

### 四、斯托克斯公式

- **侧与边界方向的右手法则**：设人站在曲面 S 指定的一侧，沿边界 L 行走时指定侧总在左方，则前进方向为 L 的**正向**；反之（在右方）为负向。S 的侧与 L 的方向必须按此法则配套，否则公式差一个符号。
- **定理22.6（斯托克斯公式）**：设光滑曲面 S 的边界 L 是分段光滑的连续曲线。若 $P,Q,R$ 在 S（连同 L）上有一阶连续偏导数，则
  $$\iint_S\left(\frac{\partial R}{\partial y}-\frac{\partial Q}{\partial z}\right)dydz+\left(\frac{\partial P}{\partial z}-\frac{\partial R}{\partial x}\right)dzdx+\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)dxdy=\oint_L P\,dx+Q\,dy+R\,dz,$$
  其中 S 的侧与 L 的方向按右手法则确定。
  - 何时用：沿空间闭曲线的第二型曲线积分换成曲面上的曲面积分（选取以 L 为边界的方便曲面，如平面片）；或反向。
  - 关键点：只需证三式再相加，例如 $S$ 由 $z=z(x,y)$ 给定时证
    $$\iint_S\frac{\partial P}{\partial z}dzdx-\frac{\partial P}{\partial y}dxdy=\oint_L P\,dx .$$
    做法：设 S 在 xOy 上的投影为 $D_{xy}$、L 的投影为 $\Gamma$，由格林公式与 $\frac{\partial}{\partial y}P(x,y,z(x,y))=\frac{\partial P}{\partial y}+\frac{\partial P}{\partial z}z_y$，配合 $\frac{z_y}{\cos\gamma}=\frac{\cos\beta}{\cos\gamma}$ 把二重积分化成 $\iint_S\frac{\partial P}{\partial z}dzdx-\frac{\partial P}{\partial y}dxdy$。S 不能同时表示成三种显式时情况复杂，书中略去证明。
- **便于记忆的行列式写法**：
  $$\iint_S\begin{vmatrix}dydz & dzdx & dxdy\\ \dfrac{\partial}{\partial x} & \dfrac{\partial}{\partial y} & \dfrac{\partial}{\partial z}\\ P & Q & R\end{vmatrix}=\oint_L P\,dx+Q\,dy+R\,dz .$$
- **定理22.7（空间曲线积分与路线无关）**：设 $\Omega\subset\mathbb{R}^3$ 为空间**单连通区域**，$P,Q,R$ 在 $\Omega$ 上有一阶连续偏导数，则以下四条等价：(i) 沿 $\Omega$ 内任一分段光滑闭曲线 L，$\oint_L P\,dx+Q\,dy+R\,dz=0$；(ii) 对 $\Omega$ 内任一分段光滑曲线 L，积分与路线无关；(iii) $P\,dx+Q\,dy+R\,dz$ 是 $\Omega$ 内某函数 u 的全微分；(iv) 在 $\Omega$ 内处处成立
  $$\frac{\partial R}{\partial y}=\frac{\partial Q}{\partial z},\qquad \frac{\partial P}{\partial z}=\frac{\partial R}{\partial x},\qquad \frac{\partial Q}{\partial x}=\frac{\partial P}{\partial y}.$$
  - 关键点：证明与定理21.12 完全相仿（把二维的「单连通」换成空间单连通，球体是单连通的，环状区域不是）。求原函数 u 仍用沿折线（平行于三条坐标轴的细折线）积分的方法。

### 五、场论初步（*§4）

- **梯度场**：数量场 $u(x,y,z)$ 给出 $\operatorname{grad}u=\nabla u=\left(\frac{\partial u}{\partial x},\frac{\partial u}{\partial y},\frac{\partial u}{\partial z}\right)$，方向是方向导数取最大值的方向，大小是该最大值，并与等值面 $u=c$ 正交。基本性质：$\nabla(u+v)=\nabla u+\nabla v$；$\nabla(uv)=u\nabla v+v\nabla u$；$\nabla f(u)=f'(u)\nabla u$。
- **散度场**：$\operatorname{div}\mathbf{A}=\nabla\cdot\mathbf{A}=\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}$，且
  $$\operatorname{div}\mathbf{A}(M_0)=\lim_{V\to M_0}\frac{\oint_S\mathbf{A}\cdot d\mathbf{S}}{\Delta V},$$
  即流量对体积的变化率（流量密度）。$\operatorname{div}\mathbf{A}>0$ 的点为源，$<0$ 的点为汇，恒为 0 时称无源场。性质：$\nabla\cdot(\varphi\mathbf{F})=\varphi\nabla\cdot\mathbf{F}+\mathbf{F}\cdot\nabla\varphi$；$\nabla\cdot\nabla\varphi=\Delta\varphi$（拉普拉斯算符）。
- **旋度场**：$\operatorname{rot}\mathbf{A}=\nabla\times\mathbf{A}=\left(\frac{\partial R}{\partial y}-\frac{\partial Q}{\partial z},\ \frac{\partial P}{\partial z}-\frac{\partial R}{\partial x},\ \frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)$，且
  $$(\operatorname{rot}\mathbf{A}\cdot\mathbf{n}_0)_{M_0}=\lim_{D\to M_0}\frac{\oint_L\mathbf{A}\cdot d\mathbf{s}}{\mu(D)} .$$
  $\operatorname{rot}\mathbf{A}=0$ 时称无旋场，沿任意闭曲线的环流量为零。刚体绕定轴旋转时线速度 $\mathbf{v}=\boldsymbol{\omega}\times\mathbf{r}$ 满足 $\operatorname{rot}\mathbf{v}=2\boldsymbol{\omega}$——这就是「旋度」名称的来源。
- **两大公式的向量形式**：高斯公式即 $\iiint_V\operatorname{div}\mathbf{A}\,dV=\oint_S\mathbf{A}\cdot d\mathbf{S}$；斯托克斯公式即 $\iint_S\operatorname{rot}\mathbf{A}\cdot d\mathbf{S}=\oint_L\mathbf{A}\cdot d\mathbf{s}$。

## Key Concepts / 核心概念

**第一型曲面积分（surface integral of the first type）**：$\int_S f\,dS$，与曲面的侧无关。
**第二型曲面积分（surface integral of the second type）**：$\iint_S P\,dydz+Q\,dzdx+R\,dxdy$，依赖曲面所选的侧，换侧变号。
**双侧曲面 / 单侧曲面（two-sided / one-sided surface）**：法线沿闭曲线绕行一周后是否回到原方向；默比乌斯带是单侧的。
**曲面的上侧 / 下侧（upper / lower side）**：法线与 z 轴正向成锐角的一侧为上侧；闭曲面以外侧为正侧。
**投影面积的符号**：$S_i$ 在 xOy 面的有向投影 $\Delta S_{xy}$ 的符号由法线正向与 z 轴正向成锐角还是钝角决定。
**通量与流量（flux）**：$\iint_S P\,dydz+Q\,dzdx+R\,dxdy$ 是向量场 $\mathbf{v}=(P,Q,R)$ 穿过 S 的流量或磁通量。
**右手法则（right-hand rule）**：站在 S 的指定一侧沿 L 行走，指定侧在左方时前进方向为 L 的正向。
**单连通区域（simply connected domain，空间）**：区域内任一封闭曲线都可收缩为区域内一点；球体是，环状区域不是。
**梯度 / 散度 / 旋度（gradient / divergence / curl）**：$\nabla u$、$\nabla\cdot\mathbf{A}$、$\nabla\times\mathbf{A}$，分别描述数量场的最速上升方向、向量场的源汇强度、向量场的旋转强度。
**哈密顿算符（Hamilton operator）**：$\nabla=\left(\frac{\partial}{\partial x},\frac{\partial}{\partial y},\frac{\partial}{\partial z}\right)$，把梯度、散度、旋度统一写成 $\nabla u$、$\nabla\cdot\mathbf{A}$、$\nabla\times\mathbf{A}$。

## Mental Models / 思维模型

- **先问「这个积分要不要选侧」**：看到 $dS$ 就是第一型（不选侧，恒为正）；看到 $dydz,dzdx,dxdy$ 就是第二型（必须选侧，换侧变号）。这是两个积分之间最省事的判别法。
- **把第二型曲面积分看成投影的加权和**：$\iint_S R\,dxdy$ 就是在 S 上把 R 乘以「有向投影面积」再求和。于是一旦 S 取上侧，它立刻退化为 $\iint_{D_{xy}}R(x,y,z(x,y))dxdy$——这正是定理22.2 的全部内容。
- **把高斯、斯托克斯、格林看成同一句话的三次实例**：「边界上的积分 = 内部的导数积分」。格林是二维（闭曲线 ↔ 平面区域），高斯是三维散度型（闭曲面 ↔ 空间区域），斯托克斯是三维旋度型（闭曲线 ↔ 曲面）。把三个公式并排写出来，会发现格林公式正是斯托克斯公式在平面情形（$R=0$、S 取平面片）的特例。
- **闭曲线积分优先想斯托克斯，闭曲面积分优先想高斯**：只要边界简单、曲面好选（平面、球面的一部分），斯托克斯往往能把难算的曲线积分一步降成面积分；反之，通量计算遇到闭曲面就先套高斯。

## Anti-patterns / 常见错误

- **第二型曲面积分忘了选侧或忘了换侧变号**：$\iint_{-S}=-\iint_S$ 是定义的一部分。取错侧，或把闭曲面的外侧写成内侧，答案就会整体差一个符号。
- **把两类曲面积分的公式混用**：第一型用 $dS=\sqrt{1+z_x^2+z_y^2}\,dxdy$（正号，不选侧）；第二型用 $dxdy=\cos\gamma\,dS$（带符号，选侧）。把 $\cos\gamma$ 写成 $|\cos\gamma|$ 是最常见的符号错误。
- **用高斯公式时不检查「封闭」和「一阶连续偏导数」**：S 不封闭时要么补一块曲面（补上后别忘了减去补面的积分），要么改用其他办法；P,Q,R 在 V 内有奇点（例如含原点的 $1/r^2$ 型场）时高斯公式不能直接用，需要在奇点外挖去一个小球再取极限。
- **斯托克斯公式里侧与边界方向不配套**：必须按右手法则。方向取反，右边的曲线积分也整体变号。
- **忘记验证单连通性就断言空间曲线积分与路线无关**：定理22.7 要求 $\Omega$ 空间单连通；与二维情形一样，偏导数相等只是局部条件。
- **把第一型曲面积分与曲面的侧扯上关系**：$\int_{-S}f\,dS=\int_S f\,dS$（$dS$ 恒正）。认为「换侧变号」对两类积分都成立是典型误解。

## Reference Tables / 速查表

| 积分类型 | 记号 | 是否选侧 | 化二重积分 |
|---|---|---|---|
| 第一型（对面积） | $\int_S f\,dS$ | 不选，换侧不变 | $\iint_D f\sqrt{1+z_x^2+z_y^2}\,dxdy$（$S:z=z(x,y)$） |
| 第一型（参数式） | $\int_S f\,dS$ | 不选 | $\iint_D f\sqrt{EG-F^2}\,dudv$ |
| 第二型（对坐标） | $\iint_S P\,dydz+Q\,dzdx+R\,dxdy$ | 必须选，换侧变号 | 分别投影，符号由侧决定；或用定理22.4 |

| 三大公式 | 等式 | 定向要求 |
|---|---|---|
| 格林公式（定理21.11） | $\oint_L P\,dx+Q\,dy=\iint_D(Q_x-P_y)d\sigma$ | L 取正方向（区域在左） |
| 高斯公式（定理22.5） | $\iiint_V(P_x+Q_y+R_z)dV=\oint_S P\,dydz+Q\,dzdx+R\,dxdy$ | S 取外侧 |
| 斯托克斯公式（定理22.6） | $\iint_S(R_y-Q_z)dydz+(P_z-R_x)dzdx+(Q_x-P_y)dxdy=\oint_L P\,dx+Q\,dy+R\,dz$ | S 的侧与 L 按右手法则 |

| 常见情形 | 优先用 |
|---|---|
| 闭曲面上的通量 | 高斯公式，化三重积分 |
| 沿空间闭曲线的第二型曲线积分 | 斯托克斯公式，取以 L 为边界的简单曲面 |
| 曲面面积 / 曲面块的质量、质心、转动惯量 | 第一型曲面积分，$\int_S dS$ 或 $\int_S \rho\,dS$ |
| 求空间区域体积 | $\Delta V=\frac13\oint_S x\,dydz+y\,dzdx+z\,dxdy$ |

## Worked Example / 工作示例

**用高斯公式计算立方体表面上的第二型曲面积分（源文本 §3 例1，即 §2 习题1(1)）**

**问题**：计算
$$I=\oiint_S y(x-z)\,dydz+x^2\,dzdx+(y^2+xz)\,dxdy,$$
其中 S 是边长 a 的正立方体的表面，取外侧。

**第一步：判断能否用高斯公式。** S 是分片光滑的**封闭**曲面（立方体的六个面），取外侧；被积函数 $P=y(x-z)$、$Q=x^2$、$R=y^2+xz$ 在整个立方体 V 上有一阶连续偏导数（都是多项式）。条件全部满足，可直接套高斯公式。

**第二步：算出散度。**
$$\frac{\partial P}{\partial x}=\frac{\partial}{\partial x}\big(y(x-z)\big)=y,\qquad \frac{\partial Q}{\partial y}=\frac{\partial}{\partial y}x^2=0,\qquad \frac{\partial R}{\partial z}=\frac{\partial}{\partial z}\big(y^2+xz\big)=x .$$
于是
$$\operatorname{div}(P,Q,R)=P_x+Q_y+R_z=y+0+x=x+y .$$

**第三步：把曲面积分化为三重积分并选坐标系。** 取 $V=[0,a]\times[0,a]\times[0,a]$（不妨把立方体放在第一卦限，平移不影响积分值，因为散度对 x、y 的位置敏感但题意只给出边长；按题意取该标准位置）：
$$I=\iiint_V(x+y)\,dxdydz .$$

**第四步：逐次积分。** 被积函数 $x+y$ 与 z 无关，故对 z 的积分给出因子 a：
$$I=a\int_0^a\!\!\int_0^a(x+y)\,dxdy=a\int_0^a\left[\frac{x^2}{2}+xy\right]_{x=0}^{x=a}dy=a\int_0^a\left(\frac{a^2}{2}+ay\right)dy .$$
$$I=a\left(\frac{a^2}{2}y+\frac{a}{2}y^2\right)\Bigg|_0^a=a\left(\frac{a^3}{2}+\frac{a^3}{2}\right)=a\cdot a^3=a^4 .$$

**第五步：验证（对称性检查）。** 由对称性，$\iiint_V x\,dV=\iiint_V y\,dV$，而 $\iiint_V(x+y)dV=2\iiint_V x\,dV$。又 $\iiint_V x\,dV=a^2\cdot\frac{a^2}{2}=\frac{a^4}{2}$（对 y、z 各积出因子 a，对 x 积分给出 $a^2/2$）。故 $I=2\cdot\frac{a^4}{2}=a^4$，与上面一致，也与源文本例1 的结论 $a^4$ 相符。

**为什么要用高斯公式而不是逐面算**：立方体有六个面，逐面算法要把曲面积分拆成六项、每项再判断法线方向与坐标轴的夹角（决定投影的正负），工作量与出错概率都远大于算一个散度的三重积分。这是高斯公式最典型的用途。

## Key Takeaways / 关键结论

1. **第一型与第二型的判别只看记号**：$dS$ 不选侧、换侧不变；$dydz,dzdx,dxdy$ 必须选侧、换侧变号。
2. **第二型化二重积分的核心是投影的符号**：$S:z=z(x,y)$ 取上侧时 $\iint_S R\,dxdy=\iint_{D_{xy}}R(x,y,z(x,y))\,dxdy$；取上侧对应法线与 z 轴成锐角，这是符号的唯一来源。
3. **高斯公式的适用条件是「封闭 + 外侧 + 一阶连续偏导数」**，缺一不可；不封闭就补面再减，有奇点就挖洞取极限。
4. **斯托克斯公式的适用条件是「S 的侧与 L 方向按右手法则配套」**；方向不配套，右边的曲线积分整体变号。
5. **三大公式是同一件事**：格林（平面区域 ↔ 闭曲线）、高斯（空间区域 ↔ 闭曲面）、斯托克斯（曲面 ↔ 闭曲线），统一含义是「边界上的积分 = 内部的导数积分」。
6. **空间曲线积分与路线无关需要空间单连通 + 三个偏导数等式**，与定理21.12 的平面版本逐条对应。
7. **场论三算子把三大公式写成一行**：$\nabla u$（梯度）、$\nabla\cdot\mathbf{A}$（散度）、$\nabla\times\mathbf{A}$（旋度），于是高斯是 $\iiint\operatorname{div}\mathbf{A}\,dV=\oint\mathbf{A}\cdot d\mathbf{S}$，斯托克斯是 $\iint\operatorname{rot}\mathbf{A}\cdot d\mathbf{S}=\oint\mathbf{A}\cdot d\mathbf{s}$。

## Connects To / 与其他章节的联系

- **向后（依赖）**：**第二十章曲线积分**提供第二型曲线积分与第一型曲线积分（曲面积分完全是它的升维版本）；**第二十一章**的曲面面积公式 $\sqrt{1+z_x^2+z_y^2}$ 与 $\sqrt{EG-F^2}$ 就是这里 $dS$ 的来源，§6 的曲面质心、转动惯量公式直接搬用；**定理21.11 格林公式**是高斯公式证明的模板（xy 型区域 + 投影 + 抵消）。
- **向前（被用）**：本章的向量形式（梯度、散度、旋度）为后续泛函分析与微分几何中的微分形式语言铺路——格林、高斯、斯托克斯公式在微分形式下统一写成广义斯托克斯公式 $\int_{\partial M}\omega=\int_M d\omega$。
- **与第二十三章的衔接**：第二型曲面积分的参数表示 $\frac{\partial(y,z)}{\partial(u,v)}$ 等三个雅可比，与第二十三章的雅可比矩阵同源；定理22.7 与定理21.12 的「单连通 + 偏导等式 + 全微分」三段论在第二十三章被推广为一般 n 维形式。
