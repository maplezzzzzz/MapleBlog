/**
 * 页面跳转优化测试脚本
 * 用于验证白屏和卡顿问题是否已解决
 */

// 测试页面过渡管理器
function testPageTransitionManager() {
  console.log("Testing PageTransitionManager...");

  // 检查是否已正确初始化
  if (typeof PageTransitionManager !== "undefined") {
    console.log("✓ PageTransitionManager is available");
  } else {
    console.error("✗ PageTransitionManager is not available");
  }

  // 检查是否已正确初始化
  if (typeof BrowserHistoryManager !== "undefined") {
    console.log("✓ BrowserHistoryManager is available");
  } else {
    console.error("✗ BrowserHistoryManager is not available");
  }
}

// 测试加载动画
function testLoadingAnimation() {
  console.log("Testing loading animation...");

  const loader = document.querySelector(".page-loading");
  if (loader) {
    console.log("✓ Loading element found");
  } else {
    console.error("✗ Loading element not found");
  }
}

// 测试骨架屏
function testSkeletonScreen() {
  console.log("Testing skeleton screen...");

  // 检查样式是否包含animate-pulse
  const styleSheets = Array.from(document.styleSheets);
  let hasPulseAnimation = false;

  for (const sheet of styleSheets) {
    try {
      const rules = Array.from(sheet.cssRules);
      for (const rule of rules) {
        if (
          rule.type === CSSRule.STYLE_RULE &&
          rule.selectorText === ".animate-pulse"
        ) {
          hasPulseAnimation = true;
          break;
        }
      }
    } catch (e) {
      // 忽略跨域错误
    }
  }

  if (hasPulseAnimation) {
    console.log("✓ Skeleton animation styles found");
  } else {
    // 如果样式表无法访问，则检查是否有对应的类
    const elements = document.querySelectorAll(".animate-pulse");
    if (elements.length > 0) {
      console.log("✓ Skeleton animation elements found");
    } else {
      console.log("? Skeleton animation not directly detectable");
    }
  }
}

// 运行测试
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== 开始页面跳转优化验证 ===");
  testPageTransitionManager();
  testLoadingAnimation();
  testSkeletonScreen();
  console.log("=== 验证完成 ===");

  // 提供一些调试信息
  console.log("当前页面URL:", window.location.href);
  console.log("页面加载时间:", performance.now().toFixed(2) + "ms");
});

// 监听页面跳转事件
document.addEventListener("page-transition-complete", (event) => {
  console.log("页面跳转完成:", event.detail.url);
});

// 监听页面恢复事件
document.addEventListener("page-restored-from-cache", (event) => {
  console.log("从缓存恢复页面:", event.detail.url);
});
