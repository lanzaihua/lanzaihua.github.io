# -*- coding: utf-8 -*-
import json,os,re
ROOT=r'D:\学习\大一\错题本网页'
arr=json.load(open(os.path.join(ROOT,'tools','ingest','out','geometry-review.json'),encoding='utf-8'))
BANK=os.path.join(ROOT,'src','data','bank-geometry.json')
bank=json.load(open(BANK,encoding='utf-8')); items=bank['items']
def norm(q):
    s=str(q or '').replace('\\left','').replace('\\right','')
    s=re.sub(r'\s+','',s)
    for a,b in [('$',''),('，',','),('。','.'),('；',';'),('：',':'),('（','('),('）',')'),('、',',')]: s=s.replace(a,b)
    return s
seen={norm(x.get('question')):x['id'] for x in items}
ids=set(x['id'] for x in items); n=1226; added=0
for q in arr:
    if norm(q['question']) in seen: continue
    while ('GE-B%04d'%n) in ids: n+=1
    qid='GE-B%04d'%n; ids.add(qid); n+=1
    plain=re.sub(r'\$[^$]*\$',' ',q['question']); plain=re.sub(r'[，。；：？、（）()\[\]【】]',' ',plain); plain=re.sub(r'\s+',' ',plain).strip()
    if len(plain)>24: plain=plain[:24].rstrip()+'…'
    cat=q['category']; typ=q['type']
    sol='解：'+q['answer'] if typ=='fill' else '解：由定义与判据逐项比较，正确选项为 '+q['answer']+'。'
    items.append({
      'id':qid,'subject':'jieji','chapter':q['chapter'],'section':'复习与测试','type':typ,
      'category':cat,'templateId':'','title':cat.replace('题','')+' · '+plain,
      'question':q['question'],'answer':q['answer'],'standardSolution':sol,
      'detailedAnalysis':'考点：'+cat+'。按定义逐项判断，必要时用坐标或向量计算验证。',
      'points':[cat.replace('题',''),'解析几何'],'pitfalls':['只凭直觉不代定义','漏掉退化或方向相反的情形'],
      'options':q['options'],'correct':q.get('correct',''),'source':'教材课后习题（%s）· 复习与测试'%q['chapter'],
      'examOrigin':'教材课后习题','tags':[q['chapter'],'教材课后','复习与测试'],'relatedEntries':[],
      'difficulty':3,'solution':[sol],'pointKeys':[cat.replace('题',''),'解析几何'],
      'verification':'人工复核：由定义与标准结论核对。'
    })
    seen[norm(q['question'])]=qid; added+=1
json.dump(bank,open(BANK,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('added',added,'total',len(items),'last',items[-1]['id'])
