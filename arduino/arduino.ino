// Constants
const int potPin0 = A0; 
const int potPin1 = A1; 
const int potPin2 = A2;

// Variables
int value1; 
int value2;
int value3;

void setup(){
  pinMode(potPin0, INPUT); 
  pinMode(potPin1, INPUT); 
  pinMode(potPin2, INPUT); 

  Serial.begin(9600);
}

void loop(){
  
  // Save analog value from potentiometer
  value1 = analogRead(potPin0);
  value2 = analogRead(potPin1);
  value3 = analogRead(potPin2);          

  // Send analog value to serial
  Serial.println("^"+ (String)(value1)+" "+ (String)(value2) + " " + (String)(value3) + "$");

  delay(1);                          
  
}
