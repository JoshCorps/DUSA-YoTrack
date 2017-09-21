'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Day = require('../models/day.js');
let Month = require('../models/month.js');
let Outlet = require('../models/outlet.js');
let Transaction = require('../models/transaction.js');

router.get('/', authenticate, (req, res, next) => {
    res.render('filter', {transactions: null});
});

router.post('/', (req, res) => {
    var startDate, endDate, shopName;
    startDate = req.body.startDate;
    endDate = req.body.endDate;
    shopName = req.body.shopName;
    
    Transaction.getTransactionsByShopAndDate(db, startDate, endDate, shopName, (err, data) => {
         if (err) return;
         res.render('filter', { transactions: data });
    });
});

module.exports = router;