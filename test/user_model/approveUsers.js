var chai = require('chai');
var User = require('../../models/user.js');
let db = require('../../models/db.js')();
var expect = chai.expect;

describe('approveUsers()', () => {
    
    before((done) => {
       var testAccount = new User({
           'firstName': "test",
           'lastName': "test",
           'email': 'approveUsers@test.com'
       });
       User.create(db, testAccount, (err) => {
          if(err) return;
       });
       
      done();
    });
    
    after((done) => {
        User.deleteUsersByEmails(db, ["approveUsers@test.com"], (err) => {
            if(err) return;
        });
        done();
    })
    
    it('', (done) => {
        User.approveUsers(db, ['approveUsers@test.com'], (err, data) => {
            expect(err, "Error: " + err).to.be.null;
        });
        done();
    });
})