var express = require("express");
var router = new express.Router();

router.get('/esHost', function(req, res, error){
        if(error == true){
            console.log('Errror -> ', error)
        }else{
            var objetosGlobales = req.app.get('objetosGlobales');
            var position = req.app.get('position');
                position = req.sessions.position;
                console.log('apuntador del objeto', position);
            
            const promesaEsHost = objetosGlobales[0].session[0]
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
                    
                    
                })
            
            promesaEsHost
                 .catch(function(err){
                    console.log(err);
                    res.send('Error crearEvento')
                })
            
        }
    })


router.get('/esInvitado', function(req, res, error){
        if(error == true){
            console.log('Errror -> ', error)
        }else{
            var objetosGlobales = req.app.get('objetosGlobales');
            var position = req.app.get('position');
                position = req.sessions.position;
                console.log('apuntador del objeto', position);
            
            const promesaEsInvitado = objetosGlobales[0].session[0]
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
                    
                    
                })
            
            promesaEsInvitado
                 .catch(function(err){
                    console.log(err);
                    res.send('Error crearEvento')
                })
            
        }
    })


//Finaliza proceso
module.exports = router;