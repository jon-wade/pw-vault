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

        .when('/manager',
            {
                templateUrl: './manager/manager.html',
                controller: 'manager'
            })

        //TODO: unit test forgotten routing
        .when('/forgotten',
            {
                templateUrl: './forgotten/forgotten.html',
                controller: 'forgotten'
            })

        .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(true);
});

client.controller('home', ['$scope', '$rootScope', 'idStore', 'apiPOST', '$location', function($scope, $rootScope, idStore, apiPOST, $location) {
    //set the page title
    $rootScope.title = 'Password Vault | Home';

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$';

    //TODO: unit test go redirect function
    $scope.go = function (destination) {
        $location.path(destination);
    };

    //submit button function
    $scope.submit = function() {
        //console.log('submit pressed');

        //TODO: need to unit-test the hash function??
        var passwordHash = CryptoJS.SHA256($scope.passwordInput).toString();

        apiPOST.callAPI('/login-test', {username: $scope.usernameInput, password: passwordHash}).then(function(res) {

            //login credentials are OK
            console.log('res=', res);

            //grab id from response object and store
            idStore.set_id(res.data._id);

            //redirect to the /manager page
            $location.path('/manager');


        }, function(rej) {
            //login credentials are not OK and an error message should be displayed
            console.log('rej=', rej);
            if(rej.status === 404){
                $scope.loginInvalid = true;
            }
        });

        //this return is for unit testing the submit() method
        return true;
    };


}]);

//TODO: manager controller needs to be unit tested
client.controller('manager', ['$scope', 'idStore', '$rootScope', function($scope, idStore, $rootScope) {
    //manager controller code here
    $scope._id = idStore.get_id();

    $rootScope.title = 'Password Vault | Manager';


}]);

//TODO: forgotten controller needs to be unit tested
client.controller('forgotten', ['$scope', 'idStore', '$rootScope', '$location', function($scope, idStore, $rootScope, $location) {

    $rootScope.title = 'Password Vault | Forgotten';
    $scope.go = function (destination) {
        $location.path(destination);
    }


}]);