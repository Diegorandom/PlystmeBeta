var express = require("express");
var router = new express.Router();
var request = require("request");

/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/perfil', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    console.log('apuntador del objeto', position);
    
    /*Si hay error se renderiza*/
    if(error==true || objetosGlobales[position] == undefined){
        response.render('pages/error',{error:error})
    }else{
        /*Algunas configuraciones*/
        objetosGlobales[position].ref=false;
    
        console.log('apuntador del arreglo', position)
    
        console.log("objetosGlobales");
        console.log(objetosGlobales);

        objetosGlobales[position].usuarios = []
        /*Esta parte guarda a los usuarios dentro del pool en la variable usuarios para que sean desplegados en la interfaz*/
        objetosGlobales.forEach(function(item,index){
            if(index!=0 && objetosGlobales[index] != null){
                objetosGlobales[position].usuarios.push([item.nombre,item.imagen_url])
                /*Esta parte filtra a los usuarios repetidos en el sistema de perfil. Ya sea porque están adentro de diferentes perfiles o por cualquier otra razón que dupliqué un usuario*/
                function onlyUnique(value, index, self) { 
                    return self[0].indexOf(value[0]) === index;
                }
                
                objetosGlobales[position].usuarios = objetosGlobales[position].usuarios.filter( onlyUnique );
                }
        })
        console.log('USUARIOS EN EL POOL GLOBAL')
        console.log(objetosGlobales[position].usuarios)
        response.render('pages/author-login.ejs', objetosGlobales[position]);   
    }
});

    
//Finaliza proceso
module.exports = router;