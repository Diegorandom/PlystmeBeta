var querystring = require('querystring');

const createDatabaseUsuario = (
    session,
    pais,
    nombre,
    email,
    external_urls,
    userid,
    followers,
    imagen_url,
    access_token,
    refresh_token,
) => {

    /*Se crea el nodo del usuario en la BD*/
    const promesaCrearUsuario = session
        .writeTransaction(tx => tx.run(
            'CREATE (n:usuario {pais:{pais}, '
            + 'nombre: { nombre }, email: { email }, '
            + 'external_urls: { external_urls }, seguidores: '
            + '{ followers }, spotifyid: { spotifyid }, imagen_url: '
            + '{ imagen_url } })',
            {
                pais: pais,
                nombre: nombre,
                email: email,
                external_urls: external_urls.spotify,
                spotifyid: userid,
                followers: followers,
                imagen_url: imagen_url
            }))

    return promesaCrearUsuario.then(function () {
        session.close();
        console.log('Se creó con éxito el nodo del usuario');

        /*Una vez terminados los procesos necesarios para renderizar la página web se redirje el proceso al perfil*/
        var preventCache = Date.now()
        console.log(preventCache)
        return '/perfil#' + querystring.stringify({
            access_token,
            refresh_token,
            preventCache: preventCache
        })

    })
}

module.exports = createDatabaseUsuario