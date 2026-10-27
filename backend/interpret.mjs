import {concepts as defaultConcepts,vocabularyManifest,reviewed,reviewedMapping} from '../web/vocabulary.mjs';
export const fold=text=>text.normalize('NFKC').toLowerCase().replaceAll('’',"'");
export function tokenize(text){let clause=0,last=0;return [...text.matchAll(/[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu)].map((m,index)=>{if(/[.!?;\n]/u.test(text.slice(last,m.index)))clause++;last=m.index+m[0].length;return {text:m[0],normalized:fold(m[0]),index,start:m.index,end:last,clause};});}
export function editDistance(a,b){if(Math.abs(a.length-b.length)>2)return 3;const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}return d[a.length][b.length];}
const protectedWords=new Set('a an the i me my mine we our you your he she it they their am is are was were be been do does did to of for at on in with by from and or but if then this that these those not no never nothing nobody neither without cannot cant dont wont can will want need went sat have has had here there please unknown quasar astrophysics xylophone kelp yelp hemp hell heap helpful helpless river deposit account money atm financial bag suitcase heavy weight lamp bulb electricity illumination turn left answer correct surname mr mrs ms dr name named called'.split(' '));
for(const question of ['how','where','who','when','why','what'])protectedWords.add(question);
const negation=new Set(['not','never','no',"don't","doesn't","didn't","can't","won't","isn't","aren't",'cannot','dont','cant','wont','nto','nott']);
const commonTypos={hepl:'help',hlep:'help',waetr:'water',famliy:'family',rememebr:'remember',plesae:'please'};
function typoContext(candidate,tokens,index){const before=tokens[index-1]?.normalized,after=tokens[index+1]?.normalized;return candidate==='help'?['need','want','please'].includes(before):candidate==='water'?['need','want','drink'].includes(before):candidate==='family'?['my','our','his','her','the'].includes(before):candidate==='remember'?['i','we','you'].includes(before):candidate==='please'?['help','give','call'].includes(after):false;}
function declaredNameWords(tokens,clauses,original){
 const names=new Set(),boundaries=new Set('a an the i me my mine we our you your he she it they their and but or then please need want can will is are was were have has for to with from at on in later soon now tomorrow today tonight back'.split(' ')),titles=new Set(['mr','mrs','ms','dr']);
 const collect=(words,start)=>{for(let j=start;j<words.length&&j<start+4;j++){const word=words[j];if(boundaries.has(word.normalized)||/[\p{N}]/u.test(word.text)||(j>start&&!/^[\s-]+$/u.test(original.slice(words[j-1].end,word.start))))break;names.add(word.index);}};
 for(const words of clauses.values())for(let i=0;i<words.length;i++){
  const current=words[i].normalized,next=words[i+1]?.normalized;
  if(current==='name'&&next==='is'||current==='call'&&next==='me')collect(words,i+2);
  else if(['named','called'].includes(current)||titles.has(current))collect(words,i+1);
 }
 // A title's full stop is not a boundary between the title and the name.
 for(let i=0;i<tokens.length-1;i++)if(titles.has(tokens[i].normalized)&&/^[.\s]+$/u.test(original.slice(tokens[i].end,tokens[i+1].start))){const words=clauses.get(tokens[i+1].clause);collect(words,words.findIndex(word=>word.index===i+1));}
 return names;
}
function nameProtected(tokens,index,clauses,names){const t=tokens[index],words=clauses?.get(t.clause)||tokens.filter(x=>x.clause===t.clause);const position=words.findIndex(x=>x.index===index);return names?.has(index)||(/[A-Z]/.test(t.text[0])&&position>0&&!protectedWords.has(t.normalized)&&!['Help','Yes','No','Love'].includes(t.text));}
function contextScore(concept,words,index){const around=words.map(t=>t.normalized),all=new Set(around),has=list=>list.some(w=>all.has(w));switch(concept.id){case 'asl.bank.financial':return has(['money','deposit','deposited','account','atm','withdraw','loan'])?3:0;case 'asl.bank.river-edge':return has(['river','stream','shore','fishing'])?3:0;case 'asl.light.illumination':return has(['lamp','bulb','electricity','illumination'])||around.join(' ').includes('turn on')?3:0;case 'asl.light.low-weight':return has(['bag','suitcase','weight','heavy','carry'])?3:0;case 'asl.right.direction':return has(['turn','left','direction','rightward'])?3:0;case 'asl.right.correct':return has(['answer','correct','true'])||/\b(are|is|was) right\b/.test(around.join(' '))?3:0;case 'asl.like.enjoy':return ['i','you','we','they','really'].includes(words.find(t=>t.index===index-1)?.normalized)?2:0;case 'asl.like.resemblance':return has(['looks','look','similar','resembles'])?3:0;default:return 0;}}
export function interpretText(original,{senses={},correctionDecisions={},concepts=defaultConcepts,templates=vocabularyManifest.templates,sentenceMode=false}={}){
 const tokens=tokenize(original),corrections=[],clarifications=[],resolutions=[],heldClauses=[],spellingVocabulary=new Set(concepts.flatMap(c=>[...c.aliases.map(a=>a.text),...c.inflections]).filter(w=>!w.includes(' '))),lexicon=new Set([...protectedWords,...spellingVocabulary]);
 const clauseTokens=new Map();for(const token of tokens){const words=clauseTokens.get(token.clause)||[];words.push(token);clauseTokens.set(token.clause,words);}
 const declaredNames=declaredNameWords(tokens,clauseTokens,original);
 const protect=index=>declaredNames.has(index)||(nameProtected(tokens,index,clauseTokens,declaredNames)&&(!sentenceMode||!spellingVocabulary.has(tokens[index].normalized)));
 if(!correctionDecisions||typeof correctionDecisions!=='object'||Array.isArray(correctionDecisions))throw Object.assign(Error('Correction choices must be a JSON object.'),{status:400});
 for(const key of Object.keys(correctionDecisions))if(!/^\d+$/.test(key)||Number(key)>=tokens.length)throw Object.assign(Error('Correction choice has no matching source word.'),{status:400});
 for(const token of tokens){
  if(lexicon.has(token.normalized)||negation.has(token.normalized)||protect(token.index)||/[\p{N}'’]/u.test(token.text)||token.text!==token.text.toLowerCase()||token.text.length<4||token.text.length>24)continue;
  const candidates=[...spellingVocabulary].filter(w=>Math.abs(w.length-token.normalized.length)<=2&&!negation.has(w)).map(w=>({text:w,distance:editDistance(token.normalized,w),contextMatch:typoContext(w,tokens,token.index)})).filter(c=>c.distance<=2).sort((a,b)=>a.distance-b.distance||Number(b.contextMatch)-Number(a.contextMatch)||a.text.localeCompare(b.text)).slice(0,5);
  if(!candidates.length)continue;const likely=commonTypos[token.normalized],explicit=correctionDecisions[String(token.index)];if(explicit&&explicit!=='keep'&&!candidates.some(c=>c.text===explicit))throw Object.assign(Error('Correction choice is outside the generated candidate list.'),{status:400});
  const confident=likely&&candidates[0].text===likely&&candidates[0].distance===1&&candidates[0].contextMatch;
  const chosen=explicit==='keep'?null:explicit||confident&&likely||null;
  const record={wordIndex:token.index,startChar:token.start,endChar:token.end,original:token.text,proposed:chosen||likely||candidates[0].text,applied:Boolean(chosen),basis:explicit?'user choice':confident?'known transposition with request context':'suggestion only; unknown words stay unchanged',candidates};
  corrections.push(record);if(chosen)token.normalized=chosen;
 }
 const aliasEntries=concepts.flatMap(concept=>[...concept.aliases.map(alias=>({concept,alias,words:tokenize(alias.text).map(t=>t.normalized),inflection:false})),...concept.inflections.map(text=>({concept,alias:{text,kind:'inflection'},words:[text],inflection:true}))]).sort((a,b)=>b.words.length-a.words.length);
 for(let index=0;index<tokens.length;){const token=tokens[index];
  if(protect(index)){index++;continue;}
  const matches=aliasEntries.filter(e=>e.words.every((word,n)=>tokens[index+n]?.normalized===word&&tokens[index+n]?.clause===token.clause&&(n===0||/^[\s-]+$/u.test(original.slice(tokens[index+n-1].end,tokens[index+n].start)))));
  if(!matches.length){index++;continue;}const longest=matches[0].words.length,choices=matches.filter(e=>e.words.length===longest),end=tokens[index+longest-1],words=clauseTokens.get(token.clause).filter(t=>Math.abs(t.index-index)<=5),key='occurrence:'+index,selected=senses[key];
  const ranked=choices.map(e=>({...e,score:contextScore(e.concept,words,index)})).sort((a,b)=>b.score-a.score),unique=new Map(ranked.map(e=>[e.concept.id,e]));let chosen=selected?ranked.find(e=>e.concept.id===selected):unique.size===1?ranked[0]:ranked[0].score>=3&&ranked[0].score>ranked[1].score?ranked[0]:null;
  if(selected&&!chosen)throw Object.assign(Error('Meaning choice is not a candidate for this source occurrence.'),{status:400});
  const span={startWordIndex:index,endWordIndex:index+longest,startChar:token.start,endChar:end.end,sourceText:original.slice(token.start,end.end),interpretedText:tokens.slice(index,index+longest).map(t=>t.normalized).join(' ')};
  if(!chosen){clarifications.push({term:span.sourceText,wordIndex:index,meaningKey:key,...span,senses:[...unique.values()].map(e=>({id:e.concept.id,label:e.concept.label+' — '+e.concept.definition})),reason:'Choose the intended concept; context is insufficient.'});resolutions.push({...span,status:'ambiguous',conceptId:null,meaningKey:key});}
  else resolutions.push({...span,status:'resolved',meaningKey:key,candidateSenses:[...unique.values()].map(e=>({id:e.concept.id,label:e.concept.label+' — '+e.concept.definition})),conceptId:chosen.concept.id,label:chosen.concept.label,sense:chosen.concept.sense,definition:chosen.concept.definition,mappingReviewed:!chosen.inflection&&reviewedMapping(chosen.concept,chosen.alias),aliasKind:chosen.alias.kind||'lemma',aliasText:chosen.alias.text,inflection:chosen.inflection,basis:selected?'explicit occurrence choice':chosen.score>=3?'context rule':'exact concept candidate',animationIds:chosen.concept.animationIds,linguisticStatus:chosen.concept.linguisticReview.status});
  index+=longest;
 }
 const clauses=new Map();for(const t of tokens){const words=clauses.get(t.clause)||[];words.push(t);clauses.set(t.clause,words);}
 const plans=[];for(const [id,words] of clauses){const normalized=words.map(t=>t.normalized).join(' '),template=templates.find(t=>t.englishPatterns.includes(normalized)&&reviewed(t.review));
  if(template){plans.push({clause:id,type:'reviewed-template',templateId:template.id,animationIds:template.animationIds,wordIndices:words.map(t=>t.index)});continue;}
  // Isolated NO may be inspected in the explicit legacy research mode. A
  // negated clause cannot be rendered by dropping its negative words.
  const negative=words.some(t=>!declaredNames.has(t.index)&&negation.has(t.normalized))&&!(words.length===1&&words[0].normalized==='no');
  if(negative){heldClauses.push({clause:id,wordIndices:words.map(t=>t.index),sourceText:original.slice(words[0].start,words.at(-1).end),reason:'Negation needs a reviewed complete phrase/template; positive lexical playback is held.'});plans.push({clause:id,type:'held-negation',wordIndices:words.map(t=>t.index)});}else plans.push({clause:id,type:'lexical-prototype',wordIndices:words.map(t=>t.index),grammaticalTranslation:false,note:'No reviewed complete ASL sentence/template is available.'});
 }
 let interpretedText='',offset=0;for(const correction of corrections.filter(c=>c.applied)){interpretedText+=original.slice(offset,correction.startChar)+tokens[correction.wordIndex].normalized;offset=correction.endChar;}interpretedText+=original.slice(offset);
 const protectedSpans=tokens.filter(t=>declaredNames.has(t.index)).map(t=>({kind:'name',sourceText:t.text,startWordIndex:t.index,endWordIndex:t.index+1,startChar:t.start,endChar:t.end,reason:'Declared name preserved; reviewed fingerspelling is unavailable.'}));
 return {originalText:original,interpretedText,normalizedText:fold(interpretedText).replace(/\s+/gu,' ').trim(),tokens,corrections,clarifications,resolutions,heldClauses,protectedSpans,plans,usesPaidService:false,grammaticalTranslation:false};
}
