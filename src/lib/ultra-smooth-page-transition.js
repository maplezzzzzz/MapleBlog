/**
 * 超级平滑页面过渡管理器
 * 采用预渲染和双重缓冲技术，完全消除闪烁
 */

class UltraSmoothPageTransitionManager {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 500,
      easing: options.easing || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      showLoader: options.showLoader !== false,
      fadeInDuration: options.fadeInDuration || 250,
      fadeOutDuration: options.fadeOutDuration || 150,
      doubleBuffering: true,
    };
    
    this.isLoading = false;
    this.transitionQueue = [];
    this.isProcessing = false;
    this.pageCache = new Map();
    this.maxCacheSize = 10;
    
    // 创建隐藏的预渲染容器
    this.createPreRenderContainer();
    
    this.init();
  }

  init() {
    // 监听页面跳转事件
    this.hookNavigationEvents();
    
    // 监听页面加载完成事件
    this.hookPageLoadEvents();
  }

  createPreRenderContainer() {
    // 创建一个隐藏的容器用于预渲染内容
    this.preRenderContainer = document.createElement('div');
    this.preRenderContainer.style.position = 'absolute';
    this.preRenderContainer.style.visibility = 'hidden';
    this.preRenderContainer.style.pointerEvents = 'none';
    this.preRenderContainer.style.width = '0';
    this.preRenderContainer.style.height = '0';
    this.preRenderContainer.style.overflow = 'hidden';
    this.preRenderContainer.style.zIndex = '-1';
    this.preRenderContainer.style.left = '-9999px';
    this.preRenderContainer.style.top = '-9999px';
    document.body.appendChild(this.preRenderContainer);
  }

  hookNavigationEvents() {
    // 拦截所有链接点击事件
    document.addEventListener('click', this.handleLinkClick.bind(this));
    
    // 监听表单提交事件
    document.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  hookPageLoadEvents() {
    // Astro页面加载事件
    document.addEventListener('astro:before-preparation', this.handleBeforePreparation.bind(this));
    document.addEventListener('astro:page-load', this.handlePageLoadComplete.bind(this));
  }

  handleLinkClick(event) {
    const target = event.target;
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
        this.smoothScrollToTarget(url.hash);
      }
      return;
    }

    // 执行超平滑过渡
    event.preventDefault();
    this.navigateTo(link.href);
  }

  handleFormSubmit(event) {
    const form = event.target;
    if (form && form.method.toLowerCase() === 'get') {
      this.isLoading = true;
      if (this.options.showLoader) {
        this.showLoader();
      }
    }
  }

  handleBeforePreparation(event) {
    this.isLoading = true;
    if (this.options.showLoader) {
      // 几乎立即显示加载器，因为我们要确保用户感知到交互
      this.showLoader();
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
    // 如果正在处理其他过渡，将其加入队列
    if (this.isProcessing) {
      this.transitionQueue.push(url);
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // 执行超平滑过渡
      await this.performUltraSmoothTransition(url);
    } catch (error) {
      console.error('页面跳转失败:', error);
      // 发生错误时直接跳转
      window.location.href = url;
    } finally {
      this.isProcessing = false;
      
      // 处理队列中的下一个跳转
      if (this.transitionQueue.length > 0) {
        const nextUrl = this.transitionQueue.shift();
        setTimeout(() => this.navigateTo(nextUrl), 100);
      }
    }
  }

  async performUltraSmoothTransition(url) {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取或预渲染页面内容
        const { newMain, newTitle, newDoc } = await this.getPreRenderedContent(url);
        
        // 创建当前内容的快照
        const currentMain = document.querySelector('main#main-content');
        if (!currentMain) {
          // 如果找不到主内容区域，直接跳转
          window.location.href = url;
          return;
        }
        
        // 创建快照容器以保持当前视图稳定
        const snapshot = this.createSnapshot(currentMain);
        
        // 将快照添加到页面并隐藏原内容
        currentMain.style.visibility = 'hidden';
        currentMain.parentNode?.insertBefore(snapshot, currentMain);
        
        // 将新内容添加到预渲染容器中进行初始化
        this.preRenderContainer.innerHTML = '';
        this.preRenderContainer.appendChild(newMain);
        
        // 确保新内容完全渲染后将其移动到正确位置
        await this.waitForRender(newMain);
        
        // 更新标题和元数据
        document.title = newTitle;
        this.updateMetaTags(newDoc);
        
        // 执行超平滑的切换动画
        await this.performSuperSmoothSwitch(snapshot, newMain, currentMain);
        
        // 更新浏览器历史记录
        history.pushState({}, '', url);
        
        resolve();
      } catch (error) {
        console.error('过渡执行失败:', error);
        reject(error);
      }
    });
  }

  async getPreRenderedContent(url) {
    // 检查缓存中是否存在
    if (this.pageCache.has(url)) {
      return this.pageCache.get(url);
    }
    
    // 获取页面内容
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 提取关键内容部分
    const newMain = doc.querySelector('main#main-content');
    const newTitle = doc.querySelector('title')?.textContent || '';
    
    if (!newMain) {
      throw new Error('无法解析页面内容');
    }
    
    // 如果缓存已满，删除最旧的条目
    if (this.pageCache.size >= this.maxCacheSize) {
      const firstKey = this.pageCache.keys().next().value;
      this.pageCache.delete(firstKey);
    }
    
    // 缓存内容
    const content = { newMain, newTitle, newDoc: doc };
    this.pageCache.set(url, content);
    
    return content;
  }

  createSnapshot(element) {
    // 创建当前内容的深拷贝作为快照
    const snapshot = element.cloneNode(true);
    snapshot.id = 'content-snapshot';
    snapshot.style.position = 'absolute';
    snapshot.style.top = '0';
    snapshot.style.left = '0';
    snapshot.style.width = '100%';
    snapshot.style.zIndex = '9997';
    snapshot.style.pointerEvents = 'none';
    
    return snapshot;
  }

  async waitForRender(element) {
    // 确保元素完全渲染
    return new Promise(resolve => {
      // 使用 requestAnimationFrame 确保渲染完成
      requestAnimationFrame(() => {
        // 再次使用，确保CSS样式完全应用
        requestAnimationFrame(() => {
          setTimeout(resolve, 16); // 额外延迟确保渲染完成
        });
      });
    });
  }

  async performSuperSmoothSwitch(snapshot, newMain, currentMain) {
    return new Promise(resolve => {
      // 隐藏新内容直到切换开始
      newMain.style.opacity = '0';
      newMain.style.visibility = 'hidden';
      
      // 将新内容放置在正确位置
      if (currentMain.parentNode) {
        currentMain.parentNode.replaceChild(newMain, currentMain);
      }
      
      // 执行淡出当前内容的动画
      snapshot.style.transition = `opacity ${this.options.fadeOutDuration}ms ease-out`;
      snapshot.style.opacity = '0';
      
      // 设置新内容样式
      newMain.style.opacity = '0';
      newMain.style.visibility = 'visible';
      newMain.style.transition = `opacity ${this.options.fadeInDuration}ms ease-out`;
      
      // 延迟淡入新内容，避免同时动画
      setTimeout(() => {
        newMain.style.opacity = '1';
        
        // 等待动画完成
        setTimeout(() => {
          // 移除快照
          if (snapshot.parentNode) {
            snapshot.parentNode.removeChild(snapshot);
          }
          resolve();
        }, this.options.fadeInDuration + 50); // 额外50ms缓冲
      }, this.options.fadeOutDuration / 2); // 在当前内容淡出一半时开始新内容淡入
    });
  }

  updateMetaTags(newDoc) {
    // 更新描述
    const newDescription = newDoc.querySelector('meta[name="description"]');
    if (newDescription) {
      const currentDescription = document.querySelector('meta[name="description"]');
      if (currentDescription) {
        currentDescription.setAttribute('content', newDescription.getAttribute('content'));
      } else {
        document.head.appendChild(newDescription.cloneNode(true));
      }
    }
    
    // 更新Open Graph标签
    const ogTags = newDoc.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach(tag => {
      const prop = tag.getAttribute('property');
      if (prop) {
        const currentTag = document.querySelector(`meta[property="${prop}"]`);
        if (currentTag) {
          currentTag.setAttribute('content', tag.getAttribute('content'));
        } else {
          document.head.appendChild(tag.cloneNode(true));
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
          currentTag.setAttribute('content', tag.getAttribute('content'));
        } else {
          document.head.appendChild(tag.cloneNode(true));
        }
      }
    });
  }

  showLoader() {
    const loader = document.querySelector('.page-loading');
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
      const textElement = loader.querySelector('#loading-text');
      if (textElement) {
        textElement.textContent = texts[Math.floor(Math.random() * texts.length)];
      }
      
      // 几乎立即显示加载器
      requestAnimationFrame(() => {
        if (this.isLoading) {
          loader.classList.add('active');
        }
      });
    }
  }

  hideLoader() {
    const loader = document.querySelector('.page-loading');
    if (loader) {
      loader.classList.remove('active');
    }
  }

  smoothScrollToTarget(hash) {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  destroy() {
    // 移除事件监听器
    document.removeEventListener('click', this.handleLinkClick.bind(this));
    document.removeEventListener('submit', this.handleFormSubmit.bind(this));
    document.removeEventListener('astro:before-preparation', this.handleBeforePreparation.bind(this));
    document.removeEventListener('astro:page-load', this.handlePageLoadComplete.bind(this));
    
    // 清理预渲染容器
    if (this.preRenderContainer && this.preRenderContainer.parentNode) {
      this.preRenderContainer.parentNode.removeChild(this.preRenderContainer);
    }
    
    // 清理缓存
    this.pageCache.clear();
  }
}