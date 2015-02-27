

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = {
    channels: ["#indiechat","#indiewebcamp"],
    server: "irc.freenode.net",
    botName: "thawr"
};

var me = config.botName;
var channels = config.channels;


// Get the lib
var irc = require("irc");
var names = {}; 

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
    if(to = me){
        //if it is a direct message, treat it as a chat room with 
        //  room name = the other user's name
        io.emit('message', from, from, text, message);
    } else {
        io.emit('message', from, to, text, message);
    }
});

bot.addListener("join", function(channel, who) {
    io.emit('join', channel, who);
});

bot.addListener("names", function(channel, nicks){
    names[channel] = nicks;
    io.emit('names', channel, nicks);
});

bot.addListener("quit", function(who, reason, channels,  message) {
    io.emit('quit', who, reason, channels, message);
});

bot.addListener("part", function(channel, who, reason, message) {
    io.emit('part', channel, who, reason, message);
});


io.on('connection', function(socket){
    //console.log('user connected');
    io.emit('channels', channels);
    if(names){
        for(var chan in names){
            io.emit('names', chan,  names[chan]);
        }
    }


    socket.on('send message', function(room, msg){
        //console.log('message from user: ' + msg);
        nickchange = msg.match('^/nick ([^ ]*)')
        if(nickchange){
            bot.send('NICK' , nickchange[1]);
            me = nickchange[1];
        } else {
            bot.say(room, msg);
        }
        io.emit('message', me, room, msg, {});
    });
});

http.listen(3000, function(){
      console.log('listening on *:3000');
});
