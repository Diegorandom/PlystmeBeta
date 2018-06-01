var express = require("express");
var router = new express.Router();
var request = require("request");


/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/usuarios', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    
    if(objetosGlobales != undefined || position != undefined || objetosGlobales[position] != undefined){
        objetosGlobales[position].refreshingUsers = true;
        response.redirect('/perfil')
    }else{
        console.log('Error con variables globales...')
        res.send("Error Origen Usuarios")
    }
    
    
})

router.get('/userid', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    
    if(error == true || objetosGlobales == undefined || position == undefined){
        response.send('Error Global')
    }else{
        console.log("userid -> ", objetosGlobales[position].userid)
        response.send(objetosGlobales[position].userid)
    }
    
    
})

//Termina request de perfil     
module.exports = router;