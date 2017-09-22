var chai = require('chai');
var Day = require('../models/day.js');
let db = require('../models/db.js')();
var expect = chai.expect;
chai.use(require('chai-datetime'));

describe('Day Module test', () => {
   it('should not throw an error', (err, done) => 
   {
        Day.getDay(db, 2015, 11, 27, (err, data) => {
            console.log("err: " + err);
            expect(err).equal(null);
        });
        done();
   });
   
   it('getDifferenceInDays() should return difference from 6am to 6am of given dates', () => {
       var startDate, endDate, diff;
       startDate = new Date(2016, 1, 18);
       endDate = new Date(2016, 2, 7);
       
        diff = Day.getDifferenceInDays(startDate, endDate);
        expect(diff[0]).to.equal(19);
   });
   
   it('getDifferenceInMonths() should return difference from start month to end month', () => {
       var startDate, endDate, startDate2, endDate2, diff;
       startDate = new Date(2015, 9, 3);
       endDate = new Date(2016, 3, 21);
       startDate2 = new Date(2016, 1, 3);
       endDate2 = new Date(2016, 7, 21);
       
       var expStartDate = new Date(2015, 9, 1);
       var expEndDate = new Date(2016, 3, 30);
       
       var expStartDate2 = new Date(2016, 1, 1);
       var expEndDate2 = new Date(2016, 7, 31);
       
        diff = Day.getDifferenceInMonths(startDate, endDate);
        expect(diff[0]).to.equal(7);
        expect(diff[1]).to.equalDate(expStartDate);
        expect(diff[2]).to.equalDate(expEndDate);
        
        diff = Day.getDifferenceInMonths(startDate2, endDate2);
        expect(diff[0]).to.equal(5);
        expect(diff[1]).to.equalDate(expStartDate2);
        expect(diff[2]).to.equalDate(expEndDate2);
   });
   
   it('getDifferenceInWeeks() should return difference from start week to end week', () => {
       var startDate, endDate, startDate2, endDate2, diff;
       startDate = new Date(2016, 2, 13);
       endDate = new Date(2016, 3, 4);
       startDate2 = new Date(2017, 5, 3);
       endDate2 = new Date(2017, 6, 21);
       
        diff = Day.getDifferenceInWeeks(startDate, endDate);
        expect(diff[0]).to.equal(5);
        
        diff = Day.getDifferenceInWeeks(startDate2, endDate2);
        expect(diff[0]).to.equal(8);
   });
});