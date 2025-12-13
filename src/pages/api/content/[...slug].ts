// src/pages/api/content/[...slug].ts
import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

// 明确指定此为服务器渲染路由
export const prerender = false;

// 为动态路由提供静态路径的最小实现，以满足构建系统要求，但实际不生成静态页面
export async function getStaticPaths() {
  // 返回一个示例路径以满足构建要求，但不实际生成静态内容
  return [
    {
      params: { slug: "example" },
      // 不提供props，因为我们使用动态服务器端处理
    }
  ];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../..');

interface ContentFile {
  slug: string;
  data: any;
  content: string;
}

function getContentConfig(slug: string) {
  if (slug.startsWith('blog/')) {
    return { dir: 'blog', ext: '.md' };
  } else if (slug.startsWith('pages/')) {
    return { dir: 'pages', ext: '.md' };
  } else if (slug.startsWith('about/')) {
    return { dir: 'about', ext: '.md' };
  } else if (slug.startsWith('notes/')) {
    return { dir: 'notes', ext: '.mdx' };
  } else {
    return { dir: 'blog', ext: '.md' };
  }
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug as string;
    const { dir: contentDir, ext: fileExtension } = getContentConfig(slug);

    const fileName = slug.split('/').pop() || 'index';
    const filePath = path.join(ROOT_DIR, 'src', 'content', contentDir, `${fileName}${fileExtension}`);

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: '内容未找到' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const contentFile: ContentFile = {
      slug: fileName,
      data,
      content,
    };

    return new Response(JSON.stringify(contentFile), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('读取内容文件时出错:', error);
    return new Response(JSON.stringify({ error: '服务器内部错误' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const slug = params.slug as string;
    const { frontmatter, content } = await request.json();
    const { dir: contentDir, ext: fileExtension } = getContentConfig(slug);

    const fileName = slug.split('/').pop() || 'index';
    const filePath = path.join(ROOT_DIR, 'src', 'content', contentDir, `${fileName}${fileExtension}`);

    const fileContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(filePath, fileContent);

    return new Response(JSON.stringify({ success: true, message: '内容已保存' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('保存内容文件时出错:', error);
    return new Response(JSON.stringify({ error: '保存失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug as string;
    const { dir: contentDir, ext: fileExtension } = getContentConfig(slug);

    const fileName = slug.split('/').pop() || 'index';
    const filePath = path.join(ROOT_DIR, 'src', 'content', contentDir, `${fileName}${fileExtension}`);

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: '内容未找到' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    fs.unlinkSync(filePath);

    return new Response(JSON.stringify({ success: true, message: '内容已删除' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('删除内容文件时出错:', error);
    return new Response(JSON.stringify({ error: '删除失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};