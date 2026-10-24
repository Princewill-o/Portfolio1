import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {randomBytes,createHmac} from 'node:crypto';import {createChat,verifyWebhook} from '../server/chat.mjs';
test('Private chat sends once, isolates visitors, verifies replies, and retries failures',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'portfolio-chat-test-')),secret='whsec_'+randomBytes(32).toString('base64');let outgoing=[],incoming={},fail=false,env={RESEND_API_KEY:'test-only',CHAT_OWNER_EMAIL:'owner@example.com',CHAT_FROM_EMAIL:'Portfolio <chat@example.com>',CHAT_INBOUND_DOMAIN:'replies.example.com',RESEND_WEBHOOK_SECRET:secret};
 const app=createChat({env,dbPath:path.join(dir,'chat.sqlite'),fetcher:async(url,opts)=>{if(url.includes('/receiving/'))return {ok:true,json:async()=>incoming};if(fail)return {ok:false};outgoing.push(JSON.parse(opts.body));return {ok:true,json:async()=>({id:'sent-'+outgoing.length})}}});
 const server=http.createServer((req,res)=>app.handle(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,origin='http://127.0.0.1:4173';
 const send=(payload,cookie,customOrigin=origin)=>fetch(base+'/api/chat/messages',{method:'POST',headers:{Origin:customOrigin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(payload)});
 const hook=async(id,signature=true)=>{const raw=JSON.stringify({type:'email.received',data:{email_id:'received-1'}}),stamp=String(Math.floor(Date.now()/1000)),sig=createHmac('sha256',Buffer.from(secret.slice(6),'base64')).update(`${id}.${stamp}.${raw}`).digest('base64');return fetch(base+'/api/chat/webhook',{method:'POST',headers:{'svix-id':id,'svix-timestamp':stamp,'svix-signature':'v1,'+(signature?sig:'invalid')},body:raw})};
 try{
  assert.equal((await(await fetch(base+'/api/chat/config')).json()).ready,true);
  const message={name:'Visitor',email:'visitor@example.net',text:'Hello Princewill',clientId:'request-0001'};
  assert.equal((await send(message,null,'https://evil.example')).status,403);
  let r=await send(message);assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];assert(r.headers.get('set-cookie').includes('HttpOnly'));assert.equal(outgoing.length,1);assert.match(outgoing[0].reply_to,/^chat-[a-f0-9]{48}@replies\.example\.com$/);
  assert.equal((await send(message,cookie)).status,200);assert.equal(outgoing.length,1,'retry must not send duplicate email');
  assert.equal((await send({...message,text:'changed'},cookie)).status,409);
  const another=await(await fetch(base+'/api/chat/messages')).json();assert.deepEqual(another.messages,[]);
  incoming={from:'Owner <owner@example.com>',to:[outgoing[0].reply_to],text:'Thanks! Let’s talk.\n\nOn Friday Visitor wrote:\n> original'};
  assert.equal((await hook('event-1',false)).status,401);assert.equal((await hook('event-1')).status,200);assert.equal((await hook('event-1')).status,200);
  let data=await(await fetch(base+'/api/chat/messages',{headers:{Cookie:cookie}})).json();assert.equal(data.messages.length,2);assert.equal(data.messages[1].role,'princewill');assert.equal(data.messages[1].text,'Thanks! Let’s talk.');
  incoming.from='attacker@example.net';await hook('event-other');data=await(await fetch(base+'/api/chat/messages',{headers:{Cookie:cookie}})).json();assert.equal(data.messages.length,2);
  fail=true;r=await send({...message,clientId:'request-0002',text:'Second message'},cookie);assert.equal(r.status,502);fail=false;assert.equal((await send({...message,clientId:'request-0002',text:'Second message'},cookie)).status,200);assert.equal(outgoing.length,2);
  assert.equal((await send({...message,text:'a'.repeat(3001),clientId:'request-0003'},cookie)).status,400);
  assert.equal(verifyWebhook('{}',{'svix-id':'x','svix-timestamp':'1','svix-signature':'v1,x'},secret),false);
 }finally{await new Promise(r=>server.close(r));app.close();rmSync(dir,{recursive:true,force:true})}
});
test('Unconfigured chat never claims successful delivery',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'portfolio-unconfigured-')),app=createChat({env:{},dbPath:path.join(dir,'chat.sqlite')});const server=http.createServer((req,res)=>app.handle(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{assert.equal((await(await fetch(base+'/api/chat/config')).json()).ready,false);const r=await fetch(base+'/api/chat/messages',{method:'POST',headers:{Origin:'http://127.0.0.1:4173','Content-Type':'application/json'},body:'{}'});assert.equal(r.status,503);assert.match((await r.json()).error,/not been sent/)}finally{await new Promise(r=>server.close(r));app.close();rmSync(dir,{recursive:true,force:true})}
});
