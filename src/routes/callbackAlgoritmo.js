var express = require('express');
var router = new express.Router();
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var logger = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
let authOptionsModule = require('../utils/auth/authOptions')
let httpsClient = require('../https/httpsClient');

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

router.get('/callback', function (req, res, error) {
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

  /*Inicialización de objeto de usuario*/
  var jsonDatos = { nombre: "", ref: false, email: null, external_urls: null, seguidores: null, imagen_url: null, pais: null, access_token: null, track_uri: [], track_uri_ref: null, num: 50, danceability: 0, energia: 0, fundamental: 0, amplitud: 0, modo: 0, dialogo: 0, acustica: 0, instrumental: 0, audiencia: 0, positivismo: 0, tempo: 0, firma_tiempo: 0, duracion: 0, danceability2: 0, energia2: 0, fundamental2: 0, amplitud2: 0, modo2: 0, dialogo2: 0, acustica2: 0, instrumental2: 0, audiencia2: 0, positivismo2: 0, tempo2: 0, firma_tiempo2: 0, duracion2: 0, followers: null, anti_playlist: [], trackid: null, artist_data: [], track_uri_ref2: [], seedTracks: [], userid: null, seed_shuffled: null, pass: null, pass2: null, mes: null, dia: null, año: null, noticias: null, Userdata: [], mensaje: null, add: null, spotifyid: null, totalUsers: 0, pool: [], playlist: [], popularidadAvg: 0, usuarios: [], bdEstado: "NoGuardado", rango: "short_term", cambioRango: false, refresh_token: null, refreshing: false, refreshingUsers: false, session: [] }

  let logInRequest = httpsClient.prepareToLogin(
    authOptions,
    jsonDatos,
    objetosGlobales[0].session,
    objetosGlobales[0].pais,
    objetosGlobales[0].nombre,
    objetosGlobales[0].email,
    objetosGlobales[0].external_urls,
    objetosGlobales[0].userid,
    objetosGlobales[0].followers,
    objetosGlobales[0].imagen_url,
    objetosGlobales[0].access_token,
    objetosGlobales[0].refresh_token,
    objetosGlobales[0].mensaje,
    objetosGlobales[0].bdEstado,
    objetosGlobales[0].spotifyid,
    objetosGlobales[0].spotifyApi,
  )

  console.log('login response  ', logInRequest._events.response)

  logInRequest.on('error', (e) => {
    console.error(e);
  });

  logInRequest.end()

});


//Finaliza proceso
module.exports = router;