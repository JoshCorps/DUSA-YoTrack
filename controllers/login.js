'use strict';

let express = require('express');
let router = express.Router();
let passport = require('passport'); //

router.post('/',
  passport.authenticate('local', { successRedirect: '/', 
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

module.exports = router;

