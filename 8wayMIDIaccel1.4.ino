#include <LilyGoLib.h>
#include <LV_Helper.h>
#include <WiFi.h>
#include <WebSocketsClient.h> 

uint32_t lastMillis;
lv_obj_t *label1;
int16_t sens = 150;
int16_t sens2 = 100;

const char* ssid = "WIFI";
const char* password = "PASSWORD";


// WebSocket server details
const char* wsAddress = "44.202.105.250";
const int wsPort = 8080;

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

    label1 = lv_label_create(lv_scr_act());
    lv_obj_set_style_text_color(label1, lv_color_hex(0x00FF00), LV_PART_MAIN);
    lv_label_set_recolor(label1, true);
    lv_obj_center(label1);

    // Setup WebSocket
    webSocket.begin(wsAddress, wsPort, "/");  
    webSocket.onEvent(webSocketEvent);        // Register event handler
}

void loop() {
    int16_t x, y, z, direction, latency;
    latency = millis() - lastMillis;

    if (latency >= 10) {
        lastMillis = millis();

        watch.getAccelerometer(x, y, z);
        
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
        String wsData = "{\"latency\":" + String(latency) + ",\"x\":" + String(x) + ",\"y\":" + String(y) + ",\"z\":" + String(z) + ",\"direction\":" + String(direction) + "}";
        webSocket.sendTXT(wsData); // Send data as JSON string

        // Serial output
        Serial.print("X:");
        Serial.print(x); Serial.print(" ");
        Serial.print("Y:");
        Serial.print(y); Serial.print(" ");
        Serial.print("Z:");
        Serial.print(z); Serial.print(" ");
        Serial.print("Direction:");
        Serial.print(direction); Serial.print(" ");
        Serial.println();
        Serial.print("Latency:");
        Serial.print(latency); Serial.print(" ");
        Serial.println();

        // Update display
       lv_label_set_text_fmt(label1, "Latency: %d ms \nX: %d \nY: %d \nZ: %d \nDirection: %d", latency, x, y, z, direction);
    }

    // Handle WebSocket connection and messages
    webSocket.loop();

    // Update LVGL tasks
    lv_task_handler();
}
