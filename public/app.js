var app = angular.module('chat', []);
var socket = io();

app.controller('mainCtrl', function($scope, $timeout){
    $scope.messages = [];
    
    var scrollToBottom = function(){
        var div = document.getElementById('messages');
        div.scrollTop = div.scrollHeight;
    }
    
    socket.on('new message', function(message){
        $scope.messages.push(message);
        
        $timeout(function(){
            scrollToBottom();
        
            $timeout(function(){
                scrollToBottom();
            });
        });
    });
    
    $scope.submit = function(){
        if(!$scope.text || $scope.text.length === 0 || $scope.text.length > 500){
            return;
        }
        
        socket.emit('message', $scope.text);
        $scope.text = '';
    }
});