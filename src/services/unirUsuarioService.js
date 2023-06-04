var findDatabaseEvent = require('../database/findDatabaseEvent')
var findUserResponseService = require('./findUserResponseService')

const unirUsuarioService = (session, codigoEvento, userId) => {
    findDatabaseEvent(session, codigoEvento, userId)
        .then(function (ids) {
            return findUserResponseService(ids, codigoEvento, userId)
        })
    session.close();
}


module.exports = unirUsuarioService