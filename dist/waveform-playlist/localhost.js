"use strict";
/* jshint esversion:6 */
require('use-strict');

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
const nodemailer = require('nodemailer');
var uristring = process.env.MONGODB_URI ||'mongodb://localhost';
//var uristring = process.env.MONGODB_URI || Creds.real_URI;


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


app.get("/getSession",(req,res)=> {
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
			res.send({status: 'invalid1', message: 'not seeing that user in here'});
		} else if (user[0].password !== req.body.password) {
			// res.status(401);
			res.send({status: 'invalid2', message: 'wrong password'});

		} else {//if user is found set session name
            req.session.moniker = user[0].name;
			req.session.email = user[0].email;
			//res.send({status:"success"});

			Corpse.find({
			    'users': req.body.email
			}, function(err, docs){
				var arr = [];
				for (var i = 0; i <= docs.length-1; i++) {
					arr.push(docs[i].warpName);
				}
			   res.send({status:"success", data: arr});
			});



		}
	});
});


app.post('/register', (req, res) => {//api to register a new user
	// find this email in the database and see if it already exists
	User.find({email: req.body.email}, (err, data) => {
        console.log(data);
        if(data == []){
            console.log("true");
            	 	res.send({status: 'Error', message: 'Something not right, either that user is already registered or you didnt fill out all the fields'}); // otherwise the user already exists

        } else {
            console.log("false ");
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
        }
        //  else if (err) { // send back an error if there's a problem
        //     res.status(500);
        //     console.error(err);
        //     res.send({status: 'Error', message: 'server error: ' + err});
        // }
		// if(data === false){

		// }
        //  else {

		// }
	});
});

