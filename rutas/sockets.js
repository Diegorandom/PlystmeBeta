var express = require('express')
//make sure you keep this order
var router = new express.Router();

console.log('Llegamos ruta de sockets #1')


router.use('/perfil', function (req, res, next) { 
    
    console.log('Llegamos ruta de sockets #2')
    
    var io = req.app.get('io');

    io.on('connection', function(socket){
        console.log('a user connected');
      
        socket.on('disconnect', function(){
            console.log('user disconnected');
          });

        socket.on('EventoConexion', function(mensaje){
            console.log(mensaje.data)
        });
        
        io.emit('conexionServidor', 'Mensaje de prueba de servidor a cliente')
      
        socket.on('crearEvento', function(msg){
            console.log("Creando Evento")
            console.log('Posicion del evento -> ', msg.posicion)    
            console.log('Id del host -> ', msg.userId)    
        });
        
    });
    
    next();
    
})

router.use('/userid', function(req, res, next){
    var io = req.app.get('io');

})
    
//Finaliza proceso
module.exports = router;