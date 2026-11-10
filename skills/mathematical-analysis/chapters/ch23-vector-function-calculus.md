# 第二十三章 向量函数微分学 (Differential Calculus of Vector Functions)

> 《数学分析》第六版（下册）· 华东师范大学数学科学学院 编

## Core Idea / 核心思想

前面各章讨论的实值函数把点映成实数；本章把函数值换成向量，研究 $f:D\subset\mathbb{R}^n\to\mathbb{R}^m$ 的极限、连续与微分。核心洞察是：**可微 = 局部可用线性变换逼近**，即 $f(x)-f(x_0)=A(x-x_0)+o(\|x-x_0\|)$，其中线性变换 A 的矩阵就是**雅可比矩阵（Jacobian matrix）**，而一元情形的 $f'(x_0)$、二元情形的梯度都只是它的特例。有了这个不依赖维数的定义，第十八章的**隐函数定理**与**反函数定理**就能在 n 维一般形式下重新证明，证明的关键工具是压缩型的迭代（不动点）论证。

## Frameworks Introduced / 核心框架

### 一、n 维欧氏空间与向量函数

- **n 维欧氏空间 $\mathbb{R}^n$**：所有 n 个有序实数组 $x=(x_1,\dots,x_n)^T$ 的全体，内积 $x^Ty=\sum_{i=1}^n x_iy_i$，模 $\|x\|=(x^Tx)^{1/2}$，距离 $\rho(x,y)=\|x-y\|$。模满足三角不等式 $\|x+y\|\le\|x\|+\|y\|$ 与柯西-施瓦茨不等式 $|x^Ty|\le\|x\|\,\|y\|$。约定向量总写成**列向量**，$x^T$ 为转置。
  - 点集：$\{x\mid\|x-a\|<\delta\}$ 是**球形邻域**，$\{x\mid|x_i-a_i|<\delta\}$ 是**方形邻域**，都记作 $U(a;\delta)$，空心邻域记 $U^\circ(a;\delta)$。当 n=2 时 $\{x\mid c^Tx=d\}$ 是直线，n=3 时是平面，n>3 时称**超平面**。
- **定理23.1（完备性）**：$\{P_k\}\subset\mathbb{R}^n$ 为收敛点列的充要条件是：任给 $\varepsilon>0$，存在 $K>0$，当 $k>K$ 时对一切正整数 q 都有 $\rho(P_k,P_{k+q})<\varepsilon$。这是 $\mathbb{R}^n$ 的柯西收敛准则，是后面迭代法能收敛的依据。
- **定义1（向量函数）**：若 $X\subset\mathbb{R}^n$、$Y\subset\mathbb{R}^m$，对每个 $x\in X$ 都有唯一的 $y\in Y$ 使 $(x,y)\in f$，则称 f 为 X 到 Y 的**向量函数**（映射），记 $f:X\to Y$；分量写法 $f=(f_1,\dots,f_m)^T$，$f_i$ 称**分量函数**。若 $x'\ne x''$ 蕴含 $f(x')\ne f(x'')$，则称 f 为**一一映射**（单射）。曲线参数方程是 $n=1$ 的向量函数，曲面参数方程是 $n=2$ 的向量函数。
- **定义2（极限）**：设 $a$ 是 D 的聚点。若对 $l$ 的任意邻域 $U(l;\varepsilon)$ 都有 $a$ 的空心邻域 $U^\circ(a;\delta)$ 使 $f\big(U^\circ(a;\delta)\cap D\big)\subset U(l;\varepsilon)$，则称当 $x\to a$（$x\in D$）时 f 以 l 为极限。等价说法：(i) $\lim_{\|x-a\|\to0}\|f(x)-l\|=0$；(ii) 每个分量 $\lim_{x\to a}f_i(x)=l_i$。**向量函数的极限等价于各分量函数的极限**——这是把高维问题降回实值问题的关键。
- **定义3（连续）**：若对任何 $\varepsilon>0$ 存在 $\delta>0$ 使 $f(U(a;\delta)\cap D)\subset U(f(a);\varepsilon)$，则称 f 在 a（关于 D）连续；等价于所有坐标函数在 a 连续。
- **定理23.2**：$f,g,\alpha$ 在 a 连续、h 在 $b=f(a)$ 连续时，$f\pm g$、$\alpha f$、$h\circ f$ 都在 a 连续。
- **定理23.3**：$f$ 在 $a$ 连续的充要条件是：对任何收敛于 a 的点列 $\{P_k\}$，$\{f(P_k)\}$ 都收敛于 $f(a)$。
  - 关键点：充分性用反证——若 f 在 a 不连续，取 $\delta=1/k$ 可构造出 $\|P_k-a\|<1/k$ 但 $\|f(P_k)-f(a)\|\ge\varepsilon_0$ 的点列，与条件矛盾。
