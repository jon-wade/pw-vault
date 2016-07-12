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
                    }, function() {
                        //email is not registered
                        def.reject();
                    });

                return def.promise;
            };
        }
    };
}]);

client.directive('emailReg', ['$q', 'apiPOST', function($q, apiPOST) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$asyncValidators.email = function(modelValue) {

                var def = $q.defer();

                var hashedEmail = CryptoJS.SHA256(modelValue).toString(CryptoJS.enc.Hex);

                apiPOST.callAPI('/email-verification', {email : hashedEmail})
                    .then(function() {
                        //email is registered
                        def.reject();
                    }, function() {
                        //email is not registered
                        def.resolve();
                    });

                return def.promise;
            };
        }
    };
}]);

client.directive('userReg', ['$q', 'apiPOST', function($q, apiPOST) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            //allows the display of error message, $error.username
            ctrl.$asyncValidators.username = function(modelValue) {

                var def = $q.defer();

                //username gets encrypted on server side before storing in database, so send username in plaintext
                apiPOST.callAPI('/username-verification', {username : modelValue})
                    .then(function() {
                        //username is registered
                        def.reject();
                    }, function() {
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

        .when('/view-site',
            {
                templateUrl: './view-site/view-site.html',
                controller: 'viewSite'
            })

        .when('/add-site',
            {
                templateUrl: './add-site/add-site.html',
                controller: 'addSite'
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

    $scope.go = function (destination) {
        $location.path(destination);
    };


}]);

client.controller('forgotten', ['$scope', 'idStore', '$rootScope', '$location', 'apiPOST', function($scope, idStore, $rootScope, $location, apiPOST) {

    $rootScope.title = 'Password Vault | Forgotten';

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$';

    $scope.go = function (destination) {
        $location.path(destination);
    };


    //these handle the toggle function
    $scope.username = false;
    $scope.password = false;
    $scope.email = false;


    $scope.changePassword = false;

    $scope.toggle = function(input) {
        if(input==='username') {
            $scope.username = true;
            $scope.password = false;
            $scope.email = true;
            $scope.changePassword = false;
        }
        else if (input==='password') {
            $scope.username = false;
            $scope.password = true;
            $scope.email = false;
            $scope.changePassword = true;
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

        //if its username recovery via email
        if ($scope.email) {

            //then call the api endpoint /username-recovery
            apiPOST.callAPI('/username-recovery', {_id: _id, email: $scope.emailInput})
                .then(function() {
                    //successful username recovery
                    //hide the ui and display the message
                    $scope.ui=false;
                    $scope.emailSuccessMessage = true;
                }, function() {
                    //error in username recovery
                    $scope.ui=false;
                    $scope.emailErrorMessage = true;
                });
        }
        else if($scope.changePassword) {

            var username = $scope.usernameInput;

            //hash password and email address
            var hashedEmail = CryptoJS.SHA256($scope.pwEmailInput).toString(CryptoJS.enc.Hex);
            var hashedPassword = CryptoJS.SHA256($scope.passwordInput).toString(CryptoJS.enc.Hex);

            //then call a new /update-password endpoint
            //console.log('calling /update-password endpoint');
            apiPOST.callAPI('/update-password', {username: username, email: hashedEmail, password: hashedPassword}).then(function(){
                //successfully updated password in db
                //console.log('res=', res);
                $scope.ui=false;
                $scope.passwordSuccessMessage = true;
            }, function() {
                //error updating password in db
                //console.log('rej=', rej);
                $scope.ui=false;
                $scope.passwordErrorMessage = true;
            });
        }
    };

}]);

client.controller('register', ['$scope', 'idStore', '$rootScope', '$location', 'apiPOST', '$interval', function($scope, idStore, $rootScope, $location, apiPOST, $interval) {

    $rootScope.title = 'Password Vault | Register';

    $scope.go = function (destination) {
        $location.path(destination);
    };

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$';

    $scope.registrationForm = true;
    $scope.registrationSuccess = false;
    $scope.registrationError = false;

    $scope.register = function() {

        var username = $scope.usernameInput;
        //hash password and email address

        var hashedEmail = CryptoJS.SHA256($scope.emailInput).toString(CryptoJS.enc.Hex);
        var hashedPassword = CryptoJS.SHA256($scope.passwordInput).toString(CryptoJS.enc.Hex);

        //post to /create endpoint

        apiPOST.callAPI('/create', {username: username, password: hashedPassword, email: hashedEmail}).then(function(res) {
            //successful registration of new user
            //console.log('successfully registered', res);
            idStore.set_id(res.data);
            $scope.registrationSuccess = true;
            $scope.registrationForm = false;
            $scope.redirect(10, '/manager');
        }, function() {
            //failed registration of new user
            //console.log('error in registration', rej);
            $scope.registrationError = true;
            $scope.registrationForm = false;
            $scope.redirect(10, '/home');
        });

    };

    $scope.redirect = function(number, path) {

         $scope.timer = number;
         if (number === 0) {
             return $scope.go(path);
         }
         $interval(function() {
            number--;
            $scope.redirect(number, path);
        }, 1000);
    };

}]);


//TODO: unit test from here
client.controller('viewSite', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {

    $rootScope.title = 'Password Vault | View';

    $scope.go = function (destination) {
        $location.path(destination);
    };

}]);

client.controller('addSite', ['$scope', '$rootScope', '$location', 'apiPOST', 'idStore', function($scope, $rootScope, $location, apiPOST, idStore) {

    $rootScope.title = 'Password Vault | Add';

    $scope.go = function (destination) {
        $location.path(destination);
    };

    $scope.addSite = function() {

        //get _id
        var _id = idStore.get_id();

        //encrypt username, password
        var encryptedUsername = CryptoJS.AES.encrypt($scope.usernameInput, $scope.keyInput).toString();

        var encryptedPassword = CryptoJS.AES.encrypt($scope.passwordInput, $scope.keyInput).toString();

        console.log('sitenameInput=', $scope.sitenameInput);
        console.log('_id=', _id);
        console.log('encryptedUsername=', encryptedUsername);
        console.log('encryptedPassword=', encryptedPassword);


        apiPOST.callAPI('/add-site', {
            userId: _id,
            sitename: $scope.sitenameInput,
            username: encryptedUsername,
            password: encryptedPassword
        })
            .then(function(res) {
                //site record successfully added to db
                console.log('SUCCESS=', res);
                $scope.go('/manager');

            }, function(rej) {
                //site record failed to be added to db
                console.log('ERROR=', rej);


            });

    };




}]);