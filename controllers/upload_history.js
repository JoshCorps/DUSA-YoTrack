let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;
    
//models
let db = require('../models/db.js')();
let Upload = require('../models/upload');
let Transaction = require('../models/transaction');

router.get('/', authenticate, (req, res, next) => {
    Upload.getAllUploads(db, (err, data) => {
        if(err) {
            // handle error
        }
        res.render('upload_history', {
            uploads: data
        });  
        next();
    });
});

router.post('/', authenticate, (req, res, next) => {
    var uploads = req.body.uploads;
    // if the item is not an array 
    if (!Array.isArray(uploads)) {
        let temp = [ uploads ];
        uploads = temp;
    }
    Transaction.deleteTransactions(db, uploads, (err) => {
        if(err) {
            return;
        }
        Upload.deleteUploads(db, uploads, (err) => {
            if (err) {
                return;
            }
        });
    });
    
    res.redirect('/upload_history');
    next();
});

module.exports = router;