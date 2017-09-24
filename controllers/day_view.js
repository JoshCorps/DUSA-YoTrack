'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Day = require('../models/day.js');
let Month = require('../models/month.js');
let Outlet = require('../models/outlet.js');

router.get('/', authenticate, (req, res, next) => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    
    res.redirect(`/day_view/${year}/${month}/${day}`);
});

router.get('/:year/:month/:day', authenticate, (request, response, next) => {
    request.flash();
    var day = request.params.day;
    var month = request.params.month;
    var year = request.params.year;
    var outlets = [];

    Day.getDay(db, year, month, day, (err, data) => {
        if (err) console.log("Could not get days.");
        Outlet.getNames(db, (err, outlets) => {
            if (err) { console.log("Could not get outlet names."); }
            
            var startHour = 6; //TODO: Make the same as Month - passing month.startHour doesn't work.
            
            var hourLabels = []
			for (var h = 0; h < 24; h++)
			{
				//hourLabels.push(h);
				var hourText = (startHour + h) % 24
				if (hourText < 10) hourText = ("0" + hourText)
				{
					hourText = (""+hourText)+":00"
					hourLabels.push(hourText)
				}
				
			}
			
    		var allTotals = {};
    		for (var i = 0; i < outlets.length; i++)
    		{
    		    allTotals[outlets[i]] = [];
    			allTotals[outlets[i]] = getHourlyTotals(outlets[i], data, startHour);
    		}
    		allTotals["Combined"] = getHourlyTotals(null, data, startHour);
            
            var datasets = [];
			var keys = Object.keys(allTotals);
			for (var i=0; i < keys.length; i++)
			{
				var dataset = createDataset(keys[i], (allTotals[keys[i]]), i, outlets);
				datasets.push(dataset);
			}
            
            response.render('day_view', {
                'data': data,
                'year': year,
                'month': month,
                'day': day,
                'outlets': outlets,
                'allTotals' : allTotals,
                'hourLabels' : hourLabels,
                'datasets' : datasets,
                'startHour' : startHour 
            });
        });
    });
    
});

function getHourlyTotals(venueName, data, startHour) {
    var shouldMove = true; //shouldMove hours to their proper places
    var total = [];
    var keys = Object.keys(data);
    var lastHour = -1; //initial value, we start processing with the 0 hours (midnight to 1)
    for (var i = 0; i < keys.length; i++) {
        var totalAmount = 0;
        var willInsert = false;
        for (var e = 0; e < data[keys[i]].length; e++) {
            var thisPlace = data[keys[i]][e].outletName;
            if (venueName === null || thisPlace === venueName) {
                var thisHour = data[keys[i]][e].dateTime.getHours();
                var hourDifference = (thisHour - lastHour) % 24;
                if (hourDifference > 1) {
                    /*
                    for (var x = 1; x < hourDifference; x++)
                    {
                    	total.push(0); //pad out the hours we have no data for
                    }
                    */
                }
                lastHour = thisHour;
                totalAmount += data[keys[i]][e].totalAmount;
                willInsert = true;
            }
        }
        //total.push((totalAmount/100).toFixed(2));
        if (lastHour >= 0 && willInsert) {
            total[lastHour] = ((totalAmount / 100).toFixed(2));
            console.log("inserted at " + lastHour);
        }

        //insert padding at end if last iteration
        if (i === keys.length - 1 && lastHour < (startHour - 1) % 24) //This needs wrapping around if set to midnight, hence the mod.
        {
            var hourDifference = ((startHour - 1) - lastHour) % 24;
            for (var x = 1; x < hourDifference; x++) {
                //total.push(0); //pad out the hours we have no data for
            }
        }
    }
    var movedHours = [];
    for (var i = 6; i < 24; i++) { movedHours.push(total[i]) }
    for (var i = 0; i < 6; i++) { movedHours.push(total[i]) }

    if (shouldMove) {
        total = movedHours;
    }
    return total;
};

function createDataset(key, dataArray, id, outlets) {
    var dataset = {};
    dataset.label = key; //location name
    if (id < outlets.length) {
        dataset.backgroundColor = getUniqueColor(id);
    }
    else {
        dataset.backgroundColor = 'rgba(255, 103, 199, 0.85)';
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