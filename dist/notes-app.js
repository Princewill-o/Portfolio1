/* Browser-local note windows: move, resize, minimise, close and reversible deletion. */
(() => {
 const nodes=[...document.querySelectorAll('.paper-note')],dock=document.querySelector('.dock');if(!nodes.length||!dock)return;
 const KEY='po-note-windows-v1',allowed=new Set(['open','minimised','closed','deleted']);let saved={};
 try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
 const entries=nodes.map((node,i)=>({id:i===0?'services':'credentials',title:i===0?'Services':'Credentials',node,state:{status:'open',rect:null,maximised:false}}));
 let drag=null;
 const app=document.createElement('button');app.className='dock-icon macos-app dock-notes';app.setAttribute('aria-label','Notes — open or restore desktop notes');app.setAttribute('aria-expanded','false');app.innerHTML='<img class="macos-app-image" src="assets/notes-app.svg" alt="" draggable="false"><small>Notes</small>';dock.insertBefore(app,dock.querySelector('.dock-trash'));if(typeof dockIcons!=='undefined')dockIcons.push(app);
 const menu=document.createElement('section');menu.className='notes-launcher';menu.hidden=true;menu.setAttribute('aria-label','Your desktop notes');menu.innerHTML='<header><strong>Notes</strong><button data-notes-close aria-label="Close notes list">×</button></header><div class="notes-list"></div><button data-notes-restore>Restore all notes & reset layout</button><small>Changes stay in this browser.</small>';document.querySelector('#desktop').append(menu);
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(Object.fromEntries(entries.map(e=>[e.id,e.state]))))}catch{}}
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 function fit(r){const width=Math.max(200,Math.min(r.width,innerWidth-16)),height=Math.max(160,Math.min(r.height,innerHeight-140));return {x:Math.max(8,Math.min(r.x,innerWidth-width-8)),y:Math.max(48,Math.min(r.y,innerHeight-height-90)),width,height}}
 function geometry(e){if(e.state.maximised){const r=fit({x:Math.max(8,(innerWidth-Math.min(760,innerWidth-16))/2),y:55,width:Math.min(760,innerWidth-16),height:innerHeight-155});place(e,r)}else if(e.state.rect)place(e,fit(e.state.rect));else{e.node.classList.remove('note-positioned');for(const k of ['left','top','width','height'])e.node.style.removeProperty(k)}}
 function place(e,r){e.node.classList.add('note-positioned');Object.assign(e.node.style,{left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px'})}
 function raise(e){entries.forEach(n=>n.node.style.zIndex=n===e?'64':'3');}
 function refresh(){
  for(const e of entries){e.node.hidden=e.state.status!=='open';e.node.dataset.noteStatus=e.state.status;e.tile.hidden=e.state.status!=='minimised';e.node.classList.toggle('note-maximised',e.state.maximised);e.node.querySelector('[data-note-action="maximise"]').setAttribute('aria-label',e.state.maximised?'Restore note size':'Expand note');geometry(e)}
  app.classList.toggle('is-running',entries.some(e=>e.state.status==='open'));
  menu.querySelector('.notes-list').innerHTML=entries.map(e=>`<button data-show-note="${e.id}"><img src="assets/notes-app.svg" alt=""><span><strong>${e.title}</strong><small>${{open:'Open on desktop',minimised:'Minimised — click to reopen',closed:'Closed — click to reopen',deleted:'Deleted — click to restore'}[e.state.status]}</small></span><b>${e.state.status==='deleted'?'Restore':'Open'}</b></button>`).join('');
 }
 function open(e){e.state.status='open';refresh();raise(e);persist();menu.hidden=true;app.setAttribute('aria-expanded','false');e.node.querySelector('.note-titlebar').focus({preventScroll:true});window.dispatchEvent(new CustomEvent('portfolio:note-open',{detail:{id:e.id}}))}
 function action(e,type){
  if(type==='maximise'){if(!e.state.maximised&&!e.state.rect){const r=e.node.getBoundingClientRect();e.state.rect={x:r.left,y:r.top,width:r.width,height:r.height}}e.state.maximised=!e.state.maximised;raise(e)}
  else{e.state.status=type==='minimise'?'minimised':type==='delete'?'deleted':'closed';if(type==='delete'&&typeof notify==='function')notify(e.title+' note removed. Restore it from Notes in the dock.');app.focus({preventScroll:true})}
  refresh();persist();
 }
 for(const e of entries){
  const s=saved[e.id];if(s&&typeof s==='object'){if(allowed.has(s.status))e.state.status=s.status;if(s.rect&&['x','y','width','height'].every(k=>finite(s.rect[k])))e.state.rect=fit(s.rect);e.state.maximised=s.maximised===true}
  const content=document.createElement('div');content.className='note-content';while(e.node.firstChild)content.append(e.node.firstChild);e.node.append(content);e.node.classList.add('note-window');e.node.dataset.noteId=e.id;e.node.setAttribute('role','region');
  const bar=document.createElement('header');bar.className='note-titlebar';bar.tabIndex=0;bar.setAttribute('aria-label',e.title+' note. Drag to move, or use Alt and arrow keys.');bar.innerHTML=`<div class="note-window-controls"><button data-note-action="close" aria-label="Close ${e.title} note" title="Close">×</button><button data-note-action="minimise" aria-label="Minimise ${e.title} note to dock" title="Minimise">−</button><button data-note-action="maximise" aria-label="Expand note" title="Expand / restore">↗</button></div><strong>${e.title}</strong><button class="note-delete" data-note-action="delete" aria-label="Delete ${e.title} note" title="Delete note — restore from Notes">⌫</button>`;e.node.prepend(bar);
  const grip=document.createElement('button');grip.className='note-resize';grip.setAttribute('aria-label','Resize '+e.title+' note. Drag, or use arrow keys.');grip.title='Drag to stretch this note';grip.innerHTML='<span aria-hidden="true">◢</span>';e.node.append(grip);
  const tile=document.createElement('button');tile.className='dock-icon macos-app minimised-note';tile.setAttribute('aria-label','Restore minimised '+e.title+' note');tile.innerHTML=`<img class="macos-app-image" src="assets/notes-app.svg" alt="" draggable="false"><small>${e.title}</small><span aria-hidden="true">−</span>`;dock.insertBefore(tile,dock.querySelector('.dock-trash'));tile.onclick=()=>open(e);e.tile=tile;
  e.node.addEventListener('pointerdown',()=>raise(e));
  bar.addEventListener('click',event=>{const b=event.target.closest('[data-note-action]');if(b)action(e,b.dataset.noteAction)});
  bar.addEventListener('dblclick',event=>{if(!event.target.closest('button'))action(e,'maximise')});
  function start(event,kind){if(document.documentElement.classList.contains('ios-device'))return;if(event.button!==0||kind==='move'&&event.target.closest('button')||e.state.maximised)return;event.preventDefault();raise(e);const r=e.node.getBoundingClientRect();drag={e,kind,x:event.clientX,y:event.clientY,rect:{x:r.left,y:r.top,width:r.width,height:r.height},pointer:event.pointerId};event.currentTarget.setPointerCapture?.(event.pointerId);e.node.classList.add('note-interacting')}
  bar.addEventListener('pointerdown',event=>start(event,'move'));grip.addEventListener('pointerdown',event=>start(event,'resize'));
  bar.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&['m','w'].includes(event.key.toLowerCase())){event.preventDefault();event.stopPropagation();action(e,event.key.toLowerCase()==='m'?'minimise':'close');return}if(event.target!==bar||!event.altKey||!event.key.startsWith('Arrow'))return;event.preventDefault();const r=e.node.getBoundingClientRect(),step=event.shiftKey?40:12;e.state.maximised=false;e.state.rect=fit({x:r.left+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0),y:r.top+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0),width:r.width,height:r.height});refresh();persist()});
  grip.addEventListener('keydown',event=>{if(!event.key.startsWith('Arrow'))return;event.preventDefault();event.stopPropagation();const r=e.node.getBoundingClientRect();e.state.maximised=false;e.state.rect=fit({x:r.left,y:r.top,width:r.width+(event.key==='ArrowRight'?20:event.key==='ArrowLeft'?-20:0),height:r.height+(event.key==='ArrowDown'?20:event.key==='ArrowUp'?-20:0)});refresh();persist()});
 }
 function end(){if(!drag)return;drag.e.node.classList.remove('note-interacting');drag=null;persist()}
 window.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;const {e,rect,kind,x,y}=drag,dx=event.clientX-x,dy=event.clientY-y;e.state.rect=fit(kind==='move'?{...rect,x:rect.x+dx,y:rect.y+dy}:{...rect,width:rect.width+dx,height:rect.height+dy});place(e,e.state.rect)});
 window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);window.addEventListener('blur',end);window.addEventListener('resize',()=>{end();refresh()});
 app.onclick=()=>{menu.hidden=!menu.hidden;app.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden){refresh();menu.querySelector('[data-show-note]').focus()}};
 menu.onclick=event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.showNote)open(entries.find(e=>e.id===b.dataset.showNote));if(b.hasAttribute('data-notes-close')){menu.hidden=true;app.setAttribute('aria-expanded','false');app.focus()}if(b.hasAttribute('data-notes-restore')){for(const e of entries)e.state={status:'open',rect:null,maximised:false};refresh();persist();menu.hidden=true;app.setAttribute('aria-expanded','false')}};
 document.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!app.contains(event.target)){menu.hidden=true;app.setAttribute('aria-expanded','false')}});
 menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.hidden=true;app.setAttribute('aria-expanded','false');app.focus()}});
 window.PortfolioNotes={open:id=>{const e=entries.find(e=>e.id===id);if(e)open(e)},snapshot:()=>Object.fromEntries(entries.map(e=>[e.id,JSON.parse(JSON.stringify(e.state))]))};refresh();
})();
