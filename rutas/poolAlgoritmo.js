var express = require("express");
var router = new express.Router();
var request = require("request");

/*Proceso para entrar a un pool*/
router.get('/pool', function(req, res, error){
    console.log("Llegamos al pool")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = req.sessions.position;
    
    /*En caso de que el conteo de errores de la API sobrepase un theshold, se manda a la página de error para evitar consumo de servidor inútil ALV*/
    var conteoErrores = 0;
    
    /*El arreglo pool se llena con los IDs de los usuarios*/
    var pool = [];
    objetosGlobales.forEach(function(item, index){
        if(index != 0 && objetosGlobales[index] != null){
              pool.push(objetosGlobales[index].userid)
              pool = pool.filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
              })
        }
        
        /*Cuando el index del forEach esté en su última posición, es decir todos los IDs han sido guardados, entonces se comienza el proceso de requerir las recomendaciones a la API del suri*/
        if(index == objetosGlobales.length-1){
            
            /*Argumentos necesarios para establecer comunicación co la API del suriel*/
              var options = { method: 'POST',
              url: 'https://atmos-algorithm.mybluemix.net/api/v1/dynamic_playlist/dynamic_playlist_search',
              headers: 
               { 'Postman-Token': '375407cd-0b49-4974-bb5b-6b4f2f42a22d',
                 'Cache-Control': 'no-cache',
                 'Content-Type': 'application/json' },
              body: { spotifyid: pool  },
              json: true };

            /*Funcion que manda a llamar la API */
            function Test(options){
                request(options, function (error, response, body) {
                    /*En caso de que haya errores en el requerimiento se manda el error a la consola*/
                    if (error == true || body.listaCanciones == null) {
                        console.log('error en Endpoint de Pool --> ', error)
                        console.log("API dormida zzzzz");
                        /*Se vuelve a intentar la comunicación con la API después de un tiempo de espera (1 segundo)*/
                        setTimeout(function(){
                            Test(options)
                        },1000);
                        conteoErrores += 1;
                    }else{
                        /*En caso de que la API esté funcionando apropiadamente se llena el arreglo del pool de la posicion 0 [posicion neutral] del arreglo objetosGlobales con los IDs de los usuarios*/
                        console.log("API funcionando, GRACIAS A DIOS ALV PRRO!...");	
                        console.log(body); 
                        objetosGlobales[0].pool = pool
                        console.log(objetosGlobales)
                        console.log(body)
                        /*La lista de canciones recomendadas es enviada al cliente*/
                        console.log('Despliegue de playlist exitosa')
                        res.send(body.listaCanciones); 

                        objetosGlobales[position].playlist = []

                        /*Se guarda la lista de canciones en el arreglo playlist del objetoGlobal del usuario correspondiente. Esto se hace para después usar este objeto en caso de que sea requerido guardar este playlist en Spotify*/
                        body.listaCanciones.forEach(function(item, index){
                            objetosGlobales[position].playlist.push(item[1])
                        })

                        console.log("objetosGlobales[position].playlist")
                        console.log(objetosGlobales[position].playlist)
                    }
                    
                    /*Si los errores en la API persisten por más de 1 minuto se manda a la pantalla de error*/
                    if(conteoErrores > 60){
                        res.render('pages/error', {error: error})
                    }
                    
                    });
            };

            console.log("pool")
            console.log(pool)
            
            /*Comienza proceso de comunicación con la API de Suriel en el endpoint del POOL*/
            Test(options);
            

        }
    })
});

//Finaliza proceso
module.exports = router;

