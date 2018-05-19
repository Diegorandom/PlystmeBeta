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
    
    if(error == true){ res.render('pages/error')}else{ 
    
//Comienza request de perfil
                                     
        console.log('comienza petición a api')
        
         var options = { method: 'POST',
              url: 'https://atmos-algorithm.mybluemix.net/api/v1/user_profile/user_profile',
              headers: 
               { 'Postman-Token': '234b375e-8429-4718-b095-2054555fd0b2',
                 'Cache-Control': 'no-cache',
                 'Content-Type': 'application/json' },
              body: { spotifyid: objetosGlobales[position].userid },
              json: true };


        function Test(options){
            console.log('La API de preferencias ha sido llamada')
            request(options, function (error, response, body) {
                console.log('La API de preferencias respondió algo')
                if (error == true || body == undefined || body.profile == undefined) {
                console.log("API dormida zzzzz ugh!")
                console.log(body)
                console.log(error)
                    Test(options)
                }else{
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
        
        var chequeoBD = false
        
        while(chequeoBD == false){
            if(objetosGlobales[position].bdEstado == "guardado"){
                console.log('Información de BD guardada')
                setTimeout(function(){Test(options)},1000)
                chequeoBD == true
            }
            
        }
        
    }
                                
});
                                         
                                         

 //Termina request de perfil   
                                         
    
module.exports = router;