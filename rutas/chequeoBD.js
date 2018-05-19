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
    
    if(error == true){ res.render('pages/error')}else{ 
        res.send(objetosGlobales[position].bdEstado)
    }
                                
});
                                         
                                         

 //Termina request de perfil   
                                         
    
module.exports = router;