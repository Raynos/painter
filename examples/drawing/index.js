var levelidb = require("levelidb")
    , fullyConnected = require("topology/fully")
    , SignalChannel = require("signal-channel")
    , MuxDemux = require("mux-demux")
    , livefeed = require("level-livefeed")
    , uuid = require("node-uuid")
    , html = require("unpack-html")

    , deleteRange = require("./lib/deleteRange")
    , template = require("./html/root")
    , Canvas = require("./canvas")
    , Controls = require("./controls")
    , Chat = require("./chat")
    , replicate = require("./lib/replicate")

document.body.appendChild(Root())

/* Root component does a few things

    - Opens leveldb connection and streams paths from it.
        Paths get added to the canvas or removed from the canvas
    - Creates a little controls widget that contains a clear
        button and clears the paths from the db when its clicked
    - Opens up a channel and sets up a fully connected p2p
        topology. Once connections open it starts sending
        chat messages, including a history request mechanism

*/
function Root() {
    var elements = html(template)
        , canvas = Canvas()
        , controls = Controls()
        , chat = Chat()
        , channel = SignalChannel("drawing game"
            , "//localhost:8080/sock")
        , db = levelidb("drawing-db", {
            encoding: "json"
        })
        , stream = livefeed(db, {
            start: "path:"
            , end: "path;"
        })
        , id = uuid()

    console.log("own id", id)

    controls.on("clear", function () {
        deleteRange(db, {
            start: "path:"
            , end: "path;"
        })
    })

    canvas.on("path", function (path) {
        db.put("path:" + uuid(), path)
    })

    stream.on("data", function (change) {
        if (change.type === "put") {
            canvas.addPath(change.key, change.value)
        } else if (change.type === "del") {
            canvas.removePath(change.key)
        }
    })

    elements.canvas.parentNode
        .replaceChild(canvas.view, elements.canvas)
    elements.right.appendChild(controls.view)
    elements.right.appendChild(chat.view)

    fullyConnected(channel, {
        id: id
    }, function (stream) {
        var multiplexer = MuxDemux(function (stream) {
            if (stream.meta === "chat") {
                stream.on("data", handleChatMessages)
            }
        })

        multiplexer.pipe(stream).pipe(multiplexer)

        var chatStream = multiplexer.createStream("chat")

        chat.on("message", function (message) {
            message.type = "message"
            chatStream.write(message)
        })

        chatStream.write({
            type: "history?"
        })

        console.log("connected to", stream.peerId)

        function handleChatMessages(data) {
            if (data.type === "message") {
                chat.addMessage(data)
            } else if (data.type === "history?") {
                chatStream.write({
                    type: "history!"
                    , history: chat.history
                })
            } else if (data.type === "history!") {
                var history = data.history
                Object.keys(history).forEach(function (key) {
                    chat.addMessage(history[key])
                })
            }
        }
    })

    return elements.root
}
