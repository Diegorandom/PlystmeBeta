var express = require('express');
var app = express()
var router = express.Router();
var request = require('request'); // "Request" library
var SpotifyWebApi = require('spotify-web-api-node');
var shuffle = require('shuffle-array');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var logger = require('morgan');
var path = require('path');
var shuffle = require('shuffle-array');
var neo4j = require('neo4j-driver').v1;
var sessions = require("client-sessions");
var idleTimer = require("idle-timer");
var DelayedResponse = require('http-delayed-response')
var cookieParser = require('cookie-parser');

console.log('Llegamos a la ruta de mineria de datos de usuario')

router.get('/mineria', function(req, res, error){
    console.log('entramos a la ruta')
    var driver = req.app.get('driver')
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position'); 
    position = req.sessions.position;
    
    if(error == true || objetosGlobales == undefined || position == undefined ){
        console.log(error)
        console.log('Error Global')
        res.send('Error')
    }else{
    
    console.log('apuntador del objeto', position);  

     //PROCESO DE HARVESTING DE INFORMACIÓN DE USUARIO

    /*Argumentos para solicitud de información del TOP 50 del usuario desde el endpoint*/
    var options2 = {
      url: 'https://api.spotify.com/v1/me/top/tracks?limit=' + objetosGlobales[position].num +"&time_range="+objetosGlobales[position].rango,
      headers: { 'Authorization': 'Bearer ' + objetosGlobales[position].access_token },
      json: true
    };
    console.log('Request de informacion de canciones: ', options2);

    /*Se hace la solicitud de información del usuario*/
    request.get(options2, function(error, response, body){     
        if(error == true || body == undefined || body.items == undefined){
            console.log('Error SpotifyApi')
            res.send('Error')
        }else{

        /*Por cada uno de los tracks del usuario se correo un proceso para gaurdar esta información en la BD*/    
        var i = 0, artistaId = [], contadorTracks = 0;
        objetosGlobales[position].track_uri = []

        console.log('Número de canciones regresadas por API de Spotify -> ', body.items.length)    
            
        body.items.forEach(function(record, index){

            //SE GUARDA LA INFORMACION DE CADA TRACK EN UNA POSICION DE SEEDTRACKS DENTRO de OBJETOSGLOBALES
            if(index <= 50){
                objetosGlobales[position].seedTracks[index] = record;
            }

            objetosGlobales[0].session[index+1] = driver.session();
            
             /*
            Ejemplo de transacciones con Neo4j ->
            
            const session = driver.session();
            const writeTxPromise = session.writeTransaction(tx => tx.run('CREATE (a:Person {name: $name})', {'name': personName}));

            writeTxPromise.then(result => {
              session.close();

              if (result) {
                console.log('Person created');
              }
            });
            
            */
            
            /*Se consulta si el track ya existe en la BD*/
             const promesaTrackId =  objetosGlobales[0].session[index+1]
                .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{id}}) RETURN n', {id:record.id}))
             
                promesaTrackId
                .then(function(checktrack){
                 var artistas = [];
                /*Agrupación de los artistas de la canción en un arreglo que será usado después para guardar estos en la BD*/
                 for(var i = 0; i < record.artists.length; i++){
                    artistas.push(record.artists[i].name)
                }

                console.log('')
                console.log('se realizó la consulta a la base de datos')
                console.log('0 = No existe en la BD, 1 Si existe -> ', checktrack.records.length);

            if(checktrack.records.length==0){
                objetosGlobales[position].track_uri.push(record.uri.substring(14));

                // en caso de que el track no exista en la BD: SE GUARDA LA INFORMACIÓN DEL TRACK EN LA BASE DE DATOS

                    console.log(' \n Es la primera vez que se analiza este track \n');
                    console.log('')
                    console.log('Se creará nuevo record en base de datos');

                    if(record.is_playable = undefined){ record.isplayable = null }

                /*Proceso de guardar datos generales del track en la BD*/
                    const promesaBasicTrack = objetosGlobales[0].session[index+1]
                    .writeTransaction(tx => tx.run('CREATE (n:track {album:{album}, nombre:{nombre}, artistas:{artistas}, duracion:{duracion}, Contenido_explicito:{Cont_explicito}, externalurls: {externalurls}, href:{href}, spotifyid:{spotifyid}, reproducible:{reproducible}, popularidad:{popularidad}, previewUrl:{previewUrl}, uri:{uri}, albumImagen:{albumImagen},artistaId:{artistaId}})', { album:record.album.name, nombre:record.name, artistas:artistas, duracion:record.duration_ms, Cont_explicito:record.explicit, externalurls:record.external_urls.spotify, href:record.href, spotifyid:record.id, reproducible:record.is_playable, popularidad:record.popularity, previewUrl:record.preview_url, uri:record.uri, albumImagen:record.album.images[0].url, artistaId:record.artists[0].id, session:[] }))
                    
                    promesaBasicTrack
                    .then(function(resultado_create){
                        console.log('Se Guardo con éxito la información de este track');
                        contadorTracks += 1;
                        
                        if(body.items.length == contadorTracks){
                            console.log('Se han terminado de guardar -> ', body.items.length, " tracks = -> ", contadorTracks)
                              /*Se extrae el uri (ID) del track para requerir las caracteristicas del track y guardarlas en la BD*/
                            console.log('Se comienza a llamar la funcion de revision de caracteristicas de los tracks guardados')
                            
                            var newIndex = body.items.length;
                            
                            caracteristicas(objetosGlobales,position,res,driver,newIndex)
                        }

                /*Este IF revisa si el id del artista en el track RECIEN GUARDADO ya existe en la BD, en caso de que no sea así hace el proceso de guardarlo y conectarlo*/
                if(artistaId.indexOf(record.artists[0].id) == -1){        
                    artistaId.push(record.artists[0].id)    

                    /*Se revisa si el artista ya existe en la BD*/
                    const promesaArtista = objetosGlobales[0].session[index+1]
                        .writeTransaction(tx => tx.run('MATCH (n:artista {artistaId: {spotifyId}}) RETURN n', {spotifyId: record.artists[0].id}))
                    
                        promesaArtista
                        .then(function(artistaBusqueda){

                            console.log("artistaBusqueda.records.length")
                            console.log(artistaBusqueda.records.length)

                            /*Si el artista no existe en la BD se guarda la información del artista*/
                            if(artistaBusqueda.records.length<1){

                                console.log('Artista Nuevo!')
                                const promesaCrearArtista = objetosGlobales[0].session[index+1]
                                   .writeTransaction(tx => tx.run('CREATE (n:artista {artistaId: {spotifyId}, nombre:{nombre}})', {spotifyId: record.artists[0].id, nombre: record.artists[0].name}))
                                
                                    promesaCrearArtista
                                    .then(function(artistaCreado){
                                        console.log('Artista Creado en la BD')

                                        /*Se crea la relación entre los tracks y el usuario en BD*/
                                        const promesaRelacionTrackBd = objetosGlobales[0].session[index+1]
                                            .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}})  CREATE (n)<-[:Escuchado {importanciaIndex: {index}, rangoTiempo:{rangoTiempo}}]-(m)', {spotifyidUsuario:objetosGlobales[position].userid, spotifyid:record.id, index:index+1, rangoTiempo:objetosGlobales[position].rango }))
                                        
                                        promesaRelacionTrackBd
                                            .then(function(resultado){
                                                console.log("Se conecto exitosamente el track con el usuario")

                                                /*Se crea la relación entre track y artista en BD*/
                                                const promesaRelacionTrackArtista = objetosGlobales[0].session[index+1]
                                                    .writeTransaction(tx=> tx.run('MATCH (n:track {artistaId:{spotifyId}}), (o:artista {artistaId:{spotifyId} }) CREATE (n)-[:interpretadoPor]->(o) ', {spotifyId: record.artists[0].id, rangoTiempo:objetosGlobales[position].rango}))
                                                
                                                promesaRelacionTrackArtista
                                                    .then(function(resultadoUnion){
                                                        objetosGlobales[0].session[index+1].close();
                                                        console.log("Union de artista existente con track existente exitoso")
                                                    })
                                                
                                                promesaRelacionTrackArtista
                                                    .catch(function(err){
                                                    console.log(err);
                                                    console.log('Error BD')
                                                    res.send('Error')
                                                    }) 

                                            })
                                        
                                        promesaRelacionTrackBd
                                             .catch(function(err){
                                                console.log(err);
                                                console.log('Error BD')
                                                 res.send('Error')
                                            })

                                        })
                                    
                                        promesaCrearArtista
                                        .catch(function(err){
                                            console.log(err);
                                            console.log('Error BD')
                                             res.send('Error')
                                        })

                            }else{
                                /*Si el track existe en la BD se pasa directamente a conectar la relación entre track e usuario*/
                               const promesaRelacionTrackUsuario = objetosGlobales[0].session[index+1]
                                    .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}}), (o:artista {spotifyId:{spotifyId} }) CREATE (o)<-[:interpretadoPor]-(n)<-[:Escuchado {importanciaIndex: {index}, rangoTiempo:{rangoTiempo}}]-(m)', {spotifyidUsuario:objetosGlobales[position].userid, spotifyid:record.id, index:index+1, spotifyId: record.artists[0].id, rangoTiempo:objetosGlobales[position].rango  }))
                               
                               promesaRelacionTrackUsuario
                                    .then(function(resultado){
                                        objetosGlobales[0].session[index+1].close();
                                        console.log("Se conecto exitosamente el track con el usuario")

                                    })
                               
                                promesaRelacionTrackUsuario
                                     .catch(function(err){
                                        console.log(err);
                                        console.log('Error BD')
                                        res.send('Error')
                                        
                                    })

                            }

                        })
                        
                        promesaArtista
                            .catch(function(err){
                                console.log(err);
                                console.log('Error BD')
                                 res.send('Error')

                            })

                }else{
                    /*En caso de que el artista ya fue procesado y por lo tanto conectado con otros tracks y con el track en proceso, solo hace falta conectar el usuario con el nuevo track*/
                    const promesaConectarUsuarioTrack =  objetosGlobales[0].session[index+1]
                        .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (n)<-[:Escuchado {importanciaIndex: {index}, rangoTiempo:{rangoTiempo}}]-(m)', {spotifyidUsuario:objetosGlobales[position].userid, spotifyid:record.id, index:index+1, rangoTiempo:objetosGlobales[position].rango  }))
                    
                    promesaConectarUsuarioTrack
                        .then(function(resultado){
                            objetosGlobales[0].session[index+1].close();
                            console.log("Se conecto exitosamente el track con el usuario")

                        })
                    
                    promesaConectarUsuarioTrack
                         .catch(function(err){
                        console.log(err);
                        console.log('Error BD')
                         res.send('Error')
                        
                        })
                }

            })
            promesaBasicTrack
            .catch(function(err){
                console.log(err);
                console.log('Error BD')
                 res.send('Error')
                
            })

            }else if(checktrack.records.length>=1){
                /**En caso de que el track ya esté registrado, significa que este ya se procesó y cnectó apropiadamente */
                console.log('Este track ya está registrado (no debería ser más de 1)')
                contadorTracks += 1
                if(body.items.length == contadorTracks){
                      /*Se extrae el uri (ID) del track para requerir las caracteristicas del track y guardarlas en la BD*/
                    console.log('Se comienza a llamar la funcion de revision de caracteristicas de los tracks guardados')
                    var newIndex = body.items.length;
                            
                    caracteristicas(objetosGlobales,position,res,driver,newIndex)
                }
            }
         })
                
                promesaTrackId
                .catch(function(err){
                    console.log(err);
                    console.log('Error BD')
                     res.send('Error')
                  
                }) 

              //TERMINA DE GUARDARSE INFORMACIÓN DEL TRACK Y COMIENZA A PROCRESARCE EL ALGORITMO

          
       });



        }

        
    }); 
    }
})







