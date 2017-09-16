'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.get('/', authenticate, (req, res) => {
    res.render('change_password');
});

router.post('/', authenticate, (req, res) => {
    let currentPass = req.body.currentPass;
    let newPass = req.body.newPass;
    let repeatNewPass = req.body.repeatNewPass;
    
    console.log("currentPass: " + currentPass);
    console.log("currentPass: " + newPass);
    console.log("repeatNewPass: " + repeatNewPass);
    
    var user = new User(req.session.passport.user);
    
    if(newPass !== repeatNewPass)
    {
        //flash msg
        return;
    }
    
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
                req.flash('success', "Your password has been changed please login again");
                res.redirect('/');
            }
            
        });
    }
    
});
module.exports = router;