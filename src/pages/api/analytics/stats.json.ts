// src/pages/api/analytics/stats.json.ts
import type { APIRoute } from 'astro';

// 模拟访问统计数据
const mockStats = {
  totalVisits: 24589,
  todayVisits: 142,
  onlineUsers: 8,
  postCount: 42
};

export const GET: APIRoute = async ({ url }) => {
  return new Response(JSON.stringify(mockStats), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};