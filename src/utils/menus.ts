import fs from 'fs';
import path from 'path';

const MENUS_FILE = path.join(process.cwd(), "src", "data", "menus.json");

export interface MenuItem {
  name: string;
  url: string;
  type?: 'internal' | 'external';
  children?: MenuItem[];
}

export interface SiteMenus {
  header: MenuItem[];
  footer: MenuItem[];
}

const DEFAULT_MENUS: SiteMenus = {
  header: [],
  footer: []
};

export function getSiteMenus(): SiteMenus {
  // 仅在服务端执行
  if (typeof process === 'undefined') {
    return DEFAULT_MENUS;
  }

  try {
    if (fs.existsSync(MENUS_FILE)) {
      const data = fs.readFileSync(MENUS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading menus:", e);
  }
  return DEFAULT_MENUS;
}
