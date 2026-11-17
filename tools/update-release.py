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
body = r'''## 四科错题本 v2026.11.18 · 排版与对齐细化

**2 项 · 2 组**

### 本轮更新
- 排版对齐：首页工作台说明在桌面保持单行，末句用不可拆分短语保护；功能条去掉重复分隔点，并把功能条到页脚的 62px 空白收紧到 36px。规范速览顺序统一为 01 套写法、02 套编号、05 必填字段、20–32 复习节点。笔记、题库、模板、错题与总览说明分别保护「知识笔记」「扫描」「标准解答」「易错点」「先自己写」「错题条目」等短语，三端不再把词组拆到两行。
- 模板与统计：模板筛选在桌面收成 560px 单行，手机计数与清空按钮排在同一行；统计口径统一为「最近 30 天」，与「近 30 天复习」卡片一致；期末计划科目说明改为「复习计划只使用当前科目的章节与知识点」，不再沿用模拟卷文案。
- 防复发：qa:polish 新增首页工作台行数、功能条与页脚间距、规范速览顺序、统计口径、笔记拆词、模板计数排布与筛选卡宽度检查；在 18 个宽度、390 / 768 / 1440 的真实浏览器中执行，并接入 npm run qa:polish 与 CI。
- 回归测试 143 项；更新记录新增 2026-11-18 独立一块，11-17 及更早历史折叠，Release 每个日期只保留一条。

### 验证
- 回归测试 143 项通过；严格题库 QA 9651 唯一、problems 0 / warnings 0；全库渲染审计与 104223 字段数学语言审计 0 失败。
- 公式门禁 14 个面、模拟卷编辑卡 18 个宽度、筛选栏 22 个宽度、期末复习四科三端、8 视口真实浏览器均 0 failures；无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.18-39c5750a；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md 与 docs/RELEASE.md。
'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.18 · 排版与对齐细化', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.18 · 排版与对齐细化', 'target_commitish': 'main'})
print('body updated')
