// @ts-check
import { defineConfig } from 'astro/config';
// Markdown-движок Astro 7; пакет устанавливается вместе с astro
import { satteri } from '@astrojs/markdown-satteri';
import rehypeFigure from './src/lib/rehype-figure.mjs';

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: satteri({ hastPlugins: [rehypeFigure()] }),
  },
});
