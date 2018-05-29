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
                var repetido = false
                  
            if(objetosGlobales[position].usuarios.length == 0){
                console.log('El primer usuario se guarda solo')
                if(item.nombre == undefined && item.userid != undefined){
                    item.nombre = item.userid
                    objetosGlobales[position].usuarios[index-1] = [item.nombre,item.imagen_url]
                }else if(item.nombre != undefined){
                    objetosGlobales[position].usuarios[index-1] = [item.nombre,item.imagen_url]
                }
                
            }else{
                console.log("usuarios ->", objetosGlobales[position].usuarios)
                objetosGlobales[position].usuarios.forEach(function(valorComparador,indice){
                    console.log('Ejecutando funcion OnlyUnique')
                    if(item.nombre != undefined && valorComparador[0] != undefined){
                        console.log('Los valores NO son Nulos')
                        if(item.nombre.toString() == valorComparador[0].toString()){
                            console.log('valor Repetido')
                            repetido = true
                        }else if((indice+1 == objetosGlobales[position].usuarios.length) && repetido == false){
                            console.log('valor nuevo -> ', item.nombre)
                            objetosGlobales[position].usuarios[index-1] = [item.nombre,item.imagen_url]
                        }   
                    }else{
                        console.log('Los valores son Nulos')
                        if(item.nombre == undefined ){
                            item.nombre = item.userid
                            if(item.nombre.toString() == valorComparador[0].toString()){
                                console.log('valor Repetido')
                                repetido = true
                            }else if((indice+1 == objetosGlobales[position].usuarios.length) && repetido == false){
                                console.log('valor nuevo -> ', item.nombre)
                                objetosGlobales[position].usuarios[index-1] = [item.nombre,item.imagen_url]
                            } 
                        }  
                    }
                 })
            }
                
                if(objetosGlobales.length == index+1){ 
                    function valorNulo(usuario){
                        if(usuario == undefined){
                            return false
                        }else{
                            return true
                        }
                    }
                    objetosGlobales[position].usuarios = objetosGlobales[position].usuarios.filter(valorNulo)
                    console.log('USUARIOS EN EL POOL GLOBAL')
                    console.log(objetosGlobales[position].usuarios)
                    
                    if(objetosGlobales[position].cambioRango==true){
                        console.log('Cambio de rango')
                        objetosGlobales[position].cambioRango = false;
                        response.send(objetosGlobales[position].seedTracks)
                        console.log("Objetos Globales del Usuario -> ",  objetosGlobales[position] )
                    }else if(objetosGlobales[position].refreshing == true){
                        console.log('Refrescando Tokens')
                        objetosGlobales[position].refreshing = false;
                        response.send("TOKEN REFRESCADO")
                        console.log("Objetos Globales del Usuario -> ",  objetosGlobales[position] )
                    }else if(objetosGlobales[position].refreshingUsers == true){
                        console.log('Refrescando usuarios en el pool')
                        console.log(objetosGlobales[position].usuarios)
                        objetosGlobales[position].refreshingUsers = false
                        response.send(objetosGlobales[position].usuarios)
                         console.log("Objetos Globales del Usuario -> ",  objetosGlobales[position] )
                    }else{
                    console.log('Cargando perfil')
                    response.render('pages/author-login.ejs', objetosGlobales[position]); 
                    console.log("Objetos Globales del Usuario -> ",  objetosGlobales[position] )
                    }
                     
                }
        }
        })
          
    }
});

//Finaliza proceso
module.exports = router;