- **整体性质（有界闭集上）**：定理23.4（$f(D)$ 也是有界闭集）；定理23.5（$f(D)$ 的直径可达）；定理23.6（f 在 D 上一致连续）；定理23.7（D 道路连通时 $f(D)$ 也道路连通）。证明套路是把 $\|f(x')-f(x'')\|$ 看成 $D\times D$ 上的连续**实值**函数，再引用第十六章的结果。

### 二、向量函数的微分

- **定义（可微与导数）**：设 $D\subset\mathbb{R}^n$ 为开集，$x_0\in D$，$f:D\to\mathbb{R}^m$。若存在线性变换 A（只依赖于 $x_0$）使得当 $x\in U(x_0)$ 时
  $$f(x)-f(x_0)=A(x-x_0)+o(\|x-x_0\|),\qquad\text{即}\qquad \lim_{x\to x_0}\frac{f(x)-f(x_0)-A(x-x_0)}{\|x-x_0\|}=0,$$
  则称 f 在 $x_0$ **可微**，$A(x-x_0)$ 称为 f 在 $x_0$ 的**微分**，A 称为 f 在 $x_0$ 的**导数**，记作 $Df(x_0)$ 或 $f'(x_0)$。
  - 关键点：当 $m>1$ 时微分不再是实数，而是 m 维向量；这个定义把一元与多元的情形统一了（二元情形里 $c=(f_x(P_0),f_y(P_0))^T$ 就是此处的 A）。
- **导数矩阵（雅可比矩阵）**：$a_{ij}=\left.\partial f_i/\partial x_j\right|_{x=x_0}$，于是
  $$f'(x_0)=Df(x_0)=J_f(x_0)=\begin{pmatrix}\dfrac{\partial f_1}{\partial x_1} & \cdots & \dfrac{\partial f_1}{\partial x_n}\\ \vdots & & \vdots\\ \dfrac{\partial f_m}{\partial x_1} & \cdots & \dfrac{\partial f_m}{\partial x_n}\end{pmatrix}_{x=x_0}.$$
  - 注意：只要所有偏导数存在就能写出这个矩阵，但**写出矩阵不等于 f 可微**——可微必须由它作为线性逼近的极限条件来保证。
- **定理23.8 / 23.9**：若 f 在 $x_0$ 可微，则 f 在 $x_0$ 连续，且所有 m 个坐标函数关于每个自变量 $x_j$ 的一阶偏导数都存在，由它们组成的矩阵 (7) 就是 f 在 $x_0$ 的导数。
- **定理23.10（可微的充分条件）**：若 f 在 $x_0$ 的某邻域内处处存在一阶偏导数，且所有这些偏导数在 $x_0$ **连续**，则 f 在 $x_0$ 可微。
  - 何时用：实际判定可微性的主力定理——只需验证偏导数连续（$C^1$ 条件）。
- **定理23.11（可微的充要条件）**：$f:D\to\mathbb{R}^m$ 在 $x_0$ 可微的充要条件是：存在矩阵函数 $F:D\to\mathbb{R}^{m\times n}$，它在 $x_0$ 连续，且使 $f(x)-f(x_0)=F(x)(x-x_0)$（$x\in D$）；此时 $f'(x_0)=F(x_0)$。
  - 关键点：把可微性改写成「**差商型恒等式 + 矩阵函数的连续性**」，从而避免每次都用 o 记号。反函数定理的证明正靠这一形式。
- **定理23.12（线性性）**：$(cf)'(x_0)=cf'(x_0)$，$(f\pm g)'(x_0)=f'(x_0)\pm g'(x_0)$。
- **定理23.13（链式法则）**：设 $f:D\to\mathbb{R}^m$ 在 $x_0$ 可微，$f(D)\subset D'$，$g:D'\to\mathbb{R}^r$ 在 $y_0=f(x_0)$ 可微，则 $h=g\circ f$ 在 $x_0$ 可微且 $h'(x_0)=g'(y_0)f'(x_0)$。
  - 关键点：令 $f(x)-f(x_0)=F(x)(x-x_0)$、$g(y)-g(y_0)=G(y)(y-y_0)$，则 $h(x)-h(x_0)=G(f(x))F(x)(x-x_0)$；取 $H=G\circ f\cdot F$，由连续性得 H 在 $x_0$ 连续，于是 $h'(x_0)=g'(y_0)f'(x_0)$。**链式法则在矩阵层面就是雅可比矩阵相乘。**
- **定理23.14（微分中值不等式）**：设 $D\subset\mathbb{R}^n$ 是**凸开集**，$f:D\to\mathbb{R}^m$ 在 D 内可微，则对任何 $a,b\in D$，必存在 $\xi=a+\theta(b-a)$（$0<\theta<1$）使 $\big\|f(b)-f(a)\big\|\le\big\|f'(\xi)\big\|\,\|b-a\|$。
  - 关键点：构造实值函数 $\varphi(x)=\big(f(b)-f(a)\big)^Tf(x)$，用实值中值定理（定理17.8）再用柯西-施瓦茨不等式。**注意**：一般**没有**向量形式的等号中值定理 $f(b)-f(a)=f'(\xi)(b-a)$——反例是 $f(t)=(\cos t,\sin t)^T$ 在 $[0,2\pi]$ 上（左端为零向量，右端不可能为零）。
- **黑塞矩阵与极值**：n 元实值函数 $f:D\to\mathbb{R}$ 的二阶导数 $f''(x)=D^2f(x)=\left(\partial^2f/\partial x_i\partial x_j\right)$ 称为**黑塞矩阵（Hessian matrix）**，混合偏导连续时对称；二阶泰勒公式为
  $$f(x)=f(x_0)+f'(x_0)(x-x_0)+\frac12(x-x_0)^Tf''(x_0)(x-x_0)+o(\|x-x_0\|^2).$$
- **定理23.15（极值必要条件）**：$f$ 在 $x_0$ 可微且取极值，则 (i) $f'(x_0)=0$；(ii) 若在 $U(x_0)$ 内有连续二阶偏导，则取极小值时 $f''(x_0)$ 正定或半正定，取极大值时负定或半负定。推论：$f''(x_0)$ 不定时 $x_0$ 不是极值点。
- **定理23.16（极值充分条件）**：上述 f 在 $U(x_0)$ 内有连续二阶偏导且 $f'(x_0)=0$，则 $f''(x_0)$ 正定（负定）时 f 在 $x_0$ 取严格极小（极大）值。
  - 典型应用（例4）：$f(x)=\frac12x^TAx+b^Tx+c$（A 对称）的稳定点是 $x_0=-A^{-1}b$，$f''(x)=A$，故 A 正定时取极小、负定时取极大，极值为 $-\frac12b^TA^{-1}b+c$；A 不定时 $x_0$ 是鞍点。

### 三、反函数定理与隐函数定理

- **定理23.17（反函数定理）**：设 $D\subset\mathbb{R}^n$ 是开集，$f:D\to\mathbb{R}^n$ 满足：(i) 在 D 上可微且 $f'$ 连续；(ii) 存在 $x_0\in D$ 使 $\det f'(x_0)\ne 0$。则存在邻域 $U=U(x_0)\subset D$ 使得
  1° f 在 U 上是一一映射，从而存在反函数 $f^{-1}:V\to U$，其中 $V=f(U)$ 是**开集**；
  2° $f^{-1}$ 在 V 上存在连续导数，且
  $$\big(f^{-1}\big)'(y)=\big(f'(x)\big)^{-1},\qquad x=f^{-1}(y),\ y\in V .$$
  - 何时用：判断一个映射局部是否可逆，并求其反函数的导数（不必解出显式反函数）。
  - 关键点（证明的四步骨架）：① **归一化**：令 $T=f'(x_0)$，在 $W-x_0$ 上定义 $F(x)=T^{-1}\big(f(x_0+x)-f(x_0)\big)$，于是 $F(0)=0$、$F'(0)=I$、$F'$ 在原点附近可逆；② **压缩型估计**：令 $\varphi(x)=x-F(x)$，则 $\varphi'(0)=0$，取 $0<\alpha<1$ 使 $\|\varphi'(x)\|<\alpha$，由定理23.14 得 $\|\varphi(x'')-\varphi(x')\|\le\alpha\|x''-x'\|$，从而 $\|F(x'')-F(x')\|\ge(1-\alpha)\|x''-x'\|$，故 F 在原点某球上是一一映射且其逆 H 连续；③ **迭代法证满射**：对 $y\in(1-\alpha)W_2$ 用 $x_0=0,\ x_i=y+\varphi(x_{i-1})$ 迭代，得 $\|x_i-x_{i-1}\|\le\alpha^{i-1}\|y\|$，故 $\{x_n\}$ 是柯西序列（**这里用到定理23.1**），极限 x 满足 $F(x)=y$；④ **求导与连续性**：用 $\|H(y+k)-H(y)-S^{-1}k\|\le\frac{\|F(x+h)-F(x)-Sh\|}{(1-\alpha)\|h\|}$（$S=F'(x)$）得 $H'(y)=(F'(x))^{-1}$，再由 $F'$ 的连续性得 $H'$ 连续。
