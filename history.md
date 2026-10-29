# 更新日志

所有功能增强、问题修复和重要变更都会记录在此文件中。

---

## 2026-04-30

### 安全修复

- **RecentComments XSS 修复**：将评论列表的 `innerHTML` 字符串拼接改为 `createElement` + `textContent`/`setAttribute` 安全构造，新增 `sanitizeUrl()` 对所有 `href`/`src` 做协议白名单校验（仅允许 `http:`/`https:`），对 `avatar`、`nick`、`url`、`comment` 等字段全部做 `textContent` 写入，从根本上杜绝 DOM 型 XSS。
- **FriendLinks XSS 修复**：同样将 `createFriendLinkCard()` 从模板字符串改为纯 DOM API，新增 `sanitizeUrl()` 协议校验，移除所有 `innerHTML` 注入。
- **Comment 组件 `showError` 修复**：将错误提示的 `innerHTML` 注入改为 `createElement` + `textContent`，防止错误信息本身被当作 HTML 解析。

### 配置统一

- **站点 URL 单一来源**：将 `src/lib/config.ts` 的 `getSiteUrl()` 确立为所有页面（`BaseLayout`、`sitemap.xml`、`sitemap-index.xml`、`astro.config.mjs`）的唯一 URL 来源，不再分散在多个文件里。
- **生产构建判断统一**：`astro.config.mjs` 和 `config.ts` 的生产判断统一使用 `PUBLIC_ENV === 'production'`，与 `.env` 配置保持一致。
- **`og:title` 空值修复**：`BaseLayout` 中 `og:title`/`twitter:title` 在没有传入 `metaTitle` 时会使用站点名和副标题兜底，不再产生空白 meta 标签。

### 路由与内容修复

- **`-index` 路由清理**：所有 `getStaticPaths` 和 `getCollection` 调用统一加上 `filePath?.endsWith('-index.md')` 过滤，防止 `-index.md` 哨兵文件被当作正式内容页面生成到 `dist` 中，涉 及 `blog/[entry].astro`、`page/[slug].astro`、`notes/[slug].astro`、`rss.xml.ts`、`notes/tags/[slug].astro`。
- **RSS `-index` 清理**：`rss.xml.ts` 同样排除 `-index.md` 文件，避免 RSS 种子中混入非内容条目。
- **分类逻辑重写**：将 `categories.toString()` 改为正确的数组展开（`Array.forEach`），多分类文章现在会被正确归入各自分类，不再生成 `A,B` 这样的伪分类 slug；统计和分页逻辑同步修复，涉及 `categories/index.astro`、`categories/[slug].astro`、`categories/[slug]/[page].astro`。
- **notes rewrite URL 修正**：`notes/tags/[slug].astro` 的 rewrite 目标补上了尾部斜杠，解决 `og:url` 与实际 URL 不一致导致的 SEO 问题。

### 调试日志清理

- 移除所有构建期的 `console.log` 调试语句，涉及 `blog-articles.json.ts`、`search.astro`、`notes/index.astro`、`notes/tags/[slug]/[page].astro`、`blog/[page].astro`、`blog/categories/[slug].astro`、`CollectionLayout.astro`、`TableOfContents.astro`、`textConverter.ts`、`toast-demo.astro`。
- 保留 `console.error`（仅在 `catch` 块中、表示真实异常），移除 `console.warn`（如 `KaTeX rendering failed` 降级为静默）。
- 移除 `console.error` 中的中文字符串和 emoji（如 `❌`），统一为英文。

### 文档更新

- `README.md` 更新生产构建说明，推荐使用 `npm run build:prod`，并说明 `PUBLIC_ENV=production` 的必要性。
