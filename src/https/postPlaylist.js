const https = require('node:https');

const postPlaylist = (options) => {
    https.request(options, function (error, response, body, status) {
        if (error == true) {
            console.log("No se pudo guardar el playlist - status de error-> ", status)
            return {
                send: 'ERROR_ORIGEN',
                response
            }
        } else {
            /*En caso de que no exista el error, se envía mensaje de actualizacion exitosa a cliente*/
            console.log('Actualizacion de playlist exitosa')
            console.log(body)
            console.log("status -> ", status)
            return { send: 'ActualizacionPlaylist' }
        }
    });
}

module.exports = postPlaylist