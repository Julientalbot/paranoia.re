#!/usr/bin/env node

const BASE_URL = (process.env.PARANOIA_HEALTH_BASE_URL || 'https://paranoia.re').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.PARANOIA_HEALTH_TIMEOUT_MS || 10_000);

const checks = [];

const fail = (name, message, context = {}) => {
  const error = new Error(`${name}: ${message}`);
  error.context = context;
  throw error;
};

const request = async (path, init = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'user-agent': 'paranoia-production-check/1.1',
        ...(init.headers || {}),
      },
    });
    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;

    return {
      status: response.status,
      body,
      headers: response.headers,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const includesSnippet = (body, snippet) => {
  if (body.includes(snippet)) return true;
  return body.toLocaleLowerCase('fr-FR').includes(snippet.toLocaleLowerCase('fr-FR'));
};

const runCheck = async (name, fn) => {
  const startedAt = Date.now();
  await fn();
  checks.push({ name, durationMs: Date.now() - startedAt });
};

const pageChecks = [
  {
    path: '/',
    mustInclude: ['mailto:contact@paranoia.re', 'Réduire l', 'id="concrete"', 'xo-form-contact', '/pilote#contact'],
  },
  {
    path: '/en',
    mustInclude: ['psychiatric term', 'Request pilot access', 'mailto:contact@paranoia.re', 'xo-form-contact'],
  },
  {
    path: '/cas-usages',
    mustInclude: ['/pilote#contact'],
    mustIncludeInsensitive: ['contrats'],
  },
  {
    path: '/confidentialite-prompts-ia',
    mustInclude: ['Confidentialité', 'prompts'],
  },
  {
    path: '/securite',
    mustInclude: ['Sécurité', 'périmètre'],
  },
  {
    path: '/rapports-incidents',
    mustInclude: ['transparence', 'Sentry'],
  },
  {
    path: '/pilote',
    mustInclude: ['Pilote privé', 'mailto:contact@paranoia.re', 'xo-form-contact', 'id="contact"'],
  },
];

for (const page of pageChecks) {
  await runCheck(`GET ${page.path} returns expected content`, async () => {
    const response = await request(page.path);

    if (response.status !== 200) {
      fail(`GET ${page.path}`, `expected 200, got ${response.status}`, { body: response.body });
    }

    if (typeof response.body !== 'string') {
      fail(`GET ${page.path}`, 'expected HTML body', { body: response.body });
    }

    for (const snippet of page.mustInclude || []) {
      if (!includesSnippet(response.body, snippet)) {
        fail(`GET ${page.path}`, `missing expected snippet: ${snippet}`, {
          body: response.body.slice(0, 500),
        });
      }
    }

    for (const snippet of page.mustIncludeInsensitive || []) {
      if (!includesSnippet(response.body, snippet)) {
        fail(`GET ${page.path}`, `missing expected snippet (case-insensitive): ${snippet}`, {
          body: response.body.slice(0, 500),
        });
      }
    }
  });
}

await runCheck('GET /unknown-page returns 404 without indexable canonical', async () => {
  const response = await request('/unknown-page-paranoia-health-check');

  if (response.status !== 404) {
    fail('GET /unknown-page', `expected 404, got ${response.status}`, { body: response.body });
  }

  if (typeof response.body !== 'string') {
    fail('GET /unknown-page', 'expected HTML body', { body: response.body });
  }

  if (!response.body.includes('noindex')) {
    fail('GET /unknown-page', 'missing noindex robots meta', { body: response.body.slice(0, 500) });
  }

  if (response.body.includes('rel="canonical" href="https://paranoia.re/404')) {
    fail('GET /unknown-page', '404 should not expose canonical to /404', {
      body: response.body.slice(0, 500),
    });
  }
});

await runCheck('GET /robots.txt references sitemap', async () => {
  const response = await request('/robots.txt');

  if (response.status !== 200) {
    fail('GET /robots.txt', `expected 200, got ${response.status}`, { body: response.body });
  }

  if (typeof response.body !== 'string' || !response.body.includes('sitemap')) {
    fail('GET /robots.txt', 'missing sitemap reference', { body: response.body });
  }
});

await runCheck('GET /sitemap-index.xml returns sitemap index', async () => {
  const response = await request('/sitemap-index.xml');

  if (response.status !== 200) {
    fail('GET /sitemap-index.xml', `expected 200, got ${response.status}`, { body: response.body });
  }

  if (typeof response.body !== 'string' || !response.body.includes('<sitemapindex')) {
    fail('GET /sitemap-index.xml', 'unexpected sitemap index body', { body: String(response.body).slice(0, 500) });
  }
});

await runCheck('GET /api/contact is POST-only', async () => {
  const response = await request('/api/contact');
  if (response.status !== 405) {
    fail('GET /api/contact', `expected 405, got ${response.status}`, { body: response.body });
  }
});

await runCheck('POST /api/contact rejects invalid email without sending', async () => {
  const response = await request('/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      variant: 'pilote',
      email: 'not-an-email',
      fields: { champ1: 'a', champ2: 'b', champ3: 'c' },
      website: '',
    }),
  });
  const error = response.body && typeof response.body === 'object' ? response.body.error : null;
  if (response.status !== 400 || error !== 'invalid_email') {
    fail('POST /api/contact invalid email', `expected 400 invalid_email, got ${response.status} ${JSON.stringify(response.body).slice(0, 200)}`);
  }
});

console.log(JSON.stringify({
  ok: true,
  baseUrl: BASE_URL,
  checks,
}, null, 2));
