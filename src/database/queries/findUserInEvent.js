/**
 * check if user is registered in an event
 * 
 * @param {*} session 
 * @param {*} codigoEvento 
 * @param {*} spotifyidUsuario 
 * @returns 
 */
const findUserInEvent = (session, codigoEvento, spotifyidUsuario) => {
    return session
        .writeTransaction(tx => tx.run(
            'MATCH (n:Evento {codigoEvento:$codigoEvento})<-[]-(u:usuario)  '
            + 'WHERE u.spotifyid = $spotifyidUsuario RETURN u.spotifyid',
            {
                codigoEvento,
                spotifyidUsuario
            }))

}

module.exports = findUserInEvent