# -*- coding: utf-8 -*-
import json, os, re, subprocess, urllib.request, urllib.error
root = r'D:\学习\大一\错题本网页'
out = r'D:\dsh-tmp\release'
TAG = 'v2026.11.17'
STATIC = 'sike-cuotiben-static-v2026.11.17.zip'
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
body = r'''四科错题本 v2026.11.17 · 复习计划与排版收口

## 2026-11-17 · 复习计划与排版收口

### 本轮更新
- 期末复习计划页新增「用 AI 个性化」：读取用户已配置的模型，按所选章节、考试日期与时长生成逐日学习单元；每个单元继续显示本地 574 个知识点中的具体条目、教材章节与 § 小节出处、答题模板、完整例题（考试标准解答 / 答题模板 / 详细解析 / 易错点）以及记忆与考场用法。
- 本地校验：AI 返回的章节、知识点、模板 id 与题号逐条回到本地题库校验；编造章节/题号、HTML 标签、未闭合 $ 与非法 JSON 会被丢弃或回退，缺失章节用本地模块补齐。未配置、超时或无法解析时保留本地计划并显示原因；AI 计划写入本机 finalExam.aiPlan，可一键恢复本地排程。
- 计划性能：章节模块与每日详情改为按需渲染，数学分析 23 章切换从约 12 秒降到 1 秒内；移动端每日详情网格改为 minmax(0,1fr)，长公式只在自身容器滚动，不再撑破卡片。
- 复习计划 / 出模拟卷 / 进行模拟考三个入口保持分开；复习计划仍逐日显示知识点、模板、例题与记忆法，出卷页可按章节筛选题库组卷。
- 排版收口：题库手机折叠筛选不再留空卡，模板筛选计数回到栏内并加大清空按钮内距，笔记搜索与页签左对齐，总览手机四个操作改为 2×2，设置用户名输入填满整行；章节提示按科目实际 10 / 23 / 6 / 16 章生成，欢迎页补上 AI 个性化复习计划。新增 qa:polish 在 390 / 768 / 1440 检查按钮文字、卡片内距、折叠筛选、搜索对齐与弹窗溢出。
- 回归测试 141 项；qa:final 在 390 / 768 / 1440 与四科检查 AI 按钮、计划卡片、模板、例题展开、每日详情与横向溢出。

### 验证
- 回归测试 141 项通过；严格题库 QA 9651 唯一、problems 0 / warnings 0；全库渲染审计与 104223 字段数学语言审计 0 失败。
- 公式门禁 14 个面、模拟卷编辑卡 18 个宽度、筛选栏 22 个宽度、期末复习四科三端、8 视口真实浏览器均 0 failures；无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.17-99acc3cc；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md 与 docs/RELEASE.md。
'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.17 · 复习计划与排版收口', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.17 · AI 个性化复习计划', 'target_commitish': 'main'})
print('body updated')
