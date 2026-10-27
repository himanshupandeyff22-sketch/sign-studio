import {readdirSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const group=process.argv[2]||'runtime';
const source=new Set(['import.test.mjs','everyday-import.test.mjs','expansion-import.test.mjs','presentation-import.test.mjs']);
const graphics=new Set(['avatar.test.mjs','asl.test.mjs']);
const tests=readdirSync(new URL('../backend/',import.meta.url)).filter(n=>n.endsWith('.test.mjs'));
if(!['runtime','quick','graphics','imports'].includes(group))throw Error('Unknown test group');
if(group==='imports'&&!existsSync(new URL('../asset-downloads/',import.meta.url))){console.error('Optional source-import tests require the original licensed raw source cache. It is intentionally excluded from the public runtime repository. See docs/GITHUB_RELEASE.md.');process.exit(2);}
const chosen=tests.filter(n=>group==='imports'?source.has(n)||n==='library-model.test.mjs':group==='graphics'?graphics.has(n):!source.has(n)&&(group!=='quick'||!graphics.has(n))).map(n=>'backend/'+n);
if(['runtime','quick'].includes(group))chosen.push('web/phrases.test.mjs','samples/submission.test.mjs');
const result=spawnSync(process.execPath,['--test',...chosen],{cwd:new URL('..',import.meta.url),stdio:'inherit'});
process.exit(result.status??1);
