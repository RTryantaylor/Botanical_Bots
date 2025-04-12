const int ledPin = 7; // Try GPIO 10 if 7 doesn't work on your ESP32-C3

void setup() {
  Serial.begin(115200);
  
  // Wait for serial to connect (especially important on ESP32-C3 USB CDC)
  while (!Serial) {
    delay(10);
  }

  pinMode(ledPin, OUTPUT);
  Serial.println("Starting LED blink with serial logging...");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED ON");
  delay(500);

  digitalWrite(ledPin, LOW);
  Serial.println("LED OFF");
  delay(500);
}
