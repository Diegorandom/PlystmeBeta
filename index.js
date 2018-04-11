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
var sanitize = require('sanitize-html');
var shuffle = require('shuffle-array');
var neo4j = require('neo4j-driver').v1;
var sessions = require("client-sessions");
var idleTimer = require("idle-timer");


var jsonDatosInit = {nombre:"", ref:false, email:null, external_urls:null, seguidores:null, imagen_url:null, pais:null, access_token:null, track_uri:[], track_uri_ref:null, num:50, danceability:0, energia:0, fundamental:0, amplitud:0, modo:0, dialogo:0, acustica:0, instrumental:0, audiencia:0, positivismo:0, tempo:0, firma_tiempo:0, duracion:0, danceability2:0, energia2:0, fundamental2:0, amplitud2:0, modo2:0, dialogo2:0, acustica2:0, instrumental2:0, audiencia2:0, positivismo2:0, tempo2:0, firma_tiempo2:0, duracion2:0, followers:null, anti_playlist:[], trackid:null ,artist_data:[], track_uri_ref2:[], seedTracks:[], userid:null, seed_shuffled:null, pass:null, pass2:null, mes:null, dia:null, año:null, noticias:null, Userdata:[], mensaje:null, add:null, totalUsers:0}

var position = 0;

var objetosGlobales=[];

objetosGlobales[0] = jsonDatosInit;

// Conexión con base de datos remota
var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

console.log(graphenedbUser)

//BASE DE DATOS

