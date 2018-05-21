var express = require('express');
var router = new express.Router();
var request = require('request'); // "Request" library
var SpotifyWebApi = require('spotify-web-api-node');
var shuffle = require('shuffle-array');
var querystring = require('querystring');
var app = express()

/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
        
        REFERENCIAS:
        1.Documentación de TOP 50 
        https://beta.developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/
*/

var callbackAlgoritmo = router.get('/callback', function(req, res, error) {
    /*Configuracion de variables globales y position desde cookies*/
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = objetosGlobales.length;
    console.log('apuntador del objeto', position);
    req.sessions.position = position;
    
    /*Dado un error en la ruta se llama la pagina de error*/
    if(error == true){ res.render('pages/error', {error:error})}else{ 
        
/*Headers necesarios para comunicacion con API de Spotify*/
  res.setHeader('Content-Security-Policy', " child-src accounts.spotify.com api.spotify.com google.com; img-src *;");
        
  console.log("Llegamos al callback!! \n");
      
              
  /*La plataforma hace el request de los queries necesarios para comprobar que la conexion es legítima*/        
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[objetosGlobales[0].stateKey] : null;

  if (state === null || state !== storedState) {
      /*En caso de que haya un error de autenticación se lanza el mensaje y se envía a la pággina de error*/
     res.render('pages/error', {error:"Error de autentizacion state_mismatch",error });
      console.log('Error de autentizacion state_mismatch');
      console.log('State from Spotify -> ', state)
 
  }else {
      /*En caso de que la conexión sea legítima se procede con el proceso*/
    res.clearCookie(objetosGlobales[0].stateKey);
      
      /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: objetosGlobales[0].redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(objetosGlobales[0].client_id + ':' + objetosGlobales[0].client_secret).toString('base64'))
      },
      json: true
    };
      
      /*Inicialización de objeto de usuario*/
      var jsonDatos = {nombre:"", ref:false, email:null, external_urls:null, seguidores:null, imagen_url:null, pais:null, access_token:null, track_uri:[], track_uri_ref:null, num:50, danceability:0, energia:0, fundamental:0, amplitud:0, modo:0, dialogo:0, acustica:0, instrumental:0, audiencia:0, positivismo:0, tempo:0, firma_tiempo:0, duracion:0, danceability2:0, energia2:0, fundamental2:0, amplitud2:0, modo2:0, dialogo2:0, acustica2:0, instrumental2:0, audiencia2:0, positivismo2:0, tempo2:0, firma_tiempo2:0, duracion2:0, followers:null, anti_playlist:[], trackid:null ,artist_data:[], track_uri_ref2:[], seedTracks:[], userid:null, seed_shuffled:null, pass:null, pass2:null, mes:null, dia:null, año:null, noticias:null, Userdata:[], mensaje:null, add:null, spotifyid:null, totalUsers:0, pool:[], playlist:[], popularidadAvg:0,usuarios:[], bdEstado:"NoGuardado"}

      /*Requerimiento de perfil de usuario vía API*/
    request.post(authOptions, function(error, response, bodyS) {
        
        /*En caso de que la solicitud a la API sea exitosa se procede*/
      if (!error && response.statusCode === 200) {
           
          objetosGlobales[0].spotifyApi.setAccessToken(bodyS.access_token);
          
          objetosGlobales[0].access_token=bodyS.access_token;
          
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + bodyS.access_token },
          json: true
        };

        /*Utilizando el token de acceso de la autorizacion se procede a solicitar los datos del usuario*/
        request.get(options, function(error, response, bodyS) {
            if(error == true){
                res.render('pages/error', {error:error})
            }else{
             /*Se guarda la información del usuario en el objeto global correspondiente*/
            jsonDatos.userid = bodyS.id;
            jsonDatos.followers = bodyS.followers.total;    
            console.log("userid:" + jsonDatos.userid + '\n');
            objetosGlobales[position]= jsonDatos;
            objetosGlobales[position].access_token = objetosGlobales[0].access_token;
            /*Se elimina el access_token del usuario del objeto neutral para que este sea no contamine a otros usuarios con información que no le corresponde*/
            objetosGlobales[0].access_token = null
            objetosGlobales[position].pais = bodyS.country;
            objetosGlobales[position].nombre = bodyS.display_name;
            objetosGlobales[position].email = bodyS.email;
            objetosGlobales[position].external_urls = bodyS.external_urls;
            
            //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG de jona
            imagen_url = "";
            if(bodyS.images[0] != undefined){
                console.log('imagen_url');
                console.log(imagen_url);
                objetosGlobales[position].imagen_url =  bodyS.images[0].url;
                console.log('imagen_url');
                console.log(imagen_url);
            };
             
            objetosGlobales[position].refresh_token = bodyS.refresh_token;
            
            console.log('Comienza proceso de revisión en base de datos para verificar si es un usuario nuevo o ya está regitrado \n');
            console.log('');
            
            /*Se consulta si el usuario ya existe en la base de datos*/
             objetosGlobales[0].session
            .run('MATCH (n:usuario) WHERE n.spotifyid={spotifyid} RETURN n', {spotifyid:jsonDatos.userid})
            .then(function(checkid_result){ 
                 console.log('')
                 console.log('se realizó la consulta a la base de datos')
                 
                 console.log('checkid_result.length:');
                 console.log(checkid_result.records.length)
                 
                        console.log('');
                    /*En caso de que el usuario nuevo se comienza a guardar su información en la base de datos*/
                        if(checkid_result.records.length< 1){ 
                            
                            console.log(' \n el usuario es nuevo \n');
                            console.log('')
                            console.log('Se creará nuevo record en base de datos');
                            objetosGlobales[position].mensaje = "nuevo_usuario";
                            
                            /*Se crea el nodo del usuario en la BD*/
                            objetosGlobales[0].session
                            .run('CREATE (n:usuario {pais:{pais}, nombre:{nombre}, email:{email}, external_urls:{external_urls}, seguidores:{followers}, spotifyid:{spotifyid}, followers:{followers}, imagen_url: {imagen_url} })', { pais:objetosGlobales[position].pais, nombre:objetosGlobales[position].nombre, email:objetosGlobales[position].email, external_urls:objetosGlobales[position].external_urls.spotify, spotifyid:jsonDatos.userid, followers:objetosGlobales[position].followers, imagen_url:objetosGlobales[position].imagen_url })
                            .then(function(resultado_create){
                                console.log('Se creó con éxito el nodo del usuario');
                             
                                 })
                            .catch(function(err){
                                console.log(err);
                                res.render('pages/error', {error:err})
                            }) 
                            
                            
                             //PROCESO DE HARVESTING DE INFORMACIÓN DE USUARIO
                            
                            /*Argumentos para solicitud de información del TOP 50 del usuario desde el endpoint*/
                            var options2 = {
                              url: 'https://api.spotify.com/v1/me/top/tracks?limit=' + objetosGlobales[position].num +"&time_range=long_term",
                              headers: { 'Authorization': 'Bearer ' + objetosGlobales[position].access_token },
                              json: true
                            };
                            console.log('Request de informacion de canciones: ', options2);
                            
                            /*Se hace la solicitud de información del usuario*/
                            request.get(options2, function(error, response, body){     
                                if(error == true){
                                    res.render('pages/error', {error:error})
                                }else{
                                
                                /*Por cada uno de los tracks del usuario se correo un proceso para gaurdar esta información en la BD*/    
                                var i = 0, artistaId = [];
                                    
                                body.items.forEach(function(record, index){
                                    
                                    //SE GUARDA LA INFORMACION DE CADA TRACK EN UNA POSICION DE SEEDTRACKS DENTRO de OBJETOSGLOBALES
                                    if(index <= 50){
                                        objetosGlobales[position].seedTracks[index] = record;
                                        //objetosGlobales[position].track_uri_ref2[index] = record.uri.substring(14);
                                    }

                                    /*Se consulta si el track ya existe en la BD*/
                                     objetosGlobales[0].session
                                        .run('MATCH (n:track {spotifyid:{id}}) RETURN n', {id:record.id})
                                        .then(function(checktrack){
                                         var artistas = [];
                                        /*Agrupación de los artistas de la canción en un arreglo que será usado después para guardar estos en la BD*/
                                         for(var i = 0; i < record.artists.length; i++){
                                            artistas.push(record.artists[i].name)
                                        }

                                        console.log('')
                                        console.log('se realizó la consulta a la base de datos')

                                    console.log('');
                                    
                                    if(checktrack.records.length<1){

                                        // en caso de que el track no exista en la BD: SE GUARDA LA INFORMACIÓN DEL TRACK EN LA BASE DE DATOS
                                        
                                            console.log(' \n Es la primera vez que se analiza este track \n');
                                            console.log('')
                                            console.log('Se creará nuevo record en base de datos');
                                          
                                        /*Proceso de guardar datos generales del track en la BD*/
                                            objetosGlobales[0].session
                                            .run('CREATE (n:track {album:{album}, nombre:{nombre}, artistas:{artistas}, duracion:{duracion}, Contenido_explicito:{Cont_explicito}, externalurls: {externalurls}, href:{href}, spotifyid:{spotifyid}, reproducible:{reproducible}, popularidad:{popularidad}, previewUrl:{previewUrl}, uri:{uri}, albumImagen:{albumImagen},artistaId:{artistaId}})', { album:record.album.name, nombre:record.name, artistas:artistas, duracion:record.duration_ms, Cont_explicito:record.explicit, externalurls:record.external_urls.spotify, href:record.href, spotifyid:record.id, reproducible:record.is_playable, popularidad:record.popularity, previewUrl:record.preview_url, uri:record.uri, albumImagen:record.album.images[0].url, artistaId:record.artists[0].id })
                                            .then(function(resultado_create){
                                                console.log('Se Guardo con éxito la información de este track');
                                             
                                        /*Este IF revisa si el id del artista en el track RECIEN GUARDADO ya existe en la BD, en caso de que no sea así hace el proceso de guardarlo y conectarlo*/
                                        if(artistaId.indexOf(record.artists[0].id) == -1){        
                                            artistaId.push(record.artists[0].id)    
                                            
                                            /*Se revisa si el artista ya existe en la BD*/
                                            objetosGlobales[0].session
                                                .run('MATCH (n:artista {artistaId: {spotifyId}}) RETURN n', {spotifyId: record.artists[0].id})
                                                .then(function(artistaBusqueda){
                                                
                                                    console.log("artistaBusqueda.records.length")
                                                    console.log(artistaBusqueda.records.length)
                                                
                                                    /*Si el artista no existe en la BD se guarda la información del artista*/
                                                    if(artistaBusqueda.records.length<1){
                                                        
                                                        console.log('Artista Nuevo!')
                                                        objetosGlobales[0].session
                                                            .run('CREATE (n:artista {artistaId: {spotifyId}, nombre:{nombre}})', {spotifyId: record.artists[0].id, nombre: record.artists[0].name})
                                                            .then(function(artistaCreado){
                                                                console.log('Artista Creado en la BD')
                                                                
                                                                /*Se crea la relación entre los tracks y el usuario en BD*/
                                                                objetosGlobales[0].session
                                                                    .run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}})  CREATE (n)<-[:Escuchado {importanciaIndex: {index}}]-(m)', {spotifyidUsuario:jsonDatos.userid, spotifyid:record.id, index:index+1 })
                                                                    .then(function(resultado){
                                                                        console.log("Se conecto exitosamente el track con el usuario")
                                                                        
                                                                        /*Se crea la relación entre track y artista en BD*/
                                                                        objetosGlobales[0].session
                                                                            .run('MATCH (n:track {artistaId:{spotifyId}}), (o:artista {artistaId:{spotifyId} }) CREATE (n)-[:interpretadoPor]->(o) ', {spotifyId: record.artists[0].id})
                                                                            .then(function(resultadoUnion){
                                                                                console.log("Union de artista existente con track existente exitoso")
                                                                            })
                                                                            .catch(function(err){
                                                                            console.log(err);
                                                                            res.redirect('/error',{error:err})
                                                                            }) 
                                                                        
                                                                    })
                                                                     .catch(function(err){
                                                                    console.log(err);
                                                                    res.redirect('/error',{error:err})
                                                                    })

                                                                })
                                                                .catch(function(err){
                                                                console.log(err);
                                                                res.redirect('/error',{error:err})
                                                                })
                                                        
                                                    }else{
                                                        /*Si el track existe en la BD se para directamente a conectar la relación entre track e usuario*/
                                                        objetosGlobales[0].session
                                                            .run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}}), (o:artista {spotifyId:{spotifyId} }) CREATE (o)<-[:interpretadoPor]-(n)<-[:Escuchado {importanciaIndex: {index}}]-(m)', {spotifyidUsuario:jsonDatos.userid, spotifyid:record.id, index:index+1, spotifyId: record.artists[0].id  })
                                                            .then(function(resultado){
                                                                console.log("Se conecto exitosamente el track con el usuario")
                                                              
                                                            })
                                                             .catch(function(err){
                                                                console.log(err);
                                                                res.redirect('/error',{error:err})
                                                            })

                                                    }
                                                
                                                })
                                            
                                        }else{
                                            /*En caso de que el artista ya fue procesado y por lo tanto conectado con otros tracks y con el track en proceso, solo hace falta conecta el usuario con el nuevo track*/
                                            objetosGlobales[0].session
                                                .run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (n)<-[:Escuchado {importanciaIndex: {index}}]-(m)', {spotifyidUsuario:jsonDatos.userid, spotifyid:record.id, index:index+1  })
                                                .then(function(resultado){
                                                    console.log("Se conecto exitosamente el track con el usuario")
                                          
                                                })
                                                 .catch(function(err){
                                                console.log(err);
                                                res.render('pages/error', {error:err})
                                                })
                                        }
                                                        
                                    })
                                    .catch(function(err){
                                        console.log(err);
                                        res.render('pages/error', {error:err})
                                    })

                                    }else if(checktrack.records.length>=1){
                                        /**En caso de que el track ya esté registrado, significa que este ya se procesó y cnectó apropiadamente */
                                        console.log('Este track ya está registrado (no debería ser más de 1)')
                                    }
                                 })
                                 .catch(function(err){
                                    console.log(err);
                                    res.render('pages/error', {error:err})
                                }) 
                                     
                                      //TERMINA DE GUARDARSE INFORMACIÓN DEL TRACK Y COMIENZA A PROCRESARCE EL ALGORITMO
                                    
                                     /*Se extrae el uri (ID) del track para requerir las caracteristicas del track y guardarlas en la BD*/
                                    objetosGlobales[position].track_uri[index] = record.uri.substring(14);
                                     
                                    console.log("index de cancion analizada del usuario")
                                    console.log(index)
                                    /*Después de terminar el primer proceso con todos los tracks extraídos se comienza a hacer el harvesting de las características del track*/
                                    if(body.items.length == index+1){
                                        
                                    console.log("URI de track a analizar")
                                    console.log(objetosGlobales[position].track_uri)

                                    //SE GUARDA LA INFORMACIÓN DEL TRACKS EN LA BASE DE DATOS
                                    
                                    /*Se obtienen las características del track en cuestión con el endpoint del módulo de Node.js que me conecta con la BD de Spotify, el siguuiente proceso requiere todas las caraceristicas de todos los tracks de un jalón*/
                                     objetosGlobales[0].spotifyApi.getAudioFeaturesForTracks(objetosGlobales[position].track_uri)
                                      .then(function(datosTrack) {
                                         console.log('Datos extraídos de los 50 tracks')
                                         console.log(datosTrack)
                                         console.log('Largo de Datos de tracks')
                                         console.log(datosTrack.body.audio_features.length)
                                         
                                         /*Debe iterarse sobre todas las posiciones del arreglo datosTrack para extraer el contenido de cada track solicitado*/
                                         datosTrack.body.audio_features.forEach(function(data, index){
                                            
                                         var danceability_bd = parseFloat(data.danceability);
                                         var energia_bd = parseFloat(data.energy);
                                         var fundamental_bd = parseFloat(data.key); 
                                         var amplitud_bd = parseFloat(data.loudness);
                                         var modo_bd = parseFloat(data.mode);
                                         var dialogo_bd =parseFloat(data.speechiness);
                                         var acustica_bd = parseFloat(data.acousticness);
                                         var instrumental_bd = parseFloat(data.instrumentalness);
                                         var audiencia_bd = parseFloat(data.liveness);
                                         var positivismo_bd = parseFloat(data.valence);
                                         var tempo_bd = parseFloat(data.tempo);
                                         var firma_tiempo_bd = parseFloat(data.time_signature);
                                         var duracion_bd =  parseFloat(data.duration_ms);
                                        
                                        /*Se revisa las caracteristicas del track ya han sido guardadas, en caso contrario se guardan en la BD*/
                                         objetosGlobales[0].session
                                            .run('MATCH (n:track {uri:{track_uri}}) WHERE NOT EXISTS(n.danceability) RETURN n', {track_uri:data.uri})
                                            .then(function(resultado){
                                                console.log("1 = Debe guardarse la info, 0 = no pasa nada")
                                

                                                if(resultado.records.length>=1){
                                                    /*Query en neo4j para guardar las características del track en el nodo correspondiente*/
                                                     objetosGlobales[0].session
                                                        .run('MATCH (n:track {uri:{track_uri}}) SET n.danceability={danceability}, n.energia={energia}, n.fundamental={fundamental}, n.amplitud={amplitud}, n.modo={modo}, n.speechiness={dialogo}, n.acousticness={acustica}, n.instrumentalness={instrumental}, n.positivismo={positivismo}, n.tempo={tempo}, n.compas={firma_tiempo}, n.liveness={audiencia} RETURN n', {danceability:danceability_bd, energia:energia_bd,  fundamental: fundamental_bd, amplitud:amplitud_bd, modo:modo_bd, dialogo:dialogo_bd, acustica:acustica_bd, instrumental:instrumental_bd, audiencia:audiencia_bd, positivismo:positivismo_bd, tempo:tempo_bd, firma_tiempo:firma_tiempo_bd, track_uri:data.uri })
                                                        .then(function(resultado){
                                                            console.log(resultado)
                                                            console.log('Se guardaron las caracteristicas del track')
                                                        })
                                                         .catch(function(err){
                                                            console.log(err);
                                                            res.render('pages/error', {error:err})
                                                        })
                                                }
                                             
                                            })
                                             .catch(function(err){
                                                console.log(err);
                                                res.render('pages/error', {error:err})
                                            })

                                        })   
                                        
                                      }, function(err) {
                                        done(err);
                                         console.log("err: " + err );
                                         res.render('pages/error', {error:err});
                                      });
                                    console.log(''); 
                                         
                                    /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
                                      res.redirect('/perfil#' +
                                          querystring.stringify({
                                            access_token: objetosGlobales[position].access_token,
                                            refresh_token: objetosGlobales[position].refresh_token
                                          })); 
                                        
                                 }
                                    
                                /*El siguiente IF cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                                if(body.items.length == index+1){
                                        objetosGlobales[position].bdEstado="guardado"
                                        console.log('YA SE TERMINÓ DE GUARDAR LA INFORMACION EN LA BASE DE DATOS')
                                    }else{
                                        console.log('Aun no se termina de guardar la informacion en la BD')
                                        console.log("index: ", index+1, "body.items.length ", body.items.length)
                                    }
                                    
                               });
                              
                                    
                              
                                }
                                
                             
                            }); 
                                
                        /*Cuando el usuario ya está registrado se asume que ya tenemos toda su información en la BD*/    
                        }else if(checkid_result.records.length >= 1){
                            console.log('Este usuario ya está registrado (no debería ser más de 1)')
                            
                            /*cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                            objetosGlobales[position].bdEstado="guardado"
                            
                            objetosGlobales[position].mensaje = "nuevo_login";
                
                            /*Se extrae la información de del index de importancia del usuario de nuestra BD. Así mismo se extrae la información del usuario de nuestra base de datos para su display en la interfaz*/
                              objetosGlobales[0].session
                                .run('MATCH (n:track)-[r:Escuchado]-(m:usuario {spotifyid:{spotifyid}}) RETURN n, r.importanciaIndex', {spotifyid:jsonDatos.userid})
                                .then(function(tracks){
                                  console.log(tracks);
                                  objetosGlobales[position].seedTracks = [];
                                  
                                    tracks.records.forEach(function(records,index){
                                        
                                         console.log("Datos de nodo " + records._fields[1])
                                        console.log(records._fields[0])
                                        
                                         //Index de importancia
                                            /*Se extrae el index de importancia de la relación entre usuarios y tracks por propiedades. Con este index de importancia se ordena la posición de cada uno de los nodos de track que serán guardados en la propiedad seedTracks de objetosGlobales[position]*/
                                            if(records._fields[1] < 50){
                                                objetosGlobales[position].seedTracks[records._fields[1]-1] = records._fields[0].properties;
                                               // objetosGlobales[position].track_uri_ref2[records._fields[1]-1]= records._fields[0].properties.spotifyid;
                                            }else{
                                                /*Una vez guardado el perfil de datos del usuario en el objeto apropiado, se redirije al perfil en la interfaz*/
                                                res.redirect('/perfil#' +
                                                      querystring.stringify({
                                                        access_token: objetosGlobales[position].access_token,
                                                        refresh_token: objetosGlobales[position].refresh_token
                                                      }));
                                                 
                                            }
                                        
                                    })
                                })
                                .catch(function(err){
                                    console.log(err);
                                    res.render('pages/error', {error:err})
                                })     
                     
                        }else{
                            console.log('No se pudo determinar si es un usuario nuevo o registrado')
                            res.render('pages/error', {error:'No se pudo determinar si es un usuario nuevo o registrado'})
                        }
             })
            .catch(function(err){
                console.log(err);
                res.render('pages/error', {error:err})
            }) 
            }
            
        })
      
      }else{
          res.render('pages/error', {error:error})
      }
    })
  }
}    
    
});


/*Este proceso funciona para darle tiempo extra a la recolección de datos en caso de que se encuentre con una conexión lenta*/
app.use(function (req, res) {
  var delayed = new DelayedResponse(req, res);
  // verySlowFunction can now run indefinitely
  callbackAlgoritmo(delayed.start());
});


//Finaliza proceso
module.exports = router;