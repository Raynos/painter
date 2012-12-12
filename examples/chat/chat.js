var EventEmitter = require("events").EventEmitter

    , chatTemplate = Template("chatTemplate")
    , messageTemplate = Template("messageTemplate")

/*  MOTHER OF GOD BEWARE THE BEAST THAT IS THE DOM

    this code can be way cleaner but that has the penalty of
        introducing a bunch of libraries / frameworks /
        abstractions / complexity.
*/

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
    var elements = chatTemplate()
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
                , id: Date.now() + Math.random() * 1000
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
        var message = messageTemplate()
        message.text.textContent = data.text
        message.name.textContent = data.name
        return message.root
    }
}

function Template(rootId) {
    var rootElem = document.getElementById(rootId)

    return function template() {
        var clone = rootElem.cloneNode(true)
            , elements = { root: clone }

        iterativelyWalk([clone], function (elem) {
            var classes = (elem.className || "").split(" ")
            classes.forEach(function (className) {
                if (className.substr(0, 9) !== "template-") {
                    return
                }

                var name = className.substr(9)
                elements[name] = elem
            })
        })

        return elements
    }
}

function iterativelyWalk(nodes, cb) {
    nodes = [].slice.call(nodes)

    while(nodes.length) {
        var node = nodes.shift(),
            ret = cb(node)

        if (ret) {
            return ret
        }

        if (node.childNodes.length) {
            nodes = [].slice.call(node.childNodes).concat(nodes)
        }
    }
}

var EventEmitter = require("events").EventEmitter
    , ENTER = 13

function Submit(elements) {
    var keys = Object.keys(elements)
        , submit = new EventEmitter()
        , sendData = FormData(elements)

    keys.forEach(function (name) {
        var elem = elements[name]

        if (elem.type === "text") {
            handleText(elem)
        } else if (elem.tagName === "BUTTON") {
            handleButton(elem)
        }
    })

    return submit

    function handleText(elem) {
        elem.addEventListener("keypress", function (event) {
            if (event.which === ENTER) {
                submit.emit("submit", sendData())
            }
        })
    }

    function handleButton(elem) {
        elem.addEventListener("click", function () {
            submit.emit("submit", sendData())
        })
    }
}

//TODO: Massive spec: http://www.whatwg.org/specs/web-apps/current-work/multipage/association-of-controls-and-forms.html#constructing-form-data-set
function FormData(fields) {
    // handle <form>
    if (fields.tagName === "FORM") {
        var elements = fields.elements
        fields = Object.keys(elements)
            .map(function (key) {
                var elem = elements[key]
                return [elem, elem.name]
            })
            .filter(function (tuple) {
                return typeof tuple[0] !== "number"
            })
    // unpack an object containing elements to tuples of
    // [value, key]
    } else if (typeof fields === "object") {
        fields = Object.keys(fields)
            .map(function (key) {
                var elem = fields[key]
                return [elem, key]
            })
    }

    return function () {
        return fields.reduce(function (acc, tuple) {
            var elem = tuple[0]
                , name = tuple[1]

            if (elem.type === "checkbox") {
                acc[name] = elem.checked
            } else if (elem.type === "text") {
                acc[name] = elem.value
            }

            // Do rest later

            return acc
        }, {})
    }
}
