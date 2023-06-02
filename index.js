/*
DOCUMENTACIÓN
Tasa límite de requests Spotify - Documentación 
https://stackoverflow.com/questions/30548073/spotify-web-api-rate-limits
*/

var express = require('express')
//make sure you keep this order

var cookieParser = require('cookie-parser');
var fs = require("fs");
var SpotifyWebApi = require('spotify-web-api-node');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var logger = require('morgan');
var path = require('path');
var shuffle = require('shuffle-array');
var neo4j = require('neo4j-driver').v1;
var sessions = require("client-sessions");
var idleTimer = require("idle-timer");
var DelayedResponse = require('http-delayed-response')

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var cookieParser = require('cookie-parser');


//CONFIGURACIÓN DE MÓDULOS INTERNOS DE EXPRESS
app.use(logger('dev')); 
app.use(bodyParser.json()); //DECLARACION DE PROTOCOLO DE LECTURA DE LAS VARIABLES INTERNAS "BODY" DE LAS FUNCIONES 
app.use(bodyParser.urlencoded({ extended:true})); //DECLARACIÓN DE ENCODER DE URL
app.use(express.static(path.join(__dirname, 'public'))); //DECLARA PATH HACIA PUBLIC BY DEFAULT PARA LOS RECURSOS
app.use(cookieParser());
app.use(methodOverride());

/* 
Documentación de Código

El objeto jsonDatosInit es la variable constructor con la cual se define la estructura de datos de los usuarios.
Este objeto construye el usuario inicial con el cual funciona la plataforma cuando un usuario que no está registrado en el sistema entra a la página principal.
*/
var jsonDatosInit = {nombre:"", ref:false, email:null, external_urls:null, seguidores:null, imagen_url:null, pais:null, access_token:null, track_uri:[], track_uri_ref:null, num:50, danceability:0, energia:0, fundamental:0, amplitud:0, modo:0, dialogo:0, acustica:0, instrumental:0, audiencia:0, positivismo:0, tempo:0, firma_tiempo:0, duracion:0, danceability2:0, energia2:0, fundamental2:0, amplitud2:0, modo2:0, dialogo2:0, acustica2:0, instrumental2:0, audiencia2:0, positivismo2:0, tempo2:0, firma_tiempo2:0, duracion2:0, followers:null, anti_playlist:[], trackid:null ,artist_data:[], track_uri_ref2:[], seedTracks:[], userid:null, seed_shuffled:null, pass:null, pass2:null, mes:null, dia:null, año:null, noticias:null, Userdata:[], mensaje:null, add:null, totalUsers:0, pool:[], playlist:[], popularidadAvg:0, usuarios:[], bdEstado:"noGuardado", rango:"short_term", cambioRango:false, refresh_token:null, refreshing:false, refreshingUsers:false, session:[]}

/*Se asigna position = 0 para que el sistema siempre arranque funcionando con la estructura inicial del objeto Global que contiene a todos los usuarios*/
var position = 0;

/*Se inicializa objetosGlobales como un arreglo que después se convertirá en un arreglo de objetos json*/
var objetosGlobales=[];

objetosGlobales[0] = jsonDatosInit;

// Conexión con base de datos remota NO CAMBIAR
var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

console.log(graphenedbUser)

/*
Configuración de base de datos

Hay 2 tipos de conexiones posibles:
    1. Conexion con base de datos local
    2. Conexion con base de datos del servidor
    
Cuando se conecta la base de datos con localhost deben usarse los permisos mencionados en la siguiente estructura IF.
No se debe cambiar nada de la estructura de configuración de la base de datos.
*/

if(graphenedbURL == undefined){
    var driver = neo4j.driver('bolt://hobby-gbcebfemnffigbkefemgfaal.dbs.graphenedb.com:24786', 
                                neo4j.auth.basic('app91002402-MWprOS', 'b.N1zF4KnI6xoa.Kt5xmDPgVvFuO0CG'), 
                                {maxTransactionRetryTime: 60 * 1000});
}else{
    var driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass), 
                            {maxTransactionRetryTime: 60 * 1000});
};

