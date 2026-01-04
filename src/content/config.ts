import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

// May also need to update /src/types/index.d.ts when updating this file
// When updating the set of searchable collections, update collectionList in /src/pages/search.astro

// 基础内容结构
const baseContent = z.object({
  title: z.string(),
  description: z.string().optional(),
  draft: z.boolean().default(false),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

// 社交媒体链接结构
const social = z.object({
  discord: z.string().optional(),
  email: z.string().optional(),
  facebook: z.string().optional(),
  github: z.string().optional(),
  instagram: z.string().optional(),
  linkedIn: z.string().optional(),
  pinterest: z.string().optional(),
  tiktok: z.string().optional(),
  website: z.string().optional(),
  youtube: z.string().optional(),
  wechat: z.string().optional(),
  xhs: z.string().optional(),
  weibo: z.string().optional(),
  rss: z.string().optional(),
});

// 关于页面集合
const about = defineCollection({
  loader: glob({ pattern: "-index.{md,mdx}", base: "./src/content/about" }),
  schema: ({ image }) =>
    baseContent.extend({
      image: image().optional(),
      imageAlt: z.string().default(""),
      skills: z.array(z.string()).optional(),
      experience: z
        .array(
          z.object({
            title: z.string(),
            company: z.string(),
            period: z.string(),
            description: z.string().optional(),
          }),
        )
        .optional(),
      education: z
        .array(
          z.object({
            degree: z.string(),
            school: z.string(),
            period: z.string(),
          }),
        )
        .optional(),
      social: social.optional(),
    }),
});

// 博客文章集合
const blog = defineCollection({
  loader: glob({ pattern: "**\/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    baseContent.extend({
      featuredImg: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().default(""),
      author: z.string().optional(),
      categories: z.array(z.string().optional()),
      tags: z.array(z.string()).optional(),
      status: z.enum(["draft", "published", "archived"]).default("published"),
      featured: z.boolean().default(false),
      recommended: z.boolean().default(false),
      views: z.number().default(0),
      publishedAt: z.date().optional(),
      hideToc: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

// 分类集合
const categories = defineCollection({
  loader: glob({
    pattern: "**\/[^_]*.{md,mdx}",
    base: "./src/content/categories",
  }),
  schema: ({ image }) =>
    baseContent.extend({
      slug: z.string().optional(),
      icon: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().default(""),
      color: z.string().default("#007bff"),
      parentId: z.string().optional(),
    }),
});

// 标签集合
const tags = defineCollection({
  loader: glob({ pattern: "**\/[^_]*.{md,mdx}", base: "./src/content/tags" }),
  schema: baseContent.extend({
    color: z.string().default("#007bff"),
  }),
});

// 动态/笔记集合
const notes = defineCollection({
  loader: glob({ pattern: "**\/[^_]*.{md,mdx}", base: "./src/content/notes" }),
  schema: ({ image }) =>
    baseContent.extend({
      // 支持多张图片
      images: z
        .array(
          z.object({
            src: image(),
            alt: z.string().default(""),
          }),
        )
        .optional(),
      // 保留单张图片字段以兼容现有内容
      image: image().optional(),
      imageAlt: z.string().default(""),
      tags: z.array(z.string()).optional(),
      mood: z.string().optional(),
      location: z.string().optional(),
    }),
});

// 页面集合
const pages = defineCollection({
  loader: glob({ pattern: "**\/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: ({ image }) =>
    baseContent.extend({
      image: image().optional(),
      imageAlt: z.string().default(""),
      layout: z.string().optional(),
      hideToc: z.boolean().default(false),
    }),
});

// 首页集合
const home = defineCollection({
  loader: glob({ pattern: "-index.{md,mdx}", base: "./src/content/home" }),
  schema: ({ image }) =>
    baseContent.extend({
      image: image().optional(),
      imageAlt: z.string().default(""),
      hero: z
        .object({
          title: z.string(),
          subtitle: z.string().optional(),
          backgroundImage: z.string().optional(),
          ctaButton: z
            .object({
              text: z.string(),
              link: z.string(),
            })
            .optional(),
        })
        .optional(),
      features: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string().optional(),
          }),
        )
        .optional(),
    }),
});

// 搜索配置集合
const search = defineCollection({
  loader: glob({ pattern: "-index.{md,mdx}", base: "./src/content/search" }),
  schema: baseContent.extend({
    searchableCollections: z
      .array(z.string())
      .default(["blog", "notes", "pages"]),
    searchConfig: z
      .object({
        placeholder: z.string().default("搜索内容..."),
        maxResults: z.number().default(10),
        enableHighlight: z.boolean().default(true),
      })
      .optional(),
  }),
});

// 社交媒体配置集合
const socialConfig = defineCollection({
  loader: glob({ pattern: "-index.{md,mdx}", base: "./src/content/social" }),
  schema: baseContent.extend({
    platforms: social,
    displayOrder: z.array(z.string()).optional(),
    showInHeader: z.boolean().default(true),
    showInFooter: z.boolean().default(true),
  }),
});

const terms = defineCollection({
  loader: glob({ pattern: "-index.{md,mdx}", base: "./src/content/terms" }),
  schema: baseContent,
});
// Export collections
export const collections = {
  about,
  blog,
  categories,
  tags,
  notes,
  pages,
  home,
  search,
  social: socialConfig,
  terms,
};
