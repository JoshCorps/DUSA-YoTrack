'use strict';

let express = require('express');
let router = express.Router();


//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.post('/', (request, response, next) => {
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
    let email = request.body.email;
    let password = request.body.password;
    let repeatPassword = request.body.repeatPassword;
    var emailUnique = false;
    
    User.getUserByEmail(db, email, (err, user) => {
        if (err) return;
        if (user || (user !== null)) {
            request.flash('error', "Email already in use");
            response.redirect('/login');
            return;
        }
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
        if (!email.endsWith("@dusa.co.uk") && !email.endsWith("@dundee.ac.uk")) {
            request.flash('error', "Invalid email address");
            response.redirect('/login');
            return;
        }
        
        if (!password.match(/^(?=.*\d)(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
            request.flash('error', "Password requirements not met: Password should contain at least 1 number, 1 uppercase letter and be at least 8 characters long");
            response.redirect('/login');
            return;
        }
    
        var user = new User({
            'firstName': firstName,
            'lastName': lastName,
            'email': email,
            'accountType': 'basic',
            'isApproved': false
        });
        user.setPassword(password, false);
        ////console.log(user);
    
        User.create(db, user, (err, success) => {
            if (err) {
                ////console.log("failed");
            }
            else {
                ////console.log("passed");
                request.flash('success', 'Your account request has been submitted for approval. Please wait for an admin to verify your account.')
            }
            response.redirect('/login');
        });
    });

});

module.exports = router;