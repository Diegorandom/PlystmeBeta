const matchDatabaseUsuario = async (session, spotifyid) => {
    /*Se consulta si el usuario ya existe en la base de datos*/
    const id = await session
        .writeTransaction(tx => tx.run('MATCH (n:usuario) WHERE n.spotifyid={spotifyid} RETURN n', { spotifyid }))

    console.log('id ', id)

    return id

}

module.exports = matchDatabaseUsuario