objetosGlobales[0].session[0] = driver.session();

/* 
PROTOCOLO DE SEGURIDAD CON CLAVE SPOTIFY 

El protocolo de seguridad utiliza una llave la cual se encuentre en secret-config.json y por ningun motivo debe ser compartida con ninguna persona que no pertenezca al grupo de programadores de Atmos.
*/

var fileName = "./secret-config.json";
var config;

/*la siguiente estructura TRY configura la llave secreta y la manda a llamar en la variable config.*/
try {
  config = require(fileName);
}
catch (err) {
  config = {}
  console.log("unable to read file '" + fileName + "': ", err);
  console.log("see secret-config-sample.json for an example");
};

console.log("session secret is:", config.sessionSecret);
//Finaliza protocolo de seguridad

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
app.use(bodyParser.urlencoded({ extended:true})); //DECLARACIÓN DE ENCODER DE URL
app.use(express.static(path.join(__dirname, 'public'))); //DECLARA PATH HACIA PUBLIC BY DEFAULT PARA LOS RECURSOS
app.use(cookieParser());
app.use(methodOverride());


/*
SETUP DE PUERTO
con la clase APP y el método SET se configura el puerto a través del cual se comunica el servidor con la interfaz.
El puerto puede ser el 5000 y el asignado por por la configuración del servidor en la variable process.env.PORT

En este misma parte del código se configura con que URL de redireccionamiento trabajará spotify.
Todas estas configuraciones se guardan en la posición [0] del objeto objetosGlobales.
*/
app.set('port', (process.env.PORT || 5000));

objetosGlobales[0].client_id = 'b590c1e14afd46a69891549457267135'; // Your client id
objetosGlobales[0].client_secret = config.sessionSecret; // Your secret

