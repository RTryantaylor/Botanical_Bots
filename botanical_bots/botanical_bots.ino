#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <math.h>  // Needed for log()

// ====== WiFi Credentials ======
const char* ssid     = "Verizon_63D9RK";
const char* password = "cart2claim7apt";

// ====== HTTP Server Endpoint ======
const char* postServerName = "http://192.168.1.159:8085/put_sensor_data";
const char* getServerName = "http://192.168.1.159:8008/get_settings";

// ========== Pin Definitions ==========
#define BUTTON_PIN     9
#define MOTOR_IO_PIN   6
#define PH_ADC_PIN     3
#define THERM_ADC_PIN  1
#define MOIST_ADC_PIN  0

// ========== Thermistor Constants ==========
const float Vdd     = 3.33;
const float R_FIXED = 9960.0;
const float BETA    = 3950.0;
const float R0      = 10000.0;
const float T0      = 298.15;  // 25°C in Kelvin

// ========== Timers ==========
unsigned long now = 0;

unsigned long sensorReadTimer = 0;
const unsigned long sensorReadInterval = 100;

unsigned long dataSendTimer = 0;
const unsigned long dataSendInterval = 10000;

unsigned long dataGetTimer = 0;
const unsigned long dataGetInterval = 15000;

// ========== Sensor Values ==========
const int WINDOW_SIZE = 50;

int moistureWindow[WINDOW_SIZE] = {0};
int phWindow[WINDOW_SIZE] = {0};
float tempWindow[WINDOW_SIZE] = {0};
int lightWindow[WINDOW_SIZE] = {0};

int windowIndex = 0;
int sampleCount = 0;

// Final averaged values
int moisture = 0;
float ph = 0;
float temp = 0;
int light = 0;

// ========== Setup ==========
void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_IO_PIN, OUTPUT);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Connected to WiFi!");
}

// ========== Main Loop ==========
void loop() {
  now = millis();

  // === Read sensor data ===
  if (now - sensorReadTimer >= sensorReadInterval) {
    sensorReadTimer = now;
    updateSensorAverages();
  }

  // === Send sensor data ===
  if (now - dataSendTimer >= dataSendInterval) {
    dataSendTimer = now;
    sendSensorData();
  }

  // === (optional) Get settings from server ===
  // if (now - dataGetTimer >= dataGetInterval) {
  //   dataGetTimer = now;
  //   getData();
  // }

  delay(10);  // Light yield
}

// ========== Sensor Functions ==========

int readMoisture() {
  int val = analogRead(MOIST_ADC_PIN);
  Serial.print("🌱 Moisture: ");
  Serial.println(val);
  return val;
}

int readPh() {
  int val = analogRead(PH_ADC_PIN);
  float voltage_PH = (Vdd * (val / 4095.0));
  float finalPh = 7 + ((2.67 - voltage_PH)/0.25);
  Serial.print("🧪 PH ADC: ");
  Serial.println(finalPh);
  // Reads PH from measured voltage
  return finalPh;
}

float readTemp() {
  int adc = analogRead(THERM_ADC_PIN);
  float voltage = (adc * (Vdd / 4095.0)) - 0.2;
  float resistance = readThermistorResistance(voltage);
  float temperatureC = calculateTemperatureC(resistance);

  Serial.print("🌡️ Temp: ");
  Serial.print(temperatureC, 2);
  Serial.println(" °C");
  return temperatureC;
}

int readLight() {
  // Placeholder if you hook up a light sensor later
  int val = random(400, 800);
  // Serial.print("💡 Light: ");
  // Serial.println(val);
  return val;
}

// ========== Watering Logic ==========
void checkWatering(int moistureVal) {
  const int moistureThreshold = 3000;
  if (moistureVal < moistureThreshold) {
    Serial.println("💧 Moisture low, watering...");
    digitalWrite(MOTOR_IO_PIN, HIGH);
    delay(100);  // Quick pump pulse
    digitalWrite(MOTOR_IO_PIN, LOW);
  } else {
    digitalWrite(MOTOR_IO_PIN, LOW);
  }
}

// ========== Thermistor Helpers ==========
float readThermistorResistance(float voltage) {
  if (voltage >= Vdd) return INFINITY;
  return R_FIXED * (voltage / (Vdd - voltage));
}

float calculateTemperatureC(float resistance) {
  float lnR = log(resistance / R0);
  float tempK = 1.0 / ((1.0 / T0) + (lnR / BETA));
  return tempK - 273.15;
}

// ========== HTTP Functions ==========
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(postServerName);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> jsonDoc;
  jsonDoc["moisture"] = moisture;
  jsonDoc["ph"] = ph;
  jsonDoc["temp"] = temp;
  jsonDoc["light"] = light;

  Serial.print("Moisture: ");
  Serial.println(moisture);
  Serial.print("PH: ");
  Serial.println(ph);
  Serial.print("Temp: ");
  Serial.println(temp);
  Serial.print("Light: ");
  Serial.println(light);

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

void getData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Cannot GET: WiFi not connected");
    return;
  }

  HTTPClient http;
  http.begin(getServerName); 

  int httpCode = http.GET();

  if (httpCode > 0) {
    String payload = http.getString();
    Serial.print("📥 GET Response: ");
    Serial.println(payload);

    // Parse JSON
    StaticJsonDocument<256> jsonDoc;
    DeserializationError error = deserializeJson(jsonDoc, payload);
    if (error) {
      Serial.print("❌ JSON Parse Error: ");
      Serial.println(error.c_str());
    } else {
      const char* message = jsonDoc["message"];
      int moistureThreshold = jsonDoc["settings"]["moistureThreshold"];

      Serial.print("📨 Message: ");
      Serial.println(message);
      Serial.print("🌱 Moisture Threshold: ");
      Serial.println(moistureThreshold);

      // If you want to store these in global vars:
      // globalMoistureThreshold = moistureThreshold;
    }
  } else {
    Serial.print("❌ GET failed, HTTP code: ");
    Serial.println(httpCode);
  }

  http.end();
}

// Moving Average Function
void updateSensorAverages() {
  // Shift in new values
  moistureWindow[windowIndex] = readMoisture();
  phWindow[windowIndex] = readPh();
  tempWindow[windowIndex] = readTemp();
  lightWindow[windowIndex] = readLight();

  // Advance index
  windowIndex = (windowIndex + 1) % WINDOW_SIZE;
  if (sampleCount < WINDOW_SIZE) sampleCount++;

  // Compute averages
  long mSum = 0, pSum = 0, lSum = 0;
  float tSum = 0.0;

  for (int i = 0; i < sampleCount; i++) {
    mSum += moistureWindow[i];
    pSum += phWindow[i];
    tSum += tempWindow[i];
    lSum += lightWindow[i];
  }

  moisture = mSum / sampleCount;
  ph       = pSum / sampleCount;
  temp     = tSum / sampleCount;
  light    = lSum / sampleCount;
}
