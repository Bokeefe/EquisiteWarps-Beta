Exquisite Warps is a project by <a href="http://brendan.okeefefam.com">Brendan O'Keefe.</a> It began with <a href="https://github.com/naomiaro/waveform-playlist">Naomi Aro's Waveform Editor</a> framework and seeks to create a platform for music and storytelling collaboration. Like the artist's game Exquisite Corpse, it uses mystery, imagination, and collaboration to create something big together.

A user can start a new project, drop in a piece of music and mark off a snippet at the end to send to the next person.  This could be a drum outro or something that they will have to start with.  The next user cannot play anything before this snippet and the idea is that they add their contribution in a way that meshes with the audio clip they have been given. Next they mark off the end of their song snippet for the next user.  So any given person can not hear the entire piece until it reaches the amount of collaborators initially set by the first person that started the project, like lets say, 5. When the fifth person adds their contribution the whole thing is unlocked and users can download a wav file of what they made.

This platform was made with musicians in mind. It also could be used to make collaborative mixtapes around different themes. Future plans include a connected platform for bands and groups to work together in the DAW at the same time using Socket.io. It will have the feel of a Google Drive project only for musicians working together.

Native Javascript, Web Audio API, Node, Mongoose, MongoDB

<a href="https://www.youtube.com/watch?v=KDwkkep8ER4&t=5s">For a video DEMO go here</a>



instructions:
1)navigate to the package.json and...
npm i
2) open a new terminal window and enter...
mkdir data
mongod --dbpath ./data

3) open new terminal window and navigate to dist/waveform-playlist/server.js...
nodemon server.js

(or however you wanna run the node server)

dummy server helpers:

simplehttpserver 
or 
python -m SimpleHTTPServer


[MIT License](http://doge.mit-license.org)
