import {THREE} from './lib/core.js';
// Original articulated enemies. Geometry is constructed locally; no downloaded character assets.
export const ENEMY_NAMES={chaser:'Rift Stalker',ranged:'Hex Oracle',tank:'Iron Bastion',charger:'Ember Ravager',sentinel:'Prism Warden'};
export function createEnemy(e,scene){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);root.name=ENEMY_NAMES[e.type];
 const colors={chaser:0xf064a1,ranged:0xb39aff,tank:0xffb65e,charger:0xff7045,sentinel:0x65e6e0};
 const accent=colors[e.type],armor=new THREE.MeshStandardMaterial({color:0x27314a,metalness:.65,roughness:.38}),shell=new THREE.MeshStandardMaterial({color:accent,metalness:.35,roughness:.36}),glow=new THREE.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:1.8,roughness:.3});
 const add=(geo,x,y,z,mat=armor)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData.cleanArt=true;body.add(m);return m};
 const cube=(x,y,z,w,h,d,m)=>add(new THREE.BoxGeometry(w,h,d),x,y,z,m);
 const orb=(x,y,z,r,m)=>add(new THREE.SphereGeometry(r,10,8),x,y,z,m);
 const limbs=[];let halo;
 if(e.type==='ranged'||e.type==='sentinel'){
  add(new THREE.OctahedronGeometry(.48),0,1.05,0,shell);orb(0,1.08,.4,.16,glow);
  halo=add(new THREE.TorusGeometry(.73,.055,6,24),0,1.05,0,glow);halo.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const shard=add(new THREE.ConeGeometry(.16,.65,4),Math.cos(a)*.66,.8,Math.sin(a)*.66,shell);shard.rotation.z=.35;limbs.push(shard)}
  if(e.type==='sentinel'){const crown=add(new THREE.TorusGeometry(.48,.04,6,20),0,1.65,0,glow);crown.rotation.x=Math.PI/2;for(const x of [-.42,.42])cube(x,1.05,.15,.14,.7,.18,armor)}
 }else{
  const tank=e.type==='tank',charger=e.type==='charger';
  cube(0,.96,0,tank?1.1:.65,tank?1:.72,tank?.7:.43,shell);
  cube(0,.98,.25,tank?.8:.48,.38,.16,armor);orb(0,1,.37,.14,glow);
  const head=add(new THREE.IcosahedronGeometry(tank?.4:.31,0),0,tank?1.65:1.48,0,armor);head.scale.y=.8;
  cube(0,tank?1.67:1.49,.26,.42,.08,.07,glow);
  for(const sign of [-1,1]){
   const leg=new THREE.Group();leg.position.set(sign*(tank?.35:.22),.66,0);body.add(leg);
   const shin=new THREE.Mesh(new THREE.BoxGeometry(tank?.32:.19,.5,.24),armor);shin.position.y=-.23;leg.add(shin);
   const boot=new THREE.Mesh(new THREE.BoxGeometry(tank?.4:.24,.18,.43),shell);boot.position.set(0,-.48,.09);leg.add(boot);limbs.push(leg);
   cube(sign*(tank?.72:.47),1.15,0,tank?.45:.22,tank?.55:.5,.45,armor);
   const horn=add(new THREE.ConeGeometry(.13,charger?.65:.34,4),sign*.24,tank?2:1.83,0,shell);horn.rotation.z=sign*-.35;
   if(tank)cube(sign*.78,.94,.21,.33,.85,.16,shell);
   if(charger){const blade=add(new THREE.ConeGeometry(.16,.8,4),sign*.58,.9,.32,glow);blade.rotation.x=Math.PI/2}
  }
 }
 const telegraph=new THREE.Mesh(new THREE.RingGeometry(.62,.7,32),new THREE.MeshBasicMaterial({color:accent,side:THREE.DoubleSide,transparent:true,opacity:.65,depthWrite:false}));telegraph.rotation.x=-Math.PI/2;telegraph.position.y=.035;root.add(telegraph);
 const health=new THREE.Mesh(new THREE.PlaneGeometry(1,.075),new THREE.MeshBasicMaterial({color:accent,depthTest:false}));health.position.y=2.25;health.renderOrder=4;root.add(health);
 root.userData={body,limbs,halo,telegraph,health,glow,lastHp:e.hp,flash:0};scene.add(root);return root;
}
export function animateEnemy(root,e,player,time,dt,camera){
 const d=root.userData;root.position.set(e.x,0,e.z);d.body.rotation.y=Math.atan2(player.x-e.x,player.z-e.z);
 d.body.position.y=e.type==='ranged'||e.type==='sentinel'?Math.sin(time*3+e.id)*.13:Math.abs(Math.sin(time*7+e.id))*.035;
 d.limbs.forEach((limb,i)=>{if(e.type==='ranged'||e.type==='sentinel')limb.position.y=.8+Math.sin(time*3+i)*.15;else limb.rotation.x=Math.sin(time*(e.type==='tank'?4:9)+i*Math.PI)*.3});
 if(d.halo){d.halo.rotation.z=time;d.halo.rotation.y=time*.4}
 if(e.hp<d.lastHp)d.flash=.13;d.lastHp=e.hp;d.flash=Math.max(0,d.flash-dt);d.glow.emissiveIntensity=d.flash>0?5:1.5+Math.sin(time*3)*.25;
 const preparing=e.type==='charger'&&e.chargeState==='windup';d.telegraph.scale.setScalar(preparing?1.35:1);d.telegraph.material.opacity=preparing?.5+Math.sin(time*20)*.35:.28;
 d.health.visible=e.hp<e.maxHp;d.health.scale.x=Math.max(0,e.hp/e.maxHp);d.health.quaternion.copy(camera.quaternion);
}
