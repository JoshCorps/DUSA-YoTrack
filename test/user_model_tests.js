var chai = require('chai');
var expect = chai.expect;
var User = require('../models/user.js');
let db = require('../models/db.js')();

describe('UserModel', () => {
    
  it('isMasterAccount() should return true if account is a master one', (done) => {
    User.isMasterAccount(db, 'wanderson@dusa.co.uk', (err, isMaster) => {
        if (err) return;
        expect(isMaster).to.be.true;
        done();
    });
  });
  
  it('isMasterAccount() should return false if account is not a master one', (done) => {
    User.isMasterAccount(db, 'test@test', (err, isMaster) => {
        if (err) return;
        expect(isMaster).to.be.false;
        done();
    });
  });
  
});