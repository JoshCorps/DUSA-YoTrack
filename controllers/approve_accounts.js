'use strict';

let express = require('express');
let router = express.Router();
let User = require('../models/user.js');
let db = require('../models/db.js')();

router.get('/', (req, res) => {
    User.getUnapprovedUsers(db, (err, users) => {
      if(err) {
          // handle error somehow
      }
      console.log('Hi');
      res.render('approve_accounts', {
            accounts: users
      });
  });
});

router.post('/', (req, res) => {
    var approved, declined;
    var users = Array.prototype.slice.call(req.body.users);
    for(let i=0; i<users.length; i++) {
        if (users[i].isApproved) {
            approved.push(users[i].email);
        } else {
            declined.push(users[i].email);
        }
    }
    if (approved.length != 0) {
        User.approveUsers(approved);
    }
    if (declined.length != 0) {
        User.deleteUsersByEmails(declined);
    }
});

module.exports = router;