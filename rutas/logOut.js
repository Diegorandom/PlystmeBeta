var express = require("express");
var router = new express.Router();
var request = require("request");

router.get('/logOut', function(req, res, error) {
    if(error){
        console.log('Ha ocurrido un error -> ', error)
        res.redirect('/')
    }else{
        position = req.sessions.position;
        objetosGlobales[req.sessions.position] = null
        position = 0
        req.sessions.position = 0
        objetosGlobales[0].access_token = null
        console.log('Depuracion de datos por salida de Usuario')
        console.log(objetosGlobales)    
        res.redirect('/')
    }
});


//Finaliza proceso
module.exports = router;