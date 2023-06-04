const checkDatabaseEventPosition = (session, lat, radio, lng) => {
    return session
        .writeTransaction(tx => tx.run(
            'MATCH (n:Evento)-[r:Host]-(u:usuario) WHERE '
            + '{ latUser } < (n.lat + { radio }) AND { latUser } > (n.lat - { radio }) AND '
            + '{ lngUser } < (n.lng + { radio }) AND { lngUser } > (n.lng - { radio }) AND '
            + 'n.status = true RETURN n.codigoEvento, u.nombre',
            {
                latUser: lat,
                radio: radio,
                lngUser: lng
            }))
}

module.exports = checkDatabaseEventPosition