let instadate = require('instadate');

// trying some stuff, plz ignore
class FakeDay {
    
    static getStartDay(year, month)
    {
        var firstDay = instadate.firstDateInMonth(new Date(year, (month-1)));
        return firstDay.getDay();
    }
    
    static getEndDate(year, month)
    {
        var lastDate = instadate.lastDateInMonth(new Date(year, (month-1)));
        return lastDate.getDate();
    }
    
    static getRevenueForDate(db, date)
    {
        //var test = new Date((date.setDate(date.getDate() + 1)).toISOString)
        //console.log("test: " + test)
        //console.log(date);
        //db.transactions.find({dateTime: {$gte: new Date(date).toISOString(),$lt: new Date((date.setDate(date.getDate() + 1))).toISOString()}}, (err, data) =>
        //db.transactions.find({dateTime: {$gte: new Date(date),$lt: new Date(date.setDate(date.getDate() + 1))}}, (err, data) =>
        db.transactions.find({dateTime: {$gte: new Date("2015-09-01T08:39:39.000Z"),$lt: new Date("2015-09-30T08:39:39.000Z")}}, (err, data) =>
        {
            console.log(data);
            var total = 0;
            for(var i = 0; i < data.length; i++)
            {
                total += data[i].totalAmount;
            }
            console.log("total: " + total)
            return total;
        });
    }
    
    static getData(db, year, month)
    {
        var data = [];
        for (var i = 0; i < FakeDay.getStartDay(year,month); i++)
        {
            data.push({'faded': true});
        }
        for (var i = 0; i < FakeDay.getEndDate(year,month); i++)
        {
            var date = new Date(year, (month-1), i+1)
            data.push({revenue: FakeDay.getRevenueForDate(db, date), faded: false, color: "#06AA06", dayNumber: date.getDate()});
        }
        return data;
    }
    
}

module.exports = FakeDay;