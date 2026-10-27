"""Index permitted complete-utterance references. Never imports/enables motion.
Dry-run first; --commit requires the saved report. A repeat writes nothing.
"""
import csv, hashlib, json, argparse
from pathlib import Path

root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--commit',action='store_true');p.add_argument('--report',required=True);p.add_argument('--plan');args=p.parse_args()
load=lambda f: json.loads((root/f).read_text(encoding='utf-8'))
digest=lambda b:hashlib.sha256(b).hexdigest()
norm=lambda s:' '.join(s.lower().replace('’',"'").strip(' .?!').split())
source=load('imports/phrase-candidates/epee-v03/manifest.json')
metadata=root/'imports/phrase-candidates/epee-v03/metadata.csv'
with metadata.open(encoding='utf-8-sig',newline='') as f: clerc=list(csv.DictReader(f))
proposals=[load(str(f.relative_to(root))) for f in (root/'imports/phrase-proposals').glob('*.json')]
selected=['How are you?','What is your name?','Nice to meet you','Good morning','Good afternoon','Good evening','Goodbye','See you later','Thank you','No problem','What time is it?','What happened?','Where is the bathroom','Where is the cafeteria?','Where do you live?','Where are you from?','How old are you?','How do you feel?','Are you hungry?','Are you tired?','Are you happy?','Are you cold?','Are you finished?','Are you alright?','Do you know ASL?','Do you use ASL?','Do you like coffee?','Do you want a drink?','Do you want milk?','Do you want more food?','Do you mind?','I do not understand','Do you have an ID?','Where were you born?','How much?','How many minutes?']
items=[]
for text in selected:
    rows=[r for r in clerc if r['sign_language']=='ASL' and norm(r['text_en'])==norm(text)]
    if not rows:raise ValueError('No exact source caption: '+text)
    proposal=next((v for v in proposals if norm(text) in v['englishPatterns']),None)
    template=proposal['id'] if proposal else 'asl.utterance.epee-'+digest(norm(text).encode())[:16]
    staged=next((c for c in source['candidates'] if c['templateId']==template),None)
    items.append({'id':template,'text':rows[0]['text_en'],'englishPatterns':list(dict.fromkeys([norm(text)]+(proposal['englishPatterns'] if proposal else [])+(['how are u','how r u'] if text=='How are you?' else []))),'signLanguage':'ASL','dataset':'CLERC Épée v0.3','sourceStatus':'staged-keypoints' if staged else 'indexed-keypoints','license':source['license'],'licenseURL':source['licenseURL'],'sourceURL':source['source'],'variants':[{'clipId':r['clip_id'],'signer':r['signer_id'],'frames':int(r['n_frames']),'fps':float(r['fps']),'url':source['source']+'keypoints/'+r['clip_id']+'.npy'} for r in rows],'sourceVideoURL':None,'translationEligible':False,'humanReview':None})

folder=root/'asset-downloads/sentence-research-20261018';info=json.loads((folder/'info.json').read_text());revision=info['sha'];card=(folder/'README.md').read_text()
if '2M-Flores is released under CC-BY-SA4.0' not in card:raise ValueError('Data license not verified')
sizes={r['path']:r for r in json.loads((folder/'file-sizes.json').read_text())}
with (folder/'dev-metadata.csv').open(encoding='utf-8-sig',newline='') as f:flores={r['id']:r for r in csv.DictReader(f)}
for identity in ['390','601','602','603','604','605','531','968']:
    r=flores[identity];member='data/dev/'+r['file_name'];entry=sizes.get(member)
    if not entry or member not in {x['rfilename'] for x in info['siblings']}:raise ValueError('Source file missing: '+member)
    if any(norm(item['text'])==norm(r['sentence']) for item in items):raise ValueError('Cross-source duplicate needs provenance merge')
    url='https://huggingface.co/datasets/alj68/2M-Flores-ASL/resolve/'+revision+'/'+member
    items.append({'id':'asl.utterance.flores-dev-'+identity,'text':r['sentence'],'englishPatterns':[norm(r['sentence'])],'signLanguage':'ASL','dataset':'2M-Flores-ASL','sourceStatus':'external-recording','license':'CC-BY-SA-4.0','licenseURL':'https://creativecommons.org/licenses/by-sa/4.0/','sourceURL':'https://huggingface.co/datasets/alj68/2M-Flores-ASL','revision':revision,'member':member,'sourceVideoURL':url,'sourceVideoBytes':entry['size'],'publisherSHA256':entry.get('lfs',{}).get('oid'),'publisherHashVerifiedLocally':False,'originalTextSourceURL':r['URL'],'gloss':r['gloss'],'translationEligible':False,'humanReview':None})

if len({i['id'] for i in items})!=len(items) or len({norm(i['text']) for i in items})!=len(items):raise ValueError('Duplicate identity/meaning needs review')
result={'schema':'complete-expression-source-index/1','notice':'Discovery/review metadata only. Source-recording previews are separate from Aarav. No new validated signs, templates or rigged animations.','sources':{'clercMetadataSHA256':digest(metadata.read_bytes()),'floresRevision':revision,'floresCardSHA256':digest((folder/'README.md').read_bytes()),'floresMetadataSHA256':digest((folder/'dev-metadata.csv').read_bytes())},'items':items}
target=root/'imports/phrase-candidates/complete-expression-index.json';output=(json.dumps(result,indent=2,ensure_ascii=False)+'\n').encode()
prior=target.read_bytes() if target.exists() else None
if prior is not None and prior!=output:raise ValueError('Existing index differs; explicit merge review required')
report={'schema':'complete-expression-index-report/1','runtimeMotionImports':0,'added':len(items) if prior is None else 0,'merged':0,'skipped':len(items) if prior is not None else 0,'conflicting':0,'pendingReview':len(items),'externalRecordings':sum(bool(i['sourceVideoURL']) for i in items),'indexSHA256':digest(output),'baselineSHA256':digest(prior) if prior else None}
report_path=root/args.report
if report_path.exists():raise ValueError('Use a fresh report filename')
if args.commit:
    if not args.plan or load(args.plan)!=report:raise ValueError('Matching saved dry-run required')
    if prior is None:target.write_bytes(output)
report_path.parent.mkdir(parents=True,exist_ok=True);report_path.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))
