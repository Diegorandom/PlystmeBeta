var createEvent = require('../database/queries/createEvent')

const createEventService = (userId, codigoEvento, latitud, longitud, session) => {
    return createEvent(
        userId,
        codigoEvento,
        latitud, longitud,
        session
    )

}

module.exports = createEventService