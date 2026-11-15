# -*- coding: utf-8 -*-
import json, re, sys
p = 'src/data/bank-algebra.json'
b = json.load(open(p, encoding='utf-8'))
items = b['items']
ctrl = {0x07: '\\a', 0x08: '\\b', 0x0b: '\\v', 0x0c: '\\f'}
changed = 0

def fixstr(s):
    global changed
    t = ''.join(ctrl.get(ord(c), c) for c in s)
    t = re.sub(r'\n(otin|eq|exists|abla|eg|supseteq|subseteq|rightarrow|Rightarrow|mid|leq|geq|in|i|appa)\b', lambda m: '\\' + m.group(1), t)
    if t != s:
        changed += 1
    return t

for q in items:
    m = re.match(r'^GA-B(\d+)$', q['id'])
    if not m or int(m.group(1)) < 1800:
        continue
    for k, v in list(q.items()):
        if isinstance(v, str):
            q[k] = fixstr(v)
        elif isinstance(v, list):
            q[k] = [fixstr(x) if isinstance(x, str) else x for x in v]
    if q.get('type') == 'choice' and not q.get('correct'):
        mm = re.match(r'^\s*([A-D])[．.、]', str(q.get('answer', '')))
        if mm:
            q['correct'] = mm.group(1)
            changed += 1
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('changed', changed)
