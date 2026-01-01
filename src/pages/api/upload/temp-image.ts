import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../../..");

// 确保上传目录存在
const uploadDir = path.join(ROOT_DIR, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 检查请求头
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 使用 Astro 原生的 formData 解析
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "没有上传图片文件" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 验证文件类型
    if (!imageFile.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "只允许上传图片文件" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 处理文件名
    const ext = path.extname(imageFile.name) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFileName = `image-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, newFileName);

    // 将文件写入磁盘
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // 生成访问 URL - 使用 /uploads/ 路径
    const imageUrl = `/uploads/${newFileName}`;

    // 返回成功响应
    return new Response(
      JSON.stringify({
        errno: 0,
        success: true,
        message: "图片上传成功",
        data: {
          url: imageUrl,
          alt: imageFile.name,
          href: imageUrl
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("上传图片时出错:", error);
    return new Response(
      JSON.stringify({ error: "上传图片失败", details: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};