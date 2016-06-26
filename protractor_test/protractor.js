exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['pwVaultTest.js'],

    onPrepare: function() {
        var SpecReporter = require('jasmine-spec-reporter'); // npm install jasmine-spec-reporter
        jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));
    },

    jasmineNodeOpts: {
        print: function() {}
    }

};

