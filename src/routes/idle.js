var express = require('express');
var router = new express.Router();
var request = require('request');

router.get('/idle', function(req,res,error){
	var objetosGlobales = req.app.get('objetosGlobales');
    
	if(error==true || objetosGlobales == undefined || objetosGlobales == null){
		res.render('pages/error',{error:error});
	}else{
		/*Esta funcion se llama cuando un conteo desde el cliente se termina y detona que los datos del usuario se conviertan en NULL. ES UNA DEPURACION */
		console.log('redireccionando y depurando datos');
		if(objetosGlobales != undefined||objetosGlobales[req.sessions.position] != null){
			objetosGlobales[req.sessions.position] = null;
			req.sessions.position = 0; 
			res.send('success');
		}
        
	}
    
});

//Finaliza proceso
module.exports = router;