var requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame

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
        , memory = {
            progress: []
        }
        , width = window.innerWidth * 0.75
        , height = window.innerHeight * 0.8

    canvas.width = width
    canvas.height = height

    // why?
    canvas.onselectstart = function () {
        return false
    }

    requestAnimationFrame(render)

    events.view = canvas
    events.addPath = addPath
    events.removePath = removePath

    events.on("progress", function (path) {
        memory.progress = path
    })

    events.on("path", function () {
        memory.progress = []
    })

    return events

    function render() {
        context.clearRect(0, 0, width, height)

        Object.keys(memory).forEach(function (key) {
            var path = memory[key]

            if (path === null) {
                console.log("memory", key, memory, path)
            }
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

var EventEmitter = require("events").EventEmitter

function drag(elem) {
    var path
        , start
        , result = new EventEmitter()

    elem.addEventListener("mouseup", function () {
        result.emit("path", path)
        path = null
    })

    elem.addEventListener("mousedown", function (ev) {
        path = []
        start = {
            x: ev.clientX - elem.offsetLeft
            , y: ev.clientY - elem.offsetTop
        }
    })

    elem.addEventListener("mousemove", function (ev) {
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
