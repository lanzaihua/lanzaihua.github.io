# Glossary / 术语表

《数学分析》第六版（华东师范大学数学科学学院 编）上册 ch01–ch11、下册 ch12–ch23。
`(Ch N)` 指向展开该术语的章节。编号沿用原书（如 `定理2.9`）。

## A

- **绝对收敛 / absolute convergence** — 级数 `∑|uₙ|` 收敛（Ch 12）；对反常积分同理（Ch 11）。**绝对收敛必收敛**，反之不然
- **绝对值 / absolute value** — `|a| = max{a, −a}`；核心不等式 `|a+b| ≤ |a| + |b|`（Ch 01）
- **阿贝尔判别法 / Abel test** — 用于数项级数（Ch 12）、反常积分（Ch 11）、函数项级数一致收敛（Ch 13）的三个同名判别法；形式均为「一个单调有界 + 一个收敛/一致收敛」
- **阿贝尔定理 / Abel theorem** — 幂级数在收敛点处连续；其推论划定了收敛区间的结构（Ch 14）
- **邻域 / neighborhood** — 点 `x₀` 的 `δ` 邻域 `U(x₀, δ) = (x₀−δ, x₀+δ)`；去心邻域 `U°(x₀, δ)`（Ch 01、Ch 03）
- **阿基米德性 / Archimedean property** — 对任意 `a, b > 0` 存在正整数 `n` 使 `na > b`（Ch 01、附录）
- **渐近线 / asymptote** — 曲线与直线距离趋于 0 时的极限位置；分水平、垂直、斜三种（Ch 03）

## B

- **B 函数 / beta function** — `B(p,q) = ∫₀¹ x^{p−1}(1−x)^{q−1}dx`；与 Γ 函数的关系 `B(p,q) = Γ(p)Γ(q)/Γ(p+q)`（Ch 19）
- **伯努利不等式 / Bernoulli inequality** — `(1+h)ⁿ ≥ 1 + nh`（`h > −1`，`n` 为正整数）；证明数列极限的基本工具（Ch 02）
- **贝塞尔不等式 / Bessel inequality** — 傅里叶系数平方和不超过函数平方的积分（Ch 15）
- **有界集 / bounded set** — 同时有上界与下界；**有界 ⟺ 既有上确界又有下确界**（Ch 01）
- **有界性定理 / boundedness theorem** — 闭区间上连续函数必有界（定理4.6 的组成部分）

## C

- **康托尔定理 / Cantor theorem** — 闭区间上连续函数**一致连续**（原书定理4.9「一致连续性定理」）（Ch 04）
- **柯西准则 / Cauchy criterion** — 用「任意两项之差任意小」判定收敛，无需先知极限值。数列（定理2.11）、函数极限（定理3.12）、级数（定理12.1）、多元极限（定理16.1）、一致收敛（定理13.1/13.3/19.7）各有其形（Ch 02/03/12/13/16/19）
- **柯西-阿达马定理 / Cauchy–Hadamard theorem** — 幂级数收敛半径 `R = 1/lim sup ⁿ√|aₙ|`（定理14.3）（Ch 14）
- **柯西中值定理 / Cauchy mean value theorem** — `[f(b)−f(a)]g′(ξ) = [g(b)−g(a)]f′(ξ)`；洛必达法则的理论依据（Ch 06）
- **柯西判别法（根式）/ Cauchy root test** — `lim ⁿ√uₙ = ρ`，`ρ<1` 收敛、`ρ>1` 发散（定理12.8）（Ch 12）
- **柯西积分判别法 / Cauchy integral test** — `∑f(n)` 与 `∫₁^∞ f(x)dx` 同敛散（`f` 非负递减）（定理12.9）（Ch 12）
- **链式法则 / chain rule** — 复合函数求导 `dy/dx = dy/du · du/dx`；高维形式为「沿路径的矩阵乘积」（定理5.8、定理17.5）（Ch 05/17）
- **闭域套定理 / nested closed domain theorem** — 多元版的区间套定理（定理16.2）（Ch 16）
- **比较原则 / comparison principle** — 用已知敛散的级数/积分控制未知的（定理12.6、定理11.2/11.6）（Ch 11/12）
- **实数完备性 / completeness of the reals** — 六大基本定理的共同内容：确界原理、单调有界定理、区间套定理、聚点定理、有限覆盖定理、柯西收敛准则，**六者互相等价**（Ch 07）
- **条件收敛 / conditional convergence** — 收敛但不绝对收敛；其项的重排可改变和（Ch 12）
- **连续性 / continuity** — `lim_{x→x₀} f(x) = f(x₀)`；等价于增量趋于 0（Ch 04）。多元情形见 Ch 16
- **收敛 / convergence** — 数列：`∀ε>0 ∃N ∀n>N: |aₙ−a|<ε`（定义，Ch 02）；级数：部分和数列收敛（Ch 12）
- **凸函数 / convex function** — `f(λx₁+(1−λ)x₂) ≤ λf(x₁)+(1−λ)f(x₂)`；判定用 `f″ ≥ 0`，等价于切线在图像下方（Ch 06）
- **坐标变换 / coordinate transformation** — 用雅可比行列式处理重积分的变量替换（Ch 18、Ch 21）
- **驻点 / stationary point** — `f′(x₀) = 0` 的点；**驻点未必是极值点**（如 `y = x³`）（Ch 06）
- **曲率 / curvature** — `K = |y″| / (1+y′²)^{3/2}`；直线的 `K = 0`，半径 `R` 的圆 `K = 1/R`（Ch 10）

