const crearDatabaseEvento = (userId, codigoEvento, latitud, longitud, session) => {
    return session
        .writeTransaction(tx => tx.run(
            'MATCH (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (m)-[:Host {status:true}]->(n:Evento {codigoEvento:{codigoEvento}, '
            + 'lat: { lat }, lng: { lng }, status: true}) Return n, m',
            { codigoEvento, lat: latitud, lng: longitud, spotifyidUsuario: userId }))
}

module.exports = crearDatabaseEvento