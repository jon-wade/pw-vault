//client.js karma test here

//nest describes to allow another beforeEach call
describe('client.js unit test', function() {
    beforeEach(module('client'));

    //home controller
    describe('home controller unit test', function() {
        var ctrl, scope, rootScope;
        beforeEach(inject(function($controller, $rootScope) {
            //create a new clean scope object
            scope = $rootScope.$new();
            rootScope = $rootScope.$new();
            ctrl = $controller('home', {
                $rootScope: rootScope,
                $scope : scope
            });
        }));

        it('$rootScope.title should be Password Vault | Home', function() {
            expect(rootScope.title).toBe('Password Vault | Home');
        });

        it('$scope.submit() shoudl return true', function() {
            expect(scope.submit()).toBe(true);
        });

        it('$scope.regex should be ^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$ which constrains password field', function() {
            expect(scope.regex).toBe('^.*(?=.{8,})(?=.*[a-zA-Z])[a-zA-Z0-9]+$');
        })
    });

    //home route
    describe('home route unit test', function() {
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


    });





});