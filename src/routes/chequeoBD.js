var express = require('express');
var router = new express.Router();
var request = require('request'); // "Request" library

/*
        Pieza de control que checa si el estado de la BD cambió a guardado y pueden comenzar a requerirse las preferencias del usuario
*/

router.post('/chequeoBD', function(req, res, error) { 
	var objetosGlobales = req.app.get('objetosGlobales');
	var position = req.app.get('position');
	position = req.sessions.position;
	console.log('apuntador del objeto en preferencias', position);

    
	console.log('Se comenzó a consultar si la BD ya guardó la información');
    
	if(error == true || objetosGlobales[position] == undefined){ res.render('pages/error', {error:error});}else{
		console.log('Estado del perfil de datos del usuario ', objetosGlobales[position].bdEstado );
		res.send(objetosGlobales[position].bdEstado);
	}
                                
});
                                         
                                         

//Termina request de perfil   
                                         
    
module.exports = router;