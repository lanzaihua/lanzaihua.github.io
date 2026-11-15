# 题库与导出验证记录（2026-11-15）

本文件记录本轮题库录入、查重、逐题复核、DOCX/PDF 导出与存储扩容的可复现证据。所有命令均在仓库根目录执行。

## 1. 题库规模

| 科目 | 题数 | 其中教材课后 | 说明 |
|---|---:|---:|---|
| 高等代数 | 2046 | 354 | 新增《高等代数习题精选精解》192 题（GA-B1800–GA-B2045） |
| 数学分析 | 3523 | 72 | 新增《数学分析上作业集》69 题 + ChatGPT 数学题 1 题 |
| 解析几何 | 1199 | 299 | 本轮未新增 |
| 西方经济学 | 2883 | 160 | 本轮未新增 |
| **合计** | **9651** | **885** | id 唯一，章节 55 个 |

## 2. 查重

- 归一化规则：去除全部空白、`$`、`\left`/`\right`，统一中英文标点。
- 合并脚本 `tools/ingest/merge_xiti.py` 对全库逐题比对，输出 `duplicates: []`。
- `node tools/qa-bank-strict.js --strict-difficulty`：`total 9651 / unique 9651`，重复 0。

## 3. 严格 QA

`npm run check` 全部通过：

- 严格题库 QA：problems 0、warnings 0；分类 10 类、章节 55、bucket 825。
- 站点一致性：四科 2046 / 3523 / 1199 / 2883，更新记录 24 天。
- 仓库语言门禁、Python 题库审计均通过。
- 回归测试 106 项（新增存储 6 项、DOCX 关系符与 deg 断言）。

修复的真实数据缺陷：

1. 9 道客观题缺少 `correct`，答案字母与 correct 不一致（写入时 forced 空值）；已按答案首字母回填并复跑。
2. 3 道题的反斜杠转义损坏：`\alpha`、`\notin`、`\neq` 被 JSON 解析成控制字符或换行，导致公式断行/乱码。
3. 192 道新题标题未按“分类 · 标题”规范，已统一前缀。
4. 公式定界符断行、`\right` 损坏等 51 处新题卫生问题已在录入阶段修复。

## 4. 逐题复核口径

- **全库 9651 题**：机器复核 id、科目、章节、题型、分类、选项数量与重复、答案字母、`solution` 分段、公式定界符、占位答案、裸 LaTeX。
- **新增 192 道习题精选精解**：每题带 `verification` 字段，记录 sympy 复算或逐项枚举结果；另对代表性题（特征多项式、若尔当块、范德蒙德行列式、矩阵秩）做了独立算例核验。
- **《数学分析上作业集》69 题**：逐题对照 PDF 文字层录入，题 66 的 36 个小问合并为一条；解答按教材节次重写。
- **ChatGPT 数学题 1 题**：非线性中值等式证明，已人工逐步复核（g=f−x、内部最大值点、达布定理、线性组合取点）。
- **未覆盖**：其余既有题库条目没有逐题人工重算记录；本轮只做机器一致性与公式卫生复核。此为本轮验证的明确边界，不把结构检查冒充实算证明。

## 5. DOCX / PDF 导出

样例：`tools/make-export-sample.js` 从题库取 4 道主观题 + 3 道客观题，生成 `debug/export-verify.docx`。

| 工具 | 页数 | 字数 | 结果 |
|---|---:|---:|---|
| Microsoft Word (COM) | 5 | 1882 | PDF 5 页，2645 字符 |
| WPS Writer (COM) | 5 | 1981 | PDF 5 页，2439 字符 |

逐页检查（PyMuPDF + 页面渲染）：

- 无 `\frac`、`$$`、U+FFFD、裸 `mid`、重复“B．B．”。
- “标准解答 / 详细解析 / 解题要点 / 易错点”各出现 7 次。
- 本轮新修 `\deg` 被渲染成“° 前缀”的问题，改为文本“deg r<deg g”；回归断言已加入 `tests/fixes.test.js`。
- WPS 在公式两侧会插入略宽的空格（字体回退差异），Word 正常；不影响内容正确性。

## 6. 本机存储扩容

- 主存储改为 IndexedDB `sanke-cuotiben-store/state`；localStorage 只保留 ≤3MB 镜像与 `sanke-cuotiben-meta-v2` 版本元数据。
- 容量按 `navigator.storage.estimate()` 的剩余配额留 20% 余量动态计算；不再使用固定 4MB 字符预算。无配额估算时回退 1GB 防失控上限。
- Playwright 真机验证：导入 6MB 状态后 IDB 写入 6.29MB、localStorage 只剩 107B meta、告警横幅 0；刷新后条目仍在。
- 服务端 `PUT /api/state` 上限 8MB → 64MB，9MB 写入回归通过。

## 7. 题库分片

- `build.js --pages` 生成 `bank-index.json` + 四科分片；index 不再含易变的 `generatedAt`，构建可字节级复现。
- `publish-pages.js --check` 不再触发重新构建，只做逐字节比较。
- 真机：首访四科 2046/3523/1199/2883；刷新走 IndexedDB 且 0 个 `data/bank` 请求；阻断 `bank-shufen.json` 后回退 `bank.json`，题数完整。

## 8. 发布链

- 本地 `main` 与 `origin/main` 内容一致；Release v2026.11.15 资产齐全；Pages 构建成功；open PR 0。
- 新增 `tools/verify-release.js` 与每日 `release-check.yml`：工作区干净、HEAD=origin/main、当天 tag、Release 资产、Pages commit、线上 BUILD_ID 全部对齐。

## 9. 复现命令

```bash
npm test                      # 106 项回归
npm run check                 # 严格 QA + 站点一致性 + 语言门禁
node build.js && node build.js --pages
npm run prepare:pages && npm run verify:pages
node tools/qa-pages.js        # 拆包/缓存/回退真浏览器
npm run qa:formulas
npm run qa:a11y
npm run qa:perf
PAGE_URL=http://127.0.0.1:4173/ node tools/qa-responsive.js
```
