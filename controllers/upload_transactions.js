let express = require('express');
let router = express.Router();
const fs = require("fs");
let authenticate = require('index').authenticate;
    
//models
let db = require('../models/db.js')();
let Transaction = require('../models/transaction');
let Upload = require('../models/upload');
let moment = require('moment');

router.get('/', authenticate, (request, response) => {
    response.render('upload_transactions');
});

router.post('/', authenticate, (req, res) => {
    let fileUpload = require('express-fileupload');
    if (!req.files)
    {
        //req.flash('error', "Couldn't detect file!");
        //res.redirect('/');
    }

    let spreadsheet = req.files.spreadsheet;
    
    var fileSizeInMB = spreadsheet.data.byteLength/1048576; //Clarification:MebiBytes are used (MiB), not the new simplified definition of MB
    
    console.log("MIME Type: " + spreadsheet.mimetype);
    console.log("File size: " + fileSizeInMB);
    
    //mimetype check
    if (spreadsheet.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    {
        req.flash("The file is not in .xlsx format. Please ensure your file is properly.");
        res.redirect("/");
        return;
    }
    
    //filesize check before writing to disk
    var uploadLimitInMB = 1;
    if (fileSizeInMB > uploadLimitInMB)
    {
        req.flash("File size is too large for the server to handle (larger than " + uploadLimitInMB + "MB). Please break the file into smaller chunks.");
        res.redirect("/");
        return;
    }
    
    const fileName = '/home/ubuntu/workspace/spreadsheets/file.xlsx';

    spreadsheet.mv(fileName, function(err) {
        //req.flash('error', "Couldn't detect file!");
        //res.redirect('/');
    });
    
    var workbookNumber = parseInt(req.body.workbookNumber);
    if (isNaN(workbookNumber))
    {
        console.log("The workbook number supllied was not a number.");
        workbookNumber = 0;
    }
    
    console.log("workbookNumber: " + workbookNumber);
    
    /*
    const readChunk = require('read-chunk');
    const fileType = require('file-type');

    var buffer = readChunk.sync(fileName, 0, 4100);
     
    var ftype = fileType(buffer);
    console.log("ftype: ");
    console.log(fileName);
    console.log(ftype);
    console.log(buffer);
    
    var isFileValid = (ftype.ext === "xlsx" && ftype.mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    if (!isFileValid){
        req.flash('error', "Invalid spreadsheet file format/content!");
        res.redirect('/');
    }
    */
    
    var transactions = [];
    convertExcelToTransactions(fileName, workbookNumber, transactions, insertTransactions); //callback necessary to ensure array is processed before being sent to the DB
    
    res.redirect('/');
    return;

    //res.render('upload_transactions_receive', {transactions});
});

function insertTransactions(transactions)
{
    if (transactions.length > 0)
    {
        Transaction.insertTransactions(db, transactions, (transactionIDs) => {
            console.log("inserted transactions, inserting upload");
            var upload = new Upload();
            upload.date = new Date();
            upload.transactionIDs = transactionIDs;
            Upload.create(db, upload, afterUploadCreated);
    });
        
    }
}

function afterUploadCreated(){
    //nothing for now
    console.log("Upload created.");
}

//use this method to get an array of transaction objects out of an uploaded excel spreadsheet
function convertExcelToTransactions(filename, workbookNumber, transactions, callback) {
    const uuidv1 = require('uuid/v1');
    var parseXlsx = require('excel');
    console.log("about to parse...");
    
    /*
    if (fileSizeInMegabytes > 1)
    {
        req.flash("File size is too large. Please break the file into smaller chunks.");
        res.redirect("/");
        return;
    }
    */
    
    parseXlsx(filename, workbookNumber, function(err, data) {
        if (err) {
            console.log("Error parsing file.");
            //throw err;
            return;
        }
        
        console.log("parsed...");

        // data is an array of arrays
        // so y coordinate is specified first, then x - e.g. data[6][1] = 2nd column, 7th row.

        if (data === undefined) { console.log("spreadsheet data is undefined!"); throw err; }

        //make as many objects as there are rows
        if (data[0] === undefined) { //we need at least one row in the file
            console.log("No rows in file.");
            throw err;
        };
        for (var i = 0; i < data.length; i++) {
            transactions.push(new Transaction());
        }
        console.log("transactions: " + transactions.length);
        //try to find each field and update the objects:

        console.log("populating transactions...");
        addField(data, transactions, "dateTime", "Date & Time", formatDate);
        console.log("did datetime...");
        addField(data, transactions, "retailerRef", "Retailer Ref");
        console.log("did retref...");
        addField(data, transactions, "outletRef", "Outlet Ref");
        addField(data, transactions, "retailerName", "Retailer Name");
        addField(data, transactions, "outletRef", "Outlet Ref");
        addField(data, transactions, "outletName", "Outlet Name");
        addField(data, transactions, "newUserID", "New user id");
        addField(data, transactions, "transactionType", "Transaction Type");
        addField(data, transactions, "cashSpent", "Cash Spent", formatMoney);
        addField(data, transactions, "discountAmount", "Discount Amount", formatMoney);
        addField(data, transactions, "totalAmount", "Total Amount", formatMoney);
        /* Timestamps removed in favour of the uploads table (to get rid of data duplication and normalise the structure of the data).
        for (var i = 0; i < transactions.length; i++) {
            transactions[i].uploadID = uuidv1(); //timestamp as uploadID
        }
        */
        
        console.log("transaction count before deletions: " + transactions.length);
        removeElementsWithUndefinedProperties(transactions);
        console.log("transaction count after processing: " + transactions.length);
        
        callback(transactions);
    });
}

function formatMoney(str){
    //store as number of 1p coins, i.e. £1.62 is stored as 162p
    var money = Number(str.replace(/[^0-9\.-]+/g,"")); //remove all chars except digits, dots and minus signs
    money = Math.round((parseFloat(str)*100));
    return money;
}

function formatDate(str){
    //format in spreadsheets: dd/MM/yyyy hh:mm
    var date = moment(str, "dd/MM/yyyy hh:mm").toDate();
    return date;
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
