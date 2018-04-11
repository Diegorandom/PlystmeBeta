var express = require('express');
var router = new express.Router();
var request = require('request'); // "Request" library
var SpotifyWebApi = require('spotify-web-api-node');
var shuffle = require('shuffle-array');
var querystring = require('querystring');

/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
*/

router.get('/callback', function(req, res, error) {
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    
    if(error == true){ res.render('pages/error')}else{ 
        
        
    
  res.setHeader('Content-Security-Policy', " child-src accounts.spotify.com api.spotify.com google.com; img-src *;");
    
  // your application requests refresh and access tokens
  // after checking the state parameter
    
  console.log("Llegamos al callback!! \n");

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[objetosGlobales[0].stateKey] : null;

  if (state === null || state !== storedState) {
      
     res.redirect('/error#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
      console.log('Error de autentizacion state_mismatch');
 
  }else {
      
    res.clearCookie(objetosGlobales[0].stateKey);
      
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
      
      var jsonDatos = {nombre:"", ref:false, email:null, external_urls:null, seguidores:null, imagen_url:null, pais:null, access_token:null, track_uri:[], track_uri_ref:null, num:50, danceability:0, energia:0, fundamental:0, amplitud:0, modo:0, dialogo:0, acustica:0, instrumental:0, audiencia:0, positivismo:0, tempo:0, firma_tiempo:0, duracion:0, danceability2:0, energia2:0, fundamental2:0, amplitud2:0, modo2:0, dialogo2:0, acustica2:0, instrumental2:0, audiencia2:0, positivismo2:0, tempo2:0, firma_tiempo2:0, duracion2:0, followers:null, anti_playlist:[], trackid:null ,artist_data:[], track_uri_ref2:[], seedTracks:[], userid:null, seed_shuffled:null, pass:null, pass2:null, mes:null, dia:null, año:null, noticias:null, Userdata:[], mensaje:null, add:null, spotifyid:null, totalUsers:0}

    request.post(authOptions, function(error, response, bodyS) {
        
      if (!error && response.statusCode === 200) {
           
          objetosGlobales[0].spotifyApi.setAccessToken(bodyS.access_token);
          
          objetosGlobales[0].access_token=bodyS.access_token;
          
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + bodyS.access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, bodyS) {
            
        
            jsonDatos.userid = bodyS.id;
            console.log("Datos:");
            console.log(bodyS);
            jsonDatos.followers = bodyS.followers.total;    
            console.log("userid:" + jsonDatos.userid + '\n');
            
            position = position + 1;
            
            objetosGlobales[position]= jsonDatos;
            objetosGlobales[position].access_token = objetosGlobales[0].access_token;
            objetosGlobales[position].pais = bodyS.country;
            objetosGlobales[position].nombre = bodyS.display_name;
            objetosGlobales[position].email = bodyS.email;
            objetosGlobales[position].external_urls = bodyS.external_urls;
            
            console.log(objetosGlobales)
            
            imagen_url = "";
            
            //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG el pendejo de jona
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
            
             objetosGlobales[0].session
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
                            objetosGlobales[position].mensaje = "nuevo_usuario";
                            
                            objetosGlobales[0].session
                            .run('CREATE (n:usuario {pais:{pais}, nombre:{nombre}, email:{email}, external_urls:{external_urls}, seguidores:{followers}, spotifyid:{spotifyid}, followers:{followers}, imagen_url: {imagen_url} })', { pais:objetosGlobales[position].pais, nombre:objetosGlobales[position].nombre, email:objetosGlobales[position].email, external_urls:objetosGlobales[position].external_urls.spotify, spotifyid:jsonDatos.userid, followers:objetosGlobales[position].followers, imagen_url:objetosGlobales[position].imagen_url })
                            .then(function(resultado_create){
                                console.log('Se creó con éxito el nodo del usuario');
                                console.log(resultado_create)
                                 })
                            .catch(function(err){
                            console.log(err);
                            }) 
                            
                            
                             //PROCESO DE HARVESTING DE INFORMACIÓN DE USUARIO
                                    var options2 = {
                                      url: 'https://api.spotify.com/v1/me/top/tracks?limit=' + objetosGlobales[position].num +"&time_range=long_term",
                                      headers: { 'Authorization': 'Bearer ' + objetosGlobales[position].access_token },
                                      json: true
                                    };
                                    console.log('Request de informacion de canciones: ', options2);
                                    request.get(options2, function(error, response, body){     
            
                                console.log("50 tracks principales")
                                console.log(body);

                                var i = 0;

                                body.items.forEach(function(record, index){
                                    
                                    //PROCESO PARA GUARDAR LOS PRIMEROS 5 TOP TRACKS
                                    if(index < 5){
                                        objetosGlobales[position].seedTracks[index] = record.uri;
                                        objetosGlobales[position].track_uri_ref2[index] = record.uri.substring(14);
                                    }

                                    console.log(record)

                                     objetosGlobales[0].session
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
                                          
                                            objetosGlobales[0].session
                                            .run('CREATE (n:track {album:{album}, nombre:{nombre}, artistas:{artistas}, duracion:{duracion}, Contenido_explicito:{Cont_explicito}, externalurls: {externalurls}, href:{href}, spotifyid:{spotifyid}, reproducible:{reproducible}, popularidad:{popularidad}, previewUrl:{previewUrl}, uri:{uri}, albumImagen:{albumImagen}})', { album:record.album.name, nombre:record.name, artistas:artistas, duracion:record.duration_ms, Cont_explicito:record.explicit, externalurls:record.external_urls.spotify, href:record.href, spotifyid:record.id, reproducible:record.is_playable, popularidad:record.popularity, previewUrl:record.preview_url, uri:record.uri, albumImagen:record.album.images[2].url })
                                            .then(function(resultado_create){
                                                console.log('Se Guardo con éxito la información de este track');
                                                console.log(resultado_create)

                                                
                                                objetosGlobales[0].session
                                                .run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (n)<-[:Escuchado {importanciaIndex: {index}}]-(m)', {spotifyidUsuario:jsonDatos.userid, spotifyid:record.id, index:index+1 })
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

                                    objetosGlobales[position].track_uri[index] = record.uri.substring(14);
                                     
                                    console.log("index de cancion analizada del usuario")
                                    console.log(index)
                                     if(index == 49){
                                        
                                    console.log("URI de track a analizar")
                                    console.log(objetosGlobales[position].track_uri)

                                    //SEG GUARDA LA INFORMACIÓN DEL TRACKS EN LA BASE DE DATOS
                                     objetosGlobales[0].spotifyApi.getAudioFeaturesForTracks(objetosGlobales[position].track_uri)
                                      .then(function(data) {
                                         console.log('Datos extraídos de los 50 tracks')
                                         console.log(data)
                                        data.body.audio_features.forEach(function(data, index){
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

                                         objetosGlobales[0].session
                                            .run('MATCH (n:track {uri:{track_uri}}) WHERE NOT EXISTS(n.danceability) RETURN n', {track_uri:record.uri})
                                            .then(function(resultado){
                                                console.log("1 = Debe guardarse la info, 0 = no pasa nada")
                                                console.log(resultado.records)

                                                if(resultado.records.length>=1){


                                                     objetosGlobales[0].session
                                                        .run('MATCH (n:track {uri:{track_uri}}) SET n.danceability={danceability}, n.energia={energia}, n.fundamental={fundamental}, n.amplitud={amplitud}, n.modo={modo}, n.speechiness={dialogo}, n.acousticness={acustica}, n.instrumentalness={instrumental}, n.positivismo={positivismo}, n.tempo={tempo}, n.compas={firma_tiempo}, n.liveness={audiencia} RETURN n', {danceability:danceability_bd, energia:energia_bd,  fundamental: fundamental_bd, amplitud:amplitud_bd, modo:modo_bd, dialogo:dialogo_bd, acustica:acustica_bd, instrumental:instrumental_bd, audiencia:audiencia_bd, positivismo:positivismo_bd, tempo:tempo_bd, firma_tiempo:firma_tiempo_bd, track_uri:record.uri })
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
                                         objetosGlobales[position].danceability = objetosGlobales[position].danceability + parseFloat(data.danceability);
                                         objetosGlobales[position].energia = objetosGlobales[position].energia + parseFloat(data.energy);
                                         objetosGlobales[position].fundamental = objetosGlobales[position].fundamental + parseFloat(data.key); 
                                         objetosGlobales[position].amplitud = objetosGlobales[position].amplitud + parseFloat(data.loudness);
                                         objetosGlobales[position].modo = objetosGlobales[position].modo + parseFloat(data.mode);
                                         objetosGlobales[position].dialogo = objetosGlobales[position].dialogo + parseFloat(data.speechiness);
                                         objetosGlobales[position].acustica = objetosGlobales[position].acustica + parseFloat(data.acousticness);
                                         objetosGlobales[position].instrumental = objetosGlobales[position].instrumental + parseFloat(data.instrumentalness);
                                         objetosGlobales[position].audiencia = objetosGlobales[position].audiencia + parseFloat(data.liveness);
                                         objetosGlobales[position].positivismo = objetosGlobales[position].positivismo + parseFloat(data.valence);
                                         objetosGlobales[position].tempo = objetosGlobales[position].tempo + parseFloat(data.tempo);
                                         objetosGlobales[position].firma_tiempo = objetosGlobales[position].firma_tiempo + parseFloat(data.time_signature);
                                         objetosGlobales[position].duracion = objetosGlobales[position].duracion + parseFloat(data.duration_ms);


                                        if(i == objetosGlobales[position].num){
                                            objetosGlobales[position].danceability = (objetosGlobales[position].danceability/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].energia = (objetosGlobales[position].energia/objetosGlobales[position].num)*100; 
                                            objetosGlobales[position].fundamental = objetosGlobales[position].fundamental/objetosGlobales[position].num;
                                            objetosGlobales[position].amplitud = objetosGlobales[position].amplitud/objetosGlobales[position].num;
                                            objetosGlobales[position].modo = objetosGlobales[position].modo/objetosGlobales[position].num;
                                            objetosGlobales[position].dialogo = (objetosGlobales[position].dialogo/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].acustica = (objetosGlobales[position].acustica/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].positivismo = (objetosGlobales[position].positivismo/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].instrumental = (objetosGlobales[position].instrumental/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].audiencia = (objetosGlobales[position].audiencia/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].tempo = objetosGlobales[position].tempo/objetosGlobales[position].num;
                                            objetosGlobales[position].firma_tiempo = objetosGlobales[position].firma_tiempo/objetosGlobales[position].num;
                                            objetosGlobales[position].duracion = Math.round(objetosGlobales[position].duracion/objetosGlobales[position].num);

                                            console.log('danceability: ' + objetosGlobales[position].danceability);
                                            console.log('energia: ' + objetosGlobales[position].energia);
                                            console.log('fundamental: ' + objetosGlobales[position].fundamental);
                                            console.log('amplitud: ' + objetosGlobales[position].amplitud);
                                            console.log('modo: ' + objetosGlobales[position].modo);
                                            console.log('dialogo: ' + objetosGlobales[position].dialogo);
                                            console.log('acustica: ' + objetosGlobales[position].acustica);
                                            console.log('instrumental: ' + objetosGlobales[position].instrumental);
                                            console.log('audiencia: ' + objetosGlobales[position].audiencia);
                                            console.log('positivismo: ' + objetosGlobales[position].positivismo);
                                            console.log('tempo: ' + objetosGlobales[position].tempo);
                                            console.log('firma_tiempo:' + objetosGlobales[position].firma_tiempo);
                                            console.log('duracion: ' + objetosGlobales[position].duracion);
                                            
                                            //Algoritmo 
                        
                                            objetosGlobales[position].danceability2 = Math.abs(objetosGlobales[position].danceability-50);
                                            objetosGlobales[position].energia2 = Math.abs(objetosGlobales[position].energia-50);
                                            objetosGlobales[position].fundamental2 = Math.round(Math.abs(objetosGlobales[position].fundamental-5));
                                            objetosGlobales[position].amplitud2 = (-Math.abs(objetosGlobales[position].amplitud+30));
                                            objetosGlobales[position].acustica2 = Math.abs(objetosGlobales[position].acustica-50);
                                            objetosGlobales[position].dialogo2 = Math.abs(objetosGlobales[position].dialogo-50);
                                            objetosGlobales[position].positivismo2 = Math.abs(objetosGlobales[position].positivismo-50);
                                            objetosGlobales[position].instrumental2 = Math.abs(objetosGlobales[position].instrumental-50);
                                            objetosGlobales[position].audiencia2 = Math.abs(objetosGlobales[position].audiencia-50);

                                            if(Math.random() > 0.5){
                                              objetosGlobales[position].duracion2 = 'min_';  
                                            }else{
                                              objetosGlobales[position].duracion2 = 'max_';   
                                            }


                                            if(objetosGlobales[position].modo == 1){
                                                objetosGlobales[position].modo2 = 0;    
                                            }else if(objetosGlobales[position].modo == 0){
                                               objetosGlobales[position].modo2 = 1;
                                            };
                                            objetosGlobales[position].tempo2 = Math.floor(Math.random() * 201) + 30;

                                            var test = false;

                                            while(test == false){
                                                objetosGlobales[position].firma_tiempo2 = Math.floor(Math.random() * 8) + 2;
                                                if(objetosGlobales[position].firma_tiempo2 != objetosGlobales[position].firma_tiempo){
                                                    test = true;
                                                    console.log('firma_tiempo2 = ' + objetosGlobales[position].firma_tiempo2);
                                                }
                                            }

                                            shuffle(objetosGlobales[position].track_uri_ref2);

                                            var options3 = {
                                              url: 'https://api.spotify.com/v1/recommendations?'+'seed_tracks=' + 
                                              objetosGlobales[position].track_uri_ref2 + '&limit=100&target_acousticness='+ objetosGlobales[position].acustica2 + '&target_danceability=' + 
                                              objetosGlobales[position].danceability2 + '&target_energy=' + objetosGlobales[position].energia2 + '&target_key=' + objetosGlobales[position].fundamental2 + '&target_loudness=' + objetosGlobales[position].amplitud +
                                              '&target_mode=' + objetosGlobales[position].modo2 + '&target_speechiness=' + objetosGlobales[position].dialogo2 + '&target_acousticness=' + objetosGlobales[position].acustica2 + 
                                              '&target_instrumentalness=' + objetosGlobales[position].instrumental2 + '&target_liveness=' + objetosGlobales[position].audiencia2 + '&target_valence=' + objetosGlobales[position].positivismo2 
                                              + '&target_tempo=' + objetosGlobales[position].tempo2 + '&target_time_signature=' + objetosGlobales[position].firma_tiempo2 + '&target_loudness=' + objetosGlobales[position].amplitud2 + '&' + objetosGlobales[position].duracion2 + 'duration_ms=' + objetosGlobales[position].duracion ,
                                              headers: { 'Authorization': 'Bearer ' + objetosGlobales[position].access_token },
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
                                                console.log(objetosGlobales[position].anti_playlist);

                                                objetosGlobales[position].anti_playlist = bodyS;

                                                console.log('anti_playlist # de elementos');
                                                console.log(objetosGlobales[position].anti_playlist.length);

                                                objetosGlobales[position].duracion = (objetosGlobales[position].duracion/1000/60);

                                                req.sessions.position = position
                                                
                                                // we can also pass the token to the browser to make requests from there
                                                
                                                
                                                
                                                res.redirect('/perfil#' +
                                                  querystring.stringify({
                                                    access_token: objetosGlobales[position].access_token,
                                                    refresh_token: objetosGlobales[position].refresh_token
                                                  }));

                                            };
                                            });

                                        };

                                        
                                        })    
                                            
                                      }, function(err) {
                                        done(err);
                                         console.log("err: " + err );
                                         res.render('pages/error');
                                      });
                                    console.log(''); 
                                     }
                                     
                               });
                                        
                              
                             
                            }); 
                                
                              
                    
                            
                            
                        }else if(checkid_result.records.length >= 1){
                            console.log('Este usuario ya está registrado (no debería ser más de 1)')
                            
                            objetosGlobales[position].mensaje = "nuevo_login";
                
                              objetosGlobales[0].session
                                .run('MATCH (n:track)-[r:Escuchado]-(m:usuario {spotifyid:{spotifyid}}) RETURN n, r.importanciaIndex', {spotifyid:jsonDatos.userid})
                                .then(function(tracks){
                                   console.log(tracks);
                                  objetosGlobales[position].seedTracks = [];
                                  
                                    tracks.records.forEach(function(records,index){
                                        
                                        
                                         console.log("Index de importancia")
                                        console.log(records._fields[1])
                                        
                                         //Index de importancia
                                            if(records._fields[1] < 6){
                                                objetosGlobales[position].seedTracks[records._fields[1]-1] = records._fields[0].properties.uri;
                                                objetosGlobales[position].track_uri_ref2[records._fields[1]-1]= records._fields[0].properties.spotifyid;
                                            }
                                        
                                        //Suma para luego sacar promedio
                                         objetosGlobales[position].danceability = objetosGlobales[position].danceability + parseFloat(records._fields[0].properties.danceability);
                                         objetosGlobales[position].energia = objetosGlobales[position].energia + parseFloat(records._fields[0].properties.energia);
                                         objetosGlobales[position].fundamental = objetosGlobales[position].fundamental + parseFloat(records._fields[0].properties.fundamental); 
                                         objetosGlobales[position].amplitud = objetosGlobales[position].amplitud + parseFloat(records._fields[0].properties.amplitud);
                                         objetosGlobales[position].modo = objetosGlobales[position].modo + parseFloat(records._fields[0].properties.modo);
                                         objetosGlobales[position].dialogo = objetosGlobales[position].dialogo + parseFloat(records._fields[0].properties.speechiness);
                                         objetosGlobales[position].acustica = objetosGlobales[position].acustica + parseFloat(records._fields[0].properties.acousticness);
                                         objetosGlobales[position].instrumental = objetosGlobales[position].instrumental + parseFloat(records._fields[0].properties.instrumentalness);
                                         objetosGlobales[position].audiencia = objetosGlobales[position].audiencia + parseFloat(records._fields[0].properties.liveness);
                                         objetosGlobales[position].positivismo = objetosGlobales[position].positivismo + parseFloat(records._fields[0].properties.positivismo);
                                         objetosGlobales[position].tempo = objetosGlobales[position].tempo + parseFloat(records._fields[0].properties.tempo);
                                         objetosGlobales[position].firma_tiempo = objetosGlobales[position].firma_tiempo + parseFloat(records._fields[0].properties.compas);
                                         objetosGlobales[position].duracion = objetosGlobales[position].duracion + parseFloat(records._fields[0].properties.duracion);
                                        
                                        console.log("seedTracks.length")
                                        console.log(objetosGlobales[position].seedTracks.length)
                                        
                                        console.log("index")
                                        console.log(index)
                                        
                                         if(index == tracks.records.length-1){
                                             
                                           
                                             //Algoritmo 
                        
                                            objetosGlobales[position].danceability = (objetosGlobales[position].danceability/tracks.records.length)*100;
                                            objetosGlobales[position].energia = (objetosGlobales[position].energia/tracks.records.length)*100; 
                                            objetosGlobales[position].fundamental = objetosGlobales[position].fundamental/tracks.records.length;
                                            objetosGlobales[position].amplitud = objetosGlobales[position].amplitud/tracks.records.length;
                                            objetosGlobales[position].modo = objetosGlobales[position].modo/tracks.records.length;
                                            objetosGlobales[position].dialogo = (objetosGlobales[position].dialogo/tracks.records.length)*100;
                                            acustica = (objetosGlobales[position].acustica/tracks.records.length-1)*100;
                                            objetosGlobales[position].positivismo = (objetosGlobales[position].positivismo/tracks.records.length)*100;
                                            objetosGlobales[position].instrumental = (objetosGlobales[position].instrumental/tracks.records.length)*100;
                                            objetosGlobales[position].audiencia = (objetosGlobales[position].audiencia/tracks.records.length)*100;
                                            objetosGlobales[position].tempo = objetosGlobales[position].tempo/tracks.records.length;
                                            objetosGlobales[position].firma_tiempo = objetosGlobales[position].firma_tiempo/tracks.records.length;
                                            objetosGlobales[position].duracion = Math.round(objetosGlobales[position].duracion/tracks.records.length);

                                            console.log('danceability: ' + objetosGlobales[position].danceability);
                                            console.log('energia: ' + objetosGlobales[position].energia);
                                            console.log('fundamental: ' + objetosGlobales[position].fundamental);
                                            console.log('amplitud: ' + objetosGlobales[position].amplitud);
                                            console.log('modo: ' + objetosGlobales[position].modo);
                                            console.log('dialogo: ' + objetosGlobales[position].dialogo);
                                            console.log('acustica: ' + objetosGlobales[position].acustica);
                                            console.log('instrumental: ' + objetosGlobales[position].instrumental);
                                            console.log('audiencia: ' + objetosGlobales[position].audiencia);
                                            console.log('positivismo: ' + objetosGlobales[position].positivismo);
                                            console.log('tempo: ' + objetosGlobales[position].tempo);
                                            console.log('firma_tiempo:' + objetosGlobales[position].firma_tiempo);
                                            console.log('duracion: ' + objetosGlobales[position].duracion);
                                            
                                            //Algoritmo 
                        
                                            objetosGlobales[position].danceability2 = Math.abs(objetosGlobales[position].danceability-50);
                                            objetosGlobales[position].energia2 = Math.abs(objetosGlobales[position].energia-50);
                                             
                                            objetosGlobales[position].fundamental2 = Math.round(Math.abs(objetosGlobales[position].fundamental-5));
                                             
                                            objetosGlobales[position].amplitud2 = (-Math.abs(objetosGlobales[position].amplitud+30));
                                            objetosGlobales[position].acustica2 = Math.abs(objetosGlobales[position].acustica-50);
                                            objetosGlobales[position].dialogo2 = Math.abs(objetosGlobales[position].dialogo-50);
                                            objetosGlobales[position].positivismo2 = Math.abs(objetosGlobales[position].positivismo-50);
                                            objetosGlobales[position].instrumental2 = Math.abs(objetosGlobales[position].instrumental-50);
                                            objetosGlobales[position].audiencia2 = Math.abs(objetosGlobales[position].audiencia-50);

                                            if(Math.random() > 0.5){
                                              objetosGlobales[position].duracion2 = 'min_';  
                                            }else{
                                              objetosGlobales[position].duracion2 = 'max_';   
                                            }


                                            if(objetosGlobales[position].modo == 1){
                                                objetosGlobales[position].modo2 = 0;    
                                            }else if(objetosGlobales[position].modo == 0){
                                               objetosGlobales[position].modo2 = 1;
                                            };
                                            objetosGlobales[position].tempo2 = Math.floor(Math.random() * 201) + 30;

                                            var test = false;

                                            while(test == false){
                                                objetosGlobales[position].firma_tiempo2 = Math.floor(Math.random() * 8) + 2;
                                                if(objetosGlobales[position].firma_tiempo2 != objetosGlobales[position].firma_tiempo){
                                                    test = true;
                                                    console.log('firma_tiempo2 = ' + objetosGlobales[position].firma_tiempo2);
                                                }
                                            }

                                            shuffle(objetosGlobales[position].track_uri_ref2);

                                            var options3 = {
                                              url: 'https://api.spotify.com/v1/recommendations?'+'seed_tracks=' + 
                                              objetosGlobales[position].track_uri_ref2 + '&limit=100&target_acousticness='+ objetosGlobales[position].acustica2 + '&target_danceability=' + 
                                              objetosGlobales[position].danceability2 + '&target_energy=' + objetosGlobales[position].energia2 + '&target_key=' + objetosGlobales[position].fundamental2 + '&target_loudness=' + objetosGlobales[position].amplitud +
                                              '&target_mode=' + objetosGlobales[position].modo2 + '&target_speechiness=' + objetosGlobales[position].dialogo2 + '&target_acousticness=' + objetosGlobales[position].acustica2 + 
                                              '&target_instrumentalness=' + objetosGlobales[position].instrumental2 + '&target_liveness=' + objetosGlobales[position].audiencia2 + '&target_valence=' + objetosGlobales[position].positivismo2 
                                              + '&target_tempo=' + objetosGlobales[position].tempo2 + '&target_time_signature=' + objetosGlobales[position].firma_tiempo2 + '&target_loudness=' + objetosGlobales[position].amplitud2 + '&' + objetosGlobales[position].duracion2 + 'duration_ms=' + objetosGlobales[position].duracion ,
                                              headers: { 'Authorization': 'Bearer ' + objetosGlobales[position].access_token },
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
                                                console.log(objetosGlobales[position].anti_playlist);

                                                objetosGlobales[position].anti_playlist = bodyS;

                                                console.log('anti_playlist # de elementos');
                                                console.log(objetosGlobales[position].anti_playlist.length);

                                                objetosGlobales[position].duracion = (objetosGlobales[position].duracion/1000/60);

                                                req.sessions.position = position;
                                                
                                                // we can also pass the token to the browser to make requests from there
                                                res.redirect('/perfil#' +
                                                  querystring.stringify({
                                                    access_token: objetosGlobales[position].access_token,
                                                    refresh_token: objetosGlobales[position].refresh_token
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

module.exports = router;