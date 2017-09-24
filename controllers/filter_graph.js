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
    var temp = req.query.startDate.split("-");
    var startDate = new Date(temp[2], temp[1] - 1, temp[0]);
    temp = req.query.endDate.split("-");
    var endDate = new Date(temp[2], temp[1] - 1, temp[0]);
    
    console.log("startDate = " + startDate);
    console.log("endDate = " + endDate);
    
    //startDate.setMonth(startDate.getMonth()+1);
    //endDate.setMonth(endDate.getMonth()+1);
    
    var groupBy = req.query.groupBy.toLowerCase();
    var chartType = req.query.chartType;
    
    if (!(chartType === "line" || chartType === "bar"))
    {
        chartType = bar; //default
    }
    
    var venues = req.query.venues;
    
    if (startDate && endDate && groupBy && chartType) {
    
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
        
        console.log(groupedTransactions);
        
        Outlet.getNames(db, (err, outletNames) => {
            if (err) return;
            
            var datasets = [];
            
            var numbers = [];
            var labels = [];
            
            var keys = Object.keys(groupedTransactions);
            for (var i=0; i<keys.length; i++)
            {
                var label = keys[i];
                var number = ((groupedTransactions)[keys[i]]/100).toFixed(2);
                numbers.push(number);
                labels.push(label);
            }
            
            var timeframe = groupBy.charAt(0).toUpperCase() + groupBy.slice(1);
            datasets.push (createDataset("Total " + timeframe + " Revenue", numbers));
            
            res.render('filter_graph', {labels: labels, datasets: datasets, startDate: diffAndDates[1], endDate: diffAndDates[2], chartType: chartType});  
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