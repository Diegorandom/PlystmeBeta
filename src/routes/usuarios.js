var express = require("express");
var router = new express.Router();

/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/usuarios', function (request, response) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;

    if (objetosGlobales != undefined || position != undefined || objetosGlobales[position] != undefined) {

        const promesaEventoUsuario = objetosGlobales[0].session[0]
            .writeTransaction(tx => tx.run(
                'MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[{status:true}]-(u:usuario) RETURN u.nombre, u.imagen_url, u.userid',
                { codigoEvento: objetosGlobales[0].codigoEvento }))

        promesaEventoUsuario
            .then(function (usuarios) {

                console.log('Usuarios en evento -> ', usuarios)

            })

        promesaEventoUsuario
            .catch(function (error) {
                console.log(error)
                response.redirect('/error')
            })

    } else {
        console.log('Error con variables globales...')
        res.send("Error Origen Usuarios")
    }

})

router.get('/userid', function (request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    let position = request.sessions.position;

    if (error == true || objetosGlobales[position] == undefined) {
        console.log(error)
        console.log('error')
    } else {
        console.log("userid -> ", objetosGlobales[position].userid)
        request.sessions.position = position
        response.send(objetosGlobales[position].userid)
    }


})

//Termina request de perfil     
module.exports = router;