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

$('#delete').click(function(){
  var trackDel = [];
  var trackNow = playlist.getInfo();
  for(var i =0; i < trackNow.length-1;i++) {
    trackDel.push(trackNow[i]);
  }
trackDel = JSON.stringify(trackDel);
  $.post("/delete",
    {trackDel:trackDel},
    function(data,status){
  if(status==="success"){
    setTimeout(function(){location.reload();},500);
  }
  });
});

$('#playlist > div > div.playlist-tracks').mouseup(function(){
  var updater = JSON.stringify(playlist.getInfo());
      $.post("/update",
        {updater:updater},
        function(data,status){
      });
      //console.log(updater);
});

$('#track-jup').click(function(){

$.getJSON( "../media/json/ontrack.json", function(data) {
var onetrack = data;

    playlist.load(onetrack).then(function() {
      //can do stuff with the playlist.

      //initialize the WAV exporter.
      playlist.initExporter();
    });
  })
  .fail(function() {
    console.log( "error" );
  });

        
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
    var newTrack = "../media/audio/"+file.name;
    console.log(newTrack);
var upload = [ {
  "src": newTrack,
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
}]
console.log(upload);
  playlist.load(upload).then(function() {
      //can do stuff with the playlist.

      //initialize the WAV exporter.
      playlist.initExporter();
    });



  }
});

var tracks;
$.getJSON( "../media/json/1stplaylist.json", function(data) {
var tracks = data;

    playlist.load(tracks).then(function() {
      //can do stuff with the playlist.

      //initialize the WAV exporter.
      playlist.initExporter();
    });
  })
  .fail(function() {
    console.log( "error" );
  });

