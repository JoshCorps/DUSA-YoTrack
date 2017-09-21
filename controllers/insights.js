'use strict';

let express = require('express');
let router = express.Router();
let authenticate = require('./index').authenticate;

// models
let db = require('../models/db.js')();
let Insight = require('../models/insight');

router.get('/:startYear/:startMonth/:startDay/:endYear/:endMonth/:endDay', authenticate, (req, res, next) => {
    var startYear = req.params.startYear;
    var startMonth = req.params.startMonth;
    var startDay = req.params.startDay;
    var endYear = req.params.endYear;
    var endMonth = req.params.endMonth;
    var endDay = req.params.endDay;
    
    if (startYear && startMonth && startDay && endYear && endMonth && endDay) {
        Insight.analyse(db, new Date(startYear, startMonth, startDay), new Date(endYear, endMonth, endDay), (err, data) => {
            //console.log(JSON.stringify(data, null, 2));
            res.render('insights', { insight: data });
        });
    } else {
        return res.render('insights', { insight: null });
    }
});

router.post('/', authenticate, (request, response, next) => {
    var start = request.body.start;
    var end = request.body.end;
    
    console.log(request.body);
    
    response.redirect(`/insights/${start}/${end}`);
});

module.exports = router;