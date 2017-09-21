let ObjectID = require('mongojs').ObjectID;

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
                
                if ((data[i].dateTime.getDate() - 1) === 0) {
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

    static getTransactionsByDay() {
        // todo
    }

    static getTransactionsByTime(startTime, endTime, callback) {
        // get list of transactions

    }

    static getTransactionsByShop(shopID, callback) {
        // todo
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
