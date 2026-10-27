import {readFileSync} from 'node:fs';
import {vocabularyManifest,reviewed} from '../web/vocabulary.mjs';
import {signRegistry,isValidatedSign} from '../web/sign-registry.mjs';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const source = read('../imports/phrase-candidates/epee-v03/manifest.json');
const definitions = [
  ['Hello', 'greeting-hello-review.json'],
  ['Thank you', 'express-thanks-review.json'],
  ['I need help', null],
  ['How are you?', 'greeting-wellbeing-review.json'],
  ['Please repeat', 'request-repeat-review.json']
];

// UI shortcuts reuse the existing phrase proposals, not a second sign registry.
const expressionIndex=read('../imports/phrase-candidates/complete-expression-index.json');
const expressionKey=text=>text.normalize('NFKC').toLowerCase().replaceAll('’',"'").replace(/\s+/gu,' ').trim().replace(/[.?!]+$/u,'').trim();
export function completeExpressionOptions(){
  return expressionIndex.items.map(item=>{
    const template=vocabularyManifest.templates.find(t=>t.id===item.id);
    const available=Boolean(template&&reviewed(template.review)&&template.animationIds.length&&template.animationIds.every(id=>{const entry=signRegistry.find(e=>e.id===id);return entry&&isValidatedSign(entry);}));
    const reason=available?'A complete reviewed ASL expression is available.':item.sourceVideoURL?'A whole-sentence ASL source video is available to watch separately. Aarav’s animation is unavailable; we will not replace this with isolated word clips.':item.sourceStatus==='staged-keypoints'?'A complete source capture is saved, but it still needs conversion to Aarav’s rig and fluent ASL review. No individual word signs will be substituted.':'A complete source capture is indexed but is not a playable Aarav animation. It needs conversion and ASL review; individual words will not be substituted.';
    return {...item,available,reason,review:{status:available?'approved':'pending',reviewer:available?template.review.reviewer:null}};
  });
}
export function findCompleteExpression(text){
  const normalized=expressionKey(text);
  return completeExpressionOptions().find(option=>option.englishPatterns.some(pattern=>expressionKey(pattern)===normalized))||null;
}

// This is a review handoff, never another translation registry. Existing
// template/concept IDs remain canonical; source candidates have no runtime URLs.
export function phraseStarterPack() {
  const items = definitions.map(([text, file]) => {
    const proposal = file ? read('../imports/phrase-proposals/' + file) : vocabularyManifest.templates.find(item => item.id === 'asl.template.request-help');
    const candidate = source.candidates.find(item => item.templateId === proposal.id);
    return {
      id:proposal.id, text, signLanguage:'ASL',
      recordPath:file ? 'imports/phrase-proposals/' + file : 'web/vocabulary-manifest.json#' + proposal.id,
      conceptIds:proposal.existingConceptIds || proposal.conceptIds || [],
      intendedSense:proposal.intendedSense || 'asking for assistance for oneself; preserve subject and request intent',
      englishPatterns:[...proposal.englishPatterns],
      referenceURL:proposal.referenceURL || 'https://www.lifeprint.com/asl101/pages-signs/h/help.htm',
      candidate:candidate ? {...candidate} : null,
      status:candidate ? 'Source staged; retargeting and signer review pending' : 'Exact complete-phrase source still needed',
      translationEligible:false, technicalReview:'pending', linguisticReview:{status:'pending',reviewer:null,date:null},
      requiredChecks:proposal.remaining || [
        'Obtain a permitted exact complete-utterance source, preserving who needs help.',
        'Retarget and inspect hands, directionality, facial grammar and transitions.',
        'Record fluent-signer approval of the exact utterance and English mapping.'
      ],
      reviewNotes:proposal.id === 'asl.template.greeting-wellbeing' ? 'The source annotation contains repeated HOW/YOU segments. Review whether these are demonstrations, variants or part of the utterance; do not concatenate them blindly.' : 'Reference meaning and source playback alone do not establish approval on Aarav.'
    };
  });
  return {
    schema:'asl-phrase-starter-review/1', signLanguage:'ASL', runtimeImports:0,
    summary:{target:items.length,staged:items.filter(item=>item.candidate).length,missingSource:items.filter(item=>!item.candidate).length,approved:0},
    notice:'Five-expression review milestone. These are pending candidates, not five working phrase translations. The current player cannot load these NPY keypoints.',
    sourceLicense:source.license, sourceLicenseURL:source.licenseURL,
    use:source.use, sourceNoticePath:'imports/phrase-candidates/epee-v03/SOURCE_README.md',
    sourceRestrictions:'No raw source video is included. Preserve attribution, non-commercial/share-alike terms and the publisher’s no-surveillance and body-data notices.',
    checklist:['Meaning and word sense', 'Handshape and finger articulation', 'Palm orientation', 'Signing location and movement', 'Two-hand coordination and contact', 'Face/body expression and sentence grammar', 'Source-to-avatar fidelity and transitions', 'Reviewer identity, date, exact asset hashes and permitted use'],
    items
  };
}
