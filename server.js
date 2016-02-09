var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

var getRandomString = function() {
	var chars = "ÅÄÖåäöABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 4;
	var randomstring = '';
    
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
    
	return randomstring;
}

io.on('connection', function(socket){
    socket.userName = getRandomString();
    
    socket.on('message', function(text){
        if(!text || text.length === 0 || text.length > 500){
            return;
        }
        
        io.emit('new message', {
            userName: socket.userName,
            text: text
        });
    });
});

http.listen(app.get('port'));