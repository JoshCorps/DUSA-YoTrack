'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Day = require('../models/day.js');
let Month = require('../models/month.js');

router.get('/:year/:month/:day', authenticate, (request, response) => {
    
    var day = request.params.day;
    var month = request.params.month;
    var year = request.params.year;
    Day.getDay(db, year, month, day, (err, data) => {
        if (err) return;
        console.log('Data length: '+Object.keys(data).length);
        response.render('day_view', {
            'data': data,
            'year': year,
            'month': month,
            'day': day,
            'startHour' : 6 //TODO: Fix - passing month.startHour doesn't work.
        });
    });
    
});

module.exports = router;