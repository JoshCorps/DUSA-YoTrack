class Tribe {
    constructor(data) {
        this.description = data.description;
        this.userIDs = [];
    }
    
    update(db, callback) {
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
    }
};

module.exports = Tribe;