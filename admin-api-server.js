// admin-api-server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const { glob } = require('glob');
const matter = require('gray-matter');
const cors = require('cors'); // 需要安装cors
const app = express();
const PORT = 3000;

// 使用 CORS 中间件
app.use(cors());

// 服务静态文件
app.use(express.static(path.join(__dirname, 'admin-panel/public')));

// 解析 JSON 请求体
app.use(express.json());

// 模拟访问统计数据
let visitStats = {
  totalVisits: 5421,
  todayVisits: 42,
  onlineUsers: 8,
  postCount: 24
};

// 模拟热门文章数据
const topPosts = [
  { title: 'Astro静态站点生成器入门指南', slug: 'astro-static-site-generator-guide', views: 1240 },
  { title: 'TypeScript在现代Web开发中的应用', slug: 'typescript-in-modern-web-development', views: 982 },
  { title: 'Tailwind CSS响应式设计实践', slug: 'tailwind-css-responsive-design-practice', views: 876 },
  { title: 'React组件设计模式最佳实践', slug: 'react-component-design-patterns', views: 756 },
  { title: 'Node.js后端开发技巧', slug: 'nodejs-backend-development-tips', views: 634 }
];

// 模拟流量来源数据
const trafficSources = [
  { name: '直接访问', count: 2340, percentage: 45.2 },
  { name: '搜索引擎', count: 1890, percentage: 36.7 },
  { name: '社交媒体', count: 654, percentage: 12.3 },
  { name: '引荐网站', count: 301, percentage: 5.8 }
];

// API 端点 - 访问统计
app.get('/api/analytics/stats', (req, res) => {
  setTimeout(() => {
    res.json(visitStats);
  }, 300); // 模拟网络延迟
});

app.get('/api/analytics/top-posts', (req, res) => {
  setTimeout(() => {
    res.json(topPosts);
  }, 300);
});

app.get('/api/analytics/traffic-sources', (req, res) => {
  setTimeout(() => {
    res.json(trafficSources);
  }, 300);
});

// API 端点 - 内容列表
app.get('/api/content-list.json', (req, res) => {
  try {
    const contentType = req.query.type || 'blog';
    const contentDir = path.join(__dirname, 'src', 'content', contentType);
    
    let contentItems = [];
    
    if (fs.existsSync(contentDir)) {
      const files = glob.sync(path.join(contentDir, '**/*.{md,mdx}'));
      
      contentItems = files.map(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const { data } = matter(content);
        
        const relativePath = path.relative(contentDir, file);
        const slug = relativePath.replace(/\.(md|mdx)$/, '');
        
        return {
          id: `${contentType}/${slug}`,
          title: data.title || '未命名',
          status: data.status || data.draft ? 'draft' : 'published',
          createdAt: data.createdAt || new Date().toISOString().split('T')[0],
          views: Math.floor(Math.random() * 1000)
        };
      });
    }
    
    res.json(contentItems);
  } catch (error) {
    console.error('获取内容列表时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// API 端点 - 获取特定内容
app.get('/api/content/:type/:slug', (req, res) => {
  try {
    const { type, slug } = req.params;
    const contentDir = path.join(__dirname, 'src', 'content', type);
    const filePath = path.join(contentDir, `${slug}.md`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '内容未找到' });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    
    res.json({
      slug: `${type}/${slug}`,
      data,
      content: body
    });
  } catch (error) {
    console.error('获取内容时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// API 端点 - 保存内容
app.post('/api/content/:type/:slug', express.text({ type: 'text/plain' }), (req, res) => {
  try {
    const { type, slug } = req.params;
    const content = req.body;
    
    const contentDir = path.join(__dirname, 'src', 'content', type);
    const filePath = path.join(contentDir, `${slug}.md`);
    
    // 确保目录存在
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    
    res.json({ success: true, message: '内容已保存' });
  } catch (error) {
    console.error('保存内容时出错:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

// API 端点 - Python功能集成
app.post('/api/python/text-analysis', (req, res) => {
  // 这是一个模拟端点，实际应该调用Python API
  const { text, language } = req.body;
  
  // 模拟Python分析结果
  const result = {
    success: true,
    sentiment: {
      label: Math.random() > 0.5 ? 'positive' : 'neutral',
      score: Math.random()
    },
    keywords: ['关键词1', '关键词2', '关键词3']
  };
  
  res.json(result);
});

app.post('/api/python/content-optimization', (req, res) => {
  // 模拟内容优化结果
  const result = {
    success: true,
    report: {
      overall_score: 85,
      readability: { readability_score: 78 },
      suggestions: ['建议1', '建议2', '建议3']
    }
  };
  
  res.json(result);
});

// 根路径重定向到管理后台
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel/public/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`管理后台服务器运行在 http://localhost:${PORT}`);
  console.log(`管理后台界面: http://localhost:${PORT}`);
  console.log(`API 文档: http://localhost:${PORT}/api`);
});