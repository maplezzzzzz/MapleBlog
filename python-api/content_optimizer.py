# python-api/content_optimizer.py
"""
内容优化模块 - 提供SEO和内容质量优化建议
"""
import jieba
import jieba.analyse
from textstat import flesch_reading_ease, flesch_kincaid_grade
import re
from typing import Dict, List, Any
import math

def calculate_readability_score(content: str) -> Dict[str, float]:
    """
    计算内容可读性分数
    """
    # 简化的中文可读性计算（因为textstat主要针对英文）
    # 计算字符数、词数、句子数
    char_count = len(content)
    word_count = len(jieba.lcut(content))
    sentence_count = len(re.split(r'[。！？.!?]', content))
    
    # 计算一些基本指标
    avg_word_length = char_count / word_count if word_count > 0 else 0
    avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
    
    # 基于中文的可读性评估（简化版）
    # 分数越高表示可读性越好
    readability_score = 0
    if avg_sentence_length > 0:
        # 基于句子长度的可读性评估
        # 句子越短，可读性越好
        sentence_readability = max(0, 30 - avg_sentence_length) * 2
        readability_score += sentence_readability
    
    if avg_word_length > 0:
        # 基于词语长度的可读性评估
        word_readability = max(0, 5 - avg_word_length) * 5
        readability_score += word_readability
    
    # 限制分数在0-100范围内
    readability_score = min(100, max(0, readability_score))
    
    return {
        "readability_score": readability_score,
        "avg_word_length": round(avg_word_length, 2),
        "avg_sentence_length": round(avg_sentence_length, 2),
        "word_count": word_count,
        "sentence_count": sentence_count
    }

def analyze_keywords(content: str, keywords: List[str]) -> Dict[str, Any]:
    """
    分析关键词在内容中的使用情况
    """
    content_lower = content.lower()
    keyword_analysis = {}
    
    for keyword in keywords:
        keyword_lower = keyword.lower()
        count = content_lower.count(keyword_lower)
        density = count / len(content.split()) if content.split() else 0
        density_percentage = round(density * 100, 2)
        
        # 找到关键词在内容中的位置
        positions = [m.start() for m in re.finditer(re.escape(keyword_lower), content_lower)]
        
        keyword_analysis[keyword] = {
            "count": count,
            "density": density_percentage,
            "positions": positions,
            "suggestion": "良好" if 0.5 <= density <= 3.0 else ("过低" if density < 0.5 else "过高")
        }
    
    return keyword_analysis

def check_content_structure(content: str) -> Dict[str, Any]:
    """
    检查内容结构
    """
    # 检查是否有标题标签
    h1_count = len(re.findall(r'<h1>|# ', content))
    h2_count = len(re.findall(r'<h2>|## ', content))
    h3_count = len(re.findall(r'<h3>|### ', content))
    
    # 检查段落数
    paragraphs = re.split(r'\n\s*\n', content)
    paragraph_count = len([p for p in paragraphs if p.strip()])
    
    # 检查列表
    list_items = len(re.findall(r'<li>|^- |^\* |^\d+\.', content))
    
    # 检查图片
    image_count = len(re.findall(r'<img|!\[', content))
    
    return {
        "h1_count": h1_count,
        "h2_count": h2_count,
        "h3_count": h3_count,
        "paragraph_count": paragraph_count,
        "list_items_count": list_items,
        "image_count": image_count,
        "structure_score": min(100, (h2_count + h3_count + paragraph_count + image_count) * 2)
    }

def optimize_content(title: str, content: str, keywords: List[str]) -> Dict[str, Any]:
    """
    生成内容优化报告
    """
    # 计算可读性
    readability = calculate_readability_score(content)
    
    # 分析关键词
    keyword_analysis = analyze_keywords(content, keywords)
    
    # 检查内容结构
    structure = check_content_structure(content)
    
    # 计算整体内容质量分数
    content_score = 0
    
    # 可读性分数（占40%）
    content_score += readability["readability_score"] * 0.4
    
    # 结构分数（占30%）
    content_score += structure["structure_score"] * 0.3
    
    # 关键词密度分数（占30%）
    keyword_density_score = 0
    for keyword, analysis in keyword_analysis.items():
        if analysis["suggestion"] == "良好":
            keyword_density_score += 20
        elif analysis["suggestion"] == "过低":
            keyword_density_score += 5
        else:  # 过高
            keyword_density_score += 10
    # 平均关键词密度分数
    if keyword_analysis:
        keyword_density_score = keyword_density_score / len(keyword_analysis)
    content_score += keyword_density_score * 0.3
    
    # 生成优化建议
    suggestions = []
    
    # 可读性建议
    if readability["avg_sentence_length"] > 25:
        suggestions.append("句子过长，建议拆分为更短的句子以提高可读性")
    
    if readability["avg_word_length"] > 4:
        suggestions.append("词语过长，考虑使用更简单的词汇")
    
    # 关键词建议
    keyword_suggestions = []
    for keyword, analysis in keyword_analysis.items():
        if analysis["suggestion"] == "过低":
            keyword_suggestions.append(f"关键词 '{keyword}' 密度过低，建议增加使用")
        elif analysis["suggestion"] == "过高":
            keyword_suggestions.append(f"关键词 '{keyword}' 密度过高，建议减少使用")
    suggestions.extend(keyword_suggestions)
    
    # 结构建议
    if structure["h1_count"] == 0:
        suggestions.append("缺少主标题（H1），建议添加")
    if structure["h2_count"] < 2:
        suggestions.append("次级标题（H2）过少，建议增加以改善结构")
    if structure["paragraph_count"] < 3:
        suggestions.append("段落数较少，建议将内容分段以提高可读性")
    if structure["image_count"] == 0:
        suggestions.append("建议添加相关图片以丰富内容")
    
    return {
        "overall_score": round(content_score),
        "readability": readability,
        "keyword_analysis": keyword_analysis,
        "structure": structure,
        "suggestions": suggestions,
        "improvement_areas": [
            "可读性" if readability["readability_score"] < 70 else None,
            "关键词使用" if any(analysis["suggestion"] != "良好" for analysis in keyword_analysis.values()) else None,
            "内容结构" if structure["structure_score"] < 70 else None
        ],
        "title": title,
        "word_count": readability["word_count"]
    }

