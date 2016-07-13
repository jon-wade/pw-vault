//client.js karma test here

//nest describes to allow another beforeEach call
describe('client.js unit test', function() {
    beforeEach(module('client'));

    describe('idStore service unit test', function() {

        it('should return an empty string when calling get_id...', inject(function(idStore){
            var res = idStore.get_id();
            expect(res).toBe('');
        }));

        it('should return the correct id when calling get_id after set_id...', inject(function(idStore){
            idStore.set_id('abcd1234');
            var res = idStore.get_id();
            expect(res).toBe('abcd1234');
        }));
    });

    describe('managerIdStore service unit test', function() {

        it('should return an empty string when calling get_id...', inject(function(managerIdStore){
            var res = managerIdStore.get_id();
            expect(res).toBe('');
        }));

        it('should return the correct id when calling get_id after set_id...', inject(function(managerIdStore){
            managerIdStore.set_id('abcd1234');
            var res = managerIdStore.get_id();
            expect(res).toBe('abcd1234');
        }));
    });

    describe('apiPOST service unit test', function(){

        it('should successfully return data object when data message matches an existing username and password...', inject(function(apiPOST, $rootScope, $httpBackend) {
            var response = {
                id: '12345'
            };

            $httpBackend.expect('POST', '/login', {username: 'jon'}).respond(200, response, null, 'success');
            apiPOST.callAPI('/login', {username: 'jon'}).then(function(res) {
                //console.log(res);
                expect(res.status).toBe(200);
                expect(res.data.id).toBe('12345');
                expect(res.statusText).toBe('success');
            });
            $rootScope.$digest();
            $httpBackend.flush();
            //expect(login).toBe(true);
            $httpBackend.verifyNoOutstandingRequest();
        }));

    });

    describe('email directive unit test ', function() {

        var scope, html;

        beforeEach(inject(function($compile, $rootScope) {
            scope = $rootScope.$new();
            html = $compile('<input type="email" ng-model="emailInput" ng-model-options="{debounce: 1000}" name="emailInput" id="emailInput" required email>' + '<span ng-show="emailForm.emailInput.$error.email">This email is not registered!</span>'+ '<span ng-show="emailInput && (!emailForm.emailInput.$pending.email && !emailForm.emailInput.$error.email)">Success!</span>')(scope);

        }));

        it('on successful validation, should set class ng-valid in the input field...', inject(function($httpBackend, idStore) {

            scope.emailInput = 'jonwadeuk@gmail.com';
            var response = {};
            var hashedEmail = CryptoJS.SHA256(scope.emailInput).toString(CryptoJS.enc.Hex);
            $httpBackend.expect('POST', '/email-verification', {email: hashedEmail}).respond(200, response, null, 'success');

            scope.$digest();
            $httpBackend.flush();

            expect(html[0].outerHTML).toContain('ng-valid');
            expect(idStore.get_id()).not.toBe('');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('on unsuccessful validation, should set class ng-invalid in the input field...', inject(function($httpBackend, idStore) {

            scope.emailInput = 'jonwadeku@gmail.com';
            var response = {};
            var hashedEmail = CryptoJS.SHA256(scope.emailInput).toString(CryptoJS.enc.Hex);
            $httpBackend.expect('POST', '/email-verification', {email: hashedEmail}).respond(404, response, null, 'error');

            scope.$digest();
            $httpBackend.flush();

            expect(html[0].outerHTML).toContain('ng-invalid');
            expect(idStore.get_id()).toBe('');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

    });

    describe('emailReg directive unit test ', function() {

        var scope, html;

        beforeEach(inject(function($compile, $rootScope) {
            scope = $rootScope.$new();
            html = $compile('<input type="email" id="emailInput" ng-model="emailInput" ng-model-options="{debounce:500}" name="emailInput" required ng-disabled="!usernameInput" email-reg="" placeholder="email">')(scope);
        }));

        it('on successful validation, should set class ng-invalid in the input field...', inject(function($httpBackend) {

            scope.emailInput = 'jonwadeuk@gmail.com';
            var response = {};
            var hashedEmail = CryptoJS.SHA256(scope.emailInput).toString(CryptoJS.enc.Hex);
            $httpBackend.expect('POST', '/email-verification', {email: hashedEmail}).respond(200, response, null, 'success');

            scope.$digest();
            $httpBackend.flush();

            //console.log('html=', html);

            //a success response from the server means that the email address is already registered, so class should be ng-invalid

            expect(html[0].outerHTML).toContain('ng-invalid');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('on unsuccessful validation, should set class ng-valid in the input field...', inject(function($httpBackend, idStore) {

            scope.emailInput = 'jonwadeku@gmail.com';
            var response = {};
            var hashedEmail = CryptoJS.SHA256(scope.emailInput).toString(CryptoJS.enc.Hex);
            $httpBackend.expect('POST', '/email-verification', {email: hashedEmail}).respond(404, response, null, 'error');

            scope.$digest();
            $httpBackend.flush();

            expect(html[0].outerHTML).toContain('ng-valid');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

    });

    describe('userReg directive unit test ', function() {

        var scope, html;

        beforeEach(inject(function($compile, $rootScope) {
            scope = $rootScope.$new();
            html = $compile('<input type="text" id="usernameInput" ng-model="usernameInput" ng-model-options="{debounce: 500}" name="usernameInput" required user-reg="" placeholder="username">')(scope);
        }));

        it('on successful validation, should set class ng-invalid in the input field...', inject(function($httpBackend) {

            scope.usernameInput = 'jonwade';
            var response = {};
            $httpBackend.expect('POST', '/username-verification', {username: scope.usernameInput}).respond(200, response, null, 'success');

            scope.$digest();
            $httpBackend.flush();

            //console.log('html=', html);

            //a success response from the server means that the email address is already registered, so class should be ng-invalid

            expect(html[0].outerHTML).toContain('ng-invalid');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('on unsuccessful validation, should set class ng-valid in the input field...', inject(function($httpBackend) {

            scope.usernameInput = 'jonwade';
            var response = {};
            $httpBackend.expect('POST', '/username-verification', {username: scope.usernameInput}).respond(404, response, null, 'error');

            scope.$digest();
            $httpBackend.flush();

            expect(html[0].outerHTML).toContain('ng-valid');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

    });

    describe('viewSite controller unit test 1', function() {
        var $controller;

        beforeEach(inject(function(_$controller_) {
            $controller = _$controller_;
        }));

        it('should set...)', inject(function($httpBackend) {

            //mock services
            var $scope = {};
            var $rootScope = {};
            var $location = {
                path: function() {}
            };
            var mockIdStore = {
                get_id: function() {
                    return '12345';
                }
            };
            var mockManagerIdStore = {
                get_id: function() {
                    return '98765';
                }
            };

            $controller('viewSite', {$scope: $scope, $rootScope: $rootScope, $location: $location, idStore: mockIdStore, managerIdStore: mockManagerIdStore});

            expect($scope.encrypted).toBe(true);

            $httpBackend.expect('POST', '/retrieve-site', {userId: '12345', managerId: '98765'}).respond(200, {}, null, 'success');

            $httpBackend.flush();

            //TODO: tests to go here

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

            spyOn($location, 'path');

            expect($rootScope.title).toBe('Password Vault | View');

            $scope.go('/test');

            expect($location.path).toHaveBeenCalledWith('/test');

        }));

    });

    describe('home controller unit test 1', function() {
        var $controller;

        beforeEach(inject(function(_$controller_) {
            $controller = _$controller_;
        }));

        it('should set $rootScope.title to "Password Vault | Home", correctly set the $scope.regex variable and $scope.go("/test") should call $location.path("/test)', inject(function() {

            //mock services
            var $scope = {};
            var $rootScope = {};
            var $location = {
                path: function() {}
            };
            var mockIdStore = {
                set_id: function() {
                    console.log('set_id called');
                },
                get_id: function() {
                    return '12345';
                }
            };

            $controller('home', {$scope: $scope, $rootScope: $rootScope, idStore: mockIdStore, $location: $location});

            spyOn(mockIdStore, 'set_id');
            spyOn($location, 'path');

            expect($rootScope.title).toBe('Password Vault | Home');
            expect($scope.regex).toBe('^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$');

            $scope.go('/test');

            expect($location.path).toHaveBeenCalledWith('/test');

        }));

    });

    describe('home controller unit test 2', function() {
        var $controller;

        beforeEach(inject(function(_$controller_) {
            $controller = _$controller_;
        }));

        it('$scope.submit() should call idStore.set_id() and $location.path("/manager") on successful call to /login-test endpoint', inject(function($httpBackend) {

            //mock services
            //don't bother mocking-out CryptoJS
            var $scope = {};
            var $rootScope = {};
            var $location = {
                path: function() {}
            };
            var mockIdStore = {
                set_id: function() {
                    console.log('set_id called');
                },
                get_id: function() {
                    return '12345';
                }
            };
            var mockResponse = {
                _id: '12345'
            };

            $scope.usernameInput = 'testusername';
            $scope.passwordInput = 'testpassword';

            spyOn($location, 'path');
            spyOn(mockIdStore, 'set_id');

            $controller('home', {$scope: $scope, $rootScope: $rootScope, idStore: mockIdStore, $location: $location});

            $httpBackend.expect('POST', '/login-test', {username: 'testusername', password: '9f735e0df9a1ddc702bf0a1a7b83033f9f7153a00c29de82cedadc9957289b05'}).respond(200, mockResponse, null, 'success');

            $scope.submit();

            $httpBackend.flush();

            expect(mockIdStore.set_id).toHaveBeenCalledWith('12345');
            expect($location.path).toHaveBeenCalledWith('/manager');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation()

        }));

    });

    describe('home controller unit test 3', function() {
        var $controller;

        beforeEach(inject(function(_$controller_) {
            $controller = _$controller_;
        }));

        it('$scope.submit() should set $scope.loginInvalid=true on error response from /login-test endpoint', inject(function($httpBackend) {

            //mock services
            //don't bother mocking-out CryptoJS
            var $scope = {};
            var $rootScope = {};
            var $location = {
                path: function() {}
            };
            var mockIdStore = {
                set_id: function() {
                    console.log('set_id called');
                },
                get_id: function() {
                    return '12345';
                }
            };

            $scope.usernameInput = 'testusername';
            $scope.passwordInput = 'testpassword';

            $controller('home', {$scope: $scope, $rootScope: $rootScope, idStore: mockIdStore, $location: $location});

            $httpBackend.expect('POST', '/login-test', {username: 'testusername', password: '9f735e0df9a1ddc702bf0a1a7b83033f9f7153a00c29de82cedadc9957289b05'}).respond(404, {}, null, 'error');

            $scope.submit();

            $httpBackend.flush();

            expect($scope.loginInvalid).toBe(true);

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation()

        }));

    });

    describe('manager controller unit test', function() {

        var $controller;

        beforeEach(inject(function(_$controller_) {
            $controller = _$controller_;
        }));

        it('should test the manager controller', inject(function($httpBackend) {
            var $scope = {};
            var $rootScope = {};
            var $location = {
                path: function() {}
            };
            var mockIdStore = {
                set_id: function() {
                    console.log('set_id called');
                },
                get_id: function() {
                    return '12345';
                }
            };
            var mockManagerIdStore = {
                set_id: function() {
                    console.log('manager set_id called');
                }
            };
            var mockResponse = {
                data: {}
            };

            $httpBackend.expect('POST', '/site-list', {userId: '12345'}).respond(200, mockResponse, null, 'success');

            $controller('manager', {$scope: $scope, $rootScope: $rootScope, idStore: mockIdStore, managerIdStore: mockManagerIdStore, $location: $location});

            spyOn(mockIdStore, 'set_id');
            spyOn(mockManagerIdStore, 'set_id');
            spyOn($location, 'path');

            $scope.logout();

            $httpBackend.flush();

            expect($scope._id).toBe('12345');
            expect($rootScope.title).toBe('Password Vault | Manager');
            expect(mockIdStore.set_id).toHaveBeenCalledWith('');
            expect($location.path).toHaveBeenCalledWith('/');
            expect($scope.siteList).toBeDefined();

            console.log('$scope.siteList', $scope.siteList);

            $scope.go('/test', '12345');

            expect(mockManagerIdStore.set_id).toHaveBeenCalledWith('12345');
            expect($location.path).toHaveBeenCalledWith('/test');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();


        }));


    });

    describe('forgotten controller unit test', function() {
        var ctrl, scope, rootScope, location, idStr;
        beforeEach(inject(function($controller, $rootScope, $location, idStore) {
            //create a new clean scope object
            scope = $rootScope.$new();
            rootScope = $rootScope.$new();
            location = $location;
            idStr = idStore;
            ctrl = $controller('forgotten', {
                $rootScope: rootScope,
                $scope : scope,
                $location: location,
                idStore: idStr
            });
        }));

        it('$rootScope.title should be Password Vault | Forgotten', function() {
            expect(rootScope.title).toBe('Password Vault | Forgotten');
        });

        it('$scope.go("/test") should redirect to /test', function() {
            spyOn(location, 'path');
            scope.go('/test');
            expect(location.path).toHaveBeenCalledWith('/test');
        });

        it('$scope.toggle("username") and $scope.username=true should set $scope.username=true, $scope.password=false, $scope.email = true and $scope.changePassword=false', function() {
            scope.username=true;
            scope.password=false;
            scope.toggle('username');
            expect(scope.username).toBe(true);
            expect(scope.password).toBe(false);
            expect(scope.email).toBe(true);
            expect(scope.changePassword).toBe(false);
        });

        it('$scope.toggle("username") and $scope.username=false should set $scope.username=true, $scope.password=false, $scope.email = true, $scope.changePassword=false', function() {
            scope.username=false;
            scope.password=true;
            scope.toggle('username');
            expect(scope.username).toBe(true);
            expect(scope.password).toBe(false);
            expect(scope.email).toBe(true);
            expect(scope.changePassword).toBe(false);
        });

        it('$scope.toggle("password") and $scope.password=false should set $scope.password=true, $scope.username=false, $scope.email = false & scope.changePassword=true', function() {
            scope.username=true;
            scope.password=false;
            scope.toggle('password');
            expect(scope.username).toBe(false);
            expect(scope.password).toBe(true);
            expect(scope.email).toBe(false);
            expect(scope.changePassword).toBe(true);
        });

        it('$scope.toggle("password") and $scope.password=true should set $scope.password=true, $scope.username=false, $scope.email = false and $scope.changePassword=true', function() {
            scope.username=false;
            scope.password=true;
            scope.toggle('password');
            expect(scope.username).toBe(false);
            expect(scope.password).toBe(true);
            expect(scope.email).toBe(false);
            expect(scope.changePassword).toBe(true);
        });

        it('should initially correctly set the valued of $scope.ui, $scope.emailSuccessMessage and $scope.emailErrorMessage', function() {
            expect(scope.ui).toBe(true);
            expect(scope.emailSuccessMessage).toBe(false);
            expect(scope.emailErrorMessage).toBe(false);
        });

        it('On success $scope.helpMe() and $scope.email=true should get the _id from idStore, set $scope.helpMeClicked to true, and call the /username-recovery api endpoint with a successful response... ', inject(function($httpBackend) {
            //mock _id and email
            idStr.set_id('1234');
            //console.log(idStr.get_id());
            scope.email = true;
            scope.emailInput = 'jonwadeuk@gmail.com';

            var response = {};
            $httpBackend.expect('POST', '/username-recovery', {_id: '1234', email: 'jonwadeuk@gmail.com'}).respond(200, response, null, 'success');

            scope.helpMe();

            scope.$digest();
            $httpBackend.flush();

            expect(scope.ui).toBe(false);
            expect(scope.emailSuccessMessage).toBe(true);

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('On failure $scope.helpMe() and $scope.email=true should get the _id from idStore, set $scope.helpMeClicked to true, and call the /username-recovery api endpoint with a failure response... ', inject(function($httpBackend) {
            //mock _id and email
            idStr.set_id('4321');
            scope.emailInput = 'jonwadeuk@gmail.com';
            scope.email = true;

            var response = {};
            $httpBackend.expect('POST', '/username-recovery', {_id: '4321', email: 'jonwadeuk@gmail.com'}).respond(404, response, null, 'error');

            scope.helpMe();

            scope.$digest();
            $httpBackend.flush();

            expect(scope.ui).toBe(false);
            expect(scope.emailErrorMessage).toBe(true);

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('On success $scope.helpMe() and $scope.changePassword=true should get the _id from idStore, set $scope.helpMeClicked to true, should hash the email and password input fields using SHA256 and call the /update-password api endpoint with a successful response... ', inject(function($httpBackend) {
            //mock _id and email
            spyOn(CryptoJS, 'SHA256').and.callThrough();
            spyOn(idStr, 'get_id');

            idStr.set_id('1234');
            scope.changePassword = true;
            scope.usernameInput = 'jonwade';
            scope.pwEmailInput = 'hashedemail';
            scope.passwordInput = 'hashedpassword';

            var response = {};
            $httpBackend.expect('POST', '/update-password', {username: 'jonwade', email: '5770ec9cdc0b29fbff67abd8073a746344b511ecabf53399a720c5994346ccfe', password: '741f67765bef6f01f37bf5cb1724509a83409324efa6ad2586d27f4e3edea296'}).respond(200, response, null, 'success');

            scope.helpMe();

            scope.$digest();
            $httpBackend.flush();

            expect(idStr.get_id).toHaveBeenCalled();
            expect(CryptoJS.SHA256).toHaveBeenCalledWith(scope.passwordInput);
            expect(CryptoJS.SHA256).toHaveBeenCalledWith(scope.pwEmailInput);
            expect(scope.ui).toBe(false);
            expect(scope.passwordSuccessMessage).toBe(true);

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('On failure $scope.helpMe() and $scope.changePassword=true should get the _id from idStore, set $scope.helpMeClicked to true, should hash the email and password input fields using SHA256 and call the /update-password api endpoint with an error response... ', inject(function($httpBackend) {
            //mock _id and email
            spyOn(CryptoJS, 'SHA256').and.callThrough();
            spyOn(idStr, 'get_id');

            idStr.set_id('1234');
            scope.changePassword = true;
            scope.usernameInput = 'jonwade';
            scope.pwEmailInput = 'hashedemail';
            scope.passwordInput = 'hashedpassword';

            var response = {};
            $httpBackend.expect('POST', '/update-password', {username: 'jonwade', email: '5770ec9cdc0b29fbff67abd8073a746344b511ecabf53399a720c5994346ccfe', password: '741f67765bef6f01f37bf5cb1724509a83409324efa6ad2586d27f4e3edea296'}).respond(404, response, null, 'error');

            scope.helpMe();

            scope.$digest();
            $httpBackend.flush();

            expect(idStr.get_id).toHaveBeenCalled();
            expect(CryptoJS.SHA256).toHaveBeenCalledWith(scope.passwordInput);
            expect(CryptoJS.SHA256).toHaveBeenCalledWith(scope.pwEmailInput);
            expect(scope.ui).toBe(false);
            expect(scope.passwordErrorMessage).toBe(true);

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));




    });

    describe('register controller unit test', function() {
        var ctrl, scope, rootScope, location;
        beforeEach(inject(function($controller, $rootScope, $location) {
            //create a new clean scope object
            scope = $rootScope.$new();
            rootScope = $rootScope.$new();
            location = $location;
            ctrl = $controller('register', {
                $rootScope: rootScope,
                $scope : scope,
                $location: location
            });
        }));

        it('$rootScope.title should be Password Vault | Register', function() {
            expect(rootScope.title).toBe('Password Vault | Register');
        });

        it('$scope.go("/test") should redirect to /test', function() {
            spyOn(location, 'path');
            scope.go('/test');
            expect(location.path).toHaveBeenCalledWith('/test');
        });

        it('$scope.regex should be ^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$ which constrains password field', function() {
            expect(scope.regex).toBe('^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$');
        });

        it('registration view variables should be correctly initialized', function() {
            expect(scope.registrationForm).toBe(true);
            expect(scope.registrationSuccess).toBe(false);
            expect(scope.registrationError).toBe(false);
        });

        it('$scope.register should hash the email and password input fields using SHA256 and on success from the /create endpoint, set the returned id into the idStore, correctly setting the registrationSuccess and registrationForm variables and call the $scope.redirect method with values "10", "/manager" ...', inject(function($httpBackend, idStore) {

            spyOn(CryptoJS, 'SHA256').and.callThrough();
            spyOn(idStore, 'set_id');
            spyOn(scope, 'redirect');

            var response = {data: '1234'};
            scope.usernameInput = 'testuser';
            scope.emailInput = 'test@test.com';
            scope.passwordInput = 'abcd1234';

            $httpBackend.expect('POST', '/create', {username:'testuser', email: 'f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a', password: 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'}).respond(200, response, null, 'success');

            scope.register();

            scope.$digest();
            $httpBackend.flush();

            expect(CryptoJS.SHA256).toHaveBeenCalledWith(scope.emailInput);
            expect(CryptoJS.SHA256).toHaveBeenCalledWith(scope.passwordInput);
            expect(scope.registrationSuccess).toBe(true);
            expect(scope.registrationForm).toBe(false);
            expect(idStore.set_id).toHaveBeenCalledWith(response);
            expect(scope.redirect).toHaveBeenCalledWith(10, '/manager');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();


        }));

        it('$scope.register should hash the email and password input fields using SHA256 and on failure from the /create endpoint, correctly set the registrationError and registrationForm variables and call $scope.redirect with values "10", "/home" ...', inject(function($httpBackend, idStore) {

            spyOn(CryptoJS, 'SHA256').and.callThrough();
            spyOn(idStore, 'set_id');
            spyOn(scope, 'redirect');

            var response = {};
            scope.usernameInput = 'testuser';
            scope.emailInput = 'test@test.com';
            scope.passwordInput = 'abcd1234';

            $httpBackend.expect('POST', '/create', {username:'testuser', email: 'f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a', password: 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'}).respond(404, response, null, 'error');

            scope.register();

            scope.$digest();
            $httpBackend.flush();

            expect(CryptoJS.SHA256).toHaveBeenCalledWith(scope.emailInput);
            expect(CryptoJS.SHA256).toHaveBeenCalledWith(scope.passwordInput);
            expect(scope.registrationError).toBe(true);
            expect(scope.registrationForm).toBe(false);
            expect(scope.redirect).toHaveBeenCalledWith(10, '/home');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();


        }));

        it('$scope.redirect(x, y) should call $interval(), set $scope.timer to x...', inject(function() {

            spyOn(scope, 'go');
            scope.redirect(10, '/home');

            expect(scope.timer).toBe(10);

        }));

        it('$scope.redirect(0, y) should call $interval(), set $scope.timer to 0 and call $scope.go(y)...', inject(function() {

            spyOn(scope, 'go');
            scope.redirect(0, '/home');

            expect(scope.timer).toBe(0);
            expect(scope.go).toHaveBeenCalledWith('/home');

        }));

    });

    describe('addSite controller unit test', function() {
        var ctrl, scope, rootScope, location, idStr;
        beforeEach(inject(function($controller, $rootScope, $location, idStore) {
            //create a new clean scope object
            scope = $rootScope.$new();
            rootScope = $rootScope.$new();
            location = $location;
            idStr = idStore;
            ctrl = $controller('addSite', {
                $rootScope: rootScope,
                $scope : scope,
                $location: location,
                idStore: idStr
            });
        }));

        it('$rootScope.title should be Password Vault | Register', function() {
            expect(rootScope.title).toBe('Password Vault | Add');
        });

        it('$scope.go("/test") should redirect to /test', function() {
            spyOn(location, 'path');
            scope.go('/test');
            expect(location.path).toHaveBeenCalledWith('/test');
        });

        it('$scope.addSite should get _id from idStore, should encrypt the username and password input fields using AES and on success from the /add-site endpoint should redirect back to the /manager page...', inject(function($httpBackend) {

            spyOn(CryptoJS.AES, 'encrypt').and.callThrough();
            spyOn(idStr, 'get_id');
            spyOn(scope, 'go');

            var response = {};

            idStr.set_id('12345');
            //console.log(idStr.get_id());

            scope.sitenameInput = 'testsite';
            scope.usernameInput = 'testusername';
            scope.passwordInput = 'testpassword';
            scope.keyInput = 'testkey';


            //.when() used as the encryption yields a different username and password request body so can't use expect
            $httpBackend.when('POST', '/add-site').respond(200, response, null, 'success');

            scope.addSite();

            scope.$digest();
            $httpBackend.flush();

            expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(scope.usernameInput, scope.keyInput);
            expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(scope.passwordInput, scope.keyInput);
            expect(idStr.get_id).toHaveBeenCalled();
            expect(scope.go).toHaveBeenCalledWith('/manager');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();


        }));

        it('$scope.addSite should get _id from idStore, should encrypt the username and password input fields using AES and on error from the /add-site endpoint should show error message and redirect back to the /mananger page...', inject(function($httpBackend) {


            //console.log(CryptoJS.AES);
            spyOn(CryptoJS.AES, 'encrypt').and.callThrough();
            spyOn(idStr, 'get_id');
            spyOn(scope, 'redirect');

            var response = {};

            idStr.set_id('12345');
            //console.log(idStr.get_id());

            scope.sitenameInput = 'testsite';
            scope.usernameInput = 'testusername';
            scope.passwordInput = 'testpassword';
            scope.keyInput = 'testkey';


            //.when() used as the encryption yields a different username and password request body so can't use expect
            $httpBackend.when('POST', '/add-site').respond(404, response, null, 'error');

            scope.addSite();

            scope.$digest();
            $httpBackend.flush();

            expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(scope.usernameInput, scope.keyInput);
            expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(scope.passwordInput, scope.keyInput);
            expect(idStr.get_id).toHaveBeenCalled();

            expect(scope.addSiteError).toBe(true);
            expect(scope.addSiteForm).toBe(false);
            expect(scope.redirect).toHaveBeenCalledWith(5, '/manager');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

    });

    describe('routing unit test', function() {
        it('should load the home template and controller', inject(function($location, $rootScope, $httpBackend, $route) {
            $httpBackend.whenGET('./home/home.html').respond('...');

            $rootScope.$apply(function() {
                $location.path('/');
            });

            $httpBackend.flush();
            expect($route.current.controller).toBe("home");
            expect($route.current.loadedTemplateUrl).toBe("./home/home.html");

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('when calling a page that does not exist, should load the home template and controller', inject(function($location, $rootScope, $httpBackend, $route) {
            $httpBackend.whenGET('./home/home.html').respond('...');

            $rootScope.$apply(function() {
                $location.path('/error');
            });

            $httpBackend.flush();
            expect($route.current.controller).toBe("home");
            expect($route.current.loadedTemplateUrl).toBe("./home/home.html");

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('should load the manager template and controller', inject(function($location, $rootScope, $httpBackend, $route) {
            $httpBackend.whenGET('./manager/manager.html').respond('...');

            $rootScope.$apply(function() {
                $location.path('/manager');
            });

            $httpBackend.flush();
            expect($route.current.controller).toBe("manager");
            expect($route.current.loadedTemplateUrl).toBe("./manager/manager.html");

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('should load the forgotten template and controller', inject(function($location, $rootScope, $httpBackend, $route) {
            $httpBackend.whenGET('./forgotten/forgotten.html').respond('...');

            $rootScope.$apply(function() {
                $location.path('/forgotten');
            });

            $httpBackend.flush();
            expect($route.current.controller).toBe("forgotten");
            expect($route.current.loadedTemplateUrl).toBe("./forgotten/forgotten.html");

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('should load the register template and controller', inject(function($location, $rootScope, $httpBackend, $route) {
            $httpBackend.whenGET('./register/register.html').respond('...');

            $rootScope.$apply(function() {
                $location.path('/register');
            });

            $httpBackend.flush();
            expect($route.current.controller).toBe("register");
            expect($route.current.loadedTemplateUrl).toBe("./register/register.html");

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('should load the view-site template and controller', inject(function($location, $rootScope, $httpBackend, $route) {
            $httpBackend.whenGET('./view-site/view-site.html').respond('...');

            $rootScope.$apply(function() {
                $location.path('/view-site');
            });

            $httpBackend.flush();
            expect($route.current.controller).toBe("viewSite");
            expect($route.current.loadedTemplateUrl).toBe("./view-site/view-site.html");

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('should load the add-site template and controller', inject(function($location, $rootScope, $httpBackend, $route) {
            $httpBackend.whenGET('./add-site/add-site.html').respond('...');

            $rootScope.$apply(function() {
                $location.path('/add-site');
            });

            $httpBackend.flush();
            expect($route.current.controller).toBe("addSite");
            expect($route.current.loadedTemplateUrl).toBe("./add-site/add-site.html");

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

    });

});

