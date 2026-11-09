/* Chapter hint classifier, loaded before core state initialization. */
var CHAPTER_HINTS = {
  gaodai: [
    ['多项式', '因式', '最大公因式', '互素', '不可约', '艾森斯坦', '重根', '重因式', '有理根', '对称多项式', '带余除法', '整除', '本原多项式', '辗转相除'],
    ['行列式', '余子式', '代数余子式', '克拉默', '范德蒙', '拉普拉斯', '逆序数', '奇排列', '偶排列', '行列式展开'],
    ['线性方程组', '消元', '增广矩阵', '基础解系', '有解', '无解', '唯一解', '无穷多解', '齐次方程', '非齐次方程', '结式', '解向量', '通解'],
    ['矩阵', '逆矩阵', '初等变换', '初等矩阵', '分块矩阵', '等价标准形', '伴随矩阵', '转置', '对称矩阵', '矩阵的秩', '矩阵乘法'],
    ['二次型', '合同', '惯性', '正定', '半正定', '负定', '顺序主子式', '配方法', '标准形', '规范形', '惯性指数'],
    ['线性空间', '子空间', '维数', '基', '坐标', '直和', '同构', '生成元', '线性相关', '线性无关', '过渡矩阵'],
    ['线性变换', '核', '值域', '特征值', '特征向量', '对角化', '不变子空间', '最小多项式', '相似', '特征多项式'],
    ['λ-矩阵', 'λ矩阵', '不变因子', '行列式因子', '初等因子', '若尔当', 'Jordan', '有理标准形', 'Smith标准形'],
    ['欧几里得空间', '内积', '正交', '施密特', '正交补', '正交变换', '实对称', '酉空间', '最小二乘', '标准正交基'],
    ['双线性函数', '双线性', '对偶空间', '对偶', '辛空间', '线性函数', '度量矩阵', '拉格朗日子空间', '交错形式']
  ],
  shufen: [
    ['实数', '确界', '绝对值', '初等函数', '有界集', '上确界', '下确界'],
    ['数列', '数列极限', '单调有界', '柯西准则', '收敛数列', '子列', 'n→∞', 'n趋于无穷', 'n趋近'],
    ['函数极限', 'ε-δ', 'εδ', '无穷小', '等价无穷小', '两个重要极限', '归结原则', '海涅', 'x→', 'x趋于', 'x趋近'],
    ['连续', '间断点', '一致连续', '最值定理', '介值定理', '闭区间连续'],
    ['导数定义', '求导', '高阶导数', '隐函数求导', '参数方程求导', '微分形式不变'],
    ['中值定理', '罗尔', '拉格朗日', '柯西中值', '泰勒公式', '洛必达', '单调性', '极值', '凸性', '拐点', '曲率'],
    ['完备性', '区间套', '聚点', '有限覆盖', '上下极限', '确界原理', '基本定理'],
    ['不定积分', '原函数', '换元积分', '分部积分', '有理函数积分', '积分表'],
    ['定积分', '黎曼和', '达布和', '可积', '牛顿-莱布尼茨', '微积分基本定理', '积分中值'],
    ['定积分的应用', '面积', '体积', '弧长', '旋转体', '微元法', '近似计算'],
    ['反常积分', '瑕积分', '无穷积分', '比较判别', '狄利克雷', '阿贝尔', '绝对收敛', '条件收敛'],
    ['数项级数', '正项级数', '比值判别', '根式判别', '拉贝', '莱布尼茨', '级数收敛'],
    ['函数列', '函数项级数', '一致收敛', '魏尔斯特拉斯', 'M判别法', '逐项求导', '逐项积分'],
    ['幂级数', '收敛半径', '阿贝尔定理', '泰勒级数', '欧拉公式', '收敛区间'],
    ['傅里叶', '三角级数', '正弦级数', '余弦级数', '傅里叶系数'],
    ['多元函数', '重极限', '累次极限', '有界闭域', '二元函数', '多元极限'],
    ['偏导数', '全微分', '可微', '方向导数', '梯度', '海赛', '多元极值', '偏导连续'],
    ['隐函数', '雅可比', '反函数', '条件极值', '拉格朗日乘数', '切平面', '法线'],
    ['含参量积分', '积分号下求导', '一致收敛', 'Γ函数', 'B函数', '欧拉积分', '含参积分'],
    ['曲线积分', '第一型曲线积分', '第二型曲线积分', '对弧长', '对坐标'],
    ['重积分', '二重积分', '三重积分', '累次积分', '变量变换', '雅可比行列式', '格林公式', '极坐标', '球坐标'],
    ['曲面积分', '第一型曲面积分', '第二型曲面积分', '高斯公式', '斯托克斯', '通量', '散度', '旋度'],
    ['向量函数', 'n维欧氏空间', '反函数定理', '隐函数定理', '压缩映射', '向量值函数']
  ],
  jieji: [
    ['向量', '数量积', '向量积', '混合积', '坐标', '标架', '射影', '方向余弦', '共线', '共面'],
    ['轨迹', '曲线方程', '曲面方程', '参数方程', '柱坐标', '球坐标', '射影柱面', '空间曲线'],
    ['平面', '空间直线', '法向量', '方向向量', '点面距离', '点到直线', '异面直线', '公垂线', '平面束', '两平面'],
    ['柱面', '锥面', '旋转曲面', '椭球面', '双曲面', '抛物面', '直母线', '母线', '准线'],
    ['二次曲线', '不变量', '主方向', '特征根', '渐近线', '中心', '直径', '坐标变换', '化简', '半不变量'],
    ['二次曲面', '不变量', '主径面', '切平面', '径面', '奇向', '特征根', '二次曲面的分类']
  ],
  xijing: [
    ['需求', '供给', '均衡价格', '弹性', '税负', '价格上限', '价格下限', '供求定理', '需求价格弹性'],
    ['消费者', '效用', '无差异曲线', '预算线', '消费者均衡', '替代效应', '收入效应', '吉芬', '边际效用'],
    ['生产函数', '边际产量', '平均产量', '等产量', '等成本', '成本', 'MC', 'AC', 'AVC', '规模报酬', '边际技术替代率'],
    ['完全竞争', '短期均衡', '长期均衡', '零利润', '停止营业', '完全竞争市场'],
    ['垄断', '垄断竞争', '寡头', '古诺', '纳什', '博弈', '价格歧视', '无谓损失', '斯塔克尔伯格', '斯威齐', '卡特尔'],
    ['生产要素', '劳动供给', '资本', '地租', '利息', 'VMP', 'MRP', 'MFC', '后弯劳动供给'],
    ['一般均衡', '帕累托', '埃奇沃思', '福利经济学', '瓦尔拉斯', '契约曲线', '生产可能性'],
    ['市场失灵', '外部性', '公共物品', '信息不对称', '逆向选择', '道德风险', '庇古', '科斯', '基尼', '洛伦兹'],
    ['GDP', 'GNP', 'CPI', '失业率', '名义GDP', '实际GDP', '国内生产总值', '价格指数'],
    ['收入-支出', '消费函数', '乘数', '投资乘数', '政府购买乘数', '税收乘数', '平衡预算乘数', '均衡产出'],
    ['IS-LM', 'IS曲线', 'LM曲线', '挤出效应', '流动性陷阱', '利率', '货币市场'],
    ['AD-AS', '总需求', '总供给', '需求冲击', '供给冲击', '滞胀', 'AD曲线', 'AS曲线'],
    ['失业', '通货膨胀', '菲利普斯', '经济周期', '奥肯定律', '自然失业率', '通胀'],
    ['汇率', '国际收支', '蒙代尔', '弗莱明', 'BP曲线', 'J曲线', '固定汇率', '浮动汇率', '开放经济'],
    ['财政政策', '货币政策', '自动稳定器', '政策协调', '财政赤字', '公开市场操作', '再贴现', '存款准备金'],
    ['索洛', '经济增长', '储蓄率', '黄金律', '内生增长', '增长核算', 'TFP', '人均资本', '稳态']
  ]
};

