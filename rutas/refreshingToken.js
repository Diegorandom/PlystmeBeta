var express = require("express");
var router = new express.Router();
var request = require("request");


/*Se ejecuta la ruta del perfil para renderizarlo*/
router.post('/refreshingToken', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    console.log('apuntador del objeto', position);
    
    if(objetosGlobales[position] != undefined && objetosGlobales[position].refresh_token != null ){
        response.redirect('/callback')
    }else if(objetosGlobales[0] != undefined){
        response.redirect('/login')
        console.log('Refresh token es NULL')
    }else{
        response.redirect('/error')
    }    
    
})

/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/refreshingToken', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    console.log('apuntador del objeto', position);
    
    if(objetosGlobales[position] != undefined || objetosGlobales[position].refresh_token != null ){
        response.redirect('/callback')
    }else{
        response.redirect('/login')
        console.log('Refresh token es NULL')
    } 
    
})

//Finaliza proceso
module.exports = router;
