/**
 * 环境配置管理工具
 * 根据 NODE_ENV 自动加载对应的环境变量
 */

// 获取当前环境
export const NODE_ENV = import.meta.env.PUBLIC_ENV || "development";

// 环境类型定义
export type Environment = "development" | "production" | "test";

// 环境配置接口
export interface EnvConfig {
  SITE_URL: string;
  ENV: Environment;
  DEBUG: boolean;
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

// 获取环境配置
export function getEnvConfig(): EnvConfig {
  return {
    SITE_URL: import.meta.env.PUBLIC_SITE_URL || "",
    ENV: import.meta.env.PUBLIC_ENV as Environment,
    DEBUG: import.meta.env.PUBLIC_DEBUG === "true",
    LOG_LEVEL:
      (import.meta.env.PUBLIC_LOG_LEVEL as EnvConfig["LOG_LEVEL"]) || "info",
    // Supabase 已移除
    SUPABASE_URL: "",
    SUPABASE_ANON_KEY: "",
  };
}

// 环境检查工具函数
export const isDevelopment = () => NODE_ENV === "development";
export const isProduction = () => NODE_ENV === "production";
export const isTest = () => NODE_ENV === "test";

// 导出配置实例
export const envConfig = getEnvConfig();

// 日志工具（根据环境配置输出）
export const logger = {
  debug: (...args: any[]) => {
    if (envConfig.DEBUG && ["debug"].includes(envConfig.LOG_LEVEL)) {
      console.debug("[DEBUG]", ...args);
    }
  },
  info: (...args: any[]) => {
    if (["debug", "info"].includes(envConfig.LOG_LEVEL)) {
      console.info("[INFO]", ...args);
    }
  },
  warn: (...args: any[]) => {
    if (["debug", "info", "warn"].includes(envConfig.LOG_LEVEL)) {
      console.warn("[WARN]", ...args);
    }
  },
  error: (...args: any[]) => {
    console.error("[ERROR]", ...args);
  },
};
