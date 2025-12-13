// src/pages/api/seo/settings.json.ts
import type { APIRoute } from 'astro';

// 模拟SEO设置数据
let mockSeoSettings = {
  siteTitle: '小白天地 - 记录生活感悟',
  siteDescription: '一个记录生活感悟、分享人生体验的个人空间，在这里与志同道合的朋友一起探索生活的美好。',
  siteKeywords: '生活感悟,个人博客,技术分享,人生体验',
  ogTitle: '小白天地 - 记录生活感悟',
  ogDescription: '一个记录生活感悟、分享人生体验的个人空间',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
  googleAnalytics: 'GA-XXXXXXXX-X',
  bingVerification: 'bing-verification-code',
  robotsTxt: 'User-agent: *\nAllow: /',
  sitemapFrequency: 'daily'
};

export const GET: APIRoute = async ({ url }) => {
  return new Response(JSON.stringify(mockSeoSettings), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    mockSeoSettings = { ...mockSeoSettings, ...data };
    
    return new Response(JSON.stringify({ success: true, message: 'SEO设置已保存' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '保存SEO设置失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};