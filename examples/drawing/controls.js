var html = require("unpack-html")
    , EventEmitter = require("events").EventEmitter

    , template = require("./html/controls")

module.exports = Controls

/* very simple controls widget that has a clear button on it

*/
function Controls() {
    var elements = html(template)
        , controls = new EventEmitter()

    elements.clear.addEventListener("click", function () {
        controls.emit("clear")
    })

    controls.view = elements.root

    return controls
}
