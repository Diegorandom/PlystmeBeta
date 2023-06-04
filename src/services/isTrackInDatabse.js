var querystring = require('querystring')

const isTrackInDatabse = (
    dataURI,
    index,
    session,
    driver,
    newIndex,
    track_uri,
    spotifyApi,
    bdEstado,
    cambioRango,
    seedTracks,
    access_token,
    refresh_token,
) => {

    session[newIndex + index + 1] = driver.session();

    /*Se revisan si las caracteristicas del track ya han sido guardadas*/
    let checkCaracteristicsErrorCounter = 0;
    const checkCaracteristics = () => {
        const promesaRevisionCaract = session[newIndex + index + 1]
            .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{track_uri}}) WHERE NOT EXISTS(n.danceability) '
                + 'OR  NOT EXISTS(n.energia) OR NOT EXISTS(n.fundamental) OR NOT EXISTS(n.amplitud) OR NOT EXISTS(n.modo) OR NOT '
                + 'EXISTS(n.speechiness) OR NOT EXISTS(n.acousticness) OR NOT EXISTS(n.instrumentalness) OR NOT EXISTS(n.positivismo) OR NOT '
                + 'EXISTS(n.tempo) OR NOT EXISTS(n.compas) OR NOT EXISTS(n.liveness) RETURN n', { track_uri: dataURI }))

        promesaRevisionCaract
            .then(function (resultado) {
                console.log("Se el conteo es 1 = El nodo necesita recopilar información, 0 = Nodo con info completa -> ", resultado.records.length)

                if (resultado.records.length == 0) {

                    var indiceT = track_uri.indexOf(dataURI);
                    if (indiceT > -1) {
                        track_uri.splice(indiceT, 1)
                    }
                }

                if (track_uri.length == index + 1 && track_uri.length > 0) {
                    track_uri.length = 0;
                    /*Se obtienen las características del track en cuestión con el endpoint del 
                    * módulo de Node.js que me conecta con la BD de Spotify, el siguuiente proceso requiere todas 
                    * las caraceristicas de todos los tracks de un jalón*/
                    spotifyApi.getAudioFeaturesForTracks(track_uri)
                        .then(function (datosTrack) {
                            console.log('Datos extraídos de los 50 tracks')
                            console.log(datosTrack)
                            console.log('Largo de Datos de tracks')
                            console.log(datosTrack.body.audio_features.length)

                            /*Debe iterarse sobre todas las posiciones del arreglo datosTrack para extraer el contenido de cada track solicitado*/
                            datosTrack.body.audio_features.forEach(function (data, indexTrack) {

                                session[newIndex + index + indexTrack + 2] = driver.session();

                                var danceability_bd = parseFloat(data.danceability);
                                var energia_bd = parseFloat(data.energy);
                                var fundamental_bd = parseFloat(data.key);
                                var amplitud_bd = parseFloat(data.loudness);
                                var modo_bd = parseFloat(data.mode);
                                var dialogo_bd = parseFloat(data.speechiness);
                                var acustica_bd = parseFloat(data.acousticness);
                                var instrumental_bd = parseFloat(data.instrumentalness);
                                var audiencia_bd = parseFloat(data.liveness);
                                var positivismo_bd = parseFloat(data.valence);
                                var tempo_bd = parseFloat(data.tempo);
                                var firma_tiempo_bd = parseFloat(data.time_signature);

                                /*Se revisa las caracteristicas del track ya han sido guardadas
                                session 
                                    .run('MATCH (n:track {uri:{track_uri}}) WHERE NOT EXISTS(n.danceability) OR  NOT EXISTS(n.energia) OR NOT EXISTS(n.fundamental) OR NOT EXISTS(n.amplitud) OR NOT EXISTS(n.modo) OR NOT EXISTS(n.speechiness) OR NOT EXISTS(n.acousticness) OR NOT EXISTS(n.instrumentalness) OR NOT EXISTS(n.positivismo) OR NOT EXISTS(n.tempo) OR NOT EXISTS(n.compas) OR NOT EXISTS(n.liveness) RETURN n', {track_uri:data.uri})
                                    .then(function(resultado){
                                        console.log("1 = Debe guardarse la info, 0 = no pasa nada -> ", resultado.records.length)
            
            
                                        if(resultado.records.length>=1){  */
                                /*Query en neo4j para guardar las características del track en el nodo correspondiente*/
                                let guardarCaracteristicsErrorCounter = 0;
                                const guardarCaracteristicas = () => {
                                    const promesaGuardarCaract = session[newIndex + index + indexTrack + 2]
                                        .writeTransaction(tx => tx.run('MATCH (n:track {uri:{track_uri}}) SET n.danceability={danceability}, n.energia={energia}, n.fundamental={fundamental}, n.amplitud={amplitud}, n.modo={modo}, n.speechiness={dialogo}, n.acousticness={acustica}, n.instrumentalness={instrumental}, n.positivismo={positivismo}, n.tempo={tempo}, n.compas={firma_tiempo}, n.liveness={audiencia} RETURN n', { danceability: danceability_bd, energia: energia_bd, fundamental: fundamental_bd, amplitud: amplitud_bd, modo: modo_bd, dialogo: dialogo_bd, acustica: acustica_bd, instrumental: instrumental_bd, audiencia: audiencia_bd, positivismo: positivismo_bd, tempo: tempo_bd, firma_tiempo: firma_tiempo_bd, track_uri: data.uri }))

                                    promesaGuardarCaract
                                        .then(function () {
                                            session[newIndex + index + 1].close();
                                            session[newIndex + index + indexTrack + 2].close();
                                            console.log('Se guardaron las caracteristicas del track')
                                        })

                                    promesaGuardarCaract
                                        .catch(function (err) {
                                            console.log(err);
                                            console.log('Error BD')
                                            guardarCaracteristicsErrorCounter++
                                            if (guardarCaracteristicsErrorCounter > 5) {
                                                guardarCaracteristicsErrorCounter = 0;
                                                return { send: 'Error' }
                                            } else {
                                                guardarCaracteristicas();
                                            }


                                        })
                                }
                                guardarCaracteristicas();
                                /* } */


                                /*El siguiente IF cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                                if (datosTrack.body.audio_features.length == indexTrack + 1) {
                                    bdEstado = "guardado"
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
                                    cambioRango = false;
                                    return {
                                        send: seedTracks
                                    }

                                } else {
                                    console.log('Aun no se termina de guardar la informacion en la BD')
                                    console.log("index: ", indexTrack + 1, "body.items.length ", datosTrack.body.audio_features.length)
                                }

                                /* })
                                    .catch(function(err){
                                        console.log(err);
                                        res.send('Error BD')
                                        
                                    }) */



                            })

                        }, function (err) {
                            console.log("err: " + err);
                            console.log('Error SpotifyApi')
                            return {
                                send: 'Error'
                            }

                        });
                    console.log('');


                } else if (track_uri.length == index + 1 && track_uri.length == 0) {
                    /*El siguiente IF cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/

                    bdEstado = "guardado"
                    console.log('YA SE TERMINÓ DE GUARDAR LA INFORMACION EN LA BASE DE DATOS')

                    //SE TERMINA ANÁLISIS DE CARACTERÍSTICAS
                    /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/

                    var preventCache = Date.now()
                    console.log(preventCache)

                    return {
                        redirect: '/perfil#' +
                            querystring.stringify({
                                access_token,
                                refresh_token,
                                preventCache: preventCache
                            })
                    }

                }
            })

        promesaRevisionCaract
            .catch(function (err) {
                console.log(err);
                console.log('Error BD')
                checkCaracteristicsErrorCounter++
                if (checkCaracteristicsErrorCounter > 5) {
                    return {
                        send: 'Error',
                        checkCaracteristicsErrorCounter: 0
                    }

                } else {
                    checkCaracteristics();
                }

            })
    }
    checkCaracteristics();

    //Finaliza análisis individual de tracks
}

module.exports = isTrackInDatabse