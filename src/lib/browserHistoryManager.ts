/**
 * 浏览器历史记录管理器
 * 优化前进后退按钮体验，解决卡顿问题
 */

export class BrowserHistoryManager {
  private cache: Map<string, DocumentFragment>;
  private maxCacheSize: number;
  private currentUrl: string;

  constructor(maxCacheSize: number = 20) {
    this.cache = new Map();
    this.maxCacheSize = maxCacheSize;
    this.currentUrl = window.location.href;

    this.init();
  }

  private init(): void {
    // 监听popstate事件处理前进后退
    window.addEventListener("popstate", this.handlePopState.bind(this));

    // 监听页面跳转以更新当前URL
    this.hookNavigation();

    // 监听页面可见性变化，优化缓存策略
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );
  }

  /**
   * 拦截页面跳转事件
   */
  private hookNavigation(): void {
    // 拦截链接点击事件
    document.addEventListener("click", this.handleLinkClick.bind(this));

    // 使用Intersection Observer优化预加载
    if ("IntersectionObserver" in window) {
      this.setupLinkPreloadObserver();
    }
  }

  /**
   * 处理链接点击事件
   */
  private handleLinkClick(event: Event): void {
    const target = event.target as HTMLElement;
    const link = target.closest("a");

    if (!link) return;

    const url = new URL(link.href);
    const currentUrl = new URL(window.location.href);

    // 只处理同域的内部链接
    if (url.origin === currentUrl.origin && !link.target) {
      // 预加载页面内容
      this.preloadPage(link.href);
    }
  }

  /**
   * 设置链接预加载观察器
   */
  private setupLinkPreloadObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            if (link.href) {
              this.preloadPage(link.href);
            }
          }
        });
      },
      {
        rootMargin: "100px", // 在链接进入视口100px时开始预加载
      },
    );

    // 观察页面中所有内部链接
    const internalLinks = document.querySelectorAll(
      'a[href^="/"]:not([target="_blank"])',
    );
    internalLinks.forEach((link) => {
      observer.observe(link);
    });
  }

  /**
   * 预加载页面内容
   */
  private async preloadPage(url: string): Promise<void> {
    // 避免重复预加载
    if (this.cache.has(url)) return;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/html",
          "X-Requested-With": "XMLHttpRequest", // 标识这是一个AJAX请求
        },
        signal: AbortSignal.timeout(5000), // 5秒超时
      });

      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // 提取关键内容片段
        const mainContent = doc.querySelector("main#main-content");
        const title = doc.querySelector("title")?.textContent;

        if (mainContent && title) {
          // 创建内容片段并缓存
          const fragment = document.createDocumentFragment();
          fragment.appendChild(mainContent.cloneNode(true));

          // 缓存预加载的页面内容
          this.cache.set(url, {
            fragment,
            title,
            timestamp: Date.now(),
            url,
          } as any); // 使用any避免类型错误

          // 如果缓存大小超过限制，删除最旧的条目
          if (this.cache.size > this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
          }
        }
      }
    } catch (error) {
      console.warn(`预加载页面失败: ${url}`, error);
    }
  }

  /**
   * 处理浏览器前进后退事件
   */
  private async handlePopState(event: PopStateEvent): Promise<void> {
    const targetUrl = window.location.href;

    // 检查缓存中是否有目标页面
    const cachedPage = this.cache.get(targetUrl);

    if (cachedPage) {
      // 从缓存恢复页面
      this.restorePageFromCache(cachedPage as any, targetUrl);
    } else {
      // 如果缓存中没有，执行正常页面跳转
      this.performPageNavigation(targetUrl);
    }
  }

  /**
   * 从缓存恢复页面
   */
  private restorePageFromCache(cachedPage: any, url: string): void {
    // 更新页面内容
    const currentMain = document.querySelector("main#main-content");
    if (currentMain && cachedPage.fragment) {
      // 使用更流畅的过渡动画
      currentMain.style.opacity = "0";
      currentMain.style.transition = "opacity 0.25s ease-in-out";

      // 延迟一点时间再更新内容
      setTimeout(() => {
        currentMain.replaceWith(cachedPage.fragment.cloneNode(true) as Element);

        // 更新标题
        if (cachedPage.title) {
          document.title = cachedPage.title;
        }

        // 恢复透明度
        const newMain = document.querySelector("main#main-content");
        if (newMain) {
          newMain.style.opacity = "0";
          requestAnimationFrame(() => {
            newMain.style.opacity = "1";
          });
        }

        // 更新当前URL
        this.currentUrl = url;

        // 触发页面恢复完成事件
        this.dispatchPageRestoreEvent(url);
      }, 10);
    }
  }

  /**
   * 执行页面导航
   */
  private performPageNavigation(url: string): void {
    // 显示加载状态
    const loader = document.querySelector(".page-loading") as HTMLElement;
    if (loader) {
      loader.classList.add("active");
    }

    // 执行页面跳转
    window.location.href = url;
  }

  /**
   * 处理页面可见性变化
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === "visible") {
      // 页面重新可见时，清理过期缓存
      this.clearExpiredCache();
    }
  }

  /**
   * 清理过期缓存
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    const expirationTime = 5 * 60 * 1000; // 5分钟过期时间

    for (const [url, page] of this.cache) {
      if (now - (page as any).timestamp > expirationTime) {
        this.cache.delete(url);
      }
    }
  }

  /**
   * 分发页面恢复事件
   */
  private dispatchPageRestoreEvent(url: string): void {
    const event = new CustomEvent("page-restored-from-cache", {
      detail: { url },
    });
    document.dispatchEvent(event);
  }

  /**
   * 销毁管理器实例
   */
  public destroy(): void {
    // 清理事件监听器
    window.removeEventListener("popstate", this.handlePopState.bind(this));
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );

    // 清空缓存
    this.cache.clear();
  }
}

// 页面内容缓存项接口
interface CachedPage {
  fragment: DocumentFragment;
  title: string;
  timestamp: number;
  url: string;
}