function chapterHintText(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  var parts = [];
  ['title', 'summary', 'question', 'standardSolution', 'detailedAnalysis', 'answer', 'templateTitle', 'errorNote', 'chapterCode', 'section'].forEach(function (key) {
    if (item[key]) parts.push(String(item[key]));
  });
  if (Array.isArray(item.points)) parts.push(item.points.join(' '));
  if (Array.isArray(item.errorTypes)) parts.push(item.errorTypes.join(' '));
  if (Array.isArray(item.blocks)) parts.push(item.blocks.map(function (b) { return String((b && b.title) || '') + ' ' + String((b && b.md) || ''); }).join(' '));
  if (Array.isArray(item.variants)) parts.push(item.variants.map(function (v) { return String((v && v.q) || '') + ' ' + String((v && v.a) || ''); }).join(' '));
  return parts.join(' ').replace(/\s+/g, ' ');
}

function chapterHintCount(text, keyword) {
  var hay = String(text || '').toLowerCase();
  var kw = String(keyword || '').toLowerCase();
  if (!kw) return 0;
  if (/^[a-z0-9][a-z0-9-]{0,7}$/i.test(kw)) {
    var safe = kw.replace(/[.*+?^$()|\[\]\\]/g, '\\$&');
    var re = new RegExp('(^|[^a-z0-9])' + safe + '([^a-z0-9]|$)', 'g');
    var m = hay.match(re);
    return m ? m.length : 0;
  }
  var count = 0, at = 0;
  while ((at = hay.indexOf(kw, at)) >= 0) { count++; at += kw.length; }
  return count;
}

