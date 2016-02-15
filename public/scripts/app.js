var app = angular.module('chat', []);
var socket = io();

app.controller('mainCtrl', function($scope, $timeout, $window){
    $scope.messages = [];
    var limit = 500;
    var windowIsActive = true;
    var unreadCount = 0;
    var audio = new Audio('/sound.mp3');
    var userName = "";
    
    var updateTitle = function(){
        document.title = "bam" + (unreadCount === 0 ? "" : " (" + unreadCount + ")");
    }
    
    var pushMessage = function(text, userName, type, date){
        $timeout(function(){
            $scope.messages.push({
                userName: userName,
                text: text, 
                date: date != null ? date : new Date(), 
                type: type
            });
        });
    }
    
    var setCookie = function(){
        document.cookie = "username=" + userName;
    }
    
    angular.element($window).bind('focus', function() {
            windowIsActive = true;
            unreadCount = 0;
            updateTitle();
        }).bind('blur', function() {
            windowIsActive = false;
        });
    
    socket.on('new message', function(message){
        pushMessage(message.text, message.userName, message.type, message.date);
        
        if(!windowIsActive && message.type === 1){
            unreadCount++;
            updateTitle();
            audio.play();
        }
    });
    
    socket.on('new username', function(message){
        pushMessage(message.text, null, 2);
        userName = message.userName;
        setCookie();
    });
    
    $scope.$watch('text', function(){
        if($scope.text && $scope.text.length > limit){
            $scope.text = $scope.text.substring(0, limit);
        } 
    }, true);
    
    $scope.submit = function(){
        if(!$scope.text || $scope.text.length === 0 || $scope.text.length > limit){
            return;
        }
        
        if(!($scope.text.indexOf("/") > -1)){
            pushMessage($scope.text, userName, 1, new Date());   
        }
        
        socket.emit('message', $scope.text);
        $scope.text = '';
    }
});