

// Note: This example requires that you consent to location sharing when
      // prompted by your browser. If you see the error "The Geolocation service
      // failed.", it means you probably did not give permission for the browser to
      // locate you.
    
var mapa = document.createElement('script')
        mapa.src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCtA2WyXGMPMY9Nk642s_bSkEEp_5tguoU"
        var contenedorMapa = document.getElementById('mapa')
        contenedorMapa.appendChild(mapa)

    $('#btnCrear').on('click',function(){
        
        
        
        function creacionMapa(){
            console.log('Creación de mapa..')
           

                var map = new google.maps.Map(document.getElementById('map'), {
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


                    $('#fijarUbicacion').on('click',function(){
                       /* $.get("/posicionUsuarios", {pos:pos}, function(status, data, error){
                            if(error == true || data == undefined || status != "success"){
                                console.log('error al enviar posición')
                                console.log(data)
                                console.log(status)
                                console.log(error)
                            }else{
                                console.log(data)
                                console.log(status)
                                enterPool()
                                enterPool2()
                            }
                        }) */
                    }) 


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

                  }, function() {
                    handleLocationError(true, infoWindow, map.getCenter());
                  });
                } else {
                  // Browser doesn't support Geolocation
                  handleLocationError(false, infoWindow, map.getCenter());
                }
            
        }
        
        
        creacionMapa()
               
    });



        
        $('#btnCrear2').on('click',function(){
        
        function creacionMapa(){
        
            var map = new google.maps.Map(document.getElementById('map2'), {
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
                
                $('#fijarUbicacion').on('click',function(){
                    $.post("/posicionUsuario", pos, function(status, data, error){
                        if(error == true || data == undefined || status != "success"){
                            console.log('error al enviar posición')
                            console.log(data)
                            console.log(status)
                            console.log(error)
                        }else{
                            console.log(data)
                            console.log(status)
                        }
                    })
                })
                
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

              }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
              });
            } else {
              // Browser doesn't support Geolocation
              handleLocationError(false, infoWindow, map.getCenter());
            }
        }
        
        setTimeout(creacionMapa,1000)
        
        
        
        
           
    });

      

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }