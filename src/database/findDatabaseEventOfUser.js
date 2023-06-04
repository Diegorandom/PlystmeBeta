const findDatabaseEventOfUser = (session, codigoEvento) => {
    return session
        .writeTransaction(tx => tx.run(
            'MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[{status:true}]-(u:usuario) RETURN u',
            {
                codigoEvento
            }))
}

module.exports = findDatabaseEventOfUser