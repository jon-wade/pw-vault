var client = angular.module('client', ['ngRoute']);

client.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/',
            {
                templateUrl: './home/home.html',
                controller: 'home'
            })

        .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(true);
});

client.controller('home', ['$scope', '$rootScope', function($scope, $rootScope) {
    //set the page title
    $rootScope.title = 'Password Vault | Home';

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$';

    //submit button function
    $scope.submit = function() {
        //console.log('submit pressed');

        var usernameHash = CryptoJS.SHA256($scope.usernameInput);
        console.log(usernameHash.toString());
        console.log(usernameHash.toString().length);

        var passwordHash = CryptoJS.SHA256($scope.passwordInput);
        console.log(passwordHash.toString());
        console.log(passwordHash.toString().length);

        //TODO: now need to call /login endpoint

        //this return is for unit testing
        return true;
    };


}]);