const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const url = require('url');

const app = express();

// Use CORS middleware
app.use(cors()); // Allow all origins

// Middleware to parse JSON requests
app.use(express.json());

// Define a route to handle incoming data
app.get('/sendData', (req, res) => {
    // Extract query parameters
    const queryObject = req.query;

    const x = queryObject.x;
    const y = queryObject.y;
    const z = queryObject.z;
    const direction = queryObject.direction;

    // Process the data as needed
    console.log(`Received data: X=${x}, Y=${y}, Z=${z}, Direction=${direction}`);

    res.status(200).send('Data received successfully');
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

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
