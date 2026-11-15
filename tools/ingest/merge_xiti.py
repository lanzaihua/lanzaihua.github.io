# -*- coding: utf-8 -*-
"""Merge 习题精选精解 agent output into bank-algebra.json with dedup and renumbering."""
import json, os, re, glob
ROOT = r'D:\学习\大一\错题本网页'
DATA = os.path.join(ROOT, 'src', 'data')
OUT = os.path.join(ROOT, 'tools', 'ingest', 'out')

def norm(q):
    s = str(q or '')
    s = s.replace('\\left', '').replace('\\right', '')
    s = re.sub(r'\s+', '', s)
    s = s.replace('$', '').replace('，', ',').replace('。', '.').replace('；', ';').replace('：', ':')
    s = s.replace('（', '(').replace('）', ')').replace('、', ',')
    return s

bank = json.load(open(os.path.join(DATA, 'bank-algebra.json'), encoding='utf-8'))
items = bank['items']
seen = {norm(q.get('question')): q['id'] for q in items}
maxnum = max(int(q['id'][4:]) for q in items if re.match(r'^GA-B\d+$', q['id']))
nxt = max(1800, maxnum + 1)
print('existing', len(items), 'next', nxt)

report = {'files': {}, 'added': 0, 'duplicates': [], 'invalid': []}
for f in sorted(glob.glob(os.path.join(OUT, 'xiti-ch*.json'))):
    try:
        arr = json.load(open(f, encoding='utf-8'))
    except Exception as e:
        report['invalid'].append([os.path.basename(f), 'json', str(e)]); continue
    added = 0
    for q in arr:
        src = os.path.basename(f)
        if not q.get('question') or not q.get('standardSolution'):
            report['invalid'].append([src, q.get('id'), 'missing question/solution']); continue
        key = norm(q['question'])
        if key in seen:
            report['duplicates'].append([src, q.get('id'), seen[key]]); continue
        q['id'] = 'GA-B%04d' % nxt
        q['subject'] = 'gaodai'
        q['examOrigin'] = '习题集'
        if not isinstance(q.get('options'), list): q['options'] = []
        q['correct'] = ''
        if not q.get('pointKeys'): q['pointKeys'] = q.get('points') or []
        if not q.get('solution'):
            q['solution'] = [q['standardSolution']]
        if '习题精选精解' not in str(q.get('source', '')):
            q['source'] = '习题集（高等代数习题精选精解 · ' + str(q.get('chapter', '')) + '）'
        items.append(q)
        seen[key] = q['id']
        nxt += 1; added += 1
    report['files'][os.path.basename(f)] = added
    report['added'] += added

json.dump(bank, open(os.path.join(DATA, 'bank-algebra.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(json.dumps(report, ensure_ascii=False, indent=1))
print('total', len(items))
