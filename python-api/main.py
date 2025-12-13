# python-api/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from typing import Optional
import json
from datetime import datetime
import pandas as pd
import numpy as np
from pydantic import BaseModel

# 导入配置
from config import settings

# 自定义功能模块
from text_analyzer import analyze_text_sentiment, extract_keywords
from data_visualizer import generate_report, create_visualization
from content_optimizer import optimize_content

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# 添加CORS中间件以允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型定义
class TextAnalysisRequest(BaseModel):
    text: str
    language: str = "zh"

class ContentOptimizationRequest(BaseModel):
    title: str
    content: str
    keywords: list[str]

class VisualizationRequest(BaseModel):
    data: list[dict]
    chart_type: str
    title: str

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now()}

# 文本情感分析和关键词提取
@app.post("/api/text-analysis")
async def text_analysis(request: TextAnalysisRequest):
    try:
        # 使用文本分析模块
        sentiment = analyze_text_sentiment(request.text, request.language)
        keywords = extract_keywords(request.text, request.language)
        
        return {
            "success": True,
            "sentiment": sentiment,
            "keywords": keywords,
            "language": request.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 内容优化建议
@app.post("/api/content-optimization")
async def content_optimization(request: ContentOptimizationRequest):
    try:
        # 使用内容优化模块
        optimization_report = optimize_content(
            request.title, 
            request.content, 
            request.keywords
        )
        
        return {
            "success": True,
            "report": optimization_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 生成数据可视化
@app.post("/api/visualization")
async def generate_visualization(request: VisualizationRequest):
    try:
        # 使用可视化模块
        image_path = create_visualization(
            request.data,
            request.chart_type,
            request.title
        )
        
        return {
            "success": True,
            "image_url": f"/visualizations/{image_path}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 数据报告生成
@app.get("/api/report/{report_type}")
async def generate_report_endpoint(report_type: str):
    try:
        report_data = generate_report(report_type)
        
        return {
            "success": True,
            "report_type": report_type,
            "data": report_data,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 高级分析功能
@app.post("/api/advanced-analytics")
async def advanced_analytics(data: dict):
    try:
        # 实现高级分析逻辑
        # 这里可以使用pandas, scikit-learn等库进行复杂的数据分析
        df = pd.DataFrame(data)
        
        # 示例：计算基本统计
        stats = {
            "count": len(df),
            "columns": list(df.columns),
            "summary": df.describe().to_dict() if not df.empty else {}
        }
        
        return {
            "success": True,
            "analysis": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )