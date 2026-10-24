export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Platformer{
 constructor(options={}){this.options=options;this.level=1;this.lives=options.assist==='yes'?99:5;this.total=0;this.time=0;this.over=false;this.won=false;this.loadLevel()}
 loadLevel(){const raise=(this.level-1)*.12;this.platforms=[{x:2,y:0,w:12},{x:11,y:1.2,w:4,spring:true},{x:17,y:2.2,w:4},{x:23,y:2,w:4,moving:true},{x:29,y:.9,w:5},{x:35,y:2.1+raise,w:4},{x:41,y:3+raise,w:4},{x:47,y:1.6,w:6}].map((p,i)=>({...p,id:i,base:p.x}));this.tokens=this.platforms.map((p,i)=>({x:p.x,y:p.y+1.3,id:i,got:false}));this.player={x:0,y:.1,vx:0,vy:0,ground:-1,coyote:0,buffer:0};this.checkpoint={x:0,y:.1};this.found=0;this.events=[];this.bridgeStopped=false;this.phase=0;this.lastGate=-5;this.hurt=.8}
 respawn(){this.lives--;this.events.push('hurt');if(this.lives<=0){this.over=true;return}this.player={x:this.checkpoint.x,y:this.checkpoint.y,vx:0,vy:0,ground:-1,coyote:0,buffer:0};this.hurt=1}
 update(dt,keys=new Set(),pressed=new Set()){
 this.events=[];if(this.over)return;this.time+=dt;this.hurt=Math.max(0,this.hurt-dt);const p=this.player;const moving=this.platforms[3],oldX=moving.x;if(!this.bridgeStopped)this.phase+=dt;moving.x=moving.base+Math.sin(this.phase*1.2)*1.4;if(p.ground===3)p.x+=moving.x-oldX;
 if(pressed.has('KeyE')&&Math.abs(p.x-17)<3){this.bridgeStopped=!this.bridgeStopped;this.events.push('bridge')}
 const dir=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);p.vx+=dir*32*dt;if(!dir)p.vx*=Math.exp(-12*dt);p.vx=clamp(p.vx,-6,6);p.x=clamp(p.x+p.vx*dt,-3,50);if(p.ground>=0)p.coyote=.12;else p.coyote=Math.max(0,p.coyote-dt);if(pressed.has('Space'))p.buffer=.15;else p.buffer=Math.max(0,p.buffer-dt);if(p.buffer>0&&p.coyote>0){p.vy=9.5;p.ground=-1;p.coyote=0;p.buffer=0;this.events.push('jump')}
 const before=p.y;p.vy-=23*dt;if(!keys.has('Space')&&p.vy>0)p.vy-=18*dt;p.y+=p.vy*dt;p.ground=-1;for(const platform of this.platforms){if(Math.abs(p.x-platform.x)<platform.w/2+.32&&before>=platform.y-.08&&p.y<=platform.y&&p.vy<=0){p.y=platform.y;p.vy=0;p.ground=platform.id;if(platform.spring){p.vy=12.5;p.ground=-1;this.events.push('spring')}}}
 for(const token of this.tokens){if(token.id===3)token.x=moving.x;if(!token.got&&Math.hypot(p.x-token.x,p.y+.8-token.y)<1){token.got=true;this.found++;this.total++;this.events.push('token')}}
 if(p.x>27&&this.checkpoint.x<28){this.checkpoint={x:29,y:1};this.events.push('checkpoint')}
 const hazardX=this.level===1?6:this.level===2?17:35,hazardY=this.level===1?0:this.level===2?2.2:2.1+(this.level-1)*.12;
 if(p.y<-7||this.options.assist!=='yes'&&this.hurt===0&&Math.abs(p.x-hazardX)<.6&&p.y<hazardY+.5&&p.y>hazardY-1){this.respawn();return}
 if(p.x>46){if(this.found>=5){if(this.level===3){this.over=true;this.won=true;this.events.push('win')}else{this.level++;this.loadLevel();this.events.push('next-level')}}else{p.x=46;if(this.time-this.lastGate>3){this.events.push('locked');this.lastGate=this.time}}}
 }
}
