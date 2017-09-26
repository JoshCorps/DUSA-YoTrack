var chai = require('chai');
var expect = chai.expect;
let Outlet = require('../models/outlet.js');
let db = require('../models/db.js')();

describe('outletTest', () => {
    it('getNames()', (done) => {
        Outlet.getNames(db, (err, data) => 
        {
            if(err) return;
            expect(data).to.not.be.null;
        });
        done();
    });
    
    it('getRefs()', () => {
        Outlet.getRefs(db, (err, data) => {
            if(err) return;
            expect(data).to.not.be.null;
        });
    });
    
    it('getOutlet()', () => {
       Outlet.getOutlet(db, "Library", (err, data) =>{
            if(err) return;
            expect(data).to.not.be.null;
       });
    });
})