/*FUNCIÓN DE CARACTERÍSTICAS*/

 function caracteristicas(objetosGlobales, position, res,driver, newIndex){
                
     
            //SE GUARDA LA INFORMACIÓN DEL TRACKS EN LA BASE DE DATOS
                
            console.log("URI de track a analizar")
            console.log(objetosGlobales[position].track_uri.length)
            console.log(objetosGlobales[position].track_uri)
            console.log(objetosGlobales[position].track_uri.length)
            
            var arregloURI = objetosGlobales[position].track_uri.length;
     
            if(objetosGlobales[position].track_uri.length == 0){
                objetosGlobales[position].bdEstado="guardado"
                        console.log('YA SE TERMINÓ DE GUARDAR LA INFORMACION EN LA BASE DE DATOS')
                        
                        //SE TERMINA ANÁLISIS DE CARACTERÍSTICAS
                          /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
                          /* var preventCache = Date.now()
                        console.log(preventCache)
                          res.redirect('/perfil#' +
                              querystring.stringify({
                                access_token: objetosGlobales[position].access_token,
                                refresh_token: objetosGlobales[position].refresh_token,
                                preventCache: preventCache
                              })); 
                         */
                        objetosGlobales[position].cambioRango = false;
                        res.send(objetosGlobales[position].seedTracks)
            }else{
            
                console.log('Por cada trackUri se revisará si existe en la BD')
              objetosGlobales[position].track_uri.forEach(function(dataURI, index){
                                    
                  objetosGlobales[0].session[newIndex+index+1] = driver.session();
                  
             /*Se revisan si las caracteristicas del track ya han sido guardadas*/
            const promesaRevisionCaract = objetosGlobales[0].session[newIndex+index+1]
                .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{track_uri}}) WHERE NOT EXISTS(n.danceability) OR  NOT EXISTS(n.energia) OR NOT EXISTS(n.fundamental) OR NOT EXISTS(n.amplitud) OR NOT EXISTS(n.modo) OR NOT EXISTS(n.speechiness) OR NOT EXISTS(n.acousticness) OR NOT EXISTS(n.instrumentalness) OR NOT EXISTS(n.positivismo) OR NOT EXISTS(n.tempo) OR NOT EXISTS(n.compas) OR NOT EXISTS(n.liveness) RETURN n', {track_uri:dataURI}))
            
            promesaRevisionCaract
                .then(function(resultado){
                    console.log("Se el conteo es 1 = El nodo necesita recopilar información, 0 = Nodo con info completa -> ", resultado.records.length)
                    
           if(resultado.records.length==0){
               
               var indiceT = objetosGlobales[position].track_uri.indexOf(dataURI);
               if(indiceT > -1){
                   objetosGlobales[position].track_uri.splice(indiceT,1)
               }
           }
                       
            if(arregloURI == index+1 && objetosGlobales[position].track_uri.length>0){ 
            arregloURI = 0;
            /*Se obtienen las características del track en cuestión con el endpoint del módulo de Node.js que me conecta con la BD de Spotify, el siguuiente proceso requiere todas las caraceristicas de todos los tracks de un jalón*/
             objetosGlobales[0].spotifyApi.getAudioFeaturesForTracks(objetosGlobales[position].track_uri)
              .then(function(datosTrack) {
                 console.log('Datos extraídos de los 50 tracks')
                 console.log(datosTrack)
                 console.log('Largo de Datos de tracks')
                 console.log(datosTrack.body.audio_features.length)

                 /*Debe iterarse sobre todas las posiciones del arreglo datosTrack para extraer el contenido de cada track solicitado*/
                 datosTrack.body.audio_features.forEach(function(data, indexTrack){
                     
                objetosGlobales[0].session[newIndex+index+indexTrack+2] = driver.session();

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

                /*Se revisa las caracteristicas del track ya han sido guardadas
                objetosGlobales[0].session 
                    .run('MATCH (n:track {uri:{track_uri}}) WHERE NOT EXISTS(n.danceability) OR  NOT EXISTS(n.energia) OR NOT EXISTS(n.fundamental) OR NOT EXISTS(n.amplitud) OR NOT EXISTS(n.modo) OR NOT EXISTS(n.speechiness) OR NOT EXISTS(n.acousticness) OR NOT EXISTS(n.instrumentalness) OR NOT EXISTS(n.positivismo) OR NOT EXISTS(n.tempo) OR NOT EXISTS(n.compas) OR NOT EXISTS(n.liveness) RETURN n', {track_uri:data.uri})
                    .then(function(resultado){
                        console.log("1 = Debe guardarse la info, 0 = no pasa nada -> ", resultado.records.length)


                        if(resultado.records.length>=1){  */
                            /*Query en neo4j para guardar las características del track en el nodo correspondiente*/
                            const promesaGuardarCaract = objetosGlobales[0].session[newIndex+index+indexTrack+2]
                                .writeTransaction(tx => tx.run('MATCH (n:track {uri:{track_uri}}) SET n.danceability={danceability}, n.energia={energia}, n.fundamental={fundamental}, n.amplitud={amplitud}, n.modo={modo}, n.speechiness={dialogo}, n.acousticness={acustica}, n.instrumentalness={instrumental}, n.positivismo={positivismo}, n.tempo={tempo}, n.compas={firma_tiempo}, n.liveness={audiencia} RETURN n', {danceability:danceability_bd, energia:energia_bd,  fundamental: fundamental_bd, amplitud:amplitud_bd, modo:modo_bd, dialogo:dialogo_bd, acustica:acustica_bd, instrumental:instrumental_bd, audiencia:audiencia_bd, positivismo:positivismo_bd, tempo:tempo_bd, firma_tiempo:firma_tiempo_bd, track_uri:data.uri }))
                            
                            promesaGuardarCaract
                                .then(function(resultado){
                                    objetosGlobales[0].session[newIndex+index+1].close();
                                    objetosGlobales[0].session[newIndex+index+indexTrack+2].close();
                                    console.log('Se guardaron las caracteristicas del track')
                                })
                            
                             promesaGuardarCaract
                                 .catch(function(err){
                                    console.log(err);
                                    console.log('Error BD')
                                    res.send('Error')
                                    
                                })
                       /* } */
                     
                     
                      /*El siguiente IF cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                        if(datosTrack.body.audio_features.length == indexTrack+1){
                                objetosGlobales[position].bdEstado="guardado"
                                console.log('YA SE TERMINÓ DE GUARDAR LA INFORMACION EN LA BASE DE DATOS')
                                //SE TERMINA ANÁLISIS DE CARACTERÍSTICAS
                                  /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
                                   /*var preventCache = Date.now()
                        console.log(preventCache)
                          res.redirect('/perfil#' +
                              querystring.stringify({
                                access_token: objetosGlobales[position].access_token,
                                refresh_token: objetosGlobales[position].refresh_token,
                                preventCache: preventCache
                              })); */
                                objetosGlobales[position].cambioRango = false;
                                res.send(objetosGlobales[position].seedTracks)
                         
                            }else{
                                console.log('Aun no se termina de guardar la informacion en la BD')
                                console.log("index: ", indexTrack+1, "body.items.length ", datosTrack.body.audio_features.length)
                            }

                   /* })
                     .catch(function(err){
                        console.log(err);
                        res.send('Error BD')
                        
                    }) */
                 
                

                })   

              }, function(err) {
                done(err);
                 console.log("err: " + err );
                 console.log('Error SpotifyApi')
                 res.send('Error')
                 
              });
            console.log(''); 

            
             }else if(arregloURI == index+1 && objetosGlobales[position].track_uri.length == 0){
                  /*El siguiente IF cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                
                        objetosGlobales[position].bdEstado="guardado"
                        console.log('YA SE TERMINÓ DE GUARDAR LA INFORMACION EN LA BASE DE DATOS')
                        
                        //SE TERMINA ANÁLISIS DE CARACTERÍSTICAS
                          /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
                        
                        var preventCache = Date.now()
                        console.log(preventCache)
                          res.redirect('/perfil#' +
                              querystring.stringify({
                                access_token: objetosGlobales[position].access_token,
                                refresh_token: objetosGlobales[position].refresh_token,
                                preventCache: preventCache
                              })); 
                        
                   
             }
            })
            
        promesaRevisionCaract
             .catch(function(err){
                console.log(err);
                console.log('Error BD')
                res.send('Error')

            })

             
             //Finaliza análisis individual de tracks
         })
        }
                
         }

//Finaliza proceso
module.exports = router;