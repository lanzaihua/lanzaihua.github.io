# -*- coding: utf-8 -*-
import json, os, re, subprocess, urllib.request
root = r'D:\学习\大一\错题本网页'
out = r'D:\dsh-tmp\release'
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
rel = api('/releases/tags/v2026.11.15')
for a in rel['assets']:
    if a['name'] in ('source.zip', 'SHA256SUMS', 'sike-cuotiben-static-v2026.11.15.zip'):
        api('/releases/assets/%d' % a['id'], method='DELETE')
        print('deleted', a['name'])
for name in ['source.zip', 'sike-cuotiben-static-v2026.11.15.zip', 'SHA256SUMS']:
    p = os.path.join(out, name)
    req = urllib.request.Request('https://uploads.github.com/repos/%s/%s/releases/%d/assets?name=%s' % (owner, repo, rel['id'], name), data=open(p, 'rb').read(), method='POST', headers=dict(headers, **{'Content-Type': 'application/octet-stream'}))
    with urllib.request.urlopen(req, timeout=600) as r:
        a = json.loads(r.read().decode('utf-8'))
    print('uploaded', a['name'], a['size'])
body = '''四科错题本 v2026.11.15 · 题库扩充、本机存储扩容与编辑卡修复

## 本轮更新
- 题库 9651 题：高等代数 2046、数学分析 3523、解析几何 1199、西方经济学 2883；新增《高等代数习题精选精解》192 题、《数学分析上作业集》69 题与 ChatGPT 数学题 1 题。
- 查重与复核：全库归一化题干重复 0、id 唯一；严格 QA、站点一致性、112 项回归全部通过；修正 9 道客观题答案字母、3 处反斜杠转义损坏与多处公式定界符断行。
- 本机存储扩容：错题与笔记改为 IndexedDB 主存，容量按浏览器配额动态计算；实测配额 10.77GB、可用 8.6GB，不再受 4MB 限制。设置页显示实时容量并可申请持久化；大状态不再在内存保留第二份副本，避免 OOM；6MB 状态写入与刷新恢复实测通过；同步上限 64MB。
- 题库分片：Pages 版拆为 bank-index.json + 四科分片，按科目写入 IndexedDB，分片失败自动回退单文件；首页 3.0MB。
- DOCX / PDF：本机 Word 与 WPS 各导出 5 页 PDF 逐页复核；修复 mid、deg 渲染、答案字母重复与“解：”后空行。
- 模拟卷编辑卡：头部改为显式 CSS Grid，手机标题整行、时长与题数一行、六个按钮 auto-fit；按钮 height:auto 不再裁字。新增 qa:paper 在 320–1440 共 18 个宽度断言标题不截断、按钮文字不越界、间距与头部高度正常，CI 每次构建自动运行；删除 58/60 两份重复实现。
- 题库筛选栏：桌面从 inline 流改为 Grid + 可换行字段区（1301px 起四列、其余 2–3 列），手机两列折叠且清空按钮独占整行；新增 qa:filters 在 320–1920 共 22 个宽度断言间距、重叠、越界、文字裁切与 40px 触控高度，CI 每次构建自动运行。
- CHANGELOG 校验：仓库 CHANGELOG.md 最新块必须与网页更新记录的日期、标题、项数与组数一致，防止两处文档漂移。
- 发布门禁：verify:release 校验工作区、HEAD、tag、Release 资产、Pages 提交与线上 BUILD_ID；Release 发布时自动运行。

## 验证
- 回归测试 112 项通过；严格题库 QA（9651 唯一）；站点一致性 2046/3523/1199/2883。
- 8 视口真实浏览器 failures 0；qa:paper 18 个宽度、qa:filters 22 个宽度均 0 failures；公式、无障碍、性能、拆包门禁通过。
- Pages 构建 81b8f7d，线上 BUILD_ID 2026.11.15-ef0f7981。

完整记录见仓库 docs/VERIFICATION.md 与 docs/RELEASE.md。
'''
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.15 · 题库扩充、存储扩容与界面修复', 'target_commitish': 'main'})
print('body updated')
