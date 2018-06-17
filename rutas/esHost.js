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
            .writeTransaction(tx => tx.run('MATCH (u:usuario {spotifyid:{userid}})-[r:Host {status:true}]->(e) RETURN u ', {userid:objetosGlobales[position].userid}))
            
            promesaEsHost
                .then(function(esHost){
                    console.log(esHost)
                    if(esHost.records.length > 0){
                        console.log('# Evento -> ', esHost.records.length )
                        res.send(true)
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


//Finaliza proceso
module.exports = router;