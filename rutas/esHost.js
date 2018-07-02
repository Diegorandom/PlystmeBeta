var express = require("express");
var neo4j = require('neo4j-driver').v1;
var router = new express.Router();
var contErrorServidor = 0;

router.get('/esHost', function(req, res, error){
        var objetosGlobales = req.app.get('objetosGlobales');
        var position = req.app.get('position');
        var driver = req.app.get('driver')
        position = req.sessions.position;
    
        if(error == true || objetosGlobales == undefined || position == undefined || driver == undefined || objetosGlobales[position] == undefined){
            contErrorServidor += 1
            console.log('Errror -> ', error)
            
            if(contErrorServidor < 2){
                res.send('Error Servidor')
            }else{
                res.redirect('/error')
            }
            
        }else{
            contErrorServidor = 0;
            
            console.log('apuntador del objeto', position);
            
            
            objetosGlobales[position].session[0] = driver.session();
            
            const promesaEsHost = objetosGlobales[position].session[0]
            .writeTransaction(tx => tx.run('MATCH p=(u:usuario {spotifyid:{userid}})-[r:Host {status:true}]->(e:Evento {status:true}) RETURN p ', {userid:objetosGlobales[position].userid}))
            
            promesaEsHost
                .then(function(esHost){
                    console.log(esHost)
                    if(esHost.records.length > 0){
                        console.log('# Evento -> ', esHost.records.length )
                        res.send(esHost)
                    }else{
                        res.send(false)
                    }
                    
                    objetosGlobales[position].session[0].close();
                })
            
            promesaEsHost
                 .catch(function(err){
                    console.log(err);
                    res.redirect('/error')
                })
            
        }
    })


router.get('/esInvitado', function(req, res, error){
     var objetosGlobales = req.app.get('objetosGlobales');
            var position = req.app.get('position');
                position = req.sessions.position;
                console.log('apuntador del objeto', position);
            var driver = req.app.get('driver')
    
        if(error == true || objetosGlobales == undefined || position == undefined || driver == undefined){
            console.log('Errror -> ', error)
            res.send('Error Servidor')
        }else{
            
           
            objetosGlobales[position].session[1] = driver.session();
            
            const promesaEsInvitado = objetosGlobales[position].session[1]
            .writeTransaction(tx => tx.run('MATCH p=(u:usuario {spotifyid:{userid}})-[r:Invitado {status:true}]->(e:Evento {status:true}) RETURN p ', {userid:objetosGlobales[position].userid}))
            
            promesaEsInvitado
                .then(function(esInvitado){
                    console.log(esInvitado)
                    if(esInvitado.records.length > 0){
                        console.log('# Evento -> ', esInvitado.records.length )
                        res.send(esInvitado)
                    }else{
                        res.send(false)
                    }
                    
                    objetosGlobales[position].session[1].close();
                })
            
            promesaEsInvitado
                 .catch(function(err){
                    console.log(err);
                    res.redirect('/error')
                })
            
        }
    })


//Finaliza proceso
module.exports = router;