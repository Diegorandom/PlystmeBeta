const unirUsuarioService = require('./unirUsuarioService')
const multiplesEvents = require('./multipleEventsService')
const checarDatabaseUsuario = require('./../database/checarDatabaseUsuario')
const addUserToDatabaseEvent = require('./../database/addUserToDatabaseEvent')
const findDatabaseEvent = require('./../database/findDatabaseEvent')
const findUserResponseService = require('./findUserResponseService')

const checkEventPositionService = (codigoBD, userId, session) => {
    console.log("codigoBD -> ", codigoBD)

    if (codigoBD.records[0] != undefined && codigoBD.records.length == 1) {
        var codigoEvento = codigoBD.records[0]._fields[0]

        console.log('Usuario -> ', userId, ' entró a evento -> ', codigoEvento)

        checarDatabaseUsuario(session, codigoEvento, userId)
            .then(function (usuarioId) {

                console.log('usarioId -> ', usuarioId)
                if (usuarioId.records[0] == undefined) {
                    console.log('Guardando nuevo invitado en el evento de la BD')

                    addUserToDatabaseEvent()
                        .then(function () {
                            console.log('unionUsuarioEvento')
                            console.log('Nuevo usuario ', userId, ' -> añadido a evento en BD-> ', codigoEvento)

                            let ids = findDatabaseEvent(session, codigoEvento)

                            return findUserResponseService(ids, codigoEvento, userId)
                        })

                    session.close();

                } else {
                    console.log('El usuario ya está registrado en el evento de la BD')
                    return unirUsuarioService(session, codigoEvento, codigoEvento);
                }

            })



    } else if (codigoBD.records.length > 1) {
        return multiplesEvents(codigoBD);
    } else {
        console.log('Código Inválido')
        return {
            event: 'codigoInvalido',
            codigoInvalido: codigoEvento
        }
    }
}


module.exports = checkEventPositionService