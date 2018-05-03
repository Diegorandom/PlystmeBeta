var express = require('express');
var router = new express.Router();
var request = require('request'); // "Request" library

/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
*/

router.post('/preferencias', function(req, res, error) { 
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position=req.sessions.position;
    console.log('apuntador del objeto', position);
    
    if(error == true){ res.render('pages/error')}else{ 
    
//Comienza request de perfil
                                         
         var options = { method: 'POST',
              url: 'https://atmos-algorithm.mybluemix.net/api/v1/user_profile/user_profile',
              headers: 
               { 'Postman-Token': '234b375e-8429-4718-b095-2054555fd0b2',
                 'Cache-Control': 'no-cache',
                 'Content-Type': 'application/json' },
              body: { spotifyid: objetosGlobales[position].userid },
              json: true };


         function Test(options){
            request(options, function (error, response, body) {
                if (error == true || body.listaCanciones == null) {
                console.log("API dormida zzzzz");
                    Test(options);
                }else{
                        console.log(body);

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

                        objetosGlobales[position].dialogo = body.profile.popularidadAvg;

                        objetosGlobales[position].modo = body.profile.modo;

                        console.log(objetosGlobales[position]);
                        
                        console.log('Preferencias llegó a servidor')
                    
                        res.send(objetosGlobales[position])


                }
                });
        };
    }
                                
});
                                         
                                         

 //Termina request de perfil   
                                         
    
module.exports = router;