'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

router.get('/', authenticate, (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
    next();
});

module.exports = router;