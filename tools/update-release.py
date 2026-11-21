# -*- coding: utf-8 -*-
import json, os, re, subprocess, urllib.request, urllib.error
root = r'D:\学习\大一\错题本网页'
out = r'D:\dsh-tmp\release'
TAG = 'v2026.11.21'
STATIC = 'sike-cuotiben-static-v2026.11.21.zip'
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
body = r'''## 四科错题本 v2026.11.21 · 题库补录与导出修复

**14 项 · 14 组**

题库扩至 11921 题：补入吉米多维奇第 1–2 卷 943 道、高代教材 26 道、数分第 18–23 章 239 道与习题精选 157 道；并完成 3.3 的队列、口径、备份、通知与公式收口。154 项测试通过。

### 本轮更新
- 解析几何补全：补入 42 道，解析几何由 1199 增至 1241。
- 西经真题：160 道教材题改为真实题干，并新增 105 道考研真题，西方经济学由 2883 增至 2988。
- 竞赛录入：全国大学生数学竞赛 8 份扫描件 OCR 后录入 77 道，高等代数 29 道、数学分析 48 道。
- 教材补录：数学分析教材第 1–23 章累计 920 道；本批补高等代数教材 26 道、吉米多维奇第 1–2 卷 943 道；重复、图缺或公式无法还原的题目逐条记入清单。
- 首页队列：今日待复习、今日已完成、逾期、今日完成度改为按复习节点计算，焦点跳最早到期错题；手机端工作台排在科目之前。
- 数据口径：新增统一资源清单，内置题库 11921、内置模板 118，自建与导入按唯一 ID 计入可用总量；首页、统计、设置共用同一口径。
- 数据安全：导出后记录上次备份时间，设置页显示备份状态、当前大小与结构完整性；重复 ID 只提示不删除。
- 通知分类：全部、学习提醒、操作记录、系统通知四类筛选与真实计数。
- AI 状态：请求中、最近成功、超时、失败在设置页可见；失败只影响当前请求。
- 视觉精修：首页统计卡与四科入口副标签，统计页四卡两列，通知筛选 360–1440 不溢出。
- 公式字号：行内分式从 MathML 默认 0.7 倍调到 0.92 倍，dfrac 不再降级；矩阵与标点尾串垂直居中；qa:formulas 增两项检查。
- 习题补录：《高等代数习题精选精解》第 1–10 章继续补录 157 道未入库且题面可还原的题，选择题保留四选项与答案，主观题补标准解答与详细解析。
- 导出修复：DOCX 导出修复 xi、zeta、eta、kappa、chi 与 geqslant/leqslant 映射，Word 与 WPS 重导出 7 页逐页检查，不再残留英文命令。
- 防复发：qa:polish 新增首页复习队列、手机顺序、统计口径、通知四分类检查；154 项回归与 CI 全部门禁通过。

### 验证
- 回归测试 154 项通过；严格题库 QA 11921 唯一、problems 0 / warnings 0；教材课后 1873、习题集 1698。
- 全库渲染审计 11921 题 0 失败；数学语言审计 0；574 点记忆/考场用法审计 0 失败。
- 公式、模拟卷、筛选、期末复习、搜索、8 视口浏览器、无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.21-7f893163；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md、docs/audit/WARM-ACADEMIC-3.3-AUDIT.md 与 docs/reports/。'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.21 · 题库补录与导出修复', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.21 · 题库补录与导出修复', 'target_commitish': 'main'})
print('body updated')