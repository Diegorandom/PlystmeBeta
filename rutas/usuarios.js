var express = require("express");
var router = new express.Router();
var request = require("request");


/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/usuarios', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    
    if(objetosGlobales != undefined || position != undefined || objetosGlobales[position] != undefined){
        
        const promesaEventoUsuario= objetosGlobales[0].session[0]
            .writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[{status:true}]-(u:usuario) RETURN u.nombre, u.imagen_url, u.userid', { codigoEvento:codigoEvento}))
        
        promesaEventoUsuario
            .then(function(usuarios){
            
            console.log('Usuarios en evento -> ', usuarios)
            
            })
        
    }else{
        console.log('Error con variables globales...')
        res.send("Error Origen Usuarios")
    }
  
})

router.get('/userid', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    
    if(error == true || objetosGlobales == undefined || position == undefined){
        response.send('Error Global')
    }else{
        console.log("userid -> ", objetosGlobales[position].userid)
        response.send(objetosGlobales[position].userid)
    }
    
    
})

//Termina request de perfil     
module.exports = router;