var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const usuarioNuevoUbicacion = (socket) => {
    socket.on('usuarioNuevoUbicacion', function (msg) {
        console.log('Un nuevo usuario se quiere unir a un evento por geolocalización')
        console.log('UserId del usuario que quiere entrar - ', msg.userId)
        var userId = msg.userId
        var lat = msg.posicion.lat
        var lng = msg.posicion.lng
        //157m de radio.
        var radio = 0.001
        console.log('Latitud del usuario -> ', lat)
        console.log('Longitud del usuario -> ', lng)
        console.log('radio -> ', radio)

        // eslint-disable-next-line no-undef
        const promesaChecarPosEvento = objetosGlobales[0].session[0]
            .writeTransaction(tx => tx.run('MATCH (n:Evento)-[r:Host]-(u:usuario) WHERE {latUser} < (n.lat+{radio}) AND {latUser} > (n.lat-{radio}) AND {lngUser} < (n.lng+{radio}) AND {lngUser} > (n.lng-{radio}) AND n.status=true RETURN n.codigoEvento, u.nombre', { latUser: lat, radio: radio, lngUser: lng }))

        promesaChecarPosEvento
            .then(function (codigoBD) {
                console.log("codigoBD -> ", codigoBD)

                if (codigoBD.records[0] != undefined && codigoBD.records.length == 1) {
                    var codigoEvento = codigoBD.records[0]._fields[0]



                    console.log('Usuario -> ', userId, ' entró a evento -> ', codigoEvento)
                    socket.join(codigoEvento);

                    // eslint-disable-next-line no-undef
                    const promesaChecarUsuario = objetosGlobales[0].session[0]
                        .writeTransaction(tx => tx.run('MATCH (n:Evento {codigoEvento:{codigoEvento}})<-[]-(u:usuario)  WHERE u.spotifyid={spotifyidUsuario} RETURN u.spotifyid', { codigoEvento: codigoEvento, spotifyidUsuario: userId }))

                    promesaChecarUsuario
                        .then(function (usuarioId) {

                            console.log('usarioId -> ', usuarioId)
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

                                                ids.records.forEach(function (item, index) {

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

                                                    if (ids.records.length == index + 1) {
                                                        console.log('Usuarios en evento -> ', usuarios)
                                                        io.to(codigoEvento).emit('usuarioEntra', { codigoEvento: codigoEvento, userId: userId, idsEvento: idsEvento, mensaje: 'Nuevo Usuario', usuarios: usuarios });

                                                        io.to(socket.id).emit('entraste');

                                                    }



                                                })
                                                // eslint-disable-next-line no-undef
                                                objetosGlobales[0].session[0].close();
                                            })

                                        promesaEventoUsuario
                                            .catch(function (err) {
                                                console.log(err);
                                                //res.send('Error EventoUsuario')
                                                io.to(socket.id).emit('errorEventoUsuario');
                                            })
                                    })

                                promesaNuevoUsuario
                                    .catch(function (err) {
                                        console.log(err);
                                        //res.send('Error nuevoUsuario')
                                        io.to(socket.id).emit('errorNuevoUsuario');

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
                                                        io.to(socket.id).emit('entraste');
                                                    }



                                                })
                                                // eslint-disable-next-line no-undef
                                                objetosGlobales[0].session[0].close();

                                            })
                                        promesaEventoUsuario
                                            .catch(function (err) {
                                                console.log(err);
                                                io.to(socket.id).emit('errorNuevoUsuario');
                                            })
                                    })

                                promesaUnirUsuario
                                    .catch(function (err) {
                                        console.log(err);
                                        io.to(socket.id).emit('errorUnirUsuario')
                                    })

                            }

                        })



                } else if (codigoBD.records.length > 1) {
                    //console.log(codigoBD.records[0]._fields)

                    var listaEventos = [];
                    codigoBD.records.forEach(function (item) {
                        listaEventos.push(item._fields)

                        if (codigoBD.records.length == listaEventos.length) {

                            //listaEventos -> [codigo, nombre de host, ...]

                            io.to(socket.id).emit('multiplesEventos', { listaEventos: listaEventos });
                        }

                    })


                } else {
                    console.log('Código Inválido')
                    io.to(socket.id).emit('codigoInvalido', { codigoInvalido: codigoEvento });
                }
            })

        promesaChecarPosEvento
            .catch(function (err) {
                console.log(err);
                io.to(socket.id).emit('errorchecarPosEvento')
            })


    })
}

module.exports = usuarioNuevoUbicacion
