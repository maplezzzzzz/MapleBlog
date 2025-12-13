// admin-server.js - AdminJS 服务器
const express = require('express');
const AdminJS = require('adminjs');
const { buildRouter } = require('@adminjs/express');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { glob } = require('glob');
const matter = require('gray-matter');

// 导入配置和Python集成
const { adminJsConfig } = require('./adminjs.config.js');
const { addPythonIntegrationEndpoints } = require('./python-integration.js');

// 创建 AdminJS 实例
const adminJs = new AdminJS(adminJsConfig);

// 创建路由器
const adminRouter = buildRouter(adminJs);

// 创建 Express 应用
const app = express();

// 解析表单数据
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 使用 AdminJS 路由器
app.use(adminJs.options.rootPath, adminRouter);

// 为 Astro 内容提供 API 端点
app.get('/api/content', (req, res) => {
  try {
    const contentDir = path.join(__dirname, 'src', 'content');
    const contentTypes = ['blog', 'pages', 'notes', 'about'];
    
    const results = [];
    
    contentTypes.forEach(type => {
      const typeDir = path.join(contentDir, type);
      if (fs.existsSync(typeDir)) {
        const files = glob.sync(path.join(typeDir, '**/*.{md,mdx}'));
        
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf-8');
          const { data, content: body } = matter(content);
          
          const relativePath = path.relative(typeDir, file);
          const slug = relativePath.replace(/\.(md|mdx)$/, '');
          
          results.push({
            type,
            slug: `${type}/${slug}`,
            title: data.title || '未命名',
            description: data.description,
            status: data.status || data.draft ? 'draft' : 'published',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            categories: data.categories || [],
            tags: data.tags || [],
            contentPreview: body.length > 200 ? body.substring(0, 200) + '...' : body
          });
        });
      }
    });
    
    res.json(results);
  } catch (error) {
    console.error('获取内容列表时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 保存内容的 API 端点
app.post('/api/content', (req, res) => {
  try {
    const { slug, data, content } = req.body;
    
    if (!slug || !data || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 解析 slug 获取内容类型和文件名
    const [type, ...slugParts] = slug.split('/');
    const fileName = slugParts.join('/');
    
    const contentDir = path.join(__dirname, 'src', 'content', type);
    const filePath = path.join(contentDir, `${fileName}.md`);
    
    // 确保目录存在
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    // 使用 gray-matter 创建内容
    const fileContent = matter.stringify(content, data);
    fs.writeFileSync(filePath, fileContent);
    
    res.json({ success: true, message: '内容已保存' });
  } catch (error) {
    console.error('保存内容时出错:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

// 获取特定内容的端点
app.get('/api/content/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const [type, ...slugParts] = slug.split('/');
    const fileName = slugParts.join('/');
    
    const contentDir = path.join(__dirname, 'src', 'content', type);
    const filePath = path.join(contentDir, `${fileName}.md`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '内容未找到' });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    
    res.json({
      slug,
      data,
      content: body
    });
  } catch (error) {
    console.error('获取内容时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 访问统计相关功能
let visitStats = {
  totalVisits: 0,
  todayVisits: 0,
  onlineUsers: 0,
  postCount: 0,
  topPosts: [],
  trafficSources: []
};

// 模拟访问统计更新
setInterval(() => {
  // 在实际实现中，这些数据应该从数据库或日志文件中获取
  visitStats.totalVisits = Math.floor(Math.random() * 10000) + 5000;
  visitStats.todayVisits = Math.floor(Math.random() * 100) + 20;
  visitStats.onlineUsers = Math.floor(Math.random() * 50) + 5;

  // 模拟文章数量
  try {
    const blogDir = path.join(__dirname, 'src', 'content', 'blog');
    if (fs.existsSync(blogDir)) {
      const blogFiles = glob.sync(path.join(blogDir, '**/*.{md,mdx}'));
      visitStats.postCount = blogFiles.length;
    }
  } catch (e) {
    console.error('获取文章数量时出错:', e);
  }

  // 模拟热门文章
  visitStats.topPosts = [
    { title: 'Astro静态站点生成器入门指南', slug: 'astro-static-site-generator-guide', views: 1240 },
    { title: 'TypeScript在现代Web开发中的应用', slug: 'typescript-in-modern-web-development', views: 982 },
    { title: 'Tailwind CSS响应式设计实践', slug: 'tailwind-css-responsive-design-practice', views: 876 },
    { title: 'React组件设计模式最佳实践', slug: 'react-component-design-patterns', views: 756 },
    { title: 'Node.js后端开发技巧', slug: 'nodejs-backend-development-tips', views: 634 }
  ];

  // 模拟流量来源
  visitStats.trafficSources = [
    { name: '直接访问', count: 5240, percentage: 45.2 },
    { name: '搜索引擎', count: 3210, percentage: 27.7 },
    { name: '社交媒体', count: 1890, percentage: 16.3 },
    { name: '引荐网站', count: 654, percentage: 5.6 },
    { name: '其他', count: 598, percentage: 5.2 }
  ];
}, 30000); // 每30秒更新一次模拟数据

// 访问统计API端点
app.get('/api/analytics/stats', (req, res) => {
  res.json(visitStats);
});

app.get('/api/analytics/top-posts', (req, res) => {
  res.json(visitStats.topPosts);
});

app.get('/api/analytics/traffic-sources', (req, res) => {
  res.json(visitStats.trafficSources);
});

// 添加Python集成端点
addPythonIntegrationEndpoints(app);

// 启动服务器
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`AdminJS 服务器运行在 http://localhost:${PORT}${adminJs.options.rootPath}`);
  console.log(`API 端点: http://localhost:${PORT}/api`);
  console.log(`Python API 集成: http://localhost:${PORT}/api/python`);
  console.log(`访问统计API: http://localhost:${PORT}/api/analytics`);
});

// 添加优雅关闭
process.on('SIGTERM', () => {
  console.log('接收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});