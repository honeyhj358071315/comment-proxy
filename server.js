const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// CORS中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'comment-proxy' });
});

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '代理服务正常工作!', timestamp: new Date().toISOString() });
});

// 代理路由 - 获取评论
app.get('/api/comments', async (req, res) => {
  try {
    const site = req.query.site || 'site1';
    
    // 使用原生fetch（Node.js 18+ 内置）
    const response = await fetch(`https://comment-api.honeyhj.workers.dev/comments?site=${site}`);
    
    if (!response.ok) {
      throw new Error(`Worker API返回 ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ 
      error: '获取评论失败',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`评论代理服务运行在端口 ${PORT}`);
  console.log('Node.js版本:', process.version);
});
