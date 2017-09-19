let instadate = require('instadate');
let Transaction = require('./transaction');

const startHour = 6;
module.exports = {startHour};

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
  
  static getColorsForDays(days) {
      let total = 0;
      let keys = Object.keys(days);
      for (let j=0; j<keys.length; j++) {
          total += days[keys[j]];
      }
      let average = total/keys.length;
      let lowThreshold = average * 0.3;
      let highThreshold = average * 0.7;
      var colors = {};
      let colorKeys = Object.keys(days);
      for (let j=0; j<keys.length; j++) {
          if (days[keys[j]] < lowThreshold) {
              colors[colorKeys[j]] = "#cc2b2b"; // red
          } else if(days[keys[j]] > highThreshold) {
              colors[colorKeys[j]] = "#31cc2b"; // green
          } else {
              colors[colorKeys[j]] = "#f29100"; // orange
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
      
      console.log(days);
      
      callback(err, days);
    });
  }

  static getMonthName(monthNumber, callback) {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (monthNumber >= 0 && monthNumber <= 11) {
      callback(null, monthNames[monthNumber]);
    }
    callback("Error: monthNumber not in range.");
  }

}

module.exports = Month;
