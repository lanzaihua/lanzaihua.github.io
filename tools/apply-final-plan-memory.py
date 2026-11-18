# -*- coding: utf-8 -*-
"""Merge AI-authored memory hooks and exam methods into the final-plan knowledge data."""
import io, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'src', 'data', 'final-plan-knowledge.json')
MEM = os.path.join(ROOT, 'src', 'data', 'final-plan-memory.json')
MAPS = [('gaodai', 'memory-ga.json'), ('shufen', 'memory-ma.json'), ('jieji', 'memory-ge.json'), ('xijing', 'memory-we.json')]
BAD = re.compile(r'</?[A-Za-z][A-Za-z0-9:-]*(?:\s[^<>]*)?/?>|\ufffd')


def norm(s):
    return re.sub(r'\s+', '', str(s or ''))


def clean(s):
    s = str(s or '').replace('\r', ' ').replace('\n', ' ').replace('\t', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def main():
    data = json.load(io.open(DATA, encoding='utf-8'))
    merged = {}
    missing = []
    for subject, fname in MAPS:
        path = os.path.join(ROOT, 'tools', 'ingest', fname)
        if not os.path.exists(path):
            raise SystemExit('missing mapping: ' + path)
        obj = json.load(io.open(path, encoding='utf-8'))
        if not isinstance(obj, dict):
            raise SystemExit('mapping is not an object: ' + path)
        # allow either {chapter||name: {...}} or {points: {...}}
        if 'points' in obj and isinstance(obj['points'], dict):
            obj = obj['points']
        for k, v in obj.items():
            if not isinstance(v, dict):
                continue
            hook = clean(v.get('memory') or v.get('memoryHook') or '')
            exam = clean(v.get('exam') or v.get('examUse') or '')
            if hook.startswith('记') and '：' in hook and '考场：' in hook:
                hook, exam = hook.split('考场：', 1)
                hook = hook.strip()
                exam = exam.strip()
            hook = re.sub(r'^记[「“][^」”]+[」”][：:]\s*', '', hook).strip()
            hook = hook.rstrip('。；;，,')
            if hook and exam:
                merged[subject + '||' + k] = {'memory': hook, 'exam': exam}
    keys_written = set()
    out_points = {}
    for subject, sv in data.get('subjects', {}).items():
        for chapter in sv.get('chapters', []):
            chname = chapter.get('chapter', '')
            for point in chapter.get('points', []):
                name = point.get('name', '')
                key = subject + '||' + chname + '||' + name
                short = chname + '||' + name
                item = merged.get(key) or merged.get(subject + '||' + short)
                if not item:
                    missing.append(key)
                    continue
                hook = item['memory'].strip().rstrip('。；;，,')
                exam = item['exam'].strip().rstrip('。；;，')
                if BAD.search(hook) or BAD.search(exam):
                    raise SystemExit('html/replacement char in ' + key)
                point['memoryHook'] = hook
                point['exam'] = exam
                point['memory'] = '记「' + name + '」：' + hook + '。考场：' + exam + '。'
                keys_written.add(key)
                out_points[key] = {'memory': hook, 'exam': exam}
    if missing:
        print('MISSING', len(missing))
        for x in missing[:20]:
            print(' ', x)
        raise SystemExit(1)
    # uniqueness validation across all points
    exams = {}
    mems = {}
    for key, v in out_points.items():
        ne = norm(v['exam'])
        nm = norm(v['memory'])
        if ne in exams:
            raise SystemExit('duplicate exam: ' + exams[ne] + ' / ' + key)
        if nm in mems:
            raise SystemExit('duplicate memory: ' + mems[nm] + ' / ' + key)
        exams[ne] = key
        mems[nm] = key
    data['generatedAt'] = '2026-11-18'
    with io.open(DATA, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    payload = {'version': 1, 'generatedAt': '2026-11-18', 'points': out_points}
    with io.open(MEM, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('points', len(out_points), 'unique exams', len(exams), 'unique memories', len(mems))


if __name__ == '__main__':
    main()
