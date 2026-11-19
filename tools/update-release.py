# -*- coding: utf-8 -*-
import json, os, re, subprocess, urllib.request, urllib.error
root = r'D:\学习\大一\错题本网页'
out = r'D:\dsh-tmp\release'
TAG = 'v2026.11.19'
STATIC = 'sike-cuotiben-static-v2026.11.19.zip'
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
body = r'''## 四科错题本 v2026.11.19 · 排程状态收口

**2 项 · 2 组**

AI 排程完成后按钮改为「AI 已排程」，不再和「恢复本地排程」同时显示；成功与失败都先结束忙碌状态再刷新。148 项测试通过。

### 本轮更新
- 排程状态：AI 排程成功后先清除忙碌状态再重绘，按钮显示「AI 已排程」；失败时同样先结束「AI 正在排程…」再显示错误。排程进行中隐藏「恢复本地排程」，不再同时出现两个互相矛盾的状态。
- 防复发：回归测试直接渲染 AI 计划完成态与进行态：完成态必须含「AI 已排程」、不含「正在排程」并保留恢复按钮，排程按钮作为状态禁用；进行态必须只含「正在排程」且不显示恢复按钮。测试同时锁定成功与失败路径的 busy→render 顺序，148 项测试与现有门禁全部执行。

### 验证
- 回归测试 148 项通过；严格题库 QA 9651 唯一、problems 0 / warnings 0；全库渲染审计、104223 字段数学语言审计与 574 点记忆/考场用法审计 0 失败。
- 公式门禁 14 个面、模拟卷编辑卡 18 个宽度、筛选栏 22 个宽度、期末复习四科三端、8 视口真实浏览器均 0 failures；无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.19-46896243；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md 与 docs/RELEASE.md。
'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.19 · 排程状态收口', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.19 · 排程状态收口', 'target_commitish': 'main'})
print('body updated')
