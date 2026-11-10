'use strict';
/* 第二十三章 向量函数微分学 */
module.exports = {
  name: '第二十三章 向量函数微分学',
  facts: [
    ['向量函数的极限与连续', '向量函数 $\\mathbf r(t)=(x(t),y(t),z(t))$ 的极限、连续、可导都按分量定义：$\\mathbf r$ 连续当且仅当 $x,y,z$ 都连续', '向量函数的分析性质逐分量成立。'],
    ['向量函数的导数', '若 $\\mathbf r(t)=(x(t),y(t),z(t))$ 可导，则 $\\mathbf r^{\\prime}(t)=(x^{\\prime}(t),y^{\\prime}(t),z^{\\prime}(t))$', '导数按分量分别求导。'],
    ['导数的几何意义', '若 $\\mathbf r^{\\prime}(t_0)\\ne\\mathbf 0$，则 $\\mathbf r^{\\prime}(t_0)$ 是曲线在 $t_0$ 处的切向量', '割线方向 $\\frac{\\mathbf r(t_0+\\Delta t)-\\mathbf r(t_0)}{\\Delta t}$ 的极限即切向量。'],
    ['向量函数的求导法则', '$(\\mathbf r\\pm\\mathbf s)^{\\prime}=\\mathbf r^{\\prime}\\pm\\mathbf s^{\\prime}$，$(\\varphi\\mathbf r)^{\\prime}=\\varphi^{\\prime}\\mathbf r+\\varphi\\mathbf r^{\\prime}$，$(\\mathbf r\\cdot\\mathbf s)^{\\prime}=\\mathbf r^{\\prime}\\cdot\\mathbf s+\\mathbf r\\cdot\\mathbf s^{\\prime}$，$(\\mathbf r\\times\\mathbf s)^{\\prime}=\\mathbf r^{\\prime}\\times\\mathbf s+\\mathbf r\\times\\mathbf s^{\\prime}$', '逐分量验证或按定义求极限。'],
    ['弧长公式', '曲线 $\\mathbf r=\\mathbf r(t)$（$\\alpha\\le t\\le\\beta$）的弧长为 $s=\\int_\\alpha^\\beta|\\mathbf r^{\\prime}(t)|dt$', '用折线长度取极限得到。'],
    ['弧长参数化', '若以弧长 $s$ 为参数，则 $|\\mathbf r^{\\prime}(s)|=1$，即切向量是单位向量', '弧长参数下速度大小为 $1$。'],
    ['单位切向量', '单位切向量 $\\mathbf T=\\frac{\\mathbf r^{\\prime}}{|\\mathbf r^{\\prime}|}$，它指向曲线前进的方向', '把切向量单位化。'],
    ['曲率', '曲率 $\\kappa=\\left|\\frac{d\\mathbf T}{ds}\\right|=\\frac{|\\mathbf T^{\\prime}(t)|}{|\\mathbf r^{\\prime}(t)|}=\\frac{|\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}|}{|\\mathbf r^{\\prime}|^3}$', '曲率刻画曲线偏离直线的程度。'],
    ['曲率半径', '曲率半径 $\\rho=\\frac1\\kappa$（$\\kappa\\ne0$）；直线曲率为 $0$，曲率半径为 $+\\infty$', '曲率半径是密切圆的半径。'],
    ['主法向量与副法向量', '主法向量 $\\mathbf N=\\frac{\\mathbf T^{\\prime}}{|\\mathbf T^{\\prime}|}$，副法向量 $\\mathbf B=\\mathbf T\\times\\mathbf N$，$\\{\\mathbf T,\\mathbf N,\\mathbf B\\}$ 构成单位正交标架', '由 $\\mathbf T$ 的转向定义 $\\mathbf N$，再取叉积得 $\\mathbf B$。'],
    ['挠率', '挠率 $\\tau=\\frac{(\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime})\\cdot\\mathbf r^{\\prime\\prime\\prime}}{|\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}|^2}$，刻画曲线偏离平面的程度', '挠率为零的曲线是平面曲线。'],
    ['Frenet 公式', '$\\mathbf T^{\\prime}=\\kappa|\\mathbf r^{\\prime}|\\mathbf N$，$\\mathbf N^{\\prime}=-\\kappa|\\mathbf r^{\\prime}|\\mathbf T+\\tau|\\mathbf r^{\\prime}|\\mathbf B$，$\\mathbf B^{\\prime}=-\\tau|\\mathbf r^{\\prime}|\\mathbf N$', '用曲率与挠率描述标架的运动。'],
    ['向量函数的积分', '$\\int_\\alpha^\\beta\\mathbf r(t)dt=\\left(\\int_\\alpha^\\beta x\\,dt,\\int_\\alpha^\\beta y\\,dt,\\int_\\alpha^\\beta z\\,dt\\right)$', '向量函数积分按分量进行。'],
    ['加速度分解', '加速度 $\\mathbf a=v^{\\prime}\\mathbf T+\\kappa v^2\\mathbf N$，其中 $v=|\\mathbf r^{\\prime}|$', '切向加速度改变速率，法向加速度改变方向。'],
    ['保守场与旋度', '若向量场 $\\mathbf F$ 是某数量场的梯度且区域单连通，则 $\\operatorname{curl}\\mathbf F=\\mathbf 0$；反之在单连通区域上 $\\operatorname{curl}\\mathbf F=\\mathbf 0$ 蕴涵 $\\mathbf F$ 保守', '梯度场的旋度恒为零，单连通时逆命题成立。']
  ],
  falses: [
    ['向量函数与模的导数', '向量函数的导数等于其模的导数', '$\\mathbf r(t)=(\\cos t,\\sin t)$ 的模恒为 $1$，模的导数为 $0$，但 $\\mathbf r^{\\prime}=(-\\sin t,\\cos t)\\ne\\mathbf 0$'],
    ['模可导的条件', '若向量函数 $\\mathbf r(t)$ 可导，则其模 $|\\mathbf r(t)|$ 必处处可导', '$\\mathbf r(t)=(t,0)$ 可导，但 $|\\mathbf r(t)|=|t|$ 在 $t=0$ 处不可导'],
    ['切向量的存在性', '若 $\\mathbf r^{\\prime}(t_0)=\\mathbf 0$，则曲线在 $t_0$ 处没有切线', '$\\mathbf r(t)=(t^2,t^3)$ 在 $t=0$ 处 $\\mathbf r^{\\prime}=\\mathbf 0$，但割线方向趋于 $x$ 轴，切线存在'],
    ['曲率公式', '曲线的曲率 $\\kappa=|\\mathbf r^{\\prime\\prime}(t)|$', '正确公式为 $\\kappa=\\frac{|\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}|}{|\\mathbf r^{\\prime}|^3}$，例如直线 $\\mathbf r^{\\prime\\prime}=\\mathbf 0$ 但一般曲线的 $\\mathbf r^{\\prime\\prime}$ 不为零'],
    ['曲率与平直程度', '曲率越大，曲线越平直', '曲率越大曲线弯曲越厉害，曲率为零才是直线'],
    ['Frenet 标架', 'Frenet 标架 $\\{\\mathbf T,\\mathbf N,\\mathbf B\\}$ 两两正交，但不一定是单位向量', '按定义 $\\mathbf T,\\mathbf N,\\mathbf B$ 都是单位向量，构成单位正交标架'],
    ['副法向量与直线', '副法向量 $\\mathbf B$ 为常向量当且仅当曲线是直线', '平面曲线的副法向量为常向量，但平面曲线一般不是直线'],
    ['曲率半径', '直线的曲率半径为 $0$', '直线的曲率为 $0$，曲率半径为 $+\\infty$'],
    ['挠率与平面曲线', '挠率不为零的曲线也可以是平面曲线', '平面曲线的副法向量为常向量，挠率恒为零，故挠率非零的曲线必为空间曲线'],
    ['向量函数的积分', '向量函数积分的模等于各分量积分模的和', '积分按分量进行，一般 $\\left|\\int\\mathbf r\\,dt\\right|\\le\\int|\\mathbf r|dt$，不一定取等号'],
    ['旋度为零与保守场', '若 $\\operatorname{curl}\\mathbf F=\\mathbf 0$，则 $\\mathbf F$ 一定是保守场', '在非单连通区域上可能不成立，例如 $\\mathbf F=\\left(\\frac{-y}{x^2+y^2},\\frac{x}{x^2+y^2},0\\right)$ 的旋度为零但沿绕原点闭路的环量为 $2\\pi$'],
    ['内积与正交', '若两向量函数的内积为常数，则它们必正交', '内积为常数只说明 $(\\mathbf r\\cdot\\mathbf s)^{\\prime}=0$，不能推出 $\\mathbf r\\cdot\\mathbf s=0$'],
    ['曲率与速度', '曲线的曲率与参数化方式无关', '曲率是几何量，确实与参数化无关；但用公式 $\\frac{|\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}|}{|\\mathbf r^{\\prime}|^3}$ 计算时需保证 $\\mathbf r^{\\prime}\\ne0$'],
    ['弧长参数', '弧长参数化后速度大小仍为 $|\\mathbf r^{\\prime}(t)|$', '以弧长为参数时 $|\\mathbf r^{\\prime}(s)|=1$，这正是弧长参数化的特征'],
    ['加速度分解', '加速度在法向的分量等于 $v^2$', '法向分量等于 $\\kappa v^2$，缺少曲率因子']
  ],
  formulas: [
    ['向量函数 $\\mathbf r(t)=(x(t),y(t),z(t))$ 的导数 $\\mathbf r^{\\prime}(t)=$____。', '(x^{\\prime}(t),y^{\\prime}(t),z^{\\prime}(t))', '逐分量求导。', '向量函数导数'],
    ['曲线 $\\mathbf r=\\mathbf r(t)$（$\\alpha\\le t\\le\\beta$）的弧长 $s=$____。', '\\int_\\alpha^\\beta|\\mathbf r^{\\prime}(t)|dt', '弧长是速度大小的积分。', '弧长'],
    ['单位切向量 $\\mathbf T=$____。', '\\frac{\\mathbf r^{\\prime}}{|\\mathbf r^{\\prime}|}', '把切向量单位化。', '单位切向量'],
    ['曲率 $\\kappa=$____（用 $\\mathbf r^{\\prime},\\mathbf r^{\\prime\\prime}$ 表示）。', '\\frac{|\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}|}{|\\mathbf r^{\\prime}|^3}', '曲率公式的叉积形式。', '曲率'],
    ['曲率 $\\kappa=\\left|\\frac{d\\mathbf T}{ds}\\right|=$____（用 $\\mathbf T$ 与 $s$ 表示）。', '\\left|\\frac{d\\mathbf T}{ds}\\right|', '曲率是切向量关于弧长的变化率。', '曲率'],
    ['主法向量 $\\mathbf N=$____。', '\\frac{\\mathbf T^{\\prime}}{|\\mathbf T^{\\prime}|}', '主法向量由切向量的转向确定。', '主法向量'],
    ['副法向量 $\\mathbf B=$____。', '\\mathbf T\\times\\mathbf N', '副法向量与 $\\mathbf T,\\mathbf N$ 构成右手系。', '副法向量'],
    ['挠率 $\\tau=$____。', '\\frac{(\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime})\\cdot\\mathbf r^{\\prime\\prime\\prime}}{|\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}|^2}', '挠率的计算公式。', '挠率'],
    ['曲率半径 $\\rho=$____。', '\\frac1\\kappa', '曲率半径是曲率的倒数。', '曲率半径'],
    ['加速度的分解：$\\mathbf a=$____。', 'v^{\\prime}\\mathbf T+\\kappa v^2\\mathbf N', '切向加速度与法向加速度之和。', '加速度分解'],
    ['向量函数积分 $\\int_\\alpha^\\beta\\mathbf r(t)dt=$____。', '\\left(\\int_\\alpha^\\beta x\\,dt,\\int_\\alpha^\\beta y\\,dt,\\int_\\alpha^\\beta z\\,dt\\right)', '积分按分量进行。', '向量函数积分'],
    ['数量场 $u$ 的梯度 $\\operatorname{grad}u=$____。', '(u_x,u_y,u_z)', '梯度是数量场的向量微分。', '梯度'],
    ['向量场 $\\mathbf F=(P,Q,R)$ 的散度 $\\operatorname{div}\\mathbf F=$____。', 'P_x+Q_y+R_z', '散度是数量。', '散度'],
    ['向量场 $\\mathbf F=(P,Q,R)$ 的旋度 $\\operatorname{curl}\\mathbf F=$____。', '(R_y-Q_z,\\,P_z-R_x,\\,Q_x-P_y)', '旋度是向量。', '旋度'],
    ['若 $\\mathbf F$ 是保守场，则 $\\operatorname{curl}\\mathbf F=$____。', '\\mathbf 0', '梯度场的旋度为零。', '保守场']
  ],
  num: {
    '计算题': [
      { topic: '向量函数求导', q: '求 $\\mathbf r(t)=(t,t^2,t^3)$ 在 $t=1$ 处的导数', a: '$(1,2,3)$', dist: ['$(1,1,1)$', '$(3,2,1)$', '$(1,2,1)$'], sol: '$\\mathbf r^{\\prime}(t)=(1,2t,3t^2)$，在 $t=1$ 处为 $(1,2,3)$。' },
      { topic: '速度大小', q: '求 $\\mathbf r(t)=(\\cos t,\\sin t,t)$ 的速度大小 $|\\mathbf r^{\\prime}(t)|$', a: '$\\sqrt2$', dist: ['$1$', '$2$', '$\\sqrt3$'], sol: '$\\mathbf r^{\\prime}=(-\\sin t,\\cos t,1)$，其模为 $\\sqrt{\\sin^2t+\\cos^2t+1}=\\sqrt2$。' },
      { topic: '弧长计算', q: '求螺线 $\\mathbf r(t)=(\\cos t,\\sin t,t)$（$0\\le t\\le2\\pi$）的弧长', a: '$2\\sqrt2\\pi$', dist: ['$2\\pi$', '$\\sqrt2\\pi$', '$4\\pi$'], sol: '$|\\mathbf r^{\\prime}|=\\sqrt2$，弧长为 $\\int_0^{2\\pi}\\sqrt2dt=2\\sqrt2\\pi$。' },
      { topic: '曲率计算', q: '求半径为 $2$ 的圆的曲率', a: '$\\frac12$', dist: ['$2$', '$1$', '$\\frac14$'], sol: '圆上每一点的曲率均为 $\\frac1R=\\frac12$。' },
      { topic: '螺线的曲率', q: '求螺线 $\\mathbf r(t)=(\\cos t,\\sin t,t)$ 的曲率', a: '$\\frac12$', dist: ['$1$', '$\\frac{\\sqrt2}{2}$', '$2$'], sol: '$\\mathbf r^{\\prime}=(-\\sin t,\\cos t,1)$，$\\mathbf r^{\\prime\\prime}=(-\\cos t,-\\sin t,0)$，叉积模为 $\\sqrt2$，$|\\mathbf r^{\\prime}|=\\sqrt2$，故 $\\kappa=\\frac{\\sqrt2}{(\\sqrt2)^3}=\\frac12$。' }
    ],
    '应用题': [
      { topic: '切向量', q: '求曲线 $\\mathbf r(t)=(\\cos t,\\sin t,t)$ 在 $t=\\frac\\pi4$ 处的切向量方向', a: '$(-\\frac{\\sqrt2}{2},\\frac{\\sqrt2}{2},1)$', dist: ['$(\\frac{\\sqrt2}{2},\\frac{\\sqrt2}{2},1)$', '$(1,1,1)$', '$(-\\frac{\\sqrt2}{2},-\\frac{\\sqrt2}{2},1)$'], sol: '$\\mathbf r^{\\prime}(t)=(-\\sin t,\\cos t,1)$，在 $t=\\frac\\pi4$ 处为 $(-\\frac{\\sqrt2}{2},\\frac{\\sqrt2}{2},1)$。' },
      { topic: '曲率半径', q: '求抛物线 $y=x^2$ 在 $x=0$ 处的曲率半径', a: '$\\frac12$', dist: ['$2$', '$1$', '$\\frac14$'], sol: '$y^{\\prime}=2x$，$y^{\\prime\\prime}=2$，$\\kappa=\\frac{|y^{\\prime\\prime}|}{(1+y^{\\prime2})^{3/2}}=2$，故 $\\rho=\\frac12$。' },
      { topic: '法向加速度', q: '质点沿单位圆以匀速率 $1$ 运动，求其法向加速度', a: '$1$', dist: ['$0$', '$2$', '$\\frac12$'], sol: '法向加速度为 $\\kappa v^2=1\\cdot1^2=1$。' },
      { topic: '挠率计算', q: '求螺线 $\\mathbf r(t)=(\\cos t,\\sin t,t)$ 的挠率', a: '$\\frac12$', dist: ['$1$', '$-\\frac12$', '$\\sqrt2$'], sol: '$\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}=(\\sin t,-\\cos t,1)$，其模方为 $2$；该向量与 $\\mathbf r^{\\prime\\prime\\prime}=(\\sin t,-\\cos t,0)$ 的内积为 $1$，故 $\\tau=\\frac{1}{2}$。' },
      { topic: '弧长计算', q: '求曲线 $\\mathbf r(t)=\\left(t,\\frac{t^2}{2}\\right)$（$0\\le t\\le1$）的弧长', a: '$\\frac{\\sqrt2+\\ln(1+\\sqrt2)}{2}$', dist: ['$\\sqrt2$', '$\\frac{\\sqrt2}{2}$', '$\\ln(1+\\sqrt2)$'], sol: '$|\\mathbf r^{\\prime}|=\\sqrt{1+t^2}$，弧长为 $\\int_0^1\\sqrt{1+t^2}dt=\\frac{\\sqrt2+\\ln(1+\\sqrt2)}{2}$。' }
    ],
    '综合题': [
      { topic: 'Frenet 标架', q: '求圆 $\\mathbf r(t)=(\\cos t,\\sin t,0)$ 的单位切向量、主法向量与副法向量', a: '$\\mathbf T=(-\\sin t,\\cos t,0)$，$\\mathbf N=(-\\cos t,-\\sin t,0)$，$\\mathbf B=(0,0,1)$', dist: ['$\\mathbf T=(\\cos t,\\sin t,0)$，$\\mathbf N=(-\\sin t,\\cos t,0)$，$\\mathbf B=(0,0,1)$', '$\\mathbf T=(-\\sin t,\\cos t,0)$，$\\mathbf N=(\\cos t,\\sin t,0)$，$\\mathbf B=(0,0,1)$', '$\\mathbf T=(-\\sin t,\\cos t,0)$，$\\mathbf N=(-\\cos t,-\\sin t,0)$，$\\mathbf B=(0,0,-1)$'], sol: '$\\mathbf T=\\mathbf r^{\\prime}=(-\\sin t,\\cos t,0)$；$\\mathbf T^{\\prime}=(-\\cos t,-\\sin t,0)$ 已是单位向量，故 $\\mathbf N=(-\\cos t,-\\sin t,0)$；$\\mathbf B=\\mathbf T\\times\\mathbf N=(0,0,1)$。' },
      { topic: 'Frenet 标架', q: '求螺线 $\\mathbf r(t)=(\\cos t,\\sin t,t)$ 的单位切向量与主法向量', a: '$\\mathbf T=\\frac{1}{\\sqrt2}(-\\sin t,\\cos t,1)$，$\\mathbf N=(-\\cos t,-\\sin t,0)$', dist: ['$\\mathbf T=(-\\sin t,\\cos t,1)$，$\\mathbf N=(-\\cos t,-\\sin t,0)$', '$\\mathbf T=\\frac{1}{\\sqrt2}(-\\sin t,\\cos t,1)$，$\\mathbf N=(\\cos t,\\sin t,0)$', '$\\mathbf T=(\\cos t,\\sin t,1)$，$\\mathbf N=(-\\sin t,\\cos t,0)$'], sol: '$\\mathbf r^{\\prime}=(-\\sin t,\\cos t,1)$，模为 $\\sqrt2$，故 $\\mathbf T=\\frac1{\\sqrt2}(-\\sin t,\\cos t,1)$；$\\mathbf T^{\\prime}=\\frac1{\\sqrt2}(-\\cos t,-\\sin t,0)$，单位化得 $\\mathbf N=(-\\cos t,-\\sin t,0)$。' },
      { topic: '对数曲线的曲率半径', q: '求曲线 $y=\\ln x$ 在 $x=1$ 处的曲率半径', a: '$2\\sqrt2$', dist: ['$\\frac{\\sqrt2}{2}$', '$1$', '$2$'], sol: '$y^{\\prime}=\\frac1x$，$y^{\\prime\\prime}=-\\frac1{x^2}$，在 $x=1$ 处 $\\kappa=\\frac{1}{2^{3/2}}=\\frac{\\sqrt2}{4}$，故 $\\rho=2\\sqrt2$。' },
      { topic: '散度与旋度', q: '求向量场 $\\mathbf F=(x,y,z)$ 的散度与旋度', a: '$\\operatorname{div}\\mathbf F=3$，$\\operatorname{curl}\\mathbf F=\\mathbf 0$', dist: ['$\\operatorname{div}\\mathbf F=0$，$\\operatorname{curl}\\mathbf F=\\mathbf 0$', '$\\operatorname{div}\\mathbf F=3$，$\\operatorname{curl}\\mathbf F=(x,y,z)$', '$\\operatorname{div}\\mathbf F=1$，$\\operatorname{curl}\\mathbf F=\\mathbf 0$'], sol: '$\\operatorname{div}\\mathbf F=1+1+1=3$；各分量交叉偏导相减为零，故旋度为零。' },
      { topic: '保守场判定', q: '判断向量场 $\\mathbf F=(-y,x,0)$ 是否为保守场', a: '不是保守场（旋度为 $(0,0,2)\\ne\\mathbf 0$）', dist: ['是保守场', '旋度为零但不是保守场', '无法判断'], sol: '$\\operatorname{curl}\\mathbf F=(0,0,2)\\ne\\mathbf 0$，故不是梯度场。' }
    ],
    '分类讨论题': [
      { topic: '非正则参数化', q: '讨论 $\\mathbf r(t)=(t^2,t^3)$ 在 $t=0$ 处的切线是否存在', a: '切线存在，方向为 $(1,0)$', dist: ['切线不存在', '切线方向为 $(0,0)$', '曲线在 $t=0$ 处不可导'], sol: '虽然 $\\mathbf r^{\\prime}(0)=\\mathbf 0$，但割线方向 $\\frac{(t^2,t^3)}{t^2}=(1,t)$ 趋于 $(1,0)$，故切线存在。' },
      { topic: '曲率为零的曲线', q: '讨论曲率恒为零的曲线类型', a: '曲率恒为零的曲线是直线（或其一部分）', dist: ['曲率恒为零的曲线是圆', '曲率恒为零的曲线是平面曲线', '曲率恒为零的曲线不存在'], sol: '$\\kappa=0$ 意味着切向量方向不变，故曲线为直线。' },
      { topic: '挠率为零的曲线', q: '讨论挠率恒为零的曲线类型', a: '挠率恒为零的曲线是平面曲线', dist: ['挠率恒为零的曲线是直线', '挠率恒为零的曲线是圆', '挠率恒为零的曲线不存在'], sol: '$\\tau=0$ 意味着副法向量为常向量，曲线位于一个固定平面内。' },
      { topic: '模的可导性', q: '讨论 $\\mathbf r(t)=(t,0)$ 的模在 $t=0$ 处是否可导', a: '$|\\mathbf r(t)|=|t|$，在 $t=0$ 处不可导', dist: ['可导且导数为 $0$', '可导且导数为 $1$', '$|\\mathbf r(t)|$ 恒为常数'], sol: '$|t|$ 在 $0$ 处左右导数分别为 $-1$ 与 $1$，故不可导。' },
      { topic: '保守场的区域条件', q: '讨论 $\\operatorname{curl}\\mathbf F=\\mathbf 0$ 与保守场的关系', a: '在单连通区域上等价；非单连通区域上不一定成立', dist: ['总等价', '总不等价', '与区域形状无关'], sol: '单连通区域上可用斯托克斯公式证明逆命题；去心区域上的经典反例说明区域条件不可省。' }
    ],
    '误差分析题': [
      { topic: '折线近似弧长', q: '用折线近似光滑曲线计算弧长，若折线最大边长 $h$，误差量级为', a: '$O(h^2)$', dist: ['$O(h)$', '$O(1)$', '$O(h^3)$'], sol: '折线弧长与曲线弧长之差为各段弓形长度之和，量级为 $O(h^2)$。' },
      { topic: '中心差分误差', q: '用中心差分 $\\frac{\\mathbf r(t+h)-\\mathbf r(t-h)}{2h}$ 近似 $\\mathbf r^{\\prime}(t)$，误差量级为', a: '$O(h^2)$', dist: ['$O(h)$', '$O(h^3)$', '$O(1)$'], sol: '中心差分是二阶格式，误差为 $O(h^2)$。' },
      { topic: '曲率数值计算的误差', q: '用差商法数值计算曲率，若步长为 $h$，则误差量级为', a: '$O(h^2)$', dist: ['$O(h)$', '$O(h^3)$', '$O(1)$'], sol: '用二阶中心差分计算一、二阶导数后代入曲率公式，整体误差为 $O(h^2)$。' },
      { topic: '弦长与弧长', q: '用弦长 $2\\sin\\frac\\theta2$ 近似半径 $1$、圆心角 $\\theta$ 的弧长 $\\theta$，当 $\\theta=0.2$ 时误差约为', a: '$3.3\\times10^{-4}$', dist: ['$10^{-2}$', '$3.3\\times10^{-3}$', '$10^{-5}$'], sol: '$\\theta-2\\sin\\frac\\theta2\\approx\\frac{\\theta^3}{24}$，取 $\\theta=0.2$ 得约 $3.3\\times10^{-4}$。' },
      { topic: '中点公式的误差', q: '用中点公式数值计算弧长积分，若步长 $h$、被积函数光滑，误差量级为', a: '$O(h^2)$', dist: ['$O(h)$', '$O(h^3)$', '$O(1)$'], sol: '中点公式为二阶精度。' }
    ],
    '多解比较题': [
      { topic: '弧长的两种算法', q: '求螺线 $\\mathbf r(t)=(\\cos t,\\sin t,t)$（$0\\le t\\le2\\pi$）的弧长，分别用弧长公式与对称性方法', a: '$2\\sqrt2\\pi$', dist: ['$2\\pi$', '$\\sqrt2\\pi$', '$4\\pi$'], sol: '方法一：$s=\\int_0^{2\\pi}\\sqrt2dt=2\\sqrt2\\pi$；方法二：由圆柱螺线在 $t$ 增加 $2\\pi$ 时上升 $2\\pi$，展开后为直线段，长度为 $\\sqrt{(2\\pi)^2+(2\\pi)^2}=2\\sqrt2\\pi$。' },
      { topic: '曲率的两种算法', q: '求半径为 $R$ 的圆的曲率，分别用曲率公式与几何定义', a: '$\\frac1R$', dist: ['$R$', '$R^2$', '$\\frac{1}{R^2}$'], sol: '方法一：代入 $\\kappa=\\frac{|\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}|}{|\\mathbf r^{\\prime}|^3}$ 得 $\\frac1R$；方法二：圆的切向量转角与弧长之比恒为 $\\frac1R$。' },
      { topic: '挠率的两种算法', q: '求螺线 $\\mathbf r(t)=(\\cos t,\\sin t,t)$ 的挠率，分别用挠率公式与 Frenet 公式', a: '$\\frac12$', dist: ['$1$', '$-\\frac12$', '$\\sqrt2$'], sol: '方法一：$\\tau=\\frac{(\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime})\\cdot\\mathbf r^{\\prime\\prime\\prime}}{|\\mathbf r^{\\prime}\\times\\mathbf r^{\\prime\\prime}|^2}=\\frac12$；方法二：由 $\\mathbf B^{\\prime}=-\\tau|\\mathbf r^{\\prime}|\\mathbf N$ 求出 $\\tau$，结果一致。' },
      { topic: '切线的两种求法', q: '求曲线 $\\mathbf r(t)=(t^2,t^3)$ 在 $t=1$ 处的切线方向，分别用导数法与割线极限法', a: '$(2,3)$', dist: ['$(1,1)$', '$(3,2)$', '$(2,1)$'], sol: '方法一：$\\mathbf r^{\\prime}(1)=(2,3)$；方法二：割线方向 $\\frac{((1+h)^2,(1+h)^3)-(1,1)}{h}\\to(2,3)$，一致。' },
      { topic: '散度的两种算法', q: '求 $\\mathbf F=(x^2,y^2,z^2)$ 在 $(1,1,1)$ 处的散度，分别用定义与分量求导两种方法', a: '$6$', dist: ['$3$', '$2$', '$9$'], sol: '方法一：$\\operatorname{div}\\mathbf F=2x+2y+2z=6$；方法二：逐分量求偏导 $2x,2y,2z$ 后相加，在 $(1,1,1)$ 处为 $6$。' }
    ]
  }
};
