class Outlet {
    
    constructor() {
        this.outletRef = undefined;
        this.outletName = undefined;
    }
    
    static create(db, outlet, callback)
    {
        let out;
        if(outlet instanceof Outlet)
        {
            out = outlet;
        } else {
            out = new Outlet(outlet);
        }
        db.outlets.insert(out,callback());
    }
    
    static getOutletNames()
    {
        
    }
    
}