//let startHour = require('./month.js').startHour;
let instadate = require('instadate');
let Transaction = require('./transaction');

let startHour = 6;

class Day {
    
    constructor()
    {
        this.hours = [];
    }
    
  static getDay(db, year, month, day, callback) {
    let startDate = new Date(year, (month - 1), day, startHour);
    let endDate = instadate.addDays(startDate, 1);
    
    Transaction.getTransactionsForDay(db, startDate, endDate, (err, data) => {
        let hours = {};
        
        /*
        for(let j=0; j<24; j++) {
          hours[j] = [];
        }*/
        
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
}

module.exports = Day;