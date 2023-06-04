var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const salirSocketEvento = (socket, codigoEvento, idsEvento, usuarios) => {
    // simply use to or in (they are the same) when broadcasting or emitting (server-side)
    /*io.to(codigoEvento).emit('saleUsuario',{codigoEvento: codigoEvento, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios}); */
    /**
     * 
     * implementation:  io.on('connection', salirSocketEvento(socket));
     * */

    socket.leave(codigoEvento, (err) => {
        console.log(err)
        var rooms = Object.keys(socket.rooms);
        console.log('rooms en las que sigue el usuario -> ', rooms); // [ <socket.id>, 'room 237' ]

        // sending to all clients in 'game' room except sender
        io.to(codigoEvento).emit('saleUsuario', { codigoEvento: codigoEvento, idsEvento: idsEvento, mensaje: 'Nuevo Usuario', usuarios });

        /*socket.broadcast.to(codigoEvento).emit('saleUsuario',{codigoEvento: codigoEvento, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios});*/

    });
}

module.exports = salirSocketEvento