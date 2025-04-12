#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ====== WiFi Credentials ======
const char* ssid     = "CRUZHACKS";
const char* password = "cruzhacks1234";

// ====== HTTP GET Endpoint ======
const char* serverName = "http://192.168.1.197:8008/put_sensor_data";

const int moistureThreshold = 500;
const unsigned long moistureTimer = 10000;
bool watering = 0;
const unsigned long startTime = 0

void setup() {
  Serial.begin(115200);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Connected to WiFi!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Get current moisture levels
    int currentMoisture = readMoisture();

    // Check to send water
    waterControl(currentMoisture);

    // Create JSON payload
    StaticJsonDocument<256> jsonDoc;
    jsonDoc["moisture"] = currentMoisture;
    jsonDoc["ph"] = 6.3 + random(-10, 10) * 0.01;
    jsonDoc["temp"] = 23 + random(-5, 5);
    jsonDoc["light"] = random(400, 800);

    String requestBody;
    serializeJson(jsonDoc, requestBody);

    // 🔁 Use PUT request
    int httpResponseCode = http.sendRequest("PUT", requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("✅ Response: ");
      Serial.println(response);
    } else {
      Serial.print("❌ Error sending PUT: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("⚠️ Not connected to WiFi.");
  }

  delay(1000);  // Wait 5 seconds before next update
}

// Reading Functions

int readMoisture() {
  // Replace with actual analogRead
  // int val = analogRead(1); // or whatever pin you're using
  int val = 400;
  Serial.print("🌱 Moisture: ");
  Serial.println(val);
  return val;
}

// Water Controls

int waterControl(int moistureLevel) {
  // send water
  if ((moistureLevel < moistureThreshold) && !watering) {
    Serial.println("Watering started.");
    sendWater();
    watering = 1;
    startTime = millis();
  }
  if (watering && (millis() - startTime >= 5000)) {
    watering = 0;
  }
}

void sendWater(){
  Serial.println("Water Sent!");
}
