#include <WiFi.h>
#include <HTTPClient.h>

// ====== WiFi Credentials ======
const char* ssid     = "CRUZHACKS";
const char* password = "cruzhacks1234";

// ====== HTTP GET Endpoint ======
const char* serverName = "http://your-server-address/api/plant";

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

    // Create JSON payload
    StaticJsonDocument<256> jsonDoc;
    jsonDoc["moisture"] = random(600, 800);   // Replace with analogRead()
    jsonDoc["ph"] = 6.3 + random(-10, 10) * 0.01; // Simulate pH
    jsonDoc["temp"] = 23 + random(-5, 5);     // Simulate temperature
    jsonDoc["light"] = random(400, 800);      // Simulate light

    String requestBody;
    serializeJson(jsonDoc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("✅ Response: ");
      Serial.println(response);
    } else {
      Serial.print("❌ Error sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("⚠️ Not connected to WiFi.");
  }

  delay(5000);  // Send every 5 seconds
}