var chai = require('chai');
var expect = chai.expect;
var Upload = require('../models/upload.js');
let db = require('../models/db.js')();

describe('UploadModule', () => {

    it('deleteUploads() should delete given uploads', (done) => {
        var up1 = new Upload({
            'date': 1,
            'transactions': [],
            '_id': 101
        });
        var up2 = new Upload({
            'date': 2,
            'transactions': [],
            '_id': 102
        });
        
        db.uploads.insert([up1,up2], (err) => {
            if (err) return;
        });
        
        Upload.deleteUploads(db, [up1, up2], (err, db) => {
            if (err) return;
            db.uploads.findOne({'_id':{$in: [101,102]}}, (err, data) => {
                if (err) return;
               expect(data).to.be.an('array').that.is.empty;
            });
        });
        
        done();
    });
  
});