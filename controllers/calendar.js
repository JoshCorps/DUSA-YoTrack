'use strict';

let express = require('express');
let router = express.Router();
let LocalStrategy = require('passport-local').Strategy;
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Month = require('../models/month');

router.get('/:year/:month', authenticate, (request, response) => {
    var year = request.params.year;
    var month = request.params.month;
    
    //var data = FakeDay.getData(db, "2016", "09");
    //response.render('calendar', {data: data});
    
    //var data = {};
    //var data = [{'faded': true, 'name': 'Monday', 'dayNumber': null, 'revenue': null, 'color': '#000000'},
      //  {'faded': false, 'name': 'Tuesday', 'dayNumber': '1', 'revenue': '1500', 'color': '#00ff00'}];
   
    Month.getMonthTransactionTotals(db, year, month, (err, data) => {
        if (err) return;
        console.log('Number of days: '+Object.keys(data).length);
        let colors = Month.getColorsForDays(data);
        
        console.log('Number of colors: '+Object.keys(colors).length);
        response.render('calendar', {'data': data, 'colors': colors, 'year': year, 'month': month}); 
     });

});

module.exports = router;