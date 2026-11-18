# -*- coding: utf-8 -*-
import json, os, re, subprocess, urllib.request, urllib.error
root = r'D:\学习\大一\错题本网页'
out = r'D:\dsh-tmp\release'
TAG = 'v2026.11.18'
STATIC = 'sike-cuotiben-static-v2026.11.18.zip'
url = subprocess.run(['git', '-C', root, 'remote', 'get-url', 'origin'], capture_output=True, text=True, encoding='utf-8').stdout.strip()
m = re.search(r'https://([^@]+)@github\.com/([^/]+)/(.+?)(?:\.git)?$', url)
token, owner, repo = m.groups()
if token.startswith('x-access-token:'):
    token = token.split(':', 1)[1]
base = 'https://api.github.com/repos/%s/%s' % (owner, repo)
headers = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'User-Agent': 'dsh-release'}
def api(path, method='GET', data=None, ctype='application/json'):
    body = None
    if data is not None:
        body = data if isinstance(data, bytes) else json.dumps(data).encode('utf-8')
    h = dict(headers)
    if body:
        h['Content-Type'] = ctype
    req = urllib.request.Request(base + path, data=body, method=method, headers=h)
    with urllib.request.urlopen(req, timeout=300) as r:
        raw = r.read()
        return json.loads(raw.decode('utf-8')) if raw else {}
body = r'''## 四科错题本 v2026.11.18 · 计划顺序与智能读题

**9 项 · 9 组**

### 本轮更新
- 计划顺序：期末复习章节筛选的小节分组按教材章节顺序（第一→第六）生成，不再按点击顺序倒序；即使先点第四章、再点第一章，分组仍按第一、第二…排列。期末模拟卷标题里的章节也按同一顺序拼接。手机 ≤560px 时「章节 / 已选 N 章」独占一行，全部与各章按钮从下一行开始。
- 排版对齐：首页工作台说明在桌面保持单行；功能条去掉重复分隔点并收紧页脚间距；规范速览统一 01/02/05/20–32；笔记、题库、模板、错题说明保护关键短语；模板筛选桌面 560px 单行，手机计数回到左侧、清空按钮留在右侧；笔记库页头在桌面一行、手机两行；统计口径统一「最近 30 天」；期末计划科目说明不再说模拟卷。
- 读题排程：AI 个性化计划会读取本机错题库、题库、模板库、模拟卷与已交卷模拟考，按所选章节与小节筛出真实错题、错因、模拟卷题号和模拟考错答，优先薄弱章节；个人错题可直接作为当天例题并标注来源，每天显示「为什么这样排」。题号与出处仍回到本地校验，缺失时回退。
- 公式细节：规范页「变式（自测）」的矩阵行分隔符后带空格时，不再被替换成细空格而在每行首项前多出一个分号；details/summary 里的 sum、det、dim 等算子词不再被包成公式，折叠块可以正常开合。qa:formulas 新增矩阵行首与 summary 标签两项永久检查。
- 留白网格：期末计划卡的标题、科目、章节、智能排程、阶段与每日安排统一到同一左内距，带边框的智能排程、复习窗口与阶段卡不再贴着面板边框；手机科目改 2×2、章节改 2 列等宽 44px，出卷页章节恢复 20px 内距，360 窄屏笔记搜索独占一行，期末复习说明自动平衡行宽，不再只剩两三个字的末行。qa:polish 新增 360 宽度并检查内距、等宽、计数贴边与说明换行。
- 字体层级：首页工作台说明末句不再被标签选择器误改成 10px 橙色等宽字，整句字体、字号与字色和正文一致；知识点出处改用中性灰，不占用章节强调色，知识点标题用墨色加粗；首页问候标题由 600 加粗到 700。qa:polish 新增字色、字号、字重与知识点颜色检查。
- 用时口径：复习计划「每天怎么用」按总分钟拆分，约 60 分钟 = 10 分钟口述 + 40 分钟例题 + 10 分钟对照，不再超过计划时长；标题写明总分钟数，qa:polish 校验各段之和。
- 记忆用法：574 个知识点逐条重写记忆钩子与考场用法，钩子压缩该点的定义、判据或公式，考场用法写明遇到什么题先做什么、最后检查什么；「可去间断点」「跳跃间断点」「第二类间断点」不再共用同一句。知识点卡拆成「记忆」「考场」两行，qa:memory 校验 574 点全覆盖、两类句子各自唯一、公式定界符成对、无 HTML 与替换字符。
- 防复发：qa:final 先点第二章再点第一章，断言小节分组仍按章节顺序，并检查手机标签与按钮分行；qa:polish 覆盖 360/390/768/1440 的计划内距、章节/科目等宽与三端排版；qa:formulas 检查矩阵行首与 summary 标签；qa:memory 检查 574 个知识点的记忆与考场用法；146 项回归测试与 CI 全部门禁。

### 验证
- 回归测试 146 项通过；严格题库 QA 9651 唯一、problems 0 / warnings 0；全库渲染审计、104223 字段数学语言审计与 574 点记忆/考场用法审计 0 失败。
- 公式门禁 14 个面、模拟卷编辑卡 18 个宽度、筛选栏 22 个宽度、期末复习四科三端、8 视口真实浏览器均 0 failures；无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.18-12a2442a；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md 与 docs/RELEASE.md。
'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.18 · 计划顺序与智能读题', 'body': body, 'draft': False, 'prerelease': False})
    print('created release', rel['id'])
for a in rel.get('assets', []):
    if a['name'] in ('source.zip', 'SHA256SUMS', STATIC):
        api('/releases/assets/%d' % a['id'], method='DELETE')
        print('deleted', a['name'])
for name in ['source.zip', STATIC, 'SHA256SUMS']:
    p = os.path.join(out, name)
    req = urllib.request.Request('https://uploads.github.com/repos/%s/%s/releases/%d/assets?name=%s' % (owner, repo, rel['id'], name), data=open(p, 'rb').read(), method='POST', headers=dict(headers, **{'Content-Type': 'application/octet-stream'}))
    with urllib.request.urlopen(req, timeout=600) as r:
        a = json.loads(r.read().decode('utf-8'))
    print('uploaded', a['name'], a['size'])
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.18 · 计划顺序与智能读题', 'target_commitish': 'main'})
print('body updated')
