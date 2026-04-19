const http = require('http');

const paths = ['/', '/explore', '/exercises', '/exercise/example-slug', '/non-existent-path'];

function requestPath(p) {
  return new Promise((resolve) => {
    const options = { hostname: '127.0.0.1', port: 5000, path: p, method: 'GET' };
    const req = http.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (data.length < 2000) data += chunk;
      });
      res.on('end', () => {
        resolve({ path: p, statusCode: res.statusCode, contentStart: data.slice(0, 400) });
      });
    });
    req.on('error', (e) => resolve({ path: p, error: e.message }));
    req.end();
  });
}

(async () => {
  for (const p of paths) {
    const r = await requestPath(p);
    if (r.error) {
      console.log(`${p} -> ERROR: ${r.error}`);
    } else {
      console.log(`${p} -> ${r.statusCode} | content start:\n${r.contentStart}\n---`);
    }
  }
})();
