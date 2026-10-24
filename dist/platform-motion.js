/* Shared motion: sampled damped springs, staggered reveals and pointer depth.
   References: motion.dev/docs/quick-start and MDN View Transition API. */
(() => {
const preference=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover:hover) and (pointer:fine)');
const active=new Set(),byElement=new WeakMap();
let depthFrame=0,currentX=0,currentY=0,targetX=0,targetY=0;
function enabled(){return !preference.matches&&!document.body.classList.contains('reduce-motion')&&!document.hidden}
function play(el,frames,options={}){if(!el||!enabled()||!el.animate)return null;const a=el.animate(frames,{duration:440,easing:'cubic-bezier(.2,.8,.2,1)',...options});active.add(a);const set=byElement.get(el)||new Set();set.add(a);byElement.set(el,set);const cleanup=()=>{active.delete(a);set.delete(a)};a.finished.then(cleanup,cleanup);return a}
function cancel(el){for(const a of byElement.get(el)||[])a.cancel()}
function springFrames(from=0,to=1,{stiffness=190,damping=19,mass=1,duration=760,property='scale'}={}){
 const w0=Math.sqrt(stiffness/mass),zeta=damping/(2*Math.sqrt(stiffness*mass)),wd=w0*Math.sqrt(Math.max(.001,1-zeta*zeta));
 const frames=Array.from({length:49},(_,i)=>{const t=i/48*duration/1000;const displacement=Math.exp(-zeta*w0*t)*(Math.cos(wd*t)+(zeta*w0/wd)*Math.sin(wd*t));return {[property]:String(to+(from-to)*displacement),offset:i/48}});frames.at(-1)[property]=String(to);return frames;
}
function spring(el,from=.9,to=1,duration=760){cancel(el);return play(el,springFrames(from,to,{duration}),{duration,easing:'linear'})}
function reveal(elements,{delay=0,step=55,distance=22,duration=580,axis='y'}={}){[...elements].filter(el=>el&&!el.hidden).forEach((el,i)=>{cancel(el);play(el,[{opacity:0,translate:axis==='x'?`${distance}px 0`:`0 ${distance}px`,filter:'blur(3px)'},{opacity:1,translate:'0 0',filter:'blur(0)'}],{duration,delay:delay+i*step,fill:'backwards'})})}
function panel(selector){const el=document.querySelector(selector);if(el&&!el.hidden)reveal([el],{distance:16,duration:480})}
function grid(selector){const el=document.querySelector(selector);if(el)reveal(el.children,{step:65,distance:30,duration:650})}
function stop(){if(pressed){pressed.animation?.cancel();pressed=null}for(const a of active)a.cancel();active.clear();cancelAnimationFrame(depthFrame);cancelAnimationFrame(hoverFrame);depthFrame=hoverFrame=0;targetX=targetY=currentX=currentY=0;document.documentElement.style.removeProperty('--ambient-x');document.documentElement.style.removeProperty('--ambient-y');document.querySelectorAll('[data-pointer-depth]').forEach(el=>resetTilt(el))}
function depthTick(){if(!enabled()||!finePointer.matches){depthFrame=0;return}currentX+=(targetX-currentX)*.075;currentY+=(targetY-currentY)*.075;document.documentElement.style.setProperty('--ambient-x',currentX.toFixed(2)+'px');document.documentElement.style.setProperty('--ambient-y',currentY.toFixed(2)+'px');if(Math.abs(targetX-currentX)+Math.abs(targetY-currentY)>.03)depthFrame=requestAnimationFrame(depthTick);else depthFrame=0;}
function depth(){if(!depthFrame)depthFrame=requestAnimationFrame(depthTick)}
const hoverSelector='.tile-art,.social-card,.project-card,.booking-choice,.community-home-tile,.console-explore-tile,.console-library-end,#community-library-grid>button>span,.hub-stories>button,.desktop-socials a';
function resetTilt(el){el.style.removeProperty('--tilt-rx');el.style.removeProperty('--tilt-ry');el.style.removeProperty('--pointer-x');el.style.removeProperty('--pointer-y');el.removeAttribute('data-pointer-depth')}
let hovered=null,hoverFrame=0,latestPoint=null,pressed=null;
document.addEventListener('pointermove',e=>{if(!enabled()||!finePointer.matches||e.pointerType==='touch')return;targetX=(e.clientX/innerWidth-.5)*-13;targetY=(e.clientY/innerHeight-.5)*-9;depth();const card=e.target.closest(hoverSelector);if(hovered!==card){if(hovered)resetTilt(hovered);hovered=card}if(!card)return;latestPoint={x:e.clientX,y:e.clientY,card};if(hoverFrame)return;hoverFrame=requestAnimationFrame(()=>{hoverFrame=0;const p=latestPoint;if(!p||p.card!==hovered)return;const r=p.card.getBoundingClientRect(),x=Math.max(0,Math.min(1,(p.x-r.left)/r.width)),y=Math.max(0,Math.min(1,(p.y-r.top)/r.height));p.card.setAttribute('data-pointer-depth','');p.card.style.setProperty('--tilt-rx',((.5-y)*5).toFixed(2)+'deg');p.card.style.setProperty('--tilt-ry',((x-.5)*7).toFixed(2)+'deg');p.card.style.setProperty('--pointer-x',(x*100).toFixed(1)+'%');p.card.style.setProperty('--pointer-y',(y*100).toFixed(1)+'%')})},{passive:true});
document.addEventListener('pointerout',e=>{if(hovered&&!hovered.contains(e.relatedTarget)){resetTilt(hovered);hovered=null}if(!e.relatedTarget){targetX=targetY=0;depth()}},{passive:true});
document.addEventListener('pointerdown',e=>{if(!enabled())return;const card=e.target.closest('.console-game-tile .tile-art,#community-library-grid>button>span,.macos-app-image,.desktop-socials a');if(card){if(pressed)pressed.animation?.cancel();cancel(card);pressed={card,animation:play(card,[{scale:'1'},{scale:'.95'}],{duration:100,fill:'forwards',easing:'ease-out'})}}},{passive:true});
function releasePress(){if(!pressed)return;const {card,animation}=pressed;pressed=null;animation?.cancel();spring(card,.95,1,650)}
document.addEventListener('pointerup',releasePress,{passive:true});
document.addEventListener('pointercancel',()=>{releasePress();if(hovered)resetTilt(hovered)},{passive:true});
function stage(name){if(!enabled()||document.querySelector('#games-app.reference-library-arrival'))return;if(name==='hub'){reveal(document.querySelectorAll('.console-header>*'),{step:70,distance:10});reveal(document.querySelectorAll('.console-game-row>*'),{delay:90,step:55,distance:25,duration:630});reveal(document.querySelectorAll('.console-game-info>*'),{delay:230,step:45,distance:18});panel('.console-cover-card')}if(name==='welcome'){reveal(document.querySelectorAll('.console-welcome-label,.console-welcome h2,.console-start'),{delay:180,step:100,distance:18,duration:720})}if(name==='loading'){reveal(document.querySelectorAll('.connection-icon,.console-loading>p,.console-progress,.console-progress-label'),{step:60,distance:14})}}
window.addEventListener('portfolio:stage',e=>stage(e.detail.stage));
window.addEventListener('portfolio:game',e=>{if(document.querySelector('#games-app.reference-library-arrival'))return;if(!enabled())return;const tile=document.querySelector('.console-game-tile.selected .tile-art');spring(tile,.965,1,720);reveal(document.querySelectorAll('.console-game-info>*'),{step:38,distance:e.detail.direction<0?-15:15,duration:520,axis:'x'});panel('.console-cover-card')});
window.addEventListener('portfolio:view',e=>{const view=e.detail.view;if(view==='library'){panel('.community-library');grid('#community-library-grid')}if(view==='discover'){panel('.community-discover');reveal(document.querySelectorAll('.hub-stories>button'),{delay:90,step:65})}if(view==='media'){panel('.media-library');reveal(document.querySelectorAll('.media-library>div>button'),{delay:90,step:65})}if(view==='profile')reveal(document.querySelectorAll('.community-profile>*'),{step:35,distance:-8,duration:340});if(view==='sort')grid('#community-library-grid')});
window.addEventListener('portfolio:detail',()=>{const modal=document.querySelector('#game-project-detail');spring(modal,.965,1,650);reveal(document.querySelectorAll('.game-detail-copy>*'),{delay:70,step:35,distance:15})});
// Only animate newly-rendered Finder content, not every text/clock update.
const finderContent=document.querySelector('#window-content');if(finderContent)new MutationObserver(()=>{reveal(finderContent.querySelectorAll('.project-card,.social-card,.service-row,.timeline article,.tags span'),{delay:100,step:45,distance:13})}).observe(finderContent,{childList:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});preference.addEventListener('change',()=>{if(preference.matches)stop()});
document.addEventListener('change',e=>{if(e.target.id==='motion-preference'&&e.target.checked)stop()});
document.addEventListener('keydown',e=>{if(e.key==='Tab'&&hovered){resetTilt(hovered);hovered=null}});
window.addEventListener('pagehide',stop);
window.PortfolioMotion={reveal,spring,panel,grid,enabled,stop};
})();
