import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 确保设置文件存在
if (!fs.existsSync(SETTINGS_FILE)) {
  const defaultSettings = {
    site: {
      title: "小白天地",
      description: "一个记录生活感悟、分享人生体验的个人空间。",
      author: "小白",
      url: "https://example.com"
    },
    appearance: {
      theme: "auto",
      primaryColor: "#3498db"
    },
    features: {
      comments: true,
      search: true,
      darkMode: true
    }
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
}

export const GET: APIRoute = async () => {
  try {
    const settings = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return new Response(settings, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "无法读取设置" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const newSettings = await request.json();
    
    // 简单的验证
    if (!newSettings.site || !newSettings.site.title) {
       return new Response(JSON.stringify({ error: "无效的设置数据" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    
    return new Response(JSON.stringify({ success: true, message: "设置已保存" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "保存设置失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
