import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import matter from "gray-matter";

const ABOUT_FILE = path.join(process.cwd(), "src", "content", "pages", "about.md");

export const GET: APIRoute = async () => {
  try {
    if (!fs.existsSync(ABOUT_FILE)) {
      return new Response(JSON.stringify({ content: "" }), { status: 200 });
    }
    const fileContent = fs.readFileSync(ABOUT_FILE, "utf-8");
    const { content } = matter(fileContent);
    return new Response(JSON.stringify({ content }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "读取失败" }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { content } = await request.json();
    
    let frontmatter = {
        title: "关于",
        layout: "page",
        createdAt: new Date().toISOString()
    };

    // 如果文件存在，保留原有 frontmatter
    if (fs.existsSync(ABOUT_FILE)) {
        const existingFile = fs.readFileSync(ABOUT_FILE, "utf-8");
        const { data } = matter(existingFile);
        frontmatter = { ...frontmatter, ...data };
    }

    const newFileContent = `---\n${yaml.dump(frontmatter)}---\n\n${content}`;
    fs.writeFileSync(ABOUT_FILE, newFileContent);
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "保存失败" }), { status: 500 });
  }
};
