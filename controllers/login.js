'use strict';

let express = require('express');
let router = express.Router();
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

// models
let db = require('../models/db.js')();
let User = require('../models/user.js');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    User.getUserByEmail(db, user.email, (error, data) => {
        if (!error) {
            done(null, data);
        }
        else {
            done(error, null);
        }
    });
});

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.getUserByEmail(db, email, (error, data) => {
        if (error) {
            return done(error);
        }

        // for security purposes, we don't actually tell the user if either the username
        // or password was incorrect. We'll just leave it as is for testing.

        // if the user objects exists in the DB 
        if (data) {
            if (data.checkPassword(password)) {
                // password is OK
                return done(null, data);
            }
            else {
                // password is not OK
                return done(null, false, { message: 'Incorrect password.' });
            }
        }
        else {
            // email does not exist in DB
            return done(null, false, { message: 'Incorrect username.' });
        }
    });
}));

router.get('/', (request, response, next) => {
    request.flash();
    response.render('login');
});

router.post('/',
    passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

module.exports = router;
