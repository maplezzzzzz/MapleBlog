import fs from 'fs';
import path from 'path';

// 默认设置
const DEFAULT_SETTINGS = {
  site: {
    title: "小白天地",
    description: "一个记录生活感悟、分享人生体验的个人空间。",
    author: "小白",
    url: "https://example.com"
  },
  appearance: {
    theme: "auto",
    primaryColor: "#3498db"
  },
  features: {
    comments: true,
    search: true,
    darkMode: true
  },
  seo: {
    keywords: "",
    googleVerification: "",
    baiduVerification: ""
  }
};

let cachedSettings = null;
let lastReadTime = 0;
const CACHE_TTL = 60 * 1000; // 1分钟缓存

export function getSiteSettings() {
  // 仅在服务端执行
  if (typeof process === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  const now = Date.now();
  // 简单的内存缓存，避免每次请求都读硬盘
  if (cachedSettings && (now - lastReadTime < CACHE_TTL)) {
    return cachedSettings;
  }

  try {
    const settingsPath = path.join(process.cwd(), 'src', 'data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      cachedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      // 深度合并 site 对象，防止丢失默认值
      if (cachedSettings.site) {
        cachedSettings.site = { ...DEFAULT_SETTINGS.site, ...cachedSettings.site };
      }
      lastReadTime = now;
      return cachedSettings;
    }
  } catch (error) {
    console.error('Error reading settings.json:', error);
  }

  return DEFAULT_SETTINGS;
}
