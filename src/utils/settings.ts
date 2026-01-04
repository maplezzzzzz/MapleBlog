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

export function getSiteSettings() {
  // 仅在服务端执行
  if (typeof process === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const settingsPath = path.join(process.cwd(), 'src', 'data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data);
      // 深度合并 site 对象，防止丢失默认值
      return { 
          ...DEFAULT_SETTINGS, 
          ...settings,
          site: { ...DEFAULT_SETTINGS.site, ...(settings.site || {}) },
          appearance: { ...DEFAULT_SETTINGS.appearance, ...(settings.appearance || {}) },
          features: { ...DEFAULT_SETTINGS.features, ...(settings.features || {}) },
          seo: { ...DEFAULT_SETTINGS.seo, ...(settings.seo || {}) }
      };
    }
  } catch (error) {
    console.error('Error reading settings.json:', error);
  }

  return DEFAULT_SETTINGS;
}
