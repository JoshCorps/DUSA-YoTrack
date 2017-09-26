var chai = require('chai');
var expect = chai.expect;
let Outlet = require('../models/outlet.js');
let db = require('../models/db.js')();

describe('outletTest', function() {
    
    it('getNames()', function(done) {
        Outlet.getNames(db, function(err, data) 
        {
            if(err) return;
            expect(data).to.not.be.null;
            done();
        });
    });
    
    it('getRefs()', function(done) {
        Outlet.getRefs(db, function(err, data) {
            if(err) return;
            expect(data).to.not.be.null;
            done();
        });
    });
    
    it('getOutlet()', function(done) {
       Outlet.getOutlet(db, "Library", function(err, data) {
            if(err) return;
            expect(data).to.not.be.null;
            done();
       });
    });

});