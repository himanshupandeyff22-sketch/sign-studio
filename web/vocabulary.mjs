import manifest from './vocabulary-manifest.json?v=20261019-4' with {type:'json'};
export const vocabularyManifest=manifest;
export const concepts=manifest.concepts;
export const animations=manifest.animations;
export const conceptById=id=>concepts.find(item=>item.id===id);
export const animationById=id=>animations.find(item=>item.id===id);
export function reviewed(record){return record?.status==='approved'&&Boolean(record.reviewer)&&Boolean(record.date)&&record.signLanguage==='ASL';}
export function reviewedMapping(concept,alias){return reviewed(concept?.linguisticReview)&&reviewed(alias?.aslMappingReview);}
