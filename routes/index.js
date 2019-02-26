var express = require('express');
var router = express.Router();
var crawl = require('./../crawler/index.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/search', (req, res) => {
	var search = req.query.s;
	var truyenchon = crawl.truyenchon(search);
	var hamtruyen = crawl.hamtruyen(search);
	var hocvientruyentranh = crawl.hocvientruyentranh(search);
	return Promise.all([truyenchon, hamtruyen, hocvientruyentranh])
		.then(data => {
			var d = data[0].concat(data[1], data[2]);
			res.render('search', {s: search, data: d});
		})
		.catch(err => res.send(err));
});

router.get('/truyen', (req, res) => {
	var q = req.query.q;
	crawl.detail(q)
		.then(data => res.render('detail', {d: data}));
});
router.get('/doctruyen', (req, res) => {
	var c = req.query.c;
	console.log(c);
	crawl.TC_chap(c)
		.then(d => res.render('read', {d: d}));
	// res.render('read', {c: c});
});
module.exports = router;
