import { getCollection } from 'astro:content';
import { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: '缺少文章ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('尝试查找文章，ID:', id); // 调试信息

    // 获取博客文章
    const blogCollection = await getCollection('blog');
    console.log('可用文章ID:', blogCollection.map(post => post.id)); // 调试信息

    // 尝试多种匹配方式
    let article = blogCollection.find(post => post.id === id);
    if (!article) {
      article = blogCollection.find(post => post.id === `${id}.md`);
    }
    if (!article) {
      article = blogCollection.find(post => post.id.replace('.md', '') === id);
    }
    if (!article) {
      article = blogCollection.find(post => post.slug === id);
    }
    // 尝试添加 .md 后缀再匹配
    if (!article && !id.endsWith('.md')) {
      article = blogCollection.find(post => post.id === `${id}.md`);
    }
    // 尝试移除 .md 后缀再匹配
    if (!article && id.endsWith('.md')) {
      const idWithoutMd = id.replace(/\.md$/, '');
      article = blogCollection.find(post => post.id.replace('.md', '') === idWithoutMd);
    }
    // 最后尝试匹配slug
    if (!article) {
      article = blogCollection.find(post => post.slug === id);
    }
    // 如果还是没找到，尝试匹配id的其他变体
    if (!article) {
      article = blogCollection.find(post => post.id.replace(/\.md$/, '').endsWith(id));
    }
    // 再尝试一种方式：如果ID以连字符开头，可能需要特殊处理
    if (!article && id.startsWith('-')) {
      article = blogCollection.find(post => post.id.replace(/\.md$/, '') === id);
    }
    
    if (!article) {
      return new Response(
        JSON.stringify({ error: '文章未找到' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 返回文章数据，确保安全处理可能为 undefined 的值
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: article.id || '',
          slug: article.slug || '',
          title: article.data?.title || '',
          content: article.body || '', // 文章内容
          categories: article.data?.categories || [],
          tags: article.data?.tags || [],
          coverImage: article.data?.featuredImg || '',
          seoTitle: article.data?.seoTitle || '',
          seoDescription: article.data?.seoDescription || '',
          seoKeywords: article.data?.seoKeywords || [],
          allowComments: article.data?.allowComments !== undefined ? article.data.allowComments : true,
          isPublished: article.data?.status === 'published',
          createdAt: article.data?.publishedAt || article.data?.createdAt,
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