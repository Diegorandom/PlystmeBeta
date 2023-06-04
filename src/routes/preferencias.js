var express = require('express');
var router = new express.Router();
var preferencias = require('../https/preferencias')
/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
*/

router.post('/preferencias', function (req, res, error) {
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = req.sessions.position;
    console.log('apuntador del objeto en preferencias', position);

    /*Revisión de errores de origen*/
    if (error == true || objetosGlobales[position] == undefined || objetosGlobales[position] == null) {
        res.send("Error Global")
    } else {

        //Comienza request de perfil de preferencias
        console.log('comienza petición a api')
        console.log('Obteniendo preferencias del id --> ', objetosGlobales[position].userid)

        /*argumentos para solicitud de perfil de preferencial al suriel-api*/
        var options = {
            method: 'POST',
            url: 'https://atmos-algorithm.mybluemix.net/api/v1/user_profile/user_profile',
            headers:
            {
                'Postman-Token': '234b375e-8429-4718-b095-2054555fd0b2',
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            },
            body: { spotifyid: objetosGlobales[position].userid },
            json: true
        };



        /*Función de request de perfil de preferencias de usuario*/
        const getPreferencias = (options) => {
            console.log('La API de preferencias ha sido llamada')
            // llamada a API AQUI
            preferencias(options, objetosGlobales[position] ? true : false, objetosGlobales[position].userid);
        }

        /*Inicio de proceso de obtención de perfil de preferencias del usuario*/
        objetosGlobales[position].preferencias = getPreferencias(options);

    }

});

//Termina request de perfil     
module.exports = router;