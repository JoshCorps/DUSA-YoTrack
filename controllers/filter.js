'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Outlet = require('../models/outlet.js');
let Transaction = require('../models/transaction.js');

router.get('/', authenticate, (req, res, next) => {
    Outlet.getNames(db, (err, data) => {
        if (err) return;
         res.render('filter', {transactions: null, outletNames: data});  
    });
});

router.post('/', (req, res) => {
    var startDate, endDate, dateRange, venues, query, startTime, endTime;
    startDate = new Date(req.body.startDate);
    endDate = new Date(req.body.endDate);
    dateRange = req.body.dateRange;
    venues = req.body.venues;
    startTime = req.body.startTime;
    endTime = req.body.endTime;
    
    if (venues) {
        if (!Array.isArray(venues)) {
            let temp = [ venues ];
            venues = temp;
        }
        query = {
            dateTime: { $gte: startDate, $lt: endDate },
            outletName: { $in: venues }
        };
    } else {
        query =  {
            dateTime: { $gte: startDate, $lt: endDate }
        };
    }
    
    Transaction.getTransactions(db, query, (err, data) => {
        if (err) return;
        
        
        
        Outlet.getNames(db, (err, outletNames) => {
            if (err) return;
            res.render('filter', {transactions: data, outletNames: outletNames, startDate: startDate, endDate: endDate});  
        });
    });
});

module.exports = router;