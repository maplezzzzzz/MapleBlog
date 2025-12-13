# python-api/data_visualizer.py
"""
数据可视化模块 - 生成图表和报告
"""
import matplotlib
matplotlib.use('Agg')  # 使用非GUI后端
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import seaborn as sns
from datetime import datetime
import os
from typing import List, Dict, Any
import json

def generate_report(report_type: str) -> Dict[str, Any]:
    """
    根据报告类型生成数据报告
    """
    if report_type == "traffic":
        # 模拟流量报告数据
        return {
            "period": "2025-01-01 to 2025-01-31",
            "total_visits": 24589,
            "unique_visitors": 18234,
            "page_views": 42105,
            "bounce_rate": 0.42,
            "avg_session_duration": "3m 24s",
            "top_pages": [
                {"page": "/blog/astro-guide", "views": 1240},
                {"page": "/blog/typescript-tips", "views": 982},
                {"page": "/blog/tailwind-practice", "views": 876}
            ],
            "traffic_sources": [
                {"source": "直接访问", "percentage": 45.2},
                {"source": "搜索引擎", "percentage": 27.7},
                {"source": "社交媒体", "percentage": 16.3}
            ]
        }
    elif report_type == "content":
        # 模拟内容报告数据
        return {
            "period": "2025-01-01 to 2025-01-31",
            "total_posts": 42,
            "published_posts": 38,
            "draft_posts": 4,
            "avg_reading_time": "5m 32s",
            "top_categories": [
                {"category": "开发", "count": 18},
                {"category": "生活", "count": 12},
                {"category": "技术", "count": 8}
            ],
            "engagement_metrics": {
                "total_comments": 324,
                "avg_comments_per_post": 7.7,
                "social_shares": 128
            }
        }
    elif report_type == "seo":
        # 模拟SEO报告数据
        return {
            "period": "2025-01-01 to 2025-01-31",
            "organic_traffic": 10856,
            "impressions": 45210,
            "click_through_rate": 0.24,
            "top_keywords": [
                {"keyword": "Astro", "impressions": 2450, "clicks": 124},
                {"keyword": "TypeScript", "impressions": 1980, "clicks": 98},
                {"keyword": "前端开发", "impressions": 1750, "clicks": 87}
            ],
            "indexed_pages": 128,
            "technical_issues": {
                "pages_with_errors": 3,
                "missing_alt_tags": 12,
                "slow_pages": 5
            }
        }
    else:
        return {"error": f"Unknown report type: {report_type}"}

def create_visualization(data: List[Dict], chart_type: str, title: str) -> str:
    """
    创建数据可视化图表
    """
    try:
        # 创建输出目录
        output_dir = "python-api/visualizations"
        os.makedirs(output_dir, exist_ok=True)
        
        # 生成唯一文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{chart_type}_{timestamp}.png"
        filepath = os.path.join(output_dir, filename)
        
        # 准备数据
        df = pd.DataFrame(data)
        
        # 设置中文字体
        plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
        plt.rcParams['axes.unicode_minus'] = False
        
        # 创建图表
        plt.figure(figsize=(10, 6))
        
        if chart_type == "bar":
            if 'x' in df.columns and 'y' in df.columns:
                plt.bar(df['x'], df['y'])
            else:
                # 如果数据列名不同，尝试其他常见列名
                x_col = df.columns[0] if len(df.columns) > 0 else 'index'
                y_col = df.columns[1] if len(df.columns) > 1 else 'value'
                plt.bar(df[x_col], df[y_col])
        elif chart_type == "line":
            if 'x' in df.columns and 'y' in df.columns:
                plt.plot(df['x'], df['y'], marker='o')
            else:
                x_col = df.columns[0] if len(df.columns) > 0 else 'index'
                y_col = df.columns[1] if len(df.columns) > 1 else 'value'
                plt.plot(df[x_col], df[y_col], marker='o')
        elif chart_type == "pie":
            if 'label' in df.columns and 'value' in df.columns:
                plt.pie(df['value'], labels=df['label'], autopct='%1.1f%%')
            else:
                y_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]
                labels = df.iloc[:, 0] if len(df.columns) > 1 else range(len(df))
                plt.pie(df[y_col], labels=labels, autopct='%1.1f%%')
        elif chart_type == "scatter":
            if 'x' in df.columns and 'y' in df.columns:
                plt.scatter(df['x'], df['y'])
            else:
                x_col = df.columns[0] if len(df.columns) > 0 else 'index'
                y_col = df.columns[1] if len(df.columns) > 1 else 'value'
                plt.scatter(df[x_col], df[y_col])
        else:
            # 默认使用柱状图
            if 'x' in df.columns and 'y' in df.columns:
                plt.bar(df['x'], df['y'])
            else:
                x_col = df.columns[0] if len(df.columns) > 0 else 'index'
                y_col = df.columns[1] if len(df.columns) > 1 else 'value'
                plt.bar(df[x_col], df[y_col])
        
        plt.title(title)
        plt.xlabel('X轴')
        plt.ylabel('Y轴')
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # 保存图表
        plt.savefig(filepath)
        plt.close()
        
        return filename
    except Exception as e:
        print(f"创建可视化图表时出错: {e}")
        return f"error_{str(e)}.png"

