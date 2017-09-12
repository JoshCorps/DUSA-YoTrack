'use strict';

let express = require('express');
let router = express.Router();

//models
let db = require('../models/db.js')();
let User = require('../models/user.js');

router.get('/', (request, response) => {
    response.render('register.pug');
});

router.post('/', (request, reponse) => {
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
    let email = request.body.email;
    let password = request.body.password;
    let repeatpassword = request.body.repeatpassword;
    /*
    if (password !== repeatpassword)
    {
        // return error 
    }
    if (!email.contains("@dusa") || !email.contains("@dundee"))
    {
        // return invalid email
    }
    if (password.length < 8)
    {
        //pass too short
    }
    */
    
    var hashedPassword = test//User.setPassword(password, false);
    
    
    var data = [
        {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            //accountType: ,
            isApproved: false}
        ];
    User.create(db, data);
   console.log(data)     
});

module.exports = router;