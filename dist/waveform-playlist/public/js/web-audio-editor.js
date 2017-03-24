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
      console.log(updater);
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
