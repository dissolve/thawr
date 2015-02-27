

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = {
    channels: ["#indiechat"],
    server: "irc.freenode.net",
    botName: "thawr"
};

// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

app.get('/', function(req, res){
      //res.sendfile('index.html');
      res.sendFile(__dirname + '/html/index.html');
});

bot.addListener("message", function(from, to, text, message) {
    //console.log('message received from IRC');
    io.emit('message', "<" + from+"> " + text);
});

io.on('connection', function(socket){
    //console.log('user connected');


    socket.on('chat message', function(msg){
        console.log('message from user: ' + msg);
        nickchange = msg.match('^/nick ([^ ]*)')
        if(nickchange){
            bot.send('NICK' , nickchange[1]);
            config.botName = nickchange[1];
        } else {
            bot.say('#indiechat', msg);
        }
        io.emit('message', "<" + config.botName +"> " + msg);
    });
});

http.listen(3000, function(){
      console.log('listening on *:3000');
});
