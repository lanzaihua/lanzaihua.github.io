# 第十七章 多元函数微分学 (Differentiation of Functions of Several Variables)

> 《数学分析》第六版（下册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

一元函数里"可微"与"可导"是同一件事，二元函数里它们**彻底分家**。本章的主角是**可微性（differentiability）**：$\Delta z$ 能否写成线性主部加 $\rho$ 的高阶无穷小，即 $\Delta z=A\Delta x+B\Delta y+o(\rho)$。偏导数存在只保证沿两个坐标方向的变化率存在，远不足以支持这种线性逼近；偏导数**连续**才够。全章的概念区分与反例，都围绕"可微 $\Rightarrow$ 偏导存在"与"偏导连续 $\Rightarrow$ 可微"这两个不等价的方向展开。

## Frameworks Introduced / 核心框架

- **定义1（可微与全微分）**：设 $z=f(x,y)$ 在 $P_0(x_0,y_0)$ 的某邻域上有定义，若全增量可表示为
  $$\Delta z=f(x_0+\Delta x,y_0+\Delta y)-f(x_0,y_0)=A\Delta x+B\Delta y+o(\rho),\qquad \rho=\sqrt{\Delta x^2+\Delta y^2},$$
  其中 $A,B$ 只与 $P_0$ 有关，则称 $f$ 在 $P_0$ **可微（differentiable）**，并称 $A\Delta x+B\Delta y$ 为**全微分（total differential）** $dz\big|_{P_0}=A\Delta x+B\Delta y$。等价写法：$\Delta z=A\Delta x+B\Delta y+\alpha\Delta x+\beta\Delta y$，其中 $(\Delta x,\Delta y)\to(0,0)$ 时 $\alpha\to0,\beta\to0$。
  - 何时用：判断二元函数的局部性态是否"够好"（能线性化）的第一道关口。
  - 关键点：$dz$ 是 $\Delta z$ 的**线性主部**，故 $\lvert\Delta x\rvert,\lvert\Delta y\rvert$ 充分小时 $f(x,y)\approx f(x_0,y_0)+A(x-x_0)+B(y-y_0)$。
- **定义2（偏导数）**：若 $(x_0,y_0)\in D$ 且 $f(x,y_0)$ 在 $x_0$ 的某邻域内有定义，则当
  $$\lim_{\Delta x\to0}\frac{f(x_0+\Delta x,y_0)-f(x_0,y_0)}{\Delta x}$$
  存在时，称之为 $f$ 在 $(x_0,y_0)$ 关于 $x$ 的**偏导数（partial derivative）**，记 $f_x(x_0,y_0)$ 或 $\left.\frac{\partial f}{\partial x}\right|_{(x_0,y_0)}$；$f_y$ 同理。若在区域 $D$ 上每点都有偏导数，得**偏导函数**。
  - 关键点：$\frac{\partial}{\partial x}$ 是把其余自变量冻结的算符，与一元符号 $d/dx$ 有本质差别（注1）；存在 $f_x(x_0,y_0)$ 只要求 $f$ 在竖直线段 $\{y=y_0,\lvert x-x_0\rvert<\delta\}$ 上有定义，比对全微分的要求弱得多（注2）。
- **定理17.1（可微的必要条件）**：若 $f$ 在 $(x_0,y_0)$ 可微，则 $f$ 在该点关于每个自变量的偏导数都存在，且 $A=f_x(x_0,y_0)$、$B=f_y(x_0,y_0)$，于是全微分唯一地表示为
  $$dz=f_x(x_0,y_0)dx+f_y(x_0,y_0)dy .$$
  - 关键点：在等价写法中令 $\Delta y=0$、除以 $\Delta x$ 取极限即得 $A=f_x$。一旦确认可微，就可以放心用偏导写微分。
