let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;
    
//models
let db = require('../models/db.js')();
let Upload = require('../models/upload');

router.get('/', authenticate, (req, res) => {
    Upload.getAllUploads(db, (err, data) => {
        if(err) {
            // handle error
        }
        res.render('upload_history', {
            uploads: data
        });  
    });
});

router.post('/', authenticate, (req, res) => {
    var uploads = req.body.uploads;
    Upload.deleteUploads(db, uploads, (err) => {
        if (err) {
            // handle error
        }
    });
    
    res.redirect('/upload_history');
});

module.exports = router;