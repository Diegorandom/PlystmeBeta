/* eslint-disable no-undef */

$.ajaxSetup({
    cache: false
});

var referenciaBD = "noGuardado"
var erroresPreferenciasGlobal = 0
var erroresPreferenciasSuri = 0


/*Se agrega funcion custom a la clase de Element.prototype para crear una funcion REMOVE que será usada más adelante*/
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

/*Función que controla la obtención del perfil de preferencias del usuario*/
function preferencias() {
    /*Se llama a la ruta de preferencias.js*/
    console.log('Se ha comenzado a llamar a preferencias')

    $.post('/preferencias', function (data, status, error) {

        console.log(status)
        /*Si la obtención de datos es existosa se despliega el perfil de preferencias en un gráfico de radar*/
        if (status == "success" && data != undefined) {
            erroresPreferenciasGlobal = 0
            erroresPreferenciasSuri = 0
            console.log('Preferencias exitoso')
            console.log(data.danceability)

            /*Normalización y preparación de variables para tabla*/
            var tonoT = document.createElement('th')
            tonoT.innerHTML = "Tono"

            switch (Math.round(data.fundamental)) {
                case 0:
                    data.fundamental = 'C';
                    break;
                case 1:
                    data.fundamental = 'C#/Db';
                    break;
                case 2:
                    data.fundamental = 'D';
                    break;
                case 3:
                    data.fundamental = 'D#/Eb';
                    break;
                case 4:
                    data.fundamental = 'E';
                    break;
                case 5:
                    data.fundamental = 'F';
                    break;
                case 6:
                    data.fundamental = 'F#/Gb';
                    break;
                case 7:
                    data.fundamental = 'G';
                    break;
                case 8:
                    data.fundamental = 'G#/Ab';
                    break;
                case 9:
                    data.fundamental = 'A';
                    break;
                case 10:
                    data.fundamental = 'A#/Bb';
                    break;
                case 11:
                    data.fundamental = 'B';
                    break;
            }

            var tono = document.createElement('td')
            tono.innerHTML = data.fundamental

            //tr.appendChild(tonoT)
            //tr.appendChild(tono)

            var modoT = document.createElement('th')
            modoT.innerHTML = "Modo"

            switch (Math.round(data.modo)) {
                case 0:
                    data.modo = 'Menor';
                    break;
                case 1:
                    data.modo = 'Mayor';
                    break;
            }

            var modo = document.createElement('td')
            modo.innerHTML = data.modo

            //trModo.appendChild(modoT)
            //trModo.appendChild(modo)

            /*var trVol = document.getElementById('vol')
            
            var volT = document.createElement('th')
            volT.innerHTML = "Volumen"
            
            var vol = document.createElement('td')
            vol.innerHTML = data.amplitud.toFixed(1) + ' dB'*/

            //trVol.appendChild(volT)
            //trVol.appendChild(vol)

            var tempoT = document.createElement('th')
            tempoT.innerHTML = "Tempo"

            var tempo = document.createElement('td')
            tempo.innerHTML = data.tempo + " BPM"

            //trTempo.appendChild(tempoT)
            //trTempo.appendChild(tempo)

            var beatsT = document.createElement('th')
            beatsT.innerHTML = "Beats x Compás"

            var beats = document.createElement('td')
            beats.innerHTML = data.firma_tiempo

            //trBeats.appendChild(beatsT)
            //trBeats.appendChild(beats)

            var durT = document.createElement('th')
            durT.innerHTML = 'Duración'

            var dur = document.createElement('td')
            dur.innerHTML = Math.floor(data.duracion / 60000) + ":" + Math.ceil((data.duracion % 60000 / 60000) * 60) + ' minutos'

            //trDuracion.appendChild(durT)
            //trDuracion.appendChild(dur)

        } else if (data == "Error Global" || error == true) {

            document.getElementById('nuevoPlaylist').innerHTML = "Error al desplegar preferenias"
            document.getElementById('nuevoPlaylist').style.display = "block"
            setTimeout(function () {
                document.getElementById('nuevoPlaylist').style.display = "none"
            }, 3000);

            erroresPreferenciasGlobal += 1
            console.log('Error global al procesar preferencias -> ', erroresPreferenciasGlobal)

            // if (erroresPreferenciasGlobal > 2) {

            // }

        } else if (data == 'Error SuriApi') {

            document.getElementById('nuevoPlaylist').innerHTML = "Error de SuriApi!"
            document.getElementById('nuevoPlaylist').style.display = "block"
            setTimeout(function () {
                document.getElementById('nuevoPlaylist').style.display = "none"
            }, 3000);

            erroresPreferenciasSuri += 1
            console.log('Error global al procesar preferencias -> ', erroresPreferenciasSuri)


            // if (erroresPreferenciasSuri > 2) {

            // }

        }
    })
}