- **例5（偏导存在但不可微）**：$f(x,y)=\dfrac{xy}{\sqrt{x^2+y^2}}$（$x^2+y^2\ne0$），$f(0,0)=0$。在原点 $f_x(0,0)=f_y(0,0)=0$，但 $\dfrac{\Delta z-dz}{\rho}=\dfrac{\Delta x\Delta y}{\Delta x^2+\Delta y^2}$ 沿 $\Delta y=m\Delta x$ 得 $\frac{m}{1+m^2}$，极限不存在，故**不可微**（详见工作示例）。
- **定理17.2（可微的充分条件）**：若 $f$ 的偏导数在 $(x_0,y_0)$ 的某邻域内**存在**，且 $f_x$ 与 $f_y$ 在 $(x_0,y_0)$ **连续**，则 $f$ 在 $(x_0,y_0)$ 可微。
  - 何时用：实际判断可微性时用得最多的一条——先算两个偏导，再看它们是否在一点邻域内连续。
  - 关键点：把 $\Delta z$ 拆成两个**偏增量**之和，对两项分别用一元拉格朗日中值定理，得 $\Delta z=f_x(x_0+\theta_1\Delta x,y_0+\Delta y)\Delta x+f_y(x_0,y_0+\theta_2\Delta y)\Delta y$；再由偏导连续把 $f_x,f_y$ 换成在 $(x_0,y_0)$ 的值加无穷小，恰好凑成等价定义的形式。若 $f_x,f_y$ 在 $(x_0,y_0)$ 连续，称 $f$ 在该点**连续可微**。
- **注（偏导连续不是必要条件）**：$f(x,y)=(x^2+y^2)\sin\dfrac{1}{x^2+y^2}$（$x^2+y^2\ne0$），$f(0,0)=0$ 在原点**可微**，但 $f_x,f_y$ 在原点不连续（§1 习题7）。所以定理17.2 只是充分条件。
- **定理17.3（二元中值公式）**：设 $f$ 在 $(x_0,y_0)$ 的某邻域内存在偏导数，则对该邻域内任一点 $(x,y)$，存在 $\xi=x_0+\theta_1(x-x_0)$、$\eta=y_0+\theta_2(y-y_0)$（$0<\theta_1,\theta_2<1$）使
  $$f(x,y)-f(x_0,y_0)=f_x(\xi,y)(x-x_0)+f_y(x_0,\eta)(y-y_0).$$
  - 关键点：两个中值点**可以各取各的**，这与定理17.8 不同。
- **可微、偏导存在、偏导连续、连续的关系网（本章最重要的一张图）**——每条都要能背出依据或反例：
  1. **可微 $\Rightarrow$ 偏导存在**（定理17.1）。**反之不成立**：见例5。
  2. **偏导连续 $\Rightarrow$ 可微**（定理17.2）。**反之不成立**：$(x^2+y^2)\sin\frac{1}{x^2+y^2}$ 在原点可微但偏导不连续。所以"偏导连续"既非必要也非"可微"的同义语。
  3. **可微 $\Rightarrow$ 连续**（全增量趋于 $0$）。**反之不成立**：$f=\sqrt{x^2+y^2}$（圆锥面）在原点连续，但偏导不存在，当然不可微。
  4. **偏导存在 $\not\Rightarrow$ 连续**：$f=\dfrac{xy}{x^2+y^2}$（$x^2+y^2\ne0$），$f(0,0)=0$ 在原点不连续，却有 $f_x(0,0)=f_y(0,0)=0$。
  - **统一的解释**：偏导数只刻画沿 $x$ 轴、$y$ 轴两个方向的变化特征（等价于 $f(x,y_0)$、$f(x_0,y)$ 各自一元连续），而二元连续要求沿一切路径。所以偏导存在既推不出连续，更推不出可微。
- **定理17.4（可微性的几何意义）**：曲面 $z=f(x,y)$ 在点 $P(x_0,y_0,z_0)$ 存在不平行于 $z$ 轴的切平面 $\Pi$ 的**充要条件**是 $f$ 在 $(x_0,y_0)$ 可微。此时切平面与法线为
  $$z-z_0=f_x(x_0,y_0)(x-x_0)+f_y(x_0,y_0)(y-y_0),\qquad \frac{x-x_0}{f_x(x_0,y_0)}=\frac{y-y_0}{f_y(x_0,y_0)}=\frac{z-z_0}{-1},$$
  法线方向为 $\pm\bigl(f_x(x_0,y_0),f_y(x_0,y_0),-1\bigr)$。
  - 关键点：全微分的几何意义是"切平面上竖坐标的增量"，$\Delta z-dz$ 是曲面与切平面的竖直差距，随 $\rho\to0$ 成为 $\rho$ 的高阶无穷小。
