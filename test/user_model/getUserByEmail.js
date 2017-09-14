var chai = require('chai');
var assert = chai.assert;
var User = require('../../models/user.js');
let db = require('../../models/db.js')();

describe('getUserByEmail', () => {
    it('getUserByEmail() should return user data from db for wanderson@dusa.co.uk', (done) => {
        User.getUserByEmail(db, 'wanderson@dusa.co.uk', (err, user) => {
            if(err) return;
            if(user !== null)
            {
                assert.strictEqual(user.firstName, "Willie");
                assert.strictEqual(user.lastName, "Anderson");
                assert.strictEqual(user.email, "wanderson@dusa.co.uk");
                assert.strictEqual(user.accountType, "master");
                assert.strictEqual(user.isApproved, true);
            }
            done();
        });
    });
    
    it('getUserByEmail() should return null if user does not exist', (done) => {
        User.getUserByEmail(db, 'dskjahkdsjga', (err, user) => {
           if (err) return;
           assert.strictEqual(user, null);
           done(); 
        });
    });
});