def generate_seo_report(title: str, content: str, keywords: List[str]) -> Dict[str, Any]:
    """
    生成SEO优化报告
    """
    # 检查标题长度
    title_length = len(title)
    title_length_status = "良好" if 10 <= title_length <= 60 else ("过短" if title_length < 10 else "过长")
    
    # 检查内容长度
    content_length = len(content)
    content_length_status = "良好" if content_length >= 300 else "过短"
    
    # 检查关键词在标题中的使用
    title_keywords = []
    for keyword in keywords:
        if keyword.lower() in title.lower():
            title_keywords.append(keyword)
    
    # 检查meta描述建议（假设内容前150字符可作为meta描述）
    meta_description = content[:150] + "..." if len(content) > 150 else content
    meta_desc_length = len(meta_description)
    meta_desc_status = "良好" if 50 <= meta_desc_length <= 160 else ("过短" if meta_desc_length < 50 else "过长")
    
    # 检查URL友好性（基于标题）
    url_friendly_title = re.sub(r'[^\w\s-]', '', title.lower().replace(' ', '-')).strip('-')
    url_length = len(url_friendly_title)
    url_status = "良好" if 3 <= url_length <= 50 else ("过短" if url_length < 3 else "过长")
    
    return {
        "title_analysis": {
            "length": title_length,
            "status": title_length_status,
            "keywords_in_title": title_keywords
        },
        "content_analysis": {
            "length": content_length,
            "status": content_length_status
        },
        "meta_description_analysis": {
            "length": meta_desc_length,
            "status": meta_desc_status,
            "suggestion": meta_description
        },
        "url_analysis": {
            "url_friendly_title": url_friendly_title,
            "length": url_length,
            "status": url_status
        },
        "keyword_analysis": analyze_keywords(content, keywords),
        "seo_score": calculate_seo_score(
            title_length_status, 
            content_length_status, 
            meta_desc_status, 
            url_status,
            len(title_keywords)
        )
    }

def calculate_seo_score(title_status: str, content_status: str, meta_desc_status: str, url_status: str, title_keywords_count: int) -> int:
    """
    计算SEO分数
    """
    score = 0
    
    # 标题状态
    if title_status == "良好":
        score += 25
    elif title_status == "过短":
        score += 15
    else:  # 过长
        score += 10
    
    # 内容状态
    if content_status == "良好":
        score += 25
    else:
        score += 10
    
    # meta描述状态
    if meta_desc_status == "良好":
        score += 20
    else:
        score += 10
    
    # URL状态
    if url_status == "良好":
        score += 15
    else:
        score += 5
    
    # 标题中的关键词数量（最多15分）
    score += min(title_keywords_count * 5, 15)
    
    return min(100, score)

# 示例用法
if __name__ == "__main__":
    sample_title = "Astro静态站点生成器完全指南：从入门到高级技巧"
    sample_content = """
    # Astro静态站点生成器完全指南
    
    Astro是一个现代化的静态站点生成器，它允许你使用React、Vue、Svelte等框架来构建超快的网站。通过Astro，你可以享受到服务端渲染(SSR)的优势，同时保持极小的客户端包大小。
    
    ## 为什么选择Astro？
    
    Astro提供了许多优势，包括：
    - 快速的页面加载速度
    - 优秀的SEO性能
    - 灵活的框架支持
    - 静态导出选项
    
    在本文中，我们将详细介绍Astro的安装、配置和使用方法。无论你是初学者还是有经验的开发者，都能从中获益。
    
    ### 安装和设置
    
    首先，我们需要安装Astro。你可以使用npm或yarn：
    
    ```bash
    npm create astro@latest
    ```
    
    这将启动Astro的创建向导，帮助你快速设置项目。
    
    ### 基本配置
    
    Astro的主要配置文件是astro.config.mjs。在这个文件中，你可以配置集成、构建选项等。
    
    通过合理的配置，你可以充分利用Astro的优势来构建高性能的网站。
    """
    sample_keywords = ["Astro", "静态站点生成器", "前端开发", "SSR", "性能优化"]
    
    print("内容优化报告:")
    optimization_report = optimize_content(sample_title, sample_content, sample_keywords)
    print(f"整体分数: {optimization_report['overall_score']}/100")
    print(f"建议: {optimization_report['suggestions']}")
    
    print("\nSEO优化报告:")
    seo_report = generate_seo_report(sample_title, sample_content, sample_keywords)
    print(f"SEO分数: {seo_report['seo_score']}/100")
    print(f"标题分析: {seo_report['title_analysis']}")
    print(f"内容分析: {seo_report['content_analysis']}")