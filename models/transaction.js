let ObjectID = require('mongojs').ObjectID;
let instadate = require('instadate');

class Transaction {
    constructor() {
        this.dateTime = undefined;
        this.retailerRef = undefined;
        this.outletRef = undefined;
        this.retailerName = undefined;
        this.outletName = undefined;
        this.newUserID = undefined;
        this.transactionType = undefined;
        this.cashSpent = undefined;
        this.discountAmount = undefined;
        this.totalAmount = undefined;
        //this.uploadID = undefined;
    }

    static create(db, transaction, callback) {
        let trans;
        if (transaction instanceof Transaction) {
            trans = transaction;
        }
        else {
            trans = new Transaction(transaction);
        }
        db.transactions.insert(trans, callback());
    }

    /*
        @returns 
        {
            "YYYY-MM-01": [
                { / sample transaction object / },
                { / sample transaction object / },
                { / sample transaction object / }
            ],
            "YYYY-MM-02": [
                { / sample transaction object / },
                { / sample transaction object / }
            ]
        }
    */
    static getTransactionsByDateRange(db, startDate, endDate, callback) {
        db.transactions.find({ dateTime: { $gte: startDate, $lt: endDate } }, (err, data) => {
            if (err) {
                callback(err);
                return;
            }

            let days = {};
            for (let i = 0; i < data.length; i++) {
                var date = data[i].dateTime.getFullYear() + '-' + (data[i].dateTime.getMonth() + 1) + '-' + data[i].dateTime.getDate();
                let hour = data[i].dateTime.getHours();
                
                if (hour < (6)) {
                    date = data[i].dateTime.getFullYear() + '-' + (data[i].dateTime.getMonth() + 1) + '-' + (data[i].dateTime.getDate() - 1);
                }
                
                if (((data[i].dateTime.getDate()-1) === 0) && (startDate.getMonth() !== data[i].dateTime.getMonth())) {
                    if (hour < (6)) {
                        date = data[i].dateTime.getFullYear() + '-' + (data[i].dateTime.getMonth()) + '-' + instadate.lastDateInMonth(startDate).getDate();
                        if (!days[date]) {
                            days[date] = [];
                        }
                        days[date].push(data[i]);
                    }
                    continue;
                }
                
                if (!days[date]) {
                    days[date] = [];
                }
                days[date].push(data[i]);
            }
            
            callback(null, days);
        });
    }
    
    static getTransactionsForDay(db, startDate, endDate, callback) {
        db.transactions.find({ dateTime: { $gte: startDate, $lt: endDate } }, (err, data) => {
            if (err) {
                callback(err);
                return;
            }

            callback(null, data);
        });
    }
    
    static getTransactions(db, query, callback) {
        db.transactions.find(query, (err, data) => {
           if (err) {
               callback(err);
               return;
           }
           callback(null,data);
        });
    }

    static getTransactionsByShopAndDate(db, startDate, endDate, shopName, callback) {
        db.transactions.find({ dateTime: { $gte: startDate, $lt: endDate }, outletName: shopName }, (err, data) => {
            if (err) {
                callback(err);
                return;
            }
            callback(null, data);
        });
    }
    
    // returns a groupedTransactions object with the totals of each day summed under a key
    static groupTransactionsByDay(numberOfDays, startDate, endDate, transactions) {
        var groupedTransactions = {};
        var key, d;
        
        // create keys
        for (let j=0; j<numberOfDays; j++) {
            d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + j);
            key = d.toDateString();
            groupedTransactions[key] = 0;
        }
        
