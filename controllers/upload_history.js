let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;
let authenticateByPermission = require('./index').authenticateByPermission;
    
//models
let db = require('../models/db.js')();
let Upload = require('../models/upload');
let Transaction = require('../models/transaction');

router.get('/', authenticate, (req, res, next) => {
    if (!authenticateByPermission(req, 'master')) {
        return res.redirect('/');   
    }
    
    req.flash();
    Upload.getAllUploads(db, (err, data) => {
        if(err) {
            // handle error
        }
        res.render('upload_history', {
            uploads: data
        });  
    });
});

router.post('/', authenticate, (req, res, next) => {
    if (!authenticateByPermission(req, 'master')) {
        return res.redirect('/');   
    }
    
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
        req.flash('success', 'Your selected uploads were successfully deleted.');
        Upload.deleteUploads(db, uploads, (err) => {
            if (err) {
                return;
            }
        });
        res.redirect('/');
    });
});

module.exports = router;