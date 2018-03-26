// NODE MODULES
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var fs = require("fs");
var SpotifyWebApi = require('spotify-web-api-node');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var logger = require('morgan');
var path = require('path');
var sc = require('supercolliderjs');
var sanitize = require('sanitize-html');
var shuffle = require('shuffle-array');
var neo4j = require('neo4j-driver').v1;

var jsonDatos = {nombre:"", ref:false, email:null, external_urls:null, seguidores:null, imagen_url:null, pais:null, access_token:null, track_uri:null, track_uri_ref:null, num:50, bailongo:0, energia:0, fundamental:0, amplitud:0, modo:0, dialogo:0, acustica:0, instrumental:0, audiencia:0, positivismo:0, tempo:0, firma_tiempo:0, duracion:0, bailongo2:0, energia2:0, fundamental2:0, amplitud2:0, modo2:0, dialogo2:0, acustica2:0, instrumental2:0, audiencia2:0, positivismo2:0, tempo2:0, firma_tiempo2:0, duracion2:0, followers:null, anti_playlist:[], bailongoS:null, energiaS:null, fundamentalS:null, amplitudS:null, modoS:null, dialogoS:null, acusticaS:null, positivismoS:null, instrumentalS:null, audienciaS:null, tempoS:null, firma_tiempoS:null, duracionS:null, urlS:null, imagenS:null, nombreAS:null,  popS:null, nombreS:null,trackid:null ,artist_data:[], uri_S:null, track_uri_ref2:[], seedTracks:[], userid:0, seed_shuffled:null, pass:null, pass2:null, mes:null, dia:null, año:null, noticias:null, Userdata:[], mensaje:null, add:null, spotifyid:null, totalUsers:0}

var objetosGlobales={
    usuarios: {}
};

objetosGlobales.usuarios[jsonDatos.userid] = jsonDatos;


// Conexión con base de datos remota
var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

//BASE DE DATOS

if(graphenedbURL == undefined){
	var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'mdl'));
	var session = driver.session();
}else{
	var driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
	var session = driver.session();
};

//PROTOCOLO DE SEGURIDAD CON CLAVE SPOTIFY

var fileName = "./secret-config.json";
var config;

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



//SETUP DE EXPRESS
var app = express();

//CONFIGURACIÓN DE MÓDULOS INTERNOS DE EXPRESS
app.use(logger('dev')); 
app.use(bodyParser.json()); //DECLARACION DE PROTOCOLO DE LECTURA DE LAS VARIABLES INTERNAS "BODY" DE LAS FUNCIONES 
app.use(bodyParser.urlencoded({ extended:true})); //DECLARACIÓN DE ENCODER DE URL
app.use(express.static(path.join(__dirname, 'public'))); //DECLARA PATH HACIA PUBLIC BY DEFAULT PARA LOS RECURSOS
app.use(cookieParser());
app.use(methodOverride());


//SETUP DE PUERTO
app.set('port', (process.env.PORT || 5000));

//SETUP DE CONFIGURACIÓN PARA COMUNICARSE CON SPOTIFY DESDE UN SERVIDOR LOCAL Y DESDE LA NUBE
if( app.get('port') == 5000 ){
    console.log("Corriendo en servidor local con uri de redireccionamiento: ");
 
    var client_id = 'b590c1e14afd46a69891549457267135'; // Your client id
    var client_secret = config.sessionSecret; // Your secret
    var redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri

    var spotifyApi = new SpotifyWebApi({
        clientId: 'b590c1e14afd46a69891549457267135',
        clientSecret: config.sessionSecret,
        redirectUri: 'http://localhost:5000/callback' 
    }); 
    console.log(redirect_uri);
}else{
    console.log("Corriendo en servidor web con uri de redireccionamiento: ");
    var client_id = 'b590c1e14afd46a69891549457267135'; // Your client id
    var client_secret = config.sessionSecret; // Your secret
    var redirect_uri = 'https://proyecto-techclub.herokuapp.com/callback'; // Your redirect uri

    var spotifyApi = new SpotifyWebApi({
        clientId: 'b590c1e14afd46a69891549457267135',
        clientSecret: config.sessionSecret,
        redirectUri: 'https://proyecto-techclub.herokuapp.com/callback' 
    });
    console.log(redirect_uri);
};
//Finaliza setup


/**
    Este proceso funciona para crear una llave de acceso a la API
    
    La llave enviada a la API será comparada con la que se reciba después del proceso y estas deberán coincidir para no generar un error.

 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';
// Finaliza creacion de llaves

/*
Pieza de middleware que dirije los links a la carpeta donde se alojan los recursos
*/
app.use(express.static(__dirname + '/public'))

//PAGINA DE INICIO HACIA LA AUTORIZACIÓN
app.get('/', function(req, res, error){ 
if(error == true){
    res.render('pages/error')
}else{    

    session
    .run('MATCH (n:usuario) RETURN COUNT(n)')
    .then(function(response){
        response.records.forEach(function(record){
            objetosGlobales.usuarios[jsonDatos.userid].totalUsers = record._fields[[0]].low; 
        });
        
        res.render('pages/autorizacion',  objetosGlobales.usuarios[jsonDatos.userid]);
        
    })
    .catch(function(err){
		console.log(err);
		})
}
});


//Login procesa el REQUEST de la API de Spotify para autorizacion
app.get('/login', function(req, res, error) {
if(error == true){ res.render('pages/error')}else{
    
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private user-library-read user-top-read playlist-modify-private user-library-modify';
    
    
  sanitize(res.redirect('https://accounts.spotify.com/authorize/?' +
    querystring.stringify({
      client_id: client_id,
      response_type: 'code',
      redirect_uri: redirect_uri,
      scope: scope,
      state: state
    })))
    
    console.log("se termina la autorización desde cliente!");
}
    
});
//Finaliza proceso



/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
*/

