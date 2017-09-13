let express = require('express');
let router = express.Router();

//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.get('/', (request, response) => {
    response.render('upload_transactions');
});

router.post('/', (req, res) => {
    let fileUpload = require('express-fileupload');
    if (!req.files)
    res.status(400).send('No files were uploaded.');
    
    let spreadsheet = req.files.spreadsheet;
    
    spreadsheet.mv(__dirname + '/spreadsheets/' + 'file.xlsx', function(err) {
    //if (err)
    //    res.status(500).send(err);
  });
  
  var transactions = convertExcelToTransactions('file.xlsx');
  
    res.render('upload_transactions_receive', transactions); 
});

//use this method to get an array of transaction objects out of an uploaded excel spreadsheet
function convertExcelToTransactions(filename)
{
    var transactions = [];
    var parseXlsx = require('excel');
    parseXlsx('/home/ubuntu/workspace/spreadsheets/' + filename, function (err, data) {
  if(err) throw err;
  
    // data is an array of arrays
    
    //make as many objects as there are rows
    if (data[0] === undefined) { //we need at least one column in the file
        throw err;
    };
    for (var i = 0; i < data[0].length; i++) {
        transactions.push(new transaction());
    }
    //try to find each field and update the objects:
    
    addField(data, transactions, "dateTime", "Date & Time");
    addField(data, transactions, "retailerRef", "Retailer Ref");
    addField(data, transactions, "outletRef", "Outlet Ref");
    addField(data, transactions, "retailerName", "Retailer Name");
    addField(data, transactions, "outletRef", "Outlet Ref");
    addField(data, transactions, "outletName", "Outlet Name");
    addField(data, transactions, "newUserID", "New user id");
    addField(data, transactions, "cashSpent", "Cash Spent");
    addField(data, transactions, "discountAmount", "Discount Amount");
    addField(data, transactions, "totalAmount", "Total Amount");
    transaction.uploadID = uuidv1(); //timestamp as uploadID
    removeElementsWithUndefinedProperties(transactions);
}
    );
    return transactions;
}

function removeElementsWithUndefinedProperties(objects)
{
    //iterate in reverse and remove entries with nulls/undefined props as we go
    for (var i = objects.length - 1; i >= 0; i--) {
        var properties = Object.keys(objects[i]);
        for (var e = 0; e < properties.length; e++) {
            if (properties[e] === undefined || properties[e] === null)
            {
                objects.splice(i, 1);
                break;
            }
        }
    }
}

function addField(data, transactions, fieldName, title)
{
    var titleLimit = 100; //we must encounter the title within the first 100 rows of each column
    //descend down each column, trying to match the title string to find startX and startY (coords of cell containing title)
                var startX = undefined;
                            var startY = undefined;
    for (var x = 0; x < data.length; x++) {
        for (var y = 0; y < data[column].length && y < titleLimit; y++) {
            if (title.toLowerCase() === data[x][y].toLowerCase())
            {
                startY = y+1;
                break;
            }
        }
    }
    
    //Add each cell's value to the respective transaction object
        for (var y = startY; y < data[startX].length && y < titleLimit; y++) {
            var value = data[startX][y];
            //format value if necessary
            (transactions[y])[fieldName] = value;
        }
    
}

module.exports = router;