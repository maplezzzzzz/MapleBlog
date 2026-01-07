import fs from 'fs';
import path from 'path';

const MENUS_FILE = path.join(process.cwd(), "src", "data", "menus.json");

export interface MenuItem {
  name: string;
  url: string;
  type?: 'internal' | 'external';
  children?: MenuItem[];
}

export interface FooterInfo {
  copyrightName?: string;
  copyrightUrl?: string;
  beianText?: string;
  beianUrl?: string;
}

export interface SiteMenus {
  header: MenuItem[];
  footer: MenuItem[];
  footerInfo?: FooterInfo;
}

const DEFAULT_MENUS: SiteMenus = {
  header: [],
  footer: [],
  footerInfo: {
    copyrightName: "小白之家",
    copyrightUrl: "/",
    beianText: "备案中",
    beianUrl: "#"
  }
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
