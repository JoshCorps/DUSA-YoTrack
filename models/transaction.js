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

  static insertTransactions(db, transactions, callback) {
    var invalidCount = 0;
    for (var i = transactions.length - 1; i >= 0; i--) {
        if (!(transactions[i] instanceof Transaction)) {
            transactions.splice(i, 1);
        }
    }
    console.log("Encountered and deleted " + invalidCount + " invalid transactions before inserting to the database.");
    console.log("About to insert " + transactions.length + " transactions.");
    db.transactions.insert(transactions, (err, objs) => {
        if (err)
        {
            //TODO: Handle error
            console.log("Could not insert data.");
        }
        var transactionIDs = [];
        for (var i = 0; i < objs.length; i++) {
            transactionIDs.push(objs[i]._id);
        }
        callback(transactionIDs);
    });
    
    console.log("Inserted" + transactions.length + " transactions.");
  }
  
}

module.exports = Transaction;