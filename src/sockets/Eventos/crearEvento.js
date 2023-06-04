var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const generateRandomStringCode = require('../../utils/generateRandomStringCode');

const crearEvento = (socket) => {
    /*Código de creación de Evento*/

    socket.on('crearEvento', function (msg, codigoEvento) {
        console.log('Evento creado')
        console.log('Posicion del evento -> ', msg.posicion)
        console.log('Id del host -> ', msg.userId)
        codigoEvento = generateRandomStringCode(5);
        console.log('Codigo del evento -> ', codigoEvento)

        var userId = msg.userId

        if (userId != undefined || msg.posicion != undefined) {
            /*Se crea registro del evento en BD*/
            let eventCreationErrorCounter = 0
            const createEvent = () => {
                // eslint-disable-next-line no-undef
                const promesaCrearEvento = objetosGlobales[0].session[0]
                    .writeTransaction(tx => tx.run('MATCH (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (m)-[:Host {status:true}]->(n:Evento {codigoEvento:{codigoEvento}, lat:{lat}, lng:{lng}, status:true}) Return n,m', { codigoEvento: codigoEvento, lat: msg.posicion.lat, lng: msg.posicion.lng, spotifyidUsuario: userId }))

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
                                io.to(socket.id).emit('eventoCreado', { codigoEvento: codigoEvento, userId: userId, usuarios: usuarios })
                            }

                        })


                        /*JOIN crea el room cuyo ID será el código del evento*/
                        socket.join(codigoEvento);

                    })

                promesaCrearEvento
                    .catch(function (err) {
                        console.log(err);
                        eventCreationErrorCounter++;
                        if (eventCreationErrorCounter > 5) {
                            eventCreationErrorCounter = 0;
                            io.to(socket.id).emit('errorCrearEvento')
                        } else {
                            createEvent();
                        }

                    })
            }
            createEvent();
            /*JOIN crea el room cuyo ID será el código del evento*/
            socket.join(codigoEvento);
        } else {
            console.log(" Error = userId -> ", userId, "msg.posicion ->", msg.posicion)
        }

    });
}

module.exports = crearEvento