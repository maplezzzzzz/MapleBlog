# python-api/config.py
"""
Python API服务配置文件
"""
import os
from typing import Optional

class Settings:
    # 应用配置
    APP_NAME: str = "小白天地 - Python API服务"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # 服务器配置
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    WORKERS: int = int(os.getenv("WORKERS", "1"))
    
    # CORS配置
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # 数据库配置 (如果需要)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)
    
    # 文件存储路径
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    VISUALIZATION_DIR: str = os.getenv("VISUALIZATION_DIR", "visualizations")
    
    # 文本分析配置
    DEFAULT_LANGUAGE: str = os.getenv("DEFAULT_LANGUAGE", "zh")
    MAX_TEXT_LENGTH: int = int(os.getenv("MAX_TEXT_LENGTH", "10000"))
    
    # 日志配置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "api.log")

# 创建全局配置实例
settings = Settings()