- **定理17.5（复合函数的求导法则，链式法则 chain rule）**：若 $x=\varphi(s,t)$、$y=\psi(s,t)$ 在 $(s,t)$ 可微，$z=f(x,y)$ 在相应点可微，则 $z=f(\varphi(s,t),\psi(s,t))$ 在 $(s,t)$ 可微，且
  $$\frac{\partial z}{\partial s}=\frac{\partial z}{\partial x}\frac{\partial x}{\partial s}+\frac{\partial z}{\partial y}\frac{\partial y}{\partial s},\qquad \frac{\partial z}{\partial t}=\frac{\partial z}{\partial x}\frac{\partial x}{\partial t}+\frac{\partial z}{\partial y}\frac{\partial y}{\partial t}.$$
  - 何时用：中间变量多于一个，或自变量与中间变量交错（如 $u=f(x,y,z)$、$y=\varphi(x,t)$、$t=\psi(x,z)$ 这类"网状"依赖）时。
  - 关键点：画**依赖树**——从 $z$ 出发，每条到达自变量 $s$ 的路径贡献一项（路径上各段偏导之积），把同一自变量的所有路径项相加。先分清哪些是中间变量、哪些是自变量，是唯一容易出错的地方。
- **全微分的形式不变性（invariance of form）**：不论 $x,y$ 是自变量还是中间变量，总有 $dz=\dfrac{\partial z}{\partial x}dx+\dfrac{\partial z}{\partial y}dy$。
  - 关键点：把链式法则代入 $dz=\frac{\partial z}{\partial s}ds+\frac{\partial z}{\partial t}dt$ 即可验证。它使"先写微分、再读系数"成为求偏导的省力办法。
- **定义1（§3，方向导数 directional derivative）**：设三元函数 $f$ 在 $P_0$ 的某邻域 $U(P_0)\subset\mathbf{R}^3$ 上有定义，$l$ 为从 $P_0$ 出发的射线方向，$P$ 为该射线上含于 $U(P_0)$ 的任一点，$\rho=\rho(P,P_0)$。若 $\lim_{\rho\to0^+}\dfrac{f(P)-f(P_0)}{\rho}$ 存在，则称其为 $f$ 在 $P_0$ 沿方向 $l$ 的方向导数，记 $f_l(P_0)$ 或 $\left.\frac{\partial f}{\partial l}\right|_{P_0}$。沿坐标轴正向的方向导数就是偏导数，沿负向差一个负号。
- **定理17.6**：若 $f$ 在 $P_0(x_0,y_0,z_0)$ 可微，则 $f$ 在 $P_0$ 沿任一方向 $l$ 的方向导数都存在，且
  $$f_l(P_0)=f_x(P_0)\cos\alpha+f_y(P_0)\cos\beta+f_z(P_0)\cos\gamma,$$
  其中 $\cos\alpha,\cos\beta,\cos\gamma$ 为 $l$ 的方向余弦；二元情形为 $f_l(P_0)=f_x\cos\alpha+f_y\cos\beta$。
  - 关键点：**可微是充分条件，不是必要条件**。§3 例2 的 $f(x,y)=1$（$0<y<x^2$）、$f(x,y)=0$（其余）在原点沿**任何**方向的方向导数都是 $0$（过原点的每一小段上 $f$ 恒为 $0$），但 $f$ 在原点不连续，更不可微。又：连续既不是方向导数存在的必要条件，也不是充分条件。
