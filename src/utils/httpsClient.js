const https = require('https');
var querystring = require('querystring');

/*Utilizando el token de acceso de la autorizacion se procede a solicitar los datos del usuario*/

const get = (options, jsonDatos, objetosGlobales, position) => {
    https.get(options, function (error, bodyS) {
        if (error == true) return error

        /*Se guarda la información del usuario en el objeto global correspondiente*/
        jsonDatos.userid = bodyS.id;
        jsonDatos.followers = bodyS.followers.total;
        console.log("userid:" + jsonDatos.userid + '\n');
        objetosGlobales[position] = jsonDatos;
        objetosGlobales[position].access_token = objetosGlobales[0].access_token;

        objetosGlobales[position].refresh_token = objetosGlobales[0].refresh_token;
        console.log('Refresh Token ->', objetosGlobales[position].refresh_token)
        /*Se elimina el access_token del usuario del objeto neutral para que este sea no contamine a otros usuarios con información que no le corresponde*/
        objetosGlobales[0].access_token = null
        objetosGlobales[0].refresh_token = null
        objetosGlobales[position].pais = bodyS.country;
        objetosGlobales[position].nombre = bodyS.display_name;
        objetosGlobales[position].email = bodyS.email;
        objetosGlobales[position].external_urls = bodyS.external_urls;

        //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG de jona
        let imagen_url = "";
        if (bodyS.images[0] != undefined) {
            console.log('imagen_url');
            console.log(imagen_url);
            objetosGlobales[position].imagen_url = bodyS.images[0].url;
            console.log('imagen_url');
            console.log(imagen_url);
        }

        console.log('Comienza proceso de revisión en base de datos para verificar si es un usuario nuevo o ya está regitrado \n');
        console.log('');

        /*Se consulta si el usuario ya existe en la base de datos*/
        const promesaMatchUsuario = objetosGlobales[0].session[0]
            .writeTransaction(tx => tx.run('MATCH (n:usuario) WHERE n.spotifyid={spotifyid} RETURN n', { spotifyid: jsonDatos.userid }))

        promesaMatchUsuario.then(function (checkid_result) {
            console.log('')
            console.log('se realizó la consulta a la base de datos')

            console.log('checkid_result.length:');
            console.log(checkid_result.records.length)

            console.log('');
            /*En caso de que el usuario nuevo se comienza a guardar su información en la base de datos*/
            if (checkid_result.records.length < 1) {
                console.log(' \n el usuario es nuevo \n');
                console.log('Se creará nuevo record en base de datos');
                objetosGlobales[position].mensaje = "nuevo_usuario";


                /*Se crea el nodo del usuario en la BD*/
                const promesaCrearUsuario = objetosGlobales[0].session[0]
                    .writeTransaction(tx => tx.run('CREATE (n:usuario {pais:{pais}, nombre:{nombre}, email:{email}, external_urls:{external_urls}, seguidores:{followers}, spotifyid:{spotifyid}, imagen_url: {imagen_url} })', { pais: objetosGlobales[position].pais, nombre: objetosGlobales[position].nombre, email: objetosGlobales[position].email, external_urls: objetosGlobales[position].external_urls.spotify, spotifyid: objetosGlobales[position].userid, followers: objetosGlobales[position].followers, imagen_url: objetosGlobales[position].imagen_url }))

                promesaCrearUsuario.then(function () {
                    objetosGlobales[0].session[0].close();
                    console.log('Se creó con éxito el nodo del usuario');

                    /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
                    var preventCache = Date.now()
                    console.log(preventCache)
                    return '/perfil#' + querystring.stringify({
                        access_token: objetosGlobales[position].access_token,
                        refresh_token: objetosGlobales[position].refresh_token,
                        preventCache: preventCache
                    })


                })
                promesaCrearUsuario.catch(function (err) {
                    console.log(err);
                    return error

                })



            } else if (checkid_result.records.length >= 1) {
                console.log('Este usuario ya está registrado (no debería ser más de 1)')

                /*cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. 
                la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar
                 la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                objetosGlobales[position].bdEstado = "guardado"

                objetosGlobales[position].mensaje = "nuevo_login";

                /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
                var preventCache = Date.now()
                console.log(preventCache)
                return '/perfil#' +
                    querystring.stringify({
                        access_token: objetosGlobales[position].access_token,
                        refresh_token: objetosGlobales[position].refresh_token,
                        preventCache: preventCache
                    })

            } else {
                console.log('No se pudo determinar si es un usuario nuevo o registrado')
                return undefined
            }
        })

        promesaMatchUsuario.catch(function (err) {
            console.log(err);
            return undefined
        })


    })
}

const post = (authOptions, objetosGlobales, position, jsonDatos) => {
    /*Requerimiento de perfil de usuario vía API*/
    https.post(authOptions, function (error, response, bodyS) {

        /*En caso de que la solicitud a la API sea exitosa se procede*/
        if (!error && response.statusCode === 200) {

            objetosGlobales[0].spotifyApi.setAccessToken(bodyS.access_token);

            objetosGlobales[0].access_token = bodyS.access_token;
            objetosGlobales[0].refresh_token = bodyS.refresh_token;

            var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + bodyS.access_token },
                json: true
            };

            return get(options, jsonDatos, objetosGlobales, position)

        } else {
            return error
        }
    })
}

module.exports = {
    get,
    post
}

