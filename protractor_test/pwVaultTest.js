describe('pw-vault E2E test', function() {
    var ROOT = 'http://localhost:8080';

    it('should get the homepage...', function() {
        browser.get(ROOT + '/');
        //test here
        expect(element.all(by.css('#loginForm')).count()).toBe(1);
        expect(element.all(by.css('#usernameInput')).count()).toBe(1);
        expect(element.all(by.css('#passwordInput')).count()).toBe(1);
    });

    it('should submit on correctly entered data into the form...', function() {
        browser.get(ROOT + '/');
        element(by.css('#usernameInput')).sendKeys('jonwade')
            .then(function() {
                element(by.css('#passwordInput')).sendKeys('abcd1234')
                    .then(function() {
                        element(by.css('#submitButton')).click()
                            .then(function(res) {
                                //console.log('res=', res);
                                //currently this promise is returning null
                            }, function(err){
                                //console.log('err=', err);
                            });
                    });
            });

    });

    it('should display an error on invalid password when field loses focus...', function() {
        browser.get(ROOT + '/');
        element(by.css('#usernameInput')).sendKeys('jonwade')
            .then(function() {
                element(by.css('#passwordInput')).sendKeys('abcde')
                    .then(function() {
                        element(by.css('#usernameInput')).sendKeys('a');
                        expect(element(by.css('#passwordInvalid')).getText()).toBe('Password should be at least 8 characters, contain at least one number and at least one letter.')
                    });
            });
    });

    it('should display an error when username field left blank and field loses focus...', function() {
        browser.get(ROOT + '/');
        element(by.css('#usernameInput')).sendKeys('jonwade');
        element(by.css('#usernameInput')).clear();
        element(by.css('#usernameInput')).sendKeys(protractor.Key.TAB)
            .then(function() {
                expect(element(by.css('#usernameMissing')).getText()).toBe('Please input a username.');
            });
    });

    it('should display an error when password field left blank and field loses focus...', function() {
        browser.get(ROOT + '/');
        element(by.css('#usernameInput')).sendKeys('jonwade');
        element(by.css('#passwordInput')).sendKeys(' ');
        element(by.css('#passwordInput')).clear();
        element(by.css('#passwordInput')).sendKeys(protractor.Key.TAB)
            .then(function() {
                expect(element(by.css('#passwordMissing')).getText()).toBe('Please input a password.');
            });
    });

    it('should display two errors, when password field left blank and field loses and username field is cleared...', function() {
        browser.get(ROOT + '/');
        element(by.css('#usernameInput')).sendKeys('jonwade');
        element(by.css('#passwordInput')).sendKeys('abcd1234');
        element(by.css('#passwordInput')).clear();
        element(by.css('#usernameInput')).clear()


            .then(function() {
                expect(element(by.css('#passwordMissing')).getText()).toBe('Please input a password.');
                expect(element(by.css('#usernameMissing')).getText()).toBe('Please input a username.');
            });
    });

});