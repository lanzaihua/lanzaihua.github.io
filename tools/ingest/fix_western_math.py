# -*- coding: utf-8 -*-
import json,re,os
BANK=r'D:\学习\大一\错题本网页\src\data\bank-western.json'
bank=json.load(open(BANK,encoding='utf-8'))
items=bank['items']
BT=chr(96)
def fix_math(s):
    if not isinstance(s,str): return s
    def repl(m):
        x=m.group(1).strip()
        if not x: return ''
        x=x.replace('$','')
        return '$'+x+'$'
    s=re.sub(BT+'([^'+BT+'\\n]+)'+BT,repl,s)
    s=re.sub(r'^(答：)?(骨架|考点)：',r'\1',s)
    return s
def fix_title(t):
    if not isinstance(t,str): return t
    prefix=''
    if ' · ' in t:
        prefix,t=t.split(' · ',1)
        prefix=prefix+' · '
    t=t.strip()
    if len(t)>32:
        t=t[:31].rstrip('，。；、')+'…'
    return prefix+t
changed=0
for q in items:
    if q['id'].startswith('WE-B29') or q['id'] in ['WE-TX%03d'%i for i in range(1,161)]:
        for k in ('question','answer','standardSolution','detailedAnalysis'):
            if isinstance(q.get(k),str):
                nv=fix_math(q[k])
                if nv!=q[k]: q[k]=nv; changed+=1
        if isinstance(q.get('solution'),list):
            q['solution']=[fix_math(x) for x in q['solution']]
        if isinstance(q.get('points'),list):
            q['points']=[fix_math(x) for x in q['points']]
        q['title']=fix_title(q['title'])
json.dump(bank,open(BANK,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('changed fields',changed)
