/** Offline computed-style contract, x.ai captured 2026-09-20. Content/media differ by design. */
import {readFile, mkdir, writeFile, stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve, extname} from 'node:path';
import {chromium} from 'playwright';
const root=process.cwd(),dist=resolve(root,'dist');
const reference=JSON.parse(await readFile(resolve(root,'scripts/reference/xai-2026-09-20.json'),'utf8'));
const isJulien=JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).name==='julientalbot.com';
const routes=isJulien?[['/','/'],['/en','/'],['/travail','/grok'],['/en/travail','/grok'],['/agents','/bot'],['/en/agents','/bot'],['/conferences','/voice'],['/en/conferences','/voice'],['/writing','/news'],['/en/writing','/news'],['/labs','/api'],['/en/labs','/api'],['/writing/ai-agents-are-operators','/article']]:[['/','/grok'],['/en','/grok']];
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{try{let path=resolve(dist,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(dist+'/')&&path!==dist)throw Error();if((await stat(path)).isDirectory())path+='/index.html';res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch();const failures=[],records=[];
function near(label,want,got,tolerance=1){if(Math.abs(parseFloat(want)-parseFloat(got))>tolerance||!Number.isFinite(parseFloat(got)))failures.push({label,want,got,tolerance});}
try{for(const width of [390,768,1440]){const context=await browser.newContext({viewport:{width,height:1000},colorScheme:'light',reducedMotion:'reduce'});await context.route(/\/_vercel\/(?:insights|speed-insights)\/script\.js$/,route=>route.fulfill({contentType:'text/javascript',body:'/* Hosting-provided script: local test stub. */'}));const page=await context.newPage();
for(const [path,ref] of routes){const resourceErrors=[];const resourceListener=r=>{if(r.url().startsWith(base)&&r.status()>=400)resourceErrors.push(r.url());};page.on('response',resourceListener);await page.goto(base+path);await page.evaluate(()=>document.fonts.ready);const measured=reference.measurements.find(m=>new URL(m.url).pathname===(ref==='/article'?'/news':ref)&&m.width===width);
const selector=ref==='/news'?'.xo-news-featured__title':'h1';
const actual=await page.evaluate(selector=>{const get=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {fontSize:s.fontSize,lineHeight:s.lineHeight,fontWeight:s.fontWeight,letterSpacing:s.letterSpacing,borderRadius:s.borderRadius,paddingLeft:s.paddingLeft,paddingTop:s.paddingTop,borderWidth:s.borderTopWidth,width:r.width,y:r.y,height:r.height}};return {heading:get(document.querySelector(selector)),button:get(document.querySelector('main .xo-button')||document.querySelector('.site-nav-cta')),nav:get(document.querySelector('header .xo-nav')),overflow:document.documentElement.scrollWidth>innerWidth+1,theme:document.documentElement.dataset.theme};},selector);
const tag=ref==='/api'?{style:reference.apiHeadline.find(m=>m.width===width),box:reference.apiHeadline.find(m=>m.width===width)}:ref==='/article'?{style:reference.articleHeadline.find(m=>m.width===width),box:reference.articleHeadline.find(m=>m.width===width)}:measured.elements.find(e=>e.tag==='H1');const label=`${path}@${width}`;
// API title typography is measured on its visible span, not the wrapper.
{for(const key of ['fontSize','lineHeight','letterSpacing'])near(label+' heading '+key,tag.style[key],actual.heading[key]);near(label+' heading weight',tag.style.fontWeight,actual.heading.fontWeight,0);if(ref!=='/news')near(label+' heading top',tag.box.y,actual.heading.y,4);}
const nav=measured.elements.find(e=>e.tag==='NAV');near(label+' nav width',nav.box.width,actual.nav.width,4);near(label+' nav height',nav.box.height,actual.nav.height,4);
for(const [key,want] of Object.entries(reference.buttonMetrics))near(label+' button '+key,want,actual.button[key]);
if(actual.overflow)failures.push({label,overflow:true});if(actual.theme!=='light')failures.push({label,theme:actual.theme});records.push({path,width,reference:measured.url,actual});
if(isJulien && ref==='/') {
const tray=await page.locator('.offer-tray').evaluate(el=>({width:el.getBoundingClientRect().width,gap:parseFloat(getComputedStyle(el).gap),cards:[...el.querySelectorAll('.offer-card')].map(card=>{const box=card.getBoundingClientRect();const footer=card.querySelector('.offer-card__footer').getBoundingClientRect();return {width:box.width,height:box.height,y:box.y,radius:parseFloat(getComputedStyle(card).borderRadius),clipped:[...card.querySelectorAll('.offer-preview strong,.offer-preview p,.preview-tag,.offer-preview code')].filter(e=>e.getBoundingClientRect().height && e.getBoundingClientRect().bottom>footer.top-10).map(e=>e.textContent)};})}));
const expected=reference.offerTray.widths[width];near(label+' tray width',expected.container,tray.width,4);near(label+' tray gap',12,tray.gap,1);
tray.cards.forEach((card,i)=>{near(label+' card '+i+' width',i<3?expected.top:expected.bottom,card.width,4);near(label+' card '+i+' height',expected.height,card.height,4);near(label+' card '+i+' radius',16,card.radius,1);if(card.clipped.length)failures.push({label,card:i,clipped:card.clipped});});
if(width>=640){near(label+' row1',tray.cards[0].y,tray.cards[2].y,1);near(label+' row2',tray.cards[3].y,tray.cards[4].y,1);}
records.at(-1).tray=tray;
}
page.off('response',resourceListener);if(resourceErrors.length)failures.push({label,resourceErrors});
for(const img of await page.locator('main img').all()){if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}}await page.evaluate(()=>scrollTo(0,0));
await mkdir(resolve(root,'.audit/xai-current'),{recursive:true});await page.screenshot({path:resolve(root,`.audit/xai-current/${path.replaceAll('/','-')||'home'}-${width}.png`),fullPage:true});
}
// Manual override persists, then system changes remain live.
await page.locator('[data-theme-select]').selectOption('dark');await page.reload();if(await page.locator('html').getAttribute('data-theme')!=='dark')failures.push({theme:'manual persistence'});
await page.locator('[data-theme-select]').selectOption('system');await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');if(await page.locator('html').getAttribute('data-theme')!=='dark')failures.push({theme:'system dark'});await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');if(await page.locator('html').getAttribute('data-theme')!=='light')failures.push({theme:'system light'});
await context.close();}
}finally{await browser.close();await new Promise(r=>server.close(r));}
await writeFile(resolve(root,'.audit/xai-current/results.json'),JSON.stringify({reference:reference.captured,records,failures},null,2));console.log(JSON.stringify({pages:records.length,failures},null,2));if(failures.length)process.exitCode=1;
