var findEvent = require('../database/queries/findEvent')
var addUserToEvent = require('../database/queries/addUserToEvent')
const unirUsuario = require('./unirUsuarioService')

const checarUsuarioService = (usuarios, session, codigoEvento, userId) => {

    console.log('usarioId -> ', usuarios)
    if (usuarios.records[0] == undefined) {

        addUserToEvent(session, userId, codigoEvento)
            .then(function () {
                console.log('unionUsuarioEvento')
                console.log('Nuevo usuario ', userId, ' -> añadido a evento en BD-> ', codigoEvento)

                findEvent(session, codigoEvento)
                    .then().catch(function (err) {
                        return new Error(err)
                    })
            })

    } else {
        console.log('El usuario ya está registrado en el evento de la BD')

        // eslint-disable-next-line no-undef
        addUserToEvent(
            session,
            userId,
            codigoEvento
        )

        let response = unirUsuario(session, codigoEvento, userId);

        if (response.ids.records.length == response.usuarios.length) {
            console.log('Room a actualizar -> ', codigoEvento)
            console.log('Usuarios en evento -> ', response.usuarios)
            console.log('Ids en evento -> ', response.idsEvento)

            return {
                codigoEvento: codigoEvento,
                userId: userId, idsEvento: response.idsEvento,
                mensaje: 'Nuevo Usuario',
                usuarios: response.usuarios
            }
        }
    }
}

module.exports = checarUsuarioService