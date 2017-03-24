/* jshint esversion:6 */
var fs = require("fs");
var express = require('express');
var session = require('express-session');

var bodyParser = require('body-parser');
var app = express();
// var PORT = process.env.PORT || 3000;
var PORT = 3000;

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