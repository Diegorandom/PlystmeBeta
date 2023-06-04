const findUserResponseService = (ids, codigoEvento, userId) => {
    console.log('Resultado de busqueda -> ', ids.records)

    var idsEvento = []
    var usuarios = []

    ids.records.forEach(function (item) {

        console.log('item -> ', item._fields)

        idsEvento.push(item._fields[0].properties.spotifyid)


        console.log('Room a actualizar -> ', codigoEvento)

        var nombre = item._fields[0].properties.nombre;
        var imagen = item._fields[0].properties.imagen_url
        var id = item._fields[0].properties.spotifyid

        if (nombre == undefined && id != undefined) {
            usuarios.push([id, imagen])
        } else {
            usuarios.push([nombre, imagen])
        }

        return {
            codigoEvento: codigoEvento,
            userId: userId,
            idsEvento: idsEvento,
            mensaje: 'Nuevo Usuario',
            usuarios
        }

    })
}

module.exports = findUserResponseService