const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const https = require('https');

const app = express();

// Use CORS middleware
app.use(cors());

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
                res.json({ publicIP });
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

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Store the most recent data for each device
let latestData = {};

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    // Send the latest data to the client when they connect
    ws.send(JSON.stringify(latestData));

    ws.on('message', (message) => {
        try {
            // Process incoming data
            const receivedData = JSON.parse(message);
            const { deviceID, latency, x, y, z, direction } = receivedData;

            if (!deviceID) {
                console.error('Missing deviceID in received data');
                return;
            }

            console.log(`Device ${deviceID} - Latency=${latency}, X=${x}, Y=${y}, Z=${z}, Direction=${direction}`);

            // Update the latest data for the specific device
            latestData[deviceID] = { latency, x, y, z, direction };

            // Broadcast updated data to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ deviceID, data: latestData[deviceID] }));
                }
            });
        } catch (err) {
            console.error('Error processing WebSocket message:', err);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});
