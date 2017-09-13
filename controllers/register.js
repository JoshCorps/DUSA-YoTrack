'use strict';

let express = require('express');
let router = express.Router();

//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.get('/', (request, response) => {
    response.render('register');
});

router.post('/', (request, response) => {
    console.log('is posted');
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
    let email = request.body.email;
    let password = request.body.password;
    let repeatPassword = request.body.repeatPassword;
    
    console.log("Password: " + password);
    console.log("Repeat Pass: " + repeatPassword);
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    
    if (password !== repeatPassword)
    {
        console.log("Passwords do not match");
        request.session.error = 'Incorrect username or password';
        response.redirect('/register');
        response.render('register', { error: request.session.error });
        //response.redirect('/register?e=' + encodeURIComponent("passwords do not match"));
    }
    if (email.endsWith("@dusa.co.uk") || email.endsWith("@dundee.ac.uk"))
    {
        console.log("Invalid email address");
    }
    if (password.length < 8 || !strongRegex.test(password))
    {
        console.log("Password requirements not met");
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
        } else {
            console.log("passed");
        }
    });
});

module.exports = router;