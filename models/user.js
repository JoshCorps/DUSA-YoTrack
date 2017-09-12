module.exports = User;

//let db = require('./models/db.js')();

class User {
  constructor(user) {
      this.firstName = user.firstName || undefined;
      this.lastName = user.lastName || undefined;
      this.email = user.email || undefined;
      this.password = user.password || undefined; 
      this.salt = user.salt || undefined;
      this.accountType = user.accountType || undefined;
      this.isApproved = user.isApproved || false;
  }
  
  setPassword(password) {
    
  }
  
  checkPassword(inputPassword) {
    
  }
  
  static create(db, callback) {
    
  }
  
  static getUser(db, callback) {
      
  }
 
  static getUnapproved(db, callback) {
    //get list of unapproved users from db
    db.users.find({isApproved: false}, (err, userData) => {
      if (err) {
        callback(err);
        return;
      }
      var users;
      // loop through array and return user array
      for (let i=0; i<userData.length; i++) {
        var user = new User(userData[i]);
        users.push(user);
      }
      callback(null, users);
    });
  }
  
  static deleteUsers(emails) {
    for (let i = 0; i < emails.length; i++) {
      //db.users.remove();
    }
  }
  
};
