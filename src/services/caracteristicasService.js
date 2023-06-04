/*FUNCIÓN DE CARACTERÍSTICAS*/

const isTrackInDatabse = require("./isTrackInDatabseService")

const caracteristicasService = (
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
) => {


    //SE GUARDA LA INFORMACIÓN DEL TRACKS EN LA BASE DE DATOS

    console.log("URI de track a analizar")
    console.log(track_uri.length)
    console.log(track_uri)
    console.log(track_uri.length)

    if (track_uri.length == 0) {
        bdEstado = "guardado"
        console.log('YA SE TERMINÓ DE GUARDAR LA INFORMACION EN LA BASE DE DATOS')

        //SE TERMINA ANÁLISIS DE CARACTERÍSTICAS
        /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/

        cambioRango = false;
        return { send: seedTracks }
    }

    console.log('Por cada trackUri se revisará si existe en la BD')
    track_uri.forEach((dataURI, index) => isTrackInDatabse(
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
    ))

}

module.exports = caracteristicasService