const matchDatabaseUsuario = (session, spotifyid) => {

    /*Se consulta si el usuario ya existe en la base de datos*/
    const matchDatabaseUsuario = session
        .writeTransaction(tx => tx.run('MATCH (n:usuario) WHERE n.spotifyid={spotifyid} RETURN n', { spotifyid }))

    matchDatabaseUsuario.then(function (checkid_result) {
        console.log('se realizó la consulta a la base de datos')

        console.log('checkid_result.length:');
        console.log(checkid_result.records.length)
        return checkid_result;
    })

    matchDatabaseUsuario.catch(function (err) {
        console.log(err);
        return undefined
    })
}

module.exports = matchDatabaseUsuario