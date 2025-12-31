import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../../../../..");

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();

  try {
    // 验證必需字段
    if (!data.title || !data.slug) {
      return new Response(JSON.stringify({ error: "标题和URL路径是必需的" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // 準備 frontmatter
    const frontmatter = {
      title: data.title,
      description: data.description || "",
      status: data.status || "draft",
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: data.categories || [],
      tags: data.tags || [],
      featuredImg: data.featuredImg || data.image || "",
      author: data.author || "小白",
      views: data.views || 0,
      featured: data.featured || false,
      recommended: data.recommended || false,
      hideToc: data.hideToc || false,
      draft: data.status === "draft",
      slug: data.slug,
      publishedAt:
        data.publishedAt ||
        (data.status === "published" ? new Date().toISOString() : undefined),
    };

    // 生成文件內容
    const yaml = await import("js-yaml");
    const frontmatterYaml = yaml.dump(frontmatter);
    const content = data.content || "";
    const fileContent = `---\n${frontmatterYaml}---\n\n${content}`;

    // 確定文件路徑
    const contentDir = path.join(ROOT_DIR, "src", "content", "blog");
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    const filePath = path.join(contentDir, `${data.slug}.md`);

    // 檢查文件是否已存在
    if (fs.existsSync(filePath)) {
      return new Response(
        JSON.stringify({ error: "文章已存在，請使用其他URL路徑" }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 寫入文件
    fs.writeFileSync(filePath, fileContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: "文章創建成功",
        newArticle: {
          id: `${data.slug}.md`,
          slug: data.slug,
          title: data.title,
          description: data.description,
          status: data.status,
          categories: data.categories || [],
          tags: data.tags || [],
          createdAt: frontmatter.createdAt,
          updatedAt: frontmatter.updatedAt,
          publishedAt: frontmatter.publishedAt,
          featuredImg: data.featuredImg || data.image || "",
          draft: data.status === "draft",
          author: data.author || "小白",
          views: data.views || 0,
          featured: data.featured || false,
          recommended: data.recommended || false,
          hideToc: data.hideToc || false,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("創建文章時出錯:", error);
    return new Response(
      JSON.stringify({ error: "創建文章失敗", details: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const data = await request.json();

  try {
    // 讀取現有文件
    const contentDir = path.join(ROOT_DIR, "src", "content", "blog");
    const filePath = path.join(contentDir, id);

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: "文章未找到" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // 讀取現有內容
    const existingContent = fs.readFileSync(filePath, "utf-8");

    // 解析 frontmatter 和內容
    const { data: frontmatter, content } = matter(existingContent);

    // 更新 frontmatter
    const updatedFrontmatter = {
      ...frontmatter,
      ...data,
      updatedAt: new Date().toISOString(),
      status: data.status,
      draft: data.status === "draft",
    };

    // 生成新的內容
    const yaml = await import("js-yaml");
    const newFrontmatter = yaml.dump(updatedFrontmatter);
    const newContent = `---\n${newFrontmatter}---\n\n${data.content || content}`;

    // 寫入文件
    fs.writeFileSync(filePath, newContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: "文章更新成功",
        updatedArticle: {
          id: id,
          slug: updatedFrontmatter.slug || id.replace(/\.(md|mdx)$/, ""),
          title: updatedFrontmatter.title,
          description: updatedFrontmatter.description,
          status: updatedFrontmatter.status,
          categories: updatedFrontmatter.categories || [],
          tags: updatedFrontmatter.tags || [],
          createdAt: updatedFrontmatter.createdAt,
          updatedAt: updatedFrontmatter.updatedAt,
          publishedAt: updatedFrontmatter.publishedAt,
          featuredImg:
            updatedFrontmatter.featuredImg || updatedFrontmatter.image || "",
          draft: updatedFrontmatter.status === "draft",
          author: updatedFrontmatter.author || "小白",
          views: updatedFrontmatter.views || 0,
          featured: updatedFrontmatter.featured || false,
          recommended: updatedFrontmatter.recommended || false,
          hideToc: updatedFrontmatter.hideToc || false,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("更新文章時出錯:", error);
    return new Response(
      JSON.stringify({ error: "更新文章失敗", details: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
