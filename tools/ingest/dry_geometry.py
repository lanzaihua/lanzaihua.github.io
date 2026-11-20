# -*- coding: utf-8 -*-
import json, os, re, collections
ROOT=r'D:\学习\大一\错题本网页'
items=json.load(open(os.path.join(ROOT,'src','data','bank-geometry.json'),encoding='utf-8'))['items']
arr=json.load(open(os.path.join(ROOT,'tools','ingest','out','geometry-skill.json'),encoding='utf-8'))
def norm(q):
    s=str(q or '')
    s=s.replace('\\left','').replace('\\right','')
    s=re.sub(r'\s+','',s)
    s=s.replace('$','').replace('，',',').replace('。','.').replace('；',';').replace('：',':')
    s=s.replace('（','(').replace('）',')').replace('、',',')
    return s
seen={norm(x.get('question')):x['id'] for x in items}
dups=[]; adds=[]
for q in arr:
    k=norm(q['question'])
    if k in seen: dups.append((q['id'],seen[k],q['section'],q['question'][:50]))
    else: adds.append(q)
print('existing',len(items),'parsed',len(arr),'dups',len(dups),'adds',len(adds))
print('dups by chapter',collections.Counter(d[0][7:9] for d in dups))
print('adds by chapter',collections.Counter(a['chapter'][:4] for a in adds))
for a in adds:
    print(a['id'],a['section'],a['category'],a['question'][:60].replace('\n',' '))
print('--- sample dup')
for d in dups[:5]: print(d)
json.dump([a for a in adds],open(os.path.join(ROOT,'tools','ingest','out','geometry-add.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