## D

- **达布定理 / Darboux theorem** — 导函数具有介值性（即使导函数不连续）（定理6.5）；另见达布和（Ch 09）（Ch 06/09）
- **达布和 / Darboux sums** — 上和 `S(T)` 与下和 `s(T)`；可积 ⟺ `inf S(T) = sup s(T)`（Ch 09）
- **达朗贝尔判别法（比值）/ d'Alembert ratio test** — `lim uₙ₊₁/uₙ = ρ`（定理12.7）（Ch 12）
- **定积分 / definite integral** — 黎曼和的极限 `∫_a^b f = lim Σf(ξᵢ)Δxᵢ`；几何意义为曲边梯形面积（Ch 09）
- **导数 / derivative** — `f′(x₀) = lim_{Δx→0} Δy/Δx`；几何意义为切线斜率（Ch 05）
- **可微性 / differentiability** — 一元：可导即 `Δy = AΔx + o(Δx)`（Ch 05）。多元：**全微分存在**，强于偏导存在（定理17.1/17.2）（Ch 17）
- **微分 / differential** — `dy = f′(x)dx`；**一阶微分形式不变性**是换元积分法的依据（定理5.9）（Ch 05）
- **狄利克雷判别法 / Dirichlet test** — 「单调趋于 0 + 部分和有界」型判别法（定理12.16、定理11.3/11.7）（Ch 11/12）
- **方向导数 / directional derivative** — 沿指定方向的导数；`∂f/∂l = ∇f · e_l`（Ch 17）
- **间断点 / discontinuity** — 第一类（可去、跳跃）与第二类（无穷、振荡）四分类（Ch 04）
- **发散 / divergence** — 不收敛（Ch 02）
- **二重积分 / double integral** — `∬_D f(x,y)dσ`；计算的核心是化累次积分或作变量变换（Ch 21）

## E

- **欧拉积分 / Euler integrals** — Γ 函数与 B 函数的合称（Ch 19）
- **欧拉公式 / Euler formula** — `e^{ix} = cos x + i sin x`（Ch 14 *§3）

## F

- **费马定理 / Fermat theorem** — 可导的极值点必为驻点：`f′(x₀) = 0`（定理5.3）；**这是极值必要条件的来源，也是罗尔定理的证明工具**（Ch 05）
- **有限覆盖定理 / Heine–Borel theorem** — 闭区间 `[a,b]` 的任何开覆盖都有有限子覆盖（定理7.3、定理16.4）（Ch 07/16）
- **傅里叶级数 / Fourier series** — 三角级数展开 `f(x) ~ a₀/2 + Σ(aₙcos nx + bₙsin nx)`；系数由正交性算出（Ch 15）
- **函数列 / sequence of functions** — `{fₙ}`；点态收敛与**一致收敛**的区别是本章主线（Ch 13）
- **函数项级数 / series of functions** — `Σuₙ(x)`；一致收敛性决定能否逐项积分/求导（Ch 13）

## G

