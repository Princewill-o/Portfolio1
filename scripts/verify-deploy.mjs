import {existsSync,statSync} from 'node:fs';
for(const file of ['dist/index.html','dist/mobile-shell.js','dist/mobile-shell.css','dist/mobile-games.css','dist/robots.txt','dist/sitemap.xml','dist/games.html','dist/notes-app.js','dist/play/pacman/index.html','dist/play/minecraft/index.html','dist/play/super-mario-65/index.html','api/chat/[...path].js']){
 if(!existsSync(file)||!statSync(file).size)throw Error('Missing deployment file: '+file);
}
console.log('Portfolio, game entry points and honest chat availability endpoint ready.');
