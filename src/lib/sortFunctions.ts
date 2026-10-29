import type { GenericEntry } from "@/types";

// Sort by date
export const sortByDate = (entries: GenericEntry[]): GenericEntry[] => {
  const sortedEntries = entries.sort(
    (a: any, b: any) =>
      new Date(b.data.createdAt && b.data.createdAt).valueOf() -
      new Date(a.data.createdAt && a.data.createdAt).valueOf(),
  );
  return sortedEntries;
};

// Blog lists use publication time, falling back to creation time.
export const sortBlogByDate = <T extends { id: string; data: { publishedAt?: Date; createdAt?: Date } }>(entries: T[]): T[] => {
  const time = (entry: T) => {
    const date = entry.data.publishedAt ?? entry.data.createdAt;
    const value = date?.getTime();
    return value !== undefined && Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
  };
  return entries.sort((a, b) => {
    const aTime = time(a);
    const bTime = time(b);
    if (aTime !== bTime) return aTime > bTime ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
};

//sort by update
export const sortByUpdate = (entries: GenericEntry[]): GenericEntry[] => {
  const sortedEntries = entries.sort(
    (a: any, b: any) =>
      new Date(b.data.updatedAt && b.data.updatedAt).valueOf() -
      new Date(a.data.updatedAt && a.data.updatedAt).valueOf(),
  );
  return sortedEntries;
};

// Sort by title
export const sortByTitle = (entries: GenericEntry[]): GenericEntry[] => {
  const sortedEntries = entries.sort((a: any, b: any) =>
    a.data.title.localeCompare(b.data.title),
  );
  return sortedEntries;
};

// Sort by random
export const sortByRandom = (entries: GenericEntry[]): GenericEntry[] => {
  const sortedEntries = entries.sort(() => Math.random() - 0.5);
  return sortedEntries;
};
