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
    
        objetosGlobales[position].usuarios = [];
        var usuariosRevision = []
        /*Esta parte guarda a los usuarios dentro del pool en la variable usuarios para que sean desplegados en la interfaz*/
         
        objetosGlobales.forEach(function(item,index){
            if(index!=0 && objetosGlobales[index] != null){
                
                /*Esta parte filtra a los usuarios repetidos en el sistema de perfil. Ya sea porque están adentro de diferentes perfiles o por cualquier otra razón que dupliqué un usuario*/           
                         
                /*Filtrado de usuarios repetidos*/
                
                
                
                function onlyUnique(nuevoValor) {
                console.log("usuarios ->", objetosGlobales[position].usuarios)
                objetosGlobales[position].usuarios.forEach(function(valorComparador,indice){
                console.log('corriendo revision de duplicados')
                    console.log('Ejecutando funcion OnlyUnique')
                    if(nuevoValor != undefined && valorComparador[0] != undefined){
                        console.log('Los valores NO son Nulos')
                        if(nuevoValor.toString() == valorComparador[0].toString()){
                            console.log('valor Repetido')
                            return false
                        }else if(indice+1 == objetosGlobales[position].usuarios.length){
                            return true
                        }   
                    }else{
                        console.log('Los valores son Nulos')
                        return true
                    }
                 })
                }
                  
            if(objetosGlobales[position].usuarios.length == 0){
                console.log('El primer usuario se guarda solo')
                objetosGlobales[position].usuarios[index-1] = [item.nombre,item.imagen_url]
            }
            if(onlyUnique(item.nombre) == true){
               console.log('valor No repetido ->', item.nombre )
               objetosGlobales[position].usuarios[index-1] = [item.nombre,item.imagen_url]
            }
                
                if(objetosGlobales.length == index+1){           
                    console.log('USUARIOS EN EL POOL GLOBAL')
                    console.log(objetosGlobales[position].usuarios)
                    response.render('pages/author-login.ejs', objetosGlobales[position]); 
                    }
                }
        })
          
    }
});

//Finaliza proceso
module.exports = router;