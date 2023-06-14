var express = require('express');
var router = express.Router();
var mineriaDeUsuario = require('../https/mineriaDeUsuario')

console.log('Llegamos a la ruta de mineria de datos de usuario')

router.get('/mineria', function (req, res, error) {
    console.log('entramos a la ruta')
    var driver = req.app.get('driver')
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = req.sessions.position;

    if (error == true || objetosGlobales == undefined || position == undefined) {
        console.log(error)
        console.log('Error Global')
        res.send('Error')
    } else {

        console.log('apuntador del objeto', position);

        //PROCESO DE HARVESTING DE INFORMACIÓN DE USUARIO

        /*Argumentos para solicitud de información del TOP 50 del usuario desde el endpoint*/
        var options = {
            url: 'https://api.spotify.com/v1/me/top/tracks?limit=' + objetosGlobales[position].num + "&time_range=" + objetosGlobales[position].rango,
            headers: { 'Authorization': 'Bearer ' + objetosGlobales[position].access_token },
            json: true
        };
        console.log('Request de informacion de canciones: ', options);

        /*Se hace la solicitud de información del usuario*/
        let response = mineriaDeUsuario(
            options,
            objetosGlobales[position].track_uri,
            objetosGlobales[position].seedTracks,
            objetosGlobales[position].session,
            driver
        )

        if (response.send) {
            res.send(response.send)
        }

        if (response.redirect) {
            res.send(response.redirect)
        }

    }
})

//Finaliza proceso
module.exports = router;