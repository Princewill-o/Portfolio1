import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const base='https://www.prwl.co.uk';
for(const [file,path]of [['index.html','/'],['profile.html','/profile.html'],['games.html','/games.html']]){
 const html=readFileSync('dist/'+file,'utf8');
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert(html.includes('href="'+base+path+'"'));
 assert(html.includes('name="description"'));assert(html.includes('property="og:url"'));assert(html.includes('name="twitter:card"'));assert(!html.includes('noindex'));
 for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(match[1]);
 for(const match of html.matchAll(/(?:src|href)="(assets\/[^"#]+|profile.css)"/g))assert(existsSync('dist/'+match[1]),match[1]);
}
const profile=readFileSync('dist/profile.html','utf8');assert(profile.includes('<h1>Princewill Okube</h1>'));assert(profile.includes('mailto:okubep@gmail.com'));assert(profile.includes('WorldQuant University'));assert(!profile.includes('id="login"'));
const home=readFileSync('dist/index.html','utf8');assert(home.includes('href="/profile.html"'));assert(home.includes('"@type": "Person"'));assert(home.includes('"sameAs"'));
assert(readFileSync('dist/robots.txt','utf8').includes('Sitemap: '+base+'/sitemap.xml'));
const sitemap=readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,3);assert(!sitemap.includes('#'));
const config=JSON.parse(readFileSync('vercel.json'));assert(config.redirects.some(r=>r.source==='/index.html'&&r.destination==='/'&&r.permanent));
console.log('SEO checks passed: canonical URLs, metadata, JSON-LD, assets, crawlable profile/contact, sitemap, robots and entry redirect.');
