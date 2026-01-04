// 提示组件工具类
export interface ToastOptions {
  title?: string;
  content: string;
  type?: "success" | "info" | "warning" | "error";
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  duration?: number; // 显示时长（毫秒），0 表示不自动消失
  showIcon?: boolean;
  closable?: boolean;
}

// 类型配置
const typeConfig = {
  success: {
    bgColor: "from-emerald-400/20 to-green-500/20",
    borderColor: "border-emerald-400/30",
    textColor: "text-emerald-700",
    icon: "✓",
  },
  info: {
    bgColor: "from-blue-900/20 to-cyan-500/20",
    borderColor: "border-blue-200",
    textColor: "text-blue-100",
    icon: "ℹ",
  },
  warning: {
    bgColor: "from-amber-400/20 to-orange-500/20",
    borderColor: "border-amber-400/30",
    textColor: "text-amber-700",
    icon: "⚠",
  },
  error: {
    bgColor: "from-red-400/20 to-rose-500/20",
    borderColor: "border-red-400/30",
    textColor: "text-red-700",
    icon: "✕",
  },
};

// 位置样式
const positionClasses = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 transform -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
};

/**
 * 显示提示消息
 * @param options 提示选项
 * @returns 返回创建的提示元素
 */
export function showToast(options: ToastOptions): HTMLElement {
  const {
    title,
    content,
    type = "info",
    position = "top-right",
    duration = 3000,
    showIcon = true,
    closable = true,
  } = options;

  const config = typeConfig[type];
  const positionClass = positionClasses[position];

  // 创建提示容器
  const toastContainer = document.createElement("div");
  toastContainer.className = `toast-container fixed z-50 ${positionClass} pointer-events-none`;
  toastContainer.dataset.duration = duration.toString();

  // 创建提示内容
  const toastContent = document.createElement("div");
  toastContent.className = `
    toast-content pointer-events-auto
    backdrop-blur-xl bg-gradient-to-br ${config.bgColor}
    border ${config.borderColor}
    rounded-2xl shadow-xl shadow-black/20
    p-6 min-w-[280px] max-w-[400px]
    transform transition-all duration-500 ease-out
    hover:scale-105 hover:shadow-3xl
    animate-slide-in
  `;

  // 装饰性光效
  const lightEffect = document.createElement("div");
  lightEffect.className =
    "absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-50";
  toastContent.appendChild(lightEffect);

  // 内容区域
  const contentArea = document.createElement("div");
  contentArea.className = "flex items-start gap-3 relative z-10";

  // 图标
  if (showIcon) {
    const iconDiv = document.createElement("div");
    iconDiv.className = `
      flex-shrink-0 w-8 h-8 rounded-full 
      bg-gradient-to-br ${config.bgColor}
      border ${config.borderColor}
      flex items-center justify-center
      text-lg font-bold ${config.textColor}
      shadow-lg
    `;
    iconDiv.textContent = config.icon;
    contentArea.appendChild(iconDiv);
  }

  // 文本内容
  const textDiv = document.createElement("div");
  textDiv.className = "flex-1 min-w-0";

  if (title) {
    const titleElement = document.createElement("h4");
    titleElement.className = `text-md font-bold ${config.textColor} my-2 leading-tight`;
    titleElement.textContent = title;
    textDiv.appendChild(titleElement);
  }

  const contentElement = document.createElement("p");
  contentElement.className = "text-gray-700 text-sm leading-relaxed";
  contentElement.setHTMLUnsafe(content);
  textDiv.appendChild(contentElement);

  contentArea.appendChild(textDiv);

  // 关闭按钮
  if (closable) {
    const closeBtn = document.createElement("button");
    closeBtn.className =
      "w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center text-gray-600 hover:text-gray-800";
    closeBtn.innerHTML = '<span class="text-xs">×</span>';
    closeBtn.onclick = () => removeToast(toastContainer);
    contentArea.appendChild(closeBtn);
  }

  toastContent.appendChild(contentArea);

  // 进度条（如果有自动消失时间）
  if (duration > 0) {
    const progressContainer = document.createElement("div");
    progressContainer.className =
      "absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden";

    const progressBar = document.createElement("div");
    progressBar.className = `h-full bg-gradient-to-r ${config.bgColor} animate-progress`;
    progressBar.style.animationDuration = `${duration}ms`;

    progressContainer.appendChild(progressBar);
    toastContent.appendChild(progressContainer);
  }

  toastContainer.appendChild(toastContent);
  document.body.appendChild(toastContainer);

  // 自动消失
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toastContainer);
    }, duration);
  }

  return toastContainer;
}

/**
 * 移除提示
 * @param toastElement 提示元素
 */
function removeToast(toastElement: HTMLElement) {
  const content = toastElement.querySelector(".toast-content") as HTMLElement;
  if (content) {
    content.style.transform = "translateY(-20px) scale(0.95)";
    content.style.opacity = "0";
    content.style.transition = "all 0.3s ease-in";

    setTimeout(() => {
      toastElement.remove();
    }, 300);
  }
}

/**
 * 快捷方法：成功提示
 */
export function showSuccess(
  content: string,
  title?: string,
  options?: Partial<ToastOptions>,
) {
  return showToast({ ...options, content, title, type: "success" });
}

/**
 * 快捷方法：信息提示
 */
export function showInfo(
  content: string,
  title?: string,
  options?: Partial<ToastOptions>,
) {
  return showToast({ ...options, content, title, type: "info" });
}

/**
 * 快捷方法：警告提示
 */
export function showWarning(
  content: string,
  title?: string,
  options?: Partial<ToastOptions>,
) {
  return showToast({ ...options, content, title, type: "warning" });
}

/**
 * 快捷方法：错误提示
 */
export function showError(
  content: string,
  title?: string,
  options?: Partial<ToastOptions>,
) {
  return showToast({ ...options, content, title, type: "error" });
}

/**
 * 清除所有提示
 */
export function clearAllToasts() {
  const toasts = document.querySelectorAll(".toast-container");
  toasts.forEach((toast) => {
    removeToast(toast as HTMLElement);
  });
}

/**
 * 清除指定位置的提示
 */
export function clearToastsByPosition(
  position: ToastOptions["position"] = "top-right",
) {
  const positionClass = positionClasses[position];
  const toasts = document.querySelectorAll(
    `.toast-container.${positionClass.split(" ").join(".")}`,
  );
  toasts.forEach((toast) => {
    removeToast(toast as HTMLElement);
  });
}

// 添加必要的 CSS 样式到页面
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    /* Toast 动画样式 */
    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
    
    .animate-slide-in {
      animation: slide-in 0.5s ease-out;
    }
    
    .animate-progress {
      animation: progress linear;
    }
    
    .toast-content {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .toast-content:hover {
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
    }
    
    @media (max-width: 640px) {
      .toast-container {
        left: 1rem !important;
        right: 1rem !important;
        transform: none !important;
      }
      
      .toast-content {
        min-width: auto;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);
}
