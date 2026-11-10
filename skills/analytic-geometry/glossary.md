# Glossary / 术语表

《解析几何》第五版（吕林根、许子道 编）**教材 + 学习辅导书 + 课后答案** 综合整理。
章节引用：ch01–ch06 = 教材正文六章，ch07 = 教材附录「矩阵与行列式」。

## A

- **仿射标架 / affine frame** — 由定点 `O` 与三个不共面的有序向量 `e₁,e₂,e₃` 构成的坐标系；`{O; e₁,e₂,e₃}`（Ch 01）
- **渐近方向 / asymptotic direction** — 使 `Φ(X,Y) = 0`（二次曲线）或 `Φ(X,Y,Z) = 0`（二次曲面）成立的方向；**它决定曲线的类型**：无实渐近方向为椭圆型，一个为抛物型，两个为双曲型（Ch 05, Ch 06）
- **渐近线 / asymptote** — 过中心且以渐近方向为方向的直线；中心型曲线才会有（Ch 05）

## B

- **半不变量 / semi-invariant** — 只在坐标变换的某种情形下不变的量（如 `K₁`）；配合不变量可判定抛物型曲线的标准方程（Ch 05）
- **本原（母线）/ generator** — 生成曲面的动直线或动曲线；柱面的母线平行于定方向，锥面的母线过定点，旋转曲面的母线绕轴旋转（Ch 04）
- **标准方程 / standard equation** — 经坐标变换化简后得到的规范形式（如 `x²/a²+y²/b²=1`）；曲线的标准方程不唯一（取决于坐标系选择），但**类型与不变量唯一**（Ch 05, Ch 06）
- **不变量 / invariant** — 在直角坐标变换下保持不变的量：`I₁ = a₁₁+a₂₂`、`I₂ = |a₁₁ a₁₂; a₁₂ a₂₂|`、`I₃ = |A|`（曲线）；`I₁, I₂, I₃, I₄`（曲面）。**用不变量可绕过坐标变换直接分类与写出标准方程**（Ch 05, Ch 06）

## C

- **参数方程 / parametric equation** — 用参数 `t`（曲线）或 `u,v`（曲面）表示点坐标的方程；求参数方程的关键是把动点坐标写成参数的函数（Ch 02）
- **叉积 / cross product** — 见「向量积」
- **长度（模）/ magnitude** — `|a|`；单位向量 `a/|a|`（Ch 01）
- **重根 / repeated root** — 特征方程有重根时主方向的取法需特别处理（Ch 05, Ch 06）
- **纯量积 / scalar product** — 见「数量积」
- **垂直 / perpendicular** — `a ⊥ b ⟺ a·b = 0`（定理1.7）；平面垂直 ⟺ 法向量点积为 0（Ch 01, Ch 03）
- **垂足 / foot** — 点在平面上（或直线上）的射影点（Ch 03）

## D

- **单位向量 / unit vector** — 模为 1 的向量；方向余弦构成单位向量（Ch 01）
- **点到平面的距离 / distance from a point to a plane** — `d = |Ax₀+By₀+Cz₀+D| / √(A²+B²+C²)`；**由平面的法式方程导出**（定理3.2）（Ch 03）
- **点到直线的距离 / distance from a point to a line** — 用向量积计算：`d = |M₀M₁ × v| / |v|`（Ch 03）
- **直角标架 / rectangular frame** — 三个基向量两两垂直且都是单位向量的标架；此时坐标就是通常的直角坐标（Ch 01）
- **直径 / diameter** — 二次曲线的**一族平行弦中点的轨迹**（一条直线，定义5.4）。注意这不是"圆的直径"的意思（Ch 05）
- **共轭方向 / conjugate directions** — 关于二次曲线（曲面）配对的方向；直径的方向与其共轭弦的方向互为共轭（Ch 05, Ch 06）
- **共轭直径 / conjugate diameters** — 互为一对共轭方向的直径（Ch 05）
- **共线向量 / collinear vectors** — 平行于同一直线的向量；**零向量与任何向量共线**（Ch 01）
- **共面向量 / coplanar vectors** — 平行于同一平面的向量；三向量共面 ⟺ 混合积 `(a,b,c) = 0`（Ch 01）
- **公垂线 / common perpendicular** — 与两条异面直线都垂直相交的直线；**唯一存在**，其长度即两异面直线的距离（Ch 03）

## F

