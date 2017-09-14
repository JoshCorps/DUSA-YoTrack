let express = require('express');
let router = express.Router();
    
//models
let db = require('../models/db.js')();
let Upload = require('../models/upload');
let moment = require('moment');
let db = require('../models/db.js')();

router.get('/', (req, res) => {
    Upload.getAllUploads(db, (err, data) => {
        if(err) {
            // handle error
        }
        res.render('uploads', {
            uploads: data
        });  
    });
});

router.post('/', (req, res) => {
    
});

module.exports = router;