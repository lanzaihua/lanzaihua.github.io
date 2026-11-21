import json, os, re, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BANK=os.path.join(ROOT,'src/data/bank-analysis.json')
OUT=os.path.join(ROOT,'tools/ingest/out')
CTRL=re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]')
def norm(s):
 s=str(s or '').replace('\\left','').replace('\\right','');s=re.sub(r'\s+','',s);return s.replace('$','').replace('，',',').replace('。','.').replace('；',';').replace('：',':')
def main():
 names=sorted(x for x in os.listdir(OUT) if re.fullmatch(r'jimi-v[34]-\d+\.json',x))
 allq=[]
 for name in names:
  data=json.load(open(os.path.join(OUT,name),encoding='utf-8'))
  print(name,len(data))
  allq.extend(data)
 bad=[q.get('id') for q in allq if CTRL.search(json.dumps(q,ensure_ascii=False))]
 if bad: print('CONTROL CHARS',bad[:10]);sys.exit(1)
 d=json.load(open(BANK,encoding='utf-8'));items=d['items'];seen={norm(q.get('question')) for q in items}
 nums=[int(m.group(1)) for q in items if (m:=re.search(r'(\d+)$',str(q.get('id',''))))];nxt=max(nums)+1;added=0;dups=0
 for q in allq:
  k=norm(q.get('question'))
  if not k or k in seen: dups+=1;continue
  q['subject']='shufen';q['id']='MA-%04d'%nxt;nxt+=1
  q.setdefault('options',[]);q.setdefault('correct','');q['examOrigin']='习题集'
  q.setdefault('templateId','');q.setdefault('relatedEntries',[]);q.setdefault('tags',[])
  if q.get('chapter') not in q['tags']:q['tags'].insert(0,q.get('chapter',''))
  q['solution']=[z.strip() for z in re.split(r'\n{2,}',str(q.get('standardSolution','')).strip()) if z.strip()] or [q.get('standardSolution','')]
  q.setdefault('pointKeys',q.get('points',[]));items.append(q);seen.add(k);added+=1
 d['items']=items
 with open(BANK,'w',encoding='utf-8',newline='\n') as f:json.dump(d,f,ensure_ascii=False,indent=2);f.write('\n')
 print('files',len(names),'input',len(allq),'added',added,'dups',dups,'total',len(items))
if __name__=='__main__':main()
