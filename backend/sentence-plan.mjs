// English meaning/coverage planning, not an ASL grammar or approval system.
// All playback IDs come from the existing server registry and permission set.
const grammar=new Set(['a','an','the','am','is','are','be']);
const contractions={"you're":'you',"we're":'we',"they're":'they',"i'm":'i',"he's":'he',"she's":'she',"it's":'it'};
const verbs={walk:['walks','walked','walking'],drink:['drinks','drank','drinking'],work:['works','worked','working'],cook:['cooks','cooked','cooking'],read:['reads','reading'],sleep:['sleeps','slept','sleeping'],wait:['waits','waited','waiting'],help:['helps','helped','helping'],want:['wants','wanted','wanting'],go:['goes','went','going']};
const forms=new Map(Object.entries(verbs).flatMap(([base,values])=>values.map((word,index)=>[word,{base,feature:index===0?'agreement':word.endsWith('ing')?'aspect':'past'}])));
const plurals={cats:'cat',dogs:'dog',books:'book',teachers:'teacher',computers:'computer',girls:'girl',boys:'boy'};
const expressions=['right now','at the moment','hot dog','give up','look after','take off','piece of cake'];
const negative=words=>words.some(w=>/n['’]t$/.test(w)||['not','never','no','none','nothing','nobody','neither','nor','without','cannot','dont','cant','wont','nto','nott'].includes(w));
const wh=new Set(['where','who','what','when','why','how','which']);
const subjects=new Set(['i','you','he','she','we','they','teacher','girl','boy','mother','father','husband','wife','child']);
const sourceSpan=(input,tokens,start,end)=>({startWordIndex:start,endWordIndex:end,startChar:tokens[start].start,endChar:tokens[end-1].end,sourceText:input.slice(tokens[start].start,tokens[end-1].end)});

export function planSentence({input,interpretation,sequence,unsupported,registry,allowedIds,language,requireComplete=false}){
 const {tokens,resolutions,protectedSpans}=interpretation;
 const entriesById=new Map(registry.map(e=>[e.id,e]));
 const exactClips=new Map(sequence.map(c=>[c.startWordIndex,entriesById.get(c.id)]));
 const semantic=new Map(resolutions.map(r=>[r.startWordIndex,r]));
 const names=new Set(protectedSpans.flatMap(p=>Array.from({length:p.endWordIndex-p.startWordIndex},(_,i)=>p.startWordIndex+i)));
 const units=[],grammarNotes=[],clauses=[];
 const choose=(conceptId,word)=>registry.find(e=>e.conceptId===conceptId&&allowedIds.has(e.id)&&e.motionUrl&&(e.gloss===word||e.inputMappings.includes(word)))||registry.find(e=>e.conceptId===conceptId&&allowedIds.has(e.id)&&e.motionUrl);
 const makeClip=(entry,span,normalization)=>({...entry,...span,label:entry.labels[language],interpretedText:normalization||span.sourceText,validated:entry.validated===true,order:0,vocabularyMode:'research'});
 for(const plan of interpretation.plans){
  const start=plan.wordIndices[0],end=plan.wordIndices.at(-1)+1,words=tokens.slice(start,end).map(t=>t.normalized);
  const isNegative=negative(words)&&!(words.length===1&&words[0]==='no');
  const question=/\?/.test(input.slice(tokens[end-1].end,tokens[end]?.start??input.length))||wh.has(words[0])||['can','could','would','will','do','does','did','is','are','am'].includes(words[0]);
  const clause={id:plan.clause,...sourceSpan(input,tokens,start,end),question,negative:isNegative,unitIds:[],notes:[]};
  if(question)clause.notes.push('Question intent is retained. These recordings have no validated question facial/body grammar.');
  for(let i=start;i<end;){
   const token=tokens[i],word=token.normalized;
   if(grammar.has(word)&&!names.has(i)){
    grammarNotes.push({...sourceSpan(input,tokens,i,i+1),explanation:'English article/copula retained in the original; no separate lexical clip. This is not an ASL grammar rule.'});i++;continue;
   }
   let stop=i+1,entry=exactClips.get(i),r=semantic.get(i),normalization=null,reason=null,kind='concept';
   if(names.has(i)){while(stop<end&&names.has(stop))stop++;kind='name';reason='Name preserved. No validated fingerspelling animations are installed.';entry=null;}
   else {
    const expression=expressions.find(p=>p.split(' ').every((w,n)=>tokens[i+n]?.clause===token.clause&&tokens[i+n]?.normalized===w&&(n===0||/^[\s-]+$/u.test(input.slice(tokens[i+n-1].end,tokens[i+n].start)))));
    if(r){stop=r.endWordIndex;if(r.status==='ambiguous'){reason='Choose the intended meaning before playback.';entry=null;}
     else if(stop>i+1||!entry){
      // A longest concept span wins over a shorter raw word match, even when
      // its synonym mapping is not reviewed. Never fall through to its tail.
      if(r.mappingReviewed){entry=choose(r.conceptId,r.aliasText);}
      else if(stop>i+1||r.aliasKind!=='lemma'&&!forms.has(word)&&!plurals[word]){entry=null;reason='This phrase/synonym mapping needs review; its individual words are not substituted.';}
     }
    }
    if(expression&&stop===i+1){stop=i+expression.split(' ').length;entry=null;reason='Multiword meaning needs a reviewed mapping; isolated word substitution is held.';}
    if(!entry&&!reason&&contractions[word]){
     const base=contractions[word],candidate=registry.find(e=>e.motionUrl&&e.gloss===base&&allowedIds.has(e.id));
     r=candidate?{conceptId:candidate.conceptId}:r;entry=candidate;normalization=`${token.text} → ${base.toUpperCase()} + English copula`;
     grammarNotes.push({...sourceSpan(input,tokens,i,i+1),explanation:normalization+'. The original contraction stays unchanged; this does not encode ASL tense/grammar.'});
     if(!entry)reason=`The person “${base}” has no enabled motion; it cannot be omitted.`;
    }
    if(!entry&&!reason&&(forms.has(word)||plurals[word])){
     const form=forms.get(word)||{base:plurals[word],feature:'plural'},candidate=registry.find(e=>e.motionUrl&&e.gloss===form.base&&allowedIds.has(e.id));
     // Only a narrow declared English inflection table is normalized. No
     // arbitrary suffix stripping, noun/verb substitution or new synonyms.
     if(candidate){r={conceptId:candidate.conceptId};normalization=`${token.text} → ${form.base.toUpperCase()}`;
      if(form.feature==='agreement'&&subjects.has(tokens[i-1]?.normalized)){entry=candidate;grammarNotes.push({...sourceSpan(input,tokens,i,i+1),explanation:normalization+' (English verb agreement after an overt subject only; no sentence grammar validated).'});}
      else if(form.feature==='agreement')reason='This inflected word may be a noun or verb; no context-safe mapping is available.';
      else reason=`${normalization}: base motion exists, but ${form.feature} meaning is not represented by a reviewed pattern. Playback held.`;
     }
    }
   }
   if(/\p{N}/u.test(word)){entry=null;reason='Number preserved. No reviewed number/fingerspelling mapping is available.';kind='number';}
   if(entry&&r?.conceptId&&entry.conceptId!==r.conceptId){entry=null;reason='The available motion does not match the selected sense.';}
   if(isNegative||requireComplete){entry=null;reason=isNegative?'Negation requires a reviewed phrase; positive clips will not be played.':'A complete reviewed expression is unavailable.';}
   const span=sourceSpan(input,tokens,i,stop);
   if(entry&&!allowedIds.has(entry.id))entry=null;
   const unit={id:'meaning-'+i,...span,kind,conceptId:entry?.conceptId||r?.conceptId||null,label:entry?.labels[language]||r?.label||span.sourceText,status:entry?'available':'missing',reason:entry?'Unreviewed lexical recording; meaning and retargeting need human ASL review.':reason||'No enabled motion for this essential concept.',normalization,clip:entry?makeClip(entry,span,normalization):null};
   units.push(unit);clause.unitIds.push(unit.id);i=stop;
  }
  if(question&&!words.some(w=>wh.has(w))){const unit={id:'question-'+start,...sourceSpan(input,tokens,start,end),kind:'question-marker',label:'Yes/no question marking',status:'missing',reason:'Question facial/body marking is unavailable; a statement-like clip sequence would lose the question.',clip:null};units.push(unit);clause.unitIds.push(unit.id);}
  clauses.push(clause);
 }
 const missing=units.filter(u=>u.status==='missing'),available=units.filter(u=>u.clip),blocked=missing.length>0||!units.length;
 const finalSequence=blocked?[]:available.map((u,index)=>({...u.clip,order:index}));
 const missingWords=new Map();for(const u of missing)for(let i=u.startWordIndex;i<u.endWordIndex;i++)missingWords.set(i,{term:tokens[i].text,wordIndex:i,startChar:tokens[i].start,endChar:tokens[i].end,reason:u.reason,conceptId:u.conceptId});
 const finalTimeline=units.filter(u=>u.kind!=='question-marker').map(u=>({...sourceSpan(input,tokens,u.startWordIndex,u.endWordIndex),type:!blocked&&u.clip?'supported':'unsupported',reason:u.reason,...(!blocked&&u.clip?{sequenceIndex:available.indexOf(u)}:{})}));
 for(const u of units)delete u.clip;
 return {sequence:finalSequence,unsupported:[...missingWords.values()],timeline:finalTimeline,plan:{schema:'sentence-plan/1',status:blocked?'blocked':'approximate',completeTranslation:false,originalInput:input,order:'English source order; no automatic ASL rearrangement',units,clauses,grammarNotes,
  coverage:{totalConcepts:units.length,availableConcepts:available.length,missingConcepts:missing.length,queuedConcepts:finalSequence.length},
  summary:blocked?'Incomplete meaning: playback held for the entire message. Review the missing concepts; no positive or partial substitute will play.':'All identified lexical concepts have enabled recordings. Approximate sign sequence only; grammar, context and ASL correctness remain unvalidated.',
  limitations:['No reviewed ASL sentence pattern is applied.','Finger spelling is unavailable.','Question/nonmanual grammar, referents, direction and source senses need human ASL review.']}};
}
