import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 使用 process.cwd() 获取项目根目录，这比相对路径回溯更可靠
const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, "src", "content", "blog");

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, ids } = body;

    console.log(`[Batch API] 收到请求: action=${action}, ids=${JSON.stringify(ids)}`);
    console.log(`[Batch API] 内容目录: ${CONTENT_DIR}`);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: "没有选择任何文章" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      console.log(`[Batch API] 正在处理 ID: ${id}`);
      
      let targetFilePath = null;
      
      // 1. 尝试直接拼接 (如果 ID 包含 .md/.mdx)
      const directPath = path.join(CONTENT_DIR, id);
      if (fs.existsSync(directPath)) {
        targetFilePath = directPath;
        console.log(`[Batch API] 找到文件 (直接匹配): ${targetFilePath}`);
      } 
      // 2. 尝试添加 .md
      else if (fs.existsSync(path.join(CONTENT_DIR, `${id}.md`))) {
        targetFilePath = path.join(CONTENT_DIR, `${id}.md`);
        console.log(`[Batch API] 找到文件 (添加 .md): ${targetFilePath}`);
      }
      // 3. 尝试添加 .mdx
      else if (fs.existsSync(path.join(CONTENT_DIR, `${id}.mdx`))) {
        targetFilePath = path.join(CONTENT_DIR, `${id}.mdx`);
        console.log(`[Batch API] 找到文件 (添加 .mdx): ${targetFilePath}`);
      }
      // 4. 尝试去除后缀后再匹配
      else {
        const cleanId = id.replace(/\.(md|mdx)$/, '');
        if (fs.existsSync(path.join(CONTENT_DIR, `${cleanId}.md`))) {
           targetFilePath = path.join(CONTENT_DIR, `${cleanId}.md`);
           console.log(`[Batch API] 找到文件 (去除后缀+md): ${targetFilePath}`);
        } else if (fs.existsSync(path.join(CONTENT_DIR, `${cleanId}.mdx`))) {
           targetFilePath = path.join(CONTENT_DIR, `${cleanId}.mdx`);
           console.log(`[Batch API] 找到文件 (去除后缀+mdx): ${targetFilePath}`);
        }
      }

      if (!targetFilePath) {
        console.error(`[Batch API] 文件未找到，ID: ${id}`);
        // 列出目录下的文件帮助调试
        try {
            const files = fs.readdirSync(CONTENT_DIR);
            console.log(`[Batch API] 目录下现有文件: ${files.slice(0, 10).join(', ')}...`);
        } catch (e) {
            console.error(`[Batch API] 无法读取目录: ${e.message}`);
        }
        
        errors.push({ id, error: "文件未找到" });
        continue;
      }

      try {
        if (action === "delete") {
          fs.unlinkSync(targetFilePath);
          console.log(`[Batch API] 删除成功: ${targetFilePath}`);
          results.push({ id, status: "deleted" });
        } else if (action === "unpublish") {
          const fileContent = fs.readFileSync(targetFilePath, "utf-8");
          const { data: frontmatter, content } = matter(fileContent);

          const updatedFrontmatter = {
            ...frontmatter,
            status: "draft",
            draft: true,
            updatedAt: new Date().toISOString(),
          };

          const newFrontmatter = yaml.dump(updatedFrontmatter);
          const newFileContent = `---\n${newFrontmatter}---\n\n${content}`;

          fs.writeFileSync(targetFilePath, newFileContent);
          console.log(`[Batch API] 取消发布成功: ${targetFilePath}`);
          results.push({ id, status: "unpublished" });
        } else if (action === "publish") {
          const fileContent = fs.readFileSync(targetFilePath, "utf-8");
          const { data: frontmatter, content } = matter(fileContent);

          const updatedFrontmatter = {
            ...frontmatter,
            status: "published",
            draft: false,
            updatedAt: new Date().toISOString(),
            publishedAt: frontmatter.publishedAt || new Date().toISOString(),
          };

          const newFrontmatter = yaml.dump(updatedFrontmatter);
          const newFileContent = `---\n${newFrontmatter}---\n\n${content}`;

          fs.writeFileSync(targetFilePath, newFileContent);
          console.log(`[Batch API] 发布成功: ${targetFilePath}`);
          results.push({ id, status: "published" });
        } else {
          errors.push({ id, error: "无效的操作" });
        }
      } catch (err) {
        console.error(`[Batch API] 操作失败 ${id}:`, err);
        errors.push({ id, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0, // 只有没有错误才算完全成功
        message: `操作完成: 成功 ${results.length}, 失败 ${errors.length}`,
        results,
        errors,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Batch API] 全局错误:", error);
    return new Response(
      JSON.stringify({ error: "服务器内部错误", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
