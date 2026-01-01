import { getCollection } from 'astro:content';
import { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: '缺少文章ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取博客文章
    const blogCollection = await getCollection('blog');
    const article = blogCollection.find(post => post.id === id || post.id === `${id}.md`);
    
    if (!article) {
      return new Response(
        JSON.stringify({ error: '文章未找到' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 返回文章数据
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: article.id,
          slug: article.slug,
          title: article.data.title,
          content: article.body, // 文章内容
          categories: article.data.categories || [],
          tags: article.data.tags || [],
          coverImage: article.data.featuredImg || '',
          seoTitle: article.data.seoTitle || '',
          seoDescription: article.data.seoDescription || '',
          seoKeywords: article.data.seoKeywords || [],
          allowComments: article.data.allowComments !== undefined ? article.data.allowComments : true,
          isPublished: article.data.status === 'published',
          createdAt: article.data.publishedAt || article.data.createdAt,
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('获取文章数据时出错:', error);
    return new Response(
      JSON.stringify({ error: '获取文章数据失败', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};