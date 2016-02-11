var app = angular.module('chat', []);
var socket = io();

app.controller('mainCtrl', function($scope, $timeout, $window){
    $scope.messages = [];
    var limit = 500;
    var windowIsActive = true;
    var unreadCount = 0;
    
    var updateTitle = function(){
        document.title = "bam" + (unreadCount === 0 ? "" : " (" + unreadCount + ")");
    }
    
    angular.element($window).bind('focus', function() {
            windowIsActive = true;
            unreadCount = 0;
            updateTitle();
        }).bind('blur', function() {
            windowIsActive = false;
        });
    
    var scroll = function(){
        // $timeout(function() {
        //     var div = angular.element(document.querySelector('#messages'));
        //     div.scrollTop = div[0].scrollHeight;
        // }, 0, false);
    }
    
    socket.on('new message', function(message){
        $timeout(function(){
            $scope.messages.push(message);
            
            if(!windowIsActive && message.type === 1){
                unreadCount++;
                updateTitle();
            }
            
            scroll();
        });
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
        
        socket.emit('message', $scope.text);
        $scope.text = '';
    }
});