/*La función de chequeoFDB revisa la BD de datos está lista para procesar transmitir 
 * información relacionada con el perfil de preferencias del usuario*/
function chequeoFBD() {
    $.post('/chequeoBD', function (data, status) {
        if (status == "success" && data == "guardado") {
            console.log('Se llama a preferencias')
            preferencias()
            referenciaBD = data
        }
    })
}

console.log('Se ha comenzado a revisar la base de datos')

/*Proceso que detona el loop que se encargara de esperar a que la BD y la API estén 
 *listas para transmitir la información de preferencias*/
function chequeoBDLoop() {
    chequeoFBD()
    setTimeout(function () {
        if (referenciaBD != "guardado") {
            setTimeout(chequeoBDLoop, 1000)
        } else {
            console.log('Ya se terminó de guardar la información en la base de datos')
        }
    }, 1000)


}

/*Inicio de proceso de obtención de perfil de preferencias*/
chequeoBDLoop();

var erroresGuardarTopGlobal = 0
var erroresGuardarTopSpotify = 0

document.getElementById('guardarTOP50').addEventListener('click', function () {

    $.ajax({ url: '/guardar/top50?_=' + new Date().getTime(), success: guardarTop, cache: false })

    function guardarTop(data, status) {
        console.log(status)
        console.log(data)
        if (status == "success") {
            /*Si se ha guardado el playlist se despliega un mensaje en la interfaz*/
            if (data == "topGuardado") {
                document.getElementById('nuevoPlaylist').style.display = "block"
                document.getElementById('nuevoPlaylist').innerHTML = "Guardando TOP 50 en Spotify..."

                console.log("mensaje -> ", data)
                setTimeout(function () {
                    document.getElementById('nuevoPlaylist').style.display = "none"
                }, 2000);

            } else if (data == "ActualizacionTop50") {
                /*Si se actualizó el playlist, se despliega un mensaje*/
                console.log("mensaje -> ", data)
                document.getElementById('nuevoPlaylist').innerHTML = "Se ha actualizado el TOP 50 en Spotify"
                document.getElementById('nuevoPlaylist').style.display = "block"
                setTimeout(function () {
                    document.getElementById('nuevoPlaylist').style.display = "none"
                }, 2000);

                erroresGuardarTopSpotify = 0
                erroresGuardarTopGlobal = 0

            } else if (data == "Error Global") {
                document.getElementById('nuevoPlaylist').innerHTML = "Error del sistema al guardar TOP 50"
                document.getElementById('nuevoPlaylist').style.display = "block"
                setTimeout(function () {
                    document.getElementById('nuevoPlaylist').style.display = "none"
                }, 3000);

                erroresGuardarTopGlobal += 1
                console.log('Error Global -> ', erroresGuardarTopGlobal)

                // if (erroresGuardarTopGlobal > 2) {

                // }

            } else if (data == "Error SpotifyApi") {
                document.getElementById('nuevoPlaylist').innerHTML = "Error del Spotify al guardar TOP 50"
                document.getElementById('nuevoPlaylist').style.display = "block"
                setTimeout(function () {
                    document.getElementById('nuevoPlaylist').style.display = "none"
                }, 3000);

                erroresGuardarTopSpotifyl += 1
                console.log('Error Global -> ', erroresGuardarTopSpotify)

                // if (erroresGuardarTopSpotify > 2) {

                // }
            }

        } else {
            console.log('ERROR DE ORIGEN')
        }

    }
})

