var EventEmitter = require("events").EventEmitter
    , ever = require("ever")

    , FormData = require("./formData")

    , ENTER = 13

module.exports = Submit

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
        ever(elem).on("keypress", function (event) {
            if (event.which === ENTER) {
                submit.emit("submit", sendData())
            }
        })
    }

    function handleButton(elem) {
        ever(elem).on("click", function () {
            submit.emit("submit", sendData())
        })
    }
}
