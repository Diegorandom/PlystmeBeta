var express = require("express");
var router = new express.Router();
var request = require('request'); // "Request" library
var contErrorServidor = 0;

router.get('/esHost', function(req, res, error){
    var driver = req.app.get('driver')
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.sessions.position;
        
    
        if(error == true || objetosGlobales == undefined|| driver == undefined || objetosGlobales[0] == undefined){
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
            
            
            objetosGlobales[0].session[0] = driver.session();
            
            const promesaEsHost = objetosGlobales[0].session[0]
            .writeTransaction(tx => tx.run('MATCH p=(u:usuario {spotifyid:{userid}})-[r:Host {status:true}]->(e:Evento {status:true}) RETURN p ', {userid:objetosGlobales[0].userid}))
            
            promesaEsHost
                .then(function(esHost){
                    console.log(esHost)
                    if(esHost.records.length > 0){
                        console.log('# Evento -> ', esHost.records.length )
                        res.send(esHost)
                    }else{
                        res.send(false)
                    }
                    
                    objetosGlobales[0].session[0].close();
                })
            
            promesaEsHost
                 .catch(function(err){
                    console.log(err);
                    res.redirect('/error')
                })
            
        }
    })


router.get('/esInvitado', function(req, res, error){
    var driver = req.app.get('driver')
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.sessions.position;
    console.log('apuntador del objeto', position);
    
    
        if(error == true || objetosGlobales == undefined || driver == undefined){
            console.log('Errror -> ', error)
            res.send('Error Servidor')
        }else{
            
           
            objetosGlobales[0].session[1] = driver.session();
            
            const promesaEsInvitado = objetosGlobales[0].session[1]
            .writeTransaction(tx => tx.run('MATCH p=(u:usuario {spotifyid:{userid}})-[r:Invitado {status:true}]->(e:Evento {status:true}) RETURN p ', {userid:objetosGlobales[0].userid}))
            
            promesaEsInvitado
                .then(function(esInvitado){
                    console.log(esInvitado)
                    if(esInvitado.records.length > 0){
                        console.log('# Evento -> ', esInvitado.records.length )
                        res.send(esInvitado)
                    }else{
                        res.send(false)
                    }
                    
                    objetosGlobales[0].session[1].close();
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