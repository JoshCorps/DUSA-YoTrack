'use strict';
let moment = require('moment');

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Outlet = require('../models/outlet.js');
let Transaction = require('../models/transaction.js');
let Day = require('../models/day.js');

router.get('/', authenticate, (req, res, next) => {
    
    console.log("processing filter request");
    var startDate = moment(req.query.startDate, "DD-MM-yyyy").toDate();
    var endDate = moment(req.query.endDate, "DD-MM-yyyy").toDate();
    
    console.log("startDate", startDate);
    console.log("endDate", endDate);
    
    var groupBy = req.query.groupBy.toLowerCase();
    var chartType = req.query.chartType;
    
    var venues = req.params.venues;
    
    if (startDate && endDate && groupBy && chartType) {
        
    //var startDate, endDate;
    //startDate = new Date(startYear, startMonth - 1, startDay); //-1 from month to convert to zero-indexed months for processing
    //endDate = new Date(endYear, endMonth - 1, endDay);
    
    var diffAndDates;
    
    var query;
    
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
        if (!Array.isArray(venues)) { //deal with the case when we only get one venue name
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
        
        // sort data into a returnable object with dates as keys (number of keys will be diffAndDates[0])
        var groupedTransactions = {};
        switch(groupBy) {
        case 'daily':
            groupedTransactions = Transaction.groupTransactionsByDay(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
            break;
        case 'weekly':
            groupedTransactions = Transaction.groupTransactionsByWeek(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
            break;
        case 'monthly':
            groupedTransactions = Transaction.groupTransactionsByMonth(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
            break;
        default:
            groupedTransactions = {};
            break;
        }
        
        Outlet.getNames(db, (err, outletNames) => {
            if (err) return;
            
            var datasets = [];
            
            var numbers = [];
            var labels = [];
            
            var keys = Object.keys(data);
            for (var i=0; i<keys.length; i++)
            {
                var label = keys[i];
                var number = (data)[keys[i]];
                numbers.push(number);
                labels.push(label);
            }
            
            datasets.push (createDataset("Total Revenue", numbers));
            
            res.render('filter_graph', {labels: labels, datasets: datasets, startDate: diffAndDates[1], endDate: diffAndDates[2]});  
        });
    });
    
    } else {
        console.log("Invalid parameters for graph.");
        res.redirect("/");
        req.flash("Cannot create graph - missing/invalid parameters.");
    }
});

function createDataset(key, dataArray) {
    var dataset = {};
    dataset.label = key; //location name
    dataset.backgroundColor = 'rgba(255, 103, 199, 0.85)';

    dataset.borderColor = 'rgba(0, 0, 0, 1)';
    dataset.borderWidth = 0;
    dataset.data = dataArray; //!{JSON.stringify( dataArray )}

    return dataset;
}

function getUniqueColor(uniqueNumber) {
    var num1 = (50 + uniqueNumber * 70) % 256;
    var num2 = (120 + uniqueNumber + 35) % 256;
    var num3 = (210 + uniqueNumber * 55) % 256;
    return 'rgba(' + num1 + ', ' + num2 + ', ' + num3 + ', 0.85)';
}

module.exports = router;