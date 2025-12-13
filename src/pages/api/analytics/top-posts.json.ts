// src/pages/api/analytics/top-posts.json.ts
import type { APIRoute } from 'astro';

// 模拟热门文章数据
const mockTopPosts = [
  {
    id: '1',
    title: 'Astro静态站点生成器入门指南',
    slug: 'astro-static-site-generator-guide',
    views: 1240,
    lastViewed: new Date(Date.now() - 86400000).toISOString() // 1天前
  },
  {
    id: '2',
    title: 'TypeScript在现代Web开发中的应用',
    slug: 'typescript-in-modern-web-development',
    views: 982,
    lastViewed: new Date(Date.now() - 172800000).toISOString() // 2天前
  },
  {
    id: '3',
    title: 'Tailwind CSS响应式设计实践',
    slug: 'tailwind-css-responsive-design-practice',
    views: 876,
    lastViewed: new Date(Date.now() - 259200000).toISOString() // 3天前
  },
  {
    id: '4',
    title: 'React组件设计模式最佳实践',
    slug: 'react-component-design-patterns',
    views: 756,
    lastViewed: new Date(Date.now() - 345600000).toISOString() // 4天前
  },
  {
    id: '5',
    title: 'Node.js后端开发技巧',
    slug: 'nodejs-backend-development-tips',
    views: 634,
    lastViewed: new Date(Date.now() - 432000000).toISOString() // 5天前
  }
];

export const GET: APIRoute = async ({ url }) => {
  return new Response(JSON.stringify(mockTopPosts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};