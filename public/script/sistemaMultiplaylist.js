var pos, userid, usuarios;

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


function crearCodigo (pos,userid){
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



    
     function poolPlaylist(data, status, error){

        console.log(data)
        console.log(status)
        if(status === "success"){
            if(data != undefined){


            /*Proceso entrar a un pool, se configuran los botones que serán las opciones dentro del pool*/
            var botonPool = document.getElementById('btnActualizar')
            botonPool.innerHTML = "Actualizar Playlist"
            botonPool.style="width:40%; border: none; background-color:#FFF; margin:0 auto 0px auto; color:#588b8b; display:none; border-radius:30px;"
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
            }
        }
    }                        
};

      
socket.on('usuarioEntra', function(msg, usuarios){
    if(msg.mensaje != undefined){
        console.log(msg.mensaje)
    }
    console.log('Usuario -> ', msg.userId, ' entró a evento -> ', msg.codigoEvento)
    var codigoEvento=msg.codigoEvento 
 
    console.log('Codigo de Evento -> ', codigoEvento)

    $.ajax({url: '/pool?_=' + new Date().getTime(), data:{userId:msg.idsEvento}, success:poolPlaylist, cache: false});
      
})

socket.on('codigoInvalido', function(msg){
    console.log('Código Invalido -> ', msg.codigoInvalido)
    
    document.getElementById('nuevoPlaylist').innerHTML="No hay eventos disponibles con estos parámetros. Ingresa de nuevo o crea un nuevo evento"
        document.getElementById('nuevoPlaylist').style.display="block"
        setTimeout(function(){
            document.getElementById('nuevoPlaylist').style.display="none"
        }, 2000);
    
    $('#enterPool').css("display","inline-block");
    $('#btnCrear').css("display","inline-block");
    $('#salirPlaylist').css("display","none");
})

socket.on('nuevoUsuario',function(msg){
    console.log(msg.mensaje)
    console.log('idsEvento -> ', msg.idsEvento)
    
    $.ajax({url: '/pool?_=' + new Date().getTime(), data:{userId:msg.idsEvento}, success:poolPlaylist, cache: false});
    
    $('#mensajeNuevoUsuario').animate({width:'toggle'});
        setTimeout(function(){
            $('#mensajeNuevoUsuario').animate({width:'toggle'});
        }, 2000);
    
})

socket.on('saleUsuario',function(msg, usuarios){
    console.log(msg.mensaje)
    console.log(msg.idsEvento)
    usuarios = msg.idsEvento
    
    $.ajax({url: '/pool?_=' + new Date().getTime(), data:{userId:msg.idsEvento}, success:poolPlaylist, cache: false});
    
    $('#mensajeNuevoUsuario').animate({width:'toggle'});
        setTimeout(function(){
            $('#mensajeNuevoUsuario').animate({width:'toggle'});
        }, 2000);
    
})

  function vaciarPool() {
            
        console.log('Vamos a vaciar el pool de Escritorio')
        
        document.getElementsByClassName("pool").remove();
      
        var canvas = document.getElementById("canvas")
        var pool = document.createElement('div');
        pool.className = 'pool';
        canvas.appendChild(pool)  
        
        $.ajax({url:'/salirEvento', success:salidaExitosa, cache:false})
        
        function salidaExitosa(data, success, error){
            console.log('Salida exitosa -> ', success)
        }
      
        console.log("Depuración de playlist en escritorio")
        /*Mensaje de actualizacion de playlist*/

        console.log('cargando mensaje')
        document.getElementById('nuevoPlaylist').innerHTML="Eliminando Playlist..."
        document.getElementById('nuevoPlaylist').style.display="block"
        setTimeout(function(){
            document.getElementById('nuevoPlaylist').style.display="none"
        }, 2000);
        
    }
