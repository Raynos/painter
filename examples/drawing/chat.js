var html = require("unpack-html")
    , EventEmitter = require("events").EventEmitter
    , uuid = require("node-uuid")

    , Submit = require("./lib/submit")
    , chatTemplate = require("./html/chat")
    , messageTemplate = require("./html/message")

module.exports = Chat

/* Chat widget

    - keeps a history of all chats so that it can be broadcast
        to new people
    - Hooks into the submit event for it's controls and creates
        new message when the user sends one.
    - New incoming messages get inserted in the correct
        place based on timestamps. This is nice if multiple user
        come online again and sync up their chat history

*/
function Chat() {
    var elements = html(chatTemplate)
        , chat = new EventEmitter()
        , list = elements.list
        , submit = Submit({
            message: elements.message
            , send: elements.send
            , name: elements.name
        })
        , elemMap = {}
        , history = {}

    submit.on("submit", function (data) {
        if (data.name) {
            elements.message.disabled = false
            elements.send.disabled = false
        }

        if (data.message) {
            var data = {
                text: data.message
                , name: data.name
                , id: uuid()
                , ts: Date.now()
            }

            chat.emit("message", data)
            addMessage(data)
            elements.message.value = ""
        }
    })

    elements.message.disabled = true
    elements.send.disabled = true

    chat.view = elements.root
    chat.addMessage = addMessage
    chat.history = history

    return chat

    function addMessage(data) {
        var id = data.id
            , ts = data.ts

        if (history[id]) {
            return
        }

        var elem = renderMessage(data)
        elemMap[data.id] = elem

        // This is the message with the ts before data.ts
        var last = Object.keys(history)
            .map(function (key) {
                return history[key]
            })
            .filter(function (message) {
                return message.ts < ts
            })
            .sort(function (a, b) {
                return a.ts < b.ts ? 1 : -1
            })[0]

        // dom hackery to insert the new message after last
        var reference = last ? elemMap[last.id] : null

        list.insertBefore(elem, reference ?
            reference.nextSibling : null)

        list.scrollTop = list.scrollHeight

        history[id] = data
    }

    function renderMessage(data) {
        var message = html(messageTemplate)
        message.text.textContent = data.text
        message.name.textContent = data.name
        return message.root
    }
}
