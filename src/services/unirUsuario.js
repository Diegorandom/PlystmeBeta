var findEvent = require('../database/queries/findEvent')
var findUserResponseService = require('./findUserResponseService')

const unirUsuario = (session, codigoEvento, userId) => {
    findEvent(session, codigoEvento, userId)
        .then(function (ids) {
            return findUserResponseService(ids, codigoEvento, userId)
        })
    session.close();
}


module.exports = unirUsuario