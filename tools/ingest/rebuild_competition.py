# -*- coding: utf-8 -*-
import json,os,re,glob
ROOT=r'D:\学习\大一\错题本网页'; DATA=os.path.join(ROOT,'src','data')
FILES=['bank-algebra.json','bank-analysis.json','bank-geometry.json','bank-western.json']
def norm(q):
    s=str(q or '').replace('\\left','').replace('\\right','')
    s=re.sub(r'\s+','',s)
    for a,b in [('$',''),('，',','),('。','.'),('；',';'),('：',':'),('（','('),('）',')'),('、',',')]: s=s.replace(a,b)
    return s
banks={f:json.load(open(os.path.join(DATA,f),encoding='utf-8')) for f in FILES}
removed=0
for f,b in banks.items():
    keep=[]
    for q in b['items']:
        if '全国大学生数学竞赛' in q.get('source',''):
            removed+=1
        else: keep.append(q)
    b['items']=keep
print('removed old competition',removed)
seen={}
for f,b in banks.items():
    for q in b['items']: seen.setdefault(norm(q.get('question')),q['id'])
ga=max(int(q['id'][4:]) for q in banks['bank-algebra.json']['items'] if re.match(r'^GA-B\d+$',q['id']))
ma=max(int(q['id'][3:]) for q in banks['bank-analysis.json']['items'] if re.match(r'^MA-\d+$',q['id']))
order=['1-12','13','15A','15B','16A','16B','17A','17B']
added=0; skipped=[]
for key in order:
    p=os.path.join(ROOT,'tools','ingest','out','competition-%s.json'%key)
    if not os.path.exists(p): continue
    arr=json.load(open(p,encoding='utf-8'))
    if isinstance(arr,dict): arr=arr.get('items',[])
    for q in arr:
        if not q.get('question') or not q.get('standardSolution'):
            skipped.append([key,q.get('id'),'missing']); continue
        k=norm(q['question'])
        if k in seen: skipped.append([key,q.get('id'),seen[k]]); continue
        src=q.get('source','')
        if '习题集' not in src: src='习题集（'+src+'）'
        q['source']=src
        q['examOrigin']='习题集'
        q['title']=q['category']+' · '+q['title'].split(' · ',1)[-1]
        q['type']='subjective'; q['options']=[]; q['correct']=''
        q['pointKeys']=q.get('points') or []
        if not q.get('solution'): q['solution']=[q['standardSolution']]
        if q['subject']=='gaodai':
            ga+=1; q['id']='GA-B%04d'%ga; banks['bank-algebra.json']['items'].append(q)
        elif q['subject']=='shufen':
            ma+=1; q['id']='MA-%04d'%ma; banks['bank-analysis.json']['items'].append(q)
        else:
            skipped.append([key,q.get('id'),'bad subject']); continue
        seen[k]=q['id']; added+=1
for f,b in banks.items():
    json.dump(b,open(os.path.join(DATA,f),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('added',added,'GA',ga,'MA',ma,'skipped',len(skipped))
for s in skipped[:12]: print(s)
