const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dgram = require('dgram');

const app = express();

// Use CORS middleware
app.use(cors()); // Allow all origins

// Middleware to parse JSON requests
app.use(express.json());

// Store received UDP data globally
let udpReceivedData = {};

// Define a route to handle incoming data via HTTP
app.get('/sendData', (req, res) => {
    const queryObject = req.query;

    const latency = queryObject.l; // Fixed typo from quertyObject to queryObject
    const x = queryObject.x;
    const y = queryObject.y;
    const z = queryObject.z;
    const direction = queryObject.d;

    console.log(`Received HTTP data: Latency=${latency}, X=${x}, Y=${y}, Z=${z}, Direction=${direction}`);

    // Store the latest received HTTP data
    udpReceivedData = { latency, x, y, z, direction };

    res.status(200).send('Data received successfully');
});

// New endpoint to fetch the latest direction data
app.get('/getData', (req, res) => {
    // Respond with the latest received data
    res.json(udpReceivedData);
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

// Handle 404 for any other requests
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Start the HTTP server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));

// Create a UDP server to handle incoming UDP data
const udpPort = 8081; // You can set this to any available port
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg, rinfo) => {
    console.log(`Received UDP data from ${rinfo.address}:${rinfo.port} - ${msg}`);

    // Assuming the message is sent in "key=value" format, separated by '&'
    const dataStr = msg.toString();
    const dataEntries = dataStr.split('&');
    const receivedData = {};

    dataEntries.forEach(entry => {
        const [key, value] = entry.split('=');
        receivedData[key] = value;
    });

    console.log("Processed UDP data:", receivedData);

    // Store the latest received UDP data globally
    udpReceivedData = receivedData;
});

// Bind the UDP server to listen on the specified port
udpServer.bind(udpPort, () => {
    console.log(`UDP server listening on port ${udpPort}`);
});
