'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Outlet = require('../models/outlet.js');
let Transaction = require('../models/transaction.js');
let Day = require('../models/day.js');

router.get('/', authenticate, (req, res, next) => {
    Outlet.getNames(db, (err, data) => {
        if (err) return;
         res.render('filter', {transactions: null, outletNames: data});  
    });
});

router.post('/', (req, res) => {
    var startDate, endDate, groupBy, venues, query, startTime, endTime, diffAndDates;
    console.log("startDate: " + req.body.startDate);
    startDate = new Date(req.body.startDate);
    endDate = new Date(req.body.endDate);
    groupBy = req.body.groupBy;
    venues = req.body.venues;
    startTime = req.body.startTime;
    endTime = req.body.endTime;
    
    switch(groupBy) {
        case 'daily':
            diffAndDates = Day.getDifferenceInDays(startDate, endDate);
            break;
        case 'weekly':
            diffAndDates = Day.getDifferenceInWeeks(startDate, endDate);
            break;
        case 'monthly':
            diffAndDates = Day.getDifferenceInMonths(startDate, endDate);
            break;
        default:
            console.log('Date Range fallthrough');
            diffAndDates = [];
            break;
    }
    
    if (venues) {
        if (!Array.isArray(venues)) {
            let temp = [ venues ];
            venues = temp;
        }
        query = {
            dateTime: { $gte: diffAndDates[1], $lt: diffAndDates[2] },
            outletName: { $in: venues }
        };
    } else {
        query =  {
            dateTime: { $gte: diffAndDates[1], $lt: diffAndDates[2] }
        };
    }
    
    Transaction.getTransactions(db, query, (err, data) => {
        if (err) return;
        
        // sort data into a returnable array (indexed from 0 to diffAndDates[0])
        
        Outlet.getNames(db, (err, outletNames) => {
            if (err) return;
            res.render('filter', {transactions: data, outletNames: outletNames, startDate: diffAndDates[1], endDate: diffAndDates[2]});  
        });
    });
});

module.exports = router;