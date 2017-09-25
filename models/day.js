//let startHour = require('./month.js').startHour;
let instadate = require('instadate');
let Transaction = require('./transaction');
let Outlet = require('./outlet');

let startHour = 6;

class Day {
    
    constructor()
    {
        this.hours = [];
    }
    
    static getDayName(dayNumber){
      var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (dayNumber >= 0 && dayNumber <= 6)
      {
        return dayNames[dayNumber];
      }
      console.log("Cannot find dayName for dayNumber: " + dayNumber);
      return "Unknown Day";
    }
    
  static getDay(db, year, month, day, callback) {
    let startDate = new Date(year, (month - 1), day, startHour);
    let endDate = instadate.addDays(startDate, 1);
    
    Transaction.getTransactionsForDay(db, startDate, endDate, (err, data) => {
        let hours = {};
        
        for (var i = 0; i < data.length; i++) {
            if(data[i])
            {
                var theHour = data[i].dateTime.getHours();
                if (!hours[theHour]) {
                  hours[theHour] = [];
                }
                hours[theHour].push(data[i]);
            }
        }
      callback(err, hours);
    });
  }
    
    
    static getDayTransactionTotals(db, year, month, day, callback) {
      Day.getDay(db, year, month, day, (err, data) => {
        if (err) {
          return callback(err);
        }
  
        let hourTotals = {};
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
          let index = keys[i];
          if (!hourTotals[index]) {
            hourTotals[index] = 0;
          }
  
          for (let e = 0; e < data[index].length; e++) {
            hourTotals[index] += data[index][e].totalAmount;
          }
        }
  
        callback(null, hourTotals);
      });
  }
  
  static getDifferenceInDays(startDate, endDate) {
    var diffAndDates = [];
    startDate.setHours(startHour, 0, 0);
    endDate.setDate(endDate.getDate()+1);
    endDate.setHours(startHour, 0, 0);
    var diff = instadate.differenceInDays(startDate, endDate);
    
    diffAndDates = [diff, startDate, endDate];
    return diffAndDates;
  }
  
  static getDifferenceInMonths(startDate, endDate) {
    var startMonth, endMonth, diff, startYear, endYear;
    var diffAndDates = [];
    startMonth = startDate.getMonth();
    startYear = startDate.getFullYear();
    endMonth = endDate.getMonth() + 1;
    endYear = endDate.getFullYear();
    
    startDate = instadate.firstDateInMonth(startDate);
    endDate = instadate.lastDateInMonth(endDate);
    
    diff = (endYear - startYear) * 12;
    diff -= startMonth;
    diff += endMonth;
    
    diffAndDates = [diff, startDate, endDate];
    
    return diffAndDates;
  }
  
  static getDifferenceInWeeks(startDate, endDate) {
    var dayDiff, diff, offset1, offset2;
    var diffAndDates = [];
    offset1 = startDate.getDay();
    offset2 = endDate.getDay();
    
    if (offset1 == 0) {
      offset1 = 7;
    }
    offset1 -= 1;
    startDate.setDate(startDate.getDate() - offset1);
    
    if (offset2 == 0) {
      offset2 = 7;
    }
    offset2 -= 1;
    endDate.setDate(endDate.getDate() + (6-offset2));
    
    dayDiff = Day.getDifferenceInDays(startDate, endDate)[0];
    diff = dayDiff/7;
    
    diffAndDates = [diff, startDate, endDate];
    
    return diffAndDates;
  }
  
  static getDifferenceInYears(startDate, endDate) {
    var diff, startYear, endYear;
    var diffAndDates = [];
    
    startDate = new Date(startDate.getFullYear(), 0, 1);
    endDate = new Date(endDate.getFullYear(), 11, 31);
    
    diff = endDate.getFullYear() - startDate.getFullYear() + 1;
    
    diffAndDates = [diff, startDate, endDate];
    
    return diffAndDates;
  }
  
  static getHeatmap(db, outlets, data, isActivity, callback){
    
    var highestTotal = 0;
    var totals = {};
    for (var o = 0; o<outlets.length; o++)
    {
      var venueName = outlets[o];
      var total = 0;
      var keys = Object.keys(data);
      var lastHour = -1; //initial value, we start processing with the 0 hours (midnight to 1)
      for (var i = 0; i < keys.length; i++) { //for each hour in the transaction data we're given
          var totalAmount = 0;
          var willInsert = false;
          for (var e = 0; e < data[keys[i]].length; e++) { //foreach transaction in hour
              var thisPlace = data[keys[i]][e].outletName;
              if (venueName === null || thisPlace === venueName) {
                  var thisHour = data[keys[i]][e].dateTime.getHours();
                  var hourDifference = (thisHour - lastHour) % 24;
                  lastHour = thisHour;
                  
                  if (isActivity)
                  {
                    total += 1;
                  } else {
                    totalAmount += data[keys[i]][e].totalAmount;
                  }
                  
                  willInsert = true;
              }
          }
          if (lastHour >= 0 && willInsert) {
              total += totalAmount;
          }
      }
      totals[venueName] = total;
      if (total > highestTotal) highestTotal = total;
    }
    
    //now that we've processed the data, we just need to put it in a proper heatmap format. (specify the max and each point)
    
    var heatmapData = {};
    
    heatmapData.max = highestTotal;
    heatmapData.data = [];
    
    var fetchCount = 0;
    var keys = Object.keys(totals);
    for (let i = 0; i < keys.length; i++) {
      console.log("fetching data for location: " + keys[i]);
      let dataPoint = {};
      var coords = Day.getCoordinatesByOutletName(db, keys[i], function(err, data){
        if (!err) //only show locations with a physical location, those without will have an error here.
        {
          //console.log("data returned from function", data);
          dataPoint.lat = data.latitude;
          dataPoint.lng = data.longitude;
          dataPoint.count = totals[keys[i]];
          dataPoint.name = keys[i];
          //console.log("dataPoint", dataPoint);
          if (dataPoint.count > 0)
          {
            console.log("t3", dataPoint);
            heatmapData.data.push(dataPoint);
          }
        }
        fetchCount++;
        if (fetchCount === keys.length)
        {
          console.log("done fetching, returning: " + JSON.stringify(heatmapData));
          callback(null, heatmapData);
        }
      });
    }
    
    
  }
  
  static getCoordinatesByOutletName(db, name, callback){
    var lat = 0;
    var lng = 0;
    
    Outlet.getOutlet(db, name, function(err, data){
      if (err) {
        console.log("Error occurred while finding outlet.");
        callback("error"); return;
        return;
      } else {
        //console.log("outlet (data)", data);
        if (data !== null && data !== undefined)
        {
          lat = data.latitude;
          lng = data.longitude;
          var result = {"latitude": lat, "longitude": lng};
          //console.log("result", result);
          callback(null, result); return;
        } else {
          callback("null outlet returned"); return;
        }

      }
    });
    
  }
}

module.exports = Day;