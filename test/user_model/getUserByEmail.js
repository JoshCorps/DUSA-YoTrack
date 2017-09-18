var chai = require('chai');
var expect = chai.expect;
var User = require('../../models/user.js');
let db = require('../../models/db.js')();

describe('getUserByEmail', () => {
    it('getUserByEmail() should return user data from db for wanderson@dusa.co.uk', (done) => {
        User.getUserByEmail(db, 'wanderson@dusa.co.uk', (err, user) => {
            if(err) return;
            if(user !== null)
            {
                expect(user.firstName).equal("Willie");
                expect(user.lastName).equal("Anderson");
                expect(user.email).equal("wanderson@dusa.co.uk");
                expect(user.accountType, "master");
                expect(user.isApproved, true);
            }
            done();
        });
    });
    
    it('getUserByEmail() should return null if user does not exist', (done) => {
        User.getUserByEmail(db, 'dskjahkdsjga', (err, user) => {
           if (err) return;
           expect(user).equal(null);
            done(); 
        });
    });
});