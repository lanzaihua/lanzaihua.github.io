#!/usr/bin/env python3
"""Independent audit of the four question banks.

This is a deliberate second implementation of the Node QA gate. It uses only
the Python standard library, so a clean machine can verify the data without
npm install and without trusting the build script.

Usage:
    python tools/audit_bank.py
    python tools/audit_bank.py --strict-difficulty --json
    python tools/audit_bank.py --data-dir src/data
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

SUBJECTS = {
    "gaodai": ("bank-algebra.json", 1559),
    "shufen": ("bank-analysis.json", 3522),
    "jieji": ("bank-geometry.json", 1199),
    "xijing": ("bank-western.json", 2883),
}
CATEGORIES = [
    "计算题", "证明题", "概念辨析题", "公式填空题", "应用题",
    "综合题", "反例与存在性题", "分类讨论题", "误差分析题", "多解比较题",
]
CATEGORY_TARGET = {
    "计算题": 1075, "证明题": 825, "概念辨析题": 875, "公式填空题": 850,
    "应用题": 675, "综合题": 825, "反例与存在性题": 750,
    "分类讨论题": 825, "误差分析题": 725, "多解比较题": 825,
}
TYPE_CATEGORY = {"证明题": {"subjective"}, "公式填空题": {"fill"}, "概念辨析题": {"choice", "subjective"}}
TRAILING_TIMES_TWO = re.compile(r"(?:\\cdot|·)\s*2\s*(?=\$|$)")
BAD_SINGLE_BACKSLASH = re.compile(r"(^|[^\\])\\[0-9]")
BAD_TRIPLE_BACKSLASH = re.compile(r"\\\\\\[A-Za-z](?![A-Za-z])")
BAD_NEE = re.compile(r"\\nee")
BAD_LOGIC = re.compile(r"=\\exists|=\\forall|\\Rightarrow-(?:\\exists|\\forall)|\\iff-(?:\\exists|\\forall)")
BAD_SQRT = re.compile(r"\\sqrt\{-[0-9]+\^2")
DUPLICATE_TAIL = re.compile(r"(.{8,80})\s+\1$")
RAW_LATEX = re.compile(r"\\[a-zA-Z]+|[\uE000\uE001]")
META_OPTION = re.compile(
    r"无法确定|无法判断|条件不足|以上(?:答案|说法|判断)?(?:均|都)?不(?:正确|对|成立)|"
    r"上述等式在给定条件下不成立|该等式只在特殊情形下成立"
)


def normalized(value):
    return re.sub(r"\s+", "", str(value or ""))


def math_fields(item):
    fields = [item.get("question"), item.get("answer"), item.get("standardSolution"),
              item.get("detailedAnalysis")]
    fields.extend(option.get("text", "") for option in item.get("options") or [])
    fields.extend(item.get("solution") or [])
    return [field for field in fields if field]


def outside_math(text):
    text = re.sub(r"\$\$[\s\S]*?\$\$", "", str(text or ""))
    return re.sub(r"\$[^$]*\$", "", text)


def check_delimiters(identifier, field, problems):
    text = str(field or "").replace(r"\$", "")
    if text.count("$$") % 2:
        problems.append((identifier, "数学显示定界符 $$ 不成对"))
        return
    inline = re.sub(r"\$\$[\s\S]*?\$\$", "", text)
    for line in inline.split("\n"):
        if line.count("$") % 2:
            problems.append((identifier, "数学定界符 $ 不成对或公式被截断"))
            break


def audit(data_dir: Path, strict_difficulty: bool):
    problems = []
    warnings = []
    all_items = []
    base_items = []
    per_subject = {}
    for subject, (filename, expected) in SUBJECTS.items():
        path = data_dir / filename
        if not path.is_file():
            problems.append(("GLOBAL", f"缺少题库文件 {filename}"))
            continue
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # pragma: no cover - corrupt JSON is the failure we want
            problems.append((filename, f"JSON 无法解析: {exc}"))
            continue
        items = payload.get("items") if isinstance(payload, dict) else None
        if not isinstance(items, list):
            problems.append((filename, "items 不是数组"))
            continue
        per_subject[subject] = len(items)
        if len(items) < expected:
            problems.append((subject, f"题数 {len(items)} < {expected}"))
        all_items.extend(items)
        base_items.extend(item for item in items if item.get("examOrigin") != "教材课后习题")

    if len(base_items) < 8250:
        problems.append(("GLOBAL", f"基础题库 {len(base_items)} < 8250"))
    if len(all_items) < 9163:
        problems.append(("GLOBAL", f"题库总数 {len(all_items)} < 9163"))
    textbook = [item for item in all_items if item.get("examOrigin") == "教材课后习题"]
    if len(textbook) < 590:
        problems.append(("GLOBAL", f"教材课后题 {len(textbook)} < 590"))
    exercise = [item for item in all_items if item.get("examOrigin") == "习题集"]
    if len(exercise) < 223:
        problems.append(("GLOBAL", f"习题集题 {len(exercise)} < 223"))

    chapter_keys = {item.get("subject") + "|" + item.get("chapter") for item in all_items}
    if len(chapter_keys) != 55:
        problems.append(("GLOBAL", f"章节数 {len(chapter_keys)} != 55"))

    buckets = {}
    category_counts = {}
    seen_ids = {}
    seen_questions = {}
    for item in base_items:
        identifier = item.get("id", "(no id)")
        bucket = "|".join(str(item.get(key)) for key in ("subject", "chapter", "difficulty", "type"))
        buckets[bucket] = buckets.get(bucket, 0) + 1
        category = item.get("category")
        category_counts[category] = category_counts.get(category, 0) + 1
        question = normalized(item.get("question"))
        if question in seen_questions:
            problems.append((identifier, f"题干重复，同 {seen_questions[question]}"))
        else:
            seen_questions[question] = identifier
        if identifier in seen_ids:
            problems.append((identifier, f"ID 重复，同 {seen_ids[identifier]}"))
        else:
            seen_ids[identifier] = identifier

    for bucket, count in buckets.items():
        if count < 10:
            problems.append((bucket, f"章/星级/题型桶 {count} < 10"))
    if len(buckets) != 825:
        problems.append(("GLOBAL", f"桶数 {len(buckets)} != 825"))
    for category in CATEGORIES:
        count = category_counts.get(category, 0)
        if count < CATEGORY_TARGET[category]:
            problems.append((category, f"分类计数 {count} < {CATEGORY_TARGET[category]}"))

    for item in all_items:
        identifier = item.get("id", "(no id)")
        kind = item.get("type")
        category = item.get("category")
        if kind not in {"choice", "fill", "subjective"}:
            problems.append((identifier, "非法 type"))
        if category not in CATEGORIES:
            problems.append((identifier, "非法 category"))
        if not item.get("title") or not item.get("question") or not item.get("answer"):
            problems.append((identifier, "缺少核心字段"))
        if not item.get("standardSolution") or not item.get("detailedAnalysis"):
            problems.append((identifier, "缺少标准解答或详细解析"))
        if not isinstance(item.get("points"), list) or not item.get("points"):
            problems.append((identifier, "points 为空"))
        if not isinstance(item.get("pitfalls"), list) or not item.get("pitfalls"):
            problems.append((identifier, "pitfalls 为空"))
        if not re.search(r"考研|真题|同型|教材课后|习题集", str(item.get("source") or "")):
            problems.append((identifier, "来源不是考研/真题/同型/教材课后"))
        if item.get("examOrigin") not in {"考研原创同型题", "教材课后习题", "习题集"}:
            problems.append((identifier, "examOrigin 错误"))
        if not isinstance(item.get("difficulty"), int) or not 1 <= item["difficulty"] <= 5:
            problems.append((identifier, "difficulty 不是 1-5"))
        if category in TYPE_CATEGORY and kind not in TYPE_CATEGORY[category]:
            problems.append((identifier, "分类/题型不匹配"))
        if kind == "choice":
            options = item.get("options") or []
            if len(options) != 4:
                problems.append((identifier, "选项不是四个"))
            texts = [str(option.get("text", "")) for option in options]
            if len(set(texts)) != len(texts):
                problems.append((identifier, "选项文本重复"))
            keys = [str(option.get("key", "")) for option in options]
            if keys != ["A", "B", "C", "D"]:
                problems.append((identifier, "选项键不是 A-D"))
            if item.get("correct") not in keys:
                problems.append((identifier, "correct 不在选项键中"))
            answer_key = re.match(r"^\s*([A-D])[．.、]", str(item.get("answer") or ""))
            if answer_key and answer_key.group(1) != item.get("correct"):
                problems.append((identifier, "答案字母与 correct 不一致"))
            if sum(1 for text in texts if META_OPTION.search(text)) >= 2:
                problems.append((identifier, "客观题含两个以上通用元选项"))
        if kind == "fill":
            question = str(item.get("question") or "")
            if question.count("____") != 1:
                problems.append((identifier, "填空题答题空位不是恰好一个"))
        if kind == "subjective":
            if not re.match(r"^(解|证明|答)[：:]", str(item.get("standardSolution") or "").strip()):
                problems.append((identifier, "标准解答没有以解/证明/答开头"))
            if normalized(item.get("standardSolution")) == normalized(item.get("answer")):
                problems.append((identifier, "标准解答与答案完全相同"))

        for field in math_fields(item):
            text = str(field)
            if TRAILING_TIMES_TWO.search(text):
                problems.append((identifier, "公式末尾多乘了 2"))
            if BAD_SINGLE_BACKSLASH.search(text):
                problems.append((identifier, "数学文本含单反斜杠数字"))
            if BAD_TRIPLE_BACKSLASH.search(text):
                problems.append((identifier, "数学文本含三反斜杠非法命令"))
            if BAD_NEE.search(text):
                problems.append((identifier, "数学文本含损坏的 \\nee"))
            if BAD_LOGIC.search(text):
                problems.append((identifier, "逻辑运算符损坏"))
            if BAD_SQRT.search(text):
                problems.append((identifier, "平方展开写成负数开方"))
            if DUPLICATE_TAIL.search(text):
                problems.append((identifier, "解答末尾整句重复"))
            if RAW_LATEX.search(outside_math(text)):
                problems.append((identifier, "数学公式未放入 $...$ 或残留裸 LaTeX"))
            segments = text.split("$")
            for index in range(1, len(segments), 2):
                if "\n" in segments[index]:
                    problems.append((identifier, "$...$ 内含换行"))
                    break
        delimiter_fields = math_fields(item) + list(item.get("points") or []) + list(item.get("pitfalls") or [])
        for field in delimiter_fields:
            check_delimiters(identifier, field, problems)

        question = str(item.get("question") or "")
        if kind != "subjective" and re.search(r"证明|求证|试证|推导|完整过程|说明[^。]*理由", question):
            problems.append((identifier, "客观题出现证明/推导任务"))
        if item.get("subject") == "gaodai" and category == "误差分析题":
            if not re.search(r"误差|近似|某同学|错误|错解|指出|纠错|诊断|验算|检验", question):
                problems.append((identifier, "高代误差分析题没有误差/诊断信号"))
        if kind == "choice" and re.search(r"证明|求证|试证", question):
            problems.append((identifier, "选择题题干要求证明"))
        if item.get("difficulty") == 1 and re.search(r"构造反例|分类讨论|参数讨论|存在性证明", question):
            warnings.append((identifier, "1★ 出现高难任务"))
        if item.get("difficulty") == 5 and re.search(r"默写|直接写出|写出公式|背诵", question):
            warnings.append((identifier, "5★ 仍是记忆型任务"))
        if re.search(r"【[^】]+】", question):
            problems.append((identifier, "题干含【】题型标记"))

    if strict_difficulty and warnings:
        problems.extend(warnings)
        warnings = []

    summary = {
        "total": len(all_items),
        "perSubject": per_subject,
        "chapters": len(chapter_keys),
        "unique": len({normalized(item.get("question")) for item in all_items}),
        "bucketCount": len(buckets),
        "categoryCount": len(category_counts),
        "minQuota": min(buckets.values()) if buckets else 0,
        "textbook": len(textbook),
        "problems": len(problems),
        "warnings": len(warnings),
    }
    return summary, problems, warnings


def main(argv=None):
    parser = argparse.ArgumentParser(description="独立审计四科错题本题库")
    parser.add_argument("--data-dir", default="src/data", help="题库 JSON 所在目录")
    parser.add_argument("--strict-difficulty", action="store_true", help="把难度信号警告当作失败")
    parser.add_argument("--json", action="store_true", help="输出紧凑 JSON")
    parser.add_argument("--quiet", action="store_true", help="只输出最终结论")
    args = parser.parse_args(argv)
    data_dir = Path(args.data_dir)
    if not data_dir.is_absolute():
        data_dir = Path(__file__).resolve().parent.parent / data_dir
    summary, problems, warnings = audit(data_dir, args.strict_difficulty)
    if args.json:
        print(json.dumps({"summary": summary, "problems": problems[:40], "warnings": warnings[:20]}, ensure_ascii=False, indent=2))
    elif not args.quiet:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        for identifier, message in problems[:40]:
            print(f"PROBLEM {identifier} · {message}")
        for identifier, message in warnings[:20]:
            print(f"WARN {identifier} · {message}")
    if problems:
        print(f"AUDIT FAILED: {len(problems)} problem(s)")
        return 1
    print("BANK AUDIT PASS" + (" (difficulty warnings reported)" if warnings else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
