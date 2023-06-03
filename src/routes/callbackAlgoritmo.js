var express = require('express');
var router = new express.Router();
var querystring = require('querystring');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var logger = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
let authOptionsModule = require('../utils/auth/authOptions')
const https = require('https');

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

var callbackAlgoritmo = router.get('/callback', function (req, res, error) {
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
  if (error == true) { res.render('pages/error', { error: error }) } else {

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


    } else {
      /*En caso de que la conexión sea legítima se procede con el proceso*/
      res.clearCookie(objetosGlobales[0].stateKey);

      /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
      let authOptions = authOptionsModule.authOptionsFunction(code, objetosGlobales[0].redirect_uri);

      /*Inicialización de objeto de usuario*/
      var jsonDatos = { nombre: "", ref: false, email: null, external_urls: null, seguidores: null, imagen_url: null, pais: null, access_token: null, track_uri: [], track_uri_ref: null, num: 50, danceability: 0, energia: 0, fundamental: 0, amplitud: 0, modo: 0, dialogo: 0, acustica: 0, instrumental: 0, audiencia: 0, positivismo: 0, tempo: 0, firma_tiempo: 0, duracion: 0, danceability2: 0, energia2: 0, fundamental2: 0, amplitud2: 0, modo2: 0, dialogo2: 0, acustica2: 0, instrumental2: 0, audiencia2: 0, positivismo2: 0, tempo2: 0, firma_tiempo2: 0, duracion2: 0, followers: null, anti_playlist: [], trackid: null, artist_data: [], track_uri_ref2: [], seedTracks: [], userid: null, seed_shuffled: null, pass: null, pass2: null, mes: null, dia: null, año: null, noticias: null, Userdata: [], mensaje: null, add: null, spotifyid: null, totalUsers: 0, pool: [], playlist: [], popularidadAvg: 0, usuarios: [], bdEstado: "NoGuardado", rango: "short_term", cambioRango: false, refresh_token: null, refreshing: false, refreshingUsers: false, session: [] }

      /*Requerimiento de perfil de usuario vía API*/
      https.post(authOptions, function (error, response, bodyS) {

        /*En caso de que la solicitud a la API sea exitosa se procede*/
        if (!error && response.statusCode === 200) {

          objetosGlobales[0].spotifyApi.setAccessToken(bodyS.access_token);

          objetosGlobales[0].access_token = bodyS.access_token;
          objetosGlobales[0].refresh_token = bodyS.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + bodyS.access_token },
            json: true
          };

          /*Utilizando el token de acceso de la autorizacion se procede a solicitar los datos del usuario*/
          https.get(options, function (error, response, bodyS) {
            if (error == true) {
              res.render('pages/error', { error: error })
            } else {
              /*Se guarda la información del usuario en el objeto global correspondiente*/
              jsonDatos.userid = bodyS.id;
              jsonDatos.followers = bodyS.followers.total;
              console.log("userid:" + jsonDatos.userid + '\n');
              objetosGlobales[position] = jsonDatos;
              objetosGlobales[position].access_token = objetosGlobales[0].access_token;

              objetosGlobales[position].refresh_token = objetosGlobales[0].refresh_token;
              console.log('Refresh Token ->', objetosGlobales[position].refresh_token)
              /*Se elimina el access_token del usuario del objeto neutral para que este sea no contamine a otros usuarios con información que no le corresponde*/
              objetosGlobales[0].access_token = null
              objetosGlobales[0].refresh_token = null
              objetosGlobales[position].pais = bodyS.country;
              objetosGlobales[position].nombre = bodyS.display_name;
              objetosGlobales[position].email = bodyS.email;
              objetosGlobales[position].external_urls = bodyS.external_urls;

              //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG de jona
              let imagen_url = "";
              if (bodyS.images[0] != undefined) {
                console.log('imagen_url');
                console.log(imagen_url);
                objetosGlobales[position].imagen_url = bodyS.images[0].url;
                console.log('imagen_url');
                console.log(imagen_url);
              }



              console.log('Comienza proceso de revisión en base de datos para verificar si es un usuario nuevo o ya está regitrado \n');
              console.log('');


              /*Se consulta si el usuario ya existe en la base de datos*/
              const promesaMatchUsuario = objetosGlobales[0].session[0]
                .writeTransaction(tx => tx.run('MATCH (n:usuario) WHERE n.spotifyid={spotifyid} RETURN n', { spotifyid: jsonDatos.userid }))

              promesaMatchUsuario.then(function (checkid_result) {
                console.log('')
                console.log('se realizó la consulta a la base de datos')

                console.log('checkid_result.length:');
                console.log(checkid_result.records.length)

                console.log('');
                /*En caso de que el usuario nuevo se comienza a guardar su información en la base de datos*/
                if (checkid_result.records.length < 1) {
                  console.log(' \n el usuario es nuevo \n');
                  console.log('Se creará nuevo record en base de datos');
                  objetosGlobales[position].mensaje = "nuevo_usuario";


                  /*Se crea el nodo del usuario en la BD*/
                  const promesaCrearUsuario = objetosGlobales[0].session[0]
                    .writeTransaction(tx => tx.run('CREATE (n:usuario {pais:{pais}, nombre:{nombre}, email:{email}, external_urls:{external_urls}, seguidores:{followers}, spotifyid:{spotifyid}, imagen_url: {imagen_url} })', { pais: objetosGlobales[position].pais, nombre: objetosGlobales[position].nombre, email: objetosGlobales[position].email, external_urls: objetosGlobales[position].external_urls.spotify, spotifyid: objetosGlobales[position].userid, followers: objetosGlobales[position].followers, imagen_url: objetosGlobales[position].imagen_url }))

                  promesaCrearUsuario.then(function () {
                    objetosGlobales[0].session[0].close();
                    console.log('Se creó con éxito el nodo del usuario');

                    /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
                    var preventCache = Date.now()
                    console.log(preventCache)
                    res.redirect('/perfil#' +
                      querystring.stringify({
                        access_token: objetosGlobales[position].access_token,
                        refresh_token: objetosGlobales[position].refresh_token,
                        preventCache: preventCache
                      }));


                  })
                  promesaCrearUsuario.catch(function (err) {
                    console.log(err);
                    res.render('pages/error', { error: err })

                  })



                } else if (checkid_result.records.length >= 1) {
                  console.log('Este usuario ya está registrado (no debería ser más de 1)')

                  /*cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. 
                  la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar
                   la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                  objetosGlobales[position].bdEstado = "guardado"

                  objetosGlobales[position].mensaje = "nuevo_login";

                  /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
                  var preventCache = Date.now()
                  console.log(preventCache)
                  res.redirect('/perfil#' +
                    querystring.stringify({
                      access_token: objetosGlobales[position].access_token,
                      refresh_token: objetosGlobales[position].refresh_token,
                      preventCache: preventCache
                    }));



                } else {
                  console.log('No se pudo determinar si es un usuario nuevo o registrado')
                  res.render('pages/error', { error: 'No se pudo determinar si es un usuario nuevo o registrado' })

                }
              })

              promesaMatchUsuario.catch(function (err) {
                console.log(err);
                res.render('pages/error', { error: err })
              })
            }

          })

        } else {
          res.render('pages/error', { error: error })
        }
      })
    }






  }

});


//Finaliza proceso
module.exports = router;
module.exports = {
  callbackAlgoritmo
}