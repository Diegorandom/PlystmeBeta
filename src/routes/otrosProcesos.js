var express = require('express');
var router = new express.Router();
var request = require('request');

//Otros PROCESOS 
router.get('/index.ejs', function(request, response) {
	response.render('pages/index');
});

router.get('/about-us.ejs', function(request, response) { 
    
	position = request.sessions.position;
	objetosGlobales[0].ref=true;
	response.render('pages/about-us', objetosGlobales[0]);
});

router.get('/activity.ejs', function(request, response) {
	response.render('pages/activity.ejs');
});

router.get('/ajax_for_index.ejs', function(request, response) {
	response.render('pages/ajax_for_index');
});

router.get('/author-edit.ejs', function(request, response) {
	response.render('pages/author-edit');
});

router.get('/author.ejs', function(request, response) {
	response.render('pages/author');
});

router.get('/blog-2.ejs', function(request, response) {
	response.render('pages/blog-2');
});

router.get('/blog-3.ejs', function(request, response) {
	response.render('pages/blog-3');
});

router.get('/blog-detail-2.ejs', function(request, response) {
	response.render('pages/blog-detail-2');
});

router.get('/blog-detail.ejs', function(request, response) {
	response.render('pages/blog-detail');
});

router.get('/blog.ejs', function(request, response) {
	response.render('pages/blog');
});

router.get('/contact-us.ejs', function(request, response) {
	response.render('pages/contact-us');
});

router.get('/faq.ejs', function(request, response) {
	response.render('pages/faq');
});

router.get('/gallery', function(request, response) {
	response.render('pages/gallery');
});

router.get('/login.ejs', function(request, response) {
	response.setHeader('Content-Security-Policy', ' child-src accounts.spotify.com api.spotify.com google.com; img-src *;');
});

router.get('/messages-2.ejs', function(request, response) {
	response.render('pages/messages-2');
});

router.get('/messages.ejs', function(request, response) {
	response.render('pages/messages');
});

router.get('/track', function(request, response) {
	response.render('pages/page3', objetosGlobales);
});

router.get('/people.ejs', function(request, response) {
	response.render('pages/people');
});

router.get('/search.ejs', function(request, response) {
	response.render('pages/search');
});

router.get('/shortcodes.ejs', function(request, response) {
	response.render('pages/shortcodes');
});

router.get('/site-map.ejs', function(request, response) {
	response.render('pages/site-map');
});

router.get('/statictics.ejs', function(request, response) {
	response.render('pages/statictics');
});

router.get('/work.ejs', function(request, response) {
	response.render('pages/work');
});

//Finaliza proceso
module.exports = router;