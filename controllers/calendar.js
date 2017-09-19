'use strict';

let express = require('express');
let router = express.Router();
let LocalStrategy = require('passport-local').Strategy;
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Month = require('../models/month');

router.get('/', authenticate, (req, res) => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    res.redirect(`/calendar/${year}/${month}`);
});

router.get('/:year/:month', authenticate, (request, response) => {
    var year = request.params.year;
    var month = request.params.month;
    
    Month.getMonthTransactionTotals(db, year, month, (err, data) => {
        if (err) return;
        let colors = Month.getColorsForDays(data);
        
        response.render('calendar', {'data': data, 'colors': colors, 'year': year, 'month': month}); 
     });

});

module.exports = router;