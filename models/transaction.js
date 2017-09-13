let excel = require('excel');
const uuidv1 = require('uuid/v1');

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

    static create (db, callback) {
    
    }

  static insertTransaction(transactions, db, callback) {
    db.insertMany(transactions);
  }
  
};

module.exports = Transaction;