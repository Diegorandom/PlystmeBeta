var express = require("express");
var router = new express.Router();
var request = require("request");

/*Proceso para entrar a un pool*/
router.get('/rango', function(req, res, error){
    console.log("Llegamos al modificador de rangos")
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = req.sessions.position;
    
    if(objetosGlobales[position] != undefined || position != undefined ){
        
        objetosGlobales[position].rango = req.query.filter
        objetosGlobales[position].cambioRango = true
        
        console.log('Rango de Tiempo seleccionado -> ', objetosGlobales[position].rango)
    
        if(objetosGlobales[position].rango == "long_term"){
            
                console.log('Comienza minería de datos - Rango largo')
                res.redirect('/mineria');
            
        }else if(objetosGlobales[position].rango == "medium_term"){
            
                console.log('Comienza minería de datos - Rango mediano')
                res.redirect('/mineria');
            

        }else if(objetosGlobales[position].rango == "short_term"){
            
                console.log('Comienza minería de datos - Rango largo')
                res.redirect('/mineria');
           
        }
    }else{
        res.send('Error')
    }
    
})

//Finaliza proceso
module.exports = router;
