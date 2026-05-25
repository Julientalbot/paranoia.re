#!/usr/bin/env node

const BASE_URL = (process.env.PARANOIA_HEALTH_BASE_URL || 'https://paranoia.re').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.PARANOIA_HEALTH_TIMEOUT_MS || 10_000);
const LIVE_WAITLIST_EMAIL = process.env.PARANOIA_HEALTH_LIVE_WAITLIST_EMAIL?.trim();

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
        'user-agent': 'paranoia-production-check/1.0',
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

const runCheck = async (name, fn) => {
  const startedAt = Date.now();
  await fn();
  checks.push({ name, durationMs: Date.now() - startedAt });
};

await runCheck('GET /api/ping reports email backend', async () => {
  const response = await request('/api/ping');

  if (response.status !== 200) {
    fail('GET /api/ping', `expected 200, got ${response.status}`, { body: response.body });
  }

  if (!response.body || response.body.ok !== true || response.body.backend !== 'email') {
    fail('GET /api/ping', 'unexpected response body', { body: response.body });
  }

  const waitlist = response.body.waitlist || {};
  if (
    waitlist.version !== 2 ||
    waitlist.bodyLimit !== true ||
    waitlist.emailValidation !== true ||
    waitlist.honeypot !== true ||
    waitlist.rateLimit !== true
  ) {
    fail('GET /api/ping', 'waitlist protections are not active on this deployment', { body: response.body });
  }
});

await runCheck('POST /api/waitlist rejects invalid email', async () => {
  const response = await request('/api/waitlist', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.201',
    },
    body: JSON.stringify({ email: 'not-an-email', website: '' }),
  });

  if (response.status !== 400) {
    fail('POST /api/waitlist invalid', `expected 400, got ${response.status}`, { body: response.body });
  }

  if (!response.body || typeof response.body.error !== 'string') {
    fail('POST /api/waitlist invalid', 'missing error body', { body: response.body });
  }
});

await runCheck('POST /api/waitlist accepts honeypot without sending lead email', async () => {
  const response = await request('/api/waitlist', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.202',
    },
    body: JSON.stringify({
      email: `healthcheck-${Date.now()}@example.com`,
      website: 'https://spam.example',
    }),
  });

  if (response.status !== 200) {
    fail('POST /api/waitlist honeypot', `expected 200, got ${response.status}`, { body: response.body });
  }

  if (!response.body || response.body.ok !== true) {
    fail('POST /api/waitlist honeypot', 'unexpected response body', { body: response.body });
  }
});

if (LIVE_WAITLIST_EMAIL) {
  await runCheck('POST /api/waitlist live Resend send', async () => {
    const response = await request('/api/waitlist', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.203',
      },
      body: JSON.stringify({
        email: LIVE_WAITLIST_EMAIL,
        website: '',
      }),
    });

    if (response.status !== 200) {
      fail('POST /api/waitlist live', `expected 200, got ${response.status}`, { body: response.body });
    }

    if (!response.body || response.body.ok !== true) {
      fail('POST /api/waitlist live', 'unexpected response body', { body: response.body });
    }
  });
}

console.log(JSON.stringify({
  ok: true,
  baseUrl: BASE_URL,
  liveWaitlist: Boolean(LIVE_WAITLIST_EMAIL),
  checks,
}, null, 2));
