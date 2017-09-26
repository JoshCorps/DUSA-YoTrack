let ObjectID = require('mongojs').ObjectID;
var chai = require('chai');
var expect = chai.expect;
var Upload = require('../models/upload.js');
var Transaction = require('../models/transaction.js');
let db = require('../models/db.js')();

describe('TransactionModule', function() {
    var trans1, trans2, trans3, trans4, trans5, trans6, trans7, trans8;
    var date1, date2, date3, date4, date5, date6;
    
    before(function(done) {
        date1 = new Date(2016, 7, 23);
        date2 = new Date(2016, 7, 28);
        date3 = new Date(2016, 8, 2);
        date4 = new Date(2016, 7, 30);
        date5 = new Date(2016, 9, 1);
        date6 = new Date(2016, 10, 15);
        
        trans1 = new Transaction();
        trans1.totalAmount = 10;
        trans1.dateTime = date1;
        
        trans2 = new Transaction();
        trans2.totalAmount = 15;
        trans2.dateTime = date2;
        
        trans3 = new Transaction();
        trans3.totalAmount = 20;
        trans3.dateTime = date3;
        
        trans4 = new Transaction();
        trans4.totalAmount = 25;
        trans4.dateTime = date3;
        
        trans5 = new Transaction();
        trans5.totalAmount = 25;
        trans5.dateTime = date5;
        
        trans6 = new Transaction();
        trans6.totalAmount = 25;
        trans6.dateTime = date5;
        
        trans7 = new Transaction();
        trans7.totalAmount = 25;
        trans7.dateTime = date6;
        
        trans8 = new Transaction();
        trans8.totalAmount = 25;
        trans8.dateTime = date6;
        done();
    });

    it('groupTransactionsByDay() should return total amount spend each day for specified date range', function(done) {
        
        var transactions = [trans1, trans2, trans3, trans4];
        var nod, startDate, endDate;
        nod = 11;
        
        startDate = new Date(2016, 7, 23);
        endDate = new Date(2016, 8, 2);
        
        var groupedTransactions = Transaction.groupTransactionsByDay(nod, startDate, endDate, transactions);
        
        expect(Object.keys(groupedTransactions).length).to.equal(11);
        expect(groupedTransactions[Object.keys(groupedTransactions)[10]]).to.equal(45);
        done();
    });

    it('groupTransactionsByWeek() should return total amount spend each day for specified date range', function(done) {
        var transactions = [trans1, trans2, trans3, trans4];
        var now, startDate, endDate;
        now = 2;
        
        startDate = new Date(2016, 7, 22);
        endDate = new Date(2016, 8, 4);
        
        var groupedTransactions = Transaction.groupTransactionsByWeek(now, startDate, endDate, transactions);
        
        console.log(JSON.stringify(groupedTransactions));
        
        expect(Object.keys(groupedTransactions).length).to.equal(2);
        expect(groupedTransactions[Object.keys(groupedTransactions)[0]]).to.equal(25);
        done();
    });

    it('groupTransactionsByMonth() should return total amount spend each day for specified date range', function(done) {
        var transactions = [trans1, trans2, trans3, trans4, trans5, trans6, trans7, trans8];
        var nom, startDate, endDate;
        nom = 4;
        
        startDate = new Date(2016, 7, 22);
        endDate = new Date(2016, 10, 20);
        
        var groupedTransactions = Transaction.groupTransactionsByMonth(nom, startDate, endDate, transactions);
        
        expect(Object.keys(groupedTransactions).length).to.equal(4);
        expect(groupedTransactions[Object.keys(groupedTransactions)[3]]).to.equal(50);
        done();
    });

    it('sortTransactionsForDaysOfTheWeek() should return total amount spend each selected day of the week for specified date range', function(done) {
        var transactions = [trans1, trans2, trans3, trans4, trans5, trans6, trans7, trans8];
        var now, startDate, endDate;
        var daysOfTheWeek = [1, 2]; // 0 for Monday, 1 for Tuesday
        var daysOfTheWeek2 = [7]; // 6 for Sunday
        now = 13;
        
        startDate = new Date(2016, 7, 22);
        endDate = new Date(2016, 10, 20);
        
        var groupedTransactions = Transaction.sortTransactionsForDaysOfTheWeek(now, startDate, endDate, 0, 0, daysOfTheWeek, transactions);
        var groupedTransactions2 = Transaction.sortTransactionsForDaysOfTheWeek(now, startDate, endDate, 0, 0, daysOfTheWeek2, transactions);
        
        expect(Object.keys(groupedTransactions).length).to.equal(26);
        expect(Object.keys(groupedTransactions2).length).to.equal(13);
        done();
    });
  
});