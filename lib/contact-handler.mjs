/** Contact transport: no persistence, no personal data in diagnostics. */
export const MAX_BODY_BYTES = 32 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const clip = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const reply = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};
async function readBody(req) {
  if (Number(req.headers?.['content-length']) > MAX_BODY_BYTES) throw new RangeError('body_too_large');
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw new RangeError('body_too_large');
    return JSON.parse(raw);
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += Buffer.byteLength(chunk);
    if (bytes > MAX_BODY_BYTES) throw new RangeError('body_too_large');
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}
export function createContactHandler({ labels, from, to, subject, timeoutMs = 10_000 }) {
  return async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return reply(res, 405, { ok: false, error: 'method_not_allowed' });
    }
    let body;
    try { body = await readBody(req); }
    catch (error) { return reply(res, error instanceof RangeError ? 413 : 400, { ok: false, error: error instanceof RangeError ? 'body_too_large' : 'invalid_json' }); }
    if (!object(body)) return reply(res, 400, { ok: false, error: 'invalid_body' });
    if (typeof body.website === 'string' && body.website.trim()) return reply(res, 200, { ok: true });
    const variant = clip(body.variant, 40);
    if (!Object.hasOwn(labels, variant)) return reply(res, 400, { ok: false, error: 'invalid_variant' });
    const email = clip(body.email, 254);
    if (!EMAIL_RE.test(email) || typeof body.email !== 'string' || body.email.trim().length > 254) return reply(res, 400, { ok: false, error: 'invalid_email' });
    const fields = object(body.fields) ? body.fields : {};
    const values = ['champ1', 'champ2', 'champ3'].map(key => clip(fields[key], 2000));
    if (!values[0]) return reply(res, 400, { ok: false, error: 'missing_fields' });
    const page = typeof body.page === 'string' && /^\/(?:en(?:\/|$))?(?:travail|agents|conferences|labs|pilote)?\/?$/.test(body.page || '') ? body.page : '/';
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return reply(res, 502, { ok: false, error: 'mail_not_configured' });
    const text = [`Variant: ${variant}`, `Page: ${page}`, `Email: ${email}`, '', ...values.flatMap((value, index) => value ? [labels[variant][index] + ':', value, ''] : [])].join('\n');
    const controller = new AbortController();
    let timer;
    try {
      const response = await Promise.race([
        fetch('https://api.resend.com/emails', {
          method: 'POST', signal: controller.signal,
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, reply_to: email, subject: `${subject} ${variant} — ${page}`, text }),
        }),
        new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('mail_timeout')); }, timeoutMs); }),
      ]);
      if (!response.ok) return reply(res, 502, { ok: false, error: 'mail_send_failed' });
      console.info(JSON.stringify({ event: 'contact_accepted', offer: variant, page, lang: page.startsWith('/en') ? 'en' : 'fr' }));
      return reply(res, 200, { ok: true });
    } catch { return reply(res, 502, { ok: false, error: 'mail_send_failed' }); }
    finally { clearTimeout(timer); }
  };
}