- **法式方程 / normal equation of a plane** — `x cosα + y cosβ + z cosγ − p = 0`；**它把距离信息直接编码在常数项里**，是点到平面距离公式的来源（Ch 03）
- **法向量 / normal vector** — 垂直于平面的向量 `n = (A, B, C)`（一般方程 `Ax+By+Cz+D=0` 的系数）（Ch 03）
- **方向角 / direction angle** — 向量与三条坐标轴正向的夹角 `α, β, γ`（Ch 01）
- **方向余弦 / direction cosines** — `cosα, cosβ, cosγ`；满足 `cos²α+cos²β+cos²γ = 1`（Ch 01）
- **方向向量 / direction vector** — 平行于直线的非零向量；**由一点与方向向量即可确定直线**（Ch 03）
- **方向数 / direction numbers** — 与方向向量成比例的三个数（Ch 03）

## G

- **奇点 / singular point** — 二次曲线（曲面）上满足 `F₁=F₂=0`（`F₁=F₂=F₃=0`）的点；奇点处切线不唯一（Ch 05, Ch 06）
- **奇向 / singular direction** — 二次曲面与径面平行的方向（Ch 06）
- **轨迹 / locus** — 满足给定几何条件的点的集合；**求轨迹方程的通法**：设动点 → 列条件 → 化方程 → 讨论范围（Ch 02）

## H

- **混合积 / scalar triple product** — `(a,b,c) = a·(b×c)`；**几何意义为平行六面体的体积（带符号）**；`(a,b,c) = 0 ⟺ 三向量共面`（定理1.9）（Ch 01）
- **回转曲面 / surface of revolution** — 见「旋转曲面」

## J

- **基底 / basis** — 三个不共面的有序向量构成空间的一个基底；**任何向量都可唯一地表示为基向量的线性组合**（Ch 01）
- **基本向量 / fundamental vectors** — 直角标架的三个单位向量 `i, j, k`（Ch 01）
- **截距式 / intercept form** — 平面方程 `x/a + y/b + z/c = 1`（Ch 03）
- **径面 / diametral plane** — 二次曲面的**一族平行弦中点的轨迹**（一个平面，定理6.4）（Ch 06）
- **矩形 / rectangle** — 见「直角标架」

## L

- **棱 / edge** — 见「直母线」
- **零向量 / zero vector** — 模为 0、方向任意的向量（Ch 01）
- **椭球面 / ellipsoid** — `x²/a² + y²/b² + z²/c² = 1`；**有界闭曲面**（Ch 04）

## M

- **母线 / generator** — 见「本原」
- **模 / magnitude** — 见「长度」

## N

- **内积 / inner product** — 见「数量积」

## P

- **平面束 / pencil of planes** — 空间中通过同一条直线的所有平面的集合（定义3.8）；有轴平面束的方程可写成两平面方程的线性组合（Ch 03）
- **平移 / translation** — 坐标变换的一种，只改变原点位置；用于**消去方程中的一次项**（Ch 05, Ch 06）

## Q

- **切线 / tangent** — 与二次曲线（曲面）相交于两个重合点的直线（定义5.3 / 定义6.3）；切点处切线方程由 `F₁(x₀,y₀)(x−x₀) + F₂(x₀,y₀)(y−y₀) = 0` 给出（Ch 05, Ch 06）
- **切平面 / tangent plane** — 二次曲面在切点处的切平面（Ch 06）
- **球坐标系 / spherical coordinate system** — 用 `ρ, θ, φ` 表示空间点；曲面参数方程的特例（Ch 02）
- **曲线的一般方程 / general equation of a space curve** — 两个曲面方程联立 `{F(x,y,z)=0; G(x,y,z)=0}`，表示两曲面的交线（Ch 02）
- **曲面的一般方程 / general equation of a surface** — `F(x,y,z) = 0`（Ch 02）

## S

