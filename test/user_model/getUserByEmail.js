var chai = require('chai');
var expect = chai.expect;
var User = require('../../models/user.js');
let db = require('../../models/db.js')();

describe('getUserByEmail', () => {
    it('getUserByEmail() should return user data from db for wanderson@dusa.co.uk', () => {
        User.getUserByEmail(db, 'wanderson@dusa.co.uk', (err, user) => {
            if(err) return;
            
            expect(user.firstName).to.equal("Willie");
            expect(user.lastName).to.equal("Anderson");
            expect(user.email).to.equal("wanderson@dusa.co.uk");
            expect(user.accountType).to.equal("master");
            expect(user.isApproved).to.be.true;
        });
    });
    
    it('getUserByEmail() should return null if user does not exist', () => {
        User.getUserByEmail(db, 'dskjahkdsjga', (err, user) => {
           if (err) return;
           expect(user).to.equal(null);
        });
    });
});