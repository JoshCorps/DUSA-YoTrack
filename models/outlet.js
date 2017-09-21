class Outlet {
    
    constructor() {
        this.outletRef = undefined;
        this.outletName = undefined;
    }
    
    static getNames(db, callback)
    {
        db.transactions.distinct('outletName', {}, (err, outletNames) => 
        {
            if(err) return;
            callback(null, outletNames);
        });
    }
    
    static getRefs(db, callback)
    {
        db.transactions.distinct('outletRef', {}, (err, outletRefs) => 
        {
            if(err) return;
            callback(null, outletRefs);
        });
    }
}

module.exports = Outlet;