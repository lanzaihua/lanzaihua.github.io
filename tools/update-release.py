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
body = r'''## 四科错题本 v2026.11.18 · 计划顺序与排版

**3 项 · 3 组**

### 本轮更新
- 计划顺序：期末复习章节筛选的小节分组按教材章节顺序（第一→第六）生成，不再按点击顺序倒序；即使先点第四章、再点第一章，分组仍按第一、第二…排列。期末模拟卷标题里的章节也按同一顺序拼接。手机 ≤560px 时「章节 / 已选 N 章」独占一行，全部与各章按钮从下一行开始。
- 排版对齐：首页工作台说明在桌面保持单行；功能条去掉重复分隔点并收紧页脚间距；规范速览统一 01/02/05/20–32；笔记、题库、模板、错题说明保护关键短语；模板筛选桌面 560px 单行，手机计数回到左侧、清空按钮留在右侧；笔记库页头压成一行；统计口径统一「最近 30 天」；期末计划科目说明不再说模拟卷。
- 防复发：qa:final 先点第二章再点第一章，断言小节分组仍按章节顺序，并检查手机标签与按钮分行；qa:polish 覆盖 18 个宽度与三端排版；143 项回归测试与 CI 全部门禁。
- 回归测试 143 项；更新记录新增 2026-11-18 独立一块，11-17 及更早历史折叠，Release 每个日期只保留一条。

### 验证
- 回归测试 143 项通过；严格题库 QA 9651 唯一、problems 0 / warnings 0；全库渲染审计与 104223 字段数学语言审计 0 失败。
- 公式门禁 14 个面、模拟卷编辑卡 18 个宽度、筛选栏 22 个宽度、期末复习四科三端、8 视口真实浏览器均 0 failures；无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.18-4d06493f；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md 与 docs/RELEASE.md。
'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.18 · 计划顺序与排版', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.18 · 计划顺序与排版', 'target_commitish': 'main'})
print('body updated')
