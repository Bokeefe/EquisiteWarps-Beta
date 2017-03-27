/* jshint esversion:6 */
var fs = require("fs");
var path = require('path');
var formidable = require('formidable');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var formidable = require('formidable');
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
	secret: 'hghvjk@#@Rftfghjbsdfjbnsdf6rtfghiuhgftr5',
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


app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /media/audio/ directory
  form.uploadDir = path.join(__dirname, '/public/media/audio');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);
  

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
