//ENDPOINT DE GUARDADO DE PLAYLIST
var express = require("express");
var router = new express.Router();
var request = require("request");

/*Proceso para guarda una playlist en Spotify*/
router.get('/guardar/top50', function(req, res, error){
var objetosGlobales = req.app.get('objetosGlobales');
var position = req.sessions.position;
    
if(error == true || objetosGlobales == undefined || position == undefined){
    console.log('error en el proceso de guardar playlist')
    res.send('Error Global')
}else{    
    
    /*Se declara el nombre del playlist que será guardado en Spotify, esto debe convertir a custom by user cuando se lance la versión de usuario*/    
    if(objetosGlobales[position].rango=="long_term"){
        var playlistname = "TOP 50 - Desde Siempre"
    }else if(objetosGlobales[position].rango=="medium_term"){
        var playlistname = "TOP 50 - Últimos 6 Meses"
    }else if(objetosGlobales[position].rango=="short_term"){
        var playlistname = "TOP 50 - Último Mes"
    }
        
    console.log('playlistname = ' + playlistname);
    console.log('userids = ' + objetosGlobales[position].userid);

    objetosGlobales[position].mensaje = "nuevo_playlist";    

    var uris1 = [], uris2 = [];     


        /*Se manda a llamar el endpoint para guardar plalists en Spotify con el id del usuario y el nombre del Playlist*/
        objetosGlobales[0].spotifyApi.createPlaylist(objetosGlobales[position].userid, playlistname, { 'public' : false })
            .then(function(data) {
                console.log('Se creó el playlist, falta llenarlo de canciones');
                console.log('data', data);

                /*Una vez creado el playlist, es tiempo de llenarlo con canciones. Para esto se toma el objeto playlist de objetosGlobales[usuario] que fue creado en el poolAlgoritmo*/
                objetosGlobales[position].seedTracks.forEach(function(records, index){
                    /*Es necesario crear 2 arreglos intermedios para hacer 2 request correspondientes a la creación de 2 procesos de guardado en serie. Estos son requerimientos y limitaciones de la API de Spotify*/
                    if(index < 50){
                     uris1[index] = records.uri    
                    }else{
                     uris2[index-50] = records.uri   
                    }
                });

                console.log("uris1 =", uris1);
                console.log("uris2 =", uris2);


                /*Se guarda el ID del playlist recién creado para procesos más adelante*/
                var top50_id = data.body.id; 
                objetosGlobales[position].top50_id = data.body.id;

                 console.log("info para agregar tracks a playlist: \n", "userids: ", objetosGlobales[position].userid,  "\n",
                    "data.body.id: ", data.body.id, "\n", 
                    "uris1: ", uris1 )

                // Se utiliza la API de Spotify para guardar el el primero grupo de 50 canciones en Spotify
                objetosGlobales[0].spotifyApi.addTracksToPlaylist(objetosGlobales[position].userid, data.body.id, uris1)
                  .then(function(data) {
                     console.log('Added tracks to playlist ! paso #1');
                     console.log('data', data);

                         console.log("info para agregar tracks a playlist: \n", "userids: ", objetosGlobales[position].userid,  "\n",
                            "data.body.id: ", top50_id, "\n", 
                            "uris2: ", uris2 )

                         /*En caso de que todo el playlist haya sido guardado en el primer arreglo intermedio, entonces se omite el proceso guardar el segundo arreglo intermedio*/
                        if(objetosGlobales[position].seedTracks.length > 50){
                                /*Una vez guardado el primer grupo de canciones se procede con el siguiente grupo de canciones*/
                             objetosGlobales[0].spotifyApi.addTracksToPlaylist(objetosGlobales[position].userid, top50_id, uris2)
                                  .then(function(data) {
                                    console.log('Added tracks to playlist paso #2!');
                                    console.log('data', data);
                                   console.log('Creación de playlist exitosa')
                                    /*Una vez guardado los 2 grupos de canciones se envía el mensaje al cliente de que el playlist se ha guardado*/
                                    res.send('topGuardado');
                                  }, function(err) {
                                    /*En caso de que el segundo grupo de canciones del playlist falle en guardar se manda el mensaje de que se guardó el playlist (las primeras 50 canciones)*/
                                    console.log('Error al momento de agregar segundos 50 tracks a playlist. paso #2', err);
                                    res.send('Error SpotifyApi')
                                  });
                        }else{
                            console.log('Creación de playlist exitosa con 50 canciones max')
                            res.send('topGuardado');
                        } 

                      }, function(err) {
                        console.log('Error al momento de agregar primeras 50 tracks a playlist. paso #1', err);
                        res.send('Error SpotifyApi')
                        })

            },function(error){
                console.log(error);
                /*Error al crear playlist en Spotify*/
                res.send('Error SpotifyApi')
            });

        
}
    
  });


//Finaliza proceso
module.exports = router;
