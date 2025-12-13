// enhanced-admin-api-server.js (添加图片上传功能)
const express = require('express');
const path = require('path');
const fs = require('fs');
const { glob } = require('glob');
const matter = require('gray-matter');
const cors = require('cors');
const multer = require('multer'); // 添加文件上传支持
const app = express();
const PORT = 3000;

// 配置 multer 用于处理文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'src/assets/images/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 使用中间件
app.use(cors());
app.use(express.static(path.join(__dirname, 'admin-panel/public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 从文件系统读取真实的博客文章数量
function getRealPostCount() {
  const blogDir = path.join(__dirname, 'src', 'content', 'blog');
  if (fs.existsSync(blogDir)) {
    const files = glob.sync(path.join(blogDir, '**/*.{md,mdx}'));
    // 过滤掉索引文件
    return files.filter(file => !file.endsWith('-index.md')).length;
  }
  return 0;
}

// 从文件系统读取真实的博客文章列表
function getRealBlogPosts() {
  const blogDir = path.join(__dirname, 'src', 'content', 'blog');
  const posts = [];
  
  if (fs.existsSync(blogDir)) {
    const files = glob.sync(path.join(blogDir, '**/*.{md,mdx}'));
    
    for (const file of files) {
      // 跳过索引文件
      if (file.endsWith('-index.md')) continue;
      
      const content = fs.readFileSync(file, 'utf-8');
      const { data } = matter(content);
      
      const relativePath = path.relative(blogDir, file);
      const slug = relativePath.replace(/\.(md|mdx)$/, '');
      
      posts.push({
        id: `blog/${slug}`,
        title: data.title || '未命名',
        description: data.description,
        status: data.status || data.draft ? 'draft' : 'published',
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : null,
        categories: data.categories || [],
        tags: data.tags || [],
        featured: data.featured || false,
        views: data.views || 0,
        featuredImg: data.featuredImg || data.image || null
      });
    }
  }
  
  return posts;
}

// 从文件系统读取其他类型的内容
function getRealContentList(contentType) {
  const contentDir = path.join(__dirname, 'src', 'content', contentType);
  const items = [];
  
  if (fs.existsSync(contentDir)) {
    const files = glob.sync(path.join(contentDir, '**/*.{md,mdx}'));
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const { data } = matter(content);
      
      const relativePath = path.relative(contentDir, file);
      const slug = relativePath.replace(/\.(md|mdx)$/, '');
      
      items.push({
        id: `${contentType}/${slug}`,
        title: data.title || '未命名',
        description: data.description,
        status: data.status || data.draft ? 'draft' : 'published',
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : null,
        views: data.views || 0
      });
    }
  }
  
  return items;
}

// 模拟访问统计
let visitStats = {
  totalVisits: 0,
  todayVisits: 0,
  onlineUsers: 0,
  postCount: getRealPostCount()
};

// 模拟热门文章
function getTopPosts() {
  const allPosts = getRealBlogPosts();
  return allPosts
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(post => ({
      title: post.title,
      slug: post.id.split('/')[1],
      views: post.views || Math.floor(Math.random() * 1000)
    }));
}

// 模拟流量来源
const trafficSources = [
  { name: '直接访问', count: 2340, percentage: 45.2 },
  { name: '搜索引擎', count: 1890, percentage: 36.7 },
  { name: '社交媒体', count: 654, percentage: 12.3 },
  { name: '引荐网站', count: 301, percentage: 5.8 }
];

// 模拟更新统计数据
setInterval(() => {
  visitStats.totalVisits = Math.floor(Math.random() * 1000) + visitStats.postCount * 10;
  visitStats.todayVisits = Math.floor(Math.random() * 50) + 10;
  visitStats.onlineUsers = Math.floor(Math.random() * 20) + 1;
  visitStats.postCount = getRealPostCount();
}, 30000);

// API 端点 - 访问统计
app.get('/api/analytics/stats', (req, res) => {
  res.json({
    totalVisits: visitStats.totalVisits,
    todayVisits: visitStats.todayVisits,
    onlineUsers: visitStats.onlineUsers,
    postCount: visitStats.postCount
  });
});

app.get('/api/analytics/top-posts', (req, res) => {
  res.json(getTopPosts());
});

app.get('/api/analytics/traffic-sources', (req, res) => {
  res.json(trafficSources);
});

// API 端点 - 内容列表
app.get('/api/content-list.json', (req, res) => {
  const contentType = req.query.type || 'blog';
  
  try {
    let contentItems = [];
    
    if (contentType === 'blog') {
      contentItems = getRealBlogPosts();
    } else {
      contentItems = getRealContentList(contentType);
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
app.post('/api/content/:type/:slug', (req, res) => {
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

// 新增：创建新内容的API
app.post('/api/content', (req, res) => {
  try {
    const { type, slug, data, content } = req.body;
    
    if (!type || !slug || !data || !content) {
      return res.status(400).json({ error: '缺少必需字段' });
    }
    
    const contentDir = path.join(__dirname, 'src', 'content', type);
    const filePath = path.join(contentDir, `${slug}.md`);
    
    // 确保目录存在
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    // 使用 gray-matter 创建内容
    const fileContent = matter.stringify(content, data);
    fs.writeFileSync(filePath, fileContent);
    
    res.json({ 
      success: true, 
      message: '内容已创建',
      slug: `${type}/${slug}`
    });
  } catch (error) {
    console.error('创建内容时出错:', error);
    res.status(500).json({ error: '创建失败' });
  }
});

// 新增：图片上传API
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }
    
    // 返回图片URL
    const imageUrl = `/src/assets/images/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      message: '图片上传成功',
      filename: req.file.filename,
      path: imageUrl,
      originalname: req.file.originalname
    });
  } catch (error) {
    console.error('上传图片时出错:', error);
    res.status(500).json({ error: '上传失败' });
  }
});

// 获取上传的图片列表
app.get('/api/images', (req, res) => {
  try {
    const uploadDir = path.join(__dirname, 'src/assets/images/uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(uploadDir);
    const images = files.map(file => ({
      name: file,
      url: `/src/assets/images/uploads/${file}`,
      size: fs.statSync(path.join(uploadDir, file)).size,
      uploadedAt: fs.statSync(path.join(uploadDir, file)).mtime
    }));
    
    res.json(images);
  } catch (error) {
    console.error('获取图片列表时出错:', error);
    res.status(500).json({ error: '获取图片列表失败' });
  }
});

// API 端点 - Python功能集成
app.post('/api/python/text-analysis', (req, res) => {
  const { text, language } = req.body;
  
  // 模拟Python分析结果
  const result = {
    success: true,
    sentiment: {
      label: Math.random() > 0.5 ? 'positive' : (Math.random() > 0.3 ? 'neutral' : 'negative'),
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
      overall_score: Math.floor(Math.random() * 40) + 60, // 60-100之间的随机分数
      readability: { readability_score: Math.floor(Math.random() * 40) + 60 },
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
  console.log(`增强版管理后台服务器运行在 http://localhost:${PORT}`);
  console.log(`管理后台界面: http://localhost:${PORT}`);
  console.log(`API 文档: http://localhost:${PORT}/api`);
  console.log(`真实文章数量: ${getRealPostCount()}`);
  console.log(`图片上传目录: /src/assets/images/uploads`);
  console.log(`可用内容类型: blog, pages, notes, about, categories, tags`);
});