let async = require('async');
let Tribe = require('./tribe');

class TribeAnalysis {
    constructor(data) {
        this.description = data.description;
        this.type = data.type;
        this.userIDs = [];
        this.transactionIDs = [];
    }

    update(db, callback) {
        db.tribe_analyses.update({ description: this.description }, {
            $addToSet: {
                userIDs: {
                    $each: this.userIDs
                },
                transactionIDs: {
                    $each: this.transactionIDs
                }
            },
            $set: {
                description: this.description,
                type: this.type,
            }
        }, { upsert: true }, (err) => {
            if (err) {
                // do something
            }
            callback(err);
        });
    }

    static analyse(db, transactions) {
        // I'll rewrite this in a way to be less...stupid later.

        let between9amAnd12pm = new TribeAnalysis({
            'type': 'time',
            'description': 'Between 9AM and 12PM'
        });
        let between12pmAnd3pm = new TribeAnalysis({
            'type': 'time',
            'description': 'Between 12PM and 3PM'
        });
        let between3pmAnd6pm = new TribeAnalysis({
            'type': 'time',
            'description': 'Between 3PM and 6PM'
        });
        let between6pmAnd9pm = new TribeAnalysis({
            'type': 'time',
            'description': 'Between 6PM and 9PM'
        });
        let between9pmAnd12am = new TribeAnalysis({
            'type': 'time',
            'description': 'Between 9PM and 12AM'
        });
        let between12amAnd3am = new TribeAnalysis({
            'type': 'time',
            'description': 'Between 12AM and 3AM'
        });
        let between3amAnd6am = new TribeAnalysis({
            'type': 'time',
            'description': 'Between 3AM and 6AM'
        });
        let between6amAnd9am = new TribeAnalysis({
            'type': 'time',
            'description': 'Between 6AM and 9AM'
        });
        
        let sunday = new TribeAnalysis({
            'type': 'day',
            'description': 'Sunday'
        });
        let monday = new TribeAnalysis({
            'type': 'day',
            'description': 'Monday'
        });
        let tuesday = new TribeAnalysis({
            'type': 'day',
            'description': 'Tuesday'
        });
        let wednesday = new TribeAnalysis({
            'type': 'day',
            'description': 'Wednesday'
        });
        let thursday = new TribeAnalysis({
            'type': 'day',
            'description': 'Thursday'
        });
        let friday = new TribeAnalysis({
            'type': 'day',
            'description': 'Friday'
        });
        let saturday = new TribeAnalysis({
            'type': 'day',
            'description': 'Saturday'
        });

        let shops = [];

        let pushItem = (obj, userID, transactionID) => {
            obj.userIDs.push(userID);
            obj.transactionIDs.push(transactionID);
            return obj;
        }
        
            let _12am = new Date(0, 0, 0, 0).getHours();
            let _3am = new Date(0, 0, 0, 3).getHours();
            let _6am = new Date(0, 0, 0, 6).getHours();
            let _9am = new Date(0, 0, 0, 9).getHours();
            let _12pm = new Date(0, 0, 0, 12).getHours();
            let _3pm = new Date(0, 0, 0, 15).getHours();
            let _6pm = new Date(0, 0, 0, 18).getHours();
            let _9pm = new Date(0, 0, 0, 21).getHours();

        for (var i = 0; i < transactions.length; i++) {
            // analyse by time
            let transactionTime = transactions[i].dateTime.getHours();
            let transactionDate = transactions[i].dateTime.getDay();

            if (transactionTime >= _12am && transactionTime < _3am) {
                between12amAnd3am = pushItem(between12amAnd3am, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionTime >= _3am && transactionTime < _6am) {
                between3amAnd6am = pushItem(between3amAnd6am, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionTime >= _6am && transactionTime < _9am) {
                between6amAnd9am = pushItem(between6amAnd9am, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionTime >= _9am && transactionTime < _12pm) {
                between9amAnd12pm = pushItem(between9amAnd12pm, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionTime >= _12pm && transactionTime < _3pm) {
                between12pmAnd3pm = pushItem(between12pmAnd3pm, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionTime >= _3pm && transactionTime < _6pm) {
                between3pmAnd6pm = pushItem(between3pmAnd6pm, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionTime >= _6pm && transactionTime < _9pm) {
                between6pmAnd9pm = pushItem(between6pmAnd9pm, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionTime >= _9pm && transactionTime < _12am) {
                between9pmAnd12am = pushItem(between9pmAnd12am, transactions[i].newUserID, transactions[i]._id);
            }
            
            if (transactionDate === 0) {
                sunday = pushItem(sunday, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionDate === 1) {
                monday = pushItem(monday, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionDate === 2) {
                tuesday = pushItem(tuesday, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionDate === 3) {
                wednesday = pushItem(wednesday, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionDate === 4) {
                thursday = pushItem(thursday, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionDate === 5) {
                friday = pushItem(friday, transactions[i].newUserID, transactions[i]._id);
            } else if (transactionDate === 6) {
                saturday = pushItem(saturday, transactions[i].newUserID, transactions[i]._id);
            } 

            if (!shops[transactions[i].outletName]) {
                shops[transactions[i].outletName] = new TribeAnalysis({
                    'type': 'location',
                    'description': transactions[i].outletName
                });
            }
            shops[transactions[i].outletName] = pushItem(shops[transactions[i].outletName], transactions[i].newUserID, transactions[i]._id);
        }

        // todo: rewrite in a less stupid way
        async.parallel([
            (cb) => { TribeAnalysis.create(db, between9amAnd12pm, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, between12pmAnd3pm, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, between3pmAnd6pm, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, between6pmAnd9pm, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, between9pmAnd12am, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, between12amAnd3am, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, between3amAnd6am, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, between6amAnd9am, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, sunday, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, monday, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, tuesday, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, wednesday, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, thursday, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, friday, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, saturday, () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, shops['DUSA The Union - Marketplace'], () => { cb(); }); },
            //(cb) => { TribeAnalysis.create(db, shops['College Shop'], () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, shops['Ninewells Shop'], () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, shops['Library'], () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, shops['Liar Bar'], () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, shops['Level 2, Reception'], () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, shops['Mono'], () => { cb(); }); },
            (cb) => { TribeAnalysis.create(db, shops['Premier Shop'], () => { cb(); }); }
        ], (err, results) => {
            if (err) {
                console.log('Error: ', err);
            }
            if (results) {
                
            }
            console.log('Completed all analyses');
            db.tribe_analyses.find({ type: 'time' }, (err, timeResults) => {
                if (err) {
                    // do something
                }
                db.tribe_analyses.find({ type: 'location' }, (err, locResults) => {
                    if (err) {
                        // do something still
                    }
                    
                    let time = Object.keys(timeResults);
                    let loc = Object.keys(locResults);
                    
                    for (let a = 0; a < time.length; a++) {
                        for (let b = 0; b < loc.length; b++) {
                            Tribe.analyse(db, locResults[loc[b]].description, locResults[loc[b]].userIDs, timeResults[time[a]].description, timeResults[time[a]].userIDs);
                        }
                    }
                });
            })
        });
    }

    static create(db, data, callback) {
        if (!data) {
            console.log(data);
            return callback('Data is null');
        }
        
        let description = data.description;
        let type = data.type;

        let tribeAnalysis;
        if (data instanceof TribeAnalysis) {
            tribeAnalysis = data;
        }
        else {
            tribeAnalysis = new TribeAnalysis({
                'description': description,
                'type': type
            });
        }

        // for the purposes of deduplication, create in database and pass to update.
        tribeAnalysis.update(db, (err) => {
            callback(err);
        });
    }
}

module.exports = TribeAnalysis;
