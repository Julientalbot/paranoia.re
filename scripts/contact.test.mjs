import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import handler from '../api/contact.js';
import { createContactHandler, MAX_BODY_BYTES } from '../lib/contact-handler.mjs';
const originalFetch = globalThis.fetch;
const originalKey = process.env.RESEND_API_KEY;
const variant = process.cwd().includes('paranoia.re') ? 'pilote' : 'travail';
const valid = { variant, email: 'person@example.invalid', fields: { champ1: 'A fictional test request' }, website: '', page: '/' };
afterEach(() => { globalThis.fetch = originalFetch; if(originalKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=originalKey; });
async function call(body, { raw=false, parsed=false, fn=handler, headers={} }={}) {
 const req=Readable.from([Buffer.from(raw?body:JSON.stringify(body))]);req.method='POST';req.headers=headers;if(parsed)req.body=body;
 const res={statusCode:0,headers:{},setHeader(k,v){this.headers[k]=v;},end(text){this.body=JSON.parse(text);}};
 await fn(req,res);return res;
}
function mock(status=200) { process.env.RESEND_API_KEY='fixture-not-a-real-key';const calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return {ok:status===200,status};};return calls; }
test('null, array and malformed JSON are controlled failures without sending',async()=>{const calls=mock();for(const body of [null,[],42,'x'])assert.equal((await call(body)).statusCode,400);assert.equal((await call('{',{raw:true})).statusCode,400);assert.equal(calls.length,0);});
test('email and message are sufficient; optional fields can be absent',async()=>{const calls=mock();const result=await call(valid);assert.equal(result.statusCode,200);assert.deepEqual(result.body,{ok:true});assert.equal(calls.length,1);assert.equal(calls[0].body.reply_to,valid.email);assert.match(calls[0].body.text,/A fictional test request/);assert.equal(result.headers['Cache-Control'],'no-store');});
test('accepts hosting-platform parsed bodies',async()=>{mock();assert.equal((await call(valid,{parsed:true})).statusCode,200);});
test('invalid email and blank message never call the provider',async()=>{const calls=mock();assert.equal((await call({...valid,email:'invalid'})).body.error,'invalid_email');assert.equal((await call({...valid,fields:{champ1:'  '}})).body.error,'missing_fields');assert.equal(calls.length,0);});
test('unknown variant and prototype keys are rejected',async()=>{const calls=mock();for(const v of ['unknown','__proto__','constructor'])assert.equal((await call({...valid,variant:v})).body.error,'invalid_variant');assert.equal(calls.length,0);});
test('oversized stream, parsed body and content-length are rejected',async()=>{const calls=mock();const oversized={...valid,fields:{champ1:'x'.repeat(MAX_BODY_BYTES)}};assert.equal((await call(oversized)).statusCode,413);assert.equal((await call(oversized,{parsed:true})).statusCode,413);assert.equal((await call(valid,{headers:{'content-length':String(MAX_BODY_BYTES+1)}})).statusCode,413);assert.equal(calls.length,0);});
test('honeypot silently skips sending',async()=>{const calls=mock();assert.equal((await call({...valid,website:'filled'})).statusCode,200);assert.equal(calls.length,0);});
test('provider failure and missing configuration never report success',async()=>{mock(500);assert.equal((await call(valid)).statusCode,502);delete process.env.RESEND_API_KEY;assert.equal((await call(valid)).body.error,'mail_not_configured');});
test('transport failure preserves a controlled error',async()=>{mock();globalThis.fetch=async()=>{throw new Error('network');};assert.equal((await call(valid)).body.error,'mail_send_failed');});
test('provider deadline is bounded even if transport does not resolve',async()=>{mock();let signal;globalThis.fetch=(_,options)=>{signal=options.signal;return new Promise(()=>{});};const fn=createContactHandler({labels:{[variant]:['Message','Detail','Constraint']},from:'test',to:['test'],subject:'test',timeoutMs:20});const result=await call(valid,{fn});assert.equal(result.statusCode,502);assert.equal(signal.aborted,true);});
test('GET is rejected without sending',async()=>{const calls=mock();const req={method:'GET'};const res={setHeader(){},end(body){this.body=JSON.parse(body);}};await handler(req,res);assert.equal(res.statusCode,405);assert.equal(calls.length,0);});
if(variant==='travail')test('Labs has its own contact route',async()=>{const calls=mock();assert.equal((await call({...valid,variant:'labs',page:'/en/labs'})).statusCode,200);assert.match(calls[0].body.subject,/labs/);});
