// src/pages/api/settings.json.ts
import type { APIRoute } from 'astro';

// 模拟网站设置数据
let mockSettings = {
  siteName: '小白天地',
  siteDescription: '一个记录生活感悟、分享人生体验的个人空间',
  adminEmail: 'admin@example.com',
  siteUrl: 'https://example.com',
  favicon: '/favicon.ico',
  logo: '/logo.png',
  beian: '京ICP备XXXXXXXX号',
  gaCode: 'GA-XXXXXXXX-X',
  contactAddress: '北京市朝阳区xxx街道xxx号',
  contactPhone: '+86 138-0000-0000',
  contactEmail: 'contact@example.com',
  businessHours: '周一至周五 9:00-18:00',
  facebook: 'https://facebook.com/example',
  twitter: 'https://twitter.com/example',
  instagram: 'https://instagram.com/example',
  linkedin: 'https://linkedin.com/company/example',
  wechat: 'example_wechat',
  github: 'https://github.com/example',
  youtube: 'https://youtube.com/example',
  copyright: '© 2025 小白天地. 保留所有权利.',
  privacyPolicy: '/privacy',
  termsOfService: '/terms',
  disclaimer: '本网站内容仅供参考，不构成任何投资或决策建议',
  themeColor: '#3498db',
  fontFamily: 'system',
  layoutStyle: 'modern',
  enableComments: 'true',
  maxPostDisplay: '10'
};

export const GET: APIRoute = async ({ url }) => {
  return new Response(JSON.stringify(mockSettings), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    mockSettings = { ...mockSettings, ...data };
    
    return new Response(JSON.stringify({ success: true, message: '设置已保存' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '保存失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};