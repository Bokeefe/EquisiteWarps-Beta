var playlist = WaveformPlaylist.init({
  samplesPerPixel: 3000,
  waveHeight: 100,
  container: document.getElementById("playlist"),
  state: 'cursor',
  colors: {
    waveOutlineColor: 'white',
    timeColor: 'grey',
    fadeColor: 'black'
  },
  timescale: true,
  controls: {
    show: true, //whether or not to include the track controls
    width: 150 //width of controls in pixels
  },
  seekStyle : 'line',
  zoomLevels: [500, 1000, 3000, 5000]
});

var isUnlocked;


$.get("/getSession", function(data, status){

    if (typeof data.email !== "undefined"){
        $('#page').hide();
        $('#picker').hide();
        $('#main').show();
        $('#warpDisplay').html(data.warp);
        $('#userDisplay').html(data.email);

        playlist.load(data.tracks).then(function() {
          //can do stuff with the playlist.

          //initialize the WAV exporter.
          playlist.initExporter();
        });
    }
});


////SUBMIT BUTTONS /////////////////

$("#submit").click(function(){
    //  var name =  $("#name").val();
      var email = $("#email").val();
      var password = $("#password").val();
  $.post("/login", { //post to the register api
    email:email,
    password:password
  }, function(response){
    console.log(response);
    if(response.status === "success") { //if logged in
    $('#page').hide();
    $('#picker').show();

        var options = response.data;
    for(var i=0; i< options.length;i++)
    {
    //creates option tag
      jQuery('<option/>', {
            value: options[i],
            html: options[i]
            }).appendTo('#dropdown select'); //appends to select if parent div has id dropdown
    }
    //$('#warps').html("Glue");
    $.get("/getSession", function(data, status){
        if (status === "success"){
         $('#userDisplay').html(data.email);
      }
    });
    } else {
        $('#xusername').show();
        $('#invalidMessage').html(response.message);

    }
  });
});

$("#submit2").click(function(){
    var name =  $("#name2").val();
    var email = $("#email2").val();
    var password = $("#password2").val();
$.post("/register", { //post to the register api
    name: name,
    email: email,
    password: password
}, function(response){
  if(response.status === "success") { //if logged in
    $('#email').val($('#email2').val());
    $('#password').val($('#password2').val());
    $('#rego').hide();

     } else {
        $("#xusername").show();//lol didn't get to test this
         $('#invalidMessage').html(response.message);
     }
   });
});

