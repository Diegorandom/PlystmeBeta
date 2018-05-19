var express = require('express');
var router = new express.Router();
var request = require('request'); // "Request" library

/*
        CALLBACK DE SPOTIFY DESPUÉS DE AUTORIZACION
*/

router.post('/chequeoBD', function(req, res, error) { 
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = req.sessions.position;
    console.log('apuntador del objeto en preferencias', position);

    
    console.log('Se comenzó a consultar si la BD ya guardó la información')
    
    if(error == true){ res.req.sessions.position = positionrender('pages/error')}else{
        console.log("Estado del perfil de datos del usuario ", objetosGlobales[position].bdEstado )
        res.send(objetosGlobales[position].bdEstado)
    }
                                
});
                                         
                                         

 //Termina request de perfil   
                                         
    
module.exports = router;