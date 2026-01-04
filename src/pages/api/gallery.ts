import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const GALLERY_FILE = path.join(DATA_DIR, "gallery.json");

// 确保目录和文件存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(GALLERY_FILE)) {
  fs.writeFileSync(GALLERY_FILE, JSON.stringify({ moments: [], videos: [] }, null, 2));
}

export const GET: APIRoute = async () => {
  try {
    const data = fs.readFileSync(GALLERY_FILE, "utf-8");
    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "无法读取画廊数据" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const newData = await request.json();
    
    // 简单的验证
    if (!newData.moments || !newData.videos) {
       return new Response(JSON.stringify({ error: "数据格式错误" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    fs.writeFileSync(GALLERY_FILE, JSON.stringify(newData, null, 2));
    
    return new Response(JSON.stringify({ success: true, message: "画廊数据已保存" }), {
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
