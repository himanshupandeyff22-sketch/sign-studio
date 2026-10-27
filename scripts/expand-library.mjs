// Resumable orchestration over the existing licensed archive reader/importer.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {extractMotion} from './import-core.mjs';
import {sha256,motionIdentity} from './motion-identity.mjs';
import {auditRetarget} from './retarget-audit.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));process.chdir(root);
const args=new Set(process.argv.slice(2)),dir='imports/continuous',statePath=dir+'/state.json';
fs.mkdirSync(dir,{recursive:true});
const json=p=>JSON.parse(fs.readFileSync(p,'utf8')),manifest=()=>json('web/vocabulary-manifest.json');
const save=(p,value)=>{fs.writeFileSync(p+'.tmp',JSON.stringify(value,null,2)+'\n');fs.renameSync(p+'.tmp',p);};
const state=fs.existsSync(statePath)?json(statePath):{schema:'asl-expansion-progress/1',startedAt:new Date().toISOString(),source:'https://osf.io/mqzyk/',rows:{},batches:[],downloadAttempts:0};
const permission=json(dir+'/source-permission.json');
if(permission.language!=='ASL'||permission.license!=='CC-BY-4.0'||permission.archive!=='https://osf.io/download/tcnhs/'||permission.evidence.some(e=>sha256(fs.readFileSync(e.path))!==e.sha256))throw Error('Source permission evidence changed; re-audit before continuing.');
if(!fs.existsSync(dir+'/baseline.json'))save(dir+'/baseline.json',manifest());
let locked;
try{locked=fs.openSync(dir+'/runner.lock','wx');fs.writeFileSync(locked,String(process.pid));}
catch{const pid=Number(fs.readFileSync(dir+'/runner.lock','utf8'));let alive=true;try{process.kill(pid,0);}catch(e){if(e.code==='ESRCH')alive=false;else throw e;}if(alive)throw Error('Expansion runner already active: '+pid);fs.unlinkSync(dir+'/runner.lock');locked=fs.openSync(dir+'/runner.lock','wx');fs.writeFileSync(locked,String(process.pid));}
function cacheInventory(){const cache=new Map();for(const d of fs.readdirSync('asset-downloads',{withFileTypes:true}).filter(d=>d.isDirectory()))for(const file of fs.readdirSync('asset-downloads/'+d.name).filter(f=>f.endsWith('.glb.inspection.json'))){try{const p='asset-downloads/'+d.name+'/'+file.slice(0,-16),inspection=json(p+'.inspection.json');if(fs.existsSync(p)&&sha256(fs.readFileSync(p))===inspection.sha256)cache.set(inspection.file,{path:p,inspection});}catch{}}return cache;}
const groups={food:'bacon banana butter carrot cereal cherry dessert egg fruit garlic grapes lemon meat mushroom onion peach pie popcorn potato pumpkin salad salt sandwich shrimp soda soup sour strawberry sweet tomato turkey wine',people:'adult actor audience boy children cousin girl grandfather grandmother husband king man nephew niece parents policeman president queen scientist secretary uncle waiter wife woman young',home:'alarm balloon basket bath battery bed bedroom blanket bottle bowl box cabinet chain chair clock clothes comb curtain door drawer eyeglasses furniture garage glasses gloves hat house jacket jeans kitchen knife mirror napkin necklace pants pillow plate scissors screwdriver shampoo shelf shirt shoes shoulder shower soap socks sofa spoon stairs towel wall window',time:'after again afternoon always before day end everyday finally forever former friday future hour minute month morning never night past saturday since spring summer sunday thursday tuesday until vacation wednesday weekend winter',travel:'africa america area asia australia back behind bicycle boat bridge building california canada canoe center china church city country east egypt europe farm forest front hawaii island japan left middle mountain museum north ocean outside park place prison river road south square street top traffic travel under up west world',education:'analyze art attention certificate class concept culture degree dictionary draw erase eraser evaluate example experiment expert form grammar graduate history honor information letter map memorize music newspaper note perspective picture print problem program proof question reason research responsibility result rule schedule sentence shape skill specific staff subtract team technology test text theory translate unique verb visualize voice volunteer word',emotion:'angry awkward bored brave careful comfortable crazy curious embarrass emotion enjoy excited famous favorite fear feel fool fun funny gay guilty hate honest jealous kind lonely mad nervous peace perfect pity poor popular positive precious pretty pride puzzled quiet really relief respect rich rude scared secret sensitive serious shame silly smart smile snob strange stress strict strong stubborn stupid sure surprise suspect tough ugly weak wonder worry worse wow',communication:'act action add address advantage agreement all alone amazing and announce answer appear argue arrive ask avoid awake award balance barely beg believe benefit best bet better birth birthday blame bless blind blood body bone borrow bother brave break breathe bring brush bug business busy call camping cannot carry celebrate challenge chance change character chase chat check choke chop circle clean clear clueless conflict congratulations contact continue cooperate copy cost cough count cry dance danger date death deep demand deny desert destroy different disappear disconnect discuss dissolve divide divorce document doubt double dream drop drug drum drunk dry earn earth earthquake easy electrician energy equal escape event evidence excuse expect expensive express face fail fake fat fault few fight find fix flag floor flute fly forbid free freeze full gamble game gas generation get ghost gift goal goat gold gone good gossip government grass gray green grow guitar haircut half hanukkah happen hard head headache health heap hearing heart heaven heavy helicopter helmet hide high hockey homework hope horse hot hungry ice if impossible improve include increase innocent insect interest interpreter invite iron jam job join joke jump keep kill kiss language last laugh lazy lead lend less lie lip list listen little live long look loud lucky lunch many marry maybe meaning medicine metal mind misunderstand mock monster move much must mustache myself name need negative neutral nice normal nose not off ok old on one oral orange other our out over overlook owe pack pain paint parade pass pay pencil person piano pig pink plan plant play plenty plus point poop possible postpone pour power predict price priest process promise promote pull punish purple push put rabbit race rain rainbow rake rat ready red refuse relationship relax religion remove request resist rest return ring rob rock rooster rope ruin run save scold scream see sell send sequence sew share shave sheep shovel show sign sing sit situation skate ski skin slow small smell smoking smooth snake snow soccer soft some sound spider squirrel stamp star stare stay steal sticky sting stir stop straight struggle stuck sun sunrise surgery suspend swallow sweep sweetheart swim swing talk tan taste tease teeth telephone tell tennis thanksgiving that therapy there thermometer thin think thirsty three throw ticket tiger tissue tobacco together tornado touch tournament train transfer tree trouble truth turtle two type university use vampire vegetable violin vomit vote wander war warm warn watch way we weather wedding weight wet whale whatever which whistle white will win wind wish with wolf wood worm wristwatch year yellow zero'};
function category(word){for(const [key,words]of Object.entries(groups))if(words.split(' ').includes(word))return key;return 'other';}
function run(command,log){const result=spawnSync(process.execPath,command,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});fs.writeFileSync(log,(result.stdout||'')+'\n'+(result.stderr||''));if(result.status!==0)throw Error('Command failed; see '+log);}
try{
 let m=manifest(),cache=cacheInventory();
 const imported=new Set(m.animations.flatMap(a=>a.sources.map(s=>s.projectURL+'#'+s.archiveFile)));
 const catalogue=m.sourceCatalog.filter(s=>!imported.has(s.projectURL+'#'+s.archiveFile));
 const missing=catalogue.filter(s=>!cache.has(s.archiveFile)&&!state.rows[s.id]?.terminal);
 if(missing.length&&!args.has('--local-only')&&state.downloadAttempts<2){
  state.downloadAttempts++;save(statePath,state);save(dir+'/remaining-downloads.json',missing.map(s=>s.sourceGloss));
  console.log('Downloading '+missing.length+' remaining source files; bounded archive retries enabled.');
  try{run(['scripts/asl-archive.mjs','--remote','--sample-file='+dir+'/remaining-downloads.json','--output=continuous-20261019'],dir+'/download-attempt-'+state.downloadAttempts+'.log');}catch(e){state.downloadError=e.message;save(statePath,state);}
  cache=cacheInventory();
 }
 // A receipt is committed only after repeat import proves idempotence. If a
 // process stopped after commit, replay that batch before considering new rows.
 for(const batch of state.batches.filter(b=>!b.completed)){
  const stamp=Date.now(),report=`${dir}/recovery-${stamp}`;
  run(['scripts/import-asl-motion.mjs','--batch='+batch.file,'--report='+report+'-dry.json'],report+'.log');
  run(['scripts/import-asl-motion.mjs','--batch='+batch.file,'--commit','--plan='+report+'-dry.json','--report='+report+'-commit.json'],report+'-commit.log');
  batch.completed=true;for(const id of batch.ids||[]){const row=state.rows[id];if(row){row.status='registered-recovered';row.terminal=true;}}save(statePath,state);
 }
 let candidates=[];
 function commit(){
  if(!candidates.length)return;
  const batchId='continuous-asl-'+String(state.batches.length+1).padStart(3,'0'),file=dir+'/'+batchId+'.json';
  const batch={schema:'asl-motion-batch/1',id:batchId,conceptProposals:candidates.flatMap(c=>c.proposal?[c.proposal]:[]),entries:candidates.map(c=>c.entry)};
  save(file,batch);const receipt={file,completed:false,ids:candidates.map(c=>c.sourceId)};state.batches.push(receipt);save(statePath,state);
  const report=dir+'/'+batchId;
  run(['scripts/import-asl-motion.mjs','--batch='+file,'--report='+report+'-dry.json'],report+'-dry.log');
  run(['scripts/import-asl-motion.mjs','--batch='+file,'--commit','--plan='+report+'-dry.json','--report='+report+'-commit.json'],report+'-commit.log');
  const result=json(report+'-commit.json');
  run(['scripts/import-asl-motion.mjs','--batch='+file,'--report='+report+'-repeat-dry.json'],report+'-repeat.log');
  run(['scripts/import-asl-motion.mjs','--batch='+file,'--commit','--plan='+report+'-repeat-dry.json','--report='+report+'-repeat-commit.json'],report+'-repeat-commit.log');
  const repeat=json(report+'-repeat-commit.json');if(repeat.counts.added||repeat.counts.merged||repeat.before.animations!==repeat.after.animations)throw Error('Repeat import changed the library.');
  for(const c of candidates){const row=result.rows.find(r=>r.id===c.entry.id);state.rows[c.sourceId]={...state.rows[c.sourceId],status:row.status,reason:row.reason,assetId:c.entry.id,conceptId:c.entry.conceptId,batch:file,terminal:true};}
  receipt.completed=true;candidates=[];save(statePath,state);m=manifest();console.log(batchId+': '+result.counts.added+' added, '+repeat.counts.skipped+' repeat-skipped; '+m.animations.length+' total motions.');
 }
 const queuedHashes=new Map(),queuedContent=new Map();
 for(const source of catalogue){
  if(state.rows[source.id]?.terminal)continue;
  const found=cache.get(source.archiveFile),word=source.sourceGloss;
  if(!found){state.rows[source.id]={word,status:'download-unavailable',reason:'No verified source bytes; retry budget '+state.downloadAttempts+'/2',terminal:state.downloadAttempts>=2};save(statePath,state);continue;}
  const row=state.rows[source.id]={word,sourcePath:found.path,sourceURL:source.archiveURL+'#'+source.archiveFile,language:'ASL',license:'CC-BY-4.0',sourceSHA256:found.inspection.sha256,status:'inspecting',terminal:false};
  try{
   const bytes=fs.readFileSync(found.path);if(bytes.length!==source.size)throw Error('Source size conflicts with catalogue revision.');
   const sameFile=m.animations.find(a=>a.sourceGLBSHA256===row.sourceSHA256),queuedFile=queuedHashes.get(row.sourceSHA256);
   if(sameFile||queuedFile){row.status='conflicting-label';row.canonicalAsset=sameFile?.id||queuedFile;row.reason='Identical source bytes under another label; no duplicate concept or motion imported.';row.terminal=true;continue;}
   const motion=extractMotion(bytes,{id:'3dlex-'+word,word});if(Buffer.byteLength(JSON.stringify(motion))>4*1024*1024)throw Error('Motion exceeds the 4 MiB runtime bound.');row.duration=motion.duration;row.tracks=motion.tracks.length;row.normalizedMotionSHA256=motionIdentity(motion);
   const sameMotion=m.animations.find(a=>a.motionContentSHA256===row.normalizedMotionSHA256),queuedMotion=queuedContent.get(row.normalizedMotionSHA256);
   if(sameMotion||queuedMotion){row.status='conflicting-label';row.canonicalAsset=sameMotion?.id||queuedMotion;row.reason='Identical normalized motion under another label; meaning equivalence requires review.';row.terminal=true;continue;}
   const matches=m.concepts.filter(c=>c.aliases.some(a=>a.text===word)||c.inflections.includes(word));
   if(matches.length>1){row.status='meaning-review-required';row.reason='Source gloss matches multiple existing senses; no arbitrary sense selected.';row.terminal=true;continue;}
   if(matches[0]&&!matches[0].aliases.some(a=>a.text===word)){row.status='meaning-review-required';row.reason='Inflection is not an approved source alias; existing concept preserved.';row.terminal=true;continue;}
   if(matches[0]?.animationIds.length){row.status='variant-review-required';row.reason='Existing canonical concept already has a different capture; legitimacy of variant requires review.';row.terminal=true;continue;}
   row.technical=auditRetarget(motion);
   const reference=matches[0]?.sources.find(s=>s.meaningReference)?.meaningReference||source.projectURL,id=matches[0]?.id||`asl.${word}.source-gloss-unverified`,sense=matches[0]?.sense||'source-gloss-unverified';
   // Unknown source senses stay explicit; no invented dictionary definition,
   // approved alias, facial expression or sentence mapping is manufactured.
   const proposal=matches.length?null:{id,signLanguage:'ASL',sense,label:word[0].toUpperCase()+word.slice(1),definition:`Unverified source gloss “${word}”. Exact sense and ASL variant require review; this is a recording candidate, not an approved English mapping.`,aliases:[word],inflections:[],exampleContexts:[],category:category(word),sourceProject:source.projectURL,license:source.license,meaningReference:reference,semanticEvidence:matches.length?undefined:'publisher-gloss-only'};
   const entry={id:'3dlex-'+word,word,conceptId:id,sense,signLanguage:'ASL',sourcePath:found.path,variantId:'3dlex-v1-source',variantLabel:'Original capture; meaning/variant unverified',sourceProject:source.projectURL,archiveURL:source.archiveURL,license:source.license,sourceLanguageVerified:true,meaningReference:reference,semanticEvidence:sense==='source-gloss-unverified'?'publisher-gloss-only':undefined};
   row.referenceStatus=matches.length?'Existing canonical same-language reference; mapping still pending':'Publisher gloss only; exact meaning/variant unknown';row.status='preflight-passed';
   queuedHashes.set(row.sourceSHA256,entry.id);queuedContent.set(row.normalizedMotionSHA256,entry.id);candidates.push({entry,proposal,sourceId:source.id});
   if(candidates.length===40)commit();
  }catch(error){row.status=/static|No animation/.test(error.message)?'static-no-motion':'technical-rejected';row.reason=error.message;row.terminal=true;}
  finally{save(statePath,state);}
 }
 commit();
 const counts={};for(const row of Object.values(state.rows))counts[row.status]=(counts[row.status]||0)+1;
 state.updatedAt=new Date().toISOString();state.counts=counts;state.pending=Object.values(state.rows).filter(r=>!r.terminal).length;save(statePath,state);
 console.log(JSON.stringify({counts,pending:state.pending,registeredMotions:manifest().animations.length,resume:'node scripts/expand-library.mjs --resume'}));
}finally{fs.closeSync(locked);fs.unlinkSync(dir+'/runner.lock');}