- **定理23.18（隐函数定理）**：设 $X\subset\mathbb{R}^n$、$Y\subset\mathbb{R}^m$ 都是开集，$\Omega=X\times Y$，$F:\Omega\to\mathbb{R}^m$。若 (i) 存在 $x_0\in X,y_0\in Y$ 使 $F(x_0,y_0)=0$；(ii) F 在 $\Omega$ 上可微且 $F'$ 连续；(iii) $\det F_y(x_0,y_0)\ne 0$，则存在 $x_0$ 的 n 维邻域 $U\subset X$ 与 $y_0$ 的 m 维邻域 $V\subset Y$，使得在 $W=U\times V$ 内方程 $F(x,y)=0$ **唯一地**确定了隐函数 $f:U\to V$，满足
  1° $y_0=f(x_0)$；2° $x\in U$ 时 $F(x,f(x))\equiv 0$；3° f 在 U 内存在连续偏导数，且
  $$f'(x)=-\big(F_y(x,y)\big)^{-1}F_x(x,y),\qquad (x,y)\in W .$$
  其中 $F_x$ 是 $m\times n$ 矩阵、$F_y$ 是 $m\times m$ 矩阵。
  - 何时用：由方程组 $F(x,y)=0$ 判断能否解出 $y=f(x)$，并求 $f'$ 而不必显式解出。
  - 关键点：构造 $G(x,y)=(x,F(x,y))$，则 $\det G'=\det F_y\ne0$，对 G 用**反函数定理**得可微反函数 $H(x,y)=(x,k(x,y))$；由 $\pi\circ G=F$（$\pi(x,y)=y$）推出 $F(x,k(x,0))=0$，令 $f(x)=k(x,0)$ 即得隐函数。求导则把 $F(x+\Delta x,f(x)+\Delta f)-F(x,f(x))=0$ 写成分量微分中值公式，得矩阵式 $F_yf'(x)=-F_x$，因 $F_y$ 可逆即得 (18)。**n=m=1 时它退化为定理18.1，n=m=2 时退化为定理18.2、18.4。**
