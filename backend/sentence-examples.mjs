import {createHash} from 'node:crypto';

// English example patterns, NOT ASL grammatical templates. Each candidate must
// survive the real permission/meaning/whole-message planner before publication.
export function buildSentenceExamples(evaluate){
 const candidates=new Map();
 const add=(text,category)=>{if(!candidates.has(text))candidates.set(text,category);};
 const words=text=>text.split(' ');
 const seeds=['You want water.','Please drink water.','Your teacher works today.','Where is school?'];
 seeds.forEach(text=>add(text,'Quick start'));
 const objects=words('water coffee tea soda soup cereal bacon apple grapes salad sandwich fish fruit chocolate potato banana orange rice bread milk juice butter cheese egg chicken pizza salt sugar pepper lemon tomato onion garlic mushroom pumpkin strawberry dessert cookie cake honey ice cream medicine help blanket pillow bed chair table desk bottle bowl cup plate spoon fork knife napkin towel soap shampoo clothes shirt jacket shoes socks hat gloves glasses bag box basket ball bicycle car phone computer camera paper pen pencil newspaper magazine letter money ticket map key umbrella gift toy music book');
 for(const object of objects){add(`You want ${object}.`,'Requests');add(`You want ${object} today.`,'Requests');add(`You want ${object} tomorrow.`,'Requests');}
 for(const drink of words('water coffee tea soda milk juice'))add(`Please drink ${drink}.`,'Food & drink');
 const people=words('mother father teacher doctor nurse sister brother uncle aunt cousin grandmother grandfather husband wife friend girl boy');
 const states=words('happy sad hungry thirsty sick tired angry afraid excited cold warm proud lonely nervous busy ready bored');
 for(const state of states){add(`You are ${state}.`,'Feelings');for(const person of people)add(`Your ${person} is ${state}.`,'People');}
 for(const action of words('help wait walk cook read sleep work drink remember listen watch write stand sit smile dance jump learn play study stop start')){
  add(`Please ${action}.`,'Actions');add(`Please ${action} today.`,'Actions');
  add(`You ${action} today.`,'Actions');add(`You ${action} tomorrow.`,'Actions');
 }
 for(const person of people)for(const action of words('works walks cooks reads sleeps waits helps'))for(const time of ['today','tomorrow'])add(`Your ${person} ${action} ${time}.`,'Daily life');
 for(const place of words('school hospital office library classroom bathroom kitchen house store park restaurant airport station church city town hotel beach university college bank'))add(`Where is the ${place}?`,'Questions');
 for(const person of people){add(`Where is your ${person}?`,'Questions');add(`Who is your ${person}?`,'Questions');}
 for(const object of words('shirt jacket car bag box door chair'))for(const color of words('red blue green yellow black white brown pink purple orange'))add(`Your ${object} is ${color}.`,'Descriptions');
 for(const object of words('computer house car bag box phone'))for(const state of words('new old big small'))add(`Your ${object} is ${state}.`,'Descriptions');
 const paragraphs=[
  'You want water. Please wait.', 'You are hungry. Please wait.',
  'Your teacher works today. You want water. Please drink water.',
  'Where is school? Please help.', 'You want coffee. Please wait.',
  'Your mother is happy. Your teacher works today.',
  'Please sit. Please wait. Please drink water.',
  'You work today. You sleep tomorrow.',
  'Your teacher reads today. You want a newspaper.',
  'You are thirsty. Please drink water.'
 ];
 paragraphs.forEach(text=>add(text,'Paragraphs'));

 const byMotionPlan=new Map(),examples=[];let blocked=0,merged=0;
 for(const [text,category]of candidates){
  const result=evaluate(text);
  if(result.sentencePlan?.status!=='approximate'||!result.sequence.length||result.sentencePlan.coverage.missingConcepts){blocked++;continue;}
  // Same captures plus same question intent are one idea. Articles, spelling
  // variants or contractions cannot inflate the published sentence count.
  const key=JSON.stringify({ids:result.sequence.map(c=>c.id),clauses:result.sentencePlan.clauses.map(c=>({question:c.question,count:c.unitIds.length}))});
  const duplicate=byMotionPlan.get(key);
  if(duplicate){duplicate.alternativeTexts.push(text);merged++;continue;}
  const seed=seeds.indexOf(text),id=seed>=0?'sentence-'+seed:'idea-'+createHash('sha256').update(key).digest('hex').slice(0,16);
  const item={id,text,category,motionIds:result.sequence.map(c=>c.id),conceptIds:result.sequence.map(c=>c.conceptId),alternativeTexts:[],reviewStatus:'unverified',notice:'Approximate source-order sign sequence; not a reviewed ASL sentence.'};
  examples.push(item);byMotionPlan.set(key,item);
 }
 return {examples,audit:{candidates:candidates.size,playableExamples:examples.length,blocked,mergedEquivalentExamples:merged,linguisticallyApprovedSentences:0,notice:'Finite English idea catalogue, checked against current assets and planner; not all possible sentences and not ASL grammatical validation.'}};
}