if(graphenedbURL == undefined){
	var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'mdl'));
	objetosGlobales[0].session = driver.session();
}else{
	var driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
	objetosGlobales[0].session = driver.session();
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
 
    objetosGlobales[0].client_id = 'b590c1e14afd46a69891549457267135'; // Your client id
    objetosGlobales[0].client_secret = config.sessionSecret; // Your secret
    objetosGlobales[0].redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri

    objetosGlobales[0].spotifyApi = new SpotifyWebApi({
        clientId: 'b590c1e14afd46a69891549457267135',
        clientSecret: config.sessionSecret,
        redirectUri: 'http://localhost:5000/callback' 
    }); 
    console.log(objetosGlobales[0].redirect_uri);
}else{
    console.log("Corriendo en servidor web con uri de redireccionamiento: ");
    objetosGlobales[0].client_id = 'b590c1e14afd46a69891549457267135'; // Your client id
    objetosGlobales[0].client_secret = config.sessionSecret; // Your secret
    objetosGlobales[0].redirect_uri = 'https://proyecto-techclub.herokuapp.com/callback'; // Your redirect uri

    objetosGlobales[0].spotifyApi = new SpotifyWebApi({
        clientId: 'b590c1e14afd46a69891549457267135',
        clientSecret: config.sessionSecret,
        redirectUri: 'https://proyecto-techclub.herokuapp.com/callback' 
    });
    console.log(objetosGlobales[0].redirect_uri);
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

objetosGlobales[0].stateKey = 'spotify_auth_state';

var sessionSecreto = generateRandomString(16);

app.use(sessions({
  cookieName: 'sessions',
  secret: sessionSecreto,
  duration: 24* 60 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  ephemeral: true
}));

// Finaliza creacion de llaves

/*
Pieza de middleware que dirije los links a la carpeta donde se alojan los recursos
*/
app.use(express.static(__dirname + '/public'))

var timeoutID; 

app.get('/heartbeat', function(req,res){
     console.log('heartbeat');
    
    clearTimeout(timeoutID);
    
    timeoutID = setTimeout(goInactive, 1000*60*2);
    
    function goInactive() {
        // do something
        if(objetosGlobales.length>1){
            position = req.sessions.position;
            objetosGlobales.splice(position, 1);
            console.log('Depuracion de datos no utilizados')
            console.log(objetosGlobales)
        }
    } 
})

//PAGINA DE INICIO HACIA LA AUTORIZACIÓN
app.get('/', function(req, res, error){ 
    objetosGlobales[0].ref=false;
    

    
if(error == true){
    res.render('pages/error')
}else{    

    objetosGlobales[0].session
    .run('MATCH (n:usuario) RETURN COUNT(n)')
    .then(function(response){
        response.records.forEach(function(record){
            objetosGlobales[0].totalUsers = record._fields[[0]].low; 
        });
        
        console.log(objetosGlobales)
        res.render('pages/autorizacion',  objetosGlobales[0]);
        
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
  res.cookie(objetosGlobales[position].stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private user-library-read user-top-read playlist-modify-private user-library-modify';
    
    
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

/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
*/
app.set('objetosGlobales',objetosGlobales);
app.set('position',position);
app.use(require("./callbackAlgoritmo"));

//app.use(require("./poolAlgoritmo.py"));

//Proceso para refrescar un token

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(objetosGlobales[0].client_id + ':' + objetosGlobales[0].client_secret).toString('base64')) },
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
    
    position = request.sessions.position;
    objetosGlobales[0].ref=true;
  response.render('pages/about-us', objetosGlobales[0]);
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
    position = req.sessions.position;
var playlistname = req.body.playlistname;
console.log('playlistname = ' + playlistname);
console.log('userids = ' + objetosGlobales[position].userid);
    
objetosGlobales[position].mensaje = "nuevo_playlist";    
  
var uris1 = [], uris2 = [];     
    
    // Create a private playlist
    objetosGlobales[0].spotifyApi.createPlaylist(objetosGlobales[position].userid, playlistname, { 'public' : false })
        .then(function(data) {
            console.log('Created playlist!');
            console.log('data', data);
            objetosGlobales[position].anti_playlist.tracks.forEach(function(records, index){
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
        
             console.log("info para agregar tracks a playlist: \n", "userids: ", objetosGlobales[position].userid,  "\n",
                "data.body.id: ", data.body.id, "\n", 
                "uris2: ", uris1 )
            
            // Add tracks to a playlist
            objetosGlobales[0].spotifyApi.addTracksToPlaylist(objetosGlobales[position].userid, data.body.id, uris1)
              .then(function(data) {
                 console.log('Added tracks to playlist ! paso #1');
                 console.log('data', data);
                    
                     console.log("info para agregar tracks a playlist: \n", "userids: ", objetosGlobales[position].userid,  "\n",
                        "data.body.id: ", playlist_id, "\n", 
                        "uris2: ", uris2 )
                                      
                     objetosGlobales[0].spotifyApi.addTracksToPlaylist(objetosGlobales[position].userid, playlist_id, uris2)
                          .then(function(data) {
                            console.log('Added tracks to playlist paso #2!');
                            console.log('data', data);
                            res.redirect('/perfil');
                          }, function(err) {
                            console.log('Error al momento de agregar tracks a playlist paso #2', err);
                            res.render('pages/author-login', objetosGlobales[position]);
                          });
                    
                  }, function(err) {
                    console.log('Error al momento de agregar tracks a playlist paso #1', err);
                    res.render('pages/author-login', objetosGlobales[position]);    
       
        },function(error){
            console.log(error);
            res.render('pages/autorizacion', objetosGlobales[position]);  
        });
           
          }, function(err) {
            console.log('Error a ', err);
            res.render('pages/author-login', objetosGlobales[position]);
          });
          });
        
/*
        Ambiente de SUPERCOLLIDER
*/

app.use(require("./environmentSC"));

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
        position = request.sessions.position;
        objetosGlobales[position].ref=false;
        
        if(objetosGlobales[position].anti_playlist.length > 0 || error != true ){
            console.log("objetosGlobales");
            console.log(objetosGlobales);
        
            response.render('pages/author-login.ejs', objetosGlobales[position]);
        
        }else{
            console.log('Error en /perfil #2');
            response.render('pages/error');         
        };
});

/*
        PERFIL DE UN TRACK
*/

app.use(require("./perfilTrack"));

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

app.post('/save/track', function(req, res, error){
   if(error == true){ res.redirect('/error') }
        
    console.log("add")
    console.log(add)
    
           // Add tracks to the signed in user's Your Music library
        objetosGlobales[0].spotifyApi.addToMySavedTracks([add.toString()])
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

app.get('/idle', function(req,res){
    objetosGlobales.splice(req.sessions.position, 1);
    console.log('redirecting')
    res.send("success");
    res.sessions.position = 0;
})

app.get('/logOut', function(req, res) {
    position = req.sessions.position;
    objetosGlobales.splice(position, 1);
    position = 0
    req.sessions.position = 0
    objetosGlobales[0].access_token = null
    console.log('Depuracion de datos por salida de Usuario')
    console.log(objetosGlobales)    
    res.redirect('/')
    
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});