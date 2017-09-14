class Upload {
    
    constructor() {
        this.date = undefined;
        this.transactionIDs = undefined;
    }
    
    static create(db, upload, callback) {
        let up;
        if (upload instanceof Upload) {
            up = upload;
        }
        else {
            up = new Upload(upload);
        }
        db.uploads.insert(up, callback());
    }
    
    static getAllUploads(db, callback) {
        db.uploads.find((err, data) => {
           if (err) {
               callback(err, null);
               return;
           }
           callback(null, data);
        });
    }
    
    static deleteUploads(db, upload_ids, callback) {
        db.uploads.remove({'_id': {$in: upload_ids}}, (err) => {
           if (err) {
               callback(err);
           } 
        });
    }
};

module.exports = Upload;