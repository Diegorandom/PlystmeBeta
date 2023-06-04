var promesaCrearEvento = require('../database/crearEvento')

const createEventService = (userId, codigoEvento, latitud, longitud, socket, session) => {
    return promesaCrearEvento(
        userId,
        codigoEvento,
        latitud, longitud,
        session
    )

}

module.exports = createEventService