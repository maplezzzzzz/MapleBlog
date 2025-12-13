// src/pages/api/content/[...slug].ts
import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

export const prerender = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../..');

interface ContentFile {
  slug: string;
  data: any;
  content: string;
}

export const GET: APIRoute = async ({ params }) => {
  try {
    // 从params中获取路径信息
    const slug = params.slug as string;
    
    // 确定内容类型和文件路径
    let contentDir = '';
    let fileExtension = '.md';
    
    if (slug.startsWith('blog/')) {
      contentDir = 'blog';
      fileExtension = '.md';
    } else if (slug.startsWith('pages/')) {
      contentDir = 'pages';
      fileExtension = '.md';
    } else if (slug.startsWith('about/')) {
      contentDir = 'about';
      fileExtension = '.md';
    } else if (slug.startsWith('notes/')) {
      contentDir = 'notes';
      fileExtension = '.mdx';
    } else {
      // 默认处理blog内容
      contentDir = 'blog';
      fileExtension = '.md';
    }
    
    // 构建文件路径
    const fileName = slug.split('/').pop() || 'index';
    const filePath = path.join(ROOT_DIR, 'src', 'content', contentDir, `${fileName}${fileExtension}`);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: '内容未找到' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    const contentFile: ContentFile = {
      slug: fileName,
      data,
      content
    };
    
    return new Response(JSON.stringify(contentFile), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('读取内容文件时出错:', error);
    return new Response(JSON.stringify({ error: '服务器内部错误' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const slug = params.slug as string;
    const { frontmatter, content } = await request.json();
    
    // 确定内容类型和文件路径
    let contentDir = '';
    let fileExtension = '.md';
    
    if (slug.startsWith('blog/')) {
      contentDir = 'blog';
      fileExtension = '.md';
    } else if (slug.startsWith('pages/')) {
      contentDir = 'pages';
      fileExtension = '.md';
    } else if (slug.startsWith('about/')) {
      contentDir = 'about';
      fileExtension = '.md';
    } else if (slug.startsWith('notes/')) {
      contentDir = 'notes';
      fileExtension = '.mdx';
    } else {
      // 默认处理blog内容
      contentDir = 'blog';
      fileExtension = '.md';
    }
    
    // 构建文件路径
    const fileName = slug.split('/').pop() || 'index';
    const filePath = path.join(ROOT_DIR, 'src', 'content', contentDir, `${fileName}${fileExtension}`);
    
    // 创建新的文件内容（frontmatter + content）
    const fileContent = matter.stringify(content, frontmatter);
    
    // 写入文件
    fs.writeFileSync(filePath, fileContent);
    
    return new Response(JSON.stringify({ success: true, message: '内容已保存' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('保存内容文件时出错:', error);
    return new Response(JSON.stringify({ error: '保存失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug as string;
    
    // 确定内容类型和文件路径
    let contentDir = '';
    let fileExtension = '.md';
    
    if (slug.startsWith('blog/')) {
      contentDir = 'blog';
      fileExtension = '.md';
    } else if (slug.startsWith('pages/')) {
      contentDir = 'pages';
      fileExtension = '.md';
    } else if (slug.startsWith('about/')) {
      contentDir = 'about';
      fileExtension = '.md';
    } else {
      // 默认处理blog内容
      contentDir = 'blog';
      fileExtension = '.md';
    }
    
    // 构建文件路径
    const fileName = slug.split('/').pop() || 'index';
    const filePath = path.join(ROOT_DIR, 'src', 'content', contentDir, `${fileName}${fileExtension}`);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: '内容未找到' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 删除文件
    fs.unlinkSync(filePath);
    
    return new Response(JSON.stringify({ success: true, message: '内容已删除' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('删除内容文件时出错:', error);
    return new Response(JSON.stringify({ error: '删除失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};