/*Proceso que detona la guardar un playlist dado que el usuario lo solicita en la interfaz*/
document.getElementById('createPlaylist').addEventListener('click', function () {

    console.log('Guardando playlist en Spotify')

    $.ajax({ url: '/create/playlist?_=' + new Date().getTime(), success: crearPlaylist, cache: false })

})




/*Lo mismo de arriba pero en versión para móvil*/
document.getElementById('createPlaylist2').addEventListener('click', function () {
    $.ajax({ url: '/create/playlist?_=' + new Date().getTime(), success: crearPlaylist, cache: false })
})

function crearPlaylist(data, status, error) {
    console.log(status)
    console.log(data)
    if (status == "success") {
        if (data == "playlistGuardado") {
            document.getElementById('floating_alert').style.display = "block"
            console.log(data)
            setTimeout(function () {
                document.getElementById('floating_alert').style.display = "none"
            }, 2000);
        } else if (data == "ActualizacionPlaylist") {
            console.log(data)
            document.getElementById('actualizacion').style.display = "block"
            setTimeout(function () {
                document.getElementById('actualizacion').style.display = "none"
            }, 2000);
        } else if (data == "ERRORORIGEN") {
            console.log('ERROR DE ORIGEN')
            console.log(data)
            document.getElementById('nuevoPlaylist').innerHTML = "Error al guardar playlist, ups!"
            document.getElementById('nuevoPlaylist').style.display = "block"
            setTimeout(function () {
                document.getElementById('nuevoPlaylist').style.display = "none"
            }, 2000);

            $.ajax({ url: '/error?_=' + new Date().getTime(), success: error, cache: false })



        }
    } else {
        console.log('ERROR DE ORIGEN')
        console.log(data)
        document.getElementById('nuevoPlaylist').innerHTML = "Error al guardar playlist, ups!"
        document.getElementById('nuevoPlaylist').style.display = "block"
        setTimeout(function () {
            document.getElementById('nuevoPlaylist').style.display = "none"
        }, 2000);

        $.ajax({ url: '/error?_=' + new Date().getTime(), success: error, cache: false })



    }

}

//Botones de filtro de tiempo en top 50

