# python-api/text_analyzer.py
"""
文本分析模块 - 包括情感分析和关键词提取
"""
import jieba
import jieba.analyse
from textblob import TextBlob
import re
from typing import List, Dict, Tuple

def analyze_text_sentiment(text: str, language: str = "zh") -> Dict:
    """
    分析文本情感
    """
    try:
        if language == "zh":
            # 中文情感分析的简化实现
            # 实际项目中可以使用更高级的模型如SnowNLP、THULAC等
            positive_words = ['好', '棒', '优秀', '喜欢', '满意', '推荐', '赞', '值得', '惊喜', '开心']
            negative_words = ['差', '糟糕', '失望', '讨厌', '不满', '垃圾', '烂', '坑', '失望', '难过']
            
            pos_count = sum(1 for word in positive_words if word in text)
            neg_count = sum(1 for word in negative_words if word in text)
            
            if pos_count > neg_count:
                sentiment = "positive"
                score = pos_count / len(text.split()) if text.split() else 0
            elif neg_count > pos_count:
                sentiment = "negative"
                score = neg_count / len(text.split()) if text.split() else 0
            else:
                sentiment = "neutral"
                score = 0.5  # 中性值
                
            return {
                "label": sentiment,
                "score": min(score, 1.0),
                "positive_words_found": pos_count,
                "negative_words_found": neg_count
            }
        else:
            # 使用TextBlob进行英文情感分析
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # -1 to 1
            
            if polarity > 0.1:
                sentiment = "positive"
            elif polarity < -0.1:
                sentiment = "negative"
            else:
                sentiment = "neutral"
                
            return {
                "label": sentiment,
                "score": polarity,
                "subjectivity": blob.sentiment.subjectivity
            }
    except Exception as e:
        return {
            "label": "unknown",
            "error": str(e)
        }

def extract_keywords(text: str, language: str = "zh", top_k: int = 10) -> List[str]:
    """
    提取文本关键词
    """
    try:
        if language == "zh":
            # 使用jieba进行中文关键词提取
            keywords = jieba.analyse.extract_tags(text, topK=top_k, withWeight=False)
            return keywords
        else:
            # 使用TextBlob进行英文关键词提取（简化版）
            blob = TextBlob(text)
            # 提取名词和形容词作为关键词
            words = [word for word, pos in blob.tags if pos in ['NN', 'NNS', 'NNP', 'NNPS', 'JJ', 'JJR', 'JJS']]
            return list(set(words))[:top_k]
    except Exception as e:
        return []

def preprocess_text(text: str) -> str:
    """
    预处理文本，去除特殊字符和多余空格
    """
    # 去除HTML标签
    text = re.sub(r'<[^>]+>', '', text)
    # 去除多余的空白字符
    text = re.sub(r'\s+', ' ', text)
    # 去除特殊字符，保留中英文、数字和基本标点
    text = re.sub(r'[^\w\s\u4e00-\u9fff.,!?;:]', ' ', text)
    return text.strip()

# 示例用法
if __name__ == "__main__":
    sample_text_zh = "这家餐厅的食物非常美味，服务也很棒，我非常喜欢这里。"
    sample_text_en = "The food at this restaurant is amazing, and the service is excellent. I really like it here."
    
    print("中文文本情感分析:")
    sentiment_zh = analyze_text_sentiment(sample_text_zh, "zh")
    print(f"情感: {sentiment_zh['label']}, 得分: {sentiment_zh['score']}")
    
    print("\n中文关键词提取:")
    keywords_zh = extract_keywords(sample_text_zh, "zh", 5)
    print(f"关键词: {keywords_zh}")
    
    print("\n英文文本情感分析:")
    sentiment_en = analyze_text_sentiment(sample_text_en, "en")
    print(f"情感: {sentiment_en['label']}, 得分: {sentiment_en['score']}")
    
    print("\n英文关键词提取:")
    keywords_en = extract_keywords(sample_text_en, "en", 5)
    print(f"关键词: {keywords_en}")