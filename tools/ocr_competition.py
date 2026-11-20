# -*- coding: utf-8 -*-
"""OCR all scanned competition papers with N workers, shared page queue."""
import sys, os, time, glob
import pymupdf as fitz
from rapidocr import RapidOCR

SRC=r'D:\学习\大一\高等代数\数学竞赛往年题目'
OUT=r'D:\学习\大一\高等代数\_compet_ocr'
os.makedirs(OUT,exist_ok=True)
files=sorted(glob.glob(os.path.join(SRC,'*.pdf')))
jobs=[]
for p in files:
    base=os.path.splitext(os.path.basename(p))[0]
    safe=''.join(c for c in base if c not in '\\/:*?"<>|')[:40]
    doc=fitz.open(p)
    for i in range(doc.page_count):
        jobs.append((p,safe,i,doc.page_count))
mod=int(sys.argv[1]); total=int(sys.argv[2])
eng=RapidOCR()
for idx,(p,safe,i,n) in enumerate(jobs):
    if idx%total!=mod: continue
    out=os.path.join(OUT,'%s__p%03d.txt'%(safe,i+1))
    if os.path.exists(out) and os.path.getsize(out)>20: continue
    doc=fitz.open(p)
    t0=time.time()
    pix=doc[i].get_pixmap(dpi=200)
    tmp=os.path.join(OUT,'_tmp_%d_%03d.png'%(mod,i+1))
    pix.save(tmp)
    try:
        res=eng(tmp); txt='\n'.join(res.txts or [])
    except Exception as e:
        txt='[[OCR_ERROR]] '+repr(e)
    with open(out,'w',encoding='utf-8') as f:
        f.write('----- [PDF p%d / total %d] -----\n'%(i+1,n)); f.write(txt)
    try: os.remove(tmp)
    except: pass
    print('worker',mod,'page',i+1,'of',n,'chars',len(txt),'sec',round(time.time()-t0,1),flush=True)
print('DONE',mod,flush=True)
