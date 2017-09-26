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
    
    //console.log("processing filter request");
    var temp = req.query.startDate.split("-");
    var startDate = new Date(temp[2], temp[1] - 1, temp[0]);
    temp = req.query.endDate.split("-");
    var endDate = new Date(temp[2], temp[1] - 1, temp[0]);
    
    var groupBy = req.query.groupBy;
    if (groupBy !== undefined && groupBy !== null) groupBy = groupBy.toLowerCase();
    var chartType = req.query.chartType;
    
    if (!(chartType === "line" || chartType === "bar"))
    {
        chartType = "bar"; //default
    }
    
    var venues = req.query.venues;
    
    var formType = req.query.formType;
    
    if (startDate && endDate && chartType && formType) {
        
        if (formType == "aggregate")
        {
            var diffAndDates;
            var query;

            // get an array containing the difference between given dates and the right startDate and endDate
            switch (groupBy) {
                case 'daily':
                    diffAndDates = Day.getDifferenceInDays(startDate, endDate);
                    break;
                case 'weekly':
                    diffAndDates = Day.getDifferenceInWeeks(startDate, endDate);
                    break;
                case 'monthly':
                    diffAndDates = Day.getDifferenceInMonths(startDate, endDate);
                    break;
                case 'yearly':
                    diffAndDates = Day.getDifferenceInYears(startDate, endDate);
                    break;
                default:
                    diffAndDates = [];
                    break;
            }

            if (venues) {
                if (!Array.isArray(venues)) { //deal with the case when we only get one venue name
                    let temp = [venues];
                    venues = temp;
                }
                query = {
                    dateTime: { $gte: diffAndDates[1], $lt: diffAndDates[2] },
                    outletName: { $in: venues }
                };
            }
            else {
                query = {
                    dateTime: { $gte: diffAndDates[1], $lt: diffAndDates[2] }
                };
            }

            Transaction.getTransactions(db, query, (err, data) => {
                if (err) return;

                // sort data into a returnable object with dates as keys (number of keys will be diffAndDates[0])
                var groupedTransactions = {};
                switch (groupBy) {
                    case 'daily':
                        groupedTransactions = Transaction.groupTransactionsByDay(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
                        break;
                    case 'weekly':
                        groupedTransactions = Transaction.groupTransactionsByWeek(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
                        break;
                    case 'monthly':
                        groupedTransactions = Transaction.groupTransactionsByMonth(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
                        break;
                    case 'yearly':
                        groupedTransactions = Transaction.groupTransactionsByYear(diffAndDates[0], diffAndDates[1], diffAndDates[2], data);
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

                    var keys = Object.keys(groupedTransactions);
                    for (var i = 0; i < keys.length; i++) {
                        var label = keys[i];
                        var number = ((groupedTransactions)[keys[i]] / 100).toFixed(2);
                        numbers.push(number);
                        labels.push(label);
                    }

                    var timeframe = groupBy.charAt(0).toUpperCase() + groupBy.slice(1);
                    datasets.push(createDataset("Total " + timeframe + " Revenue", numbers));

                    res.render('filter_graph', { labels: labels, datasets: datasets, startDate: diffAndDates[1], endDate: diffAndDates[2], chartType: chartType });
                });
            });
            
        } else if (formType == "granular")
        {
            //console.log("startTime: " + req.query.startTime)
            var temp = req.query.startTime.split(":");
            var startTime = Transaction.getTimeInFourDigits(temp[0], temp[1]);
            
            var temp = req.query.endTime.split(":");
            var endTime = Transaction.getTimeInFourDigits(temp[0], temp[1]);
            
            var diffAndDates;
            var query;
            
            var daysChosen = req.query.days;
            if (!Array.isArray(daysChosen)) { //deal with the case when we only get one day
                    let temp = [daysChosen];
                    daysChosen = temp;
            }

            diffAndDates = Day.getDifferenceInWeeks(startDate, endDate);
            if (venues) {
                if (!Array.isArray(venues)) { //deal with the case when we only get one venue name
                    let temp = [venues];
                    venues = temp;
                }
                query = {
                    dateTime: { $gte: diffAndDates[1], $lt: diffAndDates[2] },
                    outletName: { $in: venues }
                };
            }
            else {
                query = {
                    dateTime: { $gte: diffAndDates[1], $lt: diffAndDates[2] }
                };
            }

            Transaction.getTransactions(db, query, (err, data) => {
                if (err) return;

                // sort data into a returnable object with dates as keys (number of keys will be diffAndDates[0])
                var groupedTransactions = {};
                
                groupedTransactions = Transaction.sortTransactionsForDaysOfTheWeek(diffAndDates[0], diffAndDates[1], diffAndDates[2], startTime, endTime, daysChosen, data);
                //console.log(JSON.stringify(groupedTransactions));
                Outlet.getNames(db, (err, outletNames) => {
                    if (err) return;

                    var datasets = [];

                    var numbers = [];
                    var labels = [];
                    
                    for(let j=0; j<daysChosen.length; j++) {
                        numbers[j] = [];
                    }

                    var keys = Object.keys(groupedTransactions);
                    for (var i = 0; i < keys.length; i+=daysChosen.length) {
                        for(let j=0; j<daysChosen.length; j++) {
                            var number = ((groupedTransactions)[keys[i+j]] / 100).toFixed(2);
                            numbers[j].push(number);
                        }
                    }
                    labels = setDataLabels(keys,daysChosen,diffAndDates[1]);
                    for(let j=0; j<daysChosen.length; j++) {
                        datasets.push(createDataset(Day.getDayName(daysChosen[j]), numbers[j], j));
                    }

                    res.render('filter_graph', { labels: labels, datasets: datasets, startDate: diffAndDates[1], endDate: diffAndDates[2], chartType: chartType });
                });
            });
            
        }
    
    
    
    } else {
        //console.log("Invalid parameters for graph.");
        req.flash("Cannot create graph - missing/invalid parameters.");
        res.redirect("/");
    }
});

function setDataLabels(keys, daysChosen, startDate) {
    let labels = [];
    let temp = [];
    temp = startDate.toDateString().split(" ");
    let label = temp[1]+' '+temp[2]+' '+temp[3];
    startDate.setDate(startDate.getDate()+6);
    temp = startDate.toDateString().split(" ");
    label = label +' - '+ temp[1]+' '+temp[2]+' '+temp[3];
    labels.push(label);
    for (var i = daysChosen.length; i < keys.length; i+=daysChosen.length) {
        startDate.setDate(startDate.getDate() + 1);
        temp = startDate.toDateString().split(" ");
        let label = temp[1]+' '+temp[2]+' '+temp[3];
        startDate.setDate(startDate.getDate()+6);
        temp = startDate.toDateString().split(" ");
        label = label+' - '+temp[1]+' '+temp[2]+' '+temp[3];
        labels.push(label);
    }
    return labels;
}

function createDataset(key, dataArray, index) {
    var dataset = {};
    dataset.label = key; //location name
    
    if (index === undefined || index === null)
    {
        dataset.backgroundColor = 'rgba(255, 103, 199, 0.85)';
    }else{
        dataset.backgroundColor = getUniqueColor(index);
    }

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