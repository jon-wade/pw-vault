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
        element(by.css('#usernameInput')).sendKeys('jonwade');
        element(by.css('#passwordInput')).sendKeys('abcd1234');
        element(by.css('#submitButton')).click()
            .then(function() {
                expect(element(by.css('#title')).getText()).toBe('Password Vault');
            });
    });

    it('should return to the homepage from the manager page on clicking logout...', function() {
        browser.get(ROOT + '/');
        element(by.css('#usernameInput')).sendKeys('jonwade');
        element(by.css('#passwordInput')).sendKeys('abcd1234');
        element(by.css('#submitButton')).click();
        element(by.css('#logoutButton')).click()
            .then(function() {
                expect(element(by.css('#title')).getText()).toBe('Password Vault');
            });
    });

    it('should display an error on invalid password when field loses focus...', function() {
        browser.get(ROOT + '/');
        element(by.css('#usernameInput')).sendKeys('jonwade');
        element(by.css('#passwordInput')).sendKeys('abcde');
        element(by.css('#usernameInput')).sendKeys('a')
            .then(function() {
                expect(element(by.css('#passwordInvalid')).getText()).toBe('Password should be at least 8 characters, contain at least one number and at least one letter.')
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

    it('should access the forgotten page when the forgotten link is clicked...', function() {
        browser.get(ROOT + '/');
        element(by.css('#forgotten')).click()
            .then(function() {
                expect(element(by.css('#title')).getText()).toBe("I've forgotten my...");
            });
    });

    it('should return to the home page from the forgotten page when the back button is clicked...', function() {
        browser.get(ROOT + '/');
        element(by.css('#forgotten')).click();
        element(by.css('#back')).click()
            .then(function() {
                expect(element(by.css('#title')).getText()).toBe("Password Vault");
            });
    });

    it('should access the register page when the register link is clicked...', function() {
        browser.get(ROOT + '/');
        element(by.css('#registerLink')).click()
            .then(function() {
                expect(element(by.css('#title')).getText()).toBe("Registration");
            });
    });

    it('should access the register page when the register button is clicked...', function() {
        browser.get(ROOT + '/');
        element(by.css('#registerButton')).click()
            .then(function() {
                expect(element(by.css('#title')).getText()).toBe("Registration");
            });
    });



});