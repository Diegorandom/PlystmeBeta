var express = require("express");
var router = new express.Router();
var request = require("request");

router.get('/pool', function(req, res, error){
    console.log("Llegamos al pool")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.sessions.position;
    
    var pool = [];
    
    objetosGlobales.forEach(function(item, index){
        if(index != 0 && objetosGlobales[index] != null){
           pool.forEach(function(record, index){
               
               if(record == objetosGlobales[index].userid){
                   
               }else if(index == pool.length-1){
                   pool.push(objetosGlobales[index].userid) 
               }
              
           })
        }
        
        if(index == objetosGlobales.length-1){
            
              var options = { method: 'POST',
              url: 'https://atmos-algorithm.mybluemix.net/api/v1/dynamic_playlist/dynamic_playlist_search',
              headers: 
               { 'Postman-Token': '375407cd-0b49-4974-bb5b-6b4f2f42a22d',
                 'Cache-Control': 'no-cache',
                 'Content-Type': 'application/json' },
              body: { spotifyid: pool  },
              json: true };

            function Test(options){
                request(options, function (error, response, body) {
                    if (error) {
                        Test(options);
                    }else{
                        objetosGlobales[0].pool = pool
                        console.log(objetosGlobales)
                        console.log(body)
                        res.send(body.listaCanciones); 

                         objetosGlobales[position].playlist = []

                        console.log() 

                        body.listaCanciones.forEach(function(item, index){
                            objetosGlobales[position].playlist.push(item[1])
                        })

                        console.log("objetosGlobales[position].playlist")
                        console.log(objetosGlobales[position].playlist)
                     
                    }
                    });
            };

            Test(options);
            

        }
    })
    
    console.log("pool")
    console.log(pool)
    
       
    
    
});

//ENDPOINT DE CREACION DE PLAYLIST

router.get('/create/playlist', function(req, res){
var objetosGlobales = req.app.get('objetosGlobales');
var position = req.sessions.position;
    
var playlistname = "FIESTA ATMOS"
console.log('playlistname = ' + playlistname);
console.log('userids = ' + objetosGlobales[position].userid);
    
objetosGlobales[position].mensaje = "nuevo_playlist";    
  
var uris1 = [], uris2 = [];     
    
    if(objetosGlobales[position].playlist_id == undefined){
        
    // Create a private playlist
    objetosGlobales[0].spotifyApi.createPlaylist(objetosGlobales[position].userid, playlistname, { 'public' : false })
        .then(function(data) {
            console.log('Created playlist!');
            console.log('data', data);
            objetosGlobales[position].playlist.forEach(function(records, index){
                //uris[index] = records.uri;
                if(index < 50){
                 uris1[index] = records    
                 //obj1['uris'].push(records.uri);
                }else{
                 uris2[index-50] = records    
                 //obj2['uris'].push(records.uri);   
                }
            });

            console.log("uris1 =", uris1);
            console.log("uris2 =", uris2);

           // uris1 = JSON.stringify(obj1);;

            //uris2 = JSON.stringify(obj2);
        
             var playlist_id = data.body.id; 
            objetosGlobales[position].playlist_id = data.body.id;
        
             console.log("info para agregar tracks a playlist: \n", "userids: ", objetosGlobales[position].userid,  "\n",
                "data.body.id: ", data.body.id, "\n", 
                "uris2: ", uris1 )
            
            // Add tracks to a playlist
            objetosGlobales[0].spotifyApi.addTracksToPlaylist(objetosGlobales[position].userid, data.body.id, uris1)
              .then(function(data) {
                 console.log('Added tracks to playlist ! paso #1');
                 console.log('data', data);
                    
                     console.log("info para agregar tracks a playlist: \n", "userids: ", objetosGlobales[position].userid,  "\n",
                        "data.body.id: ", playlist_id, "\n", 
                        "uris2: ", uris2 )
                                      
                     objetosGlobales[0].spotifyApi.addTracksToPlaylist(objetosGlobales[position].userid, playlist_id, uris2)
                          .then(function(data) {
                            console.log('Added tracks to playlist paso #2!');
                            console.log('data', data);
                            res.send('playlistGuardado');
                          }, function(err) {
                            console.log('Error al momento de agregar tracks a playlist paso #2', err);
                            res.send('Error al momento de agregar tracks a playlist paso #2');
                          });
                    
                  }, function(err) {
                    console.log('Error al momento de agregar tracks a playlist paso #1', err);
                    res.send('Error al momento de agregar tracks a playlist paso #2');    
       
        },function(error){
            console.log(error);
            res.send('Error al momento de agregar tracks a playlist paso #2');  
        });
           
          }, function(err) {
            console.log('Error a ', err);
            res.send('Error al momento de agregar tracks a playlist paso #2');
          });
        
    }else{
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

            request(options, function (error, response, body, status) {
              if (error) throw new Error(error);
                console.log('Actualizacion de playlist')
                console.log(body)
                console.log(status)
                res.send('ActualizacionPlaylist')
                
            });
    }
    
  });


//Finaliza proceso
module.exports = router;
