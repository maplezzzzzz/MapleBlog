/**
 * 智能资源预加载器
 * 根据用户行为和网络状况预加载资源
 */

export class SmartResourcePreloader {
  private resourceQueue: Array<{
    url: string;
    type: "image" | "script" | "style" | "font" | "document";
    priority: "high" | "medium" | "low";
    loaded: boolean;
  }>;
  private activePreloads: Set<string>;
  private maxConcurrent: number;
  private isOnline: boolean;

  constructor(maxConcurrent: number = 6) {
    this.resourceQueue = [];
    this.activePreloads = new Set();
    this.maxConcurrent = maxConcurrent;
    this.isOnline = navigator.onLine;

    this.init();
  }

  private init(): void {
    // 初始化网络状态监听
    this.setupNetworkListener();

    // 开始处理预加载队列
    this.processQueue();
  }

  /**
   * 设置网络状态监听
   */
  private setupNetworkListener(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  /**
   * 预加载图像资源
   */
  public preloadImage(
    url: string,
    priority: "high" | "medium" | "low" = "medium",
  ): void {
    if (!this.shouldPreloadResource(url)) return;

    this.resourceQueue.push({
      url,
      type: "image",
      priority,
      loaded: false,
    });

    // 根据优先级排序队列
    this.sortQueueByPriority();
    this.processQueue();
  }

  /**
   * 预加载脚本资源
   */
  public preloadScript(
    url: string,
    priority: "high" | "medium" | "low" = "medium",
  ): void {
    if (!this.shouldPreloadResource(url)) return;

    this.resourceQueue.push({
      url,
      type: "script",
      priority,
      loaded: false,
    });

    this.sortQueueByPriority();
    this.processQueue();
  }

  /**
   * 预加载样式资源
   */
  public preloadStylesheet(
    url: string,
    priority: "high" | "medium" | "low" = "medium",
  ): void {
    if (!this.shouldPreloadResource(url)) return;

    this.resourceQueue.push({
      url,
      type: "style",
      priority,
      loaded: false,
    });

    this.sortQueueByPriority();
    this.processQueue();
  }

  /**
   * 预加载页面资源
   */
  public preloadPage(url: string): void {
    if (!this.shouldPreloadResource(url)) return;

    // 预加载页面的HTML内容
    this.preloadDocument(url);
  }

  /**
   * 预加载文档
   */
  private preloadDocument(url: string): void {
    if (!this.shouldPreloadResource(url)) return;

    this.resourceQueue.push({
      url,
      type: "document",
      priority: "high",
      loaded: false,
    });

    this.sortQueueByPriority();
    this.processQueue();
  }

  /**
   * 根据优先级排序队列
   */
  private sortQueueByPriority(): void {
    this.resourceQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 处理预加载队列
   */
  private processQueue(): void {
    if (!this.isOnline) return;

    // 计算可启动的预加载数量
    const availableSlots = this.maxConcurrent - this.activePreloads.size;

    if (availableSlots <= 0) return;

    // 获取待处理的资源
    const pendingResources = this.resourceQueue
      .filter((item) => !item.loaded && !this.activePreloads.has(item.url))
      .slice(0, availableSlots);

    // 启动预加载
    pendingResources.forEach((item) => {
      this.loadResource(item);
    });
  }

  /**
   * 加载单个资源
   */
  private async loadResource(
    item: (typeof this.resourceQueue)[0],
  ): Promise<void> {
    if (this.activePreloads.has(item.url)) return;

    this.activePreloads.add(item.url);

    try {
      let success = false;

      switch (item.type) {
        case "image":
          success = await this.loadImage(item.url);
          break;
        case "script":
          success = await this.loadScript(item.url);
          break;
        case "style":
          success = await this.loadStylesheet(item.url);
          break;
        case "document":
          success = await this.loadDocument(item.url);
          break;
        case "font":
          success = await this.loadFont(item.url);
          break;
      }

      if (success) {
        item.loaded = true;
        // 从队列中移除已加载的资源
        const index = this.resourceQueue.findIndex(
          (res) => res.url === item.url,
        );
        if (index !== -1) {
          this.resourceQueue.splice(index, 1);
        }
      }
    } catch (error) {
      console.warn(`Failed to preload resource: ${item.url}`, error);
    } finally {
      this.activePreloads.delete(item.url);
      // 继续处理队列中的其他资源
      setTimeout(() => this.processQueue(), 100);
    }
  }

  /**
   * 加载图像
   */
  private loadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);

      // 添加超时处理
      setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, 10000); // 10秒超时

