/* Touch-first iPhone-style portfolio shell; the Mac desktop remains on larger pointers/screens. */
(() => {
 const desktop=document.querySelector('#desktop');if(!desktop)return;
 const phone=matchMedia('(max-width: 700px)'),touch=matchMedia('(pointer: coarse)'),compact=matchMedia('(max-width: 1100px)');
 const root=document.documentElement;
 const apps=[['about','About me','assets/princewill-linkedin.jpg'],['work','Projects','assets/tahoe/projects.svg'],['services','Services','assets/tahoe/services.svg'],['achievements','Highlights','assets/tahoe/awards.svg'],['socials','Socials','assets/tahoe/socials.svg'],['partners','Brand work','assets/tahoe/folder-orange.svg'],['booking','Book a call','assets/tahoe/calendar.svg'],['games','Games','assets/ps-app/icon.svg'],['files','Files','assets/tahoe/finder.svg'],['notes','Notes','assets/notes-app.svg'],['appearance','Settings','assets/tahoe/settings.svg'],['lock','Lock','assets/tahoe/lock.svg']];
 const shell=document.createElement('section');shell.className='ios-home';shell.setAttribute('aria-label','Princewill’s mobile home screen');shell.innerHTML=`<header class="ios-status"><time class="ios-time"></time><span class="ios-island" aria-hidden="true"></span><span class="ios-status-symbols" aria-label="Portfolio home">▮▮▮ <svg viewBox="0 0 24 16" aria-hidden="true"><path d="M2 5Q12 -3 22 5M6 9Q12 4 18 9M10 13Q12 11 14 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><span class="ios-battery" aria-hidden="true"></span></span></header><div class="ios-home-content"><button class="ios-profile-widget" data-ios-app="about"><span><small>PRINCEWILL’S SPACE</small><strong>Princewill<br>Okube.</strong><em>Developer & creator · London</em></span><img src="assets/princewill-linkedin.jpg" alt="Princewill Okube"></button><div class="ios-widgets"><button data-ios-app="work"><small>ON MY DESK</small><strong>Ideas into<br>real projects.</strong><span>Explore my work ↗</span></button><button class="ios-note-widget" data-ios-app="notes"><small>A NOTE FOR YOU</small><strong>Let’s build<br>something.</strong><span>Services & credentials ↗</span></button></div><nav class="ios-app-grid" aria-label="Portfolio apps">${apps.map(([id,label,img])=>`<button data-ios-app="${id}" aria-label="Open ${label}"><img src="${img}" alt="" draggable="false"><span>${label}</span></button>`).join('')}</nav><button class="ios-search" data-ios-app="safari">⌕ Search portfolio</button><div class="ios-page-dots" aria-hidden="true">● <span>●</span></div></div><nav class="ios-dock" aria-label="Mobile dock">${[['safari','Safari','assets/tahoe/safari.svg'],['messages','Messages','assets/tahoe/messages.svg'],['contact','Contact','assets/tahoe/mail.svg'],['games','Games','assets/ps-app/icon.svg']].map(([id,label,img])=>`<button data-ios-app="${id}" aria-label="Open ${label}"><img src="${img}" alt=""><span>${label}</span></button>`).join('')}</nav>`;desktop.append(shell);
 const home=document.createElement('button');home.className='ios-home-control';home.setAttribute('aria-label','Return to home screen');home.innerHTML='<span aria-hidden="true"></span>';desktop.append(home);
 const noteNodes=[...document.querySelectorAll('.paper-note')],noteParents=new Map(noteNodes.map(n=>[n,n.parentNode]));
 let mobile=false;
 function active(){if(!mobile)return;const open=[...document.querySelectorAll('#finder,#portfolio-safari,#portfolio-messages')].some(n=>n.open);root.classList.toggle('ios-app-open',open||!!document.querySelector('.ios-note-active:not([hidden])')||document.querySelector('.notes-launcher')?.hidden===false);}
 function goHome(){
  if(document.querySelector('#finder')?.open)document.querySelector('#window-minimise').click();
  if(document.querySelector('#portfolio-safari')?.open)document.querySelector('#safari-minimise').click();
  if(document.querySelector('#portfolio-messages')?.open)document.querySelector('#messages-minimise').click();
  document.querySelectorAll('.ios-note-active').forEach(n=>n.classList.remove('ios-note-active'));
  const launcher=document.querySelector('.notes-launcher');if(launcher)launcher.hidden=true;
  const appearance=document.querySelector('.appearance-menu');if(appearance)appearance.hidden=true;active();home.blur?.();
 }
 function launch(id){
  if(id==='games'){location.href='games.html';return}
  if(id==='safari'){window.openSafari?.();return}
  if(id==='notes'){document.querySelector('.dock-notes').click();active();return}
  if(id==='appearance'){window.PortfolioAppearance?.openOptions();return}
  if(id==='lock'){goHome();document.querySelector('#lock-button').click();return}
  openView(id);
 }
 shell.addEventListener('click',e=>{const b=e.target.closest('[data-ios-app]');if(b)launch(b.dataset.iosApp)});home.onclick=goHome;
 for(const n of document.querySelectorAll('#finder,#portfolio-safari,#portfolio-messages'))new MutationObserver(active).observe(n,{attributes:true,attributeFilter:['open']});
 for(const n of document.querySelectorAll('.paper-note,.notes-launcher'))new MutationObserver(active).observe(n,{attributes:true,attributeFilter:['hidden','class']});
 window.addEventListener('portfolio:note-open',e=>{if(!mobile)return;document.querySelectorAll('.ios-note-active').forEach(n=>n.classList.remove('ios-note-active'));document.querySelector(`[data-note-id="${e.detail.id}"]`)?.classList.add('ios-note-active');active()});
 function apply(){mobile=phone.matches||touch.matches&&compact.matches;root.classList.toggle('ios-device',mobile);for(const n of noteNodes){const parent=mobile?desktop:noteParents.get(n);if(n.parentNode!==parent)parent.append(n)}shell.hidden=!mobile;home.hidden=!mobile;if(!mobile){root.classList.remove('ios-app-open');document.querySelectorAll('.ios-note-active').forEach(n=>n.classList.remove('ios-note-active'))}else active()}
 for(const query of [phone,touch,compact])query.addEventListener('change',apply);
 function clock(){shell.querySelector('.ios-time').textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'}).format(new Date())}clock();setInterval(clock,30000);
 const syncViewport=()=>root.style.setProperty('--ios-height',(window.visualViewport?.height||innerHeight)+'px');window.visualViewport?.addEventListener('resize',syncViewport);window.addEventListener('resize',syncViewport);syncViewport();apply();
 window.PortfolioMobile={home:goHome,launch,isMobile:()=>mobile};
})();