def create_advanced_visualization(data: List[Dict], chart_type: str, title: str, config: Dict = None) -> str:
    """
    创建高级数据可视化图表
    """
    try:
        output_dir = "python-api/visualizations"
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"advanced_{chart_type}_{timestamp}.png"
        filepath = os.path.join(output_dir, filename)
        
        df = pd.DataFrame(data)
        
        # 设置中文字体
        plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
        plt.rcParams['axes.unicode_minus'] = False
        
        # 使用seaborn创建更美观的图表
        plt.figure(figsize=(12, 8))
        
        if chart_type == "heatmap":
            # 相关性热图
            if config and 'columns' in config:
                selected_df = df[config['columns']]
                sns.heatmap(selected_df.corr(), annot=True, cmap='coolwarm', center=0)
        elif chart_type == "boxplot":
            # 箱线图
            x_col = config.get('x', df.columns[0]) if config else df.columns[0]
            y_col = config.get('y', df.columns[1]) if config and 'y' in config else df.columns[1] if len(df.columns) > 1 else df.columns[0]
            sns.boxplot(x=x_col, y=y_col, data=df)
        elif chart_type == "histogram":
            # 直方图
            col = config.get('column', df.columns[0]) if config else df.columns[0]
            sns.histplot(data=df, x=col, bins=config.get('bins', 20) if config else 20)
        elif chart_type == "violin":
            # 小提琴图
            x_col = config.get('x', df.columns[0]) if config else df.columns[0]
            y_col = config.get('y', df.columns[1]) if config and 'y' in config else df.columns[1] if len(df.columns) > 1 else df.columns[0]
            sns.violinplot(x=x_col, y=y_col, data=df)
        else:
            # 默认柱状图
            x_col = df.columns[0] if len(df.columns) > 0 else 'index'
            y_col = df.columns[1] if len(df.columns) > 1 else 'value'
            sns.barplot(x=x_col, y=y_col, data=df)
        
        plt.title(title)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        plt.savefig(filepath)
        plt.close()
        
        return filename
    except Exception as e:
        print(f"创建高级可视化图表时出错: {e}")
        return f"error_{str(e)}.png"

# 示例用法
if __name__ == "__main__":
    # 创建示例数据
    sample_data = [
        {"x": "一月", "y": 120},
        {"x": "二月", "y": 190},
        {"x": "三月", "y": 150},
        {"x": "四月", "y": 210},
        {"x": "五月", "y": 180},
        {"x": "六月", "y": 230}
    ]
    
    # 创建柱状图
    bar_chart = create_visualization(sample_data, "bar", "月度访问量")
    print(f"柱状图已保存: {bar_chart}")
    
    # 创建饼图
    pie_data = [
        {"label": "直接访问", "value": 5240},
        {"label": "搜索引擎", "value": 3210},
        {"label": "社交媒体", "value": 1890},
        {"label": "引荐网站", "value": 654}
    ]
    pie_chart = create_visualization(pie_data, "pie", "流量来源分布")
    print(f"饼图已保存: {pie_chart}")
    
    # 测试报告生成
    traffic_report = generate_report("traffic")
    print("\n流量报告:")
    print(json.dumps(traffic_report, ensure_ascii=False, indent=2))
    
    content_report = generate_report("content")
    print("\n内容报告:")
    print(json.dumps(content_report, ensure_ascii=False, indent=2))