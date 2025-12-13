/**
 * 页面过渡管理器
 * 优化页面跳转体验，解决白屏和卡顿问题
 */

export interface TransitionOptions {
  duration?: number;
  easing?: string;
  showLoader?: boolean;
  loaderDelay?: number;
  cacheEnabled?: boolean;
}

export class PageTransitionManager {
  private options: Required<TransitionOptions>;
  private cache: Map<string, DocumentFragment>;
  private isLoading: boolean = false;
  private abortController: AbortController | null = null;

  constructor(options: TransitionOptions = {}) {
    this.options = {
      duration: options.duration ?? 300,
      easing: options.easing ?? 'ease',
      showLoader: options.showLoader ?? true,
      loaderDelay: options.loaderDelay ?? 150,
      cacheEnabled: options.cacheEnabled ?? true,
    };
    this.cache = new Map();
    
    this.init();
  }

  private init(): void {
    // 监听页面跳转事件
    this.hookNavigationEvents();
    
    // 监听页面加载完成事件
    this.hookPageLoadEvents();
  }

  /**
   * 拦截页面跳转行为
   */
  private hookNavigationEvents(): void {
    // 拦截所有链接点击事件
    document.addEventListener('click', this.handleLinkClick.bind(this));
    
    // 监听表单提交事件
    document.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // 监视浏览器前进后退按钮
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  /**
   * 监听页面加载事件
   */
  private hookPageLoadEvents(): void {
    // Astro页面加载事件
    document.addEventListener('astro:before-preparation', this.handleBeforePreparation.bind(this));
    document.addEventListener('astro:page-load', this.handlePageLoadComplete.bind(this));
  }

  /**
   * 处理链接点击事件
   */
  private handleLinkClick(event: Event): void {
    const target = event.target as HTMLElement;
    const link = target.closest('a');

    if (!link) return;

    const url = new URL(link.href);
    const currentUrl = new URL(window.location.href);

    // 检查是否是外部链接或特殊链接
    if (url.origin !== currentUrl.origin) return;
    if (link.target === '_blank') return;
    if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) return;
    if (link.getAttribute('href')?.startsWith('#')) return;

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

  /**
   * 处理表单提交
   */
  private handleFormSubmit(event: Event): void {
    const form = event.target as HTMLFormElement;
    if (form && form.method.toLowerCase() === 'get') {
      this.isLoading = true;
      if (this.options.showLoader) {
        this.showLoader();
      }
    }
  }

  /**
   * 处理浏览器前进后退事件
   */
  private handlePopState(event: PopStateEvent): void {
    // 阻止默认的页面跳转，执行平滑过渡
    this.performSmoothTransition(window.location.href);
  }

  /**
   * 处理页面准备前事件
   */
  private handleBeforePreparation(event: Event): void {
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

  /**
   * 处理页面加载完成事件
   */
  private handlePageLoadComplete(event: Event): void {
    this.isLoading = false;
    if (this.options.showLoader) {
      this.hideLoader();
    }
    
    // 触发过渡完成事件
    this.dispatchTransitionCompleteEvent();
  }

  /**
   * 导航到指定URL
   */
  private async navigateTo(url: string): Promise<void> {
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

  /**
   * 执行平滑过渡
   */
  private async performSmoothTransition(url: string): Promise<void> {
    return new Promise((resolve) => {
      // 保存当前页面状态
      const currentPage = document.documentElement.cloneNode(true) as HTMLElement;

      // 更新浏览器历史记录
      history.pushState({}, '', url);

      // 发起页面请求
      this.abortController = new AbortController();
      
      fetch(url, {
        signal: this.abortController.signal
      })
      .then(response => response.text())
      .then(html => {
        // 解析新的HTML内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 提取关键内容部分
        const newMain = doc.querySelector('main#main-content');
        const newTitle = doc.querySelector('title');
        
        if (newMain && newTitle) {
          // 执行过渡动画
          this.executeTransitionAnimation(currentPage, newMain, newTitle.textContent || '');
          
          // 更新页面内容
          const currentMain = document.querySelector('main#main-content');
          if (currentMain) {
            currentMain.replaceWith(newMain);
          }
          
          // 更新标题
          document.title = newTitle.textContent || '';
          
          // 更新元数据
          this.updateMetaTags(doc);
          
          // 完成过渡
          this.onTransitionComplete(resolve);
        } else {
          // 如果无法解析内容，执行完整页面刷新
          window.location.href = url;
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('页面加载失败:', error);
          // 出错时执行完整页面跳转
          window.location.href = url;
        }
      });
    });
  }

  /**
   * 执行过渡动画
   */
  private executeTransitionAnimation(currentPage: HTMLElement, newMain: Element, newTitle: string): void {
    const currentMain = document.querySelector('main#main-content');
    if (!currentMain) return;

    // 应用过渡样式
    currentMain.style.position = 'relative';
    currentMain.style.zIndex = '1';
    
    // 添加过渡效果
    currentMain.style.transition = `opacity ${this.options.duration}ms ${this.options.easing}`;
    currentMain.style.opacity = '0';
    
    // 在动画结束后应用新内容
    setTimeout(() => {
      // 移除旧内容并插入新内容
      currentMain.replaceWith(newMain);
      
      // 将新内容淡入
      newMain.style.position = 'relative';
      newMain.style.zIndex = '1';
      newMain.style.opacity = '0';
      newMain.style.transition = `opacity ${this.options.duration}ms ${this.options.easing}`;
      
      // 确保DOM更新后再执行动画
      requestAnimationFrame(() => {
        newMain.style.opacity = '1';
      });
    }, this.options.duration / 2);
  }

  /**
   * 过渡完成回调
   */
  private onTransitionComplete(callback: () => void): void {
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

  /**
   * 分发过渡完成事件
   */
  private dispatchTransitionCompleteEvent(): void {
    const event = new CustomEvent('page-transition-complete', {
      detail: { url: window.location.href }
    });
    document.dispatchEvent(event);
  }

  /**
   * 更新页面元标签
   */
  private updateMetaTags(newDoc: Document): void {
    // 更新描述
    const newDescription = newDoc.querySelector('meta[name="description"]');
    if (newDescription) {
      const currentDescription = document.querySelector('meta[name="description"]');
      if (currentDescription) {
        currentDescription.setAttribute('content', newDescription.getAttribute('content')!);
      } else {
        document.head.appendChild(newDescription.cloneNode(true) as Element);
      }
    }
    
    // 更新Open Graph标签
    const ogTags = newDoc.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach(tag => {
      const prop = tag.getAttribute('property');
      if (prop) {
        const currentTag = document.querySelector(`meta[property="${prop}"]`);
        if (currentTag) {
          currentTag.setAttribute('content', tag.getAttribute('content')!);
        } else {
          document.head.appendChild(tag.cloneNode(true) as Element);
        }
      }
    });
    
    // 更新Twitter Card标签
    const twitterTags = newDoc.querySelectorAll('meta[name^="twitter:"]');
    twitterTags.forEach(tag => {
      const name = tag.getAttribute('name');
      if (name) {
        const currentTag = document.querySelector(`meta[name="${name}"]`);
        if (currentTag) {
          currentTag.setAttribute('content', tag.getAttribute('content')!);
        } else {
          document.head.appendChild(tag.cloneNode(true) as Element);
        }
      }
    });
  }

  /**
   * 显示加载指示器
   */
  private showLoader(): void {
    const loader = document.querySelector('.page-loading') as HTMLElement;
    if (loader) {
      // 随机加载文本
      const texts = [
        "✨ 魔法正在施展中...",
        "🌈 彩虹桥搭建中...",
        "🎨 创意正在迸发...",
        "🚀 即将起飞...",
        "💫 星辰大海等你来...",
        "🌹 精彩内容准备中...",
        "🌟 闪亮登场倒计时..."
      ];
      const textElement = loader.querySelector('#loading-text') as HTMLElement;
      if (textElement) {
        textElement.textContent = texts[Math.floor(Math.random() * texts.length)];
      }
      
      // 延迟显示，避免快速跳转的闪烁
      setTimeout(() => {
        if (this.isLoading) {
          loader.classList.add('active');
        }
      }, 50);
    }
  }

  /**
   * 隐藏加载指示器
   */
  private hideLoader(): void {
    const loader = document.querySelector('.page-loading') as HTMLElement;
    if (loader) {
      loader.classList.remove('active');
    }
  }

  /**
   * 平滑滚动到目标元素
   */
  private smoothScrollToTarget(hash: string): void {
    const element = document.querySelector(hash) as HTMLElement;
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // 移除事件监听器
    document.removeEventListener('click', this.handleLinkClick.bind(this));
    document.removeEventListener('submit', this.handleFormSubmit.bind(this));
    window.removeEventListener('popstate', this.handlePopState.bind(this));
    document.removeEventListener('astro:before-preparation', this.handleBeforePreparation.bind(this));
    document.removeEventListener('astro:page-load', this.handlePageLoadComplete.bind(this));
  }
}