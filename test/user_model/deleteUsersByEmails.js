var chai = require('chai');
var User = require('../../models/user.js');
let db = require('../../models/db.js')();
var expect = chai.expect;

describe('deleteUsersByEmails()', () => {
    
    before((done) => {
       var testAccount = new User({
           'firstName': "test",
           'lastName': "test",
           'email': 'deleteByEmail@test.com'
       });
       User.create(db, testAccount, (err) => {
           if (err) return;
            done();
       });
    });
    
    it('deleteUsersByEmails() should return 1 for number of records deleted', (done) => {
        User.deleteUsersByEmails(db, ['deleteByEmail@test.com'], (err, data) => {
            console.log("data: " + JSON.stringify(data));
            console.log("err: " + err);
            expect(err, "Error: " + err).to.be.null;
            expect(data.n, "Number of rows deleted should be 1").equal(1);
            done();
        });
    });
})