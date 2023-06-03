/* eslint-disable no-undef */

const checkUrl = require('../../utils/checkUrl');

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

var mapa = document.createElement('script')
mapa.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCtA2WyXGMPMY9Nk642s_bSkEEp_5tguoU"
var contenedorMapa = document.getElementById('mapa')
contenedorMapa.appendChild(mapa)


/*

Documentación SOCKETS.JS

Userid se obtiene a través de un request de AJAX con el servidor de node de forma automática en cuanto se corre por primera vez sockets.js
Desde ese momento la variable userid debe funcionar de manera global en todo el documento para su uso en los sockets

La infraestructura de los sockets se encuentra toda contenida en la función sockets(), la cual recibe como argumento el userid estraído del request de AJAX. La función sockets() se manda a llamar una vez obtenido el userid correspondiente.

*/


var socket = io({
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 99999
});

socket.on('conexionServidor', (msg) => {
    console.log(msg.mensaje)
    socket.emit('EventoConexion', { data: 'Estoy Conectado!' });
    $.ajax({ url: '/esHost?_=' + new Date().getTime(), success: esHost, cache: false })
});

function poolPlaylist(data, status, error) {

    console.log(data)
    console.log(status)
    if (status === "success") {
        if (data != undefined) {


            /*Proceso entrar a un pool, se configuran los botones que serán las opciones dentro del pool*/
            var botonPool = document.getElementById('btnActualizar')
            botonPool.innerHTML = "Actualizar Playlist"
            botonPool.style = "width:40%; border: none; background-color:#FFF; margin:0 auto 0px auto; color:#588b8b; display:none; border-radius:30px;"
            var icono = document.createElement('i')
            icono.className = "fas fa-sync-alt"
            icono.style = "font-size:20px; color:#588b8b; margin-left:5px;"
            botonPool.appendChild(icono)

            document.getElementById('createPlaylist').style.display = "block"
            document.getElementById('createPlaylist2').style.display = "block"

            console.log('El playlist ha cambiado')
            if (data.length > 0) {
                data.forEach(function (item, index) {
                    /*Se quitan las canciones viejas si es que existen*/
                    if (document.getElementById("pool" + index) !== null) {
                        document.getElementById("pool" + index).remove();
                        console.log("Depuración de playlist")
                        /*Despliegue de mensaje de que hay un nuevo playlist*/
                        if (index == 1) {
                            console.log('cargando mensaje')
                            /*document.getElementById('nuevoPlaylist').style.display="block"
                            console.log(data)
                            setTimeout(function(){
                                document.getElementById('nuevoPlaylist').style.display="none"
                            }, 2000);*/
                        }

                    }

                    /*Se colocan las canciones en el playlist por primera vez */
                    playlist = data

                    console.log(item)
                    var iDiv = document.createElement('div');
                    iDiv.id = 'pool' + index;
                    iDiv.className = 'col-lg-4 col-md-4 col-xs-12 col-sm-4';
                    iDiv.style = "padding-left:30px; padding-right:30px; margin-bottom:20px; height:350px !important; "

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
                    boton.className = "be-img-block"
                    boton.form = "trackprofile"
                    boton.type = "submit"
                    boton.name = "index"
                    boton.value = index
                    boton.style = " -webkit-appearance: none;-webkit-border-radius: 0px; max-height:400px; max-width:250px;"

                    innerDiv.appendChild(boton)

                    var img = document.createElement("img")
                    img.src = item[4]
                    img.alt = "omg"
                    img.style = ""

                    boton.appendChild(img)

                    var span = document.createElement("span")
                    span.className = "be-post-title"
                    span.style = "color:#503047; font-size:15px; font-family:'Kanit', sans-serif; height:40px;color:black;text-align:left;"

                    span.innerHTML = item[0]

                    innerDiv.appendChild(span)

                    var span2 = document.createElement("span")
                    span2.style = "color:#503047; font-size:120%;max-height:20px;"
                    span2.innerHTML = "Popularidad: " + item[5]

                    //innerDiv.appendChild(span2)

                    var div2 = document.createElement("div")
                    div2.className = "author-post"

                    innerDiv.appendChild(div2)

                    var span3 = document.createElement("span")
                    span3.style = "color:#777; font-size:120%;max-height:20px;"
                    span3.innerHTML = item[2]

                    div2.appendChild(span3)

                    // Then append the whole thing onto the body
                    document.getElementsByClassName('pool')[0].appendChild(iDiv);




                    console.log('Nueva canción desplegada')

                })
            } else {
                console.log("Las rolas todavia no estan listas")
            }


        } else {

            $.ajax({ url: '/error?_=' + new Date().getTime(), success: Error, cache: false })


            console.log(data)
            console.log(status)
            if (status == "sucess") {
                console.log('TOKEN REFRESCADO')
            } else if (error == true) {
                console.log(error)
            }


        }
    } else {
        console.log(data);
        $.ajax({ url: '/error?_=' + new Date().getTime(), success: Error, cache: false })

        console.log(data)
        console.log(status)
        if (status == "sucess") {
            console.log('TOKEN REFRESCADO')
        } else if (error == true) {
            console.log(error)
        }

    }

}


