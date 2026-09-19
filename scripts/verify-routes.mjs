import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const dist=path.join(root,'dist');
const host=JSON.parse(fs.readFileSync('package.json','utf8')).name;
const origin=`https://${host}`;
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const xml=fs.readFileSync(path.join(dist,'sitemap-0.xml'),'utf8');
const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const redirects=config.redirects||[];
const exists=route=>[path.join(dist,route),path.join(dist,route,'index.html'),path.join(dist,route+'.html')].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
const errors=[];
function target(raw,base){
 let url;try{url=new URL(raw.replaceAll('&amp;','&'),base);}catch{return null;}
 if(url.origin!==origin)return null;
 for(let i=0;i<5;i++){
  const rule=redirects.find(r=>r.source===url.pathname || r.source===url.pathname.replace(/\/$/,''));
  if(!rule)break;
  const destination=new URL(rule.destination,origin);
  if(destination.origin!==origin)return null;
  if(!destination.hash)destination.hash=url.hash;url=destination;
 }
 return url;
}
for(const url of urls){
 const source=new URL(url);const file=exists(source.pathname);
 if(!file){errors.push(`${url}: page absent`);continue;}
 const html=fs.readFileSync(file,'utf8');
 if((html.match(/<h1\b/g)||[]).length!==1)errors.push(`${url}: expected one H1`);
 if(/<meta[^>]+name="robots"[^>]+noindex/.test(html))errors.push(`${url}: noindex in sitemap`);
 if(!html.includes(`rel="canonical" href="${url}"`))errors.push(`${url}: canonical mismatch`);
 for(const script of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))try{JSON.parse(script[1]);}catch{errors.push(`${url}: invalid JSON-LD`);}
 for(const match of html.matchAll(/<(?:a|link)\b[^>]*\bhref="([^"]+)"/g)){
  const dest=target(match[1],url);if(!dest)continue;
  const destFile=exists(decodeURIComponent(dest.pathname));
  if(!destFile){errors.push(`${source.pathname}: missing ${dest.pathname}`);continue;}
  if(dest.hash && destFile.endsWith('.html')){
   const content=fs.readFileSync(destFile,'utf8');const id=decodeURIComponent(dest.hash.slice(1));
   if(!content.includes(`id="${id}"`))errors.push(`${source.pathname}: missing anchor ${dest.pathname}${dest.hash}`);
  }
 }
}
if(host==='julientalbot.com'){
 for(const lang of ['','en/'])for(const offer of ['travail','agents','conferences','labs']){
  const html=fs.readFileSync(path.join(dist,lang,offer,'index.html'),'utf8');
  assert.ok(html.includes(`/${lang}${offer}#contact`),`contextual navigation: ${lang}${offer}`);
  assert.ok(html.includes(`form-contact-${offer}-${lang?'en':'fr'}`));
 }
 assert.ok(!xml.includes('conditions-essai')&&!xml.includes('/agents/merci'));
}
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}
console.log(`Routes OK: ${urls.length} pages; local links, fragments, canonical, hreflang destinations, JSON-LD.`);
