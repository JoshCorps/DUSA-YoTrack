'use strict';

let express = require('express');
let router = express.Router();

// load other routes
router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/approve_accounts', require('./approve_accounts'));
router.use('/upload_transactions', require('./upload_transactions'));

// serve index page
router.use('/', (req, res) => {
    res.render('index', {
        title: 'Index'
    });
});

// serve 404 when nothing can be found
router.use((req, res, next) => {
    res.status(404).render('404', {
        title: '404: Page Not Found',
        url: req.url
    });
});

// serve 5xx on error
router.use((error, req, res, next) => {
    res.status(500).render('5xx', {
        title: '500: Internal Server Error',
        error: error
    });
});

module.exports = router;

