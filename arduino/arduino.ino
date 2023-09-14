//Constants:
const int potPin = A0; //pin A0 to read analog input

//Variables:
int value; //save analog value


void setup(){
  pinMode(potPin, INPUT); 

  Serial.begin(9600);
}

void loop(){
  
  // Save analog value from potentiometer
  value = analogRead(potPin);          

  // Send analog value to serial
  Serial.println("^"+ (String)(value)+" 0$");

  delay(1000);                          
  
}
