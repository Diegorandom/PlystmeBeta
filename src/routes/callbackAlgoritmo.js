var express = require('express');
var router = new express.Router();
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var logger = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
let authOptionsModule = require('../https/auth/authOptions')
let httpsClient = require('../https/httpsClient');
const jsonDatos = require('../models/jsonDatos')

//CONFIGURACIÓN DE MÓDULOS INTERNOS DE EXPRESS
router.use(logger('dev'));
router.use(bodyParser.json()); //DECLARACION DE PROTOCOLO DE LECTURA DE LAS VARIABLES INTERNAS "BODY" DE LAS FUNCIONES 
router.use(bodyParser.urlencoded({ extended: true })); //DECLARACIÓN DE ENCODER DE URL
// eslint-disable-next-line no-undef
router.use(express.static(path.join(__dirname, 'public'))); //DECLARA PATH HACIA PUBLIC BY DEFAULT PARA LOS RECURSOS
router.use(cookieParser());
router.use(methodOverride());

/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
        
        REFERENCIAS:
        1.Documentación de TOP 50 
        https://beta.developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/
*/

router.get('/callback', async (req, res, error) => {
  /*Configuracion de variables globales y position desde cookies*/
  var objetosGlobales = req.app.get('objetosGlobales');
  var position = req.app.get('position');
  position = objetosGlobales.length;
  console.log('apuntador del objeto', position);
  req.sessions.position = position;

  /*Pieza de middleware que dirije los links a la carpeta donde se alojan los recursos*/
  // eslint-disable-next-line no-undef
  router.use(express.static(__dirname + '/public'))

  /*Dado un error en la ruta se llama la pagina de error*/
  if (error == true) { res.render('pages/error', { error: error }) }

  /*Headers necesarios para comunicacion con API de Spotify*/
  res.setHeader('Content-Security-Policy', " child-src accounts.spotify.com api.spotify.com google.com; img-src *;");

  console.log("Llegamos al callback!! \n");


  /*La plataforma hace el request de los queries necesarios para comprobar que la conexion es legítima*/
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[objetosGlobales[0].stateKey] : null;

  if (state === null || state !== storedState) {
    /*En caso de que haya un error de autenticación se lanza el mensaje y se envía a la pággina de error*/
    res.render('pages/error', { error: "Error de autentizacion state_mismatch" });
    console.log('Error de autentizacion state_mismatch', error);
    console.log('State from Spotify -> ', state)
  }

  /*En caso de que la conexión sea legítima se procede con el proceso*/
  res.clearCookie(objetosGlobales[0].stateKey);

  /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
  let authOptions = authOptionsModule.authOptionsFunction(code, objetosGlobales[0].redirect_uri);

  let token = await httpsClient.getToken(
    authOptions,
  )

  objetosGlobales[position] = jsonDatos;

  let logInResponse = await httpsClient.logIn(
    objetosGlobales[0].session[0],
    token.access_token,
    token.refresh_token,
    position,
    objetosGlobales
  )

  console.log('logIn completed ', logInResponse);

  res.redirect(logInResponse.redirect)

});


//Finaliza proceso
module.exports = router;