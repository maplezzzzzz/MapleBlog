import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const TAGS_DIR = path.join(process.cwd(), "src", "content", "tags");

if (!fs.existsSync(TAGS_DIR)) {
  fs.mkdirSync(TAGS_DIR, { recursive: true });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { slug, title } = await request.json();
    
    if (!slug || !title) {
        return new Response(JSON.stringify({ error: "Slug 和标题必填" }), { status: 400 });
    }
    
    const filePath = path.join(TAGS_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
        return new Response(JSON.stringify({ success: true, message: "标签已存在", skipped: true }), { status: 200 });
    }
    
    const frontmatter = {
        title,
        color: "#007bff", // 默认颜色
        createdAt: new Date().toISOString()
    };
    
    const content = `---\n${yaml.dump(frontmatter)}---\n`;
    fs.writeFileSync(filePath, content);
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