- **定义2（梯度 gradient）**：若 $f(x,y,z)$ 在 $P_0$ 存在对所有自变量的偏导数，则称向量 $\bigl(f_x(P_0),f_y(P_0),f_z(P_0)\bigr)$ 为 $f$ 在 $P_0$ 的梯度，记 $\operatorname{grad}f(P_0)$（也记 $\nabla f(P_0)$，详见第二十二章§4），其模为 $\sqrt{f_x^2+f_y^2+f_z^2}$。
  - 在定理17.6 的条件下，取单位向量 $l^0=(\cos\alpha,\cos\beta,\cos\gamma)$，则 $f_l(P_0)=\operatorname{grad}f(P_0)\cdot l^0=\lvert\operatorname{grad}f(P_0)\rvert\cos\theta$，$\theta$ 为梯度与 $l$ 的夹角。
  - **关键点**：$\theta=0$ 时方向导数取最大值 $\lvert\operatorname{grad}f(P_0)\rvert$——**梯度方向是 $f$ 增长最快的方向，沿该方向的变化率就是梯度的模**；$\theta=\pi$ 时取最小值 $-\lvert\operatorname{grad}f(P_0)\rvert$。
  - 例3：$f=xy^2+yz^3$ 在 $P_0(2,-1,1)$ 处，$f_x=1$、$f_y=2xy+z^3=-3$、$f_z=3yz^2=-3$，故 $\operatorname{grad}f(P_0)=(1,-3,-3)$，模为 $\sqrt{19}$。
- **高阶偏导数与定理17.7**：$f_x,f_y$ 仍是 $x,y$ 的函数，若其偏导存在，得四种二阶偏导数 $f_{xx}=\frac{\partial^2z}{\partial x^2}$、$f_{xy}=\frac{\partial^2z}{\partial x\partial y}$、$f_{yx}=\frac{\partial^2z}{\partial y\partial x}$、$f_{yy}=\frac{\partial^2z}{\partial y^2}$；三阶共八种，依此类推。
  - **定理17.7（混合偏导数相等）**：若 $f_{xy}$ 与 $f_{yx}$ 都在点 $(x_0,y_0)$ 连续，则 $f_{xy}(x_0,y_0)=f_{yx}(x_0,y_0)$。
  - 关键点：证明是把 $F=f(x_0+\Delta x,y_0+\Delta y)-f(x_0+\Delta x,y_0)-f(x_0,y_0+\Delta y)+f(x_0,y_0)$ 沿两条不同路径各用两次一元中值定理，得 $F=f_{xy}(\cdot)\Delta x\Delta y=f_{yx}(\cdot)\Delta x\Delta y$，再令 $\Delta x,\Delta y\to0$ 用连续性。**连续性不可省。**
- **定理17.8（中值定理）**：设 $f$ 在**凸开域** $D$ 上可微，则对任意 $P(a,b)$、$Q(a+h,b+k)\in D$，存在 $\theta\in(0,1)$ 使
  $$f(a+h,b+k)-f(a,b)=f_x(a+\theta h,b+\theta k)h+f_y(a+\theta h,b+\theta k)k .$$
  - 关键点：作 $\Phi(t)=f(a+th,b+tk)$ 化为一元中值定理；**中值点落在 $P,Q$ 的连线上**（比定理17.3 强），凸性不可去。
  - **推论**：若 $f$ 在区域 $D$ 上存在偏导数且 $f_x=f_y\equiv0$，则 $f$ 在 $D$ 上为常量函数。
- **定理17.9（泰勒定理）**：若 $f$ 在 $P_0(x_0,y_0)$ 的某邻域上有直到 $n+1$ 阶的连续偏导数，则对该邻域上任一点 $(x_0+h,y_0+k)$，存在 $\theta\in(0,1)$ 使
  $$f(x_0+h,y_0+k)=\sum_{m=0}^{n}\frac{1}{m!}\Bigl(h\frac{\partial}{\partial x}+k\frac{\partial}{\partial y}\Bigr)^{m}f(x_0,y_0)+\frac{1}{(n+1)!}\Bigl(h\frac{\partial}{\partial x}+k\frac{\partial}{\partial y}\Bigr)^{n+1}f(x_0+\theta h,y_0+\theta k).$$
  - 关键点：算子要按二项式逐项展开（$m=2$ 即 $f_{xx}h^2+2f_{xy}hk+f_{yy}k^2$）。**它是极值充分条件证明的唯一工具。**
