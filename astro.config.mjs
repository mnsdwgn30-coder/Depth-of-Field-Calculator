// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://depth-of-field-calculator.mnsdwgn30.workers.dev',
  trailingSlash: 'ignore',
  integrations: [sitemap()]
});

