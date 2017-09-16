let ObjectID = require('mongojs').ObjectID;

class Upload {
    
    constructor() {
        this.date = undefined; //this is the upload date
        this.transactionIDs = undefined;
        this.startDate = undefined; //datetime of the first transaction within the batch covered by the upload
        this.endDate = undefined //datetime of the last transaction within the batch covered by the upload
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
        db.uploads.remove({'_id': {$in: upload_ids.map((upload) => {return new ObjectID(upload);})}}, (err) => {
           if (err) {
               callback(err);
           } 
        });
    }
};

module.exports = Upload;