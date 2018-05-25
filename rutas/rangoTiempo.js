var express = require("express");
var router = new express.Router();
var request = require("request");

/*Proceso para entrar a un pool*/
router.get('/rango', function(req, res, error){
    console.log("Llegamos al modificador de rangos")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = req.sessions.position;
    objetosGlobales[position].rango = req.query.filter
    objetosGlobales[position].cambioRango = true
    console.log('Rango de Tiempo seleccionado -> ', objetosGlobales[position].rango)
    
    if(objetosGlobales[position] != undefined || objetosGlobales[position].rango != undefined || objetosGlobales[position].cambioRango != undefined || position != undefined ){
    
        if(objetosGlobales[position].rango == "long_term"){
            objetosGlobales[0].session
            .run('MATCH (n)<-[:Escuchado {rangoTiempo:{rangoTiempo}}]-(t) RETURN count(t)',{rangoTiempo:objetosGlobales[position].rango})
            .then(function(conteo){
                res.redirect('/mineria');
            })
            .catch(function(err){
                console.log(err);
                res.redirect('/error',{error:err})
            })
        }else if(objetosGlobales[position].rango == "medium_term"){
            objetosGlobales[0].session
            .run('MATCH (n)<-[:Escuchado {rangoTiempo:{rangoTiempo}}]-(t) RETURN count(t)',{rangoTiempo:objetosGlobales[position].rango})
            .then(function(conteo){
                res.redirect('/mineria');
            })
            .catch(function(err){
                console.log(err);
                res.redirect('/error',{error:err})
            })

        }else if(objetosGlobales[position].rango == "short_term"){
            objetosGlobales[0].session
            .run('MATCH (n)<-[:Escuchado {rangoTiempo:{rangoTiempo}}]-(t) RETURN count(t)', {rangoTiempo:objetosGlobales[position].rango})
            .then(function(conteo){
                console.log('Conteo -> ', conteo)
                res.redirect('/mineria');
            })
            .catch(function(err){
                console.log(err);
                res.render('/error',{error:err})
            })
        }
    }
    
})

//Finaliza proceso
module.exports = router;