        // add data to keys
        for (let i=0; i<transactions.length; i++) {
            d = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), transactions[i].dateTime.getDate());
            key = d.toDateString();
            groupedTransactions[key] += transactions[i].totalAmount;
        }
        
        return groupedTransactions;
    }
    
    // returns a groupedTransactions object with the totals of each week summed under a key
    static groupTransactionsByWeek(numberOfWeeks, startDate, endDate, transactions) {
        var groupedTransactions = {};
        var key, d;
        
        // create keys
        for (let j=0; j<numberOfWeeks; j++) {
            d = new Date(startDate.getFullYear(), startDate.getMonth(), (startDate.getDate() + j * 7));
            key = "w/c " + d.toDateString();
            console.log('KeyDates: '+key);
            groupedTransactions[key] = 0;
        }
        
        // add data to keys
        for (let i=0; i<transactions.length; i++) {
            var day = transactions[i].dateTime.getDay();
            if(day == 0) {
                day = 7;
            }
            day -= 1;
            d = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), transactions[i].dateTime.getDate() - day);
            key = "w/c " + d.toDateString();
            groupedTransactions[key] += transactions[i].totalAmount;
        }
        
        return groupedTransactions;
    }
    
    // returns a groupedTransactions object with the totals of each month summed under a key
    static groupTransactionsByMonth(numberOfMonths, startDate, endDate, transactions) {
        var groupedTransactions = {};
        var key, d;
        
        // create keys
        for (let j=0; j<numberOfMonths; j++) {
            d = new Date(startDate.getFullYear(), (startDate.getMonth()+j), 1);
            key = Transaction.getMonthNameString(d.getMonth()) + " " + d.getFullYear();
            groupedTransactions[key] = 0;
        }
        
        // add data to keys
        for (let i=0; i<transactions.length; i++) {
            d = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), 1);
            key = Transaction.getMonthNameString(d.getMonth()) + " " + d.getFullYear();
            groupedTransactions[key] += transactions[i].totalAmount;
        }
        
        return groupedTransactions;
    }
    
    // returns a groupedTransactions object with the totals of each year summed under a key
    static groupTransactionsByYear(numberOfYears, startDate, endDate, transactions) {
        var groupedTransactions = {};
        var key;
        
        for (let j=0; j<numberOfYears; j++) {
            key = startDate.getFullYear() + j;
            groupedTransactions[key] = 0;
        }
        
        for (let i=0; i<transactions.length; i++) {
            key = transactions[i].dateTime.getFullYear();
            groupedTransactions[key] += transactions[i].totalAmount;
        }
        
        return groupedTransactions;
    }
    
    // daysOfTheWeek is an array with indices of the days of the week to be included in the final data
    static sortTransactionsForDaysOfTheWeek(numberOfWeeks, startDate, endDate, startTime, endTime, daysOfWeek, transactions) {
        var sortedTransactions = {};
        var key, d;
        
        // set all days of the week to integers to be able to compare them later
        for (let j=0; j<daysOfWeek.length; j++) {
            daysOfWeek[j] = parseInt(daysOfWeek[j]);
        }
        
        // create keys to the sortedTransactions object for all the possible days
        for (let j=0; j<numberOfWeeks; j++) {
            for(let n=0; n<daysOfWeek.length; n++) {
                var addToDay = j*7 + parseInt(daysOfWeek[n] - 1, 10);
                
                if (addToDay == 0) {
                    d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                } else {
                    d = new Date(startDate.getFullYear(), startDate.getMonth(), (startDate.getDate() + addToDay));
                }
                
                key = d.toDateString();
                sortedTransactions[key] = 0;
            }
        }
        
        for (let i=0; i<transactions.length; i++) {
            var keyDate = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), transactions[i].dateTime.getDate(), (transactions[i].dateTime.getHours() - 6));
            // move index so that Sunday is 7 (and Monday still starts at 1)
            var day = keyDate.getDay();
            if (day == 0) {
                day = 7;
            }
            
            // check if index of the fay of the transactions is in the array of required days
            if(daysOfWeek.indexOf(day) != -1) {
                var transactionTime = Transaction.getTimeInFourDigits(transactions[i].dateTime.getHours(), transactions[i].dateTime.getMinutes());
                var add = false;
                
                // check the given time constraints
                if ((endTime == 0) && (startTime == 0)) {
                     add = true;
                 } else {
                    if (endTime < startTime) {
                        if ((transactionTime > startTime) || (transactionTime < endTime)) {
                            add = true;
                        }
                    } else {
                        if ((transactionTime > startTime) && (transactionTime < endTime)) {
                            add = true;
                        }
                    }
                 }
                 // add transaction to the key if it is withing the specified time
                 // keys are previously created and the key made from transaction date should match one of them
                 if (add == true) {
                    d = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), transactions[i].dateTime.getDate(), (transactions[i].dateTime.getHours() - 6));
                    key = d.toDateString();
                    sortedTransactions[key] += transactions[i].totalAmount;
                 }
            }
        }
        
        return sortedTransactions;
    }
    
    // returns time as an integer between 0 and 2300
    static getTimeInFourDigits(hours, minutes) {
        let time = '0000';
        time = hours;
        if (minutes == 0) {
            time = time + '00';
        }else if (minutes < 10) {
            time = time + '' + 0 + '' + minutes;
        } else {
            time = time + '' + minutes;
        }
        return parseInt(time, 10);
    }
    
    static insertTransactions(db, transactions, callback) {
        var invalidCount = 0;
        for (var i = transactions.length - 1; i >= 0; i--) {
            if (!(transactions[i] instanceof Transaction)) {
                transactions.splice(i, 1);
            }
        }
        console.log("Encountered and deleted " + invalidCount + " invalid transactions before inserting to the database.");
        console.log("About to insert " + transactions.length + " transactions.");
        db.transactions.insert(transactions, (err) => {
            if (err) {
                //TODO: Handle error
                console.log("Could not insert data.");
            }
            else {
                console.log("Inserted " + transactions.length + " transactions.");

                var transactionIDs = [];

                var startDate = transactions[0].dateTime;
                var endDate = transactions[transactions.length - 1].dateTime;

                //TribeAnalysis.analyse(db, transactions);
                for (var i = transactions.length - 1; i >= 0; i--) {
                    transactionIDs.push(transactions[i]._id);
                }
                transactions = undefined; //mark for garbage collection to make space for other inserts
                callback(transactionIDs, startDate, endDate);
            }

        });
    }

    static deleteTransactions(db, upload_ids, callback) {
        db.uploads.find({ '_id': { $in: upload_ids.map((upload) => { return new ObjectID(upload); }) } }, (err, uploads) => {
            if (err) {
                callback(err);
            }
            var transaction_ids = [];
            for (let i = 0; i < uploads.length; i++) {
                transaction_ids = transaction_ids.concat(uploads[i].transactionIDs);
            }
            db.transactions.remove({ '_id': { $in: transaction_ids.map((transaction) => { return new ObjectID(transaction); }) } }, (err) => {
                if (err) {
                    callback(err);
                }
            });
            callback(null);
        });
    }
    
    static getMonthNameString(monthNumber) {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (monthNumber >= 0 && monthNumber <= 11) {
      return monthNames[monthNumber];
    }
    console.log("Error - month name could not be returned for monthNumber " + monthNumber);
    return "Unknown Month";
  }

}

module.exports = Transaction;
