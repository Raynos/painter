module.exports = FormData

//TODO: Massive spec: http://www.whatwg.org/specs/web-apps/current-work/multipage/association-of-controls-and-forms.html#constructing-form-data-set
function FormData(fields) {
    // handle <form>
    if (fields.tagName === "FORM") {
        var elements = fields.elements
        fields = Object.keys(elements)
            .map(function (key) {
                var elem = elements[key]
                return [elem, elem.name]
            })
            .filter(function (tuple) {
                return typeof tuple[0] !== "number"
            })
    // unpack an object containing elements to tuples of
    // [value, key]
    } else if (typeof fields === "object") {
        fields = Object.keys(fields)
            .map(function (key) {
                var elem = fields[key]
                return [elem, key]
            })
    }

    return function () {
        return fields.reduce(function (acc, tuple) {
            var elem = tuple[0]
                , name = tuple[1]

            if (elem.type === "checkbox") {
                acc[name] = elem.checked
            } else if (elem.type === "text") {
                acc[name] = elem.value
            }

            // Do rest later

            return acc
        }, {})
    }
}
