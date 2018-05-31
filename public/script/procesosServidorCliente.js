
$.ajaxSetup({
  cache: false
});

var referenciaBD="noGuardado"
var erroresPreferenciasGlobal = 0
var erroresPreferenciasSuri = 0


/*Se agrega funcion custom a la clase de Element.prototype para crear una funcion REMOVE que será usada más adelante*/
     Element.prototype.remove = function() {
        this.parentElement.removeChild(this);
    }
        NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
            for(var i = this.length - 1; i >= 0; i--) {
                if(this[i] && this[i].parentElement) {
                    this[i].parentElement.removeChild(this[i]);
                }
            }
        }
        
    /*Función que controla la obtención del perfil de preferencias del usuario*/
    function preferencias(){
        /*Se llama a la ruta de preferencias.js*/
        console.log('Se ha comenzado a llamar a preferencias')
        $.post('/preferencias', function(data, status, error){
            
            console.log(status)
            /*Si la obtención de datos es existosa se despliega el perfil de preferencias en un gráfico de radar*/
            if(status == "success" && data != undefined){
                erroresPreferenciasGlobal = 0
                erroresPreferenciasSuri = 0
                console.log('Preferencias exitoso')
                console.log(data.danceability)
                
                    var ctx = document.getElementById("myChart").getContext('2d');
                    var myChart = new Chart(ctx, {
                        type: 'radar',
                        data: {
                            labels: ["Danzabilidad", "Energía Promedio", "Popularidad de Música", "Música Acustica", "Instrumentalidad", "Música en Vivo","Positivismo"],
                            datasets: [{
                                label: 'Preferencias Promedio',
                                data: [data.danceability*100, data.energia*100, data.popularidadAvg, data.acustica*100, data.instrumental*100, data.audiencia*100,data.positivismo*100],
                                backgroundColor: [
                                    'rgba(200, 85, 61, 0.7)'
                                    
                                ],
                                borderColor: [
                                    'rgba(55, 99, 252,0.5)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            legend: {
                                labels: {
                                    // This more specific font property overrides the global property
                                    fontColor: 'black', 
                                    fontSize: 12
                                }
                            },
                            scale: {
                                pointLabels: {
                                  fontSize: 10,
                                  fontColor: 'black'
                              },
                            }
                        }
                    });
     
                /*Normalización y preparación de variables para tabla*/
                
                var tr = document.getElementById('tono');
                
                var tonoT = document.createElement('th')
                tonoT.innerHTML = "Tono"
                
                switch(Math.round(data.fundamental)) {
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
                };
                
                var tono = document.createElement('td')
                tono.innerHTML = data.fundamental
                
                //tr.appendChild(tonoT)
                //tr.appendChild(tono)
                
                var trModo = document.getElementById('modo');
                
                var modoT = document.createElement('th')
                modoT.innerHTML = "Modo"
                    
                switch(Math.round(data.modo)){
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
                
                var trVol = document.getElementById('vol')
                
                var volT = document.createElement('th')
                volT.innerHTML = "Volumen"
                
                var vol = document.createElement('td')
                vol.innerHTML = data.amplitud.toFixed(1) + ' dB'
                
                //trVol.appendChild(volT)
                //trVol.appendChild(vol)
                
                var trTempo = document.getElementById('tempo')
                
                var tempoT = document.createElement('th')
                tempoT.innerHTML = "Tempo"
                
                var tempo = document.createElement('td')
                tempo.innerHTML = data.tempo + " BPM"
                
                //trTempo.appendChild(tempoT)
                //trTempo.appendChild(tempo)
                
                var trBeats = document.getElementById('beats')
                
                var beatsT = document.createElement('th')
                beatsT.innerHTML = "Beats x Compás"
                
                var beats = document.createElement('td')
                beats.innerHTML = data.firma_tiempo
                
                //trBeats.appendChild(beatsT)
                //trBeats.appendChild(beats)
                
                var trDuracion = document.getElementById('duracion')
                
                var durT = document.createElement('th')
                durT.innerHTML = 'Duración'
                
                var dur = document.createElement('td')
                dur.innerHTML = Math.floor(data.duracion/60000) +":" +Math.ceil((data.duracion%60000/60000)*60) +' minutos'
                
                //trDuracion.appendChild(durT)
                //trDuracion.appendChild(dur)
                
            }else if(data == "Error Global" || error == true){
                
                document.getElementById('nuevoPlaylist').innerHTML="Error al desplegar preferenias"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 3000);
                
                erroresPreferenciasGlobal += 1
                console.log('Error global al procesar preferencias -> ', erroresPreferenciasGlobal)
                
                if(erroresPreferenciasGlobal > 5){
                    location.reload(true);
                }
                
                }else if(data == 'Error SuriApi'){
                    
                     document.getElementById('nuevoPlaylist').innerHTML="Error de SuriApi!"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 3000);
                
                erroresPreferenciasSuri += 1
                console.log('Error global al procesar preferencias -> ', erroresPreferenciasSuri)
                
            
                if(erroresPreferenciasSuri > 5){
                    location.reload(true);
                }
                
            }
        })
    }
     
    /*La función de chequeoFDB revisa la BD de datos está lista para procesar transmitir información relacionada con el perfil de preferencias del usuario*/
    function chequeoFBD(){
        $.post('/chequeoBD', function(data,status){
            console.log('Datos del usuario ->', data)
            if(status == "success" && data == "guardado"){
                console.log('Se llama a preferencias')
                preferencias()
                referenciaBD = data
            }
        })
    }
     
     console.log('Se ha comenzado a revisar la base de datos')
     
     /*Proceso que detona el loop que se encargara de esperar a que la BD y la API estén listas para transmitir la información de preferencias*/
     function chequeoBDLoop() {
         chequeoFBD()
             setTimeout(function(){
                 if(referenciaBD != "guardado"){
                    setTimeout(chequeoBDLoop,1000)
                 }else{
                     console.log('Ya se terminó de guardar la información en la base de datos')
                 }
             },1000)
             
         
     }
     
    /*Inicio de proceso de obtención de perfil de preferencias*/
     chequeoBDLoop();

    var erroresGuardarTopGlobal = 0
    var erroresGuardarTopSpotify = 0
     
    document.getElementById('guardarTOP50').addEventListener('click', function(){
        $.get('/guardar/top50', function(data, status){
            console.log(status)
            console.log(data)
            if(status == "success"){
                /*Si se ha guardado el playlist se despliega un mensaje en la interfaz*/
                if(data=="topGuardado"){
                    document.getElementById('nuevoPlaylist').style.display="block"
                    document.getElementById('nuevoPlaylist').innerHTML="Guardando TOP 50 en Spotify..."
                    
                    console.log("mensaje -> ", data)
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);

                    erroresGuardarTopSpotify
                    erroresGuardarTopGlobal
                    
                }else if(data=="ActualizacionTop50"){
                    /*Si se actualizó el playlist, se despliega un mensaje*/
                    console.log("mensaje -> ", data)
                    document.getElementById('nuevoPlaylist').innerHTML="Se ha actualizado el TOP 50 en Spotify"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);
                    
                    erroresGuardarTopSpotify = 0
                    erroresGuardarTopGlobal = 0
                    
                }else if(data=="Error Global"){
                    document.getElementById('nuevoPlaylist').innerHTML="Error del sistema al guardar TOP 50"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 3000);
                    
                    erroresGuardarTopGlobal += 1
                    console.log('Error Global -> ', erroresGuardarTopGlobal)
                    
                   if(erroresGuardarTopGlobal >5){
                       location.reload(true);
                   }
                      
                }else if(data == "Error SpotifyApi"){
                   document.getElementById('nuevoPlaylist').innerHTML="Error del Spotify al guardar TOP 50"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 3000);
                    
                    erroresGuardarTopSpotifyl += 1
                    console.log('Error Global -> ', erroresGuardarTopSpotify)
                    
                   if(erroresGuardarTopSpotify >5){
                       location.reload(true);
                   } 
                }

            }else{
                console.log('ERROR DE ORIGEN')
                location.reload(true);
            }

        })
    })
    
    /*Proceso que detona la guardar un playlist dado que el usuario lo solicita en la interfaz*/
    document.getElementById('createPlaylist').addEventListener('click', function(){
        $.get('/create/playlist', function(data, status){
            console.log(status)
            console.log(data)
            if(status == "success"){
                /*Si se ha guardado el playlist se despliega un mensaje en la interfaz*/
                if(data=="playlistGuardado"){
                    document.getElementById('nuevoPlaylist').innerHTML="Playlist guardado como FIESTA ATMOS en Spotify"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    console.log(data)
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);

                }else if(data=="ActualizacionPlaylist"){
                    /*Si se actualizó el playlist, se despliega un mensaje*/
                    console.log(data)
                    document.getElementById('nuevoPlaylist').innerHTML="Se ha actualizado el Playlist"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);
                }else if(data=="ERRORORIGEN"){
                    console.log('ERROR DE ORIGEN')
                    console.log(data)
                    document.getElementById('nuevoPlaylist').innerHTML="Error al guardar playlist, ups!"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);
                    
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
                console.log('ERROR DE ORIGEN')
                console.log(data)
                    document.getElementById('nuevoPlaylist').innerHTML="Error al guardar playlist, ups!"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);
                
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

        })
    })
    
    
        
    
        /*Lo mismo de arriba pero en versión para móvil*/
        document.getElementById('createPlaylist2').addEventListener('click', function(){
            $.get('/create/playlist', function(data, status){
                console.log(status)
                console.log(data)
                if(status == "success"){
                    if(data=="playlistGuardado"){
                        document.getElementById('floating_alert').style.display="block"
                        console.log(data)
                        setTimeout(function(){
                            document.getElementById('floating_alert').style.display="none"
                        }, 2000);
                    }else if(data=="ActualizacionPlaylist"){
                        console.log(data)
                        document.getElementById('actualizacion').style.display="block"
                        setTimeout(function(){
                            document.getElementById('actualizacion').style.display="none"
                        }, 2000);
                    }else if(data=="ERRORORIGEN"){
                        console.log('ERROR DE ORIGEN')
                        console.log(data)
                        document.getElementById('nuevoPlaylist').innerHTML="Error al guardar playlist, ups!"
                        document.getElementById('nuevoPlaylist').style.display="block"
                        setTimeout(function(){
                            document.getElementById('nuevoPlaylist').style.display="none"
                        }, 2000);
                        
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
                    console.log('ERROR DE ORIGEN')
                    console.log(data)
                    document.getElementById('nuevoPlaylist').innerHTML="Error al guardar playlist, ups!"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);
                    
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
                
            })
        })
     
        
        function checkUrl(url) {
            console.log('Checando URL -> ', url)
            $.get(url)
                .done(function() { 
                    return true
                    // Do something now you know the image exists.

                }).fail(function() { 
                    return false
                    // Image doesn't exist - do something else.

                })
        } 
        

        

        /*Proceso para entrar a un pool determinado*/
        document.getElementById('enterPool').addEventListener('click', function enterPool() {
            
            console.log('Entramos a pool de Escritorio')
            
            $('#usuariosDentro').css("display","block");
            
            $.get('/usuarios', function(data, status){
               
            console.log(data)
            console.log(status)
                        
                        
                        
            if(status === "success"){
                if(data != undefined){
                    
                    var contadorU = document.getElementById('contadorU')
                    var cont= document.createElement("span")
                    cont.id="contadorSpan"
                    cont.innerHTML = data.length
                    contadorU.appendChild(cont)
                    
                    var usuariosDentro = document.getElementById('usuariosDentro')
                    var listaUsuarios = document.createElement('ul')
                    listaUsuarios.id="usuarios"
                    listaUsuarios.style="display:none; padding:5px;"
                    usuariosDentro.appendChild(listaUsuarios)
                    
                    data.forEach(function(usuario,index){
                        if(checkUrl(usuario[1])==false){
                            console.log(usuario[1], " No válido")
                            usuario[1] = false
                        }
                        
                        
                        
                        var usuariosFotos = document.getElementById('usuariosFotos')
                        
                        if(usuario[1]){ 
                            var imgU= document.createElement("img")
                            imgU.src=usuario[1]
                            imgU.alt="omg"
                            imgU.style="height:100%; border-radius:50%; width:20px;"
                            imgU.className="imgUsuario"
                            usuariosFotos.appendChild(imgU)
                        }else{
                            var imgU= document.createElement("img")
                            imgU.src="img/Perfil.png"
                            imgU.alt="omg"
                            imgU.style="height:100%; border-radius:50%; width:20px;"
                            imgU.className="imgUsuario"
                            usuariosFotos.appendChild(imgU) 
                        }
                        
                        
                        if(usuario[0] && usuario[1]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = usuario[1]
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = usuario[0]
                            bullet.appendChild(imgL)
                            listaUsuarios.appendChild(bullet)
                        }else if(usuario[0]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = "img/Perfil.png"
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = usuario[0]
                            bullet.appendChild(imgL)
                            listaUsuarios.appendChild(bullet)
                        }else if(usuario[1]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = usuario[1]
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = "Anónimo"
                            bullet.appendChild(imgL)
                            listaUsuarios.appendChild(bullet)
                        }
                        
                    })
                }
            }
                
            }) 
            
            $.get( '/pool',  function(data, status) {
                console.log(data)
                console.log(status)
                if(status === "success"){
                    if(data != undefined){
                        
                    
                    /*Proceso entrar a un pool, se configuran los botones que serán las opciones dentro del pool*/
                    var botonPool = document.getElementById('btnActualizar')
                    botonPool.innerHTML = "Actualizar Playlist"
                    botonPool.style="width:40%; border: none; background-color:#FFF; margin:0 auto 0px auto; color:#588b8b; display:inline-block; border-radius:30px"
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
                        
                        /*var a = document.createElement('a')
                        a.className="close"
                        a.style="color:#503047; font-size:20px; font-family:'Kanit', sans-serif;"
                        a.id="fadeOut" + index
                        a.innerHTML ="&times;"
                        
                        innerDiv.appendChild(a)*/
                        
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
                
            })
        })
    
     /*Proceso para actualizar un playlist*/
        document.getElementById('btnActualizar').addEventListener('click', function() {
            console.log('Actualizando POOL1')
           
            $.get('/usuarios', function(data, status){
               
            console.log(data)
            console.log(status)
                        
            
                        
            if(status === "success"){
                if(data != undefined){
                    
                    document.getElementById("usuarios").remove();
                    var usuariosDentro = document.getElementById('usuariosDentro')
                    var listaUsuarios = document.createElement('ul')
                    listaUsuarios.id="usuarios"
                    listaUsuarios.style="display:none; padding:5px;"
                    usuariosDentro.appendChild(listaUsuarios)
                    
                    var contadorU = document.getElementById('contadorU')
                    document.getElementById("contadorSpan").remove();
                    var cont= document.createElement("span")
                    cont.id="contadorSpan"
                    cont.innerHTML = data.length
                    contadorU.appendChild(cont)
                   
                    var totalId = document.getElementsByClassName("imgUsuario").length;
                    
                    console.log("# de IDs a eliminar -> ",  totalId)
                    
                    for(var i=0; i<totalId; i++){
                        document.getElementsByClassName("imgUsuario").remove();
                    }
                    
                    data.forEach(function(usuario,index){
                        console.log('Modificando usuarios -> Indice ', index)
                        
                        if(checkUrl(usuario[1])==false){
                            console.log(usuario[1], " No válido")
                            usuario[1] = false
                        }
                        
                        var usuariosFotos = document.getElementById('usuariosFotos')
                        
                        if(usuario[1]){
                            
                            var imgU= document.createElement("img")
                            imgU.src=usuario[1]
                            imgU.alt="omg"
                            imgU.style="height:100%; border-radius:50%; width:20px;"
                            imgU.className="imgUsuario"
                            usuariosFotos.appendChild(imgU)
                        }else{
                            var imgU= document.createElement("img")
                            imgU.src="img/Perfil.png"
                            imgU.alt="omg"
                            imgU.style="height:100%; border-radius:50%; width:20px;"
                            imgU.className="imgUsuario"
                            usuariosFotos.appendChild(imgU) 
                        }
                        
                        
                        if(usuario[0] && usuario[1]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = usuario[1]
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = usuario[0]
                            bullet.appendChild(imgL)
                            listaUsuarios.appendChild(bullet)
                        }else if(usuario[0]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = "img/Perfil.png"
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = usuario[0]
                            bullet.appendChild(imgL)
                            listaUsuarios.appendChild(bullet)
                        }else if(usuario[1]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = usuario[1]
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = "Anónimo"
                            bullet.appendChild(imgL)
                            listaUsuarios.appendChild(bullet)
                        }
                        
                    })
                }
            }
                
            }) 
            
            $.get( '/pool', function(data, status) {
                console.log(data)
                console.log(status)
                if(status === "success"){
                    if(data != undefined){
                        
                console.log('El playlist ha cambiado')
                   data.forEach(function(item,index){
                       /*Se eliminan las canciones viejas*/
                       if(document.getElementById("pool"+index) !== null){
                            document.getElementById("pool"+index).remove();
                            console.log("Depuración de playlist")
                            /*Mensaje de actualizacion de playlist*/
                            if(index == 1){
                                console.log('cargando mensaje')
                                document.getElementById('nuevoPlaylist').innerHTML="Actualizando Playlist..."
                                document.getElementById('nuevoPlaylist').style.display="block"
                                console.log(data)
                                setTimeout(function(){
                                    document.getElementById('nuevoPlaylist').style.display="none"
                                }, 2000);
                            }
                            
                       }
                      
                       
                       /*Se despliega la actualizacion del playlist en la interfaz*/
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
                        
                        /*var a = document.createElement('a')
                        a.className="close"
                        a.style="color:#503047; font-size:20px; font-family:'Kanit', sans-serif;"
                        a.id="fadeOut" + index
                        a.innerHTML ="&times;"
                        
                        innerDiv.appendChild(a)*/
                        
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
                     console.log(data)
                    document.getElementById('nuevoPlaylist').innerHTML="Error al actualizar playlist, ups!"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);
                    
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
                    console.log(data)
                    document.getElementById('nuevoPlaylist').innerHTML="Error al actualizar playlist, ups!"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);
                    
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
                    
                
            })
        })
        
        /*Lo mismo que enterPool pero para movil*/
        document.getElementById('enterPool2').addEventListener('click', function enterPool2() {
            
            $('#usuariosDentro2').css("display","block");
            
            
            console.log('Entramos a pool de Móvil')
            
            $.get('/usuarios', function(data, status){
            
            console.log(status)    
            console.log(data)
                        
            if(status === "success"){
                if(data != undefined){
                    
                    
                    var contadorU2 = document.getElementById('contadorU2')
                    var cont= document.createElement("span")
                    cont.id="contadorSpan2"
                    cont.innerHTML = data.length
                    contadorU2.appendChild(cont)
                    
                    var usuariosDentro2 = document.getElementById('usuariosDentro2')
                    var listaUsuarios2 = document.createElement('ul')
                    listaUsuarios2.id="usuarios2"
                    listaUsuarios2.style="display:none; padding:5px;"
                    usuariosDentro2.appendChild(listaUsuarios2)
                    
                    data.forEach(function(usuario,index){
                        
                        if(checkUrl(usuario[1])==false){
                            console.log(usuario[1], " No válido")
                            usuario[1] = false
                        }
                        
                        var usuariosFotos2 = document.getElementById('usuariosFotos2')
                        
                        if(usuario[1]){ 
                            var imgU= document.createElement("img")
                            imgU.src=usuario[1]
                            imgU.alt="omg"
                            imgU.style="height:100%; border-radius:50%; width:20px;"
                            imgU.className="imgUsuario2"
                            usuariosFotos2.appendChild(imgU)
                            
                        }else{
                            var imgU= document.createElement("img")
                            imgU.src="img/Perfil.png"
                            imgU.alt="omg"
                            imgU.style="height:100%; border-radius:50%; width:20px;"
                            imgU.className="imgUsuario2"
                            usuariosFotos2.appendChild(imgU) 
                        }
                        
                        
                        
                        if(usuario[0] && usuario[1]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = usuario[1]
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = usuario[0]
                            bullet.appendChild(imgL)
                            listaUsuarios2.appendChild(bullet)
                        }else if(usuario[0]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = "img/Perfil.png"
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = usuario[0]
                            bullet.appendChild(imgL)
                            listaUsuarios2.appendChild(bullet)
                        }else if(usuario[1]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = usuario[1]
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = "Anónimo"
                            bullet.appendChild(imgL)
                            listaUsuarios2.appendChild(bullet)
                        }
                        
                        
                        
                    })
                }
            }
                
            }) 
            
            
            $.get( '/pool', function(data, status) {
                console.log(data)
                console.log(status)
                if(status === "success"){
                    if(data != undefined){
                    
                    var botonPool = document.getElementById('btnActualizar2')
                    botonPool.innerHTML = "Actualizar Playlist"
                    botonPool.style="width:80%; border: none; background-color:#FFF; margin:0px auto 0px auto; color:#588b8b;"
                    var icono = document.createElement('i')
                    icono.className ="fas fa-sync-alt"
                    icono.style="font-size:20px; color:#588b8b; margin-left:5px;"
                    botonPool.appendChild(icono)
                    
                    document.getElementById('btnCrear2').style.display="none"
                    document.getElementById('createPlaylist2').style.display="block"
                    
                console.log('El playlist ha cambiado')
                   data.forEach(function(item,index){
                       if(document.getElementById("pool"+index) !== null){
                            document.getElementById("pool"+index).remove();
                            console.log("Depuración de playlist")
                            
                            if(index == 1){
                                console.log('cargando mensaje')
                                document.getElementById('nuevoPlaylist').style.display="block"
                                console.log(data)
                                setTimeout(function(){
                                    document.getElementById('nuevoPlaylist').style.display="none"
                                    console.log("ya no está el mensaje");
                                }, 2000);
                            }
                            
                       }
                      
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
                        form.id="trackprofile"
                        
                        innerDiv.appendChild(form) */
                        
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
                        
                        /*var a = document.createElement('a')
                        a.className="close"
                        a.style="color:#503047; font-size:20px; font-family:'Kanit', sans-serif;"
                        a.id="fadeOut" + index
                        a.innerHTML ="&times;"
                        
                        innerDiv.appendChild(a)*/
                        
                        var span2 = document.createElement("span")
                        span2.style="color:#503047; font-size:120%;max-height:20px;"
                        span2.innerHTML="Popularidad: " + item[5]
                        
                        //innerDiv.appendChild(span2)
                        
                        var div2 = document.createElement("div")
                        div2.className="author-post"
                        
                        innerDiv.appendChild(div2)
                        
                        var span3= document.createElement("span")
                        span3.style="color:#777; font-size:120%;max-height:20px;"
                        span3.innerHTML= item[2]
                        
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
                
            })
        })
        
        /*Lo mismo que btnActualizar pero para movil*/
        document.getElementById('btnActualizar2').addEventListener('click', function() {
            console.log('Actualizando POOL2')
            
            $.get('/usuarios', function(data, status, error){
            if(error == true){
                
            }
                
                
            console.log(status)    
            console.log(data)
                        
            if(status === "success"){
                if(data != undefined){
                    
                    document.getElementById("usuarios2").remove();
                    var usuariosDentro2 = document.getElementById('usuariosDentro2')
                    var listaUsuarios2 = document.createElement('ul')
                    listaUsuarios2.id="usuarios2"
                    listaUsuarios2.style="display:none; padding:5px;"
                    usuariosDentro2.appendChild(listaUsuarios2)
                    
                     var contadorU2 = document.getElementById('contadorU2')
                        document.getElementById("contadorSpan2").remove();
                        var cont= document.createElement("span")
                        cont.id="contadorSpan2"
                        cont.innerHTML = data.length
                        contadorU2.appendChild(cont)
                        
                         var totalId = document.getElementsByClassName("imgUsuario2").length;
                    
                        console.log("# de IDs a eliminar -> ",  totalId)

                        for(var i=0; i<totalId; i++){
                            document.getElementsByClassName("imgUsuario2").remove();
                        }

                        
                    data.forEach(function(usuario,index){
                        
                        if(checkUrl(usuario[1])==false){
                            console.log(usuario[1], " No válido")
                            usuario[1] = false
                        }
                        
                        var usuariosFotos2 = document.getElementById('usuariosFotos2')
                        
                        if(usuario[1]){ 
                            var imgU= document.createElement("img")
                            imgU.src=usuario[1]
                            imgU.alt="omg"
                            imgU.style="height:100%; border-radius:50%; width:20px;"
                            imgU.className="imgUsuario2"
                            usuariosFotos2.appendChild(imgU)
                            
                        }else{
                            var imgU= document.createElement("img")
                            imgU.src="img/Perfil.png"
                            imgU.alt="omg"
                            imgU.style="height:100%; border-radius:50%; width:20px;"
                            imgU.className="imgUsuario2"
                            usuariosFotos2.appendChild(imgU) 
                        }
                                                
                        
                        
                        if(usuario[0] && usuario[1]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = usuario[1]
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = usuario[0]
                            bullet.appendChild(imgL)
                            listaUsuarios2.appendChild(bullet)
                        }else if(usuario[0]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = "img/Perfil.png"
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = usuario[0]
                            bullet.id="listaUsuario"
                            bullet.appendChild(imgL)
                            listaUsuarios2.appendChild(bullet)
                        }else if(usuario[1]){
                            var bullet = document.createElement('li')
                            var imgL = document.createElement("img")
                            imgL.src = usuario[1]
                            imgL.style = "height:20px;width:20px; border-radius:50%; float:left;"
                            bullet.innerHTML = "Anónimo"
                            bullet.id="listaUsuario"
                            bullet.appendChild(imgL)
                            listaUsuarios2.appendChild(bullet)
                        }
                        
                        
                        
                    })
                }
            }
                
            })
            
            $.get( '/pool', function(data, status) {
                console.log(data)
                console.log(status)
                if(status === "success"){
                    if(data != undefined){
                    
                    var botonPool = document.getElementById('btnActualizar2')
                    botonPool.innerHTML = "Actualizar Playlist"
                    botonPool.style="width:80%; border: none; background-color:#FFF; margin:0 auto 0px auto; color:#588b8b;"
                    var icono = document.createElement('i')
                    icono.className ="fas fa-sync-alt"
                    icono.style="font-size:20px; color:#588b8b; margin-left:5px;"
                    botonPool.appendChild(icono)
                    
                    document.getElementById('btnCrear2').style.display="none"
                    document.getElementById('createPlaylist2').style.display="block"
                    
                console.log('El playlist ha cambiado')
                   data.forEach(function(item,index){
                       if(document.getElementById("pool"+index) !== null){
                            document.getElementById("pool"+index).remove();
                            console.log("Depuración de playlist")
                            
                            if(index == 1){
                                console.log('cargando mensaje')
                                document.getElementById('nuevoPlaylist').style.display="block"
                                console.log(data)
                                setTimeout(function(){
                                    document.getElementById('nuevoPlaylist').style.display="none"
                                    console.log("ya no está");
                                }, 2000);
                            }
                            
                       }
                      
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
                        form.id="trackprofile"
                        
                        innerDiv.appendChild(form) */
                        
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
                        
                        /*var a = document.createElement('a')
                        a.className="close"
                        a.style="color:#503047; font-size:20px; font-family:'Kanit', sans-serif;"
                        a.id="fadeOut" + index
                        a.innerHTML ="&times;"
                        
                        innerDiv.appendChild(a)*/
                        
                        var span2 = document.createElement("span")
                        span2.style="color:#503047; font-size:120%;max-height:20px;"
                        span2.innerHTML="Popularidad: " + item[5]
                        
                        //innerDiv.appendChild(span2)
                        
                        var div2 = document.createElement("div")
                        div2.className="author-post"
                        
                        innerDiv.appendChild(div2)
                        
                        var span3= document.createElement("span")
                        span3.style="color:#777; font-size:120%;max-height:20px;"
                        span3.innerHTML= item[2]
                        
                        div2.appendChild(span3)

                        // Then append the whole thing onto the body
                        document.getElementsByClassName('pool')[0].appendChild(iDiv);
                       
                    
                       
                       
                       console.log('Nueva canción desplegada')
                   })
                    }else{
                        console.log(data)
                        document.getElementById('nuevoPlaylist').innerHTML="Error al actualizar playlist, ups!"
                        document.getElementById('nuevoPlaylist').style.display="block"
                        setTimeout(function(){
                            document.getElementById('nuevoPlaylist').style.display="none"
                        }, 2000);
                        
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
                    console.log(data)
                    document.getElementById('nuevoPlaylist').innerHTML="Error al actualizar playlist, ups!"
                    document.getElementById('nuevoPlaylist').style.display="block"
                    setTimeout(function(){
                        document.getElementById('nuevoPlaylist').style.display="none"
                    }, 2000);
                    
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
                
            })
        })
        
        
        //Botones de filtro de tiempo en top 50
        
  function rango(data, status, error){
    console.log(data)
    console.log(status)
    if(status === "success"){
        if(data != undefined || data != "Error BD" || error != true || data != "Error"){

    console.log('El playlist ha cambiado')
       data.forEach(function(item,index){
           /*Se quitan las canciones viejas si es que existen*/
           if(document.getElementById("track"+index) !== null){
               
               ErroresTopRango = 0;
               
                document.getElementById("track"+index).remove();
                console.log("Depuración de playlist")
                /*Despliegue de mensaje de que hay un nuevo playlist*/
                if(index == 1){
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
            boton.className="be-img-block"
            boton.form="trackprofile"
            boton.type="submit"
            boton.name="index"
            boton.value= index
            boton.style=" -webkit-appearance: none;-webkit-border-radius: 0px; max-height:400px; max-width:250px;"

            innerDiv.appendChild(boton)

            var img= document.createElement("img")
            img.src=item.album.images[0].url
            img.alt="omg"
            img.style=""

            boton.appendChild(img)

            var span = document.createElement("span")
            span.className="be-post-title"
            span.style="color:#503047; font-size:15px; font-family:'Kanit', sans-serif; height:40px;color:black;text-align:left;"

            span.innerHTML = item.name

            innerDiv.appendChild(span)

            var span2 = document.createElement("span")
            span2.style="color:#503047; font-size:120%;max-height:20px;"
            span2.innerHTML="Popularidad: " + item.popularity

            //innerDiv.appendChild(span2)

            var div2 = document.createElement("div")
            div2.className="author-post"

            innerDiv.appendChild(div2)
            
            var artistas = "";
            item.artists.forEach(function(artista,index){
                artistas = artistas + " " +artista.name;
            })

            var span3= document.createElement("span")
            span3.style="color:#777; font-size:120%;max-height:20px;"
            span3.innerHTML= artistas

            div2.appendChild(span3)

            // Then append the whole thing onto the body
            document.getElementsByClassName('top')[0].appendChild(iDiv);

           console.log('Nueva canción desplegada')

       })
       }else if(data == "Error" || data == "Error BD" || error == true){
            //Mensaje de error
        
            document.getElementById('nuevoPlaylist').innerHTML="Error al consultar la Base de Datos, intenta de nuevo!"
            document.getElementById('nuevoPlaylist').style.display="block"
            setTimeout(function(){
                document.getElementById('nuevoPlaylist').style.display="none"
            }, 4000);

            ErroresTopRango += 1;
            console.log('Error registrados en el sistema -> ', ErroresTopRango )

            if(ErroresTopRango > 5){
                location.reload(true);
            }
            
        }else if(data == "Error SpotifyApi"){
            
            document.getElementById('nuevoPlaylist').innerHTML="Error al conectar con Spotify, intenta de nuevo!"
            document.getElementById('nuevoPlaylist').style.display="block"
            setTimeout(function(){
                document.getElementById('nuevoPlaylist').style.display="none"
            }, 4000);
            
            ErroresSpotify += 1;
            console.log('Error registrados en el sistema por Spotify -> ', ErroresSpotify )

            if(ErroresSpotify > 5){
                location.reload(true);
            }
            
        }else if(data == "Error Global"){
             location.reload(true);
        }
    }else{
        console.log(data);
        console.log(data)
        document.getElementById('nuevoPlaylist').innerHTML="Error al desplegar TOP 50"
        document.getElementById('nuevoPlaylist').style.display="block"
        setTimeout(function(){
            document.getElementById('nuevoPlaylist').style.display="none"
        }, 2000);
        
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
        
var ErroresTopRango = 0
var ErroresSpotify = 0
var filter = $('.filterSelected').attr('id'); //variable que indica el filtro de tiempo seleccionado


$('.timeFilter').on('click',function(){
    $('.timeFilter').removeClass("filterSelected");
    $(this).addClass("filterSelected");
    filter = $('.filterSelected').attr('id');
    
    console.log('filter -> ', filter)
    
    $.ajax({url: '/rango?_=' + new Date().getTime(), data:{filter:filter, cambioRango:true}, success: rango, cache: false});
    
})

$(window).bind("load", function() {
    filter = $('.filterSelected').attr('id');
    
    $.ajax({url: '/rango?_=' + new Date().getTime(), data:{filter:filter, cambioRango:true}, success: rango, cache: false});

})



    