- **定理23.19（拉格朗日乘数法，高维形式）**：设 $D\subset\mathbb{R}^n$ 是开集，$f:D\to\mathbb{R}$，$\varphi:D\to\mathbb{R}^m$，$n=m+r$，记 $x=(y,z)$。在条件 $\varphi(x)=\varphi(y,z)=0$ 下求 $f$ 的极值，拉格朗日函数为 $L(x,\lambda)=f(y,z)+\lambda\varphi(y,z)$。若 (i) $f,\varphi$ 在 D 内有连续导数；(ii) $\varphi(x_0)=0$；(iii) $\operatorname{rank}\varphi'(x_0)=m$；(iv) $x_0$ 是条件极值点，则存在 $\lambda_0\in\mathbb{R}^m$ 使 $(x_0,\lambda_0)$ 是 L 的稳定点，即 $L_x(x_0,\lambda_0)=f'(x_0)+\lambda_0\varphi'(x_0)=0$。
  - 关键点：由 (iii) 不妨设 $\det\varphi_z(y_0,z_0)\ne0$，对 $\varphi=0$ 用定理23.18 解出 $z=g(y)$，则 $y_0$ 是 $h(y)=f(y,g(y))$ 的极值点；取 $\lambda_0$ 解 $f_z+\lambda_0\varphi_z=0$，再与链式法则得到的式子相加即得结论。**这是定理18.6 的向量形式。**
