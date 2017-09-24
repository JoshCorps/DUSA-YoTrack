class Outlet {
    
    constructor() {
        this.outletRef = undefined;
        this.outletName = undefined;
        this.latitude = undefined;
        this.longitude = undefined;
    }
    
    static getNames(db, callback)
    {
        // $nin tells mongo to ignore fields matching data in the array given
        db.transactions.distinct('outletName', {'outletName' : {$nin : ["", null]}}, (err, outletNames) => 
        {
            if(err) return;
            callback(null, outletNames);
        });
    }
    
    static getRefs(db, callback)
    {
        db.transactions.distinct('outletRef', {'outletRef' : {$nin : ["", null]}}, (err, outletRefs) => 
        {
            if(err) return;
            callback(null, outletRefs);
        });
    }
    
    static getOutlet(db, name, callback)
    {
        db.outlets.findOne({"name": name}, function(err, doc) {
            if (!err){
                callback(null, doc);
            }
            else {
                callback(err, null);
            }
    });
    }
    
    
}

module.exports = Outlet;