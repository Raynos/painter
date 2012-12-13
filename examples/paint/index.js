var levelidb = require("levelidb")
    , fullyConnected = require("topology/fully")
    , SignalChannel = require("signal-channel")
    , livefeed = require("level-livefeed")
    , deleteRange = require("level-delete-range")
    , uuid = require("node-uuid")

    , replicate = require("./lib/replicate")
    , Canvas = require("./canvas")

var channel = SignalChannel("/demo/paint/2")
var canvas = Canvas()

var db = levelidb("paint-db", {
        encoding: "json"
    })
    , dbStream = livefeed(db, {
        start: "path:"
        , end: "path;"
    })

window.clear = function () {
    deleteRange(db, {})
}

dbStream.on("data", function (change) {
    if (change.type === "put") {
        debug("adding key", change.key)
        canvas.addPath(change.key, change.value.path)
    } else if (change.type === "del") {
        canvas.removePath(change.key)
    }
})

canvas.on("path", function (path) {
    var key = "path:" + uuid()

    debug("putting key", key)

    db.put(key, {
        path: path
    })
})

document.body.appendChild(canvas.view)

fullyConnected(channel, function (pc, opener) {
    console.log("connected to", pc.peerId)

    if (opener) {
        return handlePaint(pc.createStream("paint"))
    }

    pc.on("connection", function (stream) {
        if (stream.meta === "paint") {
            handlePaint(stream)
        }
    })
})

function handlePaint(stream) {
    var replStream = replicate(db, {
        start: "path:"
        , end: "path;"
    })

    stream.pipe(replStream).pipe(stream)
}

function debug() {
    if (window.DEBUG) {
        console.log.apply(console, arguments)
    }
}
