var express = require("express");
var router = new express.Router();
var request = require("request");

router.post('/save/track', function(req, res, error){
   if(error == true){ res.redirect('/error',{error:error}) }
          var track_uri = req.sessions.track_uri
            console.log(track_uri.substring(14))
    
           // Add tracks to the signed in user's Your Music library
objetosGlobales[0].spotifyApi.addToMySavedTracks([track_uri.substring(14)])
          .then(function(data) {
            console.log('Added track!');
            mensaje = "exito_save_track"
            
             res.render('pages/page3', objetosGlobales, function(error, html){
                    if(error == true){
                        console.log('error', error)
                        res.redirect('/error')
                    }else{
                        res.send(html) 
                     } 
                });
        
          }, function(err) {
            console.log('Something went wrong!', err);
            mensaje = "error_save_track"
            res.redirect('/error')
          })
    
    
});

//Finaliza proceso
module.exports = router;