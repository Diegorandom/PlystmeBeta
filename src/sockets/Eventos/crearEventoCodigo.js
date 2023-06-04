var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const crearEventoCodigo = (socket) => {
    socket.on('crearEventoCodigo', function (msg, codigoEvento) {
        console.log('Evento creado por Código')
        console.log('Id del host -> ', msg.userId)
        var userId = msg.userId

        if (userId != undefined) {
            /*Se crea registro del evento en BD*/
            let eventCodeCreationErrorCounter = 0
            const createCodeEvent = () => {
                // eslint-disable-next-line no-undef
                const promesaCrearEvento = objetosGlobales[0].session[0]
                    .writeTransaction(tx => tx.run('MATCH (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (m)-[:Host {status:true}]->(n:Evento {codigoEvento:{codigoEvento}, status:true}) Return n,m', { codigoEvento: codigoEvento, spotifyidUsuario: userId }))

                promesaCrearEvento
                    .then(function (evento) {
                        console.log('Registro de Evento -> ', evento.records[0]._fields)

                        var usuarios = [];

                        evento.records[0]._fields.forEach(function (item, index) {
                            var nombre = item.properties.nombre;
                            var imagen = item.properties.imagen_url
                            var id = item.properties.spotifyid

                            if (nombre == undefined && id != undefined && index != 0) {
                                usuarios.push([id, imagen])
                            } else if (index != 0) {
                                usuarios.push([nombre, imagen])
                            }

                            if (evento.records[0]._fields.length == index + 1) {
                                console.log('Usuarios en evento -> ', usuarios)
                                io.to(socket.id).emit('eventoCreadoCodigo', { codigoEvento: codigoEvento, userId: userId, usuarios: usuarios })
                            }

                        })


                        /*JOIN crea el room cuyo ID será el código del evento*/
                        socket.join(codigoEvento);

                    })

                promesaCrearEvento
                    .catch(function (err) {
                        console.log(err);
                        eventCodeCreationErrorCounter++;
                        if (eventCodeCreationErrorCounter > 5) {
                            eventCodeCreationErrorCounter = 0
                            io.to(socket.id).emit('errorCrearEvento')
                        } else {
                            createCodeEvent();
                        }

                    })
            }
            createCodeEvent();

        } else {
            console.log(" Error = userId -> ", userId, "msg.posicion ->", msg.posicion)
        }

    });
}

module.exports = crearEventoCodigo