'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

router.get('/', authenticate, (req, res) => {
    req.logout();
    req.session.destroy();
    res.send(401);
});

module.exports = router;