$("#submit3").click(function(e){
  e.preventDefault();

    var contPick = $('#sel1').val();
    var newWarp = $("#warpname").val();
    var storeWarp = $('#storedWarps').val();
   

  if(newWarp =="" && storeWarp == ""){
    $("#xusername").show();
    $('#invalidMessage').html("Either make a new warp or select one.");

  } else if (newWarp=="" && storeWarp != null){
    //console.log("go with the warp you picked");


      $.post( "warpPick", { warpPick: storeWarp }, function(response){/////I would tighted up this for security later
        if(response.status === "success") { //if logged in
          var corpse = response.data;
          $('#picker').hide();
          $('#main').show();
          $.get("/getSession", function(data, status){
              if (status === "success"){

                var users = corpse[0].users;
                var check = users.indexOf("data.email");
                  $('#xusername').hide();
                  $('#warpDisplay').html(corpse[0].warpName);
                  $('#trackFree').html("Free The warp @ "+corpse[0].numCont);
                  $('#BPM').html("BPM: "+corpse[0].bpm);
                  $('#timeSub').html("TimeSubtracted: "+corpse[0].timeSub);
                  $('#admin').html("Warp Keeper: "+corpse[0].admin);
                  $('#users').html("Users: "+corpse[0].users);
                  $('#bottomNav').show();
                  $('#exitAdmin').html(corpse[0].admin);
                  $('#comment').val(corpse[0].message)
                  $('#exitTrackFree').html(corpse[0].numCont);
                  $('#exitBPM').val(corpse[0].bpm);

                  if (corpse[0].trackFree){////UNLOCKED
                    //console.log("unlocked");

                    $('#warpLock').html('<i class="fa fa-unlock" aria-hidden="true"></i>');
                    isUnlocked =true;
                    $('#unlockedGroup').css("background-color","red");
                    $('#bottomNav').hide();
                    $('#finalNavbar').show();

                        playlist.load(corpse[0].warp).then(function() {
                          //can do stuff with the playlist.

                          //initialize the WAV exporter.
                          playlist.initExporter();
                        });

                    } else {////LOCKED
                      console.log("Locked");

                      isUnlocked =false;
                        var lastTrack = corpse[0].warp;
                        lastTrack = lastTrack[lastTrack.length-1];
                        playlist.load([lastTrack]).then(function() {
                          //can do stuff with the playlist.
                          $('#trackCount').html("# Tracks So Far: "+ corpse[0].warp.length);
                          //initialize the WAV exporter.
                          playlist.initExporter();
                        });
                        $('#warpLock').html('<i class="fa fa-lock" aria-hidden="true"></i>');
                      }

              }
          });
        }
      });

  } else if (newWarp != "") {
    if(contPick!="Number of Contributors:"){
    
            $.post("/newWarp", { //post to the register api
              warpName : $('#warpname').val(),
              numCont: $('#sel1').val(),
              bpm : $('#bpmWrite').val()

          }, function(response){

            if(response.status === "success") { //if logged in
              $('#picker').hide();
              $('#xusername').hide();
              $('#main').show();
              $('#bottomNav').show();
              $('#warpDisplay').html($('#warpname').val());
              $('#trackFree').html("Number of contributors: "+$('#sel1').val());
              $('#BPM').html("BPM: "+ $('#bpmWrite').val());
              $('#timeSub').html("TimeSubtracted: "+ "0");
              $('#exitTrackFree').html($('#sel1').val());
              $('#exitBPM').val($('#bpmWrite').val());
              playlist.load([]).then(function() {
                //can do stuff with the playlist.

                //initialize the WAV exporter.
                playlist.initExporter();
              });
            }
          });

    } else if (contPick="Number of Contributors:") {
      $("#xusername").show();
      $('#invalidMessage').html("A new Warp you to give it a name and set the number of contributors.");
    }
  }else{
    $("#xusername").show();
    $('#invalidMessage').html("Either make a new warp or select one.");
  }

});

$('#saveAndSend').click(function(){
var warp = playlist.getInfo();
warp = JSON.stringify(warp);

    $.post( "saveAndSend", { warp: warp }, function(response){
      //console.log(response);
      alert("The other users have been emailed");
      setTimeout(function(){logout()},10000);

      });
});



//////// EVENT LISTENERS //////////////////////////
$('#emailTest').click(function(){
  $.post("/emailTest");
  });


$('#chopper').click(function(){
    var selection = playlist.getTimeSelection();
    selection = JSON.stringify(selection.start);
    timeSub(selection);
    $('#chopperDisplay').html(selection);
});

$('#next').click(function(e){
    e.preventDefault();
    $('#main').hide();
    $('#exitForm').show();
    $('#toWhom2').val($('#toWhom').val());


    $.get("/getSession", function(data, status){

      $('#warpDisplay2').html(data.warpName);
    });


});

$('#main').mouseup(function(){
    //console.log();
});


$('#sendEmail').click(function(){
    var toWhom = $('#toWhom2').val();
    var message= $('#comment').val();
    var bpm = $('#exitBPM').val();


    $.post("/sendEmail",
      {toWhom:toWhom,
        message:message,
        bpm:bpm},
      function(data,status){
        //console.log(status);
        alert("Email was send! Cool! You should get another email when the is done too!");
        setTimeout(function(){logout()},10000);
    });
});

$('#wut').click(function(){
    if ( $('#info').css('display') == 'none'){
        $('#info').show();
    } else {
      $('#info').hide();
    }
});

$('#delete').click(function(){
  var updater = [];
  var trackNow = playlist.getInfo();
  for(var i =0; i < trackNow.length-1;i++) {
    updater.push(trackNow[i]);
  }
    updater = JSON.stringify(updater);
    $.post("/delete",
    function(data,status){

      refreshSave(data);

    });
});

$('#logout').click(function(){
  $.post("/logout", function (data, status){
    if(status ==="success"){
      window.location = "/";
      $('#main').hide();
      $('#page').show();
    } else {
      reload();
    }
  });
});

