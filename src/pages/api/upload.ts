import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "assets", "uploads");

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "没有上传文件" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
       return new Response(JSON.stringify({ error: "只允许上传图片" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 生成唯一文件名
    const ext = path.extname(file.name);
    const fileName = `ad-${Date.now()}-${Math.round(Math.random() * 1000)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // 将 ArrayBuffer 写入文件
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // 返回相对 URL
    const url = `/assets/uploads/${fileName}`;

    return new Response(JSON.stringify({ success: true, url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("上传失败:", error);
    return new Response(JSON.stringify({ error: "服务器内部错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
