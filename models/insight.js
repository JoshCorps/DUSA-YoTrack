let Transaction = require('./transaction');
let async = require('async');

class Insight {
    constructor(data) {
        //this.description = data.description;
        //this.userIDs = [];
    }

    static unique(a) {
        return a.sort().filter((item, pos, ary) => {
            return !pos || item != ary[pos - 1];
        })
    }

    static unique_fast(a) {
        var seen = {};
        var out = [];
        var len = a.length;
        var j = 0;
        for (var i = 0; i < len; i++) {
            var item = a[i];
            if (seen[item] !== 1) {
                seen[item] = 1;
                out[j++] = item;
            }
        }
        return out;
    }

    static analyse(db, startDate, endDate, callback) {
        // step-by-step
        // 1) get transactions that take place between a certain range
        // 2) sort each transaction into a set of constraints by users (based on time, day and location)
        // 3) do comparisons between each permutation of time/location, time/day and day/location; find union of users
        // 4?) score users based on occurences between them 

        // first, get a set of transactions that take place between a certain date range
        Transaction.getTransactionsByDateRange(db, startDate, endDate, (err, results) => {
            if (err) {
                return callback(err);
            }

            console.log('trace ', 1);

            let data = [];
            let resultKeys = Object.keys(results);

            for (let i = 0; i < resultKeys.length; i++) {
                for (let e = 0; e < results[resultKeys[i]].length; e++) {
                    data.push(results[resultKeys[i]][e]);
                }
            }
            console.log('trace ', 2);

            // now, sort each transaction into a set of constraints by users.
            let hourConstraints = {};
            let timeConstraints = {};
            let dateConstraints = {};
            let shopConstraints = {};

            let push = (arr, index, user) => {
                if (!arr[index]) {
                    arr[index] = [];
                }

                arr[index].push(user);
                return arr;
            }

            let dateNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            for (var i = 0; i < data.length; i++) {
                let transaction = data[i];
                let time = transaction.dateTime.getHours();
                let date = dateNames[transaction.dateTime.getDay()];
                let shop = transaction.outletName;
                let user = transaction.newUserID;

                hourConstraints = push(hourConstraints, time, user);
                dateConstraints = push(dateConstraints, date, user);
                shopConstraints = push(shopConstraints, shop, user);
            }
            console.log('trace ', 3);

            // before continuing, merge hours into groups of 3 hours
            timeConstraints['Between 12am to 3am'] = [].concat(hourConstraints[0] || []).concat(hourConstraints[1] || []).concat(hourConstraints[2] || []);
            timeConstraints['Between 3am to 6am'] = [].concat(hourConstraints[3] || []).concat(hourConstraints[4] || []).concat(hourConstraints[5] || []);
            timeConstraints['Between 6am to 9am'] = [].concat(hourConstraints[6] || []).concat(hourConstraints[7] || []).concat(hourConstraints[8] || []);
            timeConstraints['Between 9am to 12pm'] = [].concat(hourConstraints[9] || []).concat(hourConstraints[10] || []).concat(hourConstraints[11] || []);
            timeConstraints['Between 12pm to 3pm'] = [].concat(hourConstraints[12] || []).concat(hourConstraints[13] || []).concat(hourConstraints[14] || []);
            timeConstraints['Between 3pm to 6pm'] = [].concat(hourConstraints[15] || []).concat(hourConstraints[16] || []).concat(hourConstraints[17] || []);
            timeConstraints['Between 6pm to 9pm'] = [].concat(hourConstraints[18] || []).concat(hourConstraints[19] || []).concat(hourConstraints[20] || []);
            timeConstraints['Between 9pm to 12am'] = [].concat(hourConstraints[21] || []).concat(hourConstraints[22] || []).concat(hourConstraints[23] || []);

            // now do an intersection of every permutation
            let intersectionTimeShop = {};
            let intersectionTimeDay = {};
            let intersectionDayShop = {};

            let timeKeys = Object.keys(timeConstraints);
            let dateKeys = Object.keys(dateConstraints);
            let shopKeys = Object.keys(shopConstraints);
            console.log('trace ', 4);

            // remove duplicate users
            for (let a = 0; a < timeKeys.length; a++) {
                timeConstraints[timeKeys[a]] = Insight.unique_fast(timeConstraints[timeKeys[a]]);
            }
            for (let a = 0; a < dateKeys.length; a++) {
                dateConstraints[dateKeys[a]] = Insight.unique_fast(dateConstraints[dateKeys[a]]);
            }
            for (let a = 0; a < shopKeys.length; a++) {
                shopConstraints[shopKeys[a]] = Insight.unique_fast(shopConstraints[shopKeys[a]]);
            }
            console.log('trace ', 4, 'a');

            async.parallel([
                (cb) => {
                    // check between times and shops
                    let arr = [];
                    for (let x = 0; x < timeKeys.length; x++) {
                        let a = timeKeys[x];
                        for (let y = 0; y < shopKeys.length; y++) {
                            let b = shopKeys[y];
                            arr = timeConstraints[a].filter((n) => shopConstraints[b].includes(n));
                            if (arr.length > 1) {
                                intersectionTimeShop[b + ' ' + a] = arr
                            }
                        }
                    }

                    console.log('trace ', 5);
                    cb();
                },
                /*
                                (cb) => {
                                    // check between times and day
                                    let arr = [];
                                    for (let x = 0; x < timeKeys.length; x++) {
                                        let a = timeKeys[x];
                                        for (let y = 0; y < dateKeys.length; y++) {
                                            let b = dateKeys[y];
                                            arr = timeConstraints[a].filter((n) => dateConstraints[b].includes(n));
                                            if (arr.length > 0) {
                                                intersectionTimeDay[b + ' ' + a] = arr
                                            }
                                        }
                                    }

                                    console.log('trace ', 6);
                                    cb();
                                },*/
                (cb) => {
                    // check between day and shops
                    let arr = [];
                    for (let x = 0; x < dateKeys.length; x++) {
                        let a = dateKeys[x];
                        for (let y = 0; y < shopKeys.length; y++) {
                            let b = shopKeys[y];
                            arr = dateConstraints[a].filter((n) => shopConstraints[b].includes(n));
                            if (arr.length > 1) {
                                intersectionDayShop[b + ' ' + a] = arr
                            }
                        }
                    }
                    console.log('trace ', 7);
                    cb();
                }
            ], (err, results) => {

                let intersections = {};
                let timeShopKeys = Object.keys(intersectionTimeShop);
                let dayShopKeys = Object.keys(intersectionDayShop);

                let arr = [];
                for (let x = 0; x < timeShopKeys.length; x++) {
                    let a = timeShopKeys[x];
                    for (let y = 0; y < dayShopKeys.length; y++) {
                        let b = dayShopKeys[y];
                        arr = intersectionTimeShop[a].filter((n) => intersectionDayShop[b].includes(n));
                        if (arr.length > 1) {
                            intersections[b + ' ' + a] = arr
                        }
                    }
                }
                let insights = intersections;
                /*{
                    "time-shop": intersectionTimeShop,
                    //"time-day": intersectionTimeDay,
                    "day-shop": intersectionDayShop
                };*/

                callback(null, insights);
            });
        });
    }

    /*update(db, callback) {
        db.tribes.update({ description: this.description }, {
                $addToSet: {
                    userIDs: {
                        $each: this.userIDs
                    }
                },                
                $set: {
                    description: this.description
                }
            }, { upsert: true }, (err) => {
            if (err) {
                // do something
            }
            callback(err);
        });
    }
    
    static create(db, data, callback) {
        let description = data.description;
        
        let tribe;
        if (data instanceof Tribe) {
            tribe = data;
        } else {
            tribe = new Tribe({
                'description': description,
            });
        }
        
        if (data.userIDs.length === 0) {
            return callback('No users');
        }
        
        // for the purposes of deduplication, create in database and pass to update.
        tribe.update(db, (err) => {
            callback(err);
        });
    }
    
    static analyse(db, locationDesc, locationData, timeDesc, timeData) {
        let tribe = new Tribe({
            description: locationDesc + " " + timeDesc
        });
        
        tribe.userIDs = locationData.filter((n) => timeData.includes(n))
        
        Tribe.create(db, tribe, () => {
            console.log('Generated a tribe: ' + tribe.description);
        });
    }*/
};

module.exports = Insight;
