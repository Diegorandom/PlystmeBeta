const https = require('node:https');
var caracteristicas = require('../services/caracteristicasService')

const mineriaDeUsuario = (
    options,
    track_uri = [],
    seedTracks,
    session,
    driver,
    spotifyApi,
    bdEstado,
    cambioRango,
    access_token,
    refresh_token,
    userid,
    rango
) => {

    https.request(options, function (error, response, body) {

        if (error == true || body == undefined || body.items == undefined) {
            console.log('Error SpotifyApi')
            throw new Error('Spotify API response for data mining is empty')
        }

        /*Por cada uno de los tracks del usuario se correo un proceso para gaurdar esta información en la BD*/
        var artistaId = [], contadorTracks = 0;
        console.log('Número de canciones regresadas por API de Spotify -> ', body.items.length)

        body.items.forEach(function (record, index) {

            //SE GUARDA LA INFORMACION DE CADA TRACK EN UNA POSICION DE SEEDTRACKS DENTRO de OBJETOSGLOBALES
            if (index <= 50) {
                seedTracks[index] = record;
            }

            session[index + 1] = driver.session();

            /*Se consulta si el track ya existe en la BD*/

            let trackIdErrorCounter = 0;
            const getTrackId = () => {
                const promesaTrackId = session[index + 1]
                    .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{id}}) RETURN n', { id: record.id }))

                promesaTrackId
                    .then(function (checktrack) {
                        var artistas = [];
                        /*Agrupación de los artistas de la canción en un arreglo que será usado después para guardar estos en la BD*/
                        for (var i = 0; i < record.artists.length; i++) {
                            artistas.push(record.artists[i].name)
                        }

                        console.log('')
                        console.log('se realizó la consulta a la base de datos')
                        console.log('0 = No existe en la BD, 1 Si existe -> ', checktrack.records.length);

                        if (checktrack.records.length == 0) {
                            track_uri.push(record.uri.substring(14));

                            // en caso de que el track no exista en la BD: SE GUARDA LA INFORMACIÓN DEL TRACK EN LA BASE DE DATOS

                            console.log(' \n Es la primera vez que se analiza este track \n');
                            console.log('')
                            console.log('Se creará nuevo record en base de datos');

                            if (record.is_playable != Boolean) { record.is_playable = null }

                            /*Proceso de guardar datos generales del track en la BD*/
                            var trackAnalisisErrorCounter = 0;
                            const trackAnalisis = () => {
                                const promesaBasicTrack = session[index + 1]
                                    .writeTransaction(tx => tx.run('CREATE (n:track {album:{album}, nombre:{nombre}, artistas:{artistas}, duracion:{duracion}, Contenido_explicito:{Cont_explicito}, externalurls: {externalurls}, href:{href}, spotifyid:{spotifyid}, reproducible:{reproducible}, popularidad:{popularidad}, previewUrl:{previewUrl}, uri:{uri}, albumImagen:{albumImagen},artistaId:{artistaId}})', { album: record.album.name, nombre: record.name, artistas: artistas, duracion: record.duration_ms, Cont_explicito: record.explicit, externalurls: record.external_urls.spotify, href: record.href, spotifyid: record.id, reproducible: record.is_playable, popularidad: record.popularity, previewUrl: record.preview_url, uri: record.uri, albumImagen: record.album.images[0].url, artistaId: record.artists[0].id, session: [] }))

                                promesaBasicTrack
                                    .then(function () {
                                        console.log('Se Guardo con éxito la información de este track');
                                        contadorTracks += 1;

                                        if (body.items.length == contadorTracks) {
                                            console.log('Se han terminado de guardar -> ', body.items.length, " tracks = -> ", contadorTracks)
                                            /*Se extrae el uri (ID) del track para requerir las caracteristicas del track y guardarlas en la BD*/
                                            console.log('Se comienza a llamar la funcion de revision de caracteristicas de los tracks guardados')

                                            var newIndex = body.items.length;

                                            caracteristicas(
                                                driver,
                                                newIndex,
                                                index,
                                                session,
                                                track_uri,
                                                spotifyApi,
                                                bdEstado,
                                                cambioRango,
                                                seedTracks,
                                                access_token,
                                                refresh_token,
                                            )
                                        }

                                        /*Este IF revisa si el id del artista en el track RECIEN GUARDADO ya existe en la BD, en caso de que no sea así hace el proceso de guardarlo y conectarlo*/
                                        if (artistaId.indexOf(record.artists[0].id) == -1) {
                                            artistaId.push(record.artists[0].id)

                                            /*Se revisa si el artista ya existe en la BD*/
                                            let findArtistErrorCounter = 0
                                            const findArtist = () => {
                                                const promesaArtista = session[index + 1]
                                                    .writeTransaction(tx => tx.run('MATCH (n:artista {artistaId: {spotifyId}}) RETURN n', { spotifyId: record.artists[0].id }))

                                                promesaArtista.then(function (artistaBusqueda) {

                                                    console.log("artistaBusqueda.records.length")
                                                    console.log(artistaBusqueda.records.length)

                                                    /*Si el artista no existe en la BD se guarda la información del artista*/
                                                    if (artistaBusqueda.records.length < 1) {

                                                        console.log('Artista Nuevo!')
                                                        let createArtistErrorCounter = 0;
                                                        const createArtist = () => {
                                                            const promesaCrearArtista = session[index + 1]
                                                                .writeTransaction(tx => tx.run('CREATE (n:artista {artistaId: {spotifyId}, nombre:{nombre}})', { spotifyId: record.artists[0].id, nombre: record.artists[0].name }))

                                                            promesaCrearArtista
                                                                .then(function () {
                                                                    console.log('Artista Creado en la BD')

                                                                    /*Se crea la relación entre los tracks y el usuario en BD*/
                                                                    const trackUserRelation = () => {
                                                                        const promesaRelacionTrackBd = session[index + 1]
                                                                            .writeTransaction(tx => tx.run(
                                                                                'MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}})  CREATE (n)<-[:Escuchado {importanciaIndex: {index}, '
                                                                                + 'rangoTiempo: { rangoTiempo }}]-(m)',
                                                                                {
                                                                                    spotifyidUsuario: userid,
                                                                                    spotifyid: record.id, index: index + 1,
                                                                                    rangoTiempo: rango
                                                                                }))

                                                                        promesaRelacionTrackBd
                                                                            .then(function () {
                                                                                console.log("Se conecto exitosamente el track con el usuario")

                                                                                /*Se crea la relación entre track y artista en BD*/
                                                                                var trackArtistErrorCounter = 0;
                                                                                const trackArtistRelation = () => {
                                                                                    const promesaRelacionTrackArtista = session[index + 1]
                                                                                        .writeTransaction(tx => tx.run(
                                                                                            'MATCH (n:track {artistaId:{spotifyId}}), (o:artista {artistaId:{spotifyId} }) CREATE (n)-[:interpretadoPor]->(o) ',
                                                                                            {
                                                                                                spotifyId: record.artists[0].id,
                                                                                                rangoTiempo: rango
                                                                                            }))

                                                                                    promesaRelacionTrackArtista
                                                                                        .then(function () {
                                                                                            session[index + 1].close();
                                                                                            console.log("Union de artista existente con track existente exitoso")
                                                                                        })

                                                                                    promesaRelacionTrackArtista
                                                                                        .catch(function (err) {
                                                                                            console.log(err);
                                                                                            console.log('Error BD')
                                                                                            trackArtistErrorCounter++
                                                                                            if (trackArtistErrorCounter > 5) {
                                                                                                trackAnalisisErrorCounter = 0;
                                                                                                return new Error(err)
                                                                                            } else {
                                                                                                trackArtistRelation();
                                                                                            }

                                                                                        })
                                                                                }
                                                                                trackArtistRelation();
                                                                            })

                                                                        promesaRelacionTrackBd
                                                                            .catch(function (err) {
                                                                                console.log(err);
                                                                                console.log('Error BD')
                                                                                trackAnalisisErrorCounter++;
                                                                                if (trackAnalisisErrorCounter > 5) {
                                                                                    trackAnalisisErrorCounter = 0;
                                                                                    return new Error(err)
                                                                                } else {
                                                                                    trackUserRelation();
                                                                                }
                                                                            })
                                                                    }
                                                                    trackUserRelation();
                                                                })


                                                            promesaCrearArtista
                                                                .catch(function (err) {
                                                                    console.log(err);
                                                                    console.log('Error BD')
                                                                    createArtistErrorCounter++;
                                                                    if (createArtistErrorCounter > 5) {
                                                                        createArtistErrorCounter = 0;
                                                                        return new Error(err)
                                                                    } else {
                                                                        createArtist();
                                                                    }
                                                                })
                                                        }
                                                        createArtist();
                                                    } else {
                                                        /*Si el track existe en la BD se pasa directamente a conectar la relación entre track e usuario*/
                                                        var trackUserRelationErrorCounter2 = 0
                                                        const trackUserRelation2 = () => {
                                                            const promesaRelacionTrackUsuario = session[index + 1]
                                                                .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{spotifyid}}), (m:usuario {spotifyid:{spotifyidUsuario}}), '
                                                                    + '(o: artista { spotifyId: { spotifyId } }) CREATE(o) < -[: interpretadoPor] - (n) < -[: Escuchado { importanciaIndex:'
                                                                    + ' { index }, rangoTiempo: { rangoTiempo } }] - (m)',
                                                                    {
                                                                        spotifyidUsuario: userid,
                                                                        spotifyid: record.id, index: index + 1,
                                                                        spotifyId: record.artists[0].id,
                                                                        rangoTiempo: rango
                                                                    }))

                                                            promesaRelacionTrackUsuario
                                                                .then(function () {
                                                                    session[index + 1].close();
                                                                    console.log("Se conecto exitosamente el track con el usuario")

                                                                })

                                                            promesaRelacionTrackUsuario
                                                                .catch(function (err) {
                                                                    console.log(err);
                                                                    console.log('Error BD')
                                                                    if (trackUserRelationErrorCounter2 > 5) {
                                                                        trackUserRelationErrorCounter2 = 0
                                                                        return new Error(err)
                                                                    } else {
                                                                        trackUserRelation2();
                                                                    }


                                                                })

                                                        }
                                                        trackUserRelation2();
                                                    }
                                                })

                                                promesaArtista
                                                    .catch(function (err) {
                                                        console.log(err);
                                                        console.log('Error BD')
                                                        findArtistErrorCounter++
                                                        if (findArtistErrorCounter > 5) {
                                                            findArtistErrorCounter = 0
                                                            return new Error(err)
                                                        } else {
                                                            findArtist();
                                                        }
                                                    })
                                            }
                                            findArtist();
                                        } else {
                                            /*En caso de que el artista ya fue procesado y por lo tanto conectado con otros tracks y con el track en proceso, solo hace falta conectar el usuario con el nuevo track*/
                                            let connectingUserTrackErrorCounter = 0;
                                            const connectingUserTrack = () => {
                                                const promesaConectarUsuarioTrack = session[index + 1]
                                                    .writeTransaction(tx => tx.run('MATCH (n:track {spotifyid:{spotifyid}}), '
                                                        + '(m: usuario { spotifyid: { spotifyidUsuario } }) CREATE(n) < -[: Escuchado { importanciaIndex:'
                                                        + ' { index }, rangoTiempo: { rangoTiempo } }] - (m)', {
                                                        spotifyidUsuario: userid,
                                                        spotifyid: record.id,
                                                        index: index + 1,
                                                        rangoTiempo: rango
                                                    }))

                                                promesaConectarUsuarioTrack
                                                    .then(function () {
                                                        session[index + 1].close();
                                                        console.log("Se conecto exitosamente el track con el usuario")

                                                    })

                                                promesaConectarUsuarioTrack
                                                    .catch(function (err) {
                                                        console.log(err);
                                                        console.log('Error BD')
                                                        connectingUserTrackErrorCounter++;
                                                        if (connectingUserTrackErrorCounter > 5) {
                                                            return new Error(err)
                                                        } else {
                                                            connectingUserTrack();
                                                        }
                                                    })
                                            }
                                            connectingUserTrack();
                                        }

                                    })
                                promesaBasicTrack
                                    .catch(function (err) {
                                        trackAnalisisErrorCounter++;
                                        console.log(err);
                                        console.log('Error BD')
                                        trackAnalisis();

                                    })
                            };
                            trackAnalisis();

                        } else if (checktrack.records.length >= 1) {
                            /**En caso de que el track ya esté registrado, significa que este ya se procesó y cnectó apropiadamente */
                            console.log('Este track ya está registrado (no debería ser más de 1)')
                            contadorTracks += 1
                            if (body.items.length == contadorTracks) {
                                /*Se extrae el uri (ID) del track para requerir las caracteristicas del track y guardarlas en la BD*/
                                console.log('Se comienza a llamar la funcion de revision de caracteristicas de los tracks guardados')
                                var newIndex = body.items.length;

                                caracteristicas(
                                    driver,
                                    newIndex,
                                    index,
                                    session,
                                    track_uri,
                                    spotifyApi,
                                    bdEstado,
                                    cambioRango,
                                    seedTracks,
                                    access_token,
                                    refresh_token,
                                )
                            }
                        }
                    })

                promesaTrackId
                    .catch(function (err) {
                        console.log(err);
                        console.log('Error BD')
                        trackIdErrorCounter++;
                        if (trackIdErrorCounter > 5) {
                            trackIdErrorCounter = 0;
                            return new Error(err)
                        } else {
                            getTrackId();
                        }

                    })
            }

            getTrackId();

            //TERMINA DE GUARDARSE INFORMACIÓN DEL TRACK Y COMIENZA A PROCRESARCE EL ALGORITMO


        });

    });
}

module.exports = mineriaDeUsuario
