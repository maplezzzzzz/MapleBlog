import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const PAGES_DIR = path.join(process.cwd(), "src", "content", "pages");

// 确保目录存在
if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { title, slug } = await request.json();
    
    if (!title || !slug) {
        return new Response(JSON.stringify({ error: "标题和路径必填" }), { status: 400 });
    }
    
    // 清理 slug (移除开头的 /)
    const cleanSlug = slug.replace(/^\//, '');
    const filePath = path.join(PAGES_DIR, `${cleanSlug}.md`);
    
    if (fs.existsSync(filePath)) {
        // 幂等性：如果页面已存在，视为成功，但不覆盖
        return new Response(JSON.stringify({ success: true, message: "页面已存在", skipped: true }), { status: 200 });
    }
    
    const frontmatter = {
        title,
        layout: "page", // 默认布局
        createdAt: new Date().toISOString()
    };
    
    const content = `---\n${yaml.dump(frontmatter)}---\n\n# ${title}\n\n这是自动创建的新页面，请在后台编辑内容。`;
    fs.writeFileSync(filePath, content);
    
    return new Response(JSON.stringify({ success: true, message: "页面创建成功" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
