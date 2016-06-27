var client = angular.module('client', ['ngRoute']);

client.service('idStore', function () {
    var _id = '';

    return {
        get_id: function () {
            return _id;
        },
        set_id: function(value) {
            _id = value;
        }
    };
});

//TODO: unit test apiGET function
client.service('apiGET', ['$http', '$cacheFactory', function($http, $cacheFactory) {
     return {
        callAPI: function(url, data) {
            return $http({
                url: url,
                data: data,
                method: 'GET',
                cache: true
            });
        },
        callCache: function(url, data) {
            return $cacheFactory.get('$http').get(url, data);
        }
    };
}]);

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

client.controller('home', ['$scope', '$rootScope', 'idStore', 'apiGET', function($scope, $rootScope, idStore, apiGET) {
    //set the page title
    $rootScope.title = 'Password Vault | Home';

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$';

    //submit button function
    $scope.submit = function() {
        //console.log('submit pressed');

        //TODO: need to unit-test the hash functions

        var usernameHash = CryptoJS.SHA256($scope.usernameInput);
        var passwordHash = CryptoJS.SHA256($scope.passwordInput);

        //TODO: now need to call /login endpoint
        //apiGET.callAPI('/login', {username: usernameHash, password: passwordHash});








        //this return is for unit testing
        return true;
    };


}]);