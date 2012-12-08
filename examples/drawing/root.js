var livefeed = require("level-livefeed")
    , append = require("insert/append")
    , replace = require("insert/replace")
    , uuid = require("node-uuid")
    , WriteStream = require("write-stream")
    , html = require("unpack-html")

    , deleteRange = require("./lib/deleteRange")
    , template = require("./html/root")
    , Canvas = require("./canvas")
    , Controls = require("./controls")

module.exports = Root

function Root(db) {
    var elements = html(template)
        , canvas = Canvas()
        , controls = Controls()
        , stream = livefeed(db, {
            start: "path:"
            , end: "path;"
        })

    controls.on("clear", function () {
        deleteRange(db, {
            start: "path:"
            , end: "path;"
        })
    })

    canvas.on("path", function (path) {
        db.put("path:" + uuid(), path)
    })

    stream.pipe(WriteStream(function (change) {
        if (change.type === "put") {
            canvas.addPath(change.key, change.value)
        } else if (change.type === "del") {
            canvas.removePath(change.key)
        }
    }))

    replace(elements.canvas, canvas.view)
    append(elements.right, controls.view)

    return {
        view: elements.root
    }
}
