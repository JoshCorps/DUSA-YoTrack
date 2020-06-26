let express = require('express');
let router = express.Router();
const fs = require("fs");
var AsyncLock = require('async-lock');
let authenticate = require('./index').authenticate;
//var parseXlsx = require('excel');
//const uuidv1 = require('uuid/v1');
var XLSX = require('xlsx-extract').XLSX;
var Promise = require('promise');
var instadate = require('instadate');
let authenticateByPermission = require('./index').authenticateByPermission;

//models
let db = require('../models/db.js')();
let Transaction = require('../models/transaction');
let Upload = require('../models/upload');
let moment = require('moment');

router.get('/', authenticate, (request, response, next) => {
    if (!authenticateByPermission(request, 'master')) {
        return response.redirect('/');   
    }
    
    request.flash();
    response.render('upload_transactions');
});

router.post('/', authenticate, (req, res, next) => {
    if (!authenticateByPermission(req, 'master')) {
        return res.redirect('/');   
    }
    
    let fileUpload = require('express-fileupload');
    
    if (!req.files || req.files.spreadsheet === undefined) {
        console.log("File not found.");
        req.flash('error', "Couldn't detect file!");
        res.redirect('/');
        return;
    }

    let spreadsheet = req.files.spreadsheet;

    var fileSizeInMB = spreadsheet.data.byteLength / 1048576; //Clarification:MebiBytes are used (MiB), not the new simplified definition of MB

    console.log("MIME Type: " + spreadsheet.mimetype);
    console.log("File size: " + fileSizeInMB);

    /*
    //mimetype check - not necessary thanks to the excel parser notifying us of errors if anything is wrong
    if (spreadsheet.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        req.flash("The file is not in .xlsx format. Please ensure your file is properly.");
        res.redirect("/");
        return;
    }
    */

    //filesize check before writing to disk
    var uploadLimitInMB = 20;
    if (fileSizeInMB > uploadLimitInMB) {
        req.flash("File size is too large for the server to handle (larger than " + uploadLimitInMB + "MB). Please break the file into smaller chunks.");
        res.redirect("/");
        return;
    }

    //const fileName = '/home/ubuntu/workspace/spreadsheets/file.xlsx';
    const fileName = '/Users/joshcorps/Dev/Industrial-Team-Project-Team-1/spreadsheets/file.xlsx';

    spreadsheet.mv(fileName, function(err) {
        if (err)
        {
            console.log("File not able to be moved.");
            req.flash('error', "Couldn't detect file!");
            res.redirect('/');
            return;
        }
    });

    var workbookNumber = parseInt(req.body.workbookNumber);
    if (isNaN(workbookNumber)) {
        console.log("The workbook number supllied was not a number.");
        workbookNumber = 0;
    }

    //req.flash('success', 'Your file was uploaded and is now being processed. Please allow some time for the data to be processed.');
    //res.redirect('/');
    
    console.log("workbookNumber: " + workbookNumber);

    console.log("About to process uploaded file.");
    var transactions = [];
    var extractionDetails = [];

    extractionDetails.push(new columnExtractionDetails("dateTime", "Date & Time", formatDate));
    extractionDetails.push(new columnExtractionDetails("retailerRef", "Retailer Ref"));
    extractionDetails.push(new columnExtractionDetails("outletRef", "Outlet Ref"));
    extractionDetails.push(new columnExtractionDetails("retailerName", "Retailer Name"));
    extractionDetails.push(new columnExtractionDetails("outletName", "Outlet Name"));
    extractionDetails.push(new columnExtractionDetails("newUserID", "New user id"));
    extractionDetails.push(new columnExtractionDetails("transactionType", "Transaction Type"));
    extractionDetails.push(new columnExtractionDetails("cashSpent", "Cash Spent", formatMoney));
    extractionDetails.push(new columnExtractionDetails("discountAmount", "Discount Amount", formatMoney));
    extractionDetails.push(new columnExtractionDetails("totalAmount", "Total Amount", formatMoney));
    
    //findWorkbook(1, fileName, extractionDetails, transactions, convertExcelToTransactions, req, res);
    
    convertExcelToTransactions(fileName, extractionDetails, workbookNumber, transactions, insertTransactions, req, res); //callback necessary to ensure array is processed before being sent to the DB

    //res.render('upload_transactions_receive', {transactions});
});

