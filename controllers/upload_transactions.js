let express = require('express');
let router = express.Router();

//models
let db = require('../models/db.js')();
let Transaction = require('../models/transaction');

router.get('/', (request, response) => {
    response.render('upload_transactions');
});

router.post('/', (req, res) => {
    let fileUpload = require('express-fileupload');
    if (!req.files)
    res.status(400).send('No files were uploaded.');
    
    let spreadsheet = req.files.spreadsheet;
    
    spreadsheet.mv('/home/ubuntu/workspace/spreadsheets/' + 'file.xlsx', function(err) {
    //if (err)
    //    res.status(500).send(err);
  });
  
    var transactions = [];
    convertExcelToTransactions('file.xlsx', transactions);
    
    Transaction.create(db, transactions[10], (err, success) => {
        console.log('reached');
        if (err) {
            console.log("failed");
        }
        else {
            console.log("passed");
        }
        res.redirect('/');
        return;
    });

      //res.render('upload_transactions_receive', {transactions});
});

//use this method to get an array of transaction objects out of an uploaded excel spreadsheet
function convertExcelToTransactions(filename, transactions)
{
    const uuidv1 = require('uuid/v1');
    var parseXlsx = require('excel');
    parseXlsx('/home/ubuntu/workspace/spreadsheets/' + filename, '2', function (err, data) {
  if(err) throw err;
  
    // data is an array of arrays
    // so y coordinate is specified first, then x - e.g. data[6][1] = 2nd column, 7th row.
    
    if (data === undefined) { console.log("spreadsheet data is undefined!"); throw err; }
    
    //make as many objects as there are rows
    if (data[0] === undefined) { //we need at least one row in the file
        throw err;
    };
    for (var i = 0; i < data.length; i++) {
        transactions.push(new Transaction());
    }
    console.log("transactions: " + transactions.length);
    //try to find each field and update the objects:
    
    addField(data, transactions, "dateTime", "Date & Time");
    addField(data, transactions, "retailerRef", "Retailer Ref");
    addField(data, transactions, "outletRef", "Outlet Ref");
    addField(data, transactions, "retailerName", "Retailer Name");
    addField(data, transactions, "outletRef", "Outlet Ref");
    addField(data, transactions, "outletName", "Outlet Name");
    addField(data, transactions, "newUserID", "New user id");
    addField(data, transactions, "transactionType", "Transaction Type");
    addField(data, transactions, "cashSpent", "Cash Spent");
    addField(data, transactions, "discountAmount", "Discount Amount");
    addField(data, transactions, "totalAmount", "Total Amount");
    for (var i = 0; i < transactions.length; i++) {
        transactions[i].uploadID = uuidv1(); //timestamp as uploadID
    }
      console.log("transaction count before deletions: " + transactions.length);
    removeElementsWithUndefinedProperties(transactions);
      console.log("transaction count after processing: " + transactions.length);
      //console.log(transactions[0]);
      //console.log(transactions[10]);
}
    );
}

function removeElementsWithUndefinedProperties(objects)
{
        console.log("About to remove undefined objects, object count: " + objects.length + " property count: " + Object.keys(objects[0]).length);
        console.log("first property: " + Object.keys(objects[0])[0]);
    //iterate in reverse and remove entries with nulls/undefined props as we go
    for (var i = objects.length - 1; i >= 0; i--) {
        var properties = Object.keys(objects[i]);
        for (var e = 0; e < properties.length; e++) {
            if ((objects[i])[properties[e]] === undefined || (objects[i])[properties[e]] === null)
            {
                console.log("Found undefined property on object #" + i);
                objects.splice(i, 1);
                break;
            }
        }
    }
}

function addField(data, transactions, fieldName, title)
{
    
    var titleLimit = 100; //we must encounter the title within the first 100 rows
    //descend down each column, trying to match the title string to find startX and startY (coords of cell containing title)
    var startX = undefined;
    var startY = undefined;
    for (var y = 0; y < data.length && y < titleLimit; y++) {
        for (var x = 0; x < data[y].length; x++) {
            if (title.toLowerCase() === data[y][x].toLowerCase())
            {
                startX = x;
                startY = y+1;
                break;
            }
        }
    }
    
    //if (startY === undefined || startX === undefined); TODO: use callback to handle error
    
    //Add each cell's value to the respective transaction object
    if (startX!=undefined && startY != undefined)
    {
        //console.log("x: " + startX + " y: " + startY + " for field: " + fieldName);
        for (var y = startY; y < data.length; y++) {
            var value = data[y][startX];
            //format value here, if necessary
            (transactions[y])[fieldName] = value;
        }
    } else
    {
        console.log("undefined x or y for field: " + fieldName + ", tried to match: " + title);
    }
    
}

module.exports = router;