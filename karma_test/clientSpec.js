//client.js karma test here

//nest describes to allow another beforeEach call
describe('client.js unit test', function() {
    beforeEach(module('client'));

    //idStore service
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

    //apiPUT service
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

    //email directive unit test
    describe('unit test email directive', function() {

        var scope, html;

        beforeEach(inject(function($compile, $rootScope) {
            scope = $rootScope.$new();
            html = $compile('<input type="email" ng-model="emailInput" ng-model-options="{debounce: 1000}" name="emailInput" id="emailInput" required email>' + '<span ng-show="emailForm.emailInput.$error.email">This email is not registered!</span>'+ '<span ng-show="emailInput && (!emailForm.emailInput.$pending.email && !emailForm.emailInput.$error.email)">Success!</span>')(scope);

        }));

        it('on successful validation, should set class ng-valid in the input field...', inject(function($httpBackend) {

            scope.emailInput = 'jonwadeuk@gmail.com';
            var response = {};
            var hashedEmail = CryptoJS.SHA256(scope.emailInput).toString(CryptoJS.enc.Hex);
            $httpBackend.expect('POST', '/email-verification', {email: hashedEmail}).respond(200, response, null, 'success');

            scope.$digest();
            $httpBackend.flush();

            expect(html[0].outerHTML).toContain('ng-valid');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

        it('on unsuccessful validation, should set class ng-invalid in the input field...', inject(function($httpBackend) {

            scope.emailInput = 'jonwadeku@gmail.com';
            var response = {};
            var hashedEmail = CryptoJS.SHA256(scope.emailInput).toString(CryptoJS.enc.Hex);
            $httpBackend.expect('POST', '/email-verification', {email: hashedEmail}).respond(404, response, null, 'error');

            scope.$digest();
            $httpBackend.flush();

            expect(html[0].outerHTML).toContain('ng-invalid');

            $httpBackend.verifyNoOutstandingRequest();
            $httpBackend.verifyNoOutstandingExpectation();

        }));

    });

    //home controller
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

    //manager controller
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

    //forgotten controller
    describe('forgotten controller unit test', function() {
        var ctrl, scope, rootScope, location;
        beforeEach(inject(function($controller, $rootScope, $location) {
            //create a new clean scope object
            scope = $rootScope.$new();
            rootScope = $rootScope.$new();
            location = $location;
            ctrl = $controller('forgotten', {
                $rootScope: rootScope,
                $scope : scope,
                $location: location
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


    });

    //register controller
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

    });

    //routing tests
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