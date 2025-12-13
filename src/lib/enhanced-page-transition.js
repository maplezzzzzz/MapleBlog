/**
 * 增强版页面切换管理器
 * 解决页面切换时的闪烁问题
 */

class EnhancedPageTransitionManager {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 400,
      easing: options.easing || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      showLoader: options.showLoader !== false,
      loaderDelay: options.loaderDelay || 50,
      fadeInDuration: options.fadeInDuration || 200,
    };
    this.isLoading = false;
    this.transitionQueue = [];
    this.isProcessing = false;
    
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

    // 执行平滑过渡
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
      // 使用较短的延迟避免过度延迟
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
    // 如果正在处理其他过渡，将其加入队列
    if (this.isProcessing) {
      this.transitionQueue.push(url);
      return;
    }
    
    this.isProcessing = true;
    
    // 显示加载状态
    this.isLoading = true;
    if (this.options.showLoader) {
      this.showLoader();
    }

    try {
      // 执行页面过渡
      await this.performSmoothTransition(url);
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

  async performSmoothTransition(url) {
    return new Promise((resolve, reject) => {
      // 创建一个临时的半透明覆盖层，避免闪烁
      const overlay = this.createTransitionOverlay();
      document.body.appendChild(overlay);
      
      // 更新浏览器历史记录
      history.pushState({}, '', url);
      
      // 发起页面请求
      const controller = new AbortController();
      
      fetch(url, {
        signal: controller.signal
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // 解析新的HTML内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 提取关键内容部分
        const newMain = doc.querySelector('main#main-content');
        const newTitle = doc.querySelector('title');
        
        if (newMain && newTitle) {
          // 更新页面内容
          const currentMain = document.querySelector('main#main-content');
          if (currentMain) {
            // 将新内容添加到DOM中但保持隐藏状态
            newMain.style.opacity = '0';
            newMain.style.visibility = 'hidden';
            currentMain.parentNode?.replaceChild(newMain, currentMain);
          }
          
          // 更新标题
          document.title = newTitle.textContent || '';
          
          // 更新元数据
          this.updateMetaTags(doc);
          
          // 执行平滑的淡入动画
          this.performFadeInAnimation(newMain, overlay)
            .then(() => {
              this.onTransitionComplete(resolve);
            })
            .catch(reject);
        } else {
          // 如果无法解析内容，移除覆盖层并跳转
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          window.location.href = url;
          reject(new Error('无法解析页面内容'));
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('页面加载失败:', error);
          
          // 移除覆盖层
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          
          // 出错时执行完整页面跳转
          window.location.href = url;
          reject(error);
        }
      });
    });
  }

  createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#ffffff';
    overlay.style.zIndex = '9998';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    overlay.style.transition = 'opacity 0.2s ease, visibility 0.2s ease';
    
    // 在暗色模式下使用深色背景
    if (document.documentElement.classList.contains('dark') || 
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
      overlay.style.backgroundColor = '#111111';
    }
    
    return overlay;
  }

  async performFadeInAnimation(newMain, overlay) {
    return new Promise((resolve) => {
      // 确保DOM已更新
      requestAnimationFrame(() => {
        // 淡出覆盖层
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        
        // 然后淡入新内容
        setTimeout(() => {
          if (newMain) {
            newMain.style.opacity = '0';
            newMain.style.visibility = 'visible';
            newMain.style.transition = `opacity ${this.options.fadeInDuration}ms ease-out`;
            
            // 确保在下一帧执行淡入
            requestAnimationFrame(() => {
              newMain.style.opacity = '1';
              
              // 等待淡入动画完成后再移除覆盖层
              setTimeout(() => {
                // 淡出覆盖层
                overlay.style.opacity = '0';
                setTimeout(() => {
                  if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                  }
                  resolve();
                }, 150);
              }, this.options.fadeInDuration - 100); // 留100ms余量
            });
          } else {
            // 如果没有新内容，直接移除覆盖层
            overlay.style.opacity = '0';
            setTimeout(() => {
              if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
              }
              resolve();
            }, 150);
          }
        }, 50); // 短暂延迟确保覆盖层显示
      });
    });
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
    const event = new CustomEvent('page-transition-complete', {
      detail: { url: window.location.href }
    });
    document.dispatchEvent(event);
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
      
      // 延迟显示，避免快速跳转的闪烁
      setTimeout(() => {
        if (this.isLoading) {
          loader.classList.add('active');
        }
      }, 25);
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
  }
}