- **Γ 函数 / gamma function** — `Γ(x) = ∫₀^∞ t^{x−1}e^{−t}dt`；递推式 `Γ(x+1) = xΓ(x)`，`Γ(n+1) = n!`（Ch 19）
- **高斯公式 / Gauss formula** — `∯_S P dydz + Q dzdx + R dxdy = ∭_V (∂P/∂x+∂Q/∂y+∂R/∂z)dV`（定理22.5）；格林公式的三维推广（Ch 22）
- **梯度 / gradient** — `∇f = (f_x, f_y)`；方向为增长最快方向，模为最大变化率（Ch 17）
- **格林公式 / Green formula** — `∮_L P dx + Q dy = ∬_D (∂Q/∂x − ∂P/∂y)dxdy`（定理21.11）；**建立曲线积分与二重积分的桥梁**，并给出「曲线积分与路线无关 ⟺ 单连通区域上 ∂P/∂y = ∂Q/∂x」 （定理21.12）（Ch 21）
- **归结原则（海涅定理）/ Heine theorem** — 函数极限存在的充要条件是任何趋于 `x₀` 的数列的函数值都收敛于同一值（定理3.9）；**证明极限不存在的利器**（Ch 03）

## H

- **海涅-博雷尔定理 / Heine–Borel theorem** — 即有限覆盖定理（定理7.3）（Ch 07）
- **海赛矩阵 / Hessian** — 二阶偏导矩阵；极值充分条件由其正定性判定（定理17.11）（Ch 17）
- **高阶导数 / higher-order derivative** — `f⁽ⁿ⁾`；乘积公式为**莱布尼茨公式** `(uv)⁽ⁿ⁾ = ΣC(n,k)u⁽ᵏ⁾v⁽ⁿ⁻ᵏ⁾`（Ch 05）
- **隐函数定理 / implicit function theorem** — `F(x,y)=0` 在 `F_y ≠ 0` 处唯一确定可微的 `y = f(x)`（定理18.1/18.2）；n 维一般形式见定理23.18（Ch 18/23）
- **反常积分 / improper integral** — 无穷积分与瑕积分的合称；用极限定义（Ch 11）
- **不定积分 / indefinite integral** — 原函数的全体 `∫f(x)dx = F(x) + C`（Ch 08）
- **下确界 / infimum** — 最大下界，记 `inf S`（Ch 01）
- **可积性 / integrability** — 可积的三个充要条件（达布和、振幅和、测度形式）（定理9.14/9.15/9.16）（Ch 09）
- **含参量积分 / integrals with parameters** — `I(y) = ∫_a^b f(x,y)dx`；核心问题是**积分号下求导与交换积分次序的条件**（定理19.3/19.4）（Ch 19）
- **介值定理 / intermediate value theorem** — 闭区间上连续函数取遍最小与最大值之间的一切值（定理4.7、定理16.10）（Ch 04/16）
- **区间套定理 / nested interval theorem** — 递缩闭区间套必有唯一公共点（定理7.1）（Ch 07）

## J

- **雅可比行列式 / Jacobian** — `∂(u,v)/∂(x,y)`；变量变换与隐函数组定理的核心工具（Ch 18、Ch 21）

## L

- **拉格朗日中值定理 / Lagrange mean value theorem** — `f(b)−f(a) = f′(ξ)(b−a)`；**一元微分学的枢纽**，由罗尔定理证得（定理6.2）（Ch 06）
- **拉格朗日乘数法 / Lagrange multiplier method** — 条件极值：构造 `L = f + Σλᵢφᵢ`，解 `∇L = 0`（Ch 18）
- **拉格朗日型余项 / Lagrange remainder** — 泰勒公式的定量余项 `f⁽ⁿ⁺¹⁾(ξ)/(n+1)! · (x−x₀)ⁿ⁺¹`（定理6.10）（Ch 06）
- **拉贝判别法 / Raabe test** — 比值判别法失效（`ρ = 1`）时的加强判别法（定理12.10，带 * 号）（Ch 12）
- **莱布尼茨公式 / Leibniz formula** — 高阶导数的乘积公式；另指牛顿-莱布尼茨公式（Ch 05/09）
- **莱布尼茨判别法 / Leibniz test** — 交错级数 `Σ(−1)ⁿ⁻¹uₙ`（`uₙ` 单调递减趋于 0）收敛（定理12.11）（Ch 12）
- **洛必达法则 / L'Hospital rule** — 用 `f′/g′` 的极限求 `0/0` 与 `∞/∞` 型不定式；**三个前提条件缺一不可**（定理6.7/6.8）（Ch 06）
- **利普希茨条件 / Lipschitz condition** — `|f(x₁)−f(x₂)| ≤ L|x₁−x₂|`；强于一致连续（Ch 04/23）
- **数列极限 / limit of a sequence** — ε-N 定义（Ch 02）
- **函数极限 / limit of a function** — ε-δ 定义（`x→x₀`）与 ε-M 定义（`x→∞`）（Ch 03）
- **曲线积分 / line integral** — 第一型（对弧长，与方向无关）与第二型（对坐标，与方向有关）（Ch 20）

