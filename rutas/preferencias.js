var express = require('express');
var router = new express.Router();
var request = require('request'); // "Request" library

/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
*/

router.post('/preferencias', function(req, res, error) { 
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = req.sessions.position;
    console.log('apuntador del objeto en preferencias', position);
    
    /*Revisión de errores de origen*/
    if(error == true || objetosGlobales[position] == undefined){ res.render('pages/error')}else{ 
    
        //Comienza request de perfil de preferencias
        console.log('comienza petición a api')
        console.log('Obteniendo preferencias del id --> ', objetosGlobales[position].userid )
        
        /*argumentos para solicitud de perfil de preferencial al suriel-api*/
         var options = { method: 'POST',
              url: 'https://atmos-algorithm.mybluemix.net/api/v1/user_profile/user_profile',
              headers: 
               { 'Postman-Token': '234b375e-8429-4718-b095-2054555fd0b2',
                 'Cache-Control': 'no-cache',
                 'Content-Type': 'application/json' },
              body: { spotifyid: objetosGlobales[position].userid },
              json: true };


        /*Función de request de perfil de preferencias de usuario*/
        function Test(options){
            console.log('La API de preferencias ha sido llamada')
            request(options, function (error, response, body) {
                console.log('La API de preferencias respondió algo')
                if (error == true || body == undefined || body.profile == undefined) {
                /**Proceso En caso de que la API esté valiendo verga como casi nunca pasa. Se imprimen errores*/
                console.log("API dormida zzzzz ugh!")
                console.log(body)
                console.log(error)
                /*Se reinicia el proceso para ver si ahora si jala esta cosa*/
                    Test(options)
                }else{
                    /*Proceso en caso de que la API funcione #blessed. Se guarda el perfil en el objeto del usuario y se manda a la interfaz*/
                    console.log('La API jaló, alabado sea el señor')
                        objetosGlobales[position].danceability = body.profile.danceability;

                        objetosGlobales[position].energia = body.profile.energia;

                        objetosGlobales[position].acustica = body.profile.acousticness;

                        objetosGlobales[position].instrumental = body.profile.instrumentalness;

                        objetosGlobales[position].audiencia = body.profile.liveness;

                        objetosGlobales[position].positivismo = body.profile.positivismo;

                        objetosGlobales[position].amplitud = body.profile.amplitud;

                        objetosGlobales[position].fundamental = body.profile.fundamental;

                        objetosGlobales[position].tempo = body.profile.tempo;

                        objetosGlobales[position].firma_tiempo = body.profile.compas;

                        objetosGlobales[position].popularidadAvg = body.profile.popularidadAvg;

                        objetosGlobales[position].modo = body.profile.modo;
                        
                        objetosGlobales[position].duracion = body.profile.duracion;
                    
                        console.log('Preferencias llegó a servidor')
                    
                        res.send(objetosGlobales[position])


                }
                });
        };
        
        /*Inicio de proceso de obtención de perfil de preferencias del usuario*/
        Test(options)
        
    }
                                
});                             

//Termina request de perfil     
module.exports = router;