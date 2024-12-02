const noble = require('@abandonware/noble');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

let latestData = {}; // Store the latest data from BLE

// Start scanning for BLE devices
noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        console.log('Starting BLE scan...');
        noble.startScanning([], true); // Scans for all devices
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', (peripheral) => {
    console.log(`Discovered device: ${peripheral.advertisement.localName || 'Unnamed'} (${peripheral.id})`);

    // Optionally filter for specific devices
    if (peripheral.advertisement.localName === 'YourBLEDeviceName') {
        noble.stopScanning();
        connectToDevice(peripheral);
    }
});

function connectToDevice(peripheral) {
    console.log('Connecting to device...');
    peripheral.connect((error) => {
        if (error) {
            console.error('Connection error:', error);
            return;
        }
        console.log('Connected to device');

        // Discover services and characteristics
        peripheral.discoverAllServicesAndCharacteristics((err, services, characteristics) => {
            if (err) {
                console.error('Discovery error:', err);
                return;
            }
            console.log('Services and characteristics discovered');

            // Replace with your characteristic UUIDs
            const dataCharacteristic = characteristics.find(
                (char) => char.uuid === 'your_characteristic_uuid'
            );

            if (dataCharacteristic) {
                dataCharacteristic.on('data', (data) => {
                    // Parse incoming BLE data
                    const receivedData = parseBLEData(data); // Your custom parsing logic
                    console.log('Received BLE data:', receivedData);

                    // Update latest data
                    latestData = receivedData;
                });

                dataCharacteristic.subscribe((err) => {
                    if (err) {
                        console.error('Subscribe error:', err);
                    } else {
                        console.log('Subscribed to data characteristic');
                    }
                });
            } else {
                console.error('Data characteristic not found');
            }
        });
    });

    peripheral.on('disconnect', () => {
        console.log('Device disconnected');
        noble.startScanning([], true); // Restart scanning
    });
}

function parseBLEData(data) {
    // Replace with your data parsing logic
    const buffer = Buffer.from(data);
    return {
        x: buffer.readInt8(0),
        y: buffer.readInt8(1),
        z: buffer.readInt8(2),
        direction: buffer.readInt8(3),
    };
}

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

// Endpoint to get latest BLE data
app.get('/getLatestData', (req, res) => {
    res.json(latestData);
});

// Start HTTP server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
