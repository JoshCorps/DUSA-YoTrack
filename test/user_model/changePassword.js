var chai = require('chai');
var expect = chai.expect;
var User = require('../../models/user.js');
let db = require('../../models/db.js')();

describe('changePassword', () => {
    var user;
    before((done) => {
        user = new User({
            'firstName': "test",
            'lastName': "test",
            'email': "changePassword@test.com",
            'accountType': "standard",
            'isApproved': true
        }); 
        user.setPassword("password", false);
        User.create(db, user, (err, data) => {
            if (err) return;
        });
        done();
    });
    
    after((done) => {
        User.deleteUsersByEmails(db, ["changePassword@test.com"], (err) => {
            if(err) return;
        });
        done();
    });
    
    it('changePassword() should change the password of changePassword@test.com', (done) => {
        console.log("user = " + JSON.stringify(user));
        user.setPassword("changedPassword", false);
        user.update(db,user, (err, user) => 
        {
            console.log("user: " + JSON.stringify(user));
            console.log("err: " + err);
            expect(err).equal(null);
            // ***
        });
        done();
    });
})