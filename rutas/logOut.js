var express = require("express");
var router = new express.Router();
var request = require("request");

/*PROCESO PARA QUE EL USUARIO PUEDA SALIRSE DE SU PERFIL */

router.get('/logOut', function(req, res, error) {
    console.log("Llegamos al pool")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
     
    console.log('apuntador del objeto', position);
    
    if(error==true){
        console.log('Ha ocurrido un error -> ', error)
        res.redirect('/')
    }else{
        /*Se borra la información del usuario del sistema*/
        objetosGlobales[position] = null
        position = 0
        req.sessions.position = 0
        console.log('Depuracion de datos por salida de Usuario')
        console.log(objetosGlobales)    
        res.redirect('/')
    }
});


//Finaliza proceso
module.exports = router;