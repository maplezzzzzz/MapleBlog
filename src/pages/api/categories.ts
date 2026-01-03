import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import matter from "gray-matter";

const CATEGORIES_DIR = path.join(process.cwd(), "src", "content", "categories");

// 确保目录存在
if (!fs.existsSync(CATEGORIES_DIR)) {
  fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { slug, title, description, color, icon } = data;
    
    if (!slug || !title) {
        return new Response(JSON.stringify({ error: "Slug 和标题必填" }), { status: 400 });
    }
    
    const filePath = path.join(CATEGORIES_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
        return new Response(JSON.stringify({ error: "分类 Slug 已存在" }), { status: 409 });
    }
    
    const frontmatter = {
        title,
        description,
        color,
        icon,
        createdAt: new Date().toISOString()
    };
    
    const content = `---\n${yaml.dump(frontmatter)}---\n`;
    fs.writeFileSync(filePath, content);
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { id, title, description, color, icon } = data;
    
    // id 可能是 "tech.md"
    const filePath = path.join(CATEGORIES_DIR, id);
    if (!fs.existsSync(filePath)) {
        return new Response(JSON.stringify({ error: "分类未找到" }), { status: 404 });
    }
    
    // 读取现有内容以保留其他字段
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: existingData, content } = matter(fileContent);
    
    const updatedFrontmatter = {
        ...existingData,
        title,
        description,
        color,
        icon,
        updatedAt: new Date().toISOString()
    };
    
    const newContent = `---\n${yaml.dump(updatedFrontmatter)}---\n${content}`;
    fs.writeFileSync(filePath, newContent);
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    const filePath = path.join(CATEGORIES_DIR, id);
    
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: "文件不存在" }), { status: 404 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
