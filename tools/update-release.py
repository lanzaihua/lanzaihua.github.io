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
body = r'''## 四科错题本 v2026.11.21 · 题库扩充与3.3

**10 项 · 10 组**

题库扩至 9875 题并完成 Warm Academic 3.3 质量升级：首页改用真实复习队列，题库与模板统一内置/自建口径，备份显示时间与完整性，通知支持分类，AI 请求状态可见。153 项测试通过。

### 本轮更新
- 解析几何补全：补入 42 道，解析几何由 1199 增至 1241。
- 西经真题：160 道教材题改为真实题干，并新增 105 道考研真题，西方经济学由 2883 增至 2988。
- 竞赛录入：全国大学生数学竞赛 8 份扫描件 OCR 后录入 77 道，高等代数 29 道、数学分析 48 道。
- 首页队列：今日待复习、今日已完成、逾期、今日完成度改为按复习节点计算，焦点跳最早到期错题；手机端工作台排在科目之前。
- 数据口径：新增统一资源清单，内置题库 9875、内置模板 118，自建与导入按唯一 ID 计入可用总量；首页、统计、设置共用同一口径。
- 数据安全：导出后记录上次备份时间，设置页显示备份状态、当前大小与结构完整性；重复 ID 只提示不删除。
- 通知分类：全部、学习提醒、操作记录、系统通知四类筛选与真实计数。
- AI 状态：请求中、最近成功、超时、失败在设置页可见；失败只影响当前请求。
- 视觉精修：首页统计卡与四科入口副标签，统计页四卡两列，通知筛选 360–1440 不溢出。
- 防复发：qa:polish 新增首页复习队列、手机顺序、统计口径、通知四分类检查；153 项回归与 CI 全部门禁通过。

### 验证
- 回归测试 153 项通过；严格题库 QA 9875 唯一、problems 0 / warnings 0；教材课后 927、习题集 598。
- 全库渲染审计 9875 题 0 失败；107436 字段数学语言审计 0；574 点记忆/考场用法审计 0 失败。
- 公式、模拟卷、筛选、期末复习、搜索、8 视口浏览器、无障碍、性能、拆包、尺寸与发布一致性门禁通过。
- BUILD_ID 2026.11.21-0d0fb0da；GitHub Pages 与 Release 以同一提交构建。

完整记录见仓库 docs/VERIFICATION.md、docs/audit/WARM-ACADEMIC-3.3-AUDIT.md 与 docs/reports/。'''
try:
    rel = api('/releases/tags/' + TAG)
except urllib.error.HTTPError as e:
    if e.code != 404:
        raise
    rel = api('/releases', method='POST', data={'tag_name': TAG, 'name': '四科错题本 v2026.11.21 · 题库扩充与3.3', 'body': body, 'draft': False, 'prerelease': False})
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
api('/releases/%d' % rel['id'], method='PATCH', data={'body': body, 'name': '四科错题本 v2026.11.21 · 题库扩充与3.3', 'target_commitish': 'main'})
print('body updated')
