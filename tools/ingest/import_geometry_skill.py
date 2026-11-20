# -*- coding: utf-8 -*-
"""Import structured analytic-geometry exercise solutions from the subject skill."""
import io, json, os, re, glob

SKILL = r"C:\Users\廖子恒\.agents\skills\analytic-geometry\exercises"
ROOT = r"D:\学习\大一\错题本网页"
OUT = os.path.join(ROOT, "tools", "ingest", "out", "geometry-skill.json")

CHAPTERS = {
    "01": "第一章 向量与坐标",
    "02": "第二章 轨迹与方程",
    "03": "第三章 平面与空间直线",
    "04": "第四章 柱面、锥面、旋转曲面与二次曲面",
    "05": "第五章 二次曲线的一般理论",
    "06": "第六章 二次曲面的一般理论",
}
PITFALLS = {
    "01": ["向量方向写反导致叉积差一个负号", "把向量积的模当成面积而漏掉夹角正弦"],
    "02": ["参数方程消参时漏掉参数范围", "把空间曲线投影柱面与曲面本身混为一谈"],
    "03": ["平面法向量与直线方向向量用混", "异面直线距离漏掉混合积的绝对值"],
    "04": ["锥面顶点不在原点时仍套齐次方程", "旋转曲面母线绕轴转时坐标代换写反"],
    "05": ["不变量算错导致分类错误", "平移与转轴顺序颠倒引入一次项"],
    "06": ["主方向特征根与标准形系数对应错", "径面与切平面条件混用"],
}

def clean(s):
    s = (s or "").replace("\r\n", "\n").replace("\r", "\n")
    s = s.replace("\u00a0", " ").replace("\u3000", " ")
    s = re.sub(r"[ \t]+\n", "\n", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()

def section_label(raw):
    m = re.search(r"§\s*([0-9]+\.[0-9]+)", raw or "")
    if m:
        return "§" + m.group(1)
    m = re.search(r"习题\s*([0-9]+\.[0-9]+)", raw or "")
    if m:
        return "§" + m.group(1)
    if "复习与测试" in (raw or ""):
        return "复习与测试"
    return ""

def strip_math(s):
    s = re.sub(r"\$[^$]*\$", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()

def category_of(question, section):
    q = question or ""
    if "复习与测试" in section:
        return "综合题"
    if re.search(r"证明|求证", q):
        return "证明题"
    if re.search(r"判断|下列|哪些|是否", q):
        return "概念辨析题"
    if re.search(r"求|计算|解方程|化简", q):
        return "计算题"
    return "综合题"

def title_of(question, category, number):
    plain = strip_math(question)
    plain = re.sub(r"[，。；：？、（）()\[\]【】]", " ", plain)
    plain = re.sub(r"\s+", " ", plain).strip()
    if len(plain) > 26:
        plain = plain[:26].rstrip() + "…"
    return ("%s · %s" % (category.replace("题", ""), plain))[:30]

def parse_file(path):
    text = clean(io.open(path, encoding="utf-8").read())
    m = re.search(r"第([一二三四五六])章", text)
    num = os.path.basename(path)[2:4]
    chapter = CHAPTERS[num]
    items = []
    # Split by section headings (## 习题 / ## 复习与测试) and question headings
    sec_re = re.compile(r"^##\s+(习题\s*[0-9]+\.[0-9]+[^\n]*|复习与测试[^\n]*)$", re.M)
    heads = list(sec_re.finditer(text))
    for si, sh in enumerate(heads):
        sec_raw = sh.group(1)
        sec = section_label(sec_raw)
        start = sh.end()
        end = heads[si + 1].start() if si + 1 < len(heads) else len(text)
        body = text[start:end]
        # Only structured main exercises: ### 题 N ; also #### 题 N(N)
        q_re = re.compile(r"^#{3,4}\s*题\s*([0-9]+(?:\s*\([0-9]+\))?)\s*$", re.M)
        qs = list(q_re.finditer(body))
        for qi, qm in enumerate(qs):
            qstart = qm.end()
            qend = qs[qi + 1].start() if qi + 1 < len(qs) else len(body)
            block = clean(body[qstart:qend])
            mm = re.search(r"\*\*题目\*\*\s*[：:]\s*(.+?)(?=\n\*\*标准解答\*\*|\Z)", block, re.S)
            if not mm:
                continue
            question = clean(mm.group(1))
            sm = re.search(r"\*\*标准解答\*\*\s*\n(.*?)(?=\n\*\*答\*\*|\Z)", block, re.S)
            if not sm:
                continue
            solution = clean(sm.group(1))
            am = re.search(r"\*\*答\*\*\s*[：:]\s*(.+?)(?=\n\*\*考点\*\*|\Z)", block, re.S)
            answer = clean(am.group(1)) if am else ""
            km = re.search(r"\*\*考点\*\*\s*[：:]\s*(.+?)(?=\n\*\*方法\*\*|\Z)", block, re.S)
            points_raw = clean(km.group(1)) if km else ""
            wm = re.search(r"\*\*方法\*\*\s*[：:]\s*(.+?)\Z", block, re.S)
            method = clean(wm.group(1)) if wm else ""
            if not question or not solution:
                continue
            if not re.match(r"^(解|证明|答)[：:]", solution):
                solution = "解：" + solution
            if not answer:
                answer = "见标准解答。"
            cat = category_of(question, sec)
            points = [p.strip() for p in re.split(r"[、/；;]", points_raw) if p.strip()][:6]
            if not points:
                points = [cat.replace("题", "")]
            detailed = "考点：%s。方法：%s" % (points_raw or cat, method or "按定义与判据逐步推导。")
            items.append({
                "id": "GE-TMP-%s-%03d" % (num, len(items) + 1),
                "subject": "jieji",
                "chapter": chapter,
                "section": sec,
                "type": "subjective",
                "category": cat,
                "templateId": "",
                "title": title_of(question, cat, qm.group(1)),
                "question": question,
                "answer": answer,
                "standardSolution": solution,
                "detailedAnalysis": detailed,
                "points": points,
                "pitfalls": PITFALLS.get(num, ["公式适用条件", "方向或符号写反"]),
                "options": [],
                "correct": "",
                "source": "教材课后习题（%s）· %s 第 %s 题" % (chapter, sec, qm.group(1)),
                "examOrigin": "教材课后习题",
                "tags": [chapter, "教材课后", "解析几何"],
                "relatedEntries": [],
                "difficulty": 3,
                "solution": [x.strip() for x in re.split(r"\n{2,}", solution) if x.strip()] or [solution],
                "pointKeys": points,
            })
    return items

all_items = []
for path in sorted(glob.glob(os.path.join(SKILL, "ch0*-exercises.md"))):
    arr = parse_file(path)
    print(os.path.basename(path), len(arr))
    all_items.extend(arr)

with io.open(OUT, "w", encoding="utf-8", newline="\n") as fh:
    json.dump(all_items, fh, ensure_ascii=False, indent=1)
print("TOTAL", len(all_items), OUT)
