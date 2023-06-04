var express = require("express");
var router = new express.Router();
const axios = require('axios');

/*ESTE SOFTWARE NO ESTÁ EN USO*/

router.get('/refresh_token', async function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  // var authOptions = {
  //   url: 'https://accounts.spotify.com/api/token',
  //   headers: {
  //     // eslint-disable-next-line no-undef
  //     'Authorization': 'Basic ' + secrets.client_id + ':' + secrets.client_id,
  //   },
  //   form: `grant_type=authorization_code&refresh_token=${refresh_token}`,
  // }

  const config = {
    method: 'GET',
    url: `https://accounts.spotify.com/api/token`,
    headers: {
      // eslint-disable-next-line no-undef
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + secret).toString('base64'))
    },
    data: `grant_type=authorization_code&refresh_token=${refresh_token}`
  }

  let body = await axios(config)
  var access_token = body.data.access_token;
  res.send({
    'access_token': access_token
  });
  res.render('pages/author-login');
});

//Finaliza proceso
module.exports = router;