var append = require("insert/append")
    , levelidb = require("levelidb")
    , livefeed = require("level-livefeed")
    , uuid = require("node-uuid")
    , WriteStream = require("write-stream")
    , extend = require("xtend")

    , drag = require("./lib/drag")
    , deleteRange = require("./lib/deleteRange")

    , body = document.body
    , canvas = Canvas()
    , db = levelidb("drawing-db", {
        encoding: "json"
    })
    , stream = livefeed(db, {
        start: "path:"
        , end: "path;"
    })

// deleteRange(db, {
//     start: "path:"
//     , end: "path;"
// }, function () {
//     console.log("cleaned keys")
// })

append(body, canvas.view)

canvas.on("path", function (path) {
    db.put("path:" + uuid(), path)
})

stream.pipe(WriteStream(function (change) {
    if (change.type === "put") {
        canvas.renderPath(change.value)
    }
}))

function Canvas() {
    var canvas = document.createElement("canvas")
        , context = canvas.getContext("2d")
        , events = drag(canvas)

    canvas.width = window.innerWidth * 0.8
    canvas.height = window.innerHeight * 0.8

    return extend(events, {
        view: canvas
        , renderPath: renderPath
    })

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
