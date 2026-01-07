
import fs from 'fs';
import path from 'path';
import type { APIRoute } from 'astro';

// 数据存储路径
const ANALYTICS_FILE = path.join(process.cwd(), 'src', 'data', 'analytics_db.json');

// 初始化数据库
if (!fs.existsSync(ANALYTICS_FILE)) {
    const dir = path.dirname(ANALYTICS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({ visits: [], pageViews: {} }));
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { url, referrer, ua } = data;
        
        // 简单的内存读写 (生产环境建议用 SQLite/Redis，但 JSON 对个人博客足够了)
        const db = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
        
        // 记录 PV (Page View)
        const path = new URL(url).pathname;
        db.pageViews[path] = (db.pageViews[path] || 0) + 1;
        
        // 记录详细访问日志 (只存最近 10000 条，防止无限膨胀)
        const log = {
            ts: new Date().toISOString(),
            path,
            ref: referrer || '',
            ua: ua || ''
        };
        db.visits.unshift(log);
        if (db.visits.length > 10000) db.visits.length = 10000;
        
        // 保存
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(db));
        
        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // 允许跨域，关键！
            } 
        });
        
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

// 处理预检请求 (CORS)
export const OPTIONS: APIRoute = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
