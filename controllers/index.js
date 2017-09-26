'use strict';

let express = require('express');
let router = express.Router();

let User = require('../models/user.js');
let db = require('../models/db.js')();

let authenticate = (req, res, next) => {
    // if the user is logged in, proceed.
    if (req.isAuthenticated()) {
        if (!req.user.isApproved) {
            req.flash('error', 'Your account has not yet been approved. Please contact an admin.')
            res.redirect('/login');
        }

        return next();
    }

    // if not, redirect back to login page
    res.redirect('/login')
};
module.exports.authenticate = authenticate;

// set locals before doing anything
router.use((req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;
    }

    req.flash = (type, message) => {
        if (!type) {
            if (req.session.messages) {
                res.locals.messages = req.session.messages;
                req.session.messages = {};
            }
        }
        else {
            if (!req.session.messages) {
                req.session.messages = {}
            }
            if (!req.session.messages[type]) {
                req.session.messages[type] = [];
            }
            req.session.messages[type].push(message);
        }
    }

    next();
});

router.use((req, res, next) => {
    // check user is authenticated
    if (!req.isAuthenticated()) {
        return next();
    }
    
    // check user is actually a master
    if (req.user.accountType !== 'master') {
        return next();
    }
    
    User.getApprovedUsers(db, false, (err, users) => {
        if (err) {
            return next();
        }
        
        res.locals.totalUnapprovedUsers = users.length;
        return next();
    });
});

// load other routes
router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/logout', require('./logout'));
router.use('/approve_accounts', require('./approve_accounts'));
router.use('/upload_transactions', require('./upload_transactions'));
router.use('/upload_history', require('./upload_history'));
router.use('/change_password', require('./change_password'));
router.use('/calendar', require('./calendar'));
router.use('/insights', require('./insights'));
router.use('/day_view', require('./day_view'));
router.use('/filter', require('./filter'));
router.use('/filter_graph', require('./filter_graph'));
router.use('/manage_accounts', require('./manage_accounts'));

// serve index page
router.get('/', authenticate, (req, res) => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    res.redirect(`/calendar/${year}/${month}`);
    /*res.render('index', {
        title: 'Index'
    });*/
});

// serve 404 when nothing can be found
router.get((req, res, next) => {
    res.status(404).render('404', {
        title: '404: Page Not Found',
        url: req.url
    });
});

// serve 5xx on error
router.get((error, req, res, next) => {
    res.status(500).render('5xx', {
        title: '500: Internal Server Error',
        error: error
    });
});


module.exports = router;
