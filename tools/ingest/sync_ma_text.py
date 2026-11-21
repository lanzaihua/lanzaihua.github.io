import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BANK = os.path.join(ROOT, 'src/data/bank-analysis.json')
OUT = os.path.join(ROOT, 'tools/ingest/out')
FIELDS = ['question','title','category','answer','standardSolution','solution','detailedAnalysis','points','pitfalls','pointKeys','verification','difficulty','source']
def norm(s):
    s=str(s or '').replace('\\left','').replace('\\right','')
    s=re.sub(r'\s+','',s)
    s=s.replace('$','').replace('，',',').replace('。','.').replace('；',';').replace('：',':')
    return s
def main():
    data=json.load(open(BANK,encoding='utf-8')); items=data['items']
    byq={norm(q.get('question')):q for q in items if str(q.get('source','')).startswith('教材课后习题')}
    bysource={str(q.get('source','')):q for q in items if str(q.get('source','')).startswith('教材课后习题')}
    changed=[]
    for i in range(1,24):
        f=os.path.join(OUT,'ma-text-ch%02d.json'%i)
        if not os.path.exists(f): continue
        for q in json.load(open(f,encoding='utf-8')):
            t=bysource.get(str(q.get('source',''))) or byq.get(norm(q.get('question')))
            if not t: continue
            for k in FIELDS:
                if k in q and t.get(k)!=q.get(k):
                    t[k]=q[k]
                    if len(changed)<25: changed.append((t['id'],k))
            if t.get('standardSolution'):
                t['solution']=[seg.strip() for seg in re.split(r'\n{2,}', str(t['standardSolution']).strip()) if seg.strip()]
    json.dump(data,open(BANK,'w',encoding='utf-8',newline='\n'),ensure_ascii=False,indent=2)
    open(BANK,'a',encoding='utf-8',newline='\n').write('\n')
    print('synced fields',len(changed)); print(changed[:10])
if __name__=='__main__': main()
