var chai = require('chai');
var Day = require('../models/day.js');
let db = require('../models/db.js')();
var expect = chai.expect;

describe('Day Module test', () => {
   it('should not throw an error', (err, done) => 
   {
       Day.getDay(db, 2015, 11, 27, (err, data) => {
           console.log("data: " + JSON.stringify(data));
           console.log("err: " + err);
           expect(err).equal(null);
       
           done();
       });
   });
});
