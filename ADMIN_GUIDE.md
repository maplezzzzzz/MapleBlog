# 小白天地 - 管理后台和Python功能集成

## 概述

本项目为基于Astro的静态网站集成了一个功能全面的管理后台和Python功能扩展服务。

### 管理后台功能

1. **内容管理** - 管理文章、页面、分类、标签等
2. **访问统计** - 查看网站访问数据和内容访问统计
3. **SEO优化** - 管理SEO设置和优化
4. **广告管理** - 管理网站广告位和广告内容
5. **网站设置** - 管理网站图标、备案信息、联系方式等
6. **Python功能集成** - 集成Python实现的高级功能

### Python功能特性

1. **文本分析** - 情感分析和关键词提取
2. **内容优化** - SEO和内容质量优化建议
3. **数据可视化** - 生成图表和报告
4. **高级分析** - 复杂数据处理和分析

## 部署说明

### 1. 准备工作

确保系统已安装：
- Node.js (>=18)
- Python (>=3.8)

### 2. Astro前端部署

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

管理后台可通过 `/admin` 访问。

### 3. Python API服务部署

```bash
# 进入Python API目录
cd python-api

# 创建并激活虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

或使用启动脚本：
```bash
./start.sh
```

### 4. 反向代理配置（生产环境）

在生产环境中，建议配置反向代理（如Nginx）来处理前端和Python API的请求：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Astro构建的静态文件
    location / {
        root /path/to/astro/dist;
        try_files $uri $uri/ /index.html;
    }

    # API请求转发到Python服务
    location /api/python {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 环境变量配置

### Astro部分

在 `.env` 文件中配置（参考 `.env.example`）：

```env
# 管理员用户名和密码（如果需要）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
PYTHON_API_URL=http://localhost:8000
```

### Python API部分

在 `python-api/.env` 文件中配置：

```env
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

### Astro API端点

- `GET /api/analytics/stats` - 访问统计数据
- `GET /api/analytics/top-posts` - 热门文章
- `GET /api/analytics/traffic-sources` - 流量来源
- `GET/POST /api/settings` - 网站设置
- `GET/POST/PUT/DELETE /api/ads` - 广告管理
- `GET/POST /api/seo/settings` - SEO设置
- `GET/POST/PUT/DELETE /api/content/*` - 内容管理

### Python API端点

- `GET /health` - 服务健康检查
- `POST /api/text-analysis` - 文本分析
- `POST /api/content-optimization` - 内容优化
- `POST /api/visualization` - 数据可视化
- `GET /api/report/{report_type}` - 生成报告
- `POST /api/advanced-analytics` - 高级分析

## 管理后台使用说明

### 登录

管理后台默认不需要登录。如需添加身份验证，可以在API层实现。

### 内容管理

1. 访问 `/admin/content` 管理文章和页面
2. 可以创建、编辑、删除内容
3. 支持草稿、已发布、归档等状态

### 访问统计

1. 访问 `/admin/analytics` 查看访问数据
2. 包括总访问量、今日访问、热门文章、流量来源等

### SEO优化

1. 访问 `/admin/seo` 管理SEO设置
2. 可配置网站标题、描述、关键词等

### Python功能集成

1. 访问 `/admin/python-integration` 使用Python功能
2. 包括文本分析、内容优化、数据可视化等

## 注意事项

1. 在生产环境中，务必配置适当的安全措施
2. 定期备份内容文件和数据
3. 监控API服务的运行状态
4. 适当调整Python API的并发和资源设置

## 扩展开发

如需添加新功能：

1. 前端功能：在 `/src/pages/admin` 下创建新的页面
2. Astro API：在 `/src/pages/api` 下创建新的路由
3. Python API：在 `python-api/` 目录下添加新的模块和端点

## 故障排除

1. **API调用失败**：
   - 检查跨域设置
   - 确认Python API服务正在运行

2. **内容无法保存**：
   - 检查文件权限
   - 确认路径配置正确

3. **Python依赖问题**：
   - 确认虚拟环境已激活
   - 重新安装依赖 `pip install -r requirements.txt`