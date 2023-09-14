const express = require("express")

const app = express()
const port = 3006

let v1, v2

app.get("/", (req, res) => {
    res.status(200).send()
})

app.get("/chat", (req, res) => {
    res.json({v1, v2})
})

app.get("/sensors", (req, res) => {
    [v1, v2] = [
        req.query.v1,
        req.query.v2
    ]
})

app.listen(port, () => {
    console.log(`web_controller listening @ :${port}`)
})
