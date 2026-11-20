# -*- coding: utf-8 -*-
import json, os, re
ROOT=r'D:\学习\大一\错题本网页'
ADD=os.path.join(ROOT,'tools','ingest','out','geometry-add.json')
BANK=os.path.join(ROOT,'src','data','bank-geometry.json')

META={
'GE-TMP-01-065':('混合积的三重线性展开','证明题'),
'GE-TMP-01-066':('双重向量积恒等式','证明题'),
'GE-TMP-01-067':('三叉积混合积等于平方','证明题'),
'GE-TMP-01-068':('对角线表示平行四边形的面积','计算题'),
'GE-TMP-01-069':('三向量共面的线性组合判据','证明题'),
'GE-TMP-01-070':('混合积线性展开求值','计算题'),
'GE-TMP-01-071':('用向量证明柯西与混合积不等式','证明题'),
'GE-TMP-01-072':('不共面向量的分解恒等式','证明题'),
'GE-TMP-01-073':('三角形中线与重心的向量关系','证明题'),
'GE-TMP-01-074':('三中线平方和等于三边平方和','证明题'),
'GE-TMP-01-075':('四面体顶点到对面重心连线共点','证明题'),
'GE-TMP-02-004':('等轴双曲线三点垂心仍在曲线上','证明题'),
'GE-TMP-02-005':('直线向量式参数方程与对称式','证明题'),
'GE-TMP-04-004':('柱面向量式参数方程','证明题'),
'GE-TMP-04-006':('判断曲面为柱面','证明题'),
'GE-TMP-04-015':('锥面向量式参数方程','证明题'),
'GE-TMP-04-021':('椭球面向径与方向余弦','计算题'),
'GE-TMP-04-022':('椭球面三条正交射线的倒数和','计算题'),
'GE-TMP-04-030':('异面直线滑动中点的轨迹','计算题'),
'GE-TMP-04-031':('双曲面参数方程验证','计算题'),
'GE-TMP-04-036':('抛物面参数方程验证','计算题'),
'GE-TMP-04-040':('单叶双曲面直母线的投影与腰椭圆','计算题'),
'GE-TMP-04-045':('双曲抛物面正交直母线交点轨迹','证明题'),
'GE-TMP-04-047':('直线为轴的圆柱面与圆锥面方程','计算题'),
'GE-TMP-04-049':('平面截锥面两直线垂直条件','证明题'),
'GE-TMP-06-046':('不同特征根主方向互相垂直','证明题'),
}
arr=json.load(open(ADD,encoding='utf-8'))
bank=json.load(open(BANK,encoding='utf-8'))
items=bank['items']
ids=set(x['id'] for x in items)
n=1200
added=0
for q in arr:
    title,cat=META[q['id']]
    q['title']=title
    q['category']=cat
    if cat=='证明题':
        q['answer']='结论成立，证明见标准解答。'
    elif not q['answer'] or q['answer']=='见标准解答。':
        q['answer']='结果见标准解答。'
    while ('GE-B%04d'%n) in ids: n+=1
    q['id']='GE-B%04d'%n; ids.add(q['id']); n+=1
    items.append(q); added+=1
json.dump(bank,open(BANK,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('added',added,'total',len(items),'last',items[-1]['id'])
