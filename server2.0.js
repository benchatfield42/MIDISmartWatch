const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const https = require('https');

const app = express();

// Use CORS middleware
app.use(cors()); // Allow all origins

// Middleware to parse JSON requests
app.use(express.json());

app.get("/getPublicIP", (req, res) => {
    https.get("https://api.ipify.org?format=json", (response) => {
        let data = "";

        response.on("data", (chunk) => {
            data += chunk;
        });

        response.on("end", () => {
            try {
                const publicIP = JSON.parse(data).ip;
                res.json({ publicIP }); // Send the public IP as JSON
            } catch (err) {
                res.status(500).json({ error: "Failed to parse IP response" });
            }
        });
    }).on("error", (err) => {
        console.error("Error fetching public IP:", err.message);
        res.status(500).json({ error: "Error fetching public IP" });
    });
});

// Serve the index.html file
app.get('/', (req, res) => {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
        if (err) {
            res.status(500).send('Server Error');
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.status(200).end(content);
    });
});

// Start the HTTP server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));

// Create two WebSocket servers: one for notes, one for scale banks
const wss1 = new WebSocket.Server({ server, path: '/notes' }); // For Watch 1 (note selection)
const wss2 = new WebSocket.Server({ server, path: '/scale' }); // For Watch 2 (scale selection)

// Store the most recent data
let latestData = {};

// Handle WebSocket connections for Watch 1 (note selection)
wss1.on('connection', (ws) => {
    console.log('New WebSocket connection (Watch 1)');

    // Send the latest data to the client when they connect
    if (latestData) {
        ws.send(JSON.stringify(latestData));
    }

    ws.on('message', (message) => {
        const receivedData = JSON.parse(message);
        const { latency, x, y, z, direction } = receivedData;

        console.log(`Received WebSocket data (Watch 1): Latency=${latency}, X=${x}, Y=${y}, Z=${z}, Direction=${direction}`);

        // Update the latest data
        latestData = { latency, x, y, z, direction };

        // Broadcast to all connected clients
        wss1.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(latestData));
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket connection (Watch 1) closed');
    });
});

// Handle WebSocket connections for Watch 2 (scale bank selection)
wss2.on('connection', (ws) => {
    console.log('New WebSocket connection (Watch 2)');

    // Send the latest data (scale info) to the client when they connect
    if (latestData) {
        ws.send(JSON.stringify(latestData));
    }

    ws.on('message', (message) => {
        const receivedData = JSON.parse(message);
        const { latency, x, y, z, direction } = receivedData;

        console.log(`Received WebSocket data (Watch 2): Latency=${latency}, X=${x}, Y=${y}, Z=${z}, Direction=${direction}`);

        // Update the latest data
        latestData = { latency, x, y, z, direction };

        // Broadcast to all connected clients
        wss2.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(latestData));
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket connection (Watch 2) closed');
    });
});
