var checarDatabaseUsuario = require('../database/checarDatabaseUsuario')
var checarUsuarioService = require('../services/checarUsuarioService')

const usuarioNuevoUbicacionService = (partyEvent, userId, session, usuarios) => {
    //This probably needs better parsing
    let codigoBD = partyEvent.codigoEvento;

    if (codigoBD.records[0] != undefined && codigoBD.records.length == 1) {
        var codigoEvento = codigoBD.records[0]._fields[0]

        console.log('Usuario -> ', userId, ' entró a evento -> ', codigoEvento)

        checarDatabaseUsuario(session, codigoEvento, userId)

        return {
            event: 'UsuarioSeUneEventoPorUbicacion',
            response: checarUsuarioService(usuarios, session, codigoEvento, userId),
            codigoEvento
        }

    } else if (codigoBD.records.length > 1) {
        var listaEventos = [];
        codigoBD.records.forEach(function (item) {
            listaEventos.push(item._fields)

            if (codigoBD.records.length == listaEventos.length) {

                //listaEventos -> [codigo, nombre de host, ...]

                return {
                    event: 'multiplesEventos',
                    listaEventos: listaEventos
                }
            }

        })


    } else {
        console.log('Código Inválido')
        return {
            event: 'codigoInvalido',
            codigoInvalido: codigoEvento
        }
    }

}

module.exports = usuarioNuevoUbicacionService