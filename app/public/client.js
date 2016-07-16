var client = angular.module('client', ['ngRoute']);

client.service('idStore', function() {
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

client.service('managerIdStore', function() {
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

        .when('/change-password',
            {
                templateUrl: './change-password/change-password.html',
                controller: 'changePassword'
            })


        .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(true);
});

client.controller('home', ['$scope', '$rootScope', 'idStore', 'apiPOST', '$location', '$timeout', function($scope, $rootScope, idStore, apiPOST, $location, $timeout) {

    //set the page title
    $rootScope.title = 'Password Vault | Home';

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^(?=.*?[a-z])(?=.*?[0-9]).{8,}$';

    $scope.go = function (destination) {
        $location.path(destination);
    };

    //submit button function
    $scope.submit = function() {
        //console.log('submit pressed');

        var passwordHash = CryptoJS.SHA256($scope.passwordInput).toString();

        apiPOST.callAPI('/login-test', {username: $scope.usernameInput, password: passwordHash}).then(function(res) {

            //login credentials are OK
            //console.log('res=', res);

            //grab id from response object and store
            idStore.set_id(res.data._id);

            //redirect to the /manager page
            $location.path('/manager');


        }, function(rej) {
            //login credentials are not OK and an error message should be displayed
            //console.log('rej=', rej);
            if(rej.status === 404){
                $scope.loginInvalid = true;
                $timeout(function() {$scope.loginInvalid = false}, 3500)
            }
        });

    };


}]);

client.controller('manager', ['$scope', '$rootScope', '$location', 'idStore', 'apiPOST', 'managerIdStore', function($scope, $rootScope, $location, idStore, apiPOST, managerIdStore) {
    //manager controller code here

    $rootScope.title = 'Password Vault | Manager';

    $scope.logout = function () {
        idStore.set_id('');
        $location.path('/');
    };

    $scope.go = function (destination, managerId) {
        //console.log('managerId=', managerId);
        managerIdStore.set_id(managerId);
        $location.path(destination);
    };

    //get site list and render on page

    $scope._id = idStore.get_id();

    apiPOST.callAPI('/site-list', {userId: $scope._id})
        .then(function(res) {
            //successfully retrieved site list from db
            //need the site list to be in an array to allow ng-repeat to easily render on page
            console.log('res=', res);
            $scope.siteList = res.data.data;

        }, function(rej) {
            //error retrieving site list from db
            if(rej.data.errorMessage === 'No records found that matches userId') {
                $scope.noSites = true;
            }
            else {
                //internal db error
                console.log('rej=', rej);
            }
        });
}]);

client.controller('forgotten', ['$scope', 'idStore', '$rootScope', '$location', 'apiPOST', function($scope, idStore, $rootScope, $location, apiPOST) {

    $rootScope.title = 'Password Vault | Forgotten';

    //set password parameters, at least 8 characters, at least one letter, only a-z, A-Z and 0-9
    $scope.regex = '^(?=.*?[a-z])(?=.*?[0-9]).{8,}$';

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
        }
        else if (input==='password') {
            $scope.username = false;
            $scope.password = true;
            $scope.email = true;
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
        if ($scope.username) {

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
        else if($scope.password) {

            //then call the api endpoint /password-recovery
            apiPOST.callAPI('/password-recovery', {_id: _id, email: $scope.emailInput})
                .then(function() {
                    //successful password recovery
                    //hide the ui and display the message
                    $scope.ui=false;
                    $scope.passwordSuccessMessage = true;
                }, function(rej) {
                    //error in password recovery
                    console.log('rej=', rej);
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
    $scope.regex = '^(?=.*?[a-z])(?=.*?[0-9]).{8,}$';

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
        }, function() {
            //failed registration of new user
            //console.log('error in registration', rej);
            $scope.registrationError = true;
            $scope.registrationForm = false;
        });

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

        //console.log('sitenameInput=', $scope.sitenameInput);
        //console.log('_id=', _id);
        //console.log('encryptedUsername=', encryptedUsername);
        //console.log('encryptedPassword=', encryptedPassword);

        apiPOST.callAPI('/add-site', {
                userId: _id,
                sitename: $scope.sitenameInput,
                username: encryptedUsername,
                password: encryptedPassword
            })
            .then(function(res) {
                //site record successfully added to db
                //console.log('SUCCESS=', res);
                $scope.go('/manager');
            }, function(rej) {
                //site record failed to be added to db
                //console.log('ERROR=', rej);
                $scope.addSiteError = true;
                $scope.addSiteForm = false;
            });

    };

}]);

client.controller('viewSite', ['$scope', '$rootScope', '$location', 'managerIdStore', 'idStore', 'apiPOST', '$timeout', function($scope, $rootScope, $location, managerIdStore, idStore, apiPOST, $timeout) {

    $rootScope.title = 'Password Vault | View';

    $scope.go = function (destination) {
        $location.path(destination);
    };

    //show placeholders for username and password
    $scope.encrypted = true;

    //get user and manager ids
    $scope.userId = idStore.get_id();
    $scope.managerId = managerIdStore.get_id();

    //now we need to pull back the record that matches both ids
    apiPOST.callAPI('/retrieve-site', {userId: $scope.userId, managerId: $scope.managerId})
        .then(function(res) {
            //successfully retrieved from db
            //console.log('res=', res);
            //$scope.encrypted = false;
            $scope.sitename = res.data.data[0].sitename;
            $scope.encryptedUsername = res.data.data[0].username;
            $scope.encryptedPassword = res.data.data[0].password;
        }, function(rej) {
            //error retrieving from db
            //console.log('rej=', rej);
        });

    //delete current site when delete button is pressed
    $scope.delete = function() {

        apiPOST.callAPI('/delete-site', {managerId: $scope.managerId})
            .then(function(res) {
                //site successfully deleted
                //console.log('res=', res);
                //return to the manager page
                $scope.go('/manager');
            }, function(rej) {
                //site deletion error
                //console.log('rej=', rej);
            });

    };

    //when decrypt key is pressed, decrypt username and password
    $scope.decrypt = function() {

        //console.log($scope.keyInput);

        if($scope.keyInput === undefined) {
            //no encryption key entered, do nothing
        }
        else {
            try {
                var plaintextUsername = CryptoJS.AES.decrypt($scope.encryptedUsername, $scope.keyInput).toString(CryptoJS.enc.Utf8);
                var plaintextPassword = CryptoJS.AES.decrypt($scope.encryptedPassword, $scope.keyInput).toString(CryptoJS.enc.Utf8);
                if (plaintextUsername==='' || plaintextPassword==='') {
                    //not the correct encryption key
                    //change color of button for 3 seconds
                    $scope.incorrectKey = true;
                    $timeout(function() {$scope.incorrectKey = false;}, 3000);
                }
                else {
                    $scope.encrypted = false;
                    $scope.usernameInput = plaintextUsername;
                    $scope.passwordInput = plaintextPassword;
                }
            }
            catch(err) {
                //not the correct encryption key
                //change color of button for 3 seconds
                $scope.incorrectKey = true;
                //console.log('$scope.incorrectKey=', $scope.incorrectKey);
                $timeout(function() {$scope.incorrectKey = false;}, 3000);
            }
        }

    };

    $scope.encrypt = function() {

        //all input fields can now be completed, so we can pull the values from them and send to the db to edit the current site

        //we need to re-encrypt the username and password with the encryption key

        //encrypt username, password
        var encryptedUsername = CryptoJS.AES.encrypt($scope.usernameInput, $scope.keyInput).toString();

        var encryptedPassword = CryptoJS.AES.encrypt($scope.passwordInput, $scope.keyInput).toString();

        apiPOST.callAPI('/edit-site', {
            _id: $scope.managerId,
            username: encryptedUsername,
            password: encryptedPassword
        })
            .then(function(res) {
                //site successfully edited
                //console.log('res=', res);
                $scope.encrypted = true;
                $scope.disableButton = true;
                $timeout(function() {$scope.go('/manager');}, 2000);
            }, function(rej) {
                //site edit failed
                //console.log('rej=', rej);
            });
    };

}]);

client.controller('changePassword', ['$scope', '$rootScope', '$location', 'apiPOST', function($scope, $rootScope, $location, apiPOST) {

    $rootScope.title = 'Password Vault | Password';

    $scope.go = function (destination) {
        $location.path(destination);
    };

    $scope.id = $location.search().id;

    $scope.regex = '^(?=.*?[a-z])(?=.*?[0-9]).{8,}$';

    $scope.ui = true;
    $scope.passwordSuccessMessage = false;
    $scope.passwordErrorMessage = false;

    //console.log('$scope.id=', $scope.id);

    $scope.submit = function() {

        //hash password and email address
        var hashedEmail = CryptoJS.SHA256($scope.pwEmailInput).toString(CryptoJS.enc.Hex);
        var hashedPassword = CryptoJS.SHA256($scope.passwordInput).toString(CryptoJS.enc.Hex);

        //then call a new /update-password endpoint
        //console.log('calling /update-password endpoint');
        apiPOST.callAPI('/update-password', {_id: $scope.id, username: $scope.usernameInput, email: hashedEmail, password: hashedPassword}).then(function(res){
            //successfully updated password in db
            //console.log('res=', res);
            $scope.ui=false;
            $scope.passwordSuccessMessage = true;
        }, function(rej) {
            //error updating password in db
            //console.log('rej=', rej);
            $scope.ui=false;
            $scope.passwordErrorMessage = true;
        });

    };

}]);

