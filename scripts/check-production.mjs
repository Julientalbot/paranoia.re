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

await runCheck('GET / returns contact route', async () => {
  const response = await request('/');

  if (response.status !== 200) {
    fail('GET /', `expected 200, got ${response.status}`, { body: response.body });
  }

  if (typeof response.body !== 'string' || !response.body.includes('mailto:contact@paranoia.re')) {
    fail('GET /', 'missing direct contact mailto', { body: String(response.body).slice(0, 500) });
  }
});

await runCheck('GET /rapports-incidents returns support route', async () => {
  const response = await request('/rapports-incidents');

  if (response.status !== 200) {
    fail('GET /rapports-incidents', `expected 200, got ${response.status}`, { body: response.body });
  }

  if (typeof response.body !== 'string' || !response.body.includes('Rapports')) {
    fail('GET /rapports-incidents', 'unexpected report page body', { body: String(response.body).slice(0, 500) });
  }
});

console.log(JSON.stringify({
  ok: true,
  baseUrl: BASE_URL,
  checks,
}, null, 2));
