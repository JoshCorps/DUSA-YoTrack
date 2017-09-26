var chai = require('chai');
var User = require('../../models/user.js');
let db = require('../../models/db.js')();
var expect = chai.expect;

describe('approveUsers()', function() {
    
    before(function(done) {
       var testAccount = new User({
           'firstName': "test",
           'lastName': "test",
           'email': 'approveUsers@test.com'
       });
       User.create(db, testAccount, function(err) {
            if(err) return;
            done();
       });
    });
    
    after(function(done) {
        User.deleteUsersByEmails(db, ["approveUsers@test.com"], function(err) {
            if(err) return;
            done();
        });
    });
    
    it('', function(done) {
        User.approveUsers(db, ['approveUsers@test.com'], function(err, data) {
            expect(err, "Error: " + err).to.be.null;
            done();
        });
    }).timeout(4000);
})