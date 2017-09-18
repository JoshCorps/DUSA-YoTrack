let instadate = require('instadate');

// variables for data constraints
let start_hour = 6;
let high_revenue = 10;
let low_revenue = 10;

class Day {
  constructor(faded, name, dayNumber, revenue, color) {
    
    this.faded = undefined;
    this.name = undefined;
    this.dayNumber = undefined; //1..31
    this.revenue = undefined;
    this.colour = undefined;
      /*
      name of the day
      date
      total revenue of the day
      color of the day
      */
      
  }
  
  static getMonthName(monthNumber){
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (monthNumber >= 0 && monthNumber <= 11)
    {
      return monthNames[monthNumber];
    }
    return "Invalid Month Name";
  }
  
  static getDayName(dayNumber)
  {
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (dayNumber >= 0 && dayNumber <= 6)
    {
      return dayNames[dayNumber];
    }
    return "Invalid Month Name";
  }
  
  static addDay(faded, name, dayNumber, revenue, color, days, callback){
    var day = new Day;
    day.faded = faded;
    day.name = name;
    day.dayNumber = dayNumber;
    day.revenue = revenue;
    day.color = color;
    days.push(day);
    callback(null);
  }
  
  static addFadedDaysBefore(days, firstDayNumber, callback)
  {
    //sunday is 0, so offset it to the end of the list.
    if (firstDayNumber == 0) firstDayNumber = 7;
    //now we have mon = 1 tue = 2 and so on.
    //mon needs no spacing, tue needs 1 faded day and so on, so offset by -1.
    firstDayNumber -= 1;
    
    for (var i = firstDayNumber - 1; i >= 0; i--) {
      days.push(false);
    }
    
    callback(null);
  }
  
  static addFadedDaysAfter(days, lastDayNumber, callback)
  {
    if (lastDayNumber == 0) lastDayNumber = 7;
    lastDayNumber -= 1;
    
    //we want to insert enough faded days to round up the length to the next multiple of 7
    var numberOfDaysNeeded = 7 - (days.length % 7);
    if (numberOfDaysNeeded == 7) numberOfDaysNeeded = 0;
    
    for (var i = 0; i < numberOfDaysNeeded; i++) {
      days.push();
    }
  }
  
static addDays(db, days, firstDayNumber, daysInMonth, month, year, averageRevenue, callback) {
  //sunday is 0, so offset it to the end of the list.
  if (firstDayNumber == 0) firstDayNumber = 7;
  //now we have mon = 1 tue = 2 and so on.
  //mon needs no spacing, tue needs 1 faded day and so on, so offset by -1.
  firstDayNumber -= 1;

  for (var i = 0; i < daysInMonth; i++) {
    var dayNumber = firstDayNumber + daysInMonth;
    var date = new Date(year, month, dayNumber);
    Day.getTotalDayRevenue(db, date, (err, value) => {
      if (err) { console.log("error."); return; }
      var totalRevenue = value;

      Day.getDayColorBasedOnRevenue(totalRevenue, averageRevenue, (err, value) => {
        if (err) { console.log("error"); return; }
        var dayColor = value;

        Day.addDay(false, dayNumber, totalRevenue, dayColor, days, (err) => {
          if (err) { console.log("error."); return; }
          console.log("done adding day.");
        });

      });

    });

  }
}
  static getDays(db, month, year, callback)
  {
    var days = [];
    
    Day.getAverageRevenueForMonth(db, month, year, (err, avgRevn) => {
      if (err) { console.log("An error occurred while getting average revenue."); return; }
      var averageRevenue = avgRevn;
      
      var dayDate = instadate.firstDateInMonth(new Date(year, month));
      var firstDayNumber = dayDate.getDay();
      var lastDayNumber = instadate.lastDateInMonth(new Date(year, month)).getDay();
      var daysInMonth = new Date(year, month).getDate();
      Day.addFadedDaysBefore(days, firstDayNumber, (err, value) => {
        if (err) {callback("error"); return;}
        Day.addDays(db, value, firstDayNumber, daysInMonth, month, year, (err, val)=>{
          if (err) {callback("error"); return;}
          Day.addFadedDaysAfter(val, lastDayNumber, (err, data) => {
            if (err) {callback("error"); return;}
            callback(null, data);
          })
        });
      });
      
    });
  }
  
  static getOneDayRange(date1, callback) {
      var dates = [];
      date1.setHours(start_hour, 0, 0);
      var date2 = instadate.addDays(date1,1);
      dates = [date1, date2];
      callback(dates);
  }
  
  static getTotalDayRevenue(db, date, callback) {
      Day.getOneDayRange(date, (dates) => {
          Day.getTotalRevenue(db, dates[0], dates[1], (err, total, dataLength) => {
              if(err) {
                  callback(err);
              }
              callback(null, total);
          });
      });

  }
  
  static getTotalRevenue(db, date1, date2, callback) {
      db.transactions.find({dateTime: {$gt: date1, $lt: date2}}, {totalAmount : 1}, (err, data) => {
             if (err) {
                 callback(err);
                 return;
             }
             let total = 0;
             let dataLength = data.length;
             for(let i = 0; i<dataLength; i++) {
                 total += data[i].totalAmount;
             }
             callback(null, total, dataLength);
             return;
        });
  }
  
  static getAverageRevenueForMonth(db, month, year, callback) {
      var date1 = new Date(year, (month-1), 1);
      var date2 = instadate.lastDateInMonth(date1);
      Day.getTotalRevenue(db, date1, date2, (err, total, dataLength) => {
          if (err) {
              callback(err);
          }
          var average = total/dataLength;
          callback(null, average);
      });
  }
  
  static getDayColorBasedOnRevenue(revenue, averageRevenue) {
      return "#06AA06";
  }
  
  /*
  methods:
    get grey days from start of the month
    get grey days from end of month
    get total revenue of day
    get color based on total revenue
  */
  
}

module.exports = Day;