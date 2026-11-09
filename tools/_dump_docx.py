import docx, json, io
out = []
for f in [r"大一/错题本网页/prompt/题库模块.docx", r"大一/错题本网页/prompt/期末复习模块.docx", r"大一/错题本网页/prompt/每日更新兜底.docx"]:
    d = docx.Document(f)
    out.append("===== " + f + " =====")
    for p in d.paragraphs:
        t = p.text.strip()
        if t: out.append(t)
    for ti, table in enumerate(d.tables):
        out.append(f"--- table {ti} ---")
        for row in table.rows:
            out.append(" | ".join(c.text.strip() for c in row.cells))
open(r"大一/错题本网页/prompt/_dump.txt","w",encoding="utf-8").write("\n".join(out))
print("ok", len(out))
