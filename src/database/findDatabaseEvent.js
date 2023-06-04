const findDatabaseEvent = (session, codigoEvento) => {
    return session
        .writeTransaction(tx => tx.run(
            'MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[r {status:true}]-(u:usuario) RETURN u',
            {
                codigoEvento: codigoEvento
            }))

}

module.exports = findDatabaseEvent