import { getEntry, getCollection, type CollectionKey } from "astro:content";
import type { GenericEntry } from "@/types";
import { SITE_INFO } from "@lib/config";

//因为以下数据是在构建时计算出来的，所以需要在构建时获取一次，后续直接使用缓存值
let blogCount = -1;
let categoriesCount = -1;
let tagsCount = -1;
let totalWordCount = -1;

export const getIndex = async (
  collection: CollectionKey,
): Promise<GenericEntry | undefined> => {
  const index = await getEntry(collection, "-index");
  return index as GenericEntry | undefined;
};

/**
 * 获取指定集合的所有文章或动态（根据类型），并根据配置进行过滤和排序。
 *
 * @param collection 集合键（如 'blog' 或 'notes'）
 * @param sortFunction 可选的排序函数，用于对条目进行自定义排序
 * @param noIndex 是否过滤掉索引页（如 '-index' 开头的条目）
 * @param noDrafts 是否过滤掉草稿文章（包含 'draft' 字段且值为 true）
 * @returns 符合条件的文章或动态数组
 */
export const getEntries = async (
  collection: CollectionKey,
  sortFunction?: (array: any[]) => any[],
  noIndex = true,
  noDrafts = true,
): Promise<GenericEntry[]> => {
  let entries: GenericEntry[] = await getCollection(collection);
  entries = noIndex
    ? entries.filter((entry: GenericEntry) => !entry.id.match(/^-/))
    : entries;
  entries = noDrafts
    ? entries.filter(
        (entry: GenericEntry) => "draft" in entry.data && !entry.data.draft,
      )
    : entries;
  entries = sortFunction ? sortFunction(entries) : entries;
  return entries;
};

/**
 * 获取多个集合的所有文章或动态（根据类型），并根据配置进行过滤和排序。
 *
 * @param collections 集合键数组（如 ['blog', 'notes']）
 * @param sortFunction 可选的排序函数，用于对条目进行自定义排序
 * @param noIndex 是否过滤掉索引页（如 '-index' 开头的条目）
 * @param noDrafts 是否过滤掉草稿文章（包含 'draft' 字段且值为 true）
 * @returns 符合条件的文章或动态数组（所有集合的合并结果）
 */
export const getEntriesBatch = async (
  collections: CollectionKey[],
  sortFunction?: (array: any[]) => any[],
  noIndex = true,
  noDrafts = true,
): Promise<GenericEntry[]> => {
  const allCollections = await Promise.all(
    collections.map(async (collection) => {
      return await getEntries(collection, sortFunction, noIndex, noDrafts);
    }),
  );
  return allCollections.flat();
};

/**
 * 获取指定集合的所有分类或标签（根据类型），并根据配置进行过滤和排序。
 *
 * @param collection 集合键（如 'blog' 或 'notes'）
 * @param sortFunction 可选的排序函数，用于对条目进行自定义排序
 * @returns 符合条件的分类或标签数组
 */
export const getGroups = async (
  collection: CollectionKey,
  sortFunction?: (array: any[]) => any[],
): Promise<GenericEntry[]> => {
  let entries = await getEntries(collection, sortFunction, false);
  entries = entries.filter((entry: GenericEntry) => {
    const segments = entry.id.split("/");
    return segments.length === 2 && segments[1] == "-index";
  });
  return entries;
};

/**
 * 获取指定集合中指定分类或标签下的所有文章或动态（根据类型），并根据配置进行过滤和排序。
 *
 * @param collection 集合键（如 'blog' 或 'notes'）
 * @param groupSlug 分类或标签的 slug 名称（如 'game' 或 'web'）
 * @param sortFunction 可选的排序函数，用于对条目进行自定义排序
 * @returns 符合条件的文章或动态数组（在指定分类或标签下）
 */
export const getEntriesInGroup = async (
  collection: CollectionKey,
  groupSlug: string,
  sortFunction?: (array: any[]) => any[],
): Promise<GenericEntry[]> => {
  let entries = await getEntries(collection, sortFunction);
  entries = entries.filter((data: any) => {
    const segments = data.id.split("/");
    return (
      segments[0] === groupSlug &&
      segments.length > 1 &&
      segments[1] !== "-index"
    );
  });
  return entries;
};

// 获取文章总数（静态模式）
export const getBlogCount = async (): Promise<number> => {
  if (blogCount !== -1) return blogCount;
  const entries = await getEntries("blog");
  const notes = await getEntries("notes");
  blogCount = entries.length + notes.length;
  return blogCount;
};

