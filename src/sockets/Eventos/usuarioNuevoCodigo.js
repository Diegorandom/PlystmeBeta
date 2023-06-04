var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const usuarioNuevoCodigo = (socket) => {
    /*
    multi rooms
    https://gist.github.com/crtr0/2896891
    */
    socket.on('usuarioNuevoCodigo', function (msg, codigoEvento) {
        console.log('Cookies via Socket ->', socket.request.headers.cookie)
        console.log('Position via Socket ->', socket.request.position)
        console.log('Un nuevo usario se quiere unir a un evento por código')
        console.log('Codigo del evento - ', msg.codigoEvento)
        console.log('UserId del usuario que quiere entrar - ', msg.userId)
        codigoEvento = msg.codigoEvento;
        var userId = msg.userId
        // eslint-disable-next-line no-undef
        const promesaChecarEvento = objetosGlobales[0].session[0]
            .writeTransaction(tx => tx.run('MATCH (n:Evento) WHERE n.codigoEvento={codigoEvento} AND n.status=true RETURN n.codigoEvento', { codigoEvento: codigoEvento }))

        promesaChecarEvento
            .then(function (codigoBD) {
                console.log('Resultado de búsqueda de código en BD ->', codigoBD.records[0])
                if (codigoBD.records[0] != undefined) {
                    console.log('Usuario -> ', userId, ' entró a evento -> ', codigoEvento)
                    socket.join(codigoEvento);

                    // eslint-disable-next-line no-undef
                    const promesachecarDatabaseUsuario = objetosGlobales[0].session[0]
                        .writeTransaction(tx => tx.run('MATCH (n:Evento {codigoEvento:{codigoEvento}})<-[]-(u:usuario)  WHERE u.spotifyid={spotifyidUsuario} RETURN u.spotifyid', { codigoEvento: codigoEvento, spotifyidUsuario: userId }))

                    promesachecarDatabaseUsuario
                        .then(function (usuarioId) {

                            if (usuarioId.records[0] == undefined) {

                                console.log('Guardando nuevo invitado en el evento de la BD')

                                // eslint-disable-next-line no-undef
                                const promesaNuevoUsuario = objetosGlobales[0].session[0]
                                    .writeTransaction(tx => tx.run('MATCH (m:usuario {spotifyid:{spotifyidUsuario}}), (n:Evento {codigoEvento:{codigoEvento}}) CREATE p=(m)-[r:Invitado {status:true}]->(n) Return p', { spotifyidUsuario: userId, codigoEvento: codigoEvento }))

                                promesaNuevoUsuario
                                    .then(function () {
                                        console.log('unionUsuarioEvento')
                                        console.log('Nuevo usuario ', userId, ' -> añadido a evento en BD-> ', codigoEvento)

                                        // eslint-disable-next-line no-undef
                                        const promesaEventoUsuario = objetosGlobales[0].session[0]
                                            .writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[{status:true}]-(u:usuario) RETURN u', { codigoEvento: codigoEvento }))

                                        promesaEventoUsuario
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

                                                    if (ids.records.length == usuarios.length) {
                                                        console.log('Room a actualizar -> ', codigoEvento)
                                                        console.log('Usuarios en evento -> ', usuarios)
                                                        console.log('Ids en evento -> ', idsEvento)

                                                        io.to(codigoEvento).emit('usuarioEntra', { codigoEvento: codigoEvento, userId: userId, idsEvento: idsEvento, mensaje: 'Nuevo Usuario', usuarios: usuarios });


                                                    }

                                                    // eslint-disable-next-line no-undef
                                                    objetosGlobales[0].session[0].close();

                                                })


                                            })
                                        promesaNuevoUsuario
                                            .catch(function (err) {
                                                console.log(err);
                                                io.to(socket.id).emit('errorNuevoUsuario')

                                            })

                                    })

                                promesaNuevoUsuario
                                    .catch(function (err) {
                                        console.log(err);
                                        io.to(socket.id).emit('errorNuevoUsuario')
                                    })
                                promesaNuevoUsuario
                                    .catch(function (err) {
                                        console.log(err);
                                        io.to(socket.id).emit('errorchecarEvento')
                                    })

                            } else {
                                console.log('El usuario ya está registrado en el evento de la BD')

                                // eslint-disable-next-line no-undef
                                const promesaUnirUsuario = objetosGlobales[0].session[0]
                                    .writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[r]-(u:usuario {spotifyid:{userId}}) SET r.status = true RETURN u', { codigoEvento: codigoEvento, userId: userId }))

                                promesaUnirUsuario
                                    .then(function () {

                                        // eslint-disable-next-line no-undef
                                        const promesaEventoUsuario = objetosGlobales[0].session[0]
                                            .writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[r {status:true}]-(u:usuario) RETURN u', { codigoEvento: codigoEvento }))

                                        promesaEventoUsuario
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

                                                    if (ids.records.length == usuarios.length) {
                                                        console.log('Room a actualizar -> ', codigoEvento)
                                                        console.log('Usuarios en evento -> ', usuarios)
                                                        console.log('Ids en evento -> ', idsEvento)

                                                        io.to(codigoEvento).emit('usuarioEntra', { codigoEvento: codigoEvento, userId: userId, idsEvento: idsEvento, mensaje: 'Nuevo Usuario', usuarios: usuarios });
                                                    }



                                                })
                                                // eslint-disable-next-line no-undef
                                                objetosGlobales[0].session[0].close();

                                            })
                                        promesaEventoUsuario
                                            .catch(function (err) {
                                                console.log(err);
                                                io.to(socket.id).emit('errorNuevoEventoUsuario')
                                            })
                                    })

                                promesaUnirUsuario
                                    .catch(function (err) {
                                        console.log(err);
                                        io.to(socket.id).emit('errorUnirUsuario')
                                    })


                            }

                        })



                } else {
                    console.log('Código Inválido')
                    io.to(socket.id).emit('codigoInvalido', { codigoInvalido: codigoEvento });
                }
            })

        promesaChecarEvento
            .catch(function (err) {
                console.log(err);
                io.to(socket.id).emit('errorchecarEvento')
            })


    })
}

module.exports = usuarioNuevoCodigo