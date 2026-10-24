/* macOS artwork and launch links. Games has its own document. */
(() => {
views.games={title:'Princewill’s Game Studio',status:'8 game projects · 6 playable games',keywords:'games sonic mario pacman illumed nova duel boost circuit voxel trails rift arena play',render:()=>''};
window.openGameAdventure=()=>{window.location.href='games.html'};
// Original MacTahoe assets supplied by the user; attribution in assets/tahoe/.
const dockAssets={'dock-finder':'finder.svg','dock-work':'projects.svg','dock-services':'services.svg','dock-awards':'awards.svg','dock-socials':'socials.svg','dock-mail':'mail.svg','dock-calendar':'calendar.svg','dock-search':'safari.svg','dock-lock':'settings.svg'};
Object.entries(dockAssets).forEach(([cls,file])=>{const button=document.querySelector('.'+cls);if(!button)return;[...button.children].filter(c=>c.tagName!=='SMALL').forEach(c=>c.remove());[...button.childNodes].filter(c=>c.nodeType===3).forEach(c=>c.remove());button.insertAdjacentHTML('afterbegin',`<img class="macos-app-image" src="assets/tahoe/${file}" alt="" draggable="false">`);button.classList.add('macos-app');});
document.querySelectorAll('.folder-wrap').forEach((folder,index)=>{folder.querySelectorAll(':scope > svg').forEach(s=>s.remove());folder.insertAdjacentHTML('afterbegin','<img class="macos-folder-back" src="assets/tahoe/folder.svg" alt="" draggable="false">');folder.insertAdjacentHTML('beforeend','<img class="macos-folder-front" src="assets/tahoe/folder.svg" alt="" draggable="false">');folder.querySelector('.folder-papers')?.setAttribute('aria-hidden','true');folder.querySelector('.folder-count')?.setAttribute('aria-hidden','true');folder.classList.add('macos-folder');});
const gameDock=document.createElement('button');gameDock.className='dock-icon macos-app dock-games psn-dock';gameDock.dataset.open='games';gameDock.setAttribute('aria-label','Games');gameDock.innerHTML='<span class="psn-dock-art"><img src="assets/ps-app/icon.svg" alt="" draggable="false"></span><small>Games · my collection</small>';document.querySelector('.dock-socials').after(gameDock);dockIcons.push(gameDock);
document.querySelector('.finder-sidebar [data-open="now"]').insertAdjacentHTML('afterend','<button data-open="games">♧ <span>Game collection</span></button>');
document.querySelector('.menubar nav').insertAdjacentHTML('beforeend','<button data-open="games">Games <span class="games-new-dot"></span></button>');

})();
