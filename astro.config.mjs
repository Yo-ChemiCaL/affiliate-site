// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mono-lab.uk',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/draft/'),
    }),
  ],
  image: {
    // sharp による画像最適化
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  build: {
    // 静的サイト生成
    format: 'directory',
  },
});
