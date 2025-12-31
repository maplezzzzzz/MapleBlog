/**
 * 将TypeScript代码转换为JavaScript并整合到页面中
 */

// 浏览器历史记录管理器（JavaScript版本）
class BrowserHistoryManager {
  constructor(maxCacheSize = 20) {
    this.cache = new Map();
    this.maxCacheSize = maxCacheSize;
    this.currentUrl = window.location.href;

    this.init();
  }

  init() {
    // 监听popstate事件处理前进后退
    window.addEventListener("popstate", this.handlePopState.bind(this));

    // 拦截链接点击事件以优化预加载
    document.addEventListener("click", this.handleLinkClick.bind(this));

    // 监听页面可见性变化，优化缓存策略
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );
  }

  handleLinkClick(event) {
    const target = event.target;
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

  async preloadPage(url) {
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
          });

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

  async handlePopState(event) {
    const targetUrl = window.location.href;

    // 检查缓存中是否有目标页面
    const cachedPage = this.cache.get(targetUrl);

    if (cachedPage) {
      // 从缓存恢复页面
      this.restorePageFromCache(cachedPage, targetUrl);
    } else {
      // 如果缓存中没有，执行正常页面跳转
      this.performPageNavigation(targetUrl);
    }
  }

  restorePageFromCache(cachedPage, url) {
    // 更新页面内容
    const currentMain = document.querySelector("main#main-content");
    if (currentMain && cachedPage.fragment) {
      // 使用更流畅的过渡动画
      currentMain.style.opacity = "0";
      currentMain.style.transition = "opacity 0.25s ease-in-out";

      // 延迟一点时间再更新内容
      setTimeout(() => {
        currentMain.replaceWith(cachedPage.fragment.cloneNode(true));

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

  performPageNavigation(url) {
    // 显示加载状态
    const loader = document.querySelector(".page-loading");
    if (loader) {
      loader.classList.add("active");
    }

    // 执行页面跳转
    window.location.href = url;
  }

  handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      // 页面重新可见时，清理过期缓存
      this.clearExpiredCache();
    }
  }

  clearExpiredCache() {
    const now = Date.now();
    const expirationTime = 5 * 60 * 1000; // 5分钟过期时间

    for (const [url, page] of this.cache) {
      if (now - page.timestamp > expirationTime) {
        this.cache.delete(url);
      }
    }
  }

  dispatchPageRestoreEvent(url) {
    const event = new CustomEvent("page-restored-from-cache", {
      detail: { url },
    });
    document.dispatchEvent(event);
  }

  destroy() {
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

// 页面过渡管理器 - 增强版（JavaScript版本）
class PageTransitionManager {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 300,
      easing: options.easing || "ease",
      showLoader: options.showLoader !== false,
      loaderDelay: options.loaderDelay || 150,
      cacheEnabled: options.cacheEnabled !== false,
    };
    this.cache = new Map();
    this.isLoading = false;
    this.abortController = null;

    this.init();
  }

  init() {
    // 监听页面跳转事件
    this.hookNavigationEvents();

    // 监听页面加载完成事件
    this.hookPageLoadEvents();
  }

  hookNavigationEvents() {
    // 拦截所有链接点击事件
    document.addEventListener("click", this.handleLinkClick.bind(this));

    // 监听表单提交事件
    document.addEventListener("submit", this.handleFormSubmit.bind(this));

    // 监视浏览器前进后退按钮 - 这个由BrowserHistoryManager处理
  }

  hookPageLoadEvents() {
    // Astro页面加载事件
    document.addEventListener(
      "astro:before-preparation",
      this.handleBeforePreparation.bind(this),
    );
    document.addEventListener(
      "astro:page-load",
      this.handlePageLoadComplete.bind(this),
    );
  }

  handleLinkClick(event) {
    const target = event.target;
    const link = target.closest("a");

    if (!link) return;

    const url = new URL(link.href);
    const currentUrl = new URL(window.location.href);

    // 检查是否是外部链接或特殊链接
    if (url.origin !== currentUrl.origin) return;
    if (link.target === "_blank") return;
    if (link.href.startsWith("mailto:") || link.href.startsWith("tel:")) return;
    if (link.getAttribute("href")?.startsWith("#")) return;

    // 如果是相同路径但不同hash，则不执行页面过渡
    if (url.pathname === currentUrl.pathname) {
      if (url.hash) {
        event.preventDefault();
        // 平滑滚动到目标元素
        this.smoothScrollToTarget(url.hash);
      }
      return;
    }

    // 执行平滑过渡
    event.preventDefault();
    this.navigateTo(link.href);
  }

  handleFormSubmit(event) {
    const form = event.target;
    if (form && form.method.toLowerCase() === "get") {
      this.isLoading = true;
      if (this.options.showLoader) {
        this.showLoader();
      }
    }
  }

  handleBeforePreparation(event) {
    this.isLoading = true;
    if (this.options.showLoader) {
      // 使用延迟避免不必要的闪烁
      setTimeout(() => {
        if (this.isLoading) {
          this.showLoader();
        }
      }, this.options.loaderDelay);
    }
  }

  handlePageLoadComplete(event) {
    this.isLoading = false;
    if (this.options.showLoader) {
      this.hideLoader();
    }

    // 触发过渡完成事件
    this.dispatchTransitionCompleteEvent();
  }

  async navigateTo(url) {
    // 显示加载状态
    this.isLoading = true;
    if (this.options.showLoader) {
      // 延迟显示loader以避免快速跳转的闪烁
      setTimeout(() => {
        if (this.isLoading) {
          this.showLoader();
        }
      }, this.options.loaderDelay);
    }

    // 执行页面过渡
    await this.performSmoothTransition(url);
  }

  async performSmoothTransition(url) {
    return new Promise((resolve) => {
      // 更新浏览器历史记录
      history.pushState({}, "", url);

      // 发起页面请求
      this.abortController = new AbortController();

      fetch(url, {
        signal: this.abortController.signal,
      })
        .then((response) => response.text())
        .then((html) => {
          // 解析新的HTML内容
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // 提取关键内容部分
          const newMain = doc.querySelector("main#main-content");
          const newTitle = doc.querySelector("title");

          if (newMain && newTitle) {
            // 执行过渡动画
            this.executeTransitionAnimation(
              newMain,
              newTitle.textContent || "",
            );

            // 更新页面内容
            const currentMain = document.querySelector("main#main-content");
            if (currentMain) {
              currentMain.replaceWith(newMain);
            }

            // 更新标题
            document.title = newTitle.textContent || "";

            // 更新元数据
            this.updateMetaTags(doc);

            // 完成过渡
            this.onTransitionComplete(resolve);
          } else {
            // 如果无法解析内容，执行完整页面刷新
            window.location.href = url;
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("页面加载失败:", error);
            // 出错时执行完整页面跳转
            window.location.href = url;
          }
        });
    });
  }

  executeTransitionAnimation(newMain) {
    const currentMain = document.querySelector("main#main-content");
    if (!currentMain) return;

    // 应用过渡样式
    currentMain.style.position = "relative";
    currentMain.style.zIndex = "1";
    currentMain.style.opacity = "1";
    currentMain.style.transition = `opacity ${this.options.duration}ms ${this.options.easing}, transform ${this.options.duration}ms ${this.options.easing}`;

    // 淡出当前内容
    currentMain.style.opacity = "0";
    currentMain.style.transform = "translateY(10px)";

    // 在动画结束后应用新内容
    setTimeout(() => {
      // 将新内容淡入
      newMain.style.position = "relative";
      newMain.style.zIndex = "1";
      newMain.style.opacity = "0";
      newMain.style.transform = "translateY(-10px)";
      newMain.style.transition = `opacity ${this.options.duration}ms ${this.options.easing}, transform ${this.options.duration}ms ${this.options.easing}`;

      // 确保DOM更新后再执行动画
      requestAnimationFrame(() => {
        newMain.style.opacity = "1";
        newMain.style.transform = "translateY(0)";
      });
    }, this.options.duration / 2);
  }

  onTransitionComplete(callback) {
    // 延迟一小段时间以确保动画完全结束
    setTimeout(() => {
      this.isLoading = false;
      if (this.options.showLoader) {
        this.hideLoader();
      }
      this.dispatchTransitionCompleteEvent();
      callback();
    }, this.options.duration / 2);
  }

  dispatchTransitionCompleteEvent() {
    const event = new CustomEvent("page-transition-complete", {
      detail: { url: window.location.href },
    });
    document.dispatchEvent(event);
  }

  updateMetaTags(newDoc) {
    // 更新描述
    const newDescription = newDoc.querySelector('meta[name="description"]');
    if (newDescription) {
      const currentDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (currentDescription) {
        currentDescription.setAttribute(
          "content",
          newDescription.getAttribute("content"),
        );
      } else {
        document.head.appendChild(newDescription.cloneNode(true));
      }
    }

    // 更新Open Graph标签
    const ogTags = newDoc.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach((tag) => {
      const prop = tag.getAttribute("property");
      if (prop) {
        const currentTag = document.querySelector(`meta[property="${prop}"]`);
        if (currentTag) {
          currentTag.setAttribute("content", tag.getAttribute("content"));
        } else {
          document.head.appendChild(tag.cloneNode(true));
        }
      }
    });

    // 更新Twitter Card标签
    const twitterTags = newDoc.querySelectorAll('meta[name^="twitter:"]');
    twitterTags.forEach((tag) => {
      const name = tag.getAttribute("name");
      if (name) {
        const currentTag = document.querySelector(`meta[name="${name}"]`);
        if (currentTag) {
          currentTag.setAttribute("content", tag.getAttribute("content"));
        } else {
          document.head.appendChild(tag.cloneNode(true));
        }
      }
    });
  }

  showLoader() {
    const loader = document.querySelector(".page-loading");
    if (loader) {
      // 随机加载文本
      const texts = [
        "✨ 魔法正在施展中...",
        "🌈 彩虹桥搭建中...",
        "🎨 创意正在迸发...",
        "🚀 即将起飞...",
        "💫 星辰大海等你来...",
        "🌹 精彩内容准备中...",
        "🌟 闪亮登场倒计时...",
      ];
      const textElement = loader.querySelector("#loading-text");
      if (textElement) {
        textElement.textContent =
          texts[Math.floor(Math.random() * texts.length)];
      }

      // 延迟显示，避免快速跳转的闪烁
      setTimeout(() => {
        if (this.isLoading) {
          loader.classList.add("active");
        }
      }, 50);
    }
  }

  hideLoader() {
    const loader = document.querySelector(".page-loading");
    if (loader) {
      loader.classList.remove("active");
    }
  }

  smoothScrollToTarget(hash) {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  destroy() {
    if (this.abortController) {
      this.abortController.abort();
    }

    // 移除事件监听器
    document.removeEventListener("click", this.handleLinkClick.bind(this));
    document.removeEventListener("submit", this.handleFormSubmit.bind(this));
    document.removeEventListener(
      "astro:before-preparation",
      this.handleBeforePreparation.bind(this),
    );
    document.removeEventListener(
      "astro:page-load",
      this.handlePageLoadComplete.bind(this),
    );
  }
}

// 关键内容加载器（JavaScript版本）
class CriticalContentLoader {
  constructor() {
    this.criticalElements = [];
    this.nonCriticalElements = [];
    this.observer = null;

    this.init();
  }

  init() {
    // 识别首屏关键元素
    this.identifyCriticalElements();

    // 优先加载关键内容
    this.loadCriticalContent();

    // 延迟加载非关键内容
    this.setupLazyLoading();
  }

  identifyCriticalElements() {
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
      const elements = Array.from(document.querySelectorAll(selector));
      elements.forEach((element) => {
        if (this.isElementInViewport(element, viewportHeight)) {
          this.criticalElements.push(element);
        }
      });
    }

    // 首屏内的图片和iframe作为关键资源
    const criticalMedia = Array.from(
      document.querySelectorAll(
        'img[data-critical="true"], iframe[data-critical="true"]',
      ),
    ).filter((el) => this.isElementInViewport(el, viewportHeight));

    this.criticalElements.push(...criticalMedia);
  }

  isElementInViewport(element, viewportHeight) {
    const rect = element.getBoundingClientRect();
    return rect.top < viewportHeight && rect.bottom > 0;
  }

  async loadCriticalContent() {
    // 对于关键图片，立即加载
    const criticalImages = this.criticalElements.filter(
      (el) => el.tagName === "IMG" || el.tagName === "IMAGE",
    );

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

  loadCriticalImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      delete img.dataset.srcset;
    }
  }

  async loadDeferredContent(container) {
    const deferredContent = container.querySelectorAll("[data-deferred]");
    for (const element of Array.from(deferredContent)) {
      // 触发自定义事件以加载内容
      element.classList.remove("deferred");
      element.classList.add("loaded");

      // 如果是需要动态加载的内容，触发加载
      if (element.hasAttribute("data-src")) {
        await this.loadDynamicContent(element);
      }
    }
  }

  async loadDynamicContent(element) {
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

  setupLazyLoading() {
    // 获取所有非关键元素
    this.nonCriticalElements = Array.from(
      document.querySelectorAll(
        '[data-non-critical], img[data-src]:not([data-critical="true"])',
      ),
    ).filter((el) => !this.criticalElements.includes(el));

    // 使用Intersection Observer延迟加载非关键内容
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadNonCriticalElement(entry.target);
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

  loadNonCriticalElement(element) {
    if (element.tagName === "IMG" || element.tagName === "IMAGE") {
      const img = element;
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

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// 智能资源预加载器（JavaScript版本）
class SmartResourcePreloader {
  constructor(maxConcurrent = 6) {
    this.resourceQueue = [];
    this.activePreloads = new Set();
    this.maxConcurrent = maxConcurrent;
    this.isOnline = navigator.onLine;

    this.init();
  }

  init() {
    // 初始化网络状态监听
    this.setupNetworkListener();

    // 开始处理预加载队列
    this.processQueue();
  }

  setupNetworkListener() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  preloadImage(url, priority = "medium") {
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

  preloadScript(url, priority = "medium") {
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

  preloadStylesheet(url, priority = "medium") {
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

  preloadPage(url) {
    if (!this.shouldPreloadResource(url)) return;

    // 预加载页面的HTML内容
    this.preloadDocument(url);
  }

  preloadDocument(url) {
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

  sortQueueByPriority() {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    this.resourceQueue.sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  processQueue() {
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

  async loadResource(item) {
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

  loadImage(url) {
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

  loadScript(url) {
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

  loadStylesheet(url) {
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

  async loadDocument(url) {
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

  async loadFont(url) {
    try {
      // 使用 CSS Font Loading API
      if ("fonts" in document) {
        const font = new FontFace("preload", `url(${url})`);
        await font.load();
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

  shouldPreloadResource(url) {
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

  preloadCurrentPageResources() {
    // 预加载当前页面的关键资源
    this.preloadCriticalImages();
    this.preloadNavigationLinks();
  }

  preloadCriticalImages() {
    const images = Array.from(document.querySelectorAll("img[data-src]"));
    images.forEach((img) => {
      if (img.dataset.src) {
        this.preloadImage(img.dataset.src, "high");
      }
    });
  }

  preloadNavigationLinks() {
    // 预加载主要导航链接的页面
    const navLinks = Array.from(
      document.querySelectorAll('nav a[href^="/"], header a[href^="/"]'),
    );

    navLinks.forEach((link) => {
      if (link.href && link.origin === window.location.origin) {
        // 根据链接的相对重要性设置优先级
        const priority = this.getLinkPriority(link);
        this.preloadPage(link.href);
      }
    });
  }

  getLinkPriority(link) {
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

  destroy() {
    // 清理活动的预加载
    this.activePreloads.clear();
    // 清理队列
    this.resourceQueue = [];
  }
}
