var levelidb = require("levelidb")
    , livefeed = require("level-livefeed")
    , fullyConnected = require("topology/fully")
    , SignalChannel = require("signal-channel")
    , append = require("insert/append")

    , Root = require("./root")
    , replicate = require("./lib/replicate")

    , channel = SignalChannel("drawing game"
        , "//localhost:8080/sock")
    , db = levelidb("drawing-db", {
        encoding: "json"
    })

append(document.body, Root(db).view)

fullyConnected(channel, function (stream) {
    console.log("connected to", stream.peerId)
})
