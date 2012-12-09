var html = require("unpack-html")
    , ever = require("ever")
    , extend = require("xtend")
    , ReadWriteStream = require("read-write-stream")
    , populate = require("populate")
    , textContent = require("populate/textContent")
    , append = require("insert/append")

    , Submit = require("./lib/submit")
    , chatTemplate = require("./html/chat")
    , messageTemplate = require("./html/message")

module.exports = Chat

function Chat() {
    var elements = html(chatTemplate)
        , queue = ReadWriteStream(write)
        , stream = queue.stream
        , list = elements.list
        , submit = Submit({
            message: elements.message
            , send: elements.send
            , name: elements.name
        })
        , schema = {
            name: textContent
            , text: textContent
        }

    submit.on("submit", function (data) {
        if (data.name) {
            elements.message.disabled = false
            elements.send.disabled = false
        }

        if (data.message) {
            var data = {
                type: "message"
                , text: data.message
                , name: data.name
            }

            queue.push(data)
            renderMessage(data)
        }
    })

    elements.message.disabled = true
    elements.send.disabled = true

    return extend(stream, {
        view: elements.root
    })

    function write(data) {
        if (data.type === "message") {
            renderMessage(data)
        }
    }

    function renderMessage(data) {
        var message = html(messageTemplate)
        populate(data, message, schema)
        append(list, message.root)
    }
}
