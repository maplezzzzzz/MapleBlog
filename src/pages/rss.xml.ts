import { getCollection } from "astro:content";
import type { APIContext } from "astro";

// 转义 XML 特殊字符
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

// 格式化日期为 RFC 822 格式 (RSS 2.0 标准)
function formatDate(date: Date): string {
  return date.toUTCString();
}

export async function GET(context: APIContext) {
  // 获取所有已发布的博客文章
  const blog = await getCollection("blog", ({ data }) => {
    return data.draft !== true && data.status === "published";
  });

  // 按发布时间倒序排列，取最新的 25 篇文章
  const sortedPosts = blog
    .sort((a, b) => {
      const dateA = a.data.publishedAt || a.data.createdAt || new Date(0);
      const dateB = b.data.publishedAt || b.data.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 25);

  const siteUrl = context.site!.toString().replace(/\/$/, "");
  const feedUpdated =
    sortedPosts.length > 0
      ? formatDate(
          sortedPosts[0].data.publishedAt ||
            sortedPosts[0].data.createdAt ||
            new Date(),
        )
      : formatDate(new Date());

  // 构建 RSS 2.0 XML
  const rssXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>猫普的精神世界</title>
    <description>一个独立开发者的精神自留地</description>
    <link>${siteUrl}/</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${feedUpdated}</lastBuildDate>
    <pubDate>${feedUpdated}</pubDate>
    <language>zh-cn</language>
    <managingEditor>Maplezz</managingEditor>
    <webMaster>Maplezz</webMaster>
    <generator>Astro</generator>
    <ttl>60</ttl>

${sortedPosts
  .map((post) => {
    const pubDate = post.data.publishedAt || post.data.createdAt || new Date();
    const updatedDate = post.data.updatedAt || pubDate;
    const description =
      post.data.description ||
      (post.body
        ? post.body.slice(0, 200).replace(/[#*`]/g, "") + "..."
        : "暂无描述");
    const postUrl = `${siteUrl}/blog/${post.id}/`;
    const author = post.data.author || "Maplezz";

    // 处理封面图
    let imageContent = "";
    if (post.data.image && typeof post.data.image.src === "string") {
      let imageUrl = post.data.image.src;
      // 如果是相对路径，转换为绝对路径
      if (imageUrl.startsWith("@assets/")) {
        imageUrl = imageUrl.replace("@assets/", `${siteUrl}/src/assets/`);
      } else if (imageUrl.startsWith("/")) {
        imageUrl = `${siteUrl}${imageUrl}`;
      } else if (!imageUrl.startsWith("http")) {
        imageUrl = `${siteUrl}/${imageUrl}`;
      }

      imageContent = `<enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" />`;
    }

    // 处理分类
    const categories = post.data.categories?.filter(Boolean) || [];
    const categoryContent = categories
      .map((cat) => cat && `<category>${escapeXml(cat)}</category>`)
      .join("");

    return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${formatDate(pubDate)}</pubDate>
      <author>${escapeXml(author)}</author>
      <description>${escapeXml(description)}</description>
      ${imageContent}
      ${categoryContent}
    </item>`;
  })
  .join("\n\n")}

  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
