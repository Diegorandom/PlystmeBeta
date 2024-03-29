/* eslint-disable no-undef */
/*
DOCUMENTACIÓN
Tasa límite de requests Spotify - Documentación 
https://stackoverflow.com/questions/30548073/spotify-web-api-rate-limits
*/

var express = require('express')
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//make sure you keep this order

var cookieParser = require('cookie-parser');
var SpotifyWebApi = require('spotify-web-api-node');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var logger = require('morgan');
var path = require('path');
var sessions = require("client-sessions");
var generateRandomString = require('./src/utils/generateRandomStringCode')


//CONFIGURACIÓN DE MÓDULOS INTERNOS DE EXPRESS
app.use(logger('dev'));
app.use(bodyParser.json()); //DECLARACION DE PROTOCOLO DE LECTURA DE LAS VARIABLES INTERNAS "BODY" DE LAS FUNCIONES 
app.use(bodyParser.urlencoded({ extended: true })); //DECLARACIÓN DE ENCODER DE URL
app.use(express.static(path.join(__dirname, 'public'))); //DECLARA PATH HACIA PUBLIC BY DEFAULT PARA LOS RECURSOS
app.use(cookieParser());
app.use(methodOverride());
var mainSocket = require('./src/sockets/mainSocket')
const neo4jConnection = require('./src/database/connection')
const rateLimit = require('express-rate-limit')

/* 
Documentación de Código

El objeto jsonDatosInit es la variable constructor con la cual se define la estructura de datos de los usuarios.
Este objeto construye el usuario inicial con el cual funciona la plataforma cuando un usuario que no está registrado en el sistema entra a la página principal.
*/
var jsonDatosInit = { nombre: "", ref: false, email: null, external_urls: null, seguidores: null, imagen_url: null, pais: null, access_token: null, track_uri: [], track_uri_ref: null, num: 50, danceability: 0, energia: 0, fundamental: 0, amplitud: 0, modo: 0, dialogo: 0, acustica: 0, instrumental: 0, audiencia: 0, positivismo: 0, tempo: 0, firma_tiempo: 0, duracion: 0, danceability2: 0, energia2: 0, fundamental2: 0, amplitud2: 0, modo2: 0, dialogo2: 0, acustica2: 0, instrumental2: 0, audiencia2: 0, positivismo2: 0, tempo2: 0, firma_tiempo2: 0, duracion2: 0, followers: null, anti_playlist: [], trackid: null, artist_data: [], track_uri_ref2: [], seedTracks: [], userid: null, seed_shuffled: null, pass: null, pass2: null, mes: null, dia: null, año: null, noticias: null, Userdata: [], mensaje: null, add: null, totalUsers: 0, pool: [], playlist: [], popularidadAvg: 0, usuarios: [], bdEstado: "noGuardado", rango: "short_term", cambioRango: false, refresh_token: null, refreshing: false, refreshingUsers: false, session: [] }

/*Se asigna position = 0 para que el sistema siempre arranque funcionando con la estructura inicial del objeto Global que contiene a todos los usuarios*/
var position = 0;

/*Se inicializa objetosGlobales como un arreglo que después se convertirá en un arreglo de objetos json*/
var objetosGlobales = [];

objetosGlobales[0] = jsonDatosInit;
const driver = neo4jConnection();
objetosGlobales[0].session[0] = driver.session();


/*
SETUP DE EXPRESS

Referencia de la tecnología
http://expressjs.com/es/4x/api.html

Infraestructura web rápida, minimalista y flexible para Node.js

Aplicaciones web
Express es una infraestructura de aplicaciones web Node.js mínima y flexible que proporciona un conjunto sólido de características para las aplicaciones web y móviles.
*/

//CONFIGURACIÓN DE MÓDULOS INTERNOS DE EXPRESS
app.use(logger('dev'));
app.use(bodyParser.json()); //DECLARACION DE PROTOCOLO DE LECTURA DE LAS VARIABLES INTERNAS "BODY" DE LAS FUNCIONES 
app.use(bodyParser.urlencoded({ extended: true })); //DECLARACIÓN DE ENCODER DE URL
app.use(express.static(path.join(__dirname, 'public'))); //DECLARA PATH HACIA PUBLIC BY DEFAULT PARA LOS RECURSOS
app.use(cookieParser());
app.use(methodOverride());

/*
SETUP DE PUERTO
con la clase APP y el método SET se configura el puerto a través del cual se comunica el servidor con la interfaz.
El puerto puede ser el 5001 y el asignado por por la configuración del servidor en la variable process.env.PORT

En este misma parte del código se configura con que URL de redireccionamiento trabajará spotify.
Todas estas configuraciones se guardan en la posición [0] del objeto objetosGlobales.
*/
// eslint-disable-next-line no-undef
app.set('port', (process.env.PORT || 5001));
objetosGlobales[0].client_id = process.env.client_id
objetosGlobales[0].client_secret = process.env.client_secret
console.log('objetosGlobales[0].client_id ', process.env.client_id)

