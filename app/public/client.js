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

client.service('apiPOST', ['$http', function($http) {
     return {
        callAPI: function(url, data) {
            return $http({
                method: 'POST',
                url: url,
                data: data
            });
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

client.controller('home', ['$scope', '$rootScope', 'idStore', 'apiPOST', function($scope, $rootScope, idStore, apiPOST) {
    //set the page title
    $rootScope.title = 'Password Vault | Home';

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$';

    //submit button function
    $scope.submit = function() {
        //console.log('submit pressed');

        //TODO: need to unit-test the hash functions

        var usernameHash = CryptoJS.SHA256($scope.usernameInput).toString();
        var passwordHash = CryptoJS.SHA256($scope.passwordInput).toString();

        //TODO: now need to call /login endpoint and unit test

        apiPOST.callAPI('/login-test', {username: usernameHash, password: passwordHash}).then(function(res) {
            //login credentials are OK and can progress to manager page
            //grab id from response object
            console.log('res=', res);

        }, function(rej) {
            //login credentials are not OK and an error message should be displayed
            console.log('rej=', rej);
            if(rej.status === 404){
                $scope.loginInvalid = true;
            }
        });




        //this return is for unit testing
        return true;
    };


}]);