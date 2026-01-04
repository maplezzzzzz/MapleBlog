import type { APIRoute } from "astro";
import { getSiteUrl } from "../lib/config";

// 动态生成sitemap-index.xml
export const GET: APIRoute = async ({ request }) => {
  try {
    // 使用配置的网站URL，在生产环境使用正确的域名
    const siteUrl = getSiteUrl();

    // 生成sitemap索引，目前只有一个主要的sitemap
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new Response(sitemapIndex, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap index:", error);

    // 返回基础sitemap索引作为fallback
    const siteUrl = new URL(request.url).origin;
    const fallbackIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new Response(fallbackIndex, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300", // 错误情况下缓存时间较短
      },
    });
  }
};
