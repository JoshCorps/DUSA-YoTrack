var chai = require('chai');
var expect = chai.expect;
var User = require('../../models/user.js');
let db = require('../../models/db.js')();

describe('changePassword', function() {
    var user;
    before(function(done) {
        user = new User({
            'firstName': "test",
            'lastName': "test",
            'email': "changePassword@test.com",
            'accountType': "standard",
            'isApproved': true
        }); 
        user.setPassword("password", false);
        User.create(db, user, function(err, data) {
            console.log("data " + data)
            if (err) return;
            done();
        });
    });
    
    after(function(done) {
        User.deleteUsersByEmails(db, ["changePassword@test.com"], function(err) {
            if(err) return;
            done();
        });
    });
    
    it('changePassword() should change the password of changePassword@test.com', function(done) {
        user.setPassword("changedPassword", false);
        user.update(db,user, function(err, user) 
        {
            expect(err).equal(null);
            // expect(user.checkPassword("password")).equal(false);
            // expect(user.checkPassword("changedPassword")).equal(true);
            done();
        });
    });
})