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

//move this to the controller when we have one
static convertExcelToTransaction(filename)
{
    let excel = require('excel');
    excel.parseXlsx(__dirname + '/spreadsheets/' + flename + '.xlsx', function(err, data) {
  if(err) throw err;
    // data is an array of arrays
});
    
}