## M

- **最大最小值定理 / extreme value theorem** — 闭区间上连续函数必取到最大值与最小值（定理4.6）（Ch 04）
- **中值定理 / mean value theorem** — 罗尔 → 拉格朗日 → 柯西 → 泰勒的定理链；另指积分中值定理（定理9.7/9.8/9.11）（Ch 06/09）
- **单调有界定理 / monotone bounded theorem** — 单调有界数列必收敛（定理2.9）；实数完备性六定理之一（Ch 02/07）
- **重积分 / multiple integral** — 二重与三重积分的合称（Ch 21）

## N

- **牛顿-莱布尼茨公式 / Newton–Leibniz formula** — `∫_a^b f = F(b) − F(a)`；**把定积分计算归结为求原函数**（定理9.1）（Ch 09）
- **牛顿切线法 / Newton's tangent method** — 方程近似解 `xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)`（Ch 06 *§7）

## O

- **单侧极限 / one-sided limit** — 左极限 `f(x₀−0)` 与右极限 `f(x₀+0)`；**极限存在 ⟺ 两者存在且相等**（Ch 03）
- **开集 / open set** — 每点都是内点的集合（Ch 16）
- **无穷小量的阶 / order of infinitesimals** — 高阶、同阶、等价（`α ~ β` 当 `α/β → 1`）；等价无穷小替换是极限计算的常用手段（Ch 03）

## P

- **偏导数 / partial derivative** — 固定其余变量对某一个变量求导（Ch 17）
- **佩亚诺型余项 / Peano remainder** — 泰勒公式的定性余项 `o((x−x₀)ⁿ)`；用于求极限（Ch 06）
- **幂级数 / power series** — `Σaₙ(x−x₀)ⁿ`；由收敛半径刻画收敛区间（Ch 14）
- **聚点定理 / accumulation point theorem** — 有界无限点集必有聚点（定理7.2 魏尔斯特拉斯、定理16.3）（Ch 07/16）

## R

- **收敛半径 / radius of convergence** — 幂级数收敛区间的半长；由柯西-阿达马定理或比值法求得（Ch 14）
- **黎曼和 / Riemann sum** — `Σf(ξᵢ)Δxᵢ`；定积分与重积分的定义载体（Ch 09/21）
- **罗尔定理 / Rolle theorem** — `f(a)=f(b)` 且可导则存在 `f′(ξ)=0`；**拉格朗日中值定理的证明基础**（定理6.1）（Ch 06）

## S

- **第二中值定理 / second mean value theorem** — 积分第二中值定理（定理9.11）；带权形式的积分估计（Ch 09）
- **级数 / series** — `Σuₙ`；敛散性由部分和数列决定（Ch 12）
- **单连通区域 / simply connected domain** — 无「洞」的区域；**曲线积分与路线无关的充分条件**（定理21.12）（Ch 21）
- **光滑曲线 / smooth curve** — 有连续转动切线的曲线（Ch 10/20/21）
- **斯托克斯公式 / Stokes formula** — `∮_L Pdx+Qdy+Rdz = ∬_S (rot F)·n dS`（定理22.6）；格林公式的空间推广（Ch 22）
- **上和与下极限 / limit superior and inferior** — `lim sup` 与 `lim inf`；**收敛 ⟺ 两者相等**（定理7.6）（Ch 07 *§2）
- **上确界 / supremum** — 最小上界，记 `sup S`（Ch 01）
- **曲面积分 / surface integral** — 第一型（对面积）与第二型（对坐标、有向）（Ch 22）
- **对称变换 / symmetric transformation** — （本书未用此义；此处指坐标变换中的对称替换）（Ch 17）

## T

- **泰勒公式 / Taylor formula** — `f(x) = Σ f⁽ᵏ⁾(x₀)/k! (x−x₀)ᵏ + Rₙ`；两种余项形式各有用途（定理6.9/6.10、定理17.9）（Ch 06/17）
- **泰勒级数 / Taylor series** — 泰勒公式取 `n → ∞` 的极限形式（Ch 14）
- **全微分 / total differential** — `dz = f_x dx + f_y dy`；存在全微分即**可微**（Ch 17）
- **三角级数 / trigonometric series** — `Σ(aₙcos nx + bₙsin nx)`（Ch 15）
- **三重积分 / triple integral** — `∭_Ω f dV`；柱坐标与球坐标变换各有其雅可比（Ch 21）

## U

