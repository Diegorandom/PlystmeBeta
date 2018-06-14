var pos, userid;

// Note: This example requires that you consent to location sharing when
      // prompted by your browser. If you see the error "The Geolocation service
      // failed.", it means you probably did not give permission for the browser to
      // locate you.
    

var mapa = document.createElement('script')
        mapa.src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCtA2WyXGMPMY9Nk642s_bSkEEp_5tguoU"
        var contenedorMapa = document.getElementById('mapa')
        contenedorMapa.appendChild(mapa)

function btnCrear(userid){        

    console.log('Creando Evento')

    //Request de ajax para obtener userid de servidor Node.js
    $.ajax({url: '/userid', success:idCallback(userid), cache: false});

    
    function idCallback(userid){
        return function(data, status, error){


            //Control de errores
            if(error == true || data == "Error Global" || status != "success"){
                document.getElementById('nuevoPlaylist').innerHTML="Error de Servidor"
                document.getElementById('nuevoPlaylist').style.display="block"
                setTimeout(function(){
                    document.getElementById('nuevoPlaylist').style.display="none"
                    //location.reload(true);
                }, 3000);

            }else{

                userid = data

                var tipomap = "map"
                console.log("userid -> ", userid)
                creacionMapa(userid,tipomap)


            }
        }

    }
    
   

};


