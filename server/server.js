const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 路由
app.use('/api/breakfasts', require('./routes/breakfast'));
app.use('/api/user', require('./routes/user'));
app.use('/api/ai', require('./routes/ai'));

// 根路径重定向到index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`早餐管理应用已启动`);
  console.log(`访问地址: http://localhost:${PORT}`);
});
