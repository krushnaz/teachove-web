const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: false
}));

// Proxy all /api requests to your backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  pathRewrite: {
    '^/api': '/api', // Keep the /api prefix
  },
  onProxyReq: function(proxyReq, req, res) {
    console.log('Proxying request:', req.method, req.url);
    console.log('Target URL:', proxyReq.path);
  },
  onProxyRes: function(proxyRes, req, res) {
    console.log('Proxy response:', proxyRes.statusCode, req.url);
  },
}));

app.listen(PORT, () => {
  console.log(`CORS Proxy running on http://localhost:${PORT}`);
  console.log(`Proxying /api/* to http://localhost:5000/api/*`);
}); 