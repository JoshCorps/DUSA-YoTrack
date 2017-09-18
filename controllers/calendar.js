'use strict';

let express = require('express');
let router = express.Router();
let LocalStrategy = require('passport-local').Strategy;
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Day = require('../models/day.js');

router.get('/:year/:month', authenticate, (request, response) => {
    var year = request.query.year | 2015;
    var month = request.query.month | 11;
    
    //var data = {};
    //var data = [{'faded': true, 'name': 'Monday', 'dayNumber': null, 'revenue': null, 'color': '#000000'},
      //  {'faded': false, 'name': 'Tuesday', 'dayNumber': '1', 'revenue': '1500', 'color': '#00ff00'}];
   
    Day.getDays(db, month, year, (err, days) => {
        
        var data = days;
        console.log(JSON.stringify(data));
        response.render('calendar', {data: data});
        
    });

});

module.exports = router;