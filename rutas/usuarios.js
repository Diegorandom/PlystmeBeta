var express = require("express");
var router = new express.Router();
var request = require("request");


/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/usuarios', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    
    objetosGlobales[position].refreshingUsers = true;
    response.redirect('/perfil')
    
})

router.get('/userid', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    
    if(error == true || objetosGlobales == undefined || position == undefined){
        response.send('Error Global')
    }else{
        response.send(objetosGlobales[position].userid)
    }
    
    
})

//Termina request de perfil     
module.exports = router;