var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var User = require('../../models/user.js');
let db = require('../../models/db.js')();

describe('createAccount', () => {
    
    after((done) => {
        User.deleteUsersByEmails(db, ["create@test.com"], (err) => {
            if(err) return;
        });
        done();
    });
    
    it("createAccount() should create an account in the db with create@test.com as the email", (done) => {
        var user = new User({
            'firstName': "test",
            'lastName': "test",
            'email': "create@test.com",
            'accountType': "standard",
            'isApproved': false
        }); 
        user.setPassword("password", false);
        User.create(db, user, (err, data) => {
            console.log("data: " + data)
            expect(err).equal(undefined);
            //assert.strictEqual(err,undefined);
            done();
        });
    });
})