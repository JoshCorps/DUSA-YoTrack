'use strict';

let express = require('express');
let router = express.Router();
let User = require('../models/user.js');
let db = require('../models/db.js')();
let authenticate = require('./index').authenticate;

router.get('/', authenticate, (req, res, next) => {
    req.flash();
    User.getApprovedUsers(db, false, (err, users) => {
      if(err) {
          // handle error somehow
      }
      
      if (users.length === 0) {
          req.flash('success', 'There are no accounts pending approval.');
          return res.redirect('/');
      }
      
      res.render('approve_accounts', {
            accounts: users
      });
  });
});

router.post('/', authenticate, (req, res, next) => {
    var approved = [];
    var declined = [];
    var users = Array.prototype.slice.call(req.body.users);
    
    for(let i=0; i<users.length; i++) {
        if (users[i].isApproved == 'true') {
            approved.push(users[i]);
        } else {
            declined.push(users[i].email);
        }
    }
    if (approved.length != 0) {
        User.approveUsers(db, approved, (err) => {
            if(err) return;
        });
    }
    if (declined.length != 0) {
        User.deleteUsersByEmails(db, declined, (err) => {
            if(err) return;
        });
    }
    
    res.redirect('/approve_accounts');
});

module.exports = router;