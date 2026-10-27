"""Public source audit, optionally staging licensed review-only candidates; never enables clips."""
import csv
import io
import json
import re
import urllib.request
import argparse
import hashlib
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--stage', action='store_true', help='Stage three exact-match source candidates outside runtime; never approve them')
args = parser.parse_args()

def read(url, limit=1048576):
    with urllib.request.urlopen(url, timeout=30) as response:
        value = response.read(limit + 1)
        if len(value) > limit:
            raise ValueError('Public metadata exceeds the audit bound')
        return value

revision = '93bc8aa0a6526e86af80db5f59af8d133292c9b5'
if not re.fullmatch(r'[0-9a-f]{40}', revision):
    raise ValueError('Unexpected dataset revision')
base = 'https://huggingface.co/datasets/CLERC-DATA/epee/resolve/' + revision + '/'
index = read(base + 'metadata.csv')
readme = read(base + 'README.md')
if b'CC BY-NC-SA 4.0' not in readme:
    raise ValueError('Expected source license notice is absent')
rows = list(csv.DictReader(io.StringIO(index.decode('utf-8-sig'))))
targets = ['hello', 'thank you', 'i need help', 'how are you', 'please repeat']
found = {key: [] for key in targets}
nearby = []
seen = set()
for row in rows:
    text = row.get('text_en', '')
    normalized = ' '.join(re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower()))
    if normalized in found:
        found[normalized].append(row)
    elif text not in seen and any(key in normalized for key in ['help', 'repeat', 'thank', 'hello', 'how are']):
        nearby.append(row)
    seen.add(text)
root = Path(__file__).resolve().parents[1]
folder = root / 'imports' / 'phrase-candidates' / 'epee-v03'
folder.mkdir(parents=True, exist_ok=True)
def safe_write(path, value):
    if path.exists():
        if path.read_bytes() != value:
            raise ValueError('Conflict: refusing to overwrite ' + str(path))
        return 'skipped'
    path.write_bytes(value)
    return 'added'

selected = [('hello', 'asl.template.greeting-hello', 'asl.greeting.hello'), ('thank you', 'asl.template.express-thanks', 'asl.gratitude.thanks'), ('how are you', 'asl.template.greeting-wellbeing', None)]
report = {'schema':'phrase-source-audit/1','source':base,'revision':revision,'license':'CC-BY-NC-SA-4.0','licenseURL':'https://creativecommons.org/licenses/by-nc-sa/4.0/','metadataSHA256':hashlib.sha256(index).hexdigest(),'runtimeImports':0,'humanApproval':False,'rows':[],'missingExact':['I need help','Please repeat']}
for key, template_id, concept_id in selected:
    row = next(item for item in found[key] if item['signer_id'] == 'ALPHA')
    if not re.fullmatch(r'clerc_v03_\d{4}', row['clip_id']) or row['sign_language'] != 'ASL':
        raise ValueError('Unexpected source identifier or sign language')
    report['rows'].append({'templateId':template_id,'conceptId':concept_id,'text':row['text_en'],'clipId':row['clip_id'],'signLanguage':row['sign_language'],'fps':float(row['fps']),'frames':int(row['n_frames']),'sourceURL':base+'keypoints/'+row['clip_id']+'.npy','status':'pending-technical-and-human-review'})
dry = root / 'docs' / 'epee-phrase-dry-run-20261016.json'
safe_write(dry, (json.dumps(report,indent=2)+'\n').encode())
if args.stage:
    import numpy as np
    safe_write(folder/'SOURCE_README.md',readme)
    safe_write(folder/'metadata.csv',index)
    outcomes=[]
    existing=json.loads((root/'web/vocabulary-manifest.json').read_text(encoding='utf-8'))
    prior_hashes={a.get(k) for a in existing['animations'] for k in ['sha256','sourceGLBSHA256','motionContentSHA256']}
    seen=set(); content_seen=set()
    for row in report['rows']:
        clip=row['clipId']; data=read(row['sourceURL']); digest=hashlib.sha256(data).hexdigest()
        if digest in prior_hashes or digest in seen:
            raise ValueError('Duplicate payload; source candidate must be merged before staging')
        seen.add(digest)
        array=np.load(io.BytesIO(data),allow_pickle=False)
        if array.shape != (row['frames'],128,3) or array.dtype.kind != 'f' or not np.isfinite(array).all():
            raise ValueError('Unexpected/nonfinite keypoint content: '+clip)
        content_digest=hashlib.sha256(array.astype('<f8').tobytes(order='C')).hexdigest()
        if content_digest in content_seen:
            raise ValueError('Duplicate numeric motion content; hold for provenance review')
        content_seen.add(content_digest)
        # Check every earlier staged NPY, not just matching filenames. Converting
        # precision/endianness prevents header or storage changes hiding a copy.
        for prior_path in (root/'imports').rglob('*.npy'):
            if prior_path == folder/(clip+'.npy'):
                continue
            prior=np.load(prior_path,allow_pickle=False)
            if prior.shape == array.shape and np.array_equal(prior,array):
                raise ValueError('Identical numeric content already staged at '+str(prior_path)+'; merge provenance instead')
        annotation=read(base+'annotations/'+clip+'.json'); details=json.loads(annotation)
        if details.get('text_en') != row['text']:
            raise ValueError('Conflicting annotation phrase label: '+clip)
        outcome=safe_write(folder/(clip+'.npy'),data)
        safe_write(folder/(clip+'.json'),annotation)
        outcomes.append({**row,'outcome':outcome,'sha256':digest,'annotationSHA256':hashlib.sha256(annotation).hexdigest(),'path':str((folder/(clip+'.npy')).relative_to(root)).replace('\\','/'),'format':'MediaPipe 128-point NPY; not compatible with the current GLB motion loader','technicalStatus':'shape-and-finiteness-only; retargeting pending','humanReview':None})
    manifest={'schema':'quarantined-phrase-sources/1','source':base,'license':report['license'],'licenseURL':report['licenseURL'],'use':'Non-commercial research/prototype only; share-alike applies to adapted data','runtimeImports':0,'candidates':[{k:v for k,v in row.items() if k!='outcome'} for row in outcomes]}
    safe_write(folder/'manifest.json',(json.dumps(manifest,indent=2)+'\n').encode())
    print(json.dumps({'dryRun':str(dry.relative_to(root)),'outcomes':outcomes,'runtimeImports':0,'missingExact':report['missingExact']},indent=2))
else:
    print(json.dumps(report,indent=2))