/*
        
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

      
*/

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
          'Error: The Geolocation service failed.' :
          'Error: Your browser doesn\'t support geolocation.');
      }




     function creacionMapa(userid,tipomap){
            userid = userid
            console.log("userid CM -> ", userid)
            console.log('Creación de mapa..')
           

                var map = new google.maps.Map(document.getElementById(tipomap), {
                  center: {lat: 19.4326018, lng: -99.1332049},
                  zoom: 18
                });
                var infoWindow = new google.maps.InfoWindow({map: map});

                // Try HTML5 geolocation.
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(function(position) {
                     pos = {
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
                    //sockets(userid, pos)
                    //console.log('se manda a llamar socket')

                  }, function() {
                    handleLocationError(true, infoWindow, map.getCenter());
                      document.getElementById('nuevoPlaylist').innerHTML="Geolocalizacion no disponible, crear evento por código"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    $('#fijarUbicacion').css("display","none");
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none";
                    }, 3000);
                      
                      
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


//Se defien var pos objeto y room string para actualizarlas constantemente 
var room = "";
var posfija = {'lat' : 0.0, 'lng' : 0.0};
var usariosdentro = null;


var socket = io();

socket.on('conexionServidor', (msg) => {
    console.log(msg)
    socket.emit('EventoConexion', {data: 'Estoy Conectado!'});
});

 function sockets(userid, pos) {
 
            console.log('userid -> ', userid  )
            console.log('pos -> ', pos)
      
            /*usersId recibe un arreglo con los usuarios que se encuentran en el evento para despues procesar esta lista en poolAlgoritmo y recibir la lista de canciones que serán procesadas en la funcion poolPlaylist para que se desplieguen en el cliente*/
     
            socket.on('usersId', function(msg){
                console.log(msg); //Para recibir la playlist
                //var playlist = msg.playlist;
                // Variable: "playlist" contiene un arreglo de usersid dentro de la fiesta "room", este arreglo cambia cuando se une un nuevo usuario a la playlist.
                /// Se ejecuta la función para mandar al pool el arreglo de los usuarios dentro del room.
                /// Playlist solo es un objeto, dentro de el mismo se toma el arreglo playlist
                
                usuariosdentro = msg.usersid;
                console.log(usuariosdentro);
                console.log('Entró un nuevo usuario');
                
                
            });
     
           /* 
            // Función para obtener el room
            socket.on('room', function(msg){
                console.log(msg.room); // la playlist, la respuesta del servidor en consola de cliente  
                room = msg.room; //coordenadas recibidas del servidor
                console.log(room);
                navigator.geolocation.getCurrentPosition(function(position) {
                    posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                console.log(pos);
                socket.emit('join', {room: room, position:pos, user:userid});                
            });
     
            // Función para saber el status de la conexión    
            socket.on('monitoreo', function(msg) {
               
                if(msg!=null){
                     navigator.geolocation.getCurrentPosition(function(position) {
                    //posString = position.coords.latitude.toString.toString() + ":" position.coords.longitude.toString();
                    //Se manda a llamar la variable pos para actualizar la ubicación
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });                
                
                socket.emit('leave', {room: room, user: userid, position: pos});                     
               }
            
                console.log(msg);
                
            });
        
        
            socket.on('my_response', function(msg) {
                
                // Cada vez que recibe un mensaje de monitoreo imprime la respuesta del servidor
                                            
                console.log(msg);  //las resuestas del servidor en consola de cliente
                var room_local = msg.room
            });
    
            

            $('#enterPool').on('click',function(event) {
                   
                /// Llamada a la posición del usuario, se manda posición en STRING y en Objeto para la comparación en el servidor.
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    //posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                console.log(pos);
                console.log('Entrando a una fiesta');
                socket.emit('getroom', {position: pos, user: userid}); //proceso para unirse a una fiesta
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
                
                socket.emit('leave', {room: room, user: userid, position: pos});//proceso para abandonar una fiesta
                return false;
            });
    
           /* $('#fijarUbicacion').on('click', function(event){
                // Recibir variables de POS FIJA de MAPA.JS para crear la fiesta.
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    //posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                //Se va a guardar posfija para eliminar fiesta
                posfija = pos;
                console.log(pos);
                socket.emit('create_party',{room: userid, position: posfija, user: userid});//proceso para crear una fiesta
                
                console.log(pos);
                socket.emit('getroom', {position: posfija, user: userid}); // entrar a la fiesta que el mismo creo
                return false;
                
                console.log(pos);
            }); 
     
     
            $('#fijarUbicacion2').on('click', function(event){
                // Recibir variables de POS FIJA de MAPA.JS para crear la fiesta. 
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    //posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                console.log(pos);
                socket.emit('create_party',{room: userid, position: pos, user:userid});//proceso para crear una fiesta                
                socket.emit('getroom', {user:userid, position:pos}); // entrar a la fiesta que el mismo creo
                return false;
            });
     
            $('#EliminarPlayslit').on('click', function(event){
                // Recibir POS FIJA de MAPA JS para eliminar la fiesta.
                /*navigator.geolocation.getCurrentPosition(function(position) {
                    //posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                console.log('se va a eliminar la fiesta');
                console.log(posfija);
                socket.emit('delete_party',{room: userid, position: posfija, user: userid});//proceso para eliminar una fiesta
                return false;
                console.log('Se elimino fiesta');
            });
     
            $('#EliminarPlayslit2').on('click', function(event){
                // Recibir POS FIJA de MAPA JS para eliminar la fiesta.
                navigator.geolocation.getCurrentPosition(function(position) {
                    //posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
                    pos = {
                        'lat' : position.coords.latitude, 
                        'lng' : position.coords.longitude
                    }
                });
                socket.emit('delete_party',{room: userid, position: pos, user: userid});//proceso para eliminar una fiesta
                return false;
                console.log('Se elimino fiesta');
            }); */
     
            
        }

function fijarUbicacion (pos,userid){
    //Request de ajax para obtener userid de servidor Node.js
    $.ajax({url: '/userid', success:idCallback(userid), cache: false});

    
    function idCallback(userid){
        return function(data, status, error){
            //Control de errores
            if(error == true || data == "Error Global" || status != "success"){
                document.getElementById('nuevoPlaylist').innerHTML="Error de Servidor"
                document.getElementById('nuevoPlaylist').style.display="block"
                setTimeout(function(){
                    document.getElementById('nuevoPlaylist').style.display="none"
                    //location.reload(true);
                }, 3000);

            }else{
                userid = data
                console.log("userid -> ", userid)

                console.log('Posición de la fiesta -> ', pos)
                
                if(pos != null && pos != undefined){
                    socket.emit('crearEvento', {posicion:pos, userId: userid});//proceso para crear una fiesta

                    socket.on('eventoCreado', function(msg){
                        console.log('Evento Creado')
                        var codigoEvento = msg.codigoEvento;
                        var userId = []

                        userId.push(msg.userId)

                        console.log('Codigo de Evento -> ', codigoEvento, "userid -> ", userId)

                        mostrarCodigo(codigoEvento);

                       $.ajax({url: '/pool?_=' + new Date().getTime(), data:{userId:userId}, success:poolPlaylist, cache: false});

                    })
                }else{
                    socket.emit('crearEventoCodigo', {userId:userid})
                    
                    socket.on('eventoCreadoCodigo', function(msg){
                        console.log('Evento Creado')
                        var codigoEvento = msg.codigoEvento;
                        var userId = []

                        userId.push(msg.userId)

                        console.log('Codigo de Evento -> ', codigoEvento, "userid -> ", userId)

                        mostrarCodigo(codigoEvento);

                       $.ajax({url: '/pool?_=' + new Date().getTime(), data:{userId:userId}, success:poolPlaylist, cache: false});

                    })
                    
                }
                
                
            }
        }
    }
    
}   



    
     function poolPlaylist(data, status, error){

        console.log(data)
        console.log(status)
        if(status === "success"){
            if(data != undefined){


            /*Proceso entrar a un pool, se configuran los botones que serán las opciones dentro del pool*/
            var botonPool = document.getElementById('btnActualizar')
            botonPool.innerHTML = "Actualizar Playlist"
            botonPool.style="width:40%; border: none; background-color:#FFF; margin:0 auto 0px auto; color:#588b8b; display:inline-block; border-radius:30px;"
            var icono = document.createElement('i')
            icono.className ="fas fa-sync-alt"
            icono.style="font-size:20px; color:#588b8b; margin-left:5px;"
            botonPool.appendChild(icono)

        document.getElementById('createPlaylist').style.display="block"

        console.log('El playlist ha cambiado')
           data.forEach(function(item,index){
               /*Se quitan las canciones viejas si es que existen*/
               if(document.getElementById("pool"+index) !== null){
                    document.getElementById("pool"+index).remove();
                    console.log("Depuración de playlist")
                    /*Despliegue de mensaje de que hay un nuevo playlist*/
                    if(index == 1){
                        console.log('cargando mensaje')
                        document.getElementById('nuevoPlaylist').style.display="block"
                        console.log(data)
                        setTimeout(function(){
                            document.getElementById('nuevoPlaylist').style.display="none"
                        }, 2000);
                    }

               }

               /*Se colocan las canciones en el playlist por primera vez */
                playlist = data

               console.log(item)
               var iDiv = document.createElement('div');
                iDiv.id = 'pool' + index;
                iDiv.className = 'col-lg-4 col-md-4 col-xs-12 col-sm-4';
                iDiv.style = "padding-left:30px; padding-right:30px; margin-bottom:10px; height:350px !important; "

                // Create the inner div before appending to the body
                var innerDiv = document.createElement('div');
                innerDiv.className = 'be-post';
                innerDiv.style = ' background-color: rgba(255,255,255,0.9) !important; color:#d5573b; max-height:400px; max-width:250px;';

                // The variable iDiv is still good... Just append to it.
                iDiv.appendChild(innerDiv);

                /*var form = document.createElement("form")
                form.method="post"
                form.action="/track/profile"
                form.id="trackprofile" */

                var boton = document.createElement("span")
                boton.className="be-img-block"
                boton.form="trackprofile"
                boton.type="submit"
                boton.name="index"
                boton.value= index
                boton.style=" -webkit-appearance: none;-webkit-border-radius: 0px; max-height:400px; max-width:250px;"

                innerDiv.appendChild(boton)

                var img= document.createElement("img")
                img.src=item[4]
                img.alt="omg"
                img.style=""

                boton.appendChild(img)

                var span = document.createElement("span")
                span.className="be-post-title"
                span.style="color:#503047; font-size:15px; font-family:'Kanit', sans-serif; height:40px;color:black;text-align:left;"

                span.innerHTML = item[0]

                innerDiv.appendChild(span)

                var span2 = document.createElement("span")
                span2.style="color:#503047; font-size:120%;max-height:20px;"
                span2.innerHTML="Popularidad: " + item[5]

                //innerDiv.appendChild(span2)

                var div2 = document.createElement("div")
                div2.className="author-post"

                innerDiv.appendChild(div2)

                var span3= document.createElement("span")
                span3.style="color:#777; font-size:120%;max-height:20px;"
                span3.innerHTML=item[2]

                div2.appendChild(span3)

                // Then append the whole thing onto the body
                document.getElementsByClassName('pool')[0].appendChild(iDiv);




               console.log('Nueva canción desplegada')

           })
           }else{
               $.get('/error', function(data, status, error){
                    console.log(data)
                    console.log(status)
                    if(status=="sucess"){
                        console.log('TOKEN REFRESCADO')
                    }else if(error ==true){
                        location.reload(true);
                    }
                })
            }
        }else{
            console.log(data);
            $.get('/error', function(data, status, error){
                console.log(data)
                console.log(status)
                if(status=="sucess"){
                    console.log('TOKEN REFRESCADO')
                }else if(error ==true){
                    location.reload(true);
                }
            })
        }

    }
            


function entrarCodigo (codigoUsuarioEvento, userid){
     //Request de ajax para obtener userid de servidor Node.js
    $.ajax({url: '/userid', success:idCallback(userid), cache: false});

    
    function idCallback(userid){
        return function(data, status, error){


            //Control de errores
            if(error == true || data == "Error Global" || status != "success"){
                document.getElementById('nuevoPlaylist').innerHTML="Error de Servidor"
                document.getElementById('nuevoPlaylist').style.display="block"
                setTimeout(function(){
                    document.getElementById('nuevoPlaylist').style.display="none"
                    //location.reload(true);
                }, 3000);

            }else{
                userid = data
                console.log("userid de usuario a entrar -> ", userid)
                console.log("codigo del evento -> ", codigoUsuarioEvento)
                socket.emit('usuarioNuevoCodigo', {codigoEvento:codigoUsuarioEvento, userId: userid});//proceso para crear una fiesta  
            }
        }
    }
    
     
    
};

  
function entrarUbicacion (userid){
    
    console.log("userid de usuario a entrar -> ", userid)

     if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
         pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        console.log("Posición del usuario ", userid, "que quiere entrar a una fiesta -> ", pos)

        socket.emit('usuarioNuevoUbicacion', {posicion:pos, userId: userid});//proceso para crear una fiesta


    }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }

                        
};

      
socket.on('usuarioEntra', function(msg){
    console.log('Usuario -> ', msg.userId, ' entró a evento -> ', msg.codigoEvento)
    var codigoEvento=msg.codigoEvento 
 
    console.log('Codigo de Evento -> ', codigoEvento)

    $.ajax({url: '/pool?_=' + new Date().getTime(), data:{userId:msg.idsEvento}, success:poolPlaylist, cache: false});
      
})

