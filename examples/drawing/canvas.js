var extend = require("xtend")
    , requestAnimationFrame = window.requestAnimationFrame

    , drag = require("./lib/drag")

module.exports = Canvas

function Canvas() {
    var canvas = document.createElement("canvas")
        , context = canvas.getContext("2d")
        , events = drag(canvas)
        , memory = {}
        , width = window.innerWidth * 0.8
        , height = window.innerHeight * 0.8

    canvas.width = width
    canvas.height = height

    requestAnimationFrame(render)

    return extend(events, {
        view: canvas
        , addPath: addPath
        , removePath: removePath
    })

    function render() {
        context.clearRect(0, 0, width, height)

        Object.keys(memory).forEach(function (key) {
            var path = memory[key]

            path.forEach(strokePath)
        })

        requestAnimationFrame(render)
    }

    function addPath(key, path) {
        memory[key] = path
    }

    function removePath(key) {
        delete memory[key]
    }

    function strokePath(tuple) {
        var start = tuple[0]
            , end = tuple[1]

        context.beginPath()
        context.setStrokeColor("black")
        context.moveTo(start.x, start.y)
        context.lineTo(end.x, end.y)
        context.stroke()
    }
}
