
    
//Cambiar las imagenes de fondo

    $('#btnPerfil').on('click',function(){
        $('#fondoIphone').css("background","url('img/fondo4.png') no-repeat");
        $('#fondoIphone').css("background-position","center");
        $('#fondoIphone').css("background-size","cover");
        
        
        window.scrollTo(0,0);
    });
    
    $('#btnTop50').on('click',function(){
        $('#fondoIphone').css("background","url('img/propuesta.jpg') no-repeat");
        $('#fondoIphone').css("background-position","center");
        $('#fondoIphone').css("background-size","cover");
        
        
        window.scrollTo(0,0);
        
        
    });
    
    $('#btnFiesta').on('click',function(){
        $('#fondoIphone').css("background","url('img/fondo2.jpg') no-repeat");
        $('#fondoIphone').css("background-position","center");
        $('#fondoIphone').css("background-size","cover");
        
        
        window.scrollTo(0,0);
    });
    
    $('#btnAjustes').on('click',function(){
        
        
        var ancho = window.innerWidth;
        
        console.log(ancho);
        
        window.scrollTo(0,0);
        
        if(ancho > 577){
            $('#fondoIphone').css("background","url('img/fondo8.png') no-repeat");
            $('#fondoIphone').css("background-position","center");
            $('#fondoIphone').css("background-size","cover");
            
        }else{  
            
            $('#fondoIphone').css("background","url('img/fondo9.png') no-repeat");
            $('#fondoIphone').css("background-position","center");
            $('#fondoIphone').css("background-size","cover");
            
        }
        
        
        

    });
    
    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    
    if(iOS){
                
        $('#content-block').css("margin-top","50px");
        

    }
    
    
//Ocultar los botones de entrar y crear playlist
    var inPool1 = 0;
    var inPool2 = 0;
    var StoBresize = 0;
    var BtoSresize = 0;
    
    var width,height;
    window.onresize = window.onload = function() {
        width = this.innerWidth;
        height = this.innerHeight;
        if(width > 991 && inPool2 != 0 && StoBresize == 0){
            $('#enterPool').click();
            StoBresize = 1;
            BtoSresize = 1;
        }
        
        if(width < 991 && inPool1 != 0 && BtoSresize == 0){
            $('#enterPool2').click();
            BtoSresize = 1;
            StoBresize = 1;
        }
    }
    
    $('#enterPool').on('click',function(){
        $('#enterPool').css("display","none");
        $('#btnCrear').css("display","none");
        inPool1 = 1;
        $('#entrar').css("display","block");
        $('#entrarEvento').css("display","block");
    })
    $('#entrarEvento').on('click',function(){
        entrarCodigo($('#codigo').val());
        $(this).css("display","none");
        $('#entrar').css("display","none");
        $('#salirPlaylist').css("display","block");
        
    })
    $('#entrarUbicacion').on('click',function(){
        $('#entrar').css("display","none");
        entrarUbicacion();
        $('#salirPlaylist').css("display","block");
        
    })

    $('#regresarDeEntrar').on('click', function(){
        $('#entrar').css("display","none");
        $('#enterPool').css("display","inline-block");
        $('#btnCrear').css("display","inline-block");
    })

    $('#enterPool2').on('click',function(){
        $('#enterPool2').css("display","none");
        $('#btnCrear2').css("display","none");
        $('#salirPlaylist2').css("display","block");
        inPool2 = 1;
        //enterPool2();
    })
    
    $('#btnCrear').on('click',function(){
        $('#enterPool').css("display","none");
        $('#btnCrear').css("display","none");
        $('#crear').css("display","block");
        btnCrear()
    })

    $('#regresarDeCrear').on('click', function(){
        $('#crear').css("display","none");
        $('#enterPool').css("display","inline-block");
        $('#btnCrear').css("display","inline-block");
    })

    $('#crearUbicacion').on('click', function(){
        $('#crear').css("display","none");
        $('#mensajeUbicacion').css("display","block");
        $('#map').css("display","block");
        $('#fijarUbicacion').css("display","block");
        $('#btnRegresar').css("display","block");
    })

    $('#crearCodigo').on('click', function(){
        crearCodigo();
        
        $('#crear').css("display","none");
        $('#EliminarPlaylist').css("display","block");
    })
    
    $('#btnCrear2').on('click',function(){
        $('#enterPool2').css("display","none");
        $('#btnCrear2').css("display","none");
        $('#mensajeUbicacion2').css("display","block");
        $('#map2').css("display","block");
        $('#fijarUbicacion2').css("display","block");
        $('#btnRegresar').css("display","block");
        $('#btnRegresar2').css("display","block");
    })
    
    //Botón para entrar al POOL de del HOST
    
    $('#fijarUbicacion').on('click',function(){
        console.log('Se activa fijarUbicacion')
        
        //enterPool();
        fijarUbicacion(pos,userid);
        
         $('#mensajeUbicacion').css("display","none");
        $('#map').css("display","none");       
        $('#fijarUbicacion').css("display","none");        
        $('#btnRegresar').css("display","none");
        
        $('#EliminarPlaylist').css("display","block");
        $('#salirPlaylist').css("display","none");
        $('#btnRegresar').css("display","none");

        
        
    })
    
    $('#fijarUbicacion2').on('click',function(){
        console.log('Se activa fijarUbicacion2');
        
        //enterPool2();
        
        $('#map2').css("display","none");
        $('#mensajeUbicacion2').css("display","none");
        $('#btnRegresar2').css("display","none");
        $('#EliminarPlaylist2').css("display","block");
        $(this).css("display","none");
        
    })
    
    
    
