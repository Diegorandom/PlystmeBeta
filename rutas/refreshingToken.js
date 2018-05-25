var express = require("express");
var router = new express.Router();
var request = require("request");


/*Se ejecuta la ruta del perfil para renderizarlo*/
router.post('/refreshingToken', function(request, response, error) {
     var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    console.log('apuntador del objeto', position);
    
    if(objetosGlobales[position] != undefined || objetosGlobales[position].refresh_token != null ){
      /*EN CASO DE QUE LA VARIABLE CODE SEA NULA, UTILIZAMOS EL EL REFRESH TOKEN PARA ENTRAR AL SISTEMA DE SPOTOFY*/
      
      console.log('SOLICITANDO NUEVO ACCESS TOKEN')
      
      objetosGlobales[positionRefresh].refreshing = true;
      
      /*En caso de que la conexión sea legítima se procede con el proceso*/
    res.clearCookie(objetosGlobales[0].stateKey);
      
      /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        refresh_token: objetosGlobales[positionRefresh].refresh_token,
        redirect_uri: objetosGlobales[0].redirect_uri,
        grant_type: 'refresh_token'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(objetosGlobales[0].client_id + ':' + objetosGlobales[0].client_secret).toString('base64'))
      },
      json: true
    };
      
      /*Inicialización de objeto de usuario*/
      var jsonDatos = {nombre:"", ref:false, email:null, external_urls:null, seguidores:null, imagen_url:null, pais:null, access_token:null, track_uri:[], track_uri_ref:null, num:50, danceability:0, energia:0, fundamental:0, amplitud:0, modo:0, dialogo:0, acustica:0, instrumental:0, audiencia:0, positivismo:0, tempo:0, firma_tiempo:0, duracion:0, danceability2:0, energia2:0, fundamental2:0, amplitud2:0, modo2:0, dialogo2:0, acustica2:0, instrumental2:0, audiencia2:0, positivismo2:0, tempo2:0, firma_tiempo2:0, duracion2:0, followers:null, anti_playlist:[], trackid:null ,artist_data:[], track_uri_ref2:[], seedTracks:[], userid:null, seed_shuffled:null, pass:null, pass2:null, mes:null, dia:null, año:null, noticias:null, Userdata:[], mensaje:null, add:null, spotifyid:null, totalUsers:0, pool:[], playlist:[], popularidadAvg:0,usuarios:[], bdEstado:"NoGuardado", rango:"long_term", cambioRango:false, refresh_token:null, refreshing:false}

      /*Requerimiento de perfil de usuario vía API*/
    request.post(authOptions, function(error, response, bodyS) {
        
        /*En caso de que la solicitud a la API sea exitosa se procede*/
      if (!error && response.statusCode === 200) {
           
          console.log('Actualizacion de token exitosa')
          
          objetosGlobales[0].spotifyApi.setAccessToken(bodyS.access_token);
          
          objetosGlobales[0].access_token=bodyS.access_token;
          
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + bodyS.access_token },
          json: true
        };

        /*Utilizando el token de acceso de la autorizacion se procede a solicitar los datos del usuario*/
        request.get(options, function(error, response, bodyS) {
            if(error == true){
                res.render('pages/error', {error:error})
            }else{
             /*Se guarda la información del usuario en el objeto global correspondiente*/
            jsonDatos.userid = bodyS.id;
            jsonDatos.followers = bodyS.followers.total;    
            console.log("userid:" + jsonDatos.userid + '\n');
            objetosGlobales[position]= jsonDatos;
            objetosGlobales[position].access_token = objetosGlobales[0].access_token;
            /*Se elimina el access_token del usuario del objeto neutral para que este sea no contamine a otros usuarios con información que no le corresponde*/
            objetosGlobales[0].access_token = null
            objetosGlobales[position].pais = bodyS.country;
            objetosGlobales[position].nombre = bodyS.display_name;
            objetosGlobales[position].email = bodyS.email;
            objetosGlobales[position].external_urls = bodyS.external_urls;
            
            //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG de jona
            imagen_url = "";
            if(bodyS.images[0] != undefined){
                console.log('imagen_url');
                console.log(imagen_url);
                objetosGlobales[position].imagen_url =  bodyS.images[0].url;
                console.log('imagen_url');
                console.log(imagen_url);
            };
             
            objetosGlobales[position].refresh_token = bodyS.refresh_token;
            
            console.log('Comienza proceso de revisión en base de datos para verificar si es un usuario nuevo o ya está regitrado \n');
            console.log('');
            
            /*Se consulta si el usuario ya existe en la base de datos*/
             objetosGlobales[0].session
            .run('MATCH (n:usuario) WHERE n.spotifyid={spotifyid} RETURN n', {spotifyid:jsonDatos.userid})
            .then(function(checkid_result){ 
                 console.log('')
                 console.log('se realizó la consulta a la base de datos')
                 
                 console.log('checkid_result.length:');
                 console.log(checkid_result.records.length)
                 
                        console.log('');
                    /*En caso de que el usuario nuevo se comienza a guardar su información en la base de datos*/
                        if(checkid_result.records.length< 1){ 
                            console.log(' \n el usuario es nuevo \n');
                            console.log('')
                            console.log('Se creará nuevo record en base de datos');
                            objetosGlobales[position].mensaje = "nuevo_usuario";
                            
                            
                            /*Se crea el nodo del usuario en la BD*/
                            objetosGlobales[0].session
                            .run('CREATE (n:usuario {pais:{pais}, nombre:{nombre}, email:{email}, external_urls:{external_urls}, seguidores:{followers}, spotifyid:{spotifyid}, imagen_url: {imagen_url} })', { pais:objetosGlobales[position].pais, nombre:objetosGlobales[position].nombre, email:objetosGlobales[position].email, external_urls:objetosGlobales[position].external_urls.spotify, spotifyid:objetosGlobales[position].userid, followers:objetosGlobales[position].followers, imagen_url:objetosGlobales[position].imagen_url })
                            .then(function(resultado_create){
                                console.log('Se creó con éxito el nodo del usuario');

                                 })
                            .catch(function(err){
                                console.log(err);
                                res.render('pages/error', {error:err})

                            }) 
                            
                            // mount the router on the app
                            res.redirect('/mineria');
                          
                        }else if(checkid_result.records.length >= 1){
                            console.log('Este usuario ya está registrado (no debería ser más de 1)')
                            
                            /*cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                            objetosGlobales[position].bdEstado="guardado"
                            
                            objetosGlobales[position].mensaje = "nuevo_login";
                
                            // mount the router on the app
                            res.redirect('/mineria'); 
                     
                        }else{
                            console.log('No se pudo determinar si es un usuario nuevo o registrado')
                            res.render('pages/error', {error:'No se pudo determinar si es un usuario nuevo o registrado'})
                        }
             })
            .catch(function(err){
                console.log(err);
                res.render('pages/error', {error:err})
            }) 
            }
            
        })
      
      }else{
          res.render('pages/error', {error:error})
      }
    })
  
 

    }else{
        response.redirect('/login')
        console.log('Refresh token es NULL')
    } 
    
})

/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/refreshingToken', function(request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;
    console.log('apuntador del objeto', position);
    
    if(objetosGlobales[position] != undefined || objetosGlobales[position].refresh_token != null ){
      /*EN CASO DE QUE LA VARIABLE CODE SEA NULA, UTILIZAMOS EL EL REFRESH TOKEN PARA ENTRAR AL SISTEMA DE SPOTOFY*/
      
      console.log('SOLICITANDO NUEVO ACCESS TOKEN')
      
      objetosGlobales[positionRefresh].refreshing = true;
      
      /*En caso de que la conexión sea legítima se procede con el proceso*/
    res.clearCookie(objetosGlobales[0].stateKey);
      
      /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        refresh_token: objetosGlobales[positionRefresh].refresh_token,
        redirect_uri: objetosGlobales[0].redirect_uri,
        grant_type: 'refresh_token'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(objetosGlobales[0].client_id + ':' + objetosGlobales[0].client_secret).toString('base64'))
      },
      json: true
    };
      
      /*Inicialización de objeto de usuario*/
      var jsonDatos = {nombre:"", ref:false, email:null, external_urls:null, seguidores:null, imagen_url:null, pais:null, access_token:null, track_uri:[], track_uri_ref:null, num:50, danceability:0, energia:0, fundamental:0, amplitud:0, modo:0, dialogo:0, acustica:0, instrumental:0, audiencia:0, positivismo:0, tempo:0, firma_tiempo:0, duracion:0, danceability2:0, energia2:0, fundamental2:0, amplitud2:0, modo2:0, dialogo2:0, acustica2:0, instrumental2:0, audiencia2:0, positivismo2:0, tempo2:0, firma_tiempo2:0, duracion2:0, followers:null, anti_playlist:[], trackid:null ,artist_data:[], track_uri_ref2:[], seedTracks:[], userid:null, seed_shuffled:null, pass:null, pass2:null, mes:null, dia:null, año:null, noticias:null, Userdata:[], mensaje:null, add:null, spotifyid:null, totalUsers:0, pool:[], playlist:[], popularidadAvg:0,usuarios:[], bdEstado:"NoGuardado", rango:"long_term", cambioRango:false, refresh_token:null, refreshing:false}

      /*Requerimiento de perfil de usuario vía API*/
    request.post(authOptions, function(error, response, bodyS) {
        
        /*En caso de que la solicitud a la API sea exitosa se procede*/
      if (!error && response.statusCode === 200) {
           
          console.log('Actualizacion de token exitosa')
          
          objetosGlobales[0].spotifyApi.setAccessToken(bodyS.access_token);
          
          objetosGlobales[0].access_token=bodyS.access_token;
          
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + bodyS.access_token },
          json: true
        };

        /*Utilizando el token de acceso de la autorizacion se procede a solicitar los datos del usuario*/
        request.get(options, function(error, response, bodyS) {
            if(error == true){
                res.render('pages/error', {error:error})
            }else{
             /*Se guarda la información del usuario en el objeto global correspondiente*/
            jsonDatos.userid = bodyS.id;
            jsonDatos.followers = bodyS.followers.total;    
            console.log("userid:" + jsonDatos.userid + '\n');
            objetosGlobales[position]= jsonDatos;
            objetosGlobales[position].access_token = objetosGlobales[0].access_token;
            /*Se elimina el access_token del usuario del objeto neutral para que este sea no contamine a otros usuarios con información que no le corresponde*/
            objetosGlobales[0].access_token = null
            objetosGlobales[position].pais = bodyS.country;
            objetosGlobales[position].nombre = bodyS.display_name;
            objetosGlobales[position].email = bodyS.email;
            objetosGlobales[position].external_urls = bodyS.external_urls;
            
            //EN CASO DE QUE EL USUARIO NO TENGA FOTORGRAÍA DEFINIDA #BUG de jona
            imagen_url = "";
            if(bodyS.images[0] != undefined){
                console.log('imagen_url');
                console.log(imagen_url);
                objetosGlobales[position].imagen_url =  bodyS.images[0].url;
                console.log('imagen_url');
                console.log(imagen_url);
            };
             
            objetosGlobales[position].refresh_token = bodyS.refresh_token;
            
            console.log('Comienza proceso de revisión en base de datos para verificar si es un usuario nuevo o ya está regitrado \n');
            console.log('');
            
            /*Se consulta si el usuario ya existe en la base de datos*/
             objetosGlobales[0].session
            .run('MATCH (n:usuario) WHERE n.spotifyid={spotifyid} RETURN n', {spotifyid:jsonDatos.userid})
            .then(function(checkid_result){ 
                 console.log('')
                 console.log('se realizó la consulta a la base de datos')
                 
                 console.log('checkid_result.length:');
                 console.log(checkid_result.records.length)
                 
                        console.log('');
                    /*En caso de que el usuario nuevo se comienza a guardar su información en la base de datos*/
                        if(checkid_result.records.length< 1){ 
                            console.log(' \n el usuario es nuevo \n');
                            console.log('')
                            console.log('Se creará nuevo record en base de datos');
                            objetosGlobales[position].mensaje = "nuevo_usuario";
                            
                            
                            /*Se crea el nodo del usuario en la BD*/
                            objetosGlobales[0].session
                            .run('CREATE (n:usuario {pais:{pais}, nombre:{nombre}, email:{email}, external_urls:{external_urls}, seguidores:{followers}, spotifyid:{spotifyid}, imagen_url: {imagen_url} })', { pais:objetosGlobales[position].pais, nombre:objetosGlobales[position].nombre, email:objetosGlobales[position].email, external_urls:objetosGlobales[position].external_urls.spotify, spotifyid:objetosGlobales[position].userid, followers:objetosGlobales[position].followers, imagen_url:objetosGlobales[position].imagen_url })
                            .then(function(resultado_create){
                                console.log('Se creó con éxito el nodo del usuario');

                                 })
                            .catch(function(err){
                                console.log(err);
                                res.render('pages/error', {error:err})

                            }) 
                            
                            // mount the router on the app
                            res.redirect('/mineria');
                          
                        }else if(checkid_result.records.length >= 1){
                            console.log('Este usuario ya está registrado (no debería ser más de 1)')
                            
                            /*cambia el estado de la BD A GUARDADO cuando se han analizado todos los tracks del usuario. la ruta /chequeoDB está constantemente checando el estado para decidir el momento adecuado para detonar la API que procesa las preferencias del usuario para mostrarlas en la pantalla principal de la interfaz*/
                            objetosGlobales[position].bdEstado="guardado"
                            
                            objetosGlobales[position].mensaje = "nuevo_login";
                
                            // mount the router on the app
                            res.redirect('/mineria'); 
                     
                        }else{
                            console.log('No se pudo determinar si es un usuario nuevo o registrado')
                            res.render('pages/error', {error:'No se pudo determinar si es un usuario nuevo o registrado'})
                        }
             })
            .catch(function(err){
                console.log(err);
                res.render('pages/error', {error:err})
            }) 
            }
            
        })
      
      }else{
          res.render('pages/error', {error:error})
      }
    })
  
 

    }else{
        response.redirect('/login')
        console.log('Refresh token es NULL')
    } 
    
})

//Finaliza proceso
module.exports = router;
