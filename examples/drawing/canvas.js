var requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame
    , drag = require("./lib/drag")

module.exports = Canvas

/* Canvas widget

    - has a render loop based on requestAnimationFrame that
        resets canvas and renders all paths it currently thinks
        exist.
    - has methods to add and remove paths to it's memory

*/
function Canvas() {
    var canvas = document.createElement("canvas")
        , context = canvas.getContext("2d")
        , events = drag(canvas)
        , memory = {}
        , width = window.innerWidth * 0.75
        , height = window.innerHeight * 0.8

    canvas.width = width
    canvas.height = height

    requestAnimationFrame(render)

    events.view = canvas
    events.addPath = addPath
    events.removePath = removePath

    return events

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
        context.stokeStyle = "black"
        context.moveTo(start.x, start.y)
        context.lineTo(end.x, end.y)
        context.stroke()
    }
}