- **极值的定义**：若对 $P_0$ 的某邻域 $U(P_0)$ 内任何点 $P$ 都有 $f(P)\le f(P_0)$（或 $f(P)\ge f(P_0)$），称 $f$ 在 $P_0$ 取得极大（极小）值，$P_0$ 为极值点；极值点只限于定义域的**内点**。例5：原点分别是 $f=2x^2+y^2$ 的极小值点、$g=\sqrt{1-x^2-y^2}$ 的极大值点，而 $h=xy$ 在原点的任意小邻域内既取正值又取负值，故不是极值点。
- **定理17.10（极值必要条件）**：若 $f$ 在 $P_0$ 存在偏导数且在 $P_0$ 取得极值，则 $f_x(x_0,y_0)=0$、$f_y(x_0,y_0)=0$，即 $\operatorname{grad}f(P_0)=\mathbf{0}$。满足此式的点称 $f$ 的**稳定点（驻点）**。
  - 关键点：极值点必是稳定点；**稳定点未必是极值点**（例5 的 $h=xy$）。又：偏导不存在的点上也可能取极值，如 $f=\sqrt{x^2+y^2}$ 在原点。所以求极值必须同时考察**稳定点与偏导不存在的点**。
- **定理17.11（极值的充分条件，黑塞矩阵判别法）**：设 $f$ 在 $P_0$ 的某邻域上有二阶连续偏导数且 $P_0$ 是稳定点，记**黑塞矩阵（Hesse matrix）**
  $$H_f(P_0)=\begin{pmatrix}f_{xx}(P_0)&f_{xy}(P_0)\\ f_{yx}(P_0)&f_{yy}(P_0)\end{pmatrix},$$
  则 $H_f(P_0)$ **正定**时取极小值，**负定**时取极大值，**不定**时 $P_0$ 不是极值点。
  - 证明要点：由二阶泰勒公式与 $\operatorname{grad}f(P_0)=\mathbf{0}$ 得 $f(x,y)-f(x_0,y_0)=\frac12(\Delta x,\Delta y)H_f(P_0)(\Delta x,\Delta y)^{T}+o(\Delta x^2+\Delta y^2)$；正定时二次型被 $2q(\Delta x^2+\Delta y^2)$ 控制，故差值 $\ge0$；不定时沿过 $P_0$ 的直线取 $\varphi(t)$，它在 $t=0$ 取极值将迫使 $\varphi''(0)$ 半正定或半负定，矛盾。
  - **实用形式**（记 $A=f_{xx}(P_0)$，$B=f_{xy}(P_0)$，$C=f_{yy}(P_0)$）：(i) $A>0$ 且 $AC-B^2>0$ $\Rightarrow$ 极小值；(ii) $A<0$ 且 $AC-B^2>0$ $\Rightarrow$ 极大值；(iii) $AC-B^2<0$ $\Rightarrow$ 不是极值点；(iv) $AC-B^2=0$ $\Rightarrow$ **不能判定**，须回到定义。
  - 例6：$f=x^2+5y^2-6x+10y+6$，稳定点 $(3,-1)$，$A=2,B=0,C=10$，$AC-B^2=20>0$ 且 $A>0$，取极小值 $f(3,-1)=-8$。例7：$f=x^2+xy$，稳定点为原点而 $AC-B^2=-1<0$，故无极值点。例8：$f=(y-x^2)(y-2x^2)$，原点稳定但 $AC-B^2=0$，判别法失效；由 $x^2<y<2x^2$ 时 $f<0$、$y>2x^2$ 或 $y<x^2$ 时 $f>0$，判定原点不是极值点——**例8 就是情形 (iv) 的必需性证据。**
- **求区域上最值的流程**：极值只是局部概念。求 $f$ 在有界闭域 $D$ 上的最大（小）值，须比较三类点上的函数值——**稳定点、偏导数不存在的点、界点**，最大（小）者即为所求；界点为曲线 $F(x,y)=0$ 时一般要用第十八章的条件极值方法。

## Key Concepts / 核心概念

- **可微（differentiable）**：全增量可写成线性主部加 $\rho$ 的高阶无穷小。
- **全微分（total differential）**：$dz=f_xdx+f_y\,dy$，即 $\Delta z$ 的线性主部。
- **偏导数（partial derivative）**：固定其余自变量后的一元导数，只看坐标轴方向。
- **连续可微（continuously differentiable）**：偏导数存在且连续。
- **方向导数（directional derivative）**：沿指定射线方向的变化率。
- **梯度（gradient）**：$\operatorname{grad}f=(f_x,f_y,f_z)$，指向函数增长最快的方向，其模为该方向上的变化率。
- **高阶偏导数 / 混合偏导（higher-order / mixed partial derivatives）**：$f_{xx},f_{xy},f_{yx},f_{yy},\dots$；$f_{xy}=f_{yx}$ 需二者连续。
- **黑塞矩阵（Hesse matrix）**：二阶偏导构成的矩阵，极值判别的核心。
- **稳定点（stationary point）**：梯度为零的点，极值点的必要候选。
- **凸区域（convex domain）**：任意两点连线仍含于其中；定理17.8 与17.9 的适用前提。

