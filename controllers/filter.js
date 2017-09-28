'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;
let authenticateByPermission = require('./index').authenticateByPermission;

// models
let db = require('../models/db.js')();
let Outlet = require('../models/outlet.js');

router.get('/', authenticate, (req, res, next) => {
    if (!authenticateByPermission(req, 'intermediate')) {
        return res.redirect('/');   
    }
    
    Outlet.getNames(db, (err, data) => {
        if (err) return;
         res.render('filter', {transactions: null, outletNames: data});  
    });
});

module.exports = router;