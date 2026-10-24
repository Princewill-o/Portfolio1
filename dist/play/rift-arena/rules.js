const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Arena{
 constructor(options={}){this.options=options;this.player={x:0,z:0,hp:100,energy:0,inv:1,dash:0,dashCd:0,pulseCd:0,fireCd:0};this.enemies=[];this.bullets=[];this.pickups=[];this.wave=0;this.kills=0;this.shots=0;this.hits=0;this.time=0;this.seed=91;this.serial=0;this.over=false;this.won=false;this.wait=1;this.events=[]}
 random(){this.seed=this.seed*16807%2147483647;return(this.seed-1)/2147483646}
 spawnWave(){this.wave++;for(let i=0;i<4+this.wave*2;i++){const a=i*Math.PI*2/(4+this.wave*2),type=this.wave>=3&&i%5===0?'sentinel':this.wave>=2&&i%4===1?'charger':i%4===0?'tank':i%3===0?'ranged':'chaser';this.enemies.push({id:++this.serial,x:Math.cos(a)*12,z:Math.sin(a)*12,type,hp:type==='tank'?65:type==='sentinel'?45:type==='charger'?38:type==='ranged'?30:24,maxHp:type==='tank'?65:type==='sentinel'?45:type==='charger'?38:type==='ranged'?30:24,cd:1+this.random(),r:type==='tank'?.8:.5,chargeState:'approach',chargeTime:0,chargeX:0,chargeZ:0})}this.player.hp=Math.min(100,this.player.hp+10);this.events.push('wave')}
 damageEnemy(e,amount){e.hp-=amount;this.hits++;if(e.hp<=0){this.kills++;this.player.energy=Math.min(100,this.player.energy+13);this.events.push('kill');if(this.kills%3===0)this.pickups.push({id:++this.serial,x:e.x,z:e.z});}}
 update(dt,keys=new Set(),pressed=new Set(),aim={x:0,z:-1}){this.events=[];if(this.over)return;this.time+=dt;const p=this.player;for(const k of ['inv','dash','dashCd','pulseCd','fireCd'])p[k]=Math.max(0,p[k]-dt);let dx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),dz=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0),length=Math.hypot(dx,dz)||1;dx/=length;dz/=length;
 if(pressed.has('Space')&&p.dashCd===0){p.dash=.18;p.dashCd=1.5;p.inv=.3;this.events.push('dash')}
 const speed=p.dash>0?22:6;p.x=clamp(p.x+dx*speed*dt,-14,14);p.z=clamp(p.z+dz*speed*dt,-14,14);
 const nearest=this.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];let ax=aim.x,az=aim.z;if(this.options.aim!=='cursor'&&nearest){ax=nearest.x-p.x;az=nearest.z-p.z}const al=Math.hypot(ax,az)||1;ax/=al;az/=al;p.aimX=ax;p.aimZ=az;
 if(keys.has('KeyJ')&&p.fireCd===0){p.fireCd=.15;this.shots++;this.bullets.push({id:++this.serial,x:p.x+ax*.6,z:p.z+az*.6,vx:ax*22,vz:az*22,enemy:false,life:1.6});this.events.push('shoot')}
 if(pressed.has('KeyK')&&p.pulseCd===0){p.pulseCd=3.5;for(const e of this.enemies)if(e.hp>0&&Math.hypot(e.x-p.x,e.z-p.z)<4)this.damageEnemy(e,30);this.events.push('pulse')}
 if(pressed.has('KeyE')&&p.energy>=100){p.energy=0;p.inv=1;for(const e of this.enemies)if(e.hp>0)this.damageEnemy(e,45);this.events.push('ultimate')}
 for(const e of this.enemies){if(e.hp<=0)continue;const x=p.x-e.x,z=p.z-e.z,d=Math.hypot(x,z)||1,speed=e.type==='tank'?1.7:e.type==='ranged'?2.4:3.1+this.wave*.15;const dir=e.type==='ranged'&&d<7?-1:1;if(e.type==='charger'){
 e.chargeTime-=dt;
 if(e.chargeState==='approach'&&d<9){e.chargeState='windup';e.chargeTime=.85;e.chargeX=x/d;e.chargeZ=z/d}
 if(e.chargeState==='windup'&&e.chargeTime<=0){e.chargeState='rush';e.chargeTime=.55}
 if(e.chargeState==='rush'){e.x+=e.chargeX*13*dt;e.z+=e.chargeZ*13*dt;if(e.chargeTime<=0){e.chargeState='recover';e.chargeTime=1.2}}
 else if(e.chargeState==='approach'){e.x+=x/d*2.8*dt;e.z+=z/d*2.8*dt}
 else if(e.chargeState==='recover'&&e.chargeTime<=0)e.chargeState='approach';
 }else if(e.type==='sentinel'){const advance=d>8?1:d<6?-1:0;e.x+=(x/d*advance-z/d*.6)*2.4*dt;e.z+=(z/d*advance+x/d*.6)*2.4*dt}
 else{e.x+=x/d*speed*dt*dir;e.z+=z/d*speed*dt*dir;}e.x=clamp(e.x,-14,14);e.z=clamp(e.z,-14,14);e.cd-=dt;if((e.type==='ranged'||e.type==='sentinel')&&e.cd<0){e.cd=e.type==='sentinel'?2.3:1.6;for(const angle of e.type==='sentinel'?[-.24,0,.24]:[0]){const ax=x/d*Math.cos(angle)-z/d*Math.sin(angle),az=x/d*Math.sin(angle)+z/d*Math.cos(angle);this.bullets.push({id:++this.serial,x:e.x,z:e.z,vx:ax*8,vz:az*8,enemy:true,life:4})}}if(d<e.r+.5&&p.inv===0){p.hp=Math.max(0,p.hp-(e.type==='tank'?22:12));p.inv=.7;this.events.push('hurt')}}
 for(const b of this.bullets){b.x+=b.vx*dt;b.z+=b.vz*dt;b.life-=dt;if(b.enemy){if(Math.hypot(b.x-p.x,b.z-p.z)<.65&&p.inv===0){p.hp=Math.max(0,p.hp-10);p.inv=.4;b.life=0;this.events.push('hurt')}}else{const e=this.enemies.find(e=>e.hp>0&&Math.hypot(e.x-b.x,e.z-b.z)<e.r+.25);if(e){this.damageEnemy(e,10);b.life=0}}}
 this.bullets=this.bullets.filter(b=>b.life>0&&Math.abs(b.x)<18&&Math.abs(b.z)<18);this.enemies=this.enemies.filter(e=>e.hp>0);this.pickups=this.pickups.filter(h=>{if(Math.hypot(h.x-p.x,h.z-p.z)<1){p.hp=Math.min(100,p.hp+20);this.events.push('heal');return false}return true});
 if(!this.enemies.length){this.wait-=dt;if(this.wait<=0){if(this.wave>=5){this.over=true;this.won=true}else{this.spawnWave();this.wait=2.3}}}else this.wait=2.3;if(p.hp<=0){this.over=true;this.won=false}
 }
}