## Mental Models / 思维模型

- **把可微性看成"线性化许可"**：问的是"能不能用一张平面代替曲面"，不是"偏导是否存在"。检验一律回到商 $\dfrac{\Delta z-f_x\Delta x-f_y\Delta y}{\rho}$ 是否趋于 $0$。
- **判断可微性走三步，不跳步**：① 先看 $f$ 在该点是否连续（不连续直接不可微）；② 用定义算 $f_x,f_y$（不存在直接不可微）；③ 检验上面那个商是否为 $0$。只有 $f_x,f_y$ 在邻域内连续时才可用定理17.2 走捷径。凡遇到"偏导存在 $\Rightarrow\cdots$"的推理，先问依据是哪条定理。
- **依赖树定链式法则**：从因变量出发画树，每条通往目标自变量的路径写成一串偏导之积，同一自变量的所有路径相加。网状依赖时比背公式可靠。
- **极值判别先算 $AC-B^2$**：$>0$ 看 $A$ 的符号定极大 / 极小，$<0$ 直接判非极值，$=0$ 才回到定义（例8）；别忘了同时检查偏导不存在的点。

## Anti-patterns / 常见错误

- **把"偏导存在"当成"可微"或"连续"**：$f=\dfrac{xy}{\sqrt{x^2+y^2}}$（$f(0,0)=0$）在原点偏导都为 $0$ 却不可微；$f=\dfrac{xy}{x^2+y^2}$（$f(0,0)=0$）偏导存在却不连续；$f=1$（$xy\ne0$）、$f=0$（$xy=0$）沿两坐标轴都连续却在原点不连续。
- **以为"偏导连续"是可微的必要条件**：$f=(x^2+y^2)\sin\dfrac{1}{x^2+y^2}$（$f(0,0)=0$）在原点可微，而 $f_x,f_y$ 在原点不连续（§1 习题7）。
- **不检验可微性就用定理17.6 求方向导数**：§3 例2 的函数在原点沿任何方向的方向导数都为 $0$，却不可微也不连续——因为它沿抛物线 $y=kx^2$ 趋于 $1$。
- **随意交换混合偏导的次序**：$f_{xy}=f_{yx}$ 需要二者在该点**连续**（定理17.7）；仅有二阶偏导存在不足以保证相等。
- **把定理17.3 的中值公式当成定理17.8 用，或在非凸区域上用定理17.8**：定理17.3 的两个中值点可以不同（$\theta_1\ne\theta_2$），只有定理17.8 才保证中值点落在 $P,Q$ 的连线上，而它要求定义域**凸**。
- **$AC-B^2=0$ 时直接下结论，或求最值时只比较稳定点**：判别法失效不代表没有极值，例8 必须回到定义才能判定；求闭域上的最值还须考察偏导不存在的点与界点。

## Reference Tables / 速查表

**可微 / 偏导存在 / 偏导连续 / 连续 的蕴含关系**