if( app.get('port') == 5000 ){
    console.log("Corriendo en servidor local con uri de redireccionamiento: ");
    objetosGlobales[0].redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri

    //SETUP DE CONFIGURACIÓN PARA COMUNICARSE CON SPOTIFY DESDE UN SERVIDOR LOCAL Y DESDE LA NUBE
    objetosGlobales[0].spotifyApi = new SpotifyWebApi({
        clientId: 'b590c1e14afd46a69891549457267135',
        clientSecret: config.sessionSecret,
        redirectUri: 'http://localhost:5000/callback' 
    }); 
    console.log(objetosGlobales[0].redirect_uri);
}else{
    console.log("Corriendo en servidor web con uri de redireccionamiento: ");
    objetosGlobales[0].redirect_uri = 'https://www.plystme.com/callback'; // Your redirect uri

    //SETUP DE CONFIGURACIÓN PARA COMUNICARSE CON SPOTIFY DESDE UN SERVIDOR LOCAL Y DESDE LA NUBE
    objetosGlobales[0].spotifyApi = new SpotifyWebApi({
        clientId: 'b590c1e14afd46a69891549457267135',
        clientSecret: config.sessionSecret,
        redirectUri: 'https://www.plystme.com/callback' 
    });
    console.log(objetosGlobales[0].redirect_uri);
};
//Finaliza setup de puerto

      
/*
    Este proceso funciona para crear una llave de acceso a la API de SPOTIFY
    
    La llave enviada a la API será comparada con la que se reciba después del proceso y estas deberán coincidir para no generar un error.

 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 
*/
var generateRandomStringCode = function(length) {
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var generateRandomString = function(length) {
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

objetosGlobales[0].stateKey = 'spotify_auth_state';
// Finaliza creacion de llaves

/*Configuración de Cookies para control de sesiones*/
var sessionSecreto = generateRandomString(16);

app.use(sessions({
  cookieName: 'sessions',
  secret: sessionSecreto,
  duration: 24* 60 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  ephemeral: true
}));
//Termina configuracion de cookies


/*Pieza de middleware que dirije los links a la carpeta donde se alojan los recursos*/
app.use(express.static(__dirname + '/public'))
// views is directory for all template files/Directorio de Templates
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

/*Variables globales que son pasadas a las diferentes rutas del sistema*/
app.set('objetosGlobales',objetosGlobales);
app.set('position',position);
app.set('generateRandomString',generateRandomString);
app.set('driver', driver);

/*
            RUTEO DE TODAS LA FUNCIONES DEL SISTEMA - NO MOVER
*/

/*La ruta /heartbeat mantiene control sobre las sesiones. Mas info en la ruta. */
app.use(require("./routes/heartbeat"));

//PAGINA DE INICIO HACIA LA AUTORIZACIÓN
app.use(require("./routes/inicio"))

//Login procesa el REQUEST de la API de Spotify para autorizacion
app.use(require('./routes/login'))

/*CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION*/
app.use(require("./routes/callbackAlgoritmo"));

/*Proceso de conexio con la API del algoritmo del pool*/
app.use(require("./routes/poolAlgoritmo"));

/*Ruta de proceso para guardar playlist en Spotify*/
app.use(require("./routes/guardaPlaylist"));

/*Ruta de proceso para guardar TOP 50 en Spotify*/
app.use(require("./routes/guardarTOP50"));

//Proceso para refrescar un token
app.use(require('./routes/tokenRefreshing'));

/*Ruta a perfil*/
app.use(require('./routes/perfil'));
        
/*PERFIL DE UN TRACK*/
app.use(require("./routes/perfilTrack"));

/*Ruta a preferencias*/
app.use(require("./routes/preferencias"));

app.use(require("./routes/chequeoBD"));

/*Ruta a proceso  para guardar un track*/
app.use(require('./routes/saveTrack'))

/*Ruta a funcion IDLE, la cual depura los datos de objetoGlobales*/
app.use(require('./routes/idle'))

/*Proceso para salirse de una sesion*/
app.use(require('./routes/logOut'))

/*Rutas no implementadas aun*/
app.use(require('./routes/otrosProcesos'))

/*Ambiente de SUPERCOLLIDER - no utilizada por el momento*/
app.use(require("./routes/environmentSC"));

/*Ruta de donde se extrae la información del usuario de Spotify hacia nuestra propia BD*/
app.use(require('./routes/mineriaUsuario'));


/*Ruta donde se administra el tipo de minería necesaria dado que se escoge un rango de tiempo para Top 50 diferente*/
app.use(require('./routes/rangoTiempo'));

/*Ruta para procesos con BD que no se usa actualmente*/
app.use(require('./routes/DatosBD'));

/*Proceso para refrescar token de Spotify (en proceso)*/
app.use(require('./routes/refreshingToken'));

/*Ruta para obtener el arreglo con el número de usuarios, sus nombre y fotos, de nuestra BD*/
app.use(require('./routes/usuarios'));

/*Ruta no utilizada*/
app.use(require('./routes/posicionUsuarios'));

//Revision de usuario para checar si es host
app.use(require('./routes/esHost'));

/*Ruta para llamar la pagina de error para tests*/
app.get('/error', function(req, res, error){
    console.log('ERROR EN LA PLATAFORMA')    
    res.render('pages/error', {error:error})
})

/* INICIA SOCKETS*/

var sockets = require("./routes/sockets/sockets");c
io.on('connection', sockets.call() )



/*TERMINA SOCKETS*/


/*Ruta para errores con 404*/
app.get('*', function(req, res, error) {
    if(error == true){
        console.log('error -> ', error)
        res.redirect('/error');
    }else{
        res.redirect('/');
    }
    
});

/*Configuración de puerto de la app*/
server.listen(app.get('port'), function(error) {
    if(error == true){
        console.log(error)
    }
    
  console.log('Node app is running on port', app.get('port'));
});

