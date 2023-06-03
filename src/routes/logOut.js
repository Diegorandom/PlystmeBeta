var express = require("express");
var router = new express.Router();

/*PROCESO PARA QUE EL USUARIO PUEDA SALIRSE DE SU PERFIL */

router.get('/logOut', function (req, res, error) {
    console.log("Llegamos al pool")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.sessions.position;
    console.log('apuntador del objeto', position);

    if (error == true) {
        console.log('Ha ocurrido un error -> ', error)
        res.redirect('/')
    } else {
        /*Se borra la información del usuario del sistema*/
        objetosGlobales[position] = null
        console.log('Depuracion de datos por salida de Usuario')
        console.log(objetosGlobales)
        res.render('pages/autorizacion', objetosGlobales[0]);
    }
});


//Finaliza proceso
module.exports = router;