function insertTransactions(transactions) {

    console.log("Inserting transactions. " + transactions.length + " transactions left.");

    const insertLimit = 25000; //we need an insertLimit as inserting has a large memory footprint.

    if (transactions.length > 0) {
        var isDone = false;

        if (transactions.length > insertLimit) {
            //break off into smaller chunks if over the limit
            var batch = transactions.splice(0, insertLimit);

            //insert the batch without finishing up
            Transaction.insertTransactions(db, batch, (transactionIDs, startDate, endDate) => {
                console.log("inserted transactions, inserting upload");

                var promise = new Promise(function (resolve, reject) {
                    var upload = new Upload();
                    upload.date = new Date();
                    console.log(upload.date);
                    upload.startDate = startDate;
                    upload.endDate = endDate;
                    upload.transactionIDs = transactionIDs;
                    Upload.create(db, upload, (err, res) => {
                        if (err) {
                            console.log("Error inserting upload");
                            reject(err);
                        }
                        else
                        {
                            resolve(transactions);
                        }
                    });
                });
                
                promise.then(value => {insertTransactions(transactions);} );

                
            });

        }
        else {

            isDone = true;
            //insert and finish up
            Transaction.insertTransactions(db, transactions, (transactionIDs, startDate, endDate) => {
                console.log("inserted transactions, inserting upload");
                
                var upload = new Upload();
                upload.date = new Date();
                console.log(upload.date);
                upload.startDate = startDate;
                upload.endDate = endDate;
                upload.transactionIDs = transactionIDs;
                Upload.create(db, upload, afterFinalUploadCreated);
            });
        }
    }
}

function afterUploadCreated(err)
{
    if (err) {console.log("Error processing batch."); return;}
}

function afterFinalUploadCreated(err) {
    if (err) {console.log("Error processing final batch."); return;}
    console.log("Final upload created.");
}

//holds details (such as a fieldName and a formatting strategy, in the form of a function) with which to analyse each column
class columnExtractionDetails {
    constructor(fieldName, title, formatFunc){
        this.fieldName = fieldName;
        this.title = title;
        this.formatFunc = formatFunc;
        this.found = false;
        this.x = undefined;
    }
}

//use this method to get an array of transaction objects out of an uploaded excel spreadsheet
function convertExcelToTransactions(filename, extractionDetails, workbookNumber, transactions, callback, req, res) {

    var rowIndex = -1;
    var detailsFound = false;
    var titleScanLimit = 20; //we must encounter the title within this number of rows from the start
    var transactions = [];
    
    new XLSX().extract(filename, { sheet_id: workbookNumber }) // or sheet_name or sheet_nr 
        .on('sheet', function(sheet) {
            //nothing
            //console.log("sheet", sheet);
        })
        .on('row', function(row) {

            //console.log("row", row);
            rowIndex++;
            if (!detailsFound && row !== null && row !== undefined) {
                if (rowIndex <= titleScanLimit) {
                    for (var e = 0; e < extractionDetails.length; e++) {
                        for (var i = 0; i < row.length; i++) {
                            console.log("Processed row #" + rowIndex + " contaning " + row[i]);
                            if (row[i] !== null && row[i] !== undefined && ("" + row[i]).toLowerCase() === extractionDetails[e].title.toLowerCase()) {
                                extractionDetails[e].x = i;
                                extractionDetails[e].found = true;
                                console.log("Found heading: " + row[i]);
                                break;
                            }
                        }
                    }
                }

                //check if every detail column heading has been found
                detailsFound = true; //assume true, change if necessary
                for (var e = 0; e < extractionDetails.length; e++) {
                    if (extractionDetails[e].found === false) {
                        detailsFound = false;
                    }
                }

            }
            else { //if details have already been found
                for (var i = 0; i < row.length; i++) {

                    if (i == 0) { transactions.push(new Transaction()); }

                    if (row[i] !== null && row[i] !== undefined) //only process cells if they contain data
                    {
                        //find the relevant columnExtractionDetails Object
                        var details = undefined;

                        for (var e = 0; e < extractionDetails.length; e++) {
                            if (extractionDetails[e].x === i) {
                                details = extractionDetails[e];
                            }
                        }

                        if (details !== undefined && details !== null) {
                            var value = undefined;
                            if (details.formatFunc !== undefined && details.formatFunc !== null) {
                                //format value here, if necessary
                                value = details.formatFunc(row[i]);
                            }
                            else {
                                value = row[i];
                            }
                            //add the object
                            (transactions[transactions.length - 1])[details.fieldName] = value;
                        }
                    }


                    if (i === row.length - 1) //if we just processed the last cell, verify what we have so far.
                    {
                        var properties = Object.keys(transactions[transactions.length - 1]);
                        for (var e = 0; e < properties.length; e++) {
                            if ((transactions[transactions.length - 1])[properties[e]] === undefined || (transactions[transactions.length - 1])[properties[e]] === null) {
                                transactions.splice(transactions.length - 1, 1); //Delete it if it has any undefined or null fields
                                break;
                            }
                        }
                    }
                }
            }
        })
        .on('cell', function(cell) {
            //console.log('cell', cell); //cell is a value or null 
        })
        .on('error', function(err) {
            console.error('error', err);
        })
        .on('end', function(err) {
            console.log("Finished processing and found " + transactions.length + " transactions.");

            if (transactions.length === 0) {
                req.flash("error", "Could not find transaction data in the uploaded file.");
                //res.redirect("/");
                return;
            }
            else {
                checkForDuplicates(transactions[0], req, (err, action) => {
                    if (action) {
                        req.flash("warning", "The spreadsheet you recently uploaded contains transactions that coincide with the dates in another upload. If the sheet has been uploaded by mistake, you can undo the upload from the Upload History page.");
                        console.log("date clash");
                        res.redirect('/');
                    }
                    else 
                    {
                        if (transactions.length > 20000) {
                            req.flash("success", "The data has been successfully uploaded. Since your dataset is large, please allow some time for the server to process the data.");
                        }
                        else {
                            req.flash("success", "The data has been successfully uploaded. Please allow a few seconds for it to be processed.");
                        }
                        console.log("no date clash");
                        res.redirect('/');
                    }
                        callback(transactions);
                });
            }
        });

}

