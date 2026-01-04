import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;
  const isProduction = import.meta.env.PROD; // 判断是否为生产环境 (npm run build)

  // 定义需要屏蔽的路径前缀
  const blockedPaths = ["/admin", "/api"];

  // 如果是生产环境，且请求路径以屏蔽列表中的任何一个开头
  if (isProduction && blockedPaths.some((path) => url.pathname.startsWith(path))) {
    
    // 对于 API 请求，返回 404 或 403
    if (url.pathname.startsWith("/api")) {
      return new Response(JSON.stringify({ error: "API not available in production" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 对于 Admin 页面请求，直接重定向到 404 页面或首页
    return context.redirect("/404");
  }

  // 继续处理其他请求
  return next();
});
