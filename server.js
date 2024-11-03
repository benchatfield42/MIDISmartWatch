const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/sendData')) {
        // Extract query parameters
        const queryObject = url.parse(req.url, true).query;

        const x = queryObject.x;
        const y = queryObject.y;
        const z = queryObject.z;
        const direction = queryObject.direction;

        // Here you can process the data as needed, e.g., log it or use it for your application
        console.log(`Received data: X=${x}, Y=${y}, Z=${z}, Direction=${direction}`);

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Data received successfully');
    } else if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
