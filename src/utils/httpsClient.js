var querystring = require('querystring');
const https = require('https');
const promesaMatchUsuario = require('../database/matchUsuario');
const createUsuario = require('../database/createUsuario');
/*Utilizando el token de acceso de la autorizacion se procede a solicitar los datos del usuario*/

const get = (
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
    spotifyid
) => {
    return https.get(options, function (error, bodyS) {
        if (error) return error

        /*Se guarda la información del usuario en el objeto global correspondiente*/
        jsonDatos.userid = bodyS.id;
        jsonDatos.followers = bodyS.followers.total;
        console.log("userid:" + jsonDatos.userid + '\n');

        //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG de jona
        let imagen_url = "";
        if (bodyS.images[0] != undefined) {
            console.log('imagen_url');
            console.log(imagen_url);
            imagen_url = bodyS.images[0].url;
            console.log('imagen_url');
            console.log(imagen_url);
        }

        console.log('Comienza proceso de revisión en base de datos para verificar si es un usuario nuevo o ya está regitrado \n');
        console.log('');

        let checkid_result = promesaMatchUsuario(
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


            let response = createUsuario(
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

    })
}

const post = (
    authOptions,
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
    spotifyApi,
) => {
    /*Requerimiento de perfil de usuario vía API*/
    https.post(authOptions, function (error, response, bodyS) {

        /*En caso de que la solicitud a la API sea exitosa se procede*/
        if (!error && response.statusCode === 200) {

            spotifyApi.setAccessToken(bodyS.access_token);

            access_token = bodyS.access_token;
            refresh_token = bodyS.refresh_token;

            var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + bodyS.access_token },
                json: true
            };

            let response = get(
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
                spotifyid
            )

            return response.redirect ? response.redirect : response

        } else {
            return error
        }
    })
}

module.exports = {
    get,
    post
}
