import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkToc from 'remark-toc';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx(), sitemap()],
  site: "https://pieper.io",
  markdown: {
    // Applied to .md and .mdx files
    remarkPlugins: [remarkToc]
  },
});
