var express = require("express");
var router = new express.Router();
var request = require("request");

router.get('/perfil', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    
    if(error==true){
        response.render('pages/error',{error:error})
    }else{
        position = request.sessions.position;
        objetosGlobales[position].ref=false;
    
        console.log('apuntador del arreglo', position)
    
        console.log("objetosGlobales");
        console.log(objetosGlobales);

        objetosGlobales[position].usuarios = []

        objetosGlobales.forEach(function(item,index){
            if(index>0 && item.nombre != null){
                objetosGlobales[position].usuarios.push(item.nombre)
            }
        })


        response.render('pages/author-login.ejs', objetosGlobales[position]);   
    }
});

    
//Finaliza proceso
module.exports = router;