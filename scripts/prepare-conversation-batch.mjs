// Creates a proposal only. The existing importer must dry-run before committing.
import fs from 'node:fs';
import {sha256} from './motion-identity.mjs';
const data=[
 ['drink','consume-liquid','Consume a liquid; alcohol, container and manner variants require separate review.','I drink water.',['drinks','drank','drinking']],
 ['want','desire','Desire something; not lack, need, or a negated desire.','I want water.',['wants','wanted','wanting']],
 ['need','requirement','Require something; intensity and modality are not inferred from an isolated clip.','I need help.',['needs','needed','needing']],
 ['where','location-question','Ask about a location; question nonmanuals are required.','Where is my home?',[]],
 ['who','person-question','Ask about a person; not a relative-clause mapping.','Who is here?',[]],
 ['when','time-question','Ask about time; not a conditional or relative clause.','When do you work?',[]],
 ['why','reason-question','Ask about a reason; not a complete sentence template.','Why are you here?',[]],
 ['how','manner-question','Ask about manner; not quantity, age, or a complete greeting.','How do you learn?',[]],
 ['good','positive-quality','Positive quality; not GOOD-NIGHT, THANK-YOU or a complete evaluation.','The school is good.',[]],
 ['bad','negative-quality','Negative quality; not a sentence-level negation substitute.','The weather is bad.',[]],
 ['happy','happiness','A feeling of happiness; facial expression requires review.','I am happy.',[]],
 ['sad','sadness','A feeling of sadness; facial expression requires review.','I am sad.',[]],
 ['work','labor','Labor or employment; not function correctly, operate, or an artwork.','I work here.',['works','worked','working']],
 ['school','education-place','A place or institution for education; not a group of fish.','I go to school.',['schools']],
 ['home','residence','A residence or home; not a sports home team.','I go home.',['homes']],
 ['mother','female-parent','A mother or female parent; compound family terms require separate mappings.','My mother is here.',['mothers']],
 ['sister','female-sibling','A female sibling; not a religious title or metaphorical relation.','My sister is here.',['sisters']],
 ['name','personal-label','A name identifying a person; not the verb appoint, and not a name sign for a person.','My name is Aarav.',['names']],
 ['know','knowledge','Have knowledge; not know-how or sentence-level negation.','I know you.',['knows','knew','knowing']],
 ['understand','comprehension','Comprehend information; not a complete question or a negative statement.','I understand.',['understands','understood','understanding']],
 ['learn','acquire-knowledge','Acquire knowledge; not teach or a reviewed inflected sentence.','I learn here.',['learns','learned','learning']],
 ['go','movement-away','Move away or toward a destination; direction and referents require review.','I go home.',['goes','went','going']],
 ['come','movement-toward','Move toward a referent; not an invitation sentence template.','Come here.',['comes','came','coming']],
 ['stop','cease-action','Cease an action; not a bus stop or a full imperative sentence.','Stop working.',['stops','stopped','stopping']],
 ['sorry','apology','An expression of apology; not sorrow or a complete polite sentence.','I am sorry.',[]]
];
const ref=word=>`https://www.lifeprint.com/asl101/pages-signs/${word[0]}/${word}.htm`;
const conceptProposals=data.map(([word,sense,definition,example,inflections])=>({id:`asl.${word}.${sense}`,signLanguage:'ASL',sense,label:word[0].toUpperCase()+word.slice(1),definition,aliases:[word],inflections,exampleContexts:[example],sourceProject:'https://osf.io/mqzyk/',license:'CC-BY-4.0',meaningReference:ref(word)}));
const inventory=JSON.parse(fs.readFileSync('asset-downloads/conversation-batch-20261012/inventory.json'));
const sourceCatalogProposals=inventory.entries.map(e=>({id:'source-'+sha256(inventory.source+'#'+e.name).slice(0,20),sourceGloss:e.name.slice(9,-4),signLanguage:'ASL',projectURL:inventory.project,archiveURL:inventory.source,archiveFile:e.name,license:'CC-BY-4.0',size:e.size,crc32:e.crc}));
const entries=conceptProposals.map(p=>({id:'3dlex-'+p.aliases[0],word:p.aliases[0],conceptId:p.id,sense:p.sense,signLanguage:'ASL',sourcePath:`asset-downloads/conversation-batch-20261012/${p.aliases[0]}.glb`,variantId:'3dlex-v1-source',variantLabel:'3D-LEX source capture; ASL variant unverified',sourceProject:p.sourceProject,archiveURL:inventory.source,license:p.license,sourceLanguageVerified:true,meaningReference:p.meaningReference}));
fs.writeFileSync('imports/asl-conversation-20261012.json',JSON.stringify({schema:'asl-motion-batch/1',id:'asl-conversation-20261012',conceptProposals,sourceCatalogProposals,entries},null,2)+'\n',{flag:'wx'});
console.log('Prepared 25 candidate concepts/motions and the complete archive discovery index. No assets imported or enabled.');
