var querystring = require('querystring');
const matchDatabaseUsuario = require('../database/matchDatabaseUsuario');
const createDatabaseUsuario = require('../database/createDatabaseUsuario');
const axios = require('axios');

/*Utilizando el token de acceso de la autorizacion se procede a solicitar los datos del usuario*/
const logIn = async (
    jsonDatos,
    session,
    pais,
    nombre,
    email,
    external_urls,
    userid,
    followers,
    imagen_url,
    access_token,
    refresh_token,
    mensaje,
    bdEstado,
    spotifyid
) => {

    console.log('access token ', access_token)

    const config = {
        method: 'GET',
        url: `https://api.spotify.com/v1/me`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
    }

    let response = await axios(config)

    // let response = https.request(optionsLogIn).end()

    console.log(response)

    /*Se guarda la información del usuario en el objeto global correspondiente*/
    jsonDatos.userid = response.data.id;
    jsonDatos.followers = response.data.followers.total;
    console.log("userid:" + jsonDatos.userid + '\n');

    //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG de jona
    if (response.data.images[0] != undefined) {
        console.log('imagen_url');
        console.log(imagen_url);
        imagen_url = response.data.images[0].url;
        console.log('imagen_url');
        console.log(imagen_url);
    }

    console.log('Comienza proceso de revisión en base de datos para verificar si es un usuario nuevo o ya está regitrado \n');
    console.log('');

    let checkid_result = matchDatabaseUsuario(
        session,
        mensaje,
        access_token,
        refresh_token,
        bdEstado
    )

    /*En caso de que el usuario nuevo se comienza a guardar su información en la base de datos*/
    if (checkid_result.records.length < 1) {
        console.log(' \n el usuario es nuevo \n');
        console.log('Se creará nuevo record en base de datos');
        mensaje = "nuevo_usuario";

        let response = createDatabaseUsuario(
            session,
            pais,
            nombre,
            email,
            external_urls,
            userid,
            followers,
            imagen_url,
            access_token,
            refresh_token,
        )

        return {
            redirect: response
        }

    } else if (checkid_result.records.length >= 1) {
        console.log('Este usuario ya está registrado (no debería ser más de 1)')

        /*cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. 
        la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar
         la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
        bdEstado = "guardado"

        mensaje = "nuevo_login";

        /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
        var preventCache = Date.now()
        console.log(preventCache)
        return {
            redirect: '/perfil#' +
                querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token,
                    preventCache: preventCache
                }),
            session,
            spotifyid,
            mensaje,
            access_token,
            refresh_token,
            bdEstado
        }

    } else {
        console.log('No se pudo determinar si es un usuario nuevo o registrado')
        return new Error('No se pudo determinar si es un usuario nuevo o registrado');
    }

}

const prepareToLogin = async (
    options,
    jsonDatos,
    session,
    pais,
    nombre,
    email,
    external_urls,
    userid,
    followers,
    imagen_url,
    access_token,
    refresh_token,
    mensaje,
    bdEstado,
    spotifyid,
) => {
    console.log('LogIn to Spotify')

    const config = {
        method: options.method,
        url: `https://accounts.spotify.com/api/token`,
        headers: options.headers,
        data: options.form
    }

    let response = await axios(config)

    refresh_token = response.data.refresh_token;
    access_token = response.data.access_token;

    console.log(response)

    let logInResponse = logIn(
        jsonDatos,
        session,
        pais,
        nombre,
        email,
        external_urls,
        userid,
        followers,
        imagen_url,
        access_token,
        refresh_token,
        mensaje,
        bdEstado,
        spotifyid
    )

    console.log('logIn completed ', logIn);

    //response.on(logInResponse.redirect ? logIn.logInResponse : logIn)

    return logInResponse

}

/* Llamada al algoritmo de recomendaciones de Suriel */
/**
 * 
 * 
 * 
 * @param {*} options 
 */
const getAlgorithmRecommendation = async (options, playlist) => {

    const config = {
        method: options.method,
        url: options.url,
        headers: options.headers
    }

    let body = await axios(config)

    let conteoErrores = 0;

    /*En caso de que haya errores en el requerimiento se manda el error a la consola*/
    if (body.data.listaCanciones == null) {
        console.log('error en Endpoint de Pool')
        console.log("API dormida? retry!");
        /*Se vuelve a intentar la comunicación con la API después de un tiempo de espera (1 segundo)*/
        setTimeout(function () {
            getAlgorithmRecommendation(options)
        }, 1000);
        conteoErrores += 1;

        /*Si los errores en la API persisten por más de 30 segundos se manda a la pantalla de error*/
        if (conteoErrores > 30) {
            return 'Algorithm down'
        }

    }

    console.log("API funcionando, GRACIAS A DIOS ALV PRRO!...");
    console.log(body.data);
    console.log(body.data)

    /*Se guarda la lista de canciones en el arreglo playlist del objetoGlobal del usuario correspondiente. Esto se hace para después usar este objeto en caso de que sea requerido guardar este playlist en Spotify*/
    body.data.listaCanciones.forEach(function (item) {
        playlist.push(item[1])
    })

    console.log("objetosGlobales[position].playlist")
    console.log(playlist)

    /*La lista de canciones recomendadas es enviada al cliente*/
    console.log('Despliegue de playlist exitosa')
    return {
        send: body.data.listaCanciones,
        playlist
    }

}

module.exports = {
    logIn,
    prepareToLogin,
    getAlgorithmRecommendation
}
