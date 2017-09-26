let instadate = require('instadate');
let Transaction = require('./transaction');

let startHour = 6;
module.exports.startHour = startHour;

class Month {
  constructor() {

    this.startDate = undefined;
    this.days = [];

  }

  static getMonthTransactionTotals(db, year, month, callback) {
    Month.getMonth(db, year, month, (err, data) => {
      if (err) {
        return callback(err);
      }

      let days = {};
      let keys = Object.keys(data);
      for (let i = 0; i < keys.length; i++) {
        let index = keys[i];
        if (!days[index]) {
          days[index] = 0;
        }

        for (let e = 0; e < data[index].length; e++) {
          days[index] += data[index][e].totalAmount;
        }
      }

      callback(null, days);
    });
  }
  
  // return an object containing dates as keys and color codes based on the total revenue or that date
  static getColorsForDays(days) {
      let total = 0;
      let nullDays = 0;
      let keys = Object.keys(days);
      for (let j=0; j<keys.length; j++) {
          total += days[keys[j]];
      }
      let average = total/keys.length;
      let lowThreshold = average * 0.4;
      let lowThreshold2 = average * 0.8;
      let highThreshold = average * 1.4;
      let highThreshold2=average * 1.2;
      var colors = {};
      let colorKeys = Object.keys(days);
      for (let j=0; j<keys.length; j++) {
          if (days[keys[j]] < lowThreshold) {
              colors[colorKeys[j]] = "#cc2b2b"; // red
          } else if(days[keys[j]] > highThreshold) {
              colors[colorKeys[j]] = "#31cc2b"; // green
          } else if(days[keys[j]] > highThreshold2) {
              colors[colorKeys[j]] = "#79f277"; // light green
          } else if(days[keys[j]] < lowThreshold2) {
              colors[colorKeys[j]] = "#f76c6c"; // light red
          } else {
              colors[colorKeys[j]] = "#d0fac8"; // middle
          }
      }
      return colors;
  }

  static getMonth(db, year, month, callback) {
    let startDate = new Date(year, month - 1, 1, startHour);
    let endDate = new Date(year, month, 1, startHour);
    
    Transaction.getTransactionsByDateRange(db, startDate, endDate, (err, data) => {
      let keys = Object.keys(data)
      
      let days = {};
      for (let i = 0; i < keys.length; i++) {
        let index = keys[i].split('-')[2];
        days[index] = data[keys[i]];
      }
      
      callback(err, days);
    });
  }

}

module.exports = Month;
