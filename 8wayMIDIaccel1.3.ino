#include <LilyGoLib.h>
#include <LV_Helper.h>
#include <WiFi.h>
#include <WiFiUdp.h>

uint32_t lastMillis;
lv_obj_t *label1;
int16_t sens = 100;
int16_t sens2 = 50;

const char* ssid = "Grove House";
const char* password = "assword69";

// Destination IP and port for UDP
const char* udpAddress = "192.168.0.68";
const int udpPort = 8080;

WiFiUDP udp;

void setup() {
    Serial.begin(115200);

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("Connected to WiFi");

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
}

void loop() {
    int16_t x, y, z, direction, latency;
    latency = millis() - lastMillis;

    if (latency >= 5) {
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

        // Send data via UDP
        String udpData = "latency=" + String(latency) + "&x=" + String(x) + "&y=" + String(y) + "&z=" + String(z) + "&direction=" + String(direction);
        udp.beginPacket(udpAddress, udpPort);
        udp.print(udpData);
        udp.endPacket();

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
        lv_label_set_text_fmt(label1, "Latency:%d \nX:%d \nY:%d \nZ:%d \nDirection:%d", latency, x, y, z, direction);
    }
    lv_task_handler();
}
