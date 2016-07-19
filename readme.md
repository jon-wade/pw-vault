#Password Vault
Thinkful (https://www.thinkful.com/) end of course portfolio project - a responsive MEAN stack app to securely store online username and passwords.

#Introduction
Password Vault allow you to securely save all the usernames and passwords you use online in one place.
You only need to remember one thing - an encryption key. This can be a number, a word, or a phrase. This key securely encrypts all your other usernames and passwords, meaning you only have to remember that one key, not the hundreds of passwords you use day to day.
It is very important to never forget that key, it's not stored anywhere in the app and if you do forget it, you will not be able to retrieve your saved usernames and passwords.

#Use Case
Why is this app useful? A typical internet user will need to remember a huge number of, supposedly, unique usernames and passwords to access the sites they visit day-to-day. Any site that requires registration will typically have a username and password associated to it. Whilst browsers have implemented password and username storage protocols, these methods provide risk in the situation where a user's computer is accessed without permission (through theft, hacking etc). Password Vault is designed to provide an easy-to-use, secure method of storing usernames and passwords without relying on the browser or other insecure storage methods (files, offline records etc).

#UX

To follow.

#Live Site
You can access Password Vault at http://pw-vault.com

#Technical
* The app is built using the MEAN stack. The front-end is built using AngularJS, the back-end using NodeJS with ExpressJS as the web server and MongoDB as the database.
* The app is fully responsive, adapting for mobile, table and desktop viewports.
* All routing is handled in the front-end by Angular.
* Extensive form validation and error handling is demonstrated throughout the app. On the front-end, field type, value, length etc is validated using HTML5 and Angular ng-model and ng-pattern. Angular directives are used to ensure usernames and email addresses are checked in real-time and not duplicated in the database. On the back-end a Mongoose schema provides further error checking for field values and uniqueness.
* An extensive API has been built to provide database access to the Angular app using ExpressJS, with 12 separate endpoints constructed.
* The app is fully unit tested on the front and back-end. For the Angular testing a combination of Karma and Jasmine has been used. For the back-end, Mocha and Chai, with extensive use of the Mockery (https://github.com/padraic/mockery) library which provides excellent abilities to truly mock-out require dependencies.
* E2E testing has been accomplished through the use of Protractor and the Selenium webdriver.
* Security and encryption is handled via the CryptoJS (https://github.com/brix/crypto-js) library. Two algorithms are utilised, SHA256 to hash email addresses and passwords of the registered users of Password Vault. AES is used to encrypt all other data stored in the database.
* All encryption of the usernames and passwords saved by users is done on the front-end, ensuring that the encryption key is never stored in the database nor sent over the internet.
* The Mongo database is further secured with SCRAM-SHA1 access authentication. However, even if the db was penetrated, all sensitive data is stored in either encrypted or hashed form. Even if the encryption key used by the server to encrypt the username of registered users is compromised, email addresses and password are hashed and irrecoverable, and the actual username and password records stored by the users are encrypted using their own encryption key which is not stored anywhere in the application. Thus, even in the event of a server hack, no sensitive data can be obtained.
* The app is deployed into an Ubuntu 14.04 environment, kept running using Forever.

