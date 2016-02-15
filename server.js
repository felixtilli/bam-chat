var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io").listen(http);

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

var getRandomString = function() {
	var chars = "ÅÄÖåäöABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 4;
	var randomstring = "";
    
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
    
	return randomstring;
}

var getUsers = function(){
    var users = "Connected users: ";
    
    for(var socket in io.sockets.connected){
        users += (io.sockets.connected[socket].userName + ", ");
    }
     
    return users.slice(0, -2);
}
 
var handleSettingMessage = function(socket, text){
    if (text.substring(0, 10) === "/username ") {
        var userName = text.replace(/ /g,'').substring(9, 30);
        var oldUserName = socket.userName;
        socket.userName = userName;
        
        socket.emit("new username", {
            text: "You changed username to " + userName + ".",
            userName: userName
        });
        
        socket.broadcast.emit("new message", {
            text: oldUserName + " changed username to " + userName + ".",
            type: 2
        });
        
        return;
    }
    
    if(text === "/users"){
        socket.emit("new message", {
            text: getUsers(),
            type: 2
        });
        
        return;
    }
    
    socket.emit("new message", {
        text: "Available commands: '/help', '/username [username]', '/users'",
        type: 2
    });
}

var handleChatMessage = function(socket, text){
    socket.broadcast.emit("new message", {
        userName: socket.userName,
        text: text, 
        date: new Date(), 
        type: 1
    });
}

io.on("connection", function(socket){
    var cookie = socket.client.request.headers.cookie;
    
    if (cookie.indexOf("username=") > -1){
        socket.userName = cookie.split("username=")[1].replace(/ /g,'').substring(0, 30);
    } else {
        socket.userName = getRandomString();
    }
    
    socket.emit("new username", {
        text: "Hi, " + socket.userName + ". Write '/help' to display avaliable commands.",
        userName: socket.userName
    });
    
    socket.broadcast.emit("new message", {
        text: socket.userName + " has connected.", 
        type: 2
    });
    
    socket.on("disconnect", function(){
        socket.broadcast.emit("new message", {
            text: socket.userName + " has disconnected.", 
            type: 2
        });
    });
    
    socket.on("message", function(text){
        if(!text || text.length === 0){
            return;
        }
        
        if(text.length > 500){
            text = text.substring(0, 500);
        }
        
        if(text.indexOf("/") > -1){
            handleSettingMessage(socket, text);
        } else {
            handleChatMessage(socket, text);
        }
    });
});

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
http.listen(port, ipaddress, function() {
   console.log("listening to port " + port) 
});