function despliegueUsuarios(usuarios) {

    $('#usuariosDentro').css('display', 'block')

    console.log(usuarios)

    if (document.getElementById('contadorSpan') != null) {
        document.getElementById('contadorSpan').remove();
        document.getElementById('usuarios').remove();
        document.getElementsByClassName('imgUsuario').remove();
    }

    if (usuarios != undefined) {

        var contadorU = document.getElementById('contadorU')

        var cont = document.createElement("span")
        cont.id = "contadorSpan"
        cont.innerHTML = usuarios.length
        contadorU.appendChild(cont)

        var usuariosDentro = document.getElementById('usuariosDentro')
        var listaUsuarios = document.createElement('ul')
        listaUsuarios.id = "usuarios"
        listaUsuarios.style = "display:none; padding:5px;"
        usuariosDentro.appendChild(listaUsuarios)

        usuarios.forEach(function (usuario) {
            if (checkUrl(usuario[1]) == false) {
                console.log(usuario[1], " No válido")
                usuario[1] = false
            }


            var usuariosFotos = document.getElementById('usuariosFotos')

            if (usuario[1]) {
                var imgU = document.createElement("img")
                imgU.src = usuario[1]
                imgU.alt = "omg"
                imgU.style = "height:100%; border-radius:50%; width:20px;"
                imgU.className = "imgUsuario"
                usuariosFotos.appendChild(imgU)
            } else {
                imgU = document.createElement("img")
                imgU.src = "img/Perfil.png"
                imgU.alt = "omg"
                imgU.style = "height:100%; border-radius:50%; width:20px;"
                imgU.className = "imgUsuario"
                usuariosFotos.appendChild(imgU)
            }


            if (usuario[0] && usuario[1]) {
                var bullet = document.createElement('li')
                var imgL = document.createElement("img")
                imgL.src = usuario[1]
                imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                bullet.innerHTML = usuario[0]
                bullet.appendChild(imgL)
                listaUsuarios.appendChild(bullet)
            } else if (usuario[0]) {
                bullet = document.createElement('li')
                imgL = document.createElement("img")
                imgL.src = "img/Perfil.png"
                imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                bullet.innerHTML = usuario[0]
                bullet.appendChild(imgL)
                listaUsuarios.appendChild(bullet)
            } else if (usuario[1]) {
                bullet = document.createElement('li')
                imgL = document.createElement("img")
                imgL.src = usuario[1]
                imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                bullet.innerHTML = "Anónimo"
                bullet.appendChild(imgL)
                listaUsuarios.appendChild(bullet)
            }

        })
    }


}

