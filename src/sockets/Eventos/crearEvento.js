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

        createEventService(
            codigoEvento,
            userId,
            msg.posiscion.lat,
            msg.posiscion.lng,
            socket
        );
        /*JOIN crea el room cuyo ID será el código del evento*/
        socket.join(codigoEvento);

    });
}

module.exports = crearEvento