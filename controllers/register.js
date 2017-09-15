'use strict';

let express = require('express');
let router = express.Router();


//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.post('/', (request, response) => {
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
    let email = request.body.email;
    let password = request.body.password;
    let repeatPassword = request.body.repeatPassword;
    var emailUnique = false;
    
    User.getUserByEmail(db, email, (err, user) => {
        if (err)
        {
            //handle error
        }
        if (user !== null) {
            emailUnique = false;
        } else {
            emailUnique = true;
        }
        
        if (!emailUnique)
        {
            //request.flash('error', "Email already in use");
            //response.redirect('/login');
            //return;
        }
    });

    if (email === '')
    {
        request.flash('error', "Email cannot be empty");
        response.redirect('/login');
        return;
    }
    if (password === '' || repeatPassword === '')
    {
        request.flash('error', "Passwords cannot be empty");
        response.redirect('/login');
        return;
    }
    
    if (password !== repeatPassword) {
        request.flash('error', "Passwords do not match");
        response.redirect('/login');
        return;
    }
    if (!(email.endsWith("@dusa.co.uk") || !email.endsWith("@dundee.ac.uk"))) {
        request.flash('error', "Invalid email address");
        response.redirect('/login');
        return;
    }
    if (password.length < 8) //add more reqs
    {
        request.flash('error', "Password requirements not met");
        response.redirect('/login');
        return;
    }

    var user = new User({
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'accountType': ' standard',
        'isApproved': false
    });
    user.setPassword(password, false);
    console.log(user);

    User.create(db, user, (err, success) => {
        if (err) {
            console.log("failed");
        }
        else {
            console.log("passed");
            request.flash('success', 'Your account request has been submitted for approval. Please wait for an admin to verify your account.')
        }
        response.redirect('/login');
        return;
    });
});

module.exports = router;