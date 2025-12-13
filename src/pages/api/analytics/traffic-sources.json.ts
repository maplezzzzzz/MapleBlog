// src/pages/api/analytics/traffic-sources.json.ts
import type { APIRoute } from 'astro';

// 模拟流量来源数据
const mockTrafficSources = [
  {
    name: '直接访问',
    count: 5240,
    percentage: 45.2
  },
  {
    name: '搜索引擎',
    count: 3210,
    percentage: 27.7
  },
  {
    name: '社交媒体',
    count: 1890,
    percentage: 16.3
  },
  {
    name: '引荐网站',
    count: 654,
    percentage: 5.6
  },
  {
    name: '其他',
    count: 598,
    percentage: 5.2
  }
];

export const GET: APIRoute = async ({ url }) => {
  return new Response(JSON.stringify(mockTrafficSources), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};