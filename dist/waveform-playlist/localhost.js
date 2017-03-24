/* jshint esversion:6 */
var fs = require("fs");
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var PORT = process.env.PORT || 3000;
//var PORT = 3000;

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/web-audio-editor.html');
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
	secret: 'hghvjkiouyutfghjbsdfjbnsdf6rtfghiuhgftr5',
	resave: false,
	saveUninitialized: false
}));
app.post('/update', (req, res) => {
	fs.writeFile('./public/media/json/1stplaylist.json', req.body.updater, (err) => {
  		if (err) throw err;
  			res.send(req.body.updater);
	});
});

app.post('/delete', (req, res) => {
	fs.writeFile('./public/media/json/1stplaylist.json', req.body.trackDel, (err) => {
  		if (err) throw err;
  			console.log("track deleted");
  			res.send("success");
	});
});



////////
app.use(express.static('public'));

// 404 error handling
app.use((req, res, next) => {
	res.status(404);
	console.error('404 - ' + req.url);
	res.send({status: 'Error', message: '404 - File not found'});
});

// 500 error handling
app.use((err, req, res, next) => {
	res.status(500);
	console.error('Server error: ' + err);
	res.send({status: 'Error', message: '500 - Server Error'});
});

// start the server
app.listen(PORT, () => {
	console.info('Server started on:' + PORT);
});
