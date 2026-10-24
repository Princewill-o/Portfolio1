export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));export const turn=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export class Soccer{
 constructor(options={}){this.options=options;this.score=[0,0];this.time=options.duration==='quick'?60:120;this.over=false;this.padTimers=[0,0,0,0];this.resetKickoff()}
 resetKickoff(){this.cars=[{x:0,z:10,angle:Math.PI,speed:0,y:0,vy:0,boost:100},{x:0,z:-10,angle:0,speed:0,y:0,vy:0,boost:100}];this.ball={x:0,z:0,y:1,vx:0,vz:0,vy:0};this.freeze=1.2;this.events=[]}
 update(dt,keys=new Set(),pressed=new Set()){
 this.events=[];if(this.over)return;this.time=Math.max(0,this.time-dt);if(this.freeze>0){this.freeze-=dt;return}
 const p=this.cars[0],ai=this.cars[1],b=this.ball;
 let throttle=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),steer=(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)-(keys.has('KeyD')||keys.has('ArrowRight')?1:0);
 const target={x:b.x,z:b.z-2},angle=Math.atan2(target.x-ai.x,target.z-ai.z),difference=turn(ai.angle,angle),aiSteer=clamp(difference,-1,1),distance=Math.hypot(target.x-ai.x,target.z-ai.z);
 for(let i=0;i<2;i++){const c=this.cars[i],boost=i===0?keys.has('ShiftLeft')&&c.boost>0:distance>5&&Math.abs(difference)<.45&&c.boost>10;const gas=i===0?throttle:Math.abs(difference)>2?-.35:1;const steering=i===0?steer:aiSteer;c.angle+=steering*2.5*dt*(.35+Math.min(1,Math.abs(c.speed)/7))*(c.speed<-.5?-1:1);c.speed+=gas*(boost?27:14)*dt;c.speed*=Math.exp(-dt*(gas?1.1:2.1));c.speed=clamp(c.speed,-7,boost?24:15);if(boost)c.boost=Math.max(0,c.boost-dt*28);else c.boost=Math.min(100,c.boost+dt*7);c.boosting=boost&&gas>0;c.x+=Math.sin(c.angle)*c.speed*dt;c.z+=Math.cos(c.angle)*c.speed*dt;
 if((i===0&&pressed.has('Space'))&&c.y===0){c.vy=7;this.events.push('jump')}c.vy-=18*dt;c.y+=c.vy*dt;if(c.y<0){c.y=0;c.vy=0}if(Math.abs(c.x)>13){c.x=clamp(c.x,-13,13);c.speed*=-.4}if(Math.abs(c.z)>19){c.z=clamp(c.z,-19,19);c.speed*=-.4}
 const dx=b.x-c.x,dz=b.z-c.z,d=Math.hypot(dx,dz);if(d<1.9&&Math.abs(b.y-c.y-1)<1.6){const nx=d>.01?dx/d:Math.sin(c.angle),nz=d>.01?dz/d:Math.cos(c.angle);b.x=c.x+nx*1.95;b.z=c.z+nz*1.95;const hit=Math.max(5,Math.abs(c.speed)*1.35);b.vx=nx*hit+Math.sin(c.angle)*Math.abs(c.speed)*.35;b.vz=nz*hit+Math.cos(c.angle)*Math.abs(c.speed)*.35;b.vy=Math.max(b.vy,2+Math.max(0,c.vy)*.7);this.events.push('kick')}
 }
 const cd=Math.hypot(p.x-ai.x,p.z-ai.z);if(cd<2.1&&cd>.01){const nx=(p.x-ai.x)/cd,nz=(p.z-ai.z)/cd;p.x+=nx*(2.1-cd)*.5;p.z+=nz*(2.1-cd)*.5;ai.x-=nx*(2.1-cd)*.5;ai.z-=nz*(2.1-cd)*.5;p.speed*=.95;ai.speed*=.95}
 b.x+=b.vx*dt;b.z+=b.vz*dt;b.vy-=12*dt;b.y+=b.vy*dt;b.vx*=Math.exp(-dt*(b.y<=1?1:.16));b.vz*=Math.exp(-dt*(b.y<=1?1:.16));if(b.y<1){b.y=1;b.vy=Math.abs(b.vy)>.6?-b.vy*.66:0}if(Math.abs(b.x)>13.1){b.x=clamp(b.x,-13.1,13.1);b.vx*=-.8}
 if(Math.abs(b.z)>20.5&&Math.abs(b.x)<4.6&&b.y<4.5){const team=b.z<0?0:1;this.score[team]++;this.resetKickoff();this.events.push(team===0?'goal-player':'goal-rival')}else if(Math.abs(b.z)>19.1&&(Math.abs(b.x)>=4.6||b.y>=4.5)){b.z=clamp(b.z,-19.1,19.1);b.vz*=-.8}
 const pads=[[-9,-12],[9,-12],[-9,12],[9,12]];this.padTimers=this.padTimers.map(t=>Math.max(0,t-dt));pads.forEach(([x,z],i)=>{if(!this.padTimers[i]&&this.cars.some(c=>{if(Math.hypot(c.x-x,c.z-z)<2){c.boost=100;return true}return false})){this.padTimers[i]=5;this.events.push('boost')}});
 if(Math.max(...this.score)>=5||this.time===0&&this.score[0]!==this.score[1]){this.over=true;this.winner=this.score[0]>this.score[1]?0:1}
 }
}
