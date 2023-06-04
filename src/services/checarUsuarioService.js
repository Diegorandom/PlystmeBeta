var findDatabaseEventOfUser = require('../database/findDatabaseEventOfUser')
var addUserToDatabaseEvent = require('../database/addUserToDatabaseEvent')

const checarUsuarioService = (usuarioId, session, codigoEvento, userId) => {

    console.log('usarioId -> ', usuarioId)
    if (usuarioId.records[0] == undefined) {

        addUserToDatabaseEvent()
            .then(function () {
                console.log('unionUsuarioEvento')
                console.log('Nuevo usuario ', userId, ' -> añadido a evento en BD-> ', codigoEvento)

                findDatabaseEventOfUser(session, codigoEvento)
                    .then().catch(function (err) {
                        return new Error(err)
                    })
            })

    } else {
        console.log('El usuario ya está registrado en el evento de la BD')

        // eslint-disable-next-line no-undef
        addUserToDatabaseEvent(
            session,
            userId,
            codigoEvento
        )
            .then()

    }
}

module.exports = checarUsuarioService