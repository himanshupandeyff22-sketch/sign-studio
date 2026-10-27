// Explain coverage without changing playback or treating word matches as ASL.
export function phraseReadiness({input,tokens,interpretation,sequence,unsupported,concepts,animations,templates}){
 const clipsByWord=new Map(),missingByWord=new Map(unsupported.map(w=>[w.wordIndex,w])),conceptByWord=new Map();
 for(const [index,clip] of sequence.entries())for(let word=clip.startWordIndex;word<clip.endWordIndex;word++){const set=clipsByWord.get(word)||new Set();set.add(index);clipsByWord.set(word,set);}
 for(const r of interpretation.resolutions)for(let word=r.startWordIndex;word<r.endWordIndex;word++)conceptByWord.set(word,r);
 return interpretation.plans.map((plan,planIndex,plans)=>{
  const words=plan.wordIndices.map(index=>tokens[index]),first=words[0],last=words.at(-1),clipIndices=new Set(plan.wordIndices.flatMap(index=>[...(clipsByWord.get(index)||[])])),clips=[...clipIndices].map(index=>sequence[index]);
  const missing=plan.wordIndices.filter(index=>missingByWord.has(index)).map(index=>{const word=missingByWord.get(index),r=conceptByWord.get(index),c=concepts.find(c=>c.id===r?.conceptId),assets=(c?.animationIds||[]).map(id=>animations.find(a=>a.id===id)).filter(Boolean);return {...word,conceptId:c?.id||null,conceptLabel:c?.label||null,inspectionAssetIds:assets.filter(a=>a.inspectionOnly).map(a=>a.id)};});
  const text=words.map(t=>t.normalized).join(' '),candidate=templates.find(t=>t.englishPatterns.includes(text));
  const completeTranslation=plan.type==='reviewed-template'&&clips.length>0&&clips.every(c=>c.validated===true&&c.templateId===plan.templateId)&&missing.length===0;
  const status=completeTranslation?'reviewed-phrase':plan.type==='held-negation'?'held-negation':plan.type==='reviewed-template'?'template-assets-pending':clips.length?(missing.length?'partial-vocabulary':'unverified-preview'):missing.some(w=>w.inspectionAssetIds.length)?'inspection-only':'missing-coverage';
  const reason=completeTranslation?'A reviewed phrase plan and its approved motions are available.':status==='held-negation'?'A reviewed negative sentence is missing. Positive word clips are held to preserve your meaning.':status==='template-assets-pending'?'The phrase plan exists, but its approved motion sequence is unavailable.':status==='partial-vocabulary'?'Only some words have preview clips. The complete phrase has not been translated.':status==='unverified-preview'?'These are unverified vocabulary previews or illustrations, not an approved phrase translation.':status==='inspection-only'?'Some candidate motions exist but await ASL review. No complete reviewed phrase is available.':'This phrase has no enabled motion sequence or complete reviewed template.';
  let endChar=plans[planIndex+1]?tokens[plans[planIndex+1].wordIndices[0]].start:input.length;while(endChar>last.end&&/\s/u.test(input[endChar-1]))endChar--;
  return {clause:plan.clause,sourceText:input.slice(first.start,endChar),startWordIndex:first.index,endWordIndex:last.index+1,startChar:first.start,endChar,status,completeTranslation,previewLabels:clips.map(c=>c.label),missingTerms:missing,templateId:candidate?.id||null,templateReview:candidate?.review?.status||'missing',reason};
 });
}