app.post('/newWarp', (req, res) => {//api to register a new user
	// find this email in the database and see if it already exists
	Corpse.find({warpName: req.body.warpName}, (err, data) => {
		if (data.length === 0) {      // if the warp doesn't exist
			var newCorpse = new Corpse({
				warpName: req.body.warpName,
				created:{stamp :new Date().getTime(), read: Date().valueOf()},
				numCont: req.body.numCont,
				trackFree: false,
				timeSub:0,
				bpm: req.body.bpm,
				admin: session.email,
				message:"",
				users:[ session.email ],
				warp:[]
			});
			newCorpse.save((err) => { // save the newCorpse object to the database
				if (err) {
					res.status(500);
					console.error(err);
					res.send({status: 'Error', message: 'unable to create warp:' + err});
				}
				req.session.warpName=  req.body.warpName;
				req.session.numCont=  req.body.numCont;
				req.session.trackFree=  false;
				req.session.timeSub= 0;
				req.session.bpm=  req.body.bpm;
				req.session.admin=  session.email;
				req.session.users= [ session.email ];
				req.session.warp= [];

				res.send({status: 'success', message: 'warp created successfully', data: res.session});
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
		req.session.warpName = data[0].warpName;
		req.session.numCont = data[0].numCont;
		req.session.trackFree = data[0].trackFree;
		req.session.timeSub = data[0].timeSub;
		req.session.bpm = data[0].bpm;
		req.session.admin = data[0].admin;
		req.session.users = data[0].users;
		req.session.warp = data[0].warp;
		res.send({status:"success",data});
	});
});


app.post('/logout', (req, res) => {//logout api
	req.session.destroy();
	res.send({status: 'logout', message: 'succesfully logged out'});
});

app.post('/update', (req, res) =>	{
	var updater = JSON.parse(req.body.updater);
	req.session.warp = updater;
	Corpse.find({warpName: req.session.warpName}, (err, data) => {
		var incoming = JSON.parse(req.body.updater);
		//console.log(incoming[0]);
		var newTrack = data[0].warp.push(incoming[0]);
		req.session.warp = data[0].warp;

		var conditions = { warpName: req.session.warpName },

		update = { warp: data[0].warp};
		//console.log("update");
		Corpse.update(conditions, update, function (){
			res.send(updater);
		});
	});
});

app.post('/delete', (req, res) => {
	Corpse.find({warpName:req.session.warpName},(err,data)=> {

		data[0].warp.pop();
		updater = data[0].warp;
			if(updater.length===0){
					//console.log("nothing in the warp")
				var conditions = { warpName: req.session.warpName },

				update = { warp: []};
				//console.log("update");
				Corpse.update(conditions, update, function (){
					res.send(updater);
				});
			}else {
				//console.log("something in");
			var conditions = { warpName: req.session.warpName },

			update = { warp: data[0].warp};
			//console.log("update");
			Corpse.update(conditions, update, function (){
				res.send(updater);
			});
		}

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

app.post('/timeSub', (req, res) => {
	Corpse.find({warpName: req.session.warpName}, (err, data) => {
		if(data[0].warp.length<data[0].numCont){////warp still needs contributors

			var snippet = JSON.parse(req.body.timeSubNum);
			var newTimeSub = data[0].timeSub + snippet;
			var newWarp = data[0].warp;
			for (var i = 0; i < newWarp.length; i++) {
			   newWarp[i].start =newWarp[i].start - snippet;
			   newWarp[i].end =newWarp[i].end - snippet;
			}
			var one = JSON.parse(snippet);
			var two = JSON.parse(data[0].timeSub);
			var bigTime = one+two;
			req.session.warp = newWarp;
			var conditions = { warpName: req.session.warpName },
			  update = { timeSub: bigTime,
			                     warp:newWarp,
			                 	};
			//console.log("time subtraced");
			Corpse.update(conditions, update, function (){////add to timeSub
				res.send(data);
			});
		} else { ////add global time back to warp

			var newWarp = data[0].warp;
			var timeToAdd = data[0].warp[0].start* -1;
			for (var i = 0; i < newWarp.length; i++) {
				newWarp[i].start = newWarp[i].start +timeToAdd;
				newWarp[i].end = newWarp[i].end +timeToAdd;
			}
			req.session.warp = newWarp;
			req.session.trackFree = true;


			var conditions = { warpName: req.session.warpName },

			update = { trackFree: true,
						warp:newWarp};
			console.log("warp freed!");
			var session = req.session;
			//warpFinishEmail(session);
			Corpse.update(conditions, update, function (){
				res.send(data);
			});


		}
	});
});

app.post('/saveAndSend', (req, res) => {

//console.log("save and send");
	var warp = JSON.parse(req.body.warp);

    console.log(req.session.warpName);

	req.session.warp = warp;

	var conditions = { warpName: req.session.warpName },
	update = {warp:warp};

	Corpse.update(conditions, update, function (){
		res.send(req.session);
	});
	var session = req.session;
	warpFinishEmail(session);


});

function warpFinishEmail (data){
	//console.log(data);
	Corpse.find({warpName: session.warpName}, (err, data) => {
		// console.log(data);
        // console.log(data.length);
		var tracks = [];
		for(var i = 0; i <= data.length;i++){
			tracks.push(data[0].warp[i].src);
		}


	    let transporter = nodemailer.createTransport({
	        host: 'my.smtp.host',
	        port: 465,
	        secure: true, // use TLS
	        service: 'yahoo',
	        auth: {
	            user: 'brndnokf@yahoo.com',
	            pass: 'zptsnecrfqdclyfu'
	        }
	    });

	    // setup email data with unicode symbols
	    let mailOptions = {
	        from: 'Brendan O/ExquisiteWarps.net <brndnokf@yahoo.com>', // sender address
	        to: 'etherealveil@gmail.com, '+data[0].users, // list of receivers
	        subject: '💀'+session.moniker+'💀 finished a Warp', // Subject line
	        text: JSON.stringify(session), // plain text body
	        html: '<h1>'+data[0].warpName+'</h1><p>You can sign in and play/download your collective creation now.</p><a href="http://exquisitewarps.net"><button style="width:100%; height:40px; border-radius:25px;">ExquisiteWarps.net</button></a><br><p>'+data[0].message+'<br><br>'+tracks+'<br><br>'+data[0].users+'</p>' // html body
	    };
	    //send mail with defined transport object
	    transporter.sendMail(mailOptions, (error, info) => {
	        if (error) {
	            return console.log(error);
	        }
	        console.log('Message %s sent: %s', info.messageId, info.response);
	    });

/////////////////////////////////////////////////
            //
            // var helper = require('sendgrid').mail;
            // var fromEmail = new helper.Email('brndnokf@yahoo.com');
            // var toEmail = new helper.Email('etherealveil@gmail.com, '+data[0].users);
            // var subject = '💀 The project "'+session.warpName+'" has been 🔓';
            // var content = new helper.Content('text/html', '<h1>'+data[0].warpName+'</h1><p>You can sign in and play/download your collective creation now.</p><a href="http://exquisitewarps.net"><button style="width:100%; height:40px; border-radius:25px;">ExquisiteWarps.net</button></a><br><b>Warp Message:</b><p>'+data[0].message+'<br><br>'+tracks+'<br><br>'+data[0].users+'</p>');
            // var mail = new helper.Mail(fromEmail, subject, toEmail, content);
            // //var SENDGRID_API_KEY = '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';
            // var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
            // console.log(sg);
            // console.log(SENDGRID_API_KEY);
            // var request = sg.emptyRequest({
            //   method: 'POST',
            //   path: '/v3/mail/send',
            //   body: mail.toJSON()
            // });
            //
            // sg.API(request, function (error, response) {
            //   if (error) {
            //     console.log('Error response received');
            //   }
            //   console.log(response.statusCode);
            // //   console.log(response.body);
            // //   console.log(response.headers);
            // });
            //


console.log("WORKING??????");

            //
            // var sendgrid = require("sendgrid")("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");
            // var email = new sendgrid.Email();
            //
            // email.addTo("brndnokf@yahoo.com");
            // email.setFrom("etherealveil@gmail.com");
            // email.setSubject("Sending with SendGrid is Fun");
            // email.setHtml("and easy to do anywhere, even with Node.js");
            //
            // sendgrid.send(email);
            // console.log(email);
            // res.sendStatus(200);

            // var api_key = 'key-a57813cf58870640aeac0e3c1c9bd27b';
            // var domain = 'http://exquisitewarps.net';
            // var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
            //
            // var data = {
            //   from: 'Excited User <brndnokf@yahoo.com>',
            //   to: 'etherealveil@gmail.com',
            //   subject: 'Hello',
            //   text: 'Testing some Mailgun awesomness!'
            // };
            //
            // mailgun.messages().send(data, function (error, body) {
            //   console.log(error);
            // });






	});
}


app.post('/addGlobalTime', (req, res) => {
	Corpse.find({warpName: req.session.warpName}, (err, data) => {
		var add = data[0].timeSub;
		var arr = data[0].warp;

		for(var i = 0; i <= arr.length-1;i++){
			arr[i].start = arr[i].start+add;
			arr[i].end = arr[i].end+add;
		}
		req.session.warp = arr;
		var conditions = { warpName: req.session.warpName },
			  update = { warp: arr};
			  //console.log("addGlobalTime");
			Corpse.update(conditions, update, function (){
				res.send(data);
			});

	});
});

app.post('/sendEmail', (req, res) => {

req.session.users.push(req.body.toWhom);



    var conditions = { warpName: req.session.warpName },
          update = { bpm: req.body.bpm,
              message: req.body.message,
              users:req.session.users};

        Corpse.update(conditions, update, function (){
            res.send(update);
        });


        	    let transporter = nodemailer.createTransport({
        	        host: 'my.smtp.host',
        	        port: 465,
        	        secure: true, // use TLS
        	        service: 'yahoo',
        	        auth: {
        	            user: 'brndnokf@yahoo.com',
        	            pass: 'zptsnecrfqdclyfu'
        	        }
        	    });

        	    // setup email data with unicode symbols
        	    let mailOptions = {
        	        from: 'Brendan O/ExquisiteWarps.net <brndnokf@yahoo.com>', // sender address
        	        to: req.body.toWhom, // list of receivers
        	        subject: '💀'+session.moniker+'💀 invited you to "'+req.session.warpName+'"', // Subject line
        	        text: JSON.stringify(session), // plain text body
        	        html: req.session.moniker+' invited you to a project named "<b>'+req.session.warpName+'</b>" on <a href="http://exquisitewarps.net">exquisitewarps.net</a> Sign in with this email to contribute to it before someone else does.<br><div style="background-color:rgba(0,0,0,.2)">'+req.body.message+'</div><br><br><a href="http://exquisitewarps.net"><button style="width:100%; height:40px; border-radius:25px;">ExquisiteWarps.net</button></a><br><br>'+
                               '<h3>Wut is all this? </h3><hr>'+'<iframe width="560" height="315" src="https://www.youtube.com/embed/BGCKou1nBEQ" frameborder="0" allowfullscreen style="padding: 50px 0 100px 0; height:300px; margin-left:20%; width:60%;"></iframe>'+
                               '<span>The idea behind this audio game is based on the artists game:<b>Exquisite Corpse</b><br><br>Whoever starts the new Warp (admin) sets the amount of people they want to contribute to it and also they put in the first audio/track. Then they cut just a snippet off the end to send to the next user. The next warper will not be able to hear anything before this snippet. That warper should take in thesong snippet or sentence and use it as inspiration to add their bit.<br>And so on...and so on...<br>Until the number of contributers is reached. Then the warp is unlocked. Everyone can play the'+ ' whole creation and download a WAV file of the whole damn thing.<br><br>The idea is for a bunch of people to work on a song or mixtape together without really knowing any part of the bigger picture of the project until it is finished.<br>Created by Brendan OKeefe</span>' // html body
        	    };
        	    //send mail with defined transport object
        	    transporter.sendMail(mailOptions, (error, info) => {
        	        if (error) {
        	            return console.log(error);
        	        }
        	        console.log('Message %s sent: %s', info.messageId, info.response);
        	    });
//
//     var helper = require('sendgrid').mail;
//     var fromEmail = new helper.Email('etherealveil@gmail.com');
//     var toEmail = new helper.Email(req.body.toWhom);
//     var subject = '💀'+req.session.moniker+'💀 sent you a Warp called: '+req.session.warpName;
//     var content = new helper.Content('text/html', req.session.moniker+' invited you to a project named "<b>'+req.session.warpName+'</b>" on <a href="http://exquisitewarps.net">exquisitewarps.net</a> Sign in with this email to contribute to it before someone else does.<br><div style="background-color:rgba(0,0,0,.2)">'+req.body.message+'</div><br><br><a href="http://exquisitewarps.net"><button style="width:100%; height:40px; border-radius:25px;">ExquisiteWarps.net</button></a><br><br>'+
//           '<h3>Wut is all this? </h3><hr>'+
//           '<span>The idea behind this audio game is based on the artists game:<b>Exquisite Corpse</b><br><br>Whoever starts the new Warp (admin) sets the amount of people they want to contribute to it and also they put in the first audio/track. Then they cut just a snippet off the end to send to the next user. The next warper will not be able to hear anything before this snippet. That warper should take in thesong snippet or sentence and use it as inspiration to add their bit.<br>And so on...and so on...<br>Until the number of contributers is reached. Then the warp is unlocked. Everyone can play the'+ ' whole creation and download a WAV file of the whole damn thing.<br><br>The idea is for a bunch of people to work on a song or mixtape together without really knowing any part of the bigger picture of the project until it is finished.<br>Created by Brendan OKeefe</span>');
//     var mail = new helper.Mail(fromEmail, subject, toEmail, content);
//     var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
//
//     var request = sg.emptyRequest({
//       method: 'POST',
//       path: '/v3/mail/send',
//       body: mail.toJSON()
//     });
// console.log("SG STUFF>>>>"+sg);
// console.log("WHEREHHERHERH");
//     sg.API(request, function (error, response) {
//       if (error) {
//         console.log('Error response received');
//       }
//       console.log(response.statusCode);
//       console.log(response.body);
//       console.log(response.headers);
//
//     });

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
app.listen(3000, () => {
	console.info('Server started on:' + 3000);
});
