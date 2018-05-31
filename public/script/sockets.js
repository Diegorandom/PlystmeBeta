$(document).ready(function() {
 
            namespace = '/test';
            var posString = null;
            var pos = null; 

 
            /*
            var spotifyid = "####";
            var coords_actuales = "xx:yy"
            var coords_fiesta = ''
            if (coords_actuales != coords_fiesta){
                socket.emit('leave', {room: coords_fiesta, user: spotifyid});
            }
            */


            //     http[s]://<domain>:<port>[/<namespace>]
            var socket = io.connect('https://atmos-pool.mybluemix.net'+namespace); //server
            //var socket = io.connect('http://localhost:5000'+namespace); //local

            socket.on('connect', function() {
                socket.emit('my_event', {data: 'I\'m connected!'});
            });

            socket.on('coords_fiesta', function(msg) {
                console.log(msg);  //las resuestas del servidor en consola de cliente
                var coords_fiesta = msg.data; //coordenadas recibidas del servidor
            });
    
            socket.on('monitoreo', function(msg) {
               
                 if(msg!=null){
                     navigator.geolocation.getCurrentPosition(function(position) {
                    posString = position.coords.latitude.toString.toString() + ":" position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                
                socket.emit('leave', {room: posString, user: <%=userid%>, position: pos});
                }
               
                
            });
    
    
            socket.on('my_response', function(msg) {
                
                // Cada vez que recibe un mensaje de monitoreo, se actualiza la geolocalización y se emite por el canal del IF para verificar si aún sigue dentro de la fiesta 
                
                if(msg!=null){
                     navigator.geolocation.getCurrentPosition(function(position) {
                    posString = position.coords.latitude.toString.toString() + ":" position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                
                socket.emit('leave', {room: posString, user: <%=userid%>, position: pos});
                }
                
                console.log(msg);  //las resuestas del servidor en consola de cliente
            });
    
    
    
            socket.on('playlist', function(msg){
                console.log(msg); // la playlist
                var playlist = msg.data;
            });

            $('#enterPool').onClick(function(event) {
                   
                /// Llamada a la posición del usuario, se manda posición en STRING y en Objeto para la comparación en el servidor.
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    posString = position.coords.latitude.toString.toString() + ":" position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                
                socket.emit('join', {room: posString, user: <%=userid%>, position: pos}); //proceso para unirse a una fiesta
                return false;
            });
            
    
            $('#SalirPlaylist').onClick(function(event) {
                
                // Botón para salir de la playlist 
                
                 navigator.geolocation.getCurrentPosition(function(position) {
                    posString = position.coords.latitude.toString.toString() + ":" position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                
                socket.emit('leave', {room: posString, user: <%=userid%>, position: pos});//proceso para abandonar una fiesta
                return false;
            });
    
            $('#fijarUbicacion').onClick(function(event){
                // Recibir variables de POS FIJA de MAPA.JS para crear la fiesta. 
                socket.emit('create_party',{room: $('#coordenates').val()});//proceso para crear una fiesta 
                return false;
            });
            $('#EliminarPlaylist').onClick(function(event){
                // Recibir POS FIJA de MAPA JS para eliminar la fiesta.
                socket.emit('delete_party',{room: $('#coord_delete').val()});//proceso para eliminar una fiesta
                return false;
            });
        });