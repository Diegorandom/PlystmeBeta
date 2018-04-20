var express = require("express");
var router = new express.Router();
var request = require("request");

router.get('/pool', function(req, res, error){
    console.log("Llegamos al pool")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position'); 
    var pool = [];
    
    objetosGlobales.forEach(function(item, index){
        if(index != 0){
           pool.push(objetosGlobales[index].userid) 
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

            request(options, function (error, response, body) {
              if (error) throw new Error(error);

              //console.log(body);
                
              /*  body.lista_de_canciones.forEach(function(item,index){
                     objetosGlobales[position].pool.push(item)
                     
                     if(index == body.lista_de_canciones.length-1 ){
                         
                     }
                     
                }) */
                
                res.send(body.lista_de_canciones);
               
                console.log(objetosGlobales[position].pool)
                
                

            });

        }
        
    })
    
    console.log("pool")
    console.log(pool)
    
       
    
    
})

//Finaliza proceso
module.exports = router;
