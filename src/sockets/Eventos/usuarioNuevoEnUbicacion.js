var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const checkDatabaseEventPosition = require('../../database/checkDatabaseEventPosition');
const usuarioNuevoUbicacionService = require('../../services/usuarioNuevoUbicacionService')
const checkEventPositionService = require('../../services/checkEventPositionService');

const usuarioNuevoEnUbicacion = (
    socket,
    session,
    userId,
    usuarios
) => {
    socket.on('usuarioNuevoUbicacion', function (msg) {
        console.log('Un nuevo usuario se quiere unir a un evento por geolocalización')
        console.log('UserId del usuario que quiere entrar - ', msg.userId)
        var lat = msg.posicion.lat
        var lng = msg.posicion.lng
        //157m de radio.
        var radio = 0.001
        console.log('Latitud del usuario -> ', lat)
        console.log('Longitud del usuario -> ', lng)
        console.log('radio -> ', radio)

        let codigoBD = checkDatabaseEventPosition()

        let partyEvent = checkEventPositionService(codigoBD, userId);

        if (partyEvent.event) io.to(socket.id).emit(partyEvent.event, partyEvent);

        // run usuarioNuevoUbicacionService
        let response = usuarioNuevoUbicacionService(
            partyEvent, userId, session, usuarios
        ).catch(function (err) {
            console.log(err);
            io.to(socket.id).emit('errorchecarPosEvento')
        })

        io.to(socket.id).emit(response.event, response);
        socket.join(response.codigoEvento)

    })
}

module.exports = usuarioNuevoEnUbicacion
