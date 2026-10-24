import test from 'node:test';
import assert from 'node:assert/strict';
import {Duel,FORMS} from '../rules.js';
const set=(...v)=>new Set(v),step=(g,n=60,keys=set())=>{for(let i=0;i<n;i++)g.update(1/120,keys)};
test('Melee has startup, one active hit, recovery and combo damage scaling',()=>{
 const g=new Duel({mode:'training'}),[p,e]=g.fighters;e.x=p.x+1.4;
 assert(g.attack(p,e,'punch'));assert.equal(e.hp,100);step(g,6);assert.equal(e.hp,100);step(g,7);assert(e.hp<100);assert.equal(p.combo,1);const hp=e.hp;assert(!g.attack(p,e,'punch'));step(g,30);assert.equal(e.hp,hp,'one attack cannot hit repeatedly');
});
test('Guard consumes ki; insufficient ki causes guard break and hitstun',()=>{
 const g=new Duel({mode:'versus'}),[p,e]=g.fighters;e.x=p.x+1.2;e.face=-1;e.block=true;e.ki=40;g.hit(e,10,p);assert.equal(e.hp,98.2);assert.equal(e.ki,35);assert.equal(p.combo,0);
 e.inv=0;e.ki=1;g.hit(e,10,p);assert(e.guardBroken>0);assert(e.stun>0);assert(e.hp<90);assert.equal(p.combo,1);
});
test('Three progressive forms require ki, lock attacks during transformation, and revert at zero',()=>{
 const g=new Duel({mode:'training'}),p=g.fighters[0];assert(!g.transform(p));
 for(let form=1;form<=3;form++){p.ki=100;assert(g.transform(p));assert.equal(p.form,form);assert(!g.attack(p,g.fighters[1],'blast'));step(g,120);assert.equal(FORMS[p.form].name,FORMS[form].name)}
 assert(!g.transform(p));p.ki=.001;step(g,1);assert.equal(p.form,0);
});
test('Ki blasts use swept hits and cost energy; opposing bolts cancel',()=>{
 const g=new Duel({mode:'training'}),[p,e]=g.fighters;e.x=p.x+4;p.ki=40;assert(g.attack(p,e,'blast'));assert.equal(p.ki,31);step(g,45);assert(e.hp<100);assert.equal(g.bolts.length,0);
 g.bolts=[{id:1,x:-.2,y:1.3,vx:0,life:1,owner:0,damage:7},{id:2,x:.2,y:1.3,vx:0,life:1,owner:1,damage:7}];g.update(1/120);assert.equal(g.bolts.length,0);assert(g.events.some(e=>e.kind==='clash'));
});
test('Charged beams damage over time and opposing beams clash without hitting through',()=>{
 let g=new Duel({mode:'training'}),[p,e]=g.fighters;p.ki=100;p.beamCharge=1;assert(g.beam(p));assert.equal(p.ki,60);step(g,160);assert(e.hp<100);assert.equal(g.beams.length,0);
 g=new Duel({mode:'versus'});[p,e]=g.fighters;p.ki=e.ki=100;g.beam(p);g.beam(e);step(g,20);assert.equal(p.hp,100);assert.equal(e.hp,100);assert(g.beams.every(b=>Math.abs(b.stop)<1));
});
test('Beam input charges while held and fires on release; local player two attacks',()=>{
 const g=new Duel({mode:'versus'}),[p,e]=g.fighters;p.ki=100;step(g,80,set('KeyO'));assert(p.beamCharge>.6);g.update(1/120);assert(g.beams.some(b=>b.owner===0));
 const local=new Duel({mode:'versus'});local.fighters[1].x=local.fighters[0].x+1.4;local.update(1/120,set(),set('Numpad1'));assert.equal(local.fighters[1].action?.type,'punch');
});
test('Teleport places fighter behind rival, spends ki, and respects cooldown',()=>{
 const g=new Duel(),[p,e]=g.fighters;p.ki=100;assert(g.teleport(p,e));assert(p.x>e.x);assert.equal(p.ki,80);assert(!g.teleport(p,e));
});
test('Rounds resolve once, draws replay, and AI completes valid matches',()=>{
 const g=new Duel({difficulty:'hard'});for(let i=0;i<80000&&!g.over;i++)g.update(1/120,set('KeyC'));assert(g.over);assert(g.fighters.every(f=>Number.isFinite(f.x)&&f.hp>=0&&f.hp<=100&&f.ki>=0&&f.ki<=100));assert(g.wins.some(w=>w===2));const wins=[...g.wins];step(g,600);assert.deepEqual(g.wins,wins);
 const draw=new Duel({mode:'versus'});draw.timer=0;draw.update(1/120);assert.equal(draw.roundWinner,-1);assert.deepEqual(draw.wins,[0,0]);step(draw,310);assert.equal(draw.round,2);
});
