import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const ADS_FILE = path.join(DATA_DIR, "ads.json");

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 确保文件存在
if (!fs.existsSync(ADS_FILE)) {
  fs.writeFileSync(ADS_FILE, "[]");
}

export const GET: APIRoute = async () => {
  try {
    const data = fs.readFileSync(ADS_FILE, "utf-8");
    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "无法读取广告数据" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const newAds = await request.json();
    
    if (!Array.isArray(newAds)) {
       return new Response(JSON.stringify({ error: "数据格式错误" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    fs.writeFileSync(ADS_FILE, JSON.stringify(newAds, null, 2));
    
    return new Response(JSON.stringify({ success: true, message: "广告设置已保存" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "保存失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
