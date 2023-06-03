/* eslint-disable no-undef */
const checkUrl = (url) => {
    console.log('Checando URL -> ', url)
    return $.get(url)
        .done(function () {
            return true
            // Do something now you know the image exists.

        }).fail(function () {
            return false
            // Image doesn't exist - do something else.

        })
}
module.exports = checkUrl
