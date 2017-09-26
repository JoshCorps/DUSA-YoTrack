var chai = require('chai');
var expect = chai.expect;
var User = require('../../models/user.js');
let db = require('../../models/db.js')();

describe('changePermission()', () => {

    var user;
    before((done) => {
        user = new User({
            'firstName': "test",
            'lastName': "test",
            'email': "changePermission@test.com",
            'accountType': "basic",
            'isApproved': true
        }); 
        user.setPassword("password", false);
        User.create(db, user, (err, data) => {
            if (err) return;
            done();
        });
    });
    
    after((done) => {
        User.deleteUsersByEmails(db, ["changePermission@test.com"], (err) => {
            if(err) return;
            done();
        });
    });
    
    
    it('changePermission() should change the permissions of changePermission@test.com from basic to master', (done) => {
        user.accountType = 'master';
        User.changePermission(db, user, (err, data) => {
            if(err) return;
            User.getUserByEmail(db, "changePermission@test.com", (err, callback) => {
                if(err) return;
                expect(callback.accountType).equal("master");
                done();
            });
        });
    }).timeout(4000);
    
});