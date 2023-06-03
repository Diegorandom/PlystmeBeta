var express = require("express");
var router = new express.Router();
var request = require("request");

/*Proceso para entrar a un pool*/
router.get('/pool', function(req, res, error){
    
    console.log("Llegamos al pool")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
     
    
    if(objetosGlobales[position] != undefined){
    
    /*En caso de que el conteo de errores de la API sobrepase un threshold, se manda a la página de error para evitar consumo de recursos de servidor inútil ALV*/
    var conteoErrores = 0;
    
    /*El arreglo pool se llena con los IDs de los usuarios*/
           
    var pool = req.query.userId;
           
        console.log('Pool -> ', pool ) 
        
        /*Primer filtro para repetidos*/
        pool = pool.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })
        /*Segundo Filtrado de usuarios repetidos*/
        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }
        
        /*Asignacion de pool filtado después de segundo filtrado*/
        pool = pool.filter( onlyUnique );
        
        
        /*Comienza el proceso de requerir las recomendaciones a la API del suri*/
            console.log("pool")
            console.log(pool)
            /*Argumentos necesarios para establecer comunicación con la API del suriel*/
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
                    if (error == true || body == undefined || body.listaCanciones == null ) {
                        console.log('error en Endpoint de Pool --> ', error)
                        console.log("API dormida zzzzz");
                        /*Se vuelve a intentar la comunicación con la API después de un tiempo de espera (1 segundo)*/
                        setTimeout(function(){
                            Test(options)
                        },1000);
                        conteoErrores += 1;
                        
                        /*Si los errores en la API persisten por más de 30 segundos se manda a la pantalla de error*/
                    if(conteoErrores > 30){
                        res.send("Error")
                    }
                        
                    }else{
                        console.log("API funcionando, GRACIAS A DIOS ALV PRRO!...");	
                        console.log(body);
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
                    
                    });
            };

            /*Comienza proceso de comunicación con la API de Suriel en el endpoint del POOL*/
            Test(options);
            
      
    }else{
        error = error + 'objetosGlobales[position] -> INDEFINIDO'
        res.send('Error Origen Pool')
    }
});

//Finaliza proceso
module.exports = router;

