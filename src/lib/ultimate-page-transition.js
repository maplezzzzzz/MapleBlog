/**
 * 终极零闪烁页面过渡管理器
 * 使用持久遮罩和iframe预加载技术
 */
class PageTransitionManager {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 400,
      easing: options.easing || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fadeInDuration: options.fadeInDuration || 300,
      fadeOutDuration: options.fadeOutDuration || 200,
      iframePreload: true,
      useCustomHistory: true
    };
    
    this.isLoading = false;
    this.transitionQueue = [];
    this.isProcessing = false;
    this.iframeCache = new Map();
    this.maxIframeCacheSize = 5;
    this.isFirstLoad = true;
    
    // 创建iframe容器
    this.createIframeContainer();
    
    // 创建持久的加载遮罩
    this.createPersistentOverlay();
    
    this.init();
  }

  createPersistentOverlay() {
    // 创建一个持久的遮罩层，始终覆盖整个页面
    this.persistentOverlay = document.createElement('div');
    this.persistentOverlay.id = 'persistent-overlay';
    this.persistentOverlay.style.position = 'fixed';
    this.persistentOverlay.style.top = '0';
    this.persistentOverlay.style.left = '0';
    this.persistentOverlay.style.width = '100%';
    this.persistentOverlay.style.height = '100%';
    this.persistentOverlay.style.backgroundColor = '#ffffff';
    this.persistentOverlay.style.zIndex = '9999';
    this.persistentOverlay.style.opacity = '1';
    this.persistentOverlay.style.visibility = 'visible';
    this.persistentOverlay.style.transition = 'opacity 0.3s ease';
    
    // 在暗色模式下使用深色背景
    if (document.documentElement.classList.contains('dark') || 
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.persistentOverlay.style.backgroundColor = '#111111';
    }
    
    document.body.appendChild(this.persistentOverlay);
    
    // 首次加载完成后淡出遮罩
    setTimeout(() => {
      this.isFirstLoad = false;
      this.persistentOverlay.style.opacity = '0';
      setTimeout(() => {
        this.persistentOverlay.style.visibility = 'hidden';
      }, 300);
    }, 500);
  }

  createIframeContainer() {
    // 创建一个隐藏的iframe容器用于预加载内容
    this.iframeContainer = document.createElement('div');
    this.iframeContainer.style.position = 'absolute';
    this.iframeContainer.style.visibility = 'hidden';
    this.iframeContainer.style.pointerEvents = 'none';
    this.iframeContainer.style.width = '0';
    this.iframeContainer.style.height = '0';
    this.iframeContainer.style.overflow = 'hidden';
    this.iframeContainer.style.zIndex = '-1';
    this.iframeContainer.style.left = '-9999px';
    this.iframeContainer.style.top = '-9999px';
    document.body.appendChild(this.iframeContainer);
  }

  init() {
    // 监听页面跳转事件
    this.hookNavigationEvents();
  }

  hookNavigationEvents() {
    // 拦截所有链接点击事件
    document.addEventListener('click', this.handleLinkClick.bind(this));
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

    // 执行完美零闪烁过渡
    event.preventDefault();
    this.navigateTo(link.href);
  }

  async navigateTo(url) {
    // 如果正在处理其他过渡，将其加入队列
    if (this.isProcessing) {
      this.transitionQueue.push(url);
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // 执行零闪烁过渡
      await this.performZeroFlashTransition(url);
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

  async performZeroFlashTransition(url) {
    return new Promise(async (resolve, reject) => {
      try {
        // 立即显示持久遮罩以防止白屏
        if (!this.isFirstLoad) {
          this.persistentOverlay.style.visibility = 'visible';
          this.persistentOverlay.style.opacity = '1';
        }
        
        // 首先，淡出当前内容
        const currentMain = document.querySelector('main#main-content');
        if (!currentMain) {
          window.location.href = url;
          return;
        }
        
        // 创建当前内容的快照并保持可见
        const snapshot = this.createSnapshot(currentMain);
        currentMain.parentNode?.insertBefore(snapshot, currentMain);
        currentMain.style.visibility = 'hidden';
        
        // 预加载目标页面
        const iframe = await this.preloadPageWithIframe(url);
        
        // 从iframe中提取内容
        const content = this.extractContentFromIframe(iframe, url);
        if (!content) {
          throw new Error('无法从iframe中提取内容');
        }
        
        // 将新内容添加到DOM中（但隐藏）
        content.newMain.style.opacity = '0';
        content.newMain.style.visibility = 'hidden';
        currentMain.parentNode?.replaceChild(content.newMain, currentMain);
        
        // 更新标题和元数据
        document.title = content.newTitle;
        this.updateMetaTags(content.newDoc);
        
        // 确保新内容渲染后再显示
        await this.waitForRender(content.newMain);
        
        // 执行淡入淡出动画
        await this.performFadeInOut(snapshot, content.newMain);
        
        // 更新浏览器历史记录
        if (this.options.useCustomHistory) {
          history.pushState({}, '', url);
        }
        
        // 延迟隐藏持久遮罩，确保过渡完成
        setTimeout(() => {
          this.persistentOverlay.style.opacity = '0';
          setTimeout(() => {
            if (!this.isFirstLoad) {
              this.persistentOverlay.style.visibility = 'hidden';
            }
          }, 300);
        }, 100);
        
        // 清理iframe
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1000);
        
        resolve();
      } catch (error) {
        console.error('零闪烁过渡执行失败:', error);
        // 即使出现错误也要确保遮罩被移除
        this.persistentOverlay.style.opacity = '0';
        setTimeout(() => {
          this.persistentOverlay.style.visibility = 'hidden';
        }, 300);
        reject(error);
      }
    });
  }

  async preloadPageWithIframe(url) {
    // 检查是否已缓存iframe
    if (this.iframeCache.has(url)) {
      return this.iframeCache.get(url);
    }
    
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.visibility = 'hidden';
      iframe.style.width = '100%';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.style.zIndex = '-1';
      // 防止iframe获取焦点
      iframe.style.pointerEvents = 'none';
      iframe.style.opacity = '0';
      
      iframe.onload = () => {
        // 确保iframe完全加载后才返回
        setTimeout(() => {
          // 如果缓存已满，删除最旧的条目
          if (this.iframeCache.size >= this.maxIframeCacheSize) {
            const firstKey = this.iframeCache.keys().next().value;
            const oldIframe = this.iframeCache.get(firstKey);
            if (oldIframe && oldIframe.parentNode) {
              oldIframe.parentNode.removeChild(oldIframe);
            }
            this.iframeCache.delete(firstKey);
          }
          
          // 缓存iframe
          this.iframeCache.set(url, iframe);
          resolve(iframe);
        }, 100);
      };
      
      iframe.onerror = () => {
        reject(new Error(`Failed to load iframe for ${url}`));
      };
      
      iframe.src = url;
      this.iframeContainer.appendChild(iframe);
    });
  }

  extractContentFromIframe(iframe, url) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // 提取关键内容部分
      const newMain = iframeDoc.querySelector('main#main-content');
      const newTitle = iframeDoc.querySelector('title')?.textContent || '';
      
      if (!newMain) {
        return null;
      }
      
      // 深拷贝内容以避免引用问题
      const newMainClone = newMain.cloneNode(true);
      
      return {
        newMain: newMainClone,
        newTitle,
        newDoc: iframeDoc
      };
    } catch (e) {
      console.error(`无法从iframe中提取内容 ${url}:`, e);
      return null;
    }
  }

  createSnapshot(element) {
    // 创建当前内容的深拷贝作为快照
    const snapshot = element.cloneNode(true);
    snapshot.id = 'content-snapshot';
    snapshot.style.position = 'relative';
    snapshot.style.zIndex = '9997';
    snapshot.style.transition = 'opacity 0.2s ease-out';
    
    return snapshot;
  }

  async waitForRender(element) {
    // 确保元素完全渲染
    return new Promise(resolve => {
      // 使用 requestAnimationFrame 确保渲染完成
      requestAnimationFrame(() => {
        // 再次使用，确保CSS样式完全应用
        requestAnimationFrame(() => {
          setTimeout(resolve, 10);
        });
      });
    });
  }

  async performFadeInOut(snapshot, newMain) {
    return new Promise(resolve => {
      // 设置新内容样式
      newMain.style.opacity = '0';
      newMain.style.visibility = 'visible';
      newMain.style.transition = `opacity ${this.options.fadeInDuration}ms ease-out`;
      
      // 淡出快照，淡入新内容
      snapshot.style.transition = `opacity ${this.options.fadeOutDuration}ms ease-out`;
      snapshot.style.opacity = '0';
      
      // 显示新内容
      requestAnimationFrame(() => {
        newMain.style.opacity = '1';
      });
      
      // 等待所有动画完成
      setTimeout(() => {
        // 移除快照
        if (snapshot.parentNode) {
          snapshot.parentNode.removeChild(snapshot);
        }
        resolve();
      }, Math.max(this.options.fadeOutDuration, this.options.fadeInDuration) + 50);
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
    
    // 清理iframe容器
    if (this.iframeContainer && this.iframeContainer.parentNode) {
      this.iframeContainer.parentNode.removeChild(this.iframeContainer);
    }
    
    // 清理持久遮罩
    if (this.persistentOverlay && this.persistentOverlay.parentNode) {
      this.persistentOverlay.parentNode.removeChild(this.persistentOverlay);
    }
    
    // 清理所有缓存的iframe
    for (const iframe of this.iframeCache.values()) {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }
    this.iframeCache.clear();
  }
}