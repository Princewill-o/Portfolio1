import {DatabaseSync} from 'node:sqlite';
import {randomBytes,createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
const hash=v=>createHash('sha256').update(v).digest('hex');
const email=v=>String(v||'').match(/<?([^<>\s]+@[^<>\s]+)>?$/)?.[1]?.toLowerCase();
export function verifyWebhook(raw,headers,secret,now=Date.now()){
 const id=headers['svix-id'],stamp=headers['svix-timestamp'],signatures=headers['svix-signature'];
 if(!id||!stamp||!signatures||!secret||!/^\d+$/.test(stamp)||Math.abs(now/1000-Number(stamp))>300)return false;
 const key=Buffer.from(secret.replace(/^whsec_/,''),'base64');if(key.length<16)return false;
 const expected=createHmac('sha256',key).update(`${id}.${stamp}.${raw}`).digest();
 return signatures.split(' ').some(part=>{const [version,encoded]=part.split(',');if(version!=='v1'||!encoded)return false;const actual=Buffer.from(encoded,'base64');return actual.length===expected.length&&timingSafeEqual(actual,expected)});
}
export function createChat({env=process.env,fetcher=fetch,dbPath=path.resolve('data/chat.sqlite'),now=()=>Date.now()}={}){
 mkdirSync(path.dirname(dbPath),{recursive:true});const db=new DatabaseSync(dbPath);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS chats(id TEXT PRIMARY KEY, session_hash TEXT UNIQUE NOT NULL, reply_key TEXT UNIQUE NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY,chat_id TEXT NOT NULL REFERENCES chats(id),role TEXT NOT NULL,text TEXT NOT NULL,status TEXT NOT NULL,client_id TEXT,provider_id TEXT UNIQUE,created INTEGER NOT NULL,UNIQUE(chat_id,client_id));
 CREATE TABLE IF NOT EXISTS webhooks(id TEXT PRIMARY KEY,created INTEGER NOT NULL);`);
 const origin=(env.PUBLIC_ORIGIN||'http://127.0.0.1:4173').replace(/\/$/,''),secure=origin.startsWith('https:'),owner=email(env.CHAT_OWNER_EMAIL),from=env.CHAT_FROM_EMAIL,inbound=env.CHAT_INBOUND_DOMAIN,secret=env.RESEND_WEBHOOK_SECRET;
 const configured=()=>Boolean(env.RESEND_API_KEY&&owner&&from&&inbound&&secret);
 const rates=new Map();
 const json=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(data))};
 const error=(status,message)=>Object.assign(new Error(message),{status});
 async function body(req){let size=0,parts=[];for await(const part of req){size+=part.length;if(size>16000)throw error(413,'Message too large.');parts.push(part)}return Buffer.concat(parts).toString('utf8')}
 function session(req){const cookie=req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith('po_chat='))?.slice(8);return cookie&&/^[a-zA-Z0-9_-]{40,50}$/.test(cookie)?db.prepare('SELECT * FROM chats WHERE session_hash=?').get(hash(cookie)):null}
 function throttle(req,kind,limit){const key=(req.socket.remoteAddress||'local')+':'+kind,t=now();if(rates.size>10000)for(const [k,v]of rates)if(v.until<t)rates.delete(k);let r=rates.get(key);if(!r||r.until<t)rates.set(key,r={count:0,until:t+3600000});if(++r.count>limit)throw error(429,'Please wait before sending more messages.')}
 const list=chat=>db.prepare('SELECT id,role,text,status,created FROM messages WHERE chat_id=? ORDER BY id').all(chat.id);
 async function provider(endpoint,options={}){const r=await fetcher('https://api.resend.com'+endpoint,{...options,headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(12000)});if(!r.ok)throw error(502,'Email delivery is temporarily unavailable. Your draft is safe; please retry.');return r.json()}
 async function send(chat,text,clientId){
  let msg=db.prepare('SELECT * FROM messages WHERE chat_id=? AND client_id=?').get(chat.id,clientId);
  if(msg&&msg.text!==text)throw error(409,'This message reference already exists. Refresh the conversation.');
  if(msg?.status==='sent')return;
  if(!msg){const count=db.prepare('SELECT count(*) n FROM messages WHERE chat_id=? AND role=? AND created>?').get(chat.id,'visitor',now()-86400000).n;if(count>=40)throw error(429,'This conversation has reached its daily message limit.');const result=db.prepare('INSERT INTO messages(chat_id,role,text,status,client_id,created) VALUES(?,?,?,?,?,?)').run(chat.id,'visitor',text,'pending',clientId,now());msg={id:Number(result.lastInsertRowid)}}
  try{const result=await provider('/emails',{method:'POST',headers:{'Idempotency-Key':'chat-'+chat.id+'-'+clientId},body:JSON.stringify({from,to:[owner],reply_to:`chat-${chat.reply_key}@${inbound}`,subject:`Portfolio chat · ${chat.name.replace(/[\r\n]/g,' ')} · ${chat.id.slice(0,8)}`,text:`New portfolio message from ${chat.name}\nVisitor contact: ${chat.email} (visitor supplied)\nConversation: ${chat.id}\n\n${text}\n\n---\nReply above this line to send your response back to this visitor’s website chat. Keep this message’s Reply-To address.`,tags:[{name:'chat_id',value:chat.id}]})});if(!result.id)throw error(502,'The email provider did not confirm acceptance. Please retry.');db.prepare('UPDATE messages SET status=?,provider_id=? WHERE id=?').run('sent',result.id,msg.id)}catch(e){db.prepare('UPDATE messages SET status=? WHERE id=?').run('failed',msg.id);throw e}
 }
 async function webhook(req,res){
  const raw=await body(req);if(!verifyWebhook(raw,req.headers,secret,now()))throw error(401,'Invalid webhook signature.');
  const eventId=req.headers['svix-id'];if(db.prepare('SELECT 1 FROM webhooks WHERE id=?').get(eventId)){json(res,200,{ok:true});return}
  const event=JSON.parse(raw);if(event.type!=='email.received'){json(res,200,{ok:true});return}
  const received=await provider('/emails/receiving/'+encodeURIComponent(event.data.email_id));
  // Routing uses the private Reply-To mailbox in the owner's notification email,
  // the provider-authenticated payload, and the configured owner's From address.
  if(email(received.from)!==owner){json(res,200,{ok:true});return}
  const recipients=Array.isArray(received.to)?received.to:[received.to];let chat;
  for(const to of recipients){const address=email(to);if(!address||!address.endsWith('@'+inbound.toLowerCase()))continue;const key=address.split('@')[0].match(/^chat-([a-f0-9]{48})$/)?.[1];if(key)chat=db.prepare('SELECT * FROM chats WHERE reply_key=?').get(key);if(chat)break}
  if(!chat){json(res,200,{ok:true});return}
  const text=String(received.text||'').split(/\r?\n(?:On .+wrote:|>.*|---|_{5,}|From:)/i)[0].trim().slice(0,6000);
  if(!text)throw error(422,'A plain-text reply is required.');
  db.exec('BEGIN IMMEDIATE');try{db.prepare('INSERT OR IGNORE INTO messages(chat_id,role,text,status,provider_id,created) VALUES(?,?,?,?,?,?)').run(chat.id,'princewill',text,'sent','inbound-'+event.data.email_id,now());db.prepare('INSERT OR IGNORE INTO webhooks(id,created) VALUES(?,?)').run(eventId,now());db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
  json(res,200,{ok:true});
 }
 return {db,close:()=>db.close(),async handle(req,res){const url=new URL(req.url,origin);if(!url.pathname.startsWith('/api/chat'))return false;
  try{
   if(url.pathname==='/api/chat/webhook'&&req.method==='POST'){if(!configured())throw error(503,'Email chat is not configured.');await webhook(req,res);return true}
   if(req.method!=='GET'&&req.headers.origin!==origin)throw error(403,'This request must come from the portfolio.');
   if(url.pathname==='/api/chat/config'&&req.method==='GET'){json(res,200,{ready:configured(),transport:'email',replyInChat:configured()});return true}
   if(url.pathname==='/api/chat/messages'&&req.method==='GET'){const chat=session(req);json(res,200,{chat:chat?{name:chat.name,email:chat.email}:null,messages:chat?list(chat):[]});return true}
   if(url.pathname==='/api/chat/messages'&&req.method==='POST'){
    if(!configured())throw error(503,'Email chat is being connected. Your message has not been sent.');
    if(!String(req.headers['content-type']).startsWith('application/json'))throw error(415,'JSON required.');
    throttle(req,'message',60);const data=JSON.parse(await body(req));const text=String(data.text||'').trim(),clientId=String(data.clientId||'');if(!text||text.length>3000||!/^[-\w]{8,80}$/.test(clientId))throw error(400,'Enter a message up to 3,000 characters.');if(data.website)throw error(400,'Unable to send this message.');
    let chat=session(req),cookie;
    if(!chat){throttle(req,'new',5);const name=String(data.name||'').trim();const address=email(data.email);if(!name||name.length>100||!address||address.length>254)throw error(400,'Enter your name and a valid reply email.');const token=randomBytes(32).toString('base64url'),id=randomBytes(16).toString('hex'),replyKey=randomBytes(24).toString('hex');db.prepare('INSERT INTO chats VALUES(?,?,?,?,?,?)').run(id,hash(token),replyKey,name,address,now());chat=db.prepare('SELECT * FROM chats WHERE id=?').get(id);cookie=`po_chat=${token}; HttpOnly; SameSite=Strict; Path=/api/chat; Max-Age=2592000${secure?'; Secure':''}`}
    // Set the session even on a temporary email-provider failure so retries use
    // the same idempotency key and the same private conversation.
    if(cookie)res.setHeader('Set-Cookie',cookie);await send(chat,text,clientId);json(res,200,{chat:{name:chat.name,email:chat.email},messages:list(chat)});return true;
   }
   json(res,404,{error:'Chat endpoint not found.'});
  }catch(e){json(res,e.status||500,{error:e.status?e.message:'The chat service could not complete the request. Please retry.'})}return true;
 }};
}
