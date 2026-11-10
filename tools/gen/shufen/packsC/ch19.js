'use strict';
/* 第十九章 含参量积分 */
module.exports = {
  name: '第十九章 含参量积分',
  facts: [
    ['含参量正常积分的连续性', '若 $f(x,y)$ 在矩形 $[a,b]\\times[c,d]$ 上连续，则 $I(y)=\\int_a^bf(x,y)dx$ 在 $[c,d]$ 上连续', '由 $f$ 在紧集上一致连续，把积分之差用一致连续性估计。'],
    ['积分号下求导', '若 $f$ 与 $f_y$ 都在 $[a,b]\\times[c,d]$ 上连续，则 $I(y)=\\int_a^bf(x,y)dx$ 在 $[c,d]$ 上可导，且 $I^{\\prime}(y)=\\int_a^bf_y(x,y)dx$', '用拉格朗日中值定理把差商写成 $f_y$ 的积分，再由连续性取极限。'],
    ['积分号下积分', '若 $f$ 在矩形 $[a,b]\\times[c,d]$ 上连续，则 $\\int_c^ddy\\int_a^bf(x,y)dx=\\int_a^bdx\\int_c^df(x,y)dy$', '连续函数在矩形上的二重积分可化为两种次序的累次积分。'],
    ['含参量反常积分的一致收敛', '若对任意 $\\varepsilon>0$，存在 $A>0$，当 $A^{\\prime}>A$ 时对一切 $y$ 都有 $\\left|\\int_{A^{\\prime}}^{+\\infty}f(x,y)dx\\right|<\\varepsilon$，则称该积分关于 $y$ 一致收敛', '一致收敛要求截断误差与 $y$ 无关。'],
    ['Weierstrass 判别法', '若 $|f(x,y)|\\le M(x)$ 且 $\\int_a^{+\\infty}M(x)dx$ 收敛，则 $\\int_a^{+\\infty}f(x,y)dx$ 关于 $y$ 一致收敛', '由绝对收敛的优级数控制截断误差。'],
    ['Dirichlet 判别法', '若 $\\int_a^Af(x,y)dx$ 关于 $y$ 一致有界，$g(x,y)$ 关于 $x$ 单调且当 $x\\to+\\infty$ 时关于 $y$ 一致趋于零，则 $\\int_a^{+\\infty}fg\\,dx$ 一致收敛', '用阿贝尔变换（分部积分）估计尾部积分。'],
    ['Abel 判别法', '若 $\\int_a^{+\\infty}f(x,y)dx$ 一致收敛，$g(x,y)$ 关于 $x$ 单调且关于 $y$ 一致有界，则 $\\int_a^{+\\infty}fg\\,dx$ 一致收敛', '分部积分后把一致收敛性与有界性结合。'],
    ['一致收敛与连续性', '若 $f$ 连续且 $\\int_a^{+\\infty}f(x,y)dx$ 关于 $y$ 一致收敛，则 $I(y)=\\int_a^{+\\infty}f(x,y)dx$ 连续', '截断到有限区间用连续性，再用一致收敛控制尾部。'],
    ['含参量反常积分的积分交换', '若 $f$ 连续且 $\\int_a^{+\\infty}f(x,y)dx$ 关于 $y$ 一致收敛，则 $\\int_c^ddy\\int_a^{+\\infty}fdx=\\int_a^{+\\infty}dx\\int_c^df\\,dy$', '先截断为有限区间，用正常积分的交换次序，再取极限。'],
    ['含参量反常积分的求导', '若 $f,f_y$ 连续，$\\int_a^{+\\infty}f(x,y)dx$ 处处收敛，$\\int_a^{+\\infty}f_y(x,y)dx$ 关于 $y$ 一致收敛，则 $I$ 可导且 $I^{\\prime}(y)=\\int_a^{+\\infty}f_y(x,y)dx$', '对有限截断的积分用莱布尼茨公式，再对导数积分用一致收敛取极限。'],
    ['Gamma 函数', '$\\Gamma(s)=\\int_0^{+\\infty}x^{s-1}e^{-x}dx$ 当且仅当 $s>0$ 时收敛，且 $\\Gamma(s+1)=s\\Gamma(s)$', '在 $0$ 附近与 $x^{s-1}$ 比较，在无穷远处由指数衰减控制。'],
    ['Gamma 函数的阶乘公式', '对非负整数 $n$ 有 $\\Gamma(n+1)=n!$，且 $\\Gamma\\left(\\frac12\\right)=\\sqrt\\pi$', '由递推公式与 $\\Gamma(1)=1$ 归纳；$\\Gamma\\left(\\frac12\\right)$ 用 $t=x^2$ 化为概率积分。'],
    ['Beta 函数', '$B(p,q)=\\int_0^1x^{p-1}(1-x)^{q-1}dx$ 当且仅当 $p>0$、$q>0$ 时收敛', '在 $x=0$ 与 $x=1$ 两端分别与幂函数比较。'],
    ['Beta 函数与 Gamma 函数的关系', '$B(p,q)=\\frac{\\Gamma(p)\\Gamma(q)}{\\Gamma(p+q)}$，且 $B(p,q)=B(q,p)$', '把 $\\Gamma(p)\\Gamma(q)$ 写成二重积分并作变量代换 $x=uv$，$y=u(1-v)$。'],
    ['狄利克雷积分', '$\\int_0^{+\\infty}\\frac{\\sin x}{x}dx=\\frac{\\pi}{2}$，该积分条件收敛而非绝对收敛', '用含参量积分 $\\int_0^{+\\infty}e^{-xy}\\frac{\\sin x}{x}dx$ 求导后再令 $y\\to0^+$。']
  ],
  falses: [
    ['连续与可导', '若 $f(x,y)$ 在矩形上连续，则 $I(y)=\\int_a^bf(x,y)dx$ 必可导', '$f(x,y)=\\sqrt{|y|}$ 在 $[0,1]^2$ 上连续，但 $I(y)=\\sqrt{|y|}$ 在 $y=0$ 处不可导'],
    ['含参量积分的连续性', '若 $f(x,y)$ 在 $(0,0)$ 处不连续，则 $I(y)=\\int_0^1f(x,y)dx$ 不可能连续', '$f(x,y)=\\frac{y}{x^2+y^2}$ 在原点不连续，$I(y)=\\arctan\\frac1y$ 在 $y=0$ 处确实不连续，但 $f$ 在单点的改变不影响积分，故该说法不成立'],
    ['一致收敛与绝对收敛', '若含参量反常积分一致收敛，则它必绝对收敛', '$\\int_0^{+\\infty}\\frac{\\sin x}{x}dx$ 收敛但不绝对收敛，作为不含参数的积分它当然一致收敛'],
    ['Weierstrass 判别法的适用范围', 'Weierstrass 判别法可用于判断条件收敛的含参量积分的一致收敛性', 'Weierstrass 判别法要求 $\\int|f|$ 被收敛积分控制，本质上是绝对一致收敛，不能处理条件收敛情形'],
    ['逐点收敛与一致收敛', '若 $\\int_a^{+\\infty}f(x,y)dx$ 对每个 $y$ 都收敛且 $f$ 连续，则该积分关于 $y$ 一致收敛', '$f(x,y)=ye^{-xy}$ 对每个 $y\\ge0$ 积分收敛，但 $I(y)$ 在 $y=0$ 处不连续，故不一致收敛'],
    ['Gamma 函数的收敛范围', '$\\Gamma(s)=\\int_0^{+\\infty}x^{s-1}e^{-x}dx$ 对一切实数 $s$ 都收敛', '$s\\le0$ 时 $x=0$ 附近 $x^{s-1}$ 不可积，积分发散'],
    ['Gamma 函数的值', '$\\Gamma\\left(\\frac12\\right)=\\frac{\\sqrt\\pi}{2}$', '应为 $\\Gamma\\left(\\frac12\\right)=\\sqrt\\pi$，可由 $\\int_{-\\infty}^{+\\infty}e^{-x^2}dx=\\sqrt\\pi$ 得到'],
    ['Beta 函数公式的适用范围', '$B(p,q)=\\frac{\\Gamma(p)\\Gamma(q)}{\\Gamma(p+q)}$ 对一切实数 $p,q$ 成立', '该公式要求 $p>0$、$q>0$，否则两端都可能无意义'],
    ['狄利克雷积分', '$\\int_0^{+\\infty}\\frac{\\sin x}{x}dx=\\pi$', '正确值为 $\\frac{\\pi}{2}$，可由含参量积分求导得到'],
    ['一致收敛与求导', '若 $\\int_a^{+\\infty}f(x,y)dx$ 关于 $y$ 一致收敛，则 $\\int_a^{+\\infty}f_y(x,y)dx$ 也一致收敛', '取 $f(x,y)=e^{-xy}\\sin x$，原积分一致收敛，但 $\\int_0^{+\\infty}-xe^{-xy}\\sin x\\,dx$ 在 $y=0$ 附近不一致收敛'],
    ['逐项求导的条件', '含参量反常积分只要一致收敛就可以在积分号下求导', '还需 $\\int f_y\\,dx$ 一致收敛；仅有原积分的一致收敛不足以保证求导公式成立'],
    ['积分与函数连续性', '若 $I(y)=\\int_0^1f(x,y)dx$ 连续，则 $f(x,y)$ 必连续', '改变 $f$ 在单个点（甚至有限个点）的值不影响 $I$，但会破坏 $f$ 的连续性'],
    ['Weierstrass 判别法的条件', 'Weierstrass 判别法中只要求 $M(x)\\to0$（$x\\to\\infty$）', '还要求 $\\int_a^{+\\infty}M(x)dx$ 收敛，仅有 $M(x)\\to0$ 不能控制积分'],
    ['积分在参数端点', '$\\int_0^{+\\infty}e^{-xy}dx=\\frac1y$ 在 $y=0$ 处也成立', '$y=0$ 时被积函数为 $1$，积分发散，故等式只在 $y>0$ 时成立'],
    ['Beta 函数的对称性', 'Beta 函数一般不满足 $B(p,q)=B(q,p)$', '作代换 $x=1-t$ 即得 $B(p,q)=B(q,p)$，故它是对称的']
  ],
  formulas: [
    ['积分号下求导：$\\frac{d}{dy}\\int_a^bf(x,y)dx=$____。', '\\int_a^bf_y(x,y)dx', '莱布尼茨公式（正常积分情形）。', '积分号下求导'],
    ['交换积分次序：$\\int_c^ddy\\int_a^bf(x,y)dx=$____。', '\\int_a^bdx\\int_c^df(x,y)dy', '连续函数在矩形上的二重积分可换序。', '交换次序'],
    ['Weierstrass 判别法：若 $|f(x,y)|\\le M(x)$ 且 ____ 收敛，则 $\\int_a^{+\\infty}fdx$ 一致收敛。', '\\int_a^{+\\infty}M(x)dx', '用收敛的优积分控制截断误差。', '一致收敛判别'],
    ['$\\Gamma(s)=$____（$s>0$）。', '\\int_0^{+\\infty}x^{s-1}e^{-x}dx', 'Gamma 函数的积分定义。', 'Gamma 函数'],
    ['$\\Gamma(n+1)=$____（$n$ 为非负整数）。', 'n!', '由递推公式归纳得到。', 'Gamma 函数'],
    ['$\\Gamma\\left(\\frac12\\right)=$____。', '\\sqrt\\pi', '由概率积分 $\\int_{-\\infty}^{+\\infty}e^{-x^2}dx=\\sqrt\\pi$ 得到。', 'Gamma 函数'],
    ['$B(p,q)=$____（$p,q>0$）。', '\\int_0^1x^{p-1}(1-x)^{q-1}dx', 'Beta 函数的积分定义。', 'Beta 函数'],
    ['$B(p,q)=$____（用 Gamma 函数表示）。', '\\frac{\\Gamma(p)\\Gamma(q)}{\\Gamma(p+q)}', 'Beta 与 Gamma 的关系式。', 'Beta 函数'],
    ['Beta 函数的对称性：$B(p,q)=$____。', 'B(q,p)', '作代换 $x=1-t$ 即得。', 'Beta 函数'],
    ['$\\int_0^{+\\infty}\\frac{\\sin x}{x}dx=$____。', '\\frac{\\pi}{2}', '狄利克雷积分，条件收敛。', '狄利克雷积分'],
    ['$\\int_0^{+\\infty}e^{-xy}dx=$____（$y>0$）。', '\\frac1y', '指数函数的积分。', '含参量积分'],
    ['含参量反常积分一致收敛：对任意 $\\varepsilon>0$，存在 $A>0$，当 $A^{\\prime}>A$ 时对一切 $y$ 有 ____。', '\\left|\\int_{A^{\\prime}}^{+\\infty}f(x,y)dx\\right|<\\varepsilon', '一致收敛的量化定义。', '一致收敛'],
    ['Dirichlet 判别法：若 $\\int_a^Af(x,y)dx$ 一致有界，$g$ 关于 $x$ 单调且一致趋于零，则 ____ 一致收敛。', '\\int_a^{+\\infty}f(x,y)g(x,y)dx', '用阿贝尔变换估计尾部。', '一致收敛判别'],
    ['含参量正常积分：$f$ 在矩形上连续，则 $I(y)=$____ 连续。', '\\int_a^bf(x,y)dx', '连续性定理。', '连续性'],
    ['积分号下取极限：若 $f$ 连续且 $\\int_a^{+\\infty}fdx$ 一致收敛，则 $\\lim_{y\\to y_0}\\int_a^{+\\infty}f(x,y)dx=$____。', '\\int_a^{+\\infty}\\lim_{y\\to y_0}f(x,y)dx', '一致收敛保证极限与积分可交换。', '极限交换']
  ],
  num: {
    '计算题': [
      { topic: '幂函数含参积分', q: '计算 $\\int_0^1x^y\\,dx$（$y>-1$）', a: '$\\frac{1}{y+1}$', dist: ['$\\frac{1}{y}$', '$y+1$', '$\\frac{y}{y+1}$'], sol: '$\\int_0^1x^y dx=\\left.\\frac{x^{y+1}}{y+1}\\right|_0^1=\\frac{1}{y+1}$。' },
      { topic: '积分号下求导', q: '求 $\\frac{d}{dy}\\int_0^1e^{-xy}dx$（$y>0$）', a: '$\\frac{e^{-y}(1+y)-1}{y^2}$', dist: ['$\\frac{1-e^{-y}}{y}$', '$\\frac{e^{-y}-1}{y}$', '$\\frac{1-e^{-y}}{y^2}$'], sol: '先算 $\\int_0^1e^{-xy}dx=\\frac{1-e^{-y}}{y}$，再对 $y$ 求导得 $\\frac{e^{-y}(1+y)-1}{y^2}$。' },
      { topic: '指数型含参积分', q: '计算 $\\int_0^{+\\infty}e^{-xy}dx$（$y>0$）', a: '$\\frac1y$', dist: ['$y$', '$\\frac{1}{y^2}$', '$1$'], sol: '$\\int_0^{+\\infty}e^{-xy}dx=\\left.-\\frac{e^{-xy}}{y}\\right|_0^{+\\infty}=\\frac1y$。' },
      { topic: '幂函数积分', q: '计算 $\\int_0^1x^{p-1}dx$（$p>0$）', a: '$\\frac1p$', dist: ['$p$', '$\\frac{1}{p-1}$', '$\\frac{1}{p+1}$'], sol: '$\\int_0^1x^{p-1}dx=\\frac1p$（$p>0$）。' },
      { topic: 'Gamma 函数赋值', q: '计算 $\\int_0^{+\\infty}xe^{-x}dx$', a: '$1$', dist: ['$2$', '$\\frac12$', '$e$'], sol: '这是 $\\Gamma(2)=1!=1$，也可直接分部积分。' }
    ],
    '应用题': [
      { topic: '狄利克雷积分', q: '计算 $\\int_0^{+\\infty}\\frac{\\sin x}{x}dx$', a: '$\\frac{\\pi}{2}$', dist: ['$\\pi$', '$\\frac{\\pi}{4}$', '$1$'], sol: '这是狄利克雷积分，可用含参量积分求导后令参数趋于零得到。' },
      { topic: 'Gamma 函数赋值', q: '计算 $\\Gamma(3)$', a: '$2$', dist: ['$1$', '$6$', '$\\frac12$'], sol: '$\\Gamma(3)=2\\Gamma(2)=2\\cdot1!=2$。' },
      { topic: 'Beta 函数赋值', q: '计算 $B(2,3)$', a: '$\\frac{1}{12}$', dist: ['$\\frac{1}{6}$', '$\\frac{1}{24}$', '$\\frac{1}{4}$'], sol: '$B(2,3)=\\frac{\\Gamma(2)\\Gamma(3)}{\\Gamma(5)}=\\frac{1\\cdot2}{24}=\\frac{1}{12}$。' },
      { topic: 'Beta 函数积分', q: '计算 $\\int_0^1x^2(1-x)dx$', a: '$\\frac{1}{12}$', dist: ['$\\frac{1}{6}$', '$\\frac{1}{4}$', '$\\frac{1}{3}$'], sol: '这是 $B(3,2)=\\frac{\\Gamma(3)\\Gamma(2)}{\\Gamma(5)}=\\frac{2}{24}=\\frac1{12}$。' },
      { topic: '概率积分', q: '计算 $\\int_0^{+\\infty}e^{-x^2}dx$', a: '$\\frac{\\sqrt\\pi}{2}$', dist: ['$\\sqrt\\pi$', '$\\frac{\\sqrt{2\\pi}}{2}$', '$\\frac12$'], sol: '作代换 $t=x^2$ 得 $\\frac12\\Gamma\\left(\\frac12\\right)=\\frac{\\sqrt\\pi}{2}$。' }
    ],
    '综合题': [
      { topic: '含参量积分的对数求值', q: '计算 $\\int_0^1\\frac{x^2-x}{\\ln x}dx$', a: '$\\ln3$', dist: ['$\\ln2$', '$\\ln\\frac32$', '$2\\ln2$'], sol: '由 $\\int_0^1\\frac{x^a-x^b}{\\ln x}dx=\\ln\\frac{a+1}{b+1}$，取 $a=2$，$b=0$ 得 $\\ln3$。' },
      { topic: 'Frullani 积分', q: '计算 $\\int_0^{+\\infty}\\frac{e^{-x}-e^{-2x}}{x}dx$', a: '$\\ln2$', dist: ['$\\ln3$', '$\\frac12$', '$\\ln\\frac12$'], sol: '由 Frullani 公式 $\\int_0^{+\\infty}\\frac{e^{-ax}-e^{-bx}}{x}dx=\\ln\\frac ba$，得 $\\ln2$。' },
      { topic: 'Gamma 函数比值', q: '计算 $\\frac{\\Gamma(5)}{\\Gamma(3)}$', a: '$12$', dist: ['$8$', '$20$', '$6$'], sol: '$\\Gamma(5)=4!=24$，$\\Gamma(3)=2!=2$，比值为 $12$。' },
      { topic: '对数因子的积分', q: '计算 $\\int_0^1x^2\\ln\\frac1x\\,dx$', a: '$\\frac19$', dist: ['$\\frac13$', '$\\frac1{27}$', '$\\frac12$'], sol: '对 $B$ 函数求导或分部积分：$\\int_0^1x^2\\ln\\frac1x dx=\\frac{1}{(2+1)^2}=\\frac19$。' },
      { topic: 'Gamma 函数赋值', q: '计算 $\\int_0^{+\\infty}x^2e^{-x}dx$', a: '$2$', dist: ['$1$', '$6$', '$4$'], sol: '这是 $\\Gamma(3)=2!=2$。' }
    ],
    '分类讨论题': [
      { topic: 'Gamma 函数的收敛范围', q: '讨论 $\\Gamma(s)=\\int_0^{+\\infty}x^{s-1}e^{-x}dx$ 的收敛范围', a: '$s>0$ 时收敛，$s\\le0$ 时发散', dist: ['对一切实数 $s$ 收敛', '$s>1$ 时收敛', '$s\\ge0$ 时收敛'], sol: '$x=0$ 附近需 $s-1>-1$ 即 $s>0$；无穷远处指数衰减保证收敛。' },
      { topic: 'Beta 函数的收敛范围', q: '讨论 $B(p,q)=\\int_0^1x^{p-1}(1-x)^{q-1}dx$ 的收敛范围', a: '$p>0$ 且 $q>0$ 时收敛', dist: ['对一切实数 $p,q$ 收敛', '$p>1$ 且 $q>1$ 时收敛', '$p,q$ 同号时收敛'], sol: '$x=0$ 附近需 $p>0$，$x=1$ 附近需 $q>0$，故收敛当且仅当 $p>0,q>0$。' },
      { topic: '含参量积分的一致收敛性', q: '讨论 $\\int_0^{+\\infty}e^{-xy}dx$ 在 $y\\in[\\delta,+\\infty)$（$\\delta>0$）上的一致收敛性', a: '一致收敛，且积分值为 $\\frac1\\delta$ 量级', dist: ['不一致收敛', '仅在 $y\\ge1$ 时一致收敛', '对一切 $y>0$ 一致收敛'], sol: '当 $y\\ge\\delta$ 时 $e^{-xy}\\le e^{-\\delta x}$，而 $\\int_0^{+\\infty}e^{-\\delta x}dx=\\frac1\\delta$，由 Weierstrass 判别法一致收敛。' },
      { topic: '幂函数瑕积分', q: '讨论 $\\int_0^1x^{p-1}dx$ 的收敛性（$p$ 为实参数）', a: '$p>0$ 时收敛于 $\\frac1p$，$p\\le0$ 时发散', dist: ['对一切 $p$ 收敛', '$p>1$ 时收敛', '$p\\ge0$ 时收敛'], sol: '瑕点在 $x=0$，由 $p$-积分判别法，当且仅当 $p>0$ 时收敛。' },
      { topic: '一致收敛的参数范围', q: '讨论 $\\int_1^{+\\infty}\\frac{dx}{x^p}$ 在 $p\\ge p_0>1$ 上的一致收敛性', a: '一致收敛', dist: ['不一致收敛', '仅在 $p>2$ 时一致收敛', '对一切 $p>1$ 一致收敛'], sol: '当 $p\\ge p_0>1$ 时 $\\frac1{x^p}\\le\\frac1{x^{p_0}}$，而 $\\int_1^{+\\infty}\\frac{dx}{x^{p_0}}$ 收敛，由 Weierstrass 判别法一致收敛。' }
    ],
    '误差分析题': [
      { topic: '指数积分的截断误差', q: '用 $\\int_0^Ae^{-x}dx$ 近似 $\\int_0^{+\\infty}e^{-x}dx=1$，当 $A=10$ 时误差约为', a: '$4.5\\times10^{-5}$', dist: ['$10^{-2}$', '$4.5\\times10^{-3}$', '$1$'], sol: '误差为 $\\int_A^{+\\infty}e^{-x}dx=e^{-A}=e^{-10}\\approx4.5\\times10^{-5}$。' },
      { topic: '含参量积分的截断误差', q: '用 $\\int_0^Ae^{-xy}dx$ 近似 $\\int_0^{+\\infty}e^{-xy}dx$（$y\\ge1$），当 $A=10$ 时误差不超过', a: '$\\frac{e^{-10}}{y}\\le4.5\\times10^{-5}$', dist: ['$e^{-10}$', '$10^{-2}$', '$\\frac{1}{y}$'], sol: '截断误差为 $\\int_A^{+\\infty}e^{-xy}dx=\\frac{e^{-Ay}}{y}\\le e^{-10}\\approx4.5\\times10^{-5}$。' },
      { topic: '矩形公式的误差阶', q: '用步长为 $h$ 的矩形公式近似二重积分，若被积函数在矩形上连续且一致连续，则误差量级为', a: '$O(h)$', dist: ['$O(h^2)$', '$O(1)$', '$O(h^3)$'], sol: '一致连续只保证误差随 $h\\to0$ 趋于零，一般为 $O(h)$；要达到 $O(h^2)$ 需更强的光滑性。' },
      { topic: '反正切型积分的数值', q: '已知 $\\int_0^1\\frac{y}{x^2+y^2}dx=\\arctan\\frac1y$，当 $y=0.01$ 时该积分约为', a: '$\\approx1.5608$', dist: ['$\\approx1.5708$', '$\\approx0.01$', '$\\approx1.5$'], sol: '$y=0.01$ 时积分为 $\\arctan100\\approx1.5608$，与 $\\frac\\pi2\\approx1.5708$ 相差约 $0.01$。' },
      { topic: '指数函数近似的误差', q: '用 $\\int_0^1\\left(1-x+\\frac{x^2}{2}\\right)dx$ 近似 $\\int_0^1e^{-x}dx$，其误差约为', a: '$0.034$', dist: ['$0.0034$', '$0.34$', '$0.00034$'], sol: '真值 $1-e^{-1}\\approx0.6321$，近似值 $1-\\frac12+\\frac16\\approx0.6667$，误差约 $0.0346$。' }
    ],
    '多解比较题': [
      { topic: '含参量积分的两种求导', q: '求 $\\frac{d}{dy}\\int_0^1x^y\\,dx$（$y>-1$），分别用积分号下求导与先积分后求导两种方法', a: '$-\\frac{1}{(y+1)^2}$', dist: ['$\\frac{1}{(y+1)^2}$', '$-\\frac{1}{y+1}$', '$\\frac{1}{y+1}$'], sol: '方法一：$\\int_0^1x^y\\ln x\\,dx=-\\frac{1}{(y+1)^2}$；方法二：先积得 $\\frac{1}{y+1}$ 再求导，得 $-\\frac1{(y+1)^2}$，一致。' },
      { topic: '含参量积分的对数求值', q: '计算 $\\int_0^1\\frac{x^2-x}{\\ln x}dx$，分别用含参量积分与级数展开两种方法', a: '$\\ln3$', dist: ['$\\ln2$', '$\\ln\\frac32$', '$\\frac12$'], sol: '方法一：令 $I(a)=\\int_0^1\\frac{x^a-x}{\\ln x}dx$，求导得 $I^{\\prime}(a)=\\frac{1}{a+1}$，积分得 $\\ln(a+1)$，取 $a=2$；方法二：用 $\\frac{x^a-x}{\\ln x}=\\int_x^1t^{a-1}dt$ 交换次序同样得到 $\\ln3$。' },
      { topic: 'Beta 函数的两种算法', q: '计算 $B(2,3)$，分别用积分定义与 Gamma 函数关系两种方法', a: '$\\frac{1}{12}$', dist: ['$\\frac16$', '$\\frac{1}{24}$', '$\\frac14$'], sol: '方法一：直接计算 $\\int_0^1x(1-x)^2dx=\\frac1{12}$；方法二：$B(2,3)=\\frac{\\Gamma(2)\\Gamma(3)}{\\Gamma(5)}=\\frac{2}{24}=\\frac1{12}$。' },
      { topic: '概率积分的两种算法', q: '计算 $\\int_0^{+\\infty}e^{-x^2}dx$，分别用 Gamma 函数与极坐标两种方法', a: '$\\frac{\\sqrt\\pi}{2}$', dist: ['$\\sqrt\\pi$', '$\\frac12$', '$\\frac{\\sqrt{2\\pi}}{2}$'], sol: '方法一：令 $t=x^2$ 化为 $\\frac12\\Gamma\\left(\\frac12\\right)=\\frac{\\sqrt\\pi}{2}$；方法二：用 $\\left(\\int_0^{+\\infty}e^{-x^2}dx\\right)^2=\\iint e^{-(x^2+y^2)}dxdy=\\frac\\pi4$，开方得 $\\frac{\\sqrt\\pi}{2}$。' },
      { topic: '指数三角积分的两种算法', q: '求 $I(y)=\\int_0^{+\\infty}e^{-xy}\\sin x\\,dx$（$y>0$），分别用分部积分与建立微分方程两种方法', a: '$\\frac{1}{1+y^2}$', dist: ['$\\frac{y}{1+y^2}$', '$\\frac{1}{1-y^2}$', '$\\frac{1}{y}$'], sol: '方法一：两次分部积分得 $I=\\frac{1}{1+y^2}$；方法二：由 $I^{\\prime}(y)=-\\int_0^{+\\infty}xe^{-xy}\\sin x\\,dx=-\\frac{1}{1+y^2}$ 的伴随关系解出 $I=\\frac{1}{1+y^2}$。' }
    ]
  }
};