      img.src = url;
    });
  }

  /**
   * 加载脚本
   */
  private loadScript(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      // 检查是否已存在相同的脚本
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = url;
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      setTimeout(() => {
        script.onload = null;
        script.onerror = null;
        resolve(false);
      }, 15000); // 15秒超时

      document.head.appendChild(script);
    });
  }

  /**
   * 加载样式表
   */
  private loadStylesheet(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      // 检查是否已存在相同的样式表
      if (document.querySelector(`link[href="${url}"]`)) {
        resolve(true);
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;

      link.onload = () => resolve(true);
      link.onerror = () => resolve(false);

      setTimeout(() => {
        link.onload = null;
        link.onerror = null;
        resolve(false);
      }, 10000); // 10秒超时

      document.head.appendChild(link);
    });
  }

  /**
   * 加载文档内容
   */
  private async loadDocument(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/html",
          "X-Requested-With": "XMLHttpRequest",
        },
        signal: AbortSignal.timeout(10000), // 10秒超时
      });

      return response.ok;
    } catch (error) {
      console.warn(`Failed to preload document: ${url}`, error);
      return false;
    }
  }

  /**
   * 加载字体
   */
  private async loadFont(url: string): Promise<boolean> {
    try {
      // 使用 CSS Font Loading API
      if ("fonts" in document) {
        // @ts-ignore
        const font = new FontFace("preload", `url(${url})`);
        await font.load();
        // @ts-ignore
        document.fonts.add(font);
        return true;
      } else {
        // 降级处理：创建隐藏文本元素来触发字体加载
        const span = document.createElement("span");
        span.textContent = "测";
        span.style.fontFamily = `preload, sans-serif`;
        span.style.visibility = "hidden";
        span.style.position = "absolute";
        document.body.appendChild(span);

        // 等待一段时间再移除
        setTimeout(() => {
          document.body.removeChild(span);
        }, 3000);

        return true;
      }
    } catch (error) {
      console.warn(`Failed to preload font: ${url}`, error);
      return false;
    }
  }

  /**
   * 检查是否应该预加载资源
   */
  private shouldPreloadResource(url: string): boolean {
    // 检查网络状况
    if (!this.isOnline) return false;

    // 检查是否已在预加载中
    if (this.activePreloads.has(url)) return false;

    // 检查是否已在队列中
    if (this.resourceQueue.some((item) => item.url === url)) return false;

    // 检查是否为有效URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 预加载与当前页面相关的资源
   */
  public preloadCurrentPageResources(): void {
    // 预加载当前页面的关键资源
    this.preloadCriticalImages();
    this.preloadNavigationLinks();
  }

  /**
   * 预加载关键图像
   */
  private preloadCriticalImages(): void {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>("img[data-src]"),
    );
    images.forEach((img) => {
      if (img.dataset.src) {
        this.preloadImage(img.dataset.src, "high");
      }
    });
  }

  /**
   * 预加载导航链接页面
   */
  public preloadNavigationLinks(): void {
    // 预加载主要导航链接的页面
    const navLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        'nav a[href^="/"], header a[href^="/"]',
      ),
    );

    navLinks.forEach((link) => {
      if (link.href && link.origin === window.location.origin) {
        // 根据链接的相对重要性设置优先级
        const priority = this.getLinkPriority(link);
        this.preloadPage(link.href);
      }
    });
  }

  /**
   * 根据链接特性确定优先级
   */
  private getLinkPriority(link: HTMLAnchorElement): "high" | "medium" | "low" {
    // 主导航链接优先级高
    if (link.closest("nav") || link.closest("header")) {
      return "high";
    }

    // 首屏内链接优先级中等
    const rect = link.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      return "medium";
    }

    // 其他链接优先级低
    return "low";
  }

  /**
   * 销毁预加载器
   */
  public destroy(): void {
    // 清理活动的预加载
    this.activePreloads.clear();
    // 清理队列
    this.resourceQueue = [];
  }
}
