export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const FORMS=[
 {name:'Base',power:1,speed:1,drain:0,color:'#83dfff'},
 {name:'Super Saiyan',power:1.16,speed:1.08,drain:.7,color:'#ffe770',cost:60},
 {name:'Super Saiyan 2',power:1.3,speed:1.14,drain:1.5,color:'#ffca45',cost:80},
 {name:'Super Saiyan Blue',power:1.45,speed:1.2,drain:2.3,color:'#65ddff',cost:95}
];
const MOVES={
 punch:{startup:.065,active:.095,recovery:.13,reach:1.85,damage:6,stun:.2,push:2.5},
 kick:{startup:.12,active:.12,recovery:.2,reach:2.3,damage:10,stun:.28,push:5},
 heavy:{startup:.2,active:.1,recovery:.32,reach:2.45,damage:14,stun:.38,push:9},
 uppercut:{startup:.11,active:.12,recovery:.3,reach:1.9,damage:10,stun:.4,push:3,lift:7}
};
export class Duel{
 constructor(options={}){this.options=options;this.difficulty=options.difficulty||'normal';this.mode=options.mode||'arcade';this.round=1;this.wins=[0,0];this.over=false;this.seed=options.seed||31;this.serial=0;this.resetRound()}
 random(){this.seed=this.seed*16807%2147483647;return(this.seed-1)/2147483646}
 fighter(i){return {id:i,x:i?4:-4,y:0,vx:0,vy:0,hp:100,ki:45,speed:6,power:1,face:i?-1:1,cd:0,inv:0,stun:0,attack:0,action:null,actionTime:0,form:0,transformed:false,transformTime:0,flight:false,block:false,charging:false,beamCharge:0,combo:0,comboTime:0,queue:null,teleportCD:0,pose:'idle',poseTime:0,aiThink:.3,guardBroken:0}}
 resetRound(){this.fighters=[this.fighter(0),this.fighter(1)];this.bolts=[];this.beams=[];this.timer=99;this.delay=0;this.events=[];this.hitstop=0;this.roundWinner=null}
 emit(kind,details={}){this.events.push({kind,...details})}
 form(f){return FORMS[f.form]}
 transform(f){const next=f.form+1,form=FORMS[next];if(!form||f.ki<form.cost||f.stun||f.action||f.transformTime)return false;f.ki-=form.cost*.5;f.form=next;f.transformed=true;f.transformTime=.9;f.inv=.5;f.beamCharge=0;this.emit('transform',{owner:f.id,form:next});return true}
 hit(target,damage,source,{push=4,stun=.22,lift=0,beam=false}={}){
  if(target.inv>0||target.hp<=0)return false;
  let blocked=target.block&&target.face===Math.sign(source.x-target.x)&&target.guardBroken<=0;
  if(blocked&&target.ki<5){blocked=false;target.guardBroken=.8;this.emit('guard-break',{owner:target.id})}
  if(blocked)target.ki=clamp(target.ki-5,0,100);
  const scale=1-Math.min(.55,source.combo*.065),actual=damage*(blocked?.18:scale);
  target.hp=clamp(target.hp-actual,0,100);target.inv=beam?.1:.075;
  target.vx=Math.sign(target.x-source.x||source.face)*push*(blocked?.3:1);
  if(!blocked){target.stun=stun;target.block=false;target.action=null;target.beamCharge=0;target.vy=Math.max(target.vy,lift);source.combo++;source.comboTime=1.15;source.ki=clamp(source.ki+3,0,100);target.ki=clamp(target.ki+2,0,100);this.hitstop=beam?.025:.045;}
  this.emit(blocked?'block':'hit',{x:target.x,y:target.y+1.2,owner:source.id,target:target.id,combo:source.combo,damage:actual});return true;
 }
 attack(f,other,type){
  if(f.cd>0||f.stun>0||f.transformTime>0||f.action||f.block)return false;
  const power=this.form(f).power;
  if(type==='blast'){
   if(f.ki<9)return false;f.ki-=9;f.cd=.25;f.pose='blast';f.poseTime=.24;
   this.bolts.push({id:++this.serial,x:f.x+f.face*.8,y:f.y+1.25,vx:f.face*17,owner:f.id,life:1.65,damage:7*power,radius:.22});this.emit('blast',{owner:f.id});return true;
  }
  const move=MOVES[type];if(!move)return false;
  f.action={...move,type,hit:false};f.actionTime=0;f.attack=move.startup+move.active;f.cd=move.startup+move.active+move.recovery;f.pose=type;f.poseTime=f.cd;this.emit('swing',{owner:f.id,type});return true;
 }
 beam(f,ultimate=false){
  if(f.stun||f.transformTime||f.cd>0||f.block)return false;
  const available=f.ki,charge=Math.min(f.beamCharge,Math.max(0,(available-25)/15)),cost=ultimate?80:25+Math.min(1,charge)*15;if(f.ki<cost)return false;
  f.ki-=cost;f.beamCharge=0;f.cd=ultimate?1.3:.85;f.pose='beam';f.poseTime=.7;
  this.beams.push({id:++this.serial,x:f.x+f.face*.65,y:f.y+1.3,face:f.face,owner:f.id,life:ultimate?.85:.55,maxLife:ultimate?.85:.55,power:this.form(f).power*(ultimate?1.8:1+charge*.5),damage:ultimate?6:4.5,thickness:ultimate?.65:.35+charge*.12,tick:0,ultimate});
  this.emit(ultimate?'ultimate':'beam',{owner:f.id});return true;
 }
 teleport(f,other){if(f.ki<20||f.teleportCD||f.stun||f.transformTime)return false;this.emit('teleport',{owner:f.id,x:f.x,y:f.y});f.ki-=20;f.x=clamp(other.x-other.face*1.45,-9.5,9.5);f.y=other.y;f.inv=.2;f.teleportCD=1.2;f.action=null;f.cd=.1;f.face=Math.sign(other.x-f.x)||1;return true}
 input(f,other,keys,pressed,second=false,dt=0){
  const map=second?{left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',jump:'Numpad8',fly:'Numpad4',punch:'Numpad1',kick:'Numpad2',blast:'Numpad3',guard:'Numpad0',charge:'Numpad5',form:'Numpad7',beam:'Numpad6',ultimate:'Numpad9',dash:'ShiftRight',teleport:'NumpadDecimal'}:{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',jump:'Space',fly:'KeyF',punch:'KeyJ',kick:'KeyK',blast:'KeyI',guard:'KeyL',charge:'KeyC',form:'KeyT',beam:'KeyO',ultimate:'KeyU',dash:'ShiftLeft',teleport:'KeyQ'};
  const held=k=>keys.has(map[k]),tap=k=>pressed.has(map[k]),dir=(held('right')?1:0)-(held('left')?1:0);
  f.block=held('guard')&&!f.action&&!f.stun&&!f.transformTime&&!f.beamCharge&&!f.guardBroken;
  f.charging=held('charge')&&!dir&&!f.block&&!f.stun&&!f.action&&!f.transformTime&&!f.beamCharge;
  if(f.stun||f.transformTime){f.charging=false;return}
  if(tap('form'))this.transform(f);
  if(f.transformTime)return;
  if(tap('teleport'))this.teleport(f,other);
  if(tap('fly')&&!f.action){f.flight=!f.flight;f.vy=0}
  if(tap('jump')&&f.y<.02&&!f.block&&!f.action)f.vy=10;
  if(!f.block&&!f.action&&!f.charging&&!f.beamCharge){const dash=held('dash')&&f.ki>1;f.x=clamp(f.x+dir*f.speed*this.form(f).speed*(dash?1.85:1)*dt,-10,10);if(dash&&dir)f.ki=Math.max(0,f.ki-dt*12)}
  if(f.flight){f.y=clamp(f.y+((held('up')?1:0)-(held('down')?1:0))*5*dt,0,6.5);f.ki=Math.max(0,f.ki-dt*2);if(f.ki<=0)f.flight=false}
  if(f.charging)f.ki=clamp(f.ki+dt*28,0,100);
  if(held('beam')&&!f.action&&!f.cd&&!f.block&&f.ki>=25)f.beamCharge=Math.min(1.4,f.beamCharge+dt);
  if(f.beamCharge>0&&(!held('beam')||f.beamCharge>=1.4))this.beam(f);
  if(tap('ultimate'))this.beam(f,true);
  const type=tap('punch')?(held('down')?'uppercut':f.combo>=3?'heavy':'punch'):tap('kick')?'kick':tap('blast')?'blast':null;
  if(type)f.queue={type,ttl:.23};
  if(f.queue){f.queue.ttl-=dt;if(f.queue.ttl<=0)f.queue=null;else if(!f.action&&f.cd<=0&&!f.beamCharge){this.attack(f,other,f.queue.type);f.queue=null}}
 }
 ai(f,p,dt){
  if(this.mode==='training')return;
  const rate=this.difficulty==='easy'?.65:this.difficulty==='hard'?1.35:1,d=Math.abs(p.x-f.x);
  if(f.stun||f.transformTime)return;
  f.block=p.action&&d<2.5&&this.random()<.65*rate;
  f.charging=f.ki<25&&d>5&&!f.action;
  if(f.charging)f.ki=clamp(f.ki+dt*20,0,100);
  if(!f.action&&!f.block&&!f.charging){f.x=clamp(f.x+Math.sign(p.x-f.x)*f.speed*.8*rate*(d>1.7?1:d<1?-.6:0)*dt,-10,10);if(p.y>1.5){f.flight=true;f.y=clamp(f.y+Math.sign(p.y-f.y)*4*dt,0,6.5)}else if(f.y>.1)f.flight=false}
  f.aiThink-=dt;if(f.aiThink>0)return;f.aiThink=(.18+this.random()*.3)/rate;
  if(f.form<3&&f.ki>=FORMS[f.form+1].cost&&(f.hp<65||this.difficulty==='hard')){this.transform(f);return}
  if(p.beamCharge>.7&&f.ki>22&&this.difficulty==='hard'&&this.random()<.45){this.teleport(f,p);return}
  if(d>4&&f.ki>45&&this.random()<.3){f.beamCharge=.8;this.beam(f);return}
  this.attack(f,p,d<2.5?(this.random()<.55?'punch':this.random()<.5?'kick':'heavy'):'blast');
 }
 update(dt,keys=new Set(),pressed=new Set()){
  this.events=[];dt=clamp(Number.isFinite(dt)?dt:0,0,.05);if(this.over)return;
  if(this.hitstop>0){this.hitstop=Math.max(0,this.hitstop-dt);return}
  if(this.delay>0){this.delay-=dt;if(this.delay<=0){this.round++;this.resetRound();this.emit('fight',{round:this.round})}return}
  const [p,e]=this.fighters;if(this.mode!=='training')this.timer=Math.max(0,this.timer-dt);
  for(const f of this.fighters){f.face=Math.sign((f===p?e:p).x-f.x)||f.face;for(const key of ['cd','inv','stun','attack','transformTime','teleportCD','poseTime','guardBroken'])f[key]=Math.max(0,f[key]-dt);f.comboTime-=dt;if(f.comboTime<=0)f.combo=0;f.ki=clamp(f.ki+dt*(1.5-this.form(f).drain),0,100);if(!f.ki&&f.form){f.form=0;f.transformed=false;this.emit('revert',{owner:f.id})}f.x=clamp(f.x+f.vx*dt,-10,10);f.vx*=Math.exp(-dt*9)}
  this.input(p,e,keys,pressed,false,dt);if(this.mode==='versus')this.input(e,p,keys,pressed,true,dt);else this.ai(e,p,dt);
  for(const f of this.fighters){
   const other=this.fighters[1-f.id],a=f.action;
   if(a){f.actionTime+=dt;if(!a.hit&&f.actionTime>=a.startup&&f.actionTime<=a.startup+a.active){if(Math.abs(other.x-f.x)<=a.reach&&Math.abs(other.y-f.y)<1.5){a.hit=this.hit(other,a.damage*this.form(f).power,f,a)}}if(f.actionTime>=a.startup+a.active+a.recovery)f.action=null}
   if(!f.flight){f.vy-=22*dt;f.y+=f.vy*dt;if(f.y<=0){f.y=0;f.vy=0}}
  }
  const sep=Math.abs(p.x-e.x);if(sep<.75&&Math.abs(p.y-e.y)<1.6){const n=(.75-sep)/2;p.x=clamp(p.x-p.face*n,-10,10);e.x=clamp(e.x-e.face*n,-10,10)}
  for(const bolt of this.bolts){const prev=bolt.x;bolt.x+=bolt.vx*dt;bolt.life-=dt;const target=this.fighters[1-bolt.owner];if(target.x>=Math.min(prev,bolt.x)-.55&&target.x<=Math.max(prev,bolt.x)+.55&&Math.abs(bolt.y-target.y-1.25)<1){this.hit(target,bolt.damage,this.fighters[bolt.owner]);bolt.life=0}}
  for(let i=0;i<this.bolts.length;i++)for(let j=i+1;j<this.bolts.length;j++){const a=this.bolts[i],b=this.bolts[j];if(a.life>0&&b.life>0&&a.owner!==b.owner&&Math.abs(a.x-b.x)<.7&&Math.abs(a.y-b.y)<.5){a.life=b.life=0;this.emit('clash',{x:(a.x+b.x)/2,y:a.y})}}
  for(const beam of this.beams){beam.life-=dt;beam.tick-=dt;const f=this.fighters[beam.owner],target=this.fighters[1-beam.owner];beam.x=f.x+beam.face*.65;beam.y=f.y+1.3;const rival=this.beams.find(b=>b!==beam&&b.owner!==beam.owner&&b.life>0&&Math.abs(b.y-beam.y)<.8&&b.face!==beam.face);if(rival){beam.stop=(beam.x+rival.x)/2;if(beam.tick<=0){this.emit('clash',{x:beam.stop,y:beam.y});beam.tick=.12}continue}beam.stop=beam.face*13;if(beam.tick<=0&&Math.sign(target.x-beam.x)===beam.face&&Math.abs(target.y+1.25-beam.y)<beam.thickness+.7){this.hit(target,beam.damage*beam.power,f,{push:3,stun:.14,beam:true});beam.tick=.14}}
  this.bolts=this.bolts.filter(b=>b.life>0&&Math.abs(b.x)<14);this.beams=this.beams.filter(b=>b.life>0);
  if(this.mode==='training'){if(e.hp<30)e.hp=100;return}
  if(p.hp<=0||e.hp<=0||this.timer===0){const winner=p.hp===e.hp?-1:p.hp>e.hp?0:1;this.roundWinner=winner;if(winner>=0)this.wins[winner]++;this.emit('round',{winner});this.bolts=[];this.beams=[];if(winner>=0&&this.wins[winner]>=2){this.over=true;this.winner=winner}else this.delay=2.5}
 }
}