function rango(data, status, error) {
    console.log(data)
    console.log(status)

    if (data == 'Error Global' || data == 'Error SpotifyApi' || data == "Error BD" || data == "Error") {
        if (error == true) {
            console.log(error)
        }

    } else {

        if (status === "success") {
            if (data != undefined && data != "Error BD" && error != true && data != "Error" && typeof data == 'object') {

                console.log('El playlist ha cambiado')
                data.forEach(function (item, index) {
                    /*Se quitan las canciones viejas si es que existen*/
                    if (document.getElementById("track" + index) !== null) {

                        ErroresTopRango = 0;

                        document.getElementById("track" + index).remove();
                        console.log("Depuración de playlist")
                        /*Despliegue de mensaje de que hay un nuevo playlist*/
                        if (index == 1) {
                            /*AQUI SE PUEDE COLOCAR UN MENSAJE/SPINNER CADA VEZ QUE SE CAMBIA DE RANGO*/
                        }

                    }

                    /*Se colocan las canciones en el playlist por primera vez */
                    playlist = data

                    console.log(item)
                    var iDiv = document.createElement('div');
                    iDiv.id = 'track' + index;
                    iDiv.className = 'col-lg-4 col-md-4 col-xs-12 col-sm-4';
                    iDiv.style = "padding-left:30px; padding-right:30px; margin-bottom:10px; height:350px !important; "

                    // Create the inner div before appending to the body
                    var innerDiv = document.createElement('div');
                    innerDiv.className = 'be-post';
                    innerDiv.style = ' background-color: rgba(255,255,255,0.9) !important; color:#d5573b; max-height:400px; max-width:250px;';

                    // The variable iDiv is still good... Just append to it.
                    iDiv.appendChild(innerDiv);

                    var boton = document.createElement("span")
                    boton.className = "be-img-block"
                    boton.form = "trackprofile"
                    boton.type = "submit"
                    boton.name = "index"
                    boton.value = index
                    boton.style = " -webkit-appearance: none;-webkit-border-radius: 0px; max-height:400px; max-width:250px;"

                    innerDiv.appendChild(boton)

                    var img = document.createElement("img")
                    img.src = item.album.images[0].url
                    img.alt = "omg"
                    img.style = ""

                    boton.appendChild(img)

                    var span = document.createElement("span")
                    span.className = "be-post-title"
                    span.style = "color:#503047; font-size:15px; font-family:'Kanit', sans-serif; height:40px;color:black;text-align:left;"

                    span.innerHTML = item.name

                    innerDiv.appendChild(span)

                    var span2 = document.createElement("span")
                    span2.style = "color:#503047; font-size:120%;max-height:20px;"
                    span2.innerHTML = "Popularidad: " + item.popularity

                    //innerDiv.appendChild(span2)

                    var div2 = document.createElement("div")
                    div2.className = "author-post"

                    innerDiv.appendChild(div2)

                    var artistas = "";
                    item.artists.forEach(function (artista) {
                        artistas = artistas + " " + artista.name;
                    })

                    var span3 = document.createElement("span")
                    span3.style = "color:#777; font-size:120%;max-height:20px;"
                    span3.innerHTML = artistas

                    div2.appendChild(span3)

                    // Then append the whole thing onto the body
                    document.getElementsByClassName('top')[0].appendChild(iDiv);

                    console.log('Nueva canción desplegada')

                })
            } else if (data == "Error" || data == "Error BD" || error == true) {
                //Mensaje de error

                document.getElementById('nuevoPlaylist').innerHTML = "Error al consultar la Base de Datos, intenta de nuevo!"
                document.getElementById('nuevoPlaylist').style.display = "block"
                setTimeout(function () {
                    document.getElementById('nuevoPlaylist').style.display = "none"
                }, 4000);

                ErroresTopRango += 1;
                console.log('Error registrados en el sistema -> ', ErroresTopRango)

                // if (ErroresTopRango > 2) {

                // }

            } else if (data == "Error SpotifyApi") {

                document.getElementById('nuevoPlaylist').innerHTML = "Error al conectar con Spotify, intenta de nuevo!"
                document.getElementById('nuevoPlaylist').style.display = "block"
                setTimeout(function () {
                    document.getElementById('nuevoPlaylist').style.display = "none"
                }, 4000);

                ErroresSpotify += 1;
                console.log('Error registrados en el sistema por Spotify -> ', ErroresSpotify)

                //     if (ErroresSpotify > 2) {

                //     }

                // } else if (data == "Error Global") {

                // }
            }
            else {
                console.log(data);
                console.log(data)
                document.getElementById('nuevoPlaylist').innerHTML = "Error al desplegar TOP 50"
                document.getElementById('nuevoPlaylist').style.display = "block"
                setTimeout(function () {
                    document.getElementById('nuevoPlaylist').style.display = "none"
                }, 2000);

                $.ajax({ url: '/error?_=' + new Date().getTime(), success: error, cache: false })

            }
        }

    }
}

var ErroresTopRango = 0
var ErroresSpotify = 0
var filter = $('.filterSelected').attr('id'); //variable que indica el filtro de tiempo seleccionado


$('.timeFilter').on('click', function () {
    $('.timeFilter').removeClass("filterSelected");
    $(this).addClass("filterSelected");
    filter = $('.filterSelected').attr('id');

    console.log('filter -> ', filter)

    $.ajax({ url: '/rango?_=' + new Date().getTime(), data: { filter: filter, cambioRango: true }, success: rango, cache: false });

})

$(window).bind("load", function () {
    filter = $('.filterSelected').attr('id');

    $.ajax({ url: '/rango?_=' + new Date().getTime(), data: { filter: filter, cambioRango: true }, success: rango, cache: false });

})
