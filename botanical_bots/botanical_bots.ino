#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ====== WiFi Credentials ======
const char* ssid     = "CRUZHACKS";
const char* password = "cruzhacks1234";

// ====== HTTP GET Endpoint ======
const char* serverName = "http://192.168.1.197:8008/put_sensor_data";

unsigned long sensorReadTimer = 0;
const unsigned long sensorReadThreshold = 5000; 

unsigned long dataSendTimer = 0;
const unsigned long dataSendInterval = 10000; 

unsigned long dataGetTimer = 0;
const unsigned long dataGetInterval = 15000;

unsigned long now = 0;

// Sensor Values
int moisture = 0;
int ph = 0;
int temp = 0;
int light = 0;

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
  now = millis();

  if (now - sensorReadTimer >= sensorReadThreshold) {
    sensorReadTimer = now;
    moisture = readMoisture();
    ph = readPh();
    temp = readTemp();
    light = readLight();
  }

  // === Timer 2: Send data ===
  if (now - dataSendTimer >= dataSendInterval) {
    dataSendTimer = now;
    sendSensorData();
  }

  // === Timer 3: Get data ===
  // if (now - dataGetTimer >= dataGetInterval) {
  //   dataSendTimer = now;
  //   getData();
  // }

  delay(10);
}

// HTTP Functions

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> jsonDoc;
  jsonDoc["moisture"] = moisture;
  jsonDoc["ph"] = ph;
  jsonDoc["temp"] = temp;
  jsonDoc["light"] = light;

  String body;
  serializeJson(jsonDoc, body);

  int code = http.sendRequest("PUT", body);
  if (code > 0) {
    Serial.print("✅ Server response: ");
    Serial.println(http.getString());
  } else {
    Serial.print("❌ HTTP error: ");
    Serial.println(code);
  }
  http.end();
}

// Reading Functions

int readMoisture() {
  // Replace with actual analogRead
  int val = random(400, 800);
  Serial.print("Moisture: ");
  Serial.println(val);
  return val;
}

int readPh() {
  // Replace with actual analogRead
  int val = 6.3 + random(-10, 10) * 0.01;
  Serial.print("PH: ");
  Serial.println(val);
  return val;
}

int readTemp() {
  // Replace with actual analogRead
  int val = 23 + random(-5, 5);
  Serial.print("Temp: ");
  Serial.println(val);
  return val;
}

int readLight() {
  // Replace with actual analogRead
  int val = random(400, 800);
  Serial.print("Light: ");
  Serial.println(val);
  return val;
}
