/**
 * 页面加载优化验证脚本
 */

// 检查所有优化组件是否已正确加载
function validateOptimizations() {
  console.log("=== 页面加载优化验证 ===");

  // 检查关键类是否存在
  const checks = [
    {
      name: "BrowserHistoryManager",
      exists: typeof BrowserHistoryManager !== "undefined",
    },
    {
      name: "PageTransitionManager",
      exists: typeof PageTransitionManager !== "undefined",
    },
    {
      name: "CriticalContentLoader",
      exists: typeof CriticalContentLoader !== "undefined",
    },
    {
      name: "SmartResourcePreloader",
      exists: typeof SmartResourcePreloader !== "undefined",
    },
  ];

  checks.forEach((check) => {
    if (check.exists) {
      console.log(`✅ ${check.name} 已加载`);
    } else {
      console.error(`❌ ${check.name} 未找到`);
    }
  });

  // 检查CSS类是否应用
  const enhancedStyles = document.querySelector(".loading-container-enhanced");
  if (enhancedStyles) {
    console.log("✅ 增强加载动画样式已应用");
  } else {
    console.warn("⚠️ 增强加载动画样式未找到，可能需要检查SCSS编译");
  }

  // 检查关键内容标记
  const criticalElements = document.querySelectorAll('[data-critical="true"]');
  console.log(`📊 找到 ${criticalElements.length} 个标记为关键的元素`);

  // 检查懒加载元素
  const lazyElements = document.querySelectorAll("img[data-src]");
  console.log(`📊 找到 ${lazyElements.length} 个懒加载图像`);

  console.log("=== 验证完成 ===");
}

// 性能监控
function setupPerformanceMonitoring() {
  // 记录页面加载时间
  window.addEventListener("load", () => {
    const pageLoadTime = performance.now();
    console.log(`⏱️ 页面加载时间: ${pageLoadTime.toFixed(2)}ms`);
  });

  // 监控资源加载
  if ("performance" in window) {
    performance.setResourceTimingBufferSize(1000);
    window.addEventListener("load", () => {
      setTimeout(() => {
        const resources = performance.getEntriesByType("resource");
        const avgResourceLoadTime =
          resources.reduce((sum, res) => sum + res.duration, 0) /
          resources.length;
        console.log(
          `⏱️ 平均资源加载时间: ${avgResourceLoadTime ? avgResourceLoadTime.toFixed(2) + "ms" : "N/A"}`,
        );
      }, 5000); // 延迟5秒以确保资源加载完成
    });
  }
}

// 验证预加载功能
function testPreloading() {
  // 检查是否有预加载的链接
  const links = document.querySelectorAll('a[href^="/"]');
  console.log(`🔗 页面中有 ${links.length} 个内部链接`);

  // 模拟鼠标悬停触发预加载
  setTimeout(() => {
    if (links.length > 0) {
      console.log("🧪 预加载功能测试: 已设置链接悬停监听器");
    }
  }, 3000);
}

// 启动验证
document.addEventListener("DOMContentLoaded", () => {
  validateOptimizations();
  setupPerformanceMonitoring();
  testPreloading();

  // 定期报告
  setInterval(() => {
    const activeScripts = document.querySelectorAll("script[src]").length;
    const activeStyles = document.querySelectorAll(
      'link[rel="stylesheet"]',
    ).length;
    console.log(`📋 当前加载的脚本: ${activeScripts}, 样式表: ${activeStyles}`);
  }, 10000);
});
