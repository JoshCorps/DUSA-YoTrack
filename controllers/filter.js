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
    console.log("venues: " + venues);
    startTime = req.body.startTime;
    endTime = req.body.endTime;
    
    switch(groupBy) {
        case 'Daily':
            diffAndDates = Day.getDifferenceInDays(startDate, endDate);
            break;
        case 'Weekly':
            diffAndDates = Day.getDifferenceInWeeks(startDate, endDate);
            break;
        case 'Monthly':
            diffAndDates = Day.getDifferenceInMonths(startDate, endDate);
            break;
        default:
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
        var groupedTransactions = {};
        
        switch(groupBy) {
            case 'Daily':
                groupedTransactions = Transaction.groupTransactionsByDay(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
                break;
            case 'Weekly':
                groupedTransactions = Transaction.groupTransactionsByDay(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
                break;
            case 'Monthly':
                groupedTransactions = Transaction.groupTransactionsByDay(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
                break;
            default:
                groupedTransactions = {};
                break;
        }
        
        Outlet.getNames(db, (err, outletNames) => {
            if (err) return;
            res.render('filter', {transactions: groupedTransactions, outletNames: outletNames, startDate: diffAndDates[1], endDate: diffAndDates[2]});  
        });
    });
});

module.exports = router;