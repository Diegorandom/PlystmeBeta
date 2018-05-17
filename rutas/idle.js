var express = require("express");
var router = new express.Router();
var request = require("request");

router.get('/idle', function(req,res,error){
    if(error==true){
        res.render('pages/error',{error:error})
    }else{
        /*Esta funcion se llama cuando un conteo desde el cliente se termina y detona que los datos del usuario se conviertan en NULL */
        objetosGlobales[req.sessions.position] = null
        console.log('redireccionando y depurando datos')
        res.send("success");
        req.sessions.position = 0; 
    }
    
})

//Finaliza proceso
module.exports = router;