# -*- coding: utf-8 -*-
"""Targeted repair for the newly ingested items only (GA-B1501+, MA-TX001..069)."""
import json, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'src', 'data')

def is_new(q):
    m = re.match(r'^GA-B(\d+)$', q['id'])
    if m: return int(m.group(1)) >= 1501
    m = re.match(r'^MA-TX(\d+)$', q['id'])
    return bool(m) and int(m.group(1)) <= 69

def fix_text(t):
    if not isinstance(t, str): return t
    t = re.sub(r'\n(?=ight\b)', r'\\right', t)
    t = re.sub(r'\r(?=ight\b)', r'\\right', t)
    t = t.replace('\r', '')
    # 只处理非 $$ 区域里的行内公式换行
    parts = re.split(r'(\$\$[\s\S]*?\$\$)', t)
    out = []
    for p in parts:
        if p.startswith('$$'):
            out.append(p)
        else:
            out.append(re.sub(r'\$([^$]*?)\$', lambda m: '$' + re.sub(r'\s*\n\s*', ' ', m.group(1)) + '$', p))
    return ''.join(out)

def chunk_solution(sol):
    lines = [x for x in sol.split('\n')]
    out, buf = [], ''
    for line in lines:
        buf = (buf + '\n' + line) if buf else line
        # 行内 $ 必须成对，$$ 必须成对，才允许断段
        s2 = buf.replace('$$', '')
        if buf.count('$$') % 2 == 0 and s2.count('$') % 2 == 0:
            out.append(buf); buf = ''
    if buf:
        out.append(buf)
    return [x for x in out if x.strip()]

def main():
    total = 0
    for f in ['bank-algebra.json', 'bank-analysis.json', 'bank-geometry.json', 'bank-western.json']:
        p = os.path.join(DATA, f)
        data = json.load(open(p, encoding='utf-8'))
        changed = 0
        for q in data['items']:
            if not is_new(q): continue
            before = json.dumps(q, ensure_ascii=False, sort_keys=True)
            for k in ('question', 'answer', 'standardSolution', 'detailedAnalysis'):
                q[k] = fix_text(q[k])
            for k in ('points', 'pitfalls'):
                q[k] = [fix_text(x) for x in (q.get(k) or [])]
            q['options'] = [dict(o, text=fix_text(o.get('text', ''))) for o in (q.get('options') or [])]
            q['solution'] = chunk_solution(q['standardSolution']) if q.get('standardSolution') else [fix_text(s) for s in (q.get('solution') or [])]
            if json.dumps(q, ensure_ascii=False, sort_keys=True) != before:
                changed += 1
        json.dump(data, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        print(f, 'changed', changed)
        total += changed
    print('total', total)

if __name__ == '__main__':
    main()
