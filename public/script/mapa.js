

// Note: This example requires that you consent to location sharing when
      // prompted by your browser. If you see the error "The Geolocation service
      // failed.", it means you probably did not give permission for the browser to
      // locate you.
    

var mapa = document.createElement('script')
        mapa.src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCtA2WyXGMPMY9Nk642s_bSkEEp_5tguoU"
        var contenedorMapa = document.getElementById('mapa')
        contenedorMapa.appendChild(mapa)

    $('#btnCrear').on('click',function(){        
        
        
        var userid = null

        //Request de ajax para obtener userid de servidor Node.js
        $.ajax({url: '/userid', success:idCallback, cache: false});
        
     
        function idCallback(data, status, error){
    
            //Control de errores
            if(error == true || data == "Error Global" || status != "success"){
                document.getElementById('nuevoPlaylist').innerHTML="Error de Servidor"
                document.getElementById('nuevoPlaylist').style.display="block"
                setTimeout(function(){
                    document.getElementById('nuevoPlaylist').style.display="none"
                    location.reload(true);
                }, 3000);

            }else{
                var userid = data
                console.log("userid -> ", userid)
                
                var tipomap = "map"
                
                creacionMapa(userid,tipomap)

            }

        }
        
    });



        
        $('#btnCrear2').on('click',function(){
 
  
        var userid = null

        //Request de ajax para obtener userid de servidor Node.js
        $.ajax({url: '/userid', success:idCallback, cache: false});
        
     
        function idCallback(data, status, error){
    
            //Control de errores
            if(error == true || data == "Error Global" || status != "success"){
                document.getElementById('nuevoPlaylist').innerHTML="Error de Servidor"
                document.getElementById('nuevoPlaylist').style.display="block"
                setTimeout(function(){
                    document.getElementById('nuevoPlaylist').style.display="none"
                    location.reload(true);
                }, 3000);

            }else{
                var userid = data
                console.log("userid -> ", userid)
                
                 var tipomap = "map2"
                
                creacionMapa(userid,tipomap)

            }

        }        
           
    });

      

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
          'Error: The Geolocation service failed.' :
          'Error: Your browser doesn\'t support geolocation.');
      }




     function creacionMapa(userid,tipomap){
            console.log('Creación de mapa..')
           

                var map = new google.maps.Map(document.getElementById(tipomap), {
                  center: {lat: -34.397, lng: 150.644},
                  zoom: 18
                });
                var infoWindow = new google.maps.InfoWindow({map: map});

                // Try HTML5 geolocation.
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    };

                    console.log("Posición del usuario -> ", pos)
                    
                    // Construct the circle for each value in citymap.
                    // Note: We scale the area of the circle based on the population.


                    //infoWindow.setPosition(pos);
                    //infoWindow.setContent('');
                    map.setCenter(pos);
                        var image = 'img/PositionMarker.png';
                        var beachMarker = new google.maps.Marker({
                        position: pos,
                        map: map,
                        icon: image,
                        draggable: true,
                        animation: google.maps.Animation.DROP

                        }); 
                      
                     //Una vez obtenido el userid, éste se pasa a la función sockets() para que sea utilizado
                    sockets(userid, pos)

                  }, function() {
                    handleLocationError(true, infoWindow, map.getCenter());
                  });
                } else {
                  // Browser doesn't support Geolocation
                  handleLocationError(false, infoWindow, map.getCenter());
                }
            
        }

/*

Documentación SOCKETS.JS

Userid se obtiene a través de un request de AJAX con el servidor de node de forma automática en cuanto se corre por primera vez sockets.js
Desde ese momento la variable userid debe funcionar de manera global en todo el documento para su uso en los sockets

La infraestructura de los sockets se encuentra toda contenida en la función sockets(), la cual recibe como argumento el userid estraído del request de AJAX. La función sockets() se manda a llamar una vez obtenido el userid correspondiente.

*/



    
 function sockets(userid, pos) {
 
            console.log('userid -> ', userid  )
            console.log('pos -> ', pos)
     
            namespace = '/test';
            var posString = null;

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
               
                //if(msg!=null){
                //     navigator.geolocation.getCurrentPosition(function(position) {
                //    posString = position.coords.latitude.toString.toString() + ":" position.coords.longitude.toString();
                //    pos = {
                //        'lat' : position.coords.latitude, 
                //        'lng' : position.coords.longitude
                //    }
                //});
                
                socket.emit('leave', {room: posString, user:userid , position: pos});
                
               
                
            });
    
            
    
    
            socket.on('my_response', function(msg) {
                
                // Cada vez que recibe un mensaje de monitoreo, se actualiza la geolocalización y se emite por el canal del IF para verificar si aún sigue dentro de la fiesta 
                
                if(msg!=null){
                     navigator.geolocation.getCurrentPosition(function(position) {
                    posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                
                socket.emit('leave', {room: posString, user:userid , position: pos});
                }
                
                console.log(msg);  //las resuestas del servidor en consola de cliente
            });
    
    
    
            socket.on('playlist', function(msg){
                console.log(msg); // la playlist
                var playlist = msg.data;
            });

            $('#enterPool').on('click',function(event) {
                   
                /// Llamada a la posición del usuario, se manda posición en STRING y en Objeto para la comparación en el servidor.
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                
                socket.emit('join', {room: posString, user:userid, position: pos}); //proceso para unirse a una fiesta
                return false;
            });
            
    
            $('#salirPlaylist').on('click',function(event) {
                
                // Botón para salir de la playlist 
                
                 navigator.geolocation.getCurrentPosition(function(position) {
                    posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                
                socket.emit('leave', {room: posString, user:userid, position: pos});//proceso para abandonar una fiesta
                return false;
            });
    
            $('#fijarUbicacion').on('click', function(event){
                // Recibir variables de POS FIJA de MAPA.JS para crear la fiesta. 
                socket.emit('create_party',{room: pos});//proceso para crear una fiesta 
                return false;
            });
     
     
            $('#fijarUbicacion2').on('click', function(event){
                // Recibir variables de POS FIJA de MAPA.JS para crear la fiesta. 
                socket.emit('create_party',{room: pos});//proceso para crear una fiesta 
                return false;
            });
     
            $('#salirPlaylist3').on('click', function(event){
                // Recibir POS FIJA de MAPA JS para eliminar la fiesta.
                socket.emit('delete_party',{room: pos});//proceso para eliminar una fiesta
                return false;
            });
        }
