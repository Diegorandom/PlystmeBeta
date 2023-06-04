var checarDatabaseUsuario = require('../database/checarDatabaseUsuario')
var checarUsuarioService = require('../services/checarUsuarioService')

const usuarioNuevoUbicacionService = (codigoBD, userId) => {
    console.log("codigoBD -> ", codigoBD)

    if (codigoBD.records[0] != undefined && codigoBD.records.length == 1) {
        var codigoEvento = codigoBD.records[0]._fields[0]

        console.log('Usuario -> ', userId, ' entró a evento -> ', codigoEvento)

        checarDatabaseUsuario()
            .then(checarDatabaseService())

        return codigoEvento
    } else if (codigoBD.records.length > 1) {
        //console.log(codigoBD.records[0]._fields)

        var listaEventos = [];
        codigoBD.records.forEach(function (item) {
            listaEventos.push(item._fields)

            if (codigoBD.records.length == listaEventos.length) {

                //listaEventos -> [codigo, nombre de host, ...]

                io.to(socket.id).emit('multiplesEventos', { listaEventos: listaEventos });
            }

        })


    } else {
        console.log('Código Inválido')
        io.to(socket.id).emit('codigoInvalido', { codigoInvalido: codigoEvento });
    }

}

module.exports = usuarioNuevoUbicacionService