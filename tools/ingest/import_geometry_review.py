# -*- coding: utf-8 -*-
import os,re,json,glob
SK=r'C:\Users\廖子恒\.agents\skills\analytic-geometry\exercises'
OUT=r'D:\学习\大一\错题本网页\tools\ingest\out\geometry-review.json'
CH={'01':'第一章 向量与坐标','02':'第二章 轨迹与方程','03':'第三章 平面与空间直线','04':'第四章 柱面、锥面、旋转曲面与二次曲面','05':'第五章 二次曲线的一般理论','06':'第六章 二次曲面的一般理论'}
def clean(s):
    s=(s or '').replace('\r\n','\n').replace('\r','\n').replace('\u00a0',' ')
    return re.sub(r'\s+',' ',s).strip()
def parse(path):
    num=os.path.basename(path)[2:4]; ch=CH[num]
    txt=open(path,encoding='utf-8').read().replace('\r\n','\n')
    m=re.search(r'^##\s+复习与测试[^\n]*$',txt,re.M)
    if not m: return []
    body=txt[m.end():]
    out=[]
    subs=list(re.finditer(r'^###\s+([一二三])、([^\n]+)$',body,re.M))
    for si,sm in enumerate(subs):
        head=sm.group(2); s=sm.end(); e=subs[si+1].start() if si+1<len(subs) else len(body)
        seg=body[s:e]
        if '选择' not in head and '填空' not in head: continue
        typ='choice' if '选择' in head else 'fill'
        ms=list(re.finditer(r'^\*\*题\s*(\d+)\*\*\s*',seg,re.M))
        for mi,qm in enumerate(ms):
            qs=qm.end(); qe=ms[mi+1].start() if mi+1<len(ms) else len(seg)
            block=clean(seg[qs:qe])
            am=re.search(r'\*\*答案(?:\*\*)?[：:]\s*([^\n]+?)(?:\*\*|。|$)',block)
            if not am: continue
            ans=am.group(1).strip()
            stem=block[:am.start()].strip()
            if typ=='choice':
                om=re.search(r'(?<![A-Za-z])A[.．、]\s*',stem)
                if not om: continue
                qtext=stem[:om.start()].strip()
                optblob=stem[om.start():]
                parts=re.split(r'(?<![A-Za-z])([A-D])[.．、]\s*',optblob)
                opts={}
                for i in range(1,len(parts)-1,2): opts[parts[i]]=parts[i+1].strip()
                if len(opts)!=4 or ans not in opts: continue
                out.append(dict(type='choice',category='概念辨析题',question=qtext,options=[opts[k] for k in 'ABCD'],correct=ans,answer=ans))
            else:
                out.append(dict(type='fill',category='公式填空题',question=stem,options=[],correct='',answer=ans))
    return ch,out
allx=[]
for p in sorted(glob.glob(os.path.join(SK,'ch0*-exercises.md'))):
    ch,arr=parse(p); print(os.path.basename(p),len(arr)); allx.extend([dict(chapter=ch,**x) for x in arr])
json.dump(allx,open(OUT,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('TOTAL',len(allx))