class Upload {
    
    constructor() {
        this.time = undefined;
        this.transactions = undefined;
    }
    
    static create(db, upload, callback) {
        let up;
        if (upload instanceof Upload) {
            up = upload;
        }
        else {
            up = new Upload(upload);
        }
        db.transactions.insert(up, callback());
    }
}

module.exports = Upload;