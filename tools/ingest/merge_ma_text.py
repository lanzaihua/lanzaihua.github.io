import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BANK = os.path.join(ROOT, 'src/data/bank-analysis.json')
OUT_DIR = os.path.join(ROOT, 'tools/ingest/out')
FILES = ['ma-text-ch01.json', 'ma-text-ch02.json']

def norm(s):
    s = str(s or '')
    s = s.replace('\\left', '').replace('\\right', '')
    s = re.sub(r'\s+', '', s)
    s = s.replace('$', '').replace('，', ',').replace('。', '.').replace('；', ';').replace('：', ':')
    return s

def main():
    data = json.load(open(BANK, encoding='utf-8'))
    items = data['items']
    seen = {norm(q.get('question')) for q in items}
    nums = [int(m.group(1)) for q in items if (m := re.search(r'(\d+)$', str(q.get('id', ''))))]
    nxt = (max(nums) if nums else 0) + 1
    added = 0
    skipped = []
    for name in FILES:
        path = os.path.join(OUT_DIR, name)
        if not os.path.exists(path):
            print('MISSING', name)
            continue
        batch = json.load(open(path, encoding='utf-8'))
        if isinstance(batch, dict):
            batch = batch.get('items') or batch.get('questions') or []
        for q in batch:
            key = norm(q.get('question'))
            if not key or key in seen:
                skipped.append((name, q.get('id'), 'duplicate/or empty'))
                continue
            q['subject'] = 'shufen'
            q['id'] = 'MA-%04d' % nxt
            nxt += 1
            q.setdefault('options', [])
            q.setdefault('correct', '')
            q['examOrigin'] = '教材课后习题'
            q.setdefault('templateId', '')
            q.setdefault('relatedEntries', [])
            q.setdefault('tags', [])
            if q.get('chapter') not in q['tags']:
                q['tags'].insert(0, q.get('chapter', ''))
            q['solution'] = [line for line in str(q.get('standardSolution', '')).split('\n') if line.strip()] or [q.get('standardSolution', '')]
            q.setdefault('pointKeys', q.get('points', []))
            items.append(q)
            seen.add(key)
            added += 1
    data['items'] = items
    with open(BANK, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('added', added, 'total', len(items), 'skipped', len(skipped))
    for row in skipped[:20]:
        print('SKIP', *row)

if __name__ == '__main__':
    main()
