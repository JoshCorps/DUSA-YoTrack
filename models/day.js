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
      console.log("year: " + year);
      console.log("month: " + month);
      console.log("day: " + day);
      console.log("startHour: " + startHour);
    let startDate = new Date(year, (month - 1), day, startHour);
    let endDate = instadate.addDays(startDate, 1);
    
    console.log('Start date: '+startDate+' End Date: '+endDate);
    
    Transaction.getTransactionsForDay(db, startDate, endDate, (err, data) => {
        let hours = {};
        console.log('Data length: '+data.length);
        for (var i = 0; i < data.length; i++) {
            if(data[i])
            {
                
                var theHour = data[i].dateTime.getHours();
                console.log('Hour: '+theHour);
                if (!hours[theHour])
                {
                    hours[theHour] = [];
                }
                hours[theHour].push(data[i]);
            }
        } // **** Need to do some padding for hours with 0 transactions
      console.log('Day Data length: '+hours.length);
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
}

module.exports = Day;