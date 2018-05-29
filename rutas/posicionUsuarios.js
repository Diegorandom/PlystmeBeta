var express = require("express");
var router = new express.Router();
var request = require("request");


/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/posicionUsuarios', function(req, res, error) {
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = req.sessions.position;
    console.log('apuntador del objeto', position);
    var posicionU = req.query.pos;
    
    console.log("req.query.pos -> ", posicionU)
    
})

//Finaliza proceso
module.exports = router;