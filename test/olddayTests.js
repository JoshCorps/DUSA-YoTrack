let ObjectID = require('mongojs').ObjectID;
let instadate = require('instadate');
var chai = require('chai');
var expect = chai.expect;
var Day = require('../models/day.js');
var Transaction = require('../models/transaction.js');
let db = require('../models/db.js')();

describe('DayModule', () => {

    it('getOneDayRange() should return range from 6am of given day to 6am of next day', (done) => {
        var date = new Date("2015-11-13T01:38:56.842Z");
        
        Day.getOneDayRange(date, (dates) => {
            expect(dates).to.have.lengthOf(2);
            expect(instadate.differenceInDays(dates[0], dates[1])).to.equal(1);
            expect(dates[0].getHours()).to.equal(6);
            expect(dates[1].getHours()).to.equal(6);
            done();
        });
    });
    
    it('getTotalDayRevenue() should return revenue from 6am of given day to 6am of next day', (done) => {
        var date = new Date("2005-11-07T11:38:56.842Z");
        
        var trans1= new Transaction({
            dateTime: new Date("2005-11-07T11:38:56.842Z"),
            totalAmount: 10000
        });
        
        var trans2 = new Transaction({
            dateTime: date,
            totalAmount: 20
        });
        
        var trans3 = new Transaction({
            dateTime: date,
            totalAmount: 25
        });
        
        db.transactions.insert([trans1,trans2], (err) => {
            if(err) {
                return;
            }
        
            Day.getTotalDayRevenue(db, date, (err, revenue) => {
                if(err) {
                    return;
                }
                expect(revenue).to.equal(30);
                // db.transactions.remove({dateTime: date});
                done();
            });
        });
    });
  
});