function despliegueUsuarios2(usuarios) {

    $('#usuariosDentro2').css('display', 'block')

    console.log(usuarios)
    if (document.getElementById('contadorSpan2') != null) {
        document.getElementById('contadorSpan2').remove();
        document.getElementById('usuarios2').remove();
        document.getElementsByClassName('imgUsuario2').remove();
    }


    if (usuarios != undefined) {

        var contadorU = document.getElementById('contadorU2')

        var cont = document.createElement("span")
        cont.id = "contadorSpan2"
        cont.innerHTML = usuarios.length
        contadorU.appendChild(cont)

        var usuariosDentro = document.getElementById('usuariosDentro2')
        var listaUsuarios = document.createElement('ul')
        listaUsuarios.id = "usuarios2"
        listaUsuarios.style = "display:none; padding:5px;"
        usuariosDentro.appendChild(listaUsuarios)

        usuarios.forEach(function (usuario) {
            if (checkUrl(usuario[1]) == false) {
                console.log(usuario[1], " No válido")
                usuario[1] = false
            }



            var usuariosFotos = document.getElementById('usuariosFotos2')

            if (usuario[1]) {
                var imgU = document.createElement("img")
                imgU.src = usuario[1]
                imgU.alt = "omg"
                imgU.style = "height:100%; border-radius:50%; width:20px;"
                imgU.className = "imgUsuario2"
                usuariosFotos.appendChild(imgU)
            } else {
                imgU = document.createElement("img")
                imgU.src = "img/Perfil.png"
                imgU.alt = "omg"
                imgU.style = "height:100%; border-radius:50%; width:20px;"
                imgU.className = "imgUsuario2"
                usuariosFotos.appendChild(imgU)
            }


            if (usuario[0] && usuario[1]) {
                var bullet = document.createElement('li')
                var imgL = document.createElement("img")
                imgL.src = usuario[1]
                imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                bullet.innerHTML = usuario[0]
                bullet.appendChild(imgL)
                listaUsuarios.appendChild(bullet)
            } else if (usuario[0]) {
                bullet = document.createElement('li')
                imgL = document.createElement("img")
                imgL.src = "img/Perfil.png"
                imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                bullet.innerHTML = usuario[0]
                bullet.appendChild(imgL)
                listaUsuarios.appendChild(bullet)
            } else if (usuario[1]) {
                bullet = document.createElement('li')
                imgL = document.createElement("img")
                imgL.src = usuario[1]
                imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                bullet.innerHTML = "Anónimo"
                bullet.appendChild(imgL)
                listaUsuarios.appendChild(bullet)
            }

        })
    }


}

socket.on('usuarioEntra', function (msg) {

    if (document.getElementById('contadorSpan') != null) {
        document.getElementById('contadorSpan').remove()
        document.getElementById('usuarios').remove()
        document.getElementsByClassName('imgUsuario').remove()
    }

    if (msg.mensaje != undefined) {
        console.log(msg.mensaje)
    }
    console.log('Usuario -> ', msg.userId, ' entró a evento -> ', msg.codigoEvento)
    var codigoEvento = msg.codigoEvento

    console.log('Codigo de Evento -> ', codigoEvento)

    mostrarCodigo(codigoEvento);
    despliegueUsuarios(msg.usuarios);
    despliegueUsuarios2(msg.usuarios);

    $.ajax({ url: '/pool?_=' + new Date().getTime(), data: { userId: msg.idsEvento }, success: poolPlaylist, cache: false });



    $('#mensajeNuevoUsuario').animate({ width: 'toggle' });
    setTimeout(function () {
        $('#mensajeNuevoUsuario').animate({ width: 'toggle' });
    }, 2000);


})

socket.on('entraste', function () {
    $('#salirPlaylist').css("display", "block");
    $('#salirPlaylist2').css("display", "block");
})

socket.on('codigoInvalido', function (msg) {
    console.log('Código Invalido -> ', msg.codigoInvalido)

    document.getElementById('nuevoPlaylist').innerHTML = "No hay eventos disponibles con estos parámetros. Ingresa de nuevo o crea un nuevo evento"
    document.getElementById('nuevoPlaylist').style.display = "block"
    setTimeout(function () {
        document.getElementById('nuevoPlaylist').style.display = "none"
    }, 2000);

    $('#enterPool').css("display", "inline-block");
    $('#btnCrear').css("display", "inline-block");
    $('#salirPlaylist').css("display", "none");
    $('#enterPool2').css("display", "inline-block");
    $('#btnCrear2').css("display", "inline-block");
    $('#salirPlaylist2').css("display", "none");
})