- **射影 / projection** — 向量 `AB` 在轴 `l` 上的射影 `Prj_l AB = |AB| cosφ`；**射影是可加的数量**（定理1.6）（Ch 01）
- **射影柱面 / projecting cylinder** — 以空间曲线为准线、母线平行于某坐标轴的柱面；用于把空间曲线投影到坐标面（Ch 02, Ch 04）
- **数量乘向量 / scalar multiplication** — `λa`；满足结合律、分配律（Ch 01）
- **数量积（点积、内积）/ scalar (dot) product** — `a·b = |a||b|cosθ`；坐标式 `a·b = a₁b₁+a₂b₂+a₃b₃`；**结果是数，不是向量**（Ch 01）
- **双曲抛物面（马鞍面）/ hyperbolic paraboloid** — `x²/a² − y²/b² = 2z`；**有直母线**（Ch 04）
- **双叶双曲面 / hyperboloid of two sheets** — `x²/a² + y²/b² − z²/c² = −1`；由两张互不相连的曲面组成（Ch 04）
- **双重向量积 / double cross product** — `(a×b)×c`；展开公式 `(a×b)×c = (a·c)b − (b·c)a`（Ch 01）
- **特征方程 / characteristic equation**
  - 二次曲线：`λ² − I₁λ + I₂ = 0`（Ch 05）
  - 二次曲面：`λ³ − I₁λ² + I₂λ − I₃ = 0`（Ch 06）
  **它就是系数矩阵的特征方程**——与线性代数是同一件事
- **特征根 / characteristic root** — 特征方程的根；**二次曲线与二次曲面的特征根都是实数**（定理5.5 / 定理6.5），且不同特征根对应的主方向**互相垂直**（Ch 05, Ch 06）
- **椭球面 / ellipsoid** — 见 L
- **旋转 / rotation** — 坐标变换的一种（转轴）；用于**消去方程中的交叉项**（Ch 05, Ch 06）
- **旋转曲面 / surface of revolution** — 一条曲线绕定直线（轴）旋转所生成的曲面；**方程求法**：把母线方程中的相应变量换成 `±√(另两个变量平方和)`（Ch 04）

## T

- **椭圆抛物面 / elliptic paraboloid** — `x²/a² + y²/b² = 2z`；**无直母线**（Ch 04）
- **椭球面 / ellipsoid** — `x²/a²+y²/b²+z²/c² = 1`（Ch 04）

## W

- **外积 / exterior product** — 见「向量积」

## X

- **向量 / vector** — 既有大小又有方向的量（定义1.1）；解析几何中取**自由向量**（起点可任意平移）（Ch 01）
- **向量积（叉积、外积）/ vector (cross) product** — `a×b`；模 `|a||b|sinθ`（等于以 `a,b` 为邻边的平行四边形面积），方向由**右手法则**确定；**结果是向量**（Ch 01）
- **向量的分解 / decomposition of a vector** — 沿三个不共面方向（或基向量）的线性表示；**坐标就是分解系数**（Ch 01）
- **线性相关 / linearly dependent** — 存在不全为零的 `λᵢ` 使 `Σλᵢaᵢ = 0`；三向量线性相关 ⟺ 共面（Ch 01）
- **向径 / position vector** — 以原点为起点、以点 `M` 为终点的向量 `OM`（Ch 01）
- **旋转曲面 / surface of revolution** — 见 S

## Y

- **圆锥面 / circular cone** — 锥面的特例（Ch 04）
- **圆柱面 / circular cylinder** — 柱面的特例（Ch 04）
- **有轴平面束 / pencil with an axis** — 见「平面束」

## Z

- **柱面 / cylinder** — 平行于定方向且与定曲线相交的一族直线生成的曲面；**母线平行于坐标轴时方程不含该坐标变量**（定理4.1）（Ch 04）
- **柱坐标系 / cylindrical coordinate system** — 用 `ρ, θ, z` 表示空间点（Ch 02）
- **锥面 / cone** — 通过一定点且与定曲线相交的一族直线生成的曲面；**以原点为顶点时方程是齐次方程**（Ch 04）
- **中心 / center** — 二次曲线（曲面）的对称中心；由 `F₁=F₂=0`（`F₁=F₂=F₃=0`）解出。**中心型、无心型、线心型**三分（Ch 05, Ch 06）
- **准线 / directrix** — 柱面/锥面/旋转曲面赖以生成的定曲线（Ch 04）
- **主直径 / principal diameter** — 垂直于其共轭弦的直径（定义5.5）；**主直径的方向就是主方向**（Ch 05）
- **主方向 / principal direction** — 由特征根确定的方向；**二次曲线的两个主方向互相垂直**，以它们作新坐标轴方向即可消去交叉项（Ch 05, Ch 06）
- **主径面 / principal diametral plane** — 垂直于其共轭方向的径面；由特征根确定（Ch 06）
- **坐标变换 / coordinate transformation** — 平移与转轴的合成；**化简二次方程的标准流程 = 先移轴消一次项，再转轴消交叉项**（Ch 05, Ch 06）
