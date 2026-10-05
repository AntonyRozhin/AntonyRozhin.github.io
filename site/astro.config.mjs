// @ts-check
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// Markdown-движок Astro 7; пакет устанавливается вместе с astro
import { satteri } from '@astrojs/markdown-satteri';
import rehypeFigure from './src/lib/rehype-figure.mjs';

// SITE_URL — из окружения (`SITE_URL=https://example.com npm run build`) или из site/.env.
// Переменные окружения важнее .env: loadEnvFile их не перезаписывает.
const envFile = new URL('./.env', import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

const siteUrl = process.env.SITE_URL || undefined;

// https://astro.build/config
export default defineConfig({
  // Без домена site не задаётся: sitemap и абсолютные og:image не генерируются
  site: siteUrl,
  integrations: siteUrl ? [sitemap()] : [],
  markdown: {
    processor: satteri({ hastPlugins: [rehypeFigure()] }),
  },
});
