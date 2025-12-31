import { getEntries } from "./contentParser";
import { slugify } from "./textConverter";
import type { CollectionKey } from "astro:content";

export const getTaxa = async (collection: CollectionKey, name: string) => {
  const entries = await getEntries(collection);
  const taxonomyPages = entries.map((entry: any) => entry.data[name]);
  let taxonomies: string[] = [];
  for (let i = 0; i < taxonomyPages.length; i++) {
    const categoryArray = taxonomyPages[i];
    if (categoryArray && Array.isArray(categoryArray)) {
      for (let j = 0; j < categoryArray.length; j++) {
        taxonomies.push(slugify(categoryArray[j]));
      }
    }
  }
  const taxonomy = [...new Set(taxonomies)];
  taxonomy.sort((a, b) => a.localeCompare(b)); // alphabetize
  return taxonomy;
};

export const getTaxaMultiset = async (
  collection: CollectionKey,
  name: string,
) => {
  const entries = await getEntries(collection);
  const taxonomyPages = entries.map((entry: any) => entry.data[name]);
  let taxonomies: string[] = [];
  for (let i = 0; i < taxonomyPages.length; i++) {
    const categoryArray = taxonomyPages[i];
    if (categoryArray && Array.isArray(categoryArray)) {
      for (let j = 0; j < categoryArray.length; j++) {
        taxonomies.push(slugify(categoryArray[j]));
      }
    }
  }
  return taxonomies;
};

// 获取分类统计数据（包含文章数量）
export const getTaxaWithCount = async (
  collection: CollectionKey,
  name: string,
) => {
  const entries = await getEntries(collection);
  const taxonomyStats = new Map<string, number>();

  entries.forEach((entry: any) => {
    const taxonomyValue = entry.data[name];
    if (taxonomyValue) {
      if (Array.isArray(taxonomyValue)) {
        // 处理数组格式的分类/标签
        taxonomyValue.forEach((item: string) => {
          const key = item.toString();
          taxonomyStats.set(key, (taxonomyStats.get(key) || 0) + 1);
        });
      } else {
        // 处理单个分类格式
        const key = taxonomyValue.toString();
        taxonomyStats.set(key, (taxonomyStats.get(key) || 0) + 1);
      }
    }
  });

  return Array.from(taxonomyStats.entries())
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