- **压缩映射原理（不动点原理，总练习题1）**：若 $D\subset\mathbb{R}^n$ 是闭集，$f:D\to D$，且存在 $q\in(0,1)$ 使对任何 $x',x''\in D$ 有 $\|f(x')-f(x'')\|\le q\|x'-x''\|$，则 D 中存在 f 的唯一不动点 $x^*$。
  - 关键点：迭代 $x_{k+1}=f(x_k)$，得 $\|x_{k+1}-x_k\|\le q^k\|x_1-x_0\|$，故 $\{x_k\}$ 是柯西序列（定理23.1），极限即不动点；唯一性由压缩性直接得出。**这是反函数定理证明中迭代步骤的抽象版本**——教材把它放在总练习题而非正文定理中，但它是本章全部存在性论证的核心引擎。总练习题2 给出闭球版本（条件再加 $\|f(x_0)-x_0\|\le(1-q)r$，$B=\{x\mid\rho(x,x_0)\le r\}$）。

## Key Concepts / 核心概念

**n 维欧氏空间 $\mathbb{R}^n$（n-dimensional Euclidean space）**：定义了内积 $\sum x_iy_i$ 的 n 维实向量空间，模与距离由内积导出。
**邻域（neighborhood）**：$U(a;\delta)$ 表示球形邻域或方形邻域，$U^\circ(a;\delta)$ 为相应的空心邻域。
**收敛点列与柯西序列**：$\rho(P_k,P_{k+q})<\varepsilon$ 对一切 q 成立（定理23.1 的完备性）。
**向量函数 / 映射（vector function / mapping）**：$f:X\subset\mathbb{R}^n\to Y\subset\mathbb{R}^m$，由 m 个分量函数 $f_i$ 组成；一一映射指 $x'\ne x''\Rightarrow f(x')\ne f(x'')$。
**可微与微分（differentiable / differential）**：存在线性变换 A 使 $f(x)-f(x_0)=A(x-x_0)+o(\|x-x_0\|)$；$A(x-x_0)$ 是微分。
**导数矩阵 / 雅可比矩阵（derivative matrix / Jacobian matrix）**：$f'(x_0)=\left(\partial f_i/\partial x_j\right)_{m\times n}$；偏导数存在只是必要条件，不保证可微。
**链式法则（chain rule）**：$(g\circ f)'(x_0)=g'(y_0)f'(x_0)$，在矩阵层面即雅可比矩阵相乘。
**微分中值不等式（mean value inequality）**：$\|f(b)-f(a)\|\le\|f'(\xi)\|\|b-a\|$，凸开集上成立；等号形式的向量中值定理一般不成立。
**黑塞矩阵（Hessian matrix）**：$f''(x)=(\partial^2f/\partial x_i\partial x_j)$，混合偏导连续时对称；用于判定多元极值。
**反函数定理 / 隐函数定理（inverse / implicit function theorem）**：$\det f'(x_0)\ne0$ 时局部可逆且 $(f^{-1})'(y)=(f'(x))^{-1}$；$\det F_y(x_0,y_0)\ne0$ 时 $F(x,y)=0$ 局部唯一确定 $y=f(x)$ 且 $f'=-F_y^{-1}F_x$。
**压缩映射 / 不动点（contraction / fixed point）**：$\|f(x')-f(x'')\|\le q\|x'-x''\|$（$0<q<1$）保证唯一不动点存在。

## Mental Models / 思维模型

- **把可微看成「局部线性化」而不是「偏导数存在」**：$\det f'(x_0)\ne0$ 能推出局部可逆，是因为「导数可逆」意味着 f 在 $x_0$ 附近接近一个可逆线性映射。**必须先验证线性逼近，再谈雅可比矩阵。**
- **遇到 n 维结论，先问「一元/二元情形它说什么」**：定理23.17 在 n=1 时是「$f'(x_0)\ne0$ 则局部有反函数且 $(f^{-1})'=1/f'$」；定理23.18 在 n=m=1 时就是定理18.1。把新定理在特例中检验一遍，是防止记错的最佳办法。
- **把存在性证明都看成「构造柯西序列」**：反函数定理的迭代步骤、压缩映射原理的证明，都是「作 $x_{k+1}=y+\varphi(x_k)$ → 用压缩性估计 $\|x_{k+1}-x_k\|$ → 用定理23.1 断言收敛 → 取极限得存在性」。看到存在性证明先找这个模式。
- **把隐函数定理与拉格朗日乘数法连起来看**：拉格朗日乘数法不是新工具，而是「用隐函数定理把约束解出来，再对复合函数求极值」；$\operatorname{rank}\varphi'(x_0)=m$ 正是 $\det F_y\ne0$ 的推广条件。

## Anti-patterns / 常见错误

- **以为所有偏导数存在就可微**：偏导数存在只给出定理23.9 的结论（雅可比矩阵可写出来），可微必须由定理23.11 的线性逼近条件或定理23.10 的偏导数连续性保证。
- **把实值函数的中值定理照搬到向量函数**：$\|f(b)-f(a)\|\le\|f'(\xi)\|\|b-a\|$ 是不等式，等号形式一般不成立。$f(t)=(\cos t,\sin t)^T$ 在 $[0,2\pi]$ 上就是反例：左端是零向量，右端不可能为零。
- **用反函数定理时不检查 $\det f'(x_0)\ne0$**：这个条件只在**一点**验证就够（得局部结论）；若要求**整个** D 上可逆，则需 D 上处处 $\det\ne0$ 加额外的单射性——$f(x,y)=(e^x\cos y,e^x\sin y)^T$ 在 $\mathbb{R}^2$ 上处处 $\det f'\ne0$，却因 $2\pi$ 周期性不是一一映射。
- **隐函数定理中用错矩阵**：公式是 $f'=-F_y^{-1}F_x$（**先 $F_y$ 的逆左乘 $F_x$，再取负号**），不是 $-F_x^{-1}F_y$，也不是 $F_y^{-1}F_x$。矩阵乘法不可交换。
- **忽视隐函数定理的「局部」二字，或把 $C^1$ 条件当作可省**：定理只保证在 $(x_0,y_0)$ 的某邻域内唯一确定隐函数；而 $f'$（或 $F'$）**连续**是迭代论证中控制误差的前提，不是装饰。

## Reference Tables / 速查表

| 定理 | 关键条件 | 结论 |
|---|---|---|
| 23.8 | f 在 $x_0$ 可微 | f 在 $x_0$ 连续 |
| 23.9 | f 在 $x_0$ 可微 | 所有偏导存在，$f'(x_0)$ 即雅可比矩阵 |
| 23.10 | 邻域内偏导存在且在 $x_0$ 连续 | f 在 $x_0$ 可微（$C^1\Rightarrow$ 可微） |
| 23.11 | 存在在 $x_0$ 连续的 F 使 $f(x)-f(x_0)=F(x)(x-x_0)$ | f 可微且 $f'(x_0)=F(x_0)$ |
| 23.13 | f 在 $x_0$、g 在 $y_0=f(x_0)$ 可微 | $(g\circ f)'(x_0)=g'(y_0)f'(x_0)$（雅可比相乘） |
| 23.14 | D 凸开，f 在 D 内可微 | $\|f(b)-f(a)\|\le\|f'(\xi)\|\|b-a\|$（只有不等式） |
| 23.15 / 23.16 | $f'(x_0)=0$，$U(x_0)$ 内二阶偏导连续 | 看 $f''(x_0)$：正定极小、负定极大、不定非极值 |
| 23.17 反函数定理 | $f'$ 连续，$\det f'(x_0)\ne0$ | $(f^{-1})'(y)=(f'(x))^{-1}$ |
| 23.18 隐函数定理 | $F'$ 连续，$F(x_0,y_0)=0$，$\det F_y(x_0,y_0)\ne0$ | $f'(x)=-(F_y)^{-1}F_x$ |
| 23.19 拉格朗日乘数法 | $\operatorname{rank}\varphi'(x_0)=m$，$x_0$ 为条件极值点 | $f'(x_0)+\lambda_0\varphi'(x_0)=0$ |
| 不动点原理（总练习题1） | D 闭，$\|f(x')-f(x'')\|\le q\|x'-x''\|$，$0<q<1$ | 存在唯一不动点 |

## Worked Example / 工作示例

**用反函数定理求球面坐标变换的反函数的导数（源文本 §3 例1）**

**问题**：记 $w=(x,y,z)^T$、$p=(r,\theta,\varphi)^T$，设 $w=f(p)=(r\sin\theta\cos\varphi,\ r\sin\theta\sin\varphi,\ r\cos\theta)^T$。求反函数 $f^{-1}$ 的导数 $(f^{-1})'(w)$。

**第一步：写出雅可比矩阵 $f'(p)$。** 按分量求偏导（这是 $3\times3$ 矩阵，行对应 x,y,z，列对应 $r,\theta,\varphi$）：
$$f'(p)=\begin{pmatrix}\sin\theta\cos\varphi & r\cos\theta\cos\varphi & -r\sin\theta\sin\varphi\\[2pt] \sin\theta\sin\varphi & r\cos\theta\sin\varphi & r\sin\theta\cos\varphi\\[2pt] \cos\theta & -r\sin\theta & 0\end{pmatrix}.$$

**第二步：验证条件并求行列式。** 各偏导都是初等函数，在其定义域内连续，故 $f'$ 连续。按第三行展开行列式得
$$\det f'(p)=\begin{vmatrix}\sin\theta\cos\varphi & r\cos\theta\cos\varphi & -r\sin\theta\sin\varphi\\ \sin\theta\sin\varphi & r\cos\theta\sin\varphi & r\sin\theta\cos\varphi\\ \cos\theta & -r\sin\theta & 0\end{vmatrix}=r^2\sin\theta .$$
因此当 $r^2\sin\theta\ne0$（即 $r\ne0$ 且 $\theta\ne0,\pi$）时定理23.17 的条件满足，$f$ 在该点附近局部可逆且反函数可微。

**第三步：求逆矩阵并回代。** 记 $D=r^2\sin\theta$，用代数余子式求逆并化简：
$$(f'(p))^{-1}=\frac1{r^2\sin\theta}\begin{pmatrix} r^2\sin^2\theta\cos\varphi & r^2\sin^2\theta\sin\varphi & r^2\sin\theta\cos\theta\\ r\sin\theta\cos\theta\cos\varphi & r\sin\theta\cos\theta\sin\varphi & -r\sin^2\theta\\ -r\sin\varphi & r\cos\varphi & 0\end{pmatrix}=\begin{pmatrix} \sin\theta\cos\varphi & \sin\theta\sin\varphi & \cos\theta\\ \dfrac{\cos\theta\cos\varphi}{r} & \dfrac{\cos\theta\sin\varphi}{r} & -\dfrac{\sin\theta}{r}\\ -\dfrac{\sin\varphi}{r\sin\theta} & \dfrac{\cos\varphi}{r\sin\theta} & 0\end{pmatrix}.$$
由 $(f^{-1})'(w)=\big(f'(p)\big)^{-1}\big|_{p=f^{-1}(w)}$，用 $r=\sqrt{x^2+y^2+z^2}$、$\sin\theta=\frac{\sqrt{x^2+y^2}}{r}$、$\cos\theta=\frac zr$、$\cos\varphi=\frac{x}{\sqrt{x^2+y^2}}$、$\sin\varphi=\frac{y}{\sqrt{x^2+y^2}}$ 回代，得（$x^2+y^2\ne0$）
$$(f^{-1})'(w)=\begin{pmatrix} \dfrac{x}{r} & \dfrac{y}{r} & \dfrac{z}{r}\\[3pt] \dfrac{xz}{r^2\sqrt{x^2+y^2}} & \dfrac{yz}{r^2\sqrt{x^2+y^2}} & -\dfrac{\sqrt{x^2+y^2}}{r^2}\\[3pt] -\dfrac{y}{x^2+y^2} & \dfrac{x}{x^2+y^2} & 0\end{pmatrix}.$$

**第四步：用一个具体点验证。** 取 $\theta=\frac\pi2$、$\varphi=0$，则 $p=(r,\frac\pi2,0)$ 映到 $w=(r,0,0)$，此时
$$f'(p)=\begin{pmatrix}1&0&0\\0&r&0\\0&0&-r\end{pmatrix},\qquad (f'(p))^{-1}=\begin{pmatrix}1&0&0\\0&1/r&0\\0&0&-1/r\end{pmatrix}.$$
把 $x=r,y=0,z=0$ 代入第三步的显式公式：第一行 $(1,0,0)$ 与逆矩阵的第一行相符；第二行是 $(0,0,-1/r)$，却与逆矩阵的**第三**行相同；第三行是 $(0,1/r,0)$，与逆矩阵的**第二**行相同。两行发生了交换——根源是球面坐标里 $\theta$ 起「余纬」的作用、$\varphi$ 起「经度」的作用，与把 $(\theta,\varphi)$ 当成普通极角与方位角的习惯相反。**矩阵求逆必须严格按行列对应关系逐项计算并回代核对，不能凭「对称写法」或只对对角元取倒数**，否则行序颠倒不会被察觉。

**结论与用途**：$(f^{-1})'(w)=(f'(p))^{-1}$ 让我们**不必显式解出 $p=f^{-1}(w)$** 就能得到反函数的导数——正是这个特点使它在坐标变换的雅可比计算中不可替代；$\det f'(p)=r^2\sin\theta\ne0$ 也正是球面坐标可作变量替换的范围。

