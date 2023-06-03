var express = require("express");
var router = new express.Router();
var sanitize = require('sanitize-html');
var querystring = require('querystring');

/*PROCESO QUE CREA LA CONFIGURACIÓN PARA COMENZAR LA CONEXION CON LA API DE SPOTIFY*/

router.get('/login', function (req, res, error) {
  var objetosGlobales = req.app.get('objetosGlobales');
  var generateRandomString = req.app.get('generateRandomString')

  if (error == true || objetosGlobales == undefined || objetosGlobales == null) { res.render('pages/error', { error: error }) } else {

    var state = generateRandomString(16);
    res.cookie(objetosGlobales[0].stateKey, state);

    // Solicitud de la aplicación sobre la información que se solicitará a Spotify
    var scope = 'user-read-private user-read-email playlist-read-private user-library-read user-top-read playlist-modify-private user-library-modify';

    /*Response con solicitud al server de Spotify*/
    sanitize(res.redirect('https://accounts.spotify.com/authorize/?' +
      querystring.stringify({
        client_id: objetosGlobales[0].client_id,
        response_type: 'code',
        redirect_uri: objetosGlobales[0].redirect_uri,
        scope: scope,
        state: state
      })))

    console.log("se termina la autorización desde cliente!");
  }

});

//Finaliza proceso
module.exports = router;