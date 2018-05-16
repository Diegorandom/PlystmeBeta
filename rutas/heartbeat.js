var express = require("express");
var router = new express.Router();
var request = require("request");

//timeoutID es una funcion cronometro que borra al usuario del sistema dado que este salga de la pagina sin salirse de su usuario.
var timeoutID;

router.get('/heartbeat', function(req,res, error){
    if(error == true){
        res.render('pages/error')
    }else{ 
        var timeoutID = req.app.get('timeoutID');
        console.log('heartbeat');
        var objetosGlobales = req.app.get('objetosGlobales');
        var position = req.app.get('position');
        position = objetosGlobales.length;
        console.log('apuntador del objeto', position);
        req.sessions.position = position;

        clearTimeout(timeoutID);

        /*timeoutID se reinicia cada vez que se llama la ruta heartbeat*/
        timeoutID = setTimeout(goInactive, 1000*60*10);

        res.send('Heartbeat')

        function goInactive() {
            /*Cuando el cronometro se termina se activa la funcion y se borra el access token, el cookkie de position se reposiciona en 0, la posición neutral. */
            if(objetosGlobales.length>1 && req.sessions.position != undefined){
                position = req.sessions.position;
                objetosGlobales[req.sessions.position] = null;
                position = 0;
                req.sessions.position = 0
                objetosGlobales[0].access_token = null
                console.log('Depuracion de datos por salida de Usuario')
                console.log(objetosGlobales) 
            }
        }
    }
})

//Finaliza proceso

module.exports = router;