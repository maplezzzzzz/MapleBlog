import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const ROBOTS_FILE = path.join(PUBLIC_DIR, "robots.txt");

export const GET: APIRoute = async () => {
  try {
    let content = "";
    if (fs.existsSync(ROBOTS_FILE)) {
      content = fs.readFileSync(ROBOTS_FILE, "utf-8");
    } else {
        content = "User-agent: *\nAllow: /";
    }
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "无法读取 robots.txt" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { content } = await request.json();
    
    fs.writeFileSync(ROBOTS_FILE, content);
    
    return new Response(JSON.stringify({ success: true, message: "robots.txt 已更新" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "更新失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