// 获取分类总数（静态模式）- 从博客文章中提取
export const getCategoriesCount = async (): Promise<number> => {
  if (categoriesCount !== -1) return categoriesCount;
  try {
    const blogEntries = await getEntries("blog");
    const categories = new Set<string>();

    blogEntries.forEach((entry: any) => {
      // 处理 categories 数组格式
      if (entry.data.categories && Array.isArray(entry.data.categories)) {
        entry.data.categories.forEach((category: string) => {
          categories.add(category);
        });
      }
      // 处理单个 category 字段格式（向后兼容）
      if (entry.data.category) {
        categories.add(entry.data.category);
      }
    });

    categoriesCount = categories.size;
    return categoriesCount;
  } catch (error) {
    return 0;
  }
};

// 获取标签总数（静态模式）- 从博客文章中提取
export const getTagsCount = async (): Promise<number> => {
  if (tagsCount !== -1) return tagsCount;
  try {
    const blogEntries = await getEntries("blog");
    const tags = new Set<string>();

    blogEntries.forEach((entry: any) => {
      if (entry.data.tags && Array.isArray(entry.data.tags)) {
        entry.data.tags.forEach((tag: string) => {
          tags.add(tag);
        });
      }
    });

    tagsCount = tags.size;
    return tagsCount;
  } catch (error) {
    return 0;
  }
};

// 计算文本字数（中文按字符，英文按单词）
const countWords = (text: string): number => {
  if (!text) return 0;

  // 移除 Markdown 语法和 HTML 标签
  const cleanText = text
    .replace(/<[^>]*>/g, "") // 移除 HTML 标签
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 移除图片
    .replace(/\[[^\]]*\]\([^)]*\)/g, "") // 移除链接
    .replace(/#{1,6}\s/g, "") // 移除标题标记
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1") // 移除粗体斜体标记
    .replace(/\n+/g, " ") // 将换行符替换为空格
    .trim();

  if (!cleanText) return 0;

  // 分离中文字符和英文单词
  const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g) || [];
  const englishText = cleanText.replace(/[\u4e00-\u9fff]/g, " ");
  const englishWords = englishText.match(/\b[a-zA-Z]+\b/g) || [];

  return chineseChars.length + englishWords.length;
};

// 获取全站字数统计
export const getTotalWordCount = async (): Promise<string> => {
  if (totalWordCount !== -1) return totalWordCount.toString();
  try {
    const [blogEntries, notesEntries] = await Promise.all([
      getEntries("blog"),
      getEntries("notes").catch(() => []), // notes 集合可能不存在
    ]);

    let totalWords = 0;

    // 统计博客文章字数
    blogEntries.forEach((entry: any) => {
      totalWords += countWords(entry.body || "");
    });

    // 统计动态字数
    notesEntries.forEach((entry: any) => {
      totalWords += countWords(entry.body || "");
    });

    // 自动计算数字单位
    if (totalWords >= 1000000) {
      return `${(totalWords / 1000000).toFixed(1)}M`;
    } else if (totalWords >= 1000) {
      return `${(totalWords / 1000).toFixed(1)}K`;
    }
    totalWordCount = totalWords;
    return totalWordCount.toString();
  } catch (error) {
    console.error("Error calculating total word count:", error);
    return "0";
  }
};

// 计算网站运行时长（天数）
export const getSiteRunningDays = (): number => {
  try {
    const startDate = new Date(SITE_INFO.START_DATE);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysDiff);
  } catch (error) {
    console.error("Error calculating site running days:", error);
    return 0;
  }
};

// 获取所有统计数据（静态模式）
export const getSiteStats = async () => {
  const [blogCount, categoriesCount, tagsCount, totalWords] = await Promise.all(
    [getBlogCount(), getCategoriesCount(), getTagsCount(), getTotalWordCount()],
  );

  const runningDays = getSiteRunningDays();

  return {
    articles: blogCount,
    categories: categoriesCount,
    tags: tagsCount,
    totalWords: totalWords,
    runningDays: runningDays,
  };
};

// 获取包含草稿的文章（开发环境使用）
export const getEntriesWithDrafts = async (
  collection: CollectionKey,
  sortFunction?: (array: any[]) => any[],
  noIndex = true,
): Promise<GenericEntry[]> => {
  return await getEntries(collection, sortFunction, noIndex, false); // noDrafts = false
};

// 根据环境决定是否显示草稿
export const getEntriesForEnvironment = async (
  collection: CollectionKey,
  sortFunction?: (array: any[]) => any[],
  noIndex = true,
): Promise<GenericEntry[]> => {
  const isDev = import.meta.env.DEV;
  return await getEntries(collection, sortFunction, noIndex, !isDev); // 开发环境显示草稿
};
