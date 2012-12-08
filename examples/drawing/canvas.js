module.exports = Canvas

function Canvas() {
    var canvas = document.createElement("canvas")
        , context = canvas.getContext("2d")
        , events = drag(canvas)

    events.on("path", function (p) {
        renderPath(p)
    })

    canvas.width = window.outerWidth * 0.6
    canvas.height = window.outerHeight * 0.6

    return {
        view: canvas
        , renderPath: renderPath
    }

    function renderPath(path) {
        path.forEach(strokePath)
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