app.get('/callback', function(req, res, error) {
    if(error == true){ res.render('pages/error')}else{ 
    
  res.setHeader('Content-Security-Policy', " child-src accounts.spotify.com api.spotify.com google.com; img-src *;");
    
  // your application requests refresh and access tokens
  // after checking the state parameter
    
  console.log("Llegamos al callback!! \n");

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
      
     res.redirect('/error#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
      console.log('Error de autentizacion state_mismatch');
 
  }else {
      
    res.clearCookie(stateKey);
      
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, bodyS) {
        
      if (!error && response.statusCode === 200) {
           
          spotifyApi.setAccessToken(bodyS.access_token);
          
          objetosGlobales.usuarios[jsonDatos.userid].access_token = bodyS.access_token;
          
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + objetosGlobales.usuarios[jsonDatos.userid].access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, bodyS) {
            
            console.log("Datos:");
            console.log(bodyS);
            
            jsonDatos.userid = bodyS.id
            objetosGlobales.usuarios[jsonDatos.userid] = jsonDatos;
            objetosGlobales.usuarios[jsonDatos.userid].pais = bodyS.country;
            objetosGlobales.usuarios[jsonDatos.userid].nombre = bodyS.display_name;
            console.log(bodyS.display_name);
            objetosGlobales.usuarios[jsonDatos.userid].email = bodyS.email;
            objetosGlobales.usuarios[jsonDatos.userid].external_urls = bodyS.external_urls;
            imagen_url = "";
            
            //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG el pendejo de jona
            if(bodyS.images[0] != undefined){
                console.log('imagen_url');
                console.log(imagen_url);
                objetosGlobales.usuarios[jsonDatos.userid].imagen_url =  bodyS.images[0].url;
                console.log('imagen_url');
                console.log(imagen_url);
            };
             
            jsonDatos.followers = bodyS.followers.total;    
            console.log("userid:" + jsonDatos.userid + '\n');
            
            objetosGlobales.usuarios[jsonDatos.userid].refresh_token = bodyS.refresh_token;
            
            console.log('Comienza proceso de revisión en base de datos para verificar si es un usuario nuevo o ya está regitrado \n');
            console.log('');
            
             session
            .run('MATCH (n:usuario) WHERE n.spotifyid={spotifyid} RETURN n', {spotifyid:jsonDatos.userid})
            .then(function(checkid_result){ 
                 console.log('')
                 console.log('se realizó la consulta a la base de datos')
                 
                 console.log('checkid_result.length:');
                 console.log(checkid_result.records.length)
                 
                        console.log('');
                 
                        if(checkid_result.records.length< 1){ 
                            console.log(' \n el usuario es nuevo \n');
                            console.log('')
                            console.log('Se creará nuevo record en base de datos');
                            objetosGlobales.usuarios[jsonDatos.userid].mensaje = "nuevo_usuario";
                            
                            session
                            .run('CREATE (n:usuario {pais:{pais}, nombre:{nombre}, email:{email}, external_urls:{external_urls}, seguidores:{followers}, spotifyid:{spotifyid}, followers:{followers}, imagen_url: {imagen_url} })', { pais:objetosGlobales.usuarios[jsonDatos.userid].pais, nombre:objetosGlobales.usuarios[jsonDatos.userid].nombre, email:objetosGlobales.usuarios[jsonDatos.userid].email, external_urls:objetosGlobales.usuarios[jsonDatos.userid].external_urls.spotify, spotifyid:jsonDatos.userid, followers:objetosGlobales.usuarios[jsonDatos.userid].followers, imagen_url:objetosGlobales.usuarios[jsonDatos.userid].imagen_url })
                            .then(function(resultado_create){
                                console.log('Se creó con éxito el nodo del usuario');
                                console.log(resultado_create)
                                 })
                            .catch(function(err){
                            console.log(err);
                            }) 
                            
                            
                             //PROCESO DE HARVESTING DE INFORMACIÓN DE USUARIO
                                    var options2 = {
                                      url: 'https://api.spotify.com/v1/me/top/tracks?limit=' + objetosGlobales.usuarios[jsonDatos.userid].num +"&time_range=long_term",
                                      headers: { 'Authorization': 'Bearer ' + objetosGlobales.usuarios[jsonDatos.userid].access_token },
                                      json: true
                                    };
                                    console.log('Request de informacion de canciones: ', options2);
                                    request.get(options2, function(error, response, body){     
            
                                console.log("50 tracks principales")
                                console.log(body);

                                var i = 0;

                                body.items.forEach(function(record, index){

                                    console.log(record)

                                     session
                                        .run('MATCH (n:track {spotifyid:{id}}) RETURN n', {id:record.id})
                                        .then(function(checktrack){
                                         var artistas = [];

                                         for(var i = 0; i < record.artists.length; i++){
                                            artistas.push(record.artists[i].name)
                                        }

                                        console.log('')
                                        console.log('se realizó la consulta a la base de datos')

                                        console.log(checktrack)


                                    console.log('');

                                    if(checktrack.records.length<1){

                                        // SE GUARDA LA INFORMACIÓN DEL TRACK EN LA BASE DE DATOS
                                        
                                            console.log(' \n Es la primera vez que se analiza este track \n');
                                            console.log('')
                                            console.log('Se creará nuevo record en base de datos');
                                          
                                            session
                                            .run('CREATE (n:track {album:{album}, nombre:{nombre}, artistas:{artistas}, duracion:{duracion}, Contenido_explicito:{Cont_explicito}, externalurls: {externalurls}, href:{href}, spotifyid:{spotifyid}, reproducible:{reproducible}, popularidad:{popularidad}, previewUrl:{previewUrl}, uri:{uri}, albumImagen:{albumImagen}})', { album:record.album.name, nombre:record.name, artistas:artistas, duracion:record.duration_ms, Cont_explicito:record.explicit, externalurls:record.external_urls.spotify, href:record.href, spotifyid:record.id, reproducible:record.is_playable, popularidad:record.popularity, previewUrl:record.preview_url, uri:record.uri, albumImagen:record.album.images[2].url })
                                            .then(function(resultado_create){
                                                console.log('Se Guardo con éxito la información de este track');
                                                console.log(resultado_create)


                                                session
                                                .run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (n)<-[:Escuchado {importanciaIndex: {index}}]-(m)', {spotifyidUsuario:spotifyid, spotifyid:record.id, index:index+1 })
                                                .then(function(resultado){
                                                    console.log("Se conecto exitosamente el track con el usuario")
                                                    console.log(resultado)
                                                })
                                                 .catch(function(err){
                                                console.log(err);
                                                })

                                            })
                                            .catch(function(err){
                                            console.log(err);
                                            })



                                    }else if(checktrack.records.length>=1){
                                        console.log('Este track ya está registrado (no debería ser más de 1)')
                                       
                                    }
                                     })
                                     .catch(function(err){
                                    console.log(err);
                                    }) 
                                     
                                     //TERMINA DE GUARDARSE INFORMACIÓN DEL TRACK Y COMIENZA A PROCRESARCE EL ALGORITMO

                                     objetosGlobales.usuarios[jsonDatos.userid].track_uri = record.uri.substring(14);
                                    

                                    //PROCESO PARA GUARDAR LOS PRIMEROS 5 TOP TRACKS
                                    if(index < 5){
                                        objetosGlobales.usuarios[jsonDatos.userid].seedTracks[index] = record.uri;
                                        objetosGlobales.usuarios[jsonDatos.userid].track_uri_ref2[index] = record.uri.substring(14);
                                    }


                                    //SEG GUARDA LA INFORMACIÓN DEL TRACKS EN LA BASE DE DATOS
                                     spotifyApi.getAudioFeaturesForTrack(record.uri.substring(14))
                                      .then(function(data) {

                                         var bailongo_bd = parseFloat(data.body.danceability);
                                         var energia_bd = parseFloat(data.body.energy);
                                         var fundamental_bd = parseFloat(data.body.key); 
                                         var amplitud_bd = parseFloat(data.body.loudness);
                                         var modo_bd = parseFloat(data.body.mode);
                                         var dialogo_bd =parseFloat(data.body.speechiness);
                                         var acustica_bd = parseFloat(data.body.acousticness);
                                         var instrumental_bd = parseFloat(data.body.instrumentalness);
                                         var audiencia_bd = parseFloat(data.body.liveness);
                                         var positivismo_bd = parseFloat(data.body.valence);
                                         var tempo_bd = parseFloat(data.body.tempo);
                                         var firma_tiempo_bd = parseFloat(data.body.time_signature);
                                         var duracion_bd =  parseFloat(data.body.duration_ms);

                                         session
                                            .run('MATCH (n:track {uri:{track_uri}}) WHERE NOT EXISTS(n.bailongo) RETURN n', {track_uri:record.uri})
                                            .then(function(resultado){
                                                console.log("1 = Debe guardarse la info, 0 = no pasa nada")
                                                console.log(resultado.records)

                                                if(resultado.records.length>=1){


                                                     session
                                                        .run('MATCH (n:track {uri:{track_uri}}) SET n.bailongo={bailongo}, n.energia={energia}, n.fundamental={fundamental}, n.amplitud={amplitud}, n.modo={modo}, n.speechiness={dialogo}, n.acousticness={acustica}, n.instrumentalness={instrumental}, n.positivismo={positivismo}, n.tempo={tempo}, n.compas={firma_tiempo}, n.liveness={audiencia} RETURN n', {bailongo:bailongo_bd, energia:energia_bd,  fundamental: fundamental_bd, amplitud:amplitud_bd, modo:modo_bd, dialogo:dialogo_bd, acustica:acustica_bd, instrumental:instrumental_bd, audiencia:audiencia_bd, positivismo:positivismo_bd, tempo:tempo_bd, firma_tiempo:firma_tiempo_bd, track_uri:record.uri })
                                                        .then(function(resultado){
                                                            console.log(resultado)
                                                            console.log('Se guardaron las caracteristicas del track')
                                                        })
                                                         .catch(function(err){
                                                            console.log(err);
                                                        })
                                                }
                                            })
                                             .catch(function(err){
                                                console.log(err);
                                            })


                                         //ALGORITMO
                                         i = i + 1;
                                        console.log('i: ' + i);


                                         //Suma para luego sacar promedio
                                         objetosGlobales.usuarios[jsonDatos.userid].bailongo = objetosGlobales.usuarios[jsonDatos.userid].bailongo + parseFloat(data.body.danceability);
                                         objetosGlobales.usuarios[jsonDatos.userid].energia = objetosGlobales.usuarios[jsonDatos.userid].energia + parseFloat(data.body.energy);
                                         objetosGlobales.usuarios[jsonDatos.userid].fundamental = objetosGlobales.usuarios[jsonDatos.userid].fundamental + parseFloat(data.body.key); 
                                         objetosGlobales.usuarios[jsonDatos.userid].amplitud = objetosGlobales.usuarios[jsonDatos.userid].amplitud + parseFloat(data.body.loudness);
                                         objetosGlobales.usuarios[jsonDatos.userid].modo = objetosGlobales.usuarios[jsonDatos.userid].modo + parseFloat(data.body.mode);
                                         objetosGlobales.usuarios[jsonDatos.userid].dialogo = objetosGlobales.usuarios[jsonDatos.userid].dialogo + parseFloat(data.body.speechiness);
                                         objetosGlobales.usuarios[jsonDatos.userid].acustica = objetosGlobales.usuarios[jsonDatos.userid].acustica + parseFloat(data.body.acousticness);
                                         objetosGlobales.usuarios[jsonDatos.userid].instrumental = objetosGlobales.usuarios[jsonDatos.userid].instrumental + parseFloat(data.body.instrumentalness);
                                         objetosGlobales.usuarios[jsonDatos.userid].audiencia = objetosGlobales.usuarios[jsonDatos.userid].audiencia + parseFloat(data.body.liveness);
                                         objetosGlobales.usuarios[jsonDatos.userid].positivismo = objetosGlobales.usuarios[jsonDatos.userid].positivismo + parseFloat(data.body.valence);
                                         objetosGlobales.usuarios[jsonDatos.userid].tempo = objetosGlobales.usuarios[jsonDatos.userid].tempo + parseFloat(data.body.tempo);
                                         objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo = objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo + parseFloat(data.body.time_signature);
                                         objetosGlobales.usuarios[jsonDatos.userid].duracion = objetosGlobales.usuarios[jsonDatos.userid].duracion + parseFloat(data.body.duration_ms);


                                        if(i == objetosGlobales.usuarios[jsonDatos.userid].num){
                                            objetosGlobales.usuarios[jsonDatos.userid].bailongo = (objetosGlobales.usuarios[jsonDatos.userid].bailongo/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].energia = (objetosGlobales.usuarios[jsonDatos.userid].energia/objetosGlobales.usuarios[jsonDatos.userid].num)*100; 
                                            objetosGlobales.usuarios[jsonDatos.userid].fundamental = objetosGlobales.usuarios[jsonDatos.userid].fundamental/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].amplitud = objetosGlobales.usuarios[jsonDatos.userid].amplitud/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].modo = objetosGlobales.usuarios[jsonDatos.userid].modo/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].dialogo = (objetosGlobales.usuarios[jsonDatos.userid].dialogo/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].acustica = (objetosGlobales.usuarios[jsonDatos.userid].acustica/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].positivismo = (objetosGlobales.usuarios[jsonDatos.userid].positivismo/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].instrumental = (objetosGlobales.usuarios[jsonDatos.userid].instrumental/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].audiencia = (objetosGlobales.usuarios[jsonDatos.userid].audiencia/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].tempo = objetosGlobales.usuarios[jsonDatos.userid].tempo/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo = objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].duracion = Math.round(objetosGlobales.usuarios[jsonDatos.userid].duracion/objetosGlobales.usuarios[jsonDatos.userid].num);

                                            console.log('bailongo: ' + objetosGlobales.usuarios[jsonDatos.userid].bailongo);
                                            console.log('energia: ' + objetosGlobales.usuarios[jsonDatos.userid].energia);
                                            console.log('fundamental: ' + objetosGlobales.usuarios[jsonDatos.userid].fundamental);
                                            console.log('amplitud: ' + objetosGlobales.usuarios[jsonDatos.userid].amplitud);
                                            console.log('modo: ' + objetosGlobales.usuarios[jsonDatos.userid].modo);
                                            console.log('dialogo: ' + objetosGlobales.usuarios[jsonDatos.userid].dialogo);
                                            console.log('acustica: ' + objetosGlobales.usuarios[jsonDatos.userid].acustica);
                                            console.log('instrumental: ' + objetosGlobales.usuarios[jsonDatos.userid].instrumental);
                                            console.log('audiencia: ' + objetosGlobales.usuarios[jsonDatos.userid].audiencia);
                                            console.log('positivismo: ' + objetosGlobales.usuarios[jsonDatos.userid].positivismo);
                                            console.log('tempo: ' + objetosGlobales.usuarios[jsonDatos.userid].tempo);
                                            console.log('firma_tiempo:' + objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo);
                                            console.log('duracion: ' + objetosGlobales.usuarios[jsonDatos.userid].duracion);
                                            
                                            //Algoritmo 
                        
                                            objetosGlobales.usuarios[jsonDatos.userid].bailongo2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].bailongo-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].energia2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].energia-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].fundamental2 = Math.round(Math.abs(objetosGlobales.usuarios[jsonDatos.userid].fundamental-5));
                                            objetosGlobales.usuarios[jsonDatos.userid].amplitud2 = (-Math.abs(objetosGlobales.usuarios[jsonDatos.userid].amplitud+30));
                                            objetosGlobales.usuarios[jsonDatos.userid].acustica2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].acustica-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].dialogo2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].dialogo-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].positivismo2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].positivismo-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].instrumental2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].instrumental-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].audiencia2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].audiencia-50);

                                            if(Math.random() > 0.5){
                                              objetosGlobales.usuarios[jsonDatos.userid].duracion2 = 'min_';  
                                            }else{
                                              objetosGlobales.usuarios[jsonDatos.userid].duracion2 = 'max_';   
                                            }


                                            if(objetosGlobales.usuarios[jsonDatos.userid].modo == 1){
                                                objetosGlobales.usuarios[jsonDatos.userid].modo2 = 0;    
                                            }else if(objetosGlobales.usuarios[jsonDatos.userid].modo == 0){
                                               objetosGlobales.usuarios[jsonDatos.userid].modo2 = 1;
                                            };
                                            objetosGlobales.usuarios[jsonDatos.userid].tempo2 = Math.floor(Math.random() * 201) + 30;

                                            var test = false;

                                            while(test == false){
                                                objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo2 = Math.floor(Math.random() * 8) + 2;
                                                if(objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo2 != objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo){
                                                    test = true;
                                                    console.log('firma_tiempo2 = ' + objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo2);
                                                }
                                            }

                                            shuffle(objetosGlobales.usuarios[jsonDatos.userid].track_uri_ref2);

                                            var options3 = {
                                              url: 'https://api.spotify.com/v1/recommendations?'+'seed_tracks=' + 
                                              objetosGlobales.usuarios[jsonDatos.userid].track_uri_ref2 + '&limit=100&target_acousticness='+ objetosGlobales.usuarios[jsonDatos.userid].acustica2 + '&target_danceability=' + 
                                              objetosGlobales.usuarios[jsonDatos.userid].bailongo2 + '&target_energy=' + objetosGlobales.usuarios[jsonDatos.userid].energia2 + '&target_key=' + objetosGlobales.usuarios[jsonDatos.userid].fundamental2 + '&target_loudness=' + objetosGlobales.usuarios[jsonDatos.userid].amplitud +
                                              '&target_mode=' + objetosGlobales.usuarios[jsonDatos.userid].modo2 + '&target_speechiness=' + objetosGlobales.usuarios[jsonDatos.userid].dialogo2 + '&target_acousticness=' + objetosGlobales.usuarios[jsonDatos.userid].acustica2 + 
                                              '&target_instrumentalness=' + objetosGlobales.usuarios[jsonDatos.userid].instrumental2 + '&target_liveness=' + objetosGlobales.usuarios[jsonDatos.userid].audiencia2 + '&target_valence=' + objetosGlobales.usuarios[jsonDatos.userid].positivismo2 
                                              + '&target_tempo=' + objetosGlobales.usuarios[jsonDatos.userid].tempo2 + '&target_time_signature=' + objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo2 + '&target_loudness=' + objetosGlobales.usuarios[jsonDatos.userid].amplitud2 + '&' + objetosGlobales.usuarios[jsonDatos.userid].duracion2 + 'duration_ms=' + objetosGlobales.usuarios[jsonDatos.userid].duracion ,
                                              headers: { 'Authorization': 'Bearer ' + objetosGlobales.usuarios[jsonDatos.userid].access_token },
                                              json: true
                                            };  
                        

                                            console.log('Resquest de Recomendaciones: ',  options3);


                                            // use the access token to access the Spotify Web API
                                            request.get(options3, function(error, response, bodyS) {
                                            if(error){
                                                console.log("Error al momento de pedir recomendaciones a Spotify: ",error)
                                                res.render("pages/error"); 
                                            }else{
                                                anti_playlist = [];
                                                console.log("Datos:");
                                                console.log("bodyS")
                                                console.log(bodyS)
                                                console.log(bodyS.tracks[0].name);
                                                console.log(bodyS.tracks[0].artists);
                                                console.log(bodyS.tracks[0].album.images[0].url);

                                                console.log("BodyS: " + bodyS.length);

                                                console.log('anti_playlist');
                                                console.log(objetosGlobales.usuarios[jsonDatos.userid].anti_playlist);

                                                objetosGlobales.usuarios[jsonDatos.userid].anti_playlist = bodyS;

                                                console.log('anti_playlist # de elementos');
                                                console.log(objetosGlobales.usuarios[jsonDatos.userid].anti_playlist.length);

                                                objetosGlobales.usuarios[jsonDatos.userid].duracion = (objetosGlobales.usuarios[jsonDatos.userid].duracion/1000/60);

                                                // we can also pass the token to the browser to make requests from there
                                                res.redirect('/perfil#' +
                                                  querystring.stringify({
                                                    access_token: objetosGlobales.usuarios[jsonDatos.userid].access_token,
                                                    refresh_token: objetosGlobales.usuarios[jsonDatos.userid].refresh_token
                                                  }));

                                            };
                                            });

                                        };

                                      }, function(err) {
                                        done(err);
                                         console.log("err: " + err );
                                         res.render('pages/error');
                                      });
                                    console.log('');    
                                 });
                            }); 
                                
                              
                    
                            
                            
                        }else if(checkid_result.records.length >= 1){
                            console.log('Este usuario ya está registrado (no debería ser más de 1)')
                            
                            objetosGlobales.usuarios[jsonDatos.userid].mensaje = "nuevo_login";
                
                              session
                                .run('MATCH (n:track)-[r:Escuchado]-(m:usuario {spotifyid:{spotifyid}}) RETURN n, r.importanciaIndex', {spotifyid:jsonDatos.userid})
                                .then(function(tracks){
                                   console.log(tracks);
                                  objetosGlobales.usuarios[jsonDatos.userid].seedTracks = [];
                                  
                                    var contador = 0;
                                  
                                  
                                    tracks.records.forEach(function(records,index){
                                         console.log("Index de importancia")
                                        console.log(records._fields[1])
                                        
                                         //Index de importancia
                                            if(records._fields[1] < 6){
                                                objetosGlobales.usuarios[jsonDatos.userid].seedTracks[records._fields[1]-1] = records._fields[0].properties.uri;
                                                objetosGlobales.usuarios[jsonDatos.userid].track_uri_ref2[records._fields[1]-1]= records._fields[0].properties.spotifyid;
                                                
                                                contador = contador + 1;
                                                console.log("contador")
                                                console.log(contador)
                                                
                                            }
                                        
                                        //Suma para luego sacar promedio
                                         objetosGlobales.usuarios[jsonDatos.userid].bailongo = objetosGlobales.usuarios[jsonDatos.userid].bailongo + parseFloat(records._fields[0].properties.bailongo);
                                         objetosGlobales.usuarios[jsonDatos.userid].energia = objetosGlobales.usuarios[jsonDatos.userid].energia + parseFloat(records._fields[0].properties.energia);
                                         objetosGlobales.usuarios[jsonDatos.userid].fundamental = objetosGlobales.usuarios[jsonDatos.userid].fundamental + parseFloat(records._fields[0].properties.fundamental); 
                                         objetosGlobales.usuarios[jsonDatos.userid].amplitud = objetosGlobales.usuarios[jsonDatos.userid].amplitud + parseFloat(records._fields[0].properties.amplitud);
                                         objetosGlobales.usuarios[jsonDatos.userid].modo = objetosGlobales.usuarios[jsonDatos.userid].modo + parseFloat(records._fields[0].properties.modo);
                                         objetosGlobales.usuarios[jsonDatos.userid].dialogo = objetosGlobales.usuarios[jsonDatos.userid].dialogo + parseFloat(records._fields[0].properties.speechiness);
                                         objetosGlobales.usuarios[jsonDatos.userid].acustica = objetosGlobales.usuarios[jsonDatos.userid].acustica + parseFloat(records._fields[0].properties.acousticness);
                                         objetosGlobales.usuarios[jsonDatos.userid].instrumental = objetosGlobales.usuarios[jsonDatos.userid].instrumental + parseFloat(records._fields[0].properties.instrumentalness);
                                         objetosGlobales.usuarios[jsonDatos.userid].audiencia = objetosGlobales.usuarios[jsonDatos.userid].audiencia + parseFloat(records._fields[0].properties.liveness);
                                         objetosGlobales.usuarios[jsonDatos.userid].positivismo = objetosGlobales.usuarios[jsonDatos.userid].positivismo + parseFloat(records._fields[0].properties.positivismo);
                                         objetosGlobales.usuarios[jsonDatos.userid].tempo = objetosGlobales.usuarios[jsonDatos.userid].tempo + parseFloat(records._fields[0].properties.tempo);
                                         objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo = objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo + parseFloat(records._fields[0].properties.firma_tiempo);
                                         objetosGlobales.usuarios[jsonDatos.userid].duracion = objetosGlobales.usuarios[jsonDatos.userid].duracion + parseFloat(records._fields[0].properties.duracion);
                                        
                                        console.log("seedTracks.length")
                                        console.log(objetosGlobales.usuarios[jsonDatos.userid].seedTracks.length)
                                        
                                         if(contador == 5){
                                             //Algoritmo 
                        
                                            
                                            objetosGlobales.usuarios[jsonDatos.userid].bailongo = (objetosGlobales.usuarios[jsonDatos.userid].bailongo/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].energia = (objetosGlobales.usuarios[jsonDatos.userid].energia/objetosGlobales.usuarios[jsonDatos.userid].num)*100; 
                                            objetosGlobales.usuarios[jsonDatos.userid].fundamental = objetosGlobales.usuarios[jsonDatos.userid].fundamental/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].amplitud = objetosGlobales.usuarios[jsonDatos.userid].amplitud/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].modo = objetosGlobales.usuarios[jsonDatos.userid].modo/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].dialogo = (objetosGlobales.usuarios[jsonDatos.userid].dialogo/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            acustica = (objetosGlobales.usuarios[jsonDatos.userid].acustica/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].positivismo = (objetosGlobales.usuarios[jsonDatos.userid].positivismo/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].instrumental = (objetosGlobales.usuarios[jsonDatos.userid].instrumental/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].audiencia = (objetosGlobales.usuarios[jsonDatos.userid].audiencia/objetosGlobales.usuarios[jsonDatos.userid].num)*100;
                                            objetosGlobales.usuarios[jsonDatos.userid].tempo = objetosGlobales.usuarios[jsonDatos.userid].tempo/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo = objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo/objetosGlobales.usuarios[jsonDatos.userid].num;
                                            objetosGlobales.usuarios[jsonDatos.userid].duracion = Math.round(objetosGlobales.usuarios[jsonDatos.userid].duracion/objetosGlobales.usuarios[jsonDatos.userid].num);

                                            console.log('bailongo: ' + objetosGlobales.usuarios[jsonDatos.userid].bailongo);
                                            console.log('energia: ' + objetosGlobales.usuarios[jsonDatos.userid].energia);
                                            console.log('fundamental: ' + objetosGlobales.usuarios[jsonDatos.userid].fundamental);
                                            console.log('amplitud: ' + objetosGlobales.usuarios[jsonDatos.userid].amplitud);
                                            console.log('modo: ' + objetosGlobales.usuarios[jsonDatos.userid].modo);
                                            console.log('dialogo: ' + objetosGlobales.usuarios[jsonDatos.userid].dialogo);
                                            console.log('acustica: ' + objetosGlobales.usuarios[jsonDatos.userid].acustica);
                                            console.log('instrumental: ' + objetosGlobales.usuarios[jsonDatos.userid].instrumental);
                                            console.log('audiencia: ' + objetosGlobales.usuarios[jsonDatos.userid].audiencia);
                                            console.log('positivismo: ' + objetosGlobales.usuarios[jsonDatos.userid].positivismo);
                                            console.log('tempo: ' + objetosGlobales.usuarios[jsonDatos.userid].tempo);
                                            console.log('firma_tiempo:' + objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo);
                                            console.log('duracion: ' + objetosGlobales.usuarios[jsonDatos.userid].duracion);
                                            
                                            //Algoritmo 
                        
                                            objetosGlobales.usuarios[jsonDatos.userid].bailongo2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].bailongo-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].energia2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].energia-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].fundamental2 = Math.round(Math.abs(objetosGlobales.usuarios[jsonDatos.userid].fundamental-5));
                                            objetosGlobales.usuarios[jsonDatos.userid].amplitud2 = (-Math.abs(objetosGlobales.usuarios[jsonDatos.userid].amplitud+30));
                                            objetosGlobales.usuarios[jsonDatos.userid].acustica2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].acustica-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].dialogo2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].dialogo-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].positivismo2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].positivismo-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].instrumental2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].instrumental-50);
                                            objetosGlobales.usuarios[jsonDatos.userid].audiencia2 = Math.abs(objetosGlobales.usuarios[jsonDatos.userid].audiencia-50);

                                            if(Math.random() > 0.5){
                                              objetosGlobales.usuarios[jsonDatos.userid].duracion2 = 'min_';  
                                            }else{
                                              objetosGlobales.usuarios[jsonDatos.userid].duracion2 = 'max_';   
                                            }


                                            if(objetosGlobales.usuarios[jsonDatos.userid].modo == 1){
                                                objetosGlobales.usuarios[jsonDatos.userid].modo2 = 0;    
                                            }else if(objetosGlobales.usuarios[jsonDatos.userid].modo == 0){
                                               objetosGlobales.usuarios[jsonDatos.userid].modo2 = 1;
                                            };
                                            objetosGlobales.usuarios[jsonDatos.userid].tempo2 = Math.floor(Math.random() * 201) + 30;

                                            var test = false;

                                            while(test == false){
                                                objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo2 = Math.floor(Math.random() * 8) + 2;
                                                if(objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo2 != objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo){
                                                    test = true;
                                                    console.log('firma_tiempo2 = ' + objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo2);
                                                }
                                            }

                                            shuffle(objetosGlobales.usuarios[jsonDatos.userid].track_uri_ref2);

                                            var options3 = {
                                              url: 'https://api.spotify.com/v1/recommendations?'+'seed_tracks=' + 
                                              objetosGlobales.usuarios[jsonDatos.userid].track_uri_ref2 + '&limit=100&target_acousticness='+ objetosGlobales.usuarios[jsonDatos.userid].acustica2 + '&target_danceability=' + 
                                              objetosGlobales.usuarios[jsonDatos.userid].bailongo2 + '&target_energy=' + objetosGlobales.usuarios[jsonDatos.userid].energia2 + '&target_key=' + objetosGlobales.usuarios[jsonDatos.userid].fundamental2 + '&target_loudness=' + objetosGlobales.usuarios[jsonDatos.userid].amplitud +
                                              '&target_mode=' + objetosGlobales.usuarios[jsonDatos.userid].modo2 + '&target_speechiness=' + objetosGlobales.usuarios[jsonDatos.userid].dialogo2 + '&target_acousticness=' + objetosGlobales.usuarios[jsonDatos.userid].acustica2 + 
                                              '&target_instrumentalness=' + objetosGlobales.usuarios[jsonDatos.userid].instrumental2 + '&target_liveness=' + objetosGlobales.usuarios[jsonDatos.userid].audiencia2 + '&target_valence=' + objetosGlobales.usuarios[jsonDatos.userid].positivismo2 
                                              + '&target_tempo=' + objetosGlobales.usuarios[jsonDatos.userid].tempo2 + '&target_time_signature=' + objetosGlobales.usuarios[jsonDatos.userid].firma_tiempo2 + '&target_loudness=' + objetosGlobales.usuarios[jsonDatos.userid].amplitud2 + '&' + objetosGlobales.usuarios[jsonDatos.userid].duracion2 + 'duration_ms=' + objetosGlobales.usuarios[jsonDatos.userid].duracion ,
                                              headers: { 'Authorization': 'Bearer ' + objetosGlobales.usuarios[jsonDatos.userid].access_token },
                                              json: true
                                            };  
                        

                                            console.log('Resquest de Recomendaciones: ',  options3);


                                            // use the access token to access the Spotify Web API
                                            request.get(options3, function(error, response, bodyS) {
                                            if(error){
                                                console.log("Error al momento de pedir recomendaciones a Spotify: ",error)
                                                res.render("pages/error"); 
                                            }else{
                                                anti_playlist = [];
                                                console.log("Datos:");
                                                console.log("bodyS")
                                                console.log(bodyS)
                                                console.log(bodyS.tracks[0].name);
                                                console.log(bodyS.tracks[0].artists);
                                                console.log(bodyS.tracks[0].album.images[0].url);

                                                console.log("BodyS: " + bodyS.length);

                                                console.log('anti_playlist');
                                                console.log(objetosGlobales.usuarios[jsonDatos.userid].anti_playlist);

                                                objetosGlobales.usuarios[jsonDatos.userid].anti_playlist = bodyS;

                                                console.log('anti_playlist # de elementos');
                                                console.log(objetosGlobales.usuarios[jsonDatos.userid].anti_playlist.length);

                                                objetosGlobales.usuarios[jsonDatos.userid].duracion = (objetosGlobales.usuarios[jsonDatos.userid].duracion/1000/60);

                                                // we can also pass the token to the browser to make requests from there
                                                res.redirect('/perfil#' +
                                                  querystring.stringify({
                                                    access_token: objetosGlobales.usuarios[jsonDatos.userid].access_token,
                                                    refresh_token: objetosGlobales.usuarios[jsonDatos.userid].refresh_token
                                                  }));

                                            };
                                            });

                                         }
                                        
                                    })

                 
                })
                .catch(function(err){
                    console.log(err);
                })                
                            
                        }else{
                            console.log('No se pudo determinar si es un usuario nuevo o registrado')
                        }
             });
        })
      }
    })
  }
    }    
});

