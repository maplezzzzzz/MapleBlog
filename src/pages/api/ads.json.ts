// src/pages/api/ads.json.ts
import type { APIRoute } from 'astro';

// 模拟广告数据
let mockAds = [
  {
    id: '1',
    name: '首页横幅广告',
    type: 'banner',
    status: 'active',
    impressions: 12400,
    clicks: 124,
    code: '<!-- Google AdSense Code -->',
    url: 'https://example.com',
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  },
  {
    id: '2',
    name: '侧边栏推广',
    type: 'sidebar',
    status: 'active',
    impressions: 8900,
    clicks: 89,
    code: '<!-- Promotion Ad Code -->',
    url: 'https://promotion.com',
    startDate: '2025-01-01',
    endDate: '2025-06-30'
  },
  {
    id: '3',
    name: '页脚合作伙伴',
    type: 'footer',
    status: 'inactive',
    impressions: 0,
    clicks: 0,
    code: '<!-- Partner Ad Code -->',
    url: 'https://partner.com',
    startDate: '2025-03-01',
    endDate: '2025-09-30'
  }
];

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  
  if (id) {
    const ad = mockAds.find(ad => ad.id === id);
    if (ad) {
      return new Response(JSON.stringify(ad), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: '广告未找到' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
  return new Response(JSON.stringify(mockAds), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const newAd = {
      id: String(mockAds.length + 1),
      ...data,
      impressions: 0,
      clicks: 0
    };
    mockAds.push(newAd);
    
    return new Response(JSON.stringify(newAd), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '创建广告失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const PUT: APIRoute = async ({ request, url }) => {
  try {
    const id = url.pathname.split('/').pop(); // 获取URL中的ID
    const data = await request.json();
    
    const adIndex = mockAds.findIndex(ad => ad.id === id);
    if (adIndex !== -1) {
      mockAds[adIndex] = { ...mockAds[adIndex], ...data };
      
      return new Response(JSON.stringify(mockAds[adIndex]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: '广告未找到' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: '更新广告失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.pathname.split('/').pop(); // 获取URL中的ID
    
    const adIndex = mockAds.findIndex(ad => ad.id === id);
    if (adIndex !== -1) {
      mockAds.splice(adIndex, 1);
      
      return new Response(JSON.stringify({ message: '广告已删除' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: '广告未找到' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: '删除广告失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};