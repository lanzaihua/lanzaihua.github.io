# -*- coding: utf-8 -*-
"""Merge agent-ingested questions into src/data/bank-*.json with strict dedup.

- GA: append new 教材课后习题 entries (dedup by normalized stem).
- MA: replace MA-TX001..069 (legacy skeleton entries) with the verified homework 1..69.
- Dedup: normalized exact-match across the whole bank + within the new batch;
  fuzzy (difflib ratio >= 0.92) candidates against the same chapter are reported.
"""
import json, re, os, difflib
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'src', 'data')
OUT = os.path.join(ROOT, 'tools', 'ingest', 'out')
FILES = {'gaodai': 'bank-algebra.json', 'shufen': 'bank-analysis.json', 'jieji': 'bank-geometry.json', 'xijing': 'bank-western.json'}
CATS = ['计算题','证明题','概念辨析题','公式填空题','应用题','综合题','反例与存在性题','分类讨论题','误差分析题','多解比较题']

def norm(s):
    s = str(s or '').replace('\u3000', ' ')
    s = re.sub(r'\s+', '', s).replace('$', '').replace('\\left', '').replace('\\right', '')
    for a, b in [('，', ','), ('；', ';'), ('：', ':'), ('（', '('), ('）', ')'), ('＝', '='), ('＋', '+'), ('－', '-'), ('×', '*')]:
        s = s.replace(a, b)
    return s

def load():
    return {s: json.load(open(os.path.join(DATA, f), encoding='utf-8')) for s, f in FILES.items()}

def agent_items():
    ga = []
    for ch in range(1, 11):
        p = os.path.join(OUT, 'ga-ch%02d.json' % ch)
        if os.path.exists(p):
            ga += [(ch, x) for x in json.load(open(p, encoding='utf-8'))]
    ma = []
    for ch in ('01', '02', '03', '04', '05', '06', '08'):
        p = os.path.join(OUT, 'ma-ch%s.json' % ch)
        if os.path.exists(p):
            ma += json.load(open(p, encoding='utf-8'))
    return ga, ma

def clean_options(opts):
    out = []
    for i, o in enumerate(opts or []):
        if isinstance(o, dict):
            k = str(o.get('key') or o.get('k') or 'ABCD'[i]).strip().upper()[:1]
            out.append({'key': k, 'text': str(o.get('text') or o.get('t') or '').strip()})
        else:
            out.append({'key': 'ABCD'[i], 'text': str(o).strip()})
    return out

def prepare(it):
    return {
        'subject': it['subject'], 'chapter': it['chapter'].strip(), 'type': it['type'],
        'category': it['category'], 'templateId': it.get('templateId') or '',
        'templateTitle': it.get('templateTitle') or '',
        'pointKeys': it.get('pointKeys') or it.get('points') or [],
        'title': str(it['title']).strip(), 'question': str(it['question']).strip(),
        'answer': str(it['answer']).strip(), 'solution': it.get('solution') or [],
        'difficulty': int(it['difficulty']),
        'tags': it.get('tags') or [], 'source': str(it['source']).strip(),
        'relatedEntries': it.get('relatedEntries') or [],
        'standardSolution': str(it['standardSolution']).strip(),
        'detailedAnalysis': str(it['detailedAnalysis']).strip(),
        'verification': it.get('verification') or '',
        'pitfalls': it.get('pitfalls') or [], 'points': it.get('points') or it.get('pointKeys') or [],
        'examOrigin': it['examOrigin'], 'options': clean_options(it.get('options')),
        'correct': str(it.get('correct') or '').strip().upper()[:1],
    }