socket.on('multiplesEventos', function (msg) {
    //listaEventos -> [[codigo1, nombre de host1], [codigo2, nombre de host2]]

    /*La lista de eventos es un array de 2 dimensiones, es decir tiene la siguiente estructuria, este arreglo se debe mostrar al usuario*/
    console.log("Hay varios eventos disponibles -> ", msg.listaEventos);


    /*La selección de evento del usuario debe enviarse al servidor con el siguiente socket -> 
    socket.emit('usuarioNuevoCodigo', {codigoEvento:codigoUsuarioEvento, userId: userid});//proceso para crear una fiesta */

    $('#entrar').css("display", "none");
    $('#listaEventos').css("display", "block");
    $('#regresarDeEntrar').css("display", "block");
    $('#salirPlaylist').css("display", "none");
    $('#salirPlaylist2').css("display", "none");

    $('.eventosDisponibles').remove();

    msg.listaEventos.forEach(function (item, index) {
        console.log(item + index);
        var elemento = document.createElement("div");
        var lista = document.getElementById('listaEventos');
        elemento.innerHTML = "Host: " + item[1] + "<br> Código: " + item[0];
        elemento.className = "eventosDisponibles";
        elemento.id = item[0];
        lista.appendChild(elemento);
    });

    $('.eventosDisponibles').on('click', function () {

        var codigoEvento = $(this).attr('id');
        console.log(codigoEvento);

        $.ajax({ url: '/userid?_=' + new Date().getTime(), success: idCallback(), cache: false });

        function idCallback() {
            return function (data, status, error) {

                //Control de errores
                if (error == true || data == "Error Global" || status != "success") {
                    document.getElementById('nuevoPlaylist').innerHTML = "Error de Servidor"
                    document.getElementById('nuevoPlaylist').style.display = "block"
                    setTimeout(function () {
                        document.getElementById('nuevoPlaylist').style.display = "none"
                    }, 3000);

                } else {

                    var userid = data
                    console.log("userid -> ", userid)
                    console.log("codigo evento ->", codigoEvento)

                    $('#listaEventos').css("display", "none");
                    socket.emit('usuarioNuevoCodigo', { codigoEvento: codigoEvento, userId: userid })
                    $('#salirPlaylist').css("display", "block");
                    $('#salirPlaylist2').css("display", "block");
                }
            }
        }


    })

})

socket.on('saleUsuario', function (msg) {
    console.log(msg.mensaje)
    console.log(msg.idsEvento)
    usuarios = msg.idsEvento

    console.log('Se actualiza playlist cuando un invitado sale del evento')

    despliegueUsuarios(msg.usuarios);
    despliegueUsuarios2(msg.usuarios);

    $.ajax({ url: '/pool?_=' + new Date().getTime(), data: { userId: msg.idsEvento }, success: poolPlaylist, cache: false });

    /*$('#mensajeNuevoUsuario').animate({width:'toggle'});
        setTimeout(function(){
            $('#mensajeNuevoUsuario').animate({width:'toggle'});
        }, 2000);*/

})

socket.on('caducaEvento', function (msg) {
    console.log('Se elimina evento porque Host lo decidió')
    console.log(msg.mensaje)
    console.log(msg.codigoEvento)

    if (document.getElementById('contadorSpan') != null) {
        document.getElementById('contadorSpan').remove();
        document.getElementById('usuarios').remove();
        document.getElementsByClassName('imgUsuario').remove();
    }

    vaciarPool();
    $('#btnActualizar').css("display", "none");
    $('#salirPlaylist').css("display", "none");
    $('#btnCrear').css("display", "inline-block");
    $('#enterPool').css("display", "inline-block");
    $('#usuariosDentro').css("display", "none");
    $('#createPlaylist').css("display", "none");
    $('#codigoMuestra').css("display", "none")
    $('#btnActualizar2').css("display", "none");
    $('#salirPlaylist2').css("display", "none");
    $('#btnCrear2').css("display", "inline-block");
    $('#enterPool2').css("display", "inline-block");
    $('#usuariosDentro2').css("display", "none");
    $('#createPlaylist2').css("display", "none");
    $('#codigoMuestra2').css("display", "none")
})

