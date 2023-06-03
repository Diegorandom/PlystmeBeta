var express = require("express");
var router = new express.Router();
var querystring = require('querystring');

/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/DatosBD', function (req, res) {
  console.log('entramos a la ruta')
  var objetosGlobales = req.app.get('objetosGlobales');
  var position = req.app.get('position');

  console.log('apuntador del objeto', position);


  /*Se extrae la información de del index de importancia del usuario de nuestra BD.
   Así mismo se extrae la información del usuario de nuestra base de datos para su display 
   en la interfaz*/
  objetosGlobales[0].session
    .run('MATCH (n:track)-[r:Escuchado {rangoTiempo:{rangoTiempo}}]-(m:usuario {spotifyid:{spotifyid}}) RETURN n, r.importanciaIndex', { spotifyid: objetosGlobales[position].userid, rangoTiempo: objetosGlobales[position].rango })
    .then(function (tracks) {
      objetosGlobales[position].seedTracks = [];

      tracks.records.forEach(function (records, index) {

        console.log("Datos de nodo " + records._fields[1])

        //Index de importancia
        /*Se extrae el index de importancia de la relación entre usuarios y tracks por propiedades. 
        * Con este index de importancia se ordena la posición de cada uno de los nodos de track que 
        serán guardados en la propiedad seedTracks de objetosGlobales[position]*/

        objetosGlobales[position].seedTracks[records._fields[1] - 1] = records._fields[0].properties;


        // objetosGlobales[position].track_uri_ref2[records._fields[1]-1]= records._fields[0].properties.spotifyid;
        if (tracks.records.length == index + 1) {
          /*Una vez guardado el perfil de datos del usuario en el objeto apropiado, se redirije al perfil en la interfaz*/
          res.redirect('/perfil#' +
            querystring.stringify({
              access_token: objetosGlobales[position].access_token,
              refresh_token: objetosGlobales[position].refresh_token
            }));



        }

      })
    })
    .catch(function (err) {
      console.log(err);
      res.render('pages/error', { error: err })
    })

})

//Finaliza proceso
module.exports = router;