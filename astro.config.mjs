// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

const pagesDir = path.resolve('./src/pages');

const getLastmod = (pathname) => {
  const normalized = pathname.replace(/\/$/, '') || '/';
  const relativePath = normalized === '/' ? '/index' : normalized;
  const candidates = [
    path.join(pagesDir, `${relativePath}.astro`),
    path.join(pagesDir, `${relativePath}/index.astro`),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return new Date(fs.statSync(candidate).mtime).toISOString();
    }
  }
  return undefined;
};

export default defineConfig({
  site: 'https://paranoia.re',
  integrations: [
    sitemap({
      serialize: (item) => {
        const url = new URL(item.url);
        if (url.pathname !== '/') {
          item.url = `${url.origin}${url.pathname.replace(/\/$/, '')}`;
        }
        item.lastmod = getLastmod(url.pathname);
        return item;
      },
    }),
  ],
});