const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static('public'));

// CORS设置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 代理路由 - 获取评论
app.get('/api/comments', async (req, res) => {
  try {
    const site = req.query.site || 'site1';
    const response = await fetch(`https://comment-api.honeyhj.workers.dev/comments?site=${site}`);
    
    if (!response.ok) {
      throw new Error(`Worker API returned ${response.status}`);
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

// 代理路由 - 提交评论
app.post('/api/submit', async (req, res) => {
  try {
    const site = req.query.site || 'site1';
    const response = await fetch(`https://comment-api.honeyhj.workers.dev/submit?site=${site}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`Worker API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('提交评论失败:', error);
    res.status(500).json({ 
      error: '提交评论失败',
      details: error.message 
    });
  }
});

// 代理路由 - 删除评论
app.post('/api/admin/delete', async (req, res) => {
  try {
    const site = req.query.site || 'site1';
    const response = await fetch(`https://comment-api.honeyhj.workers.dev/admin/delete?site=${site}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`Worker API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({ 
      error: '删除评论失败',
      details: error.message 
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'comment-proxy' });
});

app.listen(PORT, () => {
  console.log(`评论代理服务运行在端口 ${PORT}`);
});