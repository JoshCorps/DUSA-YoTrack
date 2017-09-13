'use strict';

let express = require('express');
let router = express.Router();


//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.post('/', (request, response) => {
    request.session.m = "test"
    console.log('is posted');
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
    let email = request.body.email;
    let password = request.body.password;
    let repeatPassword = request.body.repeatPassword;

    User.getUserByEmail(db, email, (err) => {
        console.log(err)
        if (err !== null) {
            request.flash('error', "Email already in use");
        response.redirect('/login');
        return;
            console.log("Email already in use");
        }
        else {
            console.log("email unique");
        }
    });

    if (password !== repeatPassword) {
        console.log("Passwords do not match");
        request.flash('error', "Passwords do not match");
        response.redirect('/login');
        return;
    }
    if (!email.endsWith("@dusa.co.uk") && !email.endsWith("@dundee.ac.uk")) {
        console.log("Invalid email address");
        request.flash('error', "Invalid email address");
        response.redirect('/login');
        return;
    }
    if (password.length < 8) //add more reqs
    {
        request.flash('error', "Password requirements not met");
        console.log("Password requirements not met");
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
        console.log('reached');
        if (err) {
            console.log("failed");
        }
        else {
            console.log("passed");
        }
        response.redirect('/login');
        return;
    });
});

module.exports = router;
