import { getCollection, getEntry } from 'astro:content';

export async function getArticleById(id) {
  try {
    // 尝试获取博客文章
    const blogCollection = await getCollection('blog');
    const blogPost = blogCollection.find(post => post.id === id || post.id === `${id}.md`);
    
    if (blogPost) {
      return {
        type: 'blog',
        ...blogPost
      };
    }
    
    // 如果没找到博客文章，可以尝试其他内容类型
    return null;
  } catch (error) {
    console.error('获取文章时出错:', error);
    return null;
  }
}