| 命题 | 是否成立 | 依据或反例 |
|---|---|---|
| 可微 $\Rightarrow$ 偏导存在 | ✅ | 定理17.1（且 $A=f_x,B=f_y$） |
| 偏导存在 $\Rightarrow$ 可微 | ❌ | 例5：$f=\frac{xy}{\sqrt{x^2+y^2}}$，$f(0,0)=0$ |
| 偏导连续 $\Rightarrow$ 可微 | ✅ | 定理17.2 |
| 可微 $\Rightarrow$ 偏导连续 | ❌ | $f=(x^2+y^2)\sin\frac{1}{x^2+y^2}$，$f(0,0)=0$ |
| 可微 $\Rightarrow$ 连续 | ✅ | 全增量 $\to0$ |
| 连续 $\Rightarrow$ 可微 | ❌ | $f=\sqrt{x^2+y^2}$ 在原点连续但偏导不存在 |
| 偏导存在 $\Rightarrow$ 连续 | ❌ | $f=\frac{xy}{x^2+y^2}$，$f(0,0)=0$ |
| 连续 $\Rightarrow$ 偏导存在 | ❌ | 同上，$f=\sqrt{x^2+y^2}$ |
| 可微 $\Rightarrow$ 沿任一方向的方向导数存在 | ✅ | 定理17.6 |
| 方向导数都存在 $\Rightarrow$ 可微 | ❌ | §3 例2：$f=1\ (0<y<x^2)$，$0$（其余） |
| $f_{xy},f_{yx}$ 都存在 $\Rightarrow$ 二者相等 | ❌ | 需二者连续（定理17.7） |

**常见反例速查（都在原点）：$\frac{xy}{\sqrt{x^2+y^2}}$（$f(0,0)=0$）连续、偏导存在但**不可微**；$\frac{xy}{x^2+y^2}$（$f(0,0)=0$）偏导存在但不连续；$(x^2+y^2)\sin\frac{1}{x^2+y^2}$（$f(0,0)=0$）可微但偏导不连续；$\sqrt{x^2+y^2}$ 连续但偏导不存在。**

**黑塞矩阵判别表**（$A=f_{xx}$，$B=f_{xy}$，$C=f_{yy}$，$\Delta=AC-B^2$）

| 条件 | 结论 |
|---|---|
| $A>0$，$\Delta>0$ | 极小值 |
| $A<0$，$\Delta>0$ | 极大值 |
| $\Delta<0$ | 非极值点 |
| $\Delta=0$ | 不能判定，回到定义（例8） |

## Worked Example / 工作示例

**问题（§1 例5）** 考察
$$f(x,y)=\begin{cases}\dfrac{xy}{\sqrt{x^2+y^2}},&x^2+y^2\ne0,\\[4pt] 0,&x^2+y^2=0\end{cases}$$
在原点 $(0,0)$ 的可微性。

**第 1 步：用定义算两个偏导数。** 沿 $x$ 轴取 $\Delta y=0$，此时 $f(\Delta x,0)=0$，故
$$f_x(0,0)=\lim_{\Delta x\to0}\frac{f(\Delta x,0)-f(0,0)}{\Delta x}=\lim_{\Delta x\to0}\frac{0-0}{\Delta x}=0 .$$
同理 $f_y(0,0)=0$。**所以偏导数存在，且定理17.1 中的 $A=B=0$——若 $f$ 可微，其全微分必为 $dz=0$。**

**第 2 步：写出待检验的商。** $f$ 在原点可微当且仅当 $\Delta z-A\Delta x-B\Delta y=o(\rho)$。这里 $\Delta z=\dfrac{\Delta x\Delta y}{\sqrt{\Delta x^2+\Delta y^2}}$、$A=B=0$、$\rho=\sqrt{\Delta x^2+\Delta y^2}$，于是
$$\frac{\Delta z-A\Delta x-B\Delta y}{\rho}=\frac{\Delta x\Delta y}{\sqrt{\Delta x^2+\Delta y^2}}\cdot\frac{1}{\sqrt{\Delta x^2+\Delta y^2}}=\frac{\Delta x\Delta y}{\Delta x^2+\Delta y^2}.$$

**第 3 步：证明该极限不存在。** 沿直线 $\Delta y=m\Delta x$（$m$ 固定）趋近原点：
$$\frac{\Delta x\Delta y}{\Delta x^2+\Delta y^2}=\frac{m\Delta x^2}{\Delta x^2+m^2\Delta x^2}=\frac{m}{1+m^2},$$
它随 $m$ 变化（$m=1$ 得 $\frac12$，$m=0$ 得 $0$，$m=-1$ 得 $-\frac12$）。由第十六章§2 例3 与定理16.5 推论2，该二重极限不存在。

**第 4 步：结论。** 由于 $\dfrac{\Delta z-dz}{\rho}$ 不是 $\rho$ 的高阶无穷小，按定义1，$f$ 在原点**不可微**。

