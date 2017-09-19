'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Day = require('../models/day.js');

router.get('/:year/:month/:day?', authenticate, (request, response) => {
    var day = request.params.day;
    var month = request.params.month;
    var year = request.params.year;
    
    
});

module.exports = router;