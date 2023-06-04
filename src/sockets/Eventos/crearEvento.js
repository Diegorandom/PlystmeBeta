var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var createEventService = require('../../services/createEventService')

const crearEvento = (socket) => {
    /*Código de creación de Evento*/

    socket.on('crearEvento', function (msg, codigoEvento) {
        console.log('Evento creado')
        console.log('Posicion del evento -> ', msg.posicion)
        console.log('Id del host -> ', msg.userId)
        console.log('Codigo del evento -> ', codigoEvento)

        var userId = msg.userId

        if (userId == undefined || msg.posicion == undefined) {
            console.log(" Error = userId -> ", userId, "msg.posicion ->", msg.posicion)
            return new Error('userId || msg.posicion are undefined')
        }

        let eventCreationErrorCounter = 0
        let evento = createEventService(
            codigoEvento,
            userId,
            msg.posiscion.lat,
            msg.posiscion.lng,
            socket
        ).catch(function (err) {
            console.log(err);
            eventCreationErrorCounter++;
            if (eventCreationErrorCounter > 5) {
                eventCreationErrorCounter = 0;
                io.to(socket.id).emit('errorCrearEvento')
            } else {
                createEventService();
            }

        })

        console.log('Registro de Evento -> ', evento.records[0]._fields)

        var usuarios = [];

        evento.records[0]._fields.forEach(function (item, index) {
            var nombre = item.properties.nombre;
            var imagen = item.properties.imagen_url
            var id = item.properties.spotifyid

            if (nombre == undefined && id != undefined && index != 0) {
                usuarios.push([id, imagen])
            } else if (index != 0) {
                usuarios.push([nombre, imagen])
            }

            if (evento.records[0]._fields.length == index + 1) {
                console.log('Usuarios en evento -> ', usuarios)
                io.to(socket.id).emit('eventoCreado', { codigoEvento: codigoEvento, userId: userId, usuarios: usuarios })
            }

        })

        /*JOIN crea el room cuyo ID será el código del evento*/
        socket.join(codigoEvento);

    });
}

module.exports = crearEvento