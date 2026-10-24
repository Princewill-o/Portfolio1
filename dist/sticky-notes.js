/* Personal credentials: LinkedIn-verified computing details; finance degree supplied by Princewill. */
(() => {
 const note=document.querySelector('#credentials-note');if(!note)return;
 const profile='https://www.linkedin.com/in/princewillokube/';
 function render(){
  const dark=document.documentElement.dataset.theme==='dark';
  note.dataset.subject=dark?'computing':'finance';
  const education=dark?`<li><strong>MSc Artificial Intelligence</strong><span>Queen Mary University of London · 2026–27</span></li><li><strong>BSc Computer Science</strong><span>City, University of London · 2023–26</span></li>`:`<li><strong>MSc Financial Engineering</strong><span>WorldQuant University</span></li>`;
  const projects=dark?['Web apps & interactive prototypes','AI agents & practical workflows','Browser games & 3D experiences']:['Investment & portfolio dashboards','Risk & scenario analysis tools','Budgeting & cash-flow apps','Financial data tools & APIs'];
  const content=note.querySelector('.note-content')||note;
  content.innerHTML=`<span class="note-pin" aria-hidden="true"></span><small>${dark?'THE COMPUTING SIDE':'THE FINANCE SIDE'}</small><h2 id="credentials-note-title">${dark?'Code. Create. Explore.':'Finance meets fintech.'}</h2><ul class="note-education">${education}</ul>${dark?'<p class="note-certification">IBM credentials: Agentic AI with LangChain & LangGraph; Building AI Agents and Agentic Workflows.</p>':''}<h3>${dark?'What I can build':'Fintech projects I can build'}</h3><ul class="note-projects">${projects.map(p=>`<li>${p}</li>`).join('')}</ul><div class="paper-note-links"><button data-enquire="${dark?'Software & AI project':'Fintech project'}">Let’s build something ↗</button><a href="${profile}" target="_blank" rel="noopener noreferrer">My LinkedIn profile ↗</a></div>`;
 }
 render();new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
