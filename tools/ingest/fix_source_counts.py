p='README.md'
s=open(p,encoding='utf-8').read()
pairs=[
('**8350** 道考研同型题 + **590** 道教材课后习题 + **223** 道习题集题','**8350** 道考研同型题 + **885** 道教材课后习题 + **416** 道习题集题'),
('- 8350 道考研同型题 + 590 道教材课后习题 + 223 道习题集题','- 8350 道考研同型题 + 885 道教材课后习题 + 416 道习题集题'),
('题库由 8350 道考研同型题、590 道教材课后题与 223 道习题集题组成','题库由 8350 道考研同型题、885 道教材课后题与 416 道习题集题组成'),
]
for a,b in pairs:
    s=s.replace(a,b)
open(p,'w',encoding='utf-8',newline='\n').write(s)
p='tests/regressions.test.js'
s=open(p,encoding='utf-8').read()
s=s.replace("md.includes('590 道教材课后')","md.includes('885 道教材课后')")
s=s.replace("md.includes('223 道习题集')","md.includes('416 道习题集')")
s=s.replace("md.includes('9163')","md.includes('9651')")
s=s.replace("md.includes('98 项回归测试')","md.includes('106 项回归测试')")
open(p,'w',encoding='utf-8',newline='\n').write(s)
print('ok')
