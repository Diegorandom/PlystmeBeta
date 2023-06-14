var express = require("express");
var router = new express.Router();

/*ESTE SOFTWARE NO ESTÁ EN USO*/

router.post('/save/track', function (req, res, error) {
  if (error == true) { res.redirect('/error', { error: error }) }
  var track_uri = req.sessions.track_uri
  console.log(track_uri.substring(14))

  // Add tracks to the signed in user's Your Music library
  // eslint-disable-next-line no-undef
  objetosGlobales[0].spotifyApi.addToMySavedTracks([track_uri.substring(14)])
    .then(function () {
      console.log('Added track!');
      // eslint-disable-next-line no-undef
      res.render('pages/page3', objetosGlobales, function (error, html) {
        if (error == true) {
          console.log('error', error)
          res.redirect('/error')
        } else {
          res.send(html)
        }
      });

    }, function (err) {
      console.log('Something went wrong!', err);
      res.redirect('/error')
    })


});

//Finaliza proceso
module.exports = router;