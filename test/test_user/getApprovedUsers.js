var chai = require('chai');
var User = require('../../models/user.js');
let db = require('../../models/db.js')();
var expect = chai.expect;

describe('GetApprovedUsersTests', () => {
    var testAccount, testAccount2;
    
    before((done) => {
       testAccount = new User({
           'firstName': "Approved",
           'lastName': "User",
           'email': 'approvedUser@test.com',
           'isApproved': true
       });
       testAccount2 = new User({
           'firstName': "Unapproved",
           'lastName': "User",
           'email': 'unapprovedUser@test.com',
           'isApproved': false
       });
       User.create(db, testAccount, (err) => {
          if(err) return;
          
           User.create(db, testAccount2, (err) => {
              if(err) return;
               done();
           });
       });
       
    });
    
    after((done) => {
        User.deleteUsersByEmails(db, ["approvedUser@test.com", "unapprovedUser@test.com"], (err) => {
            if(err) return;
            done();
        });
    });
    
    it("getApprovedUsers() with parameter 'true' should return approved users", (done) => {
        User.getApprovedUsers(db, true, (err, approvedUsers) => {
                if(err) done();
                let emails = [];
                for(let i=0; i<approvedUsers.length; i++) {
                    emails.push(approvedUsers[i].email);
                }
                expect(emails).to.be.an('array').that.includes('approvedUser@test.com');
                expect(emails).to.not.include('unapprovedUser@test.com');
                done();
        });
    }).timeout(5000);
    
    it("getApprovedUsers() with parameter 'false' should return unapproved users", (done) => {
        User.getApprovedUsers(db, false, (err, unapprovedUsers) => {
            if(err) done();
            let emails = [];
            for(let i=0; i<unapprovedUsers.length; i++) {
                emails.push(unapprovedUsers[i].email);
            }
            expect(emails).to.be.an('array').that.includes('unapprovedUser@test.com');
            expect(emails).to.not.include('approvedUser@test.com');
            done();
        });
    }).timeout(5000);
})