var html = require("unpack-html")
    , ever = require("ever")
    , EventEmitter = require("events").EventEmitter
    , extend = require("xtend")

    , template = require("./html/controls")

module.exports = Controls

function Controls() {
    var elements = html(template)
        , controls = new EventEmitter()

    ever(elements.clear).on("click", function () {
        controls.emit("clear")
    })

    return extend(controls, {
        view: elements.root
    })
}