## Key Takeaways / 关键结论

1. **可微是「局部线性逼近」**：$f'(x_0)$ 是线性变换（矩阵），一元与多元的导数、梯度都是它的特例；定义与维数无关。
2. **判定的主线是 $C^1\Rightarrow$ 可微**（定理23.10）：先算偏导、再看是否连续。偏导都存在但函数不可微的情形确实存在，不能省掉这一步。
3. **链式法则在矩阵层面就是雅可比矩阵相乘**：$(g\circ f)'(x_0)=g'(y_0)f'(x_0)$，顺序不能颠倒。
4. **向量函数只有中值不等式**（定理23.14），没有等号中值定理；凸集是前提。
5. **两个核心定理的公式与条件**：反函数定理 $(f^{-1})'(y)=(f'(x))^{-1}$（$f'$ 连续、$\det f'(x_0)\ne0$）；隐函数定理 $f'(x)=-(F_y)^{-1}F_x$（$F'$ 连续、$F(x_0,y_0)=0$、$\det F_y(x_0,y_0)\ne0$）。两者都只是**局部**结论。
6. **压缩映射原理是本章存在性证明的引擎**：$x_{k+1}=f(x_k)$ 的柯西性 + $\mathbb{R}^n$ 的完备性（定理23.1）给出不动点；极值判定则看黑塞矩阵的定性（正定极小、负定极大、不定非极值）。

