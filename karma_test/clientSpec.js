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

    describe('unit test email directive', function() {

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

    describe('unit test emailReg directive', function() {

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

    describe('unit test userReg directive', function() {

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

    describe('home controller unit test', function() {
        var ctrl, scope, rootScope, location;
        beforeEach(inject(function($controller, $rootScope, $location) {
            //create a new clean scope object
            scope = $rootScope.$new();
            rootScope = $rootScope.$new();
            location = $location;
            ctrl = $controller('home', {
                $rootScope: rootScope,
                $scope : scope,
                $location: location
            });
        }));

        it('$rootScope.title should be Password Vault | Home', function() {
            expect(rootScope.title).toBe('Password Vault | Home');
        });


        it('$scope.regex should be ^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$ which constrains password field', function() {
            expect(scope.regex).toBe('^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$');
        });

        it('$scope.go("/test") should redirect to /test', function() {
            spyOn(location, 'path');
            scope.go('/test');
            expect(location.path).toHaveBeenCalledWith('/test');
        });

        //TODO: update submit() unit test
        it('$scope.submit() should return true', function() {
            expect(scope.submit()).toBe(true);
        });
    });

    describe('manager controller unit test', function() {
        var ctrl, scope, rootScope, location;
        beforeEach(inject(function($controller, $rootScope, idStore, $location) {
            //create a new clean scope object
            scope = $rootScope.$new();
            rootScope = $rootScope.$new();
            idStore.set_id('1234');
            location = $location;
            ctrl = $controller('manager', {
                $rootScope: rootScope,
                $scope : scope,
                idStore: idStore,
                $location: location
            });
        }));

        it('$rootScope.title should be Password Vault | Manager', function() {
            expect(rootScope.title).toBe('Password Vault | Manager');
        });

        it('$scope._id should be 1234', function(){
            expect(scope._id).toBe('1234');
        });

        it('$scope.logout should set idStore._id to empty string and redirect to homepage', inject(function(idStore) {
            spyOn(location, 'path');
            scope.logout();
            expect(idStore.get_id()).toBe('');
            expect(location.path).toHaveBeenCalledWith('/');
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

        it('$scope.toggle("username") and $scope.username=true should set $scope.username=true, $scope.password=false and $scope.email = true', function() {
            scope.username=true;
            scope.password=false;
            scope.toggle('username');
            expect(scope.username).toBe(true);
            expect(scope.password).toBe(false);
            expect(scope.email).toBe(true);
        });

        it('$scope.toggle("username") and $scope.username=false should set $scope.username=true, $scope.password=false and $scope.email = true', function() {
            scope.username=false;
            scope.password=true;
            scope.toggle('username');
            expect(scope.username).toBe(true);
            expect(scope.password).toBe(false);
            expect(scope.email).toBe(true);
        });

        it('$scope.toggle("password") and $scope.password=false should set $scope.password=true, $scope.username=false and $scope.email = false', function() {
            scope.username=true;
            scope.password=false;
            scope.toggle('password');
            expect(scope.username).toBe(false);
            expect(scope.password).toBe(true);
            expect(scope.email).toBe(false);
        });

        it('$scope.toggle("password") and $scope.password=true should set $scope.password=true, $scope.username=false and $scope.email = false', function() {
            scope.username=false;
            scope.password=true;
            scope.toggle('password');
            expect(scope.username).toBe(false);
            expect(scope.password).toBe(true);
            expect(scope.email).toBe(false);
        });

        it('should initially correctly set the valued of $scope.ui, $scope.emailSuccessMessage and $scope.emailErrorMessage', function() {
            expect(scope.ui).toBe(true);
            expect(scope.emailSuccessMessage).toBe(false);
            expect(scope.emailErrorMessage).toBe(false);
        });

        it('On success $scope.helpMe() should get the _id from idStore, set $scope.helpMeClicked to true, and call the /username-recovery api endpoint with a successful response... ', inject(function($httpBackend) {
            //mock _id and email
            idStr.set_id('1234');
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

        it('On failure $scope.helpMe() should get the _id from idStore, set $scope.helpMeClicked to true, and call the /username-recovery api endpoint with a failure response... ', inject(function($httpBackend) {
            //mock _id and email
            idStr.set_id('4321');
            scope.emailInput = 'jonwadeuk@gmail.com';

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

    });


});