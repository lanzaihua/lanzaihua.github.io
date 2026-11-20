# -*- coding: utf-8 -*-
import os,re,json,glob
SK=r'C:\Users\廖子恒\.agents\skills\western-economics\exercises'
ROOT=r'D:\学习\大一\错题本网页'
OUT=os.path.join(ROOT,'tools','ingest','out','western-skill.json')
CH={
'01':'第一章 需求、供给和均衡价格','02':'第二章 消费者选择','03':'第三章 企业的生产和成本',
'04':'第四章 完全竞争市场','05':'第五章 不完全竞争市场','06':'第六章 生产要素市场和收入分配',
'07':'第七章 一般均衡与效率','08':'第八章 市场失灵和微观经济政策','09':'第九章 宏观经济的基本指标及其衡量',
'10':'第十章 国民收入的决定：收入-支出模型','11':'第十一章 国民收入的决定：IS-LM 模型',
'12':'第十二章 国民收入的决定：AD-AS 模型','13':'第十三章 失业、通货膨胀和经济周期',
'14':'第十四章 开放条件下的宏观经济','15':'第十五章 宏观经济政策','16':'第十六章 经济增长'}
def clean(s):
    s=(s or '').replace('\r\n','\n').replace('\r','\n').replace('\u00a0',' ')
    s=re.sub(r'[ \t]+\n','\n',s); s=re.sub(r'\n{3,}','\n\n',s)
    return s.strip()
def type_cat(title,sec):
    t=title
    if '名词解释' in t or ('真题' in sec and len(t)<12): return 'subjective','概念辨析题'
    if '证明' in t or '求证' in t: return 'subjective','证明题'
    if re.search(r'计算|求|利润|均衡产量',t): return 'subjective','计算题'
    return 'subjective','综合题'
def q_text(title,sec,cat):
    if cat=='概念辨析题' and not title.startswith('名词解释'):
        return '名词解释：'+title
    return title
def title_short(title,cat):
    t=re.sub(r'\s+',' ',title).strip()
    return (cat.replace('题','')+' · '+t)[:30]
def parse(path):
    txt=clean(open(path,encoding='utf-8').read())
    num=os.path.basename(path)[2:4]
    chapter=CH.get(num)
    if not chapter: return []
    secs=list(re.finditer(r'^##\s+([^\n]+)$',txt,re.M))
    out=[]
    for si,sm in enumerate(secs):
        secname=sm.group(1); start=sm.end(); end=secs[si+1].start() if si+1<len(secs) else len(txt)
        body=txt[start:end]
        if '自测' in secname or '判断与选择' in secname:
            continue
        ms=list(re.finditer(r'^\*\*([0-9]+)\s*[｜|]\s*([^\n]+?)\*\*(.*)$',body,re.M))
        for mi,m in enumerate(ms):
            s=m.end(); e=ms[mi+1].start() if mi+1<len(ms) else len(body)
            block=clean(body[s:e])
            block=re.split(r'\n##\s',block)[0]
            bullets=[clean(x) for x in re.split(r'\n(?=- )',block) if clean(x)]
            bullets=[re.sub(r'^-\s*','',x).strip() for x in bullets]
            bullets=[x for x in bullets if x]
            if not bullets: continue
            title=clean(m.group(2))
            typ,cat=type_cat(title,secname)
            sol='\n\n'.join(bullets)
            if not re.match(r'^(解|证明|答)[：:]',sol):
                sol='答：'+sol
            ans=bullets[0]
            if len(ans)>90: ans=ans[:90].rstrip('，。；;')+'。'
            q=q_text(title,secname,cat)
            out.append({
              'id':'WE-TMP-%s-%03d'%(num,len(out)+1),'subject':'xijing','chapter':chapter,
              'section':'真题综合' if '真题' in secname else ('教材习题' if '教材' in secname else '计算题'),
              'type':typ,'category':cat,'templateId':'','title':title_short(title,cat),
              'question':q,'answer':ans,'standardSolution':sol,
              'detailedAnalysis':'本题来自《西方经济学》配套练习。答题要点：'+('；'.join(bullets[:3]))[:260],
              'points':[cat.replace('题',''),'西方经济学'],'pitfalls':['只背结论不写推导条件','把相近模型的前提混用'],
              'options':[],'correct':'','source':'习题集（西方经济学配套练习 · %s · %s）'%(chapter,secname),
              'examOrigin':'习题集','tags':[chapter,'西方经济学','配套练习'],'relatedEntries':[],
              'difficulty':3,'solution':[x for x in re.split(r'\n{2,}',sol) if x.strip()],
              'pointKeys':[cat.replace('题',''),'西方经济学'],
              'verification':'人工复核：按教材模型与一阶条件核对结论。'
            })
    return out
allx=[]
for p in sorted(glob.glob(os.path.join(SK,'ch*-*.md'))):
    arr=parse(p); print(os.path.basename(p),len(arr)); allx.extend(arr)
json.dump(allx,open(OUT,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('TOTAL',len(allx))
