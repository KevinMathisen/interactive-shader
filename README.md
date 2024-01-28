# Shader-controller
This repository contains a project that integrates Arduino, Node.js, and WebGL to create an interactive shader. The project comprises three main parts: 
1. An Arduino script for reading analog values from potentiometers.
2. A Node.js server for processing these values and communicating via WebSockets.
3. A WebGL-based HTML interface that responds to potentiometer adjustments in real-time.

## Installation

### Prerequisites
- Arduino IDE
- Node.js
- A web browser with WebGL support
- An arduino with 3 potentiometers

### Setup
1. **Arduino Setup**: Connect tree potentiometers to the analog inputs on your arduino. 
2. **Upload Arduino Code**: Upload `arduino.ino` to your Arduino device. Note the usb port the arduino is connected to.
3. **Node Server Dependencies**: Run `npm install` in the serial_interface/ directory to install dependencies.
4. **Node Server Config**: Open `serial_controller.js` and modify the Serialport Path to the usb port the arduino is connected to, for example `COM3`.
 
## Usage

1. **Start the Node Server**: Run `node serial_controller.js` in the serial_interface/ directory to start the WebSocket server.
2. **Arduino Connection**: Ensure that the Arduino is connected and transmitting data. This can be checked by checking if the potentiometer values are displayed in the serial_controller log. 
3. **Open Web Interface**: Open `app.html` in a browser to view the shader which is updated by the potentiometer values in real-time.

## Components

### Arduino
`arduino.ino` contains the script for the Arduino microcontroller. It reads analog values from three potentiometers and outputs these values in a specific format to the serial port.

### Node Server
`serial_controller.js` is a Node.js server that reads serial data from the Arduino, parses it, and sends updates via WebSocket when significant changes are detected in the potentiometer readings.

### WebGL Interface
`app.html` is a webpage that displays a shader affected by the data received from the WebSocket server. It requires a browser with WebGL support.

## License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for more details.


