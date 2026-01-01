import { defineRoute } from 'astro:middleware';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const GET = defineRoute(async ({ params, request }) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const ROOT_DIR = path.resolve(__dirname, '../../../..');
  
  // 获取请求的文件名
  const fileName = params.fileName;
  
  if (!fileName) {
    return new Response('File not specified', { status: 400 });
  }
  
  // 构建文件路径
  const filePath = path.join(ROOT_DIR, 'public', 'uploads', fileName);
  
  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }
  
  // 读取文件
  const fileBuffer = fs.readFileSync(filePath);
  
  // 获取文件的MIME类型
  const getMimeType = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };
  
  // 返回文件
  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': getMimeType(fileName),
      'Cache-Control': 'public, max-age=31536000' // 缓存1年
    }
  });
});