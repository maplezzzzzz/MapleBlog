/**
 * 首屏内容优化加载器
 * 优先加载首屏关键内容，提升用户感知加载速度
 */

export class CriticalContentLoader {
  private criticalElements: HTMLElement[];
  private nonCriticalElements: HTMLElement[];
  private observer: IntersectionObserver | null;

  constructor() {
    this.criticalElements = [];
    this.nonCriticalElements = [];
    this.observer = null;

    this.init();
  }

  private init(): void {
    // 识别首屏关键元素
    this.identifyCriticalElements();

    // 优先加载关键内容
    this.loadCriticalContent();

    // 延迟加载非关键内容
    this.setupLazyLoading();
  }

  /**
   * 识别首屏关键元素
   */
  private identifyCriticalElements(): void {
    // 获取视口高度
    const viewportHeight = window.innerHeight;

    // 首屏内的关键元素选择器
    const criticalSelectors = [
      "header",
      "main#main-content > article:first-child",
      "main#main-content h1, main#main-content h2:first-of-type",
      "main#main-content .entry-header",
      ".hero-banner",
      '[data-critical="true"]',
    ];

    for (const selector of criticalSelectors) {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(selector),
      );
      elements.forEach((element) => {
        if (this.isElementInViewport(element, viewportHeight)) {
          this.criticalElements.push(element);
        }
      });
    }

    // 首屏内的图片和iframe作为关键资源
    const criticalMedia = Array.from(
      document.querySelectorAll<HTMLElement>(
        'img[data-critical="true"], iframe[data-critical="true"]',
      ),
    ).filter((el) => this.isElementInViewport(el, viewportHeight));

    this.criticalElements.push(...criticalMedia);
  }

  /**
   * 检查元素是否在视口内
   */
  private isElementInViewport(
    element: HTMLElement,
    viewportHeight: number,
  ): boolean {
    const rect = element.getBoundingClientRect();
    return rect.top < viewportHeight && rect.bottom > 0;
  }

  /**
   * 优先加载关键内容
   */
  private async loadCriticalContent(): Promise<void> {
    // 对于关键图片，立即加载
    const criticalImages = this.criticalElements.filter(
      (el) => el.tagName === "IMG" || el.tagName === "IMAGE",
    ) as HTMLImageElement[];

    for (const img of criticalImages) {
      this.loadCriticalImage(img);
    }

    // 对于包含延迟加载内容的容器，提前触发加载
    const criticalContainers = this.criticalElements.filter((el) =>
      el.hasAttribute("data-defer-content"),
    );

    for (const container of criticalContainers) {
      await this.loadDeferredContent(container);
    }
  }

  /**
   * 加载关键图片
   */
  private loadCriticalImage(img: HTMLImageElement): void {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      delete img.dataset.srcset;
    }
  }

  /**
   * 加载延迟内容
   */
  private async loadDeferredContent(container: HTMLElement): Promise<void> {
    const deferredContent = container.querySelectorAll("[data-deferred]");
    for (const element of Array.from(deferredContent)) {
      // 触发自定义事件以加载内容
      element.classList.remove("deferred");
      element.classList.add("loaded");

      // 如果是需要动态加载的内容，触发加载
      if (element.hasAttribute("data-src")) {
        await this.loadDynamicContent(element as HTMLElement);
      }
    }
  }

  /**
   * 动态加载内容
   */
  private async loadDynamicContent(element: HTMLElement): Promise<void> {
    const src = element.dataset.src;
    if (!src) return;

    try {
      // 这里可以实现从API或其他来源加载内容
      const response = await fetch(src);
      if (response.ok) {
        element.innerHTML = await response.text();
      }
    } catch (error) {
      console.error("Failed to load dynamic content:", error);
    }
  }

  /**
   * 设置非关键内容的延迟加载
   */
  private setupLazyLoading(): void {
    // 获取所有非关键元素
    this.nonCriticalElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-non-critical], img[data-src]:not([data-critical="true"])',
      ),
    ).filter((el) => !this.criticalElements.includes(el));

    // 使用Intersection Observer延迟加载非关键内容
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadNonCriticalElement(entry.target as HTMLElement);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "100px", // 在进入视口前100px开始加载
      },
    );

    this.nonCriticalElements.forEach((el) => {
      this.observer?.observe(el);
    });
  }

  /**
   * 加载非关键元素
   */
  private loadNonCriticalElement(element: HTMLElement): void {
    if (element.tagName === "IMG" || element.tagName === "IMAGE") {
      const img = element as HTMLImageElement;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        delete img.dataset.srcset;
      }
    }

    // 如果元素有延迟加载的数据属性，则加载内容
    if (element.dataset.src) {
      this.loadDynamicContent(element);
    }
  }

  /**
   * 销毁加载器
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
