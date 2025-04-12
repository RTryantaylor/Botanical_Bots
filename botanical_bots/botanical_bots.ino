// Pin Definitions
#define LED_PIN     2     // Onboard LED
#define BUTTON_PIN  9     // Change if needed
#define ADC_PIN     0     // GPIO0 maps to ADC1_CH0

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP); // assumes button to GND
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  int adcValue = analogRead(ADC_PIN); // 0-4095 on ESP32
  float voltage = adcValue * (3.3 / 4095.0); // Assuming 3.3V reference

  // Print values
  Serial.print("Button: ");
  Serial.print(buttonState == LOW ? "Pressed" : "Released");
  Serial.print(" | ADC: ");
  Serial.print(adcValue);
  Serial.print(" | Voltage: ");
  Serial.print(voltage, 3);
  Serial.println(" V");

  // Control LED with button
  digitalWrite(LED_PIN, buttonState == LOW ? HIGH : LOW);

  delay(500);
}
