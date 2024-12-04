#include <LilyGoLib.h>
#include <LV_Helper.h>
#include <WiFi.h>
#include <WebSocketsClient.h> 

uint32_t lastMillis;
lv_obj_t *label1;
lv_obj_t *circle; 

int16_t sens = 150;
int16_t sens2 = 100;

const char* ssid = "WIFI";
const char* password = "PASSWORD";

// WebSocket server details
const char* wsAddress = "44.211.42.114";
const int wsPort = 8080;
const char* wsPath = "/";

WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("WebSocket Disconnected");
            break;
        case WStype_CONNECTED:
            Serial.println("WebSocket Connected");
            break;
        case WStype_TEXT:
            Serial.printf("Received text: %s\n", payload);
            break;
        case WStype_BIN:
            Serial.println("Received binary data");
            break;
        default:
            break;
    }
}

// Function to determine the color based on the direction
lv_color_t getColorByDirection(int direction) {
    switch (direction) {
        case 1: return lv_color_hex(0xFF0000); // Red
        case 2: return lv_color_hex(0xFFA500); // Orange
        case 3: return lv_color_hex(0xFFFF00); // Yellow
        case 4: return lv_color_hex(0x00FF00); // Green
        case 5: return lv_color_hex(0x0000FF); // Blue
        case 6: return lv_color_hex(0x4B0082); // Indigo
        case 7: return lv_color_hex(0xEE82EE); // Violet
        case 8: return lv_color_hex(0x00FFFF); // Cyan
        default: return lv_color_hex(0xFFFFFF); // White
    }
}

void setup() {
    Serial.begin(115200);

    // Connect to WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("Connected to WiFi");

    // Initialize the T-Watch
    watch.begin();
    beginLvglHelper();

    watch.configAccelerometer();
    watch.enableAccelerometer();

    lv_obj_t *screen = lv_scr_act(); 
    lv_obj_set_style_bg_color(screen, lv_color_hex(0x000000), LV_PART_MAIN);

    // Add label for debug output
    label1 = lv_label_create(lv_scr_act());
    lv_obj_set_style_text_color(label1, lv_color_hex(0xFF0000), LV_PART_MAIN);
    lv_label_set_recolor(label1, true);
    lv_obj_align(label1, LV_ALIGN_TOP_LEFT, 0, 10);

    // Add a circle object
    circle = lv_obj_create(lv_scr_act());
    lv_obj_set_size(circle, 50, 50);
    lv_obj_set_style_radius(circle, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_bg_color(circle, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_align(circle, LV_ALIGN_CENTER, 0, 0); // Center the circle initially

    // Setup WebSocket
    webSocket.begin(wsAddress, wsPort,wsPath);  
    webSocket.onEvent(webSocketEvent);        // Register event handler
}

void loop() {
    int16_t x, y, z, direction, latency;
    latency = millis() - lastMillis;

    if (latency >= 10) {
        lastMillis = millis();

        watch.getAccelerometer(x, y, z);
        
        // Determine the direction based on tilt
        if (y > sens) {
            if (x > sens2) direction = 2;
            else if (x < -sens2) direction = 8;
            else direction = 1;
        } else if (y < -sens) {
            if (x > sens2) direction = 4;
            else if (x < -sens2) direction = 6;
            else direction = 5;
        } else {
            if (x > sens) direction = 3;
            else if (x < -sens) direction = 7;
        }

        // Send data via WebSocket
        String wsData = "{\"deviceID\":1,\"latency\":" + String(latency) + ",\"x\":" + String(x) + ",\"y\":" + String(y) + ",\"z\":" + String(z) + ",\"direction\":" + String(direction) + "}";
        webSocket.sendTXT(wsData); // Send data as JSON string

        // Move the circle based on tilt
        int xOffset = map(x, -1000, 1000, -100, 100); // Map X to screen offset
        int yOffset = map(y, -1000, 1000, 100, -100); // Map Y to screen offset (invert Y)
        lv_obj_set_pos(circle, yOffset, xOffset); // Update circle position

        // Change the circle's color based on direction
        lv_obj_set_style_bg_color(circle, getColorByDirection(direction), LV_PART_MAIN);

        // Update label with debug info
        lv_label_set_text_fmt(label1, "L: %d ms \nX: %d  \nY: %d  \nZ: %d  \nD: %d", latency, x, y, z, direction);
    }

    // Handle WebSocket connection and messages
    webSocket.loop();

    // Update LVGL tasks
    lv_task_handler();
}
