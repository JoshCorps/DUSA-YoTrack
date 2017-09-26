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
            console.log("data " + data)
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
        user.setPassword("changedPassword", false);
        user.update(db,user, (err, user) => 
        {
            expect(err).equal(null);
        });
        expect(user.checkPassword("password")).equal(false);
        expect(user.checkPassword("changedPassword")).equal(true);
        done();
    });
})