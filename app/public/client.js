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

//TODO: unit test directive
client.directive('email', function($q, $timeout) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var email = ['jonwadeuk@gmail.com'];

            ctrl.$asyncValidators.email = function(modelValue) {

                var def = $q.defer();

                $timeout(function() {
                    // Mock a delayed response
                    if (email.indexOf(modelValue) !== -1) {
                        // The username is valid
                        def.resolve();
                    } else {
                        def.reject();
                    }

                }, 2000);

                return def.promise;
            };
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

        .when('/forgotten',
            {
                templateUrl: './forgotten/forgotten.html',
                controller: 'forgotten'
            })

        .when('/register',
            {
                templateUrl: './register/register.html',
                controller: 'register'
            })


        .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(true);
});

client.controller('home', ['$scope', '$rootScope', 'idStore', 'apiPOST', '$location', function($scope, $rootScope, idStore, apiPOST, $location) {
    //set the page title
    $rootScope.title = 'Password Vault | Home';

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$';

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

client.controller('manager', ['$scope', 'idStore', '$rootScope', '$location', function($scope, idStore, $rootScope, $location) {
    //manager controller code here
    $scope._id = idStore.get_id();

    $rootScope.title = 'Password Vault | Manager';


    $scope.logout = function () {
        idStore.set_id('');
        $location.path('/');
    };


}]);

client.controller('forgotten', ['$scope', 'idStore', '$rootScope', '$location', function($scope, idStore, $rootScope, $location) {

    $rootScope.title = 'Password Vault | Forgotten';

    $scope.go = function (destination) {
        $location.path(destination);
    };

    //TODO: need to unit test toggle function
    $scope.username = true;
    $scope.password = false;
    $scope.email = false;

    $scope.toggle = function(input) {
        if($scope.username===true && input==='username') {
            $scope.username = true;
            $scope.password = false;
            $scope.email = true;
        }
        else if ($scope.username===false && input==='username') {
            $scope.username = !$scope.username;
            $scope.password = !$scope.password;
            $scope.email = true;
        }
        else if ($scope.password===true && input==='password') {
            $scope.username = false;
            $scope.password = true;
            $scope.email = false;

        }
        else if ($scope.password===false && input==='password') {
            $scope.username = !$scope.username;
            $scope.password = !$scope.password;
            $scope.email = false;

        }
    }


}]);

client.controller('register', ['$scope', 'idStore', '$rootScope', '$location', function($scope, idStore, $rootScope, $location) {

    $rootScope.title = 'Password Vault | Register';

    $scope.go = function (destination) {
        $location.path(destination);
    }


}]);