//Finaliza proceso

//Proceso para refrescar un token

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, bodyS) {
    if (!error && response.statusCode === 200) {
      var access_token = bodyS.access_token;
      res.send({
        'access_token': access_token
      });
      res.render('pages/author-login');
    }
  });
});

//Finaliza proceso

// views is directory for all template files/Directorio de Templates
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//Otros PROCESOS 
app.get('/index.ejs', function(request, response) {
  response.render('pages/index');
});

app.get('/about-us.ejs', function(request, response) { 
    
  response.render('pages/about-us', objetosGlobales.usuarios[jsonDatos.userid]);
});

app.get('/activity.ejs', function(request, response) {
  response.render('pages/activity.ejs');
});

app.get('/ajax_for_index.ejs', function(request, response) {
  response.render('pages/ajax_for_index');
});

app.get('/author-edit.ejs', function(request, response) {
  response.render('pages/author-edit');
});

app.post('/create/playlist', function(req, res){
var playlistname = req.body.playlistname;
console.log('playlistname = ' + playlistname);
console.log('userids = ' + jsonDatos.userid);
    
objetosGlobales.usuarios[jsonDatos.userid].mensaje = "nuevo_playlist";    
  
var uris1 = [], uris2 = [];     
    
/*var uris1 = '{"uris": []}';
var uris2 = '{"uris": []}';
var obj1 = JSON.parse(uris1);
var obj2 = JSON.parse(uris2); */
    
    // Create a private playlist
    spotifyApi.createPlaylist(jsonDatos.userid, playlistname, { 'public' : false })
        .then(function(data) {
            console.log('Created playlist!');
            console.log('data', data);
            objetosGlobales.usuarios[jsonDatos.userid].anti_playlist.tracks.forEach(function(records, index){
                //uris[index] = records.uri;
                if(index < 50){
                 uris1[index] = records.uri    
                 //obj1['uris'].push(records.uri);
                }else{
                 uris2[index-50] = records.uri     
                 //obj2['uris'].push(records.uri);   
                }
            });

            console.log("uris1 =", uris1);
            console.log("uris2 =", uris2);

           // uris1 = JSON.stringify(obj1);;

            //uris2 = JSON.stringify(obj2);
        
             var playlist_id = data.body.id; 
        
             console.log("info para agregar tracks a playlist: \n", "userids: ", jsonDatos.userid,  "\n",
                "data.body.id: ", data.body.id, "\n", 
                "uris2: ", uris1 )
            
            // Add tracks to a playlist
            spotifyApi.addTracksToPlaylist(jsonDatos.userid, data.body.id, uris1)
              .then(function(data) {
                 console.log('Added tracks to playlist ! paso #1');
                 console.log('data', data);
                    
                     console.log("info para agregar tracks a playlist: \n", "userids: ", jsonDatos.userid,  "\n",
                        "data.body.id: ", playlist_id, "\n", 
                        "uris2: ", uris2 )
                                      
                     spotifyApi.addTracksToPlaylist(jsonDatos.userid, playlist_id, uris2)
                          .then(function(data) {
                            console.log('Added tracks to playlist paso #2!');
                            console.log('data', data);
                            res.redirect('/perfil');
                          }, function(err) {
                            console.log('Error al momento de agregar tracks a playlist paso #2', err);
                            res.render('pages/author-login', objetosGlobales.usuarios[jsonDatos.userid]);
                          });
                    
                  }, function(err) {
                    console.log('Error al momento de agregar tracks a playlist paso #1', err);
                    res.render('pages/author-login', objetosGlobales.usuarios[jsonDatos.userid]);    
       
        },function(error){
            console.log(error);
            res.render('pages/autorizacion', objetosGlobales.usuarios[jsonDatos.userid]);  
        });
           
          }, function(err) {
            console.log('Error a ', err);
            res.render('pages/author-login', objetosGlobales.usuarios[jsonDatos.userid]);
          });
          });
        

