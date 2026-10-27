// Writes a proposed batch, not a runtime import or approval.
import fs from 'node:fs';
const rows=[
 ['bathroom','restroom','Room/use-restroom meaning; not a bathroom fixture or BATH+ROOM composition.','health','Where is the bathroom?'],
 ['sleep','sleep-state','Sleep as a state; not SLEEP-IN or an approved sleepy/exhausted mapping.','health','I need sleep.',['sleeps','slept','sleeping']],
 ['tired','fatigue','A feeling of fatigue; degree and body expression require review.','health','I am tired.'],
 ['doctor','medical-practitioner','A medical practitioner; not an academic degree/title.','health','I need a doctor.',['doctors']],
 ['hospital','medical-facility','A hospital facility; not patient, doctor or an automatic clinic alias.','health','The hospital is here.',['hospitals']],
 ['hurt','physical-pain','Physical hurt/pain candidate; location, severity and emotional hurt need separate review.','health','My hand hurts.',['hurts','hurting']],
 ['hot','high-temperature','High temperature; not spicy food or attractiveness.','description','The tea is hot.'],
 ['cold','low-temperature','Low temperature; not a head cold/illness or an automatic winter mapping.','description','The milk is cold.'],
 ['coffee','coffee-beverage','Coffee beverage; not all drinks or an inferred order/request.','food','I want coffee.'],
 ['tea','tea-beverage','Tea beverage; not a drink request or every brewing method.','food','I drink tea.'],
 ['milk','milk-liquid','Milk as liquid; not the verb to milk an animal.','food','I want milk.'],
 ['apple','apple-fruit','Apple fruit; not a company or personal name.','food','I want an apple.',['apples']],
 ['bread','bread-food','Bread as food; not a slang term for money.','food','I want bread.'],
 ['fish','fish-animal','A fish/animal candidate; FISHING as an action is distinct.','food','I see a fish.'],
 ['vegetable','vegetable-food','Vegetable as food; exact source lexical variant requires review.','food','I want a vegetable.',['vegetables']],
 ['teacher','teaching-person','A person who teaches; complete TEACHER is not simply an approved TEACH clip.','education','My teacher is here.',['teachers']],
 ['student','learning-person','A learner/student; complete person component and compound realization require review.','education','I am a student.',['students']],
 ['read','reading-text','Read written text; aspect, repetition and metaphorical senses are not inferred.','education','I read a book.',['reads','reading']],
 ['write','writing-text','Produce written text; not automatically WRITE-DOWN or SIGN-A-CONTRACT.','education','I write here.',['writes','wrote','writing']],
 ['book','bound-pages','A book as bound reading material; not the verb reserve.','education','I read a book.',['books']],
 ['hearing','hearing-status','Hearing-person/status candidate; not physical auditory action or a legal hearing.','people','My teacher is hearing.'],
 ['again','repetition','Again/repeat; exact movement and sentence scope require review.','communication','Please say that again.'],
 ['today','current-day','The current day; not an unconditional synonym for NOW.','time','I work today.'],
 ['tomorrow','next-day','The next day; repetition may change meaning and is not inferred as DAILY.','time','I work tomorrow.'],
 ['yesterday','previous-day','The previous day; not general past tense for every verb.','time','I worked yesterday.'],
 ['morning','morning-time','Morning time; not a reviewed GOOD-MORNING greeting.','time','I work in the morning.',['mornings']],
 ['night','night-time','Night time; not an automatic TONIGHT or GOOD-NIGHT phrase.','time','I work at night.',['nights']],
 ['money','currency','Money/currency candidate; CASH, PAY and deposits remain separate meanings.','shopping','I need money.'],
 ['buy','purchase','Purchase something; not shopping by repetition or metaphorical belief.','shopping','I buy bread.',['buys','bought','buying']],
 ['ask','ask-question','Ask a question; direction and participants require review, not formal REQUEST or PRAY.','communication','I ask my teacher.',['asks','asked','asking']],
 ['feel','internal-feeling','Internal feeling/sensation; not touch an object or automatic FEEL-LIKE.','communication','I feel tired.',['feels','felt','feeling']],
 ['children','plural-children','Plural young people/offspring; number, height and plural motion require review.','people','My children are here.'],
 ['man','adult-male-person','An adult male person; not a generic term for all humanity.','people','The man is here.',['men']],
 ['woman','adult-female-person','An adult female person; preserve source variant rather than substitute MOTHER.','people','The woman is here.',['women']],
 ['boy','young-male-person','A boy/young male person; not a generic synonym for MAN.','people','The boy is here.',['boys']],
 ['girl','young-female-person','A girl/young female person; not a generic synonym for WOMAN.','people','The girl is here.',['girls']],
 ['language','human-language','A human language/system of communication; not a validated programming-language mapping.','communication','I learn a language.',['languages']],
 ['sign','signed-language-action','Use a signed language; not a posted notice or signing a contract.','communication','I sign here.',['signs','signed','signing']],
 ['english','english-language','The English language; not every British nationality/geographic sense.','communication','I read English.'],
 ['slow','low-speed','Low speed; movement intensity/nonmanual modification is not a grammatical speed control.','description','Please go slow.'],
 ['fast','high-speed','High speed; not abstaining from food or every immediate/urgent meaning.','description','The car is fast.'],
 ['day','day-period','Day period; temporal number, past/future and duration need separate plans.','time','I work every day.',['days']],
 ['week','week-period','A week period; not a reviewed numeric-duration construction.','time','I work this week.',['weeks']],
 ['month','month-period','A month period; calendar name and numerical duration are not inferred.','time','I work this month.',['months']],
 ['year','year-period','A year period; age, number and calendar agreement need separate review.','time','I work this year.',['years']],
 ['pay','payment','Pay money; direction/recipient is not inferred, PAY-ATTENTION is distinct.','shopping','I pay here.',['pays','paid','paying']],
 ['car','road-car','A road car/vehicle; not every automobile-operation sentence.','travel','The car is here.',['cars']],
 ['bus','road-bus','A road bus; source lexical vs fingerspelled realization must be identified.','travel','I go by bus.',['buses']],
 ['train','rail-vehicle','A rail vehicle; not the verb to teach or train an animal.','travel','I go by train.',['trains']],
 ['walk','walk-action','Travel on foot; manner, classifier use and direction need separate review.','travel','I walk home.',['walks','walked','walking']],
 ['sit','sitting-position','Be seated/sit; not every CHAIR meaning or an imperative phrase.','travel','I sit here.',['sits','sat','sitting']],
 ['wait','waiting','Wait; waiting a long time, anxiety and intensity are not inferred.','communication','I wait here.',['waits','waited','waiting']],
 ['finish','completed-state','An action already done/completed; not continue until completion or every English finish sense.','communication','I have finished.',['finished','finishes','finishing']],
 ['big','large-size','Large size; intensity, spatial shape and degree need separate review.','description','The house is big.'],
 ['small','small-size','Small size; not an unconditional LITTLE quantity or LOW amount mapping.','description','The house is small.'],
 ['important','importance','Importance; not price/value, emergencies or a generic urgency marker.','description','This is important.'],
 ['answer','answer-response','Respond/answer; direction, participants and a complete reply need review.','communication','I answer my teacher.',['answers','answered','answering']],
 ['tell','tell-information','Tell information; direction/participants are not inferred from an isolated clip.','communication','I tell my teacher.',['tells','told','telling']],
 ['think','thought-action','Think/mental consideration; not all English belief, opinion or remember meanings.','communication','I think about school.',['thinks','thought','thinking']],
 ['see','visual-perception','See visually; not every visit, comprehend or metaphorical English sense.','communication','I see the school.',['sees','saw','seeing']],
 ['listen','auditory-attention','Attend/listen to sound; not necessarily physical hearing ability or a legal hearing.','communication','I listen to my teacher.',['listens','listened','listening']],
 ['hungry','hunger','Hungry for food; degree and facial expression require review.','food','I am hungry.'],
 ['thirsty','thirst','Need/desire for liquid from thirst; not slang or a complete drink request.','food','I am thirsty.']
];
const ref=word=>`https://www.lifeprint.com/asl101/pages-signs/${word[0]}/${word}.htm`;
const conceptProposals=rows.map(([word,sense,definition,category,example,inflections=[]])=>({id:`asl.${word}.${sense}`,signLanguage:'ASL',sense,label:word[0].toUpperCase()+word.slice(1),definition,category,aliases:word==='bathroom'?['bathroom','toilet']:[word],inflections,exampleContexts:[example],sourceProject:'https://osf.io/mqzyk/',license:'CC-BY-4.0',meaningReference:ref(word)}));
// Separate common alternate English senses; no source motion is assigned to them.
const alternate=[
 ['toilet','fixture','A plumbing toilet fixture, distinct from the room or use-restroom meaning.','health','The toilet is broken.'],
 ['doctor','academic-title','A doctoral degree/title holder; distinct from the medical practitioner sense.','people','She earned a doctorate.'],
 ['cold','cold-illness','A common cold illness; not low temperature.','health','I have a cold.'],
 ['hot','spicy-flavor','Spicy/pungent food; not high physical temperature.','food','The pepper is hot.'],
 ['book','reserve-booking','Reserve a place or service; not a bound reading object.','travel','I book a room.'],
 ['train','training-action','Teach or train someone; not a rail vehicle.','education','I train my dog.'],
 ['hearing','auditory-sense','Physical auditory perception/ability; distinct from hearing-person status.','health','My hearing is impaired.'],
 ['hearing','legal-session','A legal or official hearing; not auditory perception or a hearing person.','communication','The court hearing is today.'],
 ['sign','posted-notice','A posted notice/symbol; not signed-language use.','communication','I read the sign.'],
 ['sign','signature-action','Put a signature on a document; not signed-language use.','communication','I sign the form.'],
 ['fast','food-abstinence','Abstain from food; not high speed.','food','I fast today.']
].map(([word,sense,definition,category,example])=>({id:`asl.${word}.${sense}`,signLanguage:'ASL',sense,label:word[0].toUpperCase()+word.slice(1)+' ('+sense.replaceAll('-',' ')+')',definition,category,aliases:[word],inflections:[],exampleContexts:[example],sourceProject:'https://osf.io/mqzyk/',license:'CC-BY-4.0',meaningReference:ref(word)}));
conceptProposals.push(...alternate);
const entries=rows.map(([word])=>{const c=conceptProposals.find(c=>c.aliases[0]===word);return {id:'3dlex-'+word,word,conceptId:c.id,sense:c.sense,signLanguage:'ASL',sourcePath:`asset-downloads/everyday-batch-20261012/${word}.glb`,variantId:'3dlex-v1-source',variantLabel:'3D-LEX source capture; exact sense/variant unverified',sourceProject:c.sourceProject,archiveURL:'https://osf.io/download/tcnhs/',license:c.license,sourceLanguageVerified:true,meaningReference:c.meaningReference};});
const bathroom=conceptProposals.find(c=>c.id==='asl.bathroom.restroom');entries.find(e=>e.word==='bathroom').variantId='3dlex-v1-bathroom-source';
entries.splice(1,0,{...entries[0],id:'3dlex-toilet',word:'toilet',sourcePath:'asset-downloads/everyday-batch-20261012/toilet.glb',variantId:'3dlex-v1-toilet-source',variantLabel:'TOILET-labelled source capture; restroom candidate sense, variant pending',meaningReference:ref('toilet')});
fs.writeFileSync('imports/asl-everyday-20261012.json',JSON.stringify({schema:'asl-motion-batch/1',id:'asl-everyday-20261012',conceptProposals,entries},null,2)+'\n',{flag:'wx'});
console.log(`Prepared ${conceptProposals.length} candidate concepts and ${entries.length} source motion entries. No runtime data changed.`);
