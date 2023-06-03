export var io = require('socket.io');

module.exports =  {
	call : function(socket, server) {
		io(server);
    
		console.log('Nueva conexión con id -> ' + socket.id);
    
		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
    
		socket.on('EventoConexion', function(mensaje){
			console.log(mensaje.data);
			console.log('Usuario conectado!');
		});
    
		io.emit('conexionServidor', {mensaje:'Mensaje de prueba de servidor a cliente' });
    
		/*Código de creación de Evento*/
        
		var codigoEvento;
        
		socket.on('crearEvento', function(msg, codigoEvento){
			console.log('Evento creado');
			console.log('Posicion del evento -> ', msg.posicion);    
			console.log('Id del host -> ', msg.userId);    
			codigoEvento = generateRandomStringCode(5);
			console.log('Codigo del evento -> ', codigoEvento);
            
			var userId = msg.userId;
            
			if(userId != undefined || msg.posicion != undefined ){ 
				/*Se crea registro del evento en BD*/
				eventCreationErrorCounter=0;
				const createEvent = () =>{
					const promesaCrearEvento = objetosGlobales[0].session[0]
						.writeTransaction(tx => tx.run('MATCH (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (m)-[:Host {status:true}]->(n:Evento {codigoEvento:{codigoEvento}, lat:{lat}, lng:{lng}, status:true}) Return n,m', {codigoEvento:codigoEvento, lat:msg.posicion.lat, lng:msg.posicion.lng, spotifyidUsuario:userId}));
    
					promesaCrearEvento
						.then(function(evento){
							console.log('Registro de Evento -> ', evento.records[0]._fields);
                        
							var usuarios = [];
                    
							evento.records[0]._fields.forEach(function(item, index){
								var nombre = item.properties.nombre;
								var imagen = item.properties.imagen_url;
								var id = item.properties.spotifyid;
    
								if(nombre == undefined && id != undefined && index != 0){
									usuarios.push([id,imagen]);
								}else if(index != 0){
									usuarios.push([nombre,imagen]); 
								}
                            
								if( evento.records[0]._fields.length == index+1){
									console.log('Usuarios en evento -> ', usuarios);
									io.to(socket.id).emit('eventoCreado', {codigoEvento: codigoEvento, userId:userId, usuarios:usuarios});
								}
                            
							});
                        
                        
							/*JOIN crea el room cuyo ID será el código del evento*/
							socket.join(codigoEvento);
    
						});
    
					promesaCrearEvento
						.catch(function(err){
							console.log(err);
							eventCreationErrorCounter++;
							if(eventCreationErrorCounter>5){
								eventCreationErrorCounter=0;
								io.to(socket.id).emit('errorCrearEvento');
							}else{
								createEvent();
							}
                        
						});
				};
				createEvent();
				/*JOIN crea el room cuyo ID será el código del evento*/
				socket.join(codigoEvento);
            
			}else{
				console.log(' Error = userId -> ', userId, 'msg.posicion ->', msg.posicion );
			}
            
		});
        
		socket.on('crearEventoCodigo', function(msg, codigoEvento){
			console.log('Evento creado por Código');
			console.log('Id del host -> ', msg.userId);    
			codigoEvento = generateRandomStringCode(5);
			var userId = msg.userId;
            
			if(userId != undefined){ 
				/*Se crea registro del evento en BD*/
				eventCodeCreationErrorCounter=0;
				const createCodeEvent = () =>{
					const promesaCrearEvento = objetosGlobales[0].session[0]
						.writeTransaction(tx => tx.run('MATCH (m:usuario {spotifyid:{spotifyidUsuario}}) CREATE (m)-[:Host {status:true}]->(n:Evento {codigoEvento:{codigoEvento}, status:true}) Return n,m', {codigoEvento:codigoEvento, spotifyidUsuario:userId}));
    
					promesaCrearEvento
						.then(function(evento){
							console.log('Registro de Evento -> ', evento.records[0]._fields);
                        
							var usuarios = [];
                    
							evento.records[0]._fields.forEach(function(item, index){
								var nombre = item.properties.nombre;
								var imagen = item.properties.imagen_url;
								var id = item.properties.spotifyid;
    
								if(nombre == undefined && id != undefined && index != 0){
									usuarios.push([id,imagen]);
								}else if(index != 0){
									usuarios.push([nombre,imagen]); 
								}
                            
								if( evento.records[0]._fields.length == index+1){
									console.log('Usuarios en evento -> ', usuarios);
									io.to(socket.id).emit('eventoCreadoCodigo', {codigoEvento: codigoEvento, userId:userId, usuarios:usuarios});
								}
                            
							});
                        
                        
							/*JOIN crea el room cuyo ID será el código del evento*/
							socket.join(codigoEvento);
    
						});
    
					promesaCrearEvento
						.catch(function(err){
							console.log(err);
							eventCodeCreationErrorCounter++;
							if(eventCodeCreationErrorCounter>5){
								eventCodeCreationErrorCounter=0;
								io.to(socket.id).emit('errorCrearEvento');
							}else{
								createCodeEvent();
							}
                       
						});
				};
				createCodeEvent();
                    
			}else{
				console.log(' Error = userId -> ', userId, 'msg.posicion ->', msg.posicion );
			}
            
		});
        
        
		/*
        multi rooms
        https://gist.github.com/crtr0/2896891
        */
        
        
		socket.on('usuarioNuevoCodigo', function(msg, codigoEvento){
			console.log('Cookies via Socket ->', socket.request.headers.cookie);
			console.log('Position via Socket ->', socket.request.position);
			console.log('Un nuevo usario se quiere unir a un evento por código');
			console.log('Codigo del evento - ', msg.codigoEvento);
			console.log('UserId del usuario que quiere entrar - ', msg.userId);
			codigoEvento = msg.codigoEvento;
			var userId = msg.userId;
            
			const promesaChecarEvento = objetosGlobales[0].session[0]
				.writeTransaction(tx => tx.run('MATCH (n:Evento) WHERE n.codigoEvento={codigoEvento} AND n.status=true RETURN n.codigoEvento', {codigoEvento:codigoEvento}));
            
			promesaChecarEvento
				.then(function(codigoBD){
					console.log('Resultado de búsqueda de código en BD ->', codigoBD.records[0] );
					if(codigoBD.records[0] != undefined){
						console.log('Usuario -> ', userId, ' entró a evento -> ', codigoEvento);
						socket.join(codigoEvento);
                        
						const promesaChecarUsuario = objetosGlobales[0].session[0]
							.writeTransaction(tx => tx.run('MATCH (n:Evento {codigoEvento:{codigoEvento}})<-[]-(u:usuario)  WHERE u.spotifyid={spotifyidUsuario} RETURN u.spotifyid', {codigoEvento:codigoEvento, spotifyidUsuario:userId}));
                            
						promesaChecarUsuario
							.then(function(usuarioId){
                            
								if(usuarioId.records[0] == undefined){
                                                                    
									console.log('Guardando nuevo invitado en el evento de la BD');
                                    
									const promesaNuevoUsuario = objetosGlobales[0].session[0]
										.writeTransaction(tx => tx.run('MATCH (m:usuario {spotifyid:{spotifyidUsuario}}), (n:Evento {codigoEvento:{codigoEvento}}) CREATE p=(m)-[r:Invitado {status:true}]->(n) Return p', {spotifyidUsuario:userId, codigoEvento:codigoEvento}));
    
									promesaNuevoUsuario 
										.then(function(unionUsuarioEvento){
											console.log('unionUsuarioEvento');
											console.log('Nuevo usuario ',userId,' -> añadido a evento en BD-> ', codigoEvento);
                                            
											const promesaEventoUsuario= objetosGlobales[0].session[0]
												.writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[{status:true}]-(u:usuario) RETURN u', { codigoEvento:codigoEvento}));
                                                
											promesaEventoUsuario
												.then(function(ids){
													console.log('Resultado de busqueda -> ', ids.records);
    
													var idsEvento = [];
													var usuarios = [];
                                                    
													ids.records.forEach(function(item, index){
                                                        
														console.log('item -> ', item._fields);
                                                        
														idsEvento.push(item._fields[0].properties.spotifyid);
                                                        
														var nombre = item._fields[0].properties.nombre;
														var imagen = item._fields[0].properties.imagen_url;
														var id = item._fields[0].properties.spotifyid;
    
														if(nombre == undefined && id != undefined){
															usuarios.push([id,imagen]);
														}else{
															usuarios.push([nombre,imagen]); 
														}
    
														if( ids.records.length == usuarios.length){
															console.log('Room a actualizar -> ', codigoEvento);
															console.log('Usuarios en evento -> ', usuarios);
															console.log('Ids en evento -> ', idsEvento);
                                                                
															io.to(codigoEvento).emit('usuarioEntra',{codigoEvento: codigoEvento, userId:userId, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios});
                                                                
                                                                
														}
                                                       
														objetosGlobales[0].session[0].close();
                                                        
													});
                                                    
                                                  
												});
											promesaNuevoUsuario
												.catch(function(err){
													console.log(err);
													io.to(socket.id).emit('errorNuevoUsuario');
                                                
												});
                                            
										});
    
									promesaNuevoUsuario
										.catch(function(err){
											console.log(err);
											io.to(socket.id).emit('errorNuevoUsuario');
										});
									promesaNuevoUsuario
										.catch(function(err){
											console.log(err);
											io.to(socket.id).emit('errorchecarEvento');
										});
                                    
								}else{
									console.log('El usuario ya está registrado en el evento de la BD');
                                    
									const promesaUnirUsuario= objetosGlobales[0].session[0]
										.writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[r]-(u:usuario {spotifyid:{userId}}) SET r.status = true RETURN u', { codigoEvento:codigoEvento, userId:userId}));
                                    
									promesaUnirUsuario
										.then(function(usuarioUnido){
                                        
											const promesaEventoUsuario= objetosGlobales[0].session[0]
												.writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[r {status:true}]-(u:usuario) RETURN u', { codigoEvento:codigoEvento}));
                                                
											promesaEventoUsuario
												.then(function(ids){console.log('Resultado de busqueda -> ', ids.records);
    
													var idsEvento = [];
													var usuarios = [];
                                                    
													ids.records.forEach(function(item, index){
                                                        
														console.log('item -> ', item._fields);
                                                        
														idsEvento.push(item._fields[0].properties.spotifyid);
                                                        
														var nombre = item._fields[0].properties.nombre;
														var imagen = item._fields[0].properties.imagen_url;
														var id = item._fields[0].properties.spotifyid;
    
														if(nombre == undefined && id != undefined){
															usuarios.push([id,imagen]);
														}else{
															usuarios.push([nombre,imagen]); 
														}
    
														if( ids.records.length == usuarios.length){
															console.log('Room a actualizar -> ', codigoEvento);
															console.log('Usuarios en evento -> ', usuarios);
															console.log('Ids en evento -> ', idsEvento);
                                                                
															io.to(codigoEvento).emit('usuarioEntra',{codigoEvento: codigoEvento, userId:userId, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios});
														}
                                                       
                                                      
                                                        
													});
													objetosGlobales[0].session[0].close();
                                                  
												});
											promesaEventoUsuario
												.catch(function(err){
													console.log(err);
													io.to(socket.id).emit('errorNuevoEventoUsuario');
												});
										});
                                    
									promesaUnirUsuario
										.catch(function(err){
											console.log(err);
											io.to(socket.id).emit('errorUnirUsuario');
										});
                                    
                                   
								}
                                
							});
                        
                            
    
					}else{
						console.log('Código Inválido');
						io.to(socket.id).emit('codigoInvalido', {codigoInvalido:codigoEvento});
					}
				});
            
			promesaChecarEvento
				.catch(function(err){
					console.log(err);
					io.to(socket.id).emit('errorchecarEvento');
				});
            
            
		});
        
		socket.on('usuarioNuevoUbicacion', function(msg, codigoEvento){
			console.log('Un nuevo usuario se quiere unir a un evento por geolocalización');
			console.log('UserId del usuario que quiere entrar - ', msg.userId);
			var userId = msg.userId;
			var lat = msg.posicion.lat;
			var lng = msg.posicion.lng;
			//157m de radio.
			var radio = 0.001;
            
			console.log('Latitud del usuario -> ', lat);
			console.log('Longitud del usuario -> ', lng);
			console.log('radio -> ', radio);
            
			const promesaChecarPosEvento = objetosGlobales[0].session[0]
				.writeTransaction(tx => tx.run('MATCH (n:Evento)-[r:Host]-(u:usuario) WHERE {latUser} < (n.lat+{radio}) AND {latUser} > (n.lat-{radio}) AND {lngUser} < (n.lng+{radio}) AND {lngUser} > (n.lng-{radio}) AND n.status=true RETURN n.codigoEvento, u.nombre',{ latUser:lat, radio:radio, lngUser:lng }));
                
			promesaChecarPosEvento 
				.then(function(codigoBD){
					console.log('codigoBD -> ', codigoBD );
                    
					if(codigoBD.records[0] != undefined && codigoBD.records.length == 1){
						var codigoEvento = codigoBD.records[0]._fields[0];
                        
                        
                        
						console.log('Usuario -> ', userId, ' entró a evento -> ', codigoEvento);
						socket.join(codigoEvento);
                        
						const promesaChecarUsuario = objetosGlobales[0].session[0]
							.writeTransaction(tx => tx.run('MATCH (n:Evento {codigoEvento:{codigoEvento}})<-[]-(u:usuario)  WHERE u.spotifyid={spotifyidUsuario} RETURN u.spotifyid', {codigoEvento:codigoEvento, spotifyidUsuario:userId}));
                            
						promesaChecarUsuario
							.then(function(usuarioId){
                            
								console.log('usarioId -> ', usuarioId);
								if(usuarioId.records[0] == undefined){
                                                                    
									console.log('Guardando nuevo invitado en el evento de la BD');
                                    
									const promesaNuevoUsuario = objetosGlobales[0].session[0]
										.writeTransaction(tx => tx.run('MATCH (m:usuario {spotifyid:{spotifyidUsuario}}), (n:Evento {codigoEvento:{codigoEvento}}) CREATE p=(m)-[r:Invitado {status:true}]->(n) Return p', {spotifyidUsuario:userId, codigoEvento:codigoEvento}));
    
									promesaNuevoUsuario 
										.then(function(unionUsuarioEvento){
											console.log('unionUsuarioEvento');
											console.log('Nuevo usuario ',userId,' -> añadido a evento en BD-> ', codigoEvento);
                                            
											const promesaEventoUsuario= objetosGlobales[0].session[0]
												.writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[{status:true}]-(u:usuario) RETURN u', { codigoEvento:codigoEvento}));
                                                
											promesaEventoUsuario
												.then(function(ids){
													console.log('Resultado de busqueda -> ', ids.records);
    
													var idsEvento = [];
													var usuarios = [];
                                                    
													ids.records.forEach(function(item, index){
                                                        
														console.log('item -> ', item._fields);
                                                        
														idsEvento.push(item._fields[0].properties.spotifyid);
                                                        
                                                            
														console.log('Room a actualizar -> ', codigoEvento);
                                                            
														var nombre = item._fields[0].properties.nombre;
														var imagen = item._fields[0].properties.imagen_url;
														var id = item._fields[0].properties.spotifyid;
    
														if(nombre == undefined && id != undefined){
															usuarios.push([id,imagen]);
														}else{
															usuarios.push([nombre,imagen]); 
														}
    
														if( ids.records.length == index+1){
															console.log('Usuarios en evento -> ', usuarios);
															io.to(codigoEvento).emit('usuarioEntra',{codigoEvento: codigoEvento, userId:userId, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios});
                                                                
															io.to(socket.id).emit('entraste');
    
														}
                                                       
                                                      
                                                        
													});
                                                    
													objetosGlobales[0].session[0].close();
												});
                                            
											promesaEventoUsuario
												.catch(function(err){
													console.log(err);
													//res.send('Error EventoUsuario')
													io.to(socket.id).emit('errorEventoUsuario');
												});
										});
    
									promesaNuevoUsuario
										.catch(function(err){
											console.log(err);
											//res.send('Error nuevoUsuario')
											io.to(socket.id).emit('errorNuevoUsuario');
                                         
										});
									promesaNuevoUsuario
										.catch(function(err){
											console.log(err);
											io.to(socket.id).emit('errorchecarEvento');
										});
                                    
								}else{
									console.log('El usuario ya está registrado en el evento de la BD');
                                    
									const promesaUnirUsuario= objetosGlobales[0].session[0]
										.writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[r]-(u:usuario {spotifyid:{userId}}) SET r.status = true RETURN u', { codigoEvento:codigoEvento, userId:userId}));
                                    
									promesaUnirUsuario
										.then(function(usuarioUnido){
                                        
											const promesaEventoUsuario= objetosGlobales[0].session[0]
												.writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}})<-[r {status:true}]-(u:usuario) RETURN u', { codigoEvento:codigoEvento}));
                                                
											promesaEventoUsuario
												.then(function(ids){console.log('Resultado de busqueda -> ', ids.records);
    
													var idsEvento = [];
													var usuarios = [];
                                                    
													ids.records.forEach(function(item, index){
                                                        
														console.log('item -> ', item._fields);
                                                        
														idsEvento.push(item._fields[0].properties.spotifyid);
                                                        
														var nombre = item._fields[0].properties.nombre;
														var imagen = item._fields[0].properties.imagen_url;
														var id = item._fields[0].properties.spotifyid;
    
														if(nombre == undefined && id != undefined){
															usuarios.push([id,imagen]);
														}else{
															usuarios.push([nombre,imagen]); 
														}
    
														if( ids.records.length == usuarios.length){
															console.log('Room a actualizar -> ', codigoEvento);
															console.log('Usuarios en evento -> ', usuarios);
															console.log('Ids en evento -> ', idsEvento);
                                                                
															io.to(codigoEvento).emit('usuarioEntra',{codigoEvento: codigoEvento, userId:userId, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios});
															io.to(socket.id).emit('entraste');
														}
                                                       
                                                      
                                                        
													});
													objetosGlobales[0].session[0].close();
                                                  
												});
											promesaEventoUsuario
												.catch(function(err){
													console.log(err);
													io.to(socket.id).emit('errorNuevoUsuario');
												});
										});
                                    
									promesaUnirUsuario
										.catch(function(err){
											console.log(err);
											io.to(socket.id).emit('errorUnirUsuario');
										});
                                    
								}
                                
							});
                        
                            
    
					}else if(codigoBD.records.length > 1){
						//console.log(codigoBD.records[0]._fields)
                        
						var listaEventos = [];
                        
						codigoBD.records.forEach(function(item, index){
							listaEventos.push(item._fields);
                            
							if(codigoBD.records.length == listaEventos.length){
                                
								//listaEventos -> [codigo, nombre de host, ...]
                                 
								io.to(socket.id).emit('multiplesEventos', {listaEventos:listaEventos});
							}
                            
						});
                        
                        
					}else{
						console.log('Código Inválido');
						io.to(socket.id).emit('codigoInvalido', {codigoInvalido:codigoEvento});
					}
				});
            
			promesaChecarPosEvento
				.catch(function(err){
					console.log(err);
					io.to(socket.id).emit('errorchecarPosEvento');
				});
            
            
		});
        
		app.post('/salirEvento', function(request, response, error) {
          
			var objetosGlobales = request.app.get('objetosGlobales');
            
			position = request.sessions.position; 
			var driver = request.app.get('driver');
			objetosGlobales[0].session[2] = driver.session();
            
			console.log('Usuario a salirse -> ', objetosGlobales[position].userid);
    
			const promesachecarRelacion= objetosGlobales[0].session[2]
				.writeTransaction(tx => tx.run('MATCH (e:Evento {status:true})<-[r]-(u:usuario {spotifyid:{spotifyid}}) RETURN r', { spotifyid:objetosGlobales[position].userid }));
            
			promesachecarRelacion
				.then(function(evento){
					//console.log(evento)
					console.log(evento);
                    
					if(evento.records[0] != null){
                    
						var tipoRelacion = evento.records[0]._fields[0].type;
						console.log(tipoRelacion);
                    
						if(tipoRelacion == 'Host'){
                        
							const promesaCaducarEvento= objetosGlobales[0].session[2]
								.writeTransaction(tx => tx.run('MATCH (e:Evento {status:true})<-[r]-(u:usuario {spotifyid:{spotifyid}}) SET e.status = false AND r.status = false RETURN e', { spotifyid:objetosGlobales[position].userid }));
                        
							promesaCaducarEvento
								.then(function(evento){
									console.log('Evento a salirse -> ', evento.records[0]._fields[0].properties.codigoEvento);
									var codigoEvento = evento.records[0]._fields[0].properties.codigoEvento;
                                
									response.send('Exito');
                                
									io.to(codigoEvento).emit('caducaEvento',{mensaje:'Caduca el Evento', codigoEvento:codigoEvento});
                            
                                
									objetosGlobales[0].session[2].close();
                                
                              
								});
                        
							promesaCaducarEvento
								.catch(function(err){
									console.log('Error -> ', err);
									response.send('Error');
								});
                        
						}else if(tipoRelacion == 'Invitado'){
							const promesaCaducarRelacion= objetosGlobales[0].session[2]
								.writeTransaction(tx => tx.run('MATCH (e:Evento {status:true})<-[r]-(u:usuario {spotifyid:{spotifyid}}) SET r.status=false RETURN r,e', { spotifyid:objetosGlobales[position].userid }));
							promesaCaducarRelacion
								.then(function(evento){
									console.log('Codigo Evento -> ', evento.records[0]._fields[1].properties.codigoEvento);
									var codigoEvento = evento.records[0]._fields[1].properties.codigoEvento;
									console.log('Evento a salirse -> ', evento.records[0]._fields[0]);
									var tipoRelacion = evento.records[0]._fields[0].type;
									console.log(tipoRelacion);
                                
									const promesaEventoUsuario= objetosGlobales[0].session[2]
										.writeTransaction(tx => tx.run('MATCH (e:Evento {codigoEvento:{codigoEvento}, status:true})<-[{status:true}]-(u:usuario) RETURN u', { codigoEvento:codigoEvento}));
    
									promesaEventoUsuario
										.then(function(ids){
											console.log('Resultado de busqueda -> ', ids.records);
    
											if(ids.records[0] != null){
												var idsEvento = [];
												var usuarios = [];
    
												ids.records.forEach(function(item, index){
    
													console.log('item -> ', item._fields);
    
													idsEvento.push(item._fields[0].properties.spotifyid);
    
    
													console.log('Room a actualizar -> ', codigoEvento);
    
													var nombre = item._fields[0].properties.nombre;
													var imagen = item._fields[0].properties.imagen_url;
													var id = item._fields[0].properties.spotifyid;
    
													if(nombre == undefined && id != undefined){
														usuarios.push([id,imagen]);
													}else{
														usuarios.push([nombre,imagen]); 
													}
    
													if( ids.records.length == usuarios.length){
														console.log('ids en evento -> ', idsEvento);
														console.log('Usuarios en evento -> ', usuarios);
    
														response.send('Exito');
                                                        
														/*TESTEO DE MENSAJES*/
                                                         
                                                        
														// then simply use to or in (they are the same) when broadcasting or emitting (server-side)
														/*io.to(codigoEvento).emit('saleUsuario',{codigoEvento: codigoEvento, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios}); */
														socket.leave(codigoEvento, (err) => {
															console.log(err);
                                                            
															var rooms = Object.keys(socket.rooms);
															console.log('rooms en las que sigue el usuario -> ', rooms); // [ <socket.id>, 'room 237' ]
                                                        
															// sending to all clients in 'game' room except sender
															io.to(codigoEvento).emit('saleUsuario',{codigoEvento: codigoEvento, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios});
                                                        
															/*socket.broadcast.to(codigoEvento).emit('saleUsuario',{codigoEvento: codigoEvento, idsEvento:idsEvento,mensaje:'Nuevo Usuario', usuarios:usuarios});*/
                                                            
														});
       
													}
    
												});
											}else{
												console.log('Ya no existe el evento');
											}
                                         
											objetosGlobales[0].session[2].close();
                                    
										});
    
									promesaEventoUsuario
										.catch(function(err){
											console.log('Error -> ', err);
											response.send('Error');
										});
                            
								});
                                
							promesaCaducarRelacion
								.catch(function(err){
									console.log('Error -> ', err);
									response.send('Error');
								});
                        
						}
					}else{
						console.log('Ya no existe el evento');      
					}
                    
				});
            
			promesachecarRelacion
				.catch(function(err){
					console.log('Error -> ', err);
					response.send('Error');
				});
    
        
		});
        
        
        
        
    
	}
    
};




/*TERMINA SOCKETS*/