## Connects To / 与其他章节的联系

- **向后（依赖）**：**第十六章**多元函数的极限、连续、有界闭集上连续函数的整体性质（定理16.1 完备性、定理16.8）全部被推广到向量函数（定理23.1、23.3–23.7）；**第十七章**多元函数微分学提供偏导数、方向导数、梯度与实值中值定理（定理17.8），本章的黑塞矩阵与极值定理（23.15、23.16）是定理17.10、17.11 的 n 维版本；**第十八章**的隐函数定理、反函数定理与拉格朗日乘数法（定理18.1、18.2、18.4、18.6）是本章定理23.17–23.19 的低维特例。
- **向前（被用）**：本章的雅可比矩阵是**第二十一章**变量变换公式（定理21.13）与**第二十二章**参数曲面面积公式中 $\sqrt{EG-F^2}$、第二型曲面积分中三个雅可比的严格基础；反函数定理又反过来解释了「为什么变换的雅可比非零才能作变量替换」。
- **跨册总结**：本章是全书最后一章，它把上册的实数完备性、极限理论、微分中值定理与下册的多元微分、重积分、曲面积分统一到「n 维向量函数的微分学」框架下——格林、高斯、斯托克斯公式的向量形式（场论三算子）就是这一框架在三维空间的具体投影。