$('#playlist > div > div.playlist-tracks').mouseup(function(){
//console.log(playlist.getTimeSelection());
  var data = playlist.getInfo();
  data = JSON.stringify(data);
  //save(data);
});


$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
});

$('#upload-input').on('change', function(){

  var files = $(this).get(0).files;
  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();
    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }

    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          //console.log('upload successful!\n' + data);
          var trackPath = "../media/audio/"+file.name;
          var upload = [ {
            "src": trackPath,
            "start": 0,
            "end": 0,
            "name": file.name,
            "cuein": 0,
            "cueout": 0,
            "fadeIn": {
              "shape": "logarithmic",
              "duration": 0.5
            },
            "fadeOut": {
              "shape": "logarithmic",
              "duration": 0.5
            }
          }];
          //console.log(upload);
          addTrack(upload);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $('.progress-bar').text(percentComplete + '%');
            $('.progress-bar').width(percentComplete + '%');

            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress-bar').html('Done');
            }
          }
        }, false);
        return xhr;
      }
    });
  }
});
///////////// FUNCTIONS TO CALL /////////////////////////
function timeSub (data){
    var trackNow = playlist.getInfo();
    var lastTrack = trackNow[trackNow.length-1];

      timeSubNum = JSON.stringify(data);
      lastTrack = JSON.stringify(lastTrack);

      $.post("/timeSub",
        {
        timeSubNum:timeSubNum,
        lastTrack:lastTrack},
        function(data,status){

          relog();////figure out if the warp was unlocked and make changes
          $.get("/getSession", function(data, status){
            //console.log(data);
            if(data.trackFree){
              //console.log("warp was unlocked");
              $('#finalNavbar').show();
              $('#bottomNav').hide();
              $('#playlistMessage2').html("YISS! you unlocked this warp make and final changes (only to your track) and hit SAVE and everyone else will be emailed.");
              $('#bottomNav').hide();
              $('#finalNav').show();
            }

          });

      });
}

function relog (){
  playlist.clear();
setTimeout(function(){loadSession();},000);
              //loadSession();


}
  function loadSession (){
      $.get("/getSession", function(data, status){
          //console.log("relog");
              playlist.load(data.warp).then(function() {
              //can do stuff with the playlist.

              //initialize the WAV exporter.
              playlist.initExporter();
            });

          $('#warpDisplay').html(data.warpName);
          $('#userDisplay').html(data.moniker);
          $('#trackFree').html("Unlocked: "+data.trackFree);
          $('#BPM').html("BPM: "+data.bpm);
          $('#timeSub').html("TimeSubtracted: "+data.timeSub);
          $('#admin').html("Warp Keeper: "+data.admin);
          $('#users').html("Users: "+data.users);
          $('#bottomNav').show();
          $('#exitAdmin').html(data.admin);
          $('#exitTrackFree').html(data.numCont);
          $('#exitBPM').val(data.bpm);
        });
    }

function addTrack(upload){

  playlist.load(upload).then(function() {
       //can do stuff with the playlist.
      playlist.initExporter();
      var data = playlist.getInfo();
      data = data[data.length-1];
      save(data);
     });
}

function save (data){
    //console.log("SAVE Function");

  var updater = [];
  updater.push(data);
  updater = JSON.stringify(updater);

      $.post("/update",
        {updater:updater},
        function(data,status){

      });
}
function refreshSave (data){
  var updater = data;
  playlist.clear();
playlist.load(data);

  // $.post("/update",
  //   {updater:updater},
  //   function(data,status){
  //       location.reload();
  // });
}


function logout(){
    $.post("/logout", function (data, status){
    if(status ==="success"){
      window.location = "/";
      $('#main').hide();
      $('#page').show();
    } else {
      reload();
    }
  });
}

//
// $.getJSON( "../media/json/1stplaylist.json", function(data) {
// var tracks = data;
//
//     playlist.load(tracks).then(function() {
//       //can do stuff with the playlist.
//
//       //initialize the WAV exporter.
//       playlist.initExporter();
//     });
//   })
//   .fail(function() {
//     console.log( "error" );
//   });
