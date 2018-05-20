var express = require("express");
var router = new express.Router();
var request = require("request");

//timeoutID es una funcion cronometro que borra al usuario del sistema dado que este salga de la pagina sin salirse de su usuario.
var timeoutID;

router.get('/heartbeat', function(req,res, error){
     var timeoutID = req.app.get('timeoutID');
        console.log('heartbeat');
         var objetosGlobales = req.app.get('objetosGlobales');
        var position = req.app.get('position');
        position = req.sessions.position;
        console.log('apuntador del objeto', position);
    
    if(error == true || objetosGlobales[position] == undefined){
        res.render('pages/error', {error: error})
    }else{ 
       

        clearTimeout(timeoutID);

        /*timeoutID se reinicia cada vez que se llama la ruta heartbeat
        El cronometro tarda 10 minutos en activar goInactive dado que se termina el tiempo
        */
        timeoutID = setTimeout(goInactive, 1000*60*10);

        res.send('Heartbeat')

        function goInactive() {
            /*Cuando el cronometro se termina se activa la funcion y se borra el access token, el cookkie de position se reposiciona en 0, la posición neutral. */
            if(objetosGlobales.length>1 && req.sessions.position != undefined){
                position = req.sessions.position;
                /*
                Se signa el valor NULL a la posicion de la cookie req.sessions.position en objetosGlobales.
                El objetivo es que cuando ningún usuario se encuentre dentro del sistema, todas las posiciones excepto la [0] (posicion neutral) sean convertidas a NULL para que al entrar a la página de landing page, la siguiente parte del sistema al hacer el conteo de usuarios, elimine las posiciones.
                */
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