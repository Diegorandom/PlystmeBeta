router.get('/', function(req, res, error){ 
 /*Esta ruta lleva a la landing page de la plataforma*/
        if(error == true){
            res.render('pages/error',{error:error})
        }else{    
            objetosGlobales[0].totalUsers = 0;
            
            //Por cada posición de objetosGlobales se agrega un usuario al contador para que sea desplegado en la pantalla de inicio
            objetosGlobales.forEach(function(item, index){
                if(item != null){
                    objetosGlobales[0].totalUsers = objetosGlobales[0].totalUsers + 1
                }
            })
            
            //En caso de que la cantidad de usuarios sea 1 o menos, se borra
            if( objetosGlobales[0].totalUsers <= 1){
                objetosGlobales.splice(1, objetosGlobales[0].totalUsers.lenght-1)
            }
            
            console.log(objetosGlobales)
            res.render('pages/autorizacion',  objetosGlobales[0]);
        
        }       
});

//Finaliza proceso

module.exports = router;