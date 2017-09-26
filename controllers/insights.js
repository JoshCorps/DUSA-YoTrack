'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Insight = require('../models/insight');

router.get('/:startYear?/:startMonth?/:startDay?/:endYear?/:endMonth?/:endDay?', authenticate, (req, res, next) => {
    req.flash();
    
    var startYear = req.params.startYear;
    var startMonth = req.params.startMonth;
    var startDay = req.params.startDay;
    var endYear = req.params.endYear;
    var endMonth = req.params.endMonth;
    var endDay = req.params.endDay;
    
    var startDate = startDay + "-" + startMonth + "-" + startYear;
    var endDate = endDay + "-" + endMonth + "-" + endYear;
    
    if (startYear && startMonth && startDay && endYear && endMonth && endDay) {
        Insight.refine(db, new Date(startYear, startMonth, startDay), new Date(endYear, endMonth, endDay), (err, data) => {
            //console.log(JSON.stringify(data, null, 2));
            res.render('insights', { insight: data, startDate: startDate, endDate: endDate });
        });
    } else {
        return res.render('insights', { insight: null });
    }
});

router.post('/', authenticate, (request, response, next) => {
    var start = request.body.startDate;
    var end = request.body.endDate;
    
    var startDate = start.split("-");
    var endDate = end.split("-");
    
    //console.log(request.body);
    
    response.redirect(`/insights/${startDate[2]}/${startDate[1]}/${startDate[0]}/${endDate[2]}/${endDate[1]}/${endDate[0]}`);
});

module.exports = router;