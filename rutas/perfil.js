var express = require("express");
var router = new express.Router();
var request = require("request");

router.get('/perfil', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    
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
            if(index>0 && item != null){
                objetosGlobales[position].usuarios.push([item.nombre,item.imagen_url])
            }
        })
        
        /*Esta parte filtra a los usuarios repetidos en el sistema de perfil. Ya sea porque están adentro de diferentes perfiles o por cualquier otra razón que dupliqué un usuario*/
        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }
        objetosGlobales[position].usuarios = objetosGlobales[position].usuarios.filter( onlyUnique );


        response.render('pages/author-login.ejs', objetosGlobales[position]);   
    }
});

    
//Finaliza proceso
module.exports = router;