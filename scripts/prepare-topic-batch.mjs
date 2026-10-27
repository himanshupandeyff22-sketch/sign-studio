import fs from 'node:fs';
const baseline=JSON.parse(fs.readFileSync('docs/vocabulary-baseline-before-everyday-20261012.json'));
const groups={food:['water','drink'],people:['family','person','friend','mother','sister','name'],education:['school','work','learn','know','understand','remember'],travel:['home','go','come'],time:['time'],description:['light','like']};
const topicProposals=baseline.concepts.map(c=>{const key=c.id.split('.')[1],category=key==='bank'?(c.sense==='financial-institution'?'shopping':'travel'):key==='right'?(c.sense==='right-direction'?'travel':'communication'):key==='happy'||key==='sad'?'health':Object.entries(groups).find(([,words])=>words.includes(key))?.[0]||'communication';return {conceptId:c.id,category,purpose:'interface-grouping-only'};});
fs.writeFileSync('imports/asl-topic-metadata-20261012.json',JSON.stringify({schema:'asl-motion-batch/1',id:'asl-topic-metadata-20261012',topicProposals,entries:[]},null,2)+'\n',{flag:'wx'});
console.log('Prepared additive UI topics for the 48 existing concepts; no review or meaning changes.');
