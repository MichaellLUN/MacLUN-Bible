const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// 常用文件的 MIME 类型映射
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    // 提取纯净路径，去除如 ?v=123 这样的查询参数
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/' || urlPath === '') {
        urlPath = '/index.html';
    }

    // 转码处理并拼接出安全的本地绝对路径
    let filePath = path.join(__dirname, decodeURIComponent(urlPath));
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // 异步高速读取响应
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('文件未找到: 404', 'utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('服务器内部错误: ' + err.code, 'utf-8');
            }
        } else {
            // 配置缓存控制，解决加载问题，同时允许跨域
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=0, must-revalidate'
            });
            res.end(content);
        }
    });
});

// 监听 0.0.0.0，使局域网其他设备都能访问，而且不会有 IPv6 的回退延迟
server.listen(PORT, '0.0.0.0', () => {
    console.log('=======================================');
    console.log('极速本地圣经服务器已启动！几乎0延迟加载。');
    console.log('=======================================\n');
    console.log('请在同一局域网的手机或平板浏览器中访问:');

    const nets = require('os').networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`=> http://${net.address}:${PORT}`);
            }
        }
    }
    console.log(`=> http://localhost:${PORT} (本机访问)\n`);
});
