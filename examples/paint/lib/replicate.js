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
        console.log("from feedStream", chunk.value)

        var current = model.get(chunk.key)

        if (chunk.type === "put" && !current) {
            dead[chunk.key] = false
            model.set(chunk.key, chunk.value)
        } else if (chunk.type === "del" && current) {
            model.set(chunk.key, null)
        }
    })

    model.on("update", function (tuple, source) {
        if (source === this.id) {
            return
        }

        var key = tuple[0]
            , value = tuple[1]

        console.log("update", tuple, source)

        if (value === null && !dead[key]) {
            dead[key] = true
            db.del(key, error)
        } else {
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
