import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  try {
    const [blogPosts, pages, categories, tags] = await Promise.all([
      getCollection("blog"),
      getCollection("pages"),
      getCollection("categories"),
      getCollection("tags"),
    ]);

    const options = [
      {
        label: "基础页面",
        options: [
          { label: "首页", value: "/" },
          { label: "博客列表", value: "/blog" },
          { label: "关于", value: "/about" },
          { label: "搜索", value: "/search" },
          { label: "归档", value: "/archive" },
        ],
      },
      {
        label: "单页 (Pages)",
        options: pages.map((page) => ({
          label: page.data.title,
          value: `/${page.slug || page.id.replace(/\.md$/, "")}`,
        })),
      },
      {
        label: "分类 (Categories)",
        options: categories.map((cat) => ({
          label: cat.data.title,
          value: `/categories/${cat.slug || cat.id.replace(/\.md$/, "")}`,
        })),
      },
      {
        label: "标签 (Tags)",
        options: tags.map((tag) => ({
          label: tag.data.title,
          value: `/tags/${tag.slug || tag.id.replace(/\.md$/, "")}`,
        })),
      },
      {
        label: "最新文章",
        options: blogPosts
          .filter((p) => !p.data.draft)
          .sort((a, b) => (b.data.publishedAt?.getTime() || 0) - (a.data.publishedAt?.getTime() || 0))
          .slice(0, 10)
          .map((post) => ({
            label: post.data.title,
            value: `/blog/${post.slug || post.id.replace(/\.(md|mdx)$/, "")}`,
          })),
      },
    ];

    return new Response(JSON.stringify(options), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "获取链接选项失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