- **一致连续性 / uniform continuity** — `∀ε ∃δ ∀x₁,x₂`（`δ` 与点无关）；**闭区间上连续 ⟹ 一致连续**（定理4.9、定理16.9）（Ch 04/16）
- **一致收敛 / uniform convergence** — `sup|fₙ−f| → 0`；**保证极限函数连续、可逐项积分与求导**（定理13.1–13.14）（Ch 13）

## V

- **向量函数 / vector function** — `f: D ⊂ ℝⁿ → ℝᵐ`；微分为雅可比矩阵（Ch 23）

## W

- **魏尔斯特拉斯判别法 / Weierstrass M-test** — 用 `|uₙ(x)| ≤ Mₙ` 且 `ΣMₙ` 收敛判定一致收敛（定理13.5）；反常积分的同名判别法见定理19.8（Ch 13/19）
- **沃利斯公式 / Wallis formula** — 由 `∫₀^{π/2} sinⁿx dx` 的递推得出 `π/2` 的无穷乘积（Ch 09）
- **微元法 / element method** — 定积分应用的通法：先写微元 `dA`、`dV`、`dS`，再积分（Ch 10）

## 附：作业题库（上册 ch01–ch08）补入的术语

作业集（教材习题选编）里反复出现、但前面按字母排序的主表没单列的术语。`(题 N)` 指作业集题号。

- **存在域（domain of existence）** — 初等函数能取到实数值的自变量集合；求法是把每层「外层的要求」逐层拆成不等式（题 4）
- **无界函数（unbounded function）** — `∀M>0, ∃x₀∈D: |f(x₀)| > M`；量词顺序是 `∀M ∃x₀`，`x₀` 允许依赖 `M`（题 7）
- **迫敛性（squeeze theorem）** — 也称夹逼定理：`g ≤ f ≤ h` 且 `lim g = lim h = A` 则 `lim f = A`（定理3.6）（题 20、22）
- **等价无穷小（equivalent infinitesimals）** — `α ~ β` 指 `α/β → 1`；只在**乘除**中可替换，加减中替换会错（题 22）
- **递推数列（recursively defined sequence）** — `aₙ₊₁ = f(aₙ)`；求极限的路是「先猜不动点 → 证有界 → 证单调 → 取极限」（题 16）
- **幂指函数（power–exponential function）** — `u(x)^{v(x)}`，底与指数都变；必须用对数求导法或改写 `e^{v ln u}`（题 38）
- **对数求导法（logarithmic differentiation）** — 两边取对数再求导；适用于幂指函数与多因子连乘/连除/带根号的式子（题 38）
- **参变量函数（parametric function）** — `x = x(t), y = y(t)` 确定的 `y` 作为 `x` 的函数；`dy/dx = y′_t/x′_t`（题 39、40、44）
- **高阶导数（higher-order derivative）** — `f^{(n)}`；求法三条：拆项 + 已知公式、莱布尼茨公式、找规律 + 归纳（题 41–44）
- **微分形式不变性（invariance of differential form）** — `dy = f′(u)du` 对 `u` 是自变量或中间变量都成立；这是微分能做近似计算与换元的根据（题 45、46）
- **法线（normal line）** — 过切点且与切线垂直的直线，斜率 `−1/f′(x₀)`（题 34、40）
- **拐点（inflection point）** — 曲线凹凸性改变的点；`y″ = 0` 只是**候选**，必须验证 `y″` 在该点两侧变号（题 58、59）
- **凹函数 / 凸函数（convex / concave，本书约定）** — 本书 `y″ > 0` 叫**凹**（下凸），`y″ < 0` 叫**凸**（上凸），与部分教材相反；判断不等式用「凸函数图像在弦下方」（题 60、61）
- **部分分式分解（partial fraction decomposition）** — 把有理函数拆成一次/二次不可约因式对应的简单分式之和；**必须先化真分式**（题 68）
- **万能代换（universal substitution）** — `t = tan(x/2)`，把任何三角有理式化为有理函数；一定可行但常很繁，**先试凑微分**（题 69）
- **有理函数（rational function）** — 两个多项式之商 `P(x)/Q(x)`；积分流程：化真分式 → 分解分母 → 部分分式 → 逐项积分（题 68）
- **简单无理根式积分（integrals with radicals）** — 含 `ⁿ√(ax+b)` 时令 `t = ⁿ√(ax+b)`；含 `√(a²±x²)`、`√(x²−a²)` 时三角代换（题 66、69）
- **函数作图（curve sketching）** — 五步：定义域与对称性 → 单调与极值 → 凹凸与拐点 → 渐近线 → 列表描点（题 62）
