import { slug } from "github-slugger";
import { marked } from "marked";

// 配置marked选项，支持更丰富的Markdown功能
marked.use({
  mangle: false,
  headerIds: false, // 启用标题ID，便于目录跳转
  gfm: true, // 启用GitHub风格的Markdown
  breaks: true, // 支持换行符转换为<br>
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});

// 自定义渲染器，增强功能
const renderer = new marked.Renderer();

// 自定义标题渲染，添加锚点ID
renderer.heading = function (text: string, level: number) {
  const escapedText = slug(text);
  return `<h${level} id="${escapedText}">
    <a href="#${escapedText}" class="anchor-link">${text}</a>
  </h${level}>`;
};

// 自定义代码块渲染，添加语言标识和复制按钮
renderer.code = function (code: string, language: string | undefined) {
  const validLang = language && language !== "" ? language : "text";
  return `<div class="code-block-wrapper">
    <div class="code-block-header">
      <span class="code-language">${validLang}</span>
      <button class="copy-code-btn" onclick="copyCode(this)" title="复制代码">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
    </div>
    <pre><code class="language-${validLang}">${code}</code></pre>
  </div>`;
};

// 自定义表格渲染，添加响应式样式
renderer.table = function (header: string, body: string) {
  return `<div class="table-wrapper">
    <table class="markdown-table">
      <thead>${header}</thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
};

// 自定义链接渲染，外部链接添加target="_blank"
renderer.link = function (href: string, title: string | null, text: string) {
  // 在服务端渲染时，简单判断是否为外部链接
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
  const titleAttr = title ? ` title="${title}"` : "";
  return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
};

// 自定义图片渲染，添加懒加载和响应式
renderer.image = function (href: string, title: string | null, text: string) {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<figure class="markdown-image">
    <img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="responsive-image" />
    ${text ? `<figcaption>${text}</figcaption>` : ""}
  </figure>`;
};

// 自定义引用块渲染
renderer.blockquote = function (quote: string) {
  return `<blockquote class="markdown-blockquote">${quote}</blockquote>`;
};

marked.setOptions({ renderer });

// slugify
export const slugify = (content: string) => {
  if (!content) return "";
  return slug(content.toString());
};

// markdownify
export const markdownify = async (content: string, div?: boolean) => {
  const options = { renderer };
  // 注释掉 extractImageUrls 函数调用以避免正则表达式问题
  // content = await extractImageUrls(content);
  return div
    ? marked.parse(content, options)
    : marked.parseInline(content, options);
};


// hyphen to space, uppercase only first letter in each word
export const upperHumanize = (content: string | undefined) => {
  if (!content) return "";
  return content
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/(^\w{1})|(\s{1}\w{1})/g, (match) => match.toUpperCase());
};

// hyphen to space, lowercase all letters
export const lowerHumanize = (content: string | undefined) => {
  if (!content) return "";
  return content.toLowerCase().replace(/-/g, " ");
};

// plainify
export const plainify = (content: string) => {
  const parseMarkdown = marked.parse(content);
  const filterBrackets = parseMarkdown.replace(/<\/?[^>]+(>|$)/gm, "");
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, "");
  const stripHTML = htmlEntityDecoder(filterSpaces);
  return stripHTML;
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    },
  );
  return htmlWithoutEntities;
};
