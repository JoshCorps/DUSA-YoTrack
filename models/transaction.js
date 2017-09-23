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
    
    static groupTransactionsByDay(numberOfDays, startDate, endDate, transactions) {
        var groupedTransactions = {};
        var key, d;
        
        for (let j=0; j<numberOfDays; j++) {
            d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + j);
            key = d.toDateString();
            groupedTransactions[key] = 0;
        }
        
        for (let i=0; i<transactions.length; i++) {
            d = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), transactions[i].dateTime.getDate());
            key = d.toDateString();
            groupedTransactions[key] += transactions[i].totalAmount;
        }
        
        return groupedTransactions;
    }
    
    static groupTransactionsByWeek(numberOfWeeks, startDate, endDate, transactions) {
        var groupedTransactions = {};
        var key, d;
        
        console.log('Number of weeks: '+numberOfWeeks);
        
        for (let j=0; j<numberOfWeeks; j++) {
            d = new Date(startDate.getFullYear(), startDate.getMonth(), (startDate.getDate() + j * 7));
            key = d.toDateString();
            console.log('KeyDates: '+key);
            groupedTransactions[key] = 0;
        }
        
        for (let i=0; i<transactions.length; i++) {
            var day = transactions[i].dateTime.getDay();
            if(day == 0) {
                day = 7;
            }
            day -= 1;
            d = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), transactions[i].dateTime.getDate() - day);
            key = d.toDateString();
            groupedTransactions[key] += transactions[i].totalAmount;
        }
        
        return groupedTransactions;
    }
    
    static groupTransactionsByMonth(numberOfMonths, startDate, endDate, transactions) {
        var groupedTransactions = {};
        var key, d;
        
        for (let j=0; j<numberOfMonths; j++) {
            d = new Date(startDate.getFullYear(), (startDate.getMonth()+j), 1);
            key = d.toDateString();
            groupedTransactions[key] = 0;
        }
        
        for (let i=0; i<transactions.length; i++) {
            d = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), 1);
            key = d.toDateString();
            groupedTransactions[key] += transactions[i].totalAmount;
        }
        
        return groupedTransactions;
    }
    
    static sortTransactionsForDaysOfTheWeek(numberOfWeeks, startDate, endDate, daysOfWeek, transactions) {
        var sortedTransactions = {};
        var key, d;
        
        for (let j=0; j<numberOfWeeks; j++) {
            for(let n=0; n<daysOfWeek.length; n++) {
                d = new Date(startDate.getFullYear(), startDate.getMonth(), (startDate.getDate() + j*7 + daysOfWeek[n]));
                key = d.toDateString();
                sortedTransactions[key] = 0;
            }
        }
        
        for (let i=0; i<transactions.length; i++) {
            var day = transactions[i].dateTime.getDay();
            if (day == 0) {
                day = 7;
            }
            day -= 1;
            if(daysOfWeek.indexOf(day) != -1) {
                d = new Date(transactions[i].dateTime.getFullYear(), transactions[i].dateTime.getMonth(), transactions[i].dateTime.getDate());
                key = d.toDateString();
                sortedTransactions[key] += transactions[i].totalAmount;
            }
        }
        
        return sortedTransactions;
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

}

module.exports = Transaction;
