// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://paranoia.re',
  output: 'server',
  adapter: vercel(),
  integrations: [
    sitemap({
      serialize: (item) => {
        const url = new URL(item.url);
        if (url.pathname !== '/') {
          item.url = `${url.origin}${url.pathname.replace(/\/$/, '')}`;
        }
        return item;
      },
    }),
  ],
});
