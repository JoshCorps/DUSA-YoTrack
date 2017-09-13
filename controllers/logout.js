'use strict';

let express = require('express');
let router = express.Router();

// router.get('/', authenticate, (req, res) => {
router.get('/', (req, res) => {
    req.logout();
    req.session.destroy();
    res.send(401);
});

module.exports = router;