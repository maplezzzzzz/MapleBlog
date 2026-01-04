import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const blogPosts = await getCollection("blog");

    const posts = blogPosts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      status: post.data.status || "draft",
      categories: post.data.categories || [],
      tags: post.data.tags || [],
      createdAt: post.data.createdAt,
      updatedAt: post.data.updatedAt,
      publishedAt: post.data.publishedAt,
      featuredImg: post.data.featuredImg,
      draft: post.data.draft || false,
    }));

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("获取文章列表时出错:", error);
    return new Response(JSON.stringify({ error: "获取文章列表失败" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
