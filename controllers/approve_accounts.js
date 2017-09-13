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
      res.render('approve_accounts', {
            accounts: users
      });
  });
});

router.post('/', (req, res) => {
    var approved = [];
    var declined = [];
    var users = Array.prototype.slice.call(req.body.users);
    for(let i=0; i<users.length; i++) {
        if (users[i].isApproved == 'true') {
            approved.push(users[i].email);
        } else {
            declined.push(users[i].email);
        }
    }
    if (approved.length != 0) {
        User.approveUsers(db, approved, (err) => {
            if(err) {
                // handle error
            }
        });
    }
    if (declined.length != 0) {
        User.deleteUsersByEmails(db, declined, (err) => {
            if(err) {
                // handle error
            }
        });
    }
});

module.exports = router;