var findDatabaseEvent = require('../database/findDatabaseEvent')

const unirUsuario = (session, codigoEvento, userId) => {
    findDatabaseEvent(session, codigoEvento, userId)
        .then(function (ids) {
            console.log('Resultado de busqueda -> ', ids.records)

            var idsEvento = []
            var usuarios = []

            ids.records.forEach(function (item) {
                console.log('item -> ', item._fields)

                idsEvento.push(item._fields[0].properties.spotifyid)

                var nombre = item._fields[0].properties.nombre;
                var imagen = item._fields[0].properties.imagen_url
                var id = item._fields[0].properties.spotifyid

                if (nombre == undefined && id != undefined) {
                    usuarios.push([id, imagen])
                } else {
                    usuarios.push([nombre, imagen])
                }

                return {
                    ids,
                    codigoEvento: codigoEvento,
                    userId, idsEvento: idsEvento,
                    mensaje: 'Nuevo Usuario',
                    usuarios: usuarios
                }
            })
            // eslint-disable-next-line no-undef
            session.close();

        }).catch(function (err) {
            console.log(err);
            return new Error(err)
        })
}


module.exports = unirUsuario