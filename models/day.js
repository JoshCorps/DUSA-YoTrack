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
  
  static addDays(days, firstDayNumber, callback)
  {
    //sunday is 0, so offset it to the end of the list.
    if (firstDayNumber == 0) firstDayNumber = 7;
    //now we have mon = 1 tue = 2 and so on.
    //mon needs no spacing, tue needs 1 faded day and so on, so offset by -1.
    firstDayNumber -= 1;
    
    for (var i = firstDayNumber - 1; i >= 0; i--) {
      days.push(false);
    }
  }
  
  static getDays(month, year, callback)
  {
    var days = [];
    
    var dayDate = instadate.firstDateInMonth(new Date(year, month));
    var firstDayNumber = dayDate.getDay();
    addFadedDaysBefore(days, dayNumber, (err, days) => {
      if (err) {callback("error"); return;}
      addDays(days, firstDayNumber, ()=>{
        if (err) {callback("error"); return;}
        addFadedDaysAfter(days, lastDayNumber, (err, days) => {
          if (err) {callback("error"); return;}
          callback(null, days);
        })
      });
    });
    
    var dayName = getDayName(dayDate);
    
    ////addDay(days, );
    callback(days);
  }
  
  static getOneDayRange(date1, callback) {
      var dates = [];
      date1.setHours(start_hour);
      var date2 = instadate.addDays(date1,1);
      dates = [date1, date2];
      callback(dates);
  }
  
  static getTotalDayRevenue(db, date, callback) {
      Day.getOneDayRange(date, (dates) => {
          
          db.transactions.aggregate({$group: {dateTime: {$gt: dates[0], $lt: dates[1]}, total: {$sum : '$totalAmount'}}}, (err, data) => {
              if (err) {
                  callback(err);
              }
              callback(null, data.total);
          });
          
          /*
          db.transactions.find({dateTime: {$gt: dates[0], $lt: dates[1]}}, {totalAmount : 1}, (err, data) => {
             if (err) {
                 callback(err);
                 return;
             }
             let total = 0;
             for(let i = 0; i<data.length; i++) {
                 total += data[i].totalAmount;
             }
             callback(null, total);
             return;
          });
          */
      });

  }
  
  static getAverageRevenueForMonth(db, month, year, callback) {
      var date = new Date(year, (month-1), 1);
      var date2 = instadate.lastDateInMonth(date);
      
      // {$group : {_id : "$by_user", num_tutorial : {$sum : 1}}}
      
      db.transactions.aggregate({$group: {dateTime: {$gt: date, $lt: date2}, total: {$sum : '$totalAmount'}}}, (err, data) => {
          if (err) {
              callback(err);
          }
      });
  }
  
  static getDayColorBasedOnRevenue(revenue) {
      
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