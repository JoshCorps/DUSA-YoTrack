'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.get('/', authenticate, (req, res, next) => {
    res.render('change_password');
    next();
});

router.post('/', authenticate, (req, res, next) => {
    let currentPass = req.body.currentPass;
    let newPass = req.body.newPass;
    let repeatNewPass = req.body.repeatNewPass;
    
    var user = new User(req.session.passport.user);
    
    if(newPass !== repeatNewPass)
    {
        req.flash('error', 'The new passwords do not match. Please try again.');
        return res.redirect('/change_password');
    } else if (newPass.length < 8)
    {
        req.flash('error', 'The new password does not meet the requirements'); //list requirements
        return res.redirect('/change_password');
    } else {
        if(user.checkPassword(currentPass))
        {
            //change pass
            user.setPassword(newPass, false);
            user.update(db, user, (err, user) => 
            {
                if (err)
                {
                    //handle err
                } else {
                    //req.flash("Password changed successfully");
                    res.redirect('/');
                }
                
            });
        } else {
            req.flash('error', 'Current password incorrect. Please try again');
            res.redirect('/change_password');
        }
    }
    
});
module.exports = router;