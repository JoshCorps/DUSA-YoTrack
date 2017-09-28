'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;
let authenticateByPermission = require('./index').authenticateByPermission;

//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.get('/', authenticate, (req, res, next) => {
    if (!authenticateByPermission(req, 'master')) {
        return res.redirect('/');   
    }
    
    req.flash();
    User.getApprovedUsers(db, true, (err, users) => {
       if (err)
       {
           //handle err ****
           return;
       }
       
       if (users.length > 0)
       {
           res.render('manage_accounts', {
              accounts: users 
           });
           return;
       }
       else
       {
           req.flash('success', 'There are no accounts pending approval.');
           res.render('manage_accounts');
           return;
       }
    });
});

router.post('/', authenticate, (req, res, next) => {
    if (!authenticateByPermission(req, 'master')) {
        return res.redirect('/');   
    }
    
    var changePerms = [];
    var deleted = [];
    var users = Array.prototype.slice.call(req.body.users);

    for(let i=0; i<users.length; i++) {
        if (users[i].option == 'changePermission')
        {
            changePerms.push(users[i]);
        } else if (users[i].option == 'delete') {
            deleted.push(users[i].email);
        }
    }
    
    if(changePerms.length > 0)
    {
        User.changePermission(db, users, (err) => {
           if(err) return; 
        });
    }
    
    if(deleted.length > 0)
    {
        User.deleteUsersByEmails(db, deleted, (err) => {
            if(err) return;
        });
    }
    res.redirect('/manage_accounts');
});

module.exports = router;