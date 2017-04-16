var playlist = WaveformPlaylist.init({
  samplesPerPixel: 3000,
  waveHeight: 100,
  container: document.getElementById("playlist"),
  state: 'cursor',
  colors: {
    waveOutlineColor: '#E0EFF1',
    timeColor: 'grey',
    fadeColor: 'black'
  },
  timescale: true,
  controls: {
    show: true, //whether or not to include the track controls
    width: 200 //width of controls in pixels
  },
  seekStyle : 'line',
  zoomLevels: [500, 1000, 3000, 5000]
});

function allwarps(){
  $.post( "/allwarps", function( data ) {
    var options = data;
    for(var i=0; i< options.length;i++)
    {
    //creates option tag
      jQuery('<option/>', {
            value: options[i],
            html: options[i]
            }).appendTo('#dropdown select'); //appends to select if parent div has id dropdown
    }
  });
}
allwarps();


$.get("/userDeets", function(data, status){
//
    if (typeof data.email !== "undefined"){
        console.log(data.email);
        console.log(data);
        $('#page').hide();
        $('#picker').hide();
        $('#main').show();
        $('.warpDisplay').html(data.warp);
        $('#userDisplay').html(data.email);

        playlist.load(data.tracks).then(function() {
          //can do stuff with the playlist.

          //initialize the WAV exporter.
          playlist.initExporter();
        });
    }
});

//
// var warpPick = $('#warps option:selected').text();
//
// $.post( "warpPick", { warpPick: warpPick }, function(response){
//
//   if(response.status === "success") { //if logged in
//   var corpse = response.data;
//   $('#picker').hide();
//   $('#main').show();
//   $.get("/userDeets", function(data, status){
//       if (status === "success"){
//
//
//       $('.warpDisplay').html(data.warp);
//     } else {
//       $('.warpDisplay').html("this is broken");
//     }
//   });
//   playlist.load(corpse[0].warp).then(function() {
//     //can do stuff with the playlist.
//
//     //initialize the WAV exporter.
//     playlist.initExporter();
//   });
//      } else {
//         $("#xusername").show();//lol didn't get to test this
//      }
//    });
// } else {
// $.post("/newWarp", { //post to the register api
//     warpName : warpName
// }, function(response){
//   //console.log(response);
//   if(response.status === "success") { //if logged in
//
//      } else {
//         $("#xusername").show();//lol didn't get to test this
//      }
//    });
//  }





////SUBMIT BUTTONS /////////////////

$("#submit").click(function(){
    //  var name =  $("#name").val();
      var email = $("#email").val();
      var password = $("#password").val();
  $.post("/login", { //post to the register api
    email:email,
    password:password
  }, function(response){
    if(response.status === "success") { //if logged in
    //window.location = './web-audio-editor.html';//takes you to homepage
    $('#page').hide();
    $('#picker').show();

    $.get("/userDeets", function(data, status){
        if (status === "success"){

        $('#userDisplay').html(data.email);
      } else {
        $('#userDisplay').html("this is broken");
      }
    });
    } else {
        console.log(response.status);
        $("#xusername").show();
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
    $('#rego').hide();
  console.log(session.email);
     } else {
        $("#xusername").show();//lol didn't get to test this
     }
   });
});

$("#submit3").click(function(e){
  e.preventDefault();
  var warpName =  $("#warpname").val();
  if(warpName===""){ //go with dropdown selection
    e.preventDefault();
  var warpPick = $('#warps option:selected').text();

  $.post( "warpPick", { warpPick: warpPick }, function(response){

    if(response.status === "success") { //if logged in
    var corpse = response.data;
    $('#picker').hide();
    $('#main').show();
    $.get("/userDeets", function(data, status){
        if (status === "success"){


        $('.warpDisplay').html(data.warp);
      } else {
        $('.warpDisplay').html("this is broken");
      }
    });
    playlist.load(corpse[0].warp).then(function() {
      //can do stuff with the playlist.

      //initialize the WAV exporter.
      playlist.initExporter();
    });
       } else {
          $("#xusername").show();//lol didn't get to test this
       }
     });
  } else {
  $.post("/newWarp", { //post to the register api
      warpName : warpName
  }, function(response){
    //console.log(response);
    if(response.status === "success") { //if logged in

       } else {
          $("#xusername").show();//lol didn't get to test this
       }
     });
   }
});
/////////////////////////////////////////////////////////////////////
// $.get("/username", function(data, status){
//     if (status === "success"){
//       //console.log(JSON.stringify(data));
//     $('#user').html(data);
//   } else {
//     $('#result').html("this is broken");
//   }
// });
//////// EVENT LISTENERS //////////////////////////
$('#chopper').click(function(){
    var selection = playlist.getTimeSelection();
    selection = JSON.stringify(selection.start);
    $('#chopperDisplay').html(selection);
});

$('#delete').click(function(){
  var updater = [];
  var trackNow = playlist.getInfo();
  for(var i =0; i < trackNow.length-1;i++) {
    updater.push(trackNow[i]);
  }
    updater = JSON.stringify(updater);
    $.post("/delete",
      {updater:updater,
      name:name},
      function(data,status){
        //data = playlist.getInfo();
        data = JSON.stringify(data);
        deleter(data);
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
console.log(playlist.getTimeSelection());
  var data = playlist.getInfo();
  data = JSON.stringify(data);
  save(data);
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
          console.log('upload successful!\n' + data);
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
function addTrack(upload){

  playlist.load(upload).then(function() {
       //can do stuff with the playlist.
       var data = playlist.getInfo();
       data = JSON.stringify(data);
        save(data);
       playlist.initExporter();
     });

}

function save (data){
//cara  var name = "crap";//get request for session name
  var updater = data;
  //console.log(data);
      $.post("/update",
        {updater:updater},
        function(data,status){


        //   location.reload();
          // playlist.load(data).then(function() {
          // playlist.initExporter();
          //     });
      });
}
function deleter (data){
//cara  var name = "crap";//get request for session name
  var updater = data;
  //console.log(data);
      $.post("/update",
        {updater:updater},
        function(data,status){


        location.reload();

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
