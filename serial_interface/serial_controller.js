const WebSocket = require("ws")
const { SerialPort } = require("serialport")

// Initialize websocket server
const wss = new WebSocket.Server({ port: 8080 })
console.log("Websocket open on port 8080.")

// Serial port setup
const port = new SerialPort({
    path: "COM3",
    baudRate: 9600
})
let stream = "";
// Potentiometer values
let sensors = {v1: 0, v2: 0, v3: 0}
// Minimum change of sensor value to trigger update to websocket
const sensor_filter = 4

// sends updated values to all websocket clients
function update_val(sensor) {
    //console.log(`B1: ${v1}, B2: ${v2}`)
    
    try {
        //fetch(`http://localhost:3006/sensors?v1=${v1}&v2=${v2}`)

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                const sensorJson = JSON.stringify(sensor)
                client.send(sensorJson)
            }
        })
    } catch (error) { }
}

// Log Websocket connections
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
  
    // Handle WebSocket disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
});

// Handle incoming serialstream
port.on("data", data => {

    // Parse incoming data from stream based on following syntax
    //  '^[val1] [val2]$' 
    stream += data.toString()
    let parsed = stream.match(/\^(\d+) (\d+) (\d+)\$/)

    // If parsing was sucsessful
    if (parsed) {
        // parse data to num
        let [v1, v2, v3] = parsed.slice(1).map(Number)
        stream = ""
        
        // change detected
        if ( Math.abs(v1 - sensors.v1) >= sensor_filter || Math.abs(v2 - sensors.v2) >= sensor_filter || Math.abs(v3 - sensors.v3) >= sensor_filter) {
            sensors = {v1: v1, v2: v2, v3: v3}
            update_val(sensors)
            console.log(`v1: ${v1}, v2: ${v2}, v3: ${v3}`)
        }

        
    }
})