function vaciarPool() {

    console.log('Vamos a vaciar el pool de Escritorio')

    document.getElementsByClassName("pool").remove();

    var canvas = document.getElementById("canvas")
    var pool = document.createElement('div');
    pool.className = 'pool';
    canvas.appendChild(pool)

    console.log("Depuración de playlist en escritorio")
    /*Mensaje de actualizacion de playlist*/

    console.log('cargando mensaje')
    document.getElementById('nuevoPlaylist').innerHTML = "Eliminando playlist..."
    document.getElementById('nuevoPlaylist').style.display = "block"
    setTimeout(function () {
        document.getElementById('nuevoPlaylist').style.display = "none"
    }, 2000);

}

/* Recibir el código e imprimirlo en el front del host*/

function mostrarCodigo(codigo) {

    $('#codigoMuestra').css("display", "block");
    document.getElementById('codigoMostrado').innerHTML = codigo;

    $('#codigoMuestra2').css("display", "block");
    document.getElementById('codigoMostrado2').innerHTML = codigo;
}


//$.ajax({url:'/esHost', success:esHost, cache:false})


function esHost(data, success, error) {
    if (error == true || data == "Error checarHost" || data == "Error checarInvitado" || data == "Error Servidor") {
        if (error == true) { console.log(error) }
    } else {
        console.log('Revision exitosa -> ', success)
        console.log(data)

        if (data == false) {
            console.log('Usuario no es host, puede entrar a una playlist')


            $.ajax({ url: '/esInvitado?_=' + new Date().getTime(), success: esInvitado, cache: false })

            const esInvitado = (data, success, error) => {
                if (error == true || data == "Error checarHost" || data == "Error checarInvitado" || data == "Error Servidor") {
                    if (error == true) { console.log(error) }

                    console.log(error)
                } else {
                    console.log('Revision exitosa -> ', success)
                    console.log(data)

                    if (data == false) {

                        console.log('Usuario no es invitado, puede crear una playlist')
                    } else {

                        console.log('Usuario es host, debe ser llevado directamente a su playlist')

                        var userId = data.records[0]._fields[0].start.properties.spotifyid
                        console.log('userId -> ', userId)

                        var codigoEvento = data.records[0]._fields[0].end.properties.codigoEvento
                        console.log('Código del evento -> ', codigoEvento)
                        mostrarCodigo(codigoEvento);

                        $(this).css("display", "none");
                        $('#entrar').css("display", "none");
                        $('#enterPool').css("display", "none");
                        $('#btnCrear').css("display", "none");
                        $('#salirPlaylist').css("display", "block");
                        $('#entrar2').css("display", "none");
                        $('#enterPool2').css("display", "none");
                        $('#btnCrear2').css("display", "none");
                        $('#salirPlaylist2').css("display", "block");
                        socket.emit('usuarioNuevoCodigo', { codigoEvento: codigoEvento, userId: userId });

                        $('#compartir').css("display", "block")

                        var WAshare = document.getElementById("whatsappShare");
                        WAshare.href = "whatsapp://send?text=Hola, únete a mi evento en https://www.plystme.com/login con el siguiente código: " + codigoEvento;


                    }

                }
            }

        } else {
            console.log('Usuario es host, debe ser llevado directamente a su playlist')

            var userId = data.records[0]._fields[0].start.properties.spotifyid
            console.log('userId -> ', userId)

            var codigoEvento = data.records[0]._fields[0].end.properties.codigoEvento
            console.log('Código del evento -> ', codigoEvento)
            mostrarCodigo(codigoEvento);

            $(this).css("display", "none");
            $('#entrar').css("display", "none");
            $('#enterPool').css("display", "none");
            $('#btnCrear').css("display", "none");
            $('#EliminarPlaylist').css("display", "block");
            $('#entrar2').css("display", "none");
            $('#enterPool2').css("display", "none");
            $('#btnCrear2').css("display", "none");
            $('#EliminarPlaylist2').css("display", "block");
            socket.emit('usuarioNuevoCodigo', { codigoEvento: codigoEvento, userId: userId });
            $('#compartir').css("display", "block")

            var WAshare = document.getElementById("whatsappShare");
            WAshare.href = "whatsapp://send?text=Hola, únete a mi evento en https://www.plystme.com/login con el siguiente código: " + codigoEvento;

        }

    }
}