//Mostrar usuarios dentro de la playlist
    
    var fas = 0; //Variable para cambiar el icono de la flecha para mostrar usuarios
    
    
    //Version escritorio
    $('#mostrarUsuarios').on('click',function(){
        $('#usuarios').animate({height:'toggle'});
        if(fas == 0){
            $('#usuariosDentro i').removeClass("fas fa-chevron-circle-down");
            $('#usuariosDentro i').addClass("fas fa-chevron-circle-up");
            //$('#usuariosFotos').css("display","none");
            fas = 1;
        }else{
            $('#usuariosDentro i').removeClass("fas fa-chevron-circle-up");
            $('#usuariosDentro i').addClass("fas fa-chevron-circle-down");
            //$('#usuariosFotos').css("display","block");
            fas = 0;
        }
        
    })
    
    //version movil
    
    $('#usuariosDentro2').on('click',function(){
        console.log("usuarios2 click");
        $('#usuarios2').animate({height:'toggle'});
        if(fas == 0){
            $('#usuariosDentro2 i').removeClass("fas fa-chevron-circle-down");
            $('#usuariosDentro2 i').addClass("fas fa-chevron-circle-up");
            fas = 1;
        }else{
            $('#usuariosDentro2 i').removeClass("fas fa-chevron-circle-up");
            $('#usuariosDentro2 i').addClass("fas fa-chevron-circle-down");
            fas = 0;
        }
        
    })
    
    
//Desplegar la información de las variables de spotify
    
    
    var ca = 0;//variable a la que se le asigna el id del elemento desplegado
    
    $('.variableDesplegable').on('click',function(){

        
        if(ca != $(this).attr("id")){
            $('#'+ca).next().animate({height:"toggle"});
            $('#'+ca).children().removeClass("fas fa-minus");
            $('#'+ca).children().addClass("fas fa-plus");
        }
        
        
        if($(this).children().attr("class") == "fas fa-plus"){
            $(this).next().animate({height:"toggle"});
            $(this).children().removeClass("fas fa-plus");
            $(this).children().addClass("fas fa-minus");
            ca = $(this).attr("id");
            console.log(ca);
        }else{
            $(this).next().animate({height:"toggle"});
            $(this).children().removeClass("fas fa-minus");
            $(this).children().addClass("fas fa-plus");
            ca = 0;
        }
        
        
    })
    
    
//Funcionalidad del boton salir del playlist
    
    $('#salirPlaylist').on('click',function(){
        var caduca = false
    
        $.get('/salirEvento', function(data, success, error){
            if(error == true){
                console.log(error)
            }else{
               console.log('Salida exitosa -> ', success) 
               vaciarPool();
            }
        }) 
        
        document.getElementById('contadorSpan').remove();
        document.getElementById('usuarios').remove();
        document.getElementsByClassName('imgUsuario').remove();
        
        $('#btnActualizar').css("display","none");
        $(this).css("display","none");
        $('#btnCrear').css("display","inline-block");
        $('#enterPool').css("display","inline-block");
        $('#usuariosDentro').css("display","none");
        $('#createPlaylist').css("display","none");
        $('#codigoMostrado').remove();
        $('<div id="codigoMostrado" style="display:inline-block"></div>').appendTo('#codigoMuestra');
        $('#codigoMuestra').css("display","none")
    })

    $('#salirPlaylist2').on('click',function(){
        vaciarPool2();
        $('#btnActualizar2').css("display","none");
        $(this).css("display","none");
        $('#btnCrear2').css("display","inline-block");
        $('#enterPool2').css("display","inline-block");
        $('#usuariosDentro2').css("display","none");
    })


    
    // Botón REGRESAR en la pantalla de MAPA donde se fija la posición
    
    $('#btnRegresar').on('click',function(){
        $('#mensajeUbicacion').css("display","none");
        $('#map').css("display","none");
        $('#fijarUbicacion').css("display","none");
        $('#btnActualizar').css("display","none");
        $('#btnRegresar').css("display","none");
        $('#btnCrear').css("display","inline-block");
        $('#enterPool').css("display","inline-block");
    })
    
    $('#btnRegresar2').on('click',function(){
        $('#mensajeUbicacion2').css("display","none");
        $('#map2').css("display","none");
        $('#fijarUbicacion2').css("display","none");
        $('#btnActualizar2').css("display","none");
        $('#btnRegresar2').css("display","none");
        $('#btnCrear2').css("display","inline-block");
        $('#enterPool2').css("display","inline-block");
    })
    
    // Botón ELIMINAR Playlist en la playlist del HOST para regresar a la pantalla principal
    
    $('#EliminarPlaylist').on('click',function(){
        document.getElementById('contadorSpan').remove()
        document.getElementById('usuarios').remove()
        document.getElementsByClassName('imgUsuario').remove()
        
        $.get('/salirEvento', function(data, success, error){
            if(error == true){
                console.log(error)
                repetir();
            }else{
               console.log('Salida exitosa -> ', success) 
            }
        }) 
        
        $('#btnActualizar').css("display","none");
        $('#createPlaylist').css("display","none");
        $(this).css("display","none");
        $('#btnCrear').css("display","inline-block");
        $('#enterPool').css("display","inline-block");
        $('#usuariosDentro').css("display","none");
        $('#codigoMostrado').remove();
        $('<div id="codigoMostrado" style="display:inline-block"></div>').appendTo('#codigoMuestra');
        $('#codigoMuestra').css("display","none");
    })

    $('#EliminarPlaylist2').on('click',function(){
        vaciarPool2();
        $('#btnActualizar2').css("display","none");
        $(this).css("display","none");
        $('#btnCrear2').css("display","inline-block");
        $('#enterPool2').css("display","inline-block");
        $('#usuariosDentro2').css("display","none");
    })





    