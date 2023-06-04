var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const cerrarEvento = () => {
    app.post('/salirEvento', (request, response) => {
        var objetosGlobales = request.app.get('objetosGlobales');

        let position = request.sessions.position;
        var driver = request.app.get('driver')
        objetosGlobales[0].session[2] = driver.session();

        console.log('Usuario a salirse -> ', objetosGlobales[position].userid)

        const promesachecarRelacion = objetosGlobales[0].session[2]
            .writeTransaction(tx => tx.run('MATCH (e:Evento {status:true})<-[r]-(u:usuario {spotifyid:{spotifyid}}) RETURN r', { spotifyid: objetosGlobales[position].userid }))

        promesachecarRelacion
            .then(function (evento) {
                //console.log(evento)
                console.log(evento)

                if (evento.records[0] != null) {

                    var tipoRelacion = evento.records[0]._fields[0].type
                    console.log(tipoRelacion)

                    if (tipoRelacion == "Host") {

                        const promesaCaducarEvento = objetosGlobales[0].session[2]
                            .writeTransaction(tx => tx.run('MATCH (e:Evento {status:true})<-[r]-(u:usuario {spotifyid:{spotifyid}}) SET e.status = false AND r.status = false RETURN e', { spotifyid: objetosGlobales[position].userid }))

                        promesaCaducarEvento
                            .then(function (evento) {
                                console.log("Evento a salirse -> ", evento.records[0]._fields[0].properties.codigoEvento)
                                var codigoEvento = evento.records[0]._fields[0].properties.codigoEvento

                                response.send('Exito')

                                io.to(codigoEvento).emit('caducaEvento', { mensaje: "Caduca el Evento", codigoEvento: codigoEvento });


                                objetosGlobales[0].session[2].close();


                            })

                        promesaCaducarEvento
                            .catch(function (err) {
                                console.log('Error -> ', err);
                                response.send('Error')
                            })

                    } else if (tipoRelacion == "Invitado") {
                        const promesaCaducarRelacion = objetosGlobales[0].session[2]
                            .writeTransaction(tx => tx.run('MATCH (e:Evento {status:true})<-[r]-(u:usuario {spotifyid:{spotifyid}}) SET r.status=false RETURN r,e', { spotifyid: objetosGlobales[position].userid }))
                        promesaCaducarRelacion
                            .then(function (evento) {
                                console.log("Codigo Evento -> ", evento.records[0]._fields[1].properties.codigoEvento)
                                var codigoEvento = evento.records[0]._fields[1].properties.codigoEvento
                                console.log("Evento a salirse -> ", evento.records[0]._fields[0])
                                var tipoRelacion = evento.records[0]._fields[0].type
                                console.log(tipoRelacion)

                                const promesaEventoUsuario = objetosGlobales[0].session[2]
                                    .writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}, status:true})<-[{status:true}]-(u:usuario) RETURN u', { codigoEvento: codigoEvento }))

                                promesaEventoUsuario
                                    .then(function (ids) {
                                        console.log('Resultado de busqueda -> ', ids.records)

                                        if (ids.records[0] != null) {
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

                                                if (ids.records.length == usuarios.length) {
                                                    console.log('ids en evento -> ', idsEvento)
                                                    console.log('Usuarios en evento -> ', usuarios)

                                                    response.send('Exito')

                                                    /*TESTEO DE MENSAJES*/



                                                }

                                            })
                                        } else {
                                            console.log('Ya no existe el evento')
                                        }

                                        objetosGlobales[0].session[2].close();

                                    })

                                promesaEventoUsuario
                                    .catch(function (err) {
                                        console.log('Error -> ', err);
                                        response.send('Error')
                                    })

                            })

                        promesaCaducarRelacion
                            .catch(function (err) {
                                console.log('Error -> ', err);
                                response.send('Error')
                            })

                    }
                } else {
                    console.log('Ya no existe el evento')
                }

            })

        promesachecarRelacion
            .catch(function (err) {
                console.log('Error -> ', err);
                response.send('Error')
            })

    })




}

module.exports = cerrarEvento