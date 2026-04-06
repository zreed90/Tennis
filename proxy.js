/**
 * Tennis Match Predictor — Local CORS Proxy
 * ==========================================
 * Relays requests to api.sportradar.com so the browser
 * isn't blocked by CORS / CSP policies.
 *
 * Requirements: Node.js 18+  (uses built-in fetch)
 *
 * Usage:
 *   node proxy.js
 *
 * Then open Tennis_Markov_Predictor_fixed.html in your browser.
 * The app will automatically detect the proxy and load live stats.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PORT || 3007;

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (reqUrl.pathname === '/' || reqUrl.pathname === '/index.html') {
    const fs = require('fs');
    const path = require('path');
    const htmlPath = path.join(__dirname, 'Tennis_Markov_Predictor_fixed.html');
    
    fs.readFile(htmlPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading HTML file');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
    return;
  }

  // Health check endpoint
  if (reqUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Proxy endpoint: /sportradar?url=<encoded-sportradar-url>
  if (reqUrl.pathname === '/sportradar') {
    const target = reqUrl.searchParams.get('url');
    if (!target) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing ?url= parameter' }));
      return;
    }

    console.log(`[proxy] → ${target.split('?')[0]}`);

    try {
      const upstream = await fetch(target, {
        headers: { 'Accept': 'application/json' }
      });

      if (!upstream.ok) {
        console.error(`[proxy] upstream ${upstream.status} for ${target}`);
        res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Sportradar returned ${upstream.status}` }));
        return;
      }

      const data = await upstream.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));

    } catch (err) {
      console.error(`[proxy] error: ${err.message}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`\n✅ Tennis Predictor proxy running on http://localhost:${PORT}`);
  console.log(`   Now open Tennis_Markov_Predictor_fixed.html in your browser.\n`);
});
const start = Date.now();

const upstream = await fetch(target);

const data = await upstream.json();

const latency = Date.now() - start;
console.log(`API Latency: ${latency} ms`);
