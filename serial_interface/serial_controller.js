const { SerialPort } = require("serialport")

const port = new SerialPort({
    path: "COM3",
    baudRate: 9600
})
let stream = "";
let sensors = {v1: 0, v2: 0}

function update_val(v1, v2) {
    //console.log(`B1: ${v1}, B2: ${v2}`)
    try {
        fetch(`http://localhost:3006/sensors?v1=${v1}&v2=${v2}`)
    } catch (error) { }
}

port.on("data", data => {
    stream += data.toString()
    let parsed = stream.match(/\^(\d+) (\d+)\$/)
    //console.log(stream)
    //console.log(parsed)
    //console.log()
    if (parsed) {
        // parse data to num
        let [v1, v2] = parsed.slice(1).map(Number)
        stream = ""
        
        if ( v1 != sensors.v1 || v2 != sensors.v2) {
            // change detected
            sensors = {v1: v1, v2: v2}
            update_val(v1, v2)
        }

        console.log(`B1: ${v1}, B2: ${v2}`)
    }
})


