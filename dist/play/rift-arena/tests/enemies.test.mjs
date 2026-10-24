import assert from 'node:assert/strict';
import {Arena} from '../rules.js';
import {createEnemy,animateEnemy,ENEMY_NAMES} from '../enemy-art.js';
import {THREE} from '../lib/core.js';
const sim=new Arena();for(let i=0;i<5;i++)sim.spawnWave();
assert.deepEqual(new Set(sim.enemies.map(e=>e.type)),new Set(Object.keys(ENEMY_NAMES)));
for(const type of Object.keys(ENEMY_NAMES)){
 const e=sim.enemies.find(e=>e.type===type),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();
 const root=createEnemy(e,scene);let meshes=0;root.traverse(o=>{if(o.isMesh){meshes++;assert(o.geometry.attributes.position.count>0)}});assert(meshes>=8);
 animateEnemy(root,e,{x:0,z:0},1,1/60,camera);e.hp--;animateEnemy(root,e,{x:0,z:0},2,1/60,camera);assert(root.userData.health.visible);assert(root.userData.health.scale.x<1);assert(root.userData.glow.emissiveIntensity>2);
}
const charger=new Arena();charger.wave=2;charger.wait=100;charger.enemies=[{id:1,type:'charger',x:5,z:0,hp:38,maxHp:38,r:.5,cd:10,chargeState:'approach',chargeTime:0}];charger.update(.01);assert.equal(charger.enemies[0].chargeState,'windup');const start=charger.enemies[0].x;for(let i=0;i<40;i++)charger.update(.02);assert.equal(charger.enemies[0].x,start,'Charger must stand still while telegraphing');for(let i=0;i<10;i++)charger.update(.02);assert.equal(charger.enemies[0].chargeState,'rush');assert(charger.enemies[0].x<start);
const sentinel=new Arena();sentinel.wave=3;sentinel.enemies=[{id:1,type:'sentinel',x:9,z:0,hp:45,maxHp:45,r:.5,cd:0}];sentinel.update(.01);assert.equal(sentinel.bullets.length,3);assert.equal(new Set(sentinel.bullets.map(b=>b.vz)).size,3);
console.log('Five enemy meshes/animation/health feedback, charge telegraph and three-shot sentinel attack passed.');
