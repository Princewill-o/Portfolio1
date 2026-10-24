export const COLS=21,ROWS=23,DIRS=[{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}],opposite=d=>(d+2)%4;
const wrap=x=>(x+COLS)%COLS,key=(x,y)=>x+','+y;
export function makeMaze(){
 const a=Array.from({length:ROWS},()=>Array(COLS).fill('#'));
 const path=(x,y)=>a[y][x]='.';
 for(let y=1;y<ROWS-1;y++)for(const x of [1,5,9,11,15,19])path(x,y);
 for(let x=1;x<COLS-1;x++)for(const y of [1,5,9,13,17,21])path(x,y);
 for(let x=0;x<=7;x++)path(x,11);for(let x=13;x<COLS;x++)path(x,11);
 // The central ghost house is isolated from player corridors by its gate.
 for(let y=9;y<=13;y++)for(let x=8;x<=12;x++)a[y][x]=y===9||y===13||x===8||x===12?'#':' ';
 a[9][10]='-';for(let y=7;y<=8;y++)path(10,y);path(9,7);path(11,7);
 for(const [x,y]of [[1,1],[19,1],[1,21],[19,21]])a[y][x]='o';
 a[17][10]=' ';return a.map(r=>r.join(''));
}
export const MAZE=makeMaze();
export class Pacman{
 constructor({seed=1234}={}){this.seed=seed;this.score=0;this.level=1;this.lives=3;this.extraLife=false;this.state='ready';this.wait=1.8;this.events=[];this.newLevel()}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296}
 newLevel(){this.board=MAZE.map(r=>[...r]);this.pellets=new Map();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if('.o'.includes(this.board[y][x]))this.pellets.set(key(x,y),this.board[y][x]);this.total=this.pellets.size;this.eaten=0;this.fruit=null;this.fruitMilestones=new Set();this.resetActors();this.state='ready';this.wait=1.8;this.events.push({kind:'level',level:this.level})}
 actor(x,y,dir=0){return {cx:x,cy:y,dir,t:0,moving:false,x,y}}
 resetActors(){this.player=this.actor(10,17,2);this.requested=2;this.ghosts=[{...this.actor(10,7,0),name:'Blinky',color:'#ff4056',mode:'active',release:0},{...this.actor(10,11,3),name:'Pinky',color:'#ff9ed3',mode:'house',release:3},{...this.actor(9,11,0),name:'Inky',color:'#57e8ee',mode:'house',release:6},{...this.actor(11,11,2),name:'Clyde',color:'#ffae57',mode:'house',release:9}];this.fright=0;this.ghostChain=0;this.modeTimer=0;this.modeIndex=0;this.scatter=true;this.anim=0}
 can(x,y,ghost=false){x=wrap(x);return y>=0&&y<ROWS&&this.board[y][x]!=='#'&&(ghost||this.board[y][x]!=='-')}
 possible(a,dir,ghost=false){const d=DIRS[dir];return this.can(a.cx+d.x,a.cy+d.y,ghost)}
 move(a,distance,choose,onCenter=()=>{}){
  let guard=0;
  while(distance>0&&guard++<8){if(!a.moving){const next=choose(a);if(next<0||!this.possible(a,next,a.mode==='return'||a.mode==='exit')){a.moving=false;break}a.dir=next;a.moving=true;a.t=0}
   const step=Math.min(1-a.t,distance);a.t+=step;distance-=step;
   if(a.t>=1-1e-8){const d=DIRS[a.dir];a.cx=wrap(a.cx+d.x);a.cy+=d.y;a.t=0;a.moving=false;onCenter(a)}
  }
  const d=DIRS[Math.max(0,a.dir)];a.x=a.cx+(a.moving?d.x*a.t:0);a.y=a.cy+(a.moving?d.y*a.t:0);
 }
 request(dir){if(dir<0||dir>3)return;this.requested=dir;const p=this.player;if(p.moving&&opposite(p.dir)===dir){const d=DIRS[p.dir];p.cx=wrap(p.cx+d.x);p.cy+=d.y;p.t=1-p.t;p.dir=dir}}
 points(amount,x=this.player.cx,y=this.player.cy){this.score+=amount;this.events.push({kind:'points',amount,x,y});if(!this.extraLife&&this.score>=10000){this.extraLife=true;this.lives++;this.events.push({kind:'extra-life'})}}
 collect(){const p=this.player,k=key(p.cx,p.cy),pellet=this.pellets.get(k);if(pellet){this.pellets.delete(k);this.eaten++;this.points(pellet==='o'?50:10);this.events.push({kind:'chomp'});if(pellet==='o'){this.fright=Math.max(2,7-this.level*.3);this.ghostChain=0;for(const g of this.ghosts)if(g.mode==='active')this.reverse(g);this.events.push({kind:'power'})}
   for(const mark of [Math.floor(this.total*.3),Math.floor(this.total*.7)])if(this.eaten>=mark&&!this.fruitMilestones.has(mark)){this.fruitMilestones.add(mark);this.fruit={x:10,y:17,life:10}}
   if(!this.pellets.size){this.state='clear';this.wait=2;this.events.push({kind:'clear'})}}
  if(this.fruit&&Math.hypot(p.cx-this.fruit.x,p.cy-this.fruit.y)<.5){this.points(100*this.level);this.fruit=null;this.events.push({kind:'fruit'})}
 }
 reverse(g){if(g.moving){const d=DIRS[g.dir];g.cx=wrap(g.cx+d.x);g.cy+=d.y;g.t=1-g.t}g.dir=opposite(g.dir)}
 target(g){const p=this.player,d=DIRS[Math.max(0,p.dir)];if(this.scatter)return [[19,1],[1,1],[19,21],[1,21]][this.ghosts.indexOf(g)];if(g.name==='Blinky')return [p.cx,p.cy];if(g.name==='Pinky')return [p.cx+d.x*4,p.cy+d.y*4];if(g.name==='Inky'){const b=this.ghosts[0];return [2*(p.cx+d.x*2)-b.cx,2*(p.cy+d.y*2)-b.cy]}return Math.hypot(g.cx-p.cx,g.cy-p.cy)<7?[1,21]:[p.cx,p.cy]}
 distances(tx,ty,gate=false){let best=null,dist=Infinity;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(!this.can(x,y,gate))continue;const n=Math.abs(x-tx)+Math.abs(y-ty);if(n<dist){dist=n;best=[x,y]}}const out=new Map();if(!best)return out;const queue=[best];out.set(key(...best),0);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const d of DIRS){const nx=wrap(x+d.x),ny=y+d.y,k=key(nx,ny);if(this.can(nx,ny,gate)&&!out.has(k)){out.set(k,out.get(key(x,y))+1);queue.push([nx,ny])}}}return out}
 ghostDir(g){
  if(g.mode==='return'&&g.cx===10&&g.cy===11){g.mode='house';g.release=1.2;return -1}
  if(g.mode==='exit'&&g.cx===10&&g.cy===7)g.mode='active';
  const gate=g.mode==='return'||g.mode==='exit';let dirs=[0,1,2,3].filter(d=>this.possible(g,d,gate));const forward=dirs.filter(d=>d!==opposite(g.dir));if(forward.length)dirs=forward;
  if(this.fright>0&&g.mode==='active')return dirs[Math.floor(this.random()*dirs.length)]??-1;
  const target=g.mode==='return'?[10,11]:g.mode==='exit'?[10,7]:this.target(g),dist=this.distances(...target,gate);
  return dirs.sort((a,b)=>{const da=DIRS[a],db=DIRS[b];return (dist.get(key(wrap(g.cx+da.x),g.cy+da.y))??999)-(dist.get(key(wrap(g.cx+db.x),g.cy+db.y))??999)})[0]??-1;
 }
 collision(){for(const g of this.ghosts){if(g.mode!=='active')continue;const dx=Math.abs(this.player.x-g.x),dy=Math.abs(this.player.y-g.y);if(Math.hypot(Math.min(dx,COLS-dx),dy)>.65)continue;if(this.fright>0){g.mode='return';this.points(200*2**Math.min(3,this.ghostChain++),g.x,g.y);this.events.push({kind:'ghost-eaten'});}else{this.state='dying';this.wait=1.6;this.events.push({kind:'death'});return}}}
 update(dt){this.events=[];dt=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.05));if(this.state==='over'||this.state==='paused')return;this.anim+=dt;
  if(['ready','dying','clear'].includes(this.state)){this.wait-=dt;if(this.wait<=0){if(this.state==='dying'){this.lives--;if(this.lives<=0){this.state='over';this.events.push({kind:'gameover'});return}this.resetActors();this.state='ready';this.wait=1.8}else if(this.state==='clear'){this.level++;this.newLevel()}else this.state='playing'}return}
  if(this.fruit){this.fruit.life-=dt;if(this.fruit.life<=0)this.fruit=null}
  if(this.fright>0)this.fright=Math.max(0,this.fright-dt);else{this.modeTimer+=dt;const duration=[7,20,7,20,5,20,5,Infinity][Math.min(7,this.modeIndex)];if(this.modeTimer>=duration){this.modeTimer=0;this.modeIndex++;this.scatter=!this.scatter;for(const g of this.ghosts)if(g.mode==='active')this.reverse(g)}}
  this.move(this.player,(4.6+Math.min(2,this.level*.15))*dt,p=>this.possible(p,this.requested)?this.requested:this.possible(p,p.dir)?p.dir:-1,()=>this.collect());this.collect();if(this.state==='playing')this.collision();if(this.state!=='playing')return;
  for(const g of this.ghosts){if(g.mode==='house'){g.release-=dt;if(g.release<=0)g.mode='exit';else continue}const speed=g.mode==='return'?8:this.fright>0&&g.mode==='active'?2.7:4.2+Math.min(1.6,this.level*.12);this.move(g,speed*dt,a=>this.ghostDir(a))}this.collision();
 }
 pause(){if(this.state==='paused'){this.state=this.beforePause||'playing'}else if(!['over'].includes(this.state)){this.beforePause=this.state;this.state='paused'}}
}
