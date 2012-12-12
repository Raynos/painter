var SignalChannel = require("signal-channel")
    , fullyConnected = require("topology/fully")

    , Chat = require("./chat")

var channel = SignalChannel("/demo/chat")
var chat = Chat()

document.body.appendChild(chat.view)

fullyConnected(channel, function (pc, opener) {
    console.log("connected to", pc.peerId)

    if (opener) {
        return handleChat(pc.createStream("chat"))
    }

    pc.on("connection", function (stream) {
        if (stream.meta === "chat") {
            handleChat(stream)
        }
    })
})

function handleChat(stream) {
    stream.on("data", handleChatMessages)

    chat.on("message", function (message) {
        message.type = "message"
        stream.write(message)
    })

    stream.write({
        type: "history?"
    })

    function handleChatMessages(data) {
        if (data.type === "message") {
            chat.addMessage(data)
        } else if (data.type === "history?") {
            stream.write({
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
}
