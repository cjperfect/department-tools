/**
 * Mock API 服务器 — 模拟 JustOne API 返回
 *
 * 数据来源: mock/*.json
 *
 * 使用方式:
 *   npm run dev
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;
const MOCK_DIR = path.resolve(__dirname, 'mock');

function loadJson(filename) {
  const filePath = path.join(MOCK_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ---------------------------------------------------------------------------
// 路由
// ---------------------------------------------------------------------------
// 淘宝天猫搜索
app.get('/api/taobao/search-item-list/v1', (req, res) => {
  const { token, keyword } = req.query;
  const data = loadJson('taobao_search.json');
  if (!data) return res.status(404).json({ code: 404, message: '数据文件不存在' });

  console.log(`[${new Date().toLocaleTimeString()}] GET ${req.path}`, { keyword });
  res.json(data);
});

// 京东搜索
app.get('/api/jd/search-item-list/v1', (req, res) => {
  const { token,keyword } = req.query;
  const data = loadJson('jd_search.json');
  if (!data) return res.status(404).json({ code: 404, message: '数据文件不存在' });

  console.log(`[${new Date().toLocaleTimeString()}] GET ${req.path}`, { keyword });
  res.json(data);
});

// 抖音电商搜索
app.get('/api/douyin-ec/search-item-list/v1', (req, res) => {
  const { token, keyword } = req.query;
  const data = loadJson('dy_search.json');
  if (!data) return res.status(404).json({ code: 404, message: '数据文件不存在' });

  console.log(`[${new Date().toLocaleTimeString()}] GET ${req.path}`, { keyword });
  res.json(data);
});

// ---------------------------------------------------------------------------
// 启动
// ---------------------------------------------------------------------------

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🧪 Mock API 服务器已启动: http://127.0.0.1:${PORT}`);
});
