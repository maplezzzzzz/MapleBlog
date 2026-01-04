import { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../..');

// 获取博客文章目录
const blogDir = path.join(ROOT_DIR, 'src', 'content', 'blog');

// 确保目录存在
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

// 处理PUT请求（更新文章）
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: '缺少文章ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const articleData = await request.json();
    
    // 验证必要字段
    if (!articleData.title || !articleData.content) {
      return new Response(
        JSON.stringify({ error: '标题和内容不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 构建文件路径
    const filePath = path.join(blogDir, `${id}.md`);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return new Response(
        JSON.stringify({ error: '文章不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 构建Markdown内容（包含frontmatter）
    const frontmatter = {
      title: articleData.title,
      description: articleData.seoDescription || '',
      publishedAt: articleData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: articleData.categories || [],
      tags: articleData.tags || [],
      featuredImg: articleData.coverImage || '',
      status: articleData.isPublished ? 'published' : 'draft',
      allowComments: articleData.allowComments !== undefined ? articleData.allowComments : true,
      seoTitle: articleData.seoTitle,
      seoDescription: articleData.seoDescription,
      seoKeywords: articleData.seoKeywords || []
    };

    // 将frontmatter转换为YAML格式
    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        } else if (typeof value === 'string' && value.includes('\n')) {
          return `${key}: |\n  ${value.replace(/\n/g, '\n  ')}`;
        } else if (typeof value === 'string' && (value.includes(': ') || value.includes('#') || value.includes('{') || value.includes('['))) {
          return `${key}: "${value}"`;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          return `${key}: ${value}`;
        } else {
          return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
        }
      })
      .join('\n');

    const markdownContent = `---
${yamlFrontmatter}
---

${articleData.content}
`;

    // 写入文件
    fs.writeFileSync(filePath, markdownContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: '文章更新成功',
        data: { id }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('更新文章时出错:', error);
    return new Response(
      JSON.stringify({ error: '更新文章失败', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 处理POST请求（创建新文章）
export const POST: APIRoute = async ({ request }) => {
  try {
    const articleData = await request.json();
    
    // 验证必要字段
    if (!articleData.title || !articleData.content) {
      return new Response(
        JSON.stringify({ error: '标题和内容不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 生成文件名（使用标题的简化版本或时间戳）
    const fileName = articleData.id || `article-${Date.now()}`;
    const filePath = path.join(blogDir, `${fileName}.md`);

    // 构建Markdown内容（包含frontmatter）
    const frontmatter = {
      title: articleData.title,
      description: articleData.seoDescription || '',
      publishedAt: articleData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: articleData.categories || [],
      tags: articleData.tags || [],
      featuredImg: articleData.coverImage || '',
      status: articleData.isPublished ? 'published' : 'draft',
      allowComments: articleData.allowComments !== undefined ? articleData.allowComments : true,
      seoTitle: articleData.seoTitle,
      seoDescription: articleData.seoDescription,
      seoKeywords: articleData.seoKeywords || []
    };

    // 将frontmatter转换为YAML格式
    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        } else if (typeof value === 'string' && value.includes('\n')) {
          return `${key}: |\n  ${value.replace(/\n/g, '\n  ')}`;
        } else if (typeof value === 'string' && (value.includes(': ') || value.includes('#') || value.includes('{') || value.includes('['))) {
          return `${key}: "${value}"`;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          return `${key}: ${value}`;
        } else {
          return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
        }
      })
      .join('\n');

    const markdownContent = `---
${yamlFrontmatter}
---

${articleData.content}
`;

    // 写入文件
    fs.writeFileSync(filePath, markdownContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: '文章创建成功',
        data: { id: fileName }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('创建文章时出错:', error);
    return new Response(
      JSON.stringify({ error: '创建文章失败', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};