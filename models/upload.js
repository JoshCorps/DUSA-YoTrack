let ObjectID = require('mongojs').ObjectID;

class Upload {
    
    constructor() {
        this.date = undefined;
        this.transactionIDs = undefined;
        this.startDate = undefined;
        this.endDate = undefined;
    }
    
    static create(db, upload, callback) {
        let up;
        if (upload instanceof Upload) {
            up = upload;
            console.log("Upload is valid.");
        }
        else {
            up = new Upload(upload);
            console.log("Upload invalid, replacing with default values.");
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