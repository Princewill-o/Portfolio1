// The durable email-chat backend is not yet configured on Vercel.
// Never accept messages into ephemeral serverless storage or claim delivery.
export default function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
 const path=new URL(req.url,'https://portfolio.invalid').pathname;
 if(req.method==='GET'&&path==='/api/chat/config')return res.status(200).json({ready:false,transport:'email',replyInChat:false});
 if(req.method==='GET'&&path==='/api/chat/messages')return res.status(200).json({chat:null,messages:[]});
 if(req.method==='POST')return res.status(503).json({error:'Website chat is not connected yet. Your message has not been sent. Please use the email or LinkedIn link.'});
 return res.status(404).json({error:'Chat endpoint not found.'});
}
