/**
 * 全局配置文件
 * 统一管理项目中的常量和配置项
 */

// 分页配置
export const PAGINATION_CONFIG = {
  BLOG_ENTRIES_PER_PAGE: 10,
  NOTES_DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE_SIZE: 8,
} as const;

export const getPageSize = (type: 'blog' | 'notes' = 'blog'): number => {
  switch (type) {
    case 'blog':
      return PAGINATION_CONFIG.BLOG_ENTRIES_PER_PAGE;
    case 'notes':
      return PAGINATION_CONFIG.NOTES_DEFAULT_PAGE_SIZE;
    default:
      return PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
  }
};

export type PageType = 'blog' | 'notes';

// 网站信息（仅包含默认值占位符）
export const SITE_INFO = {
  NAME: 'MapleBlog',
  SITE_NAME: 'Maple Blog',
  SUBNAME: '一个简单的Liquid Glass风格的静态网站系统',
  DESCRIPTION: 'Maple_CMS是一个简单的Liquid Glass风格的静态网站系统，用于快速搭建个人博客、技术分享、产品展示等网站。',
  AUTHOR: 'Maplezz',
  LOGO_IMAGE: '/favicon/logo.png',
  KEY_WORDS: '静态网站,静态网站系统,Maple_CMS',
  GOOGLE_ANALYTICS_ID: 'G-XXXXXX',
  BAIDU_ANALYTICS_ID: 'XXXXXXXXXX',
  START_DATE: '2025-07-12',
  ICP: {
    NUMBER: '备案号xxxxxx',
    URL: 'https://xxxxxxxxxx'
  }
} as const;

export const UI_CONFIG = {
  ENABLE_GLASS_EFFECT: true,
} as const;

function isProd(): boolean {
  return import.meta.env.PUBLIC_ENV === 'production';
}

export function getSiteUrl(): string {
  return isProd() ? 'https://maplezz.com' : 'http://localhost:4321';
}

export function isDevelopment(): boolean {
  return !isProd();
}
