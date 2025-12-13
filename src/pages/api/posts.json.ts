// src/pages/api/posts.json.ts
import type { APIRoute } from 'astro';

// 模拟文章数据
const mockPosts = [
  {
    id: '1',
    title: 'Astro静态站点生成器入门指南',
    slug: 'astro-static-site-generator-guide',
    status: 'published',
    categories: ['开发', '前端'],
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
    views: 1240
  },
  {
    id: '2',
    title: 'TypeScript在现代Web开发中的应用',
    slug: 'typescript-in-modern-web-development',
    status: 'published',
    categories: ['开发', 'TypeScript'],
    publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
    views: 982
  },
  {
    id: '3',
    title: 'Tailwind CSS响应式设计实践',
    slug: 'tailwind-css-responsive-design-practice',
    status: 'draft',
    categories: ['开发', 'CSS'],
    publishedAt: null,
    views: 0
  },
  {
    id: '4',
    title: 'React组件设计模式最佳实践',
    slug: 'react-component-design-patterns',
    status: 'published',
    categories: ['开发', 'React'],
    publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3天前
    views: 876
  },
  {
    id: '5',
    title: 'Node.js后端开发技巧',
    slug: 'nodejs-backend-development-tips',
    status: 'archived',
    categories: ['开发', '后端'],
    publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4天前
    views: 634
  }
];

export const GET: APIRoute = async ({ url }) => {
  // 过滤参数
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  
  let filteredPosts = mockPosts;
  
  if (status) {
    filteredPosts = filteredPosts.filter(post => post.status === status);
  }
  
  if (category) {
    filteredPosts = filteredPosts.filter(post => 
      post.categories.includes(category)
    );
  }
  
  return new Response(JSON.stringify(filteredPosts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};