let ObjectID = require('mongojs').ObjectID;
var chai = require('chai');
var expect = chai.expect;
var Upload = require('../models/upload.js');
var Transaction = require('../models/transaction.js');
let db = require('../models/db.js')();

describe('TransactionModule', () => {

    it('deleteTransactions() should delete the transactions relating to given uploads', (done) => {
        var up1 = new Upload({
            'date': 1,
            'transactions': [111, 112],
            '_id': 1010
        });
        var up2 = new Upload({
            'date': 2,
            'transactions': [113, 114],
            '_id': 1020
        });
        
        var trans1 = new Transaction({
            '_id': 111
        });
        var trans2 = new Transaction({
            '_id': 112
        });
        var trans3 = new Transaction({
            '_id': 113
        });
        var trans4 = new Transaction({
            '_id': 114
        });
        
        db.uploads.insert(db, [trans1, trans2, trans3, trans4], (err) => {
            if(err) return;
        });
        
        db.uploads.insert([up1,up2], (err) => {
            if (err) return;
        });
        
        Transaction.deleteTransactions(db, [1010, 1020], (err, db) => {
            if (err) return;
            db.transactions.findOne({'_id':{$in: [111,112, 113, 114]}}, (err, data) => {
                if (err) return;
               expect(data).to.be.an('array').that.is.empty;
            });
        });
        
        done();
    });
  
});