function formatMoney(str) {
    //store as number of 1p coins, i.e. £1.62 is stored as 162p
    str = (""+str);     //Make sure str is a string, so we can call the regex replace function on it without issue.
    var money = Number(str.replace(/[^0-9\.-]+/g, "")); //remove all chars except digits, dots and minus signs
    money = Math.round((parseFloat(str) * 100));
    return money;
}

function formatDate(str) {
    //format in spreadsheets: dd/MM/yyyy hh:mm
    var date = moment(str, "DD/MM/yyyy hh:mm").toDate();
    return date;
}

function checkForDuplicates(transaction, req, cb)
{
    var startDate = transaction.dateTime;
    var endDate = instadate.addMinutes(transaction.dateTime, 1);
    Transaction.getTransactionsByDateRange(db, startDate, endDate, function(err, data){
        if (err)
        {
            console.log("Error retrieving data");
            cb(err);
        }
        else {
            if (data !== null && data !== undefined && Object.keys(data).length !== 0)
            {
                //we found another transaction around the same time that was already uploaded.
                //WARN the user.
                console.log ("Clashing data", data)
                console.log("Possible duplicate upload found.");
                //console.log(req);
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    });
}

function removeElementsWithUndefinedProperties(objects) {
    console.log("About to remove undefined objects, object count: " + objects.length + " property count: " + Object.keys(objects[0]).length);
    //console.log("first property: " + Object.keys(objects[0])[0]);
    //iterate in reverse and remove entries with nulls/undefined properties as we go
    for (var i = objects.length - 1; i >= 0; i--) {
        var properties = Object.keys(objects[i]);
        for (var e = 0; e < properties.length; e++) {
            if ((objects[i])[properties[e]] === undefined || (objects[i])[properties[e]] === null) {
                console.log("Found undefined property on object #" + i);
                objects.splice(i, 1);
                break;
            }
        }
    }
}

function addField(data, transactions, fieldName, title, formatFunc) {

    var titleLimit = 100; //we must encounter the title within the first 100 rows
    //descend down each column, trying to match the title string to find startX and startY (coords of cell containing title)
    var startX = undefined;
    var startY = undefined;
    for (var y = 0; y < data.length && y < titleLimit; y++) {
        for (var x = 0; x < data[y].length; x++) {
            if (title.toLowerCase() === data[y][x].toLowerCase()) {
                startX = x;
                startY = y + 1;
                break;
            }
        }
    }

    //if (startY === undefined || startX === undefined); TODO: use callback to handle error

    //Add each cell's value to the respective transaction object
    if (startX != undefined && startY != undefined) {
        //console.log("x: " + startX + " y: " + startY + " for field: " + fieldName);
        for (var y = startY; y < data.length; y++) {
            var value = data[y][startX];
            if (formatFunc !== undefined && formatFunc !== null) {
                //format value here, if necessary
                value = formatFunc(value);
            }
            (transactions[y])[fieldName] = value;
        }
    }
    else {
        console.log("undefined x or y for field: " + fieldName + ", tried to match: " + title);
    }

}

module.exports = router;
