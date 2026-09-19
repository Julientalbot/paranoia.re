import { readFileSync } from 'node:fs';
const name=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8')).name;
const jt=name==='julientalbot.com';
const base=(process.env.SITE_HEALTH_BASE_URL || (jt?process.env.JT_HEALTH_BASE_URL:process.env.PARANOIA_HEALTH_BASE_URL) || `https://${name}`).replace(/\/$/,'');
const checks=jt?[
 ['/',200,['useful','form-contact-travail-fr']],['/en',200,['useful','form-contact-travail-en']],
 ...['travail','agents','conferences','labs'].flatMap(offer=>[['/'+offer,200,[`form-contact-${offer}-fr`,`/${offer}#contact`]],['/en/'+offer,200,[`form-contact-${offer}-en`,`/en/${offer}#contact`]]]),
 ['/agents',200,['99','/cgv']],['/labs/eval-case-v1',200,['eval-case']],
]:[
 ['/',200,['id="concrete"','/pilote#contact']],['/en',200,['id="concrete"','form-contact-pilote-en']],
 ['/pilote',200,['form-contact-pilote-fr']],['/securite',200,['Paranoia']],['/rapports-incidents',200,['Paranoia']],
 ['/confidentialite',200,['Resend']],['/mentions-legales',200,['ERGONOMIA']],
];
checks.push(['/api/contact',405,['method_not_allowed']],['/unknown-health-check',404,['noindex']],['/sitemap-0.xml',200,['<urlset']],['/robots.txt',200,['sitemap']]);
for(const [route,status,snippets] of checks){
 const response=await fetch(base+route,{signal:AbortSignal.timeout(15000)});const text=await response.text();
 if(response.status!==status)throw new Error(`${route}: ${response.status}, expected ${status}`);
 for(const snippet of snippets)if(!text.includes(snippet))throw new Error(`${route}: missing ${snippet}`);
}
console.log(`Production read-only checks OK: ${checks.length} (${base}). No messages sent.`);
