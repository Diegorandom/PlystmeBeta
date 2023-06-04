const addUserToDatabaseEvent = (session, userId, codigoEvento) => {
    console.log('Guardando nuevo invitado en el evento de la BD')
    return session
        .writeTransaction(tx => tx.run(
            'MATCH (m:usuario {spotifyid:{spotifyidUsuario}}), '
            + '(n: Evento { codigoEvento: { codigoEvento } }) '
            + 'CREATE p = (m) - [r: Invitado { status: true }] -> (n) Return p',
            { spotifyidUsuario: userId, codigoEvento: codigoEvento }))
}

module.exports = addUserToDatabaseEvent