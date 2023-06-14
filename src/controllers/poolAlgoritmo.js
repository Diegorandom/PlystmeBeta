var express = require("express");
var router = new express.Router();
var getAlgorithmRecommendation = require('../https/httpsClient')
/*Proceso para entrar a un pool*/
router.get('/pool', async (req, res) => {

    console.log("Llegamos al pool")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');


    if (objetosGlobales[position] == undefined) {
        res.send('Error Origen Pool')
    }

    /*En caso de que el conteo de errores de la API sobrepase un threshold, se manda a la página de error para evitar consumo de recursos de servidor inútil ALV*/
    /*El arreglo pool se llena con los IDs de los usuarios*/

    var pool = req.query.userId;

    console.log('Pool -> ', pool)

    /*Primer filtro para repetidos*/
    pool = pool.filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
    })
    /*Segundo Filtrado de usuarios repetidos*/
    const onlyUnique = (value, index, self) => {
        return self.indexOf(value) === index;
    }

    /*Asignacion de pool filtado después de segundo filtrado*/
    pool = pool.filter(onlyUnique);


    /*Comienza el proceso de requerir las recomendaciones a la API del suri*/
    console.log("pool")
    console.log(pool)
    /*Argumentos necesarios para establecer comunicación con la API del suriel*/
    var options = {
        method: 'POST',
        url: 'https://atmos-algorithm.mybluemix.net/api/v1/dynamic_playlist/dynamic_playlist_search',
        headers:
        {
            'Postman-Token': '375407cd-0b49-4974-bb5b-6b4f2f42a22d',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
        },
        body: { spotifyid: pool },
        json: true
    };

    /*Comienza proceso de comunicación con la API de Suriel en el endpoint del POOL*/
    let response = await getAlgorithmRecommendation(options, objetosGlobales[position].playlist ? objetosGlobales[position].playlist : []);
    objetosGlobales[position].playlist = response.playlist
    res.send(response.send)

});

//Finaliza proceso
module.exports = router;

