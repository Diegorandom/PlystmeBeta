//ENDPOINT DE GUARDADO DE PLAYLIST

var express = require("express");
var router = new express.Router();
var request = require("request");

/*Proceso para guarda una playlist en Spotify*/
router.get('/create/playlist', function(req, res, error){
var objetosGlobales = req.app.get('objetosGlobales');
var position = req.sessions.position;
    
if(error == true || objetosGlobales == undefined || position == undefined){
    console.log('error en el proceso de guardar playlist')
    res.send('ERRORORIGEN')
}else{    
    
    /*Se declara el nombre del playlist que será guardado en Spotify, esto debe convertir a custom by user cuando se lance la versión de usuario*/    
    var playlistname = "Plyst Me"
    console.log('playlistname = ' + playlistname);
    console.log('userids = ' + objetosGlobales[position].userid);

    objetosGlobales[position].mensaje = "nuevo_playlist";    

    var uris1 = [], uris2 = [];     

        /*Si el playlist ID todavía no existe, significa que este será guardado por primera vez en Spotify por el usuario*/
        if(objetosGlobales[position].playlist_id == undefined){
            
            console.log('Guardando nuevo playlist de Pool')

        /*Se manda a llamar el endpoint para guardar plalists en Spotify con el id del usuario y el nombre del Playlist*/
        objetosGlobales[0].spotifyApi.createPlaylist(objetosGlobales[position].userid, playlistname, { 'public' : false })
            .then(function(data) {
                console.log('Se creó el playlist, falta llenarlo de canciones');
                console.log('data', data);

                /*Una vez creado el playlist, es tiempo de llenarlo con canciones. Para esto se toma el objeto playlist de objetosGlobales[usuario] que fue creado en el poolAlgoritmo*/
                objetosGlobales[position].playlist.forEach(function(records, index){
                    /*Es necesario crear 2 arreglos intermedios para hacer 2 request correspondientes a la creación de 2 procesos de guardado en serie. Estos son requerimientos y limitaciones de la API de Spotify*/
                    if(index < 50){
                     uris1[index] = records    
                    }else{
                     uris2[index-50] = records    
                    }
                });

                /*console.log("uris1 =", uris1);
                console.log("uris2 =", uris2);*/


                /*Se guarda el ID del playlist recién creado para procesos más adelante*/
                var playlist_id = data.body.id; 
                objetosGlobales[position].playlist_id = data.body.id;

                 console.log("info para agregar tracks a playlist: \n", "userids: ", objetosGlobales[position].userid,  "\n",
                    "data.body.id: ", data.body.id, "\n", 
                    "uris2: ", uris1 )

                // Se utiliza la API de Spotify para guardar el el primero grupo de 50 canciones en Spotify
                objetosGlobales[0].spotifyApi.addTracksToPlaylist(objetosGlobales[position].userid, data.body.id, uris1)
                  .then(function(data) {
                     console.log('Added tracks to playlist ! paso #1');
                     console.log('data', data);

                         console.log("info para agregar tracks a playlist: \n", "userids: ", objetosGlobales[position].userid,  "\n",
                            "data.body.id: ", playlist_id, "\n", 
                            "uris2: ", uris2 )

                         /*En caso de que todo el playlist haya sido guardado en el primer arreglo intermedio, entonces se omite el proceso guardar el segundo arreglo intermedio*/
                        if(objetosGlobales[position].playlist.length > 50){
                                /*Una vez guardado el primer grupo de canciones se procede con el siguiente grupo de canciones*/
                             objetosGlobales[0].spotifyApi.addTracksToPlaylist(objetosGlobales[position].userid, playlist_id, uris2)
                                  .then(function(data) {
                                    console.log('Added tracks to playlist paso #2!');
                                    console.log('data', data);
                                   console.log('Creación de playlist exitosa')
                                    /*Una vez guardado los 2 grupos de canciones se envía el mensaje al cliente de que el playlist se ha guardado*/
                                    res.send('playlistGuardado');
                                  }, function(err) {
                                    /*En caso de que el segundo grupo de canciones del playlist falle en guardar se manda el mensaje de que se guardó el playlist (las primeras 50 canciones)*/
                                    console.log('Error al momento de agregar segundos 50 tracks a playlist. paso #2', err);
                                    res.send(err)
                                    res.send('ERRORORIGEN')
                                  });
                        } 

                      }, function(err) {
                        console.log('Error al momento de agregar primeras 50 tracks a playlist. paso #1', err);
                        res.send(err)
                        res.send('ERRORORIGEN')
                        })

            },function(error){
                console.log(error);
                /*Error al crear playlist en Spotify*/
                res.send(error)
                res.send('ERRORORIGEN')
            });

        }else{
            /*En caso de que el playlist ya exista en la cuenta del usuario, este proceso actualiza los tracks por los nuevos que se encuentran desplegados en ese momento en la interfaz. Este proceso puede funcionar con 100 tracks a la vez.*/
            
            console.log('Actualizando playlist')
            
            var options = { method: 'PUT',
                  url: 'https://api.spotify.com/v1/users/'+objetosGlobales[position].userid+'/playlists/'+objetosGlobales[position].playlist_id+'/tracks',
                  headers: { 
                      'Authorization': 'Bearer ' + objetosGlobales[position].access_token,
                       'Content-Type': 'application/json' 
                  },
                    body: {
                        'uris': objetosGlobales[position].playlist
                    },
                  json: true };

                /*Establecimiento de comunicacion con API*/
                request(options, function (error, response, body, status) {
                  if (error == true) {
                    console.log("No se pudo guardar el playlist - status de error-> ", status)
                    res.send('ERRORORIGEN')  
                  }else{
                    /*En caso de que no exista el error, se envía mensaje de actualizacion exitosa a cliente*/
                    console.log('Actualizacion de playlist exitosa')
                    console.log(body)
                    console.log("status -> ", status)
                    res.send('ActualizacionPlaylist') 
                  }
                });
        }
}
    
  });


//Finaliza proceso
module.exports = router;
