app.directive('scrollBottom', function ($timeout) {
    return {
        scope: {
            scrollBottom: "="
        },
        link: function (scope, element) {
            scope.$watchCollection('scrollBottom', function (newValue) {
                $timeout(function(){
                    $(element).scrollTop($(element)[0].scrollHeight);
                });
            }, true);
        }
    }
});