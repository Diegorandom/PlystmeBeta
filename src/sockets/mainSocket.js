var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const crearEvento = require('./Eventos/crearEvento');
const crearEventoCodigo = require('./Eventos/crearEventoCodigo');
const cerrarEvento = require('../https/salirEvento');
const usuarioNuevoCodigo = require('./Eventos/usuarioNuevoCodigo');
const usuarioNuevoEnUbicacion = require('./Eventos/usuarioNuevoEnUbicacion');
const salirSocketEvento = require('./Eventos/salirSocketEvento');

const mainSocket = (
    socket,
    session,
    userId,
    usuarios
) => {

    console.log('Nueva conexión con id -> ' + socket);

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('EventoConexion', function (mensaje) {
        console.log(mensaje.data)
        console.log('Usuario conectado!')
    });

    io.emit('conexionServidor', { mensaje: 'Mensaje de prueba de servidor a cliente' })

    crearEvento(socket)

    usuarioNuevoCodigo(socket);

    crearEventoCodigo(socket);

    usuarioNuevoCodigo(socket);

    let response = usuarioNuevoEnUbicacion(
        socket,
        session,
        userId,
        usuarios
    );

    io.to(socket.id).emit('multiplesEventos', response);

    cerrarEvento().then(() => {
        salirSocketEvento(socket)
    });


}


module.exports = mainSocket