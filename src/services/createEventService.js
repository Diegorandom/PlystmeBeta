var crearDatabaseEvento = require('../database/crearDatabaseEvento')

const createEventService = (userId, codigoEvento, latitud, longitud, socket, session) => {
    return crearDatabaseEvento(
        userId,
        codigoEvento,
        latitud, longitud,
        session
    )

}

module.exports = createEventService