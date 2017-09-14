let express = require('express');
let router = express.Router();
    
//models
let db = require('../models/db.js')();
let Upload = require('../models/upload');
let moment = require('moment');


router.get('/', (req, res) => {
    Upload.getAllUploads((err, data) => {
        if(err) {
            // handle error
        }
        res.render('uploads', {
            uploads: data
        });  
    })
});