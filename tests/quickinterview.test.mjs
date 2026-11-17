import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const read = file => readFileSync('dist/' + file, 'utf8');
test('packages display the agreed GBP prices and book with Princewill', () => {
 const html = read('quickinterview.html');
 for (const [count, price] of [[100,15],[250,30],[500,55],[750,75]]) {
  assert.match(html, new RegExp(`${count} applications`));
  assert.match(html, new RegExp(`£${price}<`));
 }
 const links = [...html.matchAll(/<a[^>]+class="plan-book"[^>]+>/g)];
 assert.equal(links.length, 4);
 for (const [link] of links) {
  assert(link.includes('href="https://calendly.com/lumen_ai/lumen-project-booking"'));
  assert(link.includes('rel="noopener noreferrer"'));
 }
 assert(html.includes('No interview or job offer is guaranteed.'));
 assert(html.includes('href="index.html"'));
});
test('desktop and mobile launch the standalone application', () => {
 assert(read('index.html').includes('data-open="quickinterview"'));
 const app = read('app.js');
 const openView = app.slice(app.indexOf('function openView('),app.indexOf('function finishClose('));
 const context = { location: {} };
 vm.runInNewContext(openView + ';openView("quickinterview", undefined, null)', context);
 assert.equal(context.location.href, 'quickinterview.html');
 const mobile = read('mobile-shell.js');
 assert(mobile.includes("['quickinterview','QuickInterview','assets/quickinterview.svg']"));
 const launch = mobile.slice(mobile.indexOf('function launch(id)'),mobile.indexOf("shell.addEventListener"));
 vm.runInNewContext(launch + ';launch("quickinterview")', context);
 assert.equal(context.location.href, 'quickinterview.html');
});
