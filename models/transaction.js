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
        this.uploadID = undefined;
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
    //db.transactions.insertMany(transactions, callback()); //this line requires a newer version of either mongoDB or the bridge.
    for (var i = 0; i < transactions.length - 1; i++) {
        Transaction.create(db, transactions[i], () => {});
    }
    Transaction.create(db, transactions[i], callback); //no callbacks for any inserts except the last - would ideally use insertMany instead.
  }
  
}

module.exports = Transaction;