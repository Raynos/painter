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
            x: ev.offsetX
            , y: ev.offsetY
        }
    })

    events.on("mousemove", function (ev) {
        if (!path) {
            return
        }

        var point = {
            x: ev.offsetX
            , y: ev.offsetY
        }

        path.push([start, point])

        start = point
    })

    return result
}