if (app.get('port') == 5001) {
    console.log("Corriendo en servidor local con uri de redireccionamiento: ");
    objetosGlobales[0].redirect_uri = 'http://localhost:5001/callback'; // Your redirect uri

    //SETUP DE CONFIGURACIÓN PARA COMUNICARSE CON SPOTIFY DESDE UN SERVIDOR LOCAL Y DESDE LA NUBE
    objetosGlobales[0].spotifyApi = new SpotifyWebApi({
        clientId: 'b590c1e14afd46a69891549457267135',
        clientSecret: process.env.client_secret,
        redirectUri: 'http://localhost:5001/callback'
    });
    console.log(objetosGlobales[0].redirect_uri);

} else {
    console.log("Corriendo en servidor web con uri de redireccionamiento: ");
    objetosGlobales[0].redirect_uri = 'https://www.plystme.com/callback'; // Your redirect uri

    //SETUP DE CONFIGURACIÓN PARA COMUNICARSE CON SPOTIFY DESDE UN SERVIDOR LOCAL Y DESDE LA NUBE
    objetosGlobales[0].spotifyApi = new SpotifyWebApi({
        clientId: 'b590c1e14afd46a69891549457267135',
        clientSecret: config.sessionSecret,
        redirectUri: 'https://www.plystme.com/callback'
    });
    console.log(objetosGlobales[0].redirect_uri);
}

objetosGlobales[0].stateKey = 'spotify_auth_state';
// Finaliza creacion de llaves

/*Configuración de Cookies para control de sesiones*/
var sessionSecreto = generateRandomString(16);

app.use(sessions({
    cookieName: 'sessions',
    secret: sessionSecreto,
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    ephemeral: true
}));
//Termina configuracion de cookies


/*Pieza de middleware que dirije los links a la carpeta donde se alojan los recursos*/
// eslint-disable-next-line no-undef
app.use(express.static(__dirname + '/public'))
// views is directory for all template files/Directorio de Templates
// eslint-disable-next-line no-undef
app.set('views', __dirname + '/src/views');
app.set('view engine', 'ejs');

/*Variables globales que son pasadas a las diferentes rutas del sistema*/
app.set('objetosGlobales', objetosGlobales);
app.set('position', position);
app.set('generateRandomString', generateRandomString);
app.set('driver', driver);

/*
  RUTEO DE TODAS LA FUNCIONES DEL SISTEMA - NO MOVER
*/

/*La ruta /heartbeat mantiene control sobre las sesiones. Mas info en la ruta. */
app.use(require("./src/controllers/heartbeat"));

//PAGINA DE INICIO HACIA LA AUTORIZACIÓN
app.use(require("./src/controllers/inicio"))

//Login procesa el REQUEST de la API de Spotify para autorizacion
app.use(require('./src/controllers/login'))

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to API calls only

/*CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION*/
app.use(require("./src/controllers/callbackAlgoritmo"), apiLimiter);

/*Proceso de conexio con la API del algoritmo del pool*/
app.use(require("./src/controllers/poolAlgoritmo"));

/*Ruta de proceso para guardar playlist en Spotify*/
app.use(require("./src/controllers/guardaPlaylist"));

/*Ruta de proceso para guardar TOP 50 en Spotify*/
app.use(require("./src/controllers/guardarTOP50"));

//Proceso para refrescar un token
app.use(require('./src/https/tokens/tokenRefreshing'));

/*Ruta a perfil*/
app.use(require('./src/controllers/perfil'));

/*PERFIL DE UN TRACK*/
app.use(require("./src/controllers/perfilTrack"));

/*Ruta a preferencias*/
app.use(require("./src/controllers/preferencias"));

app.use(require("./src/controllers/chequeoBD"));

/*Ruta a proceso  para guardar un track*/
app.use(require('./src/controllers/saveTrack'))

/*Ruta a funcion IDLE, la cual depura los datos de objetoGlobales*/
app.use(require('./src/controllers/idle'))

/*Proceso para salirse de una sesion*/
app.use(require('./src/controllers/logOut'))

/*Rutas no implementadas aun*/
app.use(require('./src/controllers/otrosProcesos'))

/*Ambiente de SUPERCOLLIDER - no utilizada por el momento*/
app.use(require("./src/controllers/environmentSC"));

/*Ruta de donde se extrae la información del usuario de Spotify hacia nuestra propia BD*/
app.use(require('./src/controllers/mineriaUsuario'));


/*Ruta donde se administra el tipo de minería necesaria dado que se escoge un rango de tiempo para Top 50 diferente*/
app.use(require('./src/controllers/rangoTiempo'));

/*Ruta para procesos con BD que no se usa actualmente*/
app.use(require('./src/controllers/DatosBD'));

/*Proceso para refrescar token de Spotify (en proceso)*/
app.use(require('./src/https/tokens/refreshingToken'));

/*Ruta para obtener el arreglo con el número de usuarios, sus nombre y fotos, de nuestra BD*/
app.use(require('./src/controllers/usuarios'));

//Revision de usuario para checar si es host
app.use(require('./src/controllers/esHost'));

/*Ruta para llamar la pagina de error para tests*/
app.get('/error', function (req, res, error) {
    console.log('ERROR EN LA PLATAFORMA')
    res.render('./src/views/pages/error', { error: error })
})

/* INICIA SOCKETS*/
io.on('connection', (socket) => {
    mainSocket(
        socket,
        objetosGlobales[0].session[0],
        userId,
        jsonDatos.usuarios
    )
})
/*TERMINA SOCKETS*/


/*Ruta para errores con 404*/
app.get('*', function (req, res, error) {
    if (error == true) {
        console.log('error -> ', error)
        res.redirect('/error');
    } else {
        res.redirect('/');
    }

});

/*Configuración de puerto de la app*/
server.listen(app.get('port'), function (error) {
    if (error == true) {
        console.log(error)
    }

    console.log('Node app is running on port', app.get('port'));
});

