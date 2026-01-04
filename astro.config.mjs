import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeExternalLinks from "rehype-external-links";
import { fileURLToPath, URL } from "node:url";

// 获取环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';

// 根据环境设置站点 URL
const getSiteUrl = () => {
  switch (NODE_ENV) {
    case 'production':
      return "https://maplezz.com"; // 请替换为您的实际域名
    case 'development':
    case 'test':
    default:
      return "http://localhost:3000";
  }
};

// https://astro.build/config
export default defineConfig({
  site: getSiteUrl(),
  base: "/",
  trailingSlash: "ignore",
  output: "server", // 使用服务端渲染模式，支持动态后台
  adapter: node({
    mode: 'standalone'
  }), 
  server: {
    // 强制绑定到 IPv4 本地回环地址，解决 macOS 连接问题
    host: '127.0.0.1', 
    port: 4321
  },
  build: {
    // 静态站点构建优化
    inlineStylesheets: "auto",
    assets: "_astro",
    // 启用并行构建以提升性能
    concurrency: 4,
    // 分割代码以减少单个文件大小
    split: true
  },
  prefetch: {
    // 在开发环境禁用预取以加快构建
    prefetchAll: isProduction
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // 使用自定义的base样式
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
          // 只对外部链接应用，内部链接不受影响
          const href = node.properties?.href;
          if (!href) return false;
          // 检查是否为外部链接
          return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
        }
      }]
    ],
    shikiConfig: {
      themes: { // https://shiki.style/themes
        light: "github-light",
        dark: "github-dark-dimmed",
      } 
    },
    extendDefaultPlugins: true
  },
  image: {
    // 配置图片处理
    remotePatterns: [{
      protocol: "https"
    }],
    // 启用图片优化服务
    service: {
      entrypoint: "astro/assets/services/sharp"
    },
    // 图片优化配置
    domains: [],
    // 降低图片质量以加快构建速度
    quality: isDevelopment ? 60 : 80,
    // 支持的图片格式
    formats: ["webp", "avif"],
    // 启用图片缓存以加速重复构建
    experimentalLayout: "constrained"
  },
});