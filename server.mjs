import http from 'node:http';
import { stat,mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import { createStore } from './backend/store.mjs';
import { catalog,processInput,languages } from './backend/catalog.mjs';
const root=path.resolve(fileURLToPath(new URL('.',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.cjs':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.glb':'model/gltf-binary','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf','.svg':'image/svg+xml','.task':'application/octet-stream'};
const sessionCookie=token=>`sign_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000`;
function json(res,status,value,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(value));}
function fail(message,status=400){return Object.assign(new Error(message),{status});}
function acceptsGzip(header=''){
  const encodings=String(header).toLowerCase().split(',').map(part=>{const [name,...parameters]=part.trim().split(';');const quality=parameters.find(p=>p.trim().startsWith('q='));return {name,quality:quality?Number(quality.trim().slice(2)):1};});
  const selected=encodings.find(e=>e.name==='gzip')||encodings.find(e=>e.name==='*');
  return Boolean(selected&&Number.isFinite(selected.quality)&&selected.quality>0&&selected.quality<=1);
}
async function body(req){
  if(!req.headers['content-type']?.startsWith('application/json'))throw fail('Use application/json.',415);
  let bytes=0,chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>1048576)throw fail('Request body exceeds the 1 MiB limit.',413);chunks.push(chunk);}
  try{const value=JSON.parse(Buffer.concat(chunks).toString());if(!value||Array.isArray(value)||typeof value!=='object')throw Error();return value;}catch{throw fail('Send a valid JSON object.');}
}
export async function createApplication({databasePath=path.join(root,'data','sign-studio.sqlite')}={}){
  if(databasePath!==':memory:')await mkdir(path.dirname(databasePath),{recursive:true});
  const store=createStore(databasePath),limits=new Map();
  // The manifest is immutable until restart. Cache only this public catalog,
  // never private input/history, and avoid serializing 6+ MB on each request.
  const catalogBytes=Buffer.from(JSON.stringify(catalog())),catalogGzip=gzipSync(catalogBytes);
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
    try{
      const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host))throw fail('This local server accepts localhost requests only.',403);
      const url=new URL(req.url,`http://${host}`),route=url.pathname;
      if(route.startsWith('/api/')){
        if(req.headers.origin&&req.headers.origin!==`http://${host}`)throw fail('Cross-origin API requests are not allowed.',403);
        const key=req.socket.remoteAddress||'local',now=Date.now();
        if(limits.size>1000)for(const[k,v]of limits)if(now-v.start>60000)limits.delete(k);
        let limit=limits.get(key);if(!limit||now-limit.start>60000){limit={start:now,count:0};limits.set(key,limit);}
        if(++limit.count>240){res.setHeader('Retry-After','60');throw fail('Too many requests. Please wait a moment.',429);}
        if(req.method==='GET'&&route==='/api/health'){json(res,200,{status:'ok',storage:'sqlite',version:'3.0.0'});return;}
        if(req.method==='GET'&&route==='/api/catalog'){
          const compressed=acceptsGzip(req.headers['accept-encoding']),bytes=compressed?catalogGzip:catalogBytes;
          res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',Vary:'Accept-Encoding','Content-Length':bytes.length,...(compressed?{'Content-Encoding':'gzip'}:{})});res.end(bytes);return;
        }
        const cookie=req.headers.cookie?.split(';').map(p=>p.trim()).find(p=>p.startsWith('sign_session='));
        let token=cookie?.slice('sign_session='.length),session=store.getSession(token);
        if(route==='/api/session'&&req.method==='POST'){
          if(!session){const created=store.createSession();token=created.token;session=created.session;res.setHeader('Set-Cookie',sessionCookie(token));}
          json(res,200,session);return;
        }
        if(!session)throw fail('Start a session before using this endpoint.',401);
        if(route==='/api/session'&&req.method==='GET'){json(res,200,session);return;}
        if(route==='/api/session'&&req.method==='PATCH'){
          const value=await body(req),language=value.language??session.language,speed=value.speed??session.speed;
          if(!Object.hasOwn(languages,language)||![.6,1,1.5].includes(speed))throw fail('Choose a supported language and playback speed.');
          json(res,200,store.updateSession(token,language,speed));return;
        }
        if(route==='/api/translations'&&req.method==='POST'){
          const value=await body(req);const result=processInput({...value,language:value.language??session.language});json(res,201,store.save(token,result));return;
        }
        if(route==='/api/history'&&req.method==='GET'){json(res,200,{items:store.history(token)});return;}
        if(route==='/api/history'&&req.method==='DELETE'){json(res,200,{deleted:store.clear(token)});return;}
        if(route==='/api/history/export'&&req.method==='GET'){json(res,200,{exportedAt:new Date().toISOString(),items:store.history(token)},{'Content-Disposition':'attachment; filename="sign-studio-history.json"'});return;}
        throw fail('Endpoint or method not found.',404);
      }
      if(!['GET','HEAD'].includes(req.method))throw fail('Method not allowed.',405);
      let decoded;try{decoded=decodeURIComponent(route);}catch{throw fail('Invalid URL encoding.');}
      if(decoded.includes('\\')||decoded.includes('\0'))throw fail('Invalid path.');
      let base,relative;
      if(decoded==='/'){base=path.join(root,'web');relative='index.html';}
      else if(decoded.startsWith('/web/')){base=path.join(root,'web');relative=decoded.slice(5);}
      else if(decoded.startsWith('/node_modules/three/')){base=path.join(root,'node_modules','three');relative=decoded.slice('/node_modules/three/'.length);}
      else if(decoded.startsWith('/node_modules/@mediapipe/tasks-vision/')){base=path.join(root,'node_modules','@mediapipe','tasks-vision');relative=decoded.slice('/node_modules/@mediapipe/tasks-vision/'.length);}
      else throw fail('Not found.',404);
      const file=path.resolve(base,relative);if(!file.startsWith(base+path.sep))throw fail('Not found.',404);
      const info=await stat(file);if(!info.isFile())throw fail('Not found.',404);
      const etag=`"${info.size}-${Math.trunc(info.mtimeMs)}"`;
      if(req.headers['if-none-match']===etag){res.writeHead(304);res.end();return;}
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache',ETag:etag});
      if(req.method==='HEAD')res.end();else createReadStream(file).on('error',()=>res.destroy()).pipe(res);
    }catch(error){const status=error.status||(error.code==='ENOENT'?404:500);if(status===500)console.error('Server error:',error.message);if(!res.headersSent)json(res,status,{error:status===500?'Something went wrong. Please try again.':error.message,...(error.details||{})});else res.destroy();}
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  return {server,store,async close(){await new Promise(resolve=>{server.close(resolve);server.closeIdleConnections();});store.close();}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const app=await createApplication();const port=Number(process.env.SIGN_PORT||3000);
  app.server.once('error',async error=>{
    app.store.close();
    if(error.code==='EADDRINUSE'){
      try{
        const response=await fetch(`http://127.0.0.1:${port}/api/health`,{signal:AbortSignal.timeout(1500)});
        const health=await response.json();
        if(response.ok&&health.status==='ok'&&health.storage==='sqlite'){console.log(`Sign Studio is already running: http://127.0.0.1:${port}`);return;}
      }catch{}
      console.error(`Port ${port} is in use. Stop the other app or choose another SIGN_PORT.`);
    }else console.error('Could not start Sign Studio:',error.message);
    process.exitCode=1;
  });
  app.server.listen(port,'127.0.0.1',()=>console.log(`Sign Studio: http://127.0.0.1:${port} · SQLite backend ready`));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();process.exit(0);});
}
