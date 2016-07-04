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

client.directive('email', ['$q', '$timeout', 'apiPOST', 'idStore', function($q, $timeout, apiPOST, idStore) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$asyncValidators.email = function(modelValue) {

                var def = $q.defer();

                var hashedEmail = CryptoJS.SHA256(modelValue).toString(CryptoJS.enc.Hex);

                apiPOST.callAPI('/email-verification', {email : hashedEmail})
                    .then(function(res) {
                        //email is registered
                        idStore.set_id(res.data._id);
                        def.resolve();
                    }, function(rej) {
                        //email is not registered
                        def.reject();
                    });

                return def.promise;
            };
        }
    };
}]);

//TODO: unit test emailReg (just switched rej and res around and removed idStore.set_id) - need template code first
client.directive('emailReg', ['$q', 'apiPOST', function($q, apiPOST) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$asyncValidators.email = function(modelValue) {

                var def = $q.defer();

                var hashedEmail = CryptoJS.SHA256(modelValue).toString(CryptoJS.enc.Hex);

                apiPOST.callAPI('/email-verification', {email : hashedEmail})
                    .then(function(res) {
                        //email is registered
                        def.reject();
                    }, function(rej) {
                        //email is not registered
                        def.resolve();
                    });

                return def.promise;
            };
        }
    };
}]);

//TODO: unit test userReg (as above) - need template code first
client.directive('userReg', ['$q', 'apiPOST', function($q, apiPOST) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            //allows the display of error message, $error.username
            ctrl.$asyncValidators.username = function(modelValue) {

                var def = $q.defer();

                //username gets encrypted on server side before storing in database, so send username in plaintext
                //need a new endpoint, /username-verification
                apiPOST.callAPI('/username-verification', {username : modelValue})
                    .then(function(res) {
                        //username is registered
                        def.reject();
                    }, function(rej) {
                        //username is not registered
                        def.resolve();
                    });

                return def.promise;
            };
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

client.controller('forgotten', ['$scope', 'idStore', '$rootScope', '$location', 'apiPOST', function($scope, idStore, $rootScope, $location, apiPOST) {

    $rootScope.title = 'Password Vault | Forgotten';

    $scope.go = function (destination) {
        $location.path(destination);
    };

    //these handle the toggle function
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
    };

    //display the user-interface
    $scope.ui = true;
    //display confirmation or error messages
    $scope.emailSuccessMessage = false;
    $scope.emailErrorMessage = false;


    $scope.helpMe = function() {
        //firstly get the id from store, which has to be done client-side
        var _id=idStore.get_id();

        //deactivate the Help Me button so there is only one click sent
        $scope.helpMeClicked = true;

        //then call the api endpoint /username-recovery

        apiPOST.callAPI('/username-recovery', {_id: _id, email: $scope.emailInput})
            .then(function(res) {
                //successful username recovery
                //hide the ui and display the message
                $scope.ui=false;
                $scope.emailSuccessMessage = true;
            }, function(rej) {
                //error in username recovery
                $scope.ui=false;
                $scope.emailErrorMessage = true;
            });
    };


}]);

client.controller('register', ['$scope', 'idStore', '$rootScope', '$location', 'apiPOST', function($scope, idStore, $rootScope, $location, apiPOST) {

    $rootScope.title = 'Password Vault | Register';

    $scope.go = function (destination) {
        $location.path(destination);
    };

    //TODO: unit test from here
    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$';

    $scope.register = function() {

        var username = $scope.usernameInput;
        //hash password and email address

        var hashedEmail = CryptoJS.SHA256($scope.emailInput).toString(CryptoJS.enc.Hex);
        var hashedPassword = CryptoJS.SHA256($scope.passwordInput).toString(CryptoJS.enc.Hex);

        //post to /create endpoint

        apiPOST.callAPI('/create', {username: username, password: hashedPassword, email: hashedEmail}).then(function(res) {
            //successful registration of new user
            console.log('successfully registered');
            //TODO: update user interface

        }, function(rej) {
            //failed registration of new user
            console.log('error in registration');
            //TODO: update user interface

        });

    };




}]);