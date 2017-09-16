'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

router.get('/', authenticate, (req, res) => {
    // horribly hacky way to make flash message appear after password change, soz
    if (req.session.change_pass)
    {
        delete req.session['passport'];
        delete req.session['change_pass'];
        req.flash('success', "Your password has been changed please login again");
        res.redirect('/login');
    } else {
        req.logout();
        req.session.destroy();
        res.redirect('/');
    }
});

router.post('/', authenticate, (req,res) => {
    
});

module.exports = router;