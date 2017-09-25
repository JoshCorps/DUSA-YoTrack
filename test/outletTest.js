var chai = require('chai');
var expect = chai.expect;
let Outlet = require('../models/outlet.js');
let db = require('../models/db.js')();

describe('outletTest', () => {
    it('getNames()', (done) => {
        Outlet.getNames(db, (err, data) => 
        {
            console.log("****************" + err);
            if(err) return;
            expect(data).to.not.be.null;
        })
        done();
    });
})