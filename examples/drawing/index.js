var levelidb = require("levelidb")
    , fullyConnected = require("topology/fully")
    , SignalChannel = require("signal-channel")
    , append = require("insert/append")
    , MuxDemux = require("mux-demux")
    , StreamRouter = require("stream-router")

    , Root = require("./root")
    , replicate = require("./lib/replicate")

    , channel = SignalChannel("drawing game"
        , "//localhost:8080/sock")
    , db = levelidb("drawing-db", {
        encoding: "json"
    })
    , root = Root(db)

append(document.body, root.view)

fullyConnected(channel, function (stream) {
    var router = StreamRouter()
        , mdm = MuxDemux(router)

    router.addRoute("/chat", function (stream) {
        stream.pipe(root.chat, {
            end: false
        })
    })

    root.chat.pipe(mdm.createStream("/chat"))

    console.log("connected to", stream.peerId)
})
