import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getSiteUrl } from "../lib/config";

// 动态生成sitemap.xml
export const GET: APIRoute = async ({ request }) => {
  try {
    // 使用配置的网站URL，在生产环境使用正确的域名
    const siteUrl = getSiteUrl();

    // 获取所有内容集合
    const [blogPosts, pages, notes] = await Promise.all([
      getCollection(
        "blog",
        ({ data, filePath }) => !data.draft && !filePath?.endsWith("-index.md"),
      ),
      getCollection(
        "pages",
        ({ data, filePath }) => !data.draft && !filePath?.endsWith("-index.md"),
      ),
      getCollection(
        "notes",
        ({ data, filePath }) => !data.draft && !filePath?.endsWith("-index.md"),
      ),
    ]);

    // 生成URL条目
    const urls: string[] = [];

    // 添加首页
    urls.push(`
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

    // 添加博客文章
    blogPosts.forEach((post) => {
      const lastmod = post.data.updatedAt || post.data.createdAt || new Date();
      urls.push(`
  <url>
    <loc>${siteUrl}/blog/${post.id}</loc>
    <lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    });

    // 添加页面
    pages.forEach((page) => {
      const lastmod = page.data.updatedAt || page.data.createdAt || new Date();
      urls.push(`
  <url>
    <loc>${siteUrl}/page/${page.id}</loc>
    <lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });

    // 添加笔记
    notes.forEach((note) => {
      const lastmod = note.data.updatedAt || note.data.createdAt || new Date();
      urls.push(`
  <url>
    <loc>${siteUrl}/notes/${note.id}</loc>
    <lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    });

    // 生成完整的sitemap XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`;

    return new Response(sitemapXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // 返回基础sitemap作为fallback
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${new URL(request.url).origin}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300", // 错误情况下缓存时间较短
      },
    });
  }
};
