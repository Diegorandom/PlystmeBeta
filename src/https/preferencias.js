const https = require('https');

const preferencias = (
    options,
    user,
    userid
) => {
    let contadorErroresApi = 0;

    https.post(options, function (error, response, body) {
        console.log('La API de preferencias respondió algo')
        if (error == true || body == undefined || body.profile == undefined || user == null || body == null || body.profile.danceability == null) {
            /**Proceso En caso de que la API esté valiendo verga como casi nunca pasa. Se imprimen errores*/
            console.log("API dormida zzzzz ugh!")
            console.log(body)
            console.log(error)
            /*Se reinicia el proceso para ver si ahora si jala esta cosa*/

            contadorErroresApi += 1;

            if (contadorErroresApi == 3) {
                contadorErroresApi = 0
                return { send: 'Error SuriApi' }
            } else {
                setTimeout(function () {
                    console.log('comienza petición a api')
                    console.log('Obteniendo preferencias del id --> ', userid)
                    preferencias(options, user, userid)
                }, 1000);
            }

        } else {
            /*Proceso en caso de que la API funcione #blessed. Se guarda el perfil en el objeto del usuario y se manda a la interfaz*/
            console.log('La API jaló, alabado sea el señor')

            var preferencias = {
                danceability: body.profile.danceability,
                energia: body.profile.energia,
                acustica: body.profile.acousticness,
                instrumental: body.profile.instrumentalness,
                audiencia: body.profile.liveness,
                positivismo: body.profile.positivismo,
                amplitud: body.profile.amplitud,
                fundamental: body.profile.fundamental,
                tempo: body.profile.tempo,
                firma_tiempo: body.profile.compas,
                popularidadAvg: body.profile.popularidadAvg,
                modo: body.profile.modo,
                duracion: body.profile.duracion
            }

            console.log('Preferencias llegó a servidor')
            console.log('Preferencias -> ', preferencias)

            return {
                send: preferencias,
                response
            }
        }
    });
}

module.exports = preferencias
