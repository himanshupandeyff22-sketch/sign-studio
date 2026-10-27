import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {animations,concepts,vocabularyManifest,reviewed} from '../web/vocabulary.mjs';
import {signRegistry,isValidatedSign} from '../web/sign-registry.mjs';
import {completeExpressionOptions} from './phrase-starter.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
let cached;
// Technical evidence is bound to current file bytes and the retained avatar.
// It never changes the linguistic approval flags in the canonical manifest.
export function studioReadiness(){
  if(cached)return cached;
  let report=null;try{report=JSON.parse(readFileSync(new URL('../docs/STUDIO_ASSET_AUDIT.json',import.meta.url),'utf8'));}catch{}
  const rigSHA256=hash(readFileSync(new URL('../web/assets/aarav.glb',import.meta.url)));
  const issues=[],existing=[],verified=[],compatible=[];
  for(const asset of animations){
    try{
      const bytes=readFileSync(new URL('..'+asset.motionUrl,import.meta.url));existing.push(asset.id);
      if(hash(bytes)!==asset.sha256){issues.push(asset.id+': hash mismatch');continue;}
      const evidence=report?.motions?.find(item=>item.id===asset.id&&item.sha256===asset.sha256);
      if(evidence?.structure==='passed')verified.push(asset.id);
      if(report?.rigSHA256===rigSHA256&&evidence?.retarget==='passed')compatible.push(asset.id);
    }catch{issues.push(asset.id+': missing file');}
  }
  const expressions=completeExpressionOptions(),sourceVideoIds=(report?.sourceVideos||[]).filter(evidence=>evidence.browserPlayback==='observed'&&expressions.some(item=>item.id===evidence.id&&item.sourceVideoURL===evidence.url)).map(item=>item.id);
  const textEntries=signRegistry.filter(item=>item.motionUrl&&!item.inspectionOnly&&item.inputMappings.length);
  const researchEntries=signRegistry.filter(item=>compatible.includes(item.id)&&item.researchInputMappings?.length);
  let textAudit=null;try{const candidate=JSON.parse(readFileSync(new URL('../docs/EXPANDED_RESEARCH_TEXT_AUDIT.json',import.meta.url),'utf8'));if(candidate.basis.every(e=>hash(readFileSync(new URL('../'+e.path,import.meta.url)))===e.sha256))textAudit=candidate;}catch{}
  const compatibleSet=new Set(compatible);
  const textMotionIds=(textAudit?.motionIds||[]).filter(id=>compatibleSet.has(id)&&signRegistry.some(entry=>entry.id===id&&entry.researchInputMappings?.length));
  const textConceptIds=[...new Set(signRegistry.filter(entry=>textMotionIds.includes(entry.id)).map(entry=>entry.conceptId))];
  const countDefinitions={uniqueMotionConcepts:'Distinct concept and sense IDs with a current hash-checked, Aarav-compatible capture. Multiple captures can represent one concept.',aaravCompatible:'Distinct motion captures with current file hashes and retained-rig technical evidence. Playback checks do not establish ASL correctness.',expandedResearchTextMotions:'Compatible captures eligible for explicit research text opt-in. Ambiguous meanings can still require a sense choice; unreviewed aliases are not automatically enabled.',expandedResearchTextConcepts:'Distinct concept and sense IDs reachable through research text mappings, including meanings requiring a choice.',approvedSigns:'Signs with recorded linguistic approval. Technical playback never grants this status.',textUnavailableCaptures:'Compatible captures excluded from expanded text mapping; available for inspection only.'};
  const importedSources=new Set(animations.flatMap(a=>a.sources.map(s=>s.projectURL+'#'+s.archiveFile)));
  cached={checkedAt:report?.checkedAt||null,motionIds:compatible,researchConceptIds:textConceptIds,countDefinitions,researchTextAuditReady:Boolean(textAudit),sourceVideoIds,issues,
    counts:{expandedResearchTextConcepts:textConceptIds.length,expandedResearchTextMotions:textMotionIds.length,textUnavailableCaptures:compatible.filter(id=>!textMotionIds.includes(id)).length,registeredFiles:animations.length,onDiskFiles:existing.length,uniqueRegisteredFiles:new Set(animations.map(item=>item.sha256)).size,technicallyPlayable:verified.length,aaravCompatible:compatible.length,candidateConcepts:concepts.length,uniqueMotionConcepts:new Set(animations.filter(a=>compatibleSet.has(a.id)).map(a=>a.conceptId)).size,inspectionOnlyAssets:animations.filter(a=>a.inspectionOnly).length,catalogueEntries:(vocabularyManifest.sourceCatalog||[]).length,catalogueNotImported:(vocabularyManifest.sourceCatalog||[]).filter(s=>!importedSources.has(s.projectURL+'#'+s.archiveFile)).length,textMappedConcepts:new Set(textEntries.map(item=>item.conceptId)).size,textLinkedPreviews:textEntries.length,completeAvatarSentences:vocabularyManifest.templates.filter(item=>reviewed(item.review)&&item.animationIds?.length&&item.animationIds.every(id=>signRegistry.some(entry=>entry.id===id&&isValidatedSign(entry)))).length,sourceVideoReferences:expressions.filter(item=>item.sourceVideoURL).length,browserCheckedSourceVideos:sourceVideoIds.length,localSentenceVideos:expressions.filter(item=>item.sourceVideoURL?.startsWith('/web/')&&existsSync(new URL('..'+item.sourceVideoURL,import.meta.url))).length,approvedSigns:signRegistry.filter(isValidatedSign).length},
    notice:'Technical file/rig checks are not linguistic approval. External recordings require internet; only browser-checked source options appear in Studio.'};
  return cached;
}

