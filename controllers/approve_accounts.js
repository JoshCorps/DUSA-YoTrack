'use strict';

let express = require('express');
let router = express.Router();
let User = require('../models/user.js');
let bodyParser = require('body-parser');

express.use(bodyParser.urlencoded({extended: true}));

router.get('/', (req, res) => {
  User.getUnapprovedUsers((err, users) => {
      if(err) {
          // handle error somehow
      }
      
      res.render('approve_accounts', {
          users: users
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