function chapterFromHintCode(subjectId, item) {
  var list = chapterListFor(subjectId);
  var raw = String((item && (item.templateId || item.chapterCode || item.section)) || '');
  var m = raw.match(/T[-_ ]?(\d{1,2})[-_]/i) || raw.match(/^(?:ch)?\s*(\d{1,2})(?:[.\-]|$)/i);
  if (!m) return '';
  var n = parseInt(m[1], 10);
  return n >= 1 && n <= list.length ? list[n - 1] : '';
}

function classifyChapterFromText(subjectId, text, allowed) {
  var list = chapterListFor(subjectId);
  var hints = CHAPTER_HINTS[subjectId] || [];
  if (!list.length) return '';
  var hay = String(text || '');
  var bestScore = 0, bestAt = -1;
  for (var i = 0; i < list.length; i++) {
    if (Array.isArray(allowed) && allowed.length && allowed.indexOf(list[i]) < 0) continue;
    var score = 0;
    (hints[i] || []).forEach(function (kw) {
      var n = chapterHintCount(hay, kw);
      if (n) score += Math.min(3, n) * (String(kw).length >= 4 ? 3 : String(kw).length >= 3 ? 2 : 1);
    });
    if (score > bestScore) { bestScore = score; bestAt = i; }
  }
  if (bestAt >= 0 && bestScore >= 2) return list[bestAt];
  if (Array.isArray(allowed) && allowed.length === 1) return allowed[0];
  return '';
}

function smartChapterFor(subjectId, item, allowed) {
  if (typeof item === 'string') item = { question: item };
  if (!item || typeof item !== 'object') return '';
  var direct = canonicalChapterFor(subjectId, item.chapter || '');
  if (direct && direct !== '未分章' && (!Array.isArray(allowed) || !allowed.length || allowed.indexOf(direct) >= 0)) return direct;
  var byCode = chapterFromHintCode(subjectId, item);
  if (byCode && (!Array.isArray(allowed) || !allowed.length || allowed.indexOf(byCode) >= 0)) return byCode;
  var byText = classifyChapterFromText(subjectId, chapterHintText(item), allowed);
  if (byText) return byText;
  return direct || '';
}

