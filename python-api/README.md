# 小白天地 - Python API服务

这是一个为Astro静态网站提供Python功能扩展的API服务。

## 功能特性

- **文本分析**：情感分析和关键词提取
- **内容优化**：SEO和内容质量优化建议
- **数据可视化**：生成图表和报告
- **高级分析**：复杂数据处理和分析

## 安装与运行

### 1. 安装依赖

```bash
cd python-api
pip install -r requirements.txt
```

### 2. 启动服务

```bash
# 方法1：使用启动脚本
./start.sh

# 方法2：直接运行
python main.py
```

### 3. 环境变量配置

创建 `.env` 文件来自定义配置：

```bash
# 服务器配置
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS配置
ALLOWED_ORIGINS=http://localhost:4321,https://yourdomain.com

# 文本分析配置
DEFAULT_LANGUAGE=zh
MAX_TEXT_LENGTH=10000

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=api.log
```

## API端点

### 健康检查
- `GET /health` - 检查API服务状态

### 文本分析
- `POST /api/text-analysis` - 文本情感分析和关键词提取

### 内容优化
- `POST /api/content-optimization` - 内容优化建议

### 数据可视化
- `POST /api/visualization` - 生成数据可视化图表
- `GET /api/report/{report_type}` - 生成特定类型的报告

### 高级分析
- `POST /api/advanced-analytics` - 高级数据分析

## 使用示例

### 文本分析

```bash
curl -X POST http://localhost:8000/api/text-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "text": "这家餐厅的食物非常美味，服务也很棒，我非常喜欢这里。",
    "language": "zh"
  }'
```

### 内容优化

```bash
curl -X POST http://localhost:8000/api/content-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Astro静态站点生成器完全指南",
    "content": "Astro是一个现代化的静态站点生成器...",
    "keywords": ["Astro", "静态站点", "前端开发"]
  }'
```

## 在Astro项目中的集成

API服务启动后，Astro前端可以通过以下方式调用Python功能：

```javascript
// 调用文本分析功能
async function analyzeText(text) {
  const response = await fetch('http://localhost:8000/api/text-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      language: 'zh'
    })
  });
  
  return response.json();
}
```

> 注意：在生产环境中，需要配置适当的反向代理来处理跨域请求。

## 依赖库说明

- `fastapi` - 现代、快速的Web框架
- `uvicorn` - ASGI服务器
- `pandas` - 数据分析和处理
- `jieba` - 中文分词
- `matplotlib/seaborn` - 数据可视化
- `textstat` - 文本统计分析