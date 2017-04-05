/* jshint esversion:6 */
var fs = require("fs");
var path = require('path');
var formidable = require('formidable');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var formidable = require('formidable');
var app = express();
var User = require('./public/js/UserSchema.js')(mongoose);
var Corpse = require('./public/js/CorpseSchema.js')(mongoose);
var http = require("http").Server(app);
var Creds = require('./public/media/json/creds.json');
var uristring = process.env.MONGODB_URI ||'mongodb://localhost';
var PORT = process.env.PORT || 3000;
//var PORT = 3000;


mongoose.Promise = global.Promise;
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
	secret: Creds.myCookie,
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	resave: true,
	saveUninitialized: true,
	cookie: { secure: !true }
}));

app.use(cookieParser(Creds.myCookie));




////login stuff
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.post('/allwarps',(req,res)=>{
	var warps = [];
	Corpse.find( {}, (err, data)=>{
		for (var i = 0; i < data.length; i++) {
			warps.push(data[i].warpName);
		}
		res.send(warps);
	});
});


app.get("/userDeets",(req,res)=> {
	   session=req.session;
		 res.send(session);
});

app.post('/login', (req, res) => {//login page
	if (!req.body.email || !req.body.password) {//if no name or password provided send error
		// res.status(401);
		console.info('Invalid Login', req.body.email);
		res.send({status: 'error', message: 'user/pass not entered'});
		return;
	}
	User.find({email: req.body.email}, (err, user) => {//search for provided email and password in user database
		if (user.length === 0) {
			// res.status(401);
			res.send({status: 'invalid1', message: 'invalid username/passord'});
		} else if (user[0].password !== req.body.password) {
			// res.status(401);
			res.send({status: 'invalid2', message: 'invalid username/password'});
		} else {//if user is found set session name
			req.session.email = user[0].email;
			res.send({status:"success"});
		}
	});
});


app.post('/register', (req, res) => {//api to register a new user
	// find this email in the database and see if it already exists
	User.find({email: req.body.email}, (err, data) => {
		if (data.length === 0) {      // if the user doesn't exist
			var newUser = new User({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password
			});

			newUser.save((err) => { // save the newUser object to the database
				if (err) {
					res.status(500);
					console.error(err);
					res.send({status: 'Error', message: 'unable to register user:' + err});
				}
				res.send({status: 'success', message: 'user added successfully'});
			});
		} else if (err) { // send back an error if there's a problem
			res.status(500);
			console.error(err);
			res.send({status: 'Error', message: 'server error: ' + err});
		} else {
			res.send({status: 'Error', message: 'user already exists'}); // otherwise the user already exists
		}
	});
});



app.post('/newWarp', (req, res) => {//api to register a new user
	// find this email in the database and see if it already exists
	Corpse.find({warpName: req.body.warpName}, (err, data) => {
		if (data.length === 0) {      // if the warp doesn't exist
			var newCorpse = new Corpse({
				warpName: req.body.warpName,
				trackCount:0,
				trackFree:0,
				timeSub:0,
				bpm:0,
				admin:session.email,
				users:[session.email],
				warp:[]
			});
			newCorpse.save((err) => { // save the newCorpse object to the database
				if (err) {
					res.status(500);
					console.error(err);
					res.send({status: 'Error', message: 'unable to register user:' + err});
				}
				res.send({status: 'success', message: 'user added successfully'});
			});
		} else if (err) { // send back an error if there's a problem
			res.status(500);
			console.error(err);
			res.send({status: 'Error', message: 'server error: ' + err});
		} else {
			res.send({status: 'Error', message: 'user already exists'}); // otherwise the user already exists
		}
	});
});
app.post('/warpPick', (req, res) => {
	//console.log(req.body.warpPick);
	var warpPick = req.body.warpPick;

	Corpse.find({warpName: warpPick}, (err, data) => {
		//req.session.warpName = data[0].warpName;
		req.session.warp = warpPick;

		res.send({status:"success",data});
		// session=req.session;
		// res.send(session.warp);
	});
});


app.post('/logout', (req, res) => {//logout api
	req.session.destroy();
	res.send({status: 'logout', message: 'succesfully logged out'});
});

app.post('/update', (req, res) => {
			 var updater = JSON.parse(req.body.updater);

			req.session.tracks = updater;
			var conditions = { warpName: req.session.warp },
			  update = { warp: updater};

			Corpse.update(conditions, update, function (){
				res.send(updater);
			});
});

// app.post('/delete', (req, res) => {
// 			var updater = JSON.parse(req.body.updater);
// 			var conditions = { warpName: req.body.name },
// 			  update = { warp: updater};
// 			Corpse.update(conditions, update, function (){
// 				res.send(updater);
// 			});
// });


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
