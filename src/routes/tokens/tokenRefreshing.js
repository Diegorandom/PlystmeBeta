var express = require("express");
var router = new express.Router();
var request = require("request");

/*ESTE SOFTWARE NO ESTÁ EN USO*/

router.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      // eslint-disable-next-line no-undef
      'Authorization': 'Basic ' + secrets.client_id + ':' + secrets.client_id,
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  }


  request.post(authOptions, function (error, response, bodyS) {
    if (!error && response.statusCode === 200) {
      var access_token = bodyS.access_token;
      res.send({
        'access_token': access_token
      });
      res.render('pages/author-login');
    }
  });
});

//Finaliza proceso
module.exports = router;