/**
 * @abstract Se consulta si el usuario ya existe en la base de datos
 * 
 * @param {*} session 
 * @param {*} spotifyid 
 * @returns 
 */
const findUser = async (session, spotifyid) => {
    return await session
        .writeTransaction(tx => tx.run(
            `MATCH (n:usuario) WHERE n.spotifyid= $spotifyid RETURN n`
            , {
                spotifyid
            }))
}

module.exports = findUser