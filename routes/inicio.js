var express = require("express");
var router = new express.Router();
var request = require("request");

router.get('/', function(req, res, error){ 
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');

 /*Esta ruta lleva a la landing page de la plataforma*/
        if(error == true){
            res.render('pages/error',{error:error})
        }else{                
            res.render('pages/autorizacion',  objetosGlobales[0]);
        }       
});

//Finaliza proceso

module.exports = router;