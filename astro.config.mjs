import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeExternalLinks from "rehype-external-links";

const isProd = process.env.PUBLIC_ENV === 'production';

function getSiteUrl() {
  return isProd ? "https://maplezz.com" : "http://localhost:4321";
}

export default defineConfig({
  site: getSiteUrl(),
  base: "/",
  trailingSlash: "ignore",
  output: "static",
  server: {
    host: true,
    port: 4321
  },
  build: {
    inlineStylesheets: "auto",
    assets: "_astro",
    concurrency: 4,
    split: true
  },
  prefetch: {
    prefetchAll: isProd
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    AutoImport({
      imports: ["@components/common/Button.astro", "@shortcodes/Accordion", "@shortcodes/Notice", "@shortcodes/Youtube", "@shortcodes/Tabs", "@shortcodes/Tab"]
    }),
    mdx()
  ],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, {
      test: "Table of contents"
    }], remarkMath],
    rehypePlugins: [
      [rehypeKatex, {}],
      [rehypeExternalLinks, {
        target: "_blank",
        rel: ["nofollow", "noopener", "noreferrer"],
        test: (node) => {
          const href = node.properties?.href;
          if (!href) return false;
          return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
        }
      }]
    ],
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark-dimmed",
      }
    },
    extendDefaultPlugins: true
  },
  image: {
    remotePatterns: [{
      protocol: "https"
    }],
    service: {
      entrypoint: "astro/assets/services/sharp"
    },
    domains: [],
    quality: isProd ? 80 : 60,
    formats: ["webp", "avif"],
    experimentalLayout: "constrained"
  },
});
