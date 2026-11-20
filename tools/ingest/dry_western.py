# -*- coding: utf-8 -*-
import json,os,re,collections
ROOT=r'D:\学习\大一\错题本网页'
bank=json.load(open(os.path.join(ROOT,'src','data','bank-western.json'),encoding='utf-8'))['items']
arr=json.load(open(os.path.join(ROOT,'tools','ingest','out','western-skill.json'),encoding='utf-8'))
def norm(q):
    s=str(q or '').replace('\\left','').replace('\\right','')
    s=re.sub(r'\s+','',s)
    for a,b in [('$',''),('，',','),('。','.'),('；',';'),('：',':'),('（','('),('）',')'),('、',',')]: s=s.replace(a,b)
    return s
seen={norm(x.get('question')):x['id'] for x in bank}
dups=[];adds=[]
for q in arr:
    k=norm(q['question'])
    if k in seen: dups.append((q['id'],seen[k],q['question'][:40]))
    else: adds.append(q)
print('bank',len(bank),'parsed',len(arr),'dups',len(dups),'adds',len(adds))
print(collections.Counter(q['chapter'] for q in adds))
for q in adds[:20]: print(q['id'],q['chapter'],q['category'],q['question'][:70])
json.dump(adds,open(os.path.join(ROOT,'tools','ingest','out','western-add.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