def validate(q):
    errs = []
    if q['subject'] not in FILES: errs.append('subject')
    if q['type'] not in ('choice', 'fill', 'subjective'): errs.append('type')
    if q['category'] not in CATS: errs.append('category')
    for f in ('title', 'question', 'answer', 'standardSolution', 'detailedAnalysis', 'source'):
        if not q[f]: errs.append('empty ' + f)
    if not re.match(r'^(解|证明|答)[：:]', q['standardSolution']): errs.append('solution prefix')
    if q['type'] == 'choice':
        if len(q['options']) != 4: errs.append('options != 4')
        if q['correct'] not in [o['key'] for o in q['options']]: errs.append('correct key')
        if len({norm(o['text']) for o in q['options']}) != 4: errs.append('dup options')
    if q['type'] == 'fill' and q['question'].count('____') != 1: errs.append('fill blanks')
    if q['examOrigin'] not in ('考研原创同型题', '教材课后习题', '习题集'): errs.append('examOrigin')
    if not 1 <= q['difficulty'] <= 5: errs.append('difficulty')
    for f in ('question', 'answer', 'standardSolution', 'detailedAnalysis'):
        if q[f].replace('$$', '').count('$') % 2: errs.append('unpaired $ in ' + f); break
    if re.search(r'[\u4e00-\u9fa5][ \t]+[\u4e00-\u9fa5]', q['question']): errs.append('spaces between hanzi')
    return errs

def main():
    bank = load()
    ga_items, ma_items = agent_items()
    existing_norm = {}
    for subj, data in bank.items():
        for q in data['items']:
            existing_norm.setdefault(norm(q['question']), q['id'])
    report = {'ga': {'kept': 0, 'skipped': [], 'invalid': [], 'fuzzy': []},
              'ma': {'kept': 0, 'skipped': [], 'invalid': [], 'fuzzy': []}, 'replaced_ma': 0}
    # ---------- GA append ----------
    ga = bank['gaodai']
    maxb = max(int(q['id'][4:]) for q in ga['items'] if re.match(r'^GA-B\d+$', q['id']))
    nid = maxb
    seen = dict(existing_norm)
    for ch, raw in ga_items:
        q = prepare(raw)
        errs = validate(q)
        if errs:
            report['ga']['invalid'].append({'src': raw.get('id'), 'errors': errs}); continue
        n = norm(q['question'])
        if n in seen:
            report['ga']['skipped'].append({'src': raw.get('id'), 'dup': seen[n], 'title': q['title']}); continue
        for old in ga['items']:
            if old['chapter'] != q['chapter']: continue
            r = difflib.SequenceMatcher(None, n, norm(old['question'])).ratio()
            if r >= 0.92:
                report['ga']['fuzzy'].append({'src': raw.get('id'), 'near': old['id'], 'ratio': round(r, 3), 'title': q['title']})
        nid += 1
        q['id'] = 'GA-B%04d' % nid
        seen[n] = q['id']
        ga['items'].append(q)
        report['ga']['kept'] += 1
    # ---------- MA replace TX001..069 ----------
    ma = bank['shufen']
    if len(ma_items) != 69:
        report['ma']['invalid'].append({'count': len(ma_items), 'expected': 69})
    targets = ['MA-TX%03d' % i for i in range(1, 70)]
    by_id = {q['id']: i for i, q in enumerate(ma['items'])}
    for t in targets:
        if t in by_id:
            ma['items'][by_id[t]] = None
            report['replaced_ma'] += 1
    new_ma = []
    for idx, raw in enumerate(ma_items):
        q = prepare(raw)
        errs = validate(q)
        if errs:
            report['ma']['invalid'].append({'src': raw.get('id'), 'errors': errs}); continue
        q['id'] = 'MA-TX%03d' % (idx + 1)
        new_ma.append(q)
    ma['items'] = [q for q in ma['items'] if q is not None]
    insert_at = len(ma['items'])
    for i, q in enumerate(ma['items']):
        if q['id'] == 'MA-TX000' or False:
            insert_at = i
    # put TX block before the first non-TX id that originally followed TX031/069
    ma['items'][0:0] = new_ma if not ma['items'] or not ma['items'][0]['id'].startswith('MA-TX') else new_ma
    report['ma']['kept'] = len(new_ma)
    # ---------- write ----------
    for subj, data in bank.items():
        json.dump(data, open(os.path.join(DATA, FILES[subj]), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump(report, open(os.path.join(OUT, 'merge-report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    summary = {k: (v if k == 'replaced_ma' else {kk: (len(vv) if isinstance(vv, list) else vv) for kk, vv in v.items()}) for k, v in report.items()}
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print('totals', {s: len(d['items']) for s, d in bank.items()})
