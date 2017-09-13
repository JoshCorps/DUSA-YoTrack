'use strict';

let express = require('express');
let router = express.Router();

// set locals before doing anything
router.use((req, res, next) => {
    console.log(req.session.messages);
    if (req.session.messages) {
        res.locals.messages = req.session.messages;
        req.session.messages = {};
    }
    req.flash = (type, message) => {
        console.log('Added message of type "' + type + '": ' + message);
        if (!req.session.messages) {
            req.session.messages = {};
        }
        req.session.messages[type] = message;
    }
    next();
});

// load other routes
router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/logout', require('./logout'));
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

/* todo
module.exports = (req, res, next) => {
    // if the user is logged in, proceed.
    if (req.isAuthenticated() || global.config["debugmode"]) {
        return next();
    }

    // if not, redirect back to login page
    res.redirect('/')
}
*/