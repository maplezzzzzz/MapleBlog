// src/pages/admin/api/content-list.json.ts
import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../..');

interface ContentItem {
  slug: string;
  title: string;
  description?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  category?: string;
  tags?: string[];
  type: string;
  contentPreview?: string;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const contentType = url.searchParams.get('type') || 'all';
    const results: ContentItem[] = [];

    // 确定要搜索的目录
    let contentDirs = ['blog', 'pages', 'notes', 'about'];
    
    if (contentType !== 'all') {
      contentDirs = [contentType];
    }

    for (const dir of contentDirs) {
      const contentPath = path.join(ROOT_DIR, 'src', 'content', dir);
      
      if (fs.existsSync(contentPath)) {
        // 使用glob匹配所有md和mdx文件
        const pattern = path.join(contentPath, '**/*.{md,mdx}');
        const files = glob.sync(pattern);
        
        for (const file of files) {
          try {
            const fileContent = fs.readFileSync(file, 'utf-8');
            const { data, content } = matter(fileContent);
            
            // 提取文件名作为slug
            const relativePath = path.relative(contentPath, file);
            const slug = relativePath.replace(/\.(md|mdx)$/, '');
            
            // 限制内容预览长度
            const contentPreview = content.length > 200 ? content.substring(0, 200) + '...' : content;
            
            results.push({
              slug: `${dir}/${slug}`,
              title: data.title || '未命名',
              description: data.description,
              status: data.status || data.draft ? 'draft' : 'published',
              createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
              updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
              category: data.category || (Array.isArray(data.categories) ? data.categories[0] : undefined),
              tags: data.tags || [],
              type: dir,
              contentPreview
            });
          } catch (e) {
            console.error(`Error processing file ${file}:`, e);
          }
        }
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('获取内容列表时出错:', error);
    return new Response(JSON.stringify({ error: '服务器内部错误' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};