app.get('/environment', function(request, response) {
  'use strict';
sc.server.boot().then((server) => {
  /**
   * This will return a Promise that will resolve with an instance of the
   * javascript SynthDef class.
   *
   * It will start an sclang interpreter, compile the supercollider SynthDef,
   * send it to the scsynth server, and then resolve the Promise with an instance
   * of the javascript SynthDef class.
   *
   * If there is an error in your SynthDef then it will fail and post the error:
   * Failed to compile SynthDef  Interpret error: ERROR: Message 'quacks' not understood.
   */
    
  let freqBase = Math.round(fundamental) + Math.floor(Math.random() * 30) + 30;    
  let freqBase2 = Math.round(fundamental2) + Math.floor(Math.random() * 100);
  let baileBase = (bailongo/100)*5;
  let baileBase2 = (bailongo2/100)*5;
  let energiaBase = (energia/100)*baileBase;
  let energiaBase2 = (energia2/100)*baileBase2;
  let acusticaBase = (acustica/100)*baileBase;
  let acusticaBase2 = (acustica2/100)*baileBase2;
  
  console.log('freqBase', freqBase);    
  console.log('freqBase2', freqBase2);    
  console.log('energiaBase2', energiaBase2);    
  console.log('energiaBase', energiaBase);    
  console.log('baileBase', baileBase);    
  console.log('baileBase2', baileBase2); 
  console.log('modo', Math.round(modo));
    
  let melodia = server.synthDef('Fun2',
    `
  SynthDef ("Fun2", { arg outbus=0, freqOne=${freqBase}, freqTwo=${freqBase2}, apMaxdelay=${energiaBase}, apDelay=${energiaBase2}, apDecay=${acusticaBase}, amp=1, gate=1; 
        var sig, in;
        in = LocalIn.ar(1);
	    sig = SinOsc.ar((MouseX.kr(freqOne.midicps-12,freqTwo.midicps+12,0, 0.4)), in * LFDNoise3.ar(freqOne, mul: (MouseY.kr(0,1))),LFDNoise3.ar(freqTwo, 1)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{MouseX.kr(0.2.rand + apDelay)} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
	    Out.ar(outbus,Pan2.ar(sig, LFNoise1.ar(0.33))*amp);
    }).add;

    `);
    
     server.synth(melodia); 
        
    if(Math.round(modo) == 1){
        
           let armonia = server.synthDef('armonia',
    `
  SynthDef ("armonia", { arg outbus=0, fundamental=${freqBase},
        freqTwo=${freqBase}, apMaxdelay=${energiaBase}, apDelay=${energiaBase2}, apDecay=${acusticaBase}, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
	    amp = MouseX.kr(0.5,1,0,0.5);
        sig = SinOsc.ar(fundamental.midicps, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
	    Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia);
        
   
        
           let armoniaT = server.synthDef('armoniaT',
    `
  SynthDef ("armoniaT", { arg outbus=0, fundamental=${freqBase},
        freqOne=0.1, freqTwo= 3.0, apMaxdelay=0.3, apDelay=0.1, apDecay=5, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
	    amp = MouseX.kr(1,0.5,0,0.5);
        sig = SinOsc.ar(fundamental.midicps*5/4, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
	    Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armoniaT);
        
        
     let armonia7 = server.synthDef('armonia7',
    `
  SynthDef ("armonia7", { arg outbus=0, fundamental=${freqBase},
        freqOne=0.1, freqTwo= 3.0, apMaxdelay=0.3, apDelay=0.1, apDecay=5, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
	    amp = MouseX.kr(0.5,1,0,0.5);
        sig = SinOsc.ar(fundamental.midicps*9/5, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
	    Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia7);    
        
    }else{
                  
        
        let armonia2 = server.synthDef('armonia2',
    `
  SynthDef ("armonia2", { arg outbus=0, fundamental=${freqBase}, freqTwo=${freqBase}, apMaxdelay=${energiaBase}, apDelay=${energiaBase2}, apDecay=${acusticaBase}, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
	    amp = MouseX.kr(0.5,1,0,0.5);
        sig = SinOsc.ar(fundamental.midicps, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)
        };
        LocalOut.ar(sig.tanh);
	    Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia2);
        
         let armonia2T = server.synthDef('armonia2T',
    `
  SynthDef ("armonia2T", { arg outbus=0, fundamental=${freqBase},
        freqOne=0.1, freqTwo= 3.0, apMaxdelay=0.3, apDelay=0.1, apDecay=5, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
	    amp = MouseX.kr(0.5,1,0,0.5);
        sig = SinOsc.ar(fundamental.midicps*6/5, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
	    Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia2T);
        
        let armonia27 = server.synthDef('armonia27',
    `
  SynthDef ("armonia27", { arg outbus=0, fundamental=${freqBase},
        freqOne=0.1, freqTwo= 3.0, apMaxdelay=0.3, apDelay=0.1, apDecay=5, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
	    amp = MouseX.kr(1,0.5,0,0.5);
        sig = SinOsc.ar(fundamental.midicps*10/5, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
	    Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia27);    
        
        
    }
        

}, console.error );

  response.render('pages/environment');
});

app.get('/author.ejs', function(request, response) {
  response.render('pages/author');
});

app.get('/blog-2.ejs', function(request, response) {
  response.render('pages/blog-2');
});

app.get('/blog-3.ejs', function(request, response) {
  response.render('pages/blog-3');
});

app.get('/blog-detail-2.ejs', function(request, response) {
  response.render('pages/blog-detail-2');
});

app.get('/blog-detail.ejs', function(request, response) {
  response.render('pages/blog-detail');
});

app.get('/blog.ejs', function(request, response) {
  response.render('pages/blog');
});

app.get('/contact-us.ejs', function(request, response) {
  response.render('pages/contact-us');
});

app.get('/faq.ejs', function(request, response) {
  response.render('pages/faq');
});

app.get('/gallery', function(request, response) {
  response.render('pages/gallery');
});

app.get('/login.ejs', function(request, response) {
    response.setHeader('Content-Security-Policy', " child-src accounts.spotify.com api.spotify.com google.com; img-src *;");
});

app.get('/messages-2.ejs', function(request, response) {
  response.render('pages/messages-2');
});

app.get('/messages.ejs', function(request, response) {
  response.render('pages/messages');
});

app.get('/perfil', function(request, response, error) {
      
        if(anti_playlist.length > 0 || error != true ){

            response.render('pages/author-login.ejs', objetosGlobales.usuarios[jsonDatos.userid]);
        
        }else{
            console.log('Error en /perfil #2');
            response.render('pages/error');         
        };
});

app.post('/track/profile', function(req, res, error){
    
    objetosGlobales.usuarios[jsonDatos.userid].trackid = req.body.index; 
    
    console.log("Index de cancion elegida " + objetosGlobales.usuarios[jsonDatos.userid].trackid);
    
    if( objetosGlobales.usuarios[jsonDatos.userid].anti_playlist.length > 1 || error == false || objetosGlobales.usuarios[jsonDatos.userid].anti_playlist.tracks != undefined){
        
    objetosGlobales.usuarios[jsonDatos.userid].anti_playlist.tracks.forEach(function(records, index, error){
        
        if(error == true){
            console.error(error);
            res.render('pages/error');
        }else if(index == objetosGlobales.usuarios[jsonDatos.userid].trackid){
            objetosGlobales.usuarios[jsonDatos.userid].add = records.id;
            
            console.log("records")
            console.log(records)
            
            var artistas = [];

             for(var i = 0; i < records.artists.length; i++){
                artistas.push(records.artists[i].name)
            }
            
             session
                    .run('MATCH (n:artista {artistaId: {artistaId}}) RETURN n', {artistaId: records.artists[0].id })
                    .then(function(artista){
                        if(artista.records.length>=1){
                            console.log('Artista ya analizado y guardado');
                            
                            spotifyApi.getArtist(records.artists[0].id)
                              .then(function(data) {

                                objetosGlobales.usuarios[jsonDatos.userid].artist_data = data.body;
                                console.log('Artist_data', data.body);
                               
                                 res.render('pages/page3', objetosGlobales.usuarios[jsonDatos.userid]);
                            
                                }, function(err) {
                                console.error(err);
                               res.render('pages/error');   
                              });

                                
                        }else if(artista.records.length<1){
                            console.log('Artista NUEVO');
                            
                            spotifyApi.getArtist(records.artists[0].id)
                              .then(function(data) {

                                objetosGlobales.usuarios[jsonDatos.userid].artist_data = data.body;
                                console.log('Artist_data', objetosGlobales.usuarios[jsonDatos.userid].artist_data);
                          
                                
                                session
                                    .run('CREATE (n:artista {external_urls:{external_urls}, seguidores:{seguidores}, generos:{generos}, herf:{href}, artistaId:{artistaId}, imagenes:{imagenes}, nombre:{nombre}, popularidad:{popularidad}, uri:{uri} })-[:interpreta]->(m:track {album:{album}, nombre:{nombre}, artistas:{artistas}, duracion:{duracion}, Contenido_explicito:{Cont_explicito}, externalurls: {externalurls}, href:{href}, spotifyid:{spotifyid}, popularidad:{popularidad}, previewUrl:{previewUrl}, uri:{uri}, albumImagen:{albumImagen}})', {external_urls: objetosGlobales.usuarios[jsonDatos.userid].artist_data.external_urls.spotify, seguidores:objetosGlobales.usuarios[jsonDatos.userid].artist_data.followers.total, generos:objetosGlobales.usuarios[jsonDatos.userid].artist_data.genres, href:objetosGlobales.usuarios[jsonDatos.userid].artist_data.href, artistaId:objetosGlobales.usuarios[jsonDatos.userid].artist_data.id, imagenes:objetosGlobales.usuarios[jsonDatos.userid].artist_data.images[0].url, nombre_artista:objetosGlobales.usuarios[jsonDatos.userid].artist_data.name, popularidad:objetosGlobales.usuarios[jsonDatos.userid].artist_data.popularity, uri:objetosGlobales.usuarios[jsonDatos.userid].artist_data.uri, album:records.album.name, nombre:records.name, artistas:artistas, duracion:records.duration_ms, Cont_explicito:records.explicit, externalurls:records.external_urls.spotify, href:records.href, spotifyid:records.id, popularidad:records.popularity, previewUrl:records.preview_url, uri:records.uri, albumImagen:records.album.images[2].url  })
                                    .then(function(resultado){
                                    
                                    })
                                    .catch(function(error){
                                        console.log(error);
                                    })
                                
                             res.render('pages/page3', objetosGlobales.usuarios[jsonDatos.userid]);


                              }, function(err) {
                                console.error(err);
                               res.render('pages/error');   
                              });

                            }
                        })
                        .catch(function(error){
                            console.log(error);
                        })

        };
        
    });
        
    }else{ 
        console.log('error:');
        console.log(error);
        res.render('pages/error') 
    }
});


app.get('/track', function(request, response) {
  response.render('pages/page3', objetosGlobales);
});


app.get('/people.ejs', function(request, response) {
  response.render('pages/people');
});

app.get('/search.ejs', function(request, response) {
  response.render('pages/search');
});

app.get('/shortcodes.ejs', function(request, response) {
  response.render('pages/shortcodes');
});

app.get('/site-map.ejs', function(request, response) {
  response.render('pages/site-map');
});

app.get('/statictics.ejs', function(request, response) {
  response.render('pages/statictics');
});

app.get('/work.ejs', function(request, response) {
  response.render('pages/work');
});

app.get('/error', function(request, response) {
    response.render('pages/error', objetosGlobales);
});

app.post('/registro/datos', function(req, res, error){
    if(error == true){
       res.render('pages/error');
    }
    
   pass = req.body.pass; 
   pass2 = req.body.pass2;
    
    console.log('pass:' + pass)
    console.log('pass2:' + pass2)
    
if(pass == pass2){
   nombre = req.body.nombre; 
   email = req.body.email; 
   pais = req.body.pais; 
   mes = req.body.mes; 
   dia = req.body.dia; 
   año = req.body.año; 
   noticias = req.body.noticias; 
    
    console.log('Nombre:' + nombre);
    console.log('Email:' + email);
    console.log('mes:' + mes);
    console.log('dia:' + dia);
    console.log('año:' + año);
    console.log('noticias:' + noticias);
    console.log('Contraseñas adecuadas');
    session
        .run('CREATE (n:PERSONA {NOMBRE: {nombre}, EMAIL: {email}, PAIS: {pais}, PASSWORD:{pass}, MES:{mes}, DIA:{dia}, AÑO:{año}, NOTICIAS:{noticias} }) RETURN n', {nombre: nombre, email:email, pais:pais, pass:pass, mes:mes, dia:dia, año:año, noticias:noticias })
        .then(function(resultado){
        
            resultado.records.forEach(function(record){
				Userdata.push({ 
                    id: record._fields[0].identity.low,
                    nombre: record._fields[0].properties.nombre,
                    email: record._fields[0].properties.email,
                    pais: record._fields[0].properties.pais,
                    pass: record._fields[0].properties.pass,
                    mes: record._fields[0].properties.mes,
                    dia: record._fields[0].properties.dia,
                    año: record._fields[0].properties.año,
                    noticias: record._fields[0].properties.noticias,
                })
            }) 
            
        res.render('pages/login', {
            Userdata: Userdata
        });
        
        console.log('Información guardada en UserData')
        console.log(Userdata)
        
    })
    .catch(function(error){
        console.log(error);
    })
    
}else{
    //control de contraseñas que no coinciden
    res.render('pages/autorizacion', {
        passError: true,
        nombre: nombre,
        ref: false, 
        totalUsers: totalUsers
    });
};  
    
});

app.post('/save/track', function(req, res, error){
   if(error == true){ res.redirect('/error') }
        
    console.log("add")
    console.log(add)
    
           // Add tracks to the signed in user's Your Music library
        spotifyApi.addToMySavedTracks([add.toString()])
          .then(function(data) {
            console.log('Added track!');
            mensaje = "exito_save_track"
            
             res.render('pages/page3', objetosGlobales, function(error, html){
                    if(error == true){
                        console.log('error', error)
                        res.redirect('/error')
                    }else{
                        res.send(html) 
                     } 
                });
        
          }, function(err) {
            console.log('Something went wrong!', err);
            mensaje = "error_save_track"
            res.redirect('/error')
          })
    
    
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});