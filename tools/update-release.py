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
body = r'''## 四科错题本 v2026.11.21 · 题库扩充与竞赛录入

**4 项 · 4 组**

解析几何按技能补入 42 道，西方经济学 160 道教材题改用真实题干并新增 105 道考研真题，全国大学生数学竞赛 77 道经 OCR 入库；题库增至 9875 题（2075 / 3571 / 1241 / 2988），查重、严格 QA、LaTeX 与全库渲染均 0 问题，148 项测试通过。

### 本轮更新
- 解析几何补全：从解析几何 skill 的 325 道章末习题中筛出 26 道未收录题，并把第一章复习与测试的 8 道选择、8 道填空并入题库；解析几何由 1199 增至 1241。选项统一为 key/text，多空填空按综合题收录，题干与解答回查教材小节。
- 西经真题：把 160 道教材课后题的模板壳替换为《西方经济学》第二版课后习题的真实题干、标准解答、详细解析、要点与易错点；再从配套题库录入 105 道考研真题。西方经济学由 2883 增至 2988，模板壳与真实题不再并存。
- 竞赛录入：全国大学生数学竞赛第 1–12 届汇总、第 13 届初赛与补赛、第 15–17 届 A/B 类共 8 份扫描件按 200dpi OCR，去重后录入 77 道：高等代数 29 道、数学分析 48 道；来源逐条标注届次与 A/B 卷，跨卷重复题只留一条。
- 防复发：题库基线锁与严格 QA 覆盖到 9875：id 唯一、归一化题干无重复、客观题四选项、主观题解答以「解：/证明：」开头；全库 LaTeX 与渲染审计、四科公式门禁同步执行。可计算题经过 sympy 或数值复核，证明题记录人工复核要点；148 项回归与 CI 全部门禁通过。

### 验证
- 回归测试 148 项通过；严格题库 QA 9875 唯一、problems 0 / warnings 0；教材课后 927、习题集 598。
- 全库渲染审计 9875 题 0 失败；107436 字段数学语言审计 0；574 点记忆/考场用法审计 0 失败。
- 公式门禁 14 个面、模拟卷编辑卡 18 个宽度、筛选栏 22 个宽度、期末复习四科三端、8 视口真实浏览器、无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.21-f8e08ec1；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md 与 docs/RELEASE.md。
'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.21 · 题库扩充与竞赛录入', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.21 · 题库扩充与竞赛录入', 'target_commitish': 'main'})
print('body updated')
