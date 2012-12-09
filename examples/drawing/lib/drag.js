var ever = require("ever")
    , EventEmitter = require("events").EventEmitter

module.exports = drag

function drag(elem) {
    var events = ever(elem)
        , path
        , start
        , result = new EventEmitter()

    events.on("mouseup", function () {
        result.emit("path", path)
        path = null
    })

    events.on("mousedown", function (ev) {
        path = []
        start = {
            x: ev.clientX - elem.offsetLeft
            , y: ev.clientY - elem.offsetTop
        }
    })

    events.on("mousemove", function (ev) {
        if (!path) {
            return
        }

        var point = {
            x: ev.clientX - elem.offsetLeft
            , y: ev.clientY - elem.offsetTop
        }

        path.push([start, point])

        start = point

        result.emit("progress", path)
    })

    return result
}
