/* Original MacTahoe artwork; web interactions remain portfolio-specific. */
(() => {
const root='assets/tahoe/';
document.documentElement.classList.add('tahoe-theme');
const folderColors={work:'folder',services:'folder-green',achievements:'folder-yellow',partners:'folder-orange',socials:'folder-purple'};
for(const folder of document.querySelectorAll('.macos-folder')){
 const key=folder.closest('[data-open]')?.dataset.open,name=folderColors[key]||'folder';
 for(const im of folder.querySelectorAll('img'))im.src=root+name+'.svg';
}
const sideIcons={about:'socials',work:'projects',now:'folder-open',achievements:'awards',services:'services',partners:'folder-orange',booking:'calendar',contact:'mail',socials:'socials',games:'games'};
for(const button of document.querySelectorAll('.finder-sidebar [data-open]')){
 const name=sideIcons[button.dataset.open];if(!name)continue;
 for(const node of [...button.childNodes])if(node.nodeType===3)node.remove();
 const img=document.createElement('img');img.src=root+name+'.svg';img.alt='';img.className='tahoe-sidebar-icon';button.prepend(img);
}
const trash=document.querySelector('.dock-trash');
if(trash){
 const original=trash.querySelector('.trash-art');
 const image=document.createElement('img');image.className='macos-app-image tahoe-trash';image.alt='';image.draggable=false;
 original?.replaceWith(image);
 const refresh=()=>image.src=root+(trash.classList.contains('has-items')?'trash-full':'trash')+'.svg';
 refresh();new MutationObserver(refresh).observe(trash,{attributes:true,attributeFilter:['class']});
}
let timer;
window.TahoeTheme={welcome(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let screen=document.querySelector('#tahoe-welcome');
 if(!screen){screen=document.createElement('div');screen.id='tahoe-welcome';screen.setAttribute('role','status');screen.innerHTML='<img class="tahoe-boot-mark" src="assets/macos/apple.svg" alt=""><img class="tahoe-spinner" src="'+root+'spinner.svg" alt=""><span>Opening your desktop</span>';document.body.append(screen)}
 screen.hidden=false;clearTimeout(timer);timer=setTimeout(()=>screen.hidden=true,620);
}};
})();
