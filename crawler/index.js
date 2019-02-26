var cheerio = require('cheerio')
var rq = require('request-promise-native')
var search = 'https://www.google.com/search?q=';

var ops = {
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
	},
	uri: '',
	transform (body) {
		return cheerio.load(body)
	}
}

function detail(url)
{
	return new Promise((resolve, reject) => {
		if(/http:\/\/truyenchon.com\/truyen\/.+/.test(url)) TC_detail(url).then(data => resolve(data));
		if(/https:\/\/hamtruyen.com\/.+-0.html/.test(url)) HT_detail(url).then(data => resolve(data));
		if(/https:\/\/hocvientruyentranh.net\/truyen\/.+\/.+/.test(url)) HVTR_detail(url).then(data => resolve(data));
	});
}

function truyenchon(s){
	return new Promise((resolve, reject) => {
		var q = search + 'truyenchon.com ' + s;
		ops.uri = q;
		rq(ops)
			.then($ => {
				var data = [];
				$('#rso div.g').each((k, i) => {
					if(/http:\/\/truyenchon.com\/the-loai/.test($(i).find('div.r a').attr('href'))) return true;
					if(/http:\/\/truyenchon.com\/.+/.test($(i).find('div.r a').attr('href'))){
						data.push({
							url: $(i).find('div.r a').attr('href'),
							title: $(i).find('div.r a h3').text(),
							source: 'Truyen Chon'
						})
					}
				});
				if(!data){
					return resolve(null);
				}
				//xu ly url.
				data = data.map(uri => {return {url: uri.url.substr(0, uri.url.search('/chap-') == -1 ? uri.url.length : uri.url.search('/chap-')), title: uri.title, source: uri.source}});
				data = data.filter((uri, i) => data.findIndex(u => u.url === uri.url) === i);
				return resolve(data);
			})
			.catch(err => console.log(err));
	});
}

function TC_detail(url)
{
	return new Promise((resolve, reject) => {
		ops.uri = url;
		rq(ops)
			.then($ => {
				var data = {
					img: $('#item-detail > div.detail-info > div > div.col-xs-4.col-image > img').attr('src'),
					title: $('#item-detail > h1').text(),
					chap: []
				};
				$('#nt_listchapter > nav > ul > li').each((k, i) => {
					if(k == 0) return true;
					data.chap.push({url: $(i).find('.chapter a').attr('href'), chap: $(i).find('.chapter a').text().substr(8)});
				});
				return resolve(data);
			})	
			.catch(err => reject(err));
	});
}

function TC_chap(url)
{
	return new Promise((resolve, reject) => {
		ops.uri = url;
		rq(ops)
			.then($ => {
				var data = {
					img: [],
					title: $('#ctl00_divCenter div.top > h1.txt-primary > a').text(),
					url: $('#ctl00_divCenter div.top > h1.txt-primary > a').attr('href'),
					list: [],
					prev: '',
					next: ''
				}
				$('.reading-detail > .page-chapter').each((k, i) => {
					data.img.push($(i).find('img').attr('src'));
				});
				TC_detail(data.url).then(d => {
					data.list = d.chap;
					var k = data.list.findIndex(i => i.url === url);
					data.list[k].c = 'yes';
					if(k != 0) data.next = data.list[k-1].url;
					if(data.list[k+1] && data.list[k+1].url) data.prev = data.list[k+1].url;
					return resolve(data);
				});
			})
			.catch(err => reject(err));
	});
}

function hamtruyen(s){
	return new Promise((resolve, reject) => {
		var q = search + 'hamtruyen.com ' + s;
		ops.uri = q;
		rq(ops)
			.then($ => {
				var data = [];
				$('#rso div.g').each((k, i) => {
					if(/https:\/\/hamtruyen.com\/.+-0.html/.test($(i).find('div.r a').attr('href'))){
						data.push({
							url: $(i).find('div.r a').attr('href'),
							title: $(i).find('div.r a h3').text(),
							source: 'Ham Truyen'
						})
					}
				});
				if(!data){
					return resolve(null);
				}
				//xu ly url.
				data = data.filter((uri, i) => data.findIndex(u => u.url === uri.url) === i);
				return resolve(data);
			})
			.catch(err => console.log(err));
	});
}

function HT_detail(url)
{
	return new Promise((resolve, reject) => {
		ops.uri = url;
		rq(ops)
			.then($ => {
				var data = {
					img: $('#content_truyen > div.col-xs-4.wrapper_image > img').attr('src'),
					title: $('#content_truyen > div.col-xs-8.wrapper_info > h1').text(),
					chap: []
				}

				$('#wrapper_listchap > div > div > section.row_chap').each((k, i) => {
					if($(i).find('.tenChapter > a').text().search('video') != -1) return true;
					data.chap.push({
						url: 'https://hamtruyen.com' + $(i).find('.tenChapter a').attr('href'),
						chap: $(i).find('.tenChapter a').text().substr(8)
					});
				});
				return resolve(data);
			})
			.catch(err => reject(err));
	});
}

// function HT_chap(url)
// {
// 	return new Promise((resolve, reject) => {
// 		ops.uri = url;
// 		rq(ops)
// 			.then($ => {
// 				var data = {
// 					img: [],
// 					title: $('body > header > ul > li > a > h1.title').text().replace(/Chapter.+/i, ''),
// 					url: url.substr(0, url.match(/.html/)),
// 					list: [],
// 					prev: '',
// 					next: ''
// 				}
// 			})
// 			.catch(err => reject(err));
// 	});
// }

function hocvientruyentranh(s){
	return new Promise((resolve, reject) => {
		var q = search + 'hocvientruyentranh.net ' + s;
		ops.uri = q;
		rq(ops)
			.then($ => {
				var data = [];
				$('#rso div.g').each((k, i) => {
					if(/https:\/\/hocvientruyentranh.net\/truyen\/.+/.test($(i).find('div.r a').attr('href'))){
						data.push({
							url: $(i).find('div.r a').attr('href'),
							title: $(i).find('div.r a h3').text(),
							source: 'Học Viện Truyện Tranh'
						});
						if(data && data.length > 0) return false;
					}
				});
				if(!data){
					return resolve(null);
				}
				return resolve(data);
			})
			.catch(err => console.log(err));
	})
}

function HVTR_detail(url)
{
	return new Promise((resolve, reject) => {
		ops.uri = url;
		rq(ops)
			.then($ => {
				var data = {
					img: $('#main div.__left > div.__image > img').attr('src'),
					title: $('#main div.__left > div.__image > img').attr('alt'),
					chap: []
				}
				$('#main div.table-scroll > table.table.table-hover > tbody > tr').each((k, i) => {
					data.chap.push({
						url: $(i).find('a').attr('href'),
						chap: $(i).find('a').attr('title').substr(7)
					});
				});
				return resolve(data);
			})
			.catch(err => reject(err));
	});
}

module.exports = {
	truyenchon: truyenchon,
	hamtruyen: hamtruyen,
	hocvientruyentranh: hocvientruyentranh,
	detail: detail,
	TC_chap: TC_chap
}