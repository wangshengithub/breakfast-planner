const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' })); // 增大限制以支持数据导入
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 路由注册
app.use('/api/breakfasts', require('./routes/breakfast'));
app.use('/api/user', require('./routes/user'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/data', require('./routes/data'));
app.use('/api/templates', require('./routes/template'));

// 本地提供 Chart.js（从 node_modules），前端懒加载使用
app.get('/vendor/chart.js', (req, res) => {
  const chartPath = path.join(__dirname, '../node_modules/chart.js/dist/chart.umd.js');
  res.setHeader('Content-Type', 'application/javascript');
  // 缓存7天，减少重复请求
  res.setHeader('Cache-Control', 'public, max-age=604800');
  res.sendFile(chartPath, (err) => {
    if (err) {
      console.error('提供 Chart.js 文件失败:', err);
      res.status(404).send('Chart.js not found. Please run: npm install chart.js');
    }
  });
});

// 根路径重定向到index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API 404 兜底（放在所有路由之后）
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`早餐管理应用已启动`);
  console.log(`访问地址: http://localhost:${PORT}`);
});
