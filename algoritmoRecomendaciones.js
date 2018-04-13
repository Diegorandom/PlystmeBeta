   /* //Suma para luego sacar promedio
                                         objetosGlobales[position].danceability = objetosGlobales[position].danceability + parseFloat(records._fields[0].properties.danceability);
                                         objetosGlobales[position].energia = objetosGlobales[position].energia + parseFloat(records._fields[0].properties.energia);
                                         objetosGlobales[position].fundamental = objetosGlobales[position].fundamental + parseFloat(records._fields[0].properties.fundamental); 
                                         objetosGlobales[position].amplitud = objetosGlobales[position].amplitud + parseFloat(records._fields[0].properties.amplitud);
                                         objetosGlobales[position].modo = objetosGlobales[position].modo + parseFloat(records._fields[0].properties.modo);
                                         objetosGlobales[position].dialogo = objetosGlobales[position].dialogo + parseFloat(records._fields[0].properties.speechiness);
                                         objetosGlobales[position].acustica = objetosGlobales[position].acustica + parseFloat(records._fields[0].properties.acousticness);
                                         objetosGlobales[position].instrumental = objetosGlobales[position].instrumental + parseFloat(records._fields[0].properties.instrumentalness);
                                         objetosGlobales[position].audiencia = objetosGlobales[position].audiencia + parseFloat(records._fields[0].properties.liveness);
                                         objetosGlobales[position].positivismo = objetosGlobales[position].positivismo + parseFloat(records._fields[0].properties.positivismo);
                                         objetosGlobales[position].tempo = objetosGlobales[position].tempo + parseFloat(records._fields[0].properties.tempo);
                                         objetosGlobales[position].firma_tiempo = objetosGlobales[position].firma_tiempo + parseFloat(records._fields[0].properties.compas);
                                         objetosGlobales[position].duracion = objetosGlobales[position].duracion + parseFloat(records._fields[0].properties.duracion);
                                        
                                        console.log("seedTracks.length")
                                        console.log(objetosGlobales[position].seedTracks.length)
                                        
                                        console.log("index")
                                        console.log(index)
                                        */
                                        
                                         /*if(index == tracks.records.length-1){
                                             
                                           
                                             //Algoritmo 
                        
                                            objetosGlobales[position].danceability = (objetosGlobales[position].danceability/tracks.records.length)*100;
                                            objetosGlobales[position].energia = (objetosGlobales[position].energia/tracks.records.length)*100; 
                                            objetosGlobales[position].fundamental = objetosGlobales[position].fundamental/tracks.records.length;
                                            objetosGlobales[position].amplitud = objetosGlobales[position].amplitud/tracks.records.length;
                                            objetosGlobales[position].modo = objetosGlobales[position].modo/tracks.records.length;
                                            objetosGlobales[position].dialogo = (objetosGlobales[position].dialogo/tracks.records.length)*100;
                                            acustica = (objetosGlobales[position].acustica/tracks.records.length-1)*100;
                                            objetosGlobales[position].positivismo = (objetosGlobales[position].positivismo/tracks.records.length)*100;
                                            objetosGlobales[position].instrumental = (objetosGlobales[position].instrumental/tracks.records.length)*100;
                                            objetosGlobales[position].audiencia = (objetosGlobales[position].audiencia/tracks.records.length)*100;
                                            objetosGlobales[position].tempo = objetosGlobales[position].tempo/tracks.records.length;
                                            objetosGlobales[position].firma_tiempo = objetosGlobales[position].firma_tiempo/tracks.records.length;
                                            objetosGlobales[position].duracion = Math.round(objetosGlobales[position].duracion/tracks.records.length);

                                            console.log('danceability: ' + objetosGlobales[position].danceability);
                                            console.log('energia: ' + objetosGlobales[position].energia);
                                            console.log('fundamental: ' + objetosGlobales[position].fundamental);
                                            console.log('amplitud: ' + objetosGlobales[position].amplitud);
                                            console.log('modo: ' + objetosGlobales[position].modo);
                                            console.log('dialogo: ' + objetosGlobales[position].dialogo);
                                            console.log('acustica: ' + objetosGlobales[position].acustica);
                                            console.log('instrumental: ' + objetosGlobales[position].instrumental);
                                            console.log('audiencia: ' + objetosGlobales[position].audiencia);
                                            console.log('positivismo: ' + objetosGlobales[position].positivismo);
                                            console.log('tempo: ' + objetosGlobales[position].tempo);
                                            console.log('firma_tiempo:' + objetosGlobales[position].firma_tiempo);
                                            console.log('duracion: ' + objetosGlobales[position].duracion);
                                            
                                            //Algoritmo 
                        
                                            objetosGlobales[position].danceability2 = Math.abs(objetosGlobales[position].danceability-50);
                                            objetosGlobales[position].energia2 = Math.abs(objetosGlobales[position].energia-50);
                                             
                                            objetosGlobales[position].fundamental2 = Math.round(Math.abs(objetosGlobales[position].fundamental-5));
                                             
                                            objetosGlobales[position].amplitud2 = (-Math.abs(objetosGlobales[position].amplitud+30));
                                            objetosGlobales[position].acustica2 = Math.abs(objetosGlobales[position].acustica-50);
                                            objetosGlobales[position].dialogo2 = Math.abs(objetosGlobales[position].dialogo-50);
                                            objetosGlobales[position].positivismo2 = Math.abs(objetosGlobales[position].positivismo-50);
                                            objetosGlobales[position].instrumental2 = Math.abs(objetosGlobales[position].instrumental-50);
                                            objetosGlobales[position].audiencia2 = Math.abs(objetosGlobales[position].audiencia-50);

                                            if(Math.random() > 0.5){
                                              objetosGlobales[position].duracion2 = 'min_';  
                                            }else{
                                              objetosGlobales[position].duracion2 = 'max_';   
                                            }


                                            if(objetosGlobales[position].modo == 1){
                                                objetosGlobales[position].modo2 = 0;    
                                            }else if(objetosGlobales[position].modo == 0){
                                               objetosGlobales[position].modo2 = 1;
                                            };
                                            objetosGlobales[position].tempo2 = Math.floor(Math.random() * 201) + 30;

                                            var test = false;

                                            while(test == false){
                                                objetosGlobales[position].firma_tiempo2 = Math.floor(Math.random() * 8) + 2;
                                                if(objetosGlobales[position].firma_tiempo2 != objetosGlobales[position].firma_tiempo){
                                                    test = true;
                                                    console.log('firma_tiempo2 = ' + objetosGlobales[position].firma_tiempo2);
                                                }
                                            }

                                            shuffle(objetosGlobales[position].track_uri_ref2);

                                            var options3 = {
                                              url: 'https://api.spotify.com/v1/recommendations?'+'seed_tracks=' + 
                                              objetosGlobales[position].track_uri_ref2 + '&limit=100&target_acousticness='+ objetosGlobales[position].acustica2 + '&target_danceability=' + 
                                              objetosGlobales[position].danceability2 + '&target_energy=' + objetosGlobales[position].energia2 + '&target_key=' + objetosGlobales[position].fundamental2 + '&target_loudness=' + objetosGlobales[position].amplitud +
                                              '&target_mode=' + objetosGlobales[position].modo2 + '&target_speechiness=' + objetosGlobales[position].dialogo2 + '&target_acousticness=' + objetosGlobales[position].acustica2 + 
                                              '&target_instrumentalness=' + objetosGlobales[position].instrumental2 + '&target_liveness=' + objetosGlobales[position].audiencia2 + '&target_valence=' + objetosGlobales[position].positivismo2 
                                              + '&target_tempo=' + objetosGlobales[position].tempo2 + '&target_time_signature=' + objetosGlobales[position].firma_tiempo2 + '&target_loudness=' + objetosGlobales[position].amplitud2 + '&' + objetosGlobales[position].duracion2 + 'duration_ms=' + objetosGlobales[position].duracion ,
                                              headers: { 'Authorization': 'Bearer ' + objetosGlobales[position].access_token },
                                              json: true
                                            };  
                         
                        

                                            console.log('Resquest de Recomendaciones: ',  options3);


                                            // use the access token to access the Spotify Web API
                                            request.get(options3, function(error, response, bodyS) {
                                            if(error){
                                                console.log("Error al momento de pedir recomendaciones a Spotify: ",error)
                                                res.render("pages/error"); 
                                            }else{
                                                anti_playlist = [];
                                                console.log("Datos:");
                                                console.log("bodyS")
                                                console.log(bodyS)
                                                console.log(bodyS.tracks[0].name);
                                                console.log(bodyS.tracks[0].artists);
                                                console.log(bodyS.tracks[0].album.images[0].url);

                                                console.log("BodyS: " + bodyS.length);

                                                console.log('anti_playlist');
                                                console.log(objetosGlobales[position].anti_playlist);

                                                objetosGlobales[position].anti_playlist = bodyS;

                                                console.log('anti_playlist # de elementos');
                                                console.log(objetosGlobales[position].anti_playlist.length);

                                                objetosGlobales[position].duracion = (objetosGlobales[position].duracion/1000/60);

                                                req.sessions.position = position;
                                                
                                                // we can also pass the token to the browser to make requests from there
                                                

                                            };
                                            });

                                         }*/
                                        
                                        
                                        
                                        
   /* //ALGORITMO
                                         i = i + 1;
                                        console.log('i: ' + i);


                                         //Suma para luego sacar promedio
                                         objetosGlobales[position].danceability = objetosGlobales[position].danceability + parseFloat(data.danceability);
                                         objetosGlobales[position].energia = objetosGlobales[position].energia + parseFloat(data.energy);
                                         objetosGlobales[position].fundamental = objetosGlobales[position].fundamental + parseFloat(data.key); 
                                         objetosGlobales[position].amplitud = objetosGlobales[position].amplitud + parseFloat(data.loudness);
                                         objetosGlobales[position].modo = objetosGlobales[position].modo + parseFloat(data.mode);
                                         objetosGlobales[position].dialogo = objetosGlobales[position].dialogo + parseFloat(data.speechiness);
                                         objetosGlobales[position].acustica = objetosGlobales[position].acustica + parseFloat(data.acousticness);
                                         objetosGlobales[position].instrumental = objetosGlobales[position].instrumental + parseFloat(data.instrumentalness);
                                         objetosGlobales[position].audiencia = objetosGlobales[position].audiencia + parseFloat(data.liveness);
                                         objetosGlobales[position].positivismo = objetosGlobales[position].positivismo + parseFloat(data.valence);
                                         objetosGlobales[position].tempo = objetosGlobales[position].tempo + parseFloat(data.tempo);
                                         objetosGlobales[position].firma_tiempo = objetosGlobales[position].firma_tiempo + parseFloat(data.time_signature);
                                         objetosGlobales[position].duracion = objetosGlobales[position].duracion + parseFloat(data.duration_ms);

                                           
                                        if(i == objetosGlobales[position].num){
                                      objetosGlobales[position].danceability = (objetosGlobales[position].danceability/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].energia = (objetosGlobales[position].energia/objetosGlobales[position].num)*100; 
                                            objetosGlobales[position].fundamental = objetosGlobales[position].fundamental/objetosGlobales[position].num;
                                            objetosGlobales[position].amplitud = objetosGlobales[position].amplitud/objetosGlobales[position].num;
                                            objetosGlobales[position].modo = objetosGlobales[position].modo/objetosGlobales[position].num;
                                            objetosGlobales[position].dialogo = (objetosGlobales[position].dialogo/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].acustica = (objetosGlobales[position].acustica/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].positivismo = (objetosGlobales[position].positivismo/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].instrumental = (objetosGlobales[position].instrumental/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].audiencia = (objetosGlobales[position].audiencia/objetosGlobales[position].num)*100;
                                            objetosGlobales[position].tempo = objetosGlobales[position].tempo/objetosGlobales[position].num;
                                            objetosGlobales[position].firma_tiempo = objetosGlobales[position].firma_tiempo/objetosGlobales[position].num;
                                            objetosGlobales[position].duracion = Math.round(objetosGlobales[position].duracion/objetosGlobales[position].num);

                                            console.log('danceability: ' + objetosGlobales[position].danceability);
                                            console.log('energia: ' + objetosGlobales[position].energia);
                                            console.log('fundamental: ' + objetosGlobales[position].fundamental);
                                            console.log('amplitud: ' + objetosGlobales[position].amplitud);
                                            console.log('modo: ' + objetosGlobales[position].modo);
                                            console.log('dialogo: ' + objetosGlobales[position].dialogo);
                                            console.log('acustica: ' + objetosGlobales[position].acustica);
                                            console.log('instrumental: ' + objetosGlobales[position].instrumental);
                                            console.log('audiencia: ' + objetosGlobales[position].audiencia);
                                            console.log('positivismo: ' + objetosGlobales[position].positivismo);
                                            console.log('tempo: ' + objetosGlobales[position].tempo);
                                            console.log('firma_tiempo:' + objetosGlobales[position].firma_tiempo);
                                            console.log('duracion: ' + objetosGlobales[position].duracion);
                                            
                                            //Algoritmo 
                        
                                            objetosGlobales[position].danceability2 = Math.abs(objetosGlobales[position].danceability-50);
                                            objetosGlobales[position].energia2 = Math.abs(objetosGlobales[position].energia-50);
                                            objetosGlobales[position].fundamental2 = Math.round(Math.abs(objetosGlobales[position].fundamental-5));
                                            objetosGlobales[position].amplitud2 = (-Math.abs(objetosGlobales[position].amplitud+30));
                                            objetosGlobales[position].acustica2 = Math.abs(objetosGlobales[position].acustica-50);
                                            objetosGlobales[position].dialogo2 = Math.abs(objetosGlobales[position].dialogo-50);
                                            objetosGlobales[position].positivismo2 = Math.abs(objetosGlobales[position].positivismo-50);
                                            objetosGlobales[position].instrumental2 = Math.abs(objetosGlobales[position].instrumental-50);
                                            objetosGlobales[position].audiencia2 = Math.abs(objetosGlobales[position].audiencia-50);

                                            if(Math.random() > 0.5){
                                              objetosGlobales[position].duracion2 = 'min_';  
                                            }else{
                                              objetosGlobales[position].duracion2 = 'max_';   
                                            }


                                            if(objetosGlobales[position].modo == 1){
                                                objetosGlobales[position].modo2 = 0;    
                                            }else if(objetosGlobales[position].modo == 0){
                                               objetosGlobales[position].modo2 = 1;
                                            };
                                            objetosGlobales[position].tempo2 = Math.floor(Math.random() * 201) + 30;

                                            var test = false;

                                            while(test == false){
                                                objetosGlobales[position].firma_tiempo2 = Math.floor(Math.random() * 8) + 2;
                                                if(objetosGlobales[position].firma_tiempo2 != objetosGlobales[position].firma_tiempo){
                                                    test = true;
                                                    console.log('firma_tiempo2 = ' + objetosGlobales[position].firma_tiempo2);
                                                }
                                            }

                                            shuffle(objetosGlobales[position].track_uri_ref2);

                                            var options3 = {
                                              url: 'https://api.spotify.com/v1/recommendations?'+'seed_tracks=' + 
                                              objetosGlobales[position].track_uri_ref2 + '&limit=100&target_acousticness='+ objetosGlobales[position].acustica2 + '&target_danceability=' + 
                                              objetosGlobales[position].danceability2 + '&target_energy=' + objetosGlobales[position].energia2 + '&target_key=' + objetosGlobales[position].fundamental2 + '&target_loudness=' + objetosGlobales[position].amplitud +
                                              '&target_mode=' + objetosGlobales[position].modo2 + '&target_speechiness=' + objetosGlobales[position].dialogo2 + '&target_acousticness=' + objetosGlobales[position].acustica2 + 
                                              '&target_instrumentalness=' + objetosGlobales[position].instrumental2 + '&target_liveness=' + objetosGlobales[position].audiencia2 + '&target_valence=' + objetosGlobales[position].positivismo2 
                                              + '&target_tempo=' + objetosGlobales[position].tempo2 + '&target_time_signature=' + objetosGlobales[position].firma_tiempo2 + '&target_loudness=' + objetosGlobales[position].amplitud2 + '&' + objetosGlobales[position].duracion2 + 'duration_ms=' + objetosGlobales[position].duracion ,
                                              headers: { 'Authorization': 'Bearer ' + objetosGlobales[position].access_token },
                                              json: true
                                            };  
                        

                                            console.log('Resquest de Recomendaciones: ',  options3);


                                            // use the access token to access the Spotify Web API
                                            request.get(options3, function(error, response, bodyS) {
                                            if(error){
                                                console.log("Error al momento de pedir recomendaciones a Spotify: ",error)
                                                res.render("pages/error"); 
                                            }else{
                                                anti_playlist = [];
                                                console.log("Datos:");
                                                console.log("bodyS")
                                                console.log(bodyS)
                                                console.log(bodyS.tracks[0].name);
                                                console.log(bodyS.tracks[0].artists);
                                                console.log(bodyS.tracks[0].album.images[0].url);

                                                console.log("BodyS: " + bodyS.length);

                                                console.log('anti_playlist');
                                                console.log(objetosGlobales[position].anti_playlist);

                                                objetosGlobales[position].anti_playlist = bodyS;

                                                console.log('anti_playlist # de elementos');
                                                console.log(objetosGlobales[position].anti_playlist.length);

                                                objetosGlobales[position].duracion = (objetosGlobales[position].duracion/1000/60);

                                                req.sessions.position = position
                                                
                                                // we can also pass the token to the browser to make requests from there
                                                
                                                
                                               }; 
                                            });

                                        };

                                        */



<% seedTracks.forEach(function(records, index){ %>
                                    
                           <h4 style="font-family: 'Josefin Slab', serif;" ># <%=index + 1%></h4>  
                                   
                          <div class="be-largepost-iframe  
							embed-responsive embed-responsive-16by9 centro" style="text-align: center; width:inherit;" >
                                
                                
								 <iframe src="https://open.spotify.com/embed?uri=<%=records%>&theme=white&view=coverart" width="640" height="720" frameborder="0" allowtransparency="true" class="hidden-xs centro" style="text-align: center; " ></iframe>
                              
                                <iframe src="https://open.spotify.com/embed?uri=<%=records%>&theme=white&view=coverart" width="339" height="400" frameborder="0" allowtransparency="true" class="centro visible-xs centro" style="text-align: center;  margin-left:20px;" ></iframe>
                                
                              
							</div>	
                       
                                    
                        <% }) %>