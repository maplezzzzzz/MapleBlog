// enhanced-admin-api-server.js - 增强版管理后台API服务器
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8080;

// 启用CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 配置Multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'assets', 'uploads');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制5MB
  fileFilter: function (req, file, cb) {
    // 只接受图片
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('只允许上传图片文件!'), false);
    }
    cb(null, true);
  }
});

// 图片上传端点
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }
    
    // 返回图片URL
    const imageUrl = `/assets/uploads/${req.file.filename}`;
    res.json({ 
      errno: 0, // wangEditor 需要的格式
      data: {
        url: imageUrl,
        alt: req.file.originalname,
        href: imageUrl
      },
      imageUrl: imageUrl // 兼容旧代码
    });
  } catch (error) {
    console.error('上传出错:', error);
    res.status(500).json({ error: '上传图片失败: ' + error.message });
  }
});

// 从现有的python-integration.js导入Python集成功能
const { addPythonIntegrationEndpoints } = require('./python-integration.js');

// 添加Python集成端点
addPythonIntegrationEndpoints(app);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 为管理后台提供服务
app.get('/admin/*', (req, res) => {
  // 由于Astro会处理这些路由，我们返回index.html让前端路由处理
  res.sendFile(path.join(__dirname, 'dist', 'admin', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`管理后台API服务器运行在端口 ${PORT}`);
  console.log(`访问管理后台: http://localhost:${PORT}/admin`);
});

module.exports = app;