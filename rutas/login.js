var express = require("express");
var router = new express.Router();
var request = require("request");
var sanitize = require('sanitize-html');
var querystring = require('querystring');

router.get('/login', function(req, res, error) {
if(error == true){ res.render('pages/error',{error:error})}else{
    var objetosGlobales = req.app.get('objetosGlobales');
    var position = req.app.get('position');
    position = objetosGlobales.length;
    console.log('apuntador del objeto', position);
    req.sessions.position = position;
    var generateRandomString = req.app.get('generateRandomString')
  
var state = generateRandomString(16);
  res.cookie(objetosGlobales[0].stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private user-library-read user-top-read playlist-modify-private user-library-modify';
    
    
  sanitize(res.redirect('https://accounts.spotify.com/authorize/?' +
    querystring.stringify({
      client_id: objetosGlobales[0].client_id,
      response_type: 'code',
      redirect_uri: objetosGlobales[0].redirect_uri,
      scope: scope,
      state: state
    })))
    
    console.log("se termina la autorización desde cliente!");
}
    
});

//Finaliza proceso
module.exports = router;