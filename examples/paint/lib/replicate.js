var livefeed = require("level-livefeed")
    , Model = require("scuttlebutt/model")
    , forEach = require("for-each-stream")

module.exports = replicate

function replicate(db, options) {
    var feedStream = livefeed(db, options)
        , model = Model()
        , stream = model.createStream()
        , dead = {}

    forEach(feedStream, function (chunk) {
        var current = model.get(chunk.key)

        if (chunk.type === "put" && !current) {
            model.set(chunk.key, chunk.value)
        } else if (chunk.type === "del") {
            model.set(chunk.key, null)
        }
    })

    model.on("update", function (tuple, source) {
        if (source === this.id) {
            return
        }

        var key = tuple[0]
            , value = tuple[1]

        if (value === null) {
            db.del(key, error)
        } else if (value !== null) {
            db.put(key, value, error)
        }
    })

    return stream

    function error(err) {
        if (err) {
            return stream.emit("error", err)
        }
    }
}