socket.on('codigoInvalido', function(msg){
    console.log('Código Invalido -> ', msg.codigoInvalido)
})

socket.on('nuevoUsuario',function(msg){
    console.log(msg.mensaje)
    console.log(msg.idsEvento)
    
    $.ajax({url: '/pool?_=' + new Date().getTime(), data:{userId:msg.idsEvento}, success:poolPlaylist, cache: false});
    
})

 ///////////////////////////////////////////////NO USADO
   /* function eliminarplaylist (){
        // Recibir POS FIJA de MAPA JS para eliminar la fiesta.
        /*navigator.geolocation.getCurrentPosition(function(position) {
            //posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
            pos = {
                'lat' : position.coords.latitude, 
                'lng' : position.coords.longitude
            }
        });
        //var namespace = '/test';

        var userid = null

        //Request de ajax para obtener userid de servidor Node.js
        $.ajax({url: '/userid', success:idEliminar, cache: false});


        function idEliminar (data, status, error) {

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



            console.log('se va a eliminar la fiesta');
            console.log(posfija);
            socket.emit('delete_party',{room: userid, position: posfija, user: userid});//proceso para eliminar una fiesta
            return false;
            console.log('Se elimino fiesta');

        }                 


        }               

    };

    $('#EliminarPlayslit2').on('click', function(event){
        // Recibir POS FIJA de MAPA JS para eliminar la fiesta.
        navigator.geolocation.getCurrentPosition(function(position) {
            //posString = position.coords.latitude.toString() + ":" + position.coords.longitude.toString();
            pos = {
                'lat' : position.coords.latitude, 
                'lng' : position.coords.longitude
            }
        });
        socket.emit('delete_party',{room: userid, position: pos, user: userid});//proceso para eliminar una fiesta
        return false;
        console.log('Se elimino fiesta');
    });
*/