# -*- coding: utf-8 -*-
import json, os, re, subprocess, urllib.request, urllib.error
root = r'D:\学习\大一\错题本网页'
out = r'D:\dsh-tmp\release'
TAG = 'v2026.11.16'
STATIC = 'sike-cuotiben-static-v2026.11.16.zip'
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
body = r'''四科错题本 v2026.11.16 · 期末复习按章节组卷与智能计划

## 本轮更新
- 公式渲染根因修复：矩阵行分隔符 \ 后接变量 n（如 \n-1）不再被误判成转义换行；跨行 $$ 块先整体保护，避免中间行被补 $ 切成三段；HTML 标签正则收窄，数学里的 < 不再吞掉后续公式；表格保护改为只跳过真正以 | 收尾的整行，|A_k| 这类绝对值恢复成公式。
- 数学语言规范化：\tag{...} 保留编号并排成公式末尾；liminf / limsup 归一化后不再被拆成 lim inf；裸 LaTeX 识别加入 < 与 >，a_N>a-ε 整体进公式；全库 9651 题的 question / answer / standardSolution / detailedAnalysis / points / pitfalls / tags 逐项渲染审计 0 失败。
- 知识点搜索：摘录不再截断在 $...$ 或 $$...$$ 中间，也不再把 \begin{vmatrix} 截成半截源码；截断点回退到完整公式边界，去掉尾部残缺命令与标点后再加省略号。
- 知识点教材表：手机端改成带列名的堆叠卡片，四列不再只露前三列；取消面板内 56dvh 的嵌套滚动，表格随整页滚动完整显示。
- 笔记卡片摘要改用纯文本，不再露出 $ 与 \frac 源码。
- 模拟考标题日期不再断成 2026- / 11-16，手机端日期独占一行，桌面与平板保持整行。
- qa:formulas 扩到 12 个面：总览、错题、模板、题库、规范、期末、错题详情、题库手机、知识点、知识点手机、模拟卷与标准题库模拟考；任意 $、LaTeX 命令、裸上下标、U+FFFD、math-raw / temml-error / merror、表格与公式越界全部报错。
- 新增 qa:render 全库渲染审计并接入 npm run check；矩阵渲染、考试标题日期、知识点摘录、表格列名与公式基线写入回归测试。
- 模拟卷编辑卡 Grid、题库筛选栏 Grid、18 / 22 宽度跨端门禁继续保留；本机 IndexedDB 主存与题库分片不变。

- 期末复习：出模拟卷界面按章节筛选题库，勾选后加入当前卷或用所选新建 100 分卷；复习计划按考试日期与所选章节列出每章知识点、全部答题模板（步骤/易错点）、2 道例题（考试标准解答/答题模板/详细解析/易错点），每日计划轮换模板与例题；新增 qa:final 覆盖四科、390/768/1440。

## 五项遗留风险收口
- 解析几何 21 道证明题答案补成具体结论；22 组跨题型同题干拆成不同变式；525 处「答案：」尾注与权威 answer 对齐。
- AI 上游改为解析一次后固定 IP 请求，关闭 DNS rebinding TOCTOU；API Key 改 AES-GCM 存 IndexedDB，localStorage 不再留明文。
- 新增 qa:bank-consistency、ai-http 与 ai-secret 回归；服务器先校验不安全 AI 地址再加载技能，qa:sync 复制 lib/。

## 验证
- 回归测试 129 项通过；严格题库 QA 9651 唯一；全库渲染审计 0 失败；站点一致性 2046 / 3523 / 1199 / 2883。
- 公式门禁 12 个面全部 0；模拟卷编辑卡 18 个宽度、筛选栏 22 个宽度、8 视口真实浏览器均 0 failures；无障碍、性能、拆包与尺寸门禁通过；期末复习四科 10/23/6/16 章、390/768/1440 无横向溢出。
- Pages 线上 BUILD_ID 2026.11.16-848764e1（以本次 tag 提交构建）。

完整记录见仓库 docs/VERIFICATION.md 与 docs/RELEASE.md。
'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.16 · 期末复习按章节组卷与智能计划', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.16 · 期末复习按章节组卷与智能计划', 'target_commitish': 'main'})
print('body updated')
