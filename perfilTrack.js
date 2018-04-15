var express = require('express');
var SpotifyWebApi = require('spotify-web-api-node');
var router = new express.Router();

router.post('/track/profile', function(req, res, error){
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    
    position = req.sessions.position;
    objetosGlobales[position].trackid = req.body.index; 
    
    console.log("Index de cancion elegida " + objetosGlobales[position].trackid);
    
    if(objetosGlobales[position].mensaje == "nuevo_login"){
        
        if( objetosGlobales[position].seedTracks.length > 1 || error == false || objetosGlobales[position].seedTracks != undefined){
            
            console.log(objetosGlobales[position].seedTracks[objetosGlobales[position].trackid].artistaId)
         objetosGlobales[0].spotifyApi.getArtist(objetosGlobales[position].seedTracks[objetosGlobales[position].trackid].artistaId)
                  .then(function(data) {

                    objetosGlobales[position].artist_data = data.body;
                    console.log('Artist_data', data.body);
             
                    req.sessions.track_uri = objetosGlobales[position].seedTracks[req.body.index].uri
                     res.render('pages/page3', objetosGlobales[position]);

                })
                .catch(function(error){
                console.log(error);
            })

        }else{ 
            console.log('error:');
            console.log(error);
            res.render('pages/error') 
        }
        
    }else{
    
        if( objetosGlobales[position].seedTracks.length > 1 || error == false || objetosGlobales[position].seedTracks != undefined){

        objetosGlobales[position].seedTracks.forEach(function(records, index, error){

            if(error == true){
                console.error(error);
                res.render('pages/error');
            }else if(index == objetosGlobales[position].trackid){
                objetosGlobales[position].add = records.id;

                console.log("records")
                console.log(records)

                var artistas = [];
                 for(var i = 0; i < records.artists.length; i++){
                    artistas.push(records.artists[i].name)
                }

                 objetosGlobales[0].session
                        .run('MATCH (n:artista {artistaId: {artistaId}}) RETURN n', {artistaId: records.artists[0].id })
                        .then(function(artista){
                            if(artista.records.length>=1){
                                console.log('Artista ya analizado y guardado');

                                objetosGlobales[0].spotifyApi.getArtist(records.artists[0].id)
                                  .then(function(data) {

                                    objetosGlobales[position].artist_data = data.body;
                                    console.log('Artist_data', data.body);

                                })
                                .catch(function(error){
                                console.log(error);
                            })

                                objetosGlobales[0].session
                                        .run('MATCH (t:track {spotifyid:{trackid}}) RETURN t', {trackid:records.id})
                                        .then(function(track){
                                            if(track.records.length>=1){ 
                                                 console.log('Cancion conocida por la BD')
                                            }else if(track.records.length<1){
                                                console.log('Cancion desconocida por la BD')

                                                objetosGlobales[0].session
                                                    .run('MATCH (a:artista {artistaId: {artistaId}}), (u:usuario {spotifyid:{userid}}) CREATE (a)-[:interpreta]->(m:track {album:{album}, nombre:{nombre}, artistas:{artistas}, duracion:{duracion}, Contenido_explicito:{Cont_explicito}, externalurls: {externalurls}, href:{href}, spotifyid:{spotifyid}, popularidad:{popularidad}, previewUrl:{previewUrl}, uri:{uri}, albumImagen:{albumImagen}})<-[:Escuchado]-(u)', {artistaId: objetosGlobales[position].artist_data.id, userid:objetosGlobales[position].userid,nalbum:records.album.name, nombre:records.name, artistas:artistas, duracion:records.duration_ms, Cont_explicito:records.explicit, externalurls:records.external_urls.spotify, href:records.href, spotifyid:records.id, popularidad:records.popularity, previewUrl:records.preview_url, uri:records.uri, albumImagen:records.album.images[2].url })
                                                    .then(function(resultado){
                                                        console.log(records.name + ' Guardadx en la BD')

                                                        //SEG GUARDA LA INFORMACIÓN DEL TRACKS EN LA BASE DE DATOS
                                                         objetosGlobales[0].spotifyApi.getAudioFeaturesForTrack(records.uri.substring(14))
                                                          .then(function(data) {

                                                             var danceability_bd = parseFloat(data.body.danceability);
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

                                                             objetosGlobales[0].session
                                                                .run('MATCH (n:track {uri:{track_uri}}) WHERE NOT EXISTS(n.danceability) RETURN n', {track_uri:records.uri})
                                                                .then(function(resultado){
                                                                    console.log("1 = Debe guardarse la info, 0 = no pasa nada")
                                                                    console.log(resultado.records)

                                                                    if(resultado.records.length>=1){


                                                                         objetosGlobales[0].session
                                                                            .run('MATCH (n:track {uri:{track_uri}}) SET n.danceability={danceability}, n.energia={energia}, n.fundamental={fundamental}, n.amplitud={amplitud}, n.modo={modo}, n.speechiness={dialogo}, n.acousticness={acustica}, n.instrumentalness={instrumental}, n.positivismo={positivismo}, n.tempo={tempo}, n.compas={firma_tiempo}, n.liveness={audiencia} RETURN n', {danceability:danceability_bd, energia:energia_bd,  fundamental: fundamental_bd, amplitud:amplitud_bd, modo:modo_bd, dialogo:dialogo_bd, acustica:acustica_bd, instrumental:instrumental_bd, audiencia:audiencia_bd, positivismo:positivismo_bd, tempo:tempo_bd, firma_tiempo:firma_tiempo_bd, track_uri:records.uri })
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

                                                         })

                                                    })
                                                    .catch(function(error){
                                                        console.log(error);
                                                    })



                                            }

                                     res.render('pages/page3', objetosGlobales[position]);

                                    }, function(err) {
                                    console.error(err);
                                   res.render('pages/error');   
                                  });

                            }else if(artista.records.length<1){
                                console.log('Artista NUEVO');

                                objetosGlobales[0].spotifyApi.getArtist(records.artists[0].id)
                                  .then(function(data) {

                                    objetosGlobales[position].artist_data = data.body;
                                    console.log('Artist_data', objetosGlobales[position].artist_data);

                                    objetosGlobales[0].session
                                        .run('MATCH (t:track {spotifyid:{trackid}}) RETURN t', {trackid:records.id})
                                        .then(function(track){
                                            if(track.records.length>=1){ 
                                                 console.log('Cancion conocida por la BD')

                                                 objetosGlobales[0].session
                                                    .run('MATCH (t:track {spotifyid:{trackid}}) CREATE (n:artista {external_urls:{external_urls}, seguidores:{seguidores}, generos:{generos}, herf:{href}, artistaId:{artistaId}, imagenes:{imagenes}, nombre:{nombre_artista}, popularidad:{popularidad}, uri:{uri} })-[:interpreta]->(t)', {external_urls: objetosGlobales[position].artist_data.external_urls.spotify, seguidores:objetosGlobales[position].artist_data.followers.total, generos:objetosGlobales[position].artist_data.genres, href:objetosGlobales[position].artist_data.href, artistaId:objetosGlobales[position].artist_data.id, imagenes:objetosGlobales[position].artist_data.images[0].url, nombre_artista:objetosGlobales[position].artist_data.name, popularidad:objetosGlobales[position].artist_data.popularity, uri:objetosGlobales[position].artist_data.uri})
                                                    .then(function(resultado){
                                                        console.log(objetosGlobales[position].artist_data.name + ' Guardado en la BD')
                                                    })
                                                    .catch(function(error){
                                                        console.log(error);
                                                    })




                                            }else if(track.records.length<1){
                                                 console.log('Cancion desconocida por la BD')

                                                 objetosGlobales[0].session
                                                    .run('MATCH (u:usuario {spotifyid:{userid}}) CREATE (n:artista {external_urls:{external_urls}, seguidores:{seguidores}, generos:{generos}, herf:{href}, artistaId:{artistaId}, imagenes:{imagenes}, nombre:{nombre_artista}, popularidad:{popularidad}, uri:{uri} })-[:interpreta]->(m:track {album:{album}, nombre:{nombre}, artistas:{artistas}, duracion:{duracion}, Contenido_explicito:{Cont_explicito}, externalurls: {externalurls}, href:{href}, spotifyid:{spotifyid}, popularidad:{popularidad}, previewUrl:{previewUrl}, uri:{uri}, albumImagen:{albumImagen}})<-[:Escuchado]-(u)', {external_urls: objetosGlobales[position].artist_data.external_urls.spotify, seguidores:objetosGlobales[position].artist_data.followers.total, generos:objetosGlobales[position].artist_data.genres, href:objetosGlobales[position].artist_data.href, artistaId:objetosGlobales[position].artist_data.id, imagenes:objetosGlobales[position].artist_data.images[0].url, nombre_artista:objetosGlobales[position].artist_data.name, popularidad:objetosGlobales[position].artist_data.popularity, uri:objetosGlobales[position].artist_data.uri, album:records.album.name, nombre:records.name, artistas:artistas, duracion:records.duration_ms, Cont_explicito:records.explicit, externalurls:records.external_urls.spotify, href:records.href, spotifyid:records.id, popularidad:records.popularity, previewUrl:records.preview_url, uri:records.uri, albumImagen:records.album.images[2].url, userid:objetosGlobales[position].userid  })
                                                    .then(function(resultado){
                                                        console.log(records.name + ' Guardado en la BD')

                                                        //SEG GUARDA LA INFORMACIÓN DEL TRACKS EN LA BASE DE DATOS
                                                         objetosGlobales[0].spotifyApi.getAudioFeaturesForTrack(records.uri.substring(14))
                                                          .then(function(data) {

                                                             var danceability_bd = parseFloat(data.body.danceability);
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

                                                             objetosGlobales[0].session
                                                                .run('MATCH (n:track {uri:{track_uri}}) WHERE NOT EXISTS(n.danceability) RETURN n', {track_uri:records.uri})
                                                                .then(function(resultado){
                                                                    console.log("1 = Debe guardarse la info, 0 = no pasa nada")
                                                                    console.log(resultado.records)

                                                                    if(resultado.records.length>=1){


                                                                         objetosGlobales[0].session
                                                                            .run('MATCH (n:track {uri:{track_uri}}) SET n.danceability={danceability}, n.energia={energia}, n.fundamental={fundamental}, n.amplitud={amplitud}, n.modo={modo}, n.speechiness={dialogo}, n.acousticness={acustica}, n.instrumentalness={instrumental}, n.positivismo={positivismo}, n.tempo={tempo}, n.compas={firma_tiempo}, n.liveness={audiencia} RETURN n', {danceability:danceability_bd, energia:energia_bd,  fundamental: fundamental_bd, amplitud:amplitud_bd, modo:modo_bd, dialogo:dialogo_bd, acustica:acustica_bd, instrumental:instrumental_bd, audiencia:audiencia_bd, positivismo:positivismo_bd, tempo:tempo_bd, firma_tiempo:firma_tiempo_bd, track_uri:records.uri })
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

                                                         })

                                                    })
                                                    .catch(function(error){
                                                        console.log(error);
                                                    })

                                            }


                                        res.render('pages/page3', objetosGlobales[position]);

                                  }, function(err) {
                                    console.error(err);
                                   res.render('pages/error');   
                                  });




                            })
                            .catch(function(error){
                                console.log(error);
                            })


                           }

            })
          .catch(function(error){
            console.log(error);
        });

        };
        })

        }else{ 
            console.log('error:');
            console.log(error);
            res.render('pages/error') 
        }

    }
});

//Finaliza proceso

module.exports = router;