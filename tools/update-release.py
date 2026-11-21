# -*- coding: utf-8 -*-
import json, os, re, subprocess, urllib.request, urllib.error
root = r'D:\学习\大一\错题本网页'
out = r'D:\dsh-tmp\release'
TAG = 'v2026.11.22'
STATIC = 'sike-cuotiben-static-v2026.11.22.zip'
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
body = r'''## 四科错题本 v2026.11.22 · 吉米多维奇四卷补录

**2 项 · 2 组**

题库扩至 13423 题：补入吉米多维奇第 3–4 卷 1502 道，四卷累计 2445 道；DOCX 导出修复 ξ 与 ≥。155 项测试通过。

### 本轮更新
- 四卷补录：吉米多维奇第 3–4 卷按 300dpi 页图逐题核对，补入 1502 道（第 3 卷 915、第 4 卷 587），四卷累计 2445 道；每卷标明卷次与题号，重复题 0，原书印误在解析中注明。
- 防复发：新增 Jimi 卷次回归，1502 条逐条检查科目、题型、来源、标准解答前缀、公式定界符与控制字符；全库 13423 题渲染审计、严格 QA、LaTeX 与数学语言审计保持 0 问题，155 项测试通过。

### 验证
- 回归测试 155 项通过；严格题库 QA 13423 唯一、problems 0 / warnings 0；教材课后 1873、习题集 3200。
- 全库渲染审计 13423 题 0 失败；数学语言审计 149118 字段 0；574 点记忆/考场用法审计 0 失败。
- 公式、模拟卷、筛选、期末复习、搜索、8 视口浏览器、无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.22-7c89ecb9；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md、docs/audit/BANK-INGEST-COVERAGE.md 与 docs/reports/。'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.22 · 吉米多维奇四卷补录', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.22 · 吉米多维奇四卷补录', 'target_commitish': 'main'})
print('body updated')