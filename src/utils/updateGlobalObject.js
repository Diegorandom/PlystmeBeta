const update = (object, updateObject) => {
    updateObject.forEach(element => {
        object[element.key] = element.value
    });
    return object
}

module.exports = update 