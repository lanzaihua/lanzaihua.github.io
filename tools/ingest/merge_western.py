# -*- coding: utf-8 -*-
import json,os,re,collections
ROOT=r'D:\学习\大一\错题本网页'
BANK=os.path.join(ROOT,'src','data','bank-western.json')
bank=json.load(open(BANK,encoding='utf-8'))
items=bank['items']
parsed=json.load(open(os.path.join(ROOT,'tools','ingest','out','western-skill.json'),encoding='utf-8'))
by_ch=collections.defaultdict(lambda:{'text':[],'exam':[]})
for q in parsed:
    if q['section']=='教材习题': by_ch[q['chapter']]['text'].append(q)
    elif q['section']=='真题综合': by_ch[q['chapter']]['exam'].append(q)
# replace WE-TX001..160 with real textbook questions
replaced=0
for ci in range(1,17):
    chapter=None
    for q in items:
        if q['id']=='WE-TX%03d'%((ci-1)*10+1): chapter=q['chapter']; break
    if not chapter: continue
    arr=sorted(by_ch[chapter]['text'], key=lambda x:x['id'])
    for j,q in enumerate(arr[:10],start=1):
        target='WE-TX%03d'%((ci-1)*10+j)
        for item in items:
            if item['id']==target:
                item['question']=q['question']
                item['title']='教材课后 · '+q['title'].split(' · ',1)[-1]
                item['answer']=q['answer']
                item['standardSolution']=q['standardSolution']
                item['detailedAnalysis']=q['detailedAnalysis']
                item['points']=q['points']
                item['pitfalls']=q['pitfalls']
                item['solution']=q['solution']
                item['pointKeys']=q['pointKeys']
                item['source']='教材课后习题（西方经济学 · %s · 第 %d 题）'%(chapter,j)
                item['verification']=q['verification']
                replaced+=1
                break
# add real past-exam questions
ids=set(x['id'] for x in items)
n=2900
added=0
for chapter,groups in by_ch.items():
    for q in sorted(groups['exam'], key=lambda x:x['id']):
        while ('WE-B%04d'%n) in ids: n+=1
        q2=dict(q); q2['id']='WE-B%04d'%n; ids.add(q2['id']); n+=1
        q2['subject']='xijing'; q2['examOrigin']='习题集'
        q2['source']='习题集（西方经济学考研真题 · %s · %s）'%(chapter,q['section'])
        q2['title']=q['category'].replace('题','')+' · '+q['title'].split(' · ',1)[-1]
        items.append(q2); added+=1
json.dump(bank,open(BANK,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('replaced',replaced,'added exam',added,'total',len(items))