**验证与要点回看**

- **$f$ 在原点其实连续**：$\lvert f\rvert=\dfrac{\lvert x\rvert\lvert y\rvert}{\sqrt{x^2+y^2}}\le\dfrac{\frac12(x^2+y^2)}{\sqrt{x^2+y^2}}=\dfrac{\rho}{2}\to0$。可见"连续 $+$ 偏导存在"仍不足以保证可微。
- **不能改用定理17.2**：$f_x,f_y$ 在 $\rho\ne0$ 处的表达式含 $\frac{x^2y}{(x^2+y^2)^{3/2}}$ 型的项，在原点没有连续延拓，定理17.2 的前提不满足——这正是它只能作**充分**条件的原因。又：$f$ 沿**任何**直线 $y=mx$ 都满足 $f(x,mx)=\frac{mx}{\sqrt{1+m^2}}\to0$，即沿一切直线连续，但仍不可微——可微要求的是 $\Delta z$ 与线性主部之差为 $o(\rho)$，比"沿各条直线有极限"严格得多。
- **与第十六章的接口**：第 3 步出现的 $\frac{\Delta x\Delta y}{\Delta x^2+\Delta y^2}$ 就是第十六章§2 例3 里那个重极限不存在的函数。可微性检验最终总要落回一个第十六章型的重极限问题。

## Key Takeaways / 关键结论

1. 可微的定义是 $\Delta z=A\Delta x+B\Delta y+o(\rho)$，$\rho=\sqrt{\Delta x^2+\Delta y^2}$；可微时 $A=f_x$、$B=f_y$，$dz=f_xdx+f_y\,dy$（定理17.1）。
2. **可微 $\Rightarrow$ 偏导存在**（反之不成立，例5）；**偏导连续 $\Rightarrow$ 可微**（反之不成立，$(x^2+y^2)\sin\frac{1}{x^2+y^2}$）；**可微 $\Rightarrow$ 连续**，而**偏导存在 $\not\Rightarrow$ 连续**（$\frac{xy}{x^2+y^2}$）。这四条要能默写并各举一例。
3. 判断可微性的标准路径是定义：算偏导，再验证 $\dfrac{\Delta z-f_x\Delta x-f_y\Delta y}{\rho}\to0$；只有偏导连续时才可用定理17.2 走捷径。
4. 方向导数与梯度由定理17.6 联系：$f_l=\operatorname{grad}f\cdot l^0=\lvert\operatorname{grad}f\rvert\cos\theta$，梯度方向是增长最快的方向，最大变化率为 $\lvert\operatorname{grad}f\rvert$；方向导数全存在也推不出可微（§3 例2）。
5. 混合偏导 $f_{xy}=f_{yx}$ 需要二者连续（定理17.7）；凸开域上的中值定理（定理17.8）与泰勒定理（定理17.9）是可微性的两大推论，后者是极值充分条件证明的基础。
6. 极值：必要条件是 $\operatorname{grad}f=\mathbf{0}$（稳定点），充分条件是黑塞矩阵正定（极小）/ 负定（极大）/ 不定（非极值），实用判据是 $AC-B^2$ 的符号；$AC-B^2=0$ 时判别法失效（例8）。求区域上的最值还须比较偏导不存在的点与界点。

## Connects To / 与其他章节的联系

- **依赖**：第十六章提供重极限、连续性与有界闭域的紧性结论——本章每条反例都建立在那里的路径判别法（定理16.5 推论2）之上；上册第五章的导数概念、第六章的拉格朗日中值定理与泰勒公式是定理17.2、17.7、17.8、17.9 的技术来源。
- **向前**：第十八章的隐函数定理与条件极值（拉格朗日乘数法）直接建立在 $\operatorname{grad}f$、黑塞矩阵与定理17.8 之上；求有界闭域上的最值时，界点上的极值问题正是第十八章的条件极值问题。
- **推广与对照**：第二十二章§4 讨论 $\nabla$ 记号与向量微分，第二十三章把可微性、黑塞矩阵与泰勒公式推广到 $n$ 元函数与向量值函数；而一元函数"可微 $\iff$ 可导"在本章失效，这条断裂是第十八章隐函数定